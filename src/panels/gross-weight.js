// Gross Weight — narrow side panel (opens within shipment detail context)
import { openPanel, closePanel, showToast } from '../main.js';

export function renderGrossWeight(shipment, onSave) {
    let truckWith = '';
    let truckWithout = '';

    function calcGross() {
        const w = parseFloat(truckWith) || 0;
        const wo = parseFloat(truckWithout) || 0;
        return w > 0 && wo > 0 && w > wo ? w - wo : null;
    }

    function formatKg(kg) { return kg != null ? new Intl.NumberFormat('en-IN').format(kg) + ' kg' : '—'; }

    function draw() {
        const gross = calcGross();
        const grossDisplay = gross !== null ? formatKg(gross) : '—';
        const isNegative = gross !== null && gross < 0;
        const warning = gross !== null && shipment.netWeightKg && gross < shipment.netWeightKg
            ? `<div class="sh-gw-warning"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Warning: Gross weight is less than net weight</div>` : '';

        openPanel(`
            <div class="panel-header">
                <div class="panel-header__left">
                    <button class="panel-header__close" id="gwClose">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div>
                        <div class="panel-header__title">Add Gross Weight</div>
                        <div style="font-size:0.8rem;color:var(--gray-500);">Weighbridge measurement for ${shipment.id}</div>
                    </div>
                </div>
            </div>
            <div class="panel-body">
                <div class="sh-gw-net-banner">
                    <div class="kv-label">Net Weight (from invoices)</div>
                    <div class="sh-gw-net-val">${formatKg(shipment.netWeightKg)}</div>
                </div>

                <div class="card" style="padding:var(--sp-5);">
                    <div class="form-group" style="margin-bottom:var(--sp-4);">
                        <label class="form-label">Truck Weight With Shipment (kg) <span class="required">*</span></label>
                        <input type="number" class="form-input" id="gwWith" placeholder="e.g. 25000" value="${truckWith}" min="0" />
                        <span class="sh-field-hint" style="font-size:0.78rem;color:var(--gray-400);">Total weight of loaded truck</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Truck Weight Without Shipment (kg) <span class="required">*</span></label>
                        <input type="number" class="form-input" id="gwWithout" placeholder="e.g. 9800" value="${truckWithout}" min="0" />
                        <span class="sh-field-hint" style="font-size:0.78rem;color:var(--gray-400);">Tare weight of empty truck</span>
                    </div>
                </div>

                <div class="sh-gw-result">
                    <div class="sh-gw-result__label">Gross Weight (Auto-calculated)</div>
                    <div class="sh-gw-result__value ${isNegative ? 'text-red' : ''}">${grossDisplay}</div>
                    <div style="font-size:0.75rem;color:var(--gray-400);">Truck With − Truck Without</div>
                    ${warning}
                    ${isNegative ? `<div class="sh-gw-warning"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> "With Shipment" must be greater than "Without"</div>` : ''}
                </div>
            </div>
            <div class="panel-footer">
                <div class="panel-footer__left">
                    <button class="btn btn--ghost" id="gwCancel">Cancel</button>
                </div>
                <div class="panel-footer__right">
                    <button class="btn btn--primary" id="gwSave" ${gross === null || isNegative ? 'disabled style="opacity:.5;pointer-events:none;"' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Save Gross Weight
                    </button>
                </div>
            </div>
        `);

        const pc = document.getElementById('sidePanelContent');
        pc.querySelector('#gwClose').addEventListener('click', closePanel);
        pc.querySelector('#gwCancel').addEventListener('click', closePanel);

        pc.querySelector('#gwWith').addEventListener('input', e => { truckWith = e.target.value; draw(); });
        pc.querySelector('#gwWithout').addEventListener('input', e => { truckWithout = e.target.value; draw(); });

        pc.querySelector('#gwSave')?.addEventListener('click', () => {
            const g = calcGross();
            if (g === null || g <= 0) return;
            shipment.grossWeightKg = g;
            closePanel();
            showToast('Gross Weight Saved', `Gross weight ${formatKg(g)} recorded for ${shipment.id}.`, 'success');
            if (onSave) onSave();
        });
    }

    draw();
}
