import { openModal, closeModal, showToast } from '../main.js';
import { WORK_ORDERS } from '../data/mock-data.js';
import { reportBreakdown } from '../data/mock-data.js';
import { renderMachineDetails } from './machine-details.js';
import { renderMachineManagement } from '../pages/machine-management.js';

export function renderReportBreakdown(machine) {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' '); // Format roughly

    const activeWOs = WORK_ORDERS.filter(wo => (wo.status === 'In Progress' || wo.status === 'Delayed') && wo.machine === machine.id);
    const woOptions = activeWOs.map(wo => `<option value="${wo.id}">${wo.id}</option>`).join('');

    const html = `
    <div class="modal__header">
      <h2 class="modal__title">Report Breakdown</h2>
      <button class="modal__close" id="brkCloseBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal__body">
      <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
        <div class="form-group">
          <label class="form-label">Machine Code <span class="required">*</span></label>
          <input class="form-input" type="text" value="${machine.id}" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">Machine Name <span class="required">*</span></label>
          <input class="form-input" type="text" value="${machine.name}" disabled />
        </div>
      </div>

      <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
        <div class="form-group">
          <label class="form-label">Breakdown Start Time <span class="required">*</span></label>
          <input class="form-input" type="datetime-local" id="brkStartTime" required />
        </div>
        <div class="form-group">
          <label class="form-label">Reported By <span class="required">*</span></label>
          <input class="form-input" type="text" id="brkReportedBy" placeholder="Your Name" required />
        </div>
      </div>

      <div class="form-row form-row--2" style="margin-bottom:var(--sp-4)">
        <div class="form-group">
          <label class="form-label">Breakdown Reason <span class="required">*</span></label>
          <input class="form-input" type="text" id="brkReason" placeholder="e.g. Hydraulic leak" required />
        </div>
        <div class="form-group">
          <label class="form-label">Priority <span class="required">*</span></label>
          <select class="form-select" id="brkPriority">
            <option value="High">High (Immediate Action required)</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-4)">
        <label class="form-label">Symptoms / Description <span class="required">*</span></label>
        <textarea class="form-input" id="brkSymptoms" rows="3" placeholder="Describe the symptoms..."></textarea>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-4)">
        <label class="form-label">Immediate Actions Taken</label>
        <textarea class="form-input" id="brkActions" rows="2" placeholder="e.g. Stopped machine and closed lines..."></textarea>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-4)">
        <label class="form-label">Affected Work Order (Optional)</label>
        <select class="form-select" id="brkWorkOrder">
          <option value="">None</option>
          ${woOptions}
        </select>
      </div>
    </div>
    <div class="modal__footer">
      <button class="btn btn--outline" id="brkCancelBtn">Cancel</button>
      <button class="btn btn--danger" id="brkSubmitBtn">Report Breakdown</button>
    </div>
  `;

    openModal(html);

    // Default time to now
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    document.getElementById('brkStartTime').value = localISOTime;

    setTimeout(() => {
        document.getElementById('brkCloseBtn')?.addEventListener('click', closeModal);
        document.getElementById('brkCancelBtn')?.addEventListener('click', closeModal);

        document.getElementById('brkSubmitBtn')?.addEventListener('click', () => {
            const startTime = document.getElementById('brkStartTime').value;
            const reportedBy = document.getElementById('brkReportedBy').value.trim();
            const reason = document.getElementById('brkReason').value.trim();
            const priority = document.getElementById('brkPriority').value;
            const symptoms = document.getElementById('brkSymptoms').value.trim();
            const immediateActions = document.getElementById('brkActions').value.trim();
            const affectedWorkOrder = document.getElementById('brkWorkOrder').value;

            if (!startTime || !reportedBy || !reason || !symptoms) {
                showToast('Required fields missing', 'Please fill out all required fields.', 'error');
                return;
            }

            // Check future time
            if (new Date(startTime) > new Date()) {
                showToast('Invalid Time', 'Breakdown start time cannot be in the future.', 'error');
                return;
            }

            try {
                reportBreakdown({
                    machineId: machine.id,
                    machineName: machine.name,
                    startTime: startTime.replace('T', ' '),
                    reportedBy,
                    reason,
                    priority,
                    symptoms,
                    immediateActions,
                    affectedWorkOrder: affectedWorkOrder || null
                });

                // Show SVG success mock in the modal briefly then close, OR show standard toast
                closeModal();
                showToast('Breakdown Reported', 'Machine ' + machine.id + ' status changed to Under Breakdown.', 'error'); // red colored toast

                // Re-render
                renderMachineDetails(machine);

                // Refresh page data if it's the current route
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
