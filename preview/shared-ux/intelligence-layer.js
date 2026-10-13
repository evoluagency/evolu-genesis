/* EVOLU Intelligence floating preview — observation is local and non-persistent.
 * NO network, AI, storage, personal telemetry, actual commands or execution.
 * Host pages opt in by including this script; not a global backend feature.
 */
(() => {
  "use strict";
  const i18n = window.EvoluIntelligenceI18n;
  if (!i18n) throw new Error("intelligence_locale_unavailable");
  const t = (key, vars) => i18n.t(key, vars);
  const localized = new Map();
  function bind(node, key, field = "textContent", vars) {
    localized.set(node, {key, field, vars});
    if (field === "aria-label") node.setAttribute(field, t(key, vars));
    else node[field] = t(key, vars);
  }
  const root = document.createElement("aside");
  root.className = "intelligence-layer";
  bind(root, "region", "aria-label");
  root.dataset.state = "dormant";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "intelligence-trigger";
  bind(trigger, "trigger", "aria-label");
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
  bind(invitationText, "invitation");
  const invitationAccept = document.createElement("button");
  invitationAccept.type = "button";
  bind(invitationAccept, "accept");
  invitationAccept.className = "ux-btn ux-btn-primary";
  const invitationDismiss = document.createElement("button");
  invitationDismiss.type = "button";
  bind(invitationDismiss, "dismiss");
  invitationDismiss.className = "ux-btn";
  invitation.append(invitationText, invitationAccept, invitationDismiss);

  const drawer = document.createElement("section");
  drawer.id = "intelligence-drawer";
  drawer.className = "intelligence-drawer";
  drawer.hidden = true;
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "false");
  bind(drawer, "dialog", "aria-label");
  const head = document.createElement("header");
  head.className = "intelligence-drawer-head";
  const heading = document.createElement("strong");
  heading.textContent = "EVOLU Intelligence";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "ux-btn";
  bind(close, "close");
  head.append(heading, close);
  const status = document.createElement("p");
  status.className = "intelligence-sandbox-status";
  bind(status, "initialStatus");
  // Observation is OFF by default. The person enables help for this page only.
  // This consent is never persisted, and turning it off drops all local signals.
  const observeLabel = document.createElement("label");
  observeLabel.className = "intelligence-observation-label";
  const observeCheck = document.createElement("input");
  observeCheck.type = "checkbox";
  observeCheck.checked = false;
  const observeCopy = document.createElement("span");
  bind(observeCopy, "observe");
  observeLabel.append(observeCheck, observeCopy);
  const modeLabel = document.createElement("label");
  modeLabel.className = "intelligence-demo-mode";
  const modeCopy = document.createElement("span");
  bind(modeCopy, "mode");
  modeLabel.append(modeCopy);
  const modeSelect = document.createElement("select");
  bind(modeSelect, "modeAria", "aria-label");
  for (const choice of [
    ["ASK", "askMode"],
    ["COMPARE_SCENARIOS", "scenariosMode"],
    ["PRESENT_EVIDENCE", "evidenceMode"],
    ["PLAN_PRESENTED", "planMode"],
  ]) {
    const option = document.createElement("option");
    option.value = choice[0];
    bind(option, choice[1]);
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
  bind(planHeading, "planTitle");
  const planCopy = document.createElement("p");
  bind(planCopy, "planBody");
  const authorize = document.createElement("button");
  authorize.type = "button";
  authorize.className = "ux-btn ux-btn-primary";
  bind(authorize, "simulate");
  plan.append(planHeading, planCopy, authorize);
  const form = document.createElement("form");
  form.className = "intelligence-composer";
  const label = document.createElement("label");
  bind(label, "questionLabel");
  label.htmlFor = "intelligence-question";
  const question = document.createElement("textarea");
  question.id = "intelligence-question";
  question.maxLength = 2000;
  question.rows = 2;
  bind(question, "questionPlaceholder", "placeholder");
  const send = document.createElement("button");
  send.type = "submit";
  send.className = "ux-btn ux-btn-primary";
  bind(send, "send");
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

  const exampleGroups = [];
  function say(role, value, roleKey, bodyKey, vars) {
    const item = document.createElement("p");
    item.className = "intelligence-speech";
    const roleName = document.createElement("strong");
    roleName.textContent = role;
    if (roleKey) bind(roleName, roleKey, "textContent", vars);
    const body = document.createElement("span");
    body.textContent = value;
    if (bodyKey) bind(body, bodyKey, "textContent", vars);
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
      say(t("agent"), t("welcome"), "agent", "welcome");
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
      {type: "TEXT", text: t("exampleIntro")},
      {type: "QUESTION", prompt: t("examplePrompt"),
        responseKey: "requested-detail", options: [
          t("exampleComposition"), t("examplePurpose"), t("exampleOther"),
        ]},
    ];
    if (kind === "COMPARE_SCENARIOS") intent.blocks = [
      {type: "SCENARIO", title: t("exampleScenarioTitle"),
        summary: t("exampleScenarioSummary"),
        assumptions: [t("exampleAssumption")], risks: [t("exampleRisk")]},
      {type: "NOTICE", level: "CAUTION", text: t("exampleCaution")},
    ];
    if (kind === "PRESENT_EVIDENCE") intent.blocks = [
      {type: "EVIDENCE", sourceId: "source-synthetic-001", title: t("exampleEvidenceTitle"),
        excerpt: t("exampleEvidenceText")},
    ];
    if (kind === "PLAN_PRESENTED") intent.blocks = [
      {type: "PLAN", planId: "plan-synthetic-001", revision: 1,
        summary: t("examplePlanSummary"),
        steps: [
          {stepId: "verify-01", description: t("exampleStepVerify"), risk: "LOW"},
          {stepId: "review-02", description: t("exampleStepReview"), risk: "HIGH"},
        ]},
    ];
    return intent;
  }
  function displayExample() {
    const intent = exampleIntent(modeSelect.value);
    plan.hidden = intent.kind !== "PLAN_PRESENTED";
    if (!plan.hidden) {
      bind(planHeading, "planSimulationTitle");
      bind(planCopy, "planSimulationBody", "textContent", {planId: intent.blocks[0].planId,revision:intent.blocks[0].revision});
    }
    try {
      if (!window.EvoluIntelligenceIntentUI) throw new Error("renderer_unavailable");
      const group = window.EvoluIntelligenceIntentUI.render(stream, intent, (key, answer) => {
        say(t("userChoice", {key}), answer, "userChoice", null, {key});
        say(t("preview"), t("choiceResponse"), "preview", "choiceResponse");
      });
      exampleGroups.push({group, kind:intent.kind});
      stream.scrollTop = stream.scrollHeight;
      bind(status, "selectionPrefix", "textContent", {kind: intent.kind});
    } catch {
      bind(status, "unavailable");
      plan.hidden = true;
    }
  }
  document.addEventListener("ux:locale", () => {
    for (const [node, entry] of localized) {
      if (entry.field === "aria-label") node.setAttribute(entry.field, t(entry.key, entry.vars));
      else node[entry.field] = t(entry.key, entry.vars);
    }
    for (const item of exampleGroups) {
      const intent = exampleIntent(item.kind);
      try {
        const temporary = document.createElement("div");
        const group = window.EvoluIntelligenceIntentUI.render(temporary, intent, (key, answer) => {
          say(t("userChoice", {key}), answer, "userChoice", null, {key});
          say(t("preview"), t("choiceResponse"), "preview", "choiceResponse");
        });
        item.group.replaceWith(group);
        item.group = group;
      } catch {
        item.group.replaceChildren();
      }
    }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const input = question.value.trim();
    if (!input) return;
    say(t("user"), input, "user");
    question.value = "";
    say(t("preview"), t("queryResponse"), "preview", "queryResponse");
    displayExample();
  });
  authorize.addEventListener("click", () => {
    plan.hidden = true;
    say(t("authorization"), t("authorizeNotice"), "authorization", "authorizeNotice");
    bind(status, "noExecution");
  });
})();
