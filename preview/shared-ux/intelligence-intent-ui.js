/* Genesis presentation-only component registry.
 * Expects a V1 intent ALREADY VALIDATED by private host in live use.
 * This public preview uses only synthetic fixtures, no network/AI/storage.
 * Never render arbitrary HTML, code, URLs or operational commands from motor.
 */
(function (global) {
  "use strict";
  const i18n=global.EvoluIntelligenceI18n;
  if(!i18n)throw new Error("intelligence_locale_unavailable");
  const t=(key,vars)=>i18n.t(key,vars);
  const kinds = new Set(["SILENT", "INVITE", "ASK", "EXPLAIN",
    "COMPARE_SCENARIOS", "PRESENT_EVIDENCE", "PLAN_PRESENTED", "UNAVAILABLE"]);
  const blockKinds = new Set(["TEXT", "QUESTION", "EVIDENCE", "SCENARIO", "NOTICE", "PLAN"]);
  function element(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (typeof value === "string") node.textContent = value;
    return node;
  }
  function safeText(value, max) {
    return typeof value === "string" && value.trim() && value.length <= max ? value : null;
  }
  function addList(host, values, cls) {
    if (!Array.isArray(values) || values.length > 8 || !values.every(x => safeText(x, 500))) {
      throw new Error("invalid_presentation_list");
    }
    const list = element("ul", cls);
    values.forEach(value => list.append(element("li", null, value)));
    host.append(list);
  }
  /**
   * onAnswer is called only by a human button activation, never as a side effect
   * of receiving an intent. It is UI input for a future authorized host.
   */
  function render(host, intent, onAnswer) {
    if (!host || !intent || !kinds.has(intent.kind) ||
        intent.schemaVersion !== "1.1.0" ||
        intent.locale !== i18n.locale() ||
        intent.lifecycleEffect !== "NONE" || intent.executionAuthority !== "NONE" ||
        !Array.isArray(intent.blocks) || intent.blocks.length > 10 ||
        !intent.blocks.every(block => block && blockKinds.has(block.type))) {
      throw new Error("invalid_presentation_intent");
    }
    // Validate the whole payload before modifying the page (fail closed).
    for (const block of intent.blocks) {
      switch (block.type) {
        case "TEXT":
          if (!safeText(block.text, 6000)) throw new Error("invalid_presentation_block");
          break;
        case "QUESTION":
          if (!safeText(block.prompt, 2000) || !safeText(block.responseKey, 128)) {
            throw new Error("invalid_presentation_block");
          }
          if (block.options !== undefined &&
              (!Array.isArray(block.options) || block.options.length < 1 ||
               block.options.length > 8 ||
               !block.options.every(value => safeText(value, 500)))) {
            throw new Error("invalid_presentation_block");
          }
          break;
        case "EVIDENCE":
          if (!safeText(block.title, 300) || !safeText(block.sourceId, 128) ||
              !safeText(block.excerpt, 2400)) throw new Error("invalid_presentation_block");
          break;
        case "SCENARIO":
          if (!safeText(block.title, 160) || !safeText(block.summary, 1600) ||
              !Array.isArray(block.assumptions) || !Array.isArray(block.risks)) {
            throw new Error("invalid_presentation_block");
          }
          break;
        case "NOTICE":
          if (!["INFO", "CAUTION"].includes(block.level) || !safeText(block.text, 2000)) {
            throw new Error("invalid_presentation_block");
          }
          break;
        case "PLAN":
          if (!safeText(block.planId, 128) || !Number.isSafeInteger(block.revision) ||
              block.revision < 1 || !safeText(block.summary, 2000) ||
              !Array.isArray(block.steps) || block.steps.length < 1 || block.steps.length > 12 ||
              !block.steps.every(step => step &&
                safeText(step.stepId, 128) && safeText(step.description, 1000) &&
                ["LOW", "HIGH", "REGULATED"].includes(step.risk))) {
            throw new Error("invalid_presentation_block");
          }
          break;
      }
    }
    if (intent.kind === "SILENT" && intent.blocks.length !== 0) throw new Error("invalid_silence");
    const fragment = document.createDocumentFragment();
    const group = element("section", "intelligence-dynamic-intent");
    group.dataset.kind = intent.kind;
    for (const block of intent.blocks) {
      const card = element("div", "intelligence-dynamic-block");
      switch (block.type) {
        case "TEXT":
          card.append(element("p", null, block.text));
          break;
        case "QUESTION":
          card.append(element("strong", null, block.prompt));
          if (Array.isArray(block.options)) {
            const choices = element("div", "intelligence-dynamic-choices");
            for (const choice of block.options) {
              const button = element("button", "ux-btn", choice);
              button.type = "button";
              button.addEventListener("click", () => {
                if (typeof onAnswer === "function") onAnswer(block.responseKey, choice);
              });
              choices.append(button);
            }
            card.append(choices);
          } else {
            card.append(element("small", null, t("rendererQuestionHint")));
          }
          break;
        case "EVIDENCE":
          card.append(element("strong", null, block.title));
          card.append(element("p", null, block.excerpt));
          card.append(element("small", null, t("rendererReference", {source:block.sourceId})));
          break;
        case "SCENARIO":
          card.append(element("strong", null, block.title));
          card.append(element("p", null, block.summary));
          card.append(element("small", null, t("rendererAssumptions")));
          addList(card, block.assumptions, "intelligence-scenario-list");
          card.append(element("small", null, t("rendererRisks")));
          addList(card, block.risks, "intelligence-scenario-list");
          break;
        case "NOTICE":
          card.append(element("strong", null, block.level === "CAUTION" ?
            t("rendererCaution") : t("rendererInfo")));
          card.append(element("p", null, block.text));
          break;
        case "PLAN":
          card.append(element("strong", null, t("rendererPlan", {id:block.planId,revision:block.revision})));
          card.append(element("p", null, block.summary));
          addList(card, block.steps.map(step =>
            step.description + " [" + step.risk + "]"), "intelligence-scenario-list");
          card.append(element("small", null, t("rendererPlanNoExecution")));
          break;
      }
      group.append(card);
    }
    fragment.append(group);
    host.append(fragment);
    return group;
  }
  global.EvoluIntelligenceIntentUI = Object.freeze({render});
})(window);
