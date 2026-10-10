/* UX-ROUTES-1 — navigation-only contract for independent STATIC previews.
 * Query parameters are NOT identity, session, authorization or shared state.
 * Click budgets describe intended UI steps, not a completed browser audit. */
(function(global){
'use strict';
const validRole=['company-fin','company-read','tenant-accounting','tenant-advisory','tenant-admin'];
function normalize(raw){
 const c=raw||{};
 return {role:validRole.includes(c.role)?c.role:'tenant-accounting',entity:['m','f'].includes(c.entity)?c.entity:'m',period:['2026-08','2026-09'].includes(c.period)?c.period:'2026-09',company:'acme'};
}
function build(name,input){
 const c=normalize(input),p={};
 const base={office:'../office-workspace/',company:'../company-access-home/',finance:'../company-financial-workspace/',fiscal:'../tenant-fiscal-workspace/',advisory:'../tenant-advisory-workspace/',onboarding:'../company-onboarding/',settings:'../company-configuration/',tenant:'../tenant-configuration/',case:'../fiscal-document-70031/'};
 let section;
 switch(name){
 case 'office': section='office';break;
 case 'officeQueue':section='office';Object.assign(p,{tab:'queue',cnpj:c.entity,period:c.period});break;
 case 'officeApprovals':section='office';Object.assign(p,{tab:'approvals',cnpj:c.entity,period:c.period});break;
 case 'officeCompanies':section='office';Object.assign(p,{tab:'companies',cnpj:c.entity,period:c.period});break;
 case 'companyHome':case 'companyFinance':case 'companyRequests':case 'companyDocuments':
  section='company';Object.assign(p,{cnpj:c.entity==='m'?'a':'b',period:c.period});
  if(c.role==='company-read')p.mode='read';
  if(name!=='companyHome')p.activity={companyFinance:'finance',companyRequests:'requests',companyDocuments:'documents'}[name];
  break;
 case 'financeHome':case 'financeMoves':case 'financeSend':
  if(c.role==='company-read'&&name==='financeSend')throw Error('Viewer cannot access send');
  section='finance';Object.assign(p,{role:c.role==='company-read'?'viewer':'company',cnpj:c.entity,period:c.period,activity:{financeHome:'home',financeMoves:'moves',financeSend:'send'}[name]});
  break;
 case 'accountingReview':case 'accountingClosing':
  section='finance';Object.assign(p,{role:'accounting',cnpj:c.entity,period:c.period,activity:name==='accountingReview'?'review':'closing'});break;
 case 'fiscalReceived':case 'fiscalDocumentItem':case 'fiscalPending':case 'fiscalReview':case 'fiscalEvidenceItem':case 'fiscalPreclose':
  section='fiscal';Object.assign(p,{tab:{fiscalReceived:'received',fiscalDocumentItem:'received',fiscalPending:'pending',fiscalReview:'review',fiscalEvidenceItem:'review',fiscalPreclose:'preclose'}[name],cnpj:c.entity,period:c.period});
  if(name==='fiscalDocumentItem')p.item='D-2';
  if(name==='fiscalPending')p.item='R-1';
  if(name==='fiscalEvidenceItem')p.item='F-1';
  break;
 case 'advisoryContexts':case 'advisoryAnalysis':case 'advisoryRecommendations':
  section='advisory';Object.assign(p,{tab:{advisoryContexts:'contexts',advisoryAnalysis:'analysis',advisoryRecommendations:'recommendations'}[name],cnpj:c.entity,period:c.period});
  if(name!=='advisoryContexts')p.context='CTX-09-R';
  break;
 case 'companyConfiguration':section='settings';break;
 case 'companyOnboarding':section='onboarding';break;
 case 'tenantConfiguration':section='tenant';break;
 case 'fiscalCase':section='case';break;
 default:throw Error('Unknown preview route: '+String(name));
 }
 const query=Object.entries(p).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
 return base[section]+(query?'?'+query:'');
}
const cases=[
 ['J-01','tenant-accounting','Escritório → fila → esclarecimento',['Pendências do escritório','Abrir pendência R-1'],['officeQueue','fiscalPending'],'Informação solicitada não é documento fiscal aprovado.'],
 ['J-02','tenant-accounting','Escritório → recebido → NF-e ilustrativa',['Recebidos no Fiscal','Examinar item D-2','Abrir caso NF-e 70031 separado'],['fiscalReceived','fiscalDocumentItem','fiscalCase'],'NF-e é um caso independente, sem sincronização.'],
 ['J-03','company-fin','Início da empresa → Financeiro → movimentações',['Financeiro','Abrir detalhado','Movimentações'],['companyFinance','financeHome','financeMoves'],'CNPJ/competência preservados, sem inferir tributação.'],
 ['J-04','company-fin','Solicitação → resposta',['Solicitações','Responder r1','Salvar resposta fictícia'],['companyRequests','companyRequests','companyRequests'],'Resposta não é automaticamente conferida.'],
 ['J-05','company-read','Consulta → Financeiro somente leitura',['Financeiro em consulta','Abrir detalhado viewer','Movimentações'],['companyFinance','financeHome','financeMoves'],'Não autoriza importação, envio nem registro.'],
 ['J-06','tenant-accounting','Conferência → evidência específica',['Recebidos','Conferência','Examinar F-1'],['fiscalReceived','fiscalReview','fiscalEvidenceItem'],'Revisão exige justificativa individual.'],
 ['J-07','tenant-accounting','Esclarecimento → resposta → revisão',['Abrir R-1','Resposta recebida','Concluir revisão humana'],['fiscalPending','fiscalPending','fiscalPending'],'Respondido e resolvido são estados distintos.'],
 ['J-08','tenant-accounting','Fiscal → pré-fechamento documental',['Abrir Fiscal','Pré-fechamento'],['fiscalReceived','fiscalPreclose'],'Acesso ao preparo não dispensa validação de todas as evidências.'],
 ['J-09','tenant-advisory','Assessoria → análise de contexto disponível',['Abrir Assessoria','Análises','Examinar CTX-09-R'],['advisoryContexts','advisoryAnalysis','advisoryAnalysis'],'Liberação é fictícia; a recomendação exige intervenção humana.'],
 ['J-10','tenant-admin','Escritório → empresa → configurações',['Empresas','Abrir ACME','Configuração do cliente'],['officeCompanies','officeCompanies','companyConfiguration'],'Configuração é interna à contabilidade; não pertence ao portal da Company.'],
 ['J-11','tenant-accounting','Escritório → aprovações',['Aprovações'],['officeApprovals'],'Aprovação formal continua separada de execução.']
].map(row=>({id:row[0],role:row[1],title:row[2],labels:row[3],routes:row[4],clicks:row[3].length,notice:row[5]}));
function validate(){
 const used=new Set();
 return cases.map(c=>{
  if(used.has(c.id)||!validRole.includes(c.role)||c.clicks!==c.routes.length||c.clicks>3)throw Error('Invalid click contract '+c.id);
  used.add(c.id);
  const urls=c.routes.map(name=>build(name,{role:c.role}));
  if(urls.some(url=>!url.startsWith('../')||url.includes('undefined')))throw Error('Broken test URL '+c.id);
  return {id:c.id,role:c.role,clicks:c.clicks,urls};
 });
}
global.EvoluRoutes=Object.freeze({normalize,build,cases,validate});
})(window);