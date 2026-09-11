import { AuditOrchestrator, type OrchestratorOptions, type OrchestrationResult } from './agents/orchestrator.js';
import type { AuditReport } from './types/audit.js';

export * from './types/audit.js';
export * from './agents/types.js';
export * from './agents/sub-agents.js';
export * from './agents/orchestrator.js';
export { HeuristicDetector } from './engine/heuristic-detector.js';
export { DeterministicScanner } from './engine/deterministic-rules.js';
export { DeepSeekAuditor } from './engine/deepseek-client.js';
export { ScorecardCalculator } from './reporter/scorecard.js';
export { HtmlReportGenerator } from './reporter/html-generator.js';

export interface AuditOptions extends OrchestratorOptions {
  outputPath?: string;
  generateHtml?: boolean;
}

/**
 * Thực hiện thẩm định toàn diện một thư mục mã nguồn thông qua hệ thống Multi-Agent
 * @param targetPath Đường dẫn thư mục cần thẩm định
 * @param options Các tùy chọn xuất báo cáo và cấu hình agent
 */
export async function auditProject(
  targetPath: string,
  options: AuditOptions = {}
): Promise<{ report: AuditReport; htmlContent?: string; orchestration?: OrchestrationResult }> {
  const orchestrator = new AuditOrchestrator(options);
  const result = await orchestrator.orchestrate(targetPath, options);

  return {
    report: result.report,
    htmlContent: result.htmlContent,
    orchestration: result,
  };
}
