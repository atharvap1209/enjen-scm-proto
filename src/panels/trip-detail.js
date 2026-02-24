// Trip Detail — side panel with Reassign & Mark Complete panels
import { TRIPS, VEHICLES, DRIVERS, VEHICLE_REASSIGN_REASONS, DRIVER_REASSIGN_REASONS } from '../data/mock-data.js';
import { openPanel, closePanel, showToast } from '../main.js';

let currentTrip = null;
let onRefresh = null;

export function renderTripDetail(trip, refresh) {
    currentTrip = trip;
    onRefresh = refresh;
    drawDetail();
}

function statusBadge(status) {
    const map = {
        'Scheduled': 'badge--tr-scheduled',
        'In Progress': 'badge--tr-in-progress',
        'Completed': 'badge--tr-completed',
        'Cancelled': 'badge--tr-cancelled',
    };
    return `<span class="badge ${map[status] || 'badge--tr-scheduled'}">${status}</span>`;
}

// ─── Trip Details Panel ────────────────────────────────────────────────────

function drawDetail() {
    const t = currentTrip;
    const s = t.status;

    // Action buttons based on status
    const canReassign = s === 'Scheduled' || s === 'In Progress';
    const canComplete = s === 'In Progress';
    const isCompleted = s === 'Completed';

    // Timeline HTML (horizontal)
    const timelineHtml = `
        <div class="tr-timeline">
            ${t.timeline.map((step, i) => `
                <div class="tr-timeline-step">
                    <div class="tr-timeline-dot tr-timeline-dot--${step.done ? (i === 0 ? 'purple' : i === 1 ? 'blue' : 'green') : 'pending'}">
                        ${step.done ? `<svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>` : ''}
                    </div>
                    <div class="tr-timeline-label">${step.event}</div>
                    ${step.date ? `<div class="tr-timeline-meta">${step.date}</div><div class="tr-timeline-meta">by ${step.by}</div>` : '<div class="tr-timeline-meta" style="color:var(--gray-300);">Pending</div>'}
                </div>
                ${i < t.timeline.length - 1 ? `<div class="tr-timeline-connector ${step.done ? 'tr-timeline-connector--done' : ''}">
                    <svg width="40" height="12" viewBox="0 0 40 12"><line x1="0" y1="6" x2="32" y2="6" stroke="${step.done ? 'var(--gray-300)' : 'var(--gray-200)'}" stroke-width="2"/><polyline points="28,2 34,6 28,10" fill="none" stroke="${step.done ? 'var(--gray-300)' : 'var(--gray-200)'}" stroke-width="2"/></svg>
                </div>` : ''}
            `).join('')}
        </div>
    `;

    // Actions
    const actionsHtml = `
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;justify-content:flex-end;padding:var(--sp-4) var(--sp-6);border-top:1px solid var(--gray-200);">
            ${canReassign ? '<button class="btn btn--outline" id="trReassignBtn">Reassign</button>' : ''}
            <button class="btn ${isCompleted || (!canReassign && !canComplete) ? 'btn--primary' : 'btn--outline'}" id="trViewInvoiceBtn">View Linked Invoice</button>
            ${canComplete ? '<button class="btn btn--primary" id="trCompleteBtn">Mark Trip Completed</button>' : ''}
        </div>
    `;

    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <div class="panel-header__title">Trip Details</div>
            </div>
            <button class="panel-header__close" id="trDetailClose">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="panel-body">
            <div class="card">
                <div class="card__header" id="hTripDet">
                    <span class="card__title">Trip Details</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bTripDet">
                    <div class="kv-grid kv-grid--3col">
                        <div class="kv-item"><div class="kv-label">Trip No.</div><div class="kv-value">${t.id}</div></div>
                        <div class="kv-item"><div class="kv-label">Vehicle No.</div><div class="kv-value">${t.vehiclePlate}</div></div>
                        <div class="kv-item"><div class="kv-label">Start Time</div><div class="kv-value">${t.startTime || '—'}</div></div>
                        ${isCompleted ? `<div class="kv-item"><div class="kv-label">End Time</div><div class="kv-value">${t.endTime || '—'}</div></div>` : ''}
                        <div class="kv-item"><div class="kv-label">Status</div><div class="kv-value">${statusBadge(s)}</div></div>
                        <div class="kv-item"><div class="kv-label">Invoice No.</div><div class="kv-value">${t.invoiceRef}</div></div>
                        <div class="kv-item"><div class="kv-label">Driver Name</div><div class="kv-value">${t.driverName}</div></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card__header" id="hTimeline">
                    <span class="card__title">Timeline</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bTimeline">${timelineHtml}</div>
            </div>
        </div>
        ${s !== 'Cancelled' ? actionsHtml : ''}
    `);

    const pc = document.getElementById('sidePanelContent');
    pc.querySelector('#trDetailClose').addEventListener('click', closePanel);

    // Collapsible cards
    [['hTripDet', 'bTripDet'], ['hTimeline', 'bTimeline']].forEach(([hid, bid]) => {
        pc.querySelector(`#${hid}`)?.addEventListener('click', () => {
            pc.querySelector(`#${bid}`)?.classList.toggle('card__body--hidden');
            pc.querySelector(`#${hid} .card__chevron`)?.classList.toggle('card__chevron--collapsed');
        });
    });

    // Action handlers
    pc.querySelector('#trReassignBtn')?.addEventListener('click', () => showReassignPanel());
    pc.querySelector('#trCompleteBtn')?.addEventListener('click', () => showCompletePanel());
    pc.querySelector('#trViewInvoiceBtn')?.addEventListener('click', () => {
        showToast('Navigation', `Would navigate to ${currentTrip.invoiceRef}`, 'success');
    });
}

// ─── Reassign Panel ────────────────────────────────────────────────────────

function showReassignPanel() {
    const t = currentTrip;
    let reassignType = 'Vehicle';

    function drawReassign() {
        const isVehicle = reassignType === 'Vehicle';
        const reasons = isVehicle ? VEHICLE_REASSIGN_REASONS : DRIVER_REASSIGN_REASONS;
        const availableVehicles = VEHICLES.filter(v => v.available && v.plate !== t.vehiclePlate);
        const availableDrivers = DRIVERS.filter(d => d.available && d.name !== t.driverName);

        openPanel(`
            <div class="panel-header">
                <div class="panel-header__left">
                    <div class="panel-header__title">Reassign</div>
                </div>
                <button class="panel-header__close" id="reassignClose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="panel-body">
                <div class="card">
                    <div class="card__header" id="hReassignDet">
                        <span class="card__title">Reassign Details</span>
                        <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="card__body" id="bReassignDet">
                        <div class="kv-grid kv-grid--2col" style="margin-bottom:var(--sp-5);">
                            <div class="kv-item"><div class="kv-label">Current Driver</div><div class="kv-value fw-600">${t.driverName}</div></div>
                            <div class="kv-item"><div class="kv-label">Current Vehicle</div><div class="kv-value fw-600">${t.vehiclePlate}</div></div>
                        </div>

                        <div class="kv-grid kv-grid--2col" style="margin-bottom:var(--sp-4);">
                            <div>
                                <label class="form-label">Reassign Type <span class="required">*</span></label>
                                <select class="form-select" id="reassignTypeSelect">
                                    <option value="Vehicle" ${reassignType === 'Vehicle' ? 'selected' : ''}>Vehicle</option>
                                    <option value="Driver" ${reassignType === 'Driver' ? 'selected' : ''}>Driver</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Reason for Reassignment <span class="required">*</span></label>
                                <select class="form-select" id="reassignReason">
                                    <option value="">Select reason...</option>
                                    ${reasons.map(r => `<option value="${r}">${r}</option>`).join('')}
                                </select>
                                <span class="sh-field-hint" id="reasonErr" style="color:var(--red-500);font-size:0.78rem;"></span>
                            </div>
                        </div>

                        <div class="kv-grid kv-grid--2col" style="margin-bottom:var(--sp-4);">
                            ${isVehicle ? `
                                <div>
                                    <label class="form-label">New Vehicle <span class="required">*</span></label>
                                    <select class="form-select" id="newVehicleSelect">
                                        <option value="">Select vehicle...</option>
                                        ${availableVehicles.map(v => `<option value="${v.plate}">${v.plate}</option>`).join('')}
                                    </select>
                                    <span class="sh-field-hint" id="vehicleErr" style="color:var(--red-500);font-size:0.78rem;"></span>
                                </div>
                                <div>
                                    <label class="form-label">Remarks</label>
                                    <textarea class="form-textarea" id="reassignRemarks" placeholder="Enter notes..." rows="3"></textarea>
                                </div>
                            ` : `
                                <div>
                                    <label class="form-label">New Driver <span class="required">*</span></label>
                                    <select class="form-select" id="newDriverSelect">
                                        <option value="">Select driver...</option>
                                        ${availableDrivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                                    </select>
                                    <span class="sh-field-hint" id="driverErr" style="color:var(--red-500);font-size:0.78rem;"></span>
                                </div>
                                <div>
                                    <label class="form-label">Handover Location <span class="required">*</span></label>
                                    <input type="text" class="form-input" id="handoverLocation" placeholder="e.g. Checkpoint 3 - Mumbai Toll Plaza" />
                                    <span class="sh-field-hint" id="locationErr" style="color:var(--red-500);font-size:0.78rem;"></span>
                                </div>
                            `}
                        </div>

                        ${!isVehicle ? `
                            <div style="margin-bottom:var(--sp-4);">
                                <label class="form-label">Remarks</label>
                                <textarea class="form-textarea" id="reassignRemarks" placeholder="Enter notes..." rows="3"></textarea>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;padding:var(--sp-4) var(--sp-6);border-top:1px solid var(--gray-200);">
                <button class="btn btn--outline" id="reassignCancelBtn">Cancel</button>
                <button class="btn btn--primary" id="confirmReassignBtn">Confirm Reassignment</button>
            </div>
        `);

        const pc = document.getElementById('sidePanelContent');

        // Close
        pc.querySelector('#reassignClose').addEventListener('click', () => drawDetail());
        pc.querySelector('#reassignCancelBtn').addEventListener('click', () => drawDetail());

        // Collapsible
        pc.querySelector('#hReassignDet')?.addEventListener('click', () => {
            pc.querySelector('#bReassignDet')?.classList.toggle('card__body--hidden');
            pc.querySelector('#hReassignDet .card__chevron')?.classList.toggle('card__chevron--collapsed');
        });

        // Type change
        pc.querySelector('#reassignTypeSelect').addEventListener('change', e => {
            reassignType = e.target.value;
            drawReassign();
        });

        // Confirm
        pc.querySelector('#confirmReassignBtn').addEventListener('click', () => {
            const reason = pc.querySelector('#reassignReason').value;
            let valid = true;

            if (!reason) {
                const el = pc.querySelector('#reasonErr');
                if (el) el.textContent = 'Select a reason';
                valid = false;
            }

            if (isVehicle) {
                const newVehicle = pc.querySelector('#newVehicleSelect').value;
                if (!newVehicle) {
                    const el = pc.querySelector('#vehicleErr');
                    if (el) el.textContent = 'Select an available vehicle';
                    valid = false;
                }
                if (valid) {
                    // Record reassignment
                    currentTrip.reassignments.push({
                        type: 'VEHICLE',
                        oldValue: currentTrip.vehiclePlate,
                        newValue: newVehicle,
                        reason,
                        remarks: pc.querySelector('#reassignRemarks')?.value || '',
                        reassignedAt: new Date().toLocaleString('en-GB'),
                    });
                    currentTrip.vehiclePlate = newVehicle;
                }
            } else {
                const newDriver = pc.querySelector('#newDriverSelect').value;
                const handover = pc.querySelector('#handoverLocation').value.trim();
                if (!newDriver) {
                    const el = pc.querySelector('#driverErr');
                    if (el) el.textContent = 'Select an available driver';
                    valid = false;
                }
                if (!handover) {
                    const el = pc.querySelector('#locationErr');
                    if (el) el.textContent = 'Enter handover location';
                    valid = false;
                }
                if (valid) {
                    currentTrip.reassignments.push({
                        type: 'DRIVER',
                        oldValue: currentTrip.driverName,
                        newValue: newDriver,
                        reason,
                        handoverLocation: handover,
                        remarks: pc.querySelector('#reassignRemarks')?.value || '',
                        reassignedAt: new Date().toLocaleString('en-GB'),
                    });
                    currentTrip.driverName = newDriver;
                }
            }

            if (!valid) return;

            showToast('Success!', 'Reassignment successful', 'success');
            if (onRefresh) onRefresh();
            drawDetail();
        });
    }

    drawReassign();
}

// ─── Mark Complete Panel ───────────────────────────────────────────────────

function showCompletePanel() {
    const t = currentTrip;
    // Auto-fill current datetime
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <div class="panel-header__title">Mark Trip as Complete</div>
            </div>
            <button class="panel-header__close" id="completeClose">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="panel-body">
            <div class="card">
                <div class="card__header" id="hCompleteDet">
                    <span class="card__title">Trip Details</span>
                    <svg class="card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="card__body" id="bCompleteDet">
                    <div class="kv-grid kv-grid--2col" style="margin-bottom:var(--sp-5);">
                        <div class="kv-item"><div class="kv-label">Trip No.</div><div class="kv-value fw-600">${t.id}</div></div>
                        <div>
                            <label class="form-label">Completed Date and Time</label>
                            <input type="datetime-local" class="form-input" id="completedDateTime" value="${defaultDateTime}" />
                            <span class="sh-field-hint" id="dateTimeErr" style="color:var(--red-500);font-size:0.78rem;"></span>
                        </div>
                    </div>

                    <div style="margin-bottom:var(--sp-4);">
                        <label class="form-label">Remarks</label>
                        <textarea class="form-textarea" id="completeRemarks" placeholder="Enter notes..." rows="3"></textarea>
                    </div>
                </div>
            </div>
        </div>
        <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;padding:var(--sp-4) var(--sp-6);border-top:1px solid var(--gray-200);">
            <button class="btn btn--outline" id="completeCancelBtn">Cancel</button>
            <button class="btn btn--primary" id="confirmCompleteBtn">Confirm Completion</button>
        </div>
    `);

    const pc = document.getElementById('sidePanelContent');

    // Close / Cancel
    pc.querySelector('#completeClose').addEventListener('click', () => drawDetail());
    pc.querySelector('#completeCancelBtn').addEventListener('click', () => drawDetail());

    // Collapsible
    pc.querySelector('#hCompleteDet')?.addEventListener('click', () => {
        pc.querySelector('#bCompleteDet')?.classList.toggle('card__body--hidden');
        pc.querySelector('#hCompleteDet .card__chevron')?.classList.toggle('card__chevron--collapsed');
    });

    // Confirm
    pc.querySelector('#confirmCompleteBtn').addEventListener('click', () => {
        const dtVal = pc.querySelector('#completedDateTime').value;
        if (!dtVal) {
            pc.querySelector('#dateTimeErr').textContent = 'Invalid completion time';
            return;
        }

        const completedDate = new Date(dtVal);
        const now = new Date();
        if (completedDate > now) {
            pc.querySelector('#dateTimeErr').textContent = 'Completion time cannot be in the future';
            return;
        }

        // Format datetime for display
        const pad = n => String(n).padStart(2, '0');
        const formatted = `${pad(completedDate.getDate())}-${pad(completedDate.getMonth() + 1)}-${completedDate.getFullYear()} ${pad(completedDate.getHours())}:${pad(completedDate.getMinutes())}`;

        currentTrip.status = 'Completed';
        currentTrip.endTime = formatted;

        showToast('Success!', 'Trip completed successfully', 'success');
        if (onRefresh) onRefresh();
        drawDetail();
    });
}
