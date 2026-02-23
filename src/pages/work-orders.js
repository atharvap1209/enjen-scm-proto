// Work Order Listing Page
// PRD columns: WO number, status, priority, customer name, coil utilization%, leftover%, start date, due date
import { WORK_ORDERS } from '../data/mock-data.js';
import { openPanel } from '../main.js';
import { renderWOCreate } from '../panels/wo-create.js';
import { renderWODetails } from '../panels/wo-details.js';

const ALL_COLUMNS = [
  { key: 'id', label: 'WO Number', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'priority', label: 'Priority', visible: true },
  { key: 'customers', label: 'Customer', visible: true },
  { key: 'operationType', label: 'Operation Type', visible: true },
  { key: 'coilUtilization', label: 'Coil Utilization %', visible: true },
  { key: 'leftoverPct', label: 'Leftover %', visible: true },
  { key: 'startDate', label: 'Start Date', visible: true },
  { key: 'dueDate', label: 'Due Date', visible: true },
];

let columns = ALL_COLUMNS.map(c => ({ ...c }));
let searchTerm = '';
let rowsPerPage = 10;
let currentPage = 1;
let colToggleOpen = false;
let container = null;

export function renderWorkOrders(root) {
  container = root;
  draw();
}

function getFilteredData() {
  if (!searchTerm) return [...WORK_ORDERS];
  const q = searchTerm.toLowerCase();
  return WORK_ORDERS.filter(wo =>
    wo.id.toLowerCase().includes(q) ||
    (wo.customers || []).join(', ').toLowerCase().includes(q) ||
    wo.operationType.toLowerCase().includes(q) ||
    wo.status.toLowerCase().includes(q)
  );
}

function getBadgeClass(status) {
  const map = {
    'Pending': 'badge--pending', 'Completed': 'badge--completed',
    'On Hold': 'badge--on-hold', 'In Progress': 'badge--in-progress',
    'Delayed': 'badge--delayed', 'Draft': 'badge--draft',
  };
  return map[status] || 'badge--draft';
}

function getPriorityDot(priority) {
  const cls = { 'High': 'priority__dot--high', 'Medium': 'priority__dot--medium', 'Low': 'priority__dot--low' }[priority] || '';
  return `<span class="priority"><span class="priority__dot ${cls}"></span>${priority}</span>`;
}

function renderCell(wo, key) {
  switch (key) {
    case 'id': return `<td class="link-cell">${wo.id}</td>`;
    case 'status': return `<td><span class="badge ${getBadgeClass(wo.status)}">${wo.status}</span></td>`;
    case 'priority': return `<td>${getPriorityDot(wo.priority)}</td>`;
    case 'customers': return `<td>${(wo.customers || []).join(', ')}</td>`;
    case 'coilUtilization': return `<td>${wo.coilUtilization}%</td>`;
    case 'leftoverPct': return `<td class="${wo.leftoverPct > 15 ? 'red-text' : ''}">${wo.leftoverPct}%</td>`;
    default: return `<td>${wo[key] || '—'}</td>`;
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
      <h1 class="page-title">Work Order</h1>
      <div class="page-actions">
        <div class="search-bar" style="min-width:320px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search work orders..." id="woSearch" value="${searchTerm}" />
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
        <button class="btn btn--primary" id="createWOBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Work Order
        </button>
      </div>
    </div>

    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>${visibleCols.map(c => `<th><span class="th-content">${c.label} ${filterIcon}</span></th>`).join('')}</tr>
        </thead>
        <tbody>
          ${pageData.map(wo => `
            <tr data-wo-id="${wo.id}">${visibleCols.map(c => renderCell(wo, c.key)).join('')}</tr>
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
  container.querySelector('#woSearch').addEventListener('input', e => { searchTerm = e.target.value; currentPage = 1; draw(); });

  const colToggleBtn = container.querySelector('#colToggleBtn');
  const colPopover = container.querySelector('#colPopover');
  colToggleBtn.addEventListener('click', e => { e.stopPropagation(); colPopover.classList.toggle('open'); });
  document.addEventListener('click', () => colPopover.classList.remove('open'), { once: true });

  container.querySelectorAll('[data-col-idx]').forEach(cb => {
    cb.addEventListener('change', e => { e.stopPropagation(); columns[parseInt(cb.dataset.colIdx)].visible = cb.checked; draw(); });
  });

  container.querySelector('#createWOBtn').addEventListener('click', () => renderWOCreate());

  container.querySelectorAll('[data-wo-id]').forEach(row => {
    row.addEventListener('click', () => {
      const wo = WORK_ORDERS.find(w => w.id === row.dataset.woId);
      if (wo) renderWODetails(wo);
    });
  });

  container.querySelector('#rowsPerPageSelect').addEventListener('change', e => { rowsPerPage = parseInt(e.target.value); currentPage = 1; draw(); });
  container.querySelectorAll('[data-page]').forEach(btn => { btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); draw(); }); });
  container.querySelector('#prevPage')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; draw(); } });
  container.querySelector('#nextPage')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; draw(); } });
}
