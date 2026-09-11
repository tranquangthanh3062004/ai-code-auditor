# ĐẶC TẢ CỔNG KẾT NỐI MCP (MODEL CONTEXT PROTOCOL ARCHITECTURE)
## Tích hợp CodeTrust AI vào Claude Desktop, Cursor và Antigravity

---

## 1. MÔ HÌNH HOẠT ĐỘNG (MCP TOPOLOGY)

**Model Context Protocol (MCP)** là tiêu chuẩn mở cho phép các mô hình ngôn ngữ và trợ lý lập trình kết nối an toàn với các công cụ thẩm định của CodeTrust AI:

```
┌────────────────────────────────────────────────────────┐
│             HOST CLIENT (AI ASSISTANT)                 │
│       Claude Desktop / Cursor / Antigravity            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ JSON-RPC 2.0 (stdio)
                           ▼
┌────────────────────────────────────────────────────────┐
│            CODETRUST MCP SERVER (src/mcp/)             │
│            (Protocol Version: 2024-11-05)              │
│                                                        │
│  ├── Protocol Dispatcher (initialize, ping, list, call)│
│  └── Tool Handlers Registry                            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           CODETRUST MULTI-AGENT CORE ENGINE            │
│  - AuditOrchestrator                                   │
│  - HeuristicDetector                                   │
│  - DeterministicScanner                                │
│  - ScorecardCalculator                                 │
└────────────────────────────────────────────────────────┘
```

---

## 2. DANH SÁCH CÁC MCP TOOLS CUNG CẤP (AVAILABLE TOOLS)

### 2.1. `codetrust_audit`
- **Mô tả**: Thẩm định toàn diện dự án mã nguồn bằng hệ thống Multi-Agent (Bảo mật, Logic, Điểm số & UAT Checklist).
- **Tham số (Input Schema)**:
  ```json
  {
    "type": "object",
    "properties": {
      "targetPath": {
        "type": "string",
        "description": "Đường dẫn tuyệt đối hoặc tương đối tới thư mục dự án cần thẩm định"
      },
      "generateHtml": {
        "type": "boolean",
        "description": "Có xuất file HTML độc lập hay không (mặc định: false)"
      }
    },
    "required": ["targetPath"]
  }
  ```
- **Dữ liệu trả về**:
  - `auditId`: Mã phiên kiểm toán.
  - `verdict`: `APPROVED` | `NEEDS_REVIEW` | `REJECTED`.
  - `headline`: Kết luận một dòng cho nhà quản lý.
  - `scores`: Bảng điểm chi tiết (Overall, Security, Logic, Stability, Grade).
  - `securityFindingsCount`: Tổng số lỗi phát hiện.
  - `criticalFindings`: Danh sách chi tiết các lỗi Critical.
  - `uatChecklist`: Các bước nghiệm thu mắt thấy.

### 2.2. `codetrust_scan_security`
- **Mô tả**: Quét nhanh các lỗ hổng bảo mật tất định 100% không ảo giác (Zero-Hallucination).
- **Tham số (Input Schema)**:
  ```json
  {
    "type": "object",
    "properties": {
      "targetPath": { "type": "string", "description": "Đường dẫn thư mục cần quét" }
    },
    "required": ["targetPath"]
  }
  ```

### 2.3. `codetrust_inspect_project`
- **Mô tả**: Trinh sát cấu trúc framework, file cấu hình, entrypoint, port và thống kê quy mô code.
- **Tham số (Input Schema)**:
  ```json
  {
    "type": "object",
    "properties": {
      "targetPath": { "type": "string", "description": "Đường dẫn thư mục dự án" }
    },
    "required": ["targetPath"]
  }
  ```

### 2.4. `codetrust_generate_uat`
- **Mô tả**: Tạo kịch bản kiểm thử nghiệm thu người dùng (UAT) gồm 3-5 bước dành cho Non-Tech.
- **Tham số (Input Schema)**:
  ```json
  {
    "type": "object",
    "properties": {
      "targetPath": { "type": "string", "description": "Đường dẫn thư mục dự án" }
    },
    "required": ["targetPath"]
  }
  ```

### 2.5. `codetrust_list_skills`
- **Mô tả**: Khám phá danh mục 24 Agent Skills có sẵn trong hệ thống CodeTrust AI (phân loại theo CORE, OPTIONAL, PREMIUM, INTERNAL).
- **Tham số (Input Schema)**:
  ```json
  {
    "type": "object",
    "properties": {
      "category": { "type": "string", "enum": ["CORE", "OPTIONAL", "PREMIUM", "INTERNAL"] },
      "enabledOnly": { "type": "boolean", "description": "Chỉ hiển thị các skill đang kích hoạt" }
    }
  }
  ```

### 2.6. `codetrust_get_skill_info`
- **Mô tả**: Xem đặc tả chi tiết (Specification), tác tử phụ trách, rủi ro, phân quyền và thứ tự giải quyết phụ thuộc (Topological Execution Order) của một Skill.
- **Tham số (Input Schema)**:
  ```json
  {
    "type": "object",
    "properties": {
      "skillId": { "type": "string", "description": "Mã định danh skill (ví dụ: prem.owasp-top10-certifier)" }
    },
    "required": ["skillId"]
  }
  ```

---

## 3. HƯỚNG DẪN TÍCH HỢP VÀO CÁC ỨNG DỤNG AI (CLIENT CONFIGURATION)

### 3.1. Tích hợp vào Claude Desktop
Mở tệp cấu hình `claude_desktop_config.json` và thêm vào mục `mcpServers`:

```json
{
  "mcpServers": {
    "codetrust": {
      "command": "node",
      "args": [
        "E:/project/ai-code-auditor/dist/mcp/bin.js"
      ],
      "env": {
        "DEEPSEEK_API_KEY": "sk-your-api-key"
      }
    }
  }
}
```

### 3.2. Tích hợp vào Cursor IDE
Tạo hoặc sửa tệp `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "codetrust": {
      "command": "npx",
      "args": ["-y", "tsx", "E:/project/ai-code-auditor/src/mcp/bin.ts"]
    }
  }
}
```

### 3.3. Khởi chạy MCP Server trực tiếp qua dòng lệnh
```bash
pnpm run mcp
```
Server sẽ tự động lắng nghe các bản tin JSON-RPC trên kênh vào/ra tiêu chuẩn (`stdin`/`stdout`).
