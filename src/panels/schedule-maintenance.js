import { openModal, closeModal, showToast } from '../main.js';
import { BREAKDOWN_RECORDS, scheduleMaintenance } from '../data/mock-data.js';
import { renderMachineDetails } from './machine-details.js';
import { renderMachineManagement } from '../pages/machine-management.js';

export function renderScheduleMaintenance(machine) {
    // If machine is under breakdown, only corrective is allowed (or nothing at all, technically PRD says preventive is blocked).
    const isBroken = machine.status === 'Under Breakdown';

    // Find open breakdowns for this machine
    const openBreakdowns = BREAKDOWN_RECORDS.filter(b => b.machineId === machine.id && (b.status === 'Open' || b.status === 'In Repair'));

    const typeOptions = [];
    if (machine.status === 'Active') {
        typeOptions.push('<option value="Preventive" selected>Preventive (Planned)</option>');
    }
    if (openBreakdowns.length > 0) {
        typeOptions.push('<option value="Corrective" ' + (isBroken ? 'selected' : '') + '>Corrective (Fix Breakdown)</option>');
    }

    if (typeOptions.length === 0) {
        showToast('Blocked', 'No maintenance can be scheduled for this machine in its current state.', 'error');
        return;
    }

    const breakdownOptions = openBreakdowns.map(b => `<option value="${b.id}">${b.id} - ${b.reason}</option>`).join('');

    const html = `
    <div class="modal__header">
      <h2 class="modal__title">Schedule Maintenance</h2>
      <button class="modal__close" id="mntCloseBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal__body">
      <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
        <div class="form-group">
          <label class="form-label">Machine</label>
          <input class="form-input" type="text" value="${machine.name} (${machine.id})" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">Maintenance Type <span class="required">*</span></label>
          <select class="form-select" id="mntType">
            ${typeOptions.join('')}
          </select>
        </div>
      </div>

      <div class="form-group" id="mntBreakdownSelector" style="margin-bottom:var(--sp-4); display: none;">
        <label class="form-label">Linked Breakdown <span class="required">*</span></label>
        <select class="form-select" id="mntBreakdownId">
          <option value="">Select Breakdown</option>
          ${breakdownOptions}
        </select>
      </div>

      <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
        <div class="form-group">
          <label class="form-label">Technician (Assigned To) <span class="required">*</span></label>
          <input class="form-input" type="text" id="mntTechnician" placeholder="Name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Estimated Duration <span class="required">*</span></label>
          <input class="form-input" type="text" id="mntDuration" placeholder="e.g. 4 hours" required />
        </div>
      </div>

      <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
        <div class="form-group">
          <label class="form-label">Scheduled Date <span class="required">*</span></label>
          <input class="form-input" type="date" id="mntDate" required />
        </div>
        <div class="form-group">
          <label class="form-label">Scheduled Time <span class="required">*</span></label>
          <input class="form-input" type="time" id="mntTime" required />
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-2)">
        <label class="form-label">Estimated Cost (Currency)</label>
        <input class="form-input" type="number" id="mntCost" placeholder="0" min="0" />
      </div>

    </div>
    <div class="modal__footer">
      <button class="btn btn--outline" id="mntCancelBtn">Cancel</button>
      <button class="btn btn--primary" id="mntSubmitBtn">Schedule</button>
    </div>
  `;

    openModal(html);

    // Today's date default
    const localIsoDate = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    document.getElementById('mntDate').value = localIsoDate;
    document.getElementById('mntTime').value = '09:00';

    setTimeout(() => {
        const typeSelect = document.getElementById('mntType');
        const breakdownSelector = document.getElementById('mntBreakdownSelector');

        // Toggle breakdown selector based on type
        const toggleSelector = () => {
            if (typeSelect.value === 'Corrective') {
                breakdownSelector.style.display = 'block';
            } else {
                breakdownSelector.style.display = 'none';
            }
        };

        toggleSelector(); // Initial
        typeSelect?.addEventListener('change', toggleSelector);

        document.getElementById('mntCloseBtn')?.addEventListener('click', closeModal);
        document.getElementById('mntCancelBtn')?.addEventListener('click', closeModal);

        document.getElementById('mntSubmitBtn')?.addEventListener('click', () => {
            const type = document.getElementById('mntType').value;
            const breakdownId = document.getElementById('mntBreakdownId')?.value;
            const technician = document.getElementById('mntTechnician').value.trim();
            const scheduledDate = document.getElementById('mntDate').value;
            const scheduleTime = document.getElementById('mntTime').value;
            const estimatedDuration = document.getElementById('mntDuration').value.trim();
            const estimatedCost = document.getElementById('mntCost').value || 0;

            if (!technician || !scheduledDate || !scheduleTime || !estimatedDuration) {
                showToast('Required fields missing', 'Please fill out all required fields.', 'error');
                return;
            }

            if (type === 'Corrective' && !breakdownId) {
                showToast('Required', 'A linked breakdown must be selected for corrective maintenance.', 'error');
                return;
            }

            // Check future date time
            const schedDT = new Date(scheduledDate + 'T' + scheduleTime);
            if (schedDT < new Date()) {
                showToast('Invalid Time', 'Scheduled time must be in the future.', 'error');
                return;
            }

            try {
                scheduleMaintenance({
                    machineId: machine.id,
                    type,
                    breakdownId: type === 'Corrective' ? breakdownId : null,
                    technician,
                    scheduledDate,
                    scheduleTime,
                    estimatedDuration,
                    estimatedCost,
                });

                closeModal();
                showToast('Maintenance Scheduled', type + ' maintenance scheduled for ' + machine.id + '.', 'success');

                renderMachineDetails(machine);
                const mainContent = document.getElementById('mainContent');
                if (window.location.hash.includes('#/machine-management')) {
                    renderMachineManagement(mainContent);
                }

            } catch (e) {
                showToast('Error', e.message, 'error');
            }
        });

    }, 50);
}
