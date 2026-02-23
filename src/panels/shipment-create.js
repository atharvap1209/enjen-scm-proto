// Create Shipment — 3-step wizard
import { AVAILABLE_INVOICES, VEHICLES, DRIVERS, SHIPMENTS, addShipment } from '../data/mock-data.js';
import { openPanel, closePanel, openModal, closeModal, showToast } from '../main.js';

let step = 1;
let selectedInvoiceIds = new Set();
let expandedInvoiceIds = new Set();
let searchTerm = '';
let transportMode = 'Internal Fleet';
let selectedVehicle = null;
let selectedDriver = null;
let carrierName = '';
let ewayBill = '';
let pickupDate = '';
let onDoneCallback = null;
let editShipment = null;

export function renderShipmentCreate(onDone, existingShipment = null) {
    step = 1;
    selectedInvoiceIds = new Set(existingShipment?.invoiceIds || []);
    expandedInvoiceIds = new Set();
    searchTerm = '';
    transportMode = existingShipment?.transportMode || 'Internal Fleet';
    selectedVehicle = existingShipment?.vehiclePlate || null;
    selectedDriver = existingShipment?.driverName || null;
    carrierName = existingShipment?.carrierName || '';
    ewayBill = existingShipment?.ewayBill || '';
    pickupDate = existingShipment?.pickupDate || '';
    onDoneCallback = onDone;
    editShipment = existingShipment || null;
    renderStep();
}

function renderStep() {
    if (step === 1) renderStep1();
    else if (step === 2) renderStep2();
    else renderStep3();
}

function formatMT(mt) { return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(mt) + ' MT'; }
function formatCurrency(v) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

function calcTotals() {
    let invoices = 0, items = 0, mt = 0;
    selectedInvoiceIds.forEach(id => {
        const inv = AVAILABLE_INVOICES.find(i => i.id === id);
        if (!inv) return;
        invoices++; items += inv.lineItems.length;
        mt += inv.lineItems.reduce((s, li) => s + li.totalWeightMT, 0);
    });
    return { invoices, items, mt };
}

function stepperHtml() {
    const steps = ['Select Invoices', 'Transport Mode', 'Review & Submit'];
    const fillPct = (step - 1) / 2 * 100;
    return `<div class="stepper">
        <div class="stepper__line"><div class="stepper__line-fill" style="width:${fillPct}%"></div></div>
        ${steps.map((s, i) => {
        const n = i + 1;
        const cls = n < step ? 'stepper__step--completed' : n === step ? 'stepper__step--active' : '';
        const inner = n < step
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`
            : n;
        return `<div class="stepper__step ${cls}"><div class="stepper__circle">${inner}</div><div class="stepper__label">${s}</div></div>`;
    }).join('')}
    </div>`;
}

// ─── STEP 1 ────────────────────────────────────────────────────────────────

function renderStep1() {
    const filtered = AVAILABLE_INVOICES.filter(inv => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q) || inv.orderNo.toLowerCase().includes(q);
    });
    const { invoices, items, mt } = calcTotals();

    const cardsHtml = filtered.length ? filtered.map(inv => {
        const isSelected = selectedInvoiceIds.has(inv.id);
        const isExpanded = expandedInvoiceIds.has(inv.id);
        const invMT = inv.lineItems.reduce((s, li) => s + li.totalWeightMT, 0);
        const itemRows = isExpanded ? `<div class="sh-inv-items">
            <div class="data-table-wrapper" style="margin-bottom:var(--sp-3);border-radius:var(--radius-md);">
            <table class="data-table"><thead><tr>
                <th><span class="th-content">Part Name</span></th>
                <th><span class="th-content">No. of Pieces</span></th>
                <th><span class="th-content">Unit Price</span></th>
                <th><span class="th-content">Weight (MT)</span></th>
            </tr></thead>
            <tbody>${inv.lineItems.map(li => `<tr>
                <td style="font-weight:500;">${li.partName}</td>
                <td>${li.numPieces}</td>
                <td>${formatCurrency(li.unitPrice)}</td>
                <td style="font-weight:600;color:var(--purple-700);">${formatMT(li.totalWeightMT)}</td>
            </tr>`).join('')}</tbody></table>
            </div>
            <div class="sh-inv-address"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Ship to: ${inv.shippingAddress}</div>
        </div>` : '';

        return `<div class="sh-inv-card ${isSelected ? 'sh-inv-card--selected' : ''}" data-inv-id="${inv.id}">
            <div class="sh-inv-card__header">
                <input type="checkbox" class="checkbox-input sh-inv-check" data-inv-id="${inv.id}" ${isSelected ? 'checked' : ''} />
                <div class="sh-inv-card__info">
                    <div class="sh-inv-card__id">${inv.id}</div>
                    <div class="sh-inv-card__meta">${inv.customer} &bull; ${inv.orderNo} &bull; ${formatCurrency(inv.value)}</div>
                </div>
                <div class="sh-inv-card__weight">${formatMT(invMT)}</div>
                <button class="sh-inv-expand" data-inv-id="${inv.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(${isExpanded ? 180 : 0}deg);transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
                    ${inv.lineItems.length} item${inv.lineItems.length !== 1 ? 's' : ''}
                </button>
            </div>
            ${itemRows}
        </div>`;
    }).join('') : `<div style="text-align:center;padding:2rem;color:var(--gray-400);">No invoices found.</div>`;

    const title = editShipment ? `Edit — ${editShipment.id}` : 'Create Shipment';
    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <button class="panel-header__close" id="wizClose"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                <div class="panel-header__title">${title}</div>
            </div>
        </div>
        ${stepperHtml()}
        <div class="panel-body" style="gap:var(--sp-4);">
            <div class="search-bar" style="margin-bottom:0;max-width:100%;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="invSearch" placeholder="Search invoices..." value="${searchTerm}" />
            </div>
            <div id="invCards">${cardsHtml}</div>
        </div>
        <div class="sh-counter ${invoices > 0 ? 'sh-counter--active' : ''}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            <span>${invoices > 0 ? `<strong>${invoices}</strong> invoice${invoices !== 1 ? 's' : ''}, <strong>${items}</strong> item${items !== 1 ? 's' : ''}, <strong>${formatMT(mt)}</strong>` : 'No invoices selected'}</span>
        </div>
        <div class="panel-footer">
            <div class="panel-footer__left"><button class="btn btn--ghost" disabled style="opacity:.4;">← Previous</button></div>
            <div class="panel-footer__right">
                <button class="btn btn--outline" id="saveDraft1">Save as Draft</button>
                <button class="btn btn--primary" id="next1" ${invoices === 0 ? 'disabled style="opacity:.5;pointer-events:none;"' : ''}>Next →</button>
            </div>
        </div>
    `);

    const pc = document.getElementById('sidePanelContent');
    pc.querySelector('#wizClose').addEventListener('click', closePanel);
    pc.querySelector('#invSearch').addEventListener('input', e => { searchTerm = e.target.value; renderStep1(); });
    pc.querySelectorAll('.sh-inv-check').forEach(cb => cb.addEventListener('change', e => {
        e.stopPropagation();
        if (e.target.checked) selectedInvoiceIds.add(e.target.dataset.invId);
        else selectedInvoiceIds.delete(e.target.dataset.invId);
        renderStep1();
    }));
    pc.querySelectorAll('.sh-inv-card__header').forEach(h => h.addEventListener('click', e => {
        if (e.target.closest('.sh-inv-expand') || e.target.closest('.checkbox-input')) return;
        const id = h.closest('.sh-inv-card').dataset.invId;
        if (selectedInvoiceIds.has(id)) selectedInvoiceIds.delete(id); else selectedInvoiceIds.add(id);
        renderStep1();
    }));
    pc.querySelectorAll('.sh-inv-expand').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.invId;
        if (expandedInvoiceIds.has(id)) expandedInvoiceIds.delete(id); else expandedInvoiceIds.add(id);
        renderStep1();
    }));
    pc.querySelector('#saveDraft1')?.addEventListener('click', saveDraft);
    pc.querySelector('#next1')?.addEventListener('click', () => { step = 2; renderStep2(); });
}

// ─── STEP 2 ────────────────────────────────────────────────────────────────

function renderStep2() {
    const availVehicles = VEHICLES.filter(v => v.available);
    const availDrivers = DRIVERS.filter(d => d.available);
    const isInternal = transportMode === 'Internal Fleet';

    const transportFields = isInternal ? `
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-4);">
            <div class="form-group"><label class="form-label">Vehicle No. <span class="required">*</span></label>
                <select class="form-select" id="vehicleSel">
                    <option value="">Select vehicle...</option>
                    ${availVehicles.map(v => `<option value="${v.plate}" ${selectedVehicle === v.plate ? 'selected' : ''}>${v.plate} — ${v.type}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label class="form-label">Driver <span class="required">*</span></label>
                <select class="form-select" id="driverSel">
                    <option value="">Select driver...</option>
                    ${availDrivers.map(d => `<option value="${d.name}" ${selectedDriver === d.name ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
            </div>
        </div>` : `
        <div class="form-row form-row--2" style="margin-bottom:var(--sp-4);">
            <div class="form-group"><label class="form-label">Carrier Name <span class="required">*</span></label>
                <input type="text" class="form-input" id="carrierIn" placeholder="e.g. FastMove Logistics" value="${carrierName}" />
            </div>
            <div class="form-group"><label class="form-label">Vehicle No.</label>
                <input type="text" class="form-input" id="extVehicleIn" placeholder="e.g. MH-04-AB-1234" value="${selectedVehicle || ''}" />
            </div>
        </div>`;

    const title = editShipment ? `Edit — ${editShipment.id}` : 'Create Shipment';
    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <button class="panel-header__close" id="wizClose"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                <div class="panel-header__title">${title}</div>
            </div>
        </div>
        ${stepperHtml()}
        <div class="panel-body">
            <div class="card" style="padding:var(--sp-5);">
                <div class="section-title" style="margin-bottom:var(--sp-4);">Transport Details</div>
                <div class="sh-transport-tabs" style="margin-bottom:var(--sp-5);">
                    <button class="sh-transport-tab ${isInternal ? 'sh-transport-tab--active' : ''}" data-mode="Internal Fleet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="m16 8 5 1 2 4v4h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        Internal Fleet
                    </button>
                    <button class="sh-transport-tab ${!isInternal ? 'sh-transport-tab--active' : ''}" data-mode="External Carrier">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
                        External Carrier
                    </button>
                </div>
                ${transportFields}
                <div class="form-row form-row--2">
                    <div class="form-group"><label class="form-label">E-way Bill No. <span class="required">*</span></label>
                        <input type="text" class="form-input" id="ewayIn" placeholder="12-digit number" maxlength="12" value="${ewayBill}" />
                        <span class="sh-field-hint" id="ewayHint" style="color:var(--red-500);font-size:0.78rem;"></span>
                    </div>
                    <div class="form-group"><label class="form-label">Pickup Date <span class="required">*</span></label>
                        <input type="date" class="form-input" id="pickupIn" value="${pickupDate}" min="${new Date().toISOString().slice(0, 10)}" />
                    </div>
                </div>
            </div>
        </div>
        <div class="panel-footer">
            <div class="panel-footer__left"><button class="btn btn--ghost" id="prev2">← Previous</button></div>
            <div class="panel-footer__right">
                <button class="btn btn--outline" id="saveDraft2">Save as Draft</button>
                <button class="btn btn--primary" id="next2">Next →</button>
            </div>
        </div>
    `);

    const pc = document.getElementById('sidePanelContent');
    pc.querySelector('#wizClose').addEventListener('click', closePanel);
    pc.querySelector('#prev2').addEventListener('click', () => { step = 1; renderStep1(); });
    pc.querySelector('#saveDraft2').addEventListener('click', saveDraft);
    pc.querySelectorAll('.sh-transport-tab').forEach(btn => btn.addEventListener('click', () => {
        transportMode = btn.dataset.mode; selectedVehicle = null; selectedDriver = null; carrierName = '';
        renderStep2();
    }));
    if (isInternal) {
        pc.querySelector('#vehicleSel')?.addEventListener('change', e => selectedVehicle = e.target.value);
        pc.querySelector('#driverSel')?.addEventListener('change', e => selectedDriver = e.target.value);
    } else {
        pc.querySelector('#carrierIn')?.addEventListener('input', e => carrierName = e.target.value);
        pc.querySelector('#extVehicleIn')?.addEventListener('input', e => selectedVehicle = e.target.value);
    }
    pc.querySelector('#ewayIn')?.addEventListener('input', e => {
        ewayBill = e.target.value.replace(/\D/g, ''); e.target.value = ewayBill;
        const h = pc.querySelector('#ewayHint');
        if (h) h.textContent = ewayBill.length && ewayBill.length !== 12 ? `${ewayBill.length}/12 digits` : '';
    });
    pc.querySelector('#pickupIn')?.addEventListener('change', e => pickupDate = e.target.value);
    pc.querySelector('#next2').addEventListener('click', () => {
        const ew = pc.querySelector('#ewayIn').value;
        if (ew.length !== 12) { pc.querySelector('#ewayHint').textContent = 'Must be exactly 12 digits'; pc.querySelector('#ewayIn').style.borderColor = 'var(--red-500)'; return; }
        if (!pickupDate) { pc.querySelector('#pickupIn').style.borderColor = 'var(--red-500)'; return; }
        ewayBill = ew; step = 3; renderStep3();
    });
}

// ─── STEP 3 ────────────────────────────────────────────────────────────────

function renderStep3() {
    const selectedInvs = AVAILABLE_INVOICES.filter(i => selectedInvoiceIds.has(i.id));
    const { mt } = calcTotals();

    const invSections = selectedInvs.map(inv => {
        const invMT = inv.lineItems.reduce((s, li) => s + li.totalWeightMT, 0);
        return `<div class="sh-review-inv">
            <div class="sh-review-inv__header">
                <div><div style="font-weight:600;">${inv.id}</div><div style="font-size:0.8rem;color:var(--gray-500);">${inv.customer} &bull; ${inv.orderNo}</div></div>
                <div style="font-size:0.85rem;color:var(--gray-600);margin-left:auto;">${formatMT(invMT)}</div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="sh-review-inv__body">
                <div class="sh-inv-address" style="margin-bottom:var(--sp-3);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Ship to: ${inv.shippingAddress}</div>
                <div class="data-table-wrapper" style="border-radius:var(--radius-md);">
                <table class="data-table"><thead><tr>
                    <th><span class="th-content">Part Name</span></th>
                    <th><span class="th-content">No. of Pieces</span></th>
                    <th><span class="th-content">Unit Price</span></th>
                    <th><span class="th-content">Weight (MT)</span></th>
                </tr></thead>
                <tbody>${inv.lineItems.map(li => `<tr>
                    <td style="font-weight:500;">${li.partName}</td>
                    <td>${li.numPieces}</td>
                    <td>${formatCurrency(li.unitPrice)}</td>
                    <td style="font-weight:600;color:var(--purple-700);">${formatMT(li.totalWeightMT)}</td>
                </tr>`).join('')}</tbody></table>
                </div>
            </div>
        </div>`;
    }).join('');

    const isInternal = transportMode === 'Internal Fleet';
    const transportKv = isInternal
        ? `<div class="kv-grid kv-grid--2col">
            <div class="kv-item"><div class="kv-label">Mode</div><div class="kv-value">Internal Fleet</div></div>
            <div class="kv-item"><div class="kv-label">Vehicle</div><div class="kv-value">${selectedVehicle || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Driver</div><div class="kv-value">${selectedDriver || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">E-way Bill</div><div class="kv-value">${ewayBill || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Pickup Date</div><div class="kv-value">${pickupDate || '—'}</div></div>
        </div>`
        : `<div class="kv-grid kv-grid--2col">
            <div class="kv-item"><div class="kv-label">Mode</div><div class="kv-value">External Carrier</div></div>
            <div class="kv-item"><div class="kv-label">Carrier</div><div class="kv-value">${carrierName || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Vehicle</div><div class="kv-value">${selectedVehicle || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">E-way Bill</div><div class="kv-value">${ewayBill || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Pickup Date</div><div class="kv-value">${pickupDate || '—'}</div></div>
        </div>`;

    const title = editShipment ? `Edit — ${editShipment.id}` : 'Create Shipment';
    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <button class="panel-header__close" id="wizClose"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                <div class="panel-header__title">${title}</div>
            </div>
        </div>
        ${stepperHtml()}
        <div class="panel-body">
            <div class="card">
                <div class="card__header" id="revInvH"><span class="card__title">Invoice Details (${selectedInvs.length})</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="revInvB">${invSections}</div>
            </div>
            <div class="card">
                <div class="card__header" id="revTransH"><span class="card__title">Transport Mode</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="revTransB">${transportKv}</div>
            </div>
            <div class="sh-weight-summary">
                <div class="sh-weight-summary__label">Total Net Weight</div>
                <div class="sh-weight-summary__value">${formatMT(mt)}</div>
            </div>
        </div>
        <div class="panel-footer">
            <div class="panel-footer__left"><button class="btn btn--ghost" id="prev3">← Previous</button></div>
            <div class="panel-footer__right">
                <button class="btn btn--outline" id="saveDraft3">Save as Draft</button>
                <button class="btn btn--primary" id="createBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ${editShipment ? 'Save Changes' : 'Create Shipment'}
                </button>
            </div>
        </div>
    `);

    const pc = document.getElementById('sidePanelContent');
    pc.querySelector('#wizClose').addEventListener('click', closePanel);
    pc.querySelector('#prev3').addEventListener('click', () => { step = 2; renderStep2(); });
    pc.querySelector('#saveDraft3').addEventListener('click', saveDraft);
    pc.querySelector('#revInvH').addEventListener('click', () => {
        pc.querySelector('#revInvB').classList.toggle('card__body--hidden');
        pc.querySelector('#revInvH .card__chevron').classList.toggle('card__chevron--collapsed');
    });
    pc.querySelector('#revTransH').addEventListener('click', () => {
        pc.querySelector('#revTransB').classList.toggle('card__body--hidden');
        pc.querySelector('#revTransH .card__chevron').classList.toggle('card__chevron--collapsed');
    });
    pc.querySelectorAll('.sh-review-inv__header').forEach(h => h.addEventListener('click', () => {
        h.nextElementSibling?.classList.toggle('sh-review-inv__body--hidden');
        h.querySelector('svg')?.style.setProperty('transform', h.nextElementSibling?.classList.contains('sh-review-inv__body--hidden') ? 'rotate(-90deg)' : 'rotate(0)');
    }));
    pc.querySelector('#createBtn').addEventListener('click', () => createShipment(mt));
}

function createShipment(netMT) {
    const invList = [...selectedInvoiceIds];
    const firstInv = AVAILABLE_INVOICES.find(i => i.id === invList[0]);
    if (editShipment) {
        Object.assign(editShipment, {
            invoiceIds: invList, transportMode, vehiclePlate: selectedVehicle,
            driverName: transportMode === 'Internal Fleet' ? selectedDriver : null,
            carrierName: transportMode === 'External Carrier' ? carrierName : undefined,
            ewayBill, pickupDate, netWeightMT: netMT,
            customer: firstInv?.customer || editShipment.customer, status: 'Ready to Ship',
        });
        closePanel();
        showToast('Shipment Updated', `${editShipment.id} updated.`, 'success');
        if (onDoneCallback) onDoneCallback();
    } else {
        const newId = `SH-2026-${String(SHIPMENTS.length + 1).padStart(4, '0')}`;
        addShipment({
            id: newId, date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            invoiceIds: invList, customer: firstInv?.customer || '—',
            destination: firstInv?.shippingAddress?.split(',').slice(-2).join(',').trim() || '—',
            transportMode, vehiclePlate: selectedVehicle,
            driverName: transportMode === 'Internal Fleet' ? selectedDriver : null,
            carrierName: transportMode === 'External Carrier' ? carrierName : undefined,
            ewayBill, pickupDate, netWeightMT: netMT, grossWeightMT: null,
            status: 'Ready to Ship', priority: 'Normal',
            timeline: [
                { event: 'Shipment Created', date: new Date().toLocaleString('en-GB'), by: 'Priya M', done: true },
                { event: 'Vehicle Dispatched', date: null, by: null, done: false },
                { event: 'In Transit', date: null, by: null, done: false },
                { event: 'Delivered', date: null, by: null, done: false },
            ]
        });
        closePanel();
        showSuccessModal(newId);
    }
}

function saveDraft() {
    const { mt } = calcTotals();
    const invList = [...selectedInvoiceIds];
    const firstInv = AVAILABLE_INVOICES.find(i => i.id === invList[0]);
    if (!editShipment) {
        addShipment({
            id: `SH-2026-${String(SHIPMENTS.length + 1).padStart(4, '0')}`,
            date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            invoiceIds: invList,
            customer: firstInv?.customer || '—',
            destination: firstInv?.shippingAddress?.split(',').slice(-2).join(',').trim() || '—',
            transportMode: null, vehiclePlate: null, driverName: null, ewayBill: null, pickupDate: null,
            netWeightMT: mt, grossWeightMT: null, status: 'Draft', priority: 'Normal',
            timeline: [{ event: 'Draft Saved', date: new Date().toLocaleString('en-GB'), by: 'Priya M', done: true }]
        });
    }
    closePanel();
    showToast('Draft Saved', 'Shipment saved as draft.', 'success');
    if (onDoneCallback) onDoneCallback();
}

function showSuccessModal(shipmentId) {
    openModal(`
        <button class="modal__close" id="mClose"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div class="modal__icon"><div class="sh-success-icon">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="22" fill="#16A34A"/><path d="M12 22l7 7 13-14" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div></div>
        <div class="modal__title">Shipment Created!</div>
        <div class="modal__desc">Shipment and trip auto-created successfully.</div>
        <div class="modal__info">
            <div class="kv-item"><div class="kv-label">Shipment No.</div>
                <div class="kv-value" style="display:flex;align-items:center;gap:6px;">${shipmentId}
                    <button class="sh-copy-btn" id="copyId" title="Copy"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
                </div>
            </div>
            <div class="kv-item"><div class="kv-label">Status</div><div class="kv-value"><span class="badge badge--sh-ready">Ready to Ship</span></div></div>
            <div class="kv-item"><div class="kv-label">Transport</div><div class="kv-value">${transportMode}</div></div>
            <div class="kv-item"><div class="kv-label">Trip Created</div><div class="kv-value" style="color:var(--green-600);">✓ Auto-created</div></div>
        </div>
        <div class="modal__actions">
            <button class="btn btn--outline" id="viewListBtn">View Shipment List</button>
            <button class="btn btn--primary" id="goTripsBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Go to Trips
            </button>
        </div>
    `);
    const done = () => { closeModal(); if (onDoneCallback) onDoneCallback(); };
    document.querySelector('#mClose')?.addEventListener('click', done);
    document.querySelector('#viewListBtn')?.addEventListener('click', done);
    document.querySelector('#goTripsBtn')?.addEventListener('click', () => { closeModal(); showToast('Trips', 'Navigating to Trips…', 'success'); if (onDoneCallback) onDoneCallback(); });
    document.querySelector('#copyId')?.addEventListener('click', () => { navigator.clipboard?.writeText(shipmentId); showToast('Copied!', `${shipmentId} copied.`, 'success'); });
}
