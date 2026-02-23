import { openPanel, closePanel, showToast } from '../main.js';
import { COILS, CUSTOMERS, BANK_ACCOUNTS } from '../data/mock-data.js';

let currentStep = 1;
const TOTAL_STEPS = 6;
let coilSearchTerm = '';

const SALES_ORDERS = ['SO-1011', 'SO-1044', 'SO-1088', 'SO-1099'];
const PAYMENT_TERMS_OPTIONS = ['Net 30 Days', 'Net 60 Days', 'Net 90 Days', 'Immediate', 'Advance'];

// Mock parts per coil – in real app these come from WO outputs
function getMockPartsForCoil(coilId) {
  return [
    { id: `${coilId}-P1`, name: 'Sheet Cut A', partType: 'cutting', width: 1200, length: 2500, weightMT: 5, totalPieces: 250, unitWeight: 0.02 },
    { id: `${coilId}-P2`, name: 'Slit Strip B', partType: 'slitting', width: 400, weightMT: 12, totalPieces: 30, unitWeight: 0.4 },
    { id: `${coilId}-P3`, name: 'Sheet Cut C', partType: 'slit+cut', width: 600, length: 1500, weightMT: 8, totalPieces: 400, unitWeight: 0.02 },
    { id: `${coilId}-LO`, name: 'Leftover Coil', partType: 'leftover', width: 1200, weightMT: 3.5, totalPieces: null, unitWeight: null, isLeftover: true },
  ];
}

let fd = {};

function resetFD() {
  fd = {
    sourceType: 'sales_order',
    customer: '', orderNo: '', dueDate: '', orderDate: '',
    poNo: '', paymentTerms: 'Net 30 Days', ewayBill: '',
    billingAddress: '', shippingAddress: '', sameAsBilling: true,
    selectedCoils: [],
    materials: {},
    transportChg: 0, handlingChg: 0, packingChg: 0, otherChg: 0, taxRate: 18,
    bankId: '',
    paymentDetailsExpanded: true, termsExpanded: true,
    termsConditions: '',
    paymentTermsText: '',
  };
}

export function renderInvoiceCreate() {
  currentStep = 1;
  coilSearchTerm = '';
  resetFD();
  drawStep();
}

// ─── Stepper ─────────────────────────────────────────────────────────────────
function buildStepper() {
  const labels = ['Invoice<br>Details', 'Coil<br>Selection', 'Material<br>Selection', 'Charges<br>& Tax', 'Payment<br>& Terms', 'Review<br>& Issue'];
  const fillPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  return `<div class="stepper">
      <div class="stepper__line"><div class="stepper__line-fill" style="width:${fillPct}%"></div></div>
      ${labels.map((label, i) => {
    const step = i + 1;
    const cls = step < currentStep ? 'stepper__step--completed' : step === currentStep ? 'stepper__step--active' : '';
    const inner = step < currentStep
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
      : step;
    return `<div class="stepper__step ${cls}"><div class="stepper__circle">${inner}</div><div class="stepper__label">${label}</div></div>`;
  }).join('')}
    </div>`;
}

// ─── Main Draw ────────────────────────────────────────────────────────────────
function drawStep() {
  let bodyHtml = '';
  switch (currentStep) {
    case 1: bodyHtml = buildStep1(); break;
    case 2: bodyHtml = buildStep2(); break;
    case 3: bodyHtml = buildStep3(); break;
    case 4: bodyHtml = buildStep4(); break;
    case 5: bodyHtml = buildStep5(); break;
    case 6: bodyHtml = buildStep6(); break;
  }

  const html = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-header__title">Create Invoice</h2>
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
          <button class="btn btn--ghost ${currentStep === 1 ? 'btn--disabled' : ''}" id="prevBtn" style="gap:8px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Previous
          </button>
        </div>
        <div class="panel-footer__right">
          <button class="btn btn--outline" id="saveDraftBtn" style="gap:8px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save as Draft
          </button>
          ${currentStep < TOTAL_STEPS
      ? `<button class="btn btn--primary" id="nextBtn" style="gap:8px">
               Next
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
             </button>`
      : `<button class="btn btn--primary" id="submitBtn" style="gap:8px">
               Issue Invoice
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
             </button>`}
        </div>
      </div>`;

  openPanel(html);
  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('prevBtn')?.addEventListener('click', () => { if (currentStep > 1) { saveStep(); currentStep--; drawStep(); } });
    document.getElementById('nextBtn')?.addEventListener('click', () => { saveStep(); currentStep++; drawStep(); });
    document.getElementById('saveDraftBtn')?.addEventListener('click', () => { showToast('Saved as Draft', 'Invoice saved to drafts', 'success'); closePanel(); });
    document.getElementById('submitBtn')?.addEventListener('click', () => { saveStep(); showSuccessScreen(); });
    bindStep();
  }, 50);
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function showSuccessScreen() {
  const invNo = `INV-2024-${1005 + Math.floor(Math.random() * 10)}`;
  const html = `
      <div class="panel-header">
        <div class="panel-header__left"><h2 class="panel-header__title">Invoice Issued</h2></div>
        <button class="panel-header__close" id="panelClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="panel-body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:var(--sp-5);padding:var(--sp-8);">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--green-100,#d1fae5);display:flex;align-items:center;justify-content:center;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:8px;">Invoice Issued Successfully!</h2>
          <p style="color:var(--gray-500);font-size:1rem;">Invoice <strong>${invNo}</strong> has been created and issued to <strong>${fd.customer || 'customer'}</strong>.</p>
        </div>
        <div style="display:flex;gap:var(--sp-3);">
          <button class="btn btn--outline" id="pdfBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View Invoice PDF
          </button>
          <button class="btn btn--primary" id="goListBtn">Go to Invoice List</button>
        </div>
      </div>`;
  openPanel(html);
  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('goListBtn')?.addEventListener('click', closePanel);
    document.getElementById('pdfBtn')?.addEventListener('click', () => showToast('PDF Generation', 'PDF export coming soon', 'success'));
  }, 50);
}

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
function buildStep1() {
  const isSO = fd.sourceType === 'sales_order';
  return `
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Invoice Source</h3></div>
        <div class="card__body">
          <div style="display:flex;gap:var(--sp-4);margin-bottom:var(--sp-4)">
            <label class="checkbox-row"><input type="radio" name="sourceType" value="sales_order" ${isSO ? 'checked' : ''} class="checkbox-input" /> From Sales Order</label>
            <label class="checkbox-row"><input type="radio" name="sourceType" value="manual" ${!isSO ? 'checked' : ''} class="checkbox-input" /> Manual Creation</label>
          </div>
          <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
            <div class="form-group">
              <label class="form-label">Customer Name <span class="required">*</span></label>
              <select class="form-select" id="customer">
                <option value="">Select Customer</option>
                ${CUSTOMERS.map(c => `<option value="${c}" ${fd.customer === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Order No. ${isSO ? '<span class="required">*</span>' : ''}</label>
              ${isSO
      ? `<select class="form-select" id="orderNo"><option value="">Select SO</option>${SALES_ORDERS.map(s => `<option value="${s}" ${fd.orderNo === s ? 'selected' : ''}>${s}</option>`).join('')}</select>`
      : `<input class="form-input" type="text" id="orderNo" value="${fd.orderNo}" placeholder="Optional reference" />`}
            </div>
          </div>
          <div class="form-row form-row--3" style="margin-bottom:var(--sp-4)">
            <div class="form-group"><label class="form-label">Due Date <span class="required">*</span></label><input type="date" class="form-input" id="dueDate" value="${fd.dueDate}" /></div>
            <div class="form-group"><label class="form-label">Order Date</label><input type="date" class="form-input" id="orderDate" value="${fd.orderDate}" /></div>
            <div class="form-group"><label class="form-label">PO No.</label><input type="text" class="form-input" id="poNo" value="${fd.poNo}" /></div>
          </div>
          <div class="form-row form-row--2">
            <div class="form-group">
              <label class="form-label">Payment Terms</label>
              <select class="form-select" id="paymentTerms">
                ${PAYMENT_TERMS_OPTIONS.map(t => `<option value="${t}" ${fd.paymentTerms === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">E-Way Bill No.</label><input type="text" class="form-input" id="ewayBill" value="${fd.ewayBill}" /></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card__header"><h3 class="card__title">Addressing</h3></div>
        <div class="card__body">
          <div class="form-row form-row--2">
            <div class="form-group">
              <label class="form-label">Billing Address <span class="required">*</span></label>
              <textarea class="form-input" rows="3" id="billingAddress">${fd.billingAddress}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
                <span>Shipping Address <span class="required">*</span></span>
                <label style="font-size:0.8rem;font-weight:normal;display:flex;align-items:center;gap:4px;cursor:pointer">
                  <input type="checkbox" id="sameAsBilling" ${fd.sameAsBilling ? 'checked' : ''} /> Same as Billing
                </label>
              </label>
              <textarea class="form-input" rows="3" id="shippingAddress" ${fd.sameAsBilling ? 'readonly style="background:var(--gray-50)"' : ''}>${fd.shippingAddress}</textarea>
            </div>
          </div>
        </div>
      </div>`;
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
function buildStep2() {
  const selectedIds = fd.selectedCoils.map(c => c.id);
  const filtered = coilSearchTerm
    ? COILS.filter(c => c.id.toLowerCase().includes(coilSearchTerm) || c.grade.toLowerCase().includes(coilSearchTerm) || c.supplier.toLowerCase().includes(coilSearchTerm))
    : COILS;
  const selCount = fd.selectedCoils.length;

  return `
      <div class="section-title">Coil Selection</div>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:var(--sp-3)">Select the parent coils that generated the materials you wish to invoice. Only parts from selected coils will appear in Step 3.</p>
      <div style="display:flex;gap:var(--sp-3);align-items:center;margin-bottom:var(--sp-3)">
        <div class="search-bar" style="flex:1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search by Coil No., Grade, Supplier..." id="coilSearch" value="${coilSearchTerm}" />
        </div>
        ${selCount > 0 ? `<span class="badge badge--in-progress" style="white-space:nowrap">${selCount} coil${selCount > 1 ? 's' : ''} selected</span>` : ''}
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th style="width:40px"></th>
            <th>Coil No.</th><th>Grade</th><th>Thickness</th><th>Width</th>
            <th>Surface</th><th>Coating</th><th>Current Weight</th><th>Supplier</th>
          </tr></thead>
          <tbody>
            ${filtered.length === 0
      ? `<tr><td colspan="9" style="text-align:center;color:var(--gray-400);padding:2rem">No coils match your search.</td></tr>`
      : filtered.map(coil => `
                  <tr style="${selectedIds.includes(coil.id) ? 'background:var(--purple-50)' : ''}">
                    <td><input type="checkbox" class="checkbox-input coil-cb" data-id="${coil.id}" ${selectedIds.includes(coil.id) ? 'checked' : ''} /></td>
                    <td><strong>${coil.id}</strong></td><td>${coil.grade}</td>
                    <td>${coil.thicknessMm} mm</td><td>${coil.widthMm} mm</td>
                    <td>${coil.surface}</td><td>${coil.coating}</td>
                    <td>${coil.currentWeightMT} MT</td><td>${coil.supplier}</td>
                  </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="font-size:0.8rem;color:var(--gray-400);margin-top:var(--sp-2)">Showing ${filtered.length} of ${COILS.length} coils</div>`;
}

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
function buildStep3() {
  if (fd.selectedCoils.length === 0) {
    return `<div style="padding:var(--sp-8);text-align:center;color:var(--gray-500)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <p>No coils selected. Go back to Step 2 and select at least one coil.</p>
        </div>`;
  }

  const selectedCoilsGrid = `
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card__header"><h3 class="card__title">Selected Coils Details</h3></div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Coil No.</th><th>Grade</th><th>Thickness</th><th>Width</th><th>Surface</th><th>Coating</th><th>Current Weight</th>
            </tr>
          </thead>
          <tbody>
            ${fd.selectedCoils.map(c => `
              <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.grade}</td>
                <td>${c.thicknessMm} mm</td>
                <td>${c.widthMm} mm</td>
                <td>${c.surface}</td>
                <td>${c.coating}</td>
                <td>${c.currentWeightMT} MT</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  let partsHtml = '';

  fd.selectedCoils.forEach((coil) => {
    if (!fd.materials[coil.id]) {
      fd.materials[coil.id] = getMockPartsForCoil(coil.id).map(p => ({
        ...p, isSelected: false,
        inputPieces: 0, inputWeight: 0, inputPrice: 0, lineTotal: 0
      }));
    }

    const parts = fd.materials[coil.id];

    partsHtml += parts.map((p, idx) => {
      const isSel = p.isSelected;
      const isSheetBased = ['cutting', 'slit+cut'].includes(p.partType);
      const isSlitBased = p.partType === 'slitting';
      const isLeftover = p.partType === 'leftover';

      let dimensions = '';
      if (isSheetBased) dimensions = `${p.width} mm \u00D7 ${p.length} mm`;
      else if (isSlitBased || isLeftover) dimensions = `${p.width} mm`;

      const rowHtml = `
        <tr style="${isSel ? 'background:var(--purple-50)' : ''}">
          <td><input type="checkbox" class="part-cb" data-coil="${coil.id}" data-idx="${idx}" ${isSel ? 'checked' : ''} /></td>
          <td><strong>${coil.id}</strong></td>
          <td style="font-weight:${p.isLeftover ? '600' : 'normal'}">
            ${p.name}
            ${p.isLeftover ? '<span class="badge badge--pending" style="margin-left:6px;font-size:0.7rem">Leftover</span>' : ''}
          </td>
          <td>${dimensions}</td>
          <td>${p.totalPieces !== null ? p.totalPieces + ' pcs' : '—'}</td>
          <td>${p.weightMT} MT</td>
          <td style="font-weight:600;text-align:right;color:${p.lineTotal > 0 ? 'var(--gray-900)' : 'var(--gray-400)'}">
            ${p.lineTotal > 0 ? '₹' + p.lineTotal.toLocaleString('en-IN') : '—'}
          </td>
        </tr>`;

      let inlineConfig = '';
      if (isSel) {
        if (p.isLeftover) {
          inlineConfig = `
            <tr style="background:var(--purple-50);border-bottom:1px solid var(--purple-200)">
              <td colspan="7" style="padding:var(--sp-2) var(--sp-4) var(--sp-4) 48px">
                <div style="background:#fff;border:1px solid var(--purple-200);border-radius:var(--radius-md);padding:var(--sp-3) var(--sp-4);display:flex;gap:var(--sp-5);align-items:center;">
                  <div class="form-group" style="margin:0;width:160px">
                    <label class="form-label" style="font-size:0.75rem">Weight to Invoice (MT) <span class="required">*</span></label>
                    <input type="number" class="form-input config-inp" data-coil="${coil.id}" data-idx="${idx}" data-field="inputWeight" value="${p.inputWeight || ''}" max="${p.weightMT}" step="0.01" />
                    <div style="font-size:0.7rem;color:var(--gray-500);margin-top:2px">Max: ${p.weightMT} MT</div>
                  </div>
                  <div class="form-group" style="margin:0;width:160px">
                    <label class="form-label" style="font-size:0.75rem">Price per MT (₹) <span class="required">*</span></label>
                    <input type="number" class="form-input config-inp" data-coil="${coil.id}" data-idx="${idx}" data-field="inputPrice" value="${p.inputPrice || ''}" />
                  </div>
                  <div style="margin-left:auto;text-align:right">
                    <div style="font-size:0.8rem;color:var(--gray-500)">Line Total</div>
                    <div style="font-size:1.1rem;font-weight:700;color:var(--purple-700)">₹${p.lineTotal.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </td>
            </tr>`;
        } else {
          inlineConfig = `
            <tr style="background:var(--purple-50);border-bottom:1px solid var(--purple-200)">
              <td colspan="7" style="padding:var(--sp-2) var(--sp-4) var(--sp-4) 48px">
                <div style="background:#fff;border:1px solid var(--purple-200);border-radius:var(--radius-md);padding:var(--sp-3) var(--sp-4);display:flex;gap:var(--sp-5);align-items:center;">
                  <div class="form-group" style="margin:0;width:140px">
                    <label class="form-label" style="font-size:0.75rem">No. of Pieces / Slits <span class="required">*</span></label>
                    <input type="number" class="form-input config-inp" data-coil="${coil.id}" data-idx="${idx}" data-field="inputPieces" value="${p.inputPieces || ''}" max="${p.totalPieces}" min="0" />
                    <div style="font-size:0.7rem;color:var(--gray-500);margin-top:2px">Max: ${p.totalPieces} pcs</div>
                  </div>
                  <div class="form-group" style="margin:0;width:140px">
                    <label class="form-label" style="font-size:0.75rem">Weight (Auto-calc MT)</label>
                    <input type="text" class="form-input" readonly style="background:var(--gray-50)" value="${p.inputWeight ? p.inputWeight.toFixed(3) : '—'}" />
                  </div>
                  <div class="form-group" style="margin:0;width:140px">
                    <label class="form-label" style="font-size:0.75rem">Price Per MT (₹) <span class="required">*</span></label>
                    <input type="number" class="form-input config-inp" data-coil="${coil.id}" data-idx="${idx}" data-field="inputPrice" value="${p.inputPrice || ''}" />
                  </div>
                  <div style="margin-left:auto;text-align:right">
                    <div style="font-size:0.8rem;color:var(--gray-500)">Line Total</div>
                    <div style="font-size:1.1rem;font-weight:700;color:var(--purple-700)">₹${p.lineTotal.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </td>
            </tr>`;
        }
      }
      return rowHtml + inlineConfig;
    }).join('');
  });

  return `
    <div class="section-title">Material Selection</div>
    <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:var(--sp-4)">Review selected coils details below and choose the exact parts to invoice.</p>
    ${selectedCoilsGrid}
    <div class="card" style="margin-bottom:var(--sp-3)">
      <div class="card__header"><h3 class="card__title">Available Parts to Invoice</h3></div>
      <div class="card__body" style="padding:0; overflow-x:auto;">
        <table class="output-table" style="margin:0;border:none;min-width:800px;">
          <thead style="background:var(--gray-50)">
            <tr>
              <th style="width:40px"></th>
              <th style="width:120px">Coil No.</th>
              <th>Part Name</th>
              <th>Dimensions</th>
              <th>Available Pieces</th>
              <th>Available Weight</th>
              <th style="text-align:right">Line Total</th>
            </tr>
          </thead>
          <tbody>${partsHtml}</tbody>
        </table>
      </div>
    </div>
  `;
}

// ─── STEP 4 ───────────────────────────────────────────────────────────────────
function buildStep4() {
  let subtotal = 0;
  const selectedItems = [];
  Object.keys(fd.materials).forEach(cid => {
    fd.materials[cid].forEach(p => {
      if (p.isSelected) {
        subtotal += (p.lineTotal || 0);
        selectedItems.push({ coil: cid, name: p.name, weight: p.inputWeight, price: p.inputPrice, mode: p.pricingMode, total: p.lineTotal });
      }
    });
  });

  const charges = parseFloat(fd.transportChg || 0) + parseFloat(fd.handlingChg || 0) + parseFloat(fd.packingChg || 0) + parseFloat(fd.otherChg || 0);
  const netTotal = subtotal + charges;
  const taxAmt = netTotal * (parseFloat(fd.taxRate || 0) / 100);
  const rawGrand = netTotal + taxAmt;
  const grandTotal = Math.round(rawGrand);
  const roundOff = grandTotal - rawGrand;

  const itemsTable = selectedItems.length > 0 ? `
      <table class="output-table" style="margin:0;border:none">
        <thead style="background:var(--gray-50)"><tr><th>Part</th><th>Weight (MT)</th><th style="text-align:right">Line Total</th></tr></thead>
        <tbody>
          ${selectedItems.map(i => `<tr><td>${i.name} <span style="color:var(--gray-400);font-size:0.8rem">(${i.coil})</span></td><td>${i.weight ? i.weight.toFixed(3) : '—'}</td><td style="text-align:right;font-weight:600">₹${i.total.toLocaleString('en-IN')}</td></tr>`).join('')}
        </tbody>
      </table>` : `<div style="color:var(--gray-400);padding:var(--sp-3);text-align:center">No materials selected. Go back to Step 3.</div>`;

  return `
      <div class="section-title">Charges &amp; Taxes</div>
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Selected Materials (Cross-Check)</h3></div>
        <div class="card__body" style="padding:0">${itemsTable}</div>
      </div>
      <div style="display:flex;gap:var(--sp-5);align-items:flex-start">
        <div style="flex:2">
          <div class="card" style="margin-bottom:var(--sp-4)">
            <div class="card__header"><h3 class="card__title">Additional Charges</h3></div>
            <div class="card__body">
              <div class="form-row form-row--2" style="margin-bottom:var(--sp-3)">
                <div class="form-group"><label class="form-label">Transportation Charges (₹)</label><input type="number" class="form-input chg-inp" id="transportChg" value="${fd.transportChg}" min="0" /></div>
                <div class="form-group"><label class="form-label">Handling Charges (₹)</label><input type="number" class="form-input chg-inp" id="handlingChg" value="${fd.handlingChg}" min="0" /></div>
              </div>
              <div class="form-row form-row--2">
                <div class="form-group"><label class="form-label">Packing Charges (₹)</label><input type="number" class="form-input chg-inp" id="packingChg" value="${fd.packingChg}" min="0" /></div>
                <div class="form-group"><label class="form-label">Other Charges (₹)</label><input type="number" class="form-input chg-inp" id="otherChg" value="${fd.otherChg}" min="0" /></div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card__header"><h3 class="card__title">Tax</h3></div>
            <div class="card__body">
              <div class="form-group" style="max-width:280px">
                <label class="form-label">Tax Configuration</label>
                <select class="form-select" id="taxRate">
                  <option value="18" ${fd.taxRate == 18 ? 'selected' : ''}>IGST @ 18%</option>
                  <option value="9" ${fd.taxRate == 9 ? 'selected' : ''}>CGST 9% + SGST 9% (= 18%)</option>
                  <option value="5" ${fd.taxRate == 5 ? 'selected' : ''}>GST @ 5%</option>
                  <option value="0" ${fd.taxRate == 0 ? 'selected' : ''}>Exempt (0%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div style="flex:1">
          <div class="card" style="background:var(--gray-50)">
            <div class="card__header" style="border-bottom:1px solid var(--gray-200)"><h3 class="card__title">Bill Summary</h3></div>
            <div class="card__body" style="font-size:0.9rem">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Material Subtotal</span><strong>₹${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Extra Charges</span><strong>+ ₹${charges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding-top:10px;border-top:1px dashed var(--gray-300);font-weight:600"><span>Net Total</span><span>₹${netTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Tax (${fd.taxRate}%)</span><strong>+ ₹${taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:var(--gray-400)"><span>Round Off</span><span>₹${roundOff.toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid var(--gray-300);font-size:1.1rem;font-weight:700;color:var(--purple-700)"><span>Grand Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      </div>`;
}

// ─── STEP 5: Payment & Terms ─────────────────────────────────────────────────
function buildStep5() {
  const bank = BANK_ACCOUNTS.find(b => b.id === fd.bankId);
  return `
      <div class="card" style="margin-bottom:var(--sp-4); border-color:var(--gray-200); box-shadow:var(--shadow-sm)">
        <div class="card__header" id="paymentHeader" style="border-bottom:1px solid var(--gray-50); padding:var(--sp-4) var(--sp-5)">
          <h3 class="card__title" style="font-size:1.1rem; font-weight:700">Payment Details</h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-700)" stroke-width="2" style="transform:${fd.paymentDetailsExpanded ? 'rotate(0)' : 'rotate(180deg)'}; transition: transform 0.2s"><polyline points="18 15 12 9 6 15"/></svg>
        </div>
        ${fd.paymentDetailsExpanded ? `
          <div class="card__body" style="padding:var(--sp-5)">
            <div class="form-group">
              <label class="form-label" style="font-size:0.85rem; color:var(--gray-600); font-weight:500; margin-bottom:var(--sp-2)">Account No. <span class="required">*</span></label>
              <select class="form-select" id="bankId" style="height:48px; border-radius:var(--radius-md); border-color:var(--gray-200)">
                <option value="">0000 0000 0000</option>
                ${BANK_ACCOUNTS.map(b => `<option value="${b.id}" ${fd.bankId === b.id ? 'selected' : ''}>${b.accNo} — ${b.name}</option>`).join('')}
              </select>
              ${bank ? `
                <div style="margin-top:var(--sp-4); padding:var(--sp-4); background:var(--gray-50); border-radius:var(--radius-md); border:1px solid var(--gray-100); display:grid; grid-template-columns: 1fr 1fr; gap:var(--sp-4); font-size:0.85rem">
                  <div><div style="color:var(--gray-400); font-size:0.75rem">Bank Name</div><div style="font-weight:600">${bank.name}</div></div>
                  <div><div style="color:var(--gray-400); font-size:0.75rem">IFSC Code</div><div style="font-weight:600">${bank.ifsc}</div></div>
                  <div><div style="color:var(--gray-400); font-size:0.75rem">Branch</div><div style="font-weight:600">${bank.branch}</div></div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="card" style="border-color:var(--gray-200); box-shadow:var(--shadow-sm)">
        <div class="card__header" id="termsHeader" style="border-bottom:1px solid var(--gray-50); padding:var(--sp-4) var(--sp-5)">
          <h3 class="card__title" style="font-size:1.1rem; font-weight:700">Terms and Conditions</h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-700)" stroke-width="2" style="transform:${fd.termsExpanded ? 'rotate(0)' : 'rotate(180deg)'}; transition: transform 0.2s"><polyline points="18 15 12 9 6 15"/></svg>
        </div>
        ${fd.termsExpanded ? `
          <div class="card__body" style="padding:var(--sp-5)">
            <div class="form-group">
              <label class="form-label" style="font-size:0.85rem; color:var(--gray-600); font-weight:500; margin-bottom:var(--sp-2)">Terms and Conditions</label>
              <textarea class="form-input" rows="5" id="termsConditions" placeholder="Enter terms and conditions..." style="border-color:var(--gray-200); border-radius:var(--radius-md); padding:var(--sp-3)">${fd.termsConditions}</textarea>
            </div>
          </div>
        ` : ''}
      </div>
  `;
}

// ─── STEP 6: Review & Issue ─────────────────────────────────────────────────
function buildStep6() {
  let subtotal = 0;
  const items = [];
  Object.keys(fd.materials).forEach(cid => {
    fd.materials[cid].forEach(p => {
      if (p.isSelected) {
        subtotal += (p.lineTotal || 0);
        items.push({ coil: cid, name: p.name, mode: p.pricingMode, w: p.inputWeight, pc: p.inputPieces, rate: p.inputPrice, t: p.lineTotal });
      }
    });
  });

  const charges = parseFloat(fd.transportChg || 0) + parseFloat(fd.handlingChg || 0) + parseFloat(fd.packingChg || 0) + parseFloat(fd.otherChg || 0);
  const netTotal = subtotal + charges;
  const taxAmt = netTotal * (parseFloat(fd.taxRate || 0) / 100);
  const rawGrand = netTotal + taxAmt;
  const grandTotal = Math.round(rawGrand);
  const roundOff = grandTotal - rawGrand;

  return `
      <div class="section-title">Review &amp; Issue Invoice</div>
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Invoice Details</h3></div>
        <div class="card__body">
          <div class="kv-grid kv-grid--4col" style="margin-bottom:var(--sp-4)">
            <div class="kv-item"><div class="kv-label">Customer</div><div class="kv-value">${fd.customer || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Order Ref</div><div class="kv-value">${fd.orderNo || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">PO No.</div><div class="kv-value">${fd.poNo || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Due Date</div><div class="kv-value">${fd.dueDate || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Order Date</div><div class="kv-value">${fd.orderDate || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Payment Terms</div><div class="kv-value">${fd.paymentTerms || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">E-Way Bill</div><div class="kv-value">${fd.ewayBill || '—'}</div></div>
          </div>
          <div class="form-row form-row--2">
            <div class="kv-item"><div class="kv-label">Billing Address</div><div class="kv-value" style="white-space:pre-wrap;font-size:0.9rem;color:var(--gray-600)">${fd.billingAddress || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Shipping Address</div><div class="kv-value" style="white-space:pre-wrap;font-size:0.9rem;color:var(--gray-600)">${fd.shippingAddress || fd.billingAddress || '—'}</div></div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card__header"><h3 class="card__title">Materials &amp; Pricing</h3></div>
        <table class="output-table" style="margin:0;border:none">
          <thead style="background:var(--gray-50)"><tr>
            <th>Coil</th><th>Part Name</th><th>Weight (MT)</th><th>Pieces</th><th>Rate / MT</th><th style="text-align:right">Line Total</th>
          </tr></thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td style="color:var(--gray-500);font-size:0.85rem">${i.coil}</td>
                <td>${i.name}</td>
                <td>${i.w ? i.w.toFixed(3) : '—'}</td>
                <td>${i.pc > 0 ? i.pc : '—'}</td>
                <td>₹${(i.rate || 0).toLocaleString('en-IN')}</td>
                <td style="text-align:right;font-weight:600">₹${i.t.toLocaleString('en-IN')}</td>
              </tr>`).join('')}
            ${items.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:var(--gray-400);padding:var(--sp-4)">No materials selected. Go back to Step 3.</td></tr>' : ''}
          </tbody>
        </table>
      </div>

      <div style="display:flex;gap:var(--sp-5);align-items:flex-start">
        <div style="flex:1">
          <div class="card" style="margin-bottom:var(--sp-4)">
             <div class="card__header"><h3 class="card__title">Bank Detail Selection</h3></div>
             <div class="card__body">
                ${fd.bankId ? `
                  <div style="font-size:0.9rem">
                    <div><strong>${BANK_ACCOUNTS.find(b => b.id === fd.bankId).name}</strong></div>
                    <div style="color:var(--gray-600)">A/C: ${BANK_ACCOUNTS.find(b => b.id === fd.bankId).accNo}</div>
                    <div style="color:var(--gray-600)">IFSC: ${BANK_ACCOUNTS.find(b => b.id === fd.bankId).ifsc}</div>
                  </div>
                ` : '<div style="color:var(--red-500)">No bank selected</div>'}
             </div>
          </div>
          <div class="card">
            <div class="card__header"><h3 class="card__title">Terms & Conditions</h3></div>
            <div class="card__body">
              <div style="white-space:pre-wrap; font-size:0.85rem; color:var(--gray-600)">${fd.termsConditions || 'No terms specified.'}</div>
            </div>
          </div>
        </div>
        <div style="flex:1">
          <div class="card" style="background:var(--gray-50)">
            <div class="card__header" style="border-bottom:1px solid var(--gray-200)"><h3 class="card__title">Final Summary</h3></div>
            <div class="card__body" style="font-size:0.9rem">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Material Subtotal</span><strong>₹${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Extra Charges</span><strong>₹${charges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding-top:10px;border-top:1px dashed var(--gray-300);font-weight:600"><span>Net Total</span><span>₹${netTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Tax (${fd.taxRate}%)</span><strong>₹${taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:var(--gray-400)"><span>Round Off</span><span>${roundOff >= 0 ? '+' : ''}₹${roundOff.toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid var(--gray-300);font-size:1.2rem;font-weight:700;color:var(--purple-700)"><span>Grand Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      </div>`;
}

// ─── Save Step State ──────────────────────────────────────────────────────────
function saveStep() {
  if (currentStep === 1) {
    const typeEls = document.getElementsByName('sourceType');
    for (let r of typeEls) { if (r.checked) fd.sourceType = r.value; }
    fd.customer = document.getElementById('customer')?.value || '';
    fd.orderNo = document.getElementById('orderNo')?.value || '';
    fd.dueDate = document.getElementById('dueDate')?.value || '';
    fd.orderDate = document.getElementById('orderDate')?.value || '';
    fd.poNo = document.getElementById('poNo')?.value || '';
    fd.paymentTerms = document.getElementById('paymentTerms')?.value || '';
    fd.ewayBill = document.getElementById('ewayBill')?.value || '';
    fd.billingAddress = document.getElementById('billingAddress')?.value || '';
    fd.sameAsBilling = document.getElementById('sameAsBilling')?.checked || false;
    fd.shippingAddress = fd.sameAsBilling
      ? (document.getElementById('billingAddress')?.value || '')
      : (document.getElementById('shippingAddress')?.value || '');
  }
  if (currentStep === 4) {
    fd.transportChg = parseFloat(document.getElementById('transportChg')?.value) || 0;
    fd.handlingChg = parseFloat(document.getElementById('handlingChg')?.value) || 0;
    fd.packingChg = parseFloat(document.getElementById('packingChg')?.value) || 0;
    fd.otherChg = parseFloat(document.getElementById('otherChg')?.value) || 0;
    fd.taxRate = parseFloat(document.getElementById('taxRate')?.value) || 18;
  }
  if (currentStep === 5) {
    fd.bankId = document.getElementById('bankId')?.value || '';
    fd.termsConditions = document.getElementById('termsConditions')?.value || '';
  }
}

// ─── Recalculate a Part ───────────────────────────────────────────────────────
function recalcPart(p) {
  if (!p.isLeftover) {
    p.inputWeight = p.inputPieces * (p.unitWeight || 0);
  }
  p.lineTotal = p.inputWeight * p.inputPrice;
}

// ─── Bind Step Events ─────────────────────────────────────────────────────────
function bindStep() {
  if (currentStep === 1) {
    document.getElementsByName('sourceType').forEach(r => r.addEventListener('change', () => { saveStep(); drawStep(); }));
    document.getElementById('sameAsBilling')?.addEventListener('change', () => { saveStep(); drawStep(); });
    document.getElementById('billingAddress')?.addEventListener('input', (e) => {
      if (document.getElementById('sameAsBilling')?.checked) {
        document.getElementById('shippingAddress').value = e.target.value;
      }
    });
  }

  if (currentStep === 2) {
    document.getElementById('coilSearch')?.addEventListener('input', (e) => {
      coilSearchTerm = e.target.value.toLowerCase().trim();
      drawStep();
    });
    document.querySelectorAll('.coil-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const coil = COILS.find(c => c.id === cb.dataset.id);
        if (!coil) return;
        if (cb.checked) { if (!fd.selectedCoils.find(c => c.id === coil.id)) fd.selectedCoils.push(coil); }
        else fd.selectedCoils = fd.selectedCoils.filter(c => c.id !== coil.id);
        drawStep();
      });
    });
  }

  if (currentStep === 3) {
    // Individual part checkbox
    document.querySelectorAll('.part-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const p = fd.materials[cb.dataset.coil]?.[parseInt(cb.dataset.idx)];
        if (p) { p.isSelected = cb.checked; drawStep(); }
      });
    });

    // Config inputs — live calculation on input (not blur)
    document.querySelectorAll('.config-inp').forEach(inp => {
      inp.addEventListener('input', () => {
        const cId = inp.dataset.coil;
        const idx = parseInt(inp.dataset.idx);
        const p = fd.materials[cId]?.[idx];
        if (!p) return;
        p[inp.dataset.field] = parseFloat(inp.value) || 0;
        recalcPart(p);
        // Live-update just the line total display without full redraw (prevent focus loss)
        const rowCells = document.querySelectorAll(`.part-cb[data-coil="${cId}"][data-idx="${idx}"]`);
        rowCells.forEach(el => {
          const row = el.closest('tr');
          const totalCell = row?.querySelector('td:last-child');
          if (totalCell) totalCell.innerHTML = p.lineTotal > 0 ? `₹${p.lineTotal.toLocaleString('en-IN')}` : '—';
          if (totalCell) totalCell.style.color = p.lineTotal > 0 ? 'var(--gray-900)' : 'var(--gray-400)';
          if (totalCell) totalCell.style.fontWeight = '600';
        });
      });
      // Full redraw only on blur (to refresh derived fields like weight/pieces display)
      inp.addEventListener('blur', () => { drawStep(); });
    });
  }

  if (currentStep === 4) {
    const updateSummary = () => {
      saveStep();
      let subtotal = 0;
      Object.keys(fd.materials).forEach(cid => {
        fd.materials[cid].forEach(p => { if (p.isSelected) subtotal += (p.lineTotal || 0); });
      });
      const charges = parseFloat(fd.transportChg || 0) + parseFloat(fd.handlingChg || 0) + parseFloat(fd.packingChg || 0) + parseFloat(fd.otherChg || 0);
      const netTotal = subtotal + charges;
      const taxAmt = netTotal * (parseFloat(fd.taxRate || 0) / 100);
      const rawGrand = netTotal + taxAmt;
      const grandTotal = Math.round(rawGrand);
      const roundOff = grandTotal - rawGrand;

      const summaryCard = document.querySelector('.card[style*="background:var(--gray-50)"] .card__body');
      if (summaryCard) {
        summaryCard.innerHTML = `
          <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Material Subtotal</span><strong>₹${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Extra Charges</span><strong>+ ₹${charges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding-top:10px;border-top:1px dashed var(--gray-300);font-weight:600"><span>Net Total</span><span>₹${netTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:var(--gray-600)">Tax (${fd.taxRate}%)</span><strong>+ ₹${taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;color:var(--gray-400)"><span>Round Off</span><span>₹${roundOff.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid var(--gray-300);font-size:1.1rem;font-weight:700;color:var(--purple-700)"><span>Grand Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
        `;
      }
    };

    document.querySelectorAll('.chg-inp').forEach(inp => inp.addEventListener('input', updateSummary));
    document.getElementById('taxRate')?.addEventListener('change', updateSummary);
  }

  if (currentStep === 5) {
    document.getElementById('paymentHeader')?.addEventListener('click', () => { fd.paymentDetailsExpanded = !fd.paymentDetailsExpanded; drawStep(); });
    document.getElementById('termsHeader')?.addEventListener('click', () => { fd.termsExpanded = !fd.termsExpanded; drawStep(); });
    document.getElementById('bankId')?.addEventListener('change', () => { saveStep(); drawStep(); });
    document.getElementById('termsConditions')?.addEventListener('input', () => { saveStep(); });
  }
}
