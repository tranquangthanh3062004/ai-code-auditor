// ========================================================
// CodeTrust AI • Full Application Logic (VibeAuditor)
// ========================================================

let currentReport = null;
let currentHtmlContent = '';
let currentFilter = 'ALL';
let allStoreSkills = [];
let currentStoreCategory = 'ALL';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:4000'
  : '';

const STORAGE_KEY_HISTORY = 'codetrust_audit_history_v1';
const STORAGE_KEY_CERTS = 'codetrust_digital_certs_v1';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupFolderUpload();
  setupPathAudit();
  checkHealth();
  loadHistory();
  fetchStoreSkills();
});

// ========================================================
// 1. TOAST NOTIFICATION SYSTEM
// ========================================================
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s reverse forwards';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// ========================================================
// 2. HEALTHCHECK & INITIALIZATION
// ========================================================
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

// ========================================================
// 3. TAB SWITCHING
// ========================================================
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

// ========================================================
// 4. FOLDER UPLOAD AUDIT
// ========================================================
function setupFolderUpload() {
  const folderInput = document.getElementById('folder-input');
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

        // Bỏ qua thư mục rác
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
      saveReportToHistory(data.report, data.htmlContent);
      showToast(`Đã hoàn tất thẩm định dự án "${folderName}"!`, 'success');
    } catch (err) {
      showToast(`Lỗi khi thẩm định thư mục: ${err.message}`, 'error');
      resetToInput();
    }
  });
}

// ========================================================
// 5. LOCAL PATH AUDIT
// ========================================================
function setupPathAudit() {
  const btn = document.getElementById('btn-audit-path');
  const input = document.getElementById('path-input');

  btn.addEventListener('click', async () => {
    const pathVal = input.value.trim();
    if (!pathVal) {
      showToast('Vui lòng nhập đường dẫn thư mục cần thẩm định', 'warning');
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
      saveReportToHistory(data.report, data.htmlContent);
      showToast(`Hoàn tất thẩm định thư mục: ${pathVal}`, 'success');
    } catch (err) {
      showToast(`Lỗi thẩm định đường dẫn: ${err.message}`, 'error');
      resetToInput();
    }
  });
}

// ========================================================
// 6. 1-CLICK DEMO SAMPLES
// ========================================================
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
    saveReportToHistory(data.report, data.htmlContent);
    showToast(`Đã nạp xong dự án mẫu "${names[sampleName]}"!`, 'success');
  } catch (err) {
    showToast(`Lỗi khi thẩm định mẫu: ${err.message}`, 'error');
    resetToInput();
  }
}

// ========================================================
// 7. PROGRESS RADAR ANIMATION
// ========================================================
function startProgressAnimation(message) {
  document.getElementById('input-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  const progSection = document.getElementById('progress-section');
  progSection.style.display = 'block';

  document.getElementById('progress-status-title').textContent = message;

  const steps = ['step-tree', 'step-rules', 'step-ai', 'step-score'];
  steps.forEach(s => document.getElementById(s).classList.remove('active'));
  document.getElementById('step-tree').classList.add('active');

  setTimeout(() => { document.getElementById('step-rules')?.classList.add('active'); }, 300);
  setTimeout(() => { document.getElementById('step-ai')?.classList.add('active'); }, 700);
  setTimeout(() => { document.getElementById('step-score')?.classList.add('active'); }, 1100);
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

// ========================================================
// 8. RENDER DASHBOARD & RESULTS
// ========================================================
function renderDashboard(report) {
  // Audit ID
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

  // Findings & UAT
  renderFindings(report.securityFindings || []);
  renderUATSteps(report.uatChecklist || []);

  // Check if this report already has a digital acceptance certificate
  checkAndRenderExistingCertificate(report.meta.auditId);
}

// ========================================================
// 9. RENDER FINDINGS & CODE DIFF BLOCKS
// ========================================================
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

    // Generate Before/After Remediation Diff
    const diffBlock = getRemediationDiff(f.ruleId);

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
          ${diffBlock ? `
          <div class="code-diff-box">
            <span class="diff-line-del">${escapeHtml(diffBlock.before)}</span>
            <span class="diff-line-add">${escapeHtml(diffBlock.after)}</span>
          </div>` : ''}
        </div>
        <div class="finding-actions-row">
          <button class="btn btn-sm btn-secondary" onclick="copyBugTicket('${f.id}')">
            📋 Copy Bug Ticket (Markdown)
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function getRemediationDiff(ruleId) {
  const diffs = {
    'SEC-001': {
      before: '- const apiKey = "sk-proj-abc123456789xyz"; // Hardcoded secret',
      after: '+ const apiKey = process.env.DEEPSEEK_API_KEY; // Đọc từ biến môi trường',
    },
    'SEC-006': {
      before: '- const sql = "SELECT * FROM users WHERE id = " + req.params.id;',
      after: '+ const sql = "SELECT * FROM users WHERE id = ?"; db.query(sql, [req.params.id]);',
    },
    'SEC-007': {
      before: '- const result = eval(userProvidedExpression);',
      after: '+ const result = JSON.parse(userProvidedExpression); // Tránh chạy eval',
    },
    'SEC-008': {
      before: '- document.getElementById("content").innerHTML = rawUserInput;',
      after: '+ document.getElementById("content").textContent = rawUserInput; // Hoặc dùng DOMPurify',
    },
    'SEC-009': {
      before: '- localStorage.setItem("jwt_token", userToken);',
      after: '+ document.cookie = "token=" + userToken + "; Secure; HttpOnly; SameSite=Strict";',
    },
    'SEC-010': {
      before: '- process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Tắt kiểm tra TLS',
      after: '+ // Luôn bật xác thực chứng chỉ TLS bảo mật trên môi trường Production',
    },
    'SEC-011': {
      before: '- exec("ping " + req.query.host);',
      after: '+ execFile("ping", [validatedHost]); // Dùng argument array an toàn',
    },
  };
  return diffs[ruleId] || null;
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

// ========================================================
// 10. INTERACTIVE UAT STEPS
// ========================================================
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
  const badgeEl = document.getElementById('acceptance-badge');

  if (textEl) textEl.textContent = `${checked}/${total} bước hoàn tất (${pct}%)`;
  if (fillEl) fillEl.style.width = `${pct}%`;

  if (badgeEl) {
    if (checked === total && total > 0) {
      badgeEl.textContent = 'SẴN SÀNG KÝ NGHIỆM THU (100%)';
      badgeEl.style.background = 'rgba(16, 185, 129, 0.2)';
      badgeEl.style.color = '#34d399';
      badgeEl.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
      badgeEl.textContent = `TIẾN ĐỘ ${checked}/${total} BƯỚC`;
      badgeEl.style.background = 'rgba(245, 158, 11, 0.2)';
      badgeEl.style.color = '#fbbf24';
      badgeEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    }
  }
}

// ========================================================
// 11. DIGITAL ACCEPTANCE SIGN-OFF CERTIFICATE
// ========================================================
function openSignAcceptanceModal() {
  if (!currentReport) {
    showToast('Chưa có báo cáo nào để ký nghiệm thu', 'warning');
    return;
  }
  document.getElementById('sign-acceptance-modal').style.display = 'flex';
}

function closeSignAcceptanceModal() {
  document.getElementById('sign-acceptance-modal').style.display = 'none';
}

function confirmSignAcceptance() {
  const nameInput = document.getElementById('signer-name');
  const roleInput = document.getElementById('signer-role');
  const notesInput = document.getElementById('signer-notes');

  const signerName = nameInput.value.trim();
  const signerRole = roleInput.value.trim() || 'Product Owner';
  const signerNotes = notesInput.value.trim() || 'Đã kiểm chứng đạt yêu cầu kỹ thuật.';

  if (!signerName) {
    showToast('Vui lòng nhập họ và tên người ký nghiệm thu', 'warning');
    nameInput.focus();
    return;
  }

  // Generate deterministic Verification Hash (mock signature)
  const auditId = currentReport.meta.auditId;
  const timestamp = new Date().toISOString();
  const rawData = `${auditId}|${signerName}|${signerRole}|${timestamp}|${currentReport.scores.overall}`;
  let hash = 0;
  for (let i = 0; i < rawData.length; i++) {
    hash = (hash << 5) - hash + rawData.charCodeAt(i);
    hash |= 0;
  }
  const certHash = `CT-CERT-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const certData = {
    auditId,
    signerName,
    signerRole,
    signerNotes,
    timestamp: new Date().toLocaleString('vi-VN'),
    certHash,
    overallScore: currentReport.scores.overall,
    grade: currentReport.scores.grade,
  };

  saveCertificate(auditId, certData);
  renderCertificateDisplay(certData);
  closeSignAcceptanceModal();

  showToast(`Đã đóng dấu ký duyệt nghiệm thu thành công! Mã chứng nhận: ${certHash}`, 'success', 5000);
}

function saveCertificate(auditId, certData) {
  try {
    const certs = JSON.parse(localStorage.getItem(STORAGE_KEY_CERTS) || '{}');
    certs[auditId] = certData;
    localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(certs));
  } catch {}
}

function checkAndRenderExistingCertificate(auditId) {
  const displayEl = document.getElementById('digital-certificate-display');
  const actionCard = document.getElementById('acceptance-action-card');

  try {
    const certs = JSON.parse(localStorage.getItem(STORAGE_KEY_CERTS) || '{}');
    const cert = certs[auditId];
    if (cert) {
      renderCertificateDisplay(cert);
    } else {
      displayEl.style.display = 'none';
      actionCard.style.display = 'flex';
    }
  } catch {
    displayEl.style.display = 'none';
  }
}

function renderCertificateDisplay(cert) {
  const displayEl = document.getElementById('digital-certificate-display');
  const actionCard = document.getElementById('acceptance-action-card');

  actionCard.style.display = 'none';
  displayEl.style.display = 'flex';

  displayEl.innerHTML = `
    <div class="cert-header">
      <div class="cert-seal-stamp">
        <span>🛡️</span>
        <span>BIÊN BẢN NGHIỆM THU ĐIỆN TỬ CHÍNH THỨC</span>
      </div>
      <div class="status-pill">
        <span class="status-dot"></span>
        <span style="color: #4ade80; font-weight: 700;">ĐÃ NGHIỆM THU HỢP LỆ</span>
      </div>
    </div>
    <div class="cert-body">
      <p>Bằng văn bản điện tử này, <strong>${escapeHtml(cert.signerName)}</strong> (Chức vụ: <em>${escapeHtml(cert.signerRole)}</em>) xác nhận đã tự mình kiểm chứng và nghiệm thu sản phẩm đạt điểm chất lượng <strong>${cert.overallScore}/100 (Hạng ${cert.grade})</strong> vào lúc <strong>${cert.timestamp}</strong>.</p>
      ${cert.signerNotes ? `<p style="margin-top: 6px; color: var(--text-muted);">Ghi chú bàn giao: "${escapeHtml(cert.signerNotes)}"</p>` : ''}
    </div>
    <div class="cert-hash">
      <span>MÃ BẢO CHỨNG SỐ (SHA-256): <strong>${cert.certHash}</strong></span>
    </div>
  `;
}

// ========================================================
// 12. AUDIT HISTORY & SESSIONS (LOCALSTORAGE)
// ========================================================
function loadHistory() {
  const badge = document.getElementById('history-count-badge');
  const drawerCount = document.getElementById('drawer-history-count');
  try {
    const history = getHistoryItems();
    if (badge) badge.textContent = history.length;
    if (drawerCount) drawerCount.textContent = history.length;
    renderHistoryItems(history);
  } catch {}
}

function getHistoryItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
  } catch {
    return [];
  }
}

function saveReportToHistory(report, htmlContent) {
  try {
    const history = getHistoryItems();
    // Prepend new report, limit to max 20 items
    const item = {
      auditId: report.meta.auditId,
      projectName: report.meta.projectName,
      timestamp: report.meta.timestamp,
      scores: report.scores,
      verdict: report.executiveSummary.verdict,
      findingsCount: report.securityFindings?.length || 0,
      report,
      htmlContent: htmlContent ? htmlContent.substring(0, 50000) : '', // store partial or key
    };

    // Remove duplicates of same auditId
    const filtered = history.filter(h => h.auditId !== report.meta.auditId);
    filtered.unshift(item);
    const limited = filtered.slice(0, 20);

    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(limited));
    loadHistory();
  } catch (err) {
    console.warn('Cannot save history to localStorage:', err);
  }
}

function toggleHistoryDrawer(open) {
  const drawer = document.getElementById('history-drawer');
  const overlay = document.getElementById('history-overlay');
  const isOpen = drawer.classList.contains('active');

  const shouldOpen = open !== undefined ? open : !isOpen;

  if (shouldOpen) {
    loadHistory();
    drawer.classList.add('active');
    overlay.classList.add('active');
  } else {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function renderHistoryItems(history) {
  const container = document.getElementById('history-items-container');
  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">📭</span>
        Chưa có phiên thẩm định nào được lưu.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-head">
        <span class="history-proj-name">${escapeHtml(item.projectName)}</span>
        <span class="history-grade grade-badge" style="font-size: 11px; padding: 2px 6px;">${item.scores?.grade || 'N/A'}</span>
      </div>
      <div class="history-meta-row">
        <span>${escapeHtml(item.timestamp)}</span>
        <span>${item.scores?.overall || 0}/100 • ${item.findingsCount} lỗi</span>
      </div>
      <div class="history-actions-row">
        <button class="btn btn-sm btn-primary" onclick="restoreFromHistory('${item.auditId}')">Mở Xem</button>
        <button class="btn btn-sm btn-secondary" onclick="compareWithHistoryItem('${item.auditId}')">So Sánh</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryItem('${item.auditId}')">Xóa</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function restoreFromHistory(auditId) {
  const history = getHistoryItems();
  const item = history.find(h => h.auditId === auditId);
  if (!item) {
    showToast('Không tìm thấy bản ghi lịch sử', 'error');
    return;
  }

  toggleHistoryDrawer(false);
  resetToInput();
  finishProgressAndShowReport(item.report, item.htmlContent);
  showToast(`Đã khôi phục báo cáo phiên: ${item.projectName}`, 'info');
}

function deleteHistoryItem(auditId) {
  const history = getHistoryItems().filter(h => h.auditId !== auditId);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  loadHistory();
  showToast('Đã xóa 1 mục lịch sử', 'info');
}

function clearAllHistory() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thẩm định đã lưu?')) {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    loadHistory();
    showToast('Đã dọn dẹp sạch toàn bộ lịch sử', 'info');
  }
}

// ========================================================
// 13. AUDIT DIFF / PROGRESSION INSPECTOR
// ========================================================
function openCompareModal() {
  const history = getHistoryItems();
  if (history.length < 2) {
    showToast('Cần ít nhất 2 lần thẩm định trong lịch sử để thực hiện so sánh đối chiếu', 'warning');
    return;
  }

  // Pick the most recent historical item that is not the current one
  const baseline = history.find(h => h.auditId !== currentReport?.meta.auditId) || history[1];
  if (!baseline) {
    showToast('Không tìm thấy bản ghi cũ phù hợp để so sánh', 'warning');
    return;
  }

  renderAuditDiffModal(baseline.report, currentReport);
  document.getElementById('compare-modal').style.display = 'flex';
}

function compareWithHistoryItem(baselineAuditId) {
  const history = getHistoryItems();
  const baseline = history.find(h => h.auditId === baselineAuditId);

  if (!baseline) {
    showToast('Không tìm thấy báo cáo cơ sở', 'error');
    return;
  }

  if (!currentReport) {
    restoreFromHistory(baselineAuditId);
    return;
  }

  toggleHistoryDrawer(false);
  renderAuditDiffModal(baseline.report, currentReport);
  document.getElementById('compare-modal').style.display = 'flex';
}

function closeCompareModal() {
  document.getElementById('compare-modal').style.display = 'none';
}

function renderAuditDiffModal(oldReport, newReport) {
  const body = document.getElementById('compare-modal-body');
  if (!body) return;

  const deltaOverall = newReport.scores.overall - oldReport.scores.overall;
  const deltaSec = newReport.scores.security - oldReport.scores.security;
  const deltaLogic = newReport.scores.businessLogic - oldReport.scores.businessLogic;
  const deltaVisual = newReport.scores.visualStability - oldReport.scores.visualStability;

  const formatDelta = (d) => {
    if (d > 0) return `<span class="delta-pos">+${d}</span>`;
    if (d < 0) return `<span class="delta-neg">${d}</span>`;
    return `<span class="delta-neu">0</span>`;
  };

  // Compare findings: key = ruleId + file
  const oldMap = new Map();
  (oldReport.securityFindings || []).forEach(f => {
    oldMap.set(`${f.ruleId}::${f.file}`, f);
  });

  const newMap = new Map();
  (newReport.securityFindings || []).forEach(f => {
    newMap.set(`${f.ruleId}::${f.file}`, f);
  });

  const resolvedFindings = [];
  const unresolvedFindings = [];
  const newlyAddedFindings = [];

  oldMap.forEach((finding, key) => {
    if (newMap.has(key)) {
      unresolvedFindings.push(finding);
    } else {
      resolvedFindings.push(finding);
    }
  });

  newMap.forEach((finding, key) => {
    if (!oldMap.has(key)) {
      newlyAddedFindings.push(finding);
    }
  });

  body.innerHTML = `
    <div class="diff-summary-banner">
      <div>
        <div style="font-size: 12px; color: var(--text-muted);">BẢN CŨ (${oldReport.meta.timestamp})</div>
        <strong style="font-size: 16px;">${escapeHtml(oldReport.projectInfo.name)}</strong>
        <div>Điểm: <strong>${oldReport.scores.overall}/100 (${oldReport.scores.grade})</strong></div>
      </div>
      <div style="font-size: 24px; color: var(--accent-primary);">➔</div>
      <div>
        <div style="font-size: 12px; color: var(--text-muted);">BẢN MỚI HIỆN TẠI (${newReport.meta.timestamp})</div>
        <strong style="font-size: 16px;">${escapeHtml(newReport.projectInfo.name)}</strong>
        <div>Điểm: <strong>${newReport.scores.overall}/100 (${newReport.scores.grade})</strong></div>
      </div>
    </div>

    <div class="diff-metrics-grid">
      <div class="diff-stat-card">
        <span style="font-size: 12px; color: var(--text-muted);">Điểm Tổng Thể</span>
        <div class="diff-stat-val">${formatDelta(deltaOverall)}</div>
      </div>
      <div class="diff-stat-card">
        <span style="font-size: 12px; color: var(--text-muted);">An Toàn Bảo Mật</span>
        <div class="diff-stat-val">${formatDelta(deltaSec)}</div>
      </div>
      <div class="diff-stat-card">
        <span style="font-size: 12px; color: var(--text-muted);">Logic Nghiệp Vụ</span>
        <div class="diff-stat-val">${formatDelta(deltaLogic)}</div>
      </div>
      <div class="diff-stat-card">
        <span style="font-size: 12px; color: var(--text-muted);">Ổn Định Cấu Trúc</span>
        <div class="diff-stat-val">${formatDelta(deltaVisual)}</div>
      </div>
    </div>

    <div class="diff-sections">
      <!-- 1. Resolved -->
      <div class="diff-group-box resolved">
        <div class="diff-group-title" style="color: #34d399;">
          <span>✅</span> Đã Khắc Phục Thành Công (${resolvedFindings.length} lỗi)
        </div>
        ${resolvedFindings.length === 0 ? '<div style="font-size: 13px; color: var(--text-muted);">Chưa có lỗi nào được sửa hoàn toàn.</div>' : ''}
        <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
          ${resolvedFindings.map(f => `<li><strong>${f.severity}</strong>: ${escapeHtml(f.title)} (tại <code>${escapeHtml(f.file)}</code>)</li>`).join('')}
        </ul>
      </div>

      <!-- 2. Unresolved -->
      <div class="diff-group-box unresolved">
        <div class="diff-group-title" style="color: #f87171;">
          <span>❌</span> Chưa Khắc Phục — Vẫn Còn Tồn Đọng (${unresolvedFindings.length} lỗi)
        </div>
        ${unresolvedFindings.length === 0 ? '<div style="font-size: 13px; color: var(--text-muted);">Tất cả lỗi cũ đã được giải quyết sạch sẽ!</div>' : ''}
        <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
          ${unresolvedFindings.map(f => `<li><strong>${f.severity}</strong>: ${escapeHtml(f.title)} (tại <code>${escapeHtml(f.file)}</code>)</li>`).join('')}
        </ul>
      </div>

      <!-- 3. New findings -->
      <div class="diff-group-box new">
        <div class="diff-group-title" style="color: #fbbf24;">
          <span>⚠️</span> Lỗ Hổng Mới Phát Sinh Trong Bản Này (${newlyAddedFindings.length} lỗi)
        </div>
        ${newlyAddedFindings.length === 0 ? '<div style="font-size: 13px; color: var(--text-muted);">Không phát sinh thêm lỗ hổng mới. Rất tốt!</div>' : ''}
        <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
          ${newlyAddedFindings.map(f => `<li><strong>${f.severity}</strong>: ${escapeHtml(f.title)} (tại <code>${escapeHtml(f.file)}</code>)</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// ========================================================
// 14. SKILL STORE MARKETPLACE FRONTEND
// ========================================================
async function fetchStoreSkills() {
  try {
    const res = await fetch(`${API_BASE}/api/skills`);
    if (res.ok) {
      const data = await res.json();
      allStoreSkills = data.skills || [];
    }
  } catch (err) {
    console.warn('Cannot fetch skills from API:', err);
  }
}

function openSkillStoreModal() {
  fetchStoreSkills().then(() => {
    renderStoreSkillsGrid();
    document.getElementById('skill-store-modal').style.display = 'flex';
  });
}

function closeSkillStoreModal() {
  document.getElementById('skill-store-modal').style.display = 'none';
}

function selectStoreCategory(cat) {
  currentStoreCategory = cat;
  document.querySelectorAll('.store-category-pills .store-pill').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-cat') === cat) btn.classList.add('active');
  });
  renderStoreSkillsGrid();
}

function filterStoreSkills() {
  renderStoreSkillsGrid();
}

function renderStoreSkillsGrid() {
  const container = document.getElementById('store-skills-grid');
  if (!container) return;

  const searchKeyword = (document.getElementById('store-search-input')?.value || '').toLowerCase().trim();

  let filtered = allStoreSkills;

  if (currentStoreCategory !== 'ALL') {
    filtered = filtered.filter(s => s.category === currentStoreCategory);
  }

  if (searchKeyword) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchKeyword) ||
      s.description.toLowerCase().includes(searchKeyword) ||
      s.id.toLowerCase().includes(searchKeyword)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 10px;">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">🔍</span>
        Không tìm thấy kỹ năng nào phù hợp với từ khóa "${escapeHtml(searchKeyword)}".
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(skill => {
    const isCore = skill.category === 'CORE';
    const isInternal = skill.category === 'INTERNAL';
    const badgeClass = isCore ? 'badge-core' : skill.category === 'OPTIONAL' ? 'badge-opt' : skill.category === 'PREMIUM' ? 'badge-prem' : 'badge-int';

    const card = document.createElement('div');
    card.className = 'store-card';
    card.innerHTML = `
      <div class="store-card-header">
        <div class="store-card-left">
          <div class="store-icon">${getSkillIcon(skill.category)}</div>
          <div>
            <span class="${badgeClass}">${skill.category}</span>
            <div class="store-name">${escapeHtml(skill.name)}</div>
          </div>
        </div>
        <!-- Toggle Switch -->
        <label class="switch" title="${isCore ? 'Kỹ năng nền tảng bắt buộc, không thể tắt' : 'Bật/Tắt kỹ năng'}">
          <input type="checkbox" ${skill.enabled ? 'checked' : ''} ${isCore ? 'disabled' : ''} onchange="toggleSkill('${skill.id}', this)" />
          <span class="slider"></span>
        </label>
      </div>

      <p class="store-desc">${escapeHtml(skill.description)}</p>

      <div class="store-footer-row">
        <span class="store-card-price">${formatPricing(skill.pricingModel)}</span>
        <button class="btn btn-sm btn-outline-primary" onclick="openSkillDetailModal('${skill.id}')">
          Chi Tiết →
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function getSkillIcon(category) {
  switch (category) {
    case 'CORE': return '🛡️';
    case 'OPTIONAL': return '⚡';
    case 'PREMIUM': return '💎';
    case 'INTERNAL': return '⚙️';
    default: return '🧩';
  }
}

function formatPricing(model) {
  switch (model) {
    case 'FREE': return 'Miễn Phí (Core)';
    case 'INCLUDED_IN_PRO': return 'Có trong Gói Pro';
    case 'SUBSCRIPTION': return '$49 - $99/tháng';
    case 'USAGE_BASED': return '$0.50 - $2/lần';
    case 'INTERNAL_ONLY': return 'Hệ Thống Nội Bộ';
    default: return 'Liên Hệ';
  }
}

async function toggleSkill(skillId, checkboxEl) {
  try {
    const res = await fetch(`${API_BASE}/api/skills/${skillId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entitlement: {
          tenantId: 'local-user',
          plan: 'ENTERPRISE',
          licensedSkillIds: [skillId],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      checkboxEl.checked = !checkboxEl.checked; // Revert
      showToast(data.reason || data.error || 'Không thể đổi trạng thái kỹ năng', 'warning');
      return;
    }

    // Update in local memory
    const target = allStoreSkills.find(s => s.id === skillId);
    if (target) target.enabled = data.enabled;

    const actionText = data.enabled ? 'KÍCH HOẠT' : 'TẮT';
    showToast(`Đã ${actionText} kỹ năng "${target?.name || skillId}"!`, 'success');
  } catch (err) {
    checkboxEl.checked = !checkboxEl.checked;
    showToast(`Lỗi mạng khi bật/tắt kỹ năng: ${err.message}`, 'error');
  }
}

async function openSkillDetailModal(skillId) {
  try {
    const res = await fetch(`${API_BASE}/api/skills/${skillId}`);
    if (!res.ok) throw new Error('Không lấy được dữ liệu kỹ năng');
    const data = await res.json();
    const s = data.skill;

    document.getElementById('skill-detail-title').textContent = s.name;
    const body = document.getElementById('skill-detail-body');

    body.innerHTML = `
      <div style="margin-bottom: 14px;">
        <span class="badge-core" style="font-size: 12px; padding: 4px 8px;">${s.category} • v${s.version}</span>
        <span style="font-size: 13px; color: var(--text-muted); margin-left: 10px;">Ưu tiên: <strong>${s.priority}</strong></span>
      </div>
      <p style="font-size: 14px; line-height: 1.5; margin-bottom: 14px;">${escapeHtml(s.description)}</p>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; margin-bottom: 14px;">
        <div><strong>💡 Giá trị kinh doanh:</strong> ${escapeHtml(s.businessValue)}</div>
        <div><strong>👤 Người dùng mục tiêu:</strong> ${escapeHtml(s.targetUser)}</div>
        <div><strong>🤖 Tác tử phụ trách:</strong> <code>${escapeHtml(s.requiredAgent)}</code></div>
        <div><strong>🛠️ MCP Tools yêu cầu:</strong> ${s.requiredMcpTools?.length ? s.requiredMcpTools.map(t => `<code>${t}</code>`).join(', ') : 'Không yêu cầu'}</div>
        <div><strong>💰 Chi phí ước tính:</strong> ${escapeHtml(s.costPerRunEst)} (Tokens: ${escapeHtml(s.expectedTokenUsage)})</div>
      </div>

      <div style="font-size: 13px;">
        <strong>Thứ tự thực thi phụ thuộc (Topological Execution Order):</strong>
        <ol style="padding-left: 20px; margin-top: 6px; color: var(--text-muted);">
          ${(data.executionOrder || []).map(id => `<li><code>${id}</code></li>`).join('')}
        </ol>
      </div>
    `;

    document.getElementById('skill-detail-modal').style.display = 'flex';
  } catch (err) {
    showToast(`Không thể xem chi tiết: ${err.message}`, 'error');
  }
}

function closeSkillDetailModal() {
  document.getElementById('skill-detail-modal').style.display = 'none';
}

// ========================================================
// 15. 1-CLICK COPY BUG TICKET & MARKDOWN SUMMARY
// ========================================================
function copyBugTicket(findingId) {
  if (!currentReport) return;
  const f = (currentReport.securityFindings || []).find(item => item.id === findingId);
  if (!f) {
    showToast('Không tìm thấy thông tin lỗi này', 'error');
    return;
  }

  const diff = getRemediationDiff(f.ruleId);

  const md = `### 🚨 [Bug Report] ${f.title} (${f.severity})
- **Quy tắc vi phạm**: \`${f.ruleId}\`
- **Vị trí tệp**: \`${f.file}${f.line ? `:${f.line}` : ''}\`
- **Mô tả tác động**: ${f.plainExplanation}
${f.codeSnippet ? `\n\`\`\`javascript\n${f.codeSnippet}\n\`\`\`` : ''}
#### 🛠️ Cách khắc phục đề xuất:
${f.remediation}
${diff ? `\n\`\`\`diff\n${diff.before}\n${diff.after}\n\`\`\`` : ''}
---
*Được thẩm định tự động bởi CodeTrust AI (VibeAuditor)*`;

  navigator.clipboard.writeText(md).then(() => {
    showToast(`Đã sao chép Bug Ticket "${f.title}" vào Clipboard!`, 'success');
  }).catch(() => {
    showToast('Không thể sao chép tự động, vui lòng thử lại', 'error');
  });
}

function copyMarkdownSummary() {
  if (!currentReport) {
    showToast('Chưa có báo cáo để sao chép', 'warning');
    return;
  }

  const r = currentReport;
  const md = `# 🛡️ BÁO CÁO THẨM ĐỊNH MÃ NGUỒN: ${r.projectInfo.name}
- **Kết luận**: **${r.executiveSummary.verdict}**
- **Xếp hạng chất lượng**: **Hạng ${r.scores.grade}** (Điểm: ${r.scores.overall}/100)
- **Bảo mật**: ${r.scores.security}/100 | **Logic**: ${r.scores.businessLogic}/100 | **Cấu trúc**: ${r.scores.visualStability}/100
- **Thời gian quét**: ${r.meta.timestamp} (Mã phiên: \`${r.meta.auditId}\`)

## 📋 Tóm tắt dành cho Nhà quản lý
> ${r.executiveSummary.headline}

${r.executiveSummary.businessImpactText}

### ⚠️ Rủi ro cần lưu ý:
${(r.executiveSummary.keyRisks || []).map(k => `- ${k}`).join('\n')}

## 🚨 Thống kê Lỗ hổng Bảo mật (${r.securityFindings.length} lỗi)
${r.securityFindings.map(f => `- **[${f.severity}]** ${f.title} (\`${f.file}${f.line ? `:${f.line}` : ''}\`)`).join('\n')}

---
*Báo cáo được sinh tự động bởi CodeTrust AI Engine*`;

  navigator.clipboard.writeText(md).then(() => {
    showToast('Đã sao chép toàn bộ tóm tắt Markdown vào Clipboard!', 'success');
  }).catch(() => {
    showToast('Không thể sao chép tự động, vui lòng thử lại', 'error');
  });
}

// ========================================================
// 16. EXPORT FORMATS (HTML / JSON / MD)
// ========================================================
function downloadHtmlReport() {
  if (!currentHtmlContent) {
    showToast('Không có nội dung báo cáo HTML để tải', 'warning');
    return;
  }
  const blob = new Blob([currentHtmlContent], { type: 'text/html;charset=utf-8' });
  triggerFileDownload(blob, `codetrust-audit-${currentReport?.meta.projectName || 'report'}.html`);
  showToast('Đang tải file báo cáo HTML độc lập...', 'info');
}

function downloadJsonReport() {
  if (!currentReport) {
    showToast('Không có dữ liệu JSON để tải', 'warning');
    return;
  }
  const jsonStr = JSON.stringify(currentReport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  triggerFileDownload(blob, `codetrust-report-${currentReport.meta.auditId}.json`);
  showToast('Đã xuất file JSON thành công!', 'success');
}

function downloadMarkdownReport() {
  if (!currentReport) {
    showToast('Không có dữ liệu để xuất Markdown', 'warning');
    return;
  }
  const r = currentReport;
  const md = `# Báo Cáo Thẩm Định: ${r.projectInfo.name}\n\nĐiểm: ${r.scores.overall}/100 (Hạng ${r.scores.grade})\nKết luận: ${r.executiveSummary.verdict}\n\n${r.executiveSummary.headline}\n\n${r.executiveSummary.businessImpactText}`;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  triggerFileDownload(blob, `codetrust-summary-${r.meta.auditId}.md`);
  showToast('Đã xuất file Markdown tóm tắt!', 'success');
}

function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========================================================
// 17. UTILITIES & HELPERS
// ========================================================
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
