#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { HeuristicDetector } from '../engine/heuristic-detector.js';
import { DeterministicScanner } from '../engine/deterministic-rules.js';
import { DeepSeekAuditor } from '../engine/deepseek-client.js';
import { ScorecardCalculator } from '../reporter/scorecard.js';
import { HtmlReportGenerator } from '../reporter/html-generator.js';
import type { AuditReport } from '../types/audit.js';

const program = new Command();

program
  .name('codetrust')
  .description('Hệ thống thẩm định chất lượng, bảo mật và trực quan hóa code AI cho Non-Tech Founders và PMs')
  .version('0.2.0')
  .argument('[path]', 'Đường dẫn thư mục dự án cần thẩm định', '.')
  .option('-o, --output <file>', 'Đường dẫn file HTML báo cáo xuất ra', 'audit-report.html')
  .option('--json-output <file>', 'Đường dẫn file JSON xuất ra kết quả thẩm định')
  .option('--no-open', 'Không tự động mở trình duyệt sau khi xuất báo cáo')
  .option('--json', 'Xuất kết quả dạng JSON thô')
  .action(async (targetPath: string, options: { output: string; jsonOutput?: string; open: boolean; json?: boolean }) => {
    const resolvedPath = path.resolve(targetPath);

    if (!options.json) {
      console.log(chalk.bold.cyan('\n============================================================='));
      console.log(chalk.bold.cyan('                 CODETRUST AI • VIBEAUDITOR                  '));
      console.log(chalk.gray('      Nền tảng Thẩm định Chất lượng & Bảo mật Code cho Non-Tech '));
      console.log(chalk.bold.cyan('=============================================================\n'));
      console.log(chalk.yellow(`[*] Đang phân tích mã nguồn tại: ${resolvedPath}...`));
    }

    // 1. Nhận diện Framework & Cấu trúc dự án
    const detector = new HeuristicDetector(resolvedPath);
    const { projectInfo, sourceFiles } = detector.detect();

    if (!options.json) {
      console.log(chalk.green(`[✓] Đã phát hiện dự án:`));
      console.log(`    - Tên: ${chalk.bold(projectInfo.name)}`);
      console.log(`    - Nền tảng: ${chalk.bold.magenta(projectInfo.framework)} (Package Manager: ${projectInfo.packageManager})`);
      console.log(`    - Quy mô: ${chalk.bold(projectInfo.totalFiles)} tệp, ${chalk.bold(projectInfo.totalLinesOfCode)} dòng code`);
      console.log(chalk.yellow(`\n[*] Đang quét lỗ hổng bảo mật và thông tin nhạy cảm...`));
    }

    // 2. Quét bảo mật tất định (Deterministic Scanner)
    const scanner = new DeterministicScanner();
    const findings = scanner.scanFiles(resolvedPath, sourceFiles);

    if (!options.json) {
      const criticals = findings.filter(f => f.severity === 'CRITICAL').length;
      const highs = findings.filter(f => f.severity === 'HIGH').length;
      console.log(chalk.green(`[✓] Quét tĩnh hoàn tất. Phát hiện ${findings.length} vấn đề (${chalk.red(criticals + ' Critical')}, ${chalk.hex('#f97316')(highs + ' High')}).`));
      console.log(chalk.yellow(`[*] Đang kết nối trí tuệ nhân tạo để phân tích logic & sinh checklist nghiệm thu...`));
    }

    // 3. Trích xuất mẫu code tiêu biểu
    const sampleSnippets: Array<{ file: string; content: string }> = [];
    for (const f of sourceFiles.slice(0, 5)) {
      try {
        const content = fs.readFileSync(f, 'utf8');
        const rel = path.relative(resolvedPath, f).replace(/\\/g, '/');
        sampleSnippets.push({ file: rel, content });
      } catch {}
    }

    // 4. Phân tích ngữ nghĩa qua DeepSeek AI
    const auditor = new DeepSeekAuditor();
    const { executiveSummary, uatChecklist } = await auditor.auditWithAI(projectInfo, findings, sampleSnippets);

    // 5. Tính toán bảng điểm (Scorecard)
    const calculator = new ScorecardCalculator();
    const scores = calculator.calculate(findings, projectInfo);

    // 6. Tổng hợp Báo cáo Thẩm định hoàn chỉnh
    const report: AuditReport = {
      meta: {
        auditId: `AUDIT-${Date.now()}`,
        projectName: projectInfo.name,
        timestamp: new Date().toLocaleString('vi-VN'),
        version: '1.0.0',
      },
      projectInfo,
      scores,
      executiveSummary,
      securityFindings: findings,
      uatChecklist,
    };

    // 7. Xuất file HTML độc lập
    const outputPath = path.resolve(options.output || 'audit-report.html');
    const htmlGenerator = new HtmlReportGenerator();
    const htmlContent = htmlGenerator.generate(report);
    fs.writeFileSync(outputPath, htmlContent, 'utf8');

    // 8. Xuất file JSON nếu có tùy chọn --json-output
    if (options.jsonOutput) {
      const jsonOutputPath = path.resolve(options.jsonOutput);
      fs.writeFileSync(jsonOutputPath, JSON.stringify(report, null, 2), 'utf8');
    }

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    // In kết quả tóm tắt ra console
    const verdictColor = report.executiveSummary.verdict === 'APPROVED' ? chalk.bold.green : report.executiveSummary.verdict === 'NEEDS_REVIEW' ? chalk.bold.yellow : chalk.bold.red;

    console.log(chalk.bold.cyan('\n-------------------------------------------------------------'));
    console.log(`KẾT LUẬN THẨM ĐỊNH: ${verdictColor(report.executiveSummary.verdict)} | ĐIỂM SỐ: ${verdictColor(scores.overall + '/100 (' + scores.grade + ')')}`);
    console.log(chalk.bold.cyan('-------------------------------------------------------------'));
    console.log(chalk.white(`• Tóm tắt: ${report.executiveSummary.headline}`));
    console.log(chalk.gray(`• Khuyến nghị: ${report.executiveSummary.recommendation}`));
    console.log(chalk.green(`\n[✓] Đã xuất báo cáo thẩm định trực quan tại:`));
    console.log(chalk.bold.underline(`    ${outputPath}\n`));

    if (options.open) {
      console.log(chalk.cyan(`[*] Đang mở báo cáo trên trình duyệt mặc định của bạn...`));
      await open(outputPath);
    }
  });

program.parse();
