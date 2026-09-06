import fs from 'node:fs';
import path from 'node:path';
import { HeuristicDetector } from './engine/heuristic-detector.js';
import { DeterministicScanner } from './engine/deterministic-rules.js';
import { DeepSeekAuditor } from './engine/deepseek-client.js';
import { ScorecardCalculator } from './reporter/scorecard.js';
import { HtmlReportGenerator } from './reporter/html-generator.js';
import type { AuditReport, SecurityFinding } from './types/audit.js';

export * from './types/audit.js';
export { HeuristicDetector } from './engine/heuristic-detector.js';
export { DeterministicScanner } from './engine/deterministic-rules.js';
export { DeepSeekAuditor } from './engine/deepseek-client.js';
export { ScorecardCalculator } from './reporter/scorecard.js';
export { HtmlReportGenerator } from './reporter/html-generator.js';

export interface AuditOptions {
  outputPath?: string;
  generateHtml?: boolean;
}

/**
 * Thực hiện thẩm định toàn diện một thư mục mã nguồn
 * @param targetPath Đường dẫn thư mục cần thẩm định
 * @param options Các tùy chọn xuất báo cáo
 */
export async function auditProject(
  targetPath: string,
  options: AuditOptions = {}
): Promise<{ report: AuditReport; htmlContent?: string }> {
  const resolvedPath = path.resolve(targetPath);

  // 1. Nhận diện cấu trúc & framework
  const detector = new HeuristicDetector(resolvedPath);
  const { projectInfo, sourceFiles } = detector.detect();

  // 2. Quét bảo mật tất định (Zero Hallucination)
  const scanner = new DeterministicScanner();
  const findings: SecurityFinding[] = scanner.scanFiles(resolvedPath, sourceFiles);

  // 3. Trích xuất code mẫu
  const sampleSnippets: Array<{ file: string; content: string }> = [];
  for (const f of sourceFiles.slice(0, 5)) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const rel = path.relative(resolvedPath, f).replace(/\\/g, '/');
      sampleSnippets.push({ file: rel, content });
    } catch {}
  }

  // 4. Phân tích ngữ nghĩa qua DeepSeek AI (có Fallback Engine)
  const auditor = new DeepSeekAuditor();
  const { executiveSummary, uatChecklist } = await auditor.auditWithAI(projectInfo, findings, sampleSnippets);

  // 5. Tính toán bảng điểm có trọng số
  const calculator = new ScorecardCalculator();
  const scores = calculator.calculate(findings);

  // 6. Tổng hợp Báo cáo Thẩm định
  const report: AuditReport = {
    meta: {
      auditId: `AUDIT-${Date.now()}`,
      projectName: projectInfo.name,
      timestamp: new Date().toLocaleString('vi-VN'),
      version: '1.0.0',
    },
    projectInfo,
    scores,
    executiveSummary,
    securityFindings: findings,
    uatChecklist,
  };

  let htmlContent: string | undefined = undefined;
  if (options.generateHtml !== false) {
    const htmlGenerator = new HtmlReportGenerator();
    htmlContent = htmlGenerator.generate(report);

    if (options.outputPath) {
      const resolvedOut = path.resolve(options.outputPath);
      fs.writeFileSync(resolvedOut, htmlContent, 'utf8');
    }
  }

  return { report, htmlContent };
}
