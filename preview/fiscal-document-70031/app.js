import {
  createNfe70031ScenarioState,
  MockPlatformProvider,
  MockIntelligenceProvider,
  Nfe70031Controller,
  mockTenant,
  mockCompany,
  mockCnpj,
  mockDocument,
  mockPeriod,
  purposePendingItem
} from "../runtime/index.js";

const purposeLabels = {
  maintenance: "Manutenção de máquina existente",
  production: "Produção de nova máquina",
  internal_use: "Uso interno / consumo",
  unknown: "Não sei"
};

let selectedPurpose = null;
let controller = createController();

const $ = id => document.getElementById(id);
const choices = Array.from(document.querySelectorAll(".choice"));
const toast = $("toast");

function createController() {
  const scenarioState = createNfe70031ScenarioState();
  const platform = new MockPlatformProvider(scenarioState);
  const intelligence = new MockIntelligenceProvider(scenarioState);

  return new Nfe70031Controller(platform, intelligence, {
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    cnpjId: mockCnpj.cnpjId,
    documentId: mockDocument.documentId,
    pendingItemId: purposePendingItem.pendingItemId,
    actor: "professional-user-demo"
  });
}

function now() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function notify(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function setStep(name, status, text) {
  const step = document.querySelector(`[data-step="${name}"]`);
  if (!step) return;
  step.classList.remove("active", "done");
  if (status) step.classList.add(status);
  const strong = step.querySelector("strong");
  if (text) strong.textContent = text;
}

function setAudit(id, state, title, text) {
  const el = $(id);
  el.classList.remove("active", "done");
  if (state) el.classList.add(state);
  el.querySelector("small").textContent = now();
  el.querySelector("strong").textContent = title;
  el.querySelector("p").textContent = text;
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatCnpj(cnpj) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function renderDocument(context) {
  const document = context.document;
  const item = document.items[0];
  const icms = Number(document.taxSummary.icms ?? 0);

  $("topCnpj").textContent = formatCnpj(mockCnpj.cnpj);
  $("topPeriod").textContent = `${mockPeriod.competence.slice(5)}/${mockPeriod.competence.slice(0, 4)}`;
  $("docHeading").textContent = `NF-e ${document.documentNumber}`;
  $("docSummary").textContent = `${document.counterparty.name} · emissão em ${formatDate(document.issueDate)} · entrada fiscal`;
  $("docType").textContent = "NF-e";
  $("docNumber").textContent = document.documentNumber;
  $("docSupplier").textContent = document.counterparty.name;
  $("docIssueDate").textContent = formatDate(document.issueDate);

  if (item) {
    $("itemDescription").textContent = item.description;
    $("itemValue").textContent = formatCurrency(item.unitValue * item.quantity);
    $("itemNcm").textContent = item.taxClassification.ncm ?? "—";
    $("itemCfop").textContent = item.taxClassification.cfop ?? "—";
    $("itemIcms").textContent = formatCurrency(icms);
    $("itemQuantity").textContent = `${item.quantity} un.`;
  }
}

function renderInitialAnalysis(analysis) {
  $("analysisPill").textContent = analysis.status.toUpperCase();
  $("analysisPill").classList.toggle("ready", analysis.status === "completed");
  const finding = analysis.findings[0];
  if (analysis.status === "insufficient_context" && finding) {
    $("findingTitle").textContent = finding.title;
    $("findingText").textContent = finding.description;
  }
}

function confidenceLabel(value) {
  if (typeof value !== "number") return "—";
  if (value >= 0.85) return "Alta";
  if (value >= 0.6) return "Média";
  return "Baixa";
}

function hideOutcomeBlocks() {
  $("recommendationBlock").hidden = true;
  $("approvalBlock").hidden = true;
  $("executeBlock").hidden = true;
  $("resultBlock").hidden = true;
}

function resetView() {
  selectedPurpose = null;
  choices.forEach(item => item.classList.remove("selected"));
  $("purposeValue").textContent = "Não informada";
  $("reanalyze").disabled = true;
  hideOutcomeBlocks();
  $("analysisPill").textContent = "INSUFFICIENT_CONTEXT";
  $("analysisPill").classList.remove("ready");
  setStep("analysis", "active", "Contexto insuficiente");
  setStep("recommendation", "", "Aguardando contexto");
  setStep("decision", "", "Não iniciada");
  setStep("approval", "", "Não iniciada");
  setStep("execution", "", "Não solicitada");

  ["auditContext", "auditRecommendation", "auditDecision", "auditExecution"].forEach((id, index) => {
    const el = $(id);
    el.classList.remove("done", "active");
    el.querySelector("small").textContent = index === 0 ? "09:41" : "—";
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
}

async function handleProviderError(error, fallbackMessage) {
  console.error(error);
  notify(fallbackMessage);
}

choices.forEach(button => {
  button.addEventListener("click", () => {
    choices.forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedPurpose = button.dataset.purpose;
    $("purposeValue").textContent = purposeLabels[selectedPurpose];
    $("reanalyze").disabled = false;
    hideOutcomeBlocks();
    setStep(
      "analysis",
      "active",
      selectedPurpose === "unknown" ? "Contexto continua insuficiente" : "Contexto informado"
    );
    setStep("recommendation", "", "Aguardando reanálise");
    setStep("decision", "", "Não iniciada");
    setStep("approval", "", "Não iniciada");
    setStep("execution", "", "Não solicitada");
    notify("Informação preparada. Reanalise para continuar.");
  });
});

$("reanalyze").addEventListener("click", async () => {
  if (!selectedPurpose) return;
  $("reanalyze").disabled = true;

  try {
    const analysis = await controller.recordPurpose(selectedPurpose);
    renderInitialAnalysis(analysis);

    if (analysis.status === "insufficient_context") {
      setStep("analysis", "active", "Contexto insuficiente");
      setAudit(
        "auditContext",
        "active",
        "Pendência mantida",
        "A empresa informou que ainda não sabe a finalidade econômica."
      );
      notify("A análise permaneceu inconclusiva sem forçar uma recomendação.");
      return;
    }

    const recommendation = analysis.recommendations[0];
    if (!recommendation) throw new Error("recommendation_missing");

    $("recommendationTitle").textContent = recommendation.title;
    $("recommendationText").textContent = recommendation.rationale;
    $("confidenceText").textContent = confidenceLabel(recommendation.confidence);
    $("recommendationBlock").hidden = false;
    setStep("analysis", "done", "Concluída");
    setStep("recommendation", "active", "Disponível");
    setAudit("auditContext", "done", "Contexto confirmado", `${purposeLabels[selectedPurpose]}.`);
    setAudit("auditRecommendation", "active", "Recomendação criada", `${recommendation.title}.`);
    notify("Reanálise concluída. Uma recomendação está disponível.");
  } catch (error) {
    await handleProviderError(error, "Não foi possível reanalisar o documento.");
  } finally {
    $("reanalyze").disabled = false;
  }
});

$("acceptRecommendation").addEventListener("click", async () => {
  try {
    await controller.recordRecommendationDecision("accept");
    $("approvalBlock").hidden = false;
    setStep("recommendation", "done", "Aceita");
    setStep("decision", "done", "Aceitar");
    setStep("approval", "active", "Aguardando aprovação");
    setAudit("auditRecommendation", "done", "Recomendação aceita", `${$("recommendationTitle").textContent}.`);
    setAudit("auditDecision", "done", "Decisão registrada", "Usuário aceitou a recomendação e solicitou aprovação.");
    notify("Decision registrada. A recomendação ainda não executou nenhuma alteração.");
  } catch (error) {
    await handleProviderError(error, "Não foi possível registrar a decisão.");
  }
});

$("rejectRecommendation").addEventListener("click", async () => {
  try {
    await controller.recordRecommendationDecision("reject");
    $("approvalBlock").hidden = true;
    $("executeBlock").hidden = true;
    setStep("recommendation", "done", "Rejeitada");
    setStep("decision", "done", "Rejeitar");
    setStep("approval", "", "Não necessária");
    setStep("execution", "", "Não solicitada");
    setAudit("auditRecommendation", "done", "Recomendação rejeitada", "Nenhuma alteração foi autorizada.");
    setAudit("auditDecision", "done", "Decisão registrada", "Usuário rejeitou a recomendação.");
    notify("Recomendação rejeitada. Nenhuma mutação foi solicitada.");
  } catch (error) {
    await handleProviderError(error, "Não foi possível registrar a rejeição.");
  }
});

$("approveAction").addEventListener("click", async () => {
  try {
    const approval = await controller.recordApproval("approve");
    if (approval.status !== "approved") throw new Error("approval_not_granted");
    $("executeBlock").hidden = false;
    setStep("approval", "done", "Aprovada");
    setStep("execution", "active", "Pronta para executar");
    notify("ApprovalRecord criado. A execução continua separada.");
  } catch (error) {
    await handleProviderError(error, "Não foi possível registrar a aprovação.");
  }
});

$("rejectApproval").addEventListener("click", async () => {
  try {
    await controller.recordApproval("reject");
    $("executeBlock").hidden = true;
    setStep("approval", "done", "Rejeitada");
    setStep("execution", "", "Bloqueada");
    notify("Aprovação rejeitada. ActionCommand não será criado.");
  } catch (error) {
    await handleProviderError(error, "Não foi possível registrar a rejeição da aprovação.");
  }
});

$("executeAction").addEventListener("click", async () => {
  try {
    const result = await controller.executeApprovedAction();
    if (result.status !== "succeeded") throw new Error("action_execution_failed");
    $("resultBlock").hidden = false;
    $("executeBlock").hidden = true;
    setStep("execution", "done", "Succeeded");
    setAudit("auditExecution", "done", "Alteração executada", "ActionResult succeeded · finalidade registrada.");
    notify("ActionResult: alteração aplicada no cenário sintético.");
  } catch (error) {
    await handleProviderError(error, "A alteração não foi executada.");
  }
});

$("resetFlow").addEventListener("click", async () => {
  controller = createController();
  resetView();
  const loaded = await controller.load();
  renderDocument(loaded.context);
  renderInitialAnalysis(loaded.analysis);
  notify("Fluxo reiniciado.");
});

$("copyRef").addEventListener("click", async () => {
  const ref = `NF-e ${mockDocument.documentNumber} · ${mockCompany.tradeName ?? mockCompany.legalName} · ${mockPeriod.competence.slice(5)}/${mockPeriod.competence.slice(0, 4)}`;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(ref);
      notify("Referência copiada.");
      return;
    } catch {}
  }
  notify(ref);
});

document.querySelectorAll("[data-doc-tab]").forEach(button =>
  button.addEventListener("click", () => {
    const tab = button.dataset.docTab;
    if (!["context", "evidence", "decision"].includes(tab)) return;
    document.body.dataset.docPane = tab;
    document.querySelectorAll("[data-doc-tab]").forEach(item =>
      item.setAttribute("aria-selected", String(item.dataset.docTab === tab))
    );
  })
);

try {
  const loaded = await controller.load();
  renderDocument(loaded.context);
  renderInitialAnalysis(loaded.analysis);
} catch (error) {
  await handleProviderError(error, "Não foi possível carregar o cenário sintético.");
}
