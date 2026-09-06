# Hướng Dẫn Sử Dụng Giao Diện Web UI — CodeTrust AI

Giao diện Web UI của **CodeTrust AI (VibeAuditor)** được thiết kế dành riêng cho **Founders, Product Managers và Nhà Quản Lý Phi Kỹ Thuật (Non-Tech)** để tự thẩm định chất lượng và nghiệm thu các sản phẩm mã nguồn do AI hoặc Lập trình viên bàn giao.

---

## 🚀 1. Khởi Động Giao Diện Web

Chạy lệnh sau tại thư mục dự án:
```bash
pnpm run server
```
Hoặc dùng chế độ phát triển (Live Reload):
```bash
pnpm run dev
```

Mở trình duyệt truy cập: **`http://localhost:4000`**

---

## 🎯 2. Ba Cách Thẩm Định Mã Nguồn

### Cách 1: Kéo Thả Thư Mục (Drag & Drop)
1. Chọn tab **"📁 Chọn Thư Mục Dự Án"**.
2. Bấm nút **"Chọn Thư Mục Từ Máy Tính"** hoặc kéo thả thư mục dự án vào khung.
3. Trình duyệt sẽ tự động quét cây tệp tin và gửi lên bộ máy thẩm định để xử lý.

### Cách 2: Nhập Đường Dẫn Thư Mục
1. Chọn tab **"💻 Nhập Đường Dẫn Máy Tính"**.
2. Gõ đường dẫn tuyệt đối hoặc tương đối (ví dụ: `E:\project\my-app` hoặc gõ `.` để thẩm định ngay thư mục hiện tại).
3. Bấm **"Bắt Đầu Thẩm Định"**.

### Cách 3: Thử Nghiệm Nhanh Với Dự Án Mẫu
1. Chọn tab **"⚡ Dùng Thử Mẫu Demo"**.
2. Nhấp vào 1 trong 3 mẫu:
   - **E-Commerce API**: Minh họa rủi ro lộ khóa API và SQL Injection (Kết quả: `REJECTED`).
   - **Cổng Thanh Toán**: Minh họa dự án chuẩn an toàn (Kết quả: `APPROVED` - Hạng `A+`).
   - **Web App**: Minh họa lỗi `eval()`, chèn raw `innerHTML`, tắt TLS (Kết quả: `NEEDS_REVIEW` / `REJECTED`).

---

## 📊 3. Đọc Hiểu Bảng Điểm & Báo Cáo

### Kết Luận Nghiệm Thu (Verdict Banner)
- 🟢 **ĐẠT CHUẨN NGHIỆM THU (APPROVED)**: Điểm từ 80-100, không có lỗ hổng nguy hiểm. Sẵn sàng bàn giao hoặc đưa lên môi trường thử nghiệm.
- 🟡 **CẦN RÀ SOÁT LẠI (NEEDS REVIEW)**: Có rủi ro mức High hoặc Medium, cần Developer sửa đổi trước khi nghiệm thu.
- 🔴 **TỪ CHỐI - NGUY HIỂM (REJECTED)**: Phát hiện lỗ hổng mức **CRITICAL** (lộ API key, database credentials, SQL Injection). Tuyệt đối không ký nghiệm thu hoặc deploy!

### 4 Chỉ Số Điểm Trọng Số
1. **Điểm Tổng Thể (Overall)**: Trọng số kết hợp Bảo mật (40%), Logic (35%), UI/Visual (25%).
2. **An Toàn Bảo Mật (Security)**: Điểm trừ tương ứng với mức độ nghiêm trọng của lỗ hổng.
3. **Logic & Nghiệp Vụ (Business Logic)**: Đánh giá khả năng đáp ứng yêu cầu tính năng.
4. **Ổn Định Giao Diện (Visual Stability)**: Đánh giá độ hoàn thiện và trải nghiệm người dùng.

### Kịch Bản Nghiệm Thu Thực Tế (Interactive UAT)
- Thay vì đọc code, bạn chỉ cần làm theo **3 bước hướng dẫn** trên màn hình.
- Tích chọn vào từng ô checkbox khi hoàn thành.
- Thanh tiến độ sẽ cập nhật phần trăm `1/3`, `2/3`, `3/3 (100%)`.

### Xuất Báo Cáo
- Nhấp **"📥 Tải File Báo Cáo HTML"** để tải file báo cáo độc lập gửi cho sếp hoặc đối tác.
- Nhấp **"🖨️ In / Xuất PDF"** để in hoặc lưu thành tệp PDF chính thức.
