// Work Order Create — 5-Step Stepper Panel
// PRD Step 1: {WO Due Date + Customers} then Finished Good Specifications, then Operations
import { openPanel, closePanel, showToast } from '../main.js';
import { CUSTOMERS, ITEM_CATEGORIES, ITEM_TYPES, GRADES, SURFACES, LINES, MACHINES, COILS, calcCoilLengthM, calcWeightMT, calcLeftoverPct } from '../data/mock-data.js';

let currentStep = 1;
const TOTAL_STEPS = 5;
let WO_COUNTER = 11;

// ─── Shared State ───
let fd = {}; // formData

function resetFD() {
  fd = {
    dueDate: '', customers: [],
    category: '', grade: '', thicknessMin: '', thicknessMax: '',
    widthMin: '', widthMax: '', coating: '', surface: '', quantityDemand: '',
    operations: [], // ['Slitting'] | ['Cutting'] | ['Slitting','Cutting']
    selectedCoils: [],
    slittingOutputs: [], // { id, partName, coilId, width, numCoils, weightMT, leftoverPct }
    cuttingOutputs: [], // { id, partName, coilId, length, numPieces, weightMT, leftoverPct }
    comboInputs: [], // for Slitting+Cutting: raw user inputs { id, coilId, width, length, numPieces, partName, weightMT, leftoverPct }
    lineAssignments: {}, machineAssignments: {},
  };
}

export function renderWOCreate() {
  currentStep = 1;
  resetFD();
  drawStep();
}

// ─── Stepper Helper ───
function buildStepper() {
  const labels = ['Due Date &\nCustomers', 'Select\nCoils', 'Planned\nOutputs', 'Line &\nMachine', 'Review'];
  const fillPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  return `
    <div class="stepper">
      <div class="stepper__line"><div class="stepper__line-fill" style="width:${fillPct}%"></div></div>
      ${labels.map((label, i) => {
    const step = i + 1;
    const cls = step < currentStep ? 'stepper__step--completed' : step === currentStep ? 'stepper__step--active' : '';
    const inner = step < currentStep
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
      : step;
    return `<div class="stepper__step ${cls}"><div class="stepper__circle">${inner}</div><div class="stepper__label">${label.replace('\n', '<br>')}</div></div>`;
  }).join('')}
    </div>`;
}

// ─── Main Draw ───
function drawStep() {
  let bodyHtml = '';
  switch (currentStep) {
    case 1: bodyHtml = buildStep1(); break;
    case 2: bodyHtml = buildStep2(); break;
    case 3: bodyHtml = buildStep3(); break;
    case 4: bodyHtml = buildStep4(); break;
    case 5: bodyHtml = buildStep5(); break;
  }

  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">Create Work Order</h2>
        <span class="badge badge--draft">Draft</span>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    ${buildStepper()}
    <div class="panel-body">${bodyHtml}</div>
    <div class="panel-footer">
      <div class="panel-footer__left">
        <button class="btn btn--ghost ${currentStep === 1 ? 'btn--disabled' : ''}" id="prevBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Previous
        </button>
      </div>
      <div class="panel-footer__right">
        <button class="btn btn--outline" id="saveDraftBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save as Draft
        </button>
        ${currentStep < TOTAL_STEPS
      ? `<button class="btn btn--primary" id="nextBtn">Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>`
      : `<button class="btn btn--primary" id="submitBtn">Submit</button>`}
      </div>
    </div>`;

  openPanel(html);

  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('prevBtn')?.addEventListener('click', () => { if (currentStep > 1) { saveStep(); currentStep--; drawStep(); } });
    document.getElementById('nextBtn')?.addEventListener('click', () => { saveStep(); currentStep++; drawStep(); });
    document.getElementById('saveDraftBtn')?.addEventListener('click', () => showToast('Saved as Draft', 'Work order saved as draft'));
    document.getElementById('submitBtn')?.addEventListener('click', () => { saveStep(); showSuccessInPanel(); });
    bindStep();
  }, 50);
}

// ─── STEP 1: Due Date + Customers | FG Specs | Operations ───
function buildStep1() {
  const custChips = fd.customers.map(c =>
    `<span class="multi-select__chip">${c}<span class="multi-select__chip-remove" data-customer="${c}">&times;</span></span>`
  ).join('');

  const opRows = ['Slitting', 'Cutting'].map(op => {
    const checked = fd.operations.includes(op);
    const stepNum = checked ? fd.operations.indexOf(op) + 1 : '';
    return `<label class="checkbox-row ${checked ? 'selected' : ''}">
      <input type="checkbox" class="checkbox-input" data-op="${op}" ${checked ? 'checked' : ''} />
      ${op}
      ${checked ? `<span class="step-label">Step ${stepNum}</span>` : ''}
    </label>`;
  }).join('');

  const opSeq = fd.operations.length > 0 ? `
    <div class="op-sequence" style="margin-top:var(--sp-3)">
      <div class="op-sequence__title">Operation Sequence</div>
      <div class="op-sequence__flow">
        ${fd.operations.map((op, i) => `${i > 0 ? '<span class="op-sequence__arrow">→</span>' : ''}<span class="op-sequence__chip">${i + 1}. ${op}</span>`).join('')}
      </div>
    </div>` : '';

  return `
    <!-- Section A: WO Due Date + Customers -->
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Work Order Details</h3></div>
      <div class="card__body">
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
          <div class="form-group">
            <label class="form-label">WO Due Date <span class="required">*</span></label>
            <input class="form-input" type="date" id="dueDate" value="${fd.dueDate}" />
          </div>
          <div class="form-group">
            <label class="form-label">Customer <span class="required">*</span></label>
            <div class="multi-select">
              <div class="multi-select__trigger" id="customerTrigger">
                ${custChips}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style="margin-left:auto;flex-shrink:0"><path d="M1 1.5L6 6.5L11 1.5" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="multi-select__dropdown" id="customerDropdown">
                ${CUSTOMERS.map(c => `<label class="multi-select__option"><input type="checkbox" class="checkbox-input" data-cust="${c}" ${fd.customers.includes(c) ? 'checked' : ''}>${c}</label>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section B: Finished Good Specifications -->
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Finished Good Specifications</h3></div>
      <div class="card__body">
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
          <div class="form-group">
            <label class="form-label">Category <span class="required">*</span></label>
            <select class="form-select" id="category">
              <option value="">Select</option>
              ${ITEM_CATEGORIES.map(c => `<option value="${c}" ${fd.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Grade <span class="required">*</span></label>
            <select class="form-select" id="grade">
              <option value="">Select</option>
              ${GRADES.map(g => `<option value="${g}" ${fd.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
          <div class="form-group">
            <label class="form-label">Thickness Range (mm) <span class="required">*</span></label>
            <div class="form-row--range">
              <div class="form-group"><input class="form-input" type="number" id="thicknessMin" value="${fd.thicknessMin}" placeholder="Min (1-5)" min="1" max="5" step="0.1" /></div>
              <span class="range-sep">to</span>
              <div class="form-group"><input class="form-input" type="number" id="thicknessMax" value="${fd.thicknessMax}" placeholder="Max (1-5)" min="1" max="5" step="0.1" /></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Width Range (mm) <span class="required">*</span></label>
            <div class="form-row--range">
              <div class="form-group"><input class="form-input" type="number" id="widthMin" value="${fd.widthMin}" placeholder="Min" /></div>
              <span class="range-sep">to</span>
              <div class="form-group"><input class="form-input" type="number" id="widthMax" value="${fd.widthMax}" placeholder="Max" /></div>
            </div>
          </div>
        </div>
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
          <div class="form-group">
            <label class="form-label">Coating <span class="required">*</span></label>
            <input class="form-input" type="text" id="coating" value="${fd.coating}" placeholder="e.g. 120 GSM, Galvanized" />
          </div>
          <div class="form-group">
            <label class="form-label">Surface Finish <span class="required">*</span></label>
            <select class="form-select" id="surface">
              <option value="">Select</option>
              ${SURFACES.map(s => `<option value="${s}" ${fd.surface === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">Item Type</label>
            <select class="form-select" id="itemType">
              <option value="">Select</option>
              ${ITEM_TYPES.map(t => `<option value="${t}" ${fd.itemType === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity Demanded (MT) <span class="required">*</span></label>
            <input class="form-input" type="number" id="quantityDemand" value="${fd.quantityDemand}" min="0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Section C: Operations -->
    <div class="card">
      <div class="card__header"><h3 class="card__title">Operations</h3></div>
      <div class="card__body">
        <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
          ${opRows}
        </div>
        ${opSeq}
      </div>
    </div>`;
}

// ─── STEP 2: Coil Selection ───
// PRD columns: Coil No, Category, Grade, Thickness, Width, Surface, Current Weight, Aging
// Summary: Leftover Coil Quantity, Quantity Demanded, Leftover Coil %
function buildStep2() {
  const selectedIds = fd.selectedCoils.map(c => c.id);
  const totalAllocatedMT = fd.selectedCoils.reduce((s, c) => s + c.currentWeightMT, 0);
  const qd = parseFloat(fd.quantityDemand) || 0;
  const leftoverMT = Math.max(0, totalAllocatedMT - qd);
  const leftoverPct = totalAllocatedMT > 0 ? ((leftoverMT / totalAllocatedMT) * 100).toFixed(1) : '0.0';

  return `
    <div class="section-title">Suggested Coils</div>
    <div class="search-bar" style="max-width:100%;margin-bottom:var(--sp-3)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" placeholder="Search coils..." id="coilSearch" />
    </div>
    <div class="data-table-wrapper" style="margin-bottom:var(--sp-5)">
      <table class="data-table">
        <thead><tr>
          <th style="width:40px"></th>
          <th>Coil No.</th><th>Category</th><th>Grade</th>
          <th>Thickness (mm)</th><th>Width (mm)</th><th>Surface</th>
          <th>Current Weight (MT)</th><th>Aging</th>
        </tr></thead>
        <tbody>
          ${COILS.map(coil => `
            <tr>
              <td><input type="checkbox" class="checkbox-input" data-coil-id="${coil.id}" ${selectedIds.includes(coil.id) ? 'checked' : ''} /></td>
              <td>${coil.id}</td><td>${coil.category}</td><td>${coil.grade}</td>
              <td>${coil.thicknessMm}</td><td>${coil.widthMm}</td><td>${coil.surface}</td>
              <td>${coil.currentWeightMT}</td><td>${coil.aging}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card__header"><h3 class="card__title">Leftover Coil Summary</h3></div>
      <div class="card__body">
        <div class="summary-bar summary-bar--3">
          <div class="kv-item"><div class="kv-label">Leftover Coil Quantity (after all ops)</div><div class="kv-value">${leftoverMT.toFixed(2)} MT</div></div>
          <div class="kv-item"><div class="kv-label">Quantity Demanded</div><div class="kv-value">${qd} MT</div></div>
          <div class="kv-item"><div class="kv-label">Leftover Coil %</div><div class="kv-value text-red">${leftoverPct}%</div></div>
        </div>
      </div>
    </div>`;
}

// ─── STEP 3: Planned Outputs ───
function buildStep3() {
  const ops = fd.operations;
  if (ops.includes('Slitting') && ops.includes('Cutting')) return buildStep3SlitCut();
  if (ops.includes('Slitting')) return buildStep3Slitting();
  if (ops.includes('Cutting')) return buildStep3Cutting();
  return `<div style="color:var(--gray-400)">Please select operations in Step 1 first.</div>`;
}

// ─ Slitting Only ─
function buildStep3Slitting() {
  const coilOpts = fd.selectedCoils.map(c => `<option value="${c.id}">${c.id} (${c.widthMm}mm wide)</option>`).join('');
  const tableHtml = buildSlittingTable(fd.slittingOutputs, true, true);
  const totalWidth = calcTotalOutputWidth(fd.slittingOutputs);
  const coil = fd.selectedCoils[0];
  const coilW = coil?.widthMm || 0;
  const leftoverW = Math.max(0, coilW - totalWidth);
  const leftoverPct = coilW > 0 ? ((leftoverW / coilW) * 100).toFixed(1) : '0.0';
  const totalPcs = fd.slittingOutputs.reduce((s, o) => s + o.numCoils, 0);

  return `
    <div class="section-title">Planned Outputs — Slitting</div>
    ${tableHtml}
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Add Slitting Output</h3></div>
      <div class="card__body">
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-3)">
          <div class="form-group">
            <label class="form-label">Coil <span class="required">*</span></label>
            <select class="form-select" id="slitCoilId"><option value="">Select coil</option>${coilOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Part Name <span class="required">*</span></label>
            <input class="form-input" type="text" id="slitPartName" placeholder="e.g. Part A" />
          </div>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">Target Width (mm) <span class="required">*</span></label>
            <input class="form-input" type="number" id="slitWidth" min="1" />
          </div>
          <div class="form-group">
            <label class="form-label">Number of Slit Coils <span class="required">*</span></label>
            <input class="form-input" type="number" id="slitNumCoils" value="1" min="1" />
          </div>
        </div>
      </div>
    </div>
    <button class="add-output-btn" id="addSlitBtn">+ Add Output</button>
    ${fd.slittingOutputs.length > 0 ? `
    <div class="summary-bar summary-bar--3" style="margin-top:var(--sp-4)">
      <div class="kv-item"><div class="kv-label">Leftover Coil %</div><div class="kv-value text-red">${leftoverPct}%</div></div>
      <div class="kv-item"><div class="kv-label">Total Width Used</div><div class="kv-value">${totalWidth} mm</div></div>
      <div class="kv-item"><div class="kv-label">Total Slit Coils</div><div class="kv-value">${totalPcs}</div></div>
    </div>` : ''}`;
}

// ─ Cutting Only ─
function buildStep3Cutting() {
  const coilOpts = fd.selectedCoils.map(c => {
    const len = calcCoilLengthM(c.currentWeightMT, c.thicknessMm, c.widthMm).toFixed(1);
    return `<option value="${c.id}">${c.id} (${len}m long)</option>`;
  }).join('');
  const tableHtml = buildCuttingTable(fd.cuttingOutputs, true, true);
  const totalPcs = fd.cuttingOutputs.reduce((s, o) => s + o.numPieces, 0);
  const totalLenM = fd.cuttingOutputs.reduce((s, o) => s + o.length * o.numPieces, 0).toFixed(2);
  const lastLeftover = fd.cuttingOutputs.length > 0 ? fd.cuttingOutputs[fd.cuttingOutputs.length - 1].leftoverPct.toFixed(1) : '0.0';

  return `
    <div class="section-title">Planned Outputs — Cutting</div>
    ${tableHtml}
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Add Cutting Output</h3></div>
      <div class="card__body">
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-3)">
          <div class="form-group">
            <label class="form-label">Coil <span class="required">*</span></label>
            <select class="form-select" id="cutCoilId"><option value="">Select coil</option>${coilOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Part Name <span class="required">*</span></label>
            <input class="form-input" type="text" id="cutPartName" placeholder="e.g. Part C" />
          </div>
        </div>
        <div class="form-row form-row--2">
          <div class="form-group">
            <label class="form-label">Target Length (m) <span class="required">*</span></label>
            <input class="form-input" type="number" id="cutLength" min="0.1" step="0.1" />
          </div>
          <div class="form-group">
            <label class="form-label">Number of Pieces <span class="required">*</span></label>
            <input class="form-input" type="number" id="cutNumPieces" value="1" min="1" />
          </div>
        </div>
      </div>
    </div>
    <button class="add-output-btn" id="addCutBtn">+ Add Output</button>
    ${fd.cuttingOutputs.length > 0 ? `
    <div class="summary-bar summary-bar--3" style="margin-top:var(--sp-4)">
      <div class="kv-item"><div class="kv-label">Overall Leftover Coil %</div><div class="kv-value text-red">${lastLeftover}%</div></div>
      <div class="kv-item"><div class="kv-label">Total Pieces</div><div class="kv-value">${totalPcs}</div></div>
      <div class="kv-item"><div class="kv-label">Total Length Required</div><div class="kv-value">${totalLenM} m</div></div>
    </div>` : ''}`;
}

// ─ Slitting + Cutting: user inputs (width, length, pieces) stay visible alongside derived outputs ─
function buildStep3SlitCut() {
  const coilOpts = fd.selectedCoils.map(c => `<option value="${c.id}">${c.id} (${c.widthMm}mm × ${calcCoilLengthM(c.currentWeightMT, c.thicknessMm, c.widthMm).toFixed(1)}m)</option>`).join('');

  // Build combined rows showing: user input + auto-derived slit + auto-derived cut outputs
  const comboRows = fd.comboInputs.map((inp, i) => {
    const coil = fd.selectedCoils.find(c => c.id === inp.coilId) || {};
    return `
      <div class="card" style="margin-bottom:var(--sp-3);border-left:3px solid var(--purple-300)">
        <div class="card__body" style="padding:var(--sp-3) var(--sp-4)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3)">
            <span style="font-weight:600;font-size:0.9rem">Output ${i + 1} — ${inp.partName}</span>
            <div style="display:flex;gap:var(--sp-2)">
              <button class="btn btn--outline btn--sm combo-edit-btn" data-idx="${i}">Edit</button>
              <button class="btn btn--danger-outline btn--sm combo-del-btn" data-idx="${i}">Delete</button>
            </div>
          </div>
          <!-- User Inputs Row -->
          <div style="background:var(--purple-50);border-radius:var(--radius-md);padding:var(--sp-3);margin-bottom:var(--sp-3)">
            <div style="font-size:0.75rem;font-weight:600;color:var(--purple-700);margin-bottom:var(--sp-2)">Your Input</div>
            <div class="kv-grid kv-grid--4col">
              <div class="kv-item"><div class="kv-label">Coil</div><div class="kv-value">${inp.coilId}</div></div>
              <div class="kv-item"><div class="kv-label">Width</div><div class="kv-value">${inp.width} mm</div></div>
              <div class="kv-item"><div class="kv-label">Length</div><div class="kv-value">${inp.length} m</div></div>
              <div class="kv-item"><div class="kv-label">No. of Pieces</div><div class="kv-value">${inp.numPieces}</div></div>
            </div>
          </div>
          <!-- Auto-Derived Outputs: stacked vertically, not side by side -->
          <div style="display:flex;flex-direction:column;gap:var(--sp-3)">
            <div>
              <div style="font-size:0.75rem;font-weight:600;color:var(--gray-600);margin-bottom:var(--sp-2)">→ Slitting Output</div>
              <table class="output-table">
                <thead><tr><th>Part Name</th><th>Width (mm)</th><th>Slit Coils</th><th>Weight (MT)</th><th>Leftover %</th></tr></thead>
                <tbody><tr>
                  <td>${inp.slitPartName}</td><td>${inp.width} mm</td><td>1</td>
                  <td>${inp.slitWeightMT.toFixed(3)}</td><td class="red-text">${inp.slitLeftoverPct.toFixed(1)}%</td>
                </tr></tbody>
              </table>
            </div>
            <div>
              <div style="font-size:0.75rem;font-weight:600;color:var(--gray-600);margin-bottom:var(--sp-2)">→ Cutting Output (from ${inp.slitPartName})</div>
              <table class="output-table">
                <thead><tr><th>Part Name</th><th>Width (mm)</th><th>Length (m)</th><th>Pieces</th><th>Weight (MT)</th><th>Leftover %</th></tr></thead>
                <tbody><tr>
                  <td>${inp.cutPartName}</td><td>${inp.width} mm</td><td>${inp.length} m</td><td>${inp.numPieces}</td>
                  <td>${inp.cutWeightMT.toFixed(3)}</td><td class="red-text">${inp.cutLeftoverPct.toFixed(1)}%</td>
                </tr></tbody>
              </table>
            </div>
          </div>
          <div class="kv-item" style="margin-top:var(--sp-2)"><div class="kv-label">Total Weight</div><div class="kv-value">${inp.weightMT.toFixed(3)} MT &nbsp; Leftover: <span class="text-red">${inp.leftoverPct.toFixed(1)}%</span></div></div>
        </div>
      </div>`;
  }).join('');

  const totalPcs = fd.comboInputs.reduce((s, o) => s + o.numPieces, 0);
  const totalWidth = fd.comboInputs.reduce((s, o) => s + parseFloat(o.width), 0);
  const totalLen = fd.comboInputs.reduce((s, o) => s + o.length * o.numPieces, 0).toFixed(2);
  const lastLeftover = fd.comboInputs.length > 0 ? fd.comboInputs[fd.comboInputs.length - 1].leftoverPct.toFixed(1) : '0.0';

  return `
    <div class="section-title">Planned Outputs — Slitting + Cutting</div>
    ${comboRows}
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Add Output</h3></div>
      <div class="card__body">
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-3)">
          <div class="form-group">
            <label class="form-label">Coil <span class="required">*</span></label>
            <select class="form-select" id="comboCoilId"><option value="">Select coil</option>${coilOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Part Name <span class="required">*</span></label>
            <input class="form-input" type="text" id="comboPartName" placeholder="e.g. Sheet A" />
          </div>
        </div>
        <div class="form-row form-row--3">
          <div class="form-group">
            <label class="form-label">Width (mm) <span class="required">*</span></label>
            <input class="form-input" type="number" id="comboWidth" min="1" />
          </div>
          <div class="form-group">
            <label class="form-label">Length (m) <span class="required">*</span></label>
            <input class="form-input" type="number" id="comboLength" min="0.1" step="0.1" />
          </div>
          <div class="form-group">
            <label class="form-label">No. of Pieces <span class="required">*</span></label>
            <input class="form-input" type="number" id="comboNumPieces" value="1" min="1" />
          </div>
        </div>
      </div>
    </div>
    <button class="add-output-btn" id="addComboBtn">+ Add Output</button>
    ${fd.comboInputs.length > 0 ? `
    <div class="summary-bar summary-bar--4" style="margin-top:var(--sp-4)">
      <div class="kv-item"><div class="kv-label">Leftover Coil %</div><div class="kv-value text-red">${lastLeftover}%</div></div>
      <div class="kv-item"><div class="kv-label">Total Pieces</div><div class="kv-value">${totalPcs}</div></div>
      <div class="kv-item"><div class="kv-label">Total Width</div><div class="kv-value">${totalWidth} mm</div></div>
      <div class="kv-item"><div class="kv-label">Total Length</div><div class="kv-value">${totalLen} m</div></div>
    </div>` : ''}`;
}

// ─── STEP 4: Line & Machine ───
function buildStep4() {
  return `
    <div class="section-title">Production Line & Machine Assignment</div>
    ${fd.operations.map((op, i) => `
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Step ${i + 1}: ${op}</h3></div>
        <div class="card__body">
          <div class="form-row form-row--2">
            <div class="form-group">
              <label class="form-label">Production Line</label>
              <select class="form-select" data-line-op="${op}">
                <option value="">Select</option>
                ${LINES.map(l => `<option value="${l}" ${fd.lineAssignments[op] === l ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Machine</label>
              <select class="form-select" data-machine-op="${op}">
                <option value="">Select</option>
                ${MACHINES.map(m => `<option value="${m}" ${fd.machineAssignments[op] === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>`).join('')}`;
}

// ─── STEP 5: Review ───
function buildStep5() {
  const customers = fd.customers.join(', ') || '—';
  const opSeq = fd.operations.map((op, i) => `${i > 0 ? '<span class="op-sequence__arrow">→</span>' : ''}<span class="op-sequence__chip">${i + 1}. ${op}</span>`).join('');
  const coilRows = fd.selectedCoils.map(c =>
    `<tr><td>${c.id}</td><td>${c.category}</td><td>${c.grade}</td><td>${c.thicknessMm} mm</td><td>${c.widthMm} mm</td><td>${c.surface}</td><td>${c.currentWeightMT} MT</td><td>${c.aging}</td></tr>`
  ).join('') || '<tr><td colspan="8" style="color:var(--gray-400);text-align:center">—</td></tr>';

  const slitTable = fd.slittingOutputs.length > 0
    ? `<h4 style="margin-bottom:var(--sp-2)">Slitting Outputs</h4>${buildSlittingTable(fd.slittingOutputs, false, false)}<br>`
    : '';
  const cutTable = fd.cuttingOutputs.length > 0
    ? `<h4 style="margin-bottom:var(--sp-2)">Cutting Outputs</h4>${buildCuttingTable(fd.cuttingOutputs, false, false)}`
    : '';
  // Review: combo outputs as proper data grids, split into slitting + cutting tables
  let comboSlitRows = '', comboCutRows = '';
  if (fd.comboInputs.length > 0) {
    comboSlitRows = fd.comboInputs.map(inp => `<tr>
      <td>${inp.slitPartName}</td><td>${inp.coilId}</td><td>${inp.width} mm</td><td>1</td>
      <td>${inp.slitWeightMT.toFixed(3)}</td><td class="red-text">${inp.slitLeftoverPct.toFixed(1)}%</td>
    </tr>`).join('');
    comboCutRows = fd.comboInputs.map(inp => `<tr>
      <td>${inp.cutPartName}</td><td>${inp.coilId}</td><td>${inp.length} m</td><td>${inp.numPieces}</td>
      <td>${inp.cutWeightMT.toFixed(3)}</td><td class="red-text">${inp.cutLeftoverPct.toFixed(1)}%</td>
    </tr>`).join('');
  }
  const comboSlitTable = comboSlitRows ? `
    <h4 style="margin-bottom:var(--sp-2);margin-top:var(--sp-3)">Slitting Outputs</h4>
    <div class="data-table-wrapper" style="margin-bottom:var(--sp-3)">
      <table class="output-table">
        <thead><tr><th>Part Name</th><th>Coil No.</th><th>Width</th><th>Slit Coils</th><th>Weight (MT)</th><th>Leftover %</th></tr></thead>
        <tbody>${comboSlitRows}</tbody>
      </table>
    </div>` : '';
  const comboCutTable = comboCutRows ? `
    <h4 style="margin-bottom:var(--sp-2);margin-top:var(--sp-3)">Cutting Outputs</h4>
    <div class="data-table-wrapper">
      <table class="output-table">
        <thead><tr><th>Part Name</th><th>Coil No.</th><th>Length (m)</th><th>Pieces</th><th>Weight (MT)</th><th>Leftover %</th></tr></thead>
        <tbody>${comboCutRows}</tbody>
      </table>
    </div>` : '';
  const comboOutputs = comboSlitTable + comboCutTable;
  const outputSection = slitTable + cutTable + comboOutputs || '<div style="color:var(--gray-400)">No outputs added</div>';

  const machineRows = fd.operations.map(op => `
    <tr><td>${op}</td><td>${fd.lineAssignments[op] || '—'}</td><td>${fd.machineAssignments[op] || '—'}</td></tr>`
  ).join('');

  return `
    <!-- Header -->
    <div style="display:flex;gap:var(--sp-5);margin-bottom:var(--sp-4)">
      <div class="kv-item"><div class="kv-label">Customer</div><div class="kv-value">${customers}</div></div>
      <div class="kv-item"><div class="kv-label">Due Date</div><div class="kv-value">${fd.dueDate || '—'}</div></div>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Finished Good Specifications</h3></div>
      <div class="card__body">
        <div class="kv-grid kv-grid--4col">
          <div class="kv-item"><div class="kv-label">Category</div><div class="kv-value">${fd.category || '—'}</div></div>
          <div class="kv-item"><div class="kv-label">Grade</div><div class="kv-value">${fd.grade || '—'}</div></div>
          <div class="kv-item"><div class="kv-label">Thickness</div><div class="kv-value">${fd.thicknessMin || '—'}–${fd.thicknessMax || '—'} mm</div></div>
          <div class="kv-item"><div class="kv-label">Width</div><div class="kv-value">${fd.widthMin || '—'}–${fd.widthMax || '—'} mm</div></div>
          <div class="kv-item"><div class="kv-label">Coating</div><div class="kv-value">${fd.coating || '—'}</div></div>
          <div class="kv-item"><div class="kv-label">Surface</div><div class="kv-value">${fd.surface || '—'}</div></div>
          <div class="kv-item"><div class="kv-label">Qty Demanded</div><div class="kv-value">${fd.quantityDemand || '—'} MT</div></div>
        </div>
      </div>
    </div>

    <div class="op-sequence" style="margin-bottom:var(--sp-4)">
      <div class="op-sequence__title">Operation Sequence</div>
      <div class="op-sequence__flow">${opSeq || '—'}</div>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Selected Coil & Leftover</h3></div>
      <div class="card__body">
        <table class="output-table" style="margin-bottom:var(--sp-3)">
          <thead><tr><th>Coil No.</th><th>Category</th><th>Grade</th><th>Thickness</th><th>Width</th><th>Surface</th><th>Weight</th><th>Aging</th></tr></thead>
          <tbody>${coilRows}</tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Outputs</h3></div>
      <div class="card__body">${outputSection}</div>
    </div>

    <div class="card">
      <div class="card__header"><h3 class="card__title">Line & Machine Specification</h3></div>
      <div class="card__body">
        <table class="output-table">
          <thead><tr><th>Operation</th><th>Line</th><th>Machine</th></tr></thead>
          <tbody>${machineRows || '<tr><td colspan="3" style="color:var(--gray-400);text-align:center">—</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

// ─── Table Builders (reusable, with optional edit/delete) ───
function buildSlittingTable(outputs, showEdit, showDelete) {
  if (!outputs.length) return '';
  const extraCols = (showEdit || showDelete) ? '<th></th>' : '';
  return `
    <div class="data-table-wrapper" style="margin-bottom:var(--sp-4)">
      <table class="output-table">
        <thead><tr>
          <th>Part Name</th><th>Coil No.</th><th>Width (mm)</th><th>Slit Coils</th><th>Weight (MT)</th><th>Leftover %</th>${extraCols}
        </tr></thead>
        <tbody>${outputs.map((o, i) => `<tr>
          <td>${o.partName}</td><td>${o.coilId}</td><td>${o.width}</td><td>${o.numCoils}</td>
          <td>${o.weightMT.toFixed(3)}</td><td class="red-text">${o.leftoverPct.toFixed(1)}%</td>
          ${(showEdit || showDelete) ? `<td style="display:flex;gap:4px">
            ${showEdit ? `<button class="btn btn--outline btn--sm slit-edit-btn" data-idx="${i}">Edit</button>` : ''}
            ${showDelete ? `<button class="btn btn--danger-outline btn--sm slit-del-btn" data-idx="${i}">Delete</button>` : ''}
          </td>` : ''}
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function buildCuttingTable(outputs, showEdit, showDelete) {
  if (!outputs.length) return '';
  const extraCols = (showEdit || showDelete) ? '<th></th>' : '';
  return `
    <div class="data-table-wrapper" style="margin-bottom:var(--sp-4)">
      <table class="output-table">
        <thead><tr>
          <th>Part Name</th><th>Coil No.</th><th>Length (m)</th><th>Pieces</th><th>Weight (MT)</th><th>Leftover %</th>${extraCols}
        </tr></thead>
        <tbody>${outputs.map((o, i) => `<tr>
          <td>${o.partName}</td><td>${o.coilId}</td><td>${o.length}</td><td>${o.numPieces}</td>
          <td>${o.weightMT.toFixed(3)}</td><td class="red-text">${o.leftoverPct.toFixed(1)}%</td>
          ${(showEdit || showDelete) ? `<td style="display:flex;gap:4px">
            ${showEdit ? `<button class="btn btn--outline btn--sm cut-edit-btn" data-idx="${i}">Edit</button>` : ''}
            ${showDelete ? `<button class="btn btn--danger-outline btn--sm cut-del-btn" data-idx="${i}">Delete</button>` : ''}
          </td>` : ''}
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

// ─── Calc helpers ───
function calcTotalOutputWidth(outputs) {
  return outputs.reduce((s, o) => s + (parseFloat(o.width) * parseInt(o.numCoils)), 0);
}

function calcTotalOutputLengthM(outputs) {
  return outputs.reduce((s, o) => s + (parseFloat(o.length) * parseInt(o.numPieces)), 0);
}

// ─── Save step state ───
function saveStep() {
  if (currentStep === 1) {
    fd.dueDate = document.getElementById('dueDate')?.value ?? fd.dueDate;
    fd.category = document.getElementById('category')?.value ?? fd.category;
    fd.grade = document.getElementById('grade')?.value ?? fd.grade;
    fd.thicknessMin = document.getElementById('thicknessMin')?.value ?? fd.thicknessMin;
    fd.thicknessMax = document.getElementById('thicknessMax')?.value ?? fd.thicknessMax;
    fd.widthMin = document.getElementById('widthMin')?.value ?? fd.widthMin;
    fd.widthMax = document.getElementById('widthMax')?.value ?? fd.widthMax;
    fd.coating = document.getElementById('coating')?.value ?? fd.coating;
    fd.surface = document.getElementById('surface')?.value ?? fd.surface;
    fd.itemType = document.getElementById('itemType')?.value ?? fd.itemType;
    fd.quantityDemand = document.getElementById('quantityDemand')?.value ?? fd.quantityDemand;
  }
  if (currentStep === 4) {
    fd.operations.forEach(op => {
      const l = document.querySelector(`[data-line-op="${op}"]`);
      const m = document.querySelector(`[data-machine-op="${op}"]`);
      if (l) fd.lineAssignments[op] = l.value;
      if (m) fd.machineAssignments[op] = m.value;
    });
  }
}

// ─── Bind Step Events ───
function bindStep() {
  if (currentStep === 1) {
    // Customer multi-select
    const trigger = document.getElementById('customerTrigger');
    const dropdown = document.getElementById('customerDropdown');
    trigger?.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('open'); });
    document.addEventListener('click', () => dropdown?.classList.remove('open'), { once: true });
    document.querySelectorAll('[data-cust]').forEach(cb => {
      cb.addEventListener('change', () => {
        const c = cb.dataset.cust;
        if (cb.checked) { if (!fd.customers.includes(c)) fd.customers.push(c); }
        else fd.customers = fd.customers.filter(x => x !== c);
        saveStep(); drawStep();
      });
    });
    document.querySelectorAll('.multi-select__chip-remove').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); fd.customers = fd.customers.filter(x => x !== btn.dataset.customer); drawStep(); });
    });
    // Operations
    document.querySelectorAll('[data-op]').forEach(cb => {
      cb.addEventListener('change', () => {
        const op = cb.dataset.op;
        if (cb.checked) { if (!fd.operations.includes(op)) fd.operations.push(op); }
        else fd.operations = fd.operations.filter(o => o !== op);
        saveStep(); drawStep();
      });
    });
  }

  if (currentStep === 2) {
    document.querySelectorAll('[data-coil-id]').forEach(cb => {
      cb.addEventListener('change', () => {
        const coil = COILS.find(c => c.id === cb.dataset.coilId);
        if (!coil) return;
        if (cb.checked) { if (!fd.selectedCoils.find(c => c.id === coil.id)) fd.selectedCoils.push(coil); }
        else fd.selectedCoils = fd.selectedCoils.filter(c => c.id !== coil.id);
        drawStep();
      });
    });
  }

  if (currentStep === 3) {
    const ops = fd.operations;

    // Slitting only
    if (ops.includes('Slitting') && !ops.includes('Cutting')) {
      document.getElementById('addSlitBtn')?.addEventListener('click', () => {
        const coilId = document.getElementById('slitCoilId')?.value;
        const partName = document.getElementById('slitPartName')?.value?.trim();
        const width = parseFloat(document.getElementById('slitWidth')?.value);
        const numCoils = parseInt(document.getElementById('slitNumCoils')?.value) || 1;
        if (!coilId || !partName || !width) { showToast('Missing fields', 'Fill all required fields', 'error'); return; }
        const coil = fd.selectedCoils.find(c => c.id === coilId);
        const coilW = coil?.widthMm || 0;
        const slitLenM = calcCoilLengthM(coil?.currentWeightMT || 0, coil?.thicknessMm || 1, coil?.widthMm || 1);
        const weightMT = calcWeightMT(coil?.thicknessMm || 1, width, slitLenM) * numCoils;
        const usedWidth = calcTotalOutputWidth(fd.slittingOutputs) + width * numCoils;
        const leftoverPct = calcLeftoverPct(coilW, usedWidth);
        fd.slittingOutputs.push({ partName, coilId, width, numCoils, weightMT, leftoverPct });
        drawStep();
      });
      document.querySelectorAll('.slit-del-btn').forEach(btn => {
        btn.addEventListener('click', () => { fd.slittingOutputs.splice(parseInt(btn.dataset.idx), 1); drawStep(); });
      });
      document.querySelectorAll('.slit-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          const o = fd.slittingOutputs[idx];
          document.getElementById('slitCoilId').value = o.coilId;
          document.getElementById('slitPartName').value = o.partName;
          document.getElementById('slitWidth').value = o.width;
          document.getElementById('slitNumCoils').value = o.numCoils;
          fd.slittingOutputs.splice(idx, 1);
          drawStep();
        });
      });
    }

    // Cutting only
    if (ops.includes('Cutting') && !ops.includes('Slitting')) {
      document.getElementById('addCutBtn')?.addEventListener('click', () => {
        const coilId = document.getElementById('cutCoilId')?.value;
        const partName = document.getElementById('cutPartName')?.value?.trim();
        const length = parseFloat(document.getElementById('cutLength')?.value);
        const numPieces = parseInt(document.getElementById('cutNumPieces')?.value) || 1;
        if (!coilId || !partName || !length) { showToast('Missing fields', 'Fill all required fields', 'error'); return; }
        const coil = fd.selectedCoils.find(c => c.id === coilId);
        const coilLenM = calcCoilLengthM(coil?.currentWeightMT || 0, coil?.thicknessMm || 1, coil?.widthMm || 1);
        const weightMT = calcWeightMT(coil?.thicknessMm || 1, coil?.widthMm || 1, length) * numPieces;
        const usedLen = calcTotalOutputLengthM(fd.cuttingOutputs) + length * numPieces;
        const leftoverPct = calcLeftoverPct(coilLenM, usedLen);
        fd.cuttingOutputs.push({ partName, coilId, length, numPieces, weightMT, leftoverPct });
        drawStep();
      });
      document.querySelectorAll('.cut-del-btn').forEach(btn => {
        btn.addEventListener('click', () => { fd.cuttingOutputs.splice(parseInt(btn.dataset.idx), 1); drawStep(); });
      });
      document.querySelectorAll('.cut-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          const o = fd.cuttingOutputs[idx];
          document.getElementById('cutCoilId').value = o.coilId;
          document.getElementById('cutPartName').value = o.partName;
          document.getElementById('cutLength').value = o.length;
          document.getElementById('cutNumPieces').value = o.numPieces;
          fd.cuttingOutputs.splice(idx, 1);
          drawStep();
        });
      });
    }

    // Slitting + Cutting combo
    if (ops.includes('Slitting') && ops.includes('Cutting')) {
      document.getElementById('addComboBtn')?.addEventListener('click', () => {
        const coilId = document.getElementById('comboCoilId')?.value;
        const partName = document.getElementById('comboPartName')?.value?.trim();
        const width = parseFloat(document.getElementById('comboWidth')?.value);
        const length = parseFloat(document.getElementById('comboLength')?.value);
        const numPieces = parseInt(document.getElementById('comboNumPieces')?.value) || 1;
        if (!coilId || !partName || !width || !length) { showToast('Missing fields', 'Fill all required fields', 'error'); return; }
        const coil = fd.selectedCoils.find(c => c.id === coilId);
        const thk = coil?.thicknessMm || 1;
        const coilW = coil?.widthMm || 1;
        const coilLenM = calcCoilLengthM(coil?.currentWeightMT || 0, thk, coilW);

        // Slitting output: one slit coil of given width, coil length
        const slitWeightMT = calcWeightMT(thk, width, coilLenM);
        const usedSlitWidth = fd.comboInputs.reduce((s, o) => s + parseFloat(o.width), 0) + width;
        const slitLeftoverPct = calcLeftoverPct(coilW, usedSlitWidth);
        const slitPartName = `SL-${partName}`;

        // Cutting output: from slit coil, cut to given length x numPieces
        const cutWeightMT = calcWeightMT(thk, width, length) * numPieces;
        const usedCutLen = length * numPieces;
        const cutLeftoverPct = calcLeftoverPct(coilLenM, usedCutLen);
        const cutPartName = `CT-${partName}`;

        const totalWeightMT = slitWeightMT;
        const leftoverPct = slitLeftoverPct;

        fd.comboInputs.push({ coilId, partName, width, length, numPieces, weightMT: totalWeightMT, leftoverPct, slitPartName, slitWeightMT, slitLeftoverPct, cutPartName, cutWeightMT, cutLeftoverPct });
        drawStep();
      });

      document.querySelectorAll('.combo-del-btn').forEach(btn => {
        btn.addEventListener('click', () => { fd.comboInputs.splice(parseInt(btn.dataset.idx), 1); drawStep(); });
      });
      document.querySelectorAll('.combo-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          const o = fd.comboInputs[idx];
          document.getElementById('comboCoilId').value = o.coilId;
          document.getElementById('comboPartName').value = o.partName;
          document.getElementById('comboWidth').value = o.width;
          document.getElementById('comboLength').value = o.length;
          document.getElementById('comboNumPieces').value = o.numPieces;
          fd.comboInputs.splice(idx, 1);
          drawStep();
        });
      });
    }
  }
}

// ─── Success In-Panel State ─── (per PRD: success shown in side panel, not modal)
function showSuccessInPanel() {
  const woNum = `WO-2024-0${WO_COUNTER++}`;
  const customers = fd.customers.join(', ') || '—';
  const ops = fd.operations.join(' + ') || '—';
  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">Create Work Order</h2>
        <span class="badge badge--draft">Draft</span>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="panel-body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;text-align:center">
      <div style="width:80px;height:80px;background:var(--green-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:var(--sp-6)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#16A34A"/><path d="M8 12l2.5 2.5L16 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:var(--sp-2)">Work Order Created Successfully!</h2>
      <p style="color:var(--gray-500);margin-bottom:var(--sp-6)">Your work order has been created and is ready to be released.</p>
      <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:var(--sp-5);min-width:300px;text-align:left;margin-bottom:var(--sp-6)">
        <div class="kv-grid kv-grid--2col" style="gap:var(--sp-4)">
          <div class="kv-item"><div class="kv-label">WO Number</div><div class="kv-value" style="color:var(--purple-700);font-weight:700">${woNum}</div></div>
          <div class="kv-item"><div class="kv-label">Customer</div><div class="kv-value">${customers}</div></div>
          <div class="kv-item"><div class="kv-label">Operation</div><div class="kv-value">${ops}</div></div>
          <div class="kv-item"><div class="kv-label">Due Date</div><div class="kv-value">${fd.dueDate || '—'}</div></div>
        </div>
      </div>
      <div style="display:flex;gap:var(--sp-3)">
        <button class="btn btn--outline" id="viewListBtn">View WO List</button>
        <button class="btn btn--primary" id="releaseWOBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Release Work Order
        </button>
      </div>
    </div>
  `;
  openPanel(html);
  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('viewListBtn')?.addEventListener('click', () => { closePanel(); window.location.hash = '#/work-orders'; });
    document.getElementById('releaseWOBtn')?.addEventListener('click', () => { closePanel(); showToast('Released!', `${woNum} released — production started`); window.location.hash = '#/work-orders'; });
  }, 50);
}
