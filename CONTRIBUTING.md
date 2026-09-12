# Contributing to CodeTrust AI (VibeAuditor)

Thank you for your interest in contributing to **CodeTrust AI (VibeAuditor)**! We welcome contributions from developers, security researchers, AI engineers, and technical writers worldwide.

This guide outlines our development workflow, architecture overview, and instructions for extending the platform with new **Security Rules**, **Agent Skills**, and **MCP Tools**.

---

## 🧭 Repository Architecture Quick Map

CodeTrust AI is structured as a modular TypeScript/Node.js monorepo:

```
ai-code-auditor/
├── src/
│   ├── agents/            # Multi-Agent Layer (Supervisor, RepoAnalyst, SecurityInspector, etc.)
│   ├── engine/            # Deterministic AST/Regex scanner & DeepSeek AI fallback engine
│   ├── mcp/               # Model Context Protocol (MCP) JSON-RPC 2.0 stdio server
│   ├── skills/            # 24 Modular Agent Skills, Registry & Dependency graph
│   ├── reporter/          # HTML report generator & weighted scorecard calculator
│   ├── cli/               # CLI entrypoint (codetrust command)
│   └── types/             # Shared TypeScript interfaces and Zod schemas
├── server/                # Express API & static server for Web UI
├── web/                   # Vanilla Glassmorphism UI (Dashboard, Drawer, Diff Progression, Skill Store)
├── samples/               # Realistic test fixtures (sample-vulnerable, sample-secure, sample-xss)
└── tests/                 # Automated test suite (21 unit & integration tests)
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: `>= 20.0.0` (Node 22 LTS recommended)
- **Package Manager**: `pnpm` (`npm install -g pnpm`)
- **Git**: For version control

### 2. Clone & Install
```bash
git clone https://github.com/tranquangthanh3062004/ai-code-auditor.git
cd ai-code-auditor

# Install dependencies without running arbitrary scripts
pnpm install --ignore-scripts
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional)* Add your `DEEPSEEK_API_KEY`. If left empty, CodeTrust AI seamlessly activates its deterministic **Heuristic Fallback Engine** so local testing remains 100% functional offline.

### 4. Running the Test Suite
All contributions must pass the complete test suite:
```bash
pnpm test
```
To verify TypeScript compilation with strict type checking:
```bash
pnpm run build
```

---

## 🧩 Extending CodeTrust AI

### 1. Adding a Deterministic Security Rule
All static security rules live in [`src/engine/deterministic-rules.ts`](file:///e:/project/ai-code-auditor/src/engine/deterministic-rules.ts).  
Rules must be **deterministic, zero-hallucination, and high-precision**:

```typescript
{
  id: 'SEC-012',
  severity: 'HIGH', // CRITICAL | HIGH | MEDIUM | LOW | INFO
  title: 'Insecure Direct Object Reference (IDOR) Pattern',
  pattern: /req\.params\.id.*db\.delete/g,
  plainExplanation: 'Allows unauthenticated users to modify or delete resources belonging to others.',
  remediation: 'Verify ownership and enforce access control policies before executing data mutation.'
}
```
*Always add a corresponding test case in `tests/audit.test.ts` verifying positive and negative detection.*

---

### 2. Registering a New Agent Skill
Agent skills are cataloged in [`src/skills/catalog-data.ts`](file:///e:/project/ai-code-auditor/src/skills/catalog-data.ts) and managed via [`src/skills/registry.ts`](file:///e:/project/ai-code-auditor/src/skills/registry.ts):

1. Define your skill in `SKILL_CATALOG`:
```typescript
{
  id: 'skill-graphql-auditor',
  name: 'GraphQL Schema & Query Depth Auditor',
  category: 'SECURITY',
  tier: 'OPTIONAL', // CORE | OPTIONAL | PREMIUM | INTERNAL
  version: '1.0.0',
  description: 'Audits GraphQL resolvers for recursive query DOS attacks and N+1 query leaks.',
  dependencies: ['skill-static-analyzer'],
  assignedAgent: 'SecurityInspector',
  enabled: true
}
```
2. Verify dependency graph integrity:
   - Ensure the skill does not introduce circular dependencies.
   - Run `pnpm test` to validate topological sort and entitlement validation.

---

### 3. Adding a Model Context Protocol (MCP) Tool
MCP tools are exposed to Cursor, Claude Desktop, and Antigravity via [`src/mcp/tools.ts`](file:///e:/project/ai-code-auditor/src/mcp/tools.ts):

1. Add the tool definition to `MCP_TOOLS`:
```typescript
{
  name: 'codetrust_custom_tool',
  description: 'Explain what this tool provides to the LLM agent',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: { type: 'string', description: 'Path to target workspace' }
    },
    required: ['projectPath']
  }
}
```
2. Implement the handler in `executeMcpTool(name, args)`.
3. Add a test in `tests/audit.test.ts` to ensure JSON-RPC invocation works without schema errors.

---

## 📋 Git Commit Guidelines (Conventional Commits)

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature, agent skill, or MCP tool
- `fix:` A bug fix in the scanner, UI, or server
- `docs:` Documentation improvements (`README.md`, `PITCH.md`, etc.)
- `test:` Adding or updating unit/integration tests
- `refactor:` Code refactoring with no behavior change
- `perf:` Performance optimizations (memory, caching)
- `chore:` Maintenance tasks, dependency updates

**Example**:
```bash
git commit -m "feat(skills): add GraphQL depth attack analyzer skill"
```

---

## 🚀 Pull Request Checklist

Before submitting your PR, ensure that:
- [ ] `pnpm test` passes all 21 test cases (100% pass).
- [ ] `pnpm run build` compiles with 0 TypeScript errors.
- [ ] Code follows project formatting and clean code conventions.
- [ ] Relevant documentation has been updated.
- [ ] Pull request description clearly explains the **motivation**, **changes made**, and **testing evidence**.

Thank you for helping us build the trusted verification foundation for the future of software development!
