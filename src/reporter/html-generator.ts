import type { AuditReport } from '../types/audit.js';

export class HtmlReportGenerator {
  public generate(report: AuditReport): string {
    const verdictColor =
      report.executiveSummary.verdict === 'APPROVED'
        ? '#10b981'
        : report.executiveSummary.verdict === 'NEEDS_REVIEW'
        ? '#f59e0b'
        : '#ef4444';

    const verdictLabel =
      report.executiveSummary.verdict === 'APPROVED'
        ? 'ĐẠT CHUẨN NGHIỆM THU'
        : report.executiveSummary.verdict === 'NEEDS_REVIEW'
        ? 'CẦN RÀ SOÁT LẠI'
        : 'TỪ CHỐI - NGUY HIỂM';

    const findingsHtml = report.securityFindings.length === 0
      ? `<div class="empty-state">🎉 Không phát hiện lỗ hổng bảo mật nghiêm trọng nào trong mã nguồn được quét!</div>`
      : report.securityFindings.map(f => {
          const badgeClass = `badge-${f.severity.toLowerCase()}`;
          return `
          <div class="finding-card ${badgeClass}">
            <div class="finding-header">
              <span class="severity-badge ${badgeClass}">${f.severity}</span>
              <span class="finding-title">${this.escapeHtml(f.title)}</span>
              <span class="finding-file">${this.escapeHtml(f.file)}${f.line ? `:${f.line}` : ''}</span>
            </div>
            <div class="finding-body">
              <div class="explanation-box">
                <strong>💡 Giải thích cho người không biết code:</strong>
                <p>${this.escapeHtml(f.plainExplanation)}</p>
              </div>
              ${f.codeSnippet ? `
              <div class="code-box">
                <code>${this.escapeHtml(f.codeSnippet)}</code>
              </div>` : ''}
              <div class="remediation-box">
                <strong>🛠️ Cách khắc phục đề xuất:</strong>
                <p>${this.escapeHtml(f.remediation)}</p>
              </div>
            </div>
          </div>
          `;
        }).join('');

    const uatHtml = report.uatChecklist.map((step, idx) => `
      <div class="uat-item" data-id="${step.id}">
        <label class="uat-checkbox-label">
          <input type="checkbox" class="uat-checkbox" onchange="updateUatProgress()" />
          <span class="checkmark"></span>
          <div class="uat-content">
            <div class="uat-step-title">Bước ${step.stepNumber}: ${this.escapeHtml(step.instruction)}</div>
            <div class="uat-expected"><strong>Mắt thấy:</strong> ${this.escapeHtml(step.expectedResult)}</div>
          </div>
        </label>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Thẩm Định Code AI - ${this.escapeHtml(report.meta.projectName)}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(20, 26, 43, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 30px 20px;
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 15px;
    }
    .logo-area h1 {
      font-size: 24px;
      background: linear-gradient(135deg, #a5b4fc, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 4px;
    }
    .logo-area p {
      font-size: 13px;
      color: var(--text-muted);
    }
    .meta-badges {
      display: flex;
      gap: 10px;
      font-size: 12px;
    }
    .tag {
      background: rgba(255, 255, 255, 0.05);
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }
    .verdict-banner {
      background: ${verdictColor}15;
      border: 2px solid ${verdictColor};
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px ${verdictColor}20;
      flex-wrap: wrap;
      gap: 20px;
    }
    .verdict-badge {
      display: inline-block;
      background: ${verdictColor};
      color: #fff;
      font-weight: 800;
      font-size: 15px;
      padding: 6px 16px;
      border-radius: 30px;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .verdict-headline {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }
    .verdict-rec {
      font-size: 14px;
      color: var(--text-muted);
    }
    .overall-grade {
      font-size: 56px;
      font-weight: 900;
      color: ${verdictColor};
      text-shadow: 0 0 25px ${verdictColor}60;
      min-width: 90px;
      text-align: center;
    }
    .grid-scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .score-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    .score-title {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .score-value {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 3px;
    }
    .section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .business-impact-text {
      font-size: 15px;
      line-height: 1.7;
      color: #e2e8f0;
      background: rgba(99, 102, 241, 0.08);
      padding: 18px;
      border-radius: 12px;
      border-left: 4px solid var(--accent);
      margin-bottom: 20px;
    }
    .risks-list {
      list-style: none;
    }
    .risks-list li {
      padding: 8px 12px;
      margin-bottom: 6px;
      background: rgba(239, 68, 68, 0.08);
      border-radius: 8px;
      color: #fca5a5;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .finding-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .finding-card.badge-critical { border-left: 4px solid var(--danger); }
    .finding-card.badge-high { border-left: 4px solid #f97316; }
    .finding-card.badge-medium { border-left: 4px solid var(--warning); }
    .finding-header {
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .severity-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .severity-badge.badge-critical { background: var(--danger); color: #fff; }
    .severity-badge.badge-high { background: #f97316; color: #fff; }
    .severity-badge.badge-medium { background: var(--warning); color: #000; }
    .finding-title {
      font-weight: 600;
      font-size: 15px;
      flex: 1;
    }
    .finding-file {
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
    }
    .finding-body {
      padding: 18px;
      font-size: 14px;
    }
    .explanation-box {
      margin-bottom: 12px;
      color: #cbd5e1;
    }
    .code-box {
      background: #020617;
      padding: 12px 14px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
      color: #f87171;
      margin-bottom: 12px;
      overflow-x: auto;
    }
    .remediation-box {
      background: rgba(16, 185, 129, 0.08);
      border-left: 3px solid var(--success);
      padding: 10px 14px;
      border-radius: 6px;
      color: #6ee7b7;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--success);
      font-size: 16px;
      background: rgba(16, 185, 129, 0.05);
      border-radius: 12px;
      border: 1px dashed rgba(16, 185, 129, 0.3);
    }
    .uat-item {
      padding: 14px 18px;
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.2s;
    }
    .uat-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .uat-checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      cursor: pointer;
    }
    .uat-checkbox {
      width: 20px;
      height: 20px;
      margin-top: 3px;
      cursor: pointer;
      accent-color: var(--accent);
    }
    .uat-step-title {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
    }
    .uat-expected {
      font-size: 13px;
      color: var(--text-muted);
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      font-size: 13px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        <h1>CodeTrust AI • Báo Cáo Thẩm Định</h1>
        <p>Hệ thống Đánh giá Chất lượng, Bảo mật & Nghiệm thu Dành cho Non-Tech</p>
      </div>
      <div class="meta-badges">
        <span class="tag">Dự án: <strong>${this.escapeHtml(report.meta.projectName)}</strong></span>
        <span class="tag">Nền tảng: <strong>${this.escapeHtml(report.projectInfo.framework)}</strong></span>
        <span class="tag">${this.escapeHtml(report.meta.timestamp)}</span>
      </div>
    </div>

    <div class="verdict-banner">
      <div style="flex: 1;">
        <span class="verdict-badge">${verdictLabel}</span>
        <div class="verdict-headline">${this.escapeHtml(report.executiveSummary.headline)}</div>
        <div class="verdict-rec">${this.escapeHtml(report.executiveSummary.recommendation)}</div>
      </div>
      <div class="overall-grade">${report.scores.grade}</div>
    </div>

    <div class="grid-scores">
      <div class="score-card">
        <div class="score-title">Điểm Tổng Thể</div>
        <div class="score-value" style="color: ${verdictColor}">${report.scores.overall}/100</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${report.scores.overall}%; background: ${verdictColor}"></div>
        </div>
      </div>
      <div class="score-card">
        <div class="score-title">🛡️ An Toàn Bảo Mật</div>
        <div class="score-value" style="color: ${report.scores.security >= 80 ? '#10b981' : report.scores.security >= 50 ? '#f59e0b' : '#ef4444'}">${report.scores.security}/100</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${report.scores.security}%; background: ${report.scores.security >= 80 ? '#10b981' : report.scores.security >= 50 ? '#f59e0b' : '#ef4444'}"></div>
        </div>
      </div>
      <div class="score-card">
        <div class="score-title">🎯 Logic & Nghiệp Vụ</div>
        <div class="score-value" style="color: #6366f1">${report.scores.businessLogic}/100</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${report.scores.businessLogic}%; background: #6366f1"></div>
        </div>
      </div>
      <div class="score-card">
        <div class="score-title">⚡ Ổn Định Giao Diện</div>
        <div class="score-value" style="color: #38bdf8">${report.scores.visualStability}/100</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${report.scores.visualStability}%; background: #38bdf8"></div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 Tóm Tắt Dành Cho Nhà Quản Lý (Executive Summary)</div>
      <div class="business-impact-text">
        ${this.escapeHtml(report.executiveSummary.businessImpactText)}
      </div>
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">⚠️ Rủi ro cần lưu ý trước khi bấm duyệt:</div>
      <ul class="risks-list">
        ${report.executiveSummary.keyRisks.map(r => `<li>⚠️ ${this.escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">🛡️ Danh Sách Rủi Ro & Lỗ Hổng Bảo Mật (${report.securityFindings.length})</div>
      ${findingsHtml}
    </div>

    <div class="section">
      <div class="section-title">✅ Kịch Bản Nghiệm Thu 3 Bước Cho Người Dùng (Interactive UAT)</div>
      <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">
        Bạn không cần đọc code. Chỉ cần tự mình thực hiện lần lượt các bước dưới đây để kiểm chứng xem tính năng có hoạt động chuẩn xác không:
      </p>
      <div class="uat-list">
        ${uatHtml}
      </div>
    </div>

    <div class="footer">
      Báo cáo được khởi tạo tự động bởi <strong>CodeTrust AI (VibeAuditor)</strong> • Tiêu chuẩn Thẩm định Mã Nguồn An Toàn
    </div>
  </div>

  <script>
    function updateUatProgress() {
      const checkboxes = document.querySelectorAll('.uat-checkbox');
      let checked = 0;
      checkboxes.forEach(cb => { if (cb.checked) checked++; });
      console.log('Tiến độ nghiệm thu: ' + checked + '/' + checkboxes.length);
    }
  </script>
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
