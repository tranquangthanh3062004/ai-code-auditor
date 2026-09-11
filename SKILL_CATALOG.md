# DANH MỤC 24 KỸ NĂNG TÁC TỬ (SKILL CATALOG & SPECIFICATIONS)
## Nền tảng Thẩm định Mã nguồn: CodeTrust AI (VibeAuditor)

---

## BẢNG MA TRẬN TỔNG QUAN 24 SKILLS (SKILL MATRIX)

| # | Mã Skill (ID) | Danh Mục | Giá Trị Người Dùng | Tác Tử Phụ Trách | MCP Tools Cần | Phân Hạng | Ưu Tiên |
|---|---|---|---|---|---|---|---|
| 01 | `core.repo-recon` | Phân tích cấu trúc | Cực Cao (Hiểu quy mô mã) | `agent-repo-analyst` | `codetrust_inspect_project` | Core | P0 |
| 02 | `core.static-sec-scan` | Bảo mật tất định | Cực Cao (Chặn lộ Secret & SQLi) | `agent-security-inspector` | `codetrust_scan_security` | Core | P0 |
| 03 | `core.biz-risk-translator` | Ngữ nghĩa nghiệp vụ | Rất Cao (Hiểu rủi ro tài chính) | `agent-semantic-logic` | *(DeepSeek API direct)* | Core | P0 |
| 04 | `core.trust-scorecard` | Đánh giá & Điểm số | Rất Cao (Đo lường chất lượng 0-100) | `agent-quality-uat` | *(Nội bộ)* | Core | P0 |
| 05 | `core.interactive-uat` | Nghiệm thu thực tế | Rất Cao (Tự tay bấm kiểm chứng) | `agent-semantic-logic` | `codetrust_generate_uat` | Core | P0 |
| 06 | `opt.pr-diff-auditor` | Tự động hóa CI/CD | Cao (Tiết kiệm thời gian review PR) | `agent-orchestrator` | `codetrust_scan_security` | Optional | P1 |
| 07 | `opt.dep-cve-hunter` | Phân tích phụ thuộc | Cao (Bắt lỗ hổng thư viện mở) | `agent-security-inspector` | `codetrust_scan_security` | Optional | P1 |
| 08 | `opt.api-contract-validator`| Kiểm tra API | Trung Bình (Bảo vệ Backend hợp lệ) | `agent-repo-analyst` | `codetrust_inspect_project` | Optional | P1 |
| 09 | `opt.secret-rotation-advisor`| Khắc phục sự cố | Cao (Xử lý nhanh khi lộ key) | `agent-semantic-logic` | *(Nội bộ)* | Optional | P1 |
| 10 | `opt.code-maintainability-radar`| Tái cấu trúc code | Trung Bình (Chống nợ kỹ thuật) | `agent-repo-analyst` | `codetrust_inspect_project` | Optional | P2 |
| 11 | `opt.env-config-auditor` | Cấu hình môi trường | Cao (Tránh thiếu biến khi deploy) | `agent-security-inspector` | `codetrust_scan_security` | Optional | P1 |
| 12 | `opt.test-coverage-gap-analyst`| Đảm bảo chất lượng | Trung Bình (Xác định luồng thiếu test)| `agent-repo-analyst` | `codetrust_inspect_project` | Optional | P2 |
| 13 | `prem.owasp-top10-certifier` | Tuân thủ bảo mật | Cực Cao (Chứng chỉ thầu/gọi vốn) | `agent-security-inspector` | `codetrust_scan_security`, `codetrust_audit` | Premium | P1 |
| 14 | `prem.soc2-iso27001-readiness`| Kiểm toán chứng chỉ | Cực Cao (Tiết kiệm chi phí tư vấn) | `agent-orchestrator` | `codetrust_audit` | Premium | P2 |
| 15 | `prem.auto-pr-patch-generator`| Tự động sửa lỗi | Rất Cao (Giảm MTTR sửa lỗi) | `agent-orchestrator` | `codetrust_scan_security` | Premium | P1 |
| 16 | `prem.playwright-visual-sandbox`| Kiểm thử giao diện | Rất Cao (Bảo đảm màn hình không trắng)| `agent-quality-uat` | `codetrust_inspect_project` | Premium | P2 |
| 17 | `prem.license-ip-compliance` | Pháp lý & Bản quyền | Rất Cao (Bảo vệ sở hữu trí tuệ) | `agent-repo-analyst` | `codetrust_inspect_project` | Premium | P1 |
| 18 | `prem.db-migration-safety` | An toàn dữ liệu | Rất Cao (Chống sập database) | `agent-security-inspector` | `codetrust_scan_security` | Premium | P2 |
| 19 | `prem.cloud-finops-auditor` | Tối ưu chi phí Cloud | Cao (Kiểm soát chi phí hạ tầng) | `agent-orchestrator` | `codetrust_inspect_project` | Premium | P2 |
| 20 | `prem.executive-pdf-deck-generator`| Báo cáo chuyên nghiệp| Cao (Hồ sơ gửi nhà đầu tư) | `agent-quality-uat` | `codetrust_audit` | Premium | P2 |
| 21 | `int.agent-task-router` | Điều phối hệ thống | Nội Bộ (Chống xung đột tác tử) | `agent-orchestrator` | *(Supervisor internal)* | Internal | P0 |
| 22 | `int.token-economics-guardian` | Tiết kiệm chi phí AI | Nội Bộ (Kích hoạt KV Cache DeepSeek) | `agent-semantic-logic` | *(Prompt engine internal)* | Internal | P0 |
| 23 | `int.sandbox-execution-guard` | An toàn máy chủ | Nội Bộ (Chống Path Traversal) | `agent-orchestrator` | *(Filesystem boundary)* | Internal | P0 |
| 24 | `int.context-memory-compactor`| Quản lý bộ nhớ AI | Nội Bộ (Tránh tràn context window) | `agent-semantic-logic` | *(AST parser internal)* | Internal | P1 |

---

## ĐẶC TẢ CHI TIẾT TỪNG SKILL (SKILL SPECIFICATIONS)

---

### # Skill: Repository Reconnaissance & Framework Inspector
- **ID**: `core.repo-recon`
- **Version**: `1.0.0`
- **Category**: `Core`
- **Purpose**: Khám phá cây thư mục dự án, loại trừ các thư mục rác/vendor (`node_modules`, `.git`, `dist`), nhận diện framework chính xác, entrypoint, port và thống kê quy mô mã nguồn.
- **Problem Solved**: Người dùng không biết dự án được viết bằng công nghệ gì, có bao nhiêu file, file nào là file khởi chạy chính.
- **Target Users**: Non-Tech Founders, Product Managers, Tech Leads.
- **User Value**: Nắm rõ ngay lập tức cấu trúc kỹ thuật của sản phẩm mà không cần mở IDE.
- **Required Agent**: `agent-repo-analyst`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: Không có.
- **Input**: `{ targetPath: string }`
- **Output**: `{ projectInfo: ProjectInfo, sourceFiles: string[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Nguy cơ đọc nhầm tệp ngoài thư mục nếu đường dẫn không được sanitize. Đã giải quyết bằng `isSafeRelativePath`.
- **Failure Cases**: Thư mục không tồn tại; thư mục rỗng; không có quyền đọc hệ điều hành.
- **Testing**: Unit test kiểm tra nhận diện Express, Next.js, Vite, NestJS, FastAPI trong `tests/audit.test.ts`.
- **Cost**: `$0.00` (Chạy phân tích tĩnh trên Node.js).
- **Pricing Recommendation**: Miễn phí (Free Tier / Core).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Deterministic Static Security Scanner
- **ID**: `core.static-sec-scan`
- **Version**: `1.0.0`
- **Category**: `Core`
- **Purpose**: Thực thi bộ 11 quy tắc phân tích tĩnh tất định không ảo giác (Zero-Hallucination) để bắt các lỗ hổng lộ API Key, Token, SQL Injection, eval(), innerHTML thô, tắt TLS và lưu JWT vào LocalStorage.
- **Problem Solved**: Code do AI hoặc lập trình viên thiếu kinh nghiệm viết thường chứa các lỗi bảo mật sơ đẳng có thể bị khai thác ngay lập tức.
- **Target Users**: Founders, Developers, Security Engineers.
- **User Value**: Ngăn chặn 100% rủi ro rò rỉ khóa bí mật và bị chiếm quyền máy chủ trước khi đưa lên Production.
- **Required Agent**: `agent-security-inspector`
- **Required MCP**: `codetrust_scan_security`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string, sourceFiles: string[] }`
- **Output**: `{ findings: SecurityFinding[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Tự ý ghi log nguyên văn secret chưa được che giấu (masking). Đã giải quyết bằng thuật toán masking `sk-...XXXX`.
- **Failure Cases**: File mã hóa nhị phân hoặc dung lượng >50MB.
- **Testing**: Test cases bắt chuẩn 11 quy tắc trên `samples/sample-vulnerable` và `samples/sample-xss`.
- **Cost**: `$0.00` (Không gọi AI, chạy regex AST cục bộ).
- **Pricing Recommendation**: Miễn phí (Core).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Executive Business Risk & Impact Translator
- **ID**: `core.biz-risk-translator`
- **Version**: `1.0.0`
- **Category**: `Core`
- **Purpose**: Đóng vai trò là thông dịch viên nghiệp vụ, dịch các lỗi kỹ thuật trừu tượng sang ngôn ngữ kinh doanh (tiền bạc, danh tiếng, rủi ro pháp lý) bằng tiếng Việt rõ ràng.
- **Problem Solved**: Non-Tech Founders đọc thông báo lỗi như "SQL Injection CWE-89" không hiểu rủi ro kinh doanh là gì để quyết định duyệt hay từ chối.
- **Target Users**: Non-Tech Founders, Business Executives, Product Owners.
- **User Value**: Giúp người quản trị ra quyết định nghiệm thu chính xác trên góc độ kinh doanh.
- **Required Agent**: `agent-semantic-logic`
- **Required MCP**: *(DeepSeek Chat API direct with Strict JSON & Zod)*
- **Dependencies**: `core.repo-recon`, `core.static-sec-scan`
- **Input**: `{ projectInfo: ProjectInfo, findings: SecurityFinding[], sampleSnippets: Array<{file, content}> }`
- **Output**: `{ executiveSummary: ExecutiveSummary }`
- **Permissions**: `['ANALYZE', 'REPORT']`
- **Security Risks**: Gửi thông tin bí mật lên server AI bên thứ ba. Đã giải quyết bằng bước mask secrets trước khi gửi prompt.
- **Failure Cases**: DeepSeek API mất mạng hoặc hết quota -> Tự động chuyển sang Heuristic Fallback Engine trong <1ms.
- **Testing**: Kiểm thử Zod schema parse thành công; kiểm thử fallback khi ngắt kết nối mạng.
- **Cost**: `~$0.001 - $0.003` / lần chạy.
- **Pricing Recommendation**: Miễn phí (Core).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Transparent Trust Scorecard & Grading Engine
- **ID**: `core.trust-scorecard`
- **Version**: `1.0.0`
- **Category**: `Core`
- **Purpose**: Tính toán bảng điểm tin cậy minh bạch (0-100) theo công thức trọng số: Bảo mật (40%), Logic (35%), Ổn định cấu trúc (25%) kèm xếp loại chữ cái `A+`, `A`, `B`, `C`, `F`.
- **Problem Solved**: Đánh giá chất lượng code thường mang tính cảm tính, không có thước đo định lượng minh bạch giữa khách hàng và đội ngũ phát triển.
- **Target Users**: All Stakeholders (Founders, PMs, Devs, QA).
- **User Value**: Con số định lượng rõ ràng giúp xác định điều kiện chuyển tiền nghiệm thu theo hợp đồng.
- **Required Agent**: `agent-quality-uat`
- **Required MCP**: *(Nội bộ)*
- **Dependencies**: `core.static-sec-scan`, `core.repo-recon`
- **Input**: `{ findings: SecurityFinding[], projectInfo: ProjectInfo }`
- **Output**: `{ scores: Scores }`
- **Permissions**: `['ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Không có dữ liệu đầu vào.
- **Testing**: Unit test kiểm thử biên điểm số: dự án sạch đạt $\ge 90$ (A+), dự án lộ khóa đạt $\le 50$ (F).
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Miễn phí (Core).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Interactive 3-Step Acceptance Checklist Generator
- **ID**: `core.interactive-uat`
- **Version**: `1.0.0`
- **Category**: `Core`
- **Purpose**: Tự động sinh kịch bản kiểm thử nghiệm thu người dùng (UAT) trực quan gồm 3-5 bước hành động thực tế có ô đánh dấu checkbox trên giao diện web hoặc file HTML báo cáo.
- **Problem Solved**: Người quản lý không biết bắt đầu kiểm tra tính năng từ đâu, thường chỉ nhìn giao diện mà không thử các luồng hoạt động then chốt.
- **Target Users**: Non-Tech Founders, QA Testers, Project Managers.
- **User Value**: Trao quyền để người dùng tự tay kiểm chứng ứng dụng chạy thực tế trước khi bấm nghiệm thu.
- **Required Agent**: `agent-semantic-logic`
- **Required MCP**: `codetrust_generate_uat`
- **Dependencies**: `core.repo-recon`, `core.biz-risk-translator`
- **Input**: `{ projectInfo: ProjectInfo, findings: SecurityFinding[] }`
- **Output**: `{ uatChecklist: UATStep[] }`
- **Permissions**: `['ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: AI sinh bước kiểm thử phi thực tế khi codebase thiếu tài liệu mô tả.
- **Testing**: Test case xác nhận checklist sinh đủ 3 bước có trường `step`, `action`, `expectedResult`.
- **Cost**: `~$0.001` / lần chạy.
- **Pricing Recommendation**: Miễn phí (Core).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Git PR Diff & Incremental Code Auditor
- **ID**: `opt.pr-diff-auditor`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Thẩm định riêng biệt các dòng mã nguồn mới được thêm vào hoặc sửa đổi trong Git Pull Request / Commit Diff.
- **Problem Solved**: Mỗi lần commit lại quét toàn bộ dự án gây chậm tiến độ CI/CD và tốn chi phí gọi LLM không cần thiết.
- **Target Users**: DevOps Engineers, Tech Leads, Code Reviewers.
- **User Value**: Phản hồi kết quả audit trên GitHub PR trong vòng <5 giây, tự động chặn merge nếu phát hiện lỗ hổng Critical.
- **Required Agent**: `agent-orchestrator`
- **Required MCP**: `codetrust_scan_security`
- **Dependencies**: `core.static-sec-scan`
- **Input**: `{ baseBranch: string, headBranch: string, repoPath: string }`
- **Output**: `{ modifiedFilesCount: number, incrementalFindings: SecurityFinding[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Git conflict; tệp nhị phân lớn.
- **Testing**: Chạy trong GitHub Actions workflow `.github/workflows/pr-audit.yml`.
- **Cost**: `$0.00 - $0.001`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P1`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: Dependency Vulnerability & CVE Hunter
- **ID**: `opt.dep-cve-hunter`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Phân tích file lock (`pnpm-lock.yaml`, `package-lock.json`, `poetry.lock`) đối chiếu kho dữ liệu quốc gia (NVD / GitHub Advisory) để phát hiện lỗ hổng chuỗi cung ứng (Software Supply Chain).
- **Problem Solved**: Mã nguồn do lập trình viên viết có thể an toàn, nhưng các thư viện npm cài thêm chứa lỗ hổng RCE nghiêm trọng.
- **Target Users**: Security Engineers, Backend Developers.
- **User Value**: Bảo vệ ứng dụng khỏi các cuộc tấn công qua bên thứ ba (Supply Chain Attacks).
- **Required Agent**: `agent-security-inspector`
- **Required MCP**: `codetrust_scan_security`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string, lockfileType?: string }`
- **Output**: `{ vulnerableDeps: Array<{ package: string, installed: string, cveId: string, severity: string, fixVersion: string }> }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Mất kết nối tới cơ sở dữ liệu tra cứu CVE ngoại tuyến.
- **Testing**: Phân tích lockfile mẫu có chứa thư viện lỗi thời (như `lodash < 4.17.21`).
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P1`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: REST API & OpenAPI Contract Integrity Validator
- **ID**: `opt.api-contract-validator`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Quét cấu trúc các router API trong backend (Express, FastAPI), kiểm tra xác thực tham số đầu vào (Zod, Pydantic, Joi) và so khớp với file tài liệu OpenAPI/Swagger.
- **Problem Solved**: Endpoint không có validation schema dẫn đến lỗi crash server hoặc tấn công Mass Assignment.
- **Target Users**: Backend Developers, API Architects.
- **User Value**: Đảm bảo Backend có tính ổn định cao và tài liệu API luôn đồng bộ với code thực tế.
- **Required Agent**: `agent-repo-analyst`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string, swaggerPath?: string }`
- **Output**: `{ unvalidatedEndpoints: string[], schemaDiscrepancies: string[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: File swagger bị sai cú pháp YAML.
- **Testing**: Kiểm thử router Express có và không có middleware validate Zod.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P1`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: Compromised Secret Rotation & Incident Remediation
- **ID**: `opt.secret-rotation-advisor`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Tự động tạo kịch bản xử lý sự cố (Runbook) từng bước để thu hồi khóa API bị lộ trên Git và cấu hình lại Key Management Service.
- **Problem Solved**: Khi lỡ commit API key lên GitHub, lập trình viên thường hoảng loạn, xóa commit sai cách hoặc không biết link vào dashboard để revoke key.
- **Target Users**: Developers, Engineering Managers.
- **User Value**: Dập tắt sự cố lộ bí mật trong vòng 15 phút, bảo vệ số dư tài khoản cloud.
- **Required Agent**: `agent-semantic-logic`
- **Required MCP**: *(Nội bộ)*
- **Dependencies**: `core.static-sec-scan`
- **Input**: `{ exposedKeyFindings: SecurityFinding[] }`
- **Output**: `{ remediationRunbook: Array<{ provider: string, revokeUrl: string, rotationSteps: string[] }> }`
- **Permissions**: `['ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Khóa API thuộc nhà cung cấp nội bộ không có tài liệu công khai.
- **Testing**: Tạo runbook thử nghiệm cho OpenAI, GitHub PAT, AWS Access Key.
- **Cost**: `~$0.001`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P1`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: Code Smell & Maintainability Index Radar
- **ID**: `opt.code-maintainability-radar`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Đo lường chỉ số duy trì mã nguồn (Maintainability Index), tìm file quá dài (>800 LOC), hàm lồng nhau quá sâu (>4 cấp) và mã nguồn bị bỏ quên (Dead Code).
- **Problem Solved**: Code phình to không kiểm soát, khó refactor và gia tăng rủi ro sinh bug mới.
- **Target Users**: Tech Leads, Senior Engineers.
- **User Value**: Giữ cho codebase luôn sạch sẽ, giảm 40% thời gian đào tạo lập trình viên mới.
- **Required Agent**: `agent-repo-analyst`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string, maxLocThreshold?: number }`
- **Output**: `{ maintainabilityIndex: number, godFiles: string[], complexFunctions: string[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Code đã bị đóng gói bundle/minify.
- **Testing**: Đo LOC và độ lồng sâu của các file trong `samples/`.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P2`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: Environment Configuration & Secret Drift Auditor
- **ID**: `opt.env-config-auditor`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Đối chiếu các biến môi trường trong code với file mẫu `.env.example`, phát hiện các biến thiếu hoặc giá trị mặc định thiếu an toàn.
- **Problem Solved**: Ứng dụng chạy được trên máy dev nhưng deploy lên Production bị crash do thiếu biến cấu hình môi trường.
- **Target Users**: DevOps, Full-stack Developers.
- **User Value**: Triển khai ứng dụng lên server suôn sẻ ngay trong lần bấm deploy đầu tiên.
- **Required Agent**: `agent-security-inspector`
- **Required MCP**: `codetrust_scan_security`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string }`
- **Output**: `{ missingEnvVars: string[], unencryptedSecretsInSample: string[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Nguy cơ đọc phải secret thật trong `.env`. Cần loại trừ `.env` khỏi báo cáo công khai.
- **Failure Cases**: Dự án không có file `.env.example`.
- **Testing**: So sánh biến `DATABASE_URL`, `PORT`, `JWT_SECRET` với `.env.example`.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P1`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: Automated Test Gap & Critical Flow Analyst
- **ID**: `opt.test-coverage-gap-analyst`
- **Version**: `1.0.0`
- **Category**: `Optional`
- **Purpose**: Quét thư mục test của dự án, phát hiện các luồng nghiệp vụ nhạy cảm (Đăng nhập, Thanh toán, Phân quyền) chưa có kiểm thử tự động bảo vệ.
- **Problem Solved**: Dự án có điểm số test cao nhưng chỉ test các hàm tiện ích vặt, bỏ sót các luồng kinh doanh cốt lõi.
- **Target Users**: QA Leads, Product Managers.
- **User Value**: Nắm rõ các "điểm mù" kỹ thuật có nguy cơ gây thiệt hại doanh thu trước ngày ra mắt.
- **Required Agent**: `agent-repo-analyst`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string }`
- **Output**: `{ hasTestFramework: boolean, testFilesCount: number, uncoveredCriticalRoutes: string[] }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Dự án dùng framework test không phổ biến.
- **Testing**: Quét thử trên dự án có `tests/` và dự án không có `tests/`.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Gói Pro ($29/tháng).
- **Priority**: `P2`
- **Status**: `AVAILABLE_OPTIONAL`

---

### # Skill: OWASP Top 10 Enterprise Compliance Certifier
- **ID**: `prem.owasp-top10-certifier`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Thẩm định toàn diện đối chiếu theo 10 hạng mục tiêu chuẩn an toàn ứng dụng web của tổ chức OWASP và cấp hồ sơ chứng nhận tuân thủ.
- **Problem Solved**: Khi bán phần mềm cho khách hàng doanh nghiệp lớn hoặc ngân hàng, họ yêu cầu phải có báo cáo tuân thủ OWASP Top 10.
- **Target Users**: B2B SaaS Founders, Enterprise Tech Leads, CISO.
- **User Value**: Vượt qua khâu thẩm định bảo mật của khách hàng doanh nghiệp, đẩy nhanh tốc độ chốt hợp đồng.
- **Required Agent**: `agent-security-inspector`
- **Required MCP**: `codetrust_scan_security`, `codetrust_audit`
- **Dependencies**: `core.static-sec-scan`, `core.trust-scorecard`
- **Input**: `{ targetPath: string, enterpriseName: string }`
- **Output**: `{ owaspMatrix: Record<string, { passed: boolean, details: string[] }>, certificationStatus: "CERTIFIED" | "NON_COMPLIANT" }`
- **Permissions**: `['READ', 'ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Phát hiện lỗi Broken Access Control hoặc Cryptographic Failures.
- **Testing**: Kiểm thử đối chiếu trên 10 tiêu chuẩn OWASP mới nhất.
- **Cost**: `~$0.01 - $0.03`.
- **Pricing Recommendation**: Skill Store ($49/tháng hoặc $199/lần audit).
- **Priority**: `P1`
- **Status**: `PREMIUM_READY`

---

### # Skill: SOC 2 Type II & ISO 27001 Readiness Inspector
- **ID**: `prem.soc2-iso27001-readiness`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Đánh giá kiến trúc mã nguồn và kiểm soát dữ liệu theo các tiêu chí Trust Services Criteria của SOC 2 Type II và hệ thống quản lý an toàn thông tin ISO 27001.
- **Problem Solved**: Thuê công ty tư vấn an ninh mạng bên ngoài để chuẩn bị cho SOC 2 thường tốn $20,000 - $50,000.
- **Target Users**: FinTech / HealthTech Startups, Compliance Managers.
- **User Value**: Tiết kiệm hàng chục nghìn USD và 3 tháng chuẩn bị tài liệu trước khi kiểm toán chính thức.
- **Required Agent**: `agent-orchestrator`
- **Required MCP**: `codetrust_audit`
- **Dependencies**: `core.static-sec-scan`, `opt.env-config-auditor`
- **Input**: `{ targetPath: string, standard: "SOC2" | "ISO27001" }`
- **Output**: `{ readinessScore: number, auditGaps: string[], actionPlan: string[] }`
- **Permissions**: `['READ', 'ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Hệ thống thiếu cơ chế ghi nhật ký kiểm toán (Audit Logging).
- **Testing**: Kiểm thử trên cấu trúc microservice mẫu.
- **Cost**: `~$0.02`.
- **Pricing Recommendation**: Skill Store ($99/tháng).
- **Priority**: `P2`
- **Status**: `PREMIUM_READY`

---

### # Skill: Autonomous Security Fix & PR Patch Generator
- **ID**: `prem.auto-pr-patch-generator`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Tự động viết mã sửa lỗi (Code Remediation), kiểm tra lại để đảm bảo không làm gãy test và mở Pull Request sẵn sàng để merge trên GitHub.
- **Problem Solved**: Tìm ra lỗi bảo mật nhưng lập trình viên không biết cách sửa hoặc mất nhiều ngày mới sửa xong.
- **Target Users**: Engineering Managers, Solo Founders.
- **User Value**: Giảm thời gian khắc phục lỗ hổng (MTTR) từ 3 ngày xuống còn 3 phút chỉ với 1 click.
- **Required Agent**: `agent-orchestrator`
- **Required MCP**: `codetrust_scan_security`
- **Dependencies**: `core.static-sec-scan`, `opt.pr-diff-auditor`
- **Input**: `{ findingId: string, filePath: string, targetBranch: string }`
- **Output**: `{ patchDiff: string, prUrl?: string, verifiedBuild: boolean }`
- **Permissions**: `['READ', 'ANALYZE', 'EXECUTE']`
- **Security Risks**: Tự ý commit mã lạ nếu không có bước xác nhận của con người (Human-in-the-loop).
- **Failure Cases**: Bản vá sửa lỗi bảo mật nhưng làm hỏng luồng nghiệp vụ khác.
- **Testing**: Tự động vá lỗ hổng SQLi bằng Prepared Statements và chạy lại unit test.
- **Cost**: `~$0.015`.
- **Pricing Recommendation**: Trả theo lượt ($2/lần sinh PR thành công).
- **Priority**: `P1`
- **Status**: `PREMIUM_READY`

---

### # Skill: Containerized Playwright Visual UI & Sandbox Verifier
- **ID**: `prem.playwright-visual-sandbox`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Build và khởi chạy ứng dụng trong Container Docker cô lập, dùng Playwright để chụp ảnh màn hình các trang chính và kiểm tra lỗi JavaScript Console.
- **Problem Solved**: Code vượt qua kiểm tra tĩnh nhưng khi mở trình duyệt lại bị màn hình trắng (White Screen of Death) hoặc CSS bị vỡ.
- **Target Users**: Designers, Product Managers, Founders.
- **User Value**: Mắt thấy tai nghe giao diện thực tế của ứng dụng hoạt động mà không cần tự cài đặt môi trường trên máy.
- **Required Agent**: `agent-quality-uat`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: `core.repo-recon`, `core.interactive-uat`
- **Input**: `{ targetPath: string, port?: number, headless?: boolean }`
- **Output**: `{ screenshotUrls: string[], consoleErrors: string[], visualStabilityScore: number }`
- **Permissions**: `['READ', 'EXECUTE', 'REPORT']`
- **Security Risks**: Chạy mã lạ trên máy chủ nếu không có sandbox Container cô lập mạng.
- **Failure Cases**: Ứng dụng không khởi động được do thiếu cơ sở dữ liệu.
- **Testing**: Chạy snapshot trên ứng dụng web mẫu.
- **Cost**: `~$0.05` (Chi phí điện toán Container).
- **Pricing Recommendation**: Trả theo lượt ($0.50/lần test visual).
- **Priority**: `P2`
- **Status**: `PREMIUM_SPECIFIED`

---

### # Skill: Open Source License & IP Risk Auditor
- **ID**: `prem.license-ip-compliance`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Rà soát giấy phép của tất cả thư viện phụ thuộc, phát hiện các giấy phép có tính "lây nhiễm" (GPL, AGPL) đe dọa bản quyền mã nguồn độc quyền của công ty.
- **Problem Solved**: Dùng nhầm thư viện GPL có thể buộc startup phải mở toàn bộ mã nguồn sản phẩm ra cộng đồng, làm sụp đổ thương vụ gọi vốn.
- **Target Users**: Startup Founders, Legal Counsels, Venture Capitalists.
- **User Value**: Bảo đảm 100% quyền sở hữu trí tuệ trước khi tiến hành gọi vốn hoặc M&A.
- **Required Agent**: `agent-repo-analyst`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string, proprietaryLicenseType?: string }`
- **Output**: `{ licensesDetected: Record<string, number>, viralLicenseRisks: string[], legalRiskScore: number }`
- **Permissions**: `['READ', 'ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Thư viện không có thông tin giấy phép rõ ràng.
- **Testing**: Quét phát hiện thư viện có giấy phép AGPL trong `package.json`.
- **Cost**: `$0.00 - $0.001`.
- **Pricing Recommendation**: Gói Business ($49/tháng).
- **Priority**: `P1`
- **Status**: `PREMIUM_READY`

---

### # Skill: Database Migration & Query Performance Auditor
- **ID**: `prem.db-migration-safety`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Thẩm định các file migration SQL (Prisma, TypeORM, Knex), phát hiện câu lệnh xóa cột/bảng nguy hiểm, khóa bảng độc quyền hoặc câu lệnh thiếu index.
- **Problem Solved**: Chạy migration trên Production gây sập hệ thống hoặc làm gián đoạn dịch vụ của người dùng.
- **Target Users**: Database Administrators, Backend Engineers.
- **User Value**: Bảo vệ tính liên tục của dữ liệu và hệ thống khi cập nhật phiên bản.
- **Required Agent**: `agent-security-inspector`
- **Required MCP**: `codetrust_scan_security`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string, migrationDir?: string }`
- **Output**: `{ destructiveOperations: string[], missingIndexes: string[], riskLevel: "LOW" | "MEDIUM" | "HIGH" }`
- **Permissions**: `['READ', 'ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Dự án không dùng ORM/Migration có cấu trúc.
- **Testing**: Bắt các câu lệnh `DROP TABLE`, `ALTER TABLE ... NOT NULL` không có default value.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Gói Business ($49/tháng).
- **Priority**: `P2`
- **Status**: `PREMIUM_READY`

---

### # Skill: Cloud Infrastructure & AI Token FinOps Auditor
- **ID**: `prem.cloud-finops-auditor`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Phân tích cấu hình hạ tầng đám mây (Docker, Terraform, Vercel) và tần suất gọi API AI để dự báo hóa đơn chi phí hàng tháng.
- **Problem Solved**: Startup bị sốc hóa đơn đám mây (Cloud Bill Shock) hàng chục nghìn USD do cấu hình máy chủ quá đà hoặc vòng lặp gọi AI vô hạn.
- **Target Users**: CTOs, Finance Managers, Cloud Architects.
- **User Value**: Tối ưu hóa chi phí vận hành, tiết kiệm 30-50% chi phí đám mây mỗi tháng.
- **Required Agent**: `agent-orchestrator`
- **Required MCP**: `codetrust_inspect_project`
- **Dependencies**: `core.repo-recon`
- **Input**: `{ targetPath: string }`
- **Output**: `{ monthlyEstimatedCloudCost: string, tokenOptimizationTips: string[], wasteScore: number }`
- **Permissions**: `['READ', 'ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Thiếu file cấu hình đám mây trong repository.
- **Testing**: Phân tích Dockerfile đa tầng và tính toán tài nguyên RAM/CPU cấp phát.
- **Cost**: `~$0.005`.
- **Pricing Recommendation**: Gói Enterprise ($199/tháng).
- **Priority**: `P2`
- **Status**: `PREMIUM_READY`

---

### # Skill: Executive Board Deck & PDF Audit Dossier Generator
- **ID**: `prem.executive-pdf-deck-generator`
- **Version**: `1.0.0`
- **Category**: `Premium`
- **Purpose**: Xuất hồ sơ thẩm định công nghệ chuyên nghiệp định dạng PDF đóng dấu bảo mật và slide thuyết trình tóm tắt dành cho Hội đồng Quản trị.
- **Problem Solved**: Báo cáo kỹ thuật dạng console log hay JSON không thể dùng để thuyết trình trước các nhà đầu tư và đối tác tài chính.
- **Target Users**: Startup Founders, Fund Managers, Advisors.
- **User Value**: Nâng cao uy tín chuyên nghiệp của startup trong các buổi thẩm định kỹ thuật (Technical Due Diligence).
- **Required Agent**: `agent-quality-uat`
- **Required MCP**: `codetrust_audit`
- **Dependencies**: `core.trust-scorecard`, `core.biz-risk-translator`
- **Input**: `{ auditReportId: string, companyLogoUrl?: string }`
- **Output**: `{ pdfDownloadUrl: string, deckPresentationUrl: string }`
- **Permissions**: `['READ', 'ANALYZE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Trình tạo PDF canvas bị lỗi font tiếng Việt.
- **Testing**: Xuất thử mẫu PDF hoàn chỉnh từ kết quả audit.
- **Cost**: `~$0.01`.
- **Pricing Recommendation**: Trả theo lượt ($15/lần xuất dossier).
- **Priority**: `P2`
- **Status**: `PREMIUM_READY`

---

### # Skill: Supervisor Task Router & Conflict Resolver
- **ID**: `int.agent-task-router`
- **Version**: `1.0.0`
- **Category**: `Internal`
- **Purpose**: Điều phối thứ tự thực thi của các tác tử, phát hiện sai lệch dữ liệu giữa các sub-agents và ra quyết định kết luận cuối cùng (`verdict`).
- **Problem Solved**: Ngăn ngừa tình trạng các tác tử đưa ra kết luận mâu thuẫn (Ví dụ: Tác tử Bảo mật báo Đạt nhưng Tác tử Logic lại báo Hỏng).
- **Target Users**: Core Multi-Agent Supervisor Engine.
- **User Value**: Đảm bảo báo cáo thẩm định luôn nhất quán và chính xác 100%.
- **Required Agent**: `agent-orchestrator`
- **Required MCP**: *(Nội bộ)*
- **Dependencies**: Không có.
- **Input**: `{ tasks: AgentTask[] }`
- **Output**: `{ resolvedPlan: AgentTask[], executionOrder: string[] }`
- **Permissions**: `['READ', 'ANALYZE', 'EXECUTE', 'REPORT']`
- **Security Risks**: Không có.
- **Failure Cases**: Deadlock giữa các tác tử.
- **Testing**: Kiểm thử giải quyết xung đột khi có lỗi Critical.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Nội bộ (Không bán).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Token Economics & KV Prompt Cache Optimizer
- **ID**: `int.token-economics-guardian`
- **Version**: `1.0.0`
- **Category**: `Internal`
- **Purpose**: Tự động cấu trúc các prompt gửi sang DeepSeek sao cho phần System Prompt tĩnh luôn nằm đầu để kích hoạt tối đa bộ nhớ đệm KV Cache.
- **Problem Solved**: Chi phí token AI tăng cao khi liên tục gửi các hướng dẫn vai trò và schema dài lặp đi lặp lại.
- **Target Users**: Core AI Gateway.
- **User Value**: Giảm 90% chi phí gọi DeepSeek API, giữ cho nền tảng luôn có lãi biên cao.
- **Required Agent**: `agent-semantic-logic`
- **Required MCP**: *(Nội bộ)*
- **Dependencies**: Không có.
- **Input**: `{ rawPrompt: string, systemPromptPrefix: string }`
- **Output**: `{ optimizedPrompt: string, cacheHitEstimatePercentage: number }`
- **Permissions**: `['ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Thứ tự prompt bị xáo trộn.
- **Testing**: Kiểm tra tính cố định của System Prompt qua các lần gọi.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Nội bộ (Không bán).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Zero-Trust Sandbox & Workspace Isolation Guard
- **ID**: `int.sandbox-execution-guard`
- **Version**: `1.0.0`
- **Category**: `Internal`
- **Purpose**: Kiểm soát chặt chẽ ranh giới đọc/ghi thư mục tạm, ngăn chặn tuyệt đối các cuộc tấn công Path Traversal và tự động dọn dẹp bộ nhớ đệm.
- **Problem Solved**: Tệp zip hoặc đường dẫn do người dùng tải lên có thể chứa tên file nguy hại ghi đè tệp hệ thống (`../../etc/passwd`).
- **Target Users**: Server Infrastructure Runtime.
- **User Value**: Bảo đảm an toàn tuyệt đối cho máy chủ phục vụ kiểm toán mã nguồn.
- **Required Agent**: `agent-orchestrator`
- **Required MCP**: *(Nội bộ)*
- **Dependencies**: Không có.
- **Input**: `{ workspacePath: string, operation: "CREATE" | "READ" | "DELETE" }`
- **Output**: `{ isAllowed: boolean, violationReason?: string }`
- **Permissions**: `['READ', 'EXECUTE']`
- **Security Risks**: Khai thác symlink trỏ ra ngoài thư mục làm việc.
- **Failure Cases**: Phát hiện đường dẫn bất hợp pháp -> Chặn ngay lập tức.
- **Testing**: 14 test cases thử nghiệm các kiểu tấn công Path Traversal trong `tests/audit.test.ts`.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Nội bộ (Không bán).
- **Priority**: `P0`
- **Status**: `PRODUCTION_READY`

---

### # Skill: Context Compactor & AST Pruning Memory Manager
- **ID**: `int.context-memory-compactor`
- **Version**: `1.0.0`
- **Category**: `Internal`
- **Purpose**: Rút gọn ngữ cảnh thông minh đối với các dự án lớn (>500 file), chỉ cắt chữ ký hàm và các đoạn mã liên quan tới lỗ hổng bảo mật gửi tới AI.
- **Problem Solved**: Tràn cửa sổ ngữ cảnh (Context Window Limit) của mô hình AI và giảm thời gian chờ đợi phản hồi của người dùng.
- **Target Users**: Agent Semantic Pipeline.
- **User Value**: Tăng tốc độ phân tích lên 300% và giữ chi phí gọi AI luôn ở mức tối thiểu.
- **Required Agent**: `agent-semantic-logic`
- **Required MCP**: *(Nội bộ)*
- **Dependencies**: `core.repo-recon`
- **Input**: `{ sourceFiles: string[], maxContextChars: number }`
- **Output**: `{ compactedSnippets: Array<{ file: string, snippet: string }> }`
- **Permissions**: `['ANALYZE']`
- **Security Risks**: Không có.
- **Failure Cases**: Cắt sót đoạn mã chứa lỗi logic quan trọng.
- **Testing**: Rút gọn file 2000 dòng xuống snippet 50 dòng chứa dòng code bị cảnh báo.
- **Cost**: `$0.00`.
- **Pricing Recommendation**: Nội bộ (Không bán).
- **Priority**: `P1`
- **Status**: `PRODUCTION_READY`
