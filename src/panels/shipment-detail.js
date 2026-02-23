// Shipment Detail — side panel
import { SHIPMENTS } from '../data/mock-data.js';
import { openPanel, closePanel, openModal, closeModal, showToast } from '../main.js';
import { renderShipmentCreate } from './shipment-create.js';
import { renderGrossWeight } from './gross-weight.js';

let currentShipment = null;
let onRefresh = null;

export function renderShipmentDetail(shipment, refresh) {
    currentShipment = shipment;
    onRefresh = refresh;
    drawDetail();
}

function formatMT(mt) { return mt != null ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(mt) + ' MT' : '—'; }

function statusBadge(status) {
    const map = { 'Draft': 'badge--sh-draft', 'Ready to Ship': 'badge--sh-ready', 'In Transit': 'badge--sh-in-transit', 'Delivered': 'badge--sh-delivered', 'Cancelled': 'badge--sh-cancelled' };
    return `<span class="badge ${map[status] || 'badge--sh-draft'}">${status}</span>`;
}

function drawDetail() {
    const sh = currentShipment;
    const s = sh.status;

    // ── Action buttons ────────────────────────────────────────────────────
    const canEdit = s === 'Draft' || s === 'Ready to Ship';
    const canCancel = s === 'Ready to Ship' || s === 'In Transit';
    const canGrossWeight = s === 'Ready to Ship';

    const actionsHtml = (canCancel || canEdit || canGrossWeight) ? `
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
            ${canCancel ? `<button class="btn btn--danger-outline" id="cancelShBtn">Cancel Shipment</button>` : ''}
            ${canGrossWeight && !sh.grossWeightMT ? `<button class="btn btn--outline" id="addGrossBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Gross Weight
            </button>` : ''}
            ${canEdit ? `<button class="btn btn--primary" id="editShBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
            </button>` : ''}
        </div>
    ` : '';

    // ── Transport ──────────────────────────────────────────────────────────
    const transportHtml = sh.transportMode ? `
        <div class="kv-grid kv-grid--2col">
            <div class="kv-item"><div class="kv-label">Mode</div><div class="kv-value">${sh.transportMode}</div></div>
            ${sh.transportMode === 'Internal Fleet'
            ? `<div class="kv-item"><div class="kv-label">Vehicle</div><div class="kv-value">${sh.vehiclePlate || '—'}</div></div>
                   <div class="kv-item"><div class="kv-label">Driver</div><div class="kv-value">${sh.driverName || '—'}</div></div>`
            : `<div class="kv-item"><div class="kv-label">Carrier</div><div class="kv-value">${sh.carrierName || '—'}</div></div>
                   <div class="kv-item"><div class="kv-label">Vehicle</div><div class="kv-value">${sh.vehiclePlate || '—'}</div></div>`}
            <div class="kv-item"><div class="kv-label">E-way Bill</div><div class="kv-value">${sh.ewayBill || '—'}</div></div>
            <div class="kv-item"><div class="kv-label">Pickup Date</div><div class="kv-value">${sh.pickupDate || '—'}</div></div>
        </div>
    ` : `<div style="color:var(--gray-400);font-size:0.875rem;">Not yet assigned</div>`;

    // ── Weights ────────────────────────────────────────────────────────────
    const weightsHtml = `
        <div class="sh-detail-weights">
            <div class="sh-detail-weight-item">
                <div class="kv-label">Net Weight</div>
                <div class="kv-value sh-detail-weight-val">${formatMT(sh.netWeightMT)}</div>
                <div style="font-size:0.72rem;color:var(--gray-400);">From invoice items</div>
            </div>
            ${sh.grossWeightMT ? `
            <div class="sh-detail-weight-divider"></div>
            <div class="sh-detail-weight-item">
                <div class="kv-label">Gross Weight</div>
                <div class="kv-value sh-detail-weight-val sh-gross-val">${formatMT(sh.grossWeightMT)}</div>
                <div style="font-size:0.72rem;color:var(--gray-400);">From weighbridge</div>
            </div>` : ''}
        </div>
        ${(!sh.grossWeightMT && s === 'Ready to Ship') ? `<div style="font-size:0.8rem;color:var(--orange-600);margin-top:var(--sp-2);">Gross weight not yet recorded.</div>` : ''}
    `;

    // ── Timeline ───────────────────────────────────────────────────────────
    const timelineHtml = `
        <div class="sh-timeline">
            ${sh.timeline.map((t, i) => `
                <div class="sh-timeline-item ${t.done ? 'sh-timeline-item--done' : ''}">
                    <div class="sh-timeline-dot ${t.done ? 'sh-timeline-dot--done' : ''}">
                        ${t.done ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>` : ''}
                    </div>
                    ${i < sh.timeline.length - 1 ? `<div class="sh-timeline-line ${t.done ? 'sh-timeline-line--done' : ''}"></div>` : ''}
                    <div class="sh-timeline-content">
                        <div class="sh-timeline-event">${t.event}</div>
                        ${t.date ? `<div class="sh-timeline-meta">${t.date}${t.by ? ` &bull; by ${t.by}` : ''}</div>` : '<div class="sh-timeline-meta" style="color:var(--gray-300);">Pending</div>'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <div>
                    <div class="panel-header__title">${sh.id}</div>
                    <div style="margin-top:4px;">${statusBadge(s)}</div>
                </div>
            </div>
            <button class="panel-header__close" id="detailClose">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="panel-body">
            <div class="card">
                <div class="card__header" id="hOrderDet">
                    <span class="card__title">Order Details</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bOrderDet">
                    <div class="kv-grid kv-grid--2col">
                        <div class="kv-item"><div class="kv-label">Shipment No.</div><div class="kv-value">${sh.id}</div></div>
                        <div class="kv-item"><div class="kv-label">Date</div><div class="kv-value">${sh.date}</div></div>
                        <div class="kv-item"><div class="kv-label">Customer</div><div class="kv-value">${sh.customer}</div></div>
                        <div class="kv-item"><div class="kv-label">Destination</div><div class="kv-value">${sh.destination}</div></div>
                        ${sh.cancelReason ? `<div class="kv-item" style="grid-column:1/-1;"><div class="kv-label">Cancel Reason</div><div class="kv-value" style="color:var(--red-600);">${sh.cancelReason}</div></div>` : ''}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card__header" id="hTransDet">
                    <span class="card__title">Transport Mode</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bTransDet">${transportHtml}</div>
            </div>

            <div class="card">
                <div class="card__header" id="hWeights">
                    <span class="card__title">Weights</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bWeights">${weightsHtml}</div>
            </div>

            <div class="card">
                <div class="card__header" id="hTimeline">
                    <span class="card__title">Timeline</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bTimeline">${timelineHtml}</div>
            </div>
        </div>
        ${actionsHtml ? `<div class="panel-footer"><div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">${actionsHtml}</div></div>` : ''}
    `);

    const pc = document.getElementById('sidePanelContent');
    pc.querySelector('#detailClose').addEventListener('click', closePanel);

    // Collapsible cards
    [['hOrderDet', 'bOrderDet'], ['hTransDet', 'bTransDet'], ['hWeights', 'bWeights'], ['hTimeline', 'bTimeline']].forEach(([hid, bid]) => {
        pc.querySelector(`#${hid}`)?.addEventListener('click', () => {
            pc.querySelector(`#${bid}`)?.classList.toggle('card__body--hidden');
            pc.querySelector(`#${hid} .card__chevron`)?.classList.toggle('card__chevron--collapsed');
        });
    });

    // Action buttons
    pc.querySelector('#editShBtn')?.addEventListener('click', () => {
        renderShipmentCreate(() => { if (onRefresh) onRefresh(); drawDetail(); }, sh);
    });

    pc.querySelector('#addGrossBtn')?.addEventListener('click', () => {
        renderGrossWeight(sh, () => drawDetail());
    });

    pc.querySelector('#cancelShBtn')?.addEventListener('click', () => showCancelModal());
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────

function showCancelModal() {
    openModal(`
        <button class="modal__close" id="cancelModalClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="modal__icon">
            <div style="width:52px;height:52px;border-radius:50%;background:var(--red-100);display:flex;align-items:center;justify-content:center;margin:0 auto;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
        </div>
        <div class="modal__title">Cancel Shipment?</div>
        <div class="modal__desc">This will return all invoices to the available pool. This action cannot be undone${currentShipment.status === 'In Transit' ? ' — shipment is currently In Transit.' : '.'}
        </div>
        <div style="margin-bottom:var(--sp-5);">
            <label class="form-label" style="margin-bottom:var(--sp-2);">Reason for cancellation <span class="required">*</span></label>
            <textarea class="form-textarea" id="cancelReason" placeholder="Describe the reason for cancellation (min 10 characters)..." rows="3"></textarea>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                <span class="sh-field-hint" id="cancelReasonErr" style="color:var(--red-500);font-size:0.78rem;"></span>
                <span style="font-size:0.78rem;color:var(--gray-400);" id="charCount">0 / min 10</span>
            </div>
        </div>
        <div class="modal__actions">
            <button class="btn btn--ghost" id="cancelModalClose2">Keep Shipment</button>
            <button class="btn btn--danger" id="confirmCancel">Confirm Cancel</button>
        </div>
    `);

    const txt = document.querySelector('#cancelReason');
    const charCount = document.querySelector('#charCount');
    txt?.addEventListener('input', () => {
        charCount.textContent = `${txt.value.length} / min 10`;
    });

    document.querySelector('#cancelModalClose')?.addEventListener('click', closeModal);
    document.querySelector('#cancelModalClose2')?.addEventListener('click', closeModal);
    document.querySelector('#confirmCancel')?.addEventListener('click', () => {
        const reason = document.querySelector('#cancelReason').value.trim();
        if (reason.length < 10) {
            document.querySelector('#cancelReasonErr').textContent = 'Reason must be at least 10 characters';
            return;
        }
        currentShipment.status = 'Cancelled';
        currentShipment.cancelReason = reason;
        currentShipment.timeline.push({ event: 'Cancelled', date: new Date().toLocaleString('en-GB'), by: 'Priya M', done: true });
        closeModal();
        showToast('Shipment Cancelled', 'Invoices returned to available pool.', 'success');
        if (onRefresh) onRefresh();
        drawDetail();
    });
}
