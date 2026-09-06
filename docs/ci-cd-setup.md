# Hướng Dẫn Thiết Lập CI/CD GitHub Actions — CodeTrust AI

CodeTrust AI cung cấp bộ quy trình tự động hóa kiểm tra mã nguồn (CI/CD Quality Gate) trên GitHub, giúp ngăn chặn mọi đoạn code chứa lỗ hổng bảo mật được merge vào nhánh chính.

---

## 🛠️ 1. Cấu Hình Khóa Bí Mật Trên GitHub (Repository Secret)

1. Truy cập vào GitHub Repository của bạn: `https://github.com/tranquangthanh3062004/ai-code-auditor`
2. Chọn **Settings** → **Secrets and variables** → **Actions**.
3. Bấm **New repository secret**:
   - **Name**: `DEEPSEEK_API_KEY`
   - **Secret**: Nhập API key của DeepSeek (hoặc để trống nếu muốn dùng bộ máy phân tích Heuristic Fallback Engine offline).
4. Bấm **Add secret**.

---

## 🚀 2. Các Workflow Đã Được Tích Hợp

### Workflow 1: `ci.yml` (CI Test & Self-Audit Gate)
- **Kích hoạt khi**: Mỗi khi có `push` hoặc `pull_request` vào nhánh `main` hoặc `master`.
- **Nhiệm vụ**:
  1. Kiểm tra Typecheck và biên dịch TypeScript trên môi trường Node 20.x và 22.x.
  2. Chạy toàn bộ 10+ kịch bản Unit Test tự động (`pnpm test`).
  3. Thực thi tự thẩm định an toàn mã nguồn (`CodeTrust Self-Audit`).
  4. Xuất file báo cáo `self-audit.html` đính kèm lên GitHub Artifacts.

### Workflow 2: `pr-audit.yml` (Tự Động Review & Comment Trên Pull Request)
- **Kích hoạt khi**: Mỗi khi có thành viên tạo mới hoặc cập nhật Pull Request (PR).
- **Nhiệm vụ**:
  1. Quét toàn bộ mã nguồn của PR.
  2. Tự động viết **bình luận (sticky comment)** trên PR với bảng điểm tổng hợp, danh sách lỗ hổng và kịch bản nghiệm thu 3 bước cho PM.
  3. **Chặn merge (Failed Gate)** nếu phát hiện bất kỳ lỗ hổng mức `CRITICAL` nào (như lộ API key, Database credentials, SQL Injection, Command Injection).

---

## 📋 3. Quy Trình Kiểm Thử & Nghiệm Thu Pull Request

Khi một Developer hoặc Agent AI mở Pull Request:
1. GitHub Actions sẽ tự động kích hoạt bot `CodeTrust PR Inspection`.
2. Trong vòng 30-60 giây, bot sẽ để lại nhận xét chi tiết:
   - Kết luận: 🟢 `APPROVED`, 🟡 `NEEDS REVIEW`, hoặc 🔴 `REJECTED`.
   - Bảng điểm và lý do bằng ngôn ngữ phi kỹ thuật.
   - Kịch bản nghiệm thu mắt thấy (UAT).
3. Nếu kết quả là `REJECTED`, GitHub sẽ khóa nút Merge và yêu cầu Developer chỉnh sửa.
