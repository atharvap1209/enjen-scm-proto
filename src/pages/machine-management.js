import { MACHINES_DATA } from '../data/mock-data.js';
import { renderMachineDetails } from '../panels/machine-details.js';

const ALL_COLUMNS = [
    { key: 'id', label: 'Machine Code', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'modelNumber', label: 'Model Number', visible: true },
    { key: 'serialNumber', label: 'Serial Number', visible: true },
    { key: 'productionLine', label: 'Production Line', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'nextMaintenanceDate', label: 'Next Maintenance Date', visible: true },
];

let columns = ALL_COLUMNS.map(c => ({ ...c }));
let searchTerm = '';
let rowsPerPage = 10;
let currentPage = 1;
let colToggleOpen = false;
let container = null;

export function renderMachineManagement(root) {
    container = root;
    draw();
}

function getFilteredData() {
    if (!searchTerm) return [...MACHINES_DATA];
    const q = searchTerm.toLowerCase();
    return MACHINES_DATA.filter(m =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q) ||
        m.productionLine.toLowerCase().includes(q)
    );
}

function getBadgeClass(status) {
    const map = {
        'Active': 'badge--completed',
        'Under Breakdown': 'badge--delayed',
        'Under Preventive Maintenance': 'badge--pending',
        'Under Corrective Maintenance': 'badge--in-progress',
        'Inactive': 'badge--draft',
    };
    return map[status] || 'badge--draft';
}

function renderCell(machine, key) {
    switch (key) {
        case 'id': return `<td class="link-cell">${machine.id}</td>`;
        case 'status': return `<td><span class="badge ${getBadgeClass(machine.status)}">${machine.status}</span></td>`;
        default: return `<td>${machine[key] || '—'}</td>`;
    }
}

function draw() {
    const data = getFilteredData();
    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageData = data.slice(startIdx, startIdx + rowsPerPage);
    const visibleCols = columns.filter(c => c.visible);
    const filterIcon = '<svg class="filter-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';

    container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Machine Management</h1>
      <div class="page-actions">
        <div class="search-bar" style="min-width:320px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search machines..." id="machineSearch" value="${searchTerm}" />
        </div>
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
          ${pageData.map(machine => `
            <tr data-machine-id="${machine.id}">${visibleCols.map(c => renderCell(machine, c.key)).join('')}</tr>
          `).join('')}
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
          Showing ${startIdx + 1}–${Math.min(startIdx + rowsPerPage, data.length)} of ${data.length}
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
    container.querySelector('#machineSearch').addEventListener('input', e => { searchTerm = e.target.value; currentPage = 1; draw(); });

    const colToggleBtn = container.querySelector('#colToggleBtn');
    const colPopover = container.querySelector('#colPopover');
    colToggleBtn.addEventListener('click', e => { e.stopPropagation(); colPopover.classList.toggle('open'); });
    document.addEventListener('click', () => colPopover.classList.remove('open'), { once: true });

    container.querySelectorAll('[data-col-idx]').forEach(cb => {
        cb.addEventListener('change', e => { e.stopPropagation(); columns[parseInt(cb.dataset.colIdx)].visible = cb.checked; draw(); });
    });

    container.querySelectorAll('[data-machine-id]').forEach(row => {
        row.addEventListener('click', () => {
            const machine = MACHINES_DATA.find(m => m.id === row.dataset.machineId);
            if (machine) renderMachineDetails(machine);
        });
    });

    container.querySelector('#rowsPerPageSelect').addEventListener('change', e => { rowsPerPage = parseInt(e.target.value); currentPage = 1; draw(); });
    container.querySelectorAll('[data-page]').forEach(btn => { btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); draw(); }); });
    container.querySelector('#prevPage')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; draw(); } });
    container.querySelector('#nextPage')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; draw(); } });
}
