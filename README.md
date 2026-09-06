<div align="center">

# 🛡️ CodeTrust AI (VibeAuditor)

**Nền tảng Thẩm định Chất lượng, Bảo mật & Nghiệm thu Code AI dành cho Non-Tech Founders, PMs và Nhà Quản lý**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: >=20](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tests: Passing](https://img.shields.io/badge/Tests-Passing-success.svg)](#)

[Khởi Chạy Nhanh](#-khởi-chạy-nhanh-quickstart) • [Tính Năng Cốt Lõi](#-tính-năng-cốt-lõi) • [Kiến Trúc](#-kiến-trúc-hệ-thống) • [API Lập Trình](#-sử-dụng-qua-thư-viện-programmatic-api) • [Quy Tắc Quét](#-danh-mục-quy-tắc-bảo-mật-mặc-định)

</div>

---

## 🎯 Vấn Đề Thực Tế (The AI Verification Crisis)

Trong kỷ nguyên Generative AI, các công cụ như Cursor, Lovable, Bolt.new, v0 cho phép bất kỳ ai cũng có thể tạo ra hàng ngàn dòng code chỉ trong vài phút. **Tuy nhiên, người không chuyên kỹ thuật (Non-Tech Founders, Giám đốc, Product Managers, Khách hàng thuê ngoài) hoàn toàn bất lực trong việc kiểm chứng xem mã nguồn đó có chuẩn, an toàn và hoạt động đúng yêu cầu hay không.**

Họ không thể hiểu `git diff` xanh đỏ hay các dòng log terminal phức tạp.

**CodeTrust AI ra đời để trở thành "Trọng tài thẩm định độc lập"**:
- 💡 **Dịch thuật Kỹ thuật ➔ Ngôn ngữ Kinh doanh**: Giải thích chính xác tính năng mới làm được gì, rủi ro tiềm ẩn là gì bằng tiếng Việt đời thường.
- 🛡️ **Bảng điểm Tin cậy (Trust Scorecard)**: Chấm điểm minh bạch theo trọng số: Bảo mật (40%), Logic nghiệp vụ (35%), Ổn định giao diện (25%).
- 🔍 **Quét Bảo Mật Tất Định (Zero Hallucination)**: Bắt 100% các lỗ hổng lộ API Key, Token, SQL Injection, XSS, eval() độc hại mà không bị ảo giác.
- ✅ **Checklist Nghiệm Thu 3 Bước (Interactive UAT)**: Sinh kịch bản kiểm thử dễ dàng để người non-tech tự bấm thử trên trình duyệt và ký duyệt nghiệm thu.
- 📊 **Báo Cáo HTML Độc Lập (Single-File Self-Contained)**: Xuất file HTML phong cách Dark Mode & Glassmorphism sang trọng, tự động mở trên trình duyệt.

---

## 🚀 Khởi Chạy Nhanh (Quickstart)

### 1. Cài đặt Dependencies
```bash
pnpm install --ignore-scripts
# hoặc: npm install
```

### 2. Cấu hình biến môi trường (Tùy chọn)
Sao chép `.env.example` thành `.env` nếu bạn muốn kích hoạt DeepSeek AI:
```env
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
```
*(Lưu ý: Nếu không có API Key hoặc hết số dư, hệ thống sẽ tự động kích hoạt **Heuristic Fallback Engine** để không bao giờ làm gián đoạn việc quét mã).*

### 3. Thẩm định một Thư mục hoặc Dự án bất kỳ
```bash
# Quét dự án mẫu có lỗ hổng:
pnpm run audit samples/sample-vulnerable

# Quét dự án mẫu an toàn:
pnpm run audit samples/sample-secure

# Quét bất kỳ thư mục nào trên máy:
pnpm run audit C:/path/to/your/project
```
Hệ thống sẽ quét, chấm điểm và **tự động mở báo cáo HTML trực quan trên trình duyệt** của bạn!

---

## 💻 Sử Dụng Dòng Lệnh (CLI Usage)

```bash
Usage: codetrust [path] [options]

Arguments:
  path                 Đường dẫn thư mục dự án cần thẩm định (mặc định: '.')

Options:
  -o, --output <file>  Đường dẫn file HTML báo cáo xuất ra (mặc định: 'audit-report.html')
  --no-open            Không tự động mở trình duyệt sau khi xuất báo cáo
  --json               Xuất kết quả thẩm định dạng JSON thô ra terminal
  -h, --help           Hiển thị trợ giúp
```

---

## 📦 Sử Dụng Qua Thư Viện (Programmatic API)

Bạn có thể tích hợp CodeTrust AI vào hệ thống CI/CD, bot Discord/Slack, hoặc Webhook của riêng bạn:

```typescript
import { auditProject } from 'ai-code-auditor';

const { report, htmlContent } = await auditProject('./my-web-app', {
  outputPath: './custom-report.html',
  generateHtml: true,
});

console.log('Điểm tổng thể:', report.scores.overall);
console.log('Xếp hạng:', report.scores.grade); // A+, A, B, C, F
console.log('Kết luận:', report.executiveSummary.verdict); // APPROVED | NEEDS_REVIEW | REJECTED
console.log('Số lỗ hổng phát hiện:', report.securityFindings.length);
```

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

Hệ thống được thiết kế theo mô hình **Hybrid 4-Layer Pipeline**:

```
[ ĐẦU VÀO: MÃ NGUỒN DỰ ÁN ]
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. HEURISTIC FRAMEWORK & PROJECT DETECTOR                   │
│    Tự động dò Next.js, Vite, React, Vue, Express, Python...  │
│    Khử ký tự BOM UTF-8, đếm số file và dòng code.           │
├─────────────────────────────────────────────────────────────┤
│ 2. DETERMINISTIC SECURITY SCANNER (ZERO HALLUCINATION)      │
│    Bộ quy tắc AST/Regex bắt 100% lộ API Key, SQLi, XSS,     │
│    Insecure eval, Database credentials...                   │
├─────────────────────────────────────────────────────────────┤
│ 3. DEEPSEEK REASONER & HEURISTIC FALLBACK ENGINE            │
│    Phân tích logic nghiệp vụ, đối chiếu yêu cầu, dịch thuật  │
│    sang tiếng Việt kinh doanh, sinh kịch bản UAT.           │
├─────────────────────────────────────────────────────────────┤
│ 4. SINGLE-FILE HTML GENERATOR & SCORECARD CALCULATOR        │
│    Tính điểm có trọng số (Security 40%, Logic 35%, UI 25%)   │
│    Xuất file HTML độc lập, mở ngay trên trình duyệt.        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Danh Mục Quy Tắc Bảo Mật Mặc Định

| Mã Quy Tắc | Mức Độ | Tên Lỗ Hổng / Rủi Ro |
|---|---|---|
| `SEC-001` | **CRITICAL** | Lộ Khóa API OpenAI / DeepSeek (`sk-...`) trong code |
| `SEC-002` | **CRITICAL** | Lộ GitHub Personal Access Token (`ghp_...`) |
| `SEC-003` | **CRITICAL** | Lộ Khóa AWS Access Key ID (`AKIA...`) |
| `SEC-004` | **CRITICAL** | Lộ Private Key RSA / SSH (`-----BEGIN PRIVATE KEY-----`) |
| `SEC-005` | **CRITICAL** | Lộ chuỗi kết nối Database chứa mật khẩu trực tiếp |
| `SEC-006` | **HIGH** | Tấn công Tiêm mã SQL (SQL Injection qua template literal) |
| `SEC-007` | **HIGH** | Thực thi mã tùy ý không an toàn (`eval()`, `Function()`) |
| `SEC-008` | **HIGH** | Tấn công XSS qua `dangerouslySetInnerHTML` / `raw innerHTML` |
| `SEC-009` | **MEDIUM** | Lưu trữ token / mật khẩu vào LocalStorage trình duyệt |
| `SEC-010` | **HIGH** | Tắt kiểm tra chứng chỉ bảo mật SSL (`rejectUnauthorized: false`) |

---

## 🧪 Chạy Kiểm Thử Tự Động (Testing)

```bash
pnpm test
```
Toàn bộ 5 bài kiểm tra tích hợp sẽ chạy và xác minh tính đúng đắn của Heuristic Detector, Scanner, Calculator và HTML Generator.

---

## 📄 Bản Quyền (License)

Phát hành dưới giấy phép [MIT License](LICENSE).  
Bản quyền © 2026 **Tran Quang Thanh** (`tranquangthanh3062004@gmail.com`).
