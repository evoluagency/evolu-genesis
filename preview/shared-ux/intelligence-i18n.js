/* Shared Platform shell owns language choice. Intelligence never creates a locale toggle.
 * This module handles UI chrome and synthetic preview fixtures only;
 * it does NOT automatically translate user text, evidence or real model responses.
 */
(function(global){
  "use strict";
  const dictionary = Object.freeze({
    "pt-BR": Object.freeze({
      region:"Intelligence contextual — simulação",
      trigger:"Abrir EVOLU Intelligence",
      dialog:"Conversa com a EVOLU Intelligence",
      invitation:"Percebi algumas revisões nesta seleção. Quer ajuda para conferir o contexto?",
      accept:"Quero ajuda",dismiss:"Agora não",close:"Fechar",
      initialStatus:"SIMULAÇÃO • Sem IA conectada, dados reais ou comandos.",
      observe:"Permitir sugestões contextuais nesta página (sem gravação de digitação)",
      mode:"Simulação da intenção do motor",modeAria:"Escolher somente um exemplo de formato de resposta",
      askMode:"Pergunta dinâmica",scenariosMode:"Cenários comparados",evidenceMode:"Evidências",planMode:"Plano para revisão",
      planTitle:"Plano para análise humana — sintético",
      planBody:"1. Conferir o contexto selecionado. 2. Revisar a competência. 3. Registrar uma observação somente após autorização válida na Platform.",
      simulate:"Simular autorização (não executar)",questionLabel:"Sua pergunta",questionPlaceholder:"Descreva sua dúvida...",send:"Conversar",
      agent:"Intelligence (prévia)",user:"Você",userChoice:"Você · escolha do exemplo {key}",preview:"Sistema de prévia",
      authorization:"Estado de autorização (prévia)",
      welcome:"Você está em uma atividade da Genesis. Posso explicar o contexto ou preparar um plano para sua avaliação. Esta prévia não consulta o motor real.",
      choiceResponse:"A resposta não foi enviada à Intelligence. A próxima pergunta dependeria do motor autenticado.",
      queryResponse:"Consulta não enviada. O formato a seguir é um exemplo sintético, escolhido no seletor; em operação real, somente a Intelligence define a próxima interação.",
      selectionPrefix:"EXEMPLO SINTÉTICO • Intenção {kind} · nenhuma análise ou execução real.",
      unavailable:"FORMATO INDISPONÍVEL • Não foi possível apresentar o exemplo.",
      authorizeNotice:"Intenção humana simulada. A Platform não foi acionada: não existe plano persistido, autorização validada ou operação executada.",
      noExecution:"NENHUMA EXECUÇÃO • Revalidação na Platform obrigatória.",
      planSimulationTitle:"Intenção de execução — somente simulação",
      planSimulationBody:"Plano sintético {planId} · revisão {revision}. A simulação não autentica nem autoriza nenhuma operação.",
      exampleIntro:"Exemplo de pergunta definida pelo motor, e não por uma árvore fixa da Genesis.",
      examplePrompt:"Qual informação técnica você gostaria de esclarecer primeiro?",
      exampleComposition:"Composição do produto",examplePurpose:"Finalidade da operação",exampleOther:"Outro aspecto",
      exampleScenarioTitle:"Hipótese A (fictícia)",exampleScenarioSummary:"Comparação ilustrativa de critérios, sem cálculo nem recomendação tributária.",
      exampleAssumption:"Descrição técnica ainda não verificada",exampleRisk:"Fundamento jurídico não consultado",
      exampleCaution:"Não há evidências jurídicas reais nesta prévia.",
      exampleEvidenceTitle:"Documento técnico fictício",exampleEvidenceText:"Fonte de interface fictícia. O motor não consultou legislação ou arquivos reais.",
      examplePlanSummary:"Conferir o contexto e preparar dados para revisão humana.",
      exampleStepVerify:"Confirmar o produto e sua descrição",exampleStepReview:"Analisar os critérios aplicáveis",
      rendererQuestionHint:"Responda pelo campo de conversa abaixo.",
      rendererReference:"Fonte: {source}",rendererAssumptions:"Premissas",
      rendererRisks:"Riscos ou pontos a confirmar",rendererCaution:"Atenção — informação insuficiente",
      rendererInfo:"Informação",rendererPlan:"Plano {id} · rev. {revision}",
      rendererPlanNoExecution:"Somente proposta: sem aprovação ou execução."
    }),
    "en": Object.freeze({
      region:"Contextual Intelligence — simulated",trigger:"Open EVOLU Intelligence",
      dialog:"Conversation with EVOLU Intelligence",
      invitation:"I noticed several revisions to this selection. Would you like help reviewing the context?",
      accept:"Get help",dismiss:"Not now",close:"Close",
      initialStatus:"SIMULATED • No connected AI, real data, or commands.",
      observe:"Allow contextual suggestions on this page (without recording typing)",
      mode:"Simulated engine intent",modeAria:"Choose an example response format only",
      askMode:"Dynamic question",scenariosMode:"Scenario comparison",evidenceMode:"Evidence",planMode:"Plan for review",
      planTitle:"Plan for human review — synthetic",
      planBody:"1. Review the selected context. 2. Check the reporting period. 3. Record a note only after valid Platform authorization.",
      simulate:"Simulate authorization (do not execute)",questionLabel:"Your question",
      questionPlaceholder:"Describe your question...",send:"Discuss",
      agent:"Intelligence (preview)",user:"You",userChoice:"You · example choice {key}",preview:"Preview system",
      authorization:"Authorization state (preview)",
      welcome:"You are working in Genesis. I can explain the context or draft a plan for your review. This preview does not contact the real engine.",
      choiceResponse:"The answer was not sent to Intelligence. The next question would depend on the authenticated engine.",
      queryResponse:"Question not sent. The following format is a synthetic example selected in the menu; in live use, Intelligence alone determines the next interaction.",
      selectionPrefix:"SYNTHETIC EXAMPLE • Intent {kind} · no real analysis or execution.",
      unavailable:"FORMAT UNAVAILABLE • Could not display the example.",
      authorizeNotice:"Human intent simulated. Platform was not called: no persisted plan, validated authorization, or executed operation exists.",
      noExecution:"NO EXECUTION • Platform reauthorization is required.",
      planSimulationTitle:"Execution intent — simulation only",
      planSimulationBody:"Synthetic plan {planId} · revision {revision}. This simulation neither authenticates nor authorizes any operation.",
      exampleIntro:"An example question chosen by the engine, not by a fixed Genesis decision tree.",
      examplePrompt:"Which technical detail would you like to clarify first?",
      exampleComposition:"Product composition",examplePurpose:"Purpose of the transaction",exampleOther:"Another aspect",
      exampleScenarioTitle:"Hypothesis A (fictional)",exampleScenarioSummary:"Illustrative comparison of criteria, without tax calculations or recommendations.",
      exampleAssumption:"Technical description has not been verified",exampleRisk:"No legal basis has been consulted",
      exampleCaution:"No real legal evidence is available in this preview.",
      exampleEvidenceTitle:"Fictional technical document",exampleEvidenceText:"Fictional interface source. The engine has not consulted real legislation or files.",
      examplePlanSummary:"Review the context and prepare data for human review.",
      exampleStepVerify:"Confirm the product and its description",exampleStepReview:"Review the applicable criteria",
      rendererQuestionHint:"Answer using the conversation field below.",
      rendererReference:"Source: {source}",rendererAssumptions:"Assumptions",
      rendererRisks:"Risks or issues to confirm",rendererCaution:"Caution — insufficient information",
      rendererInfo:"Information",rendererPlan:"Plan {id} · rev. {revision}",
      rendererPlanNoExecution:"Proposal only: no approval or execution."
    })
  });
  function locale(){
    return document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "pt-BR";
  }
  function t(key,variables){
    const raw=dictionary[locale()][key];
    if(typeof raw!=="string")throw new Error("untranslated_intelligence_ui_key");
    return raw.replace(/\{([a-zA-Z]+)\}/g,(_,name)=>String(variables?.[name]??""));
  }
  global.EvoluIntelligenceI18n=Object.freeze({locale,t});
})(window);
