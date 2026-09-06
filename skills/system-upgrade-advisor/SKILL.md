---
name: system-upgrade-advisor
description: Evaluate, audit, and provide actionable upgrade and refactoring roadmaps for an existing system or codebase. Guides the agent to systematically analyze architecture, security, performance, test coverage, and technical debt to elevate overall system quality.
---

# System Upgrade & Evolution Advisor

Use this skill when evaluating an existing codebase or system to provide structured improvement guidance, architectural hardening, and quality upgrades. This skill ensures the agent does not merely suggest surface-level tweaks, but systematically elevates the entire system's reliability, security, maintainability, and commercial readiness.

---

## 1. The 5-Dimension System Evaluation Framework

When an agent inspects a codebase, it must evaluate the system across 5 fundamental dimensions:

| Chiều Đánh Giá | Trọng Tâm Đánh Giá | Dấu Hiệu Kém (Red Flags) | Mục Tiêu Chuẩn Hóa (North Star) |
|---|---|---|---|
| **1. Kiến Trúc (Architecture)** | Tính module, ranh giới rõ ràng, mức độ phụ thuộc. | File "god-object" (>800 dòng), coupling chặt, logic trộn lẫn view. | Clean Architecture, Microkernel / Plugin Seams, độc lập module. |
| **2. Bảo Mật (Security)** | Dữ liệu đầu vào, secrets, quyền thực thi, sandbox. | Hardcoded key, SQLi, eval(), thiếu validation, chạy code lạ trên host. | Zero-trust input, Zod validation, Secrets via .env, MicroVM sandbox. |
| **3. Độ Tin Cậy (Reliability)** | Xử lý lỗi, fallback, idempotency, lifecycle. | Try/catch nuốt lỗi (empty catch), crash khi mất mạng, memory leak. | Graceful degradation, Heuristic fallback, Safe disposal/teardown. |
| **4. Khả Năng Quan Sát (Observability)** | Logging, audit trail, tái hiện lỗi. | Console.log lung tung, không có nhật ký kiểm toán, không trace được lỗi. | Structured logging, Event-sourced session log, Metrics dashboard. |
| **5. Hiệu Năng & Chi Phí (Efficiency)** | Tối ưu token LLM, caching, truy vấn database. | Gọi LLM trùng lặp, prompt dài không cache, N+1 query, loop I/O. | Prompt Caching (DeepSeek KV cache), Indexed search, Batching. |

---

## 2. Quy Trình Chẩn Đoán 4 Bước Dành Cho Agent (The Diagnostic Protocol)

Khi người dùng yêu cầu đánh giá hoặc nâng cấp hệ thống, Agent thực hiện theo 4 bước tuần tự:

### Bước 1: Trinh sát Tổng thể (Reconnaissance)
1. Đọc tệp cấu hình gốc (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`).
2. Xác định:
   - Framework & Runtime (`Next.js`, `Vite`, `Express`, `FastAPI`...).
   - Kiến trúc hiện tại: Monolith, Microservices, Plugin-based hay Ad-hoc script.
   - Thư mục nguồn chính (`src/`, `packages/`, `apps/`).
3. Kiểm tra xem dự án đã có bộ test tự động (`vitest`, `jest`, `pytest`) hay chưa.

### Bước 2: Quét Lỗ Hổng & Điểm Nghẽn Kỹ Thuật (Triage & Bottleneck Identification)
1. **Quét bảo mật tĩnh**: Tìm kiếm các mẫu nhạy cảm (`sk-`, `password`, `eval`, `innerHTML`, `query(\`SELECT...\`)`).
2. **Kiểm tra ranh giới dữ liệu**: Tìm các điểm nhận dữ liệu người dùng/mạng mà chưa có schema xác thực (như Zod/Pydantic).
3. **Kiểm tra điểm chịu tải / Chi phí**: Xác định các luồng gọi API bên ngoài (LLM, Stripe) có cơ chế retry/fallback và timeout hay không.

### Bước 3: Lập Kế Hoạch Nâng Cấp Phân Tầng (Tiered Roadmap)
Phân loại các cải tiến thành 3 tầng ưu tiên rõ ràng:
- **P0 - Nguy cấp (Blockers)**: Các lỗ hổng bảo mật, lỗi crash hệ thống, rò rỉ dữ liệu hoặc memory leak cần sửa ngay trong 24h.
- **P1 - Nâng cấp Kiến trúc (Structural Upgrades)**: Tách lớp dịch vụ, bổ sung schema validation, chuẩn hóa tầng xử lý lỗi và fallback.
- **P2 - Tối ưu Hóa & Trải nghiệm (Refinements)**: Caching giảm chi phí token/network, cải thiện giao diện báo cáo, tăng độ bao phủ test suite lên >80%.

### Bước 4: Thực Thi Nâng Cấp An Toàn (Safe Execution via TDD)
- **Quy tắc bất biến**: *"Không bao giờ đập đi xây lại khi chưa có mạng lưới bảo vệ (Safety Net)"*.
- Luôn viết hoặc đảm bảo test case hiện tại chạy xanh trước khi refactor.
- Tiến hành từng thay đổi nhỏ (Micro-commits), kiểm tra hồi quy sau mỗi bước.

---

## 3. Các Công Thức Nâng Cấp Điển Hình (Battle-Tested Upgrade Recipes)

### Công thức 1: Chuyển đổi từ "Ad-hoc Scripts" sang "Plugin Architecture" (Kiến trúc Seam)
- **Tình trạng cũ**: Mọi logic gọi shell, đọc file, gọi LLM đều nằm chung trong 1 file lớn. Khó test và không thể thay thế.
- **Cách nâng cấp**: Áp dụng mô hình **Capability Seam** (như DeepSeek Harness / Cordis):
  1. *Service Definition*: Định nghĩa interface trừu tượng (`interface ShellService { run(cmd): Promise<Result> }`).
  2. *Service Provider*: Tạo bản triển khai cụ thể (`LocalShellProvider` hoặc `CloudSandboxProvider`).
  3. *Consumer*: Các tool hoặc tính năng chỉ gọi qua interface, hoàn toàn tách rời môi trường thực thi.

### Công thức 2: Loại bỏ Ảo Giác Bằng "Mô Hình Hybrid (Static + Semantic)"
- **Tình trạng cũ**: Dùng LLM làm tất cả mọi việc (kể cả quét lỗi cú pháp hay bảo mật), dẫn đến tỷ lệ ảo giác và false positive cao.
- **Cách nâng cấp**:
  - Đưa các công cụ phân tích tĩnh tất định (Deterministic Regex, AST, Linters) lên trước để bắt 100% lỗi cứng.
  - Chỉ gửi các đoạn mã nghi ngờ hoặc cần suy luận nghiệp vụ sang LLM (DeepSeek R1/V3) kèm Zod Schema nghiêm ngặt.

### Công thức 3: Tối Ưu Hóa Chi Phí Token LLM (Token Economics)
- **Tình trạng cũ**: Mỗi lần gọi AI đều gửi toàn bộ tệp hoặc toàn bộ repository, tốn kém chi phí và dễ tràn context window.
- **Cách nâng cấp**:
  1. Tận dụng **Prompt Caching**: Giữ cố định System Prompt và các đoạn schema ở phần đầu request để kích hoạt Cache Read (giảm 90% chi phí).
  2. Trích xuất ngữ cảnh thông minh: Chỉ cắt các hàm liên quan thay vì đọc cả file 2000 dòng.
  3. Phân tầng mô hình: Dùng model tốc độ cao (DeepSeek V3 / Flash) để lọc dữ liệu; chỉ dùng mô hình suy luận sâu (DeepSeek R1 / O1) khi giải quyết ca khó.

### Công thức 4: Bổ Sung Tầng Thẩm Định Cho Người Quản Lý (Non-Tech Verification)
- **Tình trạng cũ**: Chỉ in log terminal hoặc git diff khiến người quản lý/khách hàng không hiểu kết quả.
- **Cách nâng cấp**:
  - Tự động chuyển đổi kỹ thuật sang ngôn ngữ kinh doanh (Plain Vietnamese / English).
  - Tự động xuất báo cáo trực quan dạng Single-File HTML hoặc bảng điểm Trust Scorecard (0-100).
  - Sinh checklist kiểm thử nghiệm thu người dùng (UAT Checklist).

---

## 4. Mẫu Báo Cáo Đánh Giá & Hướng Dẫn Nâng Cấp Chuẩn Mực

Khi cung cấp báo cáo cho người dùng, Agent cần xuất bản theo mẫu cấu trúc chuyên nghiệp sau:

```markdown
# 📋 BÁO CÁO ĐÁNH GIÁ & LỘ TRÌNH NÂNG CẤP HỆ THỐNG

## 1. Tóm Tắt Tình Trạng Hiện Tại (Executive Health Check)
- **Điểm sức khỏe hệ thống**: [X]/100 (Hạng: [A/B/C/F])
- **Điểm mạnh cốt lõi**: [1-2 điểm đã làm tốt]
- **Nút thắt cổ chai lớn nhất**: [1 điểm yếu chí mạng cần giải quyết]

## 2. Danh Sách Lỗ Hổng & Vấn Đề Kỹ Thuật Cần Khắc Phục
- 🔴 **[Mức độ Cao/Nghiêm trọng]**: [Mô tả vấn đề] -> [Tác động kinh doanh/vận hành]
- 🟡 **[Mức độ Vừa/Kiến trúc]**: [Mô tả vấn đề] -> [Tác động lâu dài]

## 3. Kế Hoạch Nâng Cấp 3 Bước (Actionable Upgrade Roadmap)
- **Giai đoạn 1 (Ngay lập tức)**: Vá lỗi bảo mật và ngăn ngừa sập hệ thống.
- **Giai đoạn 2 (Tái cấu trúc)**: Chuẩn hóa dữ liệu với Zod, bổ sung cơ chế Fallback và Error Handling.
- **Giai đoạn 3 (Tối ưu hóa)**: Tăng tốc độ thực thi, giảm 80% chi phí API và hoàn thiện bộ test hồi quy.

## 4. Hướng Dẫn Thực Hiện Chi Tiết (Code Snippets & Recipes)
[Cung cấp mã nguồn so sánh Before / After cụ thể để người dùng hoặc agent thực thi]
```
