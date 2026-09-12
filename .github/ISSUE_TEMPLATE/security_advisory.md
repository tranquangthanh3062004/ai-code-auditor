---
name: Security Vulnerability Advisory
about: Privately report a security issue or vulnerability in CodeTrust AI
title: '[SECURITY] <Brief vulnerability summary>'
labels: ['security', 'triage']
assignees: ['tranquangthanh3062004']
---

> ⚠️ **IMPORTANT**: If this vulnerability exposes active production API keys, remote code execution, or critical data leakage, please DO NOT submit a public issue. Email us directly at `tranquangthanh3062004@gmail.com` for coordinated disclosure under our [Security Policy](../../SECURITY.md).

### Vulnerability Summary
A clear and concise description of the security issue.

### Component Affected
- [ ] Core Engine (`src/engine/`)
- [ ] Deterministic Scanner (`src/engine/deterministic-rules.ts`)
- [ ] Multi-Agent Orchestrator (`src/agents/`)
- [ ] Model Context Protocol (MCP) Server (`src/mcp/`)
- [ ] Skill Registry & Catalog (`src/skills/`)
- [ ] Web UI & Express API Server (`server/`, `web/`)
- [ ] CLI Tool (`src/cli/`)
- [ ] Other:

### Steps to Reproduce
Steps to reproduce the vulnerability:
1. Run command '...' or upload project '...'
2. Trigger scanner or MCP tool '...'
3. Inspect output or network traffic
4. See unexpected or insecure behavior

### Proof of Concept (PoC)
```bash
# Minimal command, script, or payload demonstrating the issue
```

### Expected Safe Behavior
A clear and concise description of what should happen securely.

### Proposed Fix or Mitigation
If known, describe the recommended patch or defensive sanitization.

### Environment & Version
- CodeTrust AI Version: [e.g., 0.2.0]
- Node.js Version: [e.g., 20.12.0, 22.5.0]
- OS: [e.g., Windows 11, Ubuntu 24.04, macOS Sonoma]
