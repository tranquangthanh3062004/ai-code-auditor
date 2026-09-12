import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import multer from 'multer';
import { auditProject } from '../src/index.js';
import type { AuditReport } from '../src/types/audit.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Bounded in-memory TTL/LRU cache for generated reports
interface CachedReport {
  report: AuditReport;
  html?: string;
  createdAt: number;
}
const MAX_CACHE_SIZE = 50;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const reportCache = new Map<string, CachedReport>();

function setCachedReport(id: string, data: { report: AuditReport; html?: string }): void {
  // Evict oldest if exceeding size
  if (reportCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = reportCache.keys().next().value;
    if (oldestKey) reportCache.delete(oldestKey);
  }
  reportCache.set(id, { ...data, createdAt: Date.now() });
}

function getCachedReport(id: string): { report: AuditReport; html?: string } | null {
  const item = reportCache.get(id);
  if (!item) return null;
  if (Date.now() - item.createdAt > CACHE_TTL_MS) {
    reportCache.delete(id);
    return null;
  }
  return { report: item.report, html: item.html };
}

// Configure multer for uploaded files
const upload = multer({
  dest: path.join(os.tmpdir(), 'codetrust-uploads'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
});

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.2.0',
    service: 'CodeTrust AI Auditor Engine',
    timestamp: new Date().toISOString(),
  });
});

// 2. Audit by local directory path
app.post('/api/audit/path', async (req, res) => {
  try {
    const { targetPath } = req.body;
    if (!targetPath || typeof targetPath !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid targetPath' });
    }

    const resolved = path.resolve(targetPath);
    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: `Directory not found: ${resolved}` });
    }

    const { report, htmlContent } = await auditProject(resolved, { generateHtml: true });
    setCachedReport(report.meta.auditId, { report, html: htmlContent });

    return res.json({
      success: true,
      report,
      htmlContent,
    });
  } catch (error: any) {
    console.error('Audit by path failed:', error);
    return res.status(500).json({ error: error.message || 'Audit process failed' });
  }
});

// 3. Audit sample project for interactive demo
app.post('/api/audit/sample', async (req, res) => {
  try {
    const { sampleName } = req.body; // 'vulnerable' | 'secure' | 'xss'
    let target = 'sample-vulnerable';
    if (sampleName === 'secure' || sampleName === 'sample-secure') target = 'sample-secure';
    if (sampleName === 'xss' || sampleName === 'sample-xss') target = 'sample-xss';

    const projectRoot = path.resolve(process.cwd());
    const samplePath = path.join(projectRoot, 'samples', target);

    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: `Sample directory not found at: ${samplePath}` });
    }

    const { report, htmlContent } = await auditProject(samplePath, { generateHtml: true });
    setCachedReport(report.meta.auditId, { report, html: htmlContent });

    return res.json({
      success: true,
      sample: target,
      report,
      htmlContent,
    });
  } catch (error: any) {
    console.error('Audit sample failed:', error);
    return res.status(500).json({ error: error.message || 'Audit sample failed' });
  }
});

export function isSafeRelativePath(userPath: string): boolean {
  if (!userPath || typeof userPath !== 'string') return false;
  if (userPath.includes('\0')) return false;
  if (path.isAbsolute(userPath) || /^[a-zA-Z]:/.test(userPath)) return false;
  const normalized = path.normalize(userPath);
  if (
    normalized === '..' ||
    normalized.startsWith('..' + path.sep) ||
    normalized.startsWith('../') ||
    normalized.startsWith('..\\')
  ) {
    return false;
  }
  return true;
}

// 4. Audit uploaded folder/files with Path Traversal Protection
app.post('/api/audit/files', async (req, res) => {
  try {
    const { projectName, files } = req.body; // files: Array<{ path: string, content: string }>

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Create temporary workspace directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codetrust-workspace-'));
    const resolvedTempDir = path.resolve(tempDir);
    
    try {
      for (const file of files) {
        if (!file.path || typeof file.path !== 'string') {
          return res.status(400).json({ error: 'Invalid file path format' });
        }

        if (!isSafeRelativePath(file.path)) {
          return res.status(400).json({ error: `Security violation: Path traversal detected in "${file.path}"` });
        }

        const fullPath = path.resolve(resolvedTempDir, path.normalize(file.path));
        // Ensure resolved destination is strictly inside tempDir
        if (!fullPath.startsWith(resolvedTempDir + path.sep) && fullPath !== resolvedTempDir) {
          return res.status(400).json({ error: `Security violation: Path traversal out of workspace in "${file.path}"` });
        }

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, file.content || '', 'utf8');
      }

      const { report, htmlContent } = await auditProject(tempDir, { generateHtml: true });
      if (projectName) {
        report.meta.projectName = projectName;
        report.projectInfo.name = projectName;
      }

      setCachedReport(report.meta.auditId, { report, html: htmlContent });

      return res.json({
        success: true,
        report,
        htmlContent,
      });
    } finally {
      // Clean up temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    }
  } catch (error: any) {
    console.error('Audit files failed:', error);
    return res.status(500).json({ error: error.message || 'Audit files failed' });
  }
});

// 5. Retrieve cached report
app.get('/api/reports/:id', (req, res) => {
  const cached = getCachedReport(req.params.id);
  if (!cached) {
    return res.status(404).json({ error: 'Report not found or expired' });
  }
  return res.json(cached);
});

// 6. Skill Store APIs
app.get('/api/skills', async (req, res) => {
  try {
    const { defaultSkillRegistry } = await import('../src/skills/index.js');
    const category = req.query.category as any;
    const enabledOnly = req.query.enabledOnly === 'true';

    const skills = defaultSkillRegistry.listSkills({ category, enabledOnly });
    return res.json({
      success: true,
      total: skills.length,
      skills: skills.map(s => ({
        ...s,
        enabled: defaultSkillRegistry.isSkillEnabled(s.id),
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch skills' });
  }
});

app.get('/api/skills/:id', async (req, res) => {
  try {
    const { defaultSkillRegistry } = await import('../src/skills/index.js');
    const skill = defaultSkillRegistry.getSkill(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: `Không tìm thấy Skill: ${req.params.id}` });
    }
    const state = defaultSkillRegistry.getSkillState(req.params.id);
    const executionOrder = defaultSkillRegistry.resolveDependencies(req.params.id);
    return res.json({
      success: true,
      skill,
      state,
      executionOrder,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to get skill details' });
  }
});

app.post('/api/skills/:id/toggle', async (req, res) => {
  try {
    const { defaultSkillRegistry } = await import('../src/skills/index.js');
    const { id } = req.params;
    const { entitlement } = req.body || {};

    const skill = defaultSkillRegistry.getSkill(id);
    if (!skill) {
      return res.status(404).json({ error: `Không tìm thấy Skill: ${id}` });
    }

    const isEnabled = defaultSkillRegistry.isSkillEnabled(id);

    if (isEnabled) {
      const result = defaultSkillRegistry.disableSkill(id);
      return res.json({
        success: result.success,
        enabled: defaultSkillRegistry.isSkillEnabled(id),
        reason: result.reason,
      });
    } else {
      // Default to enterprise entitlement for local trial if requested or if specified
      const ent = entitlement || {
        tenantId: 'local-user',
        plan: 'ENTERPRISE',
        licensedSkillIds: [id],
        tokenQuota: 1000000,
        tokensUsed: 0,
      };

      const result = defaultSkillRegistry.enableSkill(id, ent);
      return res.json({
        success: result.success,
        enabled: defaultSkillRegistry.isSkillEnabled(id),
        reason: result.reason,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to toggle skill' });
  }
});

// 6. Serve static Web UI
const webDir = path.resolve(process.cwd(), 'web');
if (fs.existsSync(webDir)) {
  app.use(express.static(webDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(webDir, 'index.html'));
    }
    next();
  });
}

const isDirectRun = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.ts') ||
   process.argv[1].endsWith('server/index.js') ||
   process.argv[1].endsWith('server\\index.ts') ||
   process.argv[1].endsWith('server\\index.js'))
);

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`       CODETRUST AI — WEB UI & AUDITOR API SERVER            `);
    console.log(`=============================================================`);
    console.log(`[✓] Web UI & API Server listening on: http://localhost:${PORT}`);
    console.log(`[✓] Endpoints:`);
    console.log(`    - POST http://localhost:${PORT}/api/audit/path`);
    console.log(`    - POST http://localhost:${PORT}/api/audit/sample`);
    console.log(`    - POST http://localhost:${PORT}/api/audit/files`);
    console.log(`    - GET  http://localhost:${PORT}/api/health\n`);
  });
}

export { app };
