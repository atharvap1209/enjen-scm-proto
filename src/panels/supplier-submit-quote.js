// Supplier Portal — Submit Quote Side Panel
import { openPanel, closePanel, showToast } from '../main.js';
import { SUPPLIER_RFQS } from '../data/mock-data.js';

export function renderSubmitQuote(rfq, onRefresh) {
    // Per-line-item state: keyed by itemCode
    const lineState = {};
    rfq.lineItems.forEach(item => {
        lineState[item.itemCode] = {
            expanded: true, // Accordian state
            itemPrice: '',
            leadTimeDays: '',
            priceValidityDate: '',
            deliveryDate: '',
            discountPct: '',
            notes: '',
        };
    });

    let shippingCost = '';
    let taxPct = '';
    let termsAndConditions = '';

    function calcTotals() {
        let grossAmount = 0;
        let totalDiscount = 0;
        rfq.lineItems.forEach(item => {
            const s = lineState[item.itemCode];
            if (s.itemPrice) {
                const price = parseFloat(s.itemPrice) || 0;
                const qty = item.quantity || 0;
                const discountPct = parseFloat(s.discountPct) || 0;

                const lineGross = price * qty;
                const lineDiscount = lineGross * (discountPct / 100);

                grossAmount += lineGross;
                totalDiscount += lineDiscount;
            }
        });

        const netSubtotal = grossAmount - totalDiscount;
        const shipping = parseFloat(shippingCost) || 0;
        const taxAmount = netSubtotal * (parseFloat(taxPct) || 0) / 100;
        const grandTotal = netSubtotal + shipping + taxAmount;

        return { grossAmount, totalDiscount, netSubtotal, shipping, taxAmount, grandTotal };
    }

    function fmtCurrency(val) {
        if (!val && val !== 0) return '₹ 0.00';
        return '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    }

    function buildHtml() {
        const totals = calcTotals();
        const lineItemsHtml = rfq.lineItems.map((item, i) => {
            const s = lineState[item.itemCode];
            return `
            <div class="sq-line-item ${s.expanded ? 'sq-line-item--selected' : ''}" data-item="${item.itemCode}">
                <div class="sq-line-item__header sq-accordion-toggle" data-item="${item.itemCode}" style="cursor:pointer; display:flex; align-items:center;">
                    <div class="sq-line-item__info">
                        <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
                            <span style="font-weight:600;color:var(--purple-700);font-size:0.9rem;">${item.itemCode}</span>
                            <span style="color:var(--gray-600);font-size:0.85rem;">${item.description}</span>
                            <span style="color:var(--gray-500);font-size:0.8rem;background:var(--gray-100);padding:2px 8px;border-radius:var(--radius-full);">Qty: ${item.quantity} ${item.uom}</span>
                        </div>
                        ${item.attachments && item.attachments.length > 0 ? `
                        <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-2);">
                            ${item.attachments.map(a => `
                                <a href="#" class="sp-attachment-link" style="display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;color:var(--purple-700);">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                    ${a}
                                </a>`).join('')}
                        </div>` : ''}
                    </div>
                    <svg class="card__chevron ${s.expanded ? '' : 'card__chevron--collapsed'}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="sq-line-item__fields ${s.expanded ? '' : 'card__body--hidden'}">
                    <div class="form-row form-row--3" style="gap:var(--sp-3);">
                        <div class="form-group">
                            <label class="form-label">Item Price (per unit) <span class="required">*</span></label>
                            <input class="form-input sq-field" data-item="${item.itemCode}" data-field="itemPrice" type="number" placeholder="₹ 0.00" value="${s.itemPrice}" step="0.01" min="0" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lead Time (days) <span class="required">*</span></label>
                            <input class="form-input sq-field" data-item="${item.itemCode}" data-field="leadTimeDays" type="number" placeholder="e.g. 14" value="${s.leadTimeDays}" min="0" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Discount %</label>
                            <input class="form-input sq-field" data-item="${item.itemCode}" data-field="discountPct" type="number" placeholder="0" value="${s.discountPct}" min="0" max="100" step="0.1" />
                        </div>
                    </div>
                    <div class="form-row form-row--3" style="gap:var(--sp-3);margin-top:var(--sp-3);">
                        <div class="form-group">
                            <label class="form-label">Price Validity Date <span class="required">*</span></label>
                            <input class="form-input sq-field" data-item="${item.itemCode}" data-field="priceValidityDate" type="date" value="${s.priceValidityDate}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Delivery Date <span class="required">*</span></label>
                            <input class="form-input sq-field" data-item="${item.itemCode}" data-field="deliveryDate" type="date" value="${s.deliveryDate}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <input class="form-input sq-field" data-item="${item.itemCode}" data-field="notes" type="text" placeholder="Any notes for this item…" value="${s.notes}" />
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        return `
        <div class="panel-header">
            <div class="panel-header__left">
                <button class="panel-header__close" id="sqClose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div>
                    <div class="panel-header__title">Submit Quote</div>
                    <div style="font-size:0.8rem;color:var(--gray-500);margin-top:2px;">For ${rfq.rfqNumber}</div>
                </div>
            </div>
        </div>

        <div class="panel-body">
            <!-- RFQ Summary Banner -->
            <div class="sq-rfq-banner">
                <div class="sq-rfq-banner__grid">
                    <div class="kv-item">
                        <div class="kv-label">RFQ No.</div>
                        <div class="kv-value" style="color:var(--purple-700);">${rfq.rfqNumber}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Created On</div>
                        <div class="kv-value">${rfq.issueDate}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Due Date</div>
                        <div class="kv-value" style="color:var(--orange-600);font-weight:600;">${rfq.dueDate}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Approx Value</div>
                        <div class="kv-value">₹${new Intl.NumberFormat('en-IN').format(rfq.approxValue)}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Status</div>
                        <div class="kv-value"><span class="badge badge--sp-open">Open</span></div>
                    </div>
                </div>
                ${rfq.specialInstructions ? `
                <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--purple-200);">
                    <div class="kv-label">Special Instructions</div>
                    <div style="margin-top:4px;font-size:0.85rem;color:var(--gray-700);">${rfq.specialInstructions}</div>
                </div>` : ''}
            </div>

            <!-- Line Items -->
            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3);">
                    <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);">
                        Line Items <span style="font-weight:400; font-size: 0.8rem; color: var(--red-500); margin-left: var(--sp-2);">(Submission mandatory for all items)</span>
                        <span style="margin-left:var(--sp-2);font-size:0.75rem;font-weight:500;background:var(--gray-100);color:var(--gray-600);padding:2px 8px;border-radius:var(--radius-full);">${rfq.lineItems.length}</span>
                    </div>
                </div>
                <div class="sq-line-items-list" id="sqLineItems">
                    ${lineItemsHtml}
                </div>
            </div>

            <!-- Other Quote Details -->
            <div class="card" style="padding:var(--sp-5);">
                <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);margin-bottom:var(--sp-4);">Other Quote Details</div>
                <div class="form-row form-row--3" style="gap:var(--sp-4);">
                    <div class="form-group">
                        <label class="form-label">Shipping Cost (₹)</label>
                        <input class="form-input" id="sqShippingCost" type="number" placeholder="0.00" value="${shippingCost}" min="0" step="0.01" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tax (%)</label>
                        <select class="form-select" id="sqTax">
                            <option value="">Select Tax</option>
                            <option value="0" ${taxPct === '0' ? 'selected' : ''}>GST 0%</option>
                            <option value="5" ${taxPct === '5' ? 'selected' : ''}>GST 5%</option>
                            <option value="12" ${taxPct === '12' ? 'selected' : ''}>GST 12%</option>
                            <option value="18" ${taxPct === '18' ? 'selected' : ''}>GST 18%</option>
                            <option value="28" ${taxPct === '28' ? 'selected' : ''}>GST 28%</option>
                        </select>
                    </div>
                    <div class="form-group" style="grid-column:span 3;">
                        <label class="form-label">Terms & Conditions</label>
                        <textarea class="form-textarea" id="sqTerms" placeholder="Enter your terms and conditions, warranty clauses, delivery terms…" style="min-height:80px;">${termsAndConditions}</textarea>
                    </div>
                </div>
            </div>

            <!-- Waterfall Totals -->
            <div class="sq-totals-card" id="sqTotalsCard">
                <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);margin-bottom:var(--sp-4);">Quote Summary</div>
                <div class="sq-waterfall">
                    <div class="sq-waterfall__row">
                        <span class="sq-waterfall__label">Gross Amount</span>
                        <span class="sq-waterfall__value" id="sqGrossAmount">${fmtCurrency(totals.grossAmount)}</span>
                    </div>
                    <div class="sq-waterfall__row">
                        <span class="sq-waterfall__label">Total Discount</span>
                        <span class="sq-waterfall__value" id="sqTotalDiscount" style="color:var(--green-600);font-weight:600;">- ${fmtCurrency(totals.totalDiscount)}</span>
                    </div>
                    <div class="sq-waterfall__divider"></div>
                    <div class="sq-waterfall__row">
                        <span class="sq-waterfall__label">Net Subtotal</span>
                        <span class="sq-waterfall__value" id="sqNetSubtotal">${fmtCurrency(totals.netSubtotal)}</span>
                    </div>
                    <div class="sq-waterfall__row">
                        <span class="sq-waterfall__label">Shipping Cost</span>
                        <span class="sq-waterfall__value" id="sqShippingDisplay">${fmtCurrency(totals.shipping)}</span>
                    </div>
                    <div class="sq-waterfall__row">
                        <span class="sq-waterfall__label">Tax${taxPct ? ` (${taxPct}%)` : ''}</span>
                        <span class="sq-waterfall__value" id="sqTaxDisplay">${fmtCurrency(totals.taxAmount)}</span>
                    </div>
                    <div class="sq-waterfall__divider"></div>
                    <div class="sq-waterfall__row sq-waterfall__row--total">
                        <span class="sq-waterfall__label--total">Grand Total</span>
                        <span class="sq-waterfall__value--total" id="sqGrandTotal">${fmtCurrency(totals.grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-footer">
            <div class="panel-footer__left">
                <button class="btn btn--ghost" id="sqCancel">Cancel</button>
            </div>
            <div class="panel-footer__right">
                <button class="btn btn--primary" id="sqSubmitBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
                    Submit Quote to Customer
                </button>
            </div>
        </div>
        `;
    }

    function updateTotals() {
        const totals = calcTotals();
        const fmtC = (v) => '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
        const panel = document.getElementById('sidePanel');
        if (!panel) return;

        panel.querySelector('#sqGrossAmount') && (panel.querySelector('#sqGrossAmount').textContent = fmtC(totals.grossAmount));
        panel.querySelector('#sqTotalDiscount') && (panel.querySelector('#sqTotalDiscount').textContent = '- ' + fmtC(totals.totalDiscount));
        panel.querySelector('#sqNetSubtotal') && (panel.querySelector('#sqNetSubtotal').textContent = fmtC(totals.netSubtotal));
        panel.querySelector('#sqShippingDisplay') && (panel.querySelector('#sqShippingDisplay').textContent = fmtC(totals.shipping));
        panel.querySelector('#sqTaxDisplay') && (panel.querySelector('#sqTaxDisplay').textContent = fmtC(totals.taxAmount));
        panel.querySelector('#sqGrandTotal') && (panel.querySelector('#sqGrandTotal').textContent = fmtC(totals.grandTotal));
    }

    function wireLineItemEvents() {
        document.querySelectorAll('.sq-accordion-toggle').forEach(header => {
            header.addEventListener('click', e => {
                const item = header.dataset.item;
                lineState[item].expanded = !lineState[item].expanded;
                const lineItemEl = header.closest('.sq-line-item');
                const fieldsEl = lineItemEl.querySelector('.sq-line-item__fields');
                const chevron = header.querySelector('.card__chevron');

                if (lineState[item].expanded) {
                    lineItemEl.classList.add('sq-line-item--selected');
                    fieldsEl.classList.remove('card__body--hidden');
                    chevron.classList.remove('card__chevron--collapsed');
                } else {
                    lineItemEl.classList.remove('sq-line-item--selected');
                    fieldsEl.classList.add('card__body--hidden');
                    chevron.classList.add('card__chevron--collapsed');
                }
            });
        });

        document.querySelectorAll('.sq-field').forEach(input => {
            input.addEventListener('input', e => {
                const { item, field } = e.target.dataset;
                lineState[item][field] = e.target.value;
                updateTotals();
            });
        });

        document.querySelectorAll('.sp-attachment-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                showToast('Attachment', 'Downloading attachment…', 'success');
            });
        });
    }

    openPanel(buildHtml());

    document.getElementById('sqClose')?.addEventListener('click', closePanel);
    document.getElementById('sqCancel')?.addEventListener('click', closePanel);

    document.getElementById('sqShippingCost')?.addEventListener('input', e => {
        shippingCost = e.target.value;
        updateTotals();
    });

    document.getElementById('sqTax')?.addEventListener('change', e => {
        taxPct = e.target.value;
        const taxLabel = document.querySelector('#sqTotalsCard .sq-waterfall__row:nth-child(3) .sq-waterfall__label');
        if (taxLabel) taxLabel.textContent = `Tax${taxPct ? ` (${taxPct}%)` : ''}`;
        updateTotals();
    });

    document.getElementById('sqTerms')?.addEventListener('input', e => {
        termsAndConditions = e.target.value;
    });

    document.getElementById('sqSubmitBtn')?.addEventListener('click', () => {
        const missingFields = rfq.lineItems.some(item => {
            const s = lineState[item.itemCode];
            return !s.itemPrice || !s.leadTimeDays || !s.priceValidityDate || !s.deliveryDate;
        });

        if (missingFields) {
            showToast('Validation Error', 'Please fill all required fields for ALL items. Every item must be quoted.', 'error');
            return;
        }

        const idx = SUPPLIER_RFQS.findIndex(r => r.rfqNumber === rfq.rfqNumber);
        if (idx !== -1) {
            SUPPLIER_RFQS[idx].status = 'Quote Submitted';
            SUPPLIER_RFQS[idx].submittedQuote = {
                lineItems: JSON.parse(JSON.stringify(lineState)),
                shippingCost: parseFloat(shippingCost) || 0,
                taxPct: parseFloat(taxPct) || 0,
                termsAndConditions: termsAndConditions
            };
        }

        closePanel();
        showToast('Quote Submitted', `Your quote for ${rfq.rfqNumber} has been submitted to the customer.`, 'success');
        if (onRefresh) onRefresh();
    });

    wireLineItemEvents();
}

