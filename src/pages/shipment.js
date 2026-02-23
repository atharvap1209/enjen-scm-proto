// Shipment List Page
import { SHIPMENTS } from '../data/mock-data.js';
import { openPanel, showToast } from '../main.js';
import { renderShipmentCreate } from '../panels/shipment-create.js';
import { renderShipmentDetail } from '../panels/shipment-detail.js';

let searchTerm = '';
let statusFilter = 'All';
let rowsPerPage = 10;
let currentPage = 1;
let container = null;
let colToggleOpen = false;

const ALL_COLUMNS = [
    { key: 'id', label: 'Shipment No.', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'customer', label: 'Customer', visible: true },
    { key: 'destination', label: 'Destination', visible: true },
    { key: 'transportMode', label: 'Transport', visible: true },
    { key: 'netWeightKg', label: 'Net Weight', visible: true },
    { key: 'date', label: 'Date', visible: true },
];
let columns = ALL_COLUMNS.map(c => ({ ...c }));

export function renderShipment(root) {
    container = root;
    draw();
}

function getFiltered() {
    let data = [...SHIPMENTS];
    if (statusFilter !== 'All') data = data.filter(s => s.status === statusFilter);
    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        data = data.filter(s =>
            s.id.toLowerCase().includes(q) ||
            s.customer.toLowerCase().includes(q) ||
            s.destination.toLowerCase().includes(q)
        );
    }
    return data;
}

function statusBadge(status) {
    const map = {
        'Draft': 'badge--sh-draft',
        'Ready to Ship': 'badge--sh-ready',
        'In Transit': 'badge--sh-in-transit',
        'Delivered': 'badge--sh-delivered',
        'Cancelled': 'badge--sh-cancelled',
    };
    return `<span class="badge ${map[status] || 'badge--sh-draft'}">${status}</span>`;
}

function formatKg(kg) {
    if (kg == null) return '—';
    return new Intl.NumberFormat('en-IN').format(kg) + ' kg';
}

function renderCell(sh, key) {
    switch (key) {
        case 'id': return `<td class="link-cell sh-id-cell">${sh.id}</td>`;
        case 'status': return `<td>${statusBadge(sh.status)}</td>`;
        case 'netWeightKg': return `<td style="font-weight:500;">${formatKg(sh.netWeightKg)}</td>`;
        case 'transportMode': return `<td style="color:var(--gray-600);">${sh.transportMode || '—'}</td>`;
        default: return `<td>${sh[key] || '—'}</td>`;
    }
}

function draw() {
    const data = getFiltered();
    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageData = data.slice(startIdx, startIdx + rowsPerPage);
    const visibleCols = columns.filter(c => c.visible);

    const statusTabs = ['All', 'Draft', 'Ready to Ship', 'In Transit', 'Delivered', 'Cancelled'];
    const tabsHtml = statusTabs.map(s => {
        const count = s === 'All' ? SHIPMENTS.length : SHIPMENTS.filter(sh => sh.status === s).length;
        return `<button class="sh-tab ${statusFilter === s ? 'sh-tab--active' : ''}" data-status="${s}">
            ${s} <span class="sh-tab__count">${count}</span>
        </button>`;
    }).join('');

    const colToggleItems = columns.map(c => `
        <label class="col-toggle__item">
            <input type="checkbox" ${c.visible ? 'checked' : ''} data-col="${c.key}" />
            ${c.label}
        </label>
    `).join('');

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Shipments</h1>
            <div class="page-actions">
                <div class="search-bar" style="min-width:260px; margin-bottom:0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search shipments..." id="shSearch" value="${searchTerm}" />
                </div>
                <div class="col-toggle" id="colToggleWrap">
                    <button class="btn btn--ghost" id="colToggleBtn" style="border:1px solid var(--gray-300);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v3H3z"/><path d="M3 10.5h18v3H3z"/><path d="M3 18h18v3H3z"/></svg>
                        Columns
                    </button>
                    <div class="col-toggle__popover ${colToggleOpen ? 'open' : ''}" id="colTogglePopover">
                        <h4>Show Columns</h4>
                        ${colToggleItems}
                    </div>
                </div>
                <button class="btn btn--primary" id="createShipmentBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create Shipment
                </button>
            </div>
        </div>

        <div class="sh-tabs" id="shTabs">${tabsHtml}</div>

        <div class="data-table-wrapper">
            <table class="data-table" id="shTable">
                <thead>
                    <tr>${visibleCols.map(c => `<th><span class="th-content">${c.label}</span></th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${pageData.length ? pageData.map(sh => `
                        <tr data-id="${sh.id}" class="sh-row">
                            ${visibleCols.map(c => renderCell(sh, c.key)).join('')}
                        </tr>
                    `).join('') : `<tr><td colspan="${visibleCols.length}" style="text-align:center;padding:2.5rem;color:var(--gray-400);">No shipments found.</td></tr>`}
                </tbody>
            </table>
            <div class="pagination">
                <div class="pagination__left">
                    Rows per page:
                    <select id="rowsPerPageSelect">
                        <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
                        <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option>
                    </select>
                    Showing ${data.length > 0 ? startIdx + 1 : 0}–${Math.min(startIdx + rowsPerPage, data.length)} of ${data.length}
                </div>
                <div class="pagination__right">
                    <button class="pagination__btn" id="prevPage" ${currentPage <= 1 ? 'disabled' : ''}>Prev</button>
                    <button class="pagination__btn" id="nextPage" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
                </div>
            </div>
        </div>
    `;

    // Events
    container.querySelector('#shSearch').addEventListener('input', e => {
        searchTerm = e.target.value; currentPage = 1; draw();
    });

    container.querySelector('#createShipmentBtn').addEventListener('click', () => {
        renderShipmentCreate(() => draw());
    });

    container.querySelectorAll('.sh-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            statusFilter = btn.dataset.status; currentPage = 1; draw();
        });
    });

    container.querySelectorAll('.sh-row').forEach(row => {
        row.addEventListener('click', () => {
            const sh = SHIPMENTS.find(s => s.id === row.dataset.id);
            if (sh) renderShipmentDetail(sh, () => draw());
        });
    });

    container.querySelector('#colToggleBtn').addEventListener('click', e => {
        e.stopPropagation();
        colToggleOpen = !colToggleOpen;
        container.querySelector('#colTogglePopover').classList.toggle('open', colToggleOpen);
    });

    container.querySelectorAll('#colTogglePopover input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', e => {
            const col = columns.find(c => c.key === e.target.dataset.col);
            if (col) { col.visible = e.target.checked; draw(); }
        });
    });

    document.addEventListener('click', function closeToggle(e) {
        if (!container.querySelector('#colToggleWrap')?.contains(e.target)) {
            colToggleOpen = false;
            document.removeEventListener('click', closeToggle);
        }
    });

    container.querySelector('#rowsPerPageSelect').addEventListener('change', e => {
        rowsPerPage = parseInt(e.target.value); currentPage = 1; draw();
    });
    container.querySelector('#prevPage')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; draw(); } });
    container.querySelector('#nextPage')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; draw(); } });
}
