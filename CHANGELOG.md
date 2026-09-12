# Changelog

All notable changes to **CodeTrust AI (VibeAuditor)** are documented in this file following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and adhering to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-09-12

### 🚀 Major Highlights
- **Multi-Agent Orchestration Architecture**: Introduced a hierarchical Supervisor pattern with 4 specialized sub-agents:
  - `RepoAnalyst`: Scans architecture, framework dependencies, file distributions, and SLOC metrics.
  - `SecurityInspector`: Executes zero-hallucination deterministic AST rules and security scoring.
  - `SemanticLogic`: Synthesizes plain-language executive summaries and detects subtle business requirement gaps.
  - `QualityUAT`: Formulates step-by-step click-and-inspect visual acceptance checklists for non-technical stakeholders.
- **Model Context Protocol (MCP) Gateway**:
  - Implemented compliant JSON-RPC 2.0 stdio server (`src/mcp/`) exposing 6 native tools: `codetrust_inspect_project`, `codetrust_scan_security`, `codetrust_run_audit`, `codetrust_get_scorecard`, `codetrust_list_skills`, and `codetrust_get_skill_info`.
  - Seamless, direct integration with Cursor, Claude Desktop, and Antigravity IDE.
- **24-Skill Architecture & Marketplace**:
  - Structured catalog of 24 modular Agent Skills classified across 4 tiers (`CORE`, `OPTIONAL`, `PREMIUM`, `INTERNAL`).
  - Topological sort dependency resolution ensuring zero cyclic dependencies.
  - Built-in entitlement checks and multi-tenant isolation.
  - Interactive Skill Store modal in the Web UI for instant enabling/disabling of skills.
- **Audit Progression & Diff Inspector**:
  - Local audit history drawer persisting up to 20 past audit runs with instant 1-click retrieval.
  - Progression engine tracking score deltas (`+` improvement / `-` regression) across code iterations.
  - Automated finding classification: `NEW`, `RESOLVED`, `PERSISTING`.
  - Visual Side-by-Side Code Diff viewer highlighting exact file line changes and remediations.
- **Digital Acceptance Sign-off Certificate**:
  - One-click acceptance sign-off for non-technical founders, PMs, and clients.
  - Cryptographic SHA-256 seal locking audit timestamp, project version, inspector name, and approval notes into the final report.
- **1-Click Issue / Bug Ticket Generator**:
  - Generates ready-to-paste Markdown bug reports for GitHub Issues or Jira tickets directly from finding cards.
- **Expanded Test Suite**:
  - Test suite expanded to **21 automated unit and integration tests** (100% pass rate).
  - Validated security path-traversal protections, skill DAG dependency integrity, and MCP tool handlers.

---

## [0.1.0] - 2026-09-06

### Added
- **Deterministic Security Scanner**: 10 static rules detecting API Key leaks (OpenAI, DeepSeek, GitHub, AWS), SQL Injection, XSS, eval, and plaintext DB connection strings.
- **Heuristic Project & Framework Detector**: Automatic detection of Next.js, Vite, React, Vue, Express, NestJS, and Python (FastAPI/Flask/Django).
- **DeepSeek AI Reasoning & Resilient Fallback Engine**: Semantic business logic analysis with automatic fallback to offline heuristic mode.
- **Weighted Scorecard Calculator**: Multi-factor scoring (Security 40%, Logic 35%, UI Stability 25%) with letter grades `A+`, `A`, `B`, `C`, `F`.
- **Standalone Single-File HTML Report Generator**: Self-contained reports with Dark Mode & Glassmorphism design system.
- **CLI & TypeScript Library**: Command-line binary `codetrust` and programmatic API `auditProject`.
- **CI/CD Quality Gate**: GitHub Actions workflows for automated PR review comments and merge blocking on critical vulnerabilities.
