import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { HeuristicDetector } from '../src/engine/heuristic-detector.js';
import { DeterministicScanner } from '../src/engine/deterministic-rules.js';
import { ScorecardCalculator } from '../src/reporter/scorecard.js';
import { HtmlReportGenerator } from '../src/reporter/html-generator.js';
import { DeepSeekAuditor } from '../src/engine/deepseek-client.js';
import { auditProject } from '../src/index.js';

const ROOT = path.resolve('E:/project/ai-code-auditor');
const VULNERABLE_DIR = path.join(ROOT, 'samples/sample-vulnerable');
const SECURE_DIR = path.join(ROOT, 'samples/sample-secure');
const XSS_DIR = path.join(ROOT, 'samples/sample-xss');

test('1. HeuristicDetector should inspect Express framework and source files', () => {
  const detector = new HeuristicDetector(VULNERABLE_DIR);
  const { projectInfo, sourceFiles } = detector.detect();

  assert.equal(projectInfo.name, 'ai-vulnerable-ecommerce');
  assert.equal(projectInfo.framework, 'Express.js API');
  assert.equal(projectInfo.packageManager, 'npm');
  assert.equal(projectInfo.detectedPort, 3000);
  assert.ok(sourceFiles.length >= 2, 'Should find package.json and src/index.js');
});

test('2. DeterministicScanner should detect Critical API key leak and SQL Injection', () => {
  const detector = new HeuristicDetector(VULNERABLE_DIR);
  const { sourceFiles } = detector.detect();

  const scanner = new DeterministicScanner();
  const findings = scanner.scanFiles(VULNERABLE_DIR, sourceFiles);

  const keyFinding = findings.find(f => f.ruleId === 'SEC-001');
  const sqlFinding = findings.find(f => f.ruleId === 'SEC-006');

  assert.ok(keyFinding, 'Should detect SEC-001 API key leak');
  assert.equal(keyFinding.severity, 'CRITICAL');
  assert.ok(sqlFinding, 'Should detect SEC-006 SQL injection');
  assert.equal(sqlFinding.severity, 'HIGH');
});

test('3. DeterministicScanner should detect eval, innerHTML, localStorage token, and TLS disable in sample-xss', () => {
  const detector = new HeuristicDetector(XSS_DIR);
  const { sourceFiles } = detector.detect();

  const scanner = new DeterministicScanner();
  const findings = scanner.scanFiles(XSS_DIR, sourceFiles);

  const evalFinding = findings.find(f => f.ruleId === 'SEC-007');
  const xssFinding = findings.find(f => f.ruleId === 'SEC-008');
  const storageFinding = findings.find(f => f.ruleId === 'SEC-009');
  const tlsFinding = findings.find(f => f.ruleId === 'SEC-010');

  assert.ok(evalFinding, 'Should detect SEC-007 eval() execution');
  assert.equal(evalFinding?.severity, 'HIGH');

  assert.ok(xssFinding, 'Should detect SEC-008 innerHTML injection');
  assert.equal(xssFinding?.severity, 'HIGH');

  assert.ok(storageFinding, 'Should detect SEC-009 sensitive LocalStorage usage');
  assert.equal(storageFinding?.severity, 'MEDIUM');

  assert.ok(tlsFinding, 'Should detect SEC-010 TLS certificate rejection disabled');
  assert.equal(tlsFinding?.severity, 'HIGH');
});

test('4. DeterministicScanner should find ZERO vulnerabilities on secure sample', () => {
  const detector = new HeuristicDetector(SECURE_DIR);
  const { sourceFiles } = detector.detect();

  const scanner = new DeterministicScanner();
  const findings = scanner.scanFiles(SECURE_DIR, sourceFiles);

  assert.equal(findings.length, 0, 'Clean project should have 0 security findings');
});

test('5. ScorecardCalculator should appropriately penalize vulnerable project and reward clean project', () => {
  const calculator = new ScorecardCalculator();

  // Test with critical findings
  const badScores = calculator.calculate([
    {
      id: '1', ruleId: 'SEC-001', severity: 'CRITICAL', title: 'Key leak',
      file: 'index.js', plainExplanation: '', remediation: ''
    },
    {
      id: '2', ruleId: 'SEC-006', severity: 'HIGH', title: 'SQLi',
      file: 'index.js', plainExplanation: '', remediation: ''
    }
  ]);

  assert.ok(badScores.overall < 70, 'Vulnerable project overall score should be below 70');
  assert.ok(badScores.security <= 50, 'Security score should be <= 50');
  assert.ok(['C', 'F'].includes(badScores.grade), 'Grade should be C or F');

  // Test with zero findings
  const goodScores = calculator.calculate([]);
  assert.ok(goodScores.overall >= 90, 'Clean project overall score should be >= 90');
  assert.equal(goodScores.security, 100);
  assert.equal(goodScores.grade, 'A+');
});

test('6. ScorecardCalculator grade boundaries (A+, A, B, C, F)', () => {
  const calculator = new ScorecardCalculator();

  // 0 findings -> A+
  assert.equal(calculator.calculate([]).grade, 'A+');

  // 1 LOW -> A+ or A
  const lowScore = calculator.calculate([{
    id: '1', ruleId: 'SEC-999', severity: 'LOW', title: 'Info',
    file: 'app.js', plainExplanation: '', remediation: ''
  }]);
  assert.ok(['A+', 'A'].includes(lowScore.grade));

  // 1 HIGH -> B or C
  const highScore = calculator.calculate([{
    id: '1', ruleId: 'SEC-006', severity: 'HIGH', title: 'SQLi',
    file: 'app.js', plainExplanation: '', remediation: ''
  }]);
  assert.ok(['A', 'B', 'C'].includes(highScore.grade));

  // Multiple CRITICALs -> F
  const critScore = calculator.calculate([
    { id: '1', ruleId: 'SEC-001', severity: 'CRITICAL', title: 'Key 1', file: 'a.js', plainExplanation: '', remediation: '' },
    { id: '2', ruleId: 'SEC-002', severity: 'CRITICAL', title: 'Key 2', file: 'b.js', plainExplanation: '', remediation: '' },
    { id: '3', ruleId: 'SEC-003', severity: 'CRITICAL', title: 'Key 3', file: 'c.js', plainExplanation: '', remediation: '' },
  ]);
  assert.equal(critScore.grade, 'F');
  assert.equal(critScore.security, 0);
});

test('7. DeepSeekAuditor should gracefully fallback to heuristic analysis when key is missing or offline', async () => {
  const auditor = new DeepSeekAuditor('invalid-key-for-testing', 'https://127.0.0.1:9999');
  const projectInfo = {
    name: 'test-fallback-app',
    path: '/tmp/test',
    framework: 'Next.js App Router',
    packageManager: 'pnpm',
    totalFiles: 5,
    totalLinesOfCode: 250,
  };
  const findings = [];
  const sampleSnippets = [{ file: 'app/page.tsx', content: 'export default function Page() {}' }];

  const result = await auditor.auditWithAI(projectInfo, findings, sampleSnippets);

  assert.ok(result.executiveSummary, 'Should return executiveSummary');
  assert.equal(result.executiveSummary.verdict, 'APPROVED');
  assert.ok(result.uatChecklist.length >= 3, 'Should generate fallback UAT checklist steps');
  assert.equal(result.uatChecklist[0].stepNumber, 1);
});

test('8. HtmlReportGenerator should render complete valid HTML with custom titles and cards', () => {
  const generator = new HtmlReportGenerator();
  const mockReport = {
    meta: {
      auditId: 'AUDIT-TEST-001',
      projectName: 'Test Demo App',
      timestamp: '2026-09-06 19:00:00',
      version: '1.0.0',
    },
    projectInfo: {
      name: 'Test Demo App',
      path: '/demo',
      framework: 'React + Vite',
      packageManager: 'pnpm',
      totalFiles: 10,
      totalLinesOfCode: 800,
    },
    scores: {
      overall: 95,
      security: 100,
      businessLogic: 90,
      visualStability: 95,
      grade: 'A+' as const,
    },
    executiveSummary: {
      headline: 'Dự án xuất sắc, chuẩn bị nghiệm thu.',
      verdict: 'APPROVED' as const,
      businessImpactText: 'Ứng dụng đã hoàn thiện.',
      keyRisks: ['Không phát hiện rủi ro nghiêm trọng.'],
      recommendation: 'Sẵn sàng triển khai.',
    },
    securityFindings: [],
    uatChecklist: [
      {
        id: 'UAT-001',
        stepNumber: 1,
        instruction: 'Mở trình duyệt',
        expectedResult: 'Trang chủ tải thành công',
        category: 'Giao diện',
        testedByAI: true,
      }
    ],
  };

  const html = generator.generate(mockReport);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Test Demo App'));
  assert.ok(html.includes('AUDIT-TEST-001'));
  assert.ok(html.includes('UAT-001'));
  assert.ok(html.includes('95/100'));
});

test('9. auditProject high-level API should produce full report with HTML for SECURE sample', async () => {
  const { report, htmlContent } = await auditProject(SECURE_DIR, { generateHtml: true });

  assert.equal(report.projectInfo.name, 'secure-payment-gateway');
  assert.equal(report.scores.grade, 'A+');
  assert.equal(report.executiveSummary.verdict, 'APPROVED');
  assert.ok(htmlContent && htmlContent.includes('<!DOCTYPE html>'));
  assert.ok(htmlContent.includes('secure-payment-gateway'));
});

test('10. auditProject high-level API should REJECT vulnerable sample with Critical findings', async () => {
  const { report } = await auditProject(VULNERABLE_DIR, { generateHtml: false });

  assert.equal(report.projectInfo.name, 'ai-vulnerable-ecommerce');
  assert.equal(report.executiveSummary.verdict, 'REJECTED');
  assert.ok(report.securityFindings.some(f => f.severity === 'CRITICAL'));
  assert.ok(report.scores.overall < 70);
});
