// Production Process — Complete Stage Panel
// Real-time: Actual Leftover %, Variance, Utilized Weight, Balance Weight
import { openPanel, closePanel, showToast } from '../main.js';
import { PRODUCTION_STAGES, COILS, calcWeightMT } from '../data/mock-data.js';
import { renderStageDetails } from './pp-stage-details.js';

export function renderCompleteStage(stage) {
  const isSlitting = stage.operationType === 'Slitting';
  const isCutting = stage.operationType === 'Cutting';

  // Mock planned outputs (in real app, these come from the WO's planned outputs for this stage)
  const slittingPlanned = [
    { partName: 'Part A', coilNumber: 'COIL-001', width: 300, numCoils: 1, plannedWeight: 20, plannedLeftover: 20 },
    { partName: 'Part B', coilNumber: 'COIL-001', width: 400, numCoils: 3, plannedWeight: 60, plannedLeftover: 10 },
  ];
  const cuttingPlanned = [
    { partName: 'Part C', coilNumber: 'COIL-001', length: 6, numPieces: 100, plannedWeight: 30, plannedLeftover: 20 },
    { partName: 'Part D', coilNumber: 'COIL-002', length: 8, numPieces: 200, plannedWeight: 50, plannedLeftover: 35 },
  ];

  // Coils involved in this stage
  const involvedCoils = COILS.slice(0, 2).map(c => ({ ...c }));

  let outputTableHtml = '';

  if (isSlitting) {
    outputTableHtml = `
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header" style="justify-content:space-between">
          <h3 class="card__title">Planned Outputs — Slitting</h3>
          <label style="font-size:0.8rem;display:flex;align-items:center;gap:6px;cursor:pointer">
            <input type="checkbox" class="checkbox-input" id="markActualSlit" /> Mark Actual = Original
          </label>
        </div>
        <div class="card__body" style="overflow-x:auto">
          <table class="output-table" id="slitActualsTable">
            <thead><tr>
              <th>Part Name</th><th>Coil No.</th><th>Width (mm)</th><th>Slit Coils</th>
              <th>Planned Weight (MT)</th><th>Planned Leftover %</th>
              <th style="background:var(--purple-50)">Actual Weight (MT)</th>
              <th style="background:var(--purple-50)">Actual Leftover %</th>
              <th style="background:var(--purple-50)">Variance (MT)</th>
            </tr></thead>
            <tbody>
              ${slittingPlanned.map((o, i) => `<tr>
                <td>${o.partName}</td><td>${o.coilNumber}</td>
                <td>${o.width}</td><td>${o.numCoils}</td>
                <td>${o.plannedWeight}</td><td>${o.plannedLeftover}%</td>
                <td style="background:var(--purple-50)">
                  <input class="form-input slit-actual-weight" type="number" id="slitActWeight${i}"
                    data-idx="${i}" data-planned="${o.plannedWeight}" style="width:90px;padding:4px 8px" />
                </td>
                <td style="background:var(--purple-50)" id="slitActLeftover${i}">—</td>
                <td style="background:var(--purple-50)" id="slitVariance${i}">—</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } else if (isCutting) {
    outputTableHtml = `
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header" style="justify-content:space-between">
          <h3 class="card__title">Planned Outputs — Cutting</h3>
          <label style="font-size:0.8rem;display:flex;align-items:center;gap:6px;cursor:pointer">
            <input type="checkbox" class="checkbox-input" id="markActualCut" /> Mark Actual = Original
          </label>
        </div>
        <div class="card__body" style="overflow-x:auto">
          <table class="output-table" id="cutActualsTable">
            <thead><tr>
              <th>Part Name</th><th>Coil No.</th><th>Length (m)</th><th>Pieces</th>
              <th>Planned Weight (MT)</th><th>Planned Leftover %</th>
              <th style="background:var(--purple-50)">Actual Pieces</th>
              <th style="background:var(--purple-50)">Actual Weight (MT)</th>
              <th style="background:var(--purple-50)">Actual Leftover %</th>
              <th style="background:var(--purple-50)">Variance (MT)</th>
            </tr></thead>
            <tbody>
              ${cuttingPlanned.map((o, i) => `<tr>
                <td>${o.partName}</td><td>${o.coilNumber}</td>
                <td>${o.length} m</td><td>${o.numPieces}</td>
                <td>${o.plannedWeight}</td><td>${o.plannedLeftover}%</td>
                <td style="background:var(--purple-50)">
                  <input class="form-input cut-actual-pieces" type="number" id="cutActPieces${i}"
                    data-idx="${i}" style="width:80px;padding:4px 8px" />
                </td>
                <td style="background:var(--purple-50)">
                  <input class="form-input cut-actual-weight" type="number" id="cutActWeight${i}"
                    data-idx="${i}" data-planned="${o.plannedWeight}" style="width:90px;padding:4px 8px" />
                </td>
                <td style="background:var(--purple-50)" id="cutActLeftover${i}">—</td>
                <td style="background:var(--purple-50)" id="cutVariance${i}">—</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Coil status table — Utilized & Balance will be computed real-time
  const coilStatusTableHtml = `
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Coil Status</h3></div>
        <div class="card__body">
          <table class="output-table" id="coilStatusTable">
            <thead><tr>
              <th>Coil Number</th><th>Original Weight (MT)</th>
              <th style="background:var(--purple-50)">Utilized Weight (MT)</th>
              <th style="background:var(--purple-50)">Balance Weight (MT)</th>
            </tr></thead>
            <tbody>
              ${involvedCoils.map((c, i) => `<tr>
                <td>${c.id}</td>
                <td>${c.currentWeightMT} MT</td>
                <td style="background:var(--purple-50)" id="coilUtilized${i}">—</td>
                <td style="background:var(--purple-50)" id="coilBalance${i}">—</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">Complete Stage</h2>
        <span class="badge badge--in-progress">${stage.operationType}</span>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="panel-body">
      <!-- Summary -->
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Stage Summary</h3></div>
        <div class="card__body">
          <div class="kv-grid kv-grid--3col" style="margin-bottom:var(--sp-3)">
            <div class="kv-item"><div class="kv-label">WO Number</div><div class="kv-value">${stage.woNumber}</div></div>
            <div class="kv-item"><div class="kv-label">Stage</div><div class="kv-value">${stage.stageName}</div></div>
            <div class="kv-item"><div class="kv-label">Operation</div><div class="kv-value">${stage.operationType}</div></div>
            <div class="kv-item"><div class="kv-label">Customer</div><div class="kv-value">${stage.customer || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Machine</div><div class="kv-value">${stage.machine}</div></div>
            <div class="kv-item"><div class="kv-label">Line</div><div class="kv-value">${stage.line}</div></div>
          </div>
        </div>
      </div>

      <!-- Editable Actuals with real-time calculations -->
      ${outputTableHtml}

      <!-- Coil Status with real-time Utilized & Balance -->
      ${coilStatusTableHtml}

      <!-- Remarks -->
      <div class="form-group">
        <label class="form-label">Remarks</label>
        <textarea class="form-textarea" id="stageRemarks" placeholder="Enter detailed remarks..."></textarea>
      </div>
    </div>

    <div class="panel-footer">
      <div></div>
      <div class="panel-footer__right">
        <button class="btn btn--outline" id="completeCancel">Cancel</button>
        <button class="btn btn--primary" id="completeSubmit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Complete Stage
        </button>
      </div>
    </div>`;

  openPanel(html);

  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('completeCancel')?.addEventListener('click', () => renderStageDetails(stage));

    // ─── Real-time calc for Slitting ───
    if (isSlitting) {
      // Mark Actual = Original
      document.getElementById('markActualSlit')?.addEventListener('change', e => {
        if (e.target.checked) {
          slittingPlanned.forEach((o, i) => {
            const el = document.getElementById(`slitActWeight${i}`);
            if (el) { el.value = o.plannedWeight; el.dispatchEvent(new Event('input')); }
          });
        }
      });

      // Individual actual weight input → recalc leftover % and variance in real-time
      document.querySelectorAll('.slit-actual-weight').forEach(input => {
        input.addEventListener('input', () => recalcSlitting(slittingPlanned, involvedCoils));
      });
    }

    // ─── Real-time calc for Cutting ───
    if (isCutting) {
      document.getElementById('markActualCut')?.addEventListener('change', e => {
        if (e.target.checked) {
          cuttingPlanned.forEach((o, i) => {
            const pEl = document.getElementById(`cutActPieces${i}`);
            const wEl = document.getElementById(`cutActWeight${i}`);
            if (pEl) { pEl.value = o.numPieces; pEl.dispatchEvent(new Event('input')); }
            if (wEl) { wEl.value = o.plannedWeight; wEl.dispatchEvent(new Event('input')); }
          });
        }
      });

      document.querySelectorAll('.cut-actual-weight, .cut-actual-pieces').forEach(input => {
        input.addEventListener('input', () => recalcCutting(cuttingPlanned, involvedCoils));
      });
    }

    document.getElementById('completeSubmit')?.addEventListener('click', () => {
      stage.status = 'Completed';
      stage.progress = 100;
      showToast('Success!', `${stage.stageName} completed`);
      showCompleteSuccess(stage);
    });
  }, 50);
}

// ─── Real-time calculation helpers ───

function recalcSlitting(planned, coils) {
  let totalUtilized = 0;

  planned.forEach((o, i) => {
    const actualWeightEl = document.getElementById(`slitActWeight${i}`);
    const actualWeight = parseFloat(actualWeightEl?.value) || 0;

    // Actual Leftover % = (Planned Weight - Actual Weight) / Planned Weight × 100
    const actLeftover = o.plannedWeight > 0
      ? Math.max(0, ((o.plannedWeight - actualWeight) / o.plannedWeight) * 100)
      : 0;

    // Variance = Actual Weight - Planned Weight  (positive = over, negative = under)
    const variance = actualWeight - o.plannedWeight;

    const leftoverEl = document.getElementById(`slitActLeftover${i}`);
    const varianceEl = document.getElementById(`slitVariance${i}`);

    if (leftoverEl) leftoverEl.innerHTML = actualWeight
      ? `<span class="${actLeftover > 15 ? 'red-text' : 'text-green'}">${actLeftover.toFixed(1)}%</span>`
      : '—';
    if (varianceEl) varianceEl.innerHTML = actualWeight
      ? `<span class="${variance < 0 ? 'red-text' : 'text-green'}">${variance >= 0 ? '+' : ''}${variance.toFixed(2)} MT</span>`
      : '—';

    totalUtilized += actualWeight;
  });

  // Coil Status — distribute utilized weight across coils proportionally
  updateCoilStatus(coils, totalUtilized);
}

function recalcCutting(planned, coils) {
  let totalUtilized = 0;

  planned.forEach((o, i) => {
    const actualWeightEl = document.getElementById(`cutActWeight${i}`);
    const actualWeight = parseFloat(actualWeightEl?.value) || 0;

    // Actual Leftover % = (Planned Weight - Actual Weight) / Planned Weight × 100
    const actLeftover = o.plannedWeight > 0
      ? Math.max(0, ((o.plannedWeight - actualWeight) / o.plannedWeight) * 100)
      : 0;

    // Variance = Actual Weight - Planned Weight
    const variance = actualWeight - o.plannedWeight;

    const leftoverEl = document.getElementById(`cutActLeftover${i}`);
    const varianceEl = document.getElementById(`cutVariance${i}`);

    if (leftoverEl) leftoverEl.innerHTML = actualWeight
      ? `<span class="${actLeftover > 15 ? 'red-text' : 'text-green'}">${actLeftover.toFixed(1)}%</span>`
      : '—';
    if (varianceEl) varianceEl.innerHTML = actualWeight
      ? `<span class="${variance < 0 ? 'red-text' : 'text-green'}">${variance >= 0 ? '+' : ''}${variance.toFixed(2)} MT</span>`
      : '—';

    totalUtilized += actualWeight;
  });

  updateCoilStatus(coils, totalUtilized);
}

function updateCoilStatus(coils, totalUtilized) {
  // Distribute utilized weight across coils proportionally by their original weight
  const totalOriginal = coils.reduce((s, c) => s + c.currentWeightMT, 0);

  coils.forEach((c, i) => {
    const share = totalOriginal > 0 ? (c.currentWeightMT / totalOriginal) * totalUtilized : 0;
    const balance = Math.max(0, c.currentWeightMT - share);

    const utilizedEl = document.getElementById(`coilUtilized${i}`);
    const balanceEl = document.getElementById(`coilBalance${i}`);

    if (utilizedEl) utilizedEl.textContent = totalUtilized > 0 ? `${share.toFixed(2)} MT` : '—';
    if (balanceEl) balanceEl.textContent = totalUtilized > 0 ? `${balance.toFixed(2)} MT` : '—';
  });
}

// ─── Success State ───
function showCompleteSuccess(stage) {
  const stageIdx = PRODUCTION_STAGES.findIndex(s => s.id === stage.id);
  const nextStage = PRODUCTION_STAGES[stageIdx + 1];
  const isLast = !nextStage || nextStage.woNumber !== stage.woNumber;

  const ctasHtml = isLast
    ? `<button class="btn btn--outline" id="successGoList">Go to Production Process List</button>
           <button class="btn btn--primary" id="successGoWO">Go to Work Order</button>`
    : `<button class="btn btn--outline" id="successGoWO">Go to Work Order</button>
           <button class="btn btn--primary" id="successNextStage">Go to Next Stage</button>`;

  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">Stage Completed</h2>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="panel-body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;text-align:center">
      <div style="width:80px;height:80px;background:var(--green-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:var(--sp-6)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#16A34A"/><path d="M8 12l2.5 2.5L16 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:var(--sp-2)">Stage Completed Successfully!</h2>
      <p style="color:var(--gray-500);margin-bottom:var(--sp-5)">${stage.stageName} for <strong>${stage.woNumber}</strong> has been recorded.</p>
      <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:var(--sp-5);width:100%;max-width:400px;margin-bottom:var(--sp-6);text-align:left">
        <div class="kv-grid kv-grid--2col">
          <div class="kv-item"><div class="kv-label">WO Number</div><div class="kv-value">${stage.woNumber}</div></div>
          <div class="kv-item"><div class="kv-label">Stage</div><div class="kv-value">${stage.stageName}</div></div>
          <div class="kv-item"><div class="kv-label">Operation</div><div class="kv-value">${stage.operationType}</div></div>
          <div class="kv-item"><div class="kv-label">Status</div><div class="kv-value"><span class="badge badge--completed">Completed</span></div></div>
        </div>
      </div>
      <div style="display:flex;gap:var(--sp-3)">${ctasHtml}</div>
    </div>`;

  openPanel(html);

  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('successNextStage')?.addEventListener('click', () => { if (nextStage) renderStageDetails(nextStage); });
    document.getElementById('successGoWO')?.addEventListener('click', () => { closePanel(); window.location.hash = '#/work-orders'; });
    document.getElementById('successGoList')?.addEventListener('click', () => { closePanel(); window.location.hash = '#/production-process'; });
  }, 50);
}
