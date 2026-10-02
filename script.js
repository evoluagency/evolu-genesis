const companies = [
  {
    id: 'acme',
    name: 'ACME Indústria Ltda.',
    trade: 'ACME Industrial',
    regime: 'Lucro Real',
    activity: 'Fabricação de máquinas industriais',
    revenue: 'R$ 1.386.373',
    purchases: 'R$ 1.214.916',
    pending: 7,
    insights: 12,
  },
  {
    id: 'nova',
    name: 'Nova Comércio Ltda.',
    trade: 'Nova Comércio',
    regime: 'Simples Nacional',
    activity: 'Comércio atacadista de peças e componentes',
    revenue: 'R$ 642.118',
    purchases: 'R$ 401.502',
    pending: 4,
    insights: 5,
  },
  {
    id: 'orion',
    name: 'Orion Serviços Empresariais Ltda.',
    trade: 'Orion Serviços',
    regime: 'Lucro Presumido',
    activity: 'Serviços administrativos e consultivos',
    revenue: 'R$ 318.400',
    purchases: 'R$ 74.260',
    pending: 2,
    insights: 3,
  },
];

const purposes = [
  'Production component',
  'Machine maintenance',
  'Resale',
  'Fixed asset',
  'Internal consumption',
];

const confidenceMap = {
  'Production component': 91,
  'Machine maintenance': 82,
  'Resale': 88,
  'Fixed asset': 78,
  'Internal consumption': 69,
};

let state = {
  mode: 'guided',
  companyId: 'acme',
  purpose: null,
  architectureOpen: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function currentCompany() {
  return companies.find((company) => company.id === state.companyId) || companies[0];
}

function renderCompanies() {
  const grid = $('#companyGrid');
  grid.innerHTML = companies.map((company) => `
    <button class="company-card ${company.id === state.companyId ? 'active' : ''}" data-company="${company.id}">
      <span>${company.regime}</span>
      <strong>${company.trade}</strong>
      <small>${company.activity}</small>
      <i>${company.pending} pending · ${company.insights} insights</i>
    </button>
  `).join('');

  $$('[data-company]').forEach((button) => {
    button.addEventListener('click', () => {
      state.companyId = button.dataset.company;
      state.purpose = null;
      renderAll();
    });
  });
}

function renderCompanySummary() {
  const company = currentCompany();
  $('#companyTitle').textContent = company.trade;
  $('#companySummary').innerHTML = `
    <div><span>Legal name</span><strong>${company.name}</strong></div>
    <div><span>Tax regime</span><strong>${company.regime}</strong></div>
    <div><span>Primary activity</span><strong>${company.activity}</strong></div>
    <div><span>Revenue</span><strong>${company.revenue}</strong></div>
    <div><span>Purchases</span><strong>${company.purchases}</strong></div>
    <div><span>Open intelligence items</span><strong>${company.insights}</strong></div>
  `;

  $('#guidedStep').hidden = state.mode !== 'guided';
}

function renderTransaction() {
  const company = currentCompany();
  $('#transactionGrid').innerHTML = `
    <div><span>Supplier</span><strong>ABC Rolamentos Ltda.</strong></div>
    <div><span>NCM</span><strong>8482.10.90</strong></div>
    <div><span>CFOP</span><strong>5102</strong></div>
    <div><span>ICMS highlighted</span><strong>R$ 182,40</strong></div>
    <div><span>Company</span><strong>${company.trade}</strong></div>
    <div><span>Regime</span><strong>${company.regime}</strong></div>
  `;
}

function renderPurposeOptions() {
  $('#purposeOptions').innerHTML = purposes.map((purpose) => `
    <button class="option ${purpose === state.purpose ? 'active' : ''}" data-purpose="${purpose}">${purpose}</button>
  `).join('');

  $$('[data-purpose]').forEach((button) => {
    button.addEventListener('click', () => {
      state.purpose = button.dataset.purpose;
      renderPurposeOptions();
      renderTrace();
      renderResult();
      $('#contextStatus').textContent = 'Context resolved';
      $('#contextStatus').classList.remove('warning');
      $('#contextStatus').classList.add('context');
    });
  });
}

function renderTrace() {
  const company = currentCompany();
  const resolved = Boolean(state.purpose);
  const steps = [
    ['done', 'Reading document', 'Product, supplier and tax fields extracted'],
    ['done', 'Loading Company Context', company.activity],
    ['done', 'Checking known relationships', 'Historical use not found for this item'],
    [resolved ? 'done' : 'current', 'Resolving economic purpose', state.purpose || 'Waiting for human context'],
    [resolved ? 'done' : 'muted', 'Re-evaluating treatment', resolved ? 'Context incorporated into analysis' : 'Pending'],
    [resolved ? 'done' : 'muted', 'Generating evidence', resolved ? 'Recommendation + uncertainty generated' : 'Pending'],
  ];

  $('#traceList').innerHTML = steps.map((step, index) => `
    <li class="${step[0]}">
      <b class="step">${index + 1}</b>
      <div><strong>${step[1]}</strong><span>${step[2]}</span></div>
    </li>
  `).join('');
}

function renderResult() {
  const panel = $('#resultPanel');
  if (!state.purpose) {
    panel.hidden = true;
    return;
  }

  const confidence = confidenceMap[state.purpose];
  panel.hidden = false;
  panel.innerHTML = `
    <span class="kicker">SIMULATED RESULT</span>
    <h4>Context updated. Analysis re-evaluated.</h4>
    <p>The declared economic purpose is now part of this synthetic Company Context and changes how the transaction is interpreted.</p>
    <div class="result-grid">
      <div><span>Purpose</span><strong>${state.purpose}</strong></div>
      <div><span>Confidence</span><strong>${confidence}%</strong></div>
      <div><span>Status</span><strong>Reviewable recommendation</strong></div>
      <div><span>Decision authority</span><strong>Human validation</strong></div>
    </div>
    <div class="evidence">
      <span>✓ product classification</span>
      <span>✓ company activity</span>
      <span>✓ declared economic purpose</span>
      <span>✓ tax regime context</span>
      <span>✓ document fields</span>
    </div>
    <div class="disclaimer">This demo does not calculate or grant tax credits. It demonstrates context acquisition, evidence and review.</div>
  `;
}

function setView(view) {
  const platformView = $('#platformView');
  const intelligenceView = $('#intelligenceView');
  const intelligence = view === 'intelligence';
  platformView.hidden = intelligence;
  intelligenceView.hidden = !intelligence;

  $$('.mode').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === state.mode);
  });
}

function setMode(mode) {
  state.mode = mode;
  setView(mode === 'intelligence' ? 'intelligence' : 'platform');
  renderCompanySummary();
  if (mode === 'intelligence') {
    renderTransaction();
    renderPurposeOptions();
    renderTrace();
    renderResult();
  }
}

function reset() {
  state = { mode: 'guided', companyId: 'acme', purpose: null, architectureOpen: false };
  $('#contextStatus').textContent = 'Context required';
  $('#contextStatus').classList.add('warning');
  $('#contextStatus').classList.remove('context');
  $('#miniArchitecture').hidden = true;
  $('#toggleArchitecture').textContent = 'View reasoning architecture';
  renderAll();
}

function renderAll() {
  renderCompanies();
  renderCompanySummary();
  renderTransaction();
  renderPurposeOptions();
  renderTrace();
  renderResult();
  setView(state.mode === 'intelligence' ? 'intelligence' : 'platform');
}

$('#startDemo').addEventListener('click', () => {
  document.querySelector('#demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setMode('guided');
});

$$('.mode').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
$('#openIntelligence').addEventListener('click', () => setMode('intelligence'));
$('#backPlatform').addEventListener('click', () => setMode('platform'));
$$('[data-open-intelligence]').forEach((button) => button.addEventListener('click', () => setMode('intelligence')));
$('#restartTop').addEventListener('click', reset);

$('#toggleArchitecture').addEventListener('click', () => {
  state.architectureOpen = !state.architectureOpen;
  $('#miniArchitecture').hidden = !state.architectureOpen;
  $('#toggleArchitecture').textContent = state.architectureOpen ? 'Hide architecture' : 'View reasoning architecture';
});

renderAll();
