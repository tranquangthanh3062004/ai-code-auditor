# CodeTrust AI (VibeAuditor)

> **Nền tảng Thẩm định Chất lượng, An toàn Bảo mật & Nghiệm thu Code AI dành cho Non-Tech Founders, Product Managers và Nhà Quản lý.**

[![CI Suite](https://github.com/tranquangthanh3062004/ai-code-auditor/actions/workflows/ci.yml/badge.svg)](https://github.com/tranquangthanh3062004/ai-code-auditor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: >=20](https://img.shields.io/badge/Node-%3E%3D20-green.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 🎯 Vấn Đề Giải Quyết

Trong kỷ nguyên bùng nổ của **AI Coding (Cursor, Claude Code, GitHub Copilot, v.v.)**, tốc độ viết code đã tăng gấp hàng chục lần. Tuy nhiên, người trả tiền và quản lý dự án (Founders, PMs, Chủ doanh nghiệp không biết lập trình) đang gặp phải nỗi đau lớn:

1. **Không biết code do AI sinh ra có chạy đúng và an toàn không.**
2. **Không phân biệt được mã nguồn an toàn với mã nguồn chứa lỗ hổng chết người** (lộ khóa API, lộ mật khẩu Database, dính SQL Injection, XSS).
3. **Mất hàng giờ đọc tài liệu kỹ thuật phức tạp** thay vì chỉ cần một kết luận ngắn gọn và một kịch bản nghiệm thu mắt thấy.

**CodeTrust AI ra đời để giải quyết triệt để vấn đề này:** Quét toàn bộ mã nguồn, dịch mọi thuật ngữ kỹ thuật sang ngôn ngữ kinh doanh dễ hiểu, chấm điểm chất lượng và sinh kịch bản nghiệm thu 3 bước trực quan.

---

## ✨ Tính Năng Nổi Bật

- 🌐 **Giao Diện Web UI Trực Quan**: Kéo thả thư mục dự án trên trình duyệt, xem biểu đồ điểm số thời gian thực mà không cần chạm vào terminal.
- 🛡️ **Zero-Hallucination Static Scanner**: 11 quy tắc bảo mật tĩnh đối chiếu không gây ảo giác (quét lộ API Key, Token, SQLi, XSS, eval, LocalStorage JWT, v.v.).
- 🤖 **DeepSeek Semantic Reasoning**: Tóm tắt tác động nghiệp vụ (Executive Summary) và phân tích logic bằng AI (hỗ trợ Fallback Engine offline khi không có kết nối).
- 📊 **Bảng Điểm Trọng Số (Scorecard)**: Đánh giá 4 chỉ số cốt lõi: Điểm Tổng Thể, An Toàn Bảo Mật, Logic Nghiệp Vụ, và Ổn Định Giao Diện theo thang hạng `A+`, `A`, `B`, `C`, `F`.
- ✅ **Kịch Bản Nghiệm Thu 3 Bước (Interactive UAT)**: Checklist rõ ràng, chi tiết từng thao tác click và kết quả mắt thấy cho người dùng.
- 🔄 **GitHub Actions CI/CD Quality Gate**: Tự động review Pull Request, đăng bình luận sticky comment và khóa merge nếu phát hiện lỗ hổng `CRITICAL`.
- 📑 **Báo Cáo HTML Độc Lập & Xuất PDF**: Xuất file báo cáo đẹp mắt để gửi đối tác hoặc lưu trữ hồ sơ bàn giao.

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Cài đặt & Khởi động Web UI (Khuyên Dùng Cho Non-Tech)

```bash
# Clone dự án
git clone https://github.com/tranquangthanh3062004/ai-code-auditor.git
cd ai-code-auditor

# Cài đặt dependencies
pnpm install

# Khởi động Web UI Server
pnpm run server
```

👉 Mở trình duyệt tại: **`http://localhost:4000`**

---

### 2. Sử dụng dòng lệnh CLI (Dành Cho Developer)

```bash
# Thẩm định thư mục hiện tại
pnpm run audit .

# Thẩm định một dự án cụ thể và lưu báo cáo
pnpm run audit /path/to/project -o report.html

# Xuất dữ liệu thô dạng JSON
pnpm run audit /path/to/project --json
```

---

## 🛡️ 11 Quy Tắc Bảo Mật Tĩnh (Deterministic Rules)

| Mã Quy Tắc | Mức Độ | Tên Lỗ Hổng | Tác Động Khi Bị Khai Thác |
|---|---|---|---|
| **SEC-001** | `CRITICAL` | Lộ Khóa API OpenAI / DeepSeek | Bị kẻ xấu dùng trộm tài khoản AI và tiêu hết hạn mức tiền |
| **SEC-002** | `CRITICAL` | Lộ GitHub Personal Access Token | Bị xóa mã nguồn hoặc đánh cắp toàn bộ quyền kho lưu trữ |
| **SEC-003** | `CRITICAL` | Lộ Khóa AWS Access Key ID | Bị tạo máy ảo đào tiền ảo trái phép, phát sinh hóa đơn lớn |
| **SEC-004** | `CRITICAL` | Lộ Private Key RSA / SSH | Kẻ xấu giải mã dữ liệu mạng hoặc giả mạo máy chủ |
| **SEC-005** | `CRITICAL` | Lộ Mật Khẩu Database trong Connection String | Toàn bộ dữ liệu khách hàng bị tải về hoặc xóa sạch |
| **SEC-006** | `HIGH` | Lỗ Hổng Tiêm Mã SQL (SQL Injection) | Kẻ xấu nhập ký tự đặc biệt để đọc trộm tài khoản người khác |
| **SEC-007** | `HIGH` | Lệnh Thực Thi Mã Tùy Ý `eval()` | Kẻ tấn công có thể chạy lệnh tùy ý trên server |
| **SEC-008** | `HIGH` | Lỗ Hổng XSS qua raw `innerHTML` | Đánh cắp phiên đăng nhập và cookie của người dùng web |
| **SEC-009** | `MEDIUM` | Lưu JWT / Token vào `LocalStorage` | Extension độc hại có thể đọc trộm phiên đăng nhập |
| **SEC-010** | `HIGH` | Tắt Kiểm Tra Chứng Chỉ SSL/TLS | Dữ liệu bị đọc trộm trên đường truyền mạng (Man-in-the-Middle) |
| **SEC-011** | `CRITICAL` | Tiêm Mã Lệnh Hệ Thống (Command Injection) | Kẻ xấu thực thi lệnh shell can thiệp trực tiếp vào hệ điều hành |

---

## 🧪 Chạy Kiểm Thử Tự Động (Automated Tests)

CodeTrust AI đi kèm 10 kịch bản kiểm thử toàn diện:

```bash
pnpm test
```

```
✔ 1. HeuristicDetector should inspect Express framework and source files
✔ 2. DeterministicScanner should detect Critical API key leak and SQL Injection
✔ 3. DeterministicScanner should detect eval, innerHTML, localStorage token, and TLS disable in sample-xss
✔ 4. DeterministicScanner should find ZERO vulnerabilities on secure sample
✔ 5. ScorecardCalculator should appropriately penalize vulnerable project and reward clean project
✔ 6. ScorecardCalculator grade boundaries (A+, A, B, C, F)
✔ 7. DeepSeekAuditor should gracefully fallback to heuristic analysis when offline
✔ 8. HtmlReportGenerator should render complete valid HTML with custom titles and cards
✔ 9. auditProject high-level API should produce full report with HTML for SECURE sample
✔ 10. auditProject high-level API should REJECT vulnerable sample with Critical findings
```

---

## 📂 Cấu Trúc Dự Án

```
ai-code-auditor/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # CI Build & Self-Audit Gate
│   │   └── pr-audit.yml           # PR Review & Sticky Comment Bot
│   └── PULL_REQUEST_TEMPLATE.md   # Template mở PR chuẩn an toàn
├── docs/
│   ├── web-ui-guide.md            # Hướng dẫn sử dụng Web UI
│   └── ci-cd-setup.md             # Hướng dẫn cấu hình GitHub Actions
├── samples/
│   ├── sample-vulnerable/         # Dự án mẫu chứa lỗi Critical (API Key, SQLi)
│   ├── sample-secure/             # Dự án mẫu chuẩn A+ an toàn
│   └── sample-xss/                # Dự án mẫu chứa eval, XSS, TLS disable
├── server/
│   └── index.ts                   # Express API Server & Web UI static host
├── src/
│   ├── cli/bin.ts                 # CLI entrypoint (codetrust command)
│   ├── engine/
│   │   ├── deepseek-client.ts     # AI Semantic Reasoning & Fallback Engine
│   │   ├── deterministic-rules.ts # 11 Static Security Rules
│   │   └── heuristic-detector.ts  # Framework & Code Scanner
│   ├── reporter/
│   │   ├── html-generator.ts      # Standalone HTML report generator
│   │   └── scorecard.ts           # Weighted scorecard calculation
│   └── types/audit.ts             # Zod schema definitions
├── web/
│   ├── index.html                 # Web UI Dashboard
│   ├── style.css                  # Dark Mode & Glassmorphism design system
│   └── app.js                     # Frontend interactive logic
├── tests/
│   └── audit.test.ts              # 10 automated unit test cases
├── Makefile                       # Development shortcuts
├── package.json
└── tsconfig.json
```

---

## 📄 Bản Quyền & Đóng Góp

Dự án phát hành dưới giấy phép mã nguồn mở [MIT License](LICENSE). Mọi đóng góp (Pull Request, Issue) đều được hoan nghênh theo [CONTRIBUTING.md](CONTRIBUTING.md).
