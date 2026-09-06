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

// In-memory cache for generated reports
const reportCache = new Map<string, { report: AuditReport; html?: string }>();

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
    reportCache.set(report.meta.auditId, { report, html: htmlContent });

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
    reportCache.set(report.meta.auditId, { report, html: htmlContent });

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

// 4. Audit uploaded folder/files
app.post('/api/audit/files', async (req, res) => {
  try {
    const { projectName, files } = req.body; // files: Array<{ path: string, content: string }>

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Create temporary workspace directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codetrust-workspace-'));
    
    try {
      for (const file of files) {
        const fullPath = path.join(tempDir, file.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, file.content || '', 'utf8');
      }

      const { report, htmlContent } = await auditProject(tempDir, { generateHtml: true });
      if (projectName) {
        report.meta.projectName = projectName;
        report.projectInfo.name = projectName;
      }

      reportCache.set(report.meta.auditId, { report, html: htmlContent });

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
  const cached = reportCache.get(req.params.id);
  if (!cached) {
    return res.status(404).json({ error: 'Report not found or expired' });
  }
  return res.json(cached);
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

export { app };
