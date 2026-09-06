# Hướng Dẫn Đóng Góp (Contributing to CodeTrust AI)

Cảm ơn bạn đã quan tâm đến việc đóng góp và phát triển **CodeTrust AI (VibeAuditor)**! Dưới đây là hướng dẫn các quy chuẩn phát triển mã nguồn.

---

## 🛠️ Thiết Lập Môi Trường Phát Triển

1. **Clone repository**:
   ```bash
   git clone https://github.com/tranquangthanh3062004/ai-code-auditor.git
   cd ai-code-auditor
   ```

2. **Cài đặt Dependencies**:
   ```bash
   pnpm install --ignore-scripts
   ```

3. **Cấu hình biến môi trường**:
   Sao chép `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Chạy thử nghiệm kiểm thử tự động**:
   ```bash
   pnpm test
   ```

---

## 🛡️ Thêm Quy Tắc Bảo Mật Mới (Adding a Security Rule)

Mọi quy tắc quét bảo mật tất định được định nghĩa tại `src/engine/deterministic-rules.ts`.
Để thêm một quy tắc mới, hãy thêm một object vào mảng `this.rules`:

```typescript
{
  id: 'SEC-011',
  severity: 'HIGH', // CRITICAL | HIGH | MEDIUM | LOW | INFO
  title: 'Tiêu đề ngắn gọn về lỗ hổng',
  pattern: /your-regex-pattern/g,
  plainExplanation: 'Giải thích bằng tiếng Việt đời thường cho người non-tech hiểu rủi ro.',
  remediation: 'Hướng dẫn cụ thể cho lập trình viên cách sửa lỗi.'
}
```

Sau khi thêm quy tắc, hãy bổ sung test case trong `tests/audit.test.ts` để đảm bảo quy tắc hoạt động chuẩn xác và không sinh ra false positive.

---

## 📋 Tiêu Chuẩn Pull Request

1. Chạy `pnpm run build` để kiểm tra biên dịch TypeScript.
2. Chạy `pnpm test` và đảm bảo toàn bộ unit test đều vượt qua.
3. Commit message rõ ràng theo quy chuẩn Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`.
