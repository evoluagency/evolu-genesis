// Genesis preview only. No fetch, authentication, storage, inference or operational commands.
(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const threads = [];
  let currentId = null;
  let counter = 0;

  function newThread() {
    const thread = { id: ++counter, title: "Nova conversa", messages: [] };
    threads.unshift(thread);
    currentId = thread.id;
    render();
    byId("question").focus();
  }
  function currentThread() {
    return threads.find((thread) => thread.id === currentId);
  }
  function appendMessage(host, role, text, meta) {
    const article = document.createElement("article");
    article.className = "consultation-message " + (role === "user" ? "from-user" : "from-system");
    const heading = document.createElement("strong");
    heading.textContent = role === "user" ? "Sua pergunta" : "Prévia de resposta";
    const body = document.createElement("p");
    body.textContent = text;
    article.append(heading, body);
    if (meta) {
      const footnote = document.createElement("small");
      footnote.textContent = meta;
      article.append(footnote);
    }
    host.append(article);
  }
  function render() {
    const thread = currentThread();
    const list = byId("thread-list");
    list.replaceChildren();
    for (const item of threads) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "consultation-thread " + (item.id === currentId ? "active" : "");
      button.textContent = item.title;
      button.setAttribute("aria-current", String(item.id === currentId));
      button.addEventListener("click", () => { currentId = item.id; render(); });
      li.append(button);
      list.append(li);
    }

    const host = byId("messages");
    host.replaceChildren();
    if (!thread || thread.messages.length === 0) {
      const empty = document.createElement("p");
      empty.className = "consultation-empty";
      empty.textContent = "Conversa vazia. Nenhuma resposta de IA é gerada nesta prévia.";
      host.append(empty);
    } else {
      for (const message of thread.messages) {
        appendMessage(host, message.role, message.text, message.meta);
      }
    }
    host.scrollTop = host.scrollHeight;
  }
  function updateContext() {
    const selected = byId("company").value === "synthetic";
    byId("context-state").textContent = selected
      ? "ACME Industrial · referência fictícia, NÃO verificada por RLS"
      : "Contexto geral · sem dados reais";
  }

  byId("new-thread").addEventListener("click", newThread);
  byId("company").addEventListener("change", updateContext);
  byId("reference-date").addEventListener("change", updateContext);
  byId("consultation-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = byId("question");
    const question = input.value.trim();
    if (!question) return;
    const thread = currentThread();
    if (!thread) return;
    const selected = byId("company").value === "synthetic";
    const referenceDate = byId("reference-date").value;
    if (thread.messages.length === 0) thread.title = question.slice(0, 48);
    thread.messages.push({ role: "user", text: question });
    thread.messages.push({
      role: "system",
      text: "Esta é somente a estrutura visual da consulta. Nenhuma análise foi executada e não há recomendação ou evidência operacional. A resposta real dependerá da sessão autorizada, do contrato consultivo e do runtime Intelligence.",
      meta: selected
        ? "Fonte: cenário sintético ACME Industrial · data escolhida: " + referenceDate + " · RLS não verificado"
        : "Fonte: nenhuma · consulta geral não executada",
    });
    input.value = "";
    render();
    byId("status").textContent = "Prévia atualizada em memória temporária; nenhum dado foi enviado.";
  });
  byId("question").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      byId("consultation-form").requestSubmit();
    }
  });
  updateContext();
  newThread();
})();
