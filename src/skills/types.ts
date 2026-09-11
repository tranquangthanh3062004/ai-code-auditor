export type SkillCategory = 'CORE' | 'OPTIONAL' | 'PREMIUM' | 'INTERNAL';

export type SkillPricingModel = 'FREE' | 'INCLUDED_IN_PRO' | 'SUBSCRIPTION' | 'USAGE_BASED' | 'INTERNAL_ONLY';

export type SkillPriority = 'P0' | 'P1' | 'P2';

export interface SkillDependency {
  skillId: string;
  version: string;
  optional?: boolean;
}

export interface SkillDefinition {
  id: string;
  name: string;
  version: string;
  category: SkillCategory;
  description: string;
  businessValue: string;
  targetUser: string;
  requiredAgent: string;
  requiredMcpTools: string[];
  requiredPermissions: string[];
  dependencies: SkillDependency[];
  inputSchemaDescription: string;
  outputSchemaDescription: string;
  failureCases: string[];
  securityRisks: string[];
  costPerRunEst: string;
  expectedTokenUsage: string;
  priority: SkillPriority;
  pricingModel: SkillPricingModel;
  enabledByDefault: boolean;
}

export interface SkillState {
  skillId: string;
  enabled: boolean;
  licensed: boolean;
  version: string;
  installedAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface TenantEntitlement {
  tenantId: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  licensedSkillIds: string[];
  tokenQuota: number;
  tokensUsed: number;
}

export interface SkillExecutionContext {
  tenantId?: string;
  plan?: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  targetPath: string;
  options?: Record<string, unknown>;
}

export interface SkillExecutionResult<T = unknown> {
  skillId: string;
  success: boolean;
  data?: T;
  error?: string;
  durationMs: number;
  tokensConsumed?: number;
}
