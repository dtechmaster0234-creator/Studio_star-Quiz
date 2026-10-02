/**
 * Studio Star Quiz — Motor de Diagnóstico
 *
 * Fluxo (conforme fluxograma):
 *
 * Etapa 1 Intro  →  Etapa 2 Análise (Q1)
 *        ↓ define path inicial: film | social
 * Etapa 3 Obstáculo (Q2)
 *        ↓
 * Etapa 4 Objetivo (Q3)  ← AQUI ocorre o CRUZAMENTO:
 *        • path=film  + "Ganhar visibilidade e seguidores" → troca para social (linha verde)
 *        • path=social + "Fechar meus primeiros trabalhos" → troca para film  (linha amarela)
 *        ↓
 * Etapa 5 Urgência (Q4)
 *        ↓
 * Etapa 6 Final (Resultado conforme path final + formulário)
 */

const state = {
  currentStep: 0,
  totalSteps: 5,
  answers: {},
  path: null, // 'film' | 'social' — pode ser alterado na Etapa 4 (Q3)
  scores: {
    preparo: 0,
    informacao: 0,
    organizacao: 0,
    automacao: 0,
    producao: 0,
    potencial: 0
  }
};

const scoreMap = {
  1: {
    iniciante:   { preparo: 20, informacao: 15, organizacao: 10, automacao: 10, producao: 15, potencial: 25 },
    qualidade:   { preparo: 30, informacao: 20, organizacao: 15, automacao: 15, producao: 35, potencial: 20 },
    audiovisual: { preparo: 40, informacao: 25, organizacao: 20, automacao: 20, producao: 45, potencial: 30 },
    negocio:     { preparo: 25, informacao: 20, organizacao: 25, automacao: 30, producao: 25, potencial: 35 }
  },
  2: {
    tempo:       { preparo: 10, informacao: 5,  organizacao: 15, automacao: 25, producao: 10, potencial: 15 },
    equipamento: { preparo: 15, informacao: 10, organizacao: 10, automacao: 5,  producao: 20, potencial: 10 },
    consistencia:{ preparo: 20, informacao: 15, organizacao: 30, automacao: 20, producao: 15, potencial: 20 },
    qualidade:   { preparo: 25, informacao: 20, organizacao: 15, automacao: 10, producao: 30, potencial: 15 },
    conteudo:    { preparo: 15, informacao: 30, organizacao: 20, automacao: 15, producao: 10, potencial: 25 }
  },
  3: {
    visibilidade:{ preparo: 15, informacao: 20, organizacao: 15, automacao: 20, producao: 15, potencial: 35 },
    trabalhos:   { preparo: 25, informacao: 15, organizacao: 25, automacao: 25, producao: 20, potencial: 20 },
    qualidade:   { preparo: 30, informacao: 20, organizacao: 20, automacao: 15, producao: 40, potencial: 25 },
    aprender:    { preparo: 35, informacao: 30, organizacao: 20, automacao: 20, producao: 25, potencial: 20 }
  },
  4: {
    hoje:        { preparo: 40, informacao: 20, organizacao: 25, automacao: 30, producao: 35, potencial: 30 },
    entender:    { preparo: 30, informacao: 25, organizacao: 20, automacao: 20, producao: 25, potencial: 25 },
    investimento:{ preparo: 20, informacao: 15, organizacao: 15, automacao: 10, producao: 20, potencial: 15 },
    pensando:    { preparo: 10, informacao: 10, organizacao: 10, automacao: 5,  producao: 10, potencial: 10 }
  }
};

function updateProgress() {
  const percent = (state.currentStep / state.totalSteps) * 100;
  document.getElementById('progressBar').style.width = `${Math.min(percent, 100)}%`;
}

function goToStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

  if (step === 0) {
    document.getElementById('step-intro').classList.add('active');
  } else if (step >= 1 && step <= 4) {
    document.getElementById(`step-${step}`).classList.add('active');
  } else if (step === 'result-film') {
    document.getElementById('step-result-film').classList.add('active');
  } else if (step === 'result-insta') {
    document.getElementById('step-result-insta').classList.add('active');
  } else if (step === 'thanks') {
    document.getElementById('step-thanks').classList.add('active');
  }

  state.currentStep = typeof step === 'number' ? step : state.totalSteps;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Seleção + redirecionamento com CRUZAMENTO na Etapa 4 (Q3)
 *
 * Linha VERDE  : path film  + "Ganhar visibilidade e seguidores" → path = social
 * Linha AMARELA: path social + "Fechar meus primeiros trabalhos" → path = film
 */
function selectOption(questionNum, btn) {
  const parent = btn.closest('.options');
  parent.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');

  const value = btn.dataset.value;
  const pathAttr = btn.dataset.path || null;

  state.answers[questionNum] = value;

  // Etapa 2 (Q1) — define o caminho inicial
  if (questionNum === 1 && pathAttr) {
    state.path = pathAttr;
  }

  // ========== CRUZAMENTO (Etapa 4 / Q3) ==========
  // Conforme linhas verde e amarela do fluxograma
  if (questionNum === 3) {
    if (state.path === 'film' && value === 'visibilidade') {
      // Linha VERDE: Filmmaker escolhe "Ganhar visibilidade" → vai para linha Instagram
      state.path = 'social';
    } else if (state.path === 'social' && value === 'trabalhos') {
      // Linha AMARELA: Instagram escolhe "Fechar primeiros trabalhos" → vai para linha Filmmaker
      state.path = 'film';
    }
    // Demais combinações mantêm o path atual
  }

  // Aplica scores
  if (scoreMap[questionNum] && scoreMap[questionNum][value]) {
    const impact = scoreMap[questionNum][value];
    Object.keys(impact).forEach(key => {
      state.scores[key] = Math.min(100, (state.scores[key] || 0) + impact[key]);
    });
  }

  // Avança para a próxima etapa
  setTimeout(() => {
    if (questionNum < 4) {
      goToStep(questionNum + 1);
    } else {
      showResult();
    }
  }, 420);
}

function showResult() {
  let errorPercent;

  if (state.path === 'film') {
    errorPercent = Math.round(
      100 - (
        (state.scores.preparo * 0.3) +
        (state.scores.informacao * 0.2) +
        (state.scores.organizacao * 0.25) +
        (state.scores.automacao * 0.25)
      ) / 100 * 40
    );
    errorPercent = Math.max(65, Math.min(92, errorPercent + 15));
    document.getElementById('errorPercentFilm').textContent = errorPercent + '%';
    goToStep('result-film');
  } else {
    errorPercent = Math.round(
      100 - (
        (state.scores.producao * 0.3) +
        (state.scores.potencial * 0.3) +
        (state.scores.organizacao * 0.2) +
        (state.scores.automacao * 0.2)
      ) / 100 * 35
    );
    errorPercent = Math.max(70, Math.min(95, errorPercent + 18));
    document.getElementById('errorPercentInsta').textContent = errorPercent + '%';
    goToStep('result-insta');
  }

  state.errorPercent = errorPercent;
}

function submitLead(e, type) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (!name || !email) return;

  const lead = {
    id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    name,
    email,
    path: type, // path final (já com possível cruzamento)
    answers: { ...state.answers },
    scores: { ...state.scores },
    errorPercent: state.errorPercent,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer || 'direct'
  };

  const existing = JSON.parse(localStorage.getItem('studioStarLeads') || '[]');
  existing.push(lead);
  localStorage.setItem('studioStarLeads', JSON.stringify(existing));

  window.dispatchEvent(new CustomEvent('studioStarNewLead', { detail: lead }));

  goToStep('thanks');
}

document.addEventListener('DOMContentLoaded', () => {
  goToStep(0);
  updateProgress();
});
