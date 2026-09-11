# KIẾN TRÚC HỆ THỐNG CODETRUST AI
## Production Architecture • Multi-Agent Pipeline • MCP Gateway

---

## 1. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (SYSTEM TOPOLOGY)

```
                     NGƯỜI DÙNG / TÁC TỬ BÊN NGOÀI
          ┌───────────────────────┬────────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
     [ CLI Tool ]           [ Web UI ]            [ MCP Client ]
  (codetrust bin.ts)      (app.js & HTML5)     (Claude / Cursor / IDE)
          │                       │                        │
          │                       ▼                        │
          │             [ Express REST API ]               │
          │            (server/index.ts :4000)             │
          │                       │                        │
          └───────────────────────┼────────────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │        AUDIT ORCHESTRATOR         │
                │     (src/agents/orchestrator.ts)  │
                └─────────────────┬─────────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
       ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ REPO ANALYST │          │   SECURITY   │          │   SEMANTIC   │
│    AGENT     │          │  INSPECTOR   │          │ LOGIC AGENT  │
│              │          │    AGENT     │          │ (DeepSeek R1/│
│(Heuristic    │          │(Zero-Hallu-  │          │ V3 + Fallback│
│ Framework    │          │ cination 11  │          │ + Zod Strict)│
│ Detector)    │          │ Rules Engine)│          │              │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   QUALITY & UAT AGENT │
                     │   (Scorecard Engine & │
                     │    UAT Checklist Gen) │
                     └───────────┬───────────┘
                                 │
                                 ▼
                   ┌───────────────────────────┐
                   │    SYNTHESIS & OUTPUT     │
                   │  - Single-File HTML       │
                   │  - JSON Report Schema     │
                   │  - Realtime Telemetry     │
                   └───────────────────────────┘
```

---

## 2. CÁC TẦNG KIẾN TRÚC CỐT LÕI (CORE ARCHITECTURAL TIERS)

### 2.1. Tầng Giao Tiếp & Tích Hợp (Ingestion & Gateways)
- **REST API Server (`server/index.ts`)**:
  - Cung cấp các endpoint: `/api/health`, `/api/audit/path`, `/api/audit/sample`, `/api/audit/files`, `/api/reports/:id`.
  - Tích hợp màng bảo vệ `isSafeRelativePath` chống tấn công **Path Traversal**.
  - Bounded in-memory Cache (tối đa 50 báo cáo, TTL 60 phút) chống tràn RAM.
- **Model Context Protocol Server (`src/mcp/`)**:
  - Giao tiếp hai chiều qua chuẩn JSON-RPC 2.0 trên stdio.
  - Cho phép các công cụ lập trình AI (Cursor, Claude Desktop, Antigravity) kích hoạt kiểm toán mã nguồn trực tiếp từ IDE.
- **Dòng lệnh CLI (`src/cli/bin.ts`)**:
  - Chạy nhanh qua terminal: `codetrust [path] [-o report.html] [--json]`.

### 2.2. Tầng Multi-Agent Điều Phối (`src/agents/`)
- **`AuditOrchestrator`**:
  - Quản lý vòng đời kiểm toán, khởi tạo và giao việc tuần tự hoặc song song cho các sub-agents.
  - Đo lường thời gian thực thi của từng tác tử (`task.durationMs`), phát hiện và xử lý lỗi hồi quy.
- **`RepoAnalystAgent`**:
  - Trinh sát cấu trúc cây thư mục, bỏ qua các thư mục `node_modules`, `.git`, `dist`, `vendor`.
  - Nhận diện chính xác framework lập trình, package manager, entrypoint và port dự kiến.
- **`SecurityInspectorAgent`**:
  - Thực thi bộ quy tắc phân tích tĩnh tất định (Deterministic Static Scanner) gồm 11 quy tắc OWASP/Secret leaks.
  - Che giấu (mask) các thông tin nhạy cảm trước khi đưa vào báo cáo.
- **`SemanticLogicAgent`**:
  - Kết nối DeepSeek Chat API với chế độ `json_object` và schema Zod nghiêm ngặt.
  - Tự động chuyển đổi sang Heuristic Fallback Engine khi mất kết nối hoặc tài khoản hết quota.
- **`QualityUATAgent`**:
  - Tính toán Bảng điểm Tin cậy (Trust Scorecard: 0 - 100) có trọng số: Bảo mật (40%), Logic (35%), Ổn định (25%).
  - Xếp hạng chữ cái trực quan: `A+`, `A`, `B`, `C`, `F`.

### 2.3. Tầng Báo Cáo & Trực Quan Hóa (`src/reporter/`)
- **`HtmlReportGenerator`**:
  - Sinh file HTML độc lập (Single-file Self-contained) nhúng sẵn toàn bộ CSS, SVG icons và JavaScript tương tác.
  - Cung cấp checklist kiểm thử nghiệm thu 3 bước (Interactive UAT) cho người quản lý không biết code.

---

## 3. NGUYÊN TẮC BẢO MẬT & ZERO-HALLUCINATION

1. **Zero-Hallucination cho Lỗ hổng Bảo mật**:
   - Không phụ thuộc vào LLM để tìm secret leak hoặc SQL Injection.
   - Các lỗi cứng (Hard findings) được xác định bằng regex và AST tất định 100%.
2. **Cưỡng chế Cấu trúc Dữ liệu (Strict Zod Schemas)**:
   - Toàn bộ dữ liệu đầu ra từ LLM hoặc API đều được thẩm định qua `AuditReportSchema`.
   - Nếu LLM sinh sai kiểu dữ liệu, hệ thống tự động fallback an toàn, không bao giờ làm sập ứng dụng.
3. **Phòng thủ Chiều sâu (Defense-in-Depth)**:
   - Các file upload được ghi vào thư mục tạm `os.tmpdir()` tách biệt và bị xóa sạch trong khối `finally`.
   - Đường dẫn tương đối được chuẩn hóa và kiểm tra ranh giới nghiêm ngặt trước khi ghi đĩa.
