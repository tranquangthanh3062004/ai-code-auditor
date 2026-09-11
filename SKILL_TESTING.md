# CHIẾN LƯỢC KIỂM THỬ VÀ KIỂM SOÁT CHẤT LƯỢNG KỸ NĂNG (SKILL TESTING & QC SPECIFICATION)
## Nền tảng: CodeTrust AI (VibeAuditor) • Test Harness & Verification Protocol

---

## 1. QUY TRÌNH KIỂM SOÁT CHẤT LƯỢNG TRƯỚC KHI ĐƯA LÊN STORE (QUALITY GATE PIPELINE)

Không một Skill nào được phép xuất bản lên Skill Store nếu chưa vượt qua toàn bộ 8 cổng kiểm soát chất lượng tự động:

```
[ NHÀ PHÁT TRIỂN / AGENT ENGINEER ]
                 │
                 ▼
     [ 1. Unit & Schema Test ] (100% Type-safe qua TypeScript & Zod)
                 │
                 ▼
     [ 2. Security Scan ] (Kiểm tra không chứa mã độc, không escape sandbox)
                 │
                 ▼
     [ 3. Dependency & Circular Check ] (Thuật toán Topological Sort không chu trình)
                 │
                 ▼
     [ 4. Performance & Token Benchmark ] (<3s phản hồi, <15.000 tokens)
                 │
                 ▼
     [ 5. Offline Fallback Verification ] (Chống chịu 100% khi mất mạng AI)
                 │
                 ▼
     [ 6. AI Hallucination Evaluation ] (Đo lường tính chính xác của lý luận)
                 │
                 ▼
     [ 7. Peer Review & Security Sign-off ] (Phê duyệt của Senior Security Architect)
                 │
                 ▼
     [ XUẤT BẢN LÊN SKILL STORE (PUBLISHED) ]
```

---

## 2. MA TRẬN 8 TẦNG KIỂM THỬ BẮT BUỘC (8-TIER TESTING MATRIX)

| Tầng Kiểm Thử | Mục Tiêu Thẩm Định | Phương Pháp Thực Thi | Tiêu Chí Vượt Qua (Pass Criteria) |
|---|---|---|---|
| **1. Unit Test** | Logic nội tại của từng hàm, regex rules, scorecard weights. | Node.js Test Runner (`tests/audit.test.ts`) | 100% test cases pass, 0 warning. |
| **2. Integration Test** | Giao tiếp nhịp nhàng giữa Supervisor, Sub-Agents, Skills và MCP Tools. | Thực thi `auditProject()` end-to-end trên mẫu vulnerable và secure. | Báo cáo sinh ra đầy đủ HTML và JSON đúng định dạng. |
| **3. Permission Test** | Kiểm soát bản quyền và chống leo thang đặc quyền. | Gọi Skill Premium khi chưa có bản quyền hoặc khi dùng tài khoản Free. | Bị từ chối với lý do rõ ràng, không làm crash server. |
| **4. Failure & Resilience** | Xử lý ngoại lệ khi DeepSeek trả lỗi 402/500 hoặc mất mạng. | Giả lập ngắt kết nối mạng hoặc key rỗng trong test case 7. | Tự động kích hoạt Heuristic Fallback trong <1ms. |
| **5. Security Test** | Chống tấn công Path Traversal, chèn mã độc vào tên file. | Gửi payload `../../etc/passwd` vào API endpoint (Test 14). | Hàm `isSafeRelativePath` chặn đứng 100% các payload độc hại. |
| **6. Circular Dependency** | Đảm bảo đồ thị phụ thuộc giữa 24 Skills không bị vòng lặp vô hạn. | Chạy thuật toán DFS phát hiện chu trình (Test 17). | `hasCycle === false`. |
| **7. AI Evaluation** | Đánh giá tính chân thực, chống ảo giác của kịch bản UAT và rủi ro. | Xác thực đầu ra AI bằng Zod Schema nghiêm ngặt. | `safeParse()` thành công 100%, không sinh thuộc tính lạ. |
| **8. Performance Benchmark** | Tốc độ quét và mức tiêu thụ RAM của máy chủ. | Quét dự án >1.000 dòng code trên môi trường CI. | Hoàn thành trong <2.500ms, RAM không tăng đột biến. |

---

## 3. LỆNH THỰC THI KIỂM THỬ TRONG HỆ THỐNG

Các lệnh kiểm thử chuẩn mực được tích hợp sẵn trong `package.json`:

```bash
# 1. Chạy toàn bộ bộ kiểm thử tự động (19 test suites hiện tại)
pnpm test

# 2. Biên dịch kiểm tra lỗi kiểu dữ liệu TypeScript
pnpm run build

# 3. Kiểm thử riêng biệt giao thức MCP JSON-RPC
tsx src/mcp/bin.ts

# 4. Chạy kiểm thử tích hợp trên CI/CD GitHub Actions
# Được kích hoạt tự động trên mọi Pull Request (.github/workflows/pr-audit.yml)
```
