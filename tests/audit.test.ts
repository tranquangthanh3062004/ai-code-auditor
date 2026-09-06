import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { HeuristicDetector } from '../src/engine/heuristic-detector.js';
import { DeterministicScanner } from '../src/engine/deterministic-rules.js';
import { ScorecardCalculator } from '../src/reporter/scorecard.js';
import { HtmlReportGenerator } from '../src/reporter/html-generator.js';
import { auditProject } from '../src/index.js';

const ROOT = path.resolve('E:/project/ai-code-auditor');
const VULNERABLE_DIR = path.join(ROOT, 'samples/sample-vulnerable');
const SECURE_DIR = path.join(ROOT, 'samples/sample-secure');

test('HeuristicDetector should correctly inspect project framework and files', () => {
  const detector = new HeuristicDetector(VULNERABLE_DIR);
  const { projectInfo, sourceFiles } = detector.detect();

  assert.equal(projectInfo.name, 'ai-vulnerable-ecommerce');
  assert.equal(projectInfo.framework, 'Express.js API');
  assert.equal(projectInfo.packageManager, 'npm');
  assert.equal(projectInfo.detectedPort, 3000);
  assert.ok(sourceFiles.length >= 2, 'Should find package.json and src/index.js');
});

test('DeterministicScanner should detect Critical API key leak and SQL Injection', () => {
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

test('DeterministicScanner should find ZERO vulnerabilities on secure sample', () => {
  const detector = new HeuristicDetector(SECURE_DIR);
  const { sourceFiles } = detector.detect();

  const scanner = new DeterministicScanner();
  const findings = scanner.scanFiles(SECURE_DIR, sourceFiles);

  assert.equal(findings.length, 0, 'Clean project should have 0 security findings');
});

test('ScorecardCalculator should appropriately penalize vulnerable project and reward clean project', () => {
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

test('auditProject high-level API should produce full report with HTML', async () => {
  const { report, htmlContent } = await auditProject(SECURE_DIR, { generateHtml: true });

  assert.equal(report.projectInfo.name, 'secure-payment-gateway');
  assert.equal(report.scores.grade, 'A+');
  assert.equal(report.executiveSummary.verdict, 'APPROVED');
  assert.ok(htmlContent && htmlContent.includes('<!DOCTYPE html>'));
  assert.ok(htmlContent.includes('ĐẠT CHUẨN NGHIỆM THU'));
  assert.ok(htmlContent.includes('secure-payment-gateway'));
});
