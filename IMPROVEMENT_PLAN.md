# 🚀 KẾ HOẠCH NÂNG CẤP & TỐI ƯU HÓA SẢN PHẨM (IMPROVEMENT PLAN)
## CodeTrust AI • Lộ Trình Phát Triển Sản Phẩm B2B Production

---

## 1. PHÂN CẤP ƯU TIÊN HÀNH ĐỘNG (PRIORITY MATRIX)

### 🔴 P0 — Nguy Cấp & Tính Toàn Vẹn Hệ Thống (ĐÃ HOÀN TẤT)
- [x] **Vá lỗ hổng Path Traversal**: Cài đặt `isSafeRelativePath` trong `server/index.ts` ngăn chặn ghi file độc hại ra ngoài thư mục tạm.
- [x] **Vá lỗ hổng Constructor Parameter Mismatch**: Cho phép `DeepSeekAuditor` nhận `apiKey` và `baseUrl` tùy biến phục vụ kiểm thử và multi-tenant.
- [x] **Chống rò rỉ bộ nhớ (Memory Leak Prevention)**: Triển khai LRU/TTL bounded cache trong `server/index.ts` giới hạn tối đa 50 bản ghi.
- [x] **Cưỡng chế Zod Schema trên LLM**: Bổ sung `response_format: { type: 'json_object' }` và validate kết quả AI bằng `AiResponseSchema.safeParse`.

### 🟡 P1 — Kiến Trúc Tác Tử & Kết Nối Nền Tảng (ĐÃ HOÀN TẤT)
- [x] **Hệ thống Multi-Agent Phân tầng**:
  - Triển khai `AuditOrchestrator` làm đầu não giám sát.
  - Tách bạch 4 sub-agents: `RepoAnalystAgent`, `SecurityInspectorAgent`, `SemanticLogicAgent`, `QualityUATAgent`.
  - Tích hợp theo dõi nhật ký tác vụ (`AgentTask`) và đo lường thời gian thực thi `durationMs`.
- [x] **Cổng kết nối Model Context Protocol (MCP Gateway)**:
  - Triển khai `McpServer` chuẩn JSON-RPC 2.0 trên stdio.
  - Cung cấp 4 công cụ MCP chuẩn: `codetrust_audit`, `codetrust_scan_security`, `codetrust_inspect_project`, `codetrust_generate_uat`.
  - Bổ sung lệnh CLI `pnpm run mcp`.
- [x] **Minh bạch hóa Chỉ số Ổn định (`visualStability`)**:
  - Loại bỏ hoàn toàn công thức hardcode.
  - Tính toán dựa trên mức độ hoàn thiện cấu trúc thực tế của dự án.

### 🟢 P2 — Trải Nghiệm Người Dùng & Quan Sát (TRONG KẾ HOẠCH)
- [ ] **Mở rộng bộ quy tắc bảo mật tĩnh**: Bổ sung kiểm tra rò rỉ JWT secret tĩnh, cấu hình CORS wildcard nguy hiểm (`*`), và CSRF disabled.
- [ ] **Structured Logging & Tracing**: Tích hợp Winston hoặc Pino để xuất log JSON có cấu trúc phục vụ gửi lên Datadog / Grafana Loki.
- [ ] **Giám sát hạn mức Token (Token Economics)**: Theo dõi số lượng token DeepSeek tiêu thụ cho mỗi lượt audit và cảnh báo khi chi phí vượt ngưỡng.

### 🔵 P3 — Mở Rộng Quy Mô Lớn (FUTURE ROADMAP)
- [ ] **MicroVM Sandbox Runtime**: Đóng gói các app nộp lên vào container E2B hoặc gVisor cách ly tuyệt đối để chạy `npm install && npm run dev` an toàn.
- [ ] **Visual Playwright Storyboard**: Tự động chụp ảnh Before/After và tạo timeline kiểm chứng API HTTP 200 thật.
- [ ] **Distributed Job Queue**: Chuyển hàng đợi thẩm định sang BullMQ + Redis khi tải người dùng đạt >10,000 lượt/ngày.

---

## 2. KẾ HOẠCH BẢO VỆ CHỐNG HỒI QUY (REGRESSION DEFENSE)

Mọi thay đổi trong tương lai bắt buộc phải tuân thủ quy trình:
1. `pnpm run build`: Không được có bất kỳ lỗi TypeScript nào.
2. `pnpm test`: Tất cả 15+ test cases phải đạt 100% xanh.
3. Không làm thay đổi giao diện REST API hiện tại để bảo đảm Web UI và CLI hoạt động trơn tru.
