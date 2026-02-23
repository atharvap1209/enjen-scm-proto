// Supplier Portal — RFQ Listing Page
import { SUPPLIER_RFQS } from '../data/mock-data.js';
import { renderSupplierRFQDetail } from '../panels/supplier-rfq-detail.js';

let searchTerm = '';
let statusFilter = 'All';
let rowsPerPage = 10;
let currentPage = 1;
let container = null;
let colToggleOpen = false;

const ALL_COLUMNS = [
    { key: 'rfqNumber', label: 'RFQ Number', visible: true },
    { key: 'issueDate', label: 'Issue Date', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: true },
    { key: 'approxValue', label: 'Approx Value', visible: true },
    { key: 'specialInstructions', label: 'Special Instructions', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'paymentTerms', label: 'Payment Terms', visible: true },
];
let columns = ALL_COLUMNS.map(c => ({ ...c }));

export function renderSupplierPortal(root) {
    container = root;
    draw();
}

function getFiltered() {
    let data = [...SUPPLIER_RFQS];
    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        data = data.filter(r =>
            r.rfqNumber.toLowerCase().includes(q) ||
            r.specialInstructions.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q)
        );
    }
    return data;
}

function statusBadge(status) {
    const map = {
        'Open': 'badge--sp-open',
        'Quote Submitted': 'badge--sp-submitted',
        'Selected': 'badge--sp-selected',
        'Closed': 'badge--sp-closed',
        'Expired': 'badge--sp-expired',
    };
    return `<span class="badge ${map[status] || 'badge--draft'}">${status}</span>`;
}

function fmtCurrency(val) {
    if (val == null) return '—';
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
}

function renderCell(rfq, key) {
    switch (key) {
        case 'rfqNumber': return `<td class="link-cell">${rfq.rfqNumber}</td>`;
        case 'status': return `<td>${statusBadge(rfq.status)}</td>`;
        case 'approxValue': return `<td style="font-weight:500;">${fmtCurrency(rfq.approxValue)}</td>`;
        case 'specialInstructions': return `<td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--gray-600);">${rfq.specialInstructions || '—'}</td>`;
        default: return `<td>${rfq[key] || '—'}</td>`;
    }
}

function draw() {
    const data = getFiltered();
    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageData = data.slice(startIdx, startIdx + rowsPerPage);
    const visibleCols = columns.filter(c => c.visible);
    const filterIcon = '<svg class="filter-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">RFQs Received</h1>
            <div class="page-actions">
                <div class="search-bar" style="min-width:320px; margin-bottom:0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search RFQs..." id="spSearch" value="${searchTerm}" />
                </div>
                <div class="col-toggle" id="spColToggleWrap">
                    <button class="btn btn--outline" id="spColToggleBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                        Columns
                    </button>
                    <div class="col-toggle__popover" id="spColTogglePopover">
                        <h4>Show Columns</h4>
                        ${columns.map((c, i) => `
                            <label class="col-toggle__item">
                                <input type="checkbox" class="checkbox-input" data-col-idx="${i}" ${c.visible ? 'checked' : ''} />
                                ${c.label}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table" id="spTable">
                <thead>
                    <tr>${visibleCols.map(c => `<th><span class="th-content">${c.label} ${filterIcon}</span></th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${pageData.length ? pageData.map(rfq => `
                        <tr data-id="${rfq.rfqNumber}" class="sp-rfq-row">
                            ${visibleCols.map(c => renderCell(rfq, c.key)).join('')}
                        </tr>
                    `).join('') : `<tr><td colspan="${visibleCols.length}" style="text-align:center;padding:2.5rem;color:var(--gray-400);">No RFQs found.</td></tr>`}
                </tbody>
            </table>
            <div class="pagination">
                <div class="pagination__left">
                    Rows per page:
                    <select id="spRowsPerPage">
                        <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
                        <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option>
                        <option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50</option>
                    </select>
                    Showing ${data.length > 0 ? startIdx + 1 : 0}–${Math.min(startIdx + rowsPerPage, data.length)} of ${data.length}
                </div>
                <div class="pagination__right">
                    <button class="pagination__btn" id="spPrevPage" ${currentPage <= 1 ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    ${Array.from({ length: totalPages }, (_, i) => `
                        <button class="pagination__btn ${currentPage === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
                    `).join('')}
                    <button class="pagination__btn" id="spNextPage" ${currentPage >= totalPages ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Events
    container.querySelector('#spSearch').addEventListener('input', e => {
        searchTerm = e.target.value; currentPage = 1; draw();
    });

    container.querySelectorAll('.sp-rfq-row').forEach(row => {
        row.addEventListener('click', () => {
            const rfq = SUPPLIER_RFQS.find(r => r.rfqNumber === row.dataset.id);
            if (rfq) renderSupplierRFQDetail(rfq, () => draw());
        });
    });

    const colToggleBtn = container.querySelector('#spColToggleBtn');
    const colPopover = container.querySelector('#spColTogglePopover');
    colToggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        colPopover.classList.toggle('open');
    });

    document.addEventListener('click', () => colPopover.classList.remove('open'), { once: true });

    container.querySelectorAll('[data-col-idx]').forEach(cb => {
        cb.addEventListener('change', e => {
            e.stopPropagation();
            columns[parseInt(cb.dataset.colIdx)].visible = cb.checked;
            draw();
        });
    });

    container.querySelector('#spRowsPerPage').addEventListener('change', e => {
        rowsPerPage = parseInt(e.target.value); currentPage = 1; draw();
    });

    container.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            draw();
        });
    });

    container.querySelector('#spPrevPage')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; draw(); } });
    container.querySelector('#spNextPage')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; draw(); } });
}
