# ĐẶC TẢ SẢN PHẨM CỬA HÀNG KỸ NĂNG (SKILL STORE & MARKETPLACE SPECIFICATION)
## Nền tảng: CodeTrust AI (VibeAuditor) • SaaS Extension Hub

---

## 1. TỔNG QUAN VỀ SKILL STORE

**Skill Store** là cổng giao dịch và trung tâm phân phối các năng lực mở rộng (Modular Extensions) dành cho người dùng cá nhân, lập trình viên và khách hàng doanh nghiệp trên nền tảng CodeTrust AI.

Mục tiêu sản phẩm:
- Cho phép người dùng khám phá, dùng thử, mua và kích hoạt các kỹ năng kiểm toán chuyên sâu.
- Tạo nguồn doanh thu bền vững (Monetization) thông qua mô hình thuê bao (Subscription) và trả theo lượt sử dụng (Usage-based / Pay-as-you-go).
- Trao quyền cho khách hàng tự quản lý danh mục "My Skills" theo nhu cầu thực tế của từng dự án.

---

## 2. LUỒNG TRẢI NGHIỆM NGƯỜI DÙNG ĐẦY ĐỦ (END-TO-END FLOW)

```
NGƯỜI DÙNG (USER)
       │
       ▼
[ Truy cập Skill Store trên Web UI ]
       │
       ▼
[ Tìm kiếm & Lọc theo Danh mục: AI / Security / CI-CD / Enterprise ]
       │
       ▼
[ Xem Chi tiết Kỹ năng (Skill Detail Page) ]
       │
       ▼
[ Lựa chọn Hình thức: Miễn phí / Mua theo tháng / Mua theo lượt ]
       │
       ▼
[ Cổng Thanh toán (Stripe / VNPay / MoMo Gateway) ]
       │
       ▼
[ Xác thực Bản quyền & Cấp quyền (License Verification & Entitlement) ]
       │
       ▼
[ Kích hoạt Kỹ năng (Enable in Skill Registry) ]
       │
       ▼
[ Tác tử AI (Agent) lập tức có quyền sử dụng Skill trong lần Audit tiếp theo ]
```

---

## 3. THIẾT KẾ GIAO DIỆN CỬA HÀNG (UI WIREFRAMES)

### 3.1. Giao diện Danh mục Kỹ năng (Store Catalog View)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ CodeTrust AI • SKILL STORE MARKETPLACE                     [ My Skills ]  │
│                                                                             │
│ 🔍 Tìm kiếm kỹ năng kiểm toán (Ví dụ: OWASP, Playwright, CVE, License)...    │
│                                                                             │
│ DANH MỤC:                                                                   │
│ [ Tất cả (24) ]  [ Nền tảng (5) ]  [ CI/CD & Dev (7) ]  [ Doanh nghiệp (8) ]│
│                                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────┐ │
│ │ 🛡️ OWASP Top 10 Cert    │ │ 🎭 Playwright Visual    │ │ ⚡ Auto PR Patch│ │
│ │ ★★★★★ (4.9/5 • 120 cty) │ │ ★★★★☆ (4.7/5 • 85 PMs)  │ │ ★★★★★ (5.0/5)   │ │
│ │                         │ │                         │ │                 │ │
│ │ Kiểm toán toàn diện     │ │ Chạy container Docker   │ │ Tự động sinh mã │ │
│ │ 10 chuẩn bảo mật web    │ │ chụp ảnh bắt lỗi vỡ giao│ │ sửa lỗ hổng &   │ │
│ │ cấp chứng nhận đấu thầu.│ │ diện trước khi bàn giao.│ │ mở Pull Request.│ │
│ │                         │ │                         │ │                 │ │
│ │ $49 / tháng             │ │ $0.50 / lần chạy        │ │ $2.00 / bản vá  │ │
│ │ [ Xem Chi Tiết ]        │ │ [ Kích Hoạt Dùng Thử ]  │ │ [ Mua Ngay ]    │ │
│ └─────────────────────────┘ └─────────────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Giao diện Trang Chi Tiết Kỹ Năng (Skill Detail Page)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Quay lại Skill Store                                                      │
│                                                                             │
│ [ Icon: 🛡️ ]  OWASP Top 10 Enterprise Compliance Certifier                  │
│ Phiên bản: 1.0.0 • Tác giả: CodeTrust Core Team • Đã kiểm toán an toàn (✓)  │
│                                                                             │
│ MÔ TẢ NGHIỆP VỤ:                                                            │
│ Rà soát 100% mã nguồn theo 10 hạng mục an toàn ứng dụng web của tổ chức     │
│ OWASP (Injection, Cryptographic Failures, Security Misconfiguration...).    │
│ Cấp chứng nhận số có mã xác thực QR dành cho hồ sơ đấu thầu doanh nghiệp.   │
│                                                                             │
│ AI AGENT PHỤ TRÁCH:   Security Inspector Agent (agent-security-inspector)   │
│ MCP TOOLS YÊU CẦU:    codetrust_scan_security, codetrust_audit              │
│ QUYỀN TRUY CẬP:       READ (Đọc file dự án), ANALYZE, REPORT                │
│ PHỤ THUỘC BẮT BUỘC:   core.static-sec-scan (^1.0.0), core.trust-scorecard   │
│ CHI PHÍ TOKEN DỰ KIẾN: 3,000 - 8,000 tokens DeepSeek R1/V3 per run          │
│                                                                             │
│ GIÁ BÁN & GÓI ÁP DỤNG:                                                      │
│ • Gói Đăng Ký: $49 / tháng (Bao gồm không giới hạn lượt audit)              │
│ • Mua Lẻ: $199 / báo cáo chứng nhận chính thức kèm dấu mộc số               │
│ • Đã bao gồm trong: Gói Enterprise                                          │
│                                                                             │
│ [ 🚀 MUA VÀ KÍCH HOẠT NGAY ]     [ 📑 XEM BÁO CÁO MẪU ]                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3. Giao diện Quản Lý Kỹ Năng Của Tôi (Customer "My Skills" Dashboard)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 👤 QUẢN LÝ KỸ NĂNG CỦA TÔI (MY SKILLS DASHBOARD)                            │
│ Gói hiện tại: PRO TIER ($29/tháng) • Hạn mức Token: 120,000 / 500,000      │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Tên Kỹ Năng          │ Phân Loại │ Trạng Thái │ Lượt Dùng │ Hành Động   │ │
│ ├──────────────────────┼───────────┼────────────┼───────────┼─────────────┤ │
│ │ core.repo-recon      │ Core      │ [ BẬT ]    │ 142 lần   │ (Khóa Bật)  │ │
│ │ core.static-sec-scan │ Core      │ [ BẬT ]    │ 142 lần   │ (Khóa Bật)  │ │
│ │ opt.pr-diff-auditor  │ Optional  │ [ BẬT ]    │ 35 lần    │ [ Tắt ]     │ │
│ │ opt.dep-cve-hunter   │ Optional  │ [ TẮT ]    │ 0 lần     │ [ Bật ]     │ │
│ │ prem.owasp-top10     │ Premium   │ [ HẾT HẠN ]│ 8 lần     │ [ Gia Hạn ] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ⚠️ Lưu ý: Không thể vô hiệu hóa hoặc gỡ cài đặt các Core Skills nền tảng.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. MÔ HÌNH CẤP PHÉP & THUÊ BAO (LICENSING & ENTITLEMENT MODEL)

CodeTrust AI tách bạch giữa Sản phẩm, Gói dịch vụ và Quyền kích hoạt kỹ năng:

$$\text{User / Tenant} \longrightarrow \text{Plan} \longrightarrow \text{Subscription} \longrightarrow \text{Entitlement} \longrightarrow \text{Skill Access}$$

### 4.1. Bảng Phân Tầng Gói Dịch Vụ (Subscription Plans)

| Gói Dịch Vụ | Giá Niêm Yết | Kỹ Năng Được Bao Gồm | Hạn Mức Token AI | Hỗ Trợ Đội Ngũ |
|---|---|---|---|---|
| **Free Tier** | $0 / vĩnh viễn | 5 Core Skills (`core.*`) | 50.000 tokens/tháng | Cộng đồng GitHub |
| **Pro Tier** | $29 / tháng | 5 Core + 7 Optional Skills (`opt.*`) | 500.000 tokens/tháng | Email phản hồi 24h |
| **Business** | $99 / tháng | Tất cả Core + Optional + 4 Premium Skills (`prem.owasp`, `prem.license`, `prem.db-migration`, `prem.auto-pr`) | 2.000.000 tokens/tháng | Slack Connect, 4h SLA |
| **Enterprise**| $499 / tháng | **Tất cả 24 Skills** (Mở khóa toàn bộ) + Hỗ trợ Private MCP + Custom Rules | Không giới hạn (BYO API Key) | Dedicated Engineer, 1h SLA |

---

## 5. LUỒNG ĐỀ XUẤT KỸ NĂNG THÔNG MINH (IN-AGENT UPSELL FLOW)

Khi người dùng thực hiện một yêu cầu mà hệ thống phát hiện cần một Premium Skill chưa kích hoạt:

```
[ Người dùng yêu cầu: "Kiểm tra xem dự án có đạt chuẩn an toàn OWASP để ký hợp đồng không" ]
                                     │
                                     ▼
                      [ Intent & Capability Detector ]
                                     │
                                     ▼
        [ Phát hiện yêu cầu Skill: "prem.owasp-top10-certifier" ]
                                     │
                                     ▼
             [ Kiểm tra Entitlement trong SkillRegistry ]
                                     │
                  ┌──────────────────┴──────────────────┐
                  ▼                                     ▼
           [ ĐÃ CÓ BẢN QUYỀN ]                 [ CHƯA CÓ BẢN QUYỀN ]
                  │                                     │
                  ▼                                     ▼
         [ Tự động kích hoạt ]           [ Trả về khuyến nghị thân thiện ]
                  │                                     │
                  ▼                                     ▼
         [ Thực thi kiểm toán ]           "Tính năng Chứng nhận OWASP Top 10
                                          thuộc gói Premium. Bạn có muốn kích
                                          hoạt ngay trên Skill Store ($49/tháng)?"
                                                        │
                                                        ▼
                                          [ Nút CTA: Mở Skill Store ]
```

---

## 6. SỐ LIỆU PHÂN TÍCH CHO QUẢN TRỊ VIÊN (STORE ANALYTICS)

Hệ thống ghi nhận các chỉ số kinh doanh then chốt (SaaS Metrics):
1. **Top Skills Được Cài Đặt Nhiều Nhất**: Giúp định hướng sản phẩm tập trung đầu tư vào các kỹ năng có nhu cầu cao.
2. **Tỷ Lệ Chuyển Đổi (Free-to-Paid Conversion)**: Đo lường mức độ hiệu quả của các lời mời nâng cấp in-agent.
3. **Chi Phí Token Trên Mỗi Skill (Cost per Skill Run)**: Theo dõi biên lợi nhuận của từng kỹ năng AI, tự động cảnh báo nếu kỹ năng nào có chi phí token vượt ngưỡng dự toán.
