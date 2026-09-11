# QUẢN LÝ PHIÊN BẢN VÀ VÒNG ĐỜI KỸ NĂNG (SKILL VERSIONING & LIFECYCLE)
## Nền tảng: CodeTrust AI (VibeAuditor) • Semantic Versioning Standard

---

## 1. NGUYÊN TẮC ĐÁNH SỐ PHIÊN BẢN (SEMVER SPECIFICATION)

Mọi kỹ năng (Skill) trong hệ thống CodeTrust AI đều tuân thủ nghiêm ngặt chuẩn **Semantic Versioning 2.0.0**:

$$\text{MAJOR} \, . \, \text{MINOR} \, . \, \text{PATCH}$$

Ví dụ: `core.static-sec-scan@1.2.4`

### 1.1. Quy tắc Tăng Phiên Bản
- **PATCH (x.y.Z — Sửa lỗi & Cải thiện nhỏ)**:
  - Cập nhật thêm regex bắt khóa API mới (ví dụ thêm nhận diện Mistral API key).
  - Tối ưu hóa câu từ giải thích rủi ro bằng tiếng Việt.
  - Sửa lỗi chính tả hoặc điều chỉnh màu sắc thẻ hiển thị.
  - *Chính sách*: Tự động cập nhật cho khách hàng mà không làm gián đoạn hệ thống.

- **MINOR (x.Y.z — Bổ sung tính năng tương thích ngược)**:
  - Bổ sung thêm trường dữ liệu tùy chọn (Optional Field) vào báo cáo.
  - Hỗ trợ thêm 1 framework mới trong `core.repo-recon` (ví dụ nhận diện SvelteKit/SolidJS).
  - *Chính sách*: Tự động cập nhật; không đòi hỏi khách hàng phải sửa đổi cấu hình CI/CD.

- **MAJOR (X.y.z — Thay đổi phá vỡ tương thích - BREAKING CHANGE)**:
  - Đổi tên hoặc xóa bỏ một tham số bắt buộc trong Input Schema hoặc Output Schema.
  - Thay đổi công thức tính trọng số điểm trong `core.trust-scorecard` làm thay đổi thang đo chuẩn.
  - *Chính sách Bất Biến*: **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CẬP NHẬT**. Khách hàng phải chủ động bấm "Nâng cấp" trên Skill Store sau khi đã kiểm thử môi trường Staging.

---

## 2. VÒNG ĐỜI NÂNG CẤP & KHAI TỬ (DEPRECATION LIFECYCLE)

Một Skill trải qua 4 giai đoạn vòng đời được công bố minh bạch trên Skill Store:

```
[ ACTIVE (Hoạt động chính thức) ]
              │
              ▼ (Ra mắt phiên bản mới thay thế hoàn toàn)
     [ DEPRECATED (Cảnh báo ngừng hỗ trợ) ]
       - Duy trì sửa lỗi bảo mật trong 6 tháng
       - Hiển thị thông báo khuyến nghị nâng cấp
              │
              ▼ (Sau thời hạn 6 tháng chuyển tiếp)
       [ END-OF-LIFE (Ngừng hoạt động) ]
       - Vẫn chạy được trên bản cũ đã cài đặt
       - Không cho phép cài đặt mới từ Store
              │
              ▼ (Khi có lỗ hổng bảo mật nghiêm trọng)
        [ RETIRED / REVOKED ]
```

---

## 3. CHÍNH SÁCH DI CHUYỂN DỮ LIỆU CẤU HÌNH (SCHEMA MIGRATION)

Khi nâng cấp Skill lên phiên bản Major:
1. **Backward Compatibility Shim**: Báo cáo JSON cũ vẫn giữ nguyên cấu trúc cũ khi xuất qua endpoint `/api/reports/:id`.
2. **Data Migration Hook**:
   ```typescript
   export interface ISkillMigrator {
     fromVersion: string;
     toVersion: string;
     migrateConfig(oldConfig: Record<string, unknown>): Record<string, unknown>;
   }
   ```
3. **Rollback an toàn (One-Click Rollback)**: Khách hàng luôn có quyền hạ cấp (Downgrade) về phiên bản trước đó nếu phát hiện xung đột quy trình trong vòng 30 ngày.
