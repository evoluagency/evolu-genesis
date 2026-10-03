/* Genesis V2.5 — guided tour robustness and operational copy */
(() => {
  const pt = () => state.lang === 'pt';
  const basePushAssistant = pushAssistant;

  Object.assign(I18N.pt, { skipTour: 'Pular tutorial' });
  Object.assign(I18N.en, { skipTour: 'Skip tutorial' });

  const guidedCopy = {
    'open-fiscal': {
      pt: 'Selecione Fiscal > Documentos.',
      en: 'Select Tax > Documents.'
    },
    'open-first': {
      pt: 'Abra a NF-e 70031. Essa operação possui uma informação pendente.',
      en: 'Open NF-e 70031. This transaction has pending information.'
    },
    'open-intelligence': {
      pt: 'Abra a EVOLU pelo símbolo no canto da tela.',
      en: 'Open EVOLU using the symbol in the corner of the screen.'
    },
    'choose-missing': {
      pt: 'Selecione “O que falta para concluir esta análise?”.',
      en: 'Select “What is missing to complete this analysis?”.'
    },
    'send-missing': {
      pt: 'Envie a pergunta pelo botão ao lado do campo de texto.',
      en: 'Send the question using the button next to the text field.'
    },
    'guide': {
      pt: 'Selecione “Revisar informação”.',
      en: 'Select “Review information”.'
    },
    'dont-know': {
      pt: 'Selecione “Não sei”.',
      en: 'Select “I do not know”.'
    },
    'machine': {
      pt: 'Selecione “Máquina existente”.',
      en: 'Select “Existing machine”.'
    },
    'apply-first': {
      pt: 'Confirme a alteração. O registro operacional só muda depois dessa aprovação.',
      en: 'Confirm the change. The operational record changes only after this approval.'
    },
    'similar': {
      pt: 'Abra a operação semelhante indicada pela EVOLU.',
      en: 'Open the similar transaction indicated by EVOLU.'
    },
    'reopen-intelligence': {
      pt: 'Abra a EVOLU novamente.',
      en: 'Open EVOLU again.'
    },
    'same': {
      pt: 'Confirme se a finalidade anterior também se aplica a esta operação.',
      en: 'Confirm whether the previous purpose also applies to this transaction.'
    },
    'apply-reuse': {
      pt: 'Confirme a aplicação da informação nesta operação.',
      en: 'Confirm application of the information to this transaction.'
    },
    'recon': {
      pt: 'Abra Conciliação para revisar as fontes da competência.',
      en: 'Open Reconciliation to review the sources for the period.'
    }
  };

  TOUR.forEach(item => {
    const copy = guidedCopy[item.id];
    if (!copy) return;
    item.title = { pt: 'Demonstração guiada', en: 'Guided demo' };
    item.body = copy;
  });

  function rewriteAssistantCopy(text) {
    if (typeof text !== 'string') return text;
    if (pt()) {
      if (text.startsWith('O documento ') && text.includes('Também encontrei um padrão histórico')) {
        const i = currentInvoice();
        return `${i.id} contém fornecedor, item, NCM, CFOP e tributos destacados. O histórico mostra operações semelhantes, mas a finalidade desta compra ainda não foi confirmada.`;
      }
      if (text.startsWith('O documento está disponível e existe contexto validado anterior')) {
        const ctx = state.ledger.find(r => r.id === 'bearing-purpose');
        return `Existe uma informação previamente validada para este item: ${ctx ? langValue(ctx.value) : '—'}. Confirme se ela também se aplica à operação atual.`;
      }
      if (text.startsWith('Encontrei 12 operações semelhantes:')) {
        return 'Nas 12 operações semelhantes, 8 foram tratadas como manutenção, 3 como produção e 1 como consumo. Esse histórico é uma referência e não define a finalidade da operação atual.';
      }
      if (text.startsWith('Antes de qualquer conclusão tributária')) {
        return 'Para revisar o tratamento tributário, primeiro selecione a perspectiva e confirme a finalidade econômica do item. Esta demonstração não determina direito a crédito.';
      }
      if (text.startsWith('Qual é a finalidade econômica deste item? Se você')) {
        return 'Informe a finalidade econômica do item. Se não souber a classificação, selecione “Não sei”.';
      }
      if (text.startsWith('Sem problema. Em vez de pedir uma classificação técnica')) {
        return 'Onde este item será utilizado?';
      }
      if (text.startsWith('Pendência contextual criada para a pessoa responsável')) {
        return 'Foi criada uma pendência para o responsável selecionado. Para continuar nesta demonstração, simule a resposta.';
      }
      if (text.startsWith('Com base no contexto operacional, proponho registrar')) {
        return text
          .replace('Com base no contexto operacional, proponho registrar', 'Sugestão: registrar')
          .replace('Isso ainda é uma proposta. A Platform só muda se você autorizar.', 'Nenhuma alteração foi aplicada.');
      }
      if (text.startsWith('Alteração aplicada após autorização')) {
        return 'A alteração foi aplicada após a sua confirmação. Origem, evidência, vigência e escopo foram registrados.';
      }
      if (text.startsWith('Encontrei contexto validado para')) {
        return text
          .replace('Encontrei contexto validado para', 'Há uma informação previamente validada para')
          .replace('Não vou copiar automaticamente. Esta operação segue a mesma finalidade?', 'Confirme se ela também se aplica a esta operação.');
      }
      if (text.startsWith('Proposta: reutilizar')) {
        return text
          .replace('Proposta: reutilizar', 'Sugestão: aplicar')
          .replace('A Platform ainda não foi alterada.', 'Nenhuma alteração foi aplicada.');
      }
      if (text.startsWith('Contexto reutilizado e reconfirmado')) {
        return 'A informação foi reconfirmada e aplicada a esta operação. A origem e a evidência anteriores permanecem registradas junto da nova confirmação.';
      }
      if (text.startsWith('Aqui a linguagem muda. Para IRPJ/CSLL')) {
        return 'Para IRPJ/CSLL, esta análise não trata “crédito” como um tributo indireto. Primeiro é necessário revisar a natureza, a documentação e a finalidade econômica do gasto.';
      }
      if (text.startsWith('Certo. Perspectiva selecionada:')) {
        return text
          .replace('Certo. Perspectiva selecionada:', 'Perspectiva selecionada:')
          .replace('Antes de qualquer conclusão, ainda falta confirmar como o item é usado pela empresa.', 'Ainda falta confirmar como o item é utilizado pela empresa.');
      }
      if (text.startsWith('Em vez de pedir uma classificação técnica, vou decompor a pergunta')) {
        return 'Informe onde o serviço é utilizado.';
      }
      if (text.startsWith('Com esse contexto, minha proposta simulada é:')) {
        return text
          .replace('Com esse contexto, minha proposta simulada é:', 'Sugestão de classificação:')
          .replace('A Platform ainda não foi alterada. Como deseja continuar?', 'Nenhuma alteração foi aplicada.');
      }
      if (text.startsWith('Concluído. Você executou a alteração manualmente')) {
        return 'A alteração manual foi registrada com a origem da ação e permanece disponível na trilha de auditoria.';
      }
    } else {
      if (text.startsWith('Document ') && text.includes('I also found a historical pattern')) {
        const i = currentInvoice();
        return `${i.id} contains supplier, item, NCM, CFOP and highlighted taxes. History shows similar transactions, but the purpose of this purchase has not yet been confirmed.`;
      }
      if (text.startsWith('The document is available and there is previously validated context')) {
        const ctx = state.ledger.find(r => r.id === 'bearing-purpose');
        return `Previously validated information exists for this item: ${ctx ? langValue(ctx.value) : '—'}. Confirm whether it also applies to the current transaction.`;
      }
      if (text.startsWith('I found 12 similar transactions:')) {
        return 'Of 12 similar transactions, 8 were treated as maintenance, 3 as production and 1 as internal use. This history is a reference and does not determine the purpose of the current transaction.';
      }
      if (text.startsWith('Before any tax conclusion')) {
        return 'To review the tax treatment, first select the relevant perspective and confirm the item’s economic purpose. This demo does not determine tax-credit entitlement.';
      }
      if (text.startsWith('What is the economic purpose of this item? If you')) {
        return 'State the item’s economic purpose. If you do not know the classification, select “I do not know”.';
      }
      if (text.startsWith('No problem. Instead of asking for a technical classification')) {
        return 'Where will this item be used?';
      }
      if (text.startsWith('Context request created for the responsible person')) {
        return 'A request was created for the selected responsible person. To continue this demo, simulate the reply.';
      }
      if (text.startsWith('Based on the operational context, I propose recording')) {
        return text
          .replace('Based on the operational context, I propose recording', 'Suggestion: record')
          .replace('This is still a proposal. Platform only changes if you authorize.', 'No change has been applied.');
      }
      if (text.startsWith('Change applied after authorization')) {
        return 'The change was applied after your confirmation. Source, evidence, effective period and scope were recorded.';
      }
      if (text.startsWith('I found validated context for')) {
        return text
          .replace('I found validated context for', 'Previously validated information exists for')
          .replace('I will not copy it automatically. Does this transaction have the same purpose?', 'Confirm whether it also applies to this transaction.');
      }
      if (text.startsWith('Proposal: reuse')) {
        return text
          .replace('Proposal: reuse', 'Suggestion: apply')
          .replace('Platform has not been changed yet.', 'No change has been applied.');
      }
      if (text.startsWith('Context reused and reconfirmed')) {
        return 'The information was reconfirmed and applied to this transaction. The previous source and evidence remain recorded with the new confirmation.';
      }
      if (text.startsWith('The language changes here. For IRPJ/CSLL')) {
        return 'For IRPJ/CSLL, this analysis does not treat “credit” as an indirect-tax credit. First review the expense nature, documentation and economic purpose.';
      }
      if (text.startsWith('Selected perspective:')) {
        return text.replace('Before any conclusion, we still need to confirm how the item is used by the company.', 'We still need to confirm how the item is used by the company.');
      }
      if (text.startsWith('Instead of asking for a technical classification, I will decompose the question')) {
        return 'State where the service is used.';
      }
      if (text.startsWith('With that context, my simulated proposal is:')) {
        return text
          .replace('With that context, my simulated proposal is:', 'Classification suggestion:')
          .replace('Platform has not been changed yet. How do you want to continue?', 'No change has been applied.');
      }
      if (text.startsWith('Done. You executed the change manually')) {
        return 'The manual change was recorded with its source and remains available in the audit trail.';
      }
    }
    return text;
  }

  pushAssistant = function(text, choices) {
    return basePushAssistant(rewriteAssistantCopy(text), choices);
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function basicVisible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0'
      && style.pointerEvents !== 'none'
      && r.width > 2
      && r.height > 2;
  }

  function centerPoint(el) {
    const r = el.getBoundingClientRect();
    return {
      x: clamp(r.left + r.width / 2, 1, innerWidth - 2),
      y: clamp(r.top + r.height / 2, 1, innerHeight - 2)
    };
  }

  function actuallyInteractable(el) {
    if (!basicVisible(el)) return false;
    if (el.matches(':disabled,[aria-disabled="true"]')) return false;
    const r = el.getBoundingClientRect();
    if (r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return false;
    const p = centerPoint(el);
    const stack = document.elementsFromPoint(p.x, p.y);
    const top = stack.find(node => getComputedStyle(node).pointerEvents !== 'none');
    return !!top && (top === el || el.contains(top));
  }

  function candidateSelectors(item) {
    const mobile = matchMedia('(max-width:760px)').matches;
    const assistantOpen = !document.getElementById('intelligencePanel')?.hidden;
    const list = [];

    if (item.id === 'open-fiscal') {
      list.push(mobile ? '#mobileNav [data-page="fiscal-documents"]' : '#appNav [data-page="fiscal-documents"]');
    } else if (item.id === 'recon') {
      if (assistantOpen) list.push('[data-choice-value="v22:open_reconciliation"]');
      list.push(mobile ? '#mobileNav [data-page="reconciliation"]' : '#appNav [data-page="reconciliation"]');
      list.push('[data-page="reconciliation"]');
    } else if (item.id === 'similar') {
      list.push('[data-choice-value="v22:open_similar"]');
      list.push('[data-v22-similar="NF-e 70044"]');
    } else {
      list.push(item.target);
    }
    return [...new Set(list.filter(Boolean))];
  }

  function findCandidate(item) {
    const selectors = candidateSelectors(item);
    for (const selector of selectors) {
      const candidates = [...document.querySelectorAll(selector)].filter(basicVisible);
      const direct = candidates.find(actuallyInteractable);
      if (direct) return direct;
      if (candidates.length) return candidates[0];
    }
    return null;
  }

  findVisibleTarget = function(selector) {
    const candidates = [...document.querySelectorAll(selector)].filter(basicVisible);
    return candidates.find(actuallyInteractable) || candidates[0] || null;
  };

  function localRect(target, shellRect) {
    const r = target.getBoundingClientRect();
    return {
      left: r.left - shellRect.left,
      top: r.top - shellRect.top,
      right: r.right - shellRect.left,
      bottom: r.bottom - shellRect.top,
      width: r.width,
      height: r.height,
      cx: r.left - shellRect.left + r.width / 2,
      cy: r.top - shellRect.top + r.height / 2
    };
  }

  function setBox(el, left, top, width, height) {
    if (!el) return;
    el.style.left = `${Math.max(0, left)}px`;
    el.style.top = `${Math.max(0, top)}px`;
    el.style.width = `${Math.max(0, width)}px`;
    el.style.height = `${Math.max(0, height)}px`;
  }

  function setSpotlight(target) {
    const shellEl = document.getElementById('osShell');
    const shell = shellEl.getBoundingClientRect();
    const r = localRect(target, shell);
    const pad = 7;

    const left = clamp(r.left - pad, 0, shell.width);
    const top = clamp(r.top - pad, 0, shell.height);
    const right = clamp(r.right + pad, 0, shell.width);
    const bottom = clamp(r.bottom + pad, 0, shell.height);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    setBox(document.querySelector('.tour-mask-top'), 0, 0, shell.width, top);
    setBox(document.querySelector('.tour-mask-bottom'), 0, bottom, shell.width, shell.height - bottom);
    setBox(document.querySelector('.tour-mask-left'), 0, top, left, height);
    setBox(document.querySelector('.tour-mask-right'), right, top, shell.width - right, height);
    setBox(document.getElementById('tourFocusRing'), left, top, width, height);

    const ring = document.getElementById('tourFocusRing');
    if (ring) ring.style.borderRadius = `${Math.min(12, Math.max(7, r.height * .22))}px`;
  }

  function overlapArea(a, b) {
    const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return w * h;
  }

  positionTourCard = function(target) {
    const shellEl = document.getElementById('osShell');
    const card = document.getElementById('tourCard');
    if (!shellEl || !card || !target) return;

    const shell = shellEl.getBoundingClientRect();
    const r = localRect(target, shell);
    const mobile = shell.width <= 760;
    const margin = 12;
    const gap = 16;
    const bottomInset = mobile ? 84 : 12;
    const maxBottom = Math.max(margin, shell.height - bottomInset);
    const width = mobile ? Math.max(220, shell.width - margin * 2) : Math.min(326, shell.width - margin * 2);

    card.style.width = `${width}px`;
    card.style.maxWidth = `${width}px`;
    card.style.left = '0px';
    card.style.top = '0px';

    const height = Math.min(card.offsetHeight, maxBottom - margin);
    const maxX = Math.max(margin, shell.width - width - margin);
    const maxY = Math.max(margin, maxBottom - height);
    const targetBox = { left:r.left-9, top:r.top-9, right:r.right+9, bottom:r.bottom+9 };

    const positions = {
      right: { x:r.right + gap, y:clamp(r.cy - height / 2, margin, maxY) },
      left: { x:r.left - width - gap, y:clamp(r.cy - height / 2, margin, maxY) },
      below: { x:clamp(r.cx - width / 2, margin, maxX), y:r.bottom + gap },
      above: { x:clamp(r.cx - width / 2, margin, maxX), y:r.top - height - gap }
    };

    const available = {
      right: shell.width - r.right - margin,
      left: r.left - margin,
      below: maxBottom - r.bottom - margin,
      above: r.top - margin
    };

    let order;
    if (mobile) {
      order = r.cy > shell.height * .54
        ? ['above','below','right','left']
        : ['below','above','right','left'];
    } else {
      order = Object.keys(available).sort((a,b) => available[b] - available[a]);
    }

    const evaluated = order.map((name,index) => {
      const p = positions[name];
      const x = clamp(p.x, margin, maxX);
      const y = clamp(p.y, margin, maxY);
      const box = { left:x, top:y, right:x+width, bottom:y+height };
      return { name, x, y, overlap:overlapArea(box,targetBox), rank:index };
    }).sort((a,b) => a.overlap - b.overlap || a.rank - b.rank);

    const best = evaluated[0];
    card.style.left = `${best.x}px`;
    card.style.top = `${best.y}px`;
    card.dataset.placement = best.name;
    setSpotlight(target);
  };

  function revealTarget(target, callback) {
    try {
      target.scrollIntoView({ block:'nearest', inline:'nearest', behavior:'auto' });
    } catch (_) {}
    requestAnimationFrame(() => requestAnimationFrame(callback));
  }

  function prepareTarget(item, callback, retries = 0) {
    const overlay = document.getElementById('tourOverlay');
    if (overlay) overlay.hidden = true;

    let target = findCandidate(item);
    if (!target) {
      if (retries > 18) return;
      setTimeout(() => prepareTarget(item, callback, retries + 1), 100);
      return;
    }

    revealTarget(target, () => {
      if (actuallyInteractable(target)) {
        callback(target);
        return;
      }

      if (item.id === 'recon' && !document.getElementById('intelligencePanel')?.hidden) {
        const panelChoice = document.querySelector('[data-choice-value="v22:open_reconciliation"]');
        if (!panelChoice && typeof closeAssistant === 'function') closeAssistant();
      }

      target = findCandidate(item);
      if (target && actuallyInteractable(target)) {
        callback(target);
      } else if (retries <= 18) {
        setTimeout(() => prepareTarget(item, callback, retries + 1), 100);
      }
    });
  }

  showTourStep = function() {
    if (!state.guided) return;
    clearTourTarget();
    const item = TOUR[state.tourIndex];
    if (!item) {
      finishTour(true);
      return;
    }

    prepareTarget(item, target => {
      if (!state.guided) return;
      const overlay = document.getElementById('tourOverlay');
      overlay.hidden = false;
      target.classList.add('tour-target');
      document.getElementById('tourStep').textContent = '';
      document.getElementById('tourTitle').textContent = pt() ? 'Demonstração guiada' : 'Guided demo';
      document.getElementById('tourBody').textContent = item.body[state.lang];
      document.getElementById('tourNext').hidden = true;
      document.getElementById('tourSkip').textContent = pt() ? 'Pular tutorial' : 'Skip tutorial';
      document.getElementById('tourCard').setAttribute('aria-modal','false');
      positionTourCard(target);
    });
  };

  showManualStep = function() {
    if (!state.manualTutorial) return;
    clearTourTarget();
    const isPt = pt();
    let selector, body;

    if (state.manualTutorial.kind === 'purpose') {
      if (state.manualTutorial.step === 0) {
        selector = '#economicPurpose';
        body = isPt ? 'No campo Finalidade econômica, selecione uma opção.' : 'In Economic purpose, select an option.';
      } else {
        selector = '#savePurpose';
        body = isPt ? 'Salve a informação.' : 'Save the information.';
      }
    } else {
      if (state.manualTutorial.step === 0) {
        selector = '#accountSelect';
        body = isPt ? 'Selecione a conta contábil.' : 'Select the accounting account.';
      } else if (state.manualTutorial.step === 1) {
        selector = '#costCenterSelect';
        body = isPt ? 'Selecione o centro de custo.' : 'Select the cost center.';
      } else {
        selector = '#saveAccounting';
        body = isPt ? 'Salve a classificação.' : 'Save the classification.';
      }
    }

    const item = { id:'manual', target:selector };
    prepareTarget(item, target => {
      target.classList.add('tour-target');
      const overlay = document.getElementById('tourOverlay');
      overlay.hidden = false;
      document.getElementById('tourStep').textContent = '';
      document.getElementById('tourTitle').textContent = isPt ? 'Preenchimento manual' : 'Manual entry';
      document.getElementById('tourBody').textContent = body;
      document.getElementById('tourNext').hidden = true;
      document.getElementById('tourSkip').textContent = isPt ? 'Pular tutorial' : 'Skip tutorial';
      document.getElementById('tourCard').setAttribute('aria-modal','false');
      positionTourCard(target);
    });
  };

  let raf = 0;
  function activeTarget() {
    if (state.manualTutorial) {
      const kind = state.manualTutorial.kind;
      const step = state.manualTutorial.step;
      const selector = kind === 'purpose'
        ? (step === 0 ? '#economicPurpose' : '#savePurpose')
        : (step === 0 ? '#accountSelect' : step === 1 ? '#costCenterSelect' : '#saveAccounting');
      return findVisibleTarget(selector);
    }
    if (!state.guided) return null;
    const item = TOUR[state.tourIndex];
    return item ? findCandidate(item) : null;
  }

  function repositionActiveTour() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const overlay = document.getElementById('tourOverlay');
      if (!overlay || overlay.hidden) return;
      const target = activeTarget();
      if (target && actuallyInteractable(target)) positionTourCard(target);
    });
  }

  window.addEventListener('resize', repositionActiveTour, { passive:true });
  document.addEventListener('scroll', repositionActiveTour, true);

  applyI18n();
  const skip = document.getElementById('tourSkip');
  if (skip) skip.textContent = pt() ? 'Pular tutorial' : 'Skip tutorial';
})();