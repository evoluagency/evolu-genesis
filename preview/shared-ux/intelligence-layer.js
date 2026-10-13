/* EVOLU Intelligence floating preview — observation is local and non-persistent.
 * NO network, AI, storage, personal telemetry, actual commands or execution.
 * Host pages opt in by including this script; not a global backend feature.
 */
(() => {
  "use strict";
  const root = document.createElement("aside");
  root.className = "intelligence-layer";
  root.setAttribute("aria-label", "Intelligence contextual — simulação");
  root.dataset.state = "dormant";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "intelligence-trigger";
  trigger.setAttribute("aria-label", "Abrir EVOLU Intelligence");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "intelligence-drawer");
  const img = document.createElement("img");
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.src = new URL("./intelligence-mark-transparent.svg", document.currentScript?.src || document.baseURI).href;
  trigger.append(img);

  const invitation = document.createElement("div");
  invitation.className = "intelligence-invitation";
  invitation.hidden = true;
  const invitationText = document.createElement("p");
  invitationText.textContent = "Percebi algumas revisões nesta seleção. Quer ajuda para conferir o contexto?";
  const invitationAccept = document.createElement("button");
  invitationAccept.type = "button";
  invitationAccept.textContent = "Quero ajuda";
  invitationAccept.className = "ux-btn ux-btn-primary";
  const invitationDismiss = document.createElement("button");
  invitationDismiss.type = "button";
  invitationDismiss.textContent = "Agora não";
  invitationDismiss.className = "ux-btn";
  invitation.append(invitationText, invitationAccept, invitationDismiss);

  const drawer = document.createElement("section");
  drawer.id = "intelligence-drawer";
  drawer.className = "intelligence-drawer";
  drawer.hidden = true;
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "false");
  drawer.setAttribute("aria-label", "Conversa com a EVOLU Intelligence");
  const head = document.createElement("header");
  head.className = "intelligence-drawer-head";
  const heading = document.createElement("strong");
  heading.textContent = "EVOLU Intelligence";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "ux-btn";
  close.textContent = "Fechar";
  head.append(heading, close);
  const status = document.createElement("p");
  status.className = "intelligence-sandbox-status";
  status.textContent = "SIMULAÇÃO • Sem IA conectada, dados reais ou comandos.";
  // Observation is OFF by default. The person enables help for this page only.
  // This consent is never persisted, and turning it off drops all local signals.
  const observeLabel = document.createElement("label");
  observeLabel.className = "intelligence-observation-label";
  const observeCheck = document.createElement("input");
  observeCheck.type = "checkbox";
  observeCheck.checked = false;
  const observeCopy = document.createElement("span");
  observeCopy.textContent = "Permitir sugestões contextuais nesta página (sem gravação de digitação)";
  observeLabel.append(observeCheck, observeCopy);
  const modeLabel = document.createElement("label");
  modeLabel.className = "intelligence-demo-mode";
  modeLabel.textContent = "Simulação da intenção do motor";
  const modeSelect = document.createElement("select");
  modeSelect.setAttribute("aria-label", "Escolher somente um exemplo de formato de resposta");
  for (const choice of [
    ["ASK", "Pergunta dinâmica"],
    ["COMPARE_SCENARIOS", "Cenários comparados"],
    ["PRESENT_EVIDENCE", "Evidências"],
    ["PLAN_PRESENTED", "Plano para revisão"],
  ]) {
    const option = document.createElement("option");
    option.value = choice[0];
    option.textContent = choice[1];
    modeSelect.append(option);
  }
  modeLabel.append(modeSelect);
  const stream = document.createElement("div");
  stream.className = "intelligence-stream";
  stream.setAttribute("role", "log");
  stream.setAttribute("aria-live", "polite");
  const plan = document.createElement("section");
  plan.className = "intelligence-plan";
  plan.hidden = true;
  const planHeading = document.createElement("strong");
  planHeading.textContent = "Plano para análise humana — sintético";
  const planCopy = document.createElement("p");
  planCopy.textContent = "1. Conferir o contexto selecionado. 2. Revisar a competência. 3. Registrar uma observação somente após autorização válida na Platform.";
  const authorize = document.createElement("button");
  authorize.type = "button";
  authorize.className = "ux-btn ux-btn-primary";
  authorize.textContent = "Simular autorização (não executar)";
  plan.append(planHeading, planCopy, authorize);
  const form = document.createElement("form");
  form.className = "intelligence-composer";
  const label = document.createElement("label");
  label.textContent = "Sua pergunta";
  label.htmlFor = "intelligence-question";
  const question = document.createElement("textarea");
  question.id = "intelligence-question";
  question.maxLength = 2000;
  question.rows = 2;
  question.placeholder = "Descreva sua dúvida...";
  const send = document.createElement("button");
  send.type = "submit";
  send.className = "ux-btn ux-btn-primary";
  send.textContent = "Conversar";
  form.append(label, question, send);
  drawer.append(head, status, observeLabel, modeLabel, stream, plan, form);
  root.append(invitation, drawer, trigger);
  document.body.append(root);

  const observations = [];
  let cooldownUntil = 0;
  let conversationAccepted = false;
  observeCheck.addEventListener("change", () => {
    observations.length = 0;
    invitation.hidden = true;
    cooldownUntil = 0;
    if (!observeCheck.checked) root.dataset.state = drawer.hidden ? "dormant" : "consulting";
  });

  function say(role, value) {
    const item = document.createElement("p");
    item.className = "intelligence-speech";
    const roleName = document.createElement("strong");
    roleName.textContent = role;
    const body = document.createElement("span");
    body.textContent = value;
    item.append(roleName, body);
    stream.append(item);
    stream.scrollTop = stream.scrollHeight;
  }
  function dismiss() {
    invitation.hidden = true;
    cooldownUntil = Date.now() + 5 * 60 * 1000;
    root.dataset.state = "cooldown";
  }
  function open() {
    invitation.hidden = true;
    drawer.hidden = false;
    root.dataset.state = "consulting";
    trigger.setAttribute("aria-expanded", "true");
    if (!conversationAccepted) {
      conversationAccepted = true;
      say("Intelligence (prévia)", "Você está em uma atividade da Genesis. Posso explicar o contexto ou preparar um plano para sua avaliação. Esta prévia não consulta o motor real.");
    }
    question.focus();
  }
  function shut() {
    drawer.hidden = true;
    root.dataset.state = "dormant";
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  }

  // Privacy boundary: only count explicit select CHANGE events, never capture values,
  // text content, keys, coordinates, screens, names, user identity or focus trace.
  document.addEventListener("change", event => {
    if (!observeCheck.checked) return;
    if (root.contains(event.target) || !(event.target instanceof HTMLSelectElement)) return;
    if (!document.querySelector(".ux-app") || !drawer.hidden || !invitation.hidden) return;
    const time = Date.now();
    if (time < cooldownUntil) return;
    observations.push(time);
    while (observations.length && observations[0] < time - 120000) observations.shift();
    if (observations.length >= 3) {
      invitation.hidden = false;
      root.dataset.state = "invitation";
      observations.length = 0;
    }
  });
  invitationAccept.addEventListener("click", open);
  invitationDismiss.addEventListener("click", dismiss);
  trigger.addEventListener("click", () => drawer.hidden ? open() : shut());
  close.addEventListener("click", shut);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !drawer.hidden) shut();
  });
  // The fixtures below are synthetic. A live Intelligence service will decide
  // intent kind, wording, questions and evidence, then a private host MUST
  // validate with PresentationIntent.ts before calling the same renderer.
  function exampleIntent(kind) {
    const intent = {
      schemaVersion: "1.0.0",
      interactionId: "synthetic-interaction-001",
      scope: {
        tenantId: "11111111-1111-4111-8111-111111111111",
        companyId: "22222222-2222-4222-8222-222222222222",
        cnpjId: "33333333-3333-4333-8333-333333333333",
        pageId: "genesis.synthetic",
      },
      kind, expiresAt: new Date(Date.now() + 300000).toISOString(),
      executionAuthority: "NONE", lifecycleEffect: "NONE", blocks: [],
    };
    if (kind === "ASK") intent.blocks = [
      {type: "TEXT", text: "Exemplo de pergunta definida pelo motor, e não por uma árvore fixa da Genesis."},
      {type: "QUESTION", prompt: "Qual informação técnica você gostaria de esclarecer primeiro?",
        responseKey: "requested-detail", options: [
          "Composição do produto", "Finalidade da operação", "Outro aspecto",
        ]},
    ];
    if (kind === "COMPARE_SCENARIOS") intent.blocks = [
      {type: "SCENARIO", title: "Hipótese A (fictícia)",
        summary: "Comparação ilustrativa de critérios, sem cálculo nem recomendação tributária.",
        assumptions: ["Descrição técnica ainda não verificada"], risks: ["Fundamento jurídico não consultado"]},
      {type: "NOTICE", level: "CAUTION", text: "Não há evidências jurídicas reais nesta prévia."},
    ];
    if (kind === "PRESENT_EVIDENCE") intent.blocks = [
      {type: "EVIDENCE", sourceId: "source-synthetic-001", title: "Documento técnico fictício",
        excerpt: "Fonte de interface fictícia. O motor não consultou legislação ou arquivos reais."},
    ];
    if (kind === "PLAN_PRESENTED") intent.blocks = [
      {type: "PLAN", planId: "plan-synthetic-001", revision: 1,
        summary: "Conferir o contexto e preparar dados para revisão humana.",
        steps: [
          {stepId: "verify-01", description: "Confirmar o produto e sua descrição", risk: "LOW"},
          {stepId: "review-02", description: "Analisar os critérios aplicáveis", risk: "HIGH"},
        ]},
    ];
    return intent;
  }
  function displayExample() {
    const intent = exampleIntent(modeSelect.value);
    plan.hidden = intent.kind !== "PLAN_PRESENTED";
    if (!plan.hidden) {
      planHeading.textContent = "Intenção de execução — somente simulação";
      planCopy.textContent = "Plano sintético " + intent.blocks[0].planId +
        " · revisão " + intent.blocks[0].revision +
        ". A simulação não autentica nem autoriza nenhuma operação.";
    }
    try {
      if (!window.EvoluIntelligenceIntentUI) throw new Error("renderer_unavailable");
      window.EvoluIntelligenceIntentUI.render(stream, intent, (key, answer) => {
        say("Você · escolha do exemplo " + key, answer);
        say("Sistema de prévia", "A resposta não foi enviada à Intelligence. A próxima pergunta dependeria do motor autenticado.");
      });
      stream.scrollTop = stream.scrollHeight;
      status.textContent = "EXEMPLO SINTÉTICO • Intenção " + intent.kind +
        " · nenhuma análise ou execução real.";
    } catch {
      status.textContent = "FORMATO INDISPONÍVEL • Não foi possível apresentar o exemplo.";
      plan.hidden = true;
    }
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const input = question.value.trim();
    if (!input) return;
    say("Você", input);
    question.value = "";
    say("Sistema de prévia", "Consulta não enviada. O formato a seguir é um exemplo sintético, escolhido no seletor; em operação real, somente a Intelligence define a próxima interação.");
    displayExample();
  });
  authorize.addEventListener("click", () => {
    plan.hidden = true;
    say("Estado de autorização (prévia)", "Intenção humana simulada. A Platform não foi acionada: não existe plano persistido, autorização validada ou operação executada.");
    status.textContent = "NENHUMA EXECUÇÃO • Revalidação na Platform obrigatória.";
  });
})();
