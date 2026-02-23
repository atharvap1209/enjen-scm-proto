// Work Order Details Side Panel
// PRD sections: Header (Customer, Due Date), FG Specs, Operation Sequence, Selected Coil+Leftover%,
// Outputs (one table per operation), Line/Machine Spec, Audit Trail
import { openPanel, closePanel, showToast } from '../main.js';
import { COILS } from '../data/mock-data.js';

export function renderWODetails(wo) {
  const statusClass = {
    'Pending': 'badge--pending', 'Completed': 'badge--completed',
    'On Hold': 'badge--on-hold', 'In Progress': 'badge--in-progress',
    'Delayed': 'badge--delayed', 'Draft': 'badge--draft',
  }[wo.status] || 'badge--draft';

  const progress = wo.progress || 0;
  const customers = (wo.customers || [wo.customer]).join(', ');

  // CTAs per PRD
  let ctasHtml = '';
  switch (wo.status) {
    case 'Draft':
      ctasHtml = `<button class="btn btn--outline" id="woDraftSave">Save as Draft</button><button class="btn btn--primary" id="woSubmit">Submit</button>`;
      break;
    case 'Pending':
      ctasHtml = `<button class="btn btn--danger-outline" id="woDiscard">Discard</button><button class="btn btn--primary" id="woRelease">Release Work Order</button>`;
      break;
    case 'In Progress':
      ctasHtml = `<button class="btn btn--outline" id="woHold">Hold</button>`;
      break;
    case 'On Hold':
      ctasHtml = `<button class="btn btn--primary" id="woResume">Resume</button>`;
      break;
    default:
      ctasHtml = '';
  }

  // Planned output tables
  const slittingTable = (wo.slittingOutputs || []).length > 0 ? `
    <div style="margin-bottom:var(--sp-4)">
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:var(--sp-2)">Slitting Outputs</div>
      <table class="output-table">
        <thead><tr><th>Part Name</th><th>Coil No.</th><th>Width (mm)</th><th>Slit Coils</th><th>Weight (MT)</th><th>Leftover %</th></tr></thead>
        <tbody>${(wo.slittingOutputs).map(o => `
          <tr><td>${o.partName}</td><td>${o.coilNumber}</td><td>${o.width}</td><td>${o.numCoils}</td><td>${o.weightMT?.toFixed(2) ?? '—'}</td><td class="red-text">${o.leftoverPct?.toFixed(1) ?? '—'}%</td></tr>
        `).join('')}</tbody>
      </table>
    </div>
  ` : '';

  const cuttingTable = (wo.cuttingOutputs || []).length > 0 ? `
    <div>
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:var(--sp-2)">Cutting Outputs</div>
      <table class="output-table">
        <thead><tr><th>Part Name</th><th>Coil No.</th><th>Length (m)</th><th>Pieces</th><th>Weight (MT)</th><th>Leftover %</th></tr></thead>
        <tbody>${(wo.cuttingOutputs).map(o => `
          <tr><td>${o.partName}</td><td>${o.coilNumber}</td><td>${o.length}</td><td>${o.numPieces}</td><td>${o.weightMT?.toFixed(2) ?? '—'}</td><td class="red-text">${o.leftoverPct?.toFixed(1) ?? '—'}%</td></tr>
        `).join('')}</tbody>
      </table>
    </div>
  ` : '';

  const noOutputs = !slittingTable && !cuttingTable
    ? '<div style="color:var(--gray-400);font-size:0.85rem">No planned outputs</div>'
    : '';

  // Coil rows - look up from selected coils IDs
  const coilIds = wo.coils || [];
  const coilRows = coilIds.length > 0
    ? coilIds.map(id => {
      const c = COILS.find(x => x.id === id) || { id, category: '—', grade: '—', thicknessMm: '—', widthMm: '—', surface: '—', currentWeightMT: '—', aging: '—' };
      return `<tr><td>${c.id}</td><td>${c.category}</td><td>${c.grade}</td><td>${c.thicknessMm} mm</td><td>${c.widthMm} mm</td><td>${c.surface}</td><td>${c.currentWeightMT} MT</td><td>${c.aging}</td></tr>`;
    }).join('')
    : `<tr><td colspan="8" style="color:var(--gray-400);text-align:center">No coils selected</td></tr>`;

  // Op sequence
  const ops = wo.operationType === 'Slitting + Cutting' ? ['Slitting', 'Cutting'] : [wo.operationType];
  const opSeq = ops.map((op, i) => `${i > 0 ? '<span class="op-sequence__arrow">→</span>' : ''}<span class="op-sequence__chip">${i + 1}. ${op}</span>`).join('');

  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">${wo.id}</h2>
        <span class="badge ${statusClass}">${wo.status}</span>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="panel-body">

      <!-- Header row: Customer + Due Date + Progress -->
      <div style="display:flex;align-items:center;gap:var(--sp-5);margin-bottom:var(--sp-2)">
        <div class="kv-item"><div class="kv-label">Customer</div><div class="kv-value">${customers}</div></div>
        <div class="kv-item"><div class="kv-label">Due Date</div><div class="kv-value">${wo.dueDate || '—'}</div></div>
        <div class="kv-item"><div class="kv-label">Priority</div><div class="kv-value">${wo.priority || '—'}</div></div>
        <div class="kv-item" style="margin-left:auto"><div class="kv-label">Created By</div><div class="kv-value">${wo.createdBy || '—'}</div></div>
      </div>

      <!-- Progress -->
      <div class="progress-bar">
        <div class="progress-bar__header"><span>Overall Progress</span><span>${progress}%</span></div>
        <div class="progress-bar__track"><div class="progress-bar__fill" style="width:${progress}%"></div></div>
      </div>

      <!-- Finished Goods Specs -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Finished Goods Specifications</h3></div>
        <div class="card__body">
          <div class="kv-grid kv-grid--4col">
            <div class="kv-item"><div class="kv-label">Category</div><div class="kv-value">${wo.category || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Grade</div><div class="kv-value">${wo.grade || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Thickness</div><div class="kv-value">${wo.thicknessMin ?? '—'}–${wo.thicknessMax ?? '—'} mm</div></div>
            <div class="kv-item"><div class="kv-label">Width</div><div class="kv-value">${wo.widthMin ?? '—'}–${wo.widthMax ?? '—'} mm</div></div>
            <div class="kv-item"><div class="kv-label">Coating</div><div class="kv-value">${wo.coating || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Surface Finish</div><div class="kv-value">${wo.surfaceFinish || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Qty Demanded</div><div class="kv-value">${wo.quantityDemand ? wo.quantityDemand + ' MT' : '—'}</div></div>
          </div>
        </div>
      </div>

      <!-- Operation Sequence -->
      <div class="op-sequence">
        <div class="op-sequence__title">Operation Sequence</div>
        <div class="op-sequence__flow">${opSeq}</div>
      </div>

      <!-- Selected Coils & Leftover -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Selected Coils & Leftover</h3></div>
        <div class="card__body">
          <table class="output-table" style="margin-bottom:var(--sp-3)">
            <thead><tr><th>Coil No.</th><th>Category</th><th>Grade</th><th>Thickness</th><th>Width</th><th>Surface</th><th>Current Wt.</th><th>Aging</th></tr></thead>
            <tbody>${coilRows}</tbody>
          </table>
          <div class="summary-bar summary-bar--3">
            <div class="kv-item"><div class="kv-label">Coil Utilization</div><div class="kv-value">${wo.coilUtilization}%</div></div>
            <div class="kv-item"><div class="kv-label">Leftover Coil %</div><div class="kv-value text-red">${wo.leftoverPct}%</div></div>
            <div class="kv-item"><div class="kv-label">Qty Demanded</div><div class="kv-value">${wo.quantityDemand ? wo.quantityDemand + ' MT' : '—'}</div></div>
          </div>
        </div>
      </div>

      <!-- Planned Outputs -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Planned Outputs</h3></div>
        <div class="card__body">
          ${slittingTable}${cuttingTable}${noOutputs}
        </div>
      </div>

      <!-- Line & Machine -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Line & Machine Specification</h3></div>
        <div class="card__body">
          <div class="kv-grid kv-grid--2col">
            <div class="kv-item"><div class="kv-label">Production Line</div><div class="kv-value">${wo.line || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Machine</div><div class="kv-value">${wo.machine || '—'}</div></div>
          </div>
        </div>
      </div>

      <!-- Audit Trail -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Audit Trail</h3></div>
        <div class="card__body">
          <table class="output-table">
            <thead><tr><th>Action</th><th>By</th><th>Date & Time</th></tr></thead>
            <tbody>
              <tr><td>Created</td><td>${wo.createdBy || '—'}</td><td>${wo.startDate || '—'} 09:30 AM</td></tr>
              ${wo.status !== 'Draft' ? `<tr><td>Submitted</td><td>${wo.createdBy || '—'}</td><td>${wo.startDate || '—'} 09:45 AM</td></tr>` : ''}
              ${wo.status === 'In Progress' || wo.status === 'Completed' ? `<tr><td>Released</td><td>${wo.createdBy || '—'}</td><td>${wo.startDate || '—'} 10:00 AM</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    ${ctasHtml ? `<div class="panel-footer"><div></div><div class="panel-footer__right">${ctasHtml}</div></div>` : ''}
  `;

  openPanel(html);

  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('woDiscard')?.addEventListener('click', () => { showToast('Discarded', 'Work order discarded', 'error'); closePanel(); });
    document.getElementById('woRelease')?.addEventListener('click', () => {
      wo.status = 'In Progress';
      showToast('Success!', 'Work order released');
      renderWODetails(wo);
    });
    document.getElementById('woHold')?.addEventListener('click', () => {
      wo.status = 'On Hold';
      showToast('On Hold', 'Work order put on hold');
      renderWODetails(wo);
    });
    document.getElementById('woResume')?.addEventListener('click', () => {
      wo.status = 'In Progress';
      showToast('Resumed', 'Work order resumed');
      renderWODetails(wo);
    });
  }, 50);
}
