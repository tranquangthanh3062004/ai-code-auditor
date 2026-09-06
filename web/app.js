// CodeTrust AI Web App Logic
let currentReport = null;
let currentHtmlContent = '';
let currentFilter = 'ALL';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:4000'
  : '';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupFolderUpload();
  setupPathAudit();
  checkHealth();
});

// 1. Healthcheck
async function checkHealth() {
  const statusEl = document.getElementById('server-status-text');
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) {
      statusEl.textContent = 'Máy chủ AI đã sẵn sàng (Online)';
    } else {
      statusEl.textContent = 'Máy chủ phản hồi lỗi';
    }
  } catch {
    statusEl.textContent = 'Chưa kết nối API Server';
  }
}

// 2. Setup Tab Switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// 3. Setup HTML5 Folder Upload
function setupFolderUpload() {
  const folderInput = document.getElementById('folder-input');
  const dropZone = document.getElementById('drop-zone');
  const infoEl = document.getElementById('selected-folder-info');

  folderInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    infoEl.style.display = 'block';
    infoEl.textContent = `Đã chọn ${files.length} tệp tin. Đang chuẩn bị đọc dữ liệu...`;

    startProgressAnimation('Đang đọc các tệp tin trong thư mục...');

    try {
      const filePayload = [];
      const MAX_FILES = 80;
      const MAX_SIZE_PER_FILE = 500 * 1024; // 500 KB max per file

      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relPath = file.webkitRelativePath || file.name;

        // Bỏ qua thư mục node_modules, .git, dist, build, lockfiles
        if (
          relPath.includes('node_modules/') ||
          relPath.includes('.git/') ||
          relPath.includes('dist/') ||
          relPath.endsWith('.lock') ||
          relPath.endsWith('-lock.yaml')
        ) {
          continue;
        }

        if (file.size > MAX_SIZE_PER_FILE) continue;

        try {
          const content = await file.text();
          filePayload.push({
            path: relPath,
            content,
          });
          count++;
          if (count >= MAX_FILES) break;
        } catch {}
      }

      const folderName = files[0].webkitRelativePath?.split('/')[0] || 'Uploaded-Project';

      const response = await fetch(`${API_BASE}/api/audit/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: folderName,
          files: filePayload,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Thẩm định thất bại');
      }

      finishProgressAndShowReport(data.report, data.htmlContent);
    } catch (err) {
      alert(`Lỗi khi thẩm định thư mục: ${err.message}`);
      resetToInput();
    }
  });
}

// 4. Setup Local Path Audit
function setupPathAudit() {
  const btn = document.getElementById('btn-audit-path');
  const input = document.getElementById('path-input');

  btn.addEventListener('click', async () => {
    const pathVal = input.value.trim();
    if (!pathVal) {
      alert('Vui lòng nhập đường dẫn thư mục cần thẩm định');
      return;
    }

    startProgressAnimation(`Đang quét thư mục: ${pathVal}...`);

    try {
      const response = await fetch(`${API_BASE}/api/audit/path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath: pathVal }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không tìm thấy thư mục hoặc lỗi xử lý');
      }

      finishProgressAndShowReport(data.report, data.htmlContent);
    } catch (err) {
      alert(`Lỗi thẩm định đường dẫn: ${err.message}`);
      resetToInput();
    }
  });
}

// 5. 1-Click Sample Audit
async function runSampleAudit(sampleName) {
  const names = {
    vulnerable: 'Dự án mẫu E-Commerce (Chứa lỗ hổng nghiêm trọng)',
    secure: 'Dự án mẫu Cổng Thanh Toán (Chuẩn bảo mật A+)',
    xss: 'Dự án mẫu Web App (Insecure eval & XSS)',
  };

  startProgressAnimation(`Đang thẩm định mẫu: ${names[sampleName]}...`);

  try {
    const response = await fetch(`${API_BASE}/api/audit/sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleName }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Lỗi khi tải mẫu');
    }

    finishProgressAndShowReport(data.report, data.htmlContent);
  } catch (err) {
    alert(`Lỗi khi thẩm định mẫu: ${err.message}`);
    resetToInput();
  }
}

// 6. Progress Animation Control
function startProgressAnimation(message) {
  document.getElementById('input-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  const progSection = document.getElementById('progress-section');
  progSection.style.display = 'block';

  document.getElementById('progress-status-title').textContent = message;

  const steps = ['step-tree', 'step-rules', 'step-ai', 'step-score'];
  steps.forEach(s => document.getElementById(s).classList.remove('active'));
  document.getElementById('step-tree').classList.add('active');

  setTimeout(() => {
    document.getElementById('step-rules')?.classList.add('active');
  }, 300);

  setTimeout(() => {
    document.getElementById('step-ai')?.classList.add('active');
  }, 700);

  setTimeout(() => {
    document.getElementById('step-score')?.classList.add('active');
  }, 1100);
}

function finishProgressAndShowReport(report, htmlContent) {
  currentReport = report;
  currentHtmlContent = htmlContent || '';

  setTimeout(() => {
    document.getElementById('progress-section').style.display = 'none';
    renderDashboard(report);
    document.getElementById('results-section').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 1200);
}

// 7. Render Dashboard
function renderDashboard(report) {
  // Top ID
  document.getElementById('report-audit-id').textContent = report.meta.auditId;

  // Verdict Banner
  const verdictCard = document.getElementById('verdict-card');
  const verdictChip = document.getElementById('verdict-chip');
  const gradeBadge = document.getElementById('grade-badge');
  const headlineEl = document.getElementById('verdict-headline');
  const recEl = document.getElementById('verdict-rec');

  verdictCard.className = 'verdict-banner-card card';
  if (report.executiveSummary.verdict === 'REJECTED') {
    verdictCard.classList.add('rejected');
    verdictChip.textContent = 'TỪ CHỐI — CÓ RỦI RO NGUY HIỂM';
  } else if (report.executiveSummary.verdict === 'NEEDS_REVIEW') {
    verdictCard.classList.add('needs-review');
    verdictChip.textContent = 'CẦN RÀ SOÁT LẠI TRƯỚC KHI DUYỆT';
  } else {
    verdictChip.textContent = 'ĐẠT CHUẨN NGHIỆM THU';
  }

  gradeBadge.textContent = report.scores.grade;
  headlineEl.textContent = report.executiveSummary.headline;
  recEl.textContent = report.executiveSummary.recommendation;

  // Scores
  document.getElementById('score-overall').textContent = `${report.scores.overall}/100`;
  document.getElementById('bar-overall').style.width = `${report.scores.overall}%`;

  document.getElementById('score-security').textContent = `${report.scores.security}/100`;
  document.getElementById('bar-security').style.width = `${report.scores.security}%`;

  document.getElementById('score-logic').textContent = `${report.scores.businessLogic}/100`;
  document.getElementById('bar-logic').style.width = `${report.scores.businessLogic}%`;

  document.getElementById('score-visual').textContent = `${report.scores.visualStability}/100`;
  document.getElementById('bar-visual').style.width = `${report.scores.visualStability}%`;

  // Meta
  document.getElementById('meta-project-name').textContent = report.projectInfo.name;
  document.getElementById('meta-framework').textContent = `${report.projectInfo.framework} (${report.projectInfo.packageManager})`;
  document.getElementById('meta-files').textContent = `${report.projectInfo.totalFiles} tệp • ${report.projectInfo.totalLinesOfCode.toLocaleString()} dòng code`;
  document.getElementById('meta-timestamp').textContent = report.meta.timestamp;

  // Executive Summary
  document.getElementById('summary-business-impact').textContent = report.executiveSummary.businessImpactText;
  const risksList = document.getElementById('summary-risks-list');
  risksList.innerHTML = '';
  if (!report.executiveSummary.keyRisks || report.executiveSummary.keyRisks.length === 0) {
    risksList.innerHTML = '<li>✅ Không phát hiện rủi ro nghiêm trọng.</li>';
  } else {
    report.executiveSummary.keyRisks.forEach(r => {
      const li = document.createElement('li');
      li.textContent = `⚠️ ${r}`;
      risksList.appendChild(li);
    });
  }

  // Security Findings
  renderFindings(report.securityFindings || []);

  // UAT Steps
  renderUATSteps(report.uatChecklist || []);
}

// 8. Render Findings & Filter
function renderFindings(findings) {
  const container = document.getElementById('findings-container');
  const countBadge = document.getElementById('findings-count-badge');
  const countAll = document.getElementById('count-all');
  const countCrit = document.getElementById('count-crit');
  const countHigh = document.getElementById('count-high');
  const countMed = document.getElementById('count-med');

  const crits = findings.filter(f => f.severity === 'CRITICAL').length;
  const highs = findings.filter(f => f.severity === 'HIGH').length;
  const meds = findings.filter(f => f.severity === 'MEDIUM').length;

  countBadge.textContent = `${findings.length} Vấn đề`;
  countAll.textContent = findings.length;
  countCrit.textContent = crits;
  countHigh.textContent = highs;
  countMed.textContent = meds;

  container.innerHTML = '';

  const filtered = currentFilter === 'ALL'
    ? findings
    : findings.filter(f => f.severity === currentFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-findings">
        ✅ Không phát hiện lỗ hổng ${currentFilter !== 'ALL' ? currentFilter : ''} trong mã nguồn!
      </div>
    `;
    return;
  }

  filtered.forEach(f => {
    const sevClass = f.severity === 'CRITICAL' ? 'crit' : f.severity === 'HIGH' ? 'high' : 'med';
    const card = document.createElement('div');
    card.className = `finding-item ${sevClass}`;
    card.innerHTML = `
      <div class="finding-head">
        <span class="sev-badge ${sevClass}">${f.severity}</span>
        <span class="finding-title-text">${escapeHtml(f.title)}</span>
        <span class="finding-loc">${escapeHtml(f.file)}${f.line ? `:${f.line}` : ''}</span>
      </div>
      <div class="finding-content">
        <div class="nontech-box">
          <strong>💡 Giải thích cho người quản lý không biết code:</strong>
          <p>${escapeHtml(f.plainExplanation)}</p>
        </div>
        ${f.codeSnippet ? `
        <div class="code-box">
          <code>${escapeHtml(f.codeSnippet)}</code>
        </div>` : ''}
        <div class="remed-box">
          <strong>🛠️ Hướng dẫn khắc phục cho Developer:</strong>
          <p>${escapeHtml(f.remediation)}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterFindings(sev) {
  currentFilter = sev;
  document.querySelectorAll('#finding-filters .pill-btn').forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('data-filter') === sev) b.classList.add('active');
  });

  if (currentReport) {
    renderFindings(currentReport.securityFindings || []);
  }
}

// 9. Render Interactive UAT Steps
function renderUATSteps(steps) {
  const container = document.getElementById('uat-steps-container');
  container.innerHTML = '';

  steps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = 'uat-card';
    card.id = `uat-card-${idx}`;
    card.innerHTML = `
      <label class="uat-label">
        <input type="checkbox" class="uat-checkbox-custom" onchange="onUatCheckChange(${idx}, this.checked)" />
        <div class="uat-info">
          <div class="uat-step-title">Bước ${step.stepNumber}: ${escapeHtml(step.instruction)}</div>
          <div class="uat-expected-box"><strong>Mắt thấy:</strong> ${escapeHtml(step.expectedResult)}</div>
        </div>
      </label>
    `;
    container.appendChild(card);
  });

  updateUatProgressUI();
}

function onUatCheckChange(idx, checked) {
  const card = document.getElementById(`uat-card-${idx}`);
  if (card) {
    if (checked) card.classList.add('completed');
    else card.classList.remove('completed');
  }
  updateUatProgressUI();
}

function updateUatProgressUI() {
  const checkboxes = document.querySelectorAll('.uat-checkbox-custom');
  const total = checkboxes.length;
  let checked = 0;
  checkboxes.forEach(cb => { if (cb.checked) checked++; });

  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  const textEl = document.getElementById('uat-progress-text');
  const fillEl = document.getElementById('uat-progress-fill');

  if (textEl) textEl.textContent = `${checked}/${total} bước hoàn tất (${pct}%)`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

// 10. Actions & Export
function downloadHtmlReport() {
  if (!currentHtmlContent) {
    alert('Không có nội dung báo cáo HTML để tải');
    return;
  }
  const blob = new Blob([currentHtmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codetrust-audit-${currentReport?.meta.projectName || 'report'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetToInput() {
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('input-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
