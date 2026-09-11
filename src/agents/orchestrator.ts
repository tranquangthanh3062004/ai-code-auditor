import fs from 'node:fs';
import path from 'node:path';
import {
  RepoAnalystAgent,
  SecurityInspectorAgent,
  SemanticLogicAgent,
  QualityUATAgent,
} from './sub-agents.js';
import { HtmlReportGenerator } from '../reporter/html-generator.js';
import type {
  AuditReport,
  SecurityFinding,
  ProjectInfo,
  ExecutiveSummary,
  UATStep,
  Scores,
} from '../types/audit.js';
import type { AgentMetadata, AgentTask } from './types.js';

export interface OrchestrationResult {
  report: AuditReport;
  htmlContent?: string;
  tasks: AgentTask[];
  totalDurationMs: number;
}

export interface OrchestratorOptions {
  apiKey?: string;
  baseUrl?: string;
  generateHtml?: boolean;
  outputPath?: string;
}

/**
 * Orchestrator Agent: Đầu não điều phối toàn bộ hệ sinh thái Multi-Agent
 */
export class AuditOrchestrator {
  public readonly metadata: AgentMetadata = {
    id: 'agent-orchestrator',
    name: 'Audit Supervisor & Orchestrator Agent',
    role: 'ORCHESTRATOR',
    description: 'Chỉ huy, phân rã công việc cho các sub-agents, theo dõi trạng thái, phát hiện xung đột và tổng hợp báo cáo nghiệm thu',
    permissions: ['READ', 'ANALYZE', 'EXECUTE', 'REPORT'],
    version: '1.0.0',
  };

  private repoAnalyst: RepoAnalystAgent;
  private securityInspector: SecurityInspectorAgent;
  private semanticLogic: SemanticLogicAgent;
  private qualityUAT: QualityUATAgent;
  private htmlGenerator: HtmlReportGenerator;

  constructor(options: OrchestratorOptions = {}) {
    this.repoAnalyst = new RepoAnalystAgent();
    this.securityInspector = new SecurityInspectorAgent();
    this.semanticLogic = new SemanticLogicAgent(options.apiKey, options.baseUrl);
    this.qualityUAT = new QualityUATAgent();
    this.htmlGenerator = new HtmlReportGenerator();
  }

  /**
   * Điều phối quy trình thẩm định đa tác tử toàn diện
   * @param targetPath Đường dẫn thư mục cần thẩm định
   * @param options Tùy chọn xuất báo cáo
   */
  public async orchestrate(
    targetPath: string,
    options: OrchestratorOptions = {}
  ): Promise<OrchestrationResult> {
    const overallStart = Date.now();
    const resolvedPath = path.resolve(targetPath);
    const tasks: AgentTask[] = [];

    // Tác vụ 1: Repo Analyst Agent
    const task1Start = Date.now();
    const task1: AgentTask<{ targetPath: string }, { projectInfo: ProjectInfo; sourceFiles: string[] }> = {
      taskId: `TASK-REPO-${task1Start}`,
      agentId: this.repoAnalyst.metadata.id,
      role: this.repoAnalyst.metadata.role,
      objective: 'Trinh sát mã nguồn, nhận diện framework và thống kê số lượng file/dòng code',
      input: { targetPath: resolvedPath },
      status: 'IN_PROGRESS',
      startTime: task1Start,
    };
    tasks.push(task1);

    const repoResult = await this.repoAnalyst.execute(task1.input);
    task1.endTime = Date.now();
    task1.durationMs = task1.endTime - task1Start;

    if (!repoResult.success || !repoResult.data) {
      task1.status = 'FAILED';
      task1.error = repoResult.error;
      throw new Error(`RepoAnalystAgent thất bại: ${repoResult.error}`);
    }
    task1.status = 'COMPLETED';
    task1.output = repoResult.data;

    const { projectInfo, sourceFiles } = repoResult.data;

    // Tác vụ 2: Security Inspector Agent
    const task2Start = Date.now();
    const task2: AgentTask<{ targetPath: string; sourceFiles: string[] }, { findings: SecurityFinding[] }> = {
      taskId: `TASK-SEC-${task2Start}`,
      agentId: this.securityInspector.metadata.id,
      role: this.securityInspector.metadata.role,
      objective: 'Quét 11 quy tắc bảo mật tất định, phát hiện secret leak và code injection',
      input: { targetPath: resolvedPath, sourceFiles },
      status: 'IN_PROGRESS',
      startTime: task2Start,
    };
    tasks.push(task2);

    const secResult = await this.securityInspector.execute(task2.input);
    task2.endTime = Date.now();
    task2.durationMs = task2.endTime - task2Start;

    if (!secResult.success || !secResult.data) {
      task2.status = 'FAILED';
      task2.error = secResult.error;
      throw new Error(`SecurityInspectorAgent thất bại: ${secResult.error}`);
    }
    task2.status = 'COMPLETED';
    task2.output = secResult.data;

    const { findings } = secResult.data;

    // Trích xuất mã mẫu (tối đa 5 file, mỗi file 1000 ký tự)
    const sampleSnippets: Array<{ file: string; content: string }> = [];
    for (const f of sourceFiles.slice(0, 5)) {
      try {
        const content = fs.readFileSync(f, 'utf8');
        const rel = path.relative(resolvedPath, f).replace(/\\/g, '/');
        sampleSnippets.push({ file: rel, content });
      } catch {}
    }

    // Tác vụ 3: Semantic Logic Agent
    const task3Start = Date.now();
    const task3: AgentTask = {
      taskId: `TASK-AI-${task3Start}`,
      agentId: this.semanticLogic.metadata.id,
      role: this.semanticLogic.metadata.role,
      objective: 'Phân tích logic nghiệp vụ, rủi ro khách hàng và sinh kịch bản nghiệm thu UAT',
      input: { projectInfo, findings, sampleSnippets },
      status: 'IN_PROGRESS',
      startTime: task3Start,
    };
    tasks.push(task3);

    const logicResult = await this.semanticLogic.execute({
      projectInfo,
      findings,
      sampleSnippets,
    });
    task3.endTime = Date.now();
    task3.durationMs = task3.endTime - task3Start;

    let executiveSummary: ExecutiveSummary;
    let uatChecklist: UATStep[];

    if (!logicResult.success || !logicResult.data) {
      task3.status = 'FAILED';
      task3.error = logicResult.error;
      // Fallback nếu có sự cố
      executiveSummary = {
        headline: 'Không thể kết nối AI, sử dụng kết luận dựa trên phân tích tĩnh.',
        verdict: findings.some(f => f.severity === 'CRITICAL') ? 'REJECTED' : 'APPROVED',
        businessImpactText: `Dự án ${projectInfo.name} gồm ${projectInfo.totalFiles} tệp.`,
        keyRisks: ['Cần rà soát lại kết quả phân tích.'],
        recommendation: 'Kiểm tra kỹ danh sách lỗ hổng bảo mật bên dưới.',
      };
      uatChecklist = [];
    } else {
      task3.status = 'COMPLETED';
      task3.output = logicResult.data;
      executiveSummary = logicResult.data.executiveSummary;
      uatChecklist = logicResult.data.uatChecklist;
    }

    // Tác vụ 4: Quality & UAT Agent
    const task4Start = Date.now();
    const task4: AgentTask<{ findings: SecurityFinding[]; projectInfo: ProjectInfo }, { scores: Scores }> = {
      taskId: `TASK-SCORE-${task4Start}`,
      agentId: this.qualityUAT.metadata.id,
      role: this.qualityUAT.metadata.role,
      objective: 'Tính toán Trust Scorecard có trọng số minh bạch và xếp loại chất lượng A-F',
      input: { findings, projectInfo },
      status: 'IN_PROGRESS',
      startTime: task4Start,
    };
    tasks.push(task4);

    const qualityResult = await this.qualityUAT.execute(task4.input);
    task4.endTime = Date.now();
    task4.durationMs = task4.endTime - task4Start;

    if (!qualityResult.success || !qualityResult.data) {
      task4.status = 'FAILED';
      task4.error = qualityResult.error;
      throw new Error(`QualityUATAgent thất bại: ${qualityResult.error}`);
    }
    task4.status = 'COMPLETED';
    task4.output = qualityResult.data;

    const { scores } = qualityResult.data;

    // Tổng hợp Báo cáo Thẩm định Thống nhất
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
      htmlContent = this.htmlGenerator.generate(report);
      if (options.outputPath) {
        const resolvedOut = path.resolve(options.outputPath);
        fs.writeFileSync(resolvedOut, htmlContent, 'utf8');
      }
    }

    const totalDurationMs = Date.now() - overallStart;

    return {
      report,
      htmlContent,
      tasks,
      totalDurationMs,
    };
  }
}
