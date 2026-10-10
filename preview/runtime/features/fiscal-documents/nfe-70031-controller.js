import { createNfe70031ScenarioState, economicPurposeLabels, mockCnpj, mockCompany, mockDocument, mockTenant } from "../../mocks/scenarios/nfe-70031.js";
import { MockPlatformProvider } from "../../providers/platform/MockPlatformProvider.js";
import { MockIntelligenceProvider } from "../../providers/intelligence/MockIntelligenceProvider.js";
const purposeLabels = { ...economicPurposeLabels, unknown: "Não sei" };
function createProviders() {
    const state = createNfe70031ScenarioState();
    return { platform: new MockPlatformProvider(state), intelligence: new MockIntelligenceProvider(state) };
}
let providers = createProviders();
let selectedPurpose = null;
let currentRecommendation = null;
let currentDecision = null;
let currentApproval = null;
const $ = (id) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`missing_element:${id}`);
    return element;
};
const choices = Array.from(document.querySelectorAll(".choice"));
const toast = $("toast");
function now() { return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()); }
function notify(message) {
    toast.textContent = message;
    toast.hidden = false;
    const fn = notify;
    window.clearTimeout(fn.timer);
    fn.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
}
function setStep(name, status, text) {
    const step = document.querySelector(`[data-step="${name}"]`);
    if (!step) return;
    step.classList.remove("active", "done");
    if (status) step.classList.add(status);
    const strong = step.querySelector("strong");
    if (strong) strong.textContent = text;
}
function setAudit(id, state, title, text) {
    const element = $(id);
    element.classList.remove("active", "done");
    if (state) element.classList.add(state);
    element.querySelector("small").textContent = now();
    element.querySelector("strong").textContent = title;
    element.querySelector("p").textContent = text;
}
function confidenceLabel(value) {
    if (value === undefined) return "—";
    if (value >= 0.85) return "Alta";
    if (value >= 0.6) return "Média";
    return "Baixa";
}
async function hydrateDocument() {
    const context = await providers.platform.getDocumentAnalysisContext({
        tenantId: mockTenant.tenantId, companyId: mockCompany.companyId, cnpjId: mockCnpj.cnpjId, documentId: mockDocument.documentId
    });
    const document = context.document;
    const item = document.items[0];
    if (!item) throw new Error("mock_document_item_missing");
    $("docType").textContent = "NF-e";
    $("docNumber").textContent = document.documentNumber;
    $("docSupplier").textContent = document.counterparty.name;
    $("docIssueDate").textContent = new Intl.DateTimeFormat("pt-BR").format(new Date(`${document.issueDate}T12:00:00`));
    $("itemDescription").textContent = item.description;
    $("itemValue").textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unitValue);
    $("itemNcm").textContent = item.taxClassification.ncm ?? "—";
    $("itemCfop").textContent = item.taxClassification.cfop ?? "—";
    $("itemIcms").textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(document.taxSummary.icms ?? 0));
    $("itemQuantity").textContent = `${item.quantity} un.`;
}
async function selectPurpose(button) {
    const purpose = button.dataset.purpose;
    if (!purpose || !(purpose in purposeLabels)) return;
    choices.forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedPurpose = purpose;
    await providers.platform.providePendingItemInformation({
        schemaVersion: "1.0.0", tenantId: mockTenant.tenantId, companyId: mockCompany.companyId, cnpjId: mockCnpj.cnpjId,
        pendingItemId: "pending-economic-purpose-70031", response: { economicPurpose: purpose }, respondedBy: "mock-user"
    });
    $("purposeValue").textContent = purposeLabels[purpose];
    $("reanalyze").disabled = false;
    $("recommendationBlock").hidden = true;
    $("approvalBlock").hidden = true;
    $("executeBlock").hidden = true;
    $("resultBlock").hidden = true;
    currentRecommendation = null; currentDecision = null; currentApproval = null;
    setStep("analysis", "active", purpose === "unknown" ? "Contexto continua insuficiente" : "Contexto informado");
    setStep("recommendation", "", "Aguardando reanálise");
    setStep("decision", "", "Não iniciada");
    setStep("approval", "", "Não iniciada");
    setStep("execution", "", "Não solicitada");
    notify("Informação registrada no cenário. Reanalise para continuar.");
}
async function reanalyze() {
    if (!selectedPurpose) return;
    const result = await providers.intelligence.requestDocumentAnalysis({
        schemaVersion: "1.0.0", tenantId: mockTenant.tenantId, companyId: mockCompany.companyId, cnpjId: mockCnpj.cnpjId,
        documentId: mockDocument.documentId, purpose: "economic_purpose_review", requestedBy: "mock-user"
    });
    if (result.status === "insufficient_context") {
        $("analysisPill").textContent = "INSUFFICIENT_CONTEXT";
        $("analysisPill").classList.remove("ready");
        setStep("analysis", "active", "Contexto insuficiente");
        setAudit("auditContext", "active", "Pendência mantida", "A empresa informou que ainda não sabe a finalidade econômica.");
        notify("A análise permaneceu inconclusiva sem forçar uma recomendação.");
        return;
    }
    const recommendation = result.recommendations[0];
    if (!recommendation) { notify("A análise foi concluída sem recomendação."); return; }
    currentRecommendation = recommendation;
    $("recommendationTitle").textContent = recommendation.title;
    $("recommendationText").textContent = recommendation.rationale;
    $("confidenceText").textContent = confidenceLabel(recommendation.confidence);
    $("recommendationBlock").hidden = false;
    $("analysisPill").textContent = "COMPLETED";
    $("analysisPill").classList.add("ready");
    setStep("analysis", "done", "Concluída");
    setStep("recommendation", "active", "Disponível");
    setAudit("auditContext", "done", "Contexto confirmado", `${purposeLabels[selectedPurpose]}.`);
    setAudit("auditRecommendation", "active", "Recomendação criada", `${recommendation.title}.`);
    notify("Reanálise concluída. Uma recomendação está disponível.");
}
async function acceptRecommendation() {
    if (!currentRecommendation) return;
    currentDecision = await providers.platform.recordDecision({
        analysisId: currentRecommendation.analysisId, recommendationId: currentRecommendation.recommendationId, decision: "accept", decidedBy: "mock-user"
    });
    $("approvalBlock").hidden = !currentRecommendation.requiresApproval;
    setStep("recommendation", "done", "Aceita"); setStep("decision", "done", "Aceitar");
    setStep("approval", currentRecommendation.requiresApproval ? "active" : "", currentRecommendation.requiresApproval ? "Aguardando aprovação" : "Não necessária");
    setAudit("auditRecommendation", "done", "Recomendação aceita", `${currentRecommendation.title}.`);
    setAudit("auditDecision", "done", "Decisão registrada", "Usuário aceitou a recomendação.");
    notify("Decision registrada. A recomendação ainda não executou nenhuma alteração.");
}
async function rejectRecommendation() {
    if (!currentRecommendation) return;
    currentDecision = await providers.platform.recordDecision({
        analysisId: currentRecommendation.analysisId, recommendationId: currentRecommendation.recommendationId, decision: "reject", decidedBy: "mock-user"
    });
    currentApproval = null; $("approvalBlock").hidden = true; $("executeBlock").hidden = true;
    setStep("recommendation", "done", "Rejeitada"); setStep("decision", "done", "Rejeitar");
    setStep("approval", "", "Não necessária"); setStep("execution", "", "Não solicitada");
    setAudit("auditRecommendation", "done", "Recomendação rejeitada", "Nenhuma alteração foi autorizada.");
    setAudit("auditDecision", "done", "Decisão registrada", "Usuário rejeitou a recomendação.");
    notify("Recomendação rejeitada. Nenhuma mutação foi solicitada.");
}
async function approveAction() {
    if (!currentDecision) return;
    currentApproval = await providers.platform.recordApproval({
        decisionId: currentDecision.decisionId, subjectType: "FiscalDocument", subjectId: mockDocument.documentId, outcome: "approve", actor: "mock-approver"
    });
    $("executeBlock").hidden = false; setStep("approval", "done", "Aprovada"); setStep("execution", "active", "Pronta para executar");
    notify("ApprovalRecord criado. A execução continua separada.");
}
async function rejectApproval() {
    if (!currentDecision) return;
    currentApproval = await providers.platform.recordApproval({
        decisionId: currentDecision.decisionId, subjectType: "FiscalDocument", subjectId: mockDocument.documentId, outcome: "reject", actor: "mock-approver"
    });
    $("executeBlock").hidden = true; setStep("approval", "done", "Rejeitada"); setStep("execution", "", "Bloqueada");
    notify("Aprovação rejeitada. ActionCommand não será criado.");
}
async function executeAction() {
    if (!currentApproval || currentApproval.status !== "approved" || !currentRecommendation) return;
    const result = await providers.platform.requestActionExecution({
        tenantId: mockTenant.tenantId, companyId: mockCompany.companyId, cnpjId: mockCnpj.cnpjId,
        authorization: { kind: "approval_record", approvalId: currentApproval.approvalId },
        actionType: "record_economic_purpose", subjectId: mockDocument.documentId, payload: currentRecommendation.proposedChange ?? {}, requestedBy: "mock-user"
    });
    $("resultBlock").hidden = false; $("executeBlock").hidden = true;
    setStep("execution", "done", result.status === "succeeded" ? "Succeeded" : result.status);
    setAudit("auditExecution", "done", "Alteração executada", `ActionResult ${result.status} · finalidade registrada.`);
    notify(`ActionResult: ${result.status}.`);
}
function resetFlow() {
    providers = createProviders(); selectedPurpose = null; currentRecommendation = null; currentDecision = null; currentApproval = null;
    choices.forEach(item => item.classList.remove("selected"));
    $("purposeValue").textContent = "Não informada"; $("reanalyze").disabled = true;
    $("recommendationBlock").hidden = true; $("approvalBlock").hidden = true; $("executeBlock").hidden = true; $("resultBlock").hidden = true;
    $("analysisPill").textContent = "INSUFFICIENT_CONTEXT"; $("analysisPill").classList.remove("ready");
    setStep("analysis", "active", "Contexto insuficiente"); setStep("recommendation", "", "Aguardando contexto");
    setStep("decision", "", "Não iniciada"); setStep("approval", "", "Não iniciada"); setStep("execution", "", "Não solicitada");
    ["auditContext", "auditRecommendation", "auditDecision", "auditExecution"].forEach((id, index) => {
        const element = $(id); element.classList.remove("done", "active"); element.querySelector("small").textContent = index === 0 ? "09:41" : "—";
    });
    $("auditContext").classList.add("active");
    $("auditContext").querySelector("strong").textContent = "Informação pendente identificada";
    $("auditContext").querySelector("p").textContent = "Finalidade econômica necessária para continuar.";
    $("auditRecommendation").querySelector("strong").textContent = "Recomendação";
    $("auditRecommendation").querySelector("p").textContent = "Aguardando contexto.";
    $("auditDecision").querySelector("strong").textContent = "Decisão humana";
    $("auditDecision").querySelector("p").textContent = "Aguardando recomendação.";
    $("auditExecution").querySelector("strong").textContent = "Execução";
    $("auditExecution").querySelector("p").textContent = "Não solicitada.";
    notify("Fluxo reiniciado.");
}
async function copyReference() {
    const reference = "NF-e 70031 · ACME Industrial · 09/2026";
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(reference); notify("Referência copiada."); return; } catch { }
    }
    notify(reference);
}
choices.forEach(button => button.addEventListener("click", () => { void selectPurpose(button).catch(error => { console.error(error); notify("Não foi possível registrar a informação no cenário."); }); }));
$("reanalyze").addEventListener("click", () => void reanalyze());
$("acceptRecommendation").addEventListener("click", () => void acceptRecommendation());
$("rejectRecommendation").addEventListener("click", () => void rejectRecommendation());
$("approveAction").addEventListener("click", () => void approveAction());
$("rejectApproval").addEventListener("click", () => void rejectApproval());
$("executeAction").addEventListener("click", () => void executeAction());
$("resetFlow").addEventListener("click", resetFlow);
$("copyRef").addEventListener("click", () => void copyReference());
document.querySelectorAll("[data-doc-tab]").forEach(button => button.addEventListener("click", () => {
    const tab = button.dataset.docTab;
    if (!tab || !["context", "evidence", "decision"].includes(tab)) return;
    document.body.dataset.docPane = tab;
    document.querySelectorAll("[data-doc-tab]").forEach(item => item.setAttribute("aria-selected", String(item.dataset.docTab === tab)));
}));
void hydrateDocument().catch(error => { console.error(error); notify("Não foi possível carregar o cenário sintético."); });
