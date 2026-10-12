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
  drawer.append(head, status, stream, plan, form);
  root.append(invitation, drawer, trigger);
  document.body.append(root);

  const observations = [];
  let cooldownUntil = 0;
  let conversationAccepted = false;

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
  form.addEventListener("submit", event => {
    event.preventDefault();
    const input = question.value.trim();
    if (!input) return;
    say("Você", input);
    question.value = "";
    say("Intelligence (prévia)", "Entendi seu pedido. A análise real exige sessão autorizada e o motor Intelligence. Posso apenas apresentar um plano sintético para você revisar; nada será executado.");
    plan.hidden = false;
  });
  authorize.addEventListener("click", () => {
    plan.hidden = true;
    say("Estado de autorização (prévia)", "Intenção humana simulada. A Platform não foi acionada: não existe plano persistido, autorização validada ou operação executada.");
    status.textContent = "NENHUMA EXECUÇÃO • Revalidação na Platform obrigatória.";
  });
})();
