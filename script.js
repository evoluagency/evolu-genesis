const I18N = {
  pt: {
    introEyebrow:'EXPERIÊNCIA PÚBLICA DE PRODUTO',
    introTitle:'Dados não são contexto. Contexto não é conclusão.',
    introBody:'Genesis demonstra como a EVOLU conecta operação, reconciliação, contexto empresarial e julgamento humano antes de recomendar uma ação.',
    startGuided:'Começar experiência guiada',
    exploreFreely:'Explorar livremente',
    syntheticData:'DADOS SINTÉTICOS',
    noAdvice:'SEM ORIENTAÇÃO TRIBUTÁRIA REAL',
    p1Title:'Observe', p1Body:'A Platform organiza fatos operacionais.',
    p2Title:'Reconcilie', p2Body:'Fontes divergentes viram casos explícitos.',
    p3Title:'Contextualize', p3Body:'A Intelligence pergunta somente o que falta.',
    p4Title:'Aja', p4Body:'O usuário escolhe executar ou aprender como fazer.',
    sandboxEyebrow:'SANDBOX INTERATIVO',
    sandboxTitle:'Uma operação contábil-fiscal, com contexto vivo.',
    deterministic:'Simulação determinística · sem LLM',
    tenantType:'Contabilidade & Assessoria',
    navOverview:'Visão geral', navFiscal:'FISCAL', navDocuments:'Documentos',
    navAccounting:'CONTÁBIL', navEntries:'Lançamentos',
    navOperational:'INTELIGÊNCIA OPERACIONAL', navReconciliation:'Reconciliação',
    selectedCompany:'EMPRESA SELECIONADA', companyLabel:'Empresa', periodLabel:'Competência',
    chatPlaceholder:'Pergunte à EVOLU…',
    demoFooter:'Simulação pública · respostas e ações são pré-configuradas',
    skipTour:'Sair do guia', continueTour:'Continuar',
    conceptEyebrow:'TESE DO PRODUTO',
    conceptTitle:'A EVOLU não tenta adivinhar. Ela torna a incerteza explícita.',
    known:'O QUE SABEMOS', knownBody:'Documentos · ERP · banco · histórico',
    divergent:'O QUE DIVERGE', divergentBody:'Conciliação entre fontes',
    missing:'O QUE FALTA', missingBody:'Lacunas de contexto · perguntas ao humano',
    decision:'O QUE FOI DECIDIDO', decisionBody:'Evidência · ação · trilha de decisão',
    reset:'Reiniciar',
    mobileOverview:'Início', mobileFiscal:'Fiscal', mobileAccounting:'Contábil',
    mobileReconciliation:'Conciliar', mobileContext:'Contexto',
    resetDone:'Experiência reiniciada.',
    applied:'Alteração aplicada na simulação.',
    saved:'Contexto salvo.'
  },
  en: {
    introEyebrow:'PUBLIC PRODUCT EXPERIENCE',
    introTitle:'Data is not context. Context is not a conclusion.',
    introBody:'Genesis shows how EVOLU connects operations, reconciliation, company context and human judgment before recommending an action.',
    startGuided:'Start guided experience',
    exploreFreely:'Explore freely',
    syntheticData:'SYNTHETIC DATA',
    noAdvice:'NO REAL TAX ADVICE',
    p1Title:'Observe', p1Body:'Platform organizes operational facts.',
    p2Title:'Reconcile', p2Body:'Divergent sources become explicit cases.',
    p3Title:'Contextualize', p3Body:'Intelligence asks only for what is missing.',
    p4Title:'Act', p4Body:'The user chooses to execute or learn how to do it.',
    sandboxEyebrow:'INTERACTIVE SANDBOX',
    sandboxTitle:'An accounting and tax operation with living context.',
    deterministic:'Deterministic simulation · no LLM',
    tenantType:'Accounting & Advisory',
    navOverview:'Overview', navFiscal:'TAX', navDocuments:'Documents',
    navAccounting:'ACCOUNTING', navEntries:'Entries',
    navOperational:'OPERATIONAL INTELLIGENCE', navReconciliation:'Reconciliation',
    selectedCompany:'SELECTED COMPANY', companyLabel:'Company', periodLabel:'Period',
    chatPlaceholder:'Ask EVOLU…',
    demoFooter:'Public simulation · responses and actions are preconfigured',
    skipTour:'Exit guide', continueTour:'Continue',
    conceptEyebrow:'PRODUCT THESIS',
    conceptTitle:'EVOLU does not try to guess. It makes uncertainty explicit.',
    known:'WHAT WE KNOW', knownBody:'Documents · ERP · bank · history',
    divergent:'WHAT DIVERGES', divergentBody:'Reconciliation across sources',
    missing:'WHAT IS MISSING', missingBody:'Context gaps · human questions',
    decision:'WHAT WAS DECIDED', decisionBody:'Evidence · action · decision trail',
    reset:'Reset',
    mobileOverview:'Home', mobileFiscal:'Tax', mobileAccounting:'Accounting',
    mobileReconciliation:'Reconcile', mobileContext:'Context',
    resetDone:'Experience reset.',
    applied:'Change applied in the simulation.',
    saved:'Context saved.'
  }
};

const DATA = {
  company:{
    id:'acme',
    name:'ACME Industrial',
    legalName:'ACME Indústria Ltda.',
    regime:{pt:'Lucro Real',en:'Lucro Real (Actual Profit)'},
    activity:{pt:'Fabricação de máquinas industriais',en:'Industrial machinery manufacturing'},
    location:'SP',
    period:'09/2026'
  },
  invoices:[
    {
      id:'NF-e 70031', supplier:'Atlas Componentes Ltda.', date:'18/09/2026',
      value:'R$ 1.680,00', item:{pt:'Rolamento 6305',en:'Bearing 6305'},
      ncm:'8482.10.90', cfop:'5102', icms:'R$ 214,20',
      purpose:null, status:'context-gap'
    },
    {
      id:'NF-e 70018', supplier:'Aço Norte Industrial Ltda.', date:'17/09/2026',
      value:'R$ 9.240,00', item:{pt:'Chapa de aço',en:'Steel plate'},
      ncm:'7208.51.00', cfop:'5102', icms:'R$ 1.183,00',
      purpose:'production', status:'validated'
    },
    {
      id:'NF-e 69974', supplier:'Papelaria Central Ltda.', date:'11/09/2026',
      value:'R$ 1.140,00', item:{pt:'Materiais de escritório',en:'Office supplies'},
      ncm:'4820.10.00', cfop:'5102', icms:'R$ 0,00',
      purpose:'administrative', status:'validated'
    }
  ],
  entries:[
    {
      id:'CTB-4107', date:'02/09/2026', supplier:'Vector Consultoria Ltda.',
      history:{pt:'Serviços mensais de apoio operacional',en:'Monthly operational support services'},
      value:'R$ 5.120,00', account:'other', costCenter:'undefined', status:'review'
    },
    {
      id:'CTB-4099', date:'01/09/2026', supplier:'Energia Regional S.A.',
      history:{pt:'Energia da unidade industrial',en:'Industrial unit electricity'},
      value:'R$ 13.080,40', account:'energy', costCenter:'production', status:'classified'
    }
  ],
  sources:[
    {category:'fiscal',name:'SIEG / XML',value:'R$ 812.440,20',note:{pt:'Documentos fiscais importados',en:'Imported tax documents'}},
    {category:'accounting',name:'Domínio / Razão',value:'R$ 817.125,54',note:{pt:'Escrituração contábil',en:'Accounting ledger'}},
    {category:'management',name:{pt:'Demonstrativo interno',en:'Internal statement'},value:'R$ 789.980,00',note:{pt:'Visão gerencial agregada',en:'Aggregated management view'}},
    {category:'financial',name:{pt:'Banco',en:'Bank'},value:'R$ 805.312,11',note:{pt:'Movimentação financeira conciliável',en:'Reconcilable financial movement'}}
  ]
};

const ACCOUNT_LABELS = {
  other:{pt:'Outros',en:'Other'},
  productive_services:{pt:'Serviços de terceiros produtivos',en:'Productive third-party services'},
  administrative_services:{pt:'Serviços de terceiros administrativos',en:'Administrative third-party services'},
  energy:{pt:'Energia elétrica',en:'Electricity'}
};
const COST_CENTER_LABELS = {
  undefined:{pt:'Não definido',en:'Not defined'},
  production:{pt:'Produção',en:'Production'},
  administrative:{pt:'Administrativo',en:'Administrative'}
};
const PURPOSE_LABELS = {
  production:{pt:'Produção',en:'Production component'},
  maintenance:{pt:'Manutenção de máquina',en:'Machine maintenance'},
  resale:{pt:'Revenda',en:'Resale'},
  fixed_asset:{pt:'Ativo imobilizado',en:'Fixed asset'},
  internal_use:{pt:'Consumo interno',en:'Internal use'},
  administrative:{pt:'Administrativo',en:'Administrative'}
};
const CATEGORY_LABELS = {
  fiscal:{pt:'FISCAL',en:'TAX'},
  accounting:{pt:'CONTÁBIL',en:'ACCOUNTING'},
  management:{pt:'GERENCIAL',en:'MANAGEMENT'},
  financial:{pt:'FINANCEIRO',en:'FINANCIAL'}
};

const PAGE_META = {
  dashboard:{pt:['Visão geral','NEXUS / ACME Industrial'],en:['Overview','NEXUS / ACME Industrial']},
  'fiscal-documents':{pt:['Documentos fiscais','Fiscal / Entradas'],en:['Tax documents','Tax / Purchases']},
  'fiscal-detail':{pt:['Detalhe do documento','Fiscal / Entradas'],en:['Document detail','Tax / Purchases']},
  'accounting-entries':{pt:['Lançamentos contábeis','Contábil / Lançamentos'],en:['Accounting entries','Accounting / Entries']},
  'accounting-detail':{pt:['Detalhe do lançamento','Contábil / Lançamentos'],en:['Entry detail','Accounting / Entries']},
  reconciliation:{pt:['Reconciliação','Inteligência operacional / Reconciliação'],en:['Reconciliation','Operational intelligence / Reconciliation']},
  'context-ledger':{pt:['Context Ledger','Inteligência operacional / Context Ledger'],en:['Context Ledger','Operational intelligence / Context Ledger']}
};

const QUICK = {
  dashboard:{
    pt:[
      {key:'attention',label:'O que exige minha atenção hoje?'},
      {key:'incomplete',label:'Quais dados estão incompletos?'},
      {key:'divergences',label:'Onde existem divergências?'}
    ],
    en:[
      {key:'attention',label:'What needs my attention today?'},
      {key:'incomplete',label:'Which data is incomplete?'},
      {key:'divergences',label:'Where are the divergences?'}
    ]
  },
  'fiscal-documents':{
    pt:[
      {key:'notes_context',label:'Quais notas precisam de contexto?'},
      {key:'inconsistency',label:'Existe alguma inconsistência?'},
      {key:'unreconciled',label:'O que ainda não foi conciliado?'}
    ],
    en:[
      {key:'notes_context',label:'Which invoices need context?'},
      {key:'inconsistency',label:'Is there any inconsistency?'},
      {key:'unreconciled',label:'What is still unreconciled?'}
    ]
  },
  'fiscal-detail':{
    pt:[
      {key:'tax_effect',label:'Essa operação pode gerar algum efeito tributário?'},
      {key:'missing',label:'O que está faltando nesta operação?'},
      {key:'accounting_effect',label:'Como essa operação afeta a contabilidade?'}
    ],
    en:[
      {key:'tax_effect',label:'Can this transaction have a tax effect?'},
      {key:'missing',label:'What is missing in this transaction?'},
      {key:'accounting_effect',label:'How does this transaction affect accounting?'}
    ]
  },
  'accounting-entries':{
    pt:[
      {key:'entries_review',label:'Quais lançamentos precisam de revisão?'},
      {key:'generic',label:'Onde a classificação está genérica?'},
      {key:'tax_divergence',label:'Há divergência com documentos fiscais?'}
    ],
    en:[
      {key:'entries_review',label:'Which entries need review?'},
      {key:'generic',label:'Where is classification too generic?'},
      {key:'tax_divergence',label:'Is there divergence with tax documents?'}
    ]
  },
  'accounting-detail':{
    pt:[
      {key:'classify',label:'Como devo classificar este lançamento?'},
      {key:'op_admin',label:'Esse custo é operacional ou administrativo?'},
      {key:'missing_accounting',label:'O que ainda falta para concluir?'}
    ],
    en:[
      {key:'classify',label:'How should I classify this entry?'},
      {key:'op_admin',label:'Is this operational or administrative?'},
      {key:'missing_accounting',label:'What is still missing to conclude?'}
    ]
  },
  reconciliation:{
    pt:[
      {key:'recon_where',label:'Onde está a divergência?'},
      {key:'recon_missing',label:'O que falta para conciliar?'},
      {key:'recon_followup',label:'Crie uma pendência para o cliente.'}
    ],
    en:[
      {key:'recon_where',label:'Where is the divergence?'},
      {key:'recon_missing',label:'What is missing to reconcile?'},
      {key:'recon_followup',label:'Create a client follow-up.'}
    ]
  },
  'context-ledger':{
    pt:[
      {key:'ledger_evidence',label:'Quais fatos estão sem evidência?'},
      {key:'ledger_client',label:'O que foi informado pelo cliente?'},
      {key:'ledger_stale',label:'Quais contextos estão desatualizados?'}
    ],
    en:[
      {key:'ledger_evidence',label:'Which facts lack evidence?'},
      {key:'ledger_client',label:'What came from the client?'},
      {key:'ledger_stale',label:'Which contexts are outdated?'}
    ]
  }
};

const TOUR = [
  {
    id:'open-fiscal', target:'[data-page="fiscal-documents"]', event:'page:fiscal-documents',
    title:{pt:'Entre no Fiscal',en:'Open Tax'},
    body:{pt:'A experiência começa pela operação, não pelo chat. Abra os documentos fiscais da ACME.',en:'The experience starts from the operation, not the chat. Open ACME tax documents.'}
  },
  {
    id:'open-invoice', target:'[data-invoice="NF-e 70031"]', event:'page:fiscal-detail',
    title:{pt:'Abra um caso com contexto incompleto',en:'Open a case with missing context'},
    body:{pt:'O documento possui dados estruturados, mas ainda falta um fato econômico relevante.',en:'The document has structured data, but a relevant economic fact is still missing.'}
  },
  {
    id:'open-intelligence', target:'#intelligenceFab', event:'assistant:open',
    title:{pt:'Chame a Intelligence no contexto atual',en:'Open Intelligence in the current context'},
    body:{pt:'A EVOLU já recebe empresa, área, tela e documento. Você não precisa reexplicar o caso.',en:'EVOLU already receives company, area, screen and document. You do not need to restate the case.'}
  },
  {
    id:'choose-question', target:'[data-suggestion-key="missing"]', event:'suggestion:missing',
    title:{pt:'Escolha uma pergunta contextual',en:'Choose a contextual question'},
    body:{pt:'Clique na pergunta sobre o que está faltando. Ela será enviada para o campo de escrita.',en:'Click the question about what is missing. It will be placed in the composer.'}
  },
  {
    id:'send-question', target:'#composer .send', event:'question:missing',
    title:{pt:'Envie a pergunta',en:'Send the question'},
    body:{pt:'Agora envie. A Intelligence vai responder com base na tela atual.',en:'Now send it. Intelligence will respond based on the current screen.'}
  },
  {
    id:'choose-manual', target:'[data-choice-value="manual_context"]', event:'choice:manual_context',
    title:{pt:'Escolha aprender fazendo',en:'Choose to learn by doing'},
    body:{pt:'Use o modo manual para ver a Intelligence transformar uma explicação em tutorial operacional.',en:'Use manual mode to see Intelligence turn an explanation into an operational tutorial.'}
  },
  {
    id:'manual-purpose', target:'#economicPurpose', event:'manual:purpose-selected',
    title:{pt:'Selecione a finalidade',en:'Select the purpose'},
    body:{pt:'Escolha “Produção” no campo destacado.',en:'Choose “Production” in the highlighted field.'}
  },
  {
    id:'manual-save', target:'#savePurpose', event:'manual:purpose-saved',
    title:{pt:'Salve o contexto',en:'Save the context'},
    body:{pt:'Agora salve. O fato será registrado com origem e evidência.',en:'Now save. The fact will be recorded with source and evidence.'}
  },
  {
    id:'open-ledger', target:'[data-page="context-ledger"]', event:'page:context-ledger',
    title:{pt:'Veja o Context Ledger',en:'Open the Context Ledger'},
    body:{pt:'O contexto deixa de ser apenas conversa e passa a ser conhecimento operacional rastreável.',en:'Context stops being just conversation and becomes traceable operational knowledge.'}
  },
  {
    id:'open-recon', target:'[data-page="reconciliation"]', event:'page:reconciliation',
    title:{pt:'Agora veja a Reconciliação',en:'Now open Reconciliation'},
    body:{pt:'Fontes diferentes não são tratadas como se fossem automaticamente comparáveis.',en:'Different sources are not treated as automatically comparable.'}
  }
];

function initialLedger(){
  return [
    {
      id:'regime', fact:{pt:'Regime tributário',en:'Tax regime'},
      value:{pt:'Lucro Real',en:'Lucro Real (Actual Profit)'}, source:{pt:'Cadastro da empresa',en:'Company registry'},
      sourceType:'registry', evidence:{pt:'Cadastro validado da empresa',en:'Validated company registry'},
      recordedAt:'01/09/2026 09:00', recordedBy:{pt:'Sistema',en:'System'},
      scope:'ACME Industrial · 09/2026', status:'verified'
    },
    {
      id:'activity', fact:{pt:'Atividade principal',en:'Primary activity'},
      value:{pt:'Fabricação de máquinas industriais',en:'Industrial machinery manufacturing'},
      source:{pt:'Cadastro + validação',en:'Registry + validation'},
      sourceType:'registry', evidence:{pt:'Cadastro empresarial validado',en:'Validated company registry'},
      recordedAt:'01/09/2026 09:00', recordedBy:{pt:'Sistema',en:'System'},
      scope:'ACME Industrial', status:'verified'
    },
    {
      id:'bearing-purpose', fact:{pt:'Finalidade · Rolamento 6305',en:'Purpose · Bearing 6305'},
      value:{pt:'Não definida',en:'Not defined'}, source:{pt:'—',en:'—'},
      sourceType:'missing', evidence:{pt:'Nenhuma evidência registrada',en:'No evidence recorded'},
      recordedAt:'—', recordedBy:{pt:'—',en:'—'},
      scope:'ACME Industrial · NF-e 70031', status:'missing'
    }
  ];
}

function createState(){
  return {
    lang: localStorage.getItem('genesis_lang') || 'pt',
    theme: localStorage.getItem('genesis_theme') || 'dark',
    page:'dashboard',
    selectedInvoice:'NF-e 70031',
    selectedEntry:'CTB-4107',
    assistantOpen:false,
    conversation:[],
    collected:{},
    proposals:{fiscalPurpose:null,accounting:null},
    applied:{fiscalPurpose:null,accounting:null},
    ledger:initialLedger(),
    decisions:[],
    guided:false,
    tourIndex:0,
    manualTutorial:null,
    followupCreated:false
  };
}
let state=createState();

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const t=key=>I18N[state.lang][key]||key;
const langValue=v=>typeof v==='object'&&v!==null?(v[state.lang]??v.pt??''):v;

function currentInvoice(){
  return DATA.invoices.find(i=>i.id===state.selectedInvoice)||DATA.invoices[0];
}
function currentEntry(){
  return DATA.entries.find(e=>e.id===state.selectedEntry)||DATA.entries[0];
}
function accountLabel(key){return ACCOUNT_LABELS[key]?.[state.lang]||key}
function costLabel(key){return COST_CENTER_LABELS[key]?.[state.lang]||key}
function purposeLabel(key){return PURPOSE_LABELS[key]?.[state.lang]||key}

function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function escapeAttr(value=''){return escapeHtml(value)}

function applyI18n(){
  document.documentElement.lang=state.lang==='pt'?'pt-BR':'en';
  $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  $$('[data-lang]').forEach(b=>{
    const active=b.dataset.lang===state.lang;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  });
  const sidebarFoot=$('.sidebar-foot');
  if(sidebarFoot){
    const small=sidebarFoot.querySelector('small');
    if(small) small.textContent=`${langValue(DATA.company.regime)} · ${DATA.company.location}`;
  }
  $('#intelligenceFab').setAttribute('aria-label',state.lang==='pt'?'Abrir EVOLU Intelligence':'Open EVOLU Intelligence');
  $('#closePanel').setAttribute('aria-label',state.lang==='pt'?'Fechar':'Close');
  $('#minimizePanel').setAttribute('aria-label',state.lang==='pt'?'Minimizar':'Minimize');
  $('.send').setAttribute('aria-label',state.lang==='pt'?'Enviar':'Send');
  renderPage();
  renderAssistantContext();
  renderSuggestions();
  renderConversation();
}
function applyTheme(){
  const resolved=state.theme==='system'
    ?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')
    :state.theme;
  document.documentElement.dataset.theme=resolved;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=resolved==='light'?'#f6f7fa':'#0b0d12';
  $$('[data-theme-choice]').forEach(b=>{
    const active=b.dataset.themeChoice===state.theme;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  });
}

function getPageMeta(){
  const meta=PAGE_META[state.page][state.lang];
  let title=meta[0],crumb=meta[1];
  if(state.page==='fiscal-detail')crumb+=` / ${currentInvoice().id}`;
  if(state.page==='accounting-detail')crumb+=` / ${currentEntry().id}`;
  return [title,crumb];
}
function renderPage(){
  const [title,crumb]=getPageMeta();
  $('#pageTitle').textContent=title;
  $('#breadcrumb').textContent=crumb;
  $$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
  const w=$('#workspace');
  const renderers={
    dashboard:renderDashboard,
    'fiscal-documents':renderFiscalList,
    'fiscal-detail':renderFiscalDetail,
    'accounting-entries':renderAccountingList,
    'accounting-detail':renderAccountingDetail,
    reconciliation:renderReconciliation,
    'context-ledger':renderLedger
  };
  w.innerHTML=(renderers[state.page]||renderDashboard)();
  bindWorkspace();
  renderAssistantContext();
  renderSuggestions();
  const alertPages=['fiscal-detail','reconciliation'];
  $('#intelligenceFab .fab-pulse').hidden=!alertPages.includes(state.page);
  if(state.guided)setTimeout(showTourStep,60);
}

function renderDashboard(){
  const pt=state.lang==='pt';
  return `
  <div class="grid metrics">
    <div class="metric"><span>${pt?'Empresas':'Companies'}</span><strong>84</strong><small>${pt?'carteira simulada':'simulated portfolio'}</small></div>
    <div class="metric"><span>${pt?'Lacunas de contexto':'Context gaps'}</span><strong>13</strong><small>${pt?'exigem validação humana':'require human validation'}</small></div>
    <div class="metric"><span>${pt?'Divergências':'Divergences'}</span><strong>7</strong><small>${pt?'entre fontes':'across sources'}</small></div>
    <div class="metric"><span>${pt?'Casos revisados':'Reviewed cases'}</span><strong>327</strong><small>${pt?'com trilha de decisão':'with decision trail'}</small></div>
  </div>
  <div class="workspace-grid">
    <section class="card">
      <div class="card-head"><div><span class="tiny-label">${pt?'ATENÇÃO':'ATTENTION'}</span><h4>${pt?'Casos que precisam de contexto':'Cases that need context'}</h4></div></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${pt?'Área':'Area'}</th><th>${pt?'Objeto':'Object'}</th><th>${pt?'Lacuna':'Gap'}</th></tr></thead>
        <tbody>
          <tr data-page-jump="fiscal-detail"><td>${pt?'Fiscal':'Tax'}</td><td>NF-e 70031</td><td><span class="pill warn">${pt?'Finalidade econômica':'Economic purpose'}</span></td></tr>
          <tr data-page-jump="accounting-detail"><td>${pt?'Contábil':'Accounting'}</td><td>CTB-4107</td><td><span class="pill warn">${pt?'Classificação genérica':'Generic classification'}</span></td></tr>
        </tbody>
      </table></div>
    </section>
    <aside class="card">
      <span class="tiny-label">${pt?'CAMADA DE CONTEXTO':'CONTEXT LAYER'}</span>
      <h4>${pt?'O que a EVOLU sabe agora':'What EVOLU knows now'}</h4>
      <div class="source-grid">
        <div class="source-card"><span>${pt?'Empresa':'Company'}</span><b>ACME Industrial</b><small>${pt?'Cadastro validado':'Validated registry'}</small></div>
        <div class="source-card"><span>${pt?'Regime':'Tax regime'}</span><b>${langValue(DATA.company.regime)}</b><small>${pt?'Referência 09/2026':'Reference 09/2026'}</small></div>
        <div class="source-card"><span>${pt?'Atividade':'Activity'}</span><b>${langValue(DATA.company.activity)}</b><small>${pt?'Contexto empresarial':'Company context'}</small></div>
      </div>
    </aside>
  </div>`;
}

function renderFiscalList(){
  const pt=state.lang==='pt';
  return `<section class="card">
    <div class="card-head">
      <div><span class="tiny-label">${pt?'FISCAL · ENTRADAS':'TAX · PURCHASES'}</span><h4>${pt?'Documentos de setembro':'September documents'}</h4></div>
      <small>${pt?'Clique em um documento para abrir':'Open a document'}</small>
    </div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>${pt?'Documento':'Document'}</th><th>${pt?'Fornecedor':'Supplier'}</th><th>${pt?'Valor':'Value'}</th><th>Status</th></tr></thead>
      <tbody>${DATA.invoices.map(i=>`
        <tr data-invoice="${escapeAttr(i.id)}">
          <td><strong>${i.id}</strong><br><small>${i.date}</small></td>
          <td>${i.supplier}</td><td>${i.value}</td>
          <td><span class="pill ${i.status==='validated'?'good':'warn'}">${i.status==='validated'?(pt?'Validado':'Validated'):(pt?'Contexto ausente':'Context gap')}</span></td>
        </tr>`).join('')}</tbody>
    </table></div>
  </section>`;
}
function purposeOptions(selected=''){
  const base=[['',state.lang==='pt'?'Não definido':'Not defined'],...Object.keys(PURPOSE_LABELS).map(k=>[k,purposeLabel(k)])];
  return base.map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${escapeHtml(label)}</option>`).join('');
}
function renderFiscalDetail(){
  const pt=state.lang==='pt',i=currentInvoice();
  const applied=state.applied.fiscalPurpose?.invoiceId===i.id?state.applied.fiscalPurpose.value:i.purpose;
  const proposal=state.proposals.fiscalPurpose?.invoiceId===i.id?state.proposals.fiscalPurpose:null;
  return `<div class="workspace-grid">
    <section class="card">
      <div class="card-head">
        <div><span class="tiny-label">${i.id}</span><h4>${langValue(i.item)}</h4></div>
        <span class="pill ${applied?'good':'warn'}">${applied?(pt?'Contexto verificado':'Context verified'):(pt?'Contexto ausente':'Context gap')}</span>
      </div>
      <div class="details-grid">
        <div class="field"><span>${pt?'Fornecedor':'Supplier'}</span><strong>${i.supplier}</strong></div>
        <div class="field"><span>NCM</span><strong>${i.ncm}</strong></div>
        <div class="field"><span>${pt?'CFOP do documento':'Document CFOP'}</span><strong>${i.cfop}</strong></div>
        <div class="field"><span>${pt?'ICMS destacado':'Highlighted ICMS'}</span><strong>${i.icms}</strong></div>
        <div class="field"><span>${pt?'Empresa':'Company'}</span><strong>ACME Industrial</strong></div>
        <div class="field ${proposal?'proposed':''}" id="purposeField">
          <span>${pt?'Finalidade econômica':'Economic purpose'}</span>
          <select id="economicPurpose" aria-label="${pt?'Finalidade econômica':'Economic purpose'}">${purposeOptions(applied||'')}</select>
        </div>
      </div>
      <div class="actions-row">
        <button class="inline-btn" id="savePurpose">${pt?'Salvar contexto':'Save context'}</button>
        <button class="inline-btn" data-jump="context-ledger">${pt?'Ver Context Ledger':'View Context Ledger'}</button>
      </div>
      ${proposal?`<div class="proposal-card">
        <h5>${pt?'Proposta pendente — nenhuma alteração foi aplicada ainda':'Pending proposal — no change has been applied yet'}</h5>
        <div class="proposal-grid">
          <div><span>${pt?'Valor atual':'Current value'}</span><strong>${applied?purposeLabel(applied):(pt?'Não definido':'Not defined')}</strong></div>
          <div><span>${pt?'Valor proposto':'Proposed value'}</span><strong>${purposeLabel(proposal.value)}</strong></div>
        </div>
      </div>`:''}
    </section>
    <aside class="card">
      <span class="tiny-label">${pt?'POR QUE O CONTEXTO IMPORTA':'WHY CONTEXT MATTERS'}</span>
      <h4>${pt?'O documento descreve a operação. Não descreve sozinho a função econômica.':'The document describes the transaction. It does not, by itself, define economic purpose.'}</h4>
      <div class="context-gap">
        <strong>${pt?'Fato ausente':'Missing fact'}</strong>
        <p>${pt?'Como este item é usado pela ACME? Produção, manutenção, revenda, ativo ou consumo?':'How is this item used by ACME? Production, maintenance, resale, fixed asset or internal use?'}</p>
      </div>
      <div class="notice">${pt?'Exemplo ilustrativo. A demo demonstra coleta de contexto e governança de decisão; não concede crédito tributário nem substitui validação técnica.':'Illustrative example. The demo demonstrates context collection and decision governance; it does not grant tax credits or replace professional validation.'}</div>
    </aside>
  </div>`;
}

function renderAccountingList(){
  const pt=state.lang==='pt';
  return `<section class="card">
    <div class="card-head"><div><span class="tiny-label">${pt?'CONTÁBIL':'ACCOUNTING'}</span><h4>${pt?'Lançamentos de setembro':'September entries'}</h4></div></div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>ID</th><th>${pt?'Histórico':'Description'}</th><th>${pt?'Conta':'Account'}</th><th>Status</th></tr></thead>
      <tbody>${DATA.entries.map(e=>{
        const applied=state.applied.accounting?.entryId===e.id?state.applied.accounting:null;
        const account=applied?.account||e.account;
        return `<tr data-entry="${e.id}"><td>${e.id}</td><td>${langValue(e.history)}<br><small>${e.supplier}</small></td><td>${accountLabel(account)}</td><td><span class="pill ${e.status==='classified'||applied?'good':'warn'}">${e.status==='classified'||applied?(pt?'Classificado':'Classified'):(pt?'Revisão':'Review')}</span></td></tr>`;
      }).join('')}</tbody>
    </table></div>
  </section>`;
}
function accountOptions(selected){
  const keys=['other','productive_services','administrative_services','energy'];
  return keys.map(k=>`<option value="${k}" ${k===selected?'selected':''}>${escapeHtml(accountLabel(k))}</option>`).join('');
}
function costOptions(selected){
  const keys=['undefined','production','administrative'];
  return keys.map(k=>`<option value="${k}" ${k===selected?'selected':''}>${escapeHtml(costLabel(k))}</option>`).join('');
}
function renderAccountingDetail(){
  const pt=state.lang==='pt',e=currentEntry();
  const applied=state.applied.accounting?.entryId===e.id?state.applied.accounting:null;
  const account=applied?.account||e.account;
  const cost=applied?.costCenter||e.costCenter;
  const proposal=state.proposals.accounting?.entryId===e.id?state.proposals.accounting:null;
  return `<div class="workspace-grid">
    <section class="card">
      <div class="card-head">
        <div><span class="tiny-label">${e.id}</span><h4>${langValue(e.history)}</h4></div>
        <span class="pill ${applied?'good':'warn'}">${applied?(pt?'Classificado':'Classified'):(pt?'Revisão':'Review')}</span>
      </div>
      <div class="details-grid">
        <div class="field"><span>${pt?'Fornecedor':'Supplier'}</span><strong>${e.supplier}</strong></div>
        <div class="field"><span>${pt?'Valor':'Value'}</span><strong>${e.value}</strong></div>
        <div class="field ${proposal?'proposed':''}" id="accountField">
          <span>${pt?'Conta':'Account'}</span>
          <select id="accountSelect" aria-label="${pt?'Conta contábil':'Accounting account'}">${accountOptions(account)}</select>
        </div>
        <div class="field ${proposal?'proposed':''}" id="costCenterField">
          <span>${pt?'Centro de custo':'Cost center'}</span>
          <select id="costCenterSelect" aria-label="${pt?'Centro de custo':'Cost center'}">${costOptions(cost)}</select>
        </div>
        <div class="field"><span>${pt?'Competência':'Period'}</span><strong>09/2026</strong></div>
        <div class="field"><span>${pt?'Documento associado':'Linked document'}</span><strong>NFS-e 5214</strong></div>
      </div>
      <div class="actions-row">
        <button class="inline-btn" id="saveAccounting">${pt?'Salvar classificação':'Save classification'}</button>
      </div>
      ${proposal?`<div class="proposal-card">
        <h5>${pt?'Proposta pendente — a Platform ainda não foi alterada':'Pending proposal — Platform has not been changed yet'}</h5>
        <div class="proposal-grid">
          <div><span>${pt?'Conta proposta':'Proposed account'}</span><strong>${accountLabel(proposal.account)}</strong></div>
          <div><span>${pt?'Centro de custo proposto':'Proposed cost center'}</span><strong>${costLabel(proposal.costCenter)}</strong></div>
        </div>
      </div>`:''}
    </section>
    <aside class="card">
      <span class="tiny-label">${pt?'CONTEXTO CONTÁBIL':'ACCOUNTING CONTEXT'}</span>
      <h4>${pt?'“Outros” pode ser uma classificação válida, mas preserva pouco significado econômico.':'“Other” may be valid, but it preserves little economic meaning.'}</h4>
      <div class="context-gap">
        <strong>${pt?'Pergunta material':'Material question'}</strong>
        <p>${pt?'Esse serviço está ligado à produção ou à estrutura administrativa?':'Is this service linked to production or to the administrative structure?'}</p>
      </div>
    </aside>
  </div>`;
}

function reconciliationContractData(){
  const bridge=window.EvoluReconciliationBridge;
  if(!bridge?.analysis)return {sources:DATA.sources,finding:null,pending:null};

  const sources=bridge.analysis.evidence
    .filter(item=>item.type==='reconciliation_source')
    .map(item=>{
      const value=item.value&&typeof item.value==='object'?item.value:{};
      const amount=typeof value.amount==='number'?value.amount:0;
      return {
        category:value.dimension||'management',
        name:value.provider||item.source,
        value:new Intl.NumberFormat(state.lang==='pt'?'pt-BR':'en-US',{
          style:'currency',currency:'BRL'
        }).format(amount),
        note:{pt:item.label,en:item.label}
      };
    });

  return {
    sources:sources.length?sources:DATA.sources,
    finding:bridge.analysis.findings[0]||null,
    pending:bridge.context?.pendingItems?.[0]||bridge.analysis.missingContext?.[0]||null
  };
}

function renderReconciliation(){
  const pt=state.lang==='pt';
  const contract=reconciliationContractData();
  return `<div class="workspace-grid">
    <section class="card">
      <div class="card-head">
        <div><span class="tiny-label">${pt?'CASO DE RECONCILIAÇÃO':'RECONCILIATION CASE'}</span><h4>${pt?'Conciliação da competência · 09/2026':'Period reconciliation · 09/2026'}</h4></div>
        <span class="pill warn">${pt?'Investigação aberta':'Open investigation'}</span>
      </div>
      <div class="source-grid">${contract.sources.map(s=>`
        <div class="source-card">
          <span class="category">${CATEGORY_LABELS[s.category][state.lang]}</span>
          <b>${s.value}</b>
          <strong>${langValue(s.name)}</strong>
          <small>${langValue(s.note)}</small>
        </div>`).join('')}</div>
      <div class="recon-summary">
        <div class="notice">${pt?'Essas fontes representam dimensões diferentes. O primeiro passo não é escolher um número, mas identificar quais fontes deveriam reconciliar entre si e quais critérios cada uma utiliza.':'These sources represent different dimensions. The first step is not to choose a number, but to identify which sources should reconcile and which criteria each one uses.'}</div>
        <div class="recon-map">
          <div><span>${pt?'Fiscal':'Tax'}</span><strong>${pt?'documentos e eventos fiscais':'tax documents and events'}</strong></div>
          <div><span>${pt?'Contábil':'Accounting'}</span><strong>${pt?'escrituração e razão':'bookkeeping and ledger'}</strong></div>
          <div><span>${pt?'Gerencial':'Management'}</span><strong>${pt?'critério interno de leitura':'internal reporting criteria'}</strong></div>
          <div><span>${pt?'Financeiro':'Financial'}</span><strong>${pt?'movimentação de caixa/banco':'cash/bank movement'}</strong></div>
        </div>
      </div>
    </section>
    <aside class="card">
      <span class="tiny-label">${pt?'QUESTÃO EM ABERTO':'OPEN QUESTION'}</span>
      <h4>${pt?'O problema não é existir diferença. É não saber explicar sua origem.':'The problem is not that values differ. It is being unable to explain why.'}</h4>
      <div class="context-gap" ${contract.finding?`data-finding-id="${escapeAttr(contract.finding.findingId)}"`:''}>
        <strong>${pt?'Hipóteses em investigação':'Hypotheses under review'}</strong>
        <p>${pt?'Cancelamentos · corte de competência · documentos ausentes · critérios gerenciais · lançamentos manuais.':'Cancellations · period cut-off · missing documents · management criteria · manual entries.'}</p>
      </div>
      ${state.followupCreated?`<div class="notice"><strong>${pt?'Pendência criada':'Follow-up created'}</strong><br>${pt&&contract.pending?escapeHtml(contract.pending.description):(pt?'Confirmar a origem da diferença entre documentos fiscais e razão contábil na competência 09/2026.':'Confirm the source of the difference between tax documents and the accounting ledger for 09/2026.')}</div>`:''}
    </aside>
  </div>`;
}

function renderLedger(){
  const pt=state.lang==='pt';
  return `<section class="card">
    <div class="card-head">
      <div><span class="tiny-label">CONTEXT LEDGER</span><h4>${pt?'Fatos, fontes, evidências e lacunas da ACME':'Facts, sources, evidence and gaps for ACME'}</h4></div>
      <small>${pt?'Conhecimento operacional revisável':'Reviewable operational knowledge'}</small>
    </div>
    <div class="ledger">${state.ledger.map(row=>`
      <div class="ledger-row">
        <div><span>${pt?'Fato':'Fact'}</span><strong>${langValue(row.fact)}</strong></div>
        <div><span>${pt?'Valor':'Value'}</span><strong>${langValue(row.value)}</strong></div>
        <div><span>${pt?'Fonte':'Source'}</span><small>${langValue(row.source)}</small></div>
        <div><span>${pt?'Responsável':'Responsible'}</span><small>${langValue(row.recordedBy)}</small></div>
        <span class="pill ${row.status==='verified'?'good':'warn'}">${row.status==='verified'?(pt?'Verificado':'Verified'):(pt?'Ausente':'Missing')}</span>
        <div class="ledger-meta">
          <span><b>${pt?'Evidência':'Evidence'}:</b> ${langValue(row.evidence)}</span>
          <span><b>${pt?'Registrado':'Recorded'}:</b> ${row.recordedAt}</span>
          <span><b>${pt?'Escopo':'Scope'}:</b> ${row.scope}</span>
        </div>
      </div>`).join('')}</div>
    <div class="card-head" style="margin-top:22px">
      <div><span class="tiny-label">${pt?'TRILHA DE DECISÃO':'DECISION TRAIL'}</span><h4>${pt?'Decisões registradas nesta sessão':'Decisions recorded in this session'}</h4></div>
    </div>
    <div class="decision-list">
      ${state.decisions.length?state.decisions.map(d=>`
        <div class="decision-row">
          <div><span>${pt?'Objeto':'Object'}</span><strong>${d.object}</strong></div>
          <div><span>${pt?'Ação':'Action'}</span><strong>${langValue(d.action)}</strong></div>
          <div><span>${pt?'Origem':'Source'}</span><strong>${langValue(d.source)}</strong></div>
          <span class="pill good">${pt?'Registrado':'Recorded'}</span>
        </div>`).join(''):`<div class="notice">${pt?'Nenhuma decisão foi aplicada ainda. Propostas não são registradas como execução até que o usuário confirme.':'No decision has been applied yet. Proposals are not recorded as execution until the user confirms.'}</div>`}
    </div>
  </section>`;
}

function bindWorkspace(){
  $$('[data-page-jump],[data-jump]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.pageJump||el.dataset.jump)));
  $$('[data-invoice]').forEach(el=>el.addEventListener('click',()=>{
    state.selectedInvoice=el.dataset.invoice;
    go('fiscal-detail');
  }));
  $$('[data-entry]').forEach(el=>el.addEventListener('click',()=>{
    state.selectedEntry=el.dataset.entry;
    go('accounting-detail');
  }));
  const purpose=$('#economicPurpose');
  if(purpose){
    purpose.addEventListener('change',()=>{
      state.collected.pendingPurpose=purpose.value;
      if(state.manualTutorial?.kind==='purpose'&&purpose.value){
        signalTour('manual:purpose-selected');
        manualTutorialAdvance('purpose-selected');
      }
    });
  }
  const savePurpose=$('#savePurpose');
  if(savePurpose)savePurpose.addEventListener('click',()=>{
    const value=$('#economicPurpose')?.value;
    if(!value)return;
    applyPurpose(value,'manual');
    signalTour('manual:purpose-saved');
    manualTutorialAdvance('purpose-saved');
  });

  const account=$('#accountSelect');
  const cost=$('#costCenterSelect');
  if(account)account.addEventListener('change',()=>manualTutorialAdvance('account-selected'));
  if(cost)cost.addEventListener('change',()=>manualTutorialAdvance('cost-selected'));
  const saveAccounting=$('#saveAccounting');
  if(saveAccounting)saveAccounting.addEventListener('click',()=>{
    const acc=$('#accountSelect')?.value;
    const cc=$('#costCenterSelect')?.value;
    if(!acc||!cc||cc==='undefined')return;
    applyAccounting({account:acc,costCenter:cc},'manual');
    manualTutorialAdvance('accounting-saved');
  });
}

function go(page){
  const old=state.page;
  state.page=page;
  if(state.conversation.length&&old!==page){
    const [newTitle]=PAGE_META[page][state.lang];
    state.conversation.push({
      role:'system',
      text:state.lang==='pt'?`Contexto alterado: agora você está em ${newTitle}.`:`Context changed: you are now in ${newTitle}.`
    });
  }
  renderPage();
  if(state.assistantOpen){
    $('#intelligencePanel').hidden=false;
    $('#intelligenceFab').hidden=true;
    renderConversation();
  }
  signalTour(`page:${page}`);
}

function renderAssistantContext(){
  const [title]=getPageMeta();
  $('#panelContext').textContent=`ACME Industrial · ${title}`;
  const chips=['ACME Industrial'];
  if(state.page.startsWith('fiscal'))chips.push(state.lang==='pt'?'Fiscal':'Tax');
  else if(state.page.startsWith('accounting'))chips.push(state.lang==='pt'?'Contábil':'Accounting');
  else chips.push(state.lang==='pt'?'Operação':'Operation');
  chips.push('09/2026');
  if(state.page==='fiscal-detail')chips.push(currentInvoice().id);
  if(state.page==='accounting-detail')chips.push(currentEntry().id);
  $('#contextStrip').innerHTML=chips.map(c=>`<span>${escapeHtml(c)}</span>`).join('');
}
function renderSuggestions(){
  const host=$('#suggestions');
  const items=QUICK[state.page]?.[state.lang]||[];
  host.innerHTML=items.map(q=>`<button type="button" data-suggestion-key="${q.key}">${escapeHtml(q.label)}</button>`).join('');
  $$('[data-suggestion-key]').forEach(b=>b.addEventListener('click',()=>{
    $('#chatInput').value=b.textContent;
    $('#chatInput').focus();
    signalTour(`suggestion:${b.dataset.suggestionKey}`);
  }));
}

function openAssistant(){
  state.assistantOpen=true;
  $('#intelligencePanel').hidden=false;
  $('#intelligenceFab').hidden=true;
  renderAssistantContext();
  renderSuggestions();
  if(!state.conversation.length){
    pushAssistant(state.lang==='pt'
      ?'Estou acompanhando esta tela. Já tenho empresa, competência e objeto selecionado. Vou perguntar apenas pelo contexto que ainda estiver ausente.'
      :'I am following this screen. I already have the company, period and selected object. I will ask only for context that is still missing.');
  }else renderConversation();
  signalTour('assistant:open');
}
function closeAssistant(){
  state.assistantOpen=false;
  $('#intelligencePanel').hidden=true;
  $('#intelligenceFab').hidden=false;
}
function pushUser(text){state.conversation.push({role:'user',text});renderConversation()}
function pushAssistant(text,choices=[]){state.conversation.push({role:'assistant',text,choices});renderConversation()}
function renderConversation(){
  const host=$('#messages');
  host.innerHTML=state.conversation.map((m,i)=>`
    <div class="message ${m.role}">
      ${escapeHtml(m.text)}
      ${m.choices?.length?`<div class="choice-row">${m.choices.map(c=>`<button type="button" class="choice" data-choice-index="${i}" data-choice-value="${escapeAttr(c.value)}">${escapeHtml(c.label)}</button>`).join('')}</div>`:''}
    </div>`).join('');
  $$('[data-choice-value]').forEach(b=>b.addEventListener('click',()=>handleChoice(b.dataset.choiceValue)));
  host.scrollTop=host.scrollHeight;
  if(state.guided)setTimeout(showTourStep,40);
}

function handleQuestion(text){
  const q=text.toLowerCase();
  pushUser(text);
  const suggestion=(QUICK[state.page]?.[state.lang]||[]).find(x=>x.label.toLowerCase()===q);
  const key=suggestion?.key||'';

  if(state.page==='fiscal-detail'&&(key==='tax_effect'||q.includes('crédito')||q.includes('credit')||q.includes('tax effect')||q.includes('efeito tribut'))){
    signalTour('question:tax');
    pushAssistant(state.lang==='pt'
      ?'“Crédito” pode significar coisas diferentes conforme o tributo. Para evitar uma conclusão prematura, qual perspectiva você quer analisar primeiro?'
      :'“Credit” can mean different things depending on the tax. To avoid a premature conclusion, which perspective do you want to analyze first?',taxChoices());
    return;
  }
  if(state.page==='fiscal-detail'&&(key==='missing'||q.includes('faltando')||q.includes('missing'))){
    signalTour('question:missing');
    const i=currentInvoice();
    pushAssistant(state.lang==='pt'
      ?`O documento ${i.id} informa fornecedor, item, NCM, CFOP e tributos destacados. O fato material ainda ausente é a finalidade econômica de “${langValue(i.item)}” na ACME. Quer que eu conduza o registro ou prefere preencher manualmente?`
      :`Document ${i.id} contains supplier, item, NCM, CFOP and highlighted taxes. The material fact still missing is the economic purpose of “${langValue(i.item)}” at ACME. Do you want me to guide the record, or would you rather fill it manually?`,actionChoices());
    return;
  }
  if(state.page==='fiscal-detail'&&(key==='accounting_effect'||q.includes('contabilidade')||q.includes('accounting'))){
    pushAssistant(state.lang==='pt'
      ?'A mesma operação pode ter leituras diferentes. Na visão contábil, o ponto central é a natureza econômica e a classificação do gasto. Na visão fiscal, o tratamento depende do tributo e dos fatos aplicáveis. Posso abrir um caso contábil relacionado.'
      :'The same transaction can have different readings. In accounting, the core issue is economic nature and classification. In tax, treatment depends on the specific tax and applicable facts. I can open a related accounting case.',
      [{label:state.lang==='pt'?'Abrir visão contábil':'Open accounting view',value:'open_accounting'}]);
    return;
  }
  if(state.page==='accounting-detail'&&(key==='classify'||q.includes('classificar')||q.includes('classify'))){
    pushAssistant(state.lang==='pt'
      ?'Antes de sugerir uma conta, preciso entender a relação econômica do serviço. Ele está diretamente ligado à produção?'
      :'Before suggesting an account, I need to understand the economic relationship of the service. Is it directly linked to production?',relationChoices());
    return;
  }
  if(state.page==='accounting-detail'&&(key==='op_admin'||q.includes('operacional')||q.includes('administr')||q.includes('operational'))){
    pushAssistant(state.lang==='pt'
      ?'Essa distinção não deve ser inferida apenas pelo fornecedor. Onde esse serviço é efetivamente utilizado?'
      :'That distinction should not be inferred from the supplier alone. Where is this service actually used?',relationChoices());
    return;
  }
  if(state.page==='accounting-detail'&&key==='missing_accounting'){
    pushAssistant(state.lang==='pt'
      ?'O lançamento já possui valor, fornecedor, competência e documento associado. O ponto ainda indefinido é a relação econômica do serviço com a operação da empresa.'
      :'The entry already has value, supplier, period and a linked document. The unresolved point is the economic relationship of the service to the company operation.',relationChoices());
    return;
  }
  if(state.page==='reconciliation'&&(key==='recon_where'||q.includes('diverg')||q.includes('where'))){
    pushAssistant(state.lang==='pt'
      ?'Há quatro fontes para a mesma competência, mas elas não representam necessariamente a mesma dimensão. Antes de comparar valores, precisamos separar fiscal, contábil, gerencial e financeiro e definir quais pares deveriam reconciliar. Entre documentos fiscais e razão contábil, a diferença simulada é de R$ 4.685,34.'
      :'There are four sources for the same period, but they do not necessarily represent the same dimension. Before comparing values, we need to separate tax, accounting, management and financial views and define which pairs should reconcile. Between tax documents and the accounting ledger, the simulated difference is R$ 4,685.34.',
      [{label:state.lang==='pt'?'O que falta para conciliar?':'What is missing to reconcile?',value:'recon_missing'},{label:state.lang==='pt'?'Criar pendência':'Create follow-up',value:'create_followup'}]);
    return;
  }
  if(state.page==='reconciliation'&&(key==='recon_missing'||q.includes('conciliar')||q.includes('reconcile'))){
    handleChoice('recon_missing');return;
  }
  if(state.page==='reconciliation'&&(key==='recon_followup'||q.includes('pendência')||q.includes('follow-up'))){
    createFollowup();return;
  }
  if(state.page==='context-ledger'){
    if(key==='ledger_evidence'){
      pushAssistant(state.lang==='pt'
        ?'O Context Ledger separa fatos verificados de lacunas. O item com status “Ausente” ainda não possui evidência suficiente para ser usado como fato operacional.'
        :'Context Ledger separates verified facts from gaps. The item marked “Missing” still lacks enough evidence to be used as an operational fact.');
    }else if(key==='ledger_client'){
      const human=state.ledger.filter(r=>r.sourceType==='human');
      pushAssistant(human.length
        ?(state.lang==='pt'?`Há ${human.length} fato(s) confirmado(s) por interação humana nesta sessão.`:`There are ${human.length} fact(s) confirmed through human interaction in this session.`)
        :(state.lang==='pt'?'Ainda não há fatos confirmados pelo usuário nesta sessão.':'No facts have been confirmed by the user in this session yet.'));
    }else{
      pushAssistant(state.lang==='pt'
        ?'Nesta simulação, nenhum fato possui validade vencida. Em produção, cada tipo de contexto poderia ter uma política própria de revisão.'
        :'In this simulation, no fact is stale. In production, each context type could have its own review policy.');
    }
    return;
  }

  if(state.page==='dashboard'){
    pushAssistant(state.lang==='pt'
      ?'Hoje há dois tipos de atenção simulados: lacunas de contexto e divergências entre fontes. Abra um dos casos para trabalhar sobre um objeto específico.'
      :'There are two simulated attention types today: context gaps and cross-source divergences. Open a case to work on a specific object.');
    return;
  }
  if(state.page==='fiscal-documents'){
    const gaps=DATA.invoices.filter(i=>i.status==='context-gap').map(i=>i.id).join(', ');
    pushAssistant(state.lang==='pt'?`Documentos com contexto ausente: ${gaps}.`:`Documents with missing context: ${gaps}.`);
    return;
  }
  if(state.page==='accounting-entries'){
    pushAssistant(state.lang==='pt'
      ?'O lançamento CTB-4107 está sinalizado porque usa uma classificação genérica e ainda precisa de contexto econômico.'
      :'Entry CTB-4107 is flagged because it uses a generic classification and still needs economic context.');
    return;
  }
  pushAssistant(state.lang==='pt'
    ?'Esta versão pública demonstra cenários controlados. Use uma das perguntas sugeridas nesta tela para experimentar o fluxo contextual.'
    :'This public version demonstrates controlled scenarios. Use one of the suggested questions on this screen to experience the contextual flow.');
}

function taxChoices(){
  return ['ICMS','IPI','PIS/COFINS','IRPJ/CSLL'].map(v=>({label:v,value:`tax:${v}`}))
    .concat([{label:state.lang==='pt'?'Analisar todas as perspectivas':'Analyze all perspectives',value:'tax:all'}]);
}
function actionChoices(){
  return [
    {label:state.lang==='pt'?'Conduza comigo':'Guide me',value:'auto_context'},
    {label:state.lang==='pt'?'Quero fazer manualmente':'I want to do it manually',value:'manual_context'},
    {label:state.lang==='pt'?'Por que isso importa?':'Why does this matter?',value:'why_context'}
  ];
}
function relationChoices(){
  return [
    {label:state.lang==='pt'?'Sim, produção':'Yes, production',value:'relation:production'},
    {label:state.lang==='pt'?'Não, administrativo':'No, administrative',value:'relation:admin'},
    {label:state.lang==='pt'?'Não tenho certeza':'I am not sure',value:'relation:unknown'}
  ];
}
function decomposedRelationChoices(){
  return [
    {label:state.lang==='pt'?'Fábrica / produção':'Factory / production',value:'relation:production'},
    {label:state.lang==='pt'?'Escritório / administrativo':'Office / administrative',value:'relation:admin'}
  ];
}
function purposeChoices(){
  return Object.keys(PURPOSE_LABELS).filter(k=>k!=='administrative').map(k=>({label:purposeLabel(k),value:`purpose:${k}`}));
}

function handleChoice(value){
  if(value.startsWith('tax:')){
    const tax=value.slice(4);
    state.collected.tax=tax;
    if(tax==='all'){
      pushAssistant(state.lang==='pt'
        ?'Vou separar as perspectivas porque os critérios não são os mesmos:\n\n• ICMS — depende da natureza da operação, documentação e uso aplicável.\n• IPI — depende da operação e do enquadramento aplicável.\n• PIS/COFINS — depende do regime, natureza e critérios aplicáveis.\n• IRPJ/CSLL — não usa necessariamente “crédito” no mesmo sentido; a análise costuma envolver natureza, documentação, classificação e efeito na apuração.\n\nAntes de avançar, há um fato comum ainda ausente: a finalidade econômica desta aquisição.'
        :'I will separate the perspectives because the criteria are not the same:\n\n• ICMS — depends on transaction nature, documentation and applicable use.\n• IPI — depends on the transaction and applicable framework.\n• PIS/COFINS — depends on regime, nature and applicable criteria.\n• IRPJ/CSLL — does not necessarily use “credit” in the same sense; analysis often involves nature, documentation, classification and impact on the calculation.\n\nBefore moving on, one common fact is still missing: the economic purpose of this purchase.',
        actionChoices());
    }else if(tax==='IRPJ/CSLL'){
      pushAssistant(state.lang==='pt'
        ?'Aqui a linguagem muda. Para IRPJ/CSLL, a análise desta demo não trata “crédito” como se fosse um tributo indireto. Primeiro precisamos entender natureza, documentação e finalidade econômica do gasto.'
        :'The language changes here. For IRPJ/CSLL, this demo does not treat “credit” as if it were an indirect tax. First we need to understand the expense nature, documentation and economic purpose.',
        actionChoices());
    }else{
      pushAssistant((state.lang==='pt'?`Certo. Perspectiva selecionada: ${tax}. `:`Selected perspective: ${tax}. `)+
        (state.lang==='pt'?'Antes de qualquer conclusão, ainda falta confirmar como o item é usado pela empresa.':'Before any conclusion, we still need to confirm how the item is used by the company.'),
        actionChoices());
    }
    return;
  }

  if(value==='why_context'){
    pushAssistant(state.lang==='pt'
      ?'Porque documento fiscal, classificação contábil e tratamento tributário respondem perguntas diferentes. Sem a função econômica do item, a EVOLU mantém a incerteza explícita em vez de transformar uma hipótese em fato.'
      :'Because tax documents, accounting classification and tax treatment answer different questions. Without the item’s economic function, EVOLU keeps uncertainty explicit instead of turning a hypothesis into a fact.',
      actionChoices());
    return;
  }

  if(value==='auto_context'){
    pushAssistant(state.lang==='pt'
      ?'Qual é a finalidade econômica deste item nesta empresa?'
      :'What is the economic purpose of this item in this company?',purposeChoices());
    return;
  }

  if(value==='manual_context'){
    pushAssistant(state.lang==='pt'
      ?'Vou sair do caminho e conduzir o preenchimento na própria Platform.'
      :'I will get out of the way and guide the input directly in Platform.');
    signalTour('choice:manual_context');
    closeAssistant();
    if(!state.guided)startManualTutorial('purpose');
    return;
  }

  if(value.startsWith('purpose:')){
    const purpose=value.slice(8);
    const i=currentInvoice();
    state.proposals.fiscalPurpose={invoiceId:i.id,value:purpose};
    renderPage();
    pushAssistant(state.lang==='pt'
      ?`Proposta criada: registrar “${purposeLabel(purpose)}” como finalidade econômica. Nenhuma alteração foi aplicada ainda. Deseja confirmar?`
      :`Proposal created: record “${purposeLabel(purpose)}” as the economic purpose. No change has been applied yet. Do you want to confirm?`,
      [
        {label:state.lang==='pt'?'Confirmar alteração':'Confirm change',value:'apply_fiscal'},
        {label:state.lang==='pt'?'Fazer manualmente':'Do it manually',value:'manual_context'},
        {label:state.lang==='pt'?'Cancelar':'Cancel',value:'cancel_fiscal'}
      ]);
    return;
  }

  if(value==='apply_fiscal'){
    const proposal=state.proposals.fiscalPurpose;
    if(!proposal)return;
    applyPurpose(proposal.value,'assistant');
    pushAssistant(state.lang==='pt'
      ?'Alteração aplicada. O fato foi registrado com origem, evidência, responsável e escopo. A proposta deixou de ser apenas recomendação porque você autorizou a execução.'
      :'Change applied. The fact was recorded with source, evidence, responsible party and scope. The proposal stopped being only a recommendation because you authorized execution.',
      [{label:state.lang==='pt'?'Ver Context Ledger':'View Context Ledger',value:'open_ledger'},{label:state.lang==='pt'?'Analisar outro tributo':'Analyze another tax',value:'restart_tax'}]);
    return;
  }
  if(value==='cancel_fiscal'){
    state.proposals.fiscalPurpose=null;renderPage();
    pushAssistant(state.lang==='pt'?'Proposta descartada. Nenhum dado operacional foi alterado.':'Proposal discarded. No operational data was changed.');
    return;
  }
  if(value==='open_ledger'){go('context-ledger');return}
  if(value==='restart_tax'){pushAssistant(state.lang==='pt'?'Qual perspectiva você quer analisar agora?':'Which perspective do you want to analyze now?',taxChoices());return}
  if(value==='open_accounting'){go('accounting-detail');return}

  if(value.startsWith('relation:')){
    const rel=value.slice(9);
    if(rel==='unknown'){
      pushAssistant(state.lang==='pt'
        ?'Em vez de pedir uma classificação técnica, vou decompor a pergunta: onde esse serviço é efetivamente utilizado?'
        :'Instead of asking for a technical classification, I will decompose the question: where is this service actually used?',
        decomposedRelationChoices());
      return;
    }
    const e=currentEntry();
    const proposal={
      entryId:e.id,
      account:rel==='production'?'productive_services':'administrative_services',
      costCenter:rel==='production'?'production':'administrative'
    };
    state.proposals.accounting=proposal;
    renderPage();
    pushAssistant(state.lang==='pt'
      ?`Com esse contexto, minha proposta simulada é:\nConta: ${accountLabel(proposal.account)}\nCentro de custo: ${costLabel(proposal.costCenter)}\n\nA Platform ainda não foi alterada. Como deseja continuar?`
      :`With that context, my simulated proposal is:\nAccount: ${accountLabel(proposal.account)}\nCost center: ${costLabel(proposal.costCenter)}\n\nPlatform has not been changed yet. How do you want to continue?`,
      [
        {label:state.lang==='pt'?'Aplicar na demo':'Apply in demo',value:'apply_accounting'},
        {label:state.lang==='pt'?'Mostrar como':'Show me how',value:'manual_accounting'},
        {label:state.lang==='pt'?'Não alterar':'Do not change',value:'cancel_accounting'}
      ]);
    return;
  }

  if(value==='apply_accounting'){
    const proposal=state.proposals.accounting;
    if(!proposal)return;
    applyAccounting(proposal,'assistant');
    pushAssistant(state.lang==='pt'
      ?'Classificação simulada aplicada após sua autorização. A trilha preserva contexto, proposta, confirmação e resultado.'
      :'Simulated classification applied after your authorization. The trail preserves context, proposal, confirmation and result.');
    return;
  }
  if(value==='manual_accounting'){
    pushAssistant(state.lang==='pt'
      ?'Vou minimizar e destacar Conta, Centro de custo e Salvar, nessa ordem.'
      :'I will minimize and highlight Account, Cost center and Save, in that order.');
    closeAssistant();
    startManualTutorial('accounting');
    return;
  }
  if(value==='cancel_accounting'){
    state.proposals.accounting=null;renderPage();
    pushAssistant(state.lang==='pt'?'Proposta descartada. O lançamento permanece como estava.':'Proposal discarded. The entry remains unchanged.');
    return;
  }

  if(value==='recon_missing'){
    pushAssistant(state.lang==='pt'
      ?'Precisamos provar a origem da diferença antes de reconciliar. Próximas verificações: cancelamentos, corte de competência, documentos ausentes, critérios gerenciais e lançamentos manuais. Se nenhuma fonte resolver, o caso deve virar uma pergunta objetiva para a pessoa responsável.'
      :'We need to prove the source of the difference before reconciling. Next checks: cancellations, period cut-off, missing documents, management criteria and manual entries. If no source resolves it, the case should become a precise question for the responsible person.',
      [{label:state.lang==='pt'?'Criar pendência':'Create follow-up',value:'create_followup'}]);
    return;
  }
  if(value==='create_followup'){createFollowup();return}
}

function timestamp(){
  return new Intl.DateTimeFormat(state.lang==='pt'?'pt-BR':'en-US',{
    day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'
  }).format(new Date());
}
function upsertPurposeLedger(value,source){
  const row=state.ledger.find(r=>r.id==='bearing-purpose');
  row.value={pt:PURPOSE_LABELS[value].pt,en:PURPOSE_LABELS[value].en};
  row.source=source==='assistant'
    ?{pt:'Confirmação via EVOLU Intelligence',en:'Confirmation via EVOLU Intelligence'}
    :{pt:'Preenchimento manual na Platform',en:'Manual input in Platform'};
  row.sourceType='human';
  row.evidence=source==='assistant'
    ?{pt:'Confirmação explícita do usuário antes da execução',en:'Explicit user confirmation before execution'}
    :{pt:'Ação manual concluída no campo operacional',en:'Manual action completed in the operational field'};
  row.recordedAt=timestamp();
  row.recordedBy={pt:'Usuário da demo',en:'Demo user'};
  row.scope=`ACME Industrial · ${currentInvoice().id} · 09/2026`;
  row.status='verified';
}
function applyPurpose(value,source){
  const i=currentInvoice();
  state.applied.fiscalPurpose={invoiceId:i.id,value};
  state.proposals.fiscalPurpose=null;
  upsertPurposeLedger(value,source);
  state.decisions.push({
    object:i.id,
    action:{pt:`Finalidade econômica → ${PURPOSE_LABELS[value].pt}`,en:`Economic purpose → ${PURPOSE_LABELS[value].en}`},
    source:source==='assistant'
      ?{pt:'Autorização explícita via Intelligence',en:'Explicit authorization via Intelligence'}
      :{pt:'Execução manual guiada',en:'Guided manual execution'}
  });
  renderPage();
  showToast(t('saved'));
}
function applyAccounting(values,source){
  const e=currentEntry();
  state.applied.accounting={entryId:e.id,account:values.account,costCenter:values.costCenter};
  state.proposals.accounting=null;
  state.decisions.push({
    object:e.id,
    action:{pt:`${ACCOUNT_LABELS[values.account].pt} · ${COST_CENTER_LABELS[values.costCenter].pt}`,en:`${ACCOUNT_LABELS[values.account].en} · ${COST_CENTER_LABELS[values.costCenter].en}`},
    source:source==='assistant'
      ?{pt:'Autorização explícita via Intelligence',en:'Explicit authorization via Intelligence'}
      :{pt:'Execução manual guiada',en:'Guided manual execution'}
  });
  renderPage();
  showToast(t('applied'));
}
async function createFollowup(){
  let pendingItem=null;
  const bridge=window.EvoluReconciliationBridge;
  if(bridge?.createFollowup){
    try{
      pendingItem=await bridge.createFollowup();
    }catch(error){
      console.error(error);
      showToast(state.lang==='pt'?'Não foi possível criar a pendência.':'Could not create the follow-up.');
      return;
    }
  }

  state.followupCreated=true;
  state.decisions.push({
    object:'Reconciliação 09/2026',
    action:{pt:'Pendência para investigar origem da divergência',en:'Follow-up to investigate divergence source'},
    source:{pt:'Solicitação do usuário',en:'User request'}
  });
  renderPage();
  pushAssistant(state.lang==='pt'
    ?`Pendência simulada criada: “${pendingItem?.description||'Confirmar a origem da diferença entre documentos fiscais e razão contábil na competência 09/2026.'}” O registro preserva empresa, competência, fontes comparadas e hipóteses em aberto.`
    :'Simulated follow-up created: “Confirm the source of the difference between tax documents and the accounting ledger for 09/2026”. The record preserves company, period, compared sources and open hypotheses.');
  signalTour('followup:created');
}

window.addEventListener('evolu:reconciliation-ready',()=>{
  if(state.page==='reconciliation')renderPage();
});

function startManualTutorial(kind){
  state.manualTutorial={kind,step:0};
  if(kind==='purpose'){
    if(state.page!=='fiscal-detail')go('fiscal-detail');
    renderPage();showManualStep();
  }else{
    if(state.page!=='accounting-detail')go('accounting-detail');
    renderPage();showManualStep();
  }
}
function showManualStep(){
  if(!state.manualTutorial)return;
  clearTourTarget();
  const pt=state.lang==='pt';
  let selector,title,body;
  if(state.manualTutorial.kind==='purpose'){
    if(state.manualTutorial.step===0){
      selector='#economicPurpose';title=pt?'Passo 1 de 2 — selecione a finalidade':'Step 1 of 2 — select the purpose';
      body=pt?'Escolha uma finalidade econômica no campo destacado.':'Choose an economic purpose in the highlighted field.';
    }else{
      selector='#savePurpose';title=pt?'Passo 2 de 2 — salve o contexto':'Step 2 of 2 — save context';
      body=pt?'Clique em Salvar contexto para registrar o fato e sua origem.':'Click Save context to record the fact and its source.';
    }
  }else{
    if(state.manualTutorial.step===0){
      selector='#accountSelect';title=pt?'Passo 1 de 3 — escolha a conta':'Step 1 of 3 — choose the account';
      body=pt?'Selecione a conta contábil no campo destacado.':'Select the accounting account in the highlighted field.';
    }else if(state.manualTutorial.step===1){
      selector='#costCenterSelect';title=pt?'Passo 2 de 3 — centro de custo':'Step 2 of 3 — cost center';
      body=pt?'Agora selecione o centro de custo.':'Now select the cost center.';
    }else{
      selector='#saveAccounting';title=pt?'Passo 3 de 3 — salve':'Step 3 of 3 — save';
      body=pt?'Conclua a alteração manual.':'Complete the manual change.';
    }
  }
  const target=$(selector);
  if(!target){setTimeout(showManualStep,80);return}
  target.classList.add('tour-target');
  $('#tourOverlay').hidden=false;
  $('#tourStep').textContent=pt?'TUTORIAL MANUAL':'MANUAL TUTORIAL';
  $('#tourTitle').textContent=title;
  $('#tourBody').textContent=body;
  $('#tourNext').hidden=true;
  positionTourCard(target);
}
function manualTutorialAdvance(event){
  const mt=state.manualTutorial;
  if(!mt)return;
  if(mt.kind==='purpose'){
    if(mt.step===0&&event==='purpose-selected'){mt.step=1;showManualStep()}
    else if(mt.step===1&&event==='purpose-saved'){finishManualTutorial()}
  }else{
    if(mt.step===0&&event==='account-selected'){mt.step=1;showManualStep()}
    else if(mt.step===1&&event==='cost-selected'){mt.step=2;showManualStep()}
    else if(mt.step===2&&event==='accounting-saved'){finishManualTutorial()}
  }
}
function finishManualTutorial(){
  clearTourTarget();
  $('#tourOverlay').hidden=true;
  state.manualTutorial=null;
  openAssistant();
  pushAssistant(state.lang==='pt'
    ?'Concluído. Você executou a alteração manualmente e a trilha registrou a origem como ação guiada do usuário.'
    :'Done. You executed the change manually and the trail recorded the source as a guided user action.');
}

function startTour(){
  resetOperationalState(false);
  state.guided=true;
  state.tourIndex=0;
  document.querySelector('#experience').scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(showTourStep,450);
}
function showTourStep(){
  if(!state.guided)return;
  clearTourTarget();
  const item=TOUR[state.tourIndex];
  if(!item){finishTour(true);return}
  const target=findVisibleTarget(item.target);
  if(!target){setTimeout(showTourStep,120);return}
  $('#tourOverlay').hidden=false;
  target.classList.add('tour-target');
  $('#tourStep').textContent=`${state.lang==='pt'?'PASSO':'STEP'} ${state.tourIndex+1} / ${TOUR.length}`;
  $('#tourTitle').textContent=item.title[state.lang];
  $('#tourBody').textContent=item.body[state.lang];
  $('#tourNext').hidden=true;
  positionTourCard(target);
}
function signalTour(event){
  if(!state.guided)return;
  const item=TOUR[state.tourIndex];
  if(!item||item.event!==event)return;
  clearTourTarget();
  state.tourIndex++;
  setTimeout(showTourStep,120);
}
function positionTourCard(target){
  const shell=$('#osShell').getBoundingClientRect();
  const r=target.getBoundingClientRect();
  const card=$('#tourCard');
  const width=Math.min(360,shell.width-28);
  const desiredLeft=r.right-shell.left+16;
  const left=Math.min(Math.max(14,desiredLeft),Math.max(14,shell.width-width-14));
  const top=Math.min(Math.max(14,r.top-shell.top),Math.max(14,shell.height-220));
  card.style.left=`${left}px`;
  card.style.top=`${top}px`;
}
function findVisibleTarget(selector){
  const candidates=$$(selector);
  return candidates.find(el=>{
    const r=el.getBoundingClientRect();
    const style=getComputedStyle(el);
    return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0;
  })||candidates[0]||null;
}
function clearTourTarget(){$$('.tour-target').forEach(e=>e.classList.remove('tour-target'))}
function finishTour(showMessage=false){
  clearTourTarget();
  $('#tourOverlay').hidden=true;
  state.guided=false;
  state.tourIndex=0;
  if(showMessage)showToast(state.lang==='pt'?'Experiência guiada concluída.':'Guided experience complete.');
}

function resetOperationalState(show=true){
  const lang=state.lang,theme=state.theme;
  state=createState();
  state.lang=lang;state.theme=theme;
  renderPage();
  renderConversation();
  closeAssistant();
  finishTour(false);
  state.manualTutorial=null;
  if(show)showToast(t('resetDone'));
}
function showToast(text){
  const toast=$('#toast');
  toast.textContent=text;
  toast.hidden=false;
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.hidden=true,2200);
}

$$('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
  state.lang=b.dataset.lang;
  localStorage.setItem('genesis_lang',state.lang);
  state.conversation=[];
  applyI18n();
  if(state.assistantOpen)openAssistant();
}));
$$('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{
  state.theme=b.dataset.themeChoice;
  localStorage.setItem('genesis_theme',state.theme);
  applyTheme();
}));
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$('#intelligenceFab').addEventListener('click',openAssistant);
$('#closePanel').addEventListener('click',closeAssistant);
$('#minimizePanel').addEventListener('click',closeAssistant);
$('#composer').addEventListener('submit',e=>{
  e.preventDefault();
  const input=$('#chatInput'),text=input.value.trim();
  if(!text)return;
  input.value='';
  handleQuestion(text);
});
$('#chatInput').addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();
    $('#composer').requestSubmit();
  }
});
$('#startGuided').addEventListener('click',startTour);
$('#startFree').addEventListener('click',()=>document.querySelector('#experience').scrollIntoView({behavior:'smooth',block:'start'}));
$('#tourSkip').addEventListener('click',()=>{state.manualTutorial=null;finishTour(false)});
$('#resetExperience').addEventListener('click',()=>resetOperationalState(true));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(state.manualTutorial){state.manualTutorial=null;clearTourTarget();$('#tourOverlay').hidden=true}
    else if(state.guided)finishTour(false);
    else if(state.assistantOpen)closeAssistant();
  }
});

const systemTheme=matchMedia('(prefers-color-scheme: light)');
systemTheme.addEventListener?.('change',()=>{if(state.theme==='system')applyTheme()});

applyTheme();
applyI18n();
renderPage();
