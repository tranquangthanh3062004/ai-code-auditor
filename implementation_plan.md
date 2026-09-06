# BẢN ĐÁNH GIÁ KỸ THUẬT & KẾ HOẠCH NÂNG CẤP MASTERPLAN
## Dự án: CodeTrust AI (VibeAuditor)
### Góc nhìn Tech Lead: Tối ưu kiến trúc, Vá lỗ hổng thực thi và Chuẩn hóa Sản phẩm B2B

---

## 1. BẢN REVIEW THẲNG THẮN TỪ TECH LEAD (BRUTAL TECH LEAD AUDIT)

Bản kế hoạch ban đầu có ý tưởng sản phẩm và phân khúc rất tốt, **NHƯNG về mặt kiến trúc kỹ thuật và vận hành thực tế thì đang mắc 5 "lỗ hổng tử huyệt"**. Nếu cứ thế mang đi code thì hệ thống sẽ sập hoặc bị hack ngay tuần đầu tiên:

> [!CAUTION]
> ### 5 Lỗ hổng kỹ thuật chí mạng trong bản kế hoạch cũ:
> 
> 1. **Lỗ hổng thực thi mã độc (Remote Code Execution Disaster)**:
>    - *Vấn đề*: Bạn định cho chạy Playwright để vào app chụp ảnh. Ai sẽ chạy `npm install && npm run dev`? Nếu người dùng tải lên code có script `postinstall` độc hại, hoặc code đào tiền ảo, hoặc code quét trộm file trên server của bạn thì sao?
>    - *Khắc phục*: **Tuyệt đối không chạy code trực tiếp trên host!** Bắt buộc phải có tầng **Ephemeral MicroVM Sandbox (E2B / gVisor / Firecracker)** với network isolation, cấm truy cập metadata cloud, giới hạn 1 vCPU / 1GB RAM và hard timeout 60 giây.
> 
> 2. **Bệnh "Ảo giác bảo mật" nếu chỉ dùng LLM (Hallucination Risk)**:
>    - *Vấn đề*: LLM không phải công cụ quét bảo mật tĩnh đáng tin cậy. Nếu chỉ ném code vào DeepSeek và hỏi "Có lỗi không?", mô hình sẽ hoặc hallucinate ra lỗi không có thật (False Positive làm khách hàng hoang mang), hoặc bỏ sót lỗ hổng chết người (False Negative).
>    - *Khắc phục*: **Mô hình Hybrid 2 tầng (Deterministic Tool + LLM)**:
>      - *Tầng 1 (Công cụ tất định 100% chuẩn)*: Dùng **Semgrep / ESLint Security / Gitleaks** để bắt chính xác secret lộ, SQLi, XSS. Không tốn token, tốc độ mili-giây.
>      - *Tầng 2 (DeepSeek R1/V3)*: Chỉ dùng LLM để phân tích **Logic nghiệp vụ** (Business Logic Flaws) và làm nhiệm vụ **Dịch thuật sang ngôn ngữ đời thường**.
> 
> 3. **Bài toán "Dò cổng và Framework" (Dynamic Runtime Detection)**:
>    - *Vấn đề*: Code người dùng nộp lên có thể là Next.js, Vite, Create-React-App, Vue, Python FastAPI hay pure HTML. Làm sao server biết chạy lệnh gì (`npm run dev`, `pnpm start`, hay `python main.py`) và ứng dụng lắng nghe ở port nào (`3000`, `5173`, `8080`)?
>    - *Khắc phục*: Xây dựng module **Heuristic Project Detector & Port Harvester** tự động nhận diện framework qua `package.json`/cấu trúc file và thăm dò HTTP Health Check (`200 OK`) trước khi báo cho Playwright vào chụp ảnh.
> 
> 4. **Rủi ro vỡ cấu trúc đầu ra (Unstructured Output Failure)**:
>    - *Vấn đề*: Nếu LLM trả về markdown tự do, frontend sẽ không thể parse được điểm số, checklist và biểu đồ.
>    - *Khắc phục*: Cưỡng chế cấu trúc bằng **Zod Schema (JSON Strict Mode)**. Mọi phản hồi của LLM đều phải validate qua schema; nếu sai kiểu dữ liệu, tự động kích hoạt cơ chế retry sửa lỗi.
> 
> 5. **Bằng chứng thị giác phải có tính "Tương tác thực" (Interaction Storyboard)**:
>    - *Vấn đề*: Người non-tech không tin 1 cái ảnh chụp màn hình tĩnh (vì ảnh tĩnh có thể làm giả).
>    - *Khắc phục*: Cung cấp **Storyboard dạng Timeline**: Ảnh 1 (Trang vừa load) ➔ Ảnh 2 (Điền form) ➔ Ảnh 3 (Bấm nút & API trả về 200 OK thành công).

---

## 2. THIẾT KẾ KIẾN TRÚC MỚI: HYBRID 4-LAYER PIPELINE

```
[ ĐẦU VÀO: ZIP / GITHUB REPO ]
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 1: ISOLATED RUNTIME & DETECTION (BẢO VỆ MÔI TRƯỜNG)   │
│  - Heuristic Framework Inspector (Nhận diện Next.js/Vite...)│
│  - MicroVM Sandbox Spawn (Cấp phát E2B container an toàn)   │
│  - Port Harvester & Readiness Prober (Thăm dò HTTP 200)     │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 2: HYBRID SECURITY & AUDIT CORE                        │
│  - Deterministic Linter: Semgrep + Gitleaks (Không ảo giác)  │
│  - Semantic Reasoner: DeepSeek R1 (Bắt lỗi logic nghiệp vụ) │
│  - Test Suite Runner: Tự chạy Vitest/Jest kiểm tra độ bao phủ│
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 3: VISUAL PLAYWRIGHT VERIFICATION (BẰNG CHỨNG THẬT)   │
│  - Headless Browser Automator (Tự thao tác các luồng chính) │
│  - Storyboard Recorder (Chụp chuỗi hành động Before/After)  │
│  - Network Interceptor (Kiểm chứng API thật có chạy không)  │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 4: NON-TECH SYNTHESIS & ZOD SCHEMA REPORTER            │
│  - Business Translator (Dịch technical log sang tiếng Việt) │
│  - Trust Scorecard Engine (Chấm điểm có trọng số minh bạch) │
│  - Interactive UAT Generator (3 bước nghiệm thu 1 click)    │
│  - Standalone Self-contained HTML Report (Không phụ thuộc)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ĐẶC TẢ SCHEMA DỮ LIỆU CHUẨN HOÁ (ZOD STRUCTURED DATA)

Mọi báo cáo thẩm định xuất ra phải tuân thủ nghiêm ngặt cấu trúc Zod sau:

```typescript
// Định dạng chuẩn của 1 Báo Cáo Thẩm Định
export interface AuditReportData {
  meta: {
    projectName: string;
    targetUrl?: string;
    auditTimestamp: string;
    frameworkDetected: string;
  };
  scores: {
    overall: number;          // 0 - 100
    security: number;         // 0 - 100
    businessLogic: number;    // 0 - 100
    visualStability: number;  // 0 - 100
    grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  };
  executiveSummary: {
    headline: string;         // Câu kết luận 1 dòng cho Giám đốc/PM
    verdict: 'APPROVED' | 'NEEDS_REVIEW' | 'REJECTED';
    businessImpactText: string; // Giải thích tính năng bằng tiếng Việt đời thường
    keyRisks: string[];       // 2-3 rủi ro lớn nhất
  };
  securityFindings: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    source: 'SEMGREP' | 'GITLEAKS' | 'AI_REASONING';
    file: string;
    line?: number;
    title: string;
    plainExplanation: string; // Giải thích cho người không biết code
    remediation: string;      // Cách sửa ngắn gọn
  }>;
  visualProof: {
    storyboard: Array<{
      step: number;
      actionName: string;
      screenshotBase64: string;
      networkStatus: number;  // ví dụ: 200 OK
      commentary: string;
    }>;
  };
  uatChecklist: Array<{
    id: string;
    stepNumber: number;
    instruction: string;     // Hướng dẫn click thử
    expectedResult: string;  // Kết quả mong đợi mắt thấy
    testedByAI: boolean;
  }>;
}
```

---

## 4. LỘ TRÌNH TRIỂN KHAI NÂNG CẤP CHI TIẾT (SPRINT ROADMAP)

### Giai đoạn 1: Hạt nhân Thẩm định Tất định + DeepSeek (Core Engine)
- [x] Tạo khung dự án độc lập `E:\project\ai-code-auditor`.
- [ ] Xây dựng `src/engine/heuristic-detector.ts`: Nhận diện framework, file cấu hình, command khởi chạy và port.
- [ ] Xây dựng `src/engine/deterministic-rules.ts`: Quét Regex/Semgrep rules bắt các secret và lỗi SQLi/XSS rõ ràng.
- [ ] Xây dựng `src/engine/deepseek-client.ts`: Tích hợp DeepSeek API với Zod schema strict mode để phân tích logic và dịch thuật.

### Giai đoạn 2: Trực quan hóa Visual Proof & Playwright
- [ ] Xây dựng `src/visual/runtime-runner.ts`: Khởi động app trong sandbox, polling kiểm tra HTTP 200 readiness.
- [ ] Xây dựng `src/visual/storyboard-recorder.ts`: Tự động click các form/nút bấm, chụp ảnh màn hình và encode base64.
- [ ] Xây dựng cơ chế Network Interception để xác nhận API không bị lỗi 500 ngầm.

### Giai đoạn 3: Báo cáo Thẩm định Độc lập (Self-Contained Report)
- [ ] Xây dựng `src/reporter/html-generator.ts`: Xuất ra file `.html` duy nhất (Single-file HTML) nhúng sẵn CSS, JS và ảnh base64. Người dùng chỉ cần mở đúp chuột trên mọi máy tính/điện thoại là xem được toàn bộ báo cáo chuyên nghiệp mà không cần cài đặt thêm gì.
- [ ] Thiết kế giao diện báo cáo chuẩn UI/UX cao cấp: Dark mode, Card chỉ số trực quan, Timeline tương tác.

### Giai đoạn 4: Thử nghiệm thực chiến & CLI
- [ ] Xây dựng bộ mẫu thử nghiệm trong `samples/`:
  - `sample-vulnerable`: Chứa lỗi bảo mật và logic mua hàng 0đ.
  - `sample-clean`: Code chuẩn mực, có test đầy đủ.
- [ ] Chạy kiểm thử tự động, so sánh kết quả thẩm định để đảm bảo không có False Positive.
