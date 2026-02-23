// Main Entry — Router, Navigation, Global Utilities
import { renderWorkOrders } from './pages/work-orders.js';
import { renderProductionProcess } from './pages/production-process.js';
import { renderInvoice } from './pages/invoice.js';
import { renderShipment } from './pages/shipment.js';
import { renderSupplierPortal } from './pages/supplier-portal.js';

// ─── Navigation ───
const sidebar = document.getElementById('sidebar');
const navDrawer = document.getElementById('navDrawer');
const navDrawerBackdrop = document.getElementById('navDrawerBackdrop');
const navDrawerClose = document.getElementById('navDrawerClose');
const mainContent = document.getElementById('mainContent');

// Toggle nav drawer on Manufacturing icon click
document.getElementById('navManufacturing').addEventListener('click', () => {
    navDrawer.classList.add('open');
    navDrawerBackdrop.classList.add('open');
});

// Toggle nav drawer on Supplier Portal icon click
document.getElementById('navSupplierPortal').addEventListener('click', () => {
    navDrawer.classList.add('open');
    navDrawerBackdrop.classList.add('open');
});

function closeNavDrawer() {
    navDrawer.classList.remove('open');
    navDrawerBackdrop.classList.remove('open');
}
navDrawerClose.addEventListener('click', closeNavDrawer);
navDrawerBackdrop.addEventListener('click', closeNavDrawer);

// Sub-nav routing
navDrawer.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => {
        const route = el.dataset.route;
        closeNavDrawer();
        window.location.hash = `#/${route}`;
    });
});

// Toggle Supplier Portal sub-list in nav drawer
const drawerSupplierPortal = document.getElementById('drawerSupplierPortal');
if (drawerSupplierPortal) {
    drawerSupplierPortal.addEventListener('click', (e) => {
        // Only toggle if clicking the parent item, not a subitem
        if (!e.target.closest('[data-route]')) {
            drawerSupplierPortal.classList.toggle('nav-drawer__item--expanded');
            const chevron = drawerSupplierPortal.querySelector('.nav-drawer__chevron');
            if (chevron) chevron.classList.toggle('nav-drawer__chevron--up');
        }
    });
}

// ─── Side Panel ───
const sidePanel = document.getElementById('sidePanel');
const sidePanelContent = document.getElementById('sidePanelContent');
const panelBackdrop = document.getElementById('panelBackdrop');

export function openPanel(html) {
    sidePanelContent.innerHTML = html;
    sidePanel.classList.add('open');
    panelBackdrop.classList.add('open');
}

export function closePanel() {
    sidePanel.classList.remove('open');
    panelBackdrop.classList.remove('open');
    setTimeout(() => { sidePanelContent.innerHTML = ''; }, 300);
}

panelBackdrop.addEventListener('click', closePanel);

// ─── Toast ───
const toastContainer = document.getElementById('toastContainer');

export function showToast(title, message, type = 'success') {
    const iconSvg = type === 'success'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#16A34A"/><path d="M8 12l2.5 2.5L16 9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#DC2626"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
    <div class="toast__icon">${iconSvg}</div>
    <div>
      <div class="toast__title">${title}</div>
      <div class="toast__message">${message}</div>
    </div>
  `;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('toast--exit'); }, 2700);
    setTimeout(() => { toast.remove(); }, 3000);
}

// ─── Modal ───
const modalContainer = document.getElementById('modalContainer');
const modalBackdrop = document.getElementById('modalBackdrop');

export function openModal(html) {
    modalContainer.innerHTML = html;
    modalContainer.classList.add('open');
    modalBackdrop.classList.add('open');
}

export function closeModal() {
    modalContainer.classList.remove('open');
    modalBackdrop.classList.remove('open');
}

// ─── Router ───
function route() {
    const hash = window.location.hash || '#/work-orders';
    mainContent.innerHTML = '';

    // Update subnav active state
    navDrawer.querySelectorAll('.nav-drawer__subitem').forEach(el => {
        el.classList.remove('nav-drawer__subitem--active');
        if (el.dataset.route && hash.includes(el.dataset.route)) {
            el.classList.add('nav-drawer__subitem--active');
        }
    });

    if (hash.startsWith('#/production-process')) {
        renderProductionProcess(mainContent);
    } else if (hash.startsWith('#/invoice')) {
        renderInvoice(mainContent);
    } else if (hash.startsWith('#/shipment')) {
        renderShipment(mainContent);
    } else if (hash.startsWith('#/supplier-portal')) {
        renderSupplierPortal(mainContent);
    } else {
        renderWorkOrders(mainContent);
    }
}

window.addEventListener('hashchange', route);
route();
