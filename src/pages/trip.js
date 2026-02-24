// Trip List Page
import { TRIPS } from '../data/mock-data.js';
import { renderTripDetail } from '../panels/trip-detail.js';

let searchTerm = '';
let rowsPerPage = 10;
let currentPage = 1;
let container = null;

const ALL_COLUMNS = [
    { key: 'id', label: 'Trip No.', visible: true },
    { key: 'vehiclePlate', label: 'Vehicle', visible: true },
    { key: 'driverName', label: 'Driver', visible: true },
    { key: 'invoiceRef', label: 'Invoice Reference', visible: true },
    { key: 'startTime', label: 'Start time', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'createdDate', label: 'Created Date', visible: true },
];
let columns = ALL_COLUMNS.map(c => ({ ...c }));

export function renderTrip(root) {
    container = root;
    draw();
}

function getFiltered() {
    let data = [...TRIPS];
    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        data = data.filter(t =>
            t.id.toLowerCase().includes(q) ||
            t.vehiclePlate.toLowerCase().includes(q) ||
            t.driverName.toLowerCase().includes(q) ||
            t.invoiceRef.toLowerCase().includes(q) ||
            t.customer.toLowerCase().includes(q)
        );
    }
    return data;
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

function renderCell(trip, key) {
    switch (key) {
        case 'id': return `<td class="link-cell">${trip.id}</td>`;
        case 'status': return `<td>${statusBadge(trip.status)}</td>`;
        default: return `<td>${trip[key] || '—'}</td>`;
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
            <h1 class="page-title">Trip</h1>
            <div class="page-actions">
                <div class="search-bar" style="min-width:320px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" placeholder="Search trips..." id="trSearch" value="${searchTerm}" />
                </div>
                <button class="btn btn--outline" id="exportBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Export
                </button>
                <div class="col-toggle" id="colToggleWrapper">
                    <button class="btn btn--outline" id="colToggleBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                        Columns
                    </button>
                    <div class="col-toggle__popover" id="colPopover">
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
            <table class="data-table">
                <thead>
                    <tr>${visibleCols.map(c => `<th><span class="th-content">${c.label} ${filterIcon}</span></th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${pageData.length ? pageData.map(tr => `
                        <tr data-tr-id="${tr.id}">
                            ${visibleCols.map(c => renderCell(tr, c.key)).join('')}
                        </tr>
                    `).join('') : `<tr><td colspan="${visibleCols.length}" style="text-align:center;padding:2.5rem;color:var(--gray-400);">No trips found.</td></tr>`}
                </tbody>
            </table>
            <div class="pagination">
                <div class="pagination__left">
                    Rows per page:
                    <select id="rowsPerPageSelect">
                        <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
                        <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option>
                        <option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50</option>
                    </select>
                    Showing ${data.length > 0 ? startIdx + 1 : 0}–${Math.min(startIdx + rowsPerPage, data.length)} of ${data.length}
                </div>
                <div class="pagination__right">
                    <button class="pagination__btn" id="prevPage" ${currentPage <= 1 ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    ${Array.from({ length: totalPages }, (_, i) => `
                        <button class="pagination__btn ${currentPage === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
                    `).join('')}
                    <button class="pagination__btn" id="nextPage" ${currentPage >= totalPages ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Events
    container.querySelector('#trSearch').addEventListener('input', e => { searchTerm = e.target.value; currentPage = 1; draw(); });

    const colToggleBtn = container.querySelector('#colToggleBtn');
    const colPopover = container.querySelector('#colPopover');
    colToggleBtn.addEventListener('click', e => { e.stopPropagation(); colPopover.classList.toggle('open'); });
    document.addEventListener('click', () => colPopover.classList.remove('open'), { once: true });

    container.querySelectorAll('[data-col-idx]').forEach(cb => {
        cb.addEventListener('change', e => { e.stopPropagation(); columns[parseInt(cb.dataset.colIdx)].visible = cb.checked; draw(); });
    });

    container.querySelectorAll('[data-tr-id]').forEach(row => {
        row.addEventListener('click', () => {
            const trip = TRIPS.find(t => t.id === row.dataset.trId);
            if (trip) renderTripDetail(trip, () => draw());
        });
    });

    container.querySelector('#rowsPerPageSelect').addEventListener('change', e => { rowsPerPage = parseInt(e.target.value); currentPage = 1; draw(); });
    container.querySelectorAll('[data-page]').forEach(btn => { btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); draw(); }); });
    container.querySelector('#prevPage')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; draw(); } });
    container.querySelector('#nextPage')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; draw(); } });
}
