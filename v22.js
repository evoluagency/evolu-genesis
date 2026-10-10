/* EVOLU Genesis V2.2 — Market Transformation Layer
   Extends V2.1 without introducing real integrations, tax conclusions or an LLM. */
(() => {
  const pt = () => state.lang === 'pt';
  const baseHandleQuestion = handleQuestion;
  const baseHandleChoice = handleChoice;
  const baseBindWorkspace = bindWorkspace;
  const baseResetOperationalState = resetOperationalState;
  const baseRenderLedger = renderLedger;

  Object.assign(I18N.pt, {
    introTitle:'Do dado fragmentado à decisão rastreável.',
    introBody:'A Platform registra o que aconteceu. A Intelligence interpreta o que isso pode significar. O contexto validado estabelece o que é verdadeiro para aquela empresa.',
    p1Title:'Conecte',p1Body:'Fontes diferentes preservam sua origem e significado.',
    p2Title:'Reconcilie',p2Body:'Divergência vira investigação, não escolha arbitrária.',
    p3Title:'Descubra',p3Body:'A Intelligence pergunta somente pelo contexto material ausente.',
    p4Title:'Reutilize',p4Body:'O que foi validado reduz o esforço do próximo caso.',
    sandboxTitle:'Veja a operação aprender sem transformar hipótese em fato.',
    conceptEyebrow:'A TRANSFORMAÇÃO',
    conceptTitle:'O trabalho deixa de ser repetir investigação e passa a reutilizar contexto validado.',
    known:'O QUE SABEMOS',knownBody:'Dados + origem + vigência',
    divergent:'O QUE DIVERGE',divergentBody:'Fontes + critérios + hipóteses',
    missing:'O QUE FALTA',missingBody:'Pergunta certa para a pessoa certa',
    decision:'O QUE APRENDEMOS',decisionBody:'Contexto reutilizável + trilha de decisão'
  });
  Object.assign(I18N.en, {
    introTitle:'From fragmented data to traceable decisions.',
    introBody:'Platform records what happened. Intelligence interprets what it might mean. Validated context establishes what is true for that business.',
    p1Title:'Connect',p1Body:'Different sources preserve their origin and meaning.',
    p2Title:'Reconcile',p2Body:'Divergence becomes investigation, not an arbitrary choice.',
    p3Title:'Discover',p3Body:'Intelligence asks only for material context that is missing.',
    p4Title:'Reuse',p4Body:'Validated context reduces effort in the next case.',
    sandboxTitle:'See the operation learn without turning a hypothesis into a fact.',
    conceptEyebrow:'THE TRANSFORMATION',
    conceptTitle:'Work shifts from repeating investigation to reusing validated context.',
    known:'WHAT WE KNOW',knownBody:'Data + origin + effective period',
    divergent:'WHAT DIVERGES',divergentBody:'Sources + criteria + hypotheses',
    missing:'WHAT IS MISSING',missingBody:'The right question to the right person',
    decision:'WHAT WE LEARNED',decisionBody:'Reusable context + decision trail'
  });

  const history = {maintenance:8,production:3,internal_use:1};
  DATA.invoices[0].itemCode = 'bearing-6305';
  DATA.invoices[0].history = history;
  if(!DATA.invoices.some(i => i.id === 'NF-e 70044')){
    DATA.invoices.splice(1,0,{
      id:'NF-e 70044', supplier:'Atlas Componentes Ltda.', date:'24/09/2026',
      value:'R$ 1.920,00', item:{pt:'Rolamento 6305',en:'Bearing 6305'},
      itemCode:'bearing-6305',ncm:'8482.10.90',cfop:'5102',icms:'R$ 244,80',
      purpose:null,status:'context-gap',reuseCandidate:true,history
    });
  }
  DATA.invoices.forEach(i => { if(!i.itemCode) i.itemCode = i.id; });

  DATA.sources = [
    {category:'fiscal',name:{pt:'Documentos fiscais / XML',en:'Tax documents / XML'},value:'R$ 812.440,20',note:{pt:'Eventos e documentos fiscais da competência',en:'Tax documents and events for the period'},origin:{pt:'Origem simulada: conector documental',en:'Simulated origin: document connector'}},
    {category:'accounting',name:{pt:'Escrituração / Razão',en:'Bookkeeping / Ledger'},value:'R$ 817.125,54',note:{pt:'Registros contábeis escriturados',en:'Posted accounting records'},origin:{pt:'Origem simulada: ERP contábil',en:'Simulated origin: accounting ERP'}},
    {category:'management',name:{pt:'Demonstrativo gerencial',en:'Management statement'},value:'R$ 789.980,00',note:{pt:'Leitura interna agregada',en:'Aggregated internal reporting view'},origin:{pt:'Origem simulada: planilha / BI',en:'Simulated origin: spreadsheet / BI'}},
    {category:'financial',name:{pt:'Movimentação financeira',en:'Financial movement'},value:'R$ 805.312,11',note:{pt:'Eventos conciliáveis de caixa e banco',en:'Reconcilable cash and bank events'},origin:{pt:'Origem simulada: conector bancário',en:'Simulated origin: banking connector'}}
  ];
  DATA.connectorExamples = ['SIEG','Domínio','ERP','Bancos','Planilhas'];

  QUICK.dashboard.pt = [
    {key:'attention',label:'O que exige minha atenção hoje?'},
    {key:'incomplete',label:'Quais casos ainda dependem de contexto?'},
    {key:'reuse',label:'Onde já existe contexto reutilizável?'}
  ];
  QUICK.dashboard.en = [
    {key:'attention',label:'What needs my attention today?'},
    {key:'incomplete',label:'Which cases still depend on context?'},
    {key:'reuse',label:'Where is validated context reusable?'}
  ];
  QUICK['fiscal-documents'].pt = [
    {key:'notes_context',label:'Quais notas precisam de contexto?'},
    {key:'history_pattern',label:'Onde o histórico não é conclusivo?'},
    {key:'reuse',label:'Onde já posso reutilizar contexto?'}
  ];
  QUICK['fiscal-documents'].en = [
    {key:'notes_context',label:'Which invoices need context?'},
    {key:'history_pattern',label:'Where is history inconclusive?'},
    {key:'reuse',label:'Where can I already reuse context?'}
  ];
  QUICK['fiscal-detail'].pt = [
    {key:'missing',label:'O que está faltando nesta operação?'},
    {key:'history_pattern',label:'O que o histórico sugere?'},
    {key:'tax_effect',label:'Essa operação pode ter efeito tributário?'}
  ];
  QUICK['fiscal-detail'].en = [
    {key:'missing',label:'What is missing in this transaction?'},
    {key:'history_pattern',label:'What does history suggest?'},
    {key:'tax_effect',label:'Can this transaction have a tax effect?'}
  ];
  QUICK['context-ledger'].pt = [
    {key:'ledger_evidence',label:'Quais fatos estão sem evidência?'},
    {key:'ledger_client',label:'O que foi confirmado por humanos?'},
    {key:'ledger_reuse',label:'Qual contexto pode ser reutilizado?'}
  ];
  QUICK['context-ledger'].en = [
    {key:'ledger_evidence',label:'Which facts lack evidence?'},
    {key:'ledger_client',label:'What was confirmed by humans?'},
    {key:'ledger_reuse',label:'Which context can be reused?'}
  ];

  function ensureState(){
    state.v22AppliedPurposes ||= {};
    state.v22QuestionsAsked ||= 0;
    state.v22ContextReuseCount ||= 0;
    state.v22ClientRequest ||= null;
    if(!state.ledger.some(r=>r.id==='bearing-history')){
      state.ledger.splice(Math.max(0,state.ledger.length-1),0,{
        id:'bearing-history',
        fact:{pt:'Padrão histórico · Rolamento 6305',en:'Historical pattern · Bearing 6305'},
        value:{pt:'8 manutenção · 3 produção · 1 consumo',en:'8 maintenance · 3 production · 1 internal use'},
        source:{pt:'Histórico operacional simulado',en:'Simulated operational history'},
        sourceType:'historical_pattern',
        evidence:{pt:'12 operações anteriores',en:'12 prior transactions'},
        recordedAt:'18/09/2026 08:40',
        recordedBy:{pt:'Sistema',en:'System'},
        scope:'ACME Industrial · bearing-6305',
        status:'historical_pattern',
        effective:'últimos 18 meses'
      });
    }
    const purpose=state.ledger.find(r=>r.id==='bearing-purpose');
    if(purpose && !purpose.effective) purpose.effective='—';
  }
  ensureState();

  const appliedPurpose = id => state.v22AppliedPurposes[id] || (DATA.invoices.find(i=>i.id===id)?.purpose ?? null);
  const bearingContext = () => {
    const row=state.ledger.find(r=>r.id==='bearing-purpose');
    return row && ['verified','human_confirmed','reused'].includes(row.status) && row.valueKey ? row : null;
  };
  const totalQuestions = () => state.v22QuestionsAsked || 0;
  const contextStatus = status => {
    const labels={
      verified:{pt:'DOCUMENTADO',en:'DOCUMENTED'},
      human_confirmed:{pt:'CONFIRMADO',en:'HUMAN CONFIRMED'},
      historical_pattern:{pt:'PADRÃO HISTÓRICO',en:'HISTORICAL PATTERN'},
      reused:{pt:'REUTILIZADO',en:'REUSED'},
      missing:{pt:'AUSENTE',en:'MISSING'}
    };
    return labels[status]?.[state.lang]||status;
  };

  renderDashboard = function(){
    ensureState();
    const isPt=pt(),ctx=bearingContext();
    return `
      <div class="grid metrics">
        <div class="metric"><span>${isPt?'Lacunas de contexto':'Context gaps'}</span><strong>13</strong><small>${isPt?'carteira simulada':'simulated portfolio'}</small></div>
        <div class="metric"><span>${isPt?'Divergências entre fontes':'Cross-source divergences'}</span><strong>7</strong><small>${isPt?'investigações abertas':'open investigations'}</small></div>
        <div class="metric live"><span>${isPt?'Contexto reutilizado':'Context reused'}</span><strong>${state.v22ContextReuseCount}</strong><small>${isPt?'nesta sessão':'this session'}</small></div>
        <div class="metric"><span>${isPt?'Cobertura de trilha':'Decision trace coverage'}</span><strong>${state.decisions.length?100:94}%</strong><small>${isPt?'métrica sintética':'synthetic metric'}</small></div>
      </div>
      <div class="workspace-grid">
        <section class="card">
          <div class="card-head"><div><span class="tiny-label">${isPt?'CASOS, NÃO APENAS TAREFAS':'CASES, NOT JUST TASKS'}</span><h4>${isPt?'O que precisa de julgamento':'What needs judgment'}</h4></div></div>
          <div class="case-list">
            <div class="case-row" data-v22-page="fiscal-detail" data-v22-id="NF-e 70031"><div class="case-index">01</div><div><strong>${isPt?'Documento completo, contexto incompleto':'Complete document, incomplete context'}</strong><small>NF-e 70031 · ${isPt?'Rolamento 6305':'Bearing 6305'}</small></div><span class="pill warn">${isPt?'Contexto':'Context'}</span></div>
            <div class="case-row" data-v22-page="accounting-detail" data-v22-id="CTB-4107"><div class="case-index">02</div><div><strong>${isPt?'Classificação genérica':'Generic classification'}</strong><small>CTB-4107 · Vector Consultoria</small></div><span class="pill warn">${isPt?'Julgamento':'Judgment'}</span></div>
            <div class="case-row" data-v22-page="reconciliation"><div class="case-index">03</div><div><strong>${isPt?'Fontes diferentes, critérios diferentes':'Different sources, different criteria'}</strong><small>${isPt?'Competência 09/2026':'Period 09/2026'}</small></div><span class="pill warn">${isPt?'Investigar':'Investigate'}</span></div>
          </div>
        </section>
        <aside class="card">
          <span class="tiny-label">${isPt?'CICLO DA INTELIGÊNCIA':'INTELLIGENCE LOOP'}</span>
          <h4>${ctx?(isPt?'A operação já aprendeu algo':'The operation has learned something'):(isPt?'A EVOLU ainda não sabe tudo':'EVOLU does not know everything yet')}</h4>
          <div class="source-grid">
            <div class="source-card"><span>${isPt?'Conhecido':'Known'}</span><b>${isPt?'empresa · regime · documento':'company · regime · document'}</b><small>${isPt?'dados estruturados e origem preservada':'structured data with preserved origin'}</small></div>
            <div class="source-card"><span>${isPt?'Padrão':'Pattern'}</span><b>8 / 3 / 1</b><small>${isPt?'histórico sugere, mas não prova':'history suggests, but does not prove'}</small></div>
            <div class="source-card"><span>${isPt?'Contexto validado':'Validated context'}</span><b>${ctx?langValue(ctx.value):(isPt?'ainda ausente':'still missing')}</b><small>${ctx?(isPt?'pronto para ser reutilizado':'ready to be reused'):(isPt?'precisa de confirmação humana':'needs human confirmation')}</small></div>
          </div>
          <div class="session-summary" style="margin-top:9px">
            <div><strong>${totalQuestions()}</strong><span>${isPt?'perguntas':'questions'}</span></div>
            <div><strong>${state.decisions.length}</strong><span>${isPt?'decisões':'decisions'}</span></div>
            <div><strong>${state.v22ContextReuseCount}</strong><span>${isPt?'reutilizações':'reuses'}</span></div>
          </div>
        </aside>
      </div>`;
  };

  function invoiceStatus(i){
    const isPt=pt(),applied=appliedPurpose(i.id);
    if(applied)return `<span class="pill good">${isPt?'Contexto verificado':'Context verified'}</span>`;
    if(i.reuseCandidate&&bearingContext())return `<span class="pill accent">${isPt?'Contexto disponível':'Context available'}</span>`;
    if(i.status==='validated')return `<span class="pill good">${isPt?'Validado':'Validated'}</span>`;
    return `<span class="pill warn">${isPt?'Contexto ausente':'Context gap'}</span>`;
  }

  renderFiscalList = function(){
    ensureState();const isPt=pt();
    return `<section class="card">
      <div class="card-head"><div><span class="tiny-label">${isPt?'FISCAL · ENTRADAS':'TAX · PURCHASES'}</span><h4>${isPt?'Documentos de setembro':'September documents'}</h4></div><small>${isPt?'Histórico é evidência, não conclusão automática':'History is evidence, not an automatic conclusion'}</small></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${isPt?'Documento':'Document'}</th><th>${isPt?'Fornecedor':'Supplier'}</th><th>${isPt?'Item':'Item'}</th><th>${isPt?'Valor':'Value'}</th><th>Status</th></tr></thead>
        <tbody>${DATA.invoices.map(i=>`<tr data-invoice="${escapeAttr(i.id)}"><td><strong>${i.id}</strong><br><small>${i.date}</small></td><td>${i.supplier}</td><td>${langValue(i.item)}</td><td>${i.value}</td><td>${invoiceStatus(i)}</td></tr>`).join('')}</tbody>
      </table></div>
    </section>`;
  };

  function historyPanel(i){
    if(!i.history)return '';
    const isPt=pt(),total=Object.values(i.history).reduce((a,b)=>a+b,0);
    const rows=[['maintenance',i.history.maintenance||0],['production',i.history.production||0],['internal_use',i.history.internal_use||0]];
    return `<div class="history-panel"><strong>${isPt?'Histórico operacional relacionado':'Related operational history'}</strong><p>${isPt?`${total} operações semelhantes nos últimos 18 meses. Padrão não é conclusão.`:`${total} similar transactions in the last 18 months. A pattern is not a conclusion.`}</p><div class="history-bars">${rows.map(([k,n])=>`<div class="history-bar"><span>${purposeLabel(k)}</span><div class="history-track"><i style="width:${Math.round(n/total*100)}%"></i></div><b>${n}</b></div>`).join('')}</div></div>`;
  }
  function evidencePanel(i){
    const isPt=pt(),purpose=appliedPurpose(i.id);
    return `<div class="evidence-list">
      <div class="evidence-item"><b>✓</b><span>${isPt?'Documento fiscal disponível':'Tax document available'}</span></div>
      <div class="evidence-item"><b>✓</b><span>${isPt?'Regime e atividade da empresa':'Company regime and activity'}</span></div>
      <div class="evidence-item"><b>✓</b><span>${isPt?'Histórico relacionado identificado':'Related history identified'}</span></div>
      <div class="evidence-item ${purpose?'':'missing'}"><b>${purpose?'✓':'?'}</b><span>${purpose?(isPt?'Finalidade confirmada para esta operação':'Purpose confirmed for this transaction'):(isPt?'Finalidade desta operação':'Purpose for this transaction')}</span></div>
      <div class="evidence-item ${purpose?'':'missing'}"><b>${purpose?'✓':'—'}</b><span>${purpose?(isPt?'Revisão humana registrada':'Human review recorded'):(isPt?'Revisão humana pendente':'Human review pending')}</span></div>
    </div>`;
  }

  renderFiscalDetail = function(){
    ensureState();
    const isPt=pt(),i=currentInvoice(),applied=appliedPurpose(i.id);
    const proposal=state.proposals.fiscalPurpose?.invoiceId===i.id?state.proposals.fiscalPurpose:null;
    const ctx=i.reuseCandidate?bearingContext():null;
    return `<div class="workspace-grid">
      <section class="card">
        <div class="card-head"><div><span class="tiny-label">${i.id}</span><h4>${langValue(i.item)}</h4></div>${invoiceStatus(i)}</div>
        ${ctx&&!applied?`<div class="reuse-banner"><strong>${isPt?'Contexto validado encontrado':'Validated context found'}</strong><p>${isPt?`Em um caso anterior, “${langValue(i.item)}” foi confirmado como ${langValue(ctx.value)}. Isso é evidência reutilizável, não autorização para copiar automaticamente.`:`In a prior case, “${langValue(i.item)}” was confirmed as ${langValue(ctx.value)}. This is reusable evidence, not authorization to copy automatically.`}</p></div>`:''}
        <div class="details-grid" style="margin-top:${ctx&&!applied?'10px':'0'}">
          <div class="field"><span>${isPt?'Fornecedor':'Supplier'}</span><strong>${i.supplier}</strong></div>
          <div class="field"><span>NCM</span><strong>${i.ncm}</strong></div>
          <div class="field"><span>${isPt?'CFOP do documento':'Document CFOP'}</span><strong>${i.cfop}</strong></div>
          <div class="field"><span>${isPt?'ICMS destacado':'Highlighted ICMS'}</span><strong>${i.icms}</strong></div>
          <div class="field"><span>${isPt?'Empresa':'Company'}</span><strong>ACME Industrial</strong></div>
          <div class="field ${proposal?'proposed':''}" id="purposeField"><span>${isPt?'Finalidade econômica':'Economic purpose'}</span><select id="economicPurpose">${purposeOptions(applied||'')}</select></div>
        </div>
        <div class="actions-row">
          <button class="inline-btn" id="savePurpose">${isPt?'Salvar contexto':'Save context'}</button>
          <button class="inline-btn" data-jump="context-ledger">${isPt?'Ver Context Ledger':'View Context Ledger'}</button>
          ${i.id==='NF-e 70031'&&applied?`<button class="inline-btn primary-action" data-v22-similar="NF-e 70044">${isPt?'Abrir operação semelhante →':'Open similar transaction →'}</button>`:''}
        </div>
        ${proposal?`<div class="proposal-card"><h5>${isPt?'Proposta pendente — a Platform ainda não foi alterada':'Pending proposal — Platform has not been changed yet'}</h5><div class="proposal-grid"><div><span>${isPt?'Atual':'Current'}</span><strong>${applied?purposeLabel(applied):(isPt?'Não definido':'Not defined')}</strong></div><div><span>${isPt?'Proposto':'Proposed'}</span><strong>${purposeLabel(proposal.value)}</strong></div></div></div>`:''}
      </section>
      <aside class="card">
        <span class="tiny-label">${isPt?'EVIDÊNCIA ANTES DA CONCLUSÃO':'EVIDENCE BEFORE CONCLUSION'}</span>
        <h4>${isPt?'Documento + histórico + contexto':'Document + history + context'}</h4>
        ${historyPanel(i)}
        <div style="height:8px"></div>${evidencePanel(i)}
        <div class="notice" style="margin-top:8px">${isPt?'Exemplo ilustrativo. A demo demonstra obtenção de contexto e governança; não determina crédito tributário nem substitui validação técnica.':'Illustrative example. The demo demonstrates context acquisition and governance; it does not determine tax credits or replace professional validation.'}</div>
      </aside>
    </div>`;
  };

  renderReconciliation = function(){
    const isPt=pt();
    const contract=reconciliationContractData();
    const finding=contract.finding;
    const pending=contract.pending;
    return `<div class="workspace-grid">
      <section class="card">
        <div class="card-head"><div><span class="tiny-label">${isPt?'CASO DE RECONCILIAÇÃO':'RECONCILIATION CASE'}</span><h4>${isPt?'Conciliação da competência · 09/2026':'Period reconciliation · 09/2026'}</h4></div><span class="pill warn">${isPt?'Investigação aberta':'Open investigation'}</span></div>
        <div class="source-grid">${contract.sources.map(s=>`<div class="source-card"><span class="category">${CATEGORY_LABELS[s.category][state.lang]}</span><b>${s.value}</b><strong>${langValue(s.name)}</strong><small>${langValue(s.note)}</small><span class="source-origin">${langValue(s.origin||'')}</span></div>`).join('')}</div>
        <div class="recon-summary">
          <div class="notice">${isPt?'Essas fontes representam dimensões diferentes. O primeiro passo não é escolher um número, mas definir quais fontes deveriam reconciliar entre si e por qual critério.':'These sources represent different dimensions. The first step is not to choose a number, but to define which sources should reconcile and by which criterion.'}</div>
          <div class="recon-map">
            <div><span>${isPt?'Fiscal':'Tax'}</span><strong>${isPt?'documentos e eventos':'documents and events'}</strong></div>
            <div><span>${isPt?'Contábil':'Accounting'}</span><strong>${isPt?'escrituração e razão':'bookkeeping and ledger'}</strong></div>
            <div><span>${isPt?'Gerencial':'Management'}</span><strong>${isPt?'critério interno':'internal criterion'}</strong></div>
            <div><span>${isPt?'Financeiro':'Financial'}</span><strong>${isPt?'caixa e banco':'cash and bank'}</strong></div>
          </div>
          <details class="connector-details"><summary>${isPt?'Ver exemplos de origens/conectores possíveis':'View examples of possible origins/connectors'}</summary><p>${isPt?'Os nomes abaixo são exemplos de ecossistema e não representam, nesta demo, conectores disponíveis ou dependências arquiteturais.':'The names below are ecosystem examples and do not represent available connectors or architectural dependencies in this demo.'}</p><div class="connector-chips">${DATA.connectorExamples.map(x=>`<span>${x}</span>`).join('')}</div></details>
        </div>
      </section>
      <aside class="card">
        <span class="tiny-label">${isPt?'INVESTIGAÇÃO, NÃO ESCOLHA':'INVESTIGATE, DO NOT GUESS'}</span>
        <h4>${isPt?'A diferença só vira problema quando não conseguimos explicar sua origem.':'A difference becomes a problem when we cannot explain its origin.'}</h4>
        <div class="context-gap" ${finding?`data-finding-id="${escapeAttr(finding.findingId)}"`:''}><strong>${isPt?'Hipóteses em aberto':'Open hypotheses'}</strong><p>${isPt?'Cancelamentos · corte de competência · documentos ausentes · critérios gerenciais · lançamentos manuais.':'Cancellations · period cut-off · missing documents · management criteria · manual entries.'}</p></div>
        ${pending?`<div class="notice" style="margin-top:8px"><strong>${isPt?'Pendência criada':'Follow-up created'}</strong><br>${escapeHtml(pending.description)}</div>`:''}
      </aside>
    </div>`;
  };

  renderLedger = function(){
    ensureState();const isPt=pt();
    const original=baseRenderLedger();
    const decisionBlock=original.match(/<div class="decision-list">[\s\S]*?<\/section>/)?.[0]?.replace(/<\/section>$/,'') || `<div class="decision-list"><div class="notice">${isPt?'Nenhuma ação autorizada ainda.':'No authorized action yet.'}</div></div>`;
    return `<section class="card">
      <div class="card-head"><div><span class="tiny-label">CONTEXT LEDGER</span><h4>${isPt?'Fatos com origem, evidência, vigência e escopo':'Facts with origin, evidence, effective period and scope'}</h4></div><small>${isPt?'Memória institucional, não histórico de chat':'Institutional memory, not chat history'}</small></div>
      <div class="ledger">${state.ledger.map(row=>`<div class="ledger-row"><div><span>${isPt?'Fato':'Fact'}</span><strong>${langValue(row.fact)}</strong></div><div><span>${isPt?'Valor':'Value'}</span><strong>${langValue(row.value)}</strong></div><div><span>${isPt?'Fonte':'Source'}</span><small>${langValue(row.source)}</small></div><div><span>${isPt?'Responsável':'Responsible'}</span><small>${langValue(row.recordedBy)}</small></div><span class="pill ${row.status==='missing'?'warn':row.status==='historical_pattern'?'accent':'good'}">${contextStatus(row.status)}</span><div class="ledger-meta"><span><b>${isPt?'Evidência':'Evidence'}:</b> ${langValue(row.evidence)}</span><span><b>${isPt?'Vigência':'Effective'}:</b> ${row.effective||'09/2026'}</span><span><b>${isPt?'Registrado':'Recorded'}:</b> ${row.recordedAt}</span><span><b>${isPt?'Escopo':'Scope'}:</b> ${row.scope}</span></div></div>`).join('')}</div>
      <div class="card-head" style="margin-top:18px"><div><span class="tiny-label">${isPt?'TRILHA DE DECISÃO':'DECISION TRAIL'}</span><h4>${isPt?'Somente ações autorizadas entram aqui':'Only authorized actions appear here'}</h4></div></div>
      ${decisionBlock}
    </section>`;
  };

  bindWorkspace = function(){
    baseBindWorkspace();
    $$('[data-v22-page]').forEach(el=>el.addEventListener('click',()=>{
      if(el.dataset.v22Id?.startsWith('NF-e'))state.selectedInvoice=el.dataset.v22Id;
      if(el.dataset.v22Id?.startsWith('CTB'))state.selectedEntry=el.dataset.v22Id;
      go(el.dataset.v22Page);
    }));
    $$('[data-v22-similar]').forEach(el=>el.addEventListener('click',()=>{
      state.selectedInvoice=el.dataset.v22Similar;go('fiscal-detail');
    }));
  };

  function actionChoices(){
    return [
      {label:pt()?'Conduza comigo':'Guide me',value:'v22:auto_context'},
      {label:pt()?'Quero fazer manualmente':'I want to do it manually',value:'manual_context'},
      {label:pt()?'Por que isso importa?':'Why does this matter?',value:'why_context'}
    ];
  }
  function purposeChoicesV22(){
    return [
      ...['production','maintenance','resale','fixed_asset','internal_use'].map(k=>({label:purposeLabel(k),value:`v22:purpose:${k}`})),
      {label:pt()?'Não sei':'I do not know',value:'v22:purpose:unknown'}
    ];
  }
  function whereChoices(){
    return [
      {label:pt()?'Linha de produção':'Production line',value:'v22:where:production'},
      {label:pt()?'Máquina existente':'Existing machine',value:'v22:where:machine'},
      {label:pt()?'Estoque para venda':'Inventory for resale',value:'v22:where:resale'},
      {label:pt()?'Escritório / uso interno':'Office / internal use',value:'v22:where:internal'},
      {label:pt()?'Ainda não sei':'I still do not know',value:'v22:where:unknown'}
    ];
  }
  function authorityChoices(){
    return [
      {label:pt()?'Produção':'Production',value:'v22:authority:production'},
      {label:pt()?'Compras':'Purchasing',value:'v22:authority:purchasing'},
      {label:pt()?'Administrativo':'Administrative',value:'v22:authority:administrative'},
      {label:pt()?'Sócio / gestor':'Owner / manager',value:'v22:authority:owner'}
    ];
  }
  function reuseChoices(){
    return [
      {label:pt()?'Sim, mesma finalidade':'Yes, same purpose',value:'v22:reuse:same'},
      {label:pt()?'Não, é uma exceção':'No, it is an exception',value:'v22:reuse:different'},
      {label:pt()?'Preciso confirmar':'I need to confirm',value:'v22:reuse:confirm'}
    ];
  }
  function proposePurpose(value,meta){
    const i=currentInvoice();
    state.proposals.fiscalPurpose={invoiceId:i.id,value,meta};
    renderPage();
    pushAssistant(pt()
      ?`Com base no contexto operacional, proponho registrar “${purposeLabel(value)}”. Isso ainda é uma proposta. A Platform só muda se você autorizar.`
      :`Based on the operational context, I propose recording “${purposeLabel(value)}”. This is still a proposal. Platform only changes if you authorize.`,
      [{label:pt()?'Confirmar alteração':'Confirm change',value:'v22:apply_fiscal'},{label:pt()?'Cancelar':'Cancel',value:'cancel_fiscal'}]);
  }
  function recordBearingContext(value,source,meta={}){
    const row=state.ledger.find(r=>r.id==='bearing-purpose');
    if(!row)return;
    row.value={pt:PURPOSE_LABELS[value].pt,en:PURPOSE_LABELS[value].en};
    row.valueKey=value;
    row.source=source==='reuse'?{pt:'Contexto anterior + reconfirmação',en:'Prior context + reconfirmation'}:{pt:'Confirmação via EVOLU Intelligence',en:'Confirmation via EVOLU Intelligence'};
    row.sourceType=source==='reuse'?'reused':'human';
    row.evidence=meta.evidence||{pt:'Confirmação explícita do usuário',en:'Explicit user confirmation'};
    row.recordedAt=new Intl.DateTimeFormat(state.lang==='pt'?'pt-BR':'en-US',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date());
    row.recordedBy=meta.sourceRole||{pt:'Usuário da demo',en:'Demo user'};
    row.scope='ACME Industrial · bearing-6305';
    row.status=source==='reuse'?'reused':'human_confirmed';
    row.effective='09/2026';
  }
  function applyV22Purpose(value,source,meta={}){
    const i=currentInvoice();
    state.v22AppliedPurposes[i.id]=value;
    state.proposals.fiscalPurpose=null;
    recordBearingContext(value,source,meta);
    state.decisions.push({
      object:i.id,
      action:{pt:`Finalidade econômica → ${PURPOSE_LABELS[value].pt}`,en:`Economic purpose → ${PURPOSE_LABELS[value].en}`},
      source:source==='reuse'?{pt:'Contexto recuperado + reconfirmação',en:'Retrieved context + reconfirmation'}:{pt:'Autorização explícita via Intelligence',en:'Explicit authorization via Intelligence'}
    });
    renderPage();showToast(t('saved'));
  }

  handleQuestion = function(text){
    ensureState();
    const q=text.toLowerCase();
    const suggestion=(QUICK[state.page]?.[state.lang]||[]).find(x=>x.label.toLowerCase()===q);
    const key=suggestion?.key||'';
    if(state.page==='fiscal-detail' && ['missing','history_pattern','tax_effect'].includes(key)){
      state.v22QuestionsAsked++;
      pushUser(text);
      const i=currentInvoice(),ctx=i.reuseCandidate?bearingContext():null;
      if(key==='missing'){
        signalTour('question:missing');
        if(ctx){
          pushAssistant(pt()
            ?`O documento está disponível e existe contexto validado anterior para o mesmo item: ${langValue(ctx.value)}. O que falta não é redescobrir tudo; é confirmar se esta operação é uma exceção.`
            :`The document is available and there is previously validated context for the same item: ${langValue(ctx.value)}. What is missing is not rediscovering everything; it is confirming whether this transaction is an exception.`,
            reuseChoices());
        }else{
          pushAssistant(pt()
            ?`O documento ${i.id} informa fornecedor, item, NCM, CFOP e tributos destacados. Também encontrei um padrão histórico, mas ele não prova a finalidade desta operação. Falta confirmar como “${langValue(i.item)}” será usado.`
            :`Document ${i.id} contains supplier, item, NCM, CFOP and highlighted taxes. I also found a historical pattern, but it does not prove the purpose of this transaction. We still need to confirm how “${langValue(i.item)}” will be used.`,
            actionChoices());
        }
        return;
      }
      if(key==='history_pattern'){
        pushAssistant(pt()
          ?'Encontrei 12 operações semelhantes: 8 manutenção, 3 produção e 1 consumo. Isso é evidência histórica, não um fato sobre esta operação.'
          :'I found 12 similar transactions: 8 maintenance, 3 production and 1 internal use. This is historical evidence, not a fact about this transaction.',
          [{label:pt()?'Descobrir o contexto atual':'Discover current context',value:'v22:auto_context'}]);
        return;
      }
      pushAssistant(pt()
        ?'Antes de qualquer conclusão tributária, preciso separar a perspectiva e confirmar os fatos econômicos aplicáveis. A demo não determina direito a crédito; demonstra como o contexto é obtido e governado.'
        :'Before any tax conclusion, I need to separate the perspective and confirm the applicable economic facts. The demo does not determine credit entitlement; it demonstrates how context is acquired and governed.',
        actionChoices());
      return;
    }
    if(state.page==='context-ledger' && key==='ledger_reuse'){
      state.v22QuestionsAsked++;pushUser(text);
      const ctx=bearingContext();
      pushAssistant(ctx?(pt()?`O contexto “${langValue(ctx.value)}” está disponível para operações do mesmo item, mas precisa ser reconfirmado por escopo.`:`The context “${langValue(ctx.value)}” is available for transactions involving the same item, but must be reconfirmed by scope.`):(pt()?'Ainda não existe contexto humano validado para reutilizar.':'There is no human-validated context available for reuse yet.'));
      return;
    }
    baseHandleQuestion(text);
  };

  handleChoice = function(value){
    ensureState();
    if(!value.startsWith('v22:')){baseHandleChoice(value);return}
    signalTour(`choice:${value}`);
    const action=value.slice(4);
    if(action==='auto_context'){
      pushAssistant(pt()?'Qual é a finalidade econômica deste item? Se você não souber a classificação, escolha “Não sei”.':'What is the economic purpose of this item? If you do not know the classification, choose “I do not know”.',purposeChoicesV22());return;
    }
    if(action==='purpose:unknown'){
      pushAssistant(pt()?'Sem problema. Em vez de pedir uma classificação técnica: onde esse item será efetivamente utilizado?':'No problem. Instead of asking for a technical classification: where will this item actually be used?',whereChoices());return;
    }
    if(action.startsWith('purpose:')){
      proposePurpose(action.slice(8),{sourceRole:{pt:'Usuário da demo',en:'Demo user'},evidence:{pt:'Finalidade informada diretamente na interação',en:'Purpose provided directly in the interaction'}});return;
    }
    if(action.startsWith('where:')){
      const where=action.slice(6);
      if(where==='unknown'){pushAssistant(pt()?'Quem na empresa consegue confirmar o uso deste item?':'Who in the company can confirm how this item is used?',authorityChoices());return}
      const map={production:'production',machine:'maintenance',resale:'resale',internal:'internal_use'};
      proposePurpose(map[where],{
        sourceRole:{pt:'Resposta operacional do usuário',en:'User operational answer'},
        evidence:{pt:`Uso informado: ${where==='machine'?'máquina existente':where==='production'?'linha de produção':where==='resale'?'estoque para venda':'uso interno'}`,en:`Reported use: ${where==='machine'?'existing machine':where==='production'?'production line':where==='resale'?'inventory for resale':'internal use'}`}
      });return;
    }
    if(action.startsWith('authority:')){
      const role=action.slice(10);state.v22ClientRequest={role};
      pushAssistant(pt()
        ?'Pendência contextual criada para a pessoa responsável. Em produção, a pergunta poderia ser enviada ao cliente. Nesta demo, simule a resposta para continuar.'
        :'Context request created for the responsible person. In production, the question could be sent to the client. In this demo, simulate the reply to continue.',
        [{label:pt()?'Simular resposta':'Simulate response',value:`v22:simulate:${role}`}]);return;
    }
    if(action.startsWith('simulate:')){
      const role=action.slice(9);
      proposePurpose('maintenance',{
        sourceRole:{pt:role==='production'?'Responsável de Produção':'Responsável indicado',en:role==='production'?'Production manager':'Designated responsible person'},
        evidence:{pt:'Resposta simulada: “Será usado na manutenção preventiva da máquina de embalagem.”',en:'Simulated reply: “It will be used for preventive maintenance of the packaging machine.”'}
      });return;
    }
    if(action==='apply_fiscal'){
      const p=state.proposals.fiscalPurpose;if(!p)return;
      applyV22Purpose(p.value,'assistant',p.meta);
      pushAssistant(pt()
        ?'Alteração aplicada após autorização. O contexto agora possui origem, evidência, vigência e escopo. Ele pode ajudar no próximo caso sem virar regra automática.'
        :'Change applied after authorization. Context now has origin, evidence, effective period and scope. It can help with the next case without becoming an automatic rule.',
        currentInvoice().id==='NF-e 70031'?[{label:pt()?'Abrir operação semelhante':'Open similar transaction',value:'v22:open_similar'}]:[{label:pt()?'Ver Context Ledger':'View Context Ledger',value:'open_ledger'}]);return;
    }
    if(action==='open_similar'){state.selectedInvoice='NF-e 70044';go('fiscal-detail');closeAssistant();return}
    if(action==='reuse:same'){
      const ctx=bearingContext();if(!ctx)return;
      state.proposals.fiscalPurpose={invoiceId:currentInvoice().id,value:ctx.valueKey||'maintenance',meta:{
        sourceRole:{pt:'Reconfirmação do usuário',en:'User reconfirmation'},
        evidence:{pt:'Contexto anterior recuperado e reconfirmado para a nova operação',en:'Prior context retrieved and reconfirmed for the new transaction'}
      }};
      renderPage();
      pushAssistant(pt()
        ?`Proposta: reutilizar “${purposeLabel(ctx.valueKey||'maintenance')}” nesta operação. A Platform ainda não foi alterada.`
        :`Proposal: reuse “${purposeLabel(ctx.valueKey||'maintenance')}” for this transaction. Platform has not been changed yet.`,
        [{label:pt()?'Confirmar reutilização':'Confirm reuse',value:'v22:apply_reuse'},{label:pt()?'Cancelar':'Cancel',value:'cancel_fiscal'}]);return;
    }
    if(action==='reuse:different'){pushAssistant(pt()?'O contexto anterior continua válido no escopo anterior. Qual é a finalidade desta nova operação?':'Prior context remains valid in its prior scope. What is the purpose of this new transaction?',purposeChoicesV22());return}
    if(action==='reuse:confirm'){pushAssistant(pt()?'Quem consegue confirmar se esta operação segue a mesma finalidade?':'Who can confirm whether this transaction has the same purpose?',authorityChoices());return}
    if(action==='apply_reuse'){
      const p=state.proposals.fiscalPurpose;if(!p)return;
      applyV22Purpose(p.value,'reuse',p.meta);state.v22ContextReuseCount++;
      pushAssistant(pt()
        ?'Contexto reutilizado e reconfirmado. O segundo caso exigiu uma confirmação em vez de repetir toda a investigação. Esse é o ciclo de memória operacional da EVOLU.'
        :'Context reused and reconfirmed. The second case required one confirmation instead of repeating the whole investigation. This is EVOLU’s operational memory loop.',
        [{label:pt()?'Ir para Reconciliação':'Go to Reconciliation',value:'v22:open_reconciliation'},{label:pt()?'Ver Context Ledger':'View Context Ledger',value:'open_ledger'}]);return;
    }
    if(action==='open_reconciliation'){go('reconciliation');closeAssistant();return}
  };

  resetOperationalState = function(show=true){
    baseResetOperationalState(show);ensureState();
  };

  $('#intelligenceFab').addEventListener('click',()=>{
    setTimeout(()=>{
      ensureState();
      const i=state.page==='fiscal-detail'?currentInvoice():null;
      const ctx=i?.reuseCandidate?bearingContext():null;
      if(!ctx)return;
      const last=state.conversation[state.conversation.length-1];
      const hasReuse=last?.choices?.some(c=>String(c.value).startsWith('v22:reuse:'));
      if(!hasReuse){
        pushAssistant(pt()
          ?`Encontrei contexto validado para “${langValue(i.item)}”: ${langValue(ctx.value)}. Não vou copiar automaticamente. Esta operação segue a mesma finalidade?`
          :`I found validated context for “${langValue(i.item)}”: ${langValue(ctx.value)}. I will not copy it automatically. Does this transaction have the same purpose?`,
          reuseChoices());
      }
    },0);
  },true);

  TOUR.splice(0,TOUR.length,
    {id:'open-fiscal',target:'[data-page="fiscal-documents"]',event:'page:fiscal-documents',title:{pt:'Comece pela operação',en:'Start from the operation'},body:{pt:'Abra os documentos fiscais. A Intelligence começa pelo objeto de trabalho, não pelo chat.',en:'Open tax documents. Intelligence starts from the work object, not the chat.'}},
    {id:'open-first',target:'[data-invoice="NF-e 70031"]',event:'page:fiscal-detail',title:{pt:'Documento não é contexto',en:'A document is not context'},body:{pt:'A nota possui dados estruturados, mas ainda não explica a finalidade econômica.',en:'The invoice has structured data, but it still does not explain economic purpose.'}},
    {id:'open-intelligence',target:'#intelligenceFab',event:'assistant:open',title:{pt:'Chame a Intelligence',en:'Open Intelligence'},body:{pt:'Ela já recebe empresa, competência, tela e documento.',en:'It already receives company, period, screen and document.'}},
    {id:'choose-missing',target:'[data-suggestion-key="missing"]',event:'suggestion:missing',title:{pt:'Pergunte pelo que falta',en:'Ask what is missing'},body:{pt:'A EVOLU separa dado, histórico e contexto ausente.',en:'EVOLU separates data, history and missing context.'}},
    {id:'send-missing',target:'#composer .send',event:'question:missing',title:{pt:'Envie',en:'Send it'},body:{pt:'Agora ela mostra por que o histórico não basta.',en:'Now it shows why history is not enough.'}},
    {id:'guide',target:'[data-choice-value="v22:auto_context"]',event:'choice:v22:auto_context',title:{pt:'Deixe a EVOLU conduzir',en:'Let EVOLU guide'},body:{pt:'O objetivo é chegar ao fato operacional sem exigir linguagem contábil.',en:'The goal is to reach the operational fact without requiring accounting language.'}},
    {id:'dont-know',target:'[data-choice-value="v22:purpose:unknown"]',event:'choice:v22:purpose:unknown',title:{pt:'Diga que não sabe',en:'Say you do not know'},body:{pt:'A Intelligence deve fazer uma pergunta melhor, não encerrar o fluxo.',en:'Intelligence should ask a better question, not stop the flow.'}},
    {id:'machine',target:'[data-choice-value="v22:where:machine"]',event:'choice:v22:where:machine',title:{pt:'Responda em linguagem operacional',en:'Answer in operational language'},body:{pt:'Escolha “Máquina existente”. A resposta vira proposta, não fato automático.',en:'Choose “Existing machine”. The answer becomes a proposal, not an automatic fact.'}},
    {id:'apply-first',target:'[data-choice-value="v22:apply_fiscal"]',event:'choice:v22:apply_fiscal',title:{pt:'Autorize a ação',en:'Authorize the action'},body:{pt:'A Platform só muda após confirmação explícita.',en:'Platform only changes after explicit confirmation.'}},
    {id:'similar',target:'[data-v22-similar="NF-e 70044"]',event:'page:fiscal-detail',title:{pt:'Abra um novo caso semelhante',en:'Open a similar new case'},body:{pt:'Agora o contexto validado deve reduzir o esforço do segundo caso.',en:'Now validated context should reduce the effort in the second case.'}},
    {id:'reopen-intelligence',target:'#intelligenceFab',event:'assistant:open',title:{pt:'Veja o contexto reaparecer',en:'See context reappear'},body:{pt:'A EVOLU recupera o que foi validado e pergunta somente pela exceção.',en:'EVOLU retrieves what was validated and asks only about the exception.'}},
    {id:'same',target:'[data-choice-value="v22:reuse:same"]',event:'choice:v22:reuse:same',title:{pt:'Confirme a reutilização',en:'Confirm reuse'},body:{pt:'O primeiro caso exigiu investigação; o segundo precisa de uma confirmação.',en:'The first case required investigation; the second needs one confirmation.'}},
    {id:'apply-reuse',target:'[data-choice-value="v22:apply_reuse"]',event:'choice:v22:apply_reuse',title:{pt:'Registre a decisão',en:'Record the decision'},body:{pt:'A reutilização mantém origem, evidência e trilha.',en:'Reuse preserves origin, evidence and the decision trail.'}},
    {id:'recon',target:'[data-page="reconciliation"]',event:'page:reconciliation',title:{pt:'Reconcilie sem adivinhar',en:'Reconcile without guessing'},body:{pt:'Fontes diferentes preservam significado. A EVOLU investiga quais deveriam reconciliar e por quê.',en:'Different sources preserve meaning. EVOLU investigates which should reconcile and why.'}}
  );

  applyI18n();
  renderPage();
})();
