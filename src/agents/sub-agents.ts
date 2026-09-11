import { HeuristicDetector } from '../engine/heuristic-detector.js';
import { DeterministicScanner } from '../engine/deterministic-rules.js';
import { DeepSeekAuditor } from '../engine/deepseek-client.js';
import { ScorecardCalculator } from '../reporter/scorecard.js';
import type {
  AgentMetadata,
  AgentExecutionResult,
  RepoAnalystInput,
  RepoAnalystOutput,
  SecurityInspectorInput,
  SecurityInspectorOutput,
  SemanticLogicInput,
  SemanticLogicOutput,
  QualityUATInput,
  QualityUATOutput,
} from './types.js';

export abstract class BaseAgent {
  public abstract readonly metadata: AgentMetadata;

  protected createSuccessResult<T>(data: T, durationMs: number, notes?: string[]): AgentExecutionResult<T> {
    return {
      agentId: this.metadata.id,
      role: this.metadata.role,
      success: true,
      data,
      notes,
      durationMs,
    };
  }

  protected createFailureResult(error: string, durationMs: number): AgentExecutionResult<never> {
    return {
      agentId: this.metadata.id,
      role: this.metadata.role,
      success: false,
      error,
      durationMs,
    };
  }
}

/**
 * 1. Repo Analyst Agent: Phân tích cấu trúc thư mục, framework và thống kê dòng code
 */
export class RepoAnalystAgent extends BaseAgent {
  public readonly metadata: AgentMetadata = {
    id: 'agent-repo-analyst',
    name: 'Repository & Architecture Analyst Agent',
    role: 'REPO_ANALYST',
    description: 'Chuyên trách trinh sát cây thư mục, nhận diện framework, cấu hình khởi chạy và quy mô mã nguồn',
    permissions: ['READ', 'ANALYZE'],
    version: '1.0.0',
  };

  public async execute(input: RepoAnalystInput): Promise<AgentExecutionResult<RepoAnalystOutput>> {
    const start = Date.now();
    try {
      const detector = new HeuristicDetector(input.targetPath);
      const detectionResult = detector.detect();
      const duration = Date.now() - start;

      return this.createSuccessResult(detectionResult, duration, [
        `Phát hiện framework: ${detectionResult.projectInfo.framework}`,
        `Tổng số file nguồn: ${detectionResult.sourceFiles.length}`,
      ]);
    } catch (err: any) {
      return this.createFailureResult(err.message || 'Lỗi phân tích repository', Date.now() - start);
    }
  }
}

/**
 * 2. Security Inspector Agent: Quét các lỗ hổng bảo mật tất định và rò rỉ thông tin nhạy cảm
 */
export class SecurityInspectorAgent extends BaseAgent {
  public readonly metadata: AgentMetadata = {
    id: 'agent-security-inspector',
    name: 'Security Inspector Agent',
    role: 'SECURITY_INSPECTOR',
    description: 'Chuyên trách quét các quy tắc bảo mật tất định (Zero-Hallucination), phát hiện lộ API key, SQLi, XSS, TLS disable, Command Injection',
    permissions: ['READ', 'ANALYZE'],
    version: '1.0.0',
  };

  public async execute(input: SecurityInspectorInput): Promise<AgentExecutionResult<SecurityInspectorOutput>> {
    const start = Date.now();
    try {
      const scanner = new DeterministicScanner();
      const findings = scanner.scanFiles(input.targetPath, input.sourceFiles);
      const duration = Date.now() - start;

      const criticals = findings.filter(f => f.severity === 'CRITICAL').length;
      const highs = findings.filter(f => f.severity === 'HIGH').length;

      return {
        ...this.createSuccessResult({ findings }, duration, [
          `Tìm thấy ${findings.length} vấn đề bảo mật (${criticals} Critical, ${highs} High)`,
        ]),
        findingsCount: findings.length,
      };
    } catch (err: any) {
      return this.createFailureResult(err.message || 'Lỗi quét bảo mật', Date.now() - start);
    }
  }
}

/**
 * 3. Semantic Logic Agent: Đánh giá logic nghiệp vụ, rủi ro kinh doanh và dịch thuật non-tech
 */
export class SemanticLogicAgent extends BaseAgent {
  public readonly metadata: AgentMetadata = {
    id: 'agent-semantic-logic',
    name: 'Semantic Logic & Business Agent',
    role: 'SEMANTIC_LOGIC',
    description: 'Chuyên trách sử dụng mô hình ngôn ngữ AI để phân tích tác động kinh doanh, diễn giải rủi ro bằng tiếng Việt đời thường',
    permissions: ['ANALYZE', 'REPORT'],
    version: '1.0.0',
  };

  private auditor: DeepSeekAuditor;

  constructor(apiKey?: string, baseUrl?: string) {
    super();
    this.auditor = new DeepSeekAuditor(apiKey, baseUrl);
  }

  public async execute(input: SemanticLogicInput): Promise<AgentExecutionResult<SemanticLogicOutput>> {
    const start = Date.now();
    try {
      const aiResult = await this.auditor.auditWithAI(
        input.projectInfo,
        input.findings,
        input.sampleSnippets
      );
      const duration = Date.now() - start;

      return this.createSuccessResult(aiResult, duration, [
        `Kết luận: ${aiResult.executiveSummary.verdict}`,
        `Sinh ra ${aiResult.uatChecklist.length} bước nghiệm thu UAT`,
      ]);
    } catch (err: any) {
      return this.createFailureResult(err.message || 'Lỗi phân tích ngữ nghĩa AI', Date.now() - start);
    }
  }
}

/**
 * 4. Quality & UAT Agent: Tính toán bảng điểm trọng số và đánh giá độ ổn định
 */
export class QualityUATAgent extends BaseAgent {
  public readonly metadata: AgentMetadata = {
    id: 'agent-quality-uat',
    name: 'Quality & UAT Verification Agent',
    role: 'QUALITY_UAT',
    description: 'Chuyên trách chấm điểm có trọng số (Trust Scorecard) và đánh giá độ hoàn thiện giao diện/runtime',
    permissions: ['ANALYZE', 'REPORT'],
    version: '1.0.0',
  };

  public async execute(input: QualityUATInput): Promise<AgentExecutionResult<QualityUATOutput>> {
    const start = Date.now();
    try {
      const calculator = new ScorecardCalculator();
      const scores = calculator.calculate(input.findings, input.projectInfo);
      const duration = Date.now() - start;

      return this.createSuccessResult({ scores }, duration, [
        `Điểm tổng thể: ${scores.overall}/100 (Hạng ${scores.grade})`,
        `Điểm bảo mật: ${scores.security}/100, Điểm nghiệp vụ: ${scores.businessLogic}/100, Ổn định: ${scores.visualStability}/100`,
      ]);
    } catch (err: any) {
      return this.createFailureResult(err.message || 'Lỗi tính điểm chất lượng', Date.now() - start);
    }
  }
}
