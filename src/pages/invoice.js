// Invoice Listing Page
import { INVOICES } from '../data/mock-data.js';
import { renderInvoiceCreate } from '../panels/invoice-create.js';
import { showToast } from '../main.js';

const ALL_COLUMNS = [
  { key: 'id', label: 'Invoice No.', visible: true },
  { key: 'date', label: 'Invoice Date', visible: true },
  { key: 'dueDate', label: 'Due Date', visible: true },
  { key: 'orderNo', label: 'Order No.', visible: true },
  { key: 'customer', label: 'Customer Name', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'value', label: 'Total Value', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
];

let columns = ALL_COLUMNS.map(c => ({ ...c }));
let searchTerm = '';
let rowsPerPage = 10;
let currentPage = 1;

// Creating a mutable copy to handle state toggles in prototype
let localInvoices = [...INVOICES];
let container = null;

export function renderInvoice(root) {
  container = root;
  draw();
}

function getFilteredData() {
  if (!searchTerm) return [...localInvoices];
  const q = searchTerm.toLowerCase();
  return localInvoices.filter(inv =>
    inv.id.toLowerCase().includes(q) ||
    inv.customer.toLowerCase().includes(q) ||
    inv.orderNo.toLowerCase().includes(q) ||
    inv.status.toLowerCase().includes(q)
  );
}

function getBadgeClass(status) {
  const map = {
    'Paid': 'badge--completed',
    'Issued': 'badge--in-progress',
    'Draft': 'badge--draft',
  };
  return map[status] || 'badge--draft';
}

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

function renderCell(inv, key) {
  switch (key) {
    case 'id': return `<td class="link-cell" style="font-weight:600; color:var(--purple-700);">${inv.id}</td>`;
    case 'status': return `<td><span class="badge ${getBadgeClass(inv.status)}">${inv.status}</span></td>`;
    case 'value': return `<td style="font-weight:600;">${formatCurrency(inv.value)}</td>`;
    case 'dueDate': return `<td style="color:var(--gray-600);">${inv.dueDate || '—'}</td>`;
    case 'actions':
      if (inv.status === 'Issued') {
        return `<td style="padding: 8px;"><button class="btn btn--small btn--outline mark-paid-btn" data-id="${inv.id}">Mark as Paid</button></td>`;
      }
      if (inv.status === 'Draft') {
        return `<td style="padding: 8px;"><button class="btn btn--small btn--primary issue-now-btn" data-id="${inv.id}">Issue Now</button></td>`;
      }
      return `<td style="padding: 8px;"><button class="btn btn--small btn--ghost view-pdf-btn" data-id="${inv.id}">View PDF</button></td>`;
    default: return `<td>${inv[key] || '—'}</td>`;
  }
}

function draw() {
  const data = getFilteredData();
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  currentPage = Math.min(currentPage, totalPages);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageData = data.slice(startIdx, startIdx + rowsPerPage);
  const visibleCols = columns.filter(c => c.visible);

  // Re-used SVG
  const filterIcon = '<svg class="filter-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Invoices</h1>
      <div class="page-actions">
        <div class="search-bar" style="min-width:320px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search invoices..." id="invSearch" value="${searchTerm}" />
        </div>
        
        <button class="btn btn--primary" id="createInvoiceBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Invoice
        </button>
      </div>
    </div>

    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>${visibleCols.map(c => `<th><span class="th-content">${c.label} ${filterIcon}</span></th>`).join('')}</tr>
        </thead>
        <tbody>
          ${pageData.length > 0 ? pageData.map(inv => `
            <tr>${visibleCols.map(c => renderCell(inv, c.key)).join('')}</tr>
          `).join('') : `<tr><td colspan="${visibleCols.length}" style="text-align:center; padding: 2rem;">No invoices found.</td></tr>`}
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
  container.querySelector('#invSearch').addEventListener('input', e => {
    searchTerm = e.target.value;
    currentPage = 1;
    draw();
  });

  container.querySelector('#createInvoiceBtn').addEventListener('click', () => {
    // Mock opening the wizard
    renderInvoiceCreate();
  });

  // Issue Now (Draft → Issued)
  container.querySelectorAll('.issue-now-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const idx = localInvoices.findIndex(i => i.id === id);
      if (idx > -1) { localInvoices[idx].status = 'Issued'; showToast('Invoice Issued', `${id} has been issued.`, 'success'); draw(); }
    });
  });

  // Mark as Paid (Issued → Paid)
  container.querySelectorAll('.mark-paid-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const invIndex = localInvoices.findIndex(i => i.id === id);
      if (invIndex > -1) { localInvoices[invIndex].status = 'Paid'; showToast('Invoice Paid', `${id} has been marked as paid.`, 'success'); draw(); }
    });
  });

  // View PDF (Paid)
  container.querySelectorAll('.view-pdf-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('PDF Export', 'PDF generation coming soon', 'success'));
  });

  container.querySelector('#rowsPerPageSelect').addEventListener('change', e => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    draw();
  });

  container.querySelector('#prevPage')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; draw(); }
  });

  container.querySelector('#nextPage')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; draw(); }
  });
}
