# Changelog

Tất cả các thay đổi quan trọng của dự án **CodeTrust AI (VibeAuditor)** sẽ được ghi chép tại tệp này theo chuẩn [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - 2026-09-06

### Đã thêm (Added)
- **Deterministic Security Scanner**: 10 quy tắc tĩnh quét tất định bắt các lỗ hổng lộ API Key (OpenAI, DeepSeek, GitHub, AWS), SQL Injection, XSS, insecure eval, DB connection strings.
- **Heuristic Project & Framework Detector**: Tự động nhận diện Next.js, Vite, React, Vue, Express, NestJS, Python (FastAPI/Flask/Django), số lượng file và dòng code.
- **DeepSeek AI Reasoning & Resilient Fallback Engine**: Phân tích logic nghiệp vụ, đối chiếu yêu cầu và tự động chuyển sang chế độ Heuristic Offline nếu mất mạng hoặc hết quota.
- **Scorecard Calculator**: Thuật toán chấm điểm có trọng số (Bảo mật 40%, Logic 35%, Giao diện 25%) và xếp hạng A+/A/B/C/F.
- **Single-File HTML Report Generator**: Trình tạo báo cáo HTML độc lập phong cách Dark Mode & Glassmorphism hiện đại, tự động mở trình duyệt.
- **Programmatic API & CLI**: Hỗ trợ lệnh CLI `codetrust` và thư viện TypeScript `auditProject`.
- **Agent Skill**: `system-upgrade-advisor` - Skill hướng dẫn AI Agent đánh giá và nâng cấp chất lượng hệ thống.
- **CI/CD Pipeline**: GitHub Actions workflow kiểm thử tự động trên Node.js 20, 22, 24.
