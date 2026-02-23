// Production Process — Stage Details Side Panel
import { openPanel, closePanel, showToast } from '../main.js';
import { COILS } from '../data/mock-data.js';
import { renderCompleteStage } from './pp-complete-stage.js';

export function renderStageDetails(stage) {
  const statusClass = {
    'Pending': 'badge--pending', 'Completed': 'badge--completed',
    'On Hold': 'badge--on-hold', 'In Progress': 'badge--in-progress',
    'Delayed': 'badge--delayed', 'Not Started': 'badge--not-started',
  }[stage.status] || 'badge--draft';

  const progress = stage.progress || 75;

  // CTAs per PRD lines 182-187
  let ctas = '';
  switch (stage.status) {
    case 'Not Started':
    case 'Pending':
      ctas = `<button class="btn btn--primary" id="stageStart">Start Stage</button>`;
      break;
    case 'In Progress':
      ctas = `<button class="btn btn--outline" id="stageHold">Hold</button><button class="btn btn--primary" id="stageComplete">Complete Stage</button>`;
      break;
    case 'On Hold':
      ctas = `<button class="btn btn--primary" id="stageResume">Resume</button>`;
      break;
    default:
      ctas = '';
  }

  const html = `
    <div class="panel-header">
      <div class="panel-header__left">
        <h2 class="panel-header__title">Stage : ${stage.stageName}</h2>
        <span class="badge ${statusClass}">${stage.status}</span>
      </div>
      <button class="panel-header__close" id="panelClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="panel-body">
      <!-- Progress -->
      <div class="progress-bar">
        <div class="progress-bar__header"><span>Overall Progress</span><span>${progress}%</span></div>
        <div class="progress-bar__track"><div class="progress-bar__fill" style="width:${progress}%"></div></div>
      </div>

      <!-- Staging Details -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Staging Details</h3></div>
        <div class="card__body">
          <div class="kv-grid">
            <div class="kv-item"><div class="kv-label">Work Order No.</div><div class="kv-value">${stage.woNumber}</div></div>
            <div class="kv-item"><div class="kv-label">Status</div><div class="kv-value"><span class="badge ${statusClass}">${stage.status}</span></div></div>
            <div class="kv-item"><div class="kv-label">Operation Type</div><div class="kv-value">${stage.operationType}</div></div>
            <div class="kv-item"><div class="kv-label">Assigned Machine</div><div class="kv-value">${stage.machine}</div></div>
            <div class="kv-item"><div class="kv-label">Start Time</div><div class="kv-value">${stage.startTime}</div></div>
            <div class="kv-item"><div class="kv-label">Pause Time</div><div class="kv-value">${stage.pauseTime}</div></div>
            <div class="kv-item"><div class="kv-label">Resume Time</div><div class="kv-value">${stage.resumeTime}</div></div>
            <div class="kv-item"><div class="kv-label">Customer Name</div><div class="kv-value">${stage.customer}</div></div>
          </div>
        </div>
      </div>

      <!-- Coil Details -->
      <div class="card">
        <div class="card__header"><h3 class="card__title">Coil Details</h3></div>
        <div class="card__body">
          <table class="output-table">
            <thead>
              <tr>
                <th>Coil No.</th><th>Thickness (mm)</th><th>Width (mm)</th><th>Grade</th><th>Surface</th><th>Coating</th><th>Current Weight (MT)</th>
              </tr>
            </thead>
            <tbody>
              ${COILS.slice(0, 2).map(c => `
                <tr>
                  <td>${c.id}</td><td>${c.thicknessMm}</td><td>${c.widthMm}</td>
                  <td>${c.grade}</td><td>${c.surface}</td><td>${c.coating}</td>
                  <td>${c.currentWeightMT} MT</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    ${ctas ? `<div class="panel-footer"><div></div><div class="panel-footer__right">${ctas}</div></div>` : ''}
  `;

  openPanel(html);

  setTimeout(() => {
    document.getElementById('panelClose')?.addEventListener('click', closePanel);
    document.getElementById('stageStart')?.addEventListener('click', () => {
      stage.status = 'In Progress';
      showToast('Success!', 'Stage started successfully');
      renderStageDetails(stage);
    });
    document.getElementById('stageHold')?.addEventListener('click', () => {
      stage.status = 'On Hold';
      showToast('Success!', 'Stage put on hold');
      renderStageDetails(stage);
    });
    document.getElementById('stageResume')?.addEventListener('click', () => {
      stage.status = 'In Progress';
      showToast('Success!', 'Stage resumed');
      renderStageDetails(stage);
    });
    document.getElementById('stageComplete')?.addEventListener('click', () => {
      renderCompleteStage(stage);
    });
  }, 50);
}
