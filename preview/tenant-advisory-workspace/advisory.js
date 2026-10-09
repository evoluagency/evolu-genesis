/* UX-ADVISORY-1 — Static TenantAccess inspection only.
   This independent fixture cannot consume Financeiro/Fiscal page state.
   No authentication, AI calls, tax conclusions, transport or storage. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const dict={
pt:{
internal:'Área interna do escritório · simulação',navTeam:'ESCRITÓRIO',office:'Painel do Escritório',fiscal:'Fiscal e Contábil',advisory:'Assessoria Empresarial',related:'REFERÊNCIAS · PRÉVIAS',financePreview:'Conferência independente',journey:'Mapa de UX',asideFooter:'Simulação: sem autenticação, IA conectada, dados reais ou execução de decisões.',close:'Fechar menu',bread:'NEXUS / Equipe / Assessoria',synthetic:'DADOS FICTÍCIOS',title:'Central de Assessoria',subtitle:'Contextos, hipóteses e recomendações sob avaliação profissional.',company:'Empresa',entity:'Estabelecimento',period:'Competência',boundary:'Contextos inteiramente independentes: uma liberação fictícia aqui não significa recebimento do Fiscal. Intelligence não está conectada.',tabContexts:'Contextos',tabAnalysis:'Análises',tabRecommendations:'Recomendações',noExecution:'Nenhuma recomendação executa lançamentos, impostos ou decisões.',footer:'Protótipo independente, sem envio, integração ou aprovação fiscal.',reviewJourney:'Revisar jornada ↗',
contextTitle:'Contextos disponíveis',contextDesc:'Estados e suficiência, sem compartilhamento real de dados.',analysisTitle:'Hipóteses de trabalho',analysisDesc:'Analise somente o exemplo liberado e suficiente.',recTitle:'Recomendações',recDesc:'Pareceres para avaliação, sem execução.',details:'Contexto selecionado',analysisDetails:'Análise profissional',recDetails:'Recomendação vinculada',detailHelp:'Referências fictícias e independentes, não transferidas entre páginas.',
kpiAvailable:'Contextos liberados no cenário',kpiAnalysis:'Análises documentadas',kpiPending:'Recomendações pendentes',kpiNote:'Somente o cenário demonstrativo',count:'Contextos nesta competência',inspect:'Examinar',empty:'Nenhum contexto fictício neste CNPJ/competência.',unreleased:'Não liberado',released:'Disponível para análise (exemplo)',insufficient:'Evidência insuficiente',draft:'Rascunho',pending:'Aguardando avaliação',evaluated:'Avaliação registrada',noRec:'Sem recomendação',source:'Origem',reference:'Identificação',scope:'Escopo',version:'Versão demonstrativa',reviewer:'Profissional fictício',evidence:'Referências documentais',limitations:'Limitações',none:'Não há evidência liberada.',notReleased:'O contexto ainda não foi liberado pelo profissional contábil. Não é possível elaborar análise válida neste cenário.',notEnough:'Há lacunas documentais. O contexto não sustenta recomendação profissional.',releasedExample:'Esta liberação foi simulada nesta página; não indica envio por outra tela.',notSynced:'Não há sincronização com Financeiro, Fiscal, Contábil ou NF-e 70031.',reviewerExample:'Revisor fictício da NEXUS',noTaxValue:'Nenhum crédito, receita tributável ou imposto foi calculado.',
exampleUnreleased:'Movimentação aguardando conferência',exampleReleased:'Contexto documental liberado (fictício)',exampleInsufficient:'Evidência pendente de complementação',sourceBank:'BANK-200 · recebimento financeiro não classificado',sourceFiscal:'FISC-0009 · referência a documento fiscal independente',
questions:'Questões orientadoras (texto estático, não gerado por IA)',question1:'Qual é a origem comprovada do movimento?',question2:'As referências financeiras e fiscais foram conciliadas?',question3:'Que evidência adicional é necessária para uma conclusão profissional?',noAI:'Intelligence não gerou análise, não consultou dados e não executou qualquer ação.',
hypothesis:'Hipótese de análise',rationale:'Fundamentação e fontes',risks:'Limitações e informações ausentes',analysisNote:'Preencha os três campos com pelo menos 12 caracteres cada.',saveAnalysis:'Salvar análise na simulação',analysisSaved:'Análise registrada apenas na memória da página.',savedAnalysis:'Análise existente (rascunho local)',recHelp:'Registre antes uma análise fundamentada no contexto liberado.',toAnalysis:'Abrir Análises',recProposal:'Recomendação proposta',recRationale:'Fundamentação da recomendação',saveRec:'Salvar recomendação fictícia',recSaved:'Recomendação salva localmente.',markPending:'Marcar pendente de avaliação',markedPending:'Etapa anotada localmente. Nenhuma notificação foi enviada.',reviewNote:'Justificativa da avaliação profissional',evaluate:'Registrar avaliação na simulação',reviewed:'Avaliação local registrada. Nenhuma mudança foi autorizada.',evaluationCaveat:'Avaliar uma recomendação não aprova impostos ou comandos executáveis.',validation:'Informe uma justificativa de pelo menos 12 caracteres em cada campo.',prev:'Anterior',next:'Próximo',unavailable:'Ação não permitida sem contexto liberado e suficiente.',useAnalysis:'A análise fundamentada é pré-requisito.',statusInfo:'A proposta deve passar por avaliação humana, sem execução automática.'
},
en:{
internal:'Internal office · demo',navTeam:'OFFICE',office:'Office dashboard',fiscal:'Tax and Accounting',advisory:'Business Advisory',related:'REFERENCES · PREVIEWS',financePreview:'Independent accounting example',journey:'UX map',asideFooter:'Demo: no authentication, AI integration, real records or decision execution.',close:'Close menu',bread:'NEXUS / Team / Advisory',synthetic:'SYNTHETIC DATA',title:'Advisory workspace',subtitle:'Contexts, hypotheses and recommendations awaiting human evaluation.',company:'Company',entity:'Establishment',period:'Accounting period',boundary:'All contexts are independent examples. A fictional release here does not mean Tax/Accounting sent data. Intelligence is not connected.',tabContexts:'Contexts',tabAnalysis:'Analysis',tabRecommendations:'Recommendations',noExecution:'Recommendations never execute accounting entries, taxes or decisions.',footer:'Independent preview: no transfer, integration or tax approval.',reviewJourney:'Review journey ↗',
contextTitle:'Available contexts',contextDesc:'Source readiness, without real data transfer.',analysisTitle:'Working hypotheses',analysisDesc:'Analyze only the released, sufficient sample.',recTitle:'Recommendations',recDesc:'For human evaluation, not execution.',details:'Selected context',analysisDetails:'Professional analysis',recDetails:'Linked recommendation',detailHelp:'Fictional and independent references, not transferred across pages.',
kpiAvailable:'Released contexts in sample',kpiAnalysis:'Documented analyses',kpiPending:'Recommendations awaiting evaluation',kpiNote:'This demonstration fixture only',count:'Contexts in period',inspect:'Inspect',empty:'No synthetic context for this entity/period.',unreleased:'Not released',released:'Available for analysis (sample)',insufficient:'Insufficient evidence',draft:'Draft',pending:'Awaiting evaluation',evaluated:'Evaluation recorded',noRec:'No recommendation',source:'Origin',reference:'Identifier',scope:'Scope',version:'Illustrative version',reviewer:'Fictional reviewer',evidence:'Evidence references',limitations:'Limitations',none:'No released evidence.',notReleased:'Accounting has not released this context. It cannot be treated as reviewed evidence.',notEnough:'Documentary gaps prevent a substantiated recommendation.',releasedExample:'Release is simulated within this page, not a transfer from another page.',notSynced:'No synchronization with Finance, Tax, Accounting or invoice 70031.',reviewerExample:'Fictional NEXUS reviewer',noTaxValue:'No taxable income, tax credit or tax amount was calculated.',
exampleUnreleased:'Financial context awaiting review',exampleReleased:'Documentary context released (fictional)',exampleInsufficient:'Evidence requiring further documentation',sourceBank:'BANK-200 · unclassified financial receipt',sourceFiscal:'FISC-0009 · separate fiscal-document reference',
questions:'Guiding questions (static text, not AI-generated)',question1:'What evidence supports the source of the financial movement?',question2:'Are financial and fiscal records reconciled?',question3:'What additional evidence is needed for a professional conclusion?',noAI:'Intelligence did not generate analysis, access records or take actions.',
hypothesis:'Working hypothesis',rationale:'Rationale and sources',risks:'Limitations and missing information',analysisNote:'Fill all three fields with at least 12 characters.',saveAnalysis:'Save analysis in demo',analysisSaved:'Analysis recorded in page memory only.',savedAnalysis:'Existing local analysis draft',recHelp:'Save an evidence-based analysis for a released context first.',toAnalysis:'Open Analysis',recProposal:'Proposed recommendation',recRationale:'Recommendation rationale',saveRec:'Save fictional recommendation',recSaved:'Recommendation saved locally.',markPending:'Mark awaiting evaluation',markedPending:'Local stage updated. No notification was sent.',reviewNote:'Professional evaluation rationale',evaluate:'Record demo evaluation',reviewed:'Local evaluation recorded. Nothing was authorized.',evaluationCaveat:'Evaluating a recommendation is not tax approval or an executable instruction.',validation:'Enter at least 12 characters of rationale in each field.',prev:'Previous',next:'Next',unavailable:'Cannot act without sufficient released context.',useAnalysis:'An evidence-based analysis is required.',statusInfo:'A recommendation needs human review; no automatic execution.'
}
};
const t=k=>(dict[document.documentElement.lang.startsWith('en')?'en':'pt']||dict.pt)[k]||k;
function esc(v){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const contextsFixture=[
{id:'CTX-09-U',cnpj:'m',period:'2026-09',stage:'unreleased',title:'exampleUnreleased',version:'—',references:[]},
{id:'CTX-09-R',cnpj:'m',period:'2026-09',stage:'released',title:'exampleReleased',version:'v1 · mock',references:['sourceBank','sourceFiscal']},
{id:'CTX-09-I',cnpj:'m',period:'2026-09',stage:'insufficient',title:'exampleInsufficient',version:'v1 · mock',references:['sourceBank']}
];
const analyses=Object.create(null),recommendations=Object.create(null);
const params=new URLSearchParams(window.location.search);
const allowedValue=(v,allowed,fallback)=>allowed.includes(v)?v:fallback;
$('entity').value=allowedValue(params.get('cnpj'),['m','f'],'m');
$('period').value=allowedValue(params.get('period'),['2026-09','2026-08'],'2026-09');
let activity=allowedValue(params.get('tab'),['contexts','analysis','recommendations'],'contexts');
let selectedId=allowedValue(params.get('context'),contextsFixture.map(x=>x.id),null);
let page=0;
const scope=()=>({cnpj:$('entity').value,period:$('period').value});
const scoped=()=>contextsFixture.filter(x=>x.cnpj===scope().cnpj&&x.period===scope().period);
const active=()=>scoped().find(x=>x.id===selectedId)||null;
const available=x=>!!x&&x.stage==='released'&&x.references.length>=2;
const status=x=>x.stage==='released'?'released':x.stage==='insufficient'?'insufficient':'unreleased';
const marker=(label,success)=>'<span class="ux-pill '+(success?'good':'warn')+'">'+esc(t(label))+'</span>';
const fiscalHref=()=>{const q=new URLSearchParams({cnpj:scope().cnpj,period:scope().period,tab:'review'});return '../tenant-fiscal-workspace/?'+q.toString();};
const financeHref=()=>{const q=new URLSearchParams({cnpj:scope().cnpj,period:scope().period,role:'advisory'});return '../company-financial-workspace/?'+q.toString();};
function announce(message){$('status').textContent=message;}
function metrics(){
const cases=scoped(),rows=[
[t('kpiAvailable'),cases.filter(available).length],
[t('kpiAnalysis'),cases.filter(x=>analyses[x.id]).length],
[t('kpiPending'),cases.filter(x=>recommendations[x.id]?.stage==='pending').length]
];
$('metrics').innerHTML=rows.map(x=>'<div class="ux-metric"><span class="ux-meta">'+esc(x[0])+'</span><strong>'+x[1]+'</strong><small>'+esc(t('kpiNote'))+'</small></div>').join('');
}
function list(){
const all=scoped(),max=Math.max(1,Math.ceil(all.length/3));
page=Math.max(0,Math.min(page,max-1));
if(!all.some(x=>x.id===selectedId))selectedId=all[0]?.id||null;
$('listCount').textContent=t('count')+': '+all.length;
$('pager').innerHTML=max<2?'':'<button type="button" class="ux-btn" data-page="-1" '+(!page?'disabled':'')+'>'+esc(t('prev'))+'</button><span class="ux-note">'+(page+1)+' / '+max+'</span><button type="button" class="ux-btn" data-page="1" '+(page+1===max?'disabled':'')+'>'+esc(t('next'))+'</button>';
$('contextList').innerHTML=all.length?'<div class="ux-list">'+all.slice(page*3,(page+1)*3).map(x=>{
const rec=recommendations[x.id],flag=rec?(rec.stage==='draft'?'draft':rec.stage==='pending'?'pending':'evaluated'):'noRec';
return '<div class="ux-row '+(x.id===selectedId?'ux-selected':'')+'"><div><div class="ux-row-top">'+marker(status(x),available(x))+'</div><div class="ux-row-title">'+esc(t(x.title))+'</div><small>'+esc(x.id)+' · '+esc(x.period)+' · '+esc(t(flag))+'</small></div><button class="ux-btn" type="button" data-select="'+esc(x.id)+'">'+esc(t('inspect'))+'</button></div>';
}).join('')+'</div>':'<div class="advisory-empty">'+esc(t('empty'))+'</div>';
}
function baseDetail(x){
const refs=x.references.length?'<div class="advisory-source-list">'+x.references.map(k=>'<span>'+esc(t(k))+'</span>').join('')+'</div>':'<div class="advisory-empty">'+esc(t('none'))+'</div>';
const note=x.stage==='released'?'releasedExample':x.stage==='insufficient'?'notEnough':'notReleased';
return '<div class="advisory-detail"><h4>'+esc(t(x.title))+'</h4>'+marker(status(x),available(x))+
'<dl><dt>'+esc(t('reference'))+'</dt><dd>'+esc(x.id)+'</dd><dt>'+esc(t('scope'))+'</dt><dd>ACME Industrial · '+(x.cnpj==='m'?'0001':'0002')+' · '+esc(x.period)+'</dd><dt>'+esc(t('version'))+'</dt><dd>'+esc(x.version)+'</dd><dt>'+esc(t('source'))+'</dt><dd>'+esc(t('notSynced'))+'</dd><dt>'+esc(t('reviewer'))+'</dt><dd>'+(available(x)?esc(t('reviewerExample')):'—')+'</dd></dl>'+
'<div class="advisory-sep"><h4>'+esc(t('evidence'))+'</h4>'+refs+'</div>'+
'<div class="advisory-flag">'+esc(t(note))+'</div><p>'+esc(t('noTaxValue'))+'</p>';
}
function questions(){return '<div class="advisory-sep"><h4>'+esc(t('questions'))+'</h4><div class="advisory-block"><p>'+esc(t('question1'))+'</p><p>'+esc(t('question2'))+'</p><p>'+esc(t('question3'))+'</p></div><p>'+esc(t('noAI'))+'</p></div>';}
function textArea(id,label,value){return '<label for="'+id+'">'+esc(t(label))+'</label><textarea id="'+id+'" required minlength="12" maxlength="1200">'+esc(value||'')+'</textarea>';}
function analysisPanel(x){
if(!available(x))return '<div class="advisory-detail"><div class="advisory-flag">'+esc(t(x.stage==='insufficient'?'notEnough':'notReleased'))+'</div></div>';
const a=analyses[x.id]||{};
return '<div class="advisory-detail">'+(a.hypothesis?'<div class="advisory-block"><strong>'+esc(t('savedAnalysis'))+'</strong><p>'+esc(a.hypothesis)+'</p></div>':'')+
'<form class="advisory-form" id="analysisForm">'+textArea('hypothesis','hypothesis',a.hypothesis)+textArea('rationale','rationale',a.rationale)+textArea('risks','risks',a.risks)+
'<small class="ux-note">'+esc(t('analysisNote'))+'</small><button class="ux-btn ux-btn-primary" type="submit">'+esc(t('saveAnalysis'))+'</button></form></div>';
}
function recommendationPanel(x){
if(!available(x))return '<div class="advisory-detail"><div class="advisory-flag">'+esc(t(x.stage==='insufficient'?'notEnough':'notReleased'))+'</div></div>';
const a=analyses[x.id],r=recommendations[x.id];
if(!a)return '<div class="advisory-detail"><div class="advisory-empty">'+esc(t('recHelp'))+'</div><button type="button" class="ux-btn ux-btn-soft" data-jump="analysis">'+esc(t('toAnalysis'))+'</button></div>';
if(!r||r.stage==='draft')return '<div class="advisory-detail">'+marker(r?'draft':'noRec',false)+
'<form id="recommendationForm" class="advisory-form">'+textArea('recProposal','recProposal',r?.text)+textArea('recRationale','recRationale',r?.rationale)+
'<small class="ux-note">'+esc(t('statusInfo'))+'</small><div class="advisory-actions"><button type="submit" class="ux-btn ux-btn-primary">'+esc(t('saveRec'))+'</button>'+
(r?'<button type="button" class="ux-btn" data-review="'+esc(x.id)+'">'+esc(t('markPending'))+'</button>':'')+'</div></form></div>';
return '<div class="advisory-detail">'+marker(r.stage==='pending'?'pending':'evaluated',r.stage==='evaluated')+
'<div class="advisory-block"><strong>'+esc(t('recProposal'))+'</strong><p>'+esc(r.text)+'</p></div><div class="advisory-block"><strong>'+esc(t('recRationale'))+'</strong><p>'+esc(r.rationale)+'</p></div>'+
(r.stage==='pending'?'<form id="evaluationForm" class="advisory-form">'+textArea('evaluation','reviewNote','')+'<button class="ux-btn ux-btn-primary" type="submit">'+esc(t('evaluate'))+'</button></form>':
'<div class="advisory-block"><strong>'+esc(t('evaluated'))+'</strong><p>'+esc(r.evaluation)+'</p></div>')+
'<p>'+esc(t('evaluationCaveat'))+'</p></div>';
}
function render(){
document.querySelectorAll('[data-i]').forEach(el=>{el.textContent=t(el.dataset.i);});
document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===activity)));
const headings={contexts:['contextTitle','contextDesc','details'],analysis:['analysisTitle','analysisDesc','analysisDetails'],recommendations:['recTitle','recDesc','recDetails']};
$('listTitle').textContent=t(headings[activity][0]);$('listDesc').textContent=t(headings[activity][1]);
$('detailTitle').textContent=t(headings[activity][2]);$('detailDesc').textContent=t('detailHelp');
$('fiscalLink').href=fiscalHref();$('financeLink').href=financeHref();
metrics();list();
const x=active();
$('detail').innerHTML=!x?'<div class="advisory-empty">'+esc(t('empty'))+'</div>':activity==='contexts'?baseDetail(x)+questions()+'</div>':activity==='analysis'?analysisPanel(x):recommendationPanel(x);
}
function go(next){if(!['contexts','analysis','recommendations'].includes(next))return;activity=next;page=0;render();}
function fields(ids){
const values=ids.map(id=>$(id)?.value.trim()||'');
if(values.some(v=>v.length<12)){announce(t('validation'));$(ids[values.findIndex(v=>v.length<12)])?.focus();return null;}
return values;
}
document.addEventListener('click',e=>{
const tab=e.target.closest('[data-tab]');if(tab){go(tab.dataset.tab);return;}
const ctx=e.target.closest('[data-select]');if(ctx){const x=scoped().find(x=>x.id===ctx.dataset.select);if(x){selectedId=x.id;render();}return;}
const pg=e.target.closest('[data-page]');if(pg){page+=Number(pg.dataset.page);render();return;}
const jump=e.target.closest('[data-jump]');if(jump){go(jump.dataset.jump);return;}
const review=e.target.closest('[data-review]');if(review){
 const x=active(),r=x&&recommendations[x.id];if(!available(x)||!r||r.stage!=='draft')return;
 r.stage='pending';render();announce(t('markedPending'));
}
});
document.addEventListener('submit',e=>{
if(!['analysisForm','recommendationForm','evaluationForm'].includes(e.target.id))return;
e.preventDefault();const x=active();
if(!available(x)){announce(t('unavailable'));return;}
if(e.target.id==='analysisForm'){
 const vals=fields(['hypothesis','rationale','risks']);if(!vals)return;
 analyses[x.id]={hypothesis:vals[0],rationale:vals[1],risks:vals[2]};
 // Evidence basis changed: old recommendation is no longer safely current.
 if(recommendations[x.id])delete recommendations[x.id];
 render();announce(t('analysisSaved'));return;
}
if(e.target.id==='recommendationForm'){
 if(!analyses[x.id]){announce(t('useAnalysis'));return;}
 const vals=fields(['recProposal','recRationale']);if(!vals)return;
 recommendations[x.id]={text:vals[0],rationale:vals[1],stage:'draft',evaluation:''};
 render();announce(t('recSaved'));return;
}
const rec=recommendations[x.id];if(!rec||rec.stage!=='pending')return;
const v=fields(['evaluation']);if(!v)return;
rec.stage='evaluated';rec.evaluation=v[0];render();announce(t('reviewed'));
});
$('entity').addEventListener('change',()=>{selectedId=null;page=0;render();});
$('period').addEventListener('change',()=>{selectedId=null;page=0;render();});
document.addEventListener('ux:locale',render);
render();
})();