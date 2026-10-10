import {
  CompanyWorkspaceController,
  MockPlatformProvider,
  mockTenant,
  mockCompany,
  mockCnpj,
  mockBranchCnpj
} from "../runtime/index.js";

(async function(){
"use strict";
const D={
pt:{brandSub:"Contabilidade & Assessoria",clientSpace:"Área da empresa",navGroup:"SEU ESPAÇO",navHome:"Início",navFinance:"Financeiro",navDocs:"Documentos",navRequests:"Solicitações",navInfo:"Informações",sideBottom:"Ambiente fictício · Dados não enviados a ninguém",synthetic:"DEMONSTRAÇÃO",introTag:"PAINEL DA EMPRESA",period:"Competência",cnpj:"Estabelecimento",footer:"Exemplo com dados sintéticos. Valores ilustrativos; não constituem apuração contábil, fiscal ou saldo bancário real.",cancel:"Cancelar",save:"Registrar na demonstração",greet:"Bom dia, Mariana",homeIntro:"Acompanhe o financeiro e o que a contabilidade precisa de você. Informações simuladas.",financeIntro:"Visão simplificada de movimentações e origens. A gestão financeira completa será detalhada na próxima etapa da UX.",docsIntro:"Comprovantes e documentos da empresa disponíveis para sua equipe e contabilidade.",reqIntro:"Informações solicitadas pela NEXUS para concluir conferências.",infoIntro:"Dados autorizados da empresa e dos estabelecimentos.",in:"Entradas registradas",out:"Saídas registradas",balance:"Diferença de movimentações",items:"Pendências",inNote:"Movimentações de entrada, não necessariamente receitas tributáveis",outNote:"Movimentações de saída, não necessariamente despesas dedutíveis",balanceNote:"Entradas menos saídas, não é saldo bancário ou lucro",itemsNote:"Aguardando informação da sua empresa",actions:"Ações rápidas",actionsSub:"Informe ou complemente dados sem sair do ambiente da empresa.",add:"Registrar despesa",upload:"Enviar comprovante",reply:"Responder solicitação",sources:"Ver origens dos dados",recent:"Movimentações recentes",recentSub:"Registros financeiros sintéticos desta competência",all:"Ver financeiro",requestTitle:"Solicitações da contabilidade",requestSub:"O envio da informação não altera tributos automaticamente.",viewAll:"Ver todas",received:"Recebido",payment:"Pagamento",review:"Em análise",manual:"Lançamento manual",erp:"ERP (simulado)",bank:"Extrato (simulado)",file:"Importação de arquivo",missing:"Aguardando complemento",done:"Informação recebida",respond:"Responder",addDesc:"Registre uma despesa financeira fictícia. A classificação tributária depende de conferência profissional.",expenseName:"Descrição da despesa",expenseValue:"Valor (R$)",expenseEvidence:"Referência / documento (opcional)",addOk:"Despesa simulada registrada para conferência. Nenhuma classificação tributária foi aplicada.",uploadDesc:"Registre o nome de um comprovante de demonstração; nenhum arquivo será transmitido.",docName:"Identificação do comprovante",docType:"Tipo",docOk:"Comprovante adicionado apenas nesta demonstração.",responseDesc:"Descreva a finalidade da operação para que a contabilidade possa avaliar.",responseField:"Finalidade / explicação",responseOk:"Resposta simulada registrada para revisão da contabilidade.",sourceTitle:"Origem das informações",sourceDesc:"Integrações reais não estão habilitadas neste protótipo.",sourceOk:"Ilustrativo",sourceNot:"Não conectado",sourceManual:"Informações lançadas manualmente",sourceErp:"ERP comercial",sourceFiscal:"Documentos fiscais",sourceBank:"Instituição financeira",dataQuality:"Qualidade dos dados",qualityText:"Este painel contém registros incompletos e dados de origens diferentes. Entradas financeiras, documentos fiscais e lançamentos contábeis não são equivalentes automaticamente.",detail:"Detalhamento",date:"Data",desc:"Descrição",kind:"Natureza",amount:"Valor",origin:"Origem",status:"Situação",docTitle:"Documentos disponibilizados",docSub:"Itens fictícios. Nenhuma transmissão ocorre.",reqStatus:"Status de envio",reqZero:"Não há solicitações pendentes para este CNPJ e competência.",service:"Serviço da contabilidade",role:"Perfil",profile:"Financeiro · empresa cliente",scope:"Acesso restrito à ACME Industrial e aos CNPJs autorizados",phase:"Próxima etapa",phaseDesc:"Este é o painel inicial. A navegação completa de Financeiro, lançamentos e integrações será desenvolvida como UX-CFG-5.",close:"Fechar",errorValue:"Informe um valor maior que zero e uma descrição.",errorText:"Preencha o campo obrigatório.",newExpense:"Nova despesa",newDoc:"Novo comprovante",requestOne:"Qual a finalidade da compra do equipamento?",requestTwo:"Envie comprovante do serviço contratado.",rationale:"A classificação depende de documentação e validação.",noPending:"Nenhuma solicitação pendente.",noDocs:"Nenhum documento nesta competência.",noMoves:"Nenhuma movimentação nesta competência.",sourceAlert:"Status é ilustrativo. Não foi iniciada sincronização com ERP, SIEG ou bancos.",headingFinance:"Financeiro · resumo",headingDocs:"Documentos",headingRequests:"Solicitações",headingInfo:"Informações da empresa",typeInvoice:"Comprovante",typeStatement:"Extrato",typeOther:"Outro",send:"Enviar na demonstração",switch:"Cenário local"},
en:{brandSub:"Accounting & Advisory",clientSpace:"Company workspace",navGroup:"YOUR SPACE",navHome:"Home",navFinance:"Finance",navDocs:"Documents",navRequests:"Requests",navInfo:"Company information",sideBottom:"Synthetic demo · No data is sent",synthetic:"DEMO",introTag:"COMPANY WORKSPACE",period:"Period",cnpj:"Establishment",footer:"Synthetic demo data. Figures are illustrative, not real accounting, tax or bank balances.",cancel:"Cancel",save:"Save simulation",greet:"Good morning, Mariana",homeIntro:"Review your finances and what the accounting firm needs. Simulated records.",financeIntro:"Summary of transactions and source data. Full finance UX follows in the next step.",docsIntro:"Supporting documents shared with your authorized accounting firm.",reqIntro:"Information requested by NEXUS to finalize reviews.",infoIntro:"Authorized company and establishment information.",in:"Recorded inflows",out:"Recorded outflows",balance:"Movement difference",items:"Open requests",inNote:"Incoming money is not automatically taxable revenue",outNote:"Outgoing money is not automatically tax-deductible cost",balanceNote:"Inflows minus outflows; not bank balance or profit",itemsNote:"Awaiting company information",actions:"Quick actions",actionsSub:"Provide or complement data within your company space.",add:"Record expense",upload:"Add supporting document",reply:"Reply to request",sources:"Data sources",recent:"Recent movements",recentSub:"Synthetic financial records for the selected period",all:"See finance",requestTitle:"Accounting requests",requestSub:"Providing information does not automatically change taxes.",viewAll:"See all",received:"Received",payment:"Payment",review:"Under review",manual:"Manual entry",erp:"ERP (simulated)",bank:"Statement (simulated)",file:"File import",missing:"Awaiting information",done:"Information received",respond:"Reply",addDesc:"Create a synthetic expense. Tax treatment requires professional review.",expenseName:"Expense description",expenseValue:"Amount (BRL)",expenseEvidence:"Document reference (optional)",addOk:"Synthetic expense added for professional review; no tax classification was made.",uploadDesc:"Record a sample document name; no file will be transmitted.",docName:"Document name",docType:"Type",docOk:"Document added only to this demo.",responseDesc:"Explain the economic purpose so accounting can review it.",responseField:"Economic purpose / explanation",responseOk:"Synthetic reply recorded for accounting review.",sourceTitle:"Data sources",sourceDesc:"This prototype has no live integrations.",sourceOk:"Illustrative",sourceNot:"Not connected",sourceManual:"Manually entered information",sourceErp:"Commercial ERP",sourceFiscal:"Fiscal documents",sourceBank:"Bank",dataQuality:"Data completeness",qualityText:"Records are incomplete and sourced differently. Financial inflows, fiscal documents and accounting entries are not automatically equivalent.",detail:"Details",date:"Date",desc:"Description",kind:"Type",amount:"Amount",origin:"Source",status:"Status",docTitle:"Available documents",docSub:"Synthetic records only.",reqStatus:"Submission status",reqZero:"No outstanding requests for this entity and period.",service:"Accounting service",role:"Role",profile:"Finance · company user",scope:"Access limited to ACME Industrial and authorized tax entities",phase:"Next phase",phaseDesc:"This is the company home. Full financial input and integrations will be designed in UX-CFG-5.",close:"Close",errorValue:"Enter a positive amount and a description.",errorText:"Complete the required field.",newExpense:"New expense",newDoc:"New document",requestOne:"What is the economic purpose of this equipment purchase?",requestTwo:"Please provide the service payment receipt.",rationale:"Classification requires documentation and professional validation.",noPending:"No requests pending.",noDocs:"No documents for this period.",noMoves:"No movements for this period.",sourceAlert:"Illustrative status only. No ERP, fiscal-provider or banking connection was initiated.",headingFinance:"Finance · overview",headingDocs:"Documents",headingRequests:"Requests",headingInfo:"Company information",typeInvoice:"Receipt",typeStatement:"Statement",typeOther:"Other",send:"Submit in demo",switch:"Local scenario"}
};
let lang="pt",theme="dark",page="home",period="2026-09",cnpj="a",openDialog=null,activeRequest=null,toastHandle;
const workspaceProvider=new MockPlatformProvider();
const workspaceController=new CompanyWorkspaceController(workspaceProvider,{
  tenantId:mockTenant.tenantId,
  companyId:mockCompany.companyId
});
let workspaceContext=null;
const cnpjIdByLegacy={a:mockCnpj.cnpjId,b:mockBranchCnpj.cnpjId};
const legacyByCnpjId={
  [mockCnpj.cnpjId]:"a",
  [mockBranchCnpj.cnpjId]:"b"
};
const params=new URLSearchParams(window.location.search);
const readOnly=params.get("mode")==="read";
const requestedPeriod=params.get("period");
if(requestedPeriod)period=requestedPeriod;
if(["a","b"].includes(params.get("cnpj")))cnpj=params.get("cnpj");
const requestedCnpjId=params.get("cnpjId");
if(requestedCnpjId&&legacyByCnpjId[requestedCnpjId])cnpj=legacyByCnpjId[requestedCnpjId];
// Optional activity deep link is cosmetic demonstration routing, never access control.
if(["home","finance","documents","requests","info"].includes(params.get("activity")))page=params.get("activity");
function fullFinanceHref(){
 const q=new URLSearchParams({role:readOnly?"viewer":"company",cnpj:cnpj==="a"?"m":"f",period});
 return "../company-financial-workspace/?"+q.toString();
}
const requestSeed=[{id:"r1",title:"requestOne",date:"24/09/2026",status:"pending",cnpj:"a",period:"2026-09"},{id:"r2",title:"requestTwo",date:"22/09/2026",status:"pending",cnpj:"a",period:"2026-09"},{id:"r3",title:"requestOne",date:"16/08/2026",status:"done",cnpj:"a",period:"2026-08"}];
const documents=[{title:"Comprovante energia.pdf",date:"19/09/2026",kind:"typeInvoice",cnpj:"a",period:"2026-09"},{title:"Extrato setembro.csv",date:"30/09/2026",kind:"typeStatement",cnpj:"a",period:"2026-09"},{title:"Comprovante filial.pdf",date:"28/09/2026",kind:"typeInvoice",cnpj:"b",period:"2026-09"}];
let reqs=requestSeed.map(x=>({...x}));
const records=[
{id:"m1",date:"30/09",name:"Recebimentos comerciais (ERP)",kind:"in",value:85200,source:"erp",cnpj:"a",period:"2026-09"},
{id:"m2",date:"28/09",name:"Pagamento de fornecedores",kind:"out",value:33800,source:"bank",cnpj:"a",period:"2026-09"},
{id:"m3",date:"24/09",name:"Despesas administrativas",kind:"out",value:8600,source:"manual",cnpj:"a",period:"2026-09"},
{id:"m4",date:"18/09",name:"Recebimento registrado",kind:"in",value:21700,source:"bank",cnpj:"a",period:"2026-09"},
{id:"m5",date:"31/08",name:"Recebimentos do período",kind:"in",value:94000,source:"erp",cnpj:"a",period:"2026-08"},
{id:"m6",date:"25/08",name:"Pagamento de fornecedores",kind:"out",value:47800,source:"bank",cnpj:"a",period:"2026-08"},
{id:"m7",date:"29/09",name:"Entradas da filial",kind:"in",value:17800,source:"manual",cnpj:"b",period:"2026-09"},
{id:"m8",date:"27/09",name:"Despesas da filial",kind:"out",value:11200,source:"bank",cnpj:"b",period:"2026-09"}
];
const $=id=>document.getElementById(id);const t=k=>D[lang][k]||k;
const activeCnpjSummary=()=>workspaceContext?.cnpjs.find(item=>item.cnpjId===cnpjIdByLegacy[cnpj])??null;
const displayCompanyName=()=>workspaceContext?.company.tradeName||workspaceContext?.company.legalName||"ACME Industrial";
function formatCnpj(value){return String(value).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,"$1.$2.$3/$4-$5")}
function establishmentLabel(item){
 if(!item)return "";
 const kind=item.establishmentType==="branch"?(lang==="pt"?"Filial":"Branch"):(lang==="pt"?"Matriz":"Head office");
 return kind+" · "+item.cnpj.slice(-4);
}
function renderWorkspaceContext(){
 if(!workspaceContext)return;
 $("companyIdentityName").textContent=displayCompanyName();
 const cnpjSelect=$("cnpj");
 cnpjSelect.innerHTML=workspaceContext.cnpjs.map(item=>'<option value="'+safe(item.cnpjId)+'">'+safe(establishmentLabel(item))+'</option>').join("");
 cnpjSelect.value=workspaceContext.selectedCnpjId;
 const periodSelect=$("period");
 periodSelect.innerHTML=workspaceContext.availableAccountingPeriods.map(item=>'<option value="'+safe(item.competence)+'">'+safe(item.competence.slice(5)+"/"+item.competence.slice(0,4))+'</option>').join("");
 periodSelect.value=workspaceContext.activeAccountingPeriod.competence;
}
const safe=x=>String(x).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
const money=n=>new Intl.NumberFormat(lang==="pt"?"pt-BR":"en-US",{style:"currency",currency:"BRL",maximumFractionDigits:2}).format(n);
const current=()=>records.filter(x=>x.cnpj===cnpj&&x.period===period);
const pending=()=>reqs.filter(x=>x.cnpj===cnpj&&x.period===period&&x.status==="pending");
const currentReqs=()=>reqs.filter(x=>x.cnpj===cnpj&&x.period===period);
const currentDocs=()=>documents.filter(x=>x.cnpj===cnpj&&x.period===period);
function notify(msg){const q=$("toast");q.textContent=msg;q.hidden=false;clearTimeout(toastHandle);toastHandle=setTimeout(()=>q.hidden=true,3300)}
function box(title,subtitle,content,extra=""){return '<section class="card ux-card"><div class="cardheader"><div><h3>'+title+'</h3>'+(subtitle?'<p>'+subtitle+'</p>':"")+'</div>'+extra+'</div>'+content+'</section>'}
function navBtn(id,text){return '<button class="linkbtn" data-go="'+id+'">'+text+' →</button>'}
function metrics(){const moves=current(),incoming=moves.filter(x=>x.kind==="in").reduce((a,b)=>a+b.value,0),outgoing=moves.filter(x=>x.kind==="out").reduce((a,b)=>a+b.value,0);return '<div class="metricgrid"><div class="card metric"><small>'+t("in")+'</small><strong class="green">'+money(incoming)+'</strong><em>'+t("inNote")+'</em></div><div class="card metric"><small>'+t("out")+'</small><strong>'+money(outgoing)+'</strong><em>'+t("outNote")+'</em></div><div class="card metric"><small>'+t("balance")+'</small><strong>'+money(incoming-outgoing)+'</strong><em>'+t("balanceNote")+'</em></div><div class="card metric"><small>'+t("items")+'</small><strong class="yellow">'+pending().length+'</strong><em>'+t("itemsNote")+'</em></div></div>'}
function movesList(){const list=current().slice().reverse();return list.length?'<div class="list">'+list.map(x=>'<div class="item"><div class="left"><span class="itemicon">'+(x.kind==="in"?"↘":"↗")+'</span><div><b>'+safe(x.name)+'</b><small>'+x.date+' · '+t(x.source)+'</small></div></div><div class="value" style="color:'+(x.kind==="in"?"var(--green)":"var(--fg)")+'">'+(x.kind==="in"?"+":"−")+money(x.value)+'</div></div>').join("")+'</div>':'<div class="empty">'+t("noMoves")+'</div>'}
function requestList(){const list=currentReqs();return list.length?'<div class="list">'+list.map(x=>'<div class="item"><div class="left"><span class="itemicon">?</span><div><b>'+t(x.title)+'</b><small>'+x.date+' · '+(x.status==="pending"?t("missing"):t("done"))+'</small></div></div>'+(x.status==="pending"&&!readOnly?'<button class="b soft" data-answer="'+x.id+'">'+t("respond")+'</button>':'<span class="pill "+(x.status==="pending"?"warn":"good")+"">'+t(x.status==="pending"?"missing":"done")+'</span>')+'</div>').join("")+'</div>':'<div class="empty">'+t("reqZero")+'</div>'}
function docList(){const list=currentDocs();return list.length?'<div class="list">'+list.map(x=>'<div class="item"><div class="left"><span class="itemicon">▤</span><div><b>'+safe(x.title)+'</b><small>'+x.date+' · '+t(x.kind)+'</small></div></div><span class="pill">'+t("review")+'</span></div>').join("")+'</div>':'<div class="empty">'+t("noDocs")+'</div>'}
function quick(){if(readOnly)return '<div class="quick"><button data-go="finance"><span>≋</span>'+t("navFinance")+'</button><button data-action="source"><span>⇄</span>'+t("sources")+'</button></div>';return '<div class="quick"><button data-action="expense"><span>＋</span>'+t("add")+'</button><button data-action="document"><span>▤</span>'+t("upload")+'</button><button data-go="requests"><span>◷</span>'+t("reply")+'</button><button data-action="source"><span>⇄</span>'+t("sources")+'</button></div>'}
function sources(){return '<div class="sources">'+[
["sourceManual","sourceOk"],["sourceErp","sourceOk"],["sourceFiscal","sourceNot"],["sourceBank","sourceOk"]
].map(v=>'<div class="source"><div>'+t(v[0])+'<small>'+t("sourceAlert")+'</small></div><span class="pill '+(v[1]==="sourceOk"?"good":"warn")+'">'+t(v[1])+'</span></div>').join("")+'</div>'}

function compactMetrics(){
 const values=[
  [lang==="pt"?"Movimentações do período":"Transactions in period",String(current().length),lang==="pt"?"Registros financeiros simulados, sem classificação tributária.":"Synthetic financial records, no tax classification."],
  [lang==="pt"?"Documentos apresentados":"Documents submitted",String(currentDocs().length),lang==="pt"?"Documentos não significam caixa ou crédito fiscal.":"Documents do not imply cash or tax credits."],
  [lang==="pt"?"Solicitações pendentes":"Open requests",String(pending().length),lang==="pt"?"Informações que requerem resposta.":"Requests awaiting a reply."]
 ];
 return '<div class="metricgrid ux-metrics ux-company-summary">'+values.map(x=>'<div class="card metric ux-metric"><small>'+safe(x[0])+'</small><strong>'+safe(x[1])+'</strong><em>'+safe(x[2])+'</em></div>').join('')+'</div>';
}
function homeAssistance(){
 const heading=lang==="pt"?"Ações rápidas":"Quick actions";
 return '<div class="home-requests">'+requestList()+'</div><div class="home-actions-title">'+heading+'</div>'+quick();
}

function content(){
const title={home:"navHome",finance:"headingFinance",documents:"headingDocs",requests:"headingRequests",info:"headingInfo"};
$("pageTitle").textContent=t(title[page]);$("breadcrumb").textContent="NEXUS / "+displayCompanyName()+" / "+t(title[page]);$("greeting").textContent=page==="home"?t("greet"):t(title[page]);
$("introDescription").textContent=t(({home:"homeIntro",finance:"financeIntro",documents:"docsIntro",requests:"reqIntro",info:"infoIntro"})[page]);
document.querySelectorAll("[data-page]").forEach(b=>{b.classList.toggle("active",b.dataset.page===page);b.setAttribute("aria-current",b.dataset.page===page?"page":"false")});
$("requestCount").textContent=pending().length;let out="";
if(page==="home"){
out=compactMetrics()+'<div class="grid ux-grid home-grid"><div class="stack">'+box(t("recent"),t("recentSub"),movesList(),navBtn("finance",t("all")))+'</div><div class="stack">'+box(t("requestTitle"),t("requestSub"),homeAssistance(),navBtn("requests",t("viewAll")))+'</div></div>';
}else if(page==="finance"){
out=metrics()+'<div class="grid ux-grid"><div class="stack">'+box(t("recent"),t("recentSub"),movesList(),readOnly?"":'<button class="b primary" data-action="expense">'+t("add")+'</button>')+'</div><div class="stack">'+box(t("sources"),t("sourceDesc"),sources())+box(t("phase"),"",'<div class="notice">'+t("phaseDesc")+'</div><p style="margin:12px 0 0"><a class="b primary" id="openFinancialWorkspace" href="../company-financial-workspace/?role=company">Abrir Financeiro completo ↗</a></p>')+'</div></div>';
}else if(page==="documents"){
out='<div class="grid ux-grid"><div class="stack">'+box(t("docTitle"),t("docSub"),docList(),readOnly?"":'<button class="b primary" data-action="document">'+t("upload")+'</button>')+'</div><div class="stack">'+box(t("sourceTitle"),t("sourceDesc"),sources())+'</div></div>';
}else if(page==="requests"){
out='<div class="grid ux-grid"><div class="stack">'+box(t("requestTitle"),t("requestSub"),requestList())+'</div><div class="stack">'+box(t("dataQuality"),"",'<div class="notice">'+t("rationale")+'</div>')+'</div></div>';
}else{
out='<div class="grid ux-grid"><div class="stack">'+box(t("headingInfo"),"",'<div class="list"><div class="item"><div><b>ACME Industrial</b><small>Company · '+t("scope")+'</small></div><span class="pill good">'+t("profile")+'</span></div><div class="item"><div><b>'+t("cnpj")+'</b><small>'+(()=>{const item=activeCnpjSummary();return item?formatCnpj(item.cnpj)+" · "+(item.state||"—"):"—"})()+'</small></div></div><div class="item"><div><b>'+t("role")+'</b><small>'+t("profile")+'</small></div></div></div>')+'</div><div class="stack">'+box(t("service"),"",'<div class="notice">'+t("scope")+'</div>')+'</div></div>';
}
$("pageContent").innerHTML=out;
 const detail=$("openFinancialWorkspace");if(detail)detail.href=fullFinanceHref();
 const note=$("accessModeNote");
 note.hidden=!readOnly;note.textContent=readOnly?(lang==="pt"?"Perfil de consulta: apenas visualização. Nenhum lançamento, envio ou resposta pode ser registrado nesta demonstração.":"Read-only preview: no entries, uploads or replies. This URL is not authorization."):"";
 $("period").value=period;$("cnpj").value=cnpjIdByLegacy[cnpj];
}
function openModal(type,id){
if(readOnly&&type!=="source")return;
openDialog=type;activeRequest=id||null;const m=$("modalBack");m.hidden=false;
const title={expense:"newExpense",document:"newDoc",response:"reply",source:"sourceTitle"};
$("modalTitle").textContent=t(title[type]);$("modalDesc").textContent=t(({expense:"addDesc",document:"uploadDesc",response:"responseDesc",source:"sourceDesc"})[type]);
const form=$("modalFields");
if(type==="expense")form.innerHTML='<div class="field"><label for="entryName">'+t("expenseName")+'</label><input required id="entryName" maxlength="90"></div><div class="field"><label for="entryAmount">'+t("expenseValue")+'</label><input required type="number" min=".01" step=".01" id="entryAmount"></div><div class="field"><label for="entryRef">'+t("expenseEvidence")+'</label><input id="entryRef" maxlength="90"></div>';
if(type==="document")form.innerHTML='<div class="field"><label for="entryName">'+t("docName")+'</label><input required id="entryName" maxlength="90" placeholder="comprovante.pdf"></div><div class="field"><label for="docKind">'+t("docType")+'</label><select id="docKind"><option value="typeInvoice">'+t("typeInvoice")+'</option><option value="typeStatement">'+t("typeStatement")+'</option><option value="typeOther">'+t("typeOther")+'</option></select></div>';
if(type==="response")form.innerHTML='<div class="info">'+(reqs.find(x=>x.id===activeRequest)?t(reqs.find(x=>x.id===activeRequest).title):"")+'</div><div class="field"><label for="entryName">'+t("responseField")+'</label><textarea id="entryName" required maxlength="1200"></textarea></div>';
if(type==="source")form.innerHTML=sources()+'<div class="notice">'+t("sourceAlert")+'</div>';
$("modalSubmit").hidden=type==="source";$("modalCancel").textContent=t(type==="source"?"close":"cancel");$("modalForm").reset();m.querySelector("input,textarea,button")?.focus();
}
function closeModal(){$("modalBack").hidden=true;openDialog=null;activeRequest=null}
function addEntry(e){
e.preventDefault();if(readOnly)return;if(openDialog==="source"){closeModal();return}
const name=($("entryName")?.value||"").trim();
if(!name){notify(t("errorText"));return}
if(openDialog==="expense"){
const v=Number($("entryAmount").value);if(!Number.isFinite(v)||v<=0){notify(t("errorValue"));return}
records.push({id:"n"+records.length,date:period==="2026-09"?"30/09":"31/08",name,kind:"out",value:v,source:"manual",cnpj,period});notify(t("addOk"));
}
if(openDialog==="document"){documents.push({title:name,date:period==="2026-09"?"30/09/2026":"31/08/2026",kind:$("docKind").value,cnpj,period});notify(t("docOk"))}
if(openDialog==="response"){const r=reqs.find(x=>x.id===activeRequest);if(r)r.status="done";notify(t("responseOk"))}
closeModal();content();
}
document.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
if(b.dataset.page){page=b.dataset.page;window.EvoluShell?.closeDrawer();content();return}
if(b.dataset.go){page=b.dataset.go;window.EvoluShell?.closeDrawer();content();return}
if(b.dataset.action){openModal(b.dataset.action);return}
if(b.dataset.answer){if(!readOnly)openModal("response",b.dataset.answer);return}
if(b.id==="modalCancel"){closeModal();return}

});
$("modalBack").addEventListener("click",e=>{if(e.target.id==="modalBack")closeModal()});
$("modalForm").addEventListener("submit",addEntry);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("modalBack").hidden)closeModal()});
$("period").addEventListener("change",async e=>{
 try{
  workspaceContext=await workspaceController.selectCompetence(e.target.value);
  period=workspaceContext.activeAccountingPeriod.competence;
  renderWorkspaceContext();
  content();
 }catch(error){console.error(error);notify(lang==="pt"?"Competência indisponível neste contexto.":"Period unavailable in this context.")}
});
$("cnpj").addEventListener("change",async e=>{
 try{
  workspaceContext=await workspaceController.selectCnpj(e.target.value);
  cnpj=legacyByCnpjId[workspaceContext.selectedCnpjId]||"a";
  renderWorkspaceContext();
  content();
 }catch(error){console.error(error);notify(lang==="pt"?"Estabelecimento não autorizado.":"Establishment not authorized.")}
});
document.querySelectorAll("[data-t]").forEach(x=>x.textContent=t(x.dataset.t));
document.addEventListener("ux:locale",()=>{lang=document.documentElement.lang.startsWith("en")?"en":"pt";document.querySelectorAll("[data-t]").forEach(x=>{x.textContent=t(x.dataset.t)});renderWorkspaceContext();content();});
try{
 workspaceContext=await workspaceController.load({
  cnpjId:requestedCnpjId||cnpjIdByLegacy[cnpj],
  competence:period
 });
 cnpj=legacyByCnpjId[workspaceContext.selectedCnpjId]||"a";
 period=workspaceContext.activeAccountingPeriod.competence;
 renderWorkspaceContext();
 content();
}catch(error){
 console.error(error);
 const note=$("accessModeNote");
 note.hidden=false;
 note.textContent=lang==="pt"
  ?"O contexto solicitado não está autorizado ou disponível para esta empresa."
  :"The requested context is not authorized or available for this company.";
 $("period").disabled=true;
 $("cnpj").disabled=true;
 $("pageContent").innerHTML='<div class="empty">'+(lang==="pt"
  ?"Não foi possível abrir este CNPJ/competência. Retorne por uma rota autorizada."
  :"This establishment/period could not be opened. Return through an authorized route.")+'</div>';
}
})();

