// Production Process Listing Page
import { PRODUCTION_STAGES } from '../data/mock-data.js';
import { openPanel } from '../main.js';
import { renderStageDetails } from '../panels/pp-stage-details.js';

// PRD columns: WO Number, Stage Name, Operation Type, Customer Name, Machine, Line, Status, Priority
const ALL_COLUMNS = [
  { key: 'woNumber', label: 'Work Order No.', visible: true },
  { key: 'stageName', label: 'Stage Name', visible: true },
  { key: 'operationType', label: 'Operation Type', visible: true },
  { key: 'customer', label: 'Customer Name', visible: true },
  { key: 'machine', label: 'Machine', visible: true },
  { key: 'line', label: 'Line', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'priority', label: 'Priority', visible: true },
];

let columns = ALL_COLUMNS.map(c => ({ ...c }));
let searchTerm = '';
let rowsPerPage = 10;
let currentPage = 1;
let colToggleOpen = false;
let container = null;

export function renderProductionProcess(root) {
  container = root;
  draw();
}

function getFilteredData() {
  if (!searchTerm) return [...PRODUCTION_STAGES];
  const q = searchTerm.toLowerCase();
  return PRODUCTION_STAGES.filter(s =>
    s.woNumber.toLowerCase().includes(q) ||
    s.stageName.toLowerCase().includes(q) ||
    s.operationType.toLowerCase().includes(q) ||
    s.status.toLowerCase().includes(q) ||
    (s.customer || '').toLowerCase().includes(q)
  );
}

function getBadgeClass(status) {
  const map = {
    'Pending': 'badge--pending', 'Completed': 'badge--completed',
    'On Hold': 'badge--on-hold', 'In Progress': 'badge--in-progress',
    'Delayed': 'badge--delayed', 'Not Started': 'badge--not-started',
  };
  return map[status] || 'badge--draft';
}

function getPriorityDot(priority) {
  const cls = { 'High': 'priority__dot--high', 'Medium': 'priority__dot--medium', 'Low': 'priority__dot--low' }[priority] || '';
  return `<span class="priority"><span class="priority__dot ${cls}"></span> ${priority}</span>`;
}

function draw() {
  const data = getFilteredData();
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageData = data.slice(startIdx, startIdx + rowsPerPage);
  const visibleCols = columns.filter(c => c.visible);
  const filterIcon = '<svg class="filter-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Production Process</h1>
      <div class="page-actions">
        <div class="search-bar" style="min-width:320px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search ..." id="ppSearch" value="${searchTerm}" />
        </div>
        <div class="col-toggle">
          <button class="btn btn--outline" id="ppColToggleBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
            Columns
          </button>
          <div class="col-toggle__popover ${colToggleOpen ? 'open' : ''}" id="ppColPopover">
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
          ${pageData.map(stage => `
            <tr data-stage-id="${stage.id}">
              ${visibleCols.map(c => {
    if (c.key === 'woNumber') return `<td class="link-cell">${stage.woNumber}</td>`;
    if (c.key === 'status') return `<td><span class="badge ${getBadgeClass(stage.status)}">${stage.status}</span></td>`;
    if (c.key === 'priority') return `<td>${getPriorityDot(stage.priority)}</td>`;
    return `<td>${stage[c.key] || '—'}</td>`;
  }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pagination">
        <div class="pagination__left">
          Rows per page:
          <select id="ppRowsPerPage">
            <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
            <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option>
          </select>
          Showing ${startIdx + 1} to ${Math.min(startIdx + rowsPerPage, data.length)} of ${data.length} results
        </div>
        <div class="pagination__right">
          <button class="pagination__btn" id="ppPrevPage" ${currentPage <= 1 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          ${Array.from({ length: totalPages }, (_, i) => `
            <button class="pagination__btn ${currentPage === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
          `).join('')}
          <button class="pagination__btn" id="ppNextPage" ${currentPage >= totalPages ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Bindings
  container.querySelector('#ppSearch').addEventListener('input', e => { searchTerm = e.target.value; currentPage = 1; draw(); });
  container.querySelector('#ppColToggleBtn').addEventListener('click', e => {
    e.stopPropagation();
    colToggleOpen = !colToggleOpen;
    container.querySelector('#ppColPopover').classList.toggle('open', colToggleOpen);
  });
  container.querySelectorAll('[data-col-idx]').forEach(cb => {
    cb.addEventListener('change', e => {
      e.stopPropagation();
      columns[parseInt(cb.dataset.colIdx)].visible = cb.checked;
      draw();
    });
  });
  document.addEventListener('click', () => { colToggleOpen = false; const p = container?.querySelector('#ppColPopover'); if (p) p.classList.remove('open'); }, { once: true });

  container.querySelectorAll('[data-stage-id]').forEach(row => {
    row.addEventListener('click', () => {
      const stage = PRODUCTION_STAGES.find(s => s.id === row.dataset.stageId);
      if (stage) renderStageDetails(stage);
    });
  });

  container.querySelector('#ppRowsPerPage').addEventListener('change', e => { rowsPerPage = parseInt(e.target.value); currentPage = 1; draw(); });
  container.querySelectorAll('[data-page]').forEach(btn => { btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); draw(); }); });
  container.querySelector('#ppPrevPage')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; draw(); } });
  container.querySelector('#ppNextPage')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; draw(); } });
}
