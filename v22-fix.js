/* V2.2 compatibility bridge: routes legacy/manual fiscal writes through the V2.2 per-document state model. */
(() => {
  const previousApplyPurpose = applyPurpose;

  function v22Timestamp(){
    return new Intl.DateTimeFormat(state.lang==='pt'?'pt-BR':'en-US',{
      day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'
    }).format(new Date());
  }

  applyPurpose = function(value,source='manual'){
    if(state.page!=='fiscal-detail' || !state.v22AppliedPurposes){
      return previousApplyPurpose(value,source);
    }

    const invoice=currentInvoice();
    state.v22AppliedPurposes[invoice.id]=value;
    state.proposals.fiscalPurpose=null;

    if(invoice.itemCode==='bearing-6305'){
      const row=state.ledger.find(r=>r.id==='bearing-purpose');
      if(row){
        row.value={pt:PURPOSE_LABELS[value].pt,en:PURPOSE_LABELS[value].en};
        row.valueKey=value;
        row.source=source==='assistant'
          ?{pt:'Confirmação via EVOLU Intelligence',en:'Confirmation via EVOLU Intelligence'}
          :{pt:'Preenchimento manual na Platform',en:'Manual input in Platform'};
        row.sourceType='human';
        row.evidence=source==='assistant'
          ?{pt:'Confirmação explícita antes da execução',en:'Explicit confirmation before execution'}
          :{pt:'Ação manual concluída no campo operacional',en:'Manual action completed in the operational field'};
        row.recordedAt=v22Timestamp();
        row.recordedBy={pt:'Usuário da demo',en:'Demo user'};
        row.scope='ACME Industrial · bearing-6305';
        row.status='human_confirmed';
        row.effective='09/2026';
      }
    }

    state.decisions.push({
      object:invoice.id,
      action:{pt:`Finalidade econômica → ${PURPOSE_LABELS[value].pt}`,en:`Economic purpose → ${PURPOSE_LABELS[value].en}`},
      source:source==='assistant'
        ?{pt:'Autorização explícita via Intelligence',en:'Explicit authorization via Intelligence'}
        :{pt:'Execução manual guiada',en:'Guided manual execution'}
    });

    renderPage();
    showToast(t('saved'));
  };
})();
