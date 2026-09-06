# KIẾN TRÚC HỆ THỐNG CODETRUST AI

Tài liệu này mô tả chi tiết kiến trúc kỹ thuật của hệ thống CodeTrust AI (VibeAuditor).

---

## 1. MÔ HÌNH HOẠT ĐỘNG TỔNG QUAN (SYSTEM WORKFLOW)

```
[ Người Dùng Non-Tech / PM ]
           │
           │ 1. Tải lên ZIP hoặc dán link GitHub Repo
           ▼
[ Pipeline Khởi Tạo & Sandbox ]
           │
           │ 2. Khởi động môi trường kiểm thử cô lập
           ▼
[ Core Audit Pipeline (DeepSeek Engine) ]
  ├── a. Security Scanner (Quét lộ Secret, SQLi, XSS, Vulnerabilities)
  ├── b. Logic Auditor (Đối chiếu PR / Code với Yêu cầu ban đầu)
  └── c. Visual Verification Agent (Playwright mở Web & chụp bằng chứng)
           │
           │ 3. Tổng hợp kết quả
           ▼
[ Non-Tech Synthesis & Translation Layer ]
  ├── Chuyển đổi Git diff thành báo cáo tiếng Việt đời thường
  ├── Tính toán Bảng điểm Tin cậy (Trust Scorecard: 0 - 100)
  └── Sinh kịch bản kiểm thử tương tác (Interactive UAT Checklist)
           │
           │ 4. Xuất bản
           ▼
[ Báo Cáo Thẩm Định HTML / Dashboard ]
```

---

## 2. CÁC MODULE CHÍNH TRONG `src/`

### 2.1. `src/engine/` - Hạt Nhân Phân Tích
- **`security-scanner.ts`**:
  - Dùng regex và AST phân tích nhanh các mẫu lộ lọt credentials (`sk-`, `ghp_`, `AWS_SECRET`), các câu lệnh truy vấn nguy hiểm (SQL Injection, command injection).
  - Tích hợp kiểm tra các lỗ hổng OWASP cơ bản.
- **`logic-auditor.ts`**:
  - Gửi prompt có cấu trúc tới **DeepSeek V3 / R1**.
  - So sánh mục tiêu ban đầu của tính năng (User Story / Requirement) với diff thực tế của các tệp đã thay đổi để phát hiện các trường hợp bỏ sót logic (Edge cases bị quên).
- **`translator.ts`**:
  - Biến ngôn ngữ lập trình kỹ thuật thành bản tóm tắt kinh doanh theo nguyên tắc: **"Một đứa trẻ 12 tuổi hoặc một giám đốc tài chính đều có thể hiểu ngay lập tức"**.

### 2.2. `src/visual/` - Trực Quan Hóa (Visual Proof Engine)
- **`browser-agent.ts`**:
  - Sử dụng Playwright / Puppeteer khởi động ứng dụng web trong môi trường sandbox.
  - Tự động tìm kiếm các thành phần giao diện mới được thêm hoặc sửa đổi (nút bấm, form nhập liệu, bảng hiển thị).
- **`recorder.ts`**:
  - Tự động chụp ảnh toàn trang (Full-page screenshot) trước và sau khi thay đổi (Before & After).
  - Ghi lại chuỗi ảnh động minh họa thao tác click và nhập liệu.

### 2.3. `src/reporter/` - Bộ Tạo Báo Cáo Tương Tác
- **`scorecard.ts`**:
  - Tính điểm trọng số:
    - `Security (40%)`: 0 điểm nếu có lỗi nghiêm trọng, 100 điểm nếu an toàn tuyệt đối.
    - `Requirement Match (35%)`: Tỷ lệ % yêu cầu kinh doanh đã hoàn thành.
    - `Stability & Tests (25%)`: Tỷ lệ unit test bao phủ và trạng thái build.
- **`uat-generator.ts`**:
  - Sinh checklist gồm 3–5 bước rõ ràng để người non-tech tự tay click kiểm tra trên điện thoại hoặc trình duyệt.
