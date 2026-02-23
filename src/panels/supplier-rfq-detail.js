// Supplier Portal — RFQ Detail Side Panel
import { openPanel, closePanel } from '../main.js';
import { renderSubmitQuote } from './supplier-submit-quote.js';

export function renderSupplierRFQDetail(rfq, onRefresh) {
    const statusBadge = (status) => {
        const map = {
            'Open': 'badge--sp-open',
            'Quote Submitted': 'badge--sp-submitted',
            'Closed': 'badge--sp-closed',
            'Expired': 'badge--sp-expired',
        };
        return `<span class="badge ${map[status] || 'badge--draft'}">${status}</span>`;
    };

    const fmtCurrency = (val) => val != null ? '₹' + new Intl.NumberFormat('en-IN').format(val) : '—';

    const lineItemsHtml = rfq.lineItems.map((item, i) => `
        <tr>
            <td style="font-weight:500;color:var(--purple-700);">${item.itemCode}</td>
            <td>${item.description}</td>
            <td style="font-weight:500;">${item.quantity}</td>
            <td>${item.uom}</td>
            <td>
                ${item.attachments && item.attachments.length > 0
            ? item.attachments.map(a => `
                        <a href="#" class="sp-attachment-link" style="display:inline-flex;align-items:center;gap:4px;font-size:0.8rem;color:var(--purple-700);text-decoration:none;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                            ${a}
                        </a>`).join(' ')
            : '<span style="color:var(--gray-400);font-size:0.8rem;">—</span>'
        }
            </td>
        </tr>
    `).join('');

    openPanel(`
        <div class="panel-header">
            <div class="panel-header__left">
                <button class="panel-header__close" id="spDetailClose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div>
                    <div class="panel-header__title">${rfq.rfqNumber}</div>
                    <div style="font-size:0.8rem;color:var(--gray-500);margin-top:2px;">Request for Quotation</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:var(--sp-3);">
                ${statusBadge(rfq.status)}
            </div>
        </div>

        <div class="panel-body">
            <!-- RFQ Summary -->
            <div class="card" style="border:none;background:var(--purple-50);border-radius:var(--radius-lg);padding:var(--sp-5);">
                <div class="kv-grid" style="grid-template-columns:repeat(3,1fr);">
                    <div class="kv-item">
                        <div class="kv-label">RFQ Number</div>
                        <div class="kv-value" style="color:var(--purple-700);font-weight:600;">${rfq.rfqNumber}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Created On</div>
                        <div class="kv-value">${rfq.issueDate}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Due Date</div>
                        <div class="kv-value" style="${rfq.status === 'Open' ? 'color:var(--orange-600);font-weight:600;' : ''}">${rfq.dueDate}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Approx Value</div>
                        <div class="kv-value">${fmtCurrency(rfq.approxValue)}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Payment Terms</div>
                        <div class="kv-value">${rfq.paymentTerms || '—'}</div>
                    </div>
                    <div class="kv-item">
                        <div class="kv-label">Status</div>
                        <div class="kv-value">${statusBadge(rfq.status)}</div>
                    </div>
                </div>
                ${rfq.specialInstructions ? `
                <div style="margin-top:var(--sp-4);padding-top:var(--sp-4);border-top:1px solid var(--purple-200);">
                    <div class="kv-label">Special Instructions</div>
                    <div class="kv-value" style="margin-top:4px;line-height:1.6;color:var(--gray-700);">${rfq.specialInstructions}</div>
                </div>` : ''}
            </div>

            <!-- Line Items -->
            <div>
                <div style="font-size:0.95rem;font-weight:600;color:var(--gray-800);margin-bottom:var(--sp-3);">
                    Line Items
                    <span style="margin-left:var(--sp-2);font-size:0.75rem;font-weight:500;background:var(--gray-100);color:var(--gray-600);padding:2px 8px;border-radius:var(--radius-full);">${rfq.lineItems.length}</span>
                </div>
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th><span class="th-content">Item Code</span></th>
                                <th><span class="th-content">Description</span></th>
                                <th><span class="th-content">Qty</span></th>
                                <th><span class="th-content">UoM</span></th>
                                <th><span class="th-content">Attachments</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lineItemsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="panel-footer">
            <div class="panel-footer__left">
                <button class="btn btn--ghost" id="spDetailClose2">Close</button>
            </div>
            <div class="panel-footer__right">
                ${rfq.status === 'Open' ? `
                    <button class="btn btn--primary" id="submitQuoteBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
                        Submit Quote
                    </button>
                ` : rfq.status === 'Quote Submitted' ? `
                    <button class="btn btn--outline" disabled style="opacity:0.7;cursor:not-allowed;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                        Quote Already Submitted
                    </button>
                ` : ''}
            </div>
        </div>
    `);

    document.getElementById('spDetailClose')?.addEventListener('click', () => { closePanel(); });
    document.getElementById('spDetailClose2')?.addEventListener('click', () => { closePanel(); });

    document.getElementById('submitQuoteBtn')?.addEventListener('click', () => {
        renderSubmitQuote(rfq, onRefresh);
    });

    // Attachment links — prevent default and show toast placeholder
    document.querySelectorAll('.sp-attachment-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            import('../main.js').then(m => m.showToast('Attachment', 'Downloading attachment…', 'success'));
        });
    });
}
