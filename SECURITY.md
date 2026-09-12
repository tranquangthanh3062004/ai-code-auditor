# Security Policy & Vulnerability Disclosure

We take the security and privacy of **CodeTrust AI (VibeAuditor)** and the codebases it audits extremely seriously. As an automated verification layer protecting non-technical builders and enterprise engineering teams, maintaining trust is our top priority.

---

## Supported Versions

We actively maintain and provide security patches for the following versions:

| Version | Supported | Security Patch SLA |
| :--- | :---: | :--- |
| **0.2.x** (Current) | :white_check_mark: | Critical: 24h &bull; High: 72h |
| **0.1.x** (Legacy) | :white_check_mark: | Critical fixes only (Best effort) |
| < 0.1.0 | :x: | Unsupported |

---

## Reporting a Vulnerability

If you discover a security vulnerability, flaw in our deterministic AST scanners, path traversal leak, or unauthorized privilege escalation within CodeTrust AI:

1. **Do NOT open a public GitHub issue**. Disclosing vulnerabilities publicly puts other users and organizations at immediate risk.
2. Send an email with full reproduction details to our security team:
   - 📧 **`tranquangthanh3062004@gmail.com`**
3. Include the following details in your report:
   - Impact assessment (e.g., Remote Code Execution, Path Traversal, Sensitive Token Exposure).
   - Minimal reproduction steps or sample project (`package.json`, source files).
   - Expected behavior vs. actual behavior.
   - Any suggested remediations or patches.

---

## Our Response Commitment & SLA

When you submit a private security vulnerability:
- **Initial Acknowledgment**: Within **24 hours** of receipt.
- **Triage & Severity Confirmation**: Within **48 hours**.
- **Fix & Patch Deployment**: Within **72 hours** for `CRITICAL` issues; within **7 days** for `HIGH` issues.
- **Public Disclosure**: Coordinated after the fix has been tagged, published to npm, and deployed.

---

## Safe Harbor Policy

We consider security research conducted in good faith to be authorized and protected under this policy. We pledge that:
- We will not initiate or pursue legal action against security researchers who report vulnerabilities following these guidelines.
- We will acknowledge and credit your responsible disclosure in our [CHANGELOG.md](CHANGELOG.md) and security release notes.

Thank you for helping keep the open-source software ecosystem safe!
