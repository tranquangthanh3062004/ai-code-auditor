import path from 'node:path';
import fs from 'node:fs';
import { auditProject } from '../index.js';
import { HeuristicDetector } from '../engine/heuristic-detector.js';
import { DeterministicScanner } from '../engine/deterministic-rules.js';

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'codetrust_audit',
    description: 'Thực hiện thẩm định toàn diện dự án mã nguồn qua hệ sinh thái Multi-Agent (Bảo mật, Logic nghiệp vụ, Trọng số điểm & Kịch bản UAT).',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Đường dẫn tuyệt đối hoặc tương đối tới thư mục dự án cần thẩm định (mặc định: .)',
        },
        generateHtml: {
          type: 'boolean',
          description: 'Có xuất báo cáo HTML độc lập hay không (mặc định: false)',
        },
      },
      required: ['targetPath'],
    },
  },
  {
    name: 'codetrust_scan_security',
    description: 'Quét nhanh các lỗ hổng bảo mật tất định (Zero-Hallucination) phát hiện lộ khóa API, SQL Injection, XSS, eval, Command Injection.',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Đường dẫn thư mục dự án cần quét',
        },
      },
      required: ['targetPath'],
    },
  },
  {
    name: 'codetrust_inspect_project',
    description: 'Trinh sát cấu trúc dự án, nhận diện framework (Next.js, Vite, Express, FastAPI...), port và thống kê số lượng file/dòng code.',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Đường dẫn thư mục dự án',
        },
      },
      required: ['targetPath'],
    },
  },
  {
    name: 'codetrust_generate_uat',
    description: 'Sinh kịch bản nghiệm thu thực tế 3-5 bước dành cho người quản lý phi kỹ thuật (Non-Tech Founders & PMs).',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Đường dẫn thư mục dự án cần tạo kịch bản nghiệm thu',
        },
      },
      required: ['targetPath'],
    },
  },
];

export async function executeMcpTool(toolName: string, args: Record<string, any>): Promise<any> {
  const targetPath = path.resolve(args?.targetPath || '.');

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Thư mục không tồn tại: ${targetPath}`);
  }

  switch (toolName) {
    case 'codetrust_audit': {
      const { report, htmlContent } = await auditProject(targetPath, {
        generateHtml: args.generateHtml === true,
      });
      return {
        auditId: report.meta.auditId,
        projectName: report.meta.projectName,
        verdict: report.executiveSummary.verdict,
        headline: report.executiveSummary.headline,
        scores: report.scores,
        securityFindingsCount: report.securityFindings.length,
        criticalFindings: report.securityFindings.filter(f => f.severity === 'CRITICAL'),
        uatChecklist: report.uatChecklist,
        recommendation: report.executiveSummary.recommendation,
        hasHtmlReport: Boolean(htmlContent),
      };
    }

    case 'codetrust_scan_security': {
      const detector = new HeuristicDetector(targetPath);
      const { sourceFiles } = detector.detect();
      const scanner = new DeterministicScanner();
      const findings = scanner.scanFiles(targetPath, sourceFiles);

      return {
        targetPath,
        scannedFilesCount: sourceFiles.length,
        totalFindings: findings.length,
        findings,
      };
    }

    case 'codetrust_inspect_project': {
      const detector = new HeuristicDetector(targetPath);
      const { projectInfo, sourceFiles } = detector.detect();

      return {
        projectInfo,
        sampleFiles: sourceFiles.slice(0, 10).map(f => path.relative(targetPath, f).replace(/\\/g, '/')),
      };
    }

    case 'codetrust_generate_uat': {
      const { report } = await auditProject(targetPath, { generateHtml: false });
      return {
        projectName: report.meta.projectName,
        framework: report.projectInfo.framework,
        verdict: report.executiveSummary.verdict,
        uatChecklist: report.uatChecklist,
      };
    }

    default:
      throw new Error(`Không tìm thấy MCP Tool: "${toolName}"`);
  }
}
