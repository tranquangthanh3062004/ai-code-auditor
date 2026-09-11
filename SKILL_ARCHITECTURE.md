# ĐẶC TẢ KIẾN TRÚC SKILL HỆ THỐNG (SKILL ARCHITECTURE)
## Nền tảng Thẩm định Mã nguồn: CodeTrust AI (VibeAuditor)

---

## 1. TỔNG QUAN VÀ NGUYÊN TẮC THIẾT KẾ CỐT LÕI

Trong hệ thống CodeTrust AI, **Skill (Kỹ năng)** không phải là một hàm phụ trợ hay một lệnh đơn lẻ. 

> **Định nghĩa**: **Skill** là một **Năng Lực Nghiệp Vụ Hoàn Chỉnh (Complete Business/User Capability)** được đóng gói theo chuẩn Module hóa (Modular Seam). Mỗi Skill kết hợp sự suy luận của một hoặc nhiều Tác tử AI (Multi-Agent), điều phối các công cụ nguyên tử (MCP Tools), thực thi trên dữ liệu dự án và mang lại một giá trị đo lường được cho người dùng.

### 1.1. Nguyên Tắc Thiết Kế Bất Biến (Guiding Principles)
1. **Một Mục Đích Duy Nhất (Single Responsibility)**: Mỗi skill giải quyết trọn vẹn một bài toán nghiệp vụ cụ thể. Không tồn tại "Super Skill làm tất cả mọi thứ".
2. **Bật/Tắt Độc Lập (Independent Toggleability)**: Trừ các Core Skills bắt buộc, mọi Skill đều có thể được bật, tắt, hoặc nâng cấp mà không làm ảnh hưởng tới các thành phần khác.
3. **Phụ Thuộc Rõ Ràng (Explicit Dependency Graph)**: Mọi sự phụ thuộc giữa các Skills đều được khai báo tường minh qua SemVer. Hệ thống tự động kiểm tra và ngăn chặn vòng lặp phụ thuộc (Zero Circular Dependencies).
4. **Cô Lập Đặc Quyền (Least Privilege Capability Seams)**: Skill chỉ được cấp đúng các quyền (`READ`, `ANALYZE`, `EXECUTE`, `REPORT`) và danh sách MCP Tools tối thiểu cần thiết để hoàn thành nhiệm vụ.
5. **Zero-Hallucination ở Tầng Sự Thật**: Các kỹ năng phân tích bảo mật bắt buộc phải đặt trên nền tảng của bộ quy tắc tĩnh tất định trước khi chuyển sang suy luận ngữ nghĩa bằng LLM.

---

## 2. MÔ HÌNH KIẾN TRÚC PHÂN TẦNG TỔNG THỂ (FULL ARCHITECTURAL TOPOLOGY)

Kiến trúc liên kết xuyên suốt từ Khách hàng, Cửa hàng kỹ năng đến Tài nguyên hệ thống:

```
                         KHÁCH HÀNG / NGƯỜI DÙNG
                                   │
                                   ▼
                         ỨNG DỤNG CODETRUST AI
                        (Web UI / CLI / REST API)
                                   │
                                   ▼
                         SKILL STORE & CỬA HÀNG
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
          ENTITLEMENT ENGINE                SKILL REGISTRY
       (Quản lý gói & bản quyền)        (Quản lý trạng thái & deps)
                   │                               │
                   └───────────────┬───────────────┘
                                   ▼
                          AUDIT ORCHESTRATOR
                        (Supervisor Controller)
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
      REPO ANALYST AGENT   SECURITY INSPECTOR    SEMANTIC LOGIC AGENT
      (agent-repo-analyst) (agent-sec-inspector) (agent-semantic-logic)
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                                   ▼
                         ACTIVE BUSINESS SKILLS
               (24 Skills: Core / Optional / Premium)
                                   │
                                   ▼
                            MCP TOOL GATEWAY
                    (Model Context Protocol Stdio)
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
     codetrust_inspect     codetrust_scan_sec    codetrust_generate_uat
             │                     │                     │
             ▼                     ▼                     ▼
       HỆ THỐNG FILE         CƠ SỞ DỮ LIỆU         DEEPSEEK API / NVD
```

---

## 3. PHÂN BIỆT RẠCH RÒI 4 TẦNG KHÁI NIỆM

Bảng phân định trách nhiệm để tránh nhầm lẫn giữa Skill và Tool:

| Tầng Kiến Trúc | Khái Niệm | Trách Nhiệm | Ví Dụ Cụ Thể |
|---|---|---|---|
| **1. Business Skill** | Năng lực Nghiệp vụ | Cung cấp giá trị trọn vẹn cho người dùng; có thể đóng gói bán hoặc cấp phép. | `core.biz-risk-translator`<br/>`prem.owasp-top10-certifier` |
| **2. Multi-Agent** | Bộ Não Suy Luận | Đóng vai trò chuyên gia, xử lý ngữ nghĩa, phân rã công việc, ra quyết định. | `RepoAnalystAgent`<br/>`SecurityInspectorAgent` |
| **3. MCP Tool** | Công Cụ Kỹ Thuật | Lệnh nguyên tử, phi trạng thái, thực thi tác vụ I/O cụ thể. | `codetrust_scan_security`<br/>`codetrust_inspect_project` |
| **4. Core System** | Hạ Tầng Nền Tảng | Runtime, HTTP Server, Express, In-memory Cache, Zod Validation. | `server/index.ts`<br/>`src/reporter/html-generator.ts` |

---

## 4. VÒNG ĐỜI CỦA MỘT SKILL (SKILL RUNTIME LIFECYCLE)

Mỗi Skill khi hoạt động trong CodeTrust AI trải qua 6 trạng thái nghiêm ngặt:

```
[ UNLICENSED / DISCOVERED ]
            │
            ▼ (Khách hàng mua / kích hoạt qua Skill Store)
     [ LICENSED ]
            │
            ▼ (Admin / Người dùng bấm Bật và kiểm tra Dependency)
      [ ENABLED ]
            │
            ▼ (Orchestrator lập lịch và tạo AgentTask)
     [ EXECUTING ] ──(Lỗi ngoại lệ / Quá tải)──► [ FAILED & FALLBACK ]
            │
            ▼ (Xác thực đầu ra bằng Zod Schema & ghi nhận Telemetry)
     [ COMPLETED ]
```

### Chi tiết từng giai đoạn:
1. **Discovered (Khám phá)**: Skill được định nghĩa trong `src/skills/catalog-data.ts` và hiển thị trên Skill Store.
2. **Licensed (Được cấp phép)**: Hệ thống `Entitlement` xác nhận người dùng thuộc gói thuê bao (Pro, Business, Enterprise) hoặc đã mua bản quyền riêng.
3. **Enabled (Kích hoạt)**: `SkillRegistry` kiểm tra toàn bộ các phụ thuộc bắt buộc (`dependencies`) đã hoạt động và đánh dấu `enabled = true`.
4. **Executing (Đang thực thi)**: Tác tử phụ trách tiếp nhận ngữ cảnh, gọi các công cụ MCP Tools cần thiết dưới sự giám sát thời gian của `Supervisor`.
5. **Telemetry & Cost Accounting**: Hệ thống ghi nhận số lượng token sử dụng, số giây thực thi và tăng biến đếm `executionCount`.
6. **Completed / Fallback**: Trả về dữ liệu đã được xác thực kiểu qua Zod; nếu xảy ra sự cố mạng, tự động chuyển đổi sang Heuristic Fallback.

---

## 5. CƠ CHẾ CAPABILITY SEAM (PLUGIN ARCHITECTURE)

Để đảm bảo hệ thống có thể mở rộng tới hàng trăm kỹ năng mà không làm phình to file trung tâm, CodeTrust AI áp dụng kiến trúc **Seam**:

```typescript
// Interface trừu tượng định nghĩa khả năng thực thi của Skill
export interface ISkillExecutor<TInput, TOutput> {
  readonly skillId: string;
  readonly metadata: SkillDefinition;
  execute(input: TInput, context: SkillExecutionContext): Promise<SkillExecutionResult<TOutput>>;
}
```

- **Mọi Skill là một Seam độc lập**: Tác tử chỉ giao tiếp qua Input/Output schema chuẩn hóa.
- **Dễ dàng Mocking trong Unit Test**: Có thể thay thế bất kỳ Skill phức tạp nào bằng Mock Provider mà không cần chạy toàn bộ hệ thống.
- **Cách ly rủi ro**: Khi một Skill bên thứ ba gặp lỗi crash, màng ngăn `try/catch` tại Orchestrator sẽ cô lập lỗi và kích hoạt fallback mà không làm sập tiến trình máy chủ.

---

## 6. ĐIỀU PHỐI SKILL TRONG ORCHESTRATOR (ORCHESTRATION PIPELINE)

Khi nhận được yêu cầu thẩm định từ người dùng, `AuditOrchestrator` thực hiện luồng điều phối thông minh:

```
1. Khám phá Context Dự Án (Target Path, Files, Framework)
         │
         ▼
2. Truy vấn SkillRegistry: Lấy danh sách các Skills đang ENABLED
         │
         ▼
3. Sắp xếp thứ tự thực thi theo Topological Sort (SKILL_DEPENDENCIES)
         │
         ▼
4. Phân bổ tuần tự / song song cho các Sub-Agents chuyên trách
         │
         ├──► Nhóm Tĩnh: core.repo-recon -> core.static-sec-scan (Không tốn token)
         │
         ├──► Nhóm Ngữ Nghĩa: core.biz-risk-translator -> core.interactive-uat (DeepSeek AI)
         │
         └──► Nhóm Đánh Giá: core.trust-scorecard (Tổng hợp điểm và xếp hạng)
         │
         ▼
5. Tổng hợp Báo Cáo Thẩm Định & Ghi Nhận Telemetry
```

---

## 7. KIỂM SOÁT CHI PHÍ & TỐI ƯU TOKEN (TOKEN ECONOMICS)

Đối với các Skills có sử dụng mô hình ngôn ngữ lớn (DeepSeek AI), CodeTrust AI triển khai cơ chế kiểm soát chi phí 3 tầng:

1. **Prompt Caching Cố Định (KV Cache Read)**:
   - Phần System Prompt chứa định nghĩa vai trò, quy tắc an toàn và schema Zod được giữ nguyên 100% không đổi ở đầu request.
   - Kích hoạt cơ chế Cache Hit của DeepSeek, giảm chi phí đọc prompt tới **90%** (từ $0.14/1M token xuống $0.014/1M token).
2. **Context Pruning (Rút gọn ngữ cảnh)**:
   - Không bao giờ gửi toàn bộ file hàng nghìn dòng. Skill `int.context-memory-compactor` chỉ trích xuất các hàm chứa lỗi khả nghi được phát hiện từ bước quét tĩnh.
3. **Budget Guard & Circuit Breaker**:
   - Mỗi phiên thẩm định bị giới hạn mức trần tối đa **15.000 tokens**. Nếu vượt quá hạn mức, hệ thống lập tức ngắt gọi API và chuyển sang Heuristic Engine để bảo vệ ngân sách của khách hàng.
