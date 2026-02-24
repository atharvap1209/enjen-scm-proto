import { openPanel, closePanel, showToast } from '../main.js';
import { BREAKDOWN_RECORDS, MAINTENANCE_RECORDS, executeMaintenanceStateChange } from '../data/mock-data.js';
import { renderMachineManagement } from '../pages/machine-management.js';

export function renderMachineDetails(machine) {
  const statusClass = {
    'Active': 'badge--completed',
    'Under Breakdown': 'badge--delayed',
    'Under Preventive Maintenance': 'badge--pending',
    'Under Corrective Maintenance': 'badge--in-progress',
    'Inactive': 'badge--draft',
  }[machine.status] || 'badge--draft';

  // Get relevant records
  const machineBreakdowns = BREAKDOWN_RECORDS.filter(b => b.machineId === machine.id);
  const machineMaintenance = MAINTENANCE_RECORDS.filter(m => m.machineId === machine.id);

  // Breakdown Logs HTML
  const breakdownRows = machineBreakdowns.length > 0
    ? machineBreakdowns.map(b => `
        <tr>
          <td>${b.id}</td>
          <td>${b.startTime}</td>
          <td>${b.reason}</td>
          <td>${b.priority}</td>
          <td><span class="badge ${b.status === 'Open' ? 'badge--delayed' : 'badge--completed'}">${b.status}</span></td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="color:var(--gray-400);text-align:center">No breakdown history</td></tr>`;

  // Maintenance Logs HTML
  const maintenanceRows = machineMaintenance.length > 0
    ? machineMaintenance.map(m => {
      let actionBtn = '';
      if (m.status === 'In Progress') {
        actionBtn = `<button class="btn btn--primary btn--sm mnt-complete-btn" data-id="${m.id}">Complete</button>`;
      }

      return `
        <tr>
          <td>${m.id}</td>
          <td>${m.type}</td>
          <td>${m.scheduledDate} ${m.scheduleTime}</td>
          <td>${m.technician}</td>
          <td><span class="badge ${m.status === 'Completed' ? 'badge--completed' :
          m.status === 'In Progress' ? 'badge--in-progress' :
            'badge--pending'}">${m.status}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }).join('')
    : `<tr><td colspan="6" style="color:var(--gray-400);text-align:center">No maintenance history</td></tr>`;

  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">${machine.name} (${machine.id})</h2>
        <span class="badge ${statusClass}">${machine.status}</span>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="panel-body">
      <!-- Specifications -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Machine Specifications</h3></div>
        <div class="card__body">
          <div class="kv-grid kv-grid--3col">
            <div class="kv-item"><div class="kv-label">Type</div><div class="kv-value">${machine.type}</div></div>
            <div class="kv-item"><div class="kv-label">Model Number</div><div class="kv-value">${machine.modelNumber}</div></div>
            <div class="kv-item"><div class="kv-label">Serial Number</div><div class="kv-value">${machine.serialNumber}</div></div>
            <div class="kv-item"><div class="kv-label">Production Line</div><div class="kv-value">${machine.productionLine}</div></div>
            <div class="kv-item"><div class="kv-label">Next Maintenance</div><div class="kv-value">${machine.nextMaintenanceDate || '—'}</div></div>
          </div>
        </div>
      </div>

      <!-- Breakdown Records -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Breakdown Records</h3></div>
        <div class="card__body">
          <table class="output-table">
            <thead>
              <tr><th>Record ID</th><th>Start Time</th><th>Reason</th><th>Priority</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${breakdownRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Maintenance Records -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Maintenance Records</h3></div>
        <div class="card__body">
          <table class="output-table">
            <thead>
              <tr><th>Record ID</th><th>Type</th><th>Scheduled For</th><th>Technician</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${maintenanceRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <div></div>
      <div class="panel-footer__right">
        <button class="btn btn--outline" id="scheduleMntBtn">Schedule Maintenance</button>
        <button class="btn btn--danger-outline" id="reportBrkBtn">Report Breakdown</button>
      </div>
    </div>
  `;

  openPanel(html);

  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);

    document.getElementById('scheduleMntBtn')?.addEventListener('click', () => {
      // Lazy load Schedule Maintenance Modal
      import('./schedule-maintenance.js').then(module => {
        module.renderScheduleMaintenance(machine);
      });
    });

    document.getElementById('reportBrkBtn')?.addEventListener('click', () => {
      // Lazy load Report Breakdown Modal
      if (machine.status !== 'Active') {
        showToast('Error', 'Breakdown can only be reported for Active machines.', 'error');
        return;
      }
      import('./report-breakdown.js').then(module => {
        module.renderReportBreakdown(machine);
      });
    });



    document.querySelectorAll('.mnt-complete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        executeMaintenanceStateChange(btn.dataset.id, 'Complete');
        showToast('Completed', 'Maintenance finished. Machine is Active.', 'success');
        renderMachineDetails(machine);

        const mainContent = document.getElementById('mainContent');
        if (window.location.hash.includes('#/machine-management')) renderMachineManagement(mainContent);
      });
    });
  }, 50);
}
