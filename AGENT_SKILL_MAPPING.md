# MA TRẬN ÁNH XẠ TÁC TỬ & KỸ NĂNG (AGENT TO SKILL MAPPING)
## Nền tảng Thẩm định Mã nguồn: CodeTrust AI (VibeAuditor)

---

## 1. MÔ HÌNH QUẢN TRỊ TRÁCH NHIỆM (RESPONSIBILITY DOMAINS)

Trong CodeTrust AI, mỗi Tác tử (Agent) là một "chuyên gia nghiệp vụ" độc lập, chịu trách nhiệm quản lý và thực thi một tập hợp các Skills thuộc lĩnh vực chuyên môn của mình:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   AUDIT ORCHESTRATOR (agent-orchestrator)                   │
│                                                                             │
│  ├── int.agent-task-router               ├── opt.pr-diff-auditor            │
│  ├── int.sandbox-execution-guard         ├── prem.soc2-iso27001-readiness   │
│  ├── prem.cloud-finops-auditor           └── prem.auto-pr-patch-generator   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   REPO ANALYST   │          │SECURITY INSPECTOR│          │  SEMANTIC LOGIC  │
│      AGENT       │          │      AGENT       │          │      AGENT       │
│(agent-repo-analys│          │(agent-sec-inspect│          │(agent-sem-logic) │
│                  │          │                  │          │                  │
│├──core.repo-recon│          │├──core.static-sec│          │├──core.biz-risk  │
│├──opt.api-contra │          │├──opt.dep-cve-hun│          │├──core.interact-u│
│├──opt.code-mainta│          │├──opt.env-config │          │├──opt.secret-rota│
│├──opt.test-cover │          │├──prem.owasp-top1│          │├──int.token-econ │
│└──prem.license-ip│          │└──prem.db-migrati│          │└──int.context-mem│
└──────────────────┘          └──────────────────┘          └──────────────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │      QUALITY & UAT AGENT       │
                       │     (agent-quality-uat)        │
                       │                                │
                       │ ├── core.trust-scorecard       │
                       │ ├── prem.playwright-sandbox    │
                       │ └── prem.executive-pdf-deck    │
                       └────────────────────────────────┘
```

---

## 2. MA TRẬN PHÂN QUYỀN VÀ CÔNG CỤ (AGENT-SKILL-TOOL MATRIX)

| Tác Tử (Agent) | Vai Trò & Chuyên Môn | Kỹ Năng Đảm Nhiệm (Assigned Skills) | Công Cụ MCP Cần Dùng | Quyền Hạn Bắt Buộc |
|---|---|---|---|---|
| **`agent-orchestrator`** | Tổng chỉ huy, phân rã công việc, bảo vệ ranh giới máy chủ, tối ưu chi phí hạ tầng. | • `int.agent-task-router`<br/>• `int.sandbox-execution-guard`<br/>• `opt.pr-diff-auditor`<br/>• `prem.soc2-iso27001-readiness`<br/>• `prem.auto-pr-patch-generator`<br/>• `prem.cloud-finops-auditor` | • `codetrust_audit`<br/>• `codetrust_scan_security`<br/>• `codetrust_inspect_project` | `['READ', 'ANALYZE', 'EXECUTE', 'REPORT']` |
| **`agent-repo-analyst`** | Trinh sát mã nguồn, nhận diện framework, kiểm tra cấu trúc API, bản quyền và nợ kỹ thuật. | • `core.repo-recon`<br/>• `opt.api-contract-validator`<br/>• `opt.code-maintainability-radar`<br/>• `opt.test-coverage-gap-analyst`<br/>• `prem.license-ip-compliance` | • `codetrust_inspect_project` | `['READ', 'ANALYZE']` |
| **`agent-security-inspector`** | Quét lỗ hổng tất định, bắt lộ secret keys, SQLi, kiểm toán tiêu chuẩn OWASP và an toàn Database. | • `core.static-sec-scan`<br/>• `opt.dep-cve-hunter`<br/>• `opt.env-config-auditor`<br/>• `prem.owasp-top10-certifier`<br/>• `prem.db-migration-safety` | • `codetrust_scan_security`<br/>• `codetrust_audit` | `['READ', 'ANALYZE']` |
| **`agent-semantic-logic`** | Dịch thuật kỹ thuật sang ngôn ngữ kinh doanh, sinh kịch bản UAT, tối ưu KV Cache DeepSeek. | • `core.biz-risk-translator`<br/>• `core.interactive-uat`<br/>• `opt.secret-rotation-advisor`<br/>• `int.token-economics-guardian`<br/>• `int.context-memory-compactor` | • `codetrust_generate_uat`<br/>*(DeepSeek Chat API REST)* | `['ANALYZE', 'REPORT']` |
| **`agent-quality-uat`** | Tính toán Trust Scorecard minh bạch, kiểm thử visual sandbox Playwright, xuất hồ sơ PDF. | • `core.trust-scorecard`<br/>• `prem.playwright-visual-sandbox`<br/>• `prem.executive-pdf-deck-generator` | • `codetrust_audit`<br/>• `codetrust_inspect_project` | `['ANALYZE', 'REPORT']` |

---

## 3. LUỒNG TƯƠNG TÁC THỜI GIAN THỰC (INTER-AGENT COLLABORATION FLOW)

Khi người dùng kích hoạt thẩm định toàn diện:

```text
[Người Dùng] ──(Gửi yêu cầu kiểm toán)──► [AuditOrchestrator]
                                                    │
    ┌───────────────────────────────────────────────┴───────────────────────────────────────────────┐
    ▼                                                                                               ▼
1. Kích hoạt [RepoAnalystAgent]                                                 2. Kích hoạt [SecurityInspectorAgent]
   - Thực thi: core.repo-recon                                                     - Chờ danh sách tệp từ RepoAnalyst
   - Xuất ra: ProjectInfo (Framework, Port, LoC)                                   - Thực thi: core.static-sec-scan
                                                                                   - Xuất ra: 11 Rules Findings (Masked Secrets)
    │                                                                                               │
    └───────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                    │
                                                    ▼
3. Kích hoạt [SemanticLogicAgent]
   - Tiếp nhận Findings & Code Snippets sạch
   - Áp dụng: int.token-economics-guardian (Cấu hình KV Cache)
   - Thực thi: core.biz-risk-translator & core.interactive-uat
   - Xuất ra: ExecutiveSummary (Ngôn ngữ kinh doanh) & UATChecklist (3-5 bước)
                                                    │
                                                    ▼
4. Kích hoạt [QualityUATAgent]
   - Tiếp nhận toàn bộ dữ liệu từ 3 bước trên
   - Thực thi: core.trust-scorecard (Trọng số 40% Bảo mật - 35% Logic - 25% Ổn định)
   - Xuất ra: Bảng điểm 0-100 và Xếp loại chữ A-F
                                                    │
                                                    ▼
5. [AuditOrchestrator] Tổng hợp Báo cáo Thẩm định Thống nhất (Single-file HTML & JSON)
```

---

## 4. XỬ LÝ XUNG ĐỘT KẾT QUẢ (CONFLICT RESOLUTION PROTOCOL)

Trong trường hợp các Tác tử đưa ra đánh giá mâu thuẫn:
- **Tình huống**: `SemanticLogicAgent` đánh giá rủi ro là "Trung bình" do chức năng kinh doanh đơn giản, nhưng `SecurityInspectorAgent` phát hiện 01 lỗ hổng `CRITICAL` (Khóa OpenAI bị lộ).
- **Quy tắc giải quyết xung đột (Conflict Resolution Rule)**:
  > **Bảo Mật Tuyệt Đối (Security Supremacy)**: Bất kỳ lỗ hổng `CRITICAL` nào phát hiện ở tầng tĩnh đều có quyền phủ quyết (Veto Power). Bảng điểm tổng thể lập tức bị giới hạn không vượt quá **50/100**, xếp loại bị ép về **F**, và kết luận chung (`verdict`) chuyển thành **`REJECTED`**.

---

## 5. CƠ CHẾ CÁCH LY THẤT BẠI (FAULT ISOLATION & DEGRADATION)

- Nếu `RepoAnalystAgent` gặp lỗi: Dừng quy trình lập tức vì thiếu dữ liệu nền tảng.
- Nếu `SecurityInspectorAgent` gặp lỗi: Báo cáo dừng và cảnh báo lỗi bảo mật không thể xác minh.
- Nếu `SemanticLogicAgent` gặp sự cố (mất mạng, cạn quota DeepSeek):
  - Kích hoạt **Heuristic Fallback Engine** trong vòng <1ms.
  - Vẫn xuất báo cáo đầy đủ dựa trên phân tích tĩnh tất định, ghi chú rõ ràng trạng thái hoạt động ngoại tuyến để người dùng yên tâm.
