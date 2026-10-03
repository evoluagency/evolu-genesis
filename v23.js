/* EVOLU Genesis V2.3 — brand, nomenclature, voice and route standards */
(() => {
  const isPt=()=>state.lang==='pt';
  const baseRenderPage=renderPage;
  const baseRenderConversation=renderConversation;
  const baseApplyI18n=applyI18n;

  Object.assign(I18N.pt,{
    deterministic:'Ambiente demonstrativo · dados sintéticos',
    navOperational:'REVISÃO E CONTROLE',
    mobileContext:'Informações',
    chatPlaceholder:'Pergunte sobre esta operação',
    demoFooter:'Dados sintéticos · análises pré-configuradas',
    saved:'Informação salva.',
    applied:'Alteração aplicada.',
    resetDone:'Ambiente reiniciado.'
  });
  Object.assign(I18N.en,{
    deterministic:'Demo environment · synthetic data',
    navOperational:'REVIEW & CONTROL',
    mobileContext:'Information',
    chatPlaceholder:'Ask about this transaction',
    demoFooter:'Synthetic data · preconfigured analyses',
    saved:'Information saved.',
    applied:'Change applied.',
    resetDone:'Environment reset.'
  });

  PAGE_META.reconciliation={
    pt:['Conciliação','Revisão e controle / Conciliação'],
    en:['Reconciliation','Review & control / Reconciliation']
  };
  PAGE_META['context-ledger']={
    pt:['Informações da empresa','Revisão e controle / Informações da empresa'],
    en:['Company information','Review & control / Company information']
  };

  QUICK.dashboard.pt=[
    {key:'attention',label:'O que exige revisão hoje?'},
    {key:'incomplete',label:'Quais informações ainda estão pendentes?'},
    {key:'reuse',label:'Onde já existe informação validada?'}
  ];
  QUICK.dashboard.en=[
    {key:'attention',label:'What needs review today?'},
    {key:'incomplete',label:'Which information is still pending?'},
    {key:'reuse',label:'Where is validated information available?'}
  ];
  QUICK['fiscal-documents'].pt=[
    {key:'notes_context',label:'Quais notas têm informação pendente?'},
    {key:'history_pattern',label:'O que o histórico mostra?'},
    {key:'reuse',label:'Onde já existe informação validada?'}
  ];
  QUICK['fiscal-documents'].en=[
    {key:'notes_context',label:'Which invoices have missing information?'},
    {key:'history_pattern',label:'What does the history show?'},
    {key:'reuse',label:'Where is validated information available?'}
  ];
  QUICK['fiscal-detail'].pt=[
    {key:'missing',label:'O que falta para concluir esta análise?'},
    {key:'history_pattern',label:'O que o histórico mostra?'},
    {key:'tax_effect',label:'Quero revisar o tratamento tributário.'}
  ];
  QUICK['fiscal-detail'].en=[
    {key:'missing',label:'What is missing to complete this analysis?'},
    {key:'history_pattern',label:'What does the history show?'},
    {key:'tax_effect',label:'I want to review the tax treatment.'}
  ];
  QUICK['accounting-entries'].pt=[
    {key:'entries_review',label:'Quais lançamentos precisam de revisão?'},
    {key:'generic',label:'Onde a classificação está genérica?'},
    {key:'tax_divergence',label:'Há divergência com documentos fiscais?'}
  ];
  QUICK['accounting-detail'].pt=[
    {key:'classify',label:'Como este lançamento deve ser classificado?'},
    {key:'op_admin',label:'Esta despesa é operacional ou administrativa?'},
    {key:'missing_accounting',label:'O que falta para concluir a revisão?'}
  ];
  QUICK.reconciliation.pt=[
    {key:'recon_where',label:'Onde está a divergência?'},
    {key:'recon_missing',label:'O que falta para conciliar?'},
    {key:'recon_followup',label:'Criar pendência para o cliente.'}
  ];
  QUICK['context-ledger'].pt=[
    {key:'ledger_evidence',label:'Quais informações estão sem evidência?'},
    {key:'ledger_client',label:'O que foi confirmado pelo cliente?'},
    {key:'ledger_reuse',label:'Qual informação pode ser reutilizada?'}
  ];
  QUICK['context-ledger'].en=[
    {key:'ledger_evidence',label:'Which information lacks evidence?'},
    {key:'ledger_client',label:'What was confirmed by the client?'},
    {key:'ledger_reuse',label:'Which information can be reused?'}
  ];

  const replacementsPt=[
    ['CONTEXT LEDGER','INFORMAÇÕES DA EMPRESA'],
    ['Context Ledger','Informações da empresa'],
    ['Contexto validado encontrado','Informação previamente validada'],
    ['Contexto verificado','Informação confirmada'],
    ['Contexto disponível','Informação disponível'],
    ['Contexto ausente','Informação pendente'],
    ['Salvar contexto','Salvar informação'],
    ['Ver informações da empresa','Ver informações da empresa'],
    ['Ver Context Ledger','Ver informações da empresa'],
    ['CICLO DA INTELIGÊNCIA','RESUMO DA ANÁLISE'],
    ['Lacunas de contexto','Pendências'],
    ['Contexto reutilizado','Informações reutilizadas'],
    ['Cobertura de trilha','Análises registradas'],
    ['CASOS, NÃO APENAS TAREFAS','PENDÊNCIAS PARA REVISÃO'],
    ['O que precisa de julgamento','O que precisa de revisão'],
    ['Julgamento','Revisão'],
    ['TRILHA DE DECISÃO','TRILHA DE AUDITORIA'],
    ['Fatos com origem, evidência, vigência e escopo','Informações com origem, evidência, vigência e escopo'],
    ['Memória institucional, não histórico de chat','Histórico estruturado para revisão e reutilização'],
    ['Conduza comigo','Revisar informação'],
    ['Quero fazer manualmente','Fazer manualmente'],
    ['Por que isso importa?','Por que esta informação é necessária?'],
    ['EVOLU Intelligence','EVOLU'],
    ['via Intelligence','via EVOLU'],
    ['pela Intelligence','pela EVOLU'],
    ['A Intelligence','A EVOLU'],
    ['a Intelligence','a EVOLU'],
    ['Context Fact','Informação validada'],
    ['Decision Record','Registro da análise']
  ];
  const replacementsEn=[
    ['CONTEXT LEDGER','COMPANY INFORMATION'],
    ['Context Ledger','Company information'],
    ['Validated context found','Previously validated information'],
    ['Context verified','Information confirmed'],
    ['Context available','Information available'],
    ['Context gap','Missing information'],
    ['Save context','Save information'],
    ['View Context Ledger','View company information'],
    ['INTELLIGENCE LOOP','ANALYSIS SUMMARY'],
    ['Context gaps','Pending information'],
    ['Context reused','Information reused'],
    ['Decision trace coverage','Recorded analyses'],
    ['CASES, NOT JUST TASKS','ITEMS FOR REVIEW'],
    ['What needs judgment','What needs review'],
    ['Judgment','Review'],
    ['DECISION TRAIL','AUDIT TRAIL'],
    ['Facts with origin, evidence, effective period and scope','Information with source, evidence, effective period and scope'],
    ['Institutional memory, not chat history','Structured history for review and reuse'],
    ['Guide me','Review information'],
    ['I want to do it manually','Do it manually'],
    ['Why does this matter?','Why is this information required?'],
    ['EVOLU Intelligence','EVOLU'],
    ['via Intelligence','via EVOLU'],
    ['by Intelligence','by EVOLU'],
    ['Intelligence','EVOLU'],
    ['Context Fact','Validated information'],
    ['Decision Record','Analysis record']
  ];

  function replaceText(root=document){
    const map=isPt()?replacementsPt:replacementsEn;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(n=>{
      let text=n.nodeValue;
      map.forEach(([from,to])=>{text=text.split(from).join(to);});
      n.nodeValue=text;
    });
  }

  function polishStatic(){
    document.querySelectorAll('[data-ui-label="company-info"]').forEach(el=>{
      el.textContent=isPt()?'Informações da empresa':'Company information';
    });
    const brand=document.querySelector('.intelligence-brand strong');
    if(brand)brand.textContent='EVOLU';
    const fab=document.getElementById('intelligenceFab');
    if(fab){
      fab.title=isPt()?'Abrir EVOLU':'Open EVOLU';
      fab.setAttribute('aria-label',fab.title);
    }
    const start=document.getElementById('startGuided');
    if(start)start.textContent=isPt()?'Guia':'Guide';
  }

  renderPage=function(){
    baseRenderPage();
    replaceText(document.getElementById('workspace')||document);
    polishStatic();
  };
  renderConversation=function(){
    baseRenderConversation();
    replaceText(document.getElementById('messages')||document);
    replaceText(document.getElementById('suggestions')||document);
  };
  applyI18n=function(){
    baseApplyI18n();
    polishStatic();
    replaceText(document);
  };

  const existingOpenAssistant=openAssistant;
  openAssistant=function(){
    existingOpenAssistant();
    const input=document.getElementById('chatInput');
    if(input)input.placeholder=isPt()?'Pergunte sobre esta operação':'Ask about this transaction';
    polishStatic();
    replaceText(document.getElementById('intelligencePanel')||document);
  };

  applyI18n();
  renderPage();

  const params=new URLSearchParams(location.search);
  if(params.get('mode')==='guided'){
    setTimeout(()=>{
      if(!state.guided)startTour();
    },350);
  }
})();
