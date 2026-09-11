import type { ProjectInfo, SecurityFinding, ExecutiveSummary, UATStep, Scores } from '../types/audit.js';

export type AgentRole =
  | 'ORCHESTRATOR'
  | 'REPO_ANALYST'
  | 'SECURITY_INSPECTOR'
  | 'SEMANTIC_LOGIC'
  | 'QUALITY_UAT';

export type AgentPermission = 'READ' | 'ANALYZE' | 'EXECUTE' | 'REPORT';

export interface AgentMetadata {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  permissions: AgentPermission[];
  version: string;
}

export interface AgentTask<TInput = unknown, TOutput = unknown> {
  taskId: string;
  parentTaskId?: string;
  agentId: string;
  role: AgentRole;
  objective: string;
  context?: Record<string, unknown>;
  input: TInput;
  output?: TOutput;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  error?: string;
  startTime?: number;
  endTime?: number;
  durationMs?: number;
}

export interface AgentExecutionResult<T = unknown> {
  agentId: string;
  role: AgentRole;
  success: boolean;
  data?: T;
  findingsCount?: number;
  notes?: string[];
  error?: string;
  durationMs: number;
}

export interface RepoAnalystInput {
  targetPath: string;
}

export interface RepoAnalystOutput {
  projectInfo: ProjectInfo;
  sourceFiles: string[];
}

export interface SecurityInspectorInput {
  targetPath: string;
  sourceFiles: string[];
}

export interface SecurityInspectorOutput {
  findings: SecurityFinding[];
}

export interface SemanticLogicInput {
  projectInfo: ProjectInfo;
  findings: SecurityFinding[];
  sampleSnippets: Array<{ file: string; content: string }>;
}

export interface SemanticLogicOutput {
  executiveSummary: ExecutiveSummary;
  uatChecklist: UATStep[];
}

export interface QualityUATInput {
  findings: SecurityFinding[];
  projectInfo: ProjectInfo;
}

export interface QualityUATOutput {
  scores: Scores;
}
