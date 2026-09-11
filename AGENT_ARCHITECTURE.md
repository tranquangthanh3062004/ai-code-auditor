# ĐẶC TẢ KIẾN TRÚC MULTI-AGENT (AGENT ARCHITECTURE)
## Hệ sinh thái Tác tử Chuyên biệt Hóa • CodeTrust AI Engine

---

## 1. MÔ HÌNH MULTI-AGENT PHÂN TẦNG (HIERARCHICAL AGENT TOPOLOGY)

Trong CodeTrust AI, các tác tử không hoạt động hỗn loạn mà được tổ chức theo mô hình **Supervisor - Worker Pattern**:

```
                       [ USER REQUEST ]
                              │
                              ▼
                  ┌───────────────────────┐
                  │   AUDIT ORCHESTRATOR  │ (Supervisor)
                  │ (agent-orchestrator)  │
                  └───────────┬───────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   REPO ANALYST   │ │SECURITY INSPECTOR│ │  SEMANTIC LOGIC  │
│      AGENT       │ │      AGENT       │ │      AGENT       │
│(agent-repo-analyst│(agent-sec-inspect)│ │(agent-sem-logic) │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │   QUALITY & UAT AGENT │
                  │  (agent-quality-uat)  │
                  └───────────┬───────────┘
                              │
                              ▼
                  [ COMPILED AUDIT REPORT ]
```

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG TÁC TỬ (AGENT SPECIFICATIONS)

### 2.1. Audit Orchestrator (Supervisor)
- **ID**: `agent-orchestrator`
- **Quyền hạn**: `['READ', 'ANALYZE', 'EXECUTE', 'REPORT']`
- **Nhiệm vụ**:
  - Tiếp nhận yêu cầu thẩm định từ CLI, Web UI hoặc MCP Gateway.
  - Khởi tạo context chung (`Project Context`), phân tách thành các `AgentTask`.
  - Phân bổ task cho các tác tử chuyên biệt, theo dõi thời gian và trạng thái hoàn thành.
  - Phát hiện xung đột kết quả (Conflict Resolution) và ra quyết định kết luận cuối cùng (`verdict`).
- **Xử lý thất bại (Failure Handling)**:
  - Nếu `RepoAnalyst` thất bại: Dừng quy trình ngay lập tức vì thiếu thông tin đầu vào.
  - Nếu `SemanticLogic` thất bại (mất mạng/hết token): Tự động chuyển sang `Heuristic Fallback Engine`.

### 2.2. Repo Analyst Agent
- **ID**: `agent-repo-analyst`
- **Quyền hạn**: `['READ', 'ANALYZE']`
- **Nhiệm vụ**:
  - Trinh sát toàn bộ cây thư mục, lọc bỏ các thư mục rác/vendor (`node_modules`, `.git`, `dist`, `__pycache__`).
  - Đọc `package.json` hoặc `requirements.txt` để nhận diện Framework, Package Manager, Port và Entrypoint.
  - Tính tổng số file và dòng code (Lines of Code).
- **Input**: `{ targetPath: string }`
- **Output**: `{ projectInfo: ProjectInfo, sourceFiles: string[] }`

### 2.3. Security Inspector Agent
- **ID**: `agent-security-inspector`
- **Quyền hạn**: `['READ', 'ANALYZE']`
- **Nhiệm vụ**:
  - Quét 100% tất định (Zero-Hallucination) các quy tắc bảo mật tĩnh qua Regex/AST.
  - Phát hiện khóa bí mật (OpenAI, DeepSeek, GitHub PAT, AWS Key, Private Key).
  - Phát hiện lỗ hổng tiêm mã (SQL Injection, Command Injection, Insecure eval, Raw innerHTML, Tắt kiểm tra TLS, Lưu token ở LocalStorage).
  - Tự động mặt nạ hóa (masking) các secret bị lộ trước khi đưa vào báo cáo.
- **Input**: `{ targetPath: string, sourceFiles: string[] }`
- **Output**: `{ findings: SecurityFinding[] }`

### 2.4. Semantic Logic Agent
- **ID**: `agent-semantic-logic`
- **Quyền hạn**: `['ANALYZE', 'REPORT']`
- **Nhiệm vụ**:
  - Trích xuất các mẫu code tiêu biểu và so khớp với thông tin lỗ hổng.
  - Gửi prompt có cấu trúc tới DeepSeek Chat API với chế độ JSON strict mode.
  - Đóng vai trò **Người Dịch Thuật Nghiệp Vụ (Business Translator)**: Dịch toàn bộ rủi ro kỹ thuật sang ngôn ngữ kinh doanh tiếng Việt dễ hiểu cho Non-Tech.
  - Xác thực nghiêm ngặt đầu ra bằng Zod Schema; tự động fallback nếu cấu trúc không khớp.
- **Input**: `{ projectInfo: ProjectInfo, findings: SecurityFinding[], sampleSnippets: Array<{ file, content }> }`
- **Output**: `{ executiveSummary: ExecutiveSummary, uatChecklist: UATStep[] }`

### 2.5. Quality & UAT Agent
- **ID**: `agent-quality-uat`
- **Quyền hạn**: `['ANALYZE', 'REPORT']`
- **Nhiệm vụ**:
  - Tính toán Bảng điểm Tin cậy (Trust Scorecard) theo trọng số: Bảo mật (40%), Logic (35%), Ổn định (25%).
  - Đánh giá chỉ số ổn định dựa trên độ sẵn sàng cấu trúc dự án (framework, entrypoint, devCommand).
  - Xếp hạng chữ cái chất lượng: `A+`, `A`, `B`, `C`, `F`.
- **Input**: `{ findings: SecurityFinding[], projectInfo: ProjectInfo }`
- **Output**: `{ scores: Scores }`

---

## 3. MA TRẬN PHÂN QUYỀN TÁC TỬ (TOOL PERMISSION MATRIX)

| Tác Tử (Agent) | Đọc Mã Nguồn (Read) | Quét Phân Tích (Analyze) | Thực Thi Lệnh (Execute) | Xuất Báo Cáo (Report) | Can Thiệp Đĩa (Write) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Orchestrator** | ✓ | ✓ | ✓ | ✓ | Chỉ khi xuất file HTML |
| **Repo Analyst** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Security Inspector** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Semantic Logic** | ✗ (Chỉ đọc snippets) | ✓ | ✗ | ✓ | ✗ |
| **Quality & UAT** | ✗ | ✓ | ✗ | ✓ | ✗ |

---

## 4. GIAO THỨC TRUYỀN THÔNG TÁC TỬ (AGENT COMMUNICATION PROTOCOL)

Mọi tác vụ giữa các agent được bao bọc trong cấu trúc dữ liệu `AgentTask`:

```typescript
export interface AgentTask<TInput = unknown, TOutput = unknown> {
  taskId: string;
  parentTaskId?: string;
  agentId: string;
  role: AgentRole;
  objective: string;
  context?: Record<string, unknown>;
  input: TInput;
  output?: TOutput;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  error?: string;
  startTime?: number;
  endTime?: number;
  durationMs?: number;
}
```

Và kết quả trả về tuân thủ `AgentExecutionResult`:

```typescript
export interface AgentExecutionResult<T = unknown> {
  agentId: string;
  role: AgentRole;
  success: boolean;
  data?: T;
  findingsCount?: number;
  notes?: string[];
  error?: string;
  durationMs: number;
}
```
