import fs from 'node:fs';
import path from 'node:path';
import type { ProjectInfo } from '../types/audit.js';

interface ScanStats {
  totalFiles: number;
  totalLinesOfCode: number;
  filePaths: string[];
}

export class HeuristicDetector {
  private targetDir: string;

  constructor(targetDir: string) {
    this.targetDir = path.resolve(targetDir);
  }

  public detect(): { projectInfo: ProjectInfo; sourceFiles: string[] } {
    if (!fs.existsSync(this.targetDir)) {
      throw new Error(`Thư mục không tồn tại: ${this.targetDir}`);
    }

    const stats = this.scanDirectory(this.targetDir);
    const packageJsonPath = path.join(this.targetDir, 'package.json');
    let framework = 'Tự do / Static Web';
    let packageManager = 'npm';
    let devCommand: string | undefined = undefined;
    let detectedPort = 3000;
    let projectName = path.basename(this.targetDir);
    let entrypoint: string | undefined = undefined;

    // 1. Kiểm tra package.json nếu là dự án Node/JS/TS
    if (fs.existsSync(packageJsonPath)) {
      try {
        const rawContent = fs.readFileSync(packageJsonPath, 'utf8').replace(/^\uFEFF/, '');
        const pkg = JSON.parse(rawContent);
        if (pkg.name) projectName = pkg.name;

        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) {
          framework = 'Next.js (React)';
          detectedPort = 3000;
        } else if (deps['vite']) {
          framework = 'Vite (Modern Frontend)';
          detectedPort = 5173;
        } else if (deps['react-scripts']) {
          framework = 'Create React App';
          detectedPort = 3000;
        } else if (deps['nuxt']) {
          framework = 'Nuxt.js (Vue)';
          detectedPort = 3000;
        } else if (deps['vue']) {
          framework = 'Vue.js';
          detectedPort = 8080;
        } else if (deps['@nestjs/core']) {
          framework = 'NestJS Backend';
          detectedPort = 3000;
        } else if (deps['express']) {
          framework = 'Express.js API';
          detectedPort = 3000;
        } else if (deps['fastify']) {
          framework = 'Fastify API';
          detectedPort = 3000;
        }

        // Kiểm tra scripts
        if (pkg.scripts) {
          if (pkg.scripts['dev']) devCommand = 'run dev';
          else if (pkg.scripts['start']) devCommand = 'start';
          else if (pkg.scripts['serve']) devCommand = 'run serve';
        }

        if (pkg.main) entrypoint = pkg.main;
      } catch (err) {
        // bỏ qua lỗi parse json
      }
    }

    // 2. Kiểm tra Python nếu có requirements.txt
    const reqPath = path.join(this.targetDir, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      const reqContent = fs.readFileSync(reqPath, 'utf8').replace(/^\uFEFF/, '').toLowerCase();
      packageManager = 'pip / poetry';
      if (reqContent.includes('fastapi')) {
        framework = 'FastAPI (Python)';
        detectedPort = 8000;
        devCommand = 'uvicorn main:app --reload';
      } else if (reqContent.includes('flask')) {
        framework = 'Flask (Python)';
        detectedPort = 5000;
        devCommand = 'flask run';
      } else if (reqContent.includes('django')) {
        framework = 'Django (Python)';
        detectedPort = 8000;
        devCommand = 'python manage.py runserver';
      }
    }

    // 3. Nhận diện Package Manager
    if (fs.existsSync(path.join(this.targetDir, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (fs.existsSync(path.join(this.targetDir, 'yarn.lock'))) {
      packageManager = 'yarn';
    } else if (fs.existsSync(path.join(this.targetDir, 'bun.lockb'))) {
      packageManager = 'bun';
    }

    if (devCommand && !devCommand.startsWith('python') && !devCommand.startsWith('uvicorn')) {
      devCommand = `${packageManager} ${devCommand}`;
    }

    const projectInfo: ProjectInfo = {
      name: projectName,
      path: this.targetDir,
      framework,
      packageManager,
      entrypoint,
      devCommand,
      detectedPort,
      totalFiles: stats.totalFiles,
      totalLinesOfCode: stats.totalLinesOfCode,
    };

    return { projectInfo, sourceFiles: stats.filePaths };
  }

  private scanDirectory(dir: string, currentStats: ScanStats = { totalFiles: 0, totalLinesOfCode: 0, filePaths: [] }): ScanStats {
    const ignoredDirs = new Set([
      'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.turbo',
      'coverage', 'vendor', '__pycache__', '.venv', 'env', 'samples', 'fixtures', '__mocks__'
    ]);

    const ignoredExts = new Set([
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2',
      '.ttf', '.eot', '.mp4', '.webm', '.mp3', '.pdf', '.zip', '.tar', '.gz'
    ]);

    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return currentStats;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name) && !entry.name.startsWith('.')) {
          this.scanDirectory(fullPath, currentStats);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!ignoredExts.has(ext)) {
          currentStats.totalFiles += 1;
          currentStats.filePaths.push(fullPath);
          try {
            const content = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '');
            const lines = content.split('\n').length;
            currentStats.totalLinesOfCode += lines;
          } catch {
            // bỏ qua file nhị phân
          }
        }
      }
    }

    return currentStats;
  }
}
