import { z } from 'zod';

export const SeveritySchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']);
export type Severity = z.infer<typeof SeveritySchema>;

export const VerdictSchema = z.enum(['APPROVED', 'NEEDS_REVIEW', 'REJECTED']);
export type Verdict = z.infer<typeof VerdictSchema>;

export const GradeSchema = z.enum(['A+', 'A', 'B', 'C', 'F']);
export type Grade = z.infer<typeof GradeSchema>;

export const SecurityFindingSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  severity: SeveritySchema,
  title: z.string(),
  file: z.string(),
  line: z.number().optional(),
  codeSnippet: z.string().optional(),
  plainExplanation: z.string(), // Dành cho người non-tech
  remediation: z.string(),      // Hướng dẫn khắc phục
});
export type SecurityFinding = z.infer<typeof SecurityFindingSchema>;

export const UATStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number(),
  instruction: z.string(),     // Thao tác người dùng cần làm
  expectedResult: z.string(),  // Kết quả mong đợi mắt thấy
  category: z.string().default('Giao diện & Trải nghiệm'),
  testedByAI: z.boolean().default(true),
});
export type UATStep = z.infer<typeof UATStepSchema>;

export const ProjectInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  framework: z.string(),
  packageManager: z.string(),
  entrypoint: z.string().optional(),
  devCommand: z.string().optional(),
  detectedPort: z.number().optional(),
  totalFiles: z.number(),
  totalLinesOfCode: z.number(),
});
export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;

export const ScoresSchema = z.object({
  overall: z.number().min(0).max(100),
  security: z.number().min(0).max(100),
  businessLogic: z.number().min(0).max(100),
  visualStability: z.number().min(0).max(100),
  grade: GradeSchema,
});
export type Scores = z.infer<typeof ScoresSchema>;

export const ExecutiveSummarySchema = z.object({
  headline: z.string(),
  verdict: VerdictSchema,
  businessImpactText: z.string(), // Tính năng này làm được gì mới?
  keyRisks: z.array(z.string()),  // 2-3 rủi ro lớn nhất
  recommendation: z.string(),     // Lời khuyên cuối cùng cho Founder / PM
});
export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;

export const AuditReportSchema = z.object({
  meta: z.object({
    auditId: z.string(),
    projectName: z.string(),
    timestamp: z.string(),
    version: z.string().default('1.0.0'),
  }),
  projectInfo: ProjectInfoSchema,
  scores: ScoresSchema,
  executiveSummary: ExecutiveSummarySchema,
  securityFindings: z.array(SecurityFindingSchema),
  uatChecklist: z.array(UATStepSchema),
});
export type AuditReport = z.infer<typeof AuditReportSchema>;
