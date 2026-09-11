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

test('11. AuditOrchestrator should coordinate 4 sub-agents and produce task telemetry', async () => {
  const { AuditOrchestrator } = await import('../src/agents/orchestrator.js');
  const orchestrator = new AuditOrchestrator();
  const result = await orchestrator.orchestrate(SECURE_DIR, { generateHtml: false });

  assert.ok(result.report, 'Should produce audit report');
  assert.equal(result.report.executiveSummary.verdict, 'APPROVED');
  assert.equal(result.tasks.length, 4, 'Should execute exactly 4 sub-agent tasks');
  assert.ok(result.tasks.every(t => t.status === 'COMPLETED'), 'All sub-agent tasks should complete successfully');
  assert.ok(result.totalDurationMs > 0, 'Should measure execution time');
});

test('12. MCP executeMcpTool should execute codetrust_inspect_project and codetrust_scan_security', async () => {
  const { executeMcpTool } = await import('../src/mcp/tools.js');

  const inspectRes = await executeMcpTool('codetrust_inspect_project', { targetPath: SECURE_DIR });
  assert.equal(inspectRes.projectInfo.name, 'secure-payment-gateway');
  assert.equal(inspectRes.projectInfo.framework, 'Express.js API');

  const scanRes = await executeMcpTool('codetrust_scan_security', { targetPath: VULNERABLE_DIR });
  assert.ok(scanRes.totalFindings >= 2, 'Should find vulnerabilities in vulnerable sample');
  assert.ok(scanRes.findings.some((f: any) => f.severity === 'CRITICAL'), 'Should identify critical API leak');
});

test('13. McpServer should handle JSON-RPC initialize, ping, tools/list, and tools/call', async () => {
  const { McpServer } = await import('../src/mcp/server.js');
  const server = new McpServer();

  // 1. Initialize
  const initRes = await server.handleRequest({ jsonrpc: '2.0', id: 1, method: 'initialize' });
  assert.equal(initRes?.result?.serverInfo?.name, 'codetrust-mcp-server');
  assert.ok(initRes?.result?.capabilities?.tools);

  // 2. Ping
  const pingRes = await server.handleRequest({ jsonrpc: '2.0', id: 2, method: 'ping' });
  assert.deepEqual(pingRes?.result, {});

  // 3. List tools
  const listRes = await server.handleRequest({ jsonrpc: '2.0', id: 3, method: 'tools/list' });
  assert.ok(Array.isArray(listRes?.result?.tools));
  assert.ok(listRes?.result?.tools.length >= 4);

  // 4. Call tool
  const callRes = await server.handleRequest({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'codetrust_inspect_project',
      arguments: { targetPath: SECURE_DIR },
    },
  });
  assert.ok(callRes?.result?.content?.[0]?.text);
  assert.ok(callRes?.result?.content[0].text.includes('secure-payment-gateway'));
});

test('14. Security: Path Traversal attempts should be blocked by isSafeRelativePath', async () => {
  const { isSafeRelativePath } = await import('../server/index.js');
  const invalidPaths = [
    '../../etc/passwd',
    '..\\..\\windows\\system32\\evil.exe',
    '/absolute/path/attack.js',
    'C:\\Windows\\System32\\calc.exe',
  ];

  for (const p of invalidPaths) {
    assert.equal(isSafeRelativePath(p), false, `Path traversal attempt "${p}" should be rejected`);
  }

  const validPaths = [
    'src/index.js',
    'components/Button.tsx',
    'package.json',
    'assets/images/logo.png',
  ];

  for (const p of validPaths) {
    assert.equal(isSafeRelativePath(p), true, `Safe relative path "${p}" should be accepted`);
  }
});

test('15. DeepSeekAuditor constructor should accept custom apiKey and baseUrl without throwing', () => {
  const auditor = new DeepSeekAuditor('test-custom-key-12345', 'https://custom-ai.example.com');
  assert.ok(auditor, 'Auditor instance created with custom params');
});

test('16. SkillRegistry should load all 24 skills with exact category breakdown', async () => {
  const { defaultSkillRegistry } = await import('../src/skills/index.js');
  const allSkills = defaultSkillRegistry.listSkills();

  assert.equal(allSkills.length, 24, 'Total skills must equal exactly 24');

  const coreSkills = defaultSkillRegistry.listSkills({ category: 'CORE' });
  const optSkills = defaultSkillRegistry.listSkills({ category: 'OPTIONAL' });
  const premSkills = defaultSkillRegistry.listSkills({ category: 'PREMIUM' });
  const intSkills = defaultSkillRegistry.listSkills({ category: 'INTERNAL' });

  assert.equal(coreSkills.length, 5, 'Should have exactly 5 CORE skills');
  assert.equal(optSkills.length, 7, 'Should have exactly 7 OPTIONAL skills');
  assert.equal(premSkills.length, 8, 'Should have exactly 8 PREMIUM skills');
  assert.equal(intSkills.length, 4, 'Should have exactly 4 INTERNAL skills');
});

test('17. SkillRegistry should verify zero circular dependencies across all 24 skills', async () => {
  const { defaultSkillRegistry } = await import('../src/skills/index.js');
  const check = defaultSkillRegistry.checkCircularDependencies();

  assert.equal(check.hasCycle, false, 'Dependency graph must not have circular dependencies');

  // Verify topological execution order for a multi-dependency skill
  const executionOrder = defaultSkillRegistry.resolveDependencies('core.biz-risk-translator');
  assert.ok(executionOrder.includes('core.repo-recon'));
  assert.ok(executionOrder.includes('core.static-sec-scan'));
  assert.equal(executionOrder[executionOrder.length - 1], 'core.biz-risk-translator');
});

test('18. SkillRegistry should protect CORE skills from deactivation and enforce Entitlement for PREMIUM skills', async () => {
  const { defaultSkillRegistry } = await import('../src/skills/index.js');

  // 1. Core skills cannot be disabled
  const disableCoreRes = defaultSkillRegistry.disableSkill('core.repo-recon');
  assert.equal(disableCoreRes.success, false, 'Should block disabling CORE skill');
  assert.ok(disableCoreRes.reason?.includes('Quy tắc bảo vệ'));

  // 2. Premium skills cannot be enabled without entitlement
  const enablePremRes = defaultSkillRegistry.enableSkill('prem.owasp-top10-certifier');
  assert.equal(enablePremRes.success, false, 'Should reject enabling PREMIUM skill without license');

  // 3. Premium skill succeeds when entitled
  const licensedRes = defaultSkillRegistry.enableSkill('prem.owasp-top10-certifier', {
    tenantId: 'tenant-test',
    plan: 'PRO',
    licensedSkillIds: ['prem.owasp-top10-certifier'],
    tokenQuota: 100000,
    tokensUsed: 0,
  });
  assert.equal(licensedRes.success, true, 'Should allow enabling when licensed in entitlement');
});

test('19. MCP Tools codetrust_list_skills and codetrust_get_skill_info should execute cleanly', async () => {
  const { executeMcpTool } = await import('../src/mcp/tools.js');

  // 1. List skills
  const listRes = await executeMcpTool('codetrust_list_skills', { category: 'CORE' });
  assert.equal(listRes.total, 5);
  assert.ok(listRes.skills.some((s: any) => s.id === 'core.repo-recon'));

  // 2. Get skill info
  const infoRes = await executeMcpTool('codetrust_get_skill_info', { skillId: 'prem.owasp-top10-certifier' });
  assert.equal(infoRes.skill.name, 'OWASP Top 10 Enterprise Compliance Certifier');
  assert.ok(infoRes.resolvedExecutionOrder.length >= 2);
});

