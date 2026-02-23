// Supplier Portal — View Quote Side Panel
import { openPanel, closePanel } from '../main.js';

export function renderViewQuote(rfq) {
    const quote = rfq.submittedQuote;
    if (!quote) return;

    function fmtCurrency(val) {
        if (!val && val !== 0) return '₹ 0.00';
        return '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    }

    function calcTotals() {
        let grossAmount = 0;
        let totalDiscount = 0;

        rfq.lineItems.forEach(item => {
            const s = quote.lineItems[item.itemCode];
            if (s && s.itemPrice) {
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
        const shipping = parseFloat(quote.shippingCost) || 0;
        const taxAmount = netSubtotal * (parseFloat(quote.taxPct) || 0) / 100;
        const grandTotal = netSubtotal + shipping + taxAmount;

        return { grossAmount, totalDiscount, netSubtotal, shipping, taxAmount, grandTotal };
    }

    const totals = calcTotals();

    const lineItemsHtml = rfq.lineItems.map((item, i) => {
        const s = quote.lineItems[item.itemCode] || {};
        return `
        <div class="sq-line-item sq-line-item--selected" style="margin-bottom:var(--sp-4);">
            <div class="sq-line-item__header" style="display:flex; align-items:center; padding:var(--sp-3) var(--sp-4); background:var(--gray-50); border-bottom:1px solid var(--gray-200);">
                <div class="sq-line-item__info">
                    <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
                        <span style="font-weight:600;color:var(--purple-700);font-size:0.9rem;">${item.itemCode}</span>
                        <span style="color:var(--gray-600);font-size:0.85rem;">${item.description}</span>
                        <span style="color:var(--gray-500);font-size:0.8rem;background:var(--gray-200);padding:2px 8px;border-radius:var(--radius-full);">Qty: ${item.quantity} ${item.uom}</span>
                    </div>
                </div>
            </div>
            <div class="sq-line-item__fields" style="padding:var(--sp-4);">
                <div class="kv-grid" style="grid-template-columns:repeat(3,1fr); gap:var(--sp-4);">
                    <div class="kv-item">
                        <div class="kv-label">Item Price</div>
                        <div class="kv-value" style="font-weight:600;">${fmtCurrency(s.itemPrice)}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Lead Time</div>
                        <div class="kv-value">${s.leadTimeDays} Days</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Discount</div>
                        <div class="kv-value">${s.discountPct || 0}%</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Price Validity</div>
                        <div class="kv-value">${s.priceValidityDate || '—'}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Delivery Date</div>
                        <div class="kv-value">${s.deliveryDate || '—'}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Line Total</div>
                        <div class="kv-value" style="font-weight:600;color:var(--gray-900);">
                            ${fmtCurrency((item.quantity * s.itemPrice) * (1 - (s.discountPct || 0) / 100))}
                        </div>
                    </div>
                </div>
                ${s.notes ? `
                <div style="margin-top:var(--sp-3); padding-top:var(--sp-3); border-top:1px dashed var(--gray-200);">
                    <div class="kv-label">Notes</div>
                    <div class="kv-value" style="font-size:0.85rem; color:var(--gray-600);">${s.notes}</div>
                </div>` : ''}
            </div>
        </div>
        `;
    }).join('');

    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <button class="panel-header__close" id="vqClose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div>
                    <div class="panel-header__title">View Quote</div>
                    <div style="font-size:0.8rem;color:var(--gray-500);margin-top:2px;">Submitted for ${rfq.rfqNumber}</div>
                </div>
            </div>
            <div class="badge ${rfq.status === 'Selected' ? 'badge--sp-selected' : 'badge--sp-submitted'}">
                ${rfq.status === 'Selected' ? 'Quote Selected' : 'Quote Submitted'}
            </div>
        </div>

        <div class="panel-body">
            <!-- RFQ Summary Banner -->
            <div class="sq-rfq-banner" style="background:var(--purple-50); border:1px solid var(--purple-100);">
                <div class="sq-rfq-banner__grid">
                    <div class="kv-item">
                        <div class="kv-label">RFQ No.</div>
                        <div class="kv-value" style="color:var(--purple-700); font-weight:600;">${rfq.rfqNumber}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Created On</div>
                        <div class="kv-value">${rfq.issueDate}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Status</div>
                        <div class="kv-value">
                            <span class="badge ${rfq.status === 'Selected' ? 'badge--sp-selected' : 'badge--sp-submitted'}">
                                ${rfq.status === 'Selected' ? 'Selected' : 'Submitted'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Line Items -->
            <div style="margin-top:var(--sp-5);">
                <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);margin-bottom:var(--sp-4);">
                    Quoted Line Items
                    <span style="margin-left:var(--sp-2);font-size:0.75rem;font-weight:500;background:var(--gray-100);color:var(--gray-600);padding:2px 8px;border-radius:var(--radius-full);">${rfq.lineItems.length}</span>
                </div>
                <div class="sq-line-items-list">
                    ${lineItemsHtml}
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:var(--sp-5); margin-top:var(--sp-5);">
                <!-- Other Details -->
                <div class="card" style="padding:var(--sp-5); height:fit-content;">
                    <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);margin-bottom:var(--sp-4);">Additional Information</div>
                    <div class="kv-item" style="margin-bottom:var(--sp-4);">
                        <div class="kv-label">Terms & Conditions</div>
                        <div class="kv-value" style="font-size:0.85rem; line-height:1.6; white-space:pre-line; color:var(--gray-700);">${quote.termsAndConditions || '—'}</div>
                    </div>
                </div>

                <!-- Totals -->
                <div class="sq-totals-card" style="margin-top:0;">
                    <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);margin-bottom:var(--sp-4);">Quote Summary</div>
                    <div class="sq-waterfall">
                        <div class="sq-waterfall__row">
                            <span class="sq-waterfall__label">Gross Amount</span>
                            <span class="sq-waterfall__value">${fmtCurrency(totals.grossAmount)}</span>
                        </div>
                        <div class="sq-waterfall__row">
                            <span class="sq-waterfall__label">Total Discount</span>
                            <span class="sq-waterfall__value" style="color:var(--green-600);font-weight:600;">- ${fmtCurrency(totals.totalDiscount)}</span>
                        </div>
                        <div class="sq-waterfall__divider"></div>
                        <div class="sq-waterfall__row">
                            <span class="sq-waterfall__label">Net Subtotal</span>
                            <span class="sq-waterfall__value">${fmtCurrency(totals.netSubtotal)}</span>
                        </div>
                        <div class="sq-waterfall__row">
                            <span class="sq-waterfall__label">Shipping Cost</span>
                            <span class="sq-waterfall__value">${fmtCurrency(totals.shipping)}</span>
                        </div>
                        <div class="sq-waterfall__row">
                            <span class="sq-waterfall__label">Tax (${quote.taxPct}%)</span>
                            <span class="sq-waterfall__value">${fmtCurrency(totals.taxAmount)}</span>
                        </div>
                        <div class="sq-waterfall__divider"></div>
                        <div class="sq-waterfall__row sq-waterfall__row--total">
                            <span class="sq-waterfall__label--total">Grand Total</span>
                            <span class="sq-waterfall__value--total">${fmtCurrency(totals.grandTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-footer">
            <div class="panel-footer__left">
                <button class="btn btn--outline" id="vqBack">Close</button>
            </div>
            <div class="panel-footer__right">
                <button class="btn btn--primary" id="vqPrint" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print Quote
                </button>
            </div>
        </div>
    `);

    document.getElementById('vqClose')?.addEventListener('click', closePanel);
    document.getElementById('vqBack')?.addEventListener('click', closePanel);
}
