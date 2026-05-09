/* =========================================================
   Painel Financeiro - Cauã Ramos
   Estado persistido em localStorage. Tudo editavel.
========================================================= */

const STORAGE_KEY = "caua_financas_v7";

const SANT_ID = "santander_default";

const DEFAULT_STATE = {
  periodo: "mes",
  referencia: todayISO(),
  caixa: [
    { id: SANT_ID,  local: "Banco Santander", valor: 0, cor: "#ff5564" },
    { id: uid(),    local: "Espécie",         valor: 0, cor: "#4ade80" },
    { id: uid(),    local: "Saldo Uber",      valor: 0, cor: "#ffffff" },
    { id: uid(),    local: "Saldo 99",        valor: 0, cor: "#ff9a3c" }
  ],
  contas: [
    {
      id: uid(), descricao: "Cartão tia", grupo: "tia",
      diaVencimento: 10, diaAbertura: 16, prioridade: 1, status: "pendente",
      cor: "#a06a48",
      itens: [
        { id: uid(), descricao: "Compra exemplo", fixa: true, parcelaAtual: 1, parcelasTotal: 1, valorParcela: 331.24, valorPago: 0 }
      ]
    },
    {
      id: uid(), descricao: "Aluguel", grupo: "outras",
      diaVencimento: 10, diaAbertura: 1, prioridade: 2, status: "pendente",
      cor: "#ff5564",
      itens: [{ id: uid(), descricao: "Mensal", fixa: true, parcelaAtual: 1, parcelasTotal: 1, valorParcela: 500.0, valorPago: 0 }]
    },
    {
      id: uid(), descricao: "Energia", grupo: "outras",
      diaVencimento: 10, diaAbertura: 1, prioridade: 3, status: "pendente",
      cor: "#ff9a3c",
      itens: [{ id: uid(), descricao: "Mensal", fixa: true, parcelaAtual: 1, parcelasTotal: 1, valorParcela: 125.0, valorPago: 0 }]
    },
    {
      id: uid(), descricao: "Internet", grupo: "outras",
      diaVencimento: 10, diaAbertura: 1, prioridade: 4, status: "pendente",
      cor: "#5ee2ff",
      itens: [{ id: uid(), descricao: "Mensal", fixa: true, parcelaAtual: 1, parcelasTotal: 1, valorParcela: 31.0, valorPago: 0 }]
    },
    {
      id: uid(), descricao: "Dentista", grupo: "outras",
      diaVencimento: 15, diaAbertura: 1, prioridade: 5, status: "pendente",
      cor: "#4ade80",
      itens: [{ id: uid(), descricao: "Sessão", fixa: true, parcelaAtual: 1, parcelasTotal: 1, valorParcela: 75.0, valorPago: 0 }]
    }
  ],
  categorias: [
    { id: uid(), nome: "Alimentação", cor: "#4ade80", excluirDoLimite: false },
    { id: uid(), nome: "Combustível", cor: "#ff9a3c", excluirDoLimite: true  },
    { id: uid(), nome: "Lanche",      cor: "#5ee2ff", excluirDoLimite: false },
    { id: uid(), nome: "Casa",        cor: "#a06a48", excluirDoLimite: false },
    { id: uid(), nome: "Reserva",     cor: "#ff5564", excluirDoLimite: false }
  ],
  movimentacoes: [
    /* { id, tipo: "Entrada"|"Gasto", data, categoria, descricao, valor, fonteId } */
  ],
  aReceber: [
    /* { id, descricao, cor, parcelasTotal, parcelasRecebidas, valorParcela, proximoVencimento, fonteId } */
  ],
  uberDias: [
    /* { id, data: "2026-05-07", uber: 115.41, app99: 27.75 } */
  ],
  reservaConfig: {
    valorMensal: 500,
    diasUteis: 20
  },
  reservaDias: [
    /* { data, valor, ok: true } */
  ],
  reservaMovs: [
    /* { id, data, tipo: "deposito"|"saque", valor, descricao } */
  ],
  gasolina: [
    /* { id, data, descricao, valor, semana } */
  ],
  config: {
    fechamentoDia: 10,
    metaUberDiaria: 120,
    limiteMensal: 500
  }
};

let state = clone(DEFAULT_STATE);
let charts = {};

/* Defaults globais Chart.js — minimalismo editorial */
function applyChartTheme() {
  if (typeof Chart === "undefined") return;
  const cs = getComputedStyle(document.documentElement);
  const muted = cs.getPropertyValue("--muted").trim() || "#9a9489";
  const text = cs.getPropertyValue("--text-strong").trim() || "#0a0908";
  const grid = cs.getPropertyValue("--chart-grid").trim() || "rgba(29,27,22,0.06)";
  const tipBg = cs.getPropertyValue("--tooltip-bg").trim() || "rgba(28,26,23,0.98)";
  const tipTitle = cs.getPropertyValue("--tooltip-title").trim() || "#f8f5ee";
  const tipBody = cs.getPropertyValue("--tooltip-text").trim() || "#e8e4dc";
  const border = cs.getPropertyValue("--border").trim() || "rgba(0,0,0,0.08)";

  Chart.defaults.color = muted;
  Chart.defaults.borderColor = grid;
  Chart.defaults.font.family = '"Geist", "Inter", system-ui, sans-serif';
  Chart.defaults.font.size = 11;
  Chart.defaults.font.weight = 500;
  Chart.defaults.plugins.legend.labels.color = text;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.boxHeight = 8;
  Chart.defaults.plugins.legend.labels.padding = 14;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = tipBg;
  Chart.defaults.plugins.tooltip.titleColor = tipTitle;
  Chart.defaults.plugins.tooltip.bodyColor = tipBody;
  Chart.defaults.plugins.tooltip.borderColor = border;
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.plugins.tooltip.titleFont = { weight: 600, size: 11 };
  Chart.defaults.plugins.tooltip.bodyFont = { weight: 500, size: 11 };
  Chart.defaults.plugins.tooltip.displayColors = false;
  Chart.defaults.elements.bar.borderRadius = 3;
  Chart.defaults.elements.bar.borderSkipped = false;
  Chart.defaults.elements.line.tension = 0.35;
  Chart.defaults.elements.line.borderWidth = 2;
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 4;
  Chart.defaults.elements.arc.borderWidth = 0;

  // Scales hairline — sem borda externa, grid sutil, sem tick marks
  ["linear", "category", "logarithmic", "time"].forEach((scaleType) => {
    const sc = Chart.defaults.scales[scaleType];
    if (!sc) return;
    sc.grid = sc.grid || {};
    sc.grid.color = grid;
    sc.grid.lineWidth = 1;
    sc.grid.tickColor = "transparent";
    sc.grid.drawBorder = false;
    sc.border = sc.border || {};
    sc.border.display = false;
    sc.ticks = sc.ticks || {};
    sc.ticks.color = muted;
    sc.ticks.padding = 6;
  });
}
applyChartTheme();

/* Lê a cor de destaque atual (--accent) */
function accentColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7c8c61";
}

/* ---------- UTILS ---------- */

function uid() { return Math.random().toString(36).slice(2, 11); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

const brl = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const sum = (arr) => arr.reduce((acc, x) => acc + (Number(x) || 0), 0);
const fmtPct = (v) => `${(Number(v) || 0).toFixed(1)}%`;

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}
function parseISO(value) {
  const [y, m, d] = String(value || todayISO()).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function fmtBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}
function isoWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
function periodLabel() {
  const ref = parseISO(state.referencia);
  if (state.periodo === "dia") return fmtBR(state.referencia);
  if (state.periodo === "semana") return `Semana ${isoWeekKey(ref)}`;
  return `${String(ref.getMonth() + 1).padStart(2, "0")}/${ref.getFullYear()}`;
}
function inSelectedPeriod(isoDate) {
  const ref = parseISO(state.referencia);
  const dt = parseISO(isoDate || state.referencia);
  if (state.periodo === "dia") return dt.toDateString() === ref.toDateString();
  if (state.periodo === "semana") return isoWeekKey(dt) === isoWeekKey(ref);
  return dt.getMonth() === ref.getMonth() && dt.getFullYear() === ref.getFullYear();
}
function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}
function diasRestantesNoMes() {
  const ref = parseISO(state.referencia);
  const ultimo = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  return Math.max(1, ultimo - ref.getDate() + 1);
}
function podePorDiaMes(c) {
  return Math.max(0, c.podeGastarMes / diasRestantesNoMes());
}

/**
 * Calcula a cota diária dinâmica:
 *  - Cota base = limite ÷ dias do mês (ex: 500/30 = 16,67)
 *  - Cota de hoje (dinâmica) = (limite - gasto até ontem) ÷ dias restantes (com hoje)
 *  - Quanto menos gasta, mais sobra → a cota cresce
 *  - Verde: gasto de hoje ≤ cota dinâmica · Vermelho: passou
 */
function cotaDiariaInfo(c) {
  const ref = parseISO(state.referencia);
  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const cotaBase = c.limiteMensal / diasNoMes;

  const isCatExcluida = (nome) => state.categorias.some((cat) => cat.nome === nome && cat.excluirDoLimite);
  const noMes = (m) => {
    const d = parseISO(m.data);
    return m.tipo === "Gasto" && !isCatExcluida(m.categoria) && d.getMonth() === mes && d.getFullYear() === ano;
  };
  const hoje = state.referencia;
  const gastoHoje = sum(state.movimentacoes.filter((m) => noMes(m) && m.data === hoje).map((m) => m.valor));
  const gastoAteOntem = sum(state.movimentacoes.filter((m) => noMes(m) && m.data < hoje).map((m) => m.valor));
  const diasRest = diasRestantesNoMes();
  const cotaHoje = Math.max(0, (c.limiteMensal - gastoAteOntem) / diasRest);
  const sobraHoje = cotaHoje - gastoHoje;
  const ok = sobraHoje >= 0;

  // Projeção pra amanhã: se ele não gastar mais hoje, qual será a cota
  const diasRestAmanha = Math.max(1, diasRest - 1);
  const projecaoAmanha = diasRestAmanha > 0 ? Math.max(0, (c.limiteMensal - gastoAteOntem - gastoHoje) / diasRestAmanha) : 0;

  return { cotaBase, cotaHoje, gastoHoje, sobraHoje, ok, diasNoMes, diasRest, projecaoAmanha, gastoAteOntem };
}
function diasAteFechamento() {
  const ref = parseISO(state.referencia);
  const fechamento = new Date(ref.getFullYear(), ref.getMonth(), state.config.fechamentoDia);
  if (fechamento < ref) fechamento.setMonth(fechamento.getMonth() + 1);
  const diff = Math.round((fechamento - ref) / 86400000);
  return { dias: Math.max(0, diff), data: fechamento };
}

/* ---------- PERSIST ---------- */

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state = { ...clone(DEFAULT_STATE), ...saved };
    state.config = { ...DEFAULT_STATE.config, ...(saved.config || {}) };
    state.reservaConfig = { ...DEFAULT_STATE.reservaConfig, ...(saved.reservaConfig || {}) };
    state.contas = (state.contas || []).map((c) => {
      // Migra vencimento "YYYY-MM-DD" → diaVencimento (1-31)
      let diaVenc = c.diaVencimento;
      if (!diaVenc && c.vencimento) {
        const parts = String(c.vencimento).split("-");
        diaVenc = Number(parts[2]) || 10;
      }
      return {
        ...c,
        diaVencimento: diaVenc || 10,
        diaAbertura: c.diaAbertura || 1,
        itens: (c.itens || []).map((it) => ({
          ...it,
          fixa: typeof it.fixa === "boolean" ? it.fixa : (!it.parcelasTotal || it.parcelasTotal <= 1)
        }))
      };
    });
    // Migrações pontuais (uma vez por usuário)
    state.migrations = state.migrations || [];
    if (!state.migrations.includes("zeroCaixa-1")) {
      state.caixa = (state.caixa || []).map((x) => ({ ...x, valor: 0 }));
      state.migrations.push("zeroCaixa-1");
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleSync();
}

/* ---------- SYNC (GitHub Gist privado) ---------- */

const SYNC_FILE = "caua-painel-data.json";
const SYNC_DESC = "Lord Cauã — backup do painel financeiro (NÃO mexer manualmente)";
let _syncTimer = null;
let _syncing = false;

function syncCfg() {
  return state.config?.sync || {};
}

function setSyncCfg(patch) {
  state.config.sync = { ...(state.config.sync || {}), ...patch };
}

function syncStatusEl() { return document.getElementById("sync-status"); }

function updateSyncStatus(msg, level) {
  const el = syncStatusEl();
  if (!el) return;
  const cfg = syncCfg();
  if (msg) {
    el.textContent = msg;
    el.className = `sync-status ${level || ""}`;
    return;
  }
  if (cfg.token && cfg.gistId) {
    const last = cfg.lastSyncAt ? new Date(cfg.lastSyncAt).toLocaleString("pt-BR") : "nunca";
    el.textContent = `✓ Conectado · última sync: ${last}`;
    el.className = "sync-status ok";
  } else {
    el.textContent = "Não conectado";
    el.className = "sync-status muted";
  }
}

async function ghFetch(token, path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

async function findExistingGist(token) {
  // Lista até 100 gists do usuário e procura por SYNC_FILE
  const gists = await ghFetch(token, "/gists?per_page=100");
  const found = gists.find((g) => g.files && g.files[SYNC_FILE]);
  return found?.id || null;
}

async function pushToGist() {
  const cfg = syncCfg();
  if (!cfg.token || !cfg.gistId) return;
  const payload = {
    _app: "lord-caua-painel",
    _version: 1,
    _exportedAt: new Date().toISOString(),
    state
  };
  const body = {
    description: SYNC_DESC,
    files: { [SYNC_FILE]: { content: JSON.stringify(payload, null, 2) } }
  };
  await ghFetch(cfg.token, `/gists/${cfg.gistId}`, { method: "PATCH", body: JSON.stringify(body) });
  setSyncCfg({ lastSyncAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSyncStatus();
}

async function pullFromGist({ silent } = {}) {
  const cfg = syncCfg();
  if (!cfg.token || !cfg.gistId) return null;
  const gist = await ghFetch(cfg.token, `/gists/${cfg.gistId}`);
  const fileMeta = gist.files?.[SYNC_FILE];
  if (!fileMeta) throw new Error(`Arquivo ${SYNC_FILE} não encontrado no gist`);
  let content = fileMeta.content;
  if (fileMeta.truncated && fileMeta.raw_url) {
    content = await (await fetch(fileMeta.raw_url)).text();
  }
  const obj = JSON.parse(content);
  const incoming = obj?._app === "lord-caua-painel" && obj.state ? obj.state : obj;
  if (!incoming || typeof incoming !== "object") throw new Error("Conteúdo inválido");
  return incoming;
}

function scheduleSync() {
  const cfg = syncCfg();
  if (!cfg.token || !cfg.gistId) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    if (_syncing) return;
    _syncing = true;
    updateSyncStatus("Sincronizando…", "muted");
    try {
      await pushToGist();
    } catch (err) {
      console.error("Sync push failed:", err);
      updateSyncStatus("⚠ Erro ao sincronizar", "warn");
    } finally {
      _syncing = false;
    }
  }, 1500);
}

async function connectSync(token) {
  if (!token || token.length < 20) throw new Error("Token inválido");
  // Testa token + procura gist existente
  await ghFetch(token, "/user");
  let gistId = await findExistingGist(token);
  if (!gistId) {
    // Cria novo gist com estado atual
    const payload = {
      _app: "lord-caua-painel", _version: 1,
      _exportedAt: new Date().toISOString(), state
    };
    const created = await ghFetch(token, "/gists", {
      method: "POST",
      body: JSON.stringify({
        description: SYNC_DESC,
        public: false,
        files: { [SYNC_FILE]: { content: JSON.stringify(payload, null, 2) } }
      })
    });
    gistId = created.id;
  }
  setSyncCfg({ token, gistId, lastSyncAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return { gistId, foundExisting: true };
}

async function disconnectSync() {
  setSyncCfg({ token: null, gistId: null, lastSyncAt: null });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* Helpers de data/vencimento por conta */

function clampDia(year, month, dia) {
  const last = new Date(year, month + 1, 0).getDate();
  return Math.min(dia || 1, last);
}

function dateAtDia(year, month, dia) {
  return new Date(year, month, clampDia(year, month, dia));
}

// Última data de abertura (passada ou hoje) — anchor pra detectar reopen
function ultimaAberturaConta(c, today) {
  const dia = c.diaAbertura || 1;
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  if (d >= clampDia(y, m, dia)) return dateAtDia(y, m, dia);
  return dateAtDia(y, m - 1, dia);
}

// Próximo (ou atual) vencimento >= hoje
function proximoVencimentoConta(c, today) {
  const dia = c.diaVencimento || 10;
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  const venc = dateAtDia(y, m, dia);
  if (venc >= dateAtDia(y, m, d)) return venc;
  return dateAtDia(y, m + 1, dia);
}

// Status do vencimento: { text, level }
function statusVencimentoConta(c) {
  const today = new Date(); today.setHours(0,0,0,0);
  const aberto = valorAbertoConta(c);
  const dia = c.diaVencimento || 10;

  if (aberto === 0) return { text: "pago este mês", level: "pago" };

  // Vencimento deste mês — se já passou e não pagou, está atrasado
  const y = today.getFullYear(), m = today.getMonth();
  const vencMes = dateAtDia(y, m, dia);
  const diff = Math.round((vencMes - today) / 86400000);

  if (diff < 0) return { text: `venceu há ${Math.abs(diff)} dia${Math.abs(diff) > 1 ? "s" : ""}`, level: "atrasado" };
  if (diff === 0) return { text: "vence hoje", level: "pendente" };
  if (diff <= 5)  return { text: `vence em ${diff} dia${diff > 1 ? "s" : ""}`, level: "pendente" };
  return { text: `vence dia ${dia}`, level: "outras" };
}

/* Reabre parcelas/contas-fixas pagas baseado no diaAbertura de cada conta.
   Quando hoje passa do diaAbertura e a última reabertura foi antes dessa data, reabre. */
function autoReopenContas() {
  const today = new Date(); today.setHours(0,0,0,0);
  let reaberto = 0;

  (state.contas || []).forEach((c) => {
    const ultimaAb = ultimaAberturaConta(c, today);
    const ultimaAbISO = toISO(ultimaAb);
    if (c.lastReopen && c.lastReopen >= ultimaAbISO) return; // já reabriu nesse ciclo

    let mexeu = false;
    (c.itens || []).forEach((it) => {
      const paidThisMonth = (it.valorPago || 0) >= (it.valorParcela || 0) && (it.valorParcela || 0) > 0;
      if (!paidThisMonth) return;

      if (it.fixa) {
        it.valorPago = 0; reaberto++; mexeu = true;
      } else if ((it.parcelaAtual || 1) < (it.parcelasTotal || 1)) {
        it.parcelaAtual = (it.parcelaAtual || 1) + 1;
        it.valorPago = 0;
        reaberto++; mexeu = true;
      }
    });
    if (mexeu || !c.lastReopen) {
      c.lastReopen = ultimaAbISO;
      c.status = valorAbertoConta(c) === 0 ? "pago" : "pendente";
    }
  });

  if (reaberto > 0) saveState();
  return reaberto;
}

/* ---------- TOAST ---------- */

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ---------- COMPUTE ---------- */

function caixaSaldoCalculado(fonte) {
  // Saldo da fonte = valor base + lançamentos atribuídos a ela
  const ajuste = sum(state.movimentacoes
    .filter((m) => m.fonteId === fonte.id)
    .map((m) => m.tipo === "Entrada" ? (m.valor || 0) : -(m.valor || 0)));
  return (fonte.valor || 0) + ajuste;
}

// Debug: detalha entradas/gastos de uma fonte
function caixaBreakdown(fonte) {
  const movs = state.movimentacoes.filter((m) => m.fonteId === fonte.id);
  const entradas = sum(movs.filter((m) => m.tipo === "Entrada").map((m) => m.valor || 0));
  const gastos   = sum(movs.filter((m) => m.tipo === "Gasto").map((m) => m.valor || 0));
  return { base: fonte.valor || 0, entradas, gastos, qtdMovs: movs.length };
}

function valorAbertoConta(c) {
  if (c.status === "pago") return 0;
  return sum((c.itens || []).map((i) => Math.max(0, (i.valorParcela || 0) - (i.valorPago || 0))));
}
function valorTotalConta(c) {
  return sum((c.itens || []).map((i) => i.valorParcela || 0));
}

function compute() {
  const caixaTotal = sum(state.caixa.map((x) => caixaSaldoCalculado(x)));
  const movPeriodo = state.movimentacoes.filter((m) => inSelectedPeriod(m.data));

  const entradas = sum(movPeriodo.filter((m) => m.tipo === "Entrada").map((m) => m.valor));
  const gastos = sum(movPeriodo.filter((m) => m.tipo === "Gasto").map((m) => m.valor));
  const caixaAtual = caixaTotal;

  const contasPendentes = state.contas.filter((c) => c.status !== "pago");
  const valorTotalAbertoContas = sum(contasPendentes.map((c) => valorAbertoConta(c)));
  const totalContasGeral = sum(state.contas.map((c) => valorTotalConta(c)));

  const deficit = valorTotalAbertoContas - caixaAtual;

  const gastoPorCategoria = {};
  state.categorias.forEach((c) => { gastoPorCategoria[c.nome] = 0; });
  movPeriodo.filter((m) => m.tipo === "Gasto").forEach((m) => {
    if (gastoPorCategoria[m.categoria] === undefined) gastoPorCategoria[m.categoria] = 0;
    gastoPorCategoria[m.categoria] += m.valor;
  });
  const categoriasResumo = state.categorias.map((c) => {
    const gasto = gastoPorCategoria[c.nome] || 0;
    return { ...c, gasto };
  });

  // Limite único mensal (gastos pessoais, EXCLUINDO combustível)
  const isCatExcluida = (nome) => state.categorias.some((c) => c.nome === nome && c.excluirDoLimite);
  const limiteMensal = state.config.limiteMensal || 500;
  const movMes = state.movimentacoes.filter((m) => {
    const d = parseISO(m.data);
    const r = parseISO(state.referencia);
    return d.getMonth() === r.getMonth() && d.getFullYear() === r.getFullYear();
  });
  const gastoLimite = sum(movMes.filter((m) => m.tipo === "Gasto" && !isCatExcluida(m.categoria)).map((m) => m.valor));
  const podeGastarMes = limiteMensal - gastoLimite;

  const fech = diasAteFechamento();

  return {
    movPeriodo, caixaTotal, entradas, gastos, caixaAtual,
    contasPendentes, valorTotalAbertoContas, totalContasGeral, deficit,
    categoriasResumo, fech, limiteMensal, gastoLimite, podeGastarMes
  };
}

/* ---------- RENDER: DASHBOARD ---------- */

function renderDashboard(c) {
  const el = document.getElementById("dashboard");
  const dCls = c.deficit > 0 ? "danger" : "ok";
  const dLabel = c.deficit > 0 ? `Faltam ${brl(c.deficit)}` : `Sobra ${brl(-c.deficit)}`;
  const cota = cotaDiariaInfo(c);

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Visão geral</h2>
          <p class="panel-sub">Filtro: <strong>${periodLabel()}</strong></p>
        </div>
        <div class="period-row">
          <button class="period-btn ${state.periodo === "dia" ? "active" : ""}" data-periodo="dia">Dia</button>
          <button class="period-btn ${state.periodo === "semana" ? "active" : ""}" data-periodo="semana">Semana</button>
          <button class="period-btn ${state.periodo === "mes" ? "active" : ""}" data-periodo="mes">Mês</button>
          <input type="date" id="ref-date" value="${state.referencia}" />
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi ok">
          <h3>Caixa atual</h3>
          <div class="value">${brl(c.caixaAtual)}</div>
          <div class="sub">Base ${brl(c.caixaTotal)} + entradas − gastos</div>
        </div>
        <div class="kpi info">
          <h3>Entradas (${periodLabel()})</h3>
          <div class="value pos">+${brl(c.entradas)}</div>
          <div class="sub">Lançadas no período</div>
        </div>
        <div class="kpi warn">
          <h3>Gastos (${periodLabel()})</h3>
          <div class="value neg">−${brl(c.gastos)}</div>
          <div class="sub">Saídas registradas</div>
        </div>
        <div class="kpi ${dCls}">
          <h3>Fechamento dia ${state.config.fechamentoDia}</h3>
          <div class="value ${c.deficit > 0 ? "neg" : "pos"}">${dLabel}</div>
          <div class="sub">Em ${c.fech.dias} dia(s) — ${fmtBR(toISO(c.fech.data))}</div>
        </div>
      </div>

      ${c.deficit > 0 ? `
        <div class="alert warn">
          <span class="icon">⚠️</span>
          <div>
            <strong>Faltam ${brl(c.deficit)}</strong> para fechar as contas até dia ${state.config.fechamentoDia}.
            Em ${c.fech.dias} dia(s) você precisa juntar
            <strong>${brl(c.fech.dias > 0 ? c.deficit / c.fech.dias : c.deficit)}/dia</strong>.
          </div>
        </div>` : `
        <div class="alert ok">
          <span class="icon">✅</span>
          <div>Você tem caixa suficiente para fechar dia ${state.config.fechamentoDia}. Sobra <strong>${brl(-c.deficit)}</strong>.</div>
        </div>`}
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Lançar movimentação rápida</h2>
        <p class="panel-sub">Entradas somam na fonte · gastos saem da fonte (padrão Santander)</p>
      </div>
      <form id="quick-mov" class="form-grid cols-mov-fonte">
        <select name="tipo" id="quick-tipo" required>
          <option value="Gasto">Gasto</option>
          <option value="Entrada">Entrada</option>
        </select>
        <select name="fonteId" id="quick-fonte" required>${fonteOptions()}</select>
        <select name="categoria" id="quick-cat" data-cat-field required>${categoriaOptions()}</select>
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="descricao" required placeholder="Descrição (ex: tinta entrou)" maxlength="60" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button class="btn" type="submit">Adicionar</button>
      </form>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Limite mensal de gastos pessoais</h2>
          <p class="panel-sub">Você pode gastar <strong>${brl(c.limiteMensal)}/mês</strong> · combustível <em>não conta</em></p>
        </div>
        <div class="period-row">
          <label class="muted">Limite</label>
          <input type="number" id="dash-limite" min="0" step="10" value="${c.limiteMensal}" style="width:120px;" />
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi info">
          <h3>Limite mensal</h3>
          <div class="value">${brl(c.limiteMensal)}</div>
          <div class="sub">Combustível separado</div>
        </div>
        <div class="kpi warn">
          <h3>Gasto no mês</h3>
          <div class="value neg">${brl(c.gastoLimite)}</div>
          <div class="sub">${fmtPct(c.limiteMensal > 0 ? (c.gastoLimite / c.limiteMensal) * 100 : 0)} usado</div>
        </div>
        <div class="kpi ${c.podeGastarMes < 0 ? "danger" : "ok"}">
          <h3>Pode gastar</h3>
          <div class="value ${c.podeGastarMes < 0 ? "neg" : "pos"}">${brl(Math.max(0, c.podeGastarMes))}</div>
          <div class="sub">${c.podeGastarMes < 0 ? "Passou do limite" : "Restante do mês"}</div>
        </div>
        <div class="kpi ${cota.ok ? "ok" : "danger"}">
          <h3>Cota de hoje</h3>
          <div class="value ${cota.ok ? "pos" : "neg"}">${brl(cota.cotaHoje)}</div>
          <div class="sub">${cota.ok
            ? `gastou ${brl(cota.gastoHoje)} · sobra ${brl(cota.sobraHoje)}`
            : `passou ${brl(-cota.sobraHoje)} da cota de hoje`}</div>
        </div>
      </div>

      <div class="progress" style="height:14px;"><div class="fill ${c.gastoLimite >= c.limiteMensal ? "over" : c.gastoLimite >= c.limiteMensal * 0.8 ? "warn" : ""}" style="width:${Math.min(100, (c.gastoLimite / Math.max(1, c.limiteMensal)) * 100)}%"></div></div>

      <div class="alert ${cota.ok ? "ok" : "danger"}" style="margin-top:10px;">
        <span class="icon">${cota.ok ? "🟢" : "🔴"}</span>
        <div>
          ${cota.ok
            ? `<strong>Hoje você está no verde.</strong> Sua cota é <strong>${brl(cota.cotaHoje)}</strong> e você gastou ${brl(cota.gastoHoje)}. Se não gastar mais hoje, amanhã sua cota sobe pra <strong>${brl(cota.projecaoAmanha)}/dia</strong>.`
            : `<strong>Você ultrapassou a cota de hoje em ${brl(-cota.sobraHoje)}.</strong> Os próximos dias vão ter cota menor: agora <strong>${brl(cota.projecaoAmanha)}/dia</strong> em vez de ${brl(cota.cotaBase)}.`}
        </div>
      </div>

      <p class="hint" style="margin-top:6px;">
        <strong>Como funciona:</strong> ${brl(c.limiteMensal)} ÷ ${cota.diasNoMes} dias = ${brl(cota.cotaBase)}/dia base.
        Cada dia que você gasta menos, a cota dos próximos dias <strong>aumenta</strong>. Cada dia que ultrapassa, a cota dos próximos dias <strong>diminui</strong>.
        Combustível não conta.
      </p>
    </section>

    <section class="chart-grid">
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">Gastos por categoria (período)</h2></div>
        <div class="chart-box"><canvas id="pieChart"></canvas></div>
        <p id="pie-empty" class="hint"></p>
      </article>
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">Disponível por dia (mês)</h2></div>
        <div class="chart-box"><canvas id="lineDash"></canvas></div>
      </article>
    </section>
  `;

  el.querySelectorAll(".period-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.periodo = btn.getAttribute("data-periodo");
      saveState(); renderAll();
    });
  });
  document.getElementById("ref-date").addEventListener("change", (e) => {
    state.referencia = e.target.value || todayISO();
    saveState(); renderAll();
  });
  document.getElementById("dash-limite").addEventListener("change", (e) => {
    state.config.limiteMensal = Number(e.target.value) || 500;
    saveState(); renderAll();
  });
  // Toggle do campo Categoria conforme tipo (entrada não tem categoria)
  const quickForm = document.getElementById("quick-mov");
  const quickTipo = document.getElementById("quick-tipo");
  const quickCat = document.getElementById("quick-cat");
  const quickSubmit = quickForm.querySelector("button[type=submit]");
  const updateQuickTipo = () => {
    const isEntrada = quickTipo.value === "Entrada";
    quickForm.classList.toggle("is-entrada", isEntrada);
    quickCat.required = !isEntrada;
    if (quickSubmit) quickSubmit.textContent = isEntrada ? "Adicionar entrada" : "Adicionar gasto";
  };
  quickTipo.addEventListener("change", updateQuickTipo);
  updateQuickTipo();

  quickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tipo = fd.get("tipo");
    addMovimentacao({
      tipo,
      categoria: tipo === "Gasto" ? fd.get("categoria") : "",
      data: fd.get("data"),
      descricao: String(fd.get("descricao") || "").trim(),
      valor: Number(fd.get("valor") || 0),
      fonteId: fd.get("fonteId")
    });
    e.currentTarget.reset();
    document.querySelector("#quick-mov [name=data]").value = state.referencia;
    updateQuickTipo();
  });

  renderCharts(c);
}

function toISO(d) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function categoriaOptions(selected) {
  return state.categorias.map((x) => `<option value="${x.nome}" ${selected === x.nome ? "selected" : ""}>${x.nome}</option>`).join("");
}

function fontePadrao() {
  return state.caixa.find((x) => x.id === SANT_ID) || state.caixa[0];
}
function fonteOptions(selectedId) {
  const sel = selectedId || fontePadrao()?.id;
  return state.caixa.map((x) => `<option value="${x.id}" ${x.id === sel ? "selected" : ""}>${escapeHtml(x.local)}</option>`).join("");
}
function fonteNome(id) {
  return state.caixa.find((x) => x.id === id)?.local || "—";
}
function fonteCor(id) {
  return state.caixa.find((x) => x.id === id)?.cor || "#5c6b56";
}

function addMovimentacao({ tipo, categoria, data, descricao, valor, fonteId }) {
  if (!descricao || !Number.isFinite(valor) || valor <= 0) {
    toast("Preencha descrição e valor."); return;
  }
  const fId = fonteId || fontePadrao()?.id;
  state.movimentacoes.unshift({
    id: uid(),
    tipo: tipo === "Entrada" ? "Entrada" : "Gasto",
    categoria: tipo === "Gasto" ? (categoria || "Alimentação") : "",
    data: data || todayISO(),
    descricao,
    valor: Number(valor),
    fonteId: fId
  });
  saveState(); toast(`${tipo === "Entrada" ? "Entrada" : "Gasto"} em ${fonteNome(fId)}`); renderAll();
}

/* ---------- RENDER: CHARTS ---------- */

function renderCharts(c) {
  if (typeof Chart === "undefined") {
    const m = document.getElementById("pie-empty");
    if (m) m.textContent = "Chart.js indisponível.";
    return;
  }
  // Pizza: gastos por categoria EXCLUINDO combustível (que tem aba própria)
  const filtradas = c.categoriasResumo.filter((x) => !x.excluirDoLimite && x.gasto > 0);
  const labels = filtradas.map((x) => x.nome);
  const cores  = filtradas.map((x) => x.cor || "#4caf50");
  const gastos = filtradas.map((x) => Number(x.gasto.toFixed(2)));
  const totalG = sum(gastos);

  ["pieChart", "barChart", "lineDash"].forEach((k) => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });

  const msg = document.getElementById("pie-empty");
  if (msg) msg.textContent = totalG === 0 ? "Sem gastos pessoais no período. (Combustível aparece na aba própria.)" : "";

  charts.pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: totalG === 0 ? ["Sem gastos"] : labels,
      datasets: [{
        data: totalG === 0 ? [1] : gastos,
        backgroundColor: totalG === 0 ? ["#dbe6d8"] : cores,
        borderWidth: 2, borderColor: "#fff"
      }]
    },
    options: {
      cutout: "62%",
      plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } } },
      maintainAspectRatio: false
    }
  });

  // Linha do disponível por dia no mês
  const ref = parseISO(state.referencia);
  const diasNoMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const isCatExcluida = (nome) => state.categorias.some((cat) => cat.nome === nome && cat.excluirDoLimite);
  const linhaReal = [];
  const linhaIdeal = [];
  const dataLabels = [];
  const idealPorDia = c.limiteMensal / diasNoMes;
  let acc = 0;
  for (let d = 1; d <= diasNoMes; d++) {
    dataLabels.push(String(d).padStart(2, "0"));
    const dia = new Date(ref.getFullYear(), ref.getMonth(), d);
    const iso = toISO(dia);
    const gastoDoDia = sum(state.movimentacoes
      .filter((m) => m.tipo === "Gasto" && m.data === iso && !isCatExcluida(m.categoria))
      .map((m) => m.valor));
    acc += gastoDoDia;
    linhaReal.push(Math.max(0, c.limiteMensal - acc));
    linhaIdeal.push(Math.max(0, c.limiteMensal - idealPorDia * d));
  }
  charts.lineDash = new Chart(document.getElementById("lineDash"), {
    type: "line",
    data: {
      labels: dataLabels,
      datasets: [
        { label: "Disponível real", data: linhaReal, borderColor: "#2f7d32", backgroundColor: "rgba(47,125,50,0.12)", fill: true, tension: 0.3, pointRadius: 0 },
        { label: "Ritmo ideal", data: linhaIdeal, borderColor: "#90a4ae", borderDash: [5, 5], fill: false, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } }
    }
  });
}

/* ---------- RENDER: CONTAS ---------- */

function renderContas(c) {
  const el = document.getElementById("contas");
  const fech = c.fech;
  const totalAberto = c.valorTotalAbertoContas;
  const restante = Math.max(0, totalAberto - c.caixaAtual);

  // Ordena por prioridade
  const contasOrdenadas = state.contas.slice().sort((a, b) => (a.prioridade || 99) - (b.prioridade || 99));

  const renderConta = (conta) => {
    const aberto = valorAbertoConta(conta);
    const total = valorTotalConta(conta);
    const pago = total - aberto;
    const quitada = conta.status === "pago" || aberto === 0;
    const pct = total > 0 ? (pago / total) * 100 : 0;
    const itens = (conta.itens || []);
    return `
      <article class="conta-card" data-conta="${conta.id}" style="--conta-cor:${conta.cor || "#2f7d32"};">
        <header class="conta-head">
          <div class="conta-title">
            <span class="conta-dot"></span>
            <strong>${escapeHtml(conta.descricao)}</strong>
            <span class="badge ${conta.grupo === "tia" ? "tia" : "outras"}">${conta.grupo === "tia" ? "Tia" : "Outras"}</span>
            ${quitada ? `<span class="badge pago">Quitada</span>` : pago > 0 ? `<span class="badge parcial">Parcial</span>` : `<span class="badge pendente">Pendente</span>`}
          </div>
          <div class="conta-meta">
            ${(() => { const s = statusVencimentoConta(conta); return `<span class="badge ${s.level}">${s.text}</span>`; })()}
            <span class="pill">total ${brl(total)}</span>
            <span class="pill ${aberto > 0 ? "faltam" : "quitada"}">${aberto > 0 ? `falta ${brl(aberto)}` : "quitada"}</span>
          </div>
        </header>

        <div class="progress" style="height:8px;"><div class="fill" style="width:${pct}%; background: var(--conta-cor);"></div></div>

        <div class="conta-itens">
          ${itens.length === 0 ? `<p class="muted" style="margin:8px 0;">Nenhum item. Adicione abaixo.</p>` : `
          <table>
            <thead><tr><th>Item</th><th>Parcela</th><th>Valor</th><th>Pago</th><th>Pendente</th><th></th></tr></thead>
            <tbody>
              ${itens.map((it) => {
                const parcelaAtual = it.parcelaAtual || 1;
                const parcelasTotal = it.parcelasTotal || 1;
                const valorParcela = it.valorParcela || 0;
                const parcelasJaPagas = Math.max(0, parcelaAtual - 1);
                const pagoAcumulado = parcelasJaPagas * valorParcela + (it.valorPago || 0);
                const totalItem = valorParcela * parcelasTotal;
                const abertoItem = Math.max(0, totalItem - pagoAcumulado);
                const paidThisMonth = (it.valorPago || 0) >= valorParcela && valorParcela > 0;
                const isPartial = (it.valorPago || 0) > 0 && (it.valorPago || 0) < valorParcela;
                const restanteParcela = Math.max(0, valorParcela - (it.valorPago || 0));
                return `
                  <tr data-item="${it.id}" class="${paidThisMonth ? "row-paid" : ""}">
                    <td data-label="Item">${escapeHtml(it.descricao || "Item")}</td>
                    <td data-label="Parcela">
                      ${it.fixa ? `<span class="pill fixa" title="Conta fixa mensal">Mensal</span>` : `<span class="pill">${parcelaAtual}/${parcelasTotal}</span>`}
                      ${isPartial ? `<div class="num-sub warn">faltam ${brl(restanteParcela)}</div>` : ""}
                    </td>
                    <td class="num" data-label="Valor">${brl(valorParcela)}</td>
                    <td class="num" data-label="Pago">${brl(pagoAcumulado)}</td>
                    <td class="num" data-label="Pendente">
                      <strong class="${abertoItem > 0 ? "warn" : "ok"}">${brl(abertoItem)}</strong>
                      ${parcelasTotal > 1 ? `<div class="num-sub muted">de ${brl(totalItem)}</div>` : ""}
                    </td>
                    <td class="actions">
                      ${paidThisMonth ? `
                        <button class="btn sm ghost" data-act="reabrir-item" title="Desfaz o pagamento deste mês">Reabrir</button>
                      ` : it.fixa ? `
                        <button class="btn sm success" data-act="pagar-parcela">Pagar</button>
                        <button class="btn sm ghost" data-act="parc-item">Parcial</button>
                      ` : `
                        <button class="btn sm success" data-act="pagar-parcela" title="Marca a parcela ${parcelaAtual} como paga">Pagar parcela</button>
                        <button class="btn sm ghost" data-act="parc-item">Parcial</button>
                        ${parcelaAtual > 1 ? `<button class="btn sm ghost" data-act="voltar-parcela" title="Volta pra parcela anterior (paga)">↶ Voltar</button>` : ""}
                      `}
                      <button class="btn sm ghost" data-act="edit-item">Editar</button>
                      <button class="btn sm danger" data-act="rm-item">×</button>
                    </td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>`}
        </div>

        <footer class="conta-foot">
          <button class="btn sm ghost" data-act="add-item">+ Adicionar item / parcela</button>
          ${itens.length > 0 ? (
            itens.some((it) => (it.valorPago || 0) < (it.valorParcela || 0))
              ? `<button class="btn sm success" data-act="pagar-tudo-conta" title="Marca todas as parcelas atuais como pagas neste mês">Pagar tudo este mês</button>`
              : `<button class="btn sm ghost" data-act="reabrir-tudo-conta" title="Desfaz o pagamento deste mês de todos os itens">Reabrir tudo</button>`
          ) : ""}
          <button class="btn sm ghost" data-act="edit-conta">Editar conta</button>
          <button class="btn sm danger" data-act="rm-conta">Remover</button>
        </footer>
      </article>
    `;
  };

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Contas a pagar</h2>
          <p class="panel-sub">Fechamento dia ${state.config.fechamentoDia} — em ${fech.dias} dia(s)</p>
        </div>
        <button class="btn" id="add-conta">+ Nova conta</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi danger">
          <h3>Em aberto</h3>
          <div class="value neg">${brl(totalAberto)}</div>
          <div class="sub">Soma das parcelas pendentes</div>
        </div>
        <div class="kpi ok">
          <h3>Caixa atual</h3>
          <div class="value">${brl(c.caixaAtual)}</div>
          <div class="sub">Disponível para abater</div>
        </div>
        <div class="kpi warn">
          <h3>Falta juntar</h3>
          <div class="value ${restante > 0 ? "neg" : "pos"}">${brl(restante)}</div>
          <div class="sub">${fech.dias > 0 && restante > 0 ? `${brl(restante / fech.dias)}/dia até dia ${state.config.fechamentoDia}` : "Você fecha com o caixa atual"}</div>
        </div>
        <div class="kpi info">
          <h3>Total geral</h3>
          <div class="value">${brl(c.totalContasGeral)}</div>
          <div class="sub">Somando todas as parcelas</div>
        </div>
      </div>

      <div class="chart-grid">
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Em aberto por conta</h2></div>
          <div class="chart-box"><canvas id="chartContasBar"></canvas></div>
        </article>
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Distribuição</h2></div>
          <div class="chart-box"><canvas id="chartContasPie"></canvas></div>
        </article>
      </div>
    </section>

    <div class="contas-grid">
      ${contasOrdenadas.length === 0 ? `<p class="muted">Nenhuma conta. Clique em <strong>+ Nova conta</strong>.</p>` : contasOrdenadas.map(renderConta).join("")}
    </div>

    <section class="panel" id="form-conta-panel" style="display:none;">
      <div class="panel-head">
        <h2 class="panel-title" id="form-conta-title">Nova conta</h2>
        <button class="btn ghost" id="cancel-conta">Cancelar</button>
      </div>
      <form id="form-conta" class="form-grid cols-conta">
        <input name="descricao" placeholder="Descrição (ex: Cartão tia, Aluguel)" required maxlength="60" />
        <select name="grupo" required>
          <option value="outras">Outras</option>
          <option value="tia">Tia</option>
        </select>
        <label style="display:flex; flex-direction:column; gap:4px;">
          <span class="label">Dia do vencimento</span>
          <input name="diaVencimento" type="number" min="1" max="31" step="1" placeholder="ex: 10" required />
        </label>
        <label style="display:flex; flex-direction:column; gap:4px;">
          <span class="label">Dia de abertura (opcional)</span>
          <input name="diaAbertura" type="number" min="1" max="31" step="1" placeholder="padrão: 1" />
        </label>
        <input name="cor" type="color" value="#2f7d32" />
        <button class="btn" type="submit">Salvar</button>
      </form>
      <p class="hint">
        <strong>Vencimento</strong>: dia que você precisa pagar (ex: cartão tia vence dia 10).
        <strong>Abertura</strong>: dia que a próxima parcela é liberada/cobrada (ex: cartão fecha dia 16, então no dia 17 a próxima já vale). Se deixar vazio, abre dia 1 do mês.
      </p>
    </section>

    <section class="panel" id="form-item-panel" style="display:none;">
      <div class="panel-head">
        <h2 class="panel-title" id="form-item-title">Novo item / parcela</h2>
        <button class="btn ghost" id="cancel-item">Cancelar</button>
      </div>
      <form id="form-item" class="form-grid cols-conta-item">
        <label class="check-line full">
          <input type="checkbox" name="fixa" />
          Conta fixa mensal (sem parcelas)
        </label>
        <label class="field-stack"><span class="label">Descrição</span>
          <input name="descricao" placeholder="ex: Aluguel, Tablet" required maxlength="60" />
        </label>
        <label class="field-stack" data-parcela><span class="label">Parc. atual</span>
          <input name="parcelaAtual" type="number" min="1" step="1" placeholder="1" />
        </label>
        <label class="field-stack" data-parcela><span class="label">Parc. total</span>
          <input name="parcelasTotal" type="number" min="1" step="1" placeholder="12" />
        </label>
        <label class="field-stack"><span class="label">Valor da parcela</span>
          <input name="valorParcela" type="number" min="0.01" step="0.01" placeholder="0,00" required />
        </label>
        <label class="field-stack"><span class="label">Pago (parcial)</span>
          <input name="valorPago" type="number" min="0" step="0.01" placeholder="0,00" value="0" />
        </label>
        <button class="btn" type="submit">Salvar item</button>
      </form>
      <p class="hint">Marque <strong>fixa</strong> pra contas que repetem todo mês (aluguel, energia). Desmarque pra parcelas (ex: tablet 11/12 R$ 50).</p>
    </section>
  `;

  bindContas();
  renderContasCharts(contasOrdenadas);
}

function renderContasCharts(contas) {
  if (typeof Chart === "undefined") return;
  ["chartContasBar", "chartContasPie"].forEach((k) => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });
  const labels = contas.map((c) => c.descricao);
  const cores = contas.map((c) => c.cor || "#2f7d32");
  const abertos = contas.map((c) => Number(valorAbertoConta(c).toFixed(2)));
  const totais = contas.map((c) => Number(valorTotalConta(c).toFixed(2)));

  charts.chartContasBar = new Chart(document.getElementById("chartContasBar"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Total", data: totais, backgroundColor: cores.map((c) => c + "55"), borderRadius: 6 },
        { label: "Em aberto", data: abertos, backgroundColor: cores, borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } }
    }
  });

  charts.chartContasPie = new Chart(document.getElementById("chartContasPie"), {
    type: "doughnut",
    data: { labels, datasets: [{ data: abertos, backgroundColor: cores, borderWidth: 2, borderColor: "#fff" }] },
    options: {
      cutout: "60%", maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

function bindContas() {
  const panelConta = document.getElementById("form-conta-panel");
  const formConta = document.getElementById("form-conta");
  const titleConta = document.getElementById("form-conta-title");
  let editingContaId = null;

  const showFormConta = (conta) => {
    editingContaId = conta ? conta.id : null;
    titleConta.textContent = conta ? "Editar conta" : "Nova conta";
    formConta.descricao.value = conta?.descricao || "";
    formConta.grupo.value = conta?.grupo || "outras";
    formConta.diaVencimento.value = conta?.diaVencimento || 10;
    formConta.diaAbertura.value = conta?.diaAbertura || "";
    formConta.cor.value = conta?.cor || "#2f7d32";
    panelConta.style.display = "block";
    panelConta.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.getElementById("add-conta").addEventListener("click", () => showFormConta(null));
  document.getElementById("cancel-conta").addEventListener("click", () => { panelConta.style.display = "none"; });

  formConta.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(formConta);
    const dvRaw = Number(fd.get("diaVencimento") || 10);
    const daRaw = Number(fd.get("diaAbertura") || 1);
    const data = {
      descricao: String(fd.get("descricao") || "").trim(),
      grupo: fd.get("grupo") === "tia" ? "tia" : "outras",
      diaVencimento: Math.min(31, Math.max(1, dvRaw)),
      diaAbertura: Math.min(31, Math.max(1, daRaw)),
      cor: fd.get("cor") || "#2f7d32"
    };
    if (!data.descricao) { toast("Preencha descrição."); return; }
    if (editingContaId) {
      state.contas = state.contas.map((c) => c.id === editingContaId ? { ...c, ...data } : c);
      toast("Conta atualizada");
    } else {
      state.contas.push({ id: uid(), prioridade: state.contas.length + 1, status: "pendente", itens: [], ...data });
      toast("Conta adicionada — agora adicione os itens");
    }
    saveState(); panelConta.style.display = "none"; renderAll();
  });

  // Item form
  const panelItem = document.getElementById("form-item-panel");
  const formItem = document.getElementById("form-item");
  const titleItem = document.getElementById("form-item-title");
  let itemContext = null; // { contaId, itemId? }

  const toggleFixa = () => {
    const fixa = formItem.fixa.checked;
    formItem.classList.toggle("is-fixa", fixa);
    formItem.querySelectorAll("[data-parcela]").forEach((el) => {
      el.style.display = fixa ? "none" : "";
      // Procura input dentro do label e atualiza required
      const inp = el.querySelector("input");
      if (inp) inp.required = !fixa;
    });
    const labelValor = formItem.querySelector('input[name="valorParcela"]');
    if (labelValor) labelValor.placeholder = fixa ? "0,00 (mensal)" : "0,00";
  };
  formItem.fixa.addEventListener("change", toggleFixa);

  const showFormItem = (contaId, item) => {
    itemContext = { contaId, itemId: item?.id };
    titleItem.textContent = item ? "Editar item" : "Novo item";
    formItem.descricao.value = item?.descricao || "";
    formItem.fixa.checked = item ? !!item.fixa : true;
    formItem.parcelaAtual.value = item?.parcelaAtual || 1;
    formItem.parcelasTotal.value = item?.parcelasTotal || 1;
    formItem.valorParcela.value = item?.valorParcela ? fmtMoneyBR(item.valorParcela) : "";
    formItem.valorPago.value    = item?.valorPago    ? fmtMoneyBR(item.valorPago)    : "";
    toggleFixa();
    panelItem.style.display = "block";
    panelItem.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.getElementById("cancel-item").addEventListener("click", () => { panelItem.style.display = "none"; });

  formItem.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!itemContext) return;
    const fd = new FormData(formItem);
    const fixa = !!fd.get("fixa");
    const data = {
      descricao: String(fd.get("descricao") || "").trim() || "Item",
      fixa,
      parcelaAtual: fixa ? 1 : Number(fd.get("parcelaAtual") || 1),
      parcelasTotal: fixa ? 1 : Number(fd.get("parcelasTotal") || 1),
      valorParcela: Number(fd.get("valorParcela") || 0),
      valorPago: Number(fd.get("valorPago") || 0)
    };
    if (data.valorParcela <= 0) { toast("Valor inválido."); return; }
    const conta = state.contas.find((c) => c.id === itemContext.contaId);
    if (!conta) return;
    if (!conta.itens) conta.itens = [];
    if (itemContext.itemId) {
      conta.itens = conta.itens.map((i) => i.id === itemContext.itemId ? { ...i, ...data } : i);
      toast("Item atualizado");
    } else {
      conta.itens.push({ id: uid(), ...data });
      toast("Item adicionado");
    }
    // Atualiza status global da conta
    conta.status = valorAbertoConta(conta) === 0 ? "pago" : "pendente";
    saveState(); panelItem.style.display = "none"; renderAll();
  });

  // Eventos por card de conta
  document.querySelectorAll(".conta-card").forEach((card) => {
    const contaId = card.getAttribute("data-conta");
    const conta = state.contas.find((c) => c.id === contaId);
    if (!conta) return;

    card.querySelector("[data-act=add-item]")?.addEventListener("click", () => showFormItem(contaId, null));
    card.querySelector("[data-act=edit-conta]")?.addEventListener("click", () => showFormConta(conta));
    card.querySelector("[data-act=rm-conta]")?.addEventListener("click", () => {
      if (!confirm(`Remover "${conta.descricao}" e todos os itens?`)) return;
      state.contas = state.contas.filter((c) => c.id !== contaId);
      saveState(); toast("Conta removida"); renderAll();
    });

    card.querySelector("[data-act=pagar-tudo-conta]")?.addEventListener("click", () => {
      // Marca a parcela atual de cada item como paga este mês
      let n = 0;
      (conta.itens || []).forEach((it) => {
        if ((it.valorPago || 0) < (it.valorParcela || 0)) {
          it.valorPago = it.valorParcela;
          n++;
        }
      });
      conta.status = valorAbertoConta(conta) === 0 ? "pago" : "pendente";
      saveState(); toast(`${n} item(ns) pagos este mês em "${conta.descricao}"`); renderAll();
    });

    card.querySelector("[data-act=reabrir-tudo-conta]")?.addEventListener("click", () => {
      (conta.itens || []).forEach((it) => { it.valorPago = 0; });
      conta.status = "pendente";
      saveState(); toast(`Pagamento deste mês desfeito em "${conta.descricao}"`); renderAll();
    });

    card.querySelectorAll("tr[data-item]").forEach((tr) => {
      const itemId = tr.getAttribute("data-item");
      const item = (conta.itens || []).find((i) => i.id === itemId);
      if (!item) return;
      tr.querySelectorAll("[data-act]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const act = btn.getAttribute("data-act");

          if (act === "pagar-parcela") {
            // Marca a parcela atual como paga deste mês — não avança.
            // O auto-reopen abre a próxima no dia 1 do mês seguinte.
            item.valorPago = item.valorParcela;
            const atual = item.parcelaAtual || 1;
            const total = item.parcelasTotal || 1;
            if (item.fixa) {
              toast("Pago este mês");
            } else if (atual >= total) {
              toast("Última parcela paga · item quitado");
            } else {
              toast(`Parcela ${atual}/${total} paga este mês · próxima abre no dia 1`);
            }

          } else if (act === "reabrir-item") {
            // Desfaz o pagamento deste mês na parcela atual
            item.valorPago = 0;
            toast("Pagamento deste mês desfeito");

          } else if (act === "voltar-parcela") {
            // Volta pra parcela anterior e marca como paga
            // (útil se o auto-reopen avançou indevidamente)
            const atual = item.parcelaAtual || 1;
            if (atual <= 1) { toast("Já está na primeira parcela"); return; }
            item.parcelaAtual = atual - 1;
            item.valorPago = item.valorParcela;
            toast(`Voltou pra parcela ${item.parcelaAtual}/${item.parcelasTotal} (paga)`);

          } else if (act === "parc-item") {
            const aberto = Math.max(0, (item.valorParcela || 0) - (item.valorPago || 0));
            const v = await openDialog({
              title: "Pagamento parcial",
              message: `${item.descricao} — falta nesta parcela: ${brl(aberto)}`,
              confirmText: "Confirmar pagamento"
            });
            if (v == null || v <= 0) return;
            item.valorPago = Math.min(item.valorParcela, (item.valorPago || 0) + v);
            toast("Pagamento parcial registrado");

          } else if (act === "edit-item") {
            showFormItem(contaId, item);
            return;

          } else if (act === "rm-item") {
            if (!confirm(`Remover "${item.descricao}"?`)) return;
            conta.itens = conta.itens.filter((i) => i.id !== itemId);
            toast("Item removido");
          }

          conta.status = valorAbertoConta(conta) === 0 ? "pago" : "pendente";
          saveState(); renderAll();
        });
      });
    });
  });
}

/* ---------- RENDER: CAIXA & ENTRADAS ---------- */

function renderCaixa(c) {
  const el = document.getElementById("caixa");
  const movEntradas = state.movimentacoes.filter((m) => m.tipo === "Entrada").slice(0, 30);

  // Saldos calculados por fonte
  const linhas = state.caixa.map((x) => ({
    ...x,
    saldoCalc: caixaSaldoCalculado(x),
    base: x.valor || 0
  }));

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Fontes de caixa</h2>
          <p class="panel-sub">Saldo atualiza sozinho conforme você lança entradas e gastos</p>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn ghost" id="btn-transfer" type="button">↗ Transferir</button>
          <button class="btn ghost" id="add-caixa" type="button">+ Nova fonte</button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi ok">
          <h3>Total disponível</h3>
          <div class="value pos">${brl(c.caixaTotal)}</div>
          <div class="sub">Soma de todas as fontes</div>
        </div>
        ${linhas.slice(0, 3).map((l) => {
          const bd = caixaBreakdown(l);
          return `
          <div class="kpi" style="--conta-cor:${l.cor || "#2f7d32"}; border-left: 4px solid ${l.cor || "#2f7d32"};">
            <h3>${escapeHtml(l.local)}</h3>
            <div class="value ${l.saldoCalc < 0 ? "neg" : ""}">${brl(l.saldoCalc)}</div>
            <div class="sub">base ${brl(bd.base)} · <span class="ok">+${brl(bd.entradas)}</span> · <span class="neg">−${brl(bd.gastos)}</span></div>
          </div>`;
        }).join("")}
      </div>

      <div class="chart-grid">
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Distribuição do caixa</h2></div>
          <div class="chart-box"><canvas id="chartCaixaPie"></canvas></div>
        </article>
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Por local</h2></div>
          <div class="chart-box"><canvas id="chartCaixaBar"></canvas></div>
        </article>
      </div>

      <form id="form-caixa" class="form-grid cols-caixa" style="display:none;">
        <input name="local" placeholder="Local (ex: Carteira, Inter)" required maxlength="40" />
        <input name="valor" type="number" min="0" step="0.01" placeholder="Saldo inicial" required />
        <input name="cor" type="color" value="#2f7d32" />
        <button class="btn" type="submit">Adicionar</button>
      </form>

      <div class="table-wrap stacked-rows" style="margin-top:10px;">
        <table>
          <thead><tr><th>Local</th><th>Cor</th><th>Saldo calculado</th><th></th></tr></thead>
          <tbody>
            ${linhas.map((x) => `
              <tr data-id="${x.id}">
                <td data-label="Local"><input class="inline-input" data-field="local" value="${escapeAttr(x.local)}" /></td>
                <td data-label="Cor"><input type="color" class="inline-input cor-swatch" data-field="cor" value="${x.cor || "#2f7d32"}" /></td>
                <td class="num" data-label="Saldo"><strong style="color:${x.cor || "#2f7d32"};">${brl(x.saldoCalc)}</strong></td>
                <td class="actions">
                  <button class="btn sm ghost" data-action="ajustar" title="Definir saldo manualmente">Ajustar</button>
                  <button class="btn sm danger" data-action="remover">×</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="hint">O saldo aqui é <strong>calculado automaticamente</strong> a partir das entradas e gastos lançados. Use <strong>Ajustar</strong> só pra acertar com o saldo real (ex: depois de uma transferência não registrada).</p>
    </section>

    ${renderAReceber()}

    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Últimas entradas</h2>
        <p class="panel-sub">Registros do tipo "Entrada" com a fonte que recebeu</p>
      </div>
      ${movEntradas.length === 0 ? `<p class="muted">Nenhuma entrada registrada ainda.</p>` : `
      <div class="table-wrap stacked-rows">
        <table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Fonte</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            ${movEntradas.map((m) => `
              <tr data-mov="${m.id}">
                <td data-label="Data">${fmtBR(m.data)}</td>
                <td data-label="Descrição">${escapeHtml(m.descricao)}</td>
                <td data-label="Fonte"><span class="pill" style="background:${fonteCor(m.fonteId)};color:#fff;">${escapeHtml(fonteNome(m.fonteId))}</span></td>
                <td class="num ok" data-label="Valor">+${brl(m.valor)}</td>
                <td class="actions">
                  <button class="btn sm ghost" data-action="edit-mov">Editar</button>
                  <button class="btn sm danger" data-action="rm-mov">×</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`}
    </section>
  `;

  document.getElementById("btn-transfer")?.addEventListener("click", openTransferSheet);

  document.getElementById("add-caixa").addEventListener("click", () => {
    const f = document.getElementById("form-caixa");
    const showing = f.style.display !== "none";
    f.style.display = showing ? "none" : "grid";
    if (!showing) {
      f.scrollIntoView({ behavior: "smooth", block: "center" });
      f.querySelector('[name="local"]')?.focus();
    }
  });
  document.getElementById("form-caixa").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local = String(fd.get("local") || "").trim();
    const valor = Number(fd.get("valor") || 0);
    const cor = fd.get("cor") || "#2f7d32";
    if (!local) return;
    state.caixa.push({ id: uid(), local, valor, cor });
    saveState(); toast("Local adicionado"); renderAll();
  });

  document.querySelectorAll("#caixa tbody tr[data-id]").forEach((tr) => {
    const id = tr.getAttribute("data-id");
    tr.querySelectorAll(".inline-input").forEach((inp) => {
      inp.addEventListener("change", () => {
        const item = state.caixa.find((x) => x.id === id);
        if (!item) return;
        const field = inp.getAttribute("data-field");
        if (field === "valor") item.valor = Number(inp.value) || 0;
        else item[field] = inp.value;
        saveState(); renderAll();
      });
    });
    tr.querySelector("[data-action=ajustar]")?.addEventListener("click", async () => {
      const item = state.caixa.find((x) => x.id === id);
      if (!item) return;
      const atual = caixaSaldoCalculado(item);
      const v = await openDialog({
        title: `Ajustar saldo`,
        message: `${item.local} — saldo atual: ${brl(atual)}`,
        defaultValue: atual,
        confirmText: "Salvar"
      });
      if (v == null) return;
      const ajuste = sum(state.movimentacoes
        .filter((m) => m.fonteId === item.id)
        .map((m) => m.tipo === "Entrada" ? (m.valor || 0) : -(m.valor || 0)));
      item.valor = v - ajuste;
      saveState(); toast("Saldo ajustado"); renderAll();
    });
    tr.querySelector("[data-action=remover]")?.addEventListener("click", () => {
      if (!confirm("Remover esse local?")) return;
      state.caixa = state.caixa.filter((x) => x.id !== id);
      saveState(); toast("Local removido"); renderAll();
    });
  });

  document.querySelectorAll("#caixa tr[data-mov]").forEach((tr) => {
    const id = tr.getAttribute("data-mov");
    tr.querySelector("[data-action=rm-mov]").addEventListener("click", () => {
      state.movimentacoes = state.movimentacoes.filter((m) => m.id !== id);
      saveState(); toast("Entrada removida"); renderAll();
    });
    tr.querySelector("[data-action=edit-mov]")?.addEventListener("click", () => {
      const mov = state.movimentacoes.find((m) => m.id === id);
      if (mov) openQuickSheet(mov.tipo, mov);
    });
  });

  bindAReceber();
  renderCaixaCharts(linhas);
}

function renderCaixaCharts(linhas) {
  if (typeof Chart === "undefined") return;
  ["chartCaixaPie", "chartCaixaBar"].forEach((k) => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });
  const labels = linhas.map((l) => l.local);
  const cores = linhas.map((l) => l.cor || "#2f7d32");
  const dados = linhas.map((l) => Number(l.saldoCalc.toFixed(2)));
  charts.chartCaixaPie = new Chart(document.getElementById("chartCaixaPie"), {
    type: "doughnut",
    data: { labels, datasets: [{ data: dados, backgroundColor: cores, borderWidth: 2, borderColor: "#fff" }] },
    options: { cutout: "60%", maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }
  });
  charts.chartCaixaBar = new Chart(document.getElementById("chartCaixaBar"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Saldo", data: dados, backgroundColor: cores, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } } }
  });
}

/* ---------- A RECEBER ---------- */

function renderAReceber() {
  const lista = state.aReceber || [];
  const totalReceber = sum(lista.map((r) => {
    const restantes = Math.max(0, (r.parcelasTotal || 0) - (r.parcelasRecebidas || 0));
    return restantes * (r.valorParcela || 0);
  }));

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">A receber (parcelados)</h2>
          <p class="panel-sub">Quem te deve em parcelas — ex: <em>Sr Carlos, 14×500, ainda 9 parcelas</em></p>
        </div>
        <button class="btn" id="add-receber">+ Adicionar</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi info">
          <h3>Total a receber</h3>
          <div class="value">${brl(totalReceber)}</div>
          <div class="sub">${lista.length} dívida(s) ativa(s)</div>
        </div>
        ${lista.slice(0, 3).map((r) => {
          const rest = Math.max(0, (r.parcelasTotal || 0) - (r.parcelasRecebidas || 0));
          const totalRest = rest * (r.valorParcela || 0);
          return `
          <div class="kpi" style="border-left: 4px solid ${r.cor || "#3f51b5"};">
            <h3>${escapeHtml(r.descricao)}</h3>
            <div class="value">${brl(totalRest)}</div>
            <div class="sub">${rest}/${r.parcelasTotal} parcelas restantes</div>
          </div>`;
        }).join("")}
      </div>

      <form id="form-receber" class="form-grid cols-receber" style="display:none;">
        <input name="descricao" placeholder="De quem (ex: Sr Carlos - tinta)" required maxlength="60" />
        <input name="parcelasTotal" type="number" min="1" step="1" placeholder="Total parc." required />
        <input name="parcelasRecebidas" type="number" min="0" step="1" placeholder="Já recebeu" value="0" />
        <input name="valorParcela" type="number" min="0.01" step="0.01" placeholder="Valor parcela" required />
        <select name="fonteId" required>${fonteOptions()}</select>
        <input name="cor" type="color" value="#3f51b5" />
        <button class="btn" type="submit">Salvar</button>
      </form>

      ${lista.length === 0 ? `<p class="muted" style="margin-top:8px;">Nenhuma entrada parcelada cadastrada.</p>` : `
      <div class="table-wrap stacked-rows" style="margin-top:10px;">
        <table>
          <thead><tr><th>De</th><th>Parcelas</th><th>Valor</th><th>Total dívida</th><th>Restante</th><th>Fonte</th><th></th></tr></thead>
          <tbody>
            ${lista.map((r) => {
              const rest = Math.max(0, (r.parcelasTotal || 0) - (r.parcelasRecebidas || 0));
              const totalRest = rest * (r.valorParcela || 0);
              const totalGeral = (r.parcelasTotal || 0) * (r.valorParcela || 0);
              return `
                <tr data-receber="${r.id}">
                  <td data-label="De">
                    <span class="conta-dot" style="--conta-cor:${r.cor || "#3f51b5"};"></span>
                    <strong>${escapeHtml(r.descricao)}</strong>
                  </td>
                  <td data-label="Parcelas"><span class="pill">${r.parcelasRecebidas || 0}/${r.parcelasTotal}</span> · faltam <strong>${rest}</strong></td>
                  <td class="num" data-label="Valor">${brl(r.valorParcela)}</td>
                  <td class="num muted" data-label="Total">${brl(totalGeral)}</td>
                  <td class="num" data-label="Restante"><strong class="${rest > 0 ? "warn" : "ok"}">${brl(totalRest)}</strong></td>
                  <td data-label="Fonte"><span class="pill" style="background:${fonteCor(r.fonteId)};color:#fff;">${escapeHtml(fonteNome(r.fonteId))}</span></td>
                  <td class="actions">
                    <button class="btn sm success" data-act="receber">Recebi parcela</button>
                    <button class="btn sm ghost" data-act="edit-receber">Editar</button>
                    <button class="btn sm danger" data-act="rm-receber">×</button>
                  </td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`}
    </section>
  `;
}

function bindAReceber() {
  if (!state.aReceber) state.aReceber = [];
  const form = document.getElementById("form-receber");
  let editingId = null;

  document.getElementById("add-receber").addEventListener("click", () => {
    editingId = null;
    form.reset();
    form.cor.value = "#3f51b5";
    form.parcelasRecebidas.value = 0;
    form.style.display = form.style.display === "none" ? "grid" : "none";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      descricao: String(fd.get("descricao") || "").trim(),
      parcelasTotal: Number(fd.get("parcelasTotal") || 1),
      parcelasRecebidas: Number(fd.get("parcelasRecebidas") || 0),
      valorParcela: Number(fd.get("valorParcela") || 0),
      fonteId: fd.get("fonteId"),
      cor: fd.get("cor") || "#3f51b5"
    };
    if (!data.descricao || data.valorParcela <= 0) { toast("Preencha descrição e valor."); return; }
    if (editingId) {
      state.aReceber = state.aReceber.map((r) => r.id === editingId ? { ...r, ...data } : r);
      toast("Atualizado");
    } else {
      state.aReceber.push({ id: uid(), ...data });
      toast("Entrada parcelada cadastrada");
    }
    saveState(); form.style.display = "none"; renderAll();
  });

  document.querySelectorAll("#caixa tr[data-receber]").forEach((tr) => {
    const id = tr.getAttribute("data-receber");
    const r = state.aReceber.find((x) => x.id === id);
    if (!r) return;
    tr.querySelector("[data-act=receber]").addEventListener("click", async () => {
      if ((r.parcelasRecebidas || 0) >= r.parcelasTotal) { toast("Já recebeu todas"); return; }
      const proximaParcela = (r.parcelasRecebidas || 0) + 1;
      const data = await openDialog({
        title: "Recebi parcela",
        message: `${r.descricao} — parcela ${proximaParcela}/${r.parcelasTotal} de ${brl(r.valorParcela)}. Quando você recebeu?`,
        inputType: "date",
        defaultValue: todayISO(),
        confirmText: "Confirmar recebimento"
      });
      if (!data) return;
      r.parcelasRecebidas = proximaParcela;
      // Lança movimentação de entrada na fonte automaticamente
      state.movimentacoes.unshift({
        id: uid(),
        tipo: "Entrada",
        categoria: "",
        data,
        descricao: `${r.descricao} (parc. ${r.parcelasRecebidas}/${r.parcelasTotal})`,
        valor: r.valorParcela,
        fonteId: r.fonteId
      });
      saveState(); toast(`Parcela recebida em ${fonteNome(r.fonteId)}`); renderAll();
    });
    tr.querySelector("[data-act=edit-receber]").addEventListener("click", () => {
      editingId = r.id;
      form.descricao.value = r.descricao;
      form.parcelasTotal.value = r.parcelasTotal;
      form.parcelasRecebidas.value = r.parcelasRecebidas || 0;
      form.valorParcela.value = r.valorParcela;
      form.fonteId.value = r.fonteId;
      form.cor.value = r.cor || "#3f51b5";
      form.style.display = "grid";
      form.scrollIntoView({ behavior: "smooth" });
    });
    tr.querySelector("[data-act=rm-receber]").addEventListener("click", () => {
      if (!confirm(`Remover "${r.descricao}"?`)) return;
      state.aReceber = state.aReceber.filter((x) => x.id !== id);
      saveState(); renderAll();
    });
  });
}

/* ---------- RENDER: GASTOS ---------- */

function renderGastos(c) {
  const el = document.getElementById("gastos");
  const isCatExcluida = (nome) => state.categorias.some((cat) => cat.nome === nome && cat.excluirDoLimite);
  const todosGastos = state.movimentacoes.filter((m) => m.tipo === "Gasto").sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const cota = cotaDiariaInfo(c);

  // Dados pra gráfico no topo
  const ref = parseISO(state.referencia);
  const isCatComb = (nome) => state.categorias.some((cat) => cat.nome === nome && cat.excluirDoLimite);
  const gastosMes = state.movimentacoes.filter((m) => {
    const d = parseISO(m.data);
    return m.tipo === "Gasto" && !isCatComb(m.categoria) && d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  });
  const porCat = {};
  gastosMes.forEach((m) => { porCat[m.categoria || "Sem categoria"] = (porCat[m.categoria || "Sem categoria"] || 0) + m.valor; });

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Tudo que gastei</h2>
          <p class="panel-sub">Linha do tempo · combustível tem aba própria e <em>não</em> entra no limite</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi info">
          <h3>Limite mensal</h3>
          <div class="value">${brl(c.limiteMensal)}</div>
          <div class="sub">Combustível separado</div>
        </div>
        <div class="kpi warn">
          <h3>Gasto no mês</h3>
          <div class="value neg">${brl(c.gastoLimite)}</div>
          <div class="sub">${fmtPct(c.limiteMensal > 0 ? (c.gastoLimite / c.limiteMensal) * 100 : 0)} do limite</div>
        </div>
        <div class="kpi ${c.podeGastarMes < 0 ? "danger" : "ok"}">
          <h3>Pode gastar</h3>
          <div class="value ${c.podeGastarMes < 0 ? "neg" : "pos"}">${brl(Math.max(0, c.podeGastarMes))}</div>
          <div class="sub">Restante até fim do mês</div>
        </div>
        <div class="kpi ${cota.ok ? "ok" : "danger"}">
          <h3>Cota de hoje</h3>
          <div class="value ${cota.ok ? "pos" : "neg"}">${brl(cota.cotaHoje)}</div>
          <div class="sub">${cota.ok
            ? `gastou ${brl(cota.gastoHoje)} · sobra ${brl(cota.sobraHoje)}`
            : `passou ${brl(-cota.sobraHoje)} da cota`}</div>
        </div>
      </div>

      <div class="chart-grid">
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Gastos por categoria (mês)</h2></div>
          <div class="chart-box"><canvas id="chartGastosPie"></canvas></div>
        </article>
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Categorias em barras</h2></div>
          <div class="chart-box"><canvas id="chartGastosBar"></canvas></div>
        </article>
      </div>

      <div class="alert ${cota.ok && c.podeGastarMes >= 0 ? "ok" : "danger"}" style="margin-top:8px;">
        <span class="icon">${cota.ok && c.podeGastarMes >= 0 ? "🟢" : "🔴"}</span>
        <div>
          ${c.podeGastarMes < 0
            ? `Você passou <strong>${brl(-c.podeGastarMes)}</strong> do limite mensal de ${brl(c.limiteMensal)}.`
            : cota.ok
              ? `Hoje você está <strong>no verde</strong>. Cota: ${brl(cota.cotaHoje)} · gastou: ${brl(cota.gastoHoje)} · sobra: <strong>${brl(cota.sobraHoje)}</strong>. Se segurar hoje, amanhã sua cota vira <strong>${brl(cota.projecaoAmanha)}/dia</strong>.`
              : `Hoje você passou <strong>${brl(-cota.sobraHoje)}</strong> da cota (${brl(cota.cotaHoje)}). A partir de amanhã sua cota cai pra <strong>${brl(cota.projecaoAmanha)}/dia</strong> pra recuperar o equilíbrio.`}
        </div>
      </div>
      <p class="hint" style="margin-top:0;">
        <strong>Como funciona:</strong> ${brl(c.limiteMensal)} ÷ ${cota.diasNoMes} dias = ${brl(cota.cotaBase)}/dia base.
        Economizou hoje? A cota dos próximos dias <strong>aumenta</strong>. Passou da cota? Os próximos dias <strong>diminuem</strong> automaticamente.
      </p>

      <form id="form-gasto" class="form-grid cols-mov-fonte" style="margin-top:14px;">
        <select name="tipo"><option value="Gasto">Gasto</option></select>
        <select name="fonteId">${fonteOptions()}</select>
        <select name="categoria" required>${categoriaOptions()}</select>
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="descricao" required placeholder="Descrição (ex: miojo)" maxlength="60" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button class="btn" type="submit">Lançar</button>
      </form>
    </section>

    <section class="panel">
      <div class="panel-head"><h2 class="panel-title">Histórico de gastos</h2></div>
      ${todosGastos.length === 0 ? `<p class="muted">Sem gastos registrados.</p>` : `
      <div class="table-wrap stacked-rows">
        <table>
          <thead><tr><th>Data</th><th>Categoria</th><th>Fonte</th><th>Descrição</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            ${todosGastos.slice(0, 120).map((m) => {
              const excluida = isCatExcluida(m.categoria);
              return `
              <tr data-mov="${m.id}">
                <td data-label="Data">${fmtBR(m.data)}</td>
                <td data-label="Categoria">
                  <span class="pill" style="background:${corDaCategoria(m.categoria)};color:#fff;">${escapeHtml(m.categoria || "—")}</span>
                  ${excluida ? `<span class="pill" title="Não conta no limite">fora do limite</span>` : ""}
                </td>
                <td data-label="Fonte"><span class="pill" style="background:${fonteCor(m.fonteId)};color:#fff;">${escapeHtml(fonteNome(m.fonteId))}</span></td>
                <td data-label="Descrição">${escapeHtml(m.descricao)}</td>
                <td class="num neg" data-label="Valor">−${brl(m.valor)}</td>
                <td class="actions">
                  <button class="btn sm ghost" data-action="edit-mov">Editar</button>
                  <button class="btn sm danger" data-action="rm-mov">×</button>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`}
    </section>
  `;

  document.getElementById("form-gasto").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addMovimentacao({
      tipo: "Gasto",
      categoria: fd.get("categoria"),
      data: fd.get("data"),
      descricao: String(fd.get("descricao") || "").trim(),
      valor: Number(fd.get("valor") || 0),
      fonteId: fd.get("fonteId")
    });
    e.currentTarget.reset();
    e.currentTarget.querySelector("[name=data]").value = state.referencia;
  });

  document.querySelectorAll("#gastos tr[data-mov]").forEach((tr) => {
    const id = tr.getAttribute("data-mov");
    tr.querySelector("[data-action=rm-mov]").addEventListener("click", () => {
      state.movimentacoes = state.movimentacoes.filter((m) => m.id !== id);
      saveState(); toast("Gasto removido"); renderAll();
    });
    tr.querySelector("[data-action=edit-mov]")?.addEventListener("click", () => {
      const mov = state.movimentacoes.find((m) => m.id === id);
      if (mov) openQuickSheet(mov.tipo, mov);
    });
  });

  // Gráficos no topo da aba Gastos
  if (typeof Chart !== "undefined") {
    const labels = Object.keys(porCat);
    const valores = labels.map((k) => Number(porCat[k].toFixed(2)));
    const cores = labels.map((k) => corDaCategoria(k));
    ["chartGastosPie", "chartGastosBar"].forEach((k) => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });
    if (labels.length === 0) {
      const ctx = document.getElementById("chartGastosPie").getContext("2d");
      ctx.font = "14px Inter"; ctx.fillStyle = "#5c6b56";
      ctx.fillText("Sem gastos no mês.", 20, 30);
    } else {
      charts.chartGastosPie = new Chart(document.getElementById("chartGastosPie"), {
        type: "doughnut",
        data: { labels, datasets: [{ data: valores, backgroundColor: cores, borderWidth: 2, borderColor: "#fff" }] },
        options: { cutout: "60%", maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } }
      });
      charts.chartGastosBar = new Chart(document.getElementById("chartGastosBar"), {
        type: "bar",
        data: { labels, datasets: [{ label: "Gasto", data: valores, backgroundColor: cores, borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } } }
      });
    }
  }
}

function corDaCategoria(nome) {
  const c = state.categorias.find((x) => x.nome === nome);
  return c?.cor || "#5c6b56";
}

/* ---------- RENDER: COMBUSTÍVEL ---------- */

function renderCombustivel() {
  const el = document.getElementById("combustivel");
  // Considera tanto registros em state.gasolina quanto movimentos com categoria flagada como excluída
  const isCatComb = (nome) => state.categorias.some((c) => c.nome === nome && c.excluirDoLimite);
  const movsComb = state.movimentacoes
    .filter((m) => m.tipo === "Gasto" && isCatComb(m.categoria))
    .map((m) => ({ id: m.id, data: m.data, descricao: m.descricao, valor: m.valor, fonte: "mov" }));
  const reg = (state.gasolina || []).map((g) => ({ id: g.id, data: g.data, descricao: g.descricao, valor: g.valor, fonte: "gas" }));
  const todos = [...movsComb, ...reg].sort((a, b) => (a.data || "").localeCompare(b.data || ""));

  // Agrupa por semana
  const porSemana = {};
  todos.forEach((g) => {
    const k = isoWeekKey(parseISO(g.data));
    if (!porSemana[k]) porSemana[k] = { total: 0, count: 0, semana: k, datas: [] };
    porSemana[k].total += g.valor || 0;
    porSemana[k].count += 1;
    porSemana[k].datas.push(g.data);
  });
  const semanas = Object.values(porSemana).sort((a, b) => a.semana.localeCompare(b.semana));
  const ultimas12 = semanas.slice(-12);

  const totalGeral = sum(todos.map((g) => g.valor));
  const mediaSemanal = semanas.length ? totalGeral / semanas.length : 0;
  const ultima = semanas[semanas.length - 1];
  const penult = semanas[semanas.length - 2];
  const dif = (ultima && penult) ? ultima.total - penult.total : 0;
  const pctDif = (penult && penult.total > 0) ? (dif / penult.total) * 100 : 0;
  const tendencia = dif > 0 ? "subiu" : dif < 0 ? "caiu" : "estável";

  // Mês de referência
  const ref = parseISO(state.referencia);
  const noMes = todos.filter((g) => {
    const d = parseISO(g.data);
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  });
  const totalMes = sum(noMes.map((g) => g.valor));

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Combustível</h2>
          <p class="panel-sub">Monitora apenas — não entra no seu limite mensal de gastos</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi info">
          <h3>No mês</h3>
          <div class="value">${brl(totalMes)}</div>
          <div class="sub">${noMes.length} abastecimento(s)</div>
        </div>
        <div class="kpi">
          <h3>Média semanal</h3>
          <div class="value">${brl(mediaSemanal)}</div>
          <div class="sub">Histórico de ${semanas.length} semana(s)</div>
        </div>
        <div class="kpi ${dif > 0 ? "warn" : dif < 0 ? "ok" : ""}">
          <h3>Última semana</h3>
          <div class="value">${ultima ? brl(ultima.total) : brl(0)}</div>
          <div class="sub">
            ${penult ? `${tendencia === "subiu" ? "▲" : tendencia === "caiu" ? "▼" : "•"} ${tendencia} ${brl(Math.abs(dif))} (${pctDif >= 0 ? "+" : ""}${pctDif.toFixed(1)}%) vs anterior` : "Sem comparativo ainda"}
          </div>
        </div>
        <div class="kpi">
          <h3>Total geral</h3>
          <div class="value">${brl(totalGeral)}</div>
          <div class="sub">Todos os registros</div>
        </div>
      </div>

      <div class="alert ${dif > 0 ? "warn" : dif < 0 ? "ok" : ""}">
        <span class="icon">${dif > 0 ? "⛽" : dif < 0 ? "🟢" : "ℹ️"}</span>
        <div>
          ${penult ? (
            dif > 0
              ? `O gasto de combustível <strong>aumentou ${brl(dif)}</strong> em relação à semana anterior. Atenção pra não estourar.`
              : dif < 0
                ? `Você <strong>economizou ${brl(-dif)}</strong> em combustível esta semana. Boa.`
                : `Gasto estável em relação à semana anterior.`
          ) : `Registre pelo menos duas semanas pra começar a comparar a tendência.`}
        </div>
      </div>

      <form id="form-combustivel" class="form-grid cols-gasolina" style="margin-top:8px;">
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="descricao" placeholder="Descrição (ex: posto Shell)" maxlength="50" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button class="btn" type="submit">Registrar abastecimento</button>
      </form>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Tendência semanal (últimas 12 semanas)</h2>
      </div>
      <div class="chart-box"><canvas id="chartCombSem"></canvas></div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Histórico</h2>
        <p class="panel-sub">Todos os abastecimentos — mais recente primeiro</p>
      </div>
      ${todos.length === 0 ? `<p class="muted">Nenhum registro ainda.</p>` : `
      <div class="table-wrap stacked-rows">
        <table>
          <thead><tr><th>Data</th><th>Semana</th><th>Descrição</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            ${todos.slice().reverse().slice(0, 80).map((g) => `
              <tr data-id="${g.id}" data-fonte="${g.fonte}">
                <td data-label="Data">${fmtBR(g.data)}</td>
                <td data-label="Semana"><span class="pill">${isoWeekKey(parseISO(g.data))}</span></td>
                <td data-label="Descrição">${escapeHtml(g.descricao || "—")}</td>
                <td class="num" data-label="Valor">${brl(g.valor)}</td>
                <td class="actions"><button class="btn sm danger" data-action="rm-comb">×</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`}
    </section>
  `;

  document.getElementById("form-combustivel").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!state.gasolina) state.gasolina = [];
    state.gasolina.push({
      id: uid(),
      data: fd.get("data") || todayISO(),
      descricao: String(fd.get("descricao") || "").trim(),
      valor: Number(fd.get("valor") || 0)
    });
    saveState(); toast("Abastecimento registrado"); renderAll();
  });

  document.querySelectorAll("#combustivel tr[data-id]").forEach((tr) => {
    tr.querySelector("[data-action=rm-comb]").addEventListener("click", () => {
      const id = tr.getAttribute("data-id");
      const fonte = tr.getAttribute("data-fonte");
      if (fonte === "gas") state.gasolina = state.gasolina.filter((x) => x.id !== id);
      else state.movimentacoes = state.movimentacoes.filter((x) => x.id !== id);
      saveState(); toast("Removido"); renderAll();
    });
  });

  // Gráfico tendência semanal
  if (typeof Chart !== "undefined") {
    if (charts.chartCombSem) charts.chartCombSem.destroy();
    const labels = ultimas12.map((s) => s.semana.replace(/^\d{4}-/, ""));
    const dados = ultimas12.map((s) => Number(s.total.toFixed(2)));
    const cor = (i) => i === ultimas12.length - 1 ? "#ff9800" : "#ffcc80";
    charts.chartCombSem = new Chart(document.getElementById("chartCombSem"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Gasto na semana", data: dados, backgroundColor: dados.map((_, i) => cor(i)), borderRadius: 6 },
          { label: "Média", type: "line", data: dados.map(() => mediaSemanal), borderColor: "#2f7d32", borderDash: [5, 5], pointRadius: 0, fill: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } }
      }
    });
  }
}

/* ---------- RENDER: META UBER/99 ---------- */

function renderMeta(c) {
  const el = document.getElementById("meta");
  const meta = state.config.metaUberDiaria;

  // Lançamentos individuais do mês de referência (apenas dias úteis)
  const ref = parseISO(state.referencia);
  const lancamentosMes = state.uberDias.filter((d) => {
    const dt = parseISO(d.data);
    return dt.getMonth() === ref.getMonth() && dt.getFullYear() === ref.getFullYear() && isWeekday(dt);
  });

  // Agrupa por dia: cada item vira { data, uber (soma), app99 (soma), lancamentos: [...] }
  const porDia = {};
  lancamentosMes.forEach((l) => {
    if (!porDia[l.data]) porDia[l.data] = { data: l.data, uber: 0, app99: 0, lancamentos: [] };
    porDia[l.data].uber  += Number(l.uber  || 0);
    porDia[l.data].app99 += Number(l.app99 || 0);
    porDia[l.data].lancamentos.push(l);
  });
  const diasMes = Object.values(porDia).sort((a, b) => a.data.localeCompare(b.data));

  const totalMes  = sum(diasMes.map((d) => d.uber + d.app99));
  const totalUber = sum(diasMes.map((d) => d.uber));
  const total99   = sum(diasMes.map((d) => d.app99));
  const diasBatidos = diasMes.filter((d) => (d.uber + d.app99) >= meta).length;
  const lucroAcumulado = sum(diasMes.map((d) => Math.max(0, (d.uber + d.app99) - meta)));
  const deficitAcumulado = sum(diasMes.map((d) => Math.max(0, meta - (d.uber + d.app99))));

  // saldo do dia hoje (soma dos lançamentos de hoje)
  const lancamentosHoje = state.uberDias.filter((d) => d.data === state.referencia);
  const totalHoje = sum(lancamentosHoje.map((l) => (l.uber || 0) + (l.app99 || 0)));
  const dif = totalHoje - meta;

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Meta diária Uber + 99</h2>
          <p class="panel-sub">Meta de <strong>${brl(meta)}/dia</strong> · só dias úteis (seg–sex)</p>
        </div>
        <div class="period-row">
          <label class="muted">Meta diária</label>
          <input type="number" id="meta-valor" min="1" step="1" value="${meta}" style="width:120px;" />
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi ${dif >= 0 ? "ok" : "warn"}">
          <h3>Hoje (${fmtBR(state.referencia)})</h3>
          <div class="value">${brl(totalHoje)}</div>
          <div class="sub">${dif >= 0 ? `Superou em ${brl(dif)}` : `Faltam ${brl(-dif)}`}</div>
        </div>
        <div class="kpi info">
          <h3>Total no mês</h3>
          <div class="value">${brl(totalMes)}</div>
          <div class="sub">Uber ${brl(totalUber)} · 99 ${brl(total99)}</div>
        </div>
        <div class="kpi ok">
          <h3>Lucro acima da meta</h3>
          <div class="value pos">+${brl(lucroAcumulado)}</div>
          <div class="sub">${diasBatidos} dia(s) batidos</div>
        </div>
        <div class="kpi danger">
          <h3>Faltou nos dias fracos</h3>
          <div class="value neg">−${brl(deficitAcumulado)}</div>
          <div class="sub">Soma do que faltou nos dias abaixo da meta</div>
        </div>
      </div>

      <div class="chart-grid" style="margin-top:14px;">
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title">Por dia (mês atual)</h2></div>
          <div class="chart-box" id="chartMetaWrap" style="height:${Math.max(240, diasMes.length * 26 + 60)}px;"><canvas id="chartMeta"></canvas></div>
        </article>
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title">Histórico</h2></div>
          ${diasMes.length === 0 ? `<p class="muted">Nenhum lançamento registrado neste mês.</p>` : `
          <div class="uber-list">
            ${diasMes.slice().reverse().map((d) => {
              const t  = d.uber + d.app99;
              const dd = t - meta;
              const lancs = d.lancamentos.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
              return `
                <article class="uber-day">
                  <header class="uber-day-head">
                    <div>
                      <span class="uber-day-date">${fmtBR(d.data)}</span>
                      <span class="badge ${dd >= 0 ? "pago" : "pendente"}">${dd >= 0 ? `+${brl(dd)}` : `−${brl(-dd)}`}</span>
                    </div>
                    <span class="uber-day-total">${brl(t)}</span>
                  </header>
                  <ul class="uber-entries">
                    ${lancs.map((l) => `
                      <li class="uber-entry" data-id="${l.id}">
                        <div class="uber-entry-tags">
                          ${(l.uber  || 0) > 0 ? `<span class="uber-tag uber">Uber · ${brl(l.uber)}</span>` : ""}
                          ${(l.app99 || 0) > 0 ? `<span class="uber-tag app99">99 · ${brl(l.app99)}</span>` : ""}
                        </div>
                        <button class="btn sm danger" data-action="rm-uber" aria-label="Remover lançamento">×</button>
                      </li>
                    `).join("")}
                  </ul>
                </article>`;
            }).join("")}
          </div>`}
        </article>
      </div>

      <form id="form-uber" class="form-grid cols-meta" style="margin-top:14px;">
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="uber" type="number" min="0" step="0.01" placeholder="Uber (opcional)" />
        <input name="app99" type="number" min="0" step="0.01" placeholder="99 (opcional)" />
        <button class="btn primary" type="submit">+ Adicionar corrida</button>
      </form>
      <p class="hint">Lance corrida por corrida — os valores vão <strong>somando no dia</strong>. Você pode preencher só Uber, só 99, ou os dois.</p>
    </section>
  `;

  document.getElementById("meta-valor").addEventListener("change", (e) => {
    state.config.metaUberDiaria = Number(e.target.value) || 120;
    saveState(); renderAll();
  });

  document.getElementById("form-uber").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = fd.get("data");
    const uber = Number(fd.get("uber") || 0);
    const app99 = Number(fd.get("app99") || 0);
    if (uber <= 0 && app99 <= 0) { toast("Informe pelo menos um valor."); return; }

    // Cria também movimentações de entrada nas fontes Saldo Uber / Saldo 99
    // pra somar automaticamente no caixa
    const fonteUber = state.caixa.find((f) => /uber/i.test(f.local || ""));
    const fonte99   = state.caixa.find((f) => /(^|\s)99(\s|$)/.test(f.local || "") || /99/.test(f.local || ""));
    const movIds = [];

    if (uber > 0 && fonteUber) {
      const movId = uid();
      state.movimentacoes.unshift({
        id: movId, tipo: "Entrada", categoria: "",
        data, descricao: `Uber ${fmtBR(data)}`,
        valor: uber, fonteId: fonteUber.id,
        origem: "uberDias"
      });
      movIds.push(movId);
    }
    if (app99 > 0 && fonte99) {
      const movId = uid();
      state.movimentacoes.unshift({
        id: movId, tipo: "Entrada", categoria: "",
        data, descricao: `99 ${fmtBR(data)}`,
        valor: app99, fonteId: fonte99.id,
        origem: "uberDias"
      });
      movIds.push(movId);
    }

    state.uberDias.push({ id: uid(), data, uber, app99, ts: Date.now(), movIds });

    const partes = [];
    if (uber > 0)  partes.push(`Uber ${brl(uber)}`);
    if (app99 > 0) partes.push(`99 ${brl(app99)}`);
    saveState(); toast(`+ ${partes.join(" · ")} em ${fmtBR(data)}`); renderAll();
  });

  document.querySelectorAll("#meta [data-id] [data-action=rm-uber]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("[data-id]")?.getAttribute("data-id");
      if (!id) return;
      const lancamento = state.uberDias.find((x) => x.id === id);
      if (lancamento?.movIds?.length) {
        // Remove também as movimentações vinculadas no caixa
        const movSet = new Set(lancamento.movIds);
        state.movimentacoes = state.movimentacoes.filter((m) => !movSet.has(m.id));
      }
      state.uberDias = state.uberDias.filter((x) => x.id !== id);
      saveState(); toast("Lançamento removido"); renderAll();
    });
  });

  // gráfico
  if (typeof Chart !== "undefined") {
    const labels = diasMes.map((d) => fmtBR(d.data).slice(0, 5));
    if (charts.chartMeta) charts.chartMeta.destroy();
    const accent = accentColor();
    const cs = getComputedStyle(document.documentElement);
    const corUber = cs.getPropertyValue("--text-strong").trim() || "#1d1b16";
    charts.chartMeta = new Chart(document.getElementById("chartMeta"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Uber", data: diasMes.map((d) => d.uber || 0),  backgroundColor: corUber,  borderRadius: 3, borderSkipped: false, stack: "g", barThickness: 14 },
          { label: "99",   data: diasMes.map((d) => d.app99 || 0), backgroundColor: "#e6b800", borderRadius: 3, borderSkipped: false, stack: "g", barThickness: 14 },
          { label: `Meta R$ ${meta}`, type: "line", data: diasMes.map(() => meta), borderColor: accent, borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, padding: 14 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${brl(ctx.parsed.x)}` } }
        },
        scales: {
          x: { stacked: true, beginAtZero: true, ticks: { callback: (v) => "R$ " + v } },
          y: { stacked: true }
        }
      }
    });
  }
}

/* ---------- RENDER: RESERVA ---------- */

function renderReserva() {
  const el = document.getElementById("reserva");
  const cfg = state.reservaConfig;
  const valorPorDia = cfg.valorMensal / cfg.diasUteis;

  // dias úteis do mês de referência
  const ref = parseISO(state.referencia);
  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const diasUteisMes = [];
  for (let d = 1; d <= ultimoDia; d++) {
    const dt = new Date(ano, mes, d);
    if (isWeekday(dt)) diasUteisMes.push(toISO(dt));
  }
  const hoje = todayISO();
  const reservaMes = state.reservaDias.filter((r) => {
    const dt = parseISO(r.data);
    return dt.getMonth() === mes && dt.getFullYear() === ano;
  });

  // Saldo do cofrinho: depósitos − saques (acumulado de todos os tempos)
  const movs = (state.reservaMovs || []).slice().sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const totalDepositos = sum(movs.filter((m) => m.tipo === "deposito").map((m) => m.valor));
  const totalSaques = sum(movs.filter((m) => m.tipo === "saque").map((m) => m.valor));
  const saldoCofrinho = totalDepositos - totalSaques;

  // Depositado no mês (referência)
  const depMes = sum(movs.filter((m) => m.tipo === "deposito" && parseISO(m.data).getMonth() === mes && parseISO(m.data).getFullYear() === ano).map((m) => m.valor));
  const saqMes = sum(movs.filter((m) => m.tipo === "saque" && parseISO(m.data).getMonth() === mes && parseISO(m.data).getFullYear() === ano).map((m) => m.valor));
  const guardadoNoMes = depMes - saqMes;

  const meta = cfg.valorMensal;
  const pct = Math.min(100, meta > 0 ? (guardadoNoMes / meta) * 100 : 0);
  const restante = Math.max(0, meta - guardadoNoMes);

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Cofrinho da reserva</h2>
          <p class="panel-sub">Meta de <strong>${brl(cfg.valorMensal)}/mês</strong> ÷ <strong>${cfg.diasUteis} dias úteis</strong> = <strong>${brl(valorPorDia)}/dia</strong></p>
        </div>
        <div class="period-row">
          <input type="number" id="res-valor" value="${cfg.valorMensal}" min="0" step="10" style="width:110px;" />
          <span class="muted">÷</span>
          <input type="number" id="res-dias" value="${cfg.diasUteis}" min="1" step="1" style="width:80px;" />
          <span class="muted">dias</span>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi ${saldoCofrinho > 0 ? "ok" : ""}">
          <h3>Saldo atual do cofrinho</h3>
          <div class="value ${saldoCofrinho >= 0 ? "pos" : "neg"}">${brl(saldoCofrinho)}</div>
          <div class="sub">Depositado ${brl(totalDepositos)} · sacado ${brl(totalSaques)}</div>
        </div>
        <div class="kpi info">
          <h3>Guardado este mês</h3>
          <div class="value">${brl(guardadoNoMes)}</div>
          <div class="sub">Dep. ${brl(depMes)} − saques ${brl(saqMes)}</div>
        </div>
        <div class="kpi warn">
          <h3>Falta para a meta</h3>
          <div class="value">${brl(restante)}</div>
          <div class="sub">Meta ${brl(meta)} · ${fmtPct(pct)}</div>
        </div>
        <div class="kpi">
          <h3>Por dia útil</h3>
          <div class="value">${brl(valorPorDia)}</div>
          <div class="sub">${reservaMes.filter((r) => r.ok).length}/${diasUteisMes.length} dias marcados</div>
        </div>
      </div>

      <div class="progress" style="height:14px;"><div class="fill ${pct >= 100 ? "" : pct < 30 ? "warn" : ""}" style="width:${pct}%"></div></div>
      <p class="hint">A barra mostra o quanto você guardou no mês em relação à meta.</p>

      <div class="chart-grid">
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Evolução do cofrinho</h2></div>
          <div class="chart-box"><canvas id="chartReservaLinha"></canvas></div>
        </article>
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title" style="font-size:0.95rem;">Depósitos × Saques</h2></div>
          <div class="chart-box"><canvas id="chartReservaBar"></canvas></div>
        </article>
      </div>

      <div class="panel-head" style="margin-top:18px;">
        <div>
          <h2 class="panel-title" style="font-size:0.95rem;">Registrar movimento no cofrinho</h2>
          <p class="panel-sub">Use <strong>depósito</strong> quando guardar e <strong>saque</strong> quando precisar tirar</p>
        </div>
      </div>
      <form id="form-reserva-mov" class="form-grid cols-meta">
        <select name="tipo" required>
          <option value="deposito">Depósito (+)</option>
          <option value="saque">Saque (−)</option>
        </select>
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <input name="descricao" placeholder="Motivo (opcional)" maxlength="60" />
        <button class="btn" type="submit" style="grid-column:1/-1;">Registrar</button>
      </form>

      <div class="panel-head" style="margin-top:18px;">
        <div>
          <h2 class="panel-title" style="font-size:0.95rem;">Calendário do mês</h2>
          <p class="panel-sub">Clique em cada dia útil pra marcar se conseguiu guardar (verde) ou perdeu (vermelho)</p>
        </div>
      </div>
      <div class="weekday-grid">
        ${diasUteisMes.map((iso) => {
          const r = state.reservaDias.find((x) => x.data === iso);
          const future = iso > hoje;
          const cls = r?.ok === true ? "done" : r?.ok === false ? "miss" : (future ? "future" : "");
          const label = `${parseISO(iso).getDate()}/${mes + 1}`;
          const sub = r?.ok === true ? `+${brl(r.valor || valorPorDia)}` : r?.ok === false ? "perdeu" : (future ? "—" : "marcar");
          return `<div class="weekday-cell ${cls}" data-day="${iso}"><div class="d">${label}</div><div class="v">${sub}</div></div>`;
        }).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Histórico do cofrinho</h2>
          <p class="panel-sub">Tudo que entrou e saiu — mais recente primeiro</p>
        </div>
      </div>
      ${movs.length === 0 ? `<p class="muted">Nenhum movimento registrado ainda. Faça seu primeiro depósito acima.</p>` : `
      <div class="table-wrap stacked-rows">
        <table>
          <thead><tr><th>Data</th><th>Tipo</th><th>Motivo</th><th>Valor</th><th>Saldo após</th><th></th></tr></thead>
          <tbody>
            ${(() => {
              const ord = movs.slice().sort((a, b) => (a.data || "").localeCompare(b.data || ""));
              const saldoPorId = {};
              let acc = 0;
              ord.forEach((m) => {
                acc += m.tipo === "deposito" ? (m.valor || 0) : -(m.valor || 0);
                saldoPorId[m.id] = acc;
              });
              return movs.map((m) => `
                <tr data-rmov="${m.id}">
                  <td data-label="Data">${fmtBR(m.data)}</td>
                  <td data-label="Tipo">${m.tipo === "deposito" ? `<span class="badge pago">Depósito</span>` : `<span class="badge atrasado">Saque</span>`}</td>
                  <td data-label="Motivo">${escapeHtml(m.descricao || "—")}</td>
                  <td class="num ${m.tipo === "deposito" ? "ok" : "neg"}" data-label="Valor">${m.tipo === "deposito" ? "+" : "−"}${brl(m.valor)}</td>
                  <td class="num" data-label="Saldo após"><strong>${brl(saldoPorId[m.id] || 0)}</strong></td>
                  <td class="actions"><button class="btn sm danger" data-action="rm-rmov">×</button></td>
                </tr>`).join("");
            })()}
          </tbody>
        </table>
      </div>`}
    </section>

  `;

  document.getElementById("res-valor").addEventListener("change", (e) => {
    state.reservaConfig.valorMensal = Number(e.target.value) || 500;
    saveState(); renderAll();
  });
  document.getElementById("res-dias").addEventListener("change", (e) => {
    state.reservaConfig.diasUteis = Math.max(1, Number(e.target.value) || 20);
    saveState(); renderAll();
  });
  document.querySelectorAll(".weekday-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const iso = cell.getAttribute("data-day");
      const idx = state.reservaDias.findIndex((x) => x.data === iso);
      if (idx === -1) {
        state.reservaDias.push({ data: iso, valor: valorPorDia, ok: true });
      } else if (state.reservaDias[idx].ok === true) {
        state.reservaDias[idx].ok = false;
      } else {
        state.reservaDias.splice(idx, 1);
      }
      saveState(); renderAll();
    });
  });

  document.getElementById("form-reserva-mov").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tipo = fd.get("tipo") === "saque" ? "saque" : "deposito";
    const valor = Number(fd.get("valor") || 0);
    if (!Number.isFinite(valor) || valor <= 0) { toast("Informe um valor válido."); return; }
    if (!state.reservaMovs) state.reservaMovs = [];
    if (tipo === "saque" && saldoCofrinho - valor < 0) {
      if (!confirm(`Você só tem ${brl(saldoCofrinho)} no cofrinho. Sacar mesmo assim?`)) return;
    }
    state.reservaMovs.unshift({
      id: uid(),
      tipo,
      data: fd.get("data") || todayISO(),
      valor,
      descricao: String(fd.get("descricao") || "").trim()
    });
    saveState(); toast(tipo === "deposito" ? "Depósito registrado" : "Saque registrado"); renderAll();
  });

  document.querySelectorAll("#reserva tr[data-rmov]").forEach((tr) => {
    tr.querySelector("[data-action=rm-rmov]").addEventListener("click", () => {
      const id = tr.getAttribute("data-rmov");
      state.reservaMovs = (state.reservaMovs || []).filter((x) => x.id !== id);
      saveState(); toast("Movimento removido"); renderAll();
    });
  });

  // Gráficos
  if (typeof Chart !== "undefined") {
    ["chartReservaLinha", "chartReservaBar"].forEach((k) => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });
    const ord = (state.reservaMovs || []).slice().sort((a, b) => (a.data || "").localeCompare(b.data || ""));
    const labels = ord.map((m) => fmtBR(m.data).slice(0, 5));
    let acc = 0;
    const linha = ord.map((m) => { acc += m.tipo === "deposito" ? (m.valor || 0) : -(m.valor || 0); return Number(acc.toFixed(2)); });

    charts.chartReservaLinha = new Chart(document.getElementById("chartReservaLinha"), {
      type: "line",
      data: { labels, datasets: [{ label: "Saldo", data: linha, borderColor: "#3f51b5", backgroundColor: "rgba(63,81,181,0.15)", fill: true, tension: 0.3, pointRadius: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } } }
    });
    charts.chartReservaBar = new Chart(document.getElementById("chartReservaBar"), {
      type: "bar",
      data: {
        labels: ["Depósitos", "Saques", "Saldo"],
        datasets: [{
          data: [Number(totalDepositos.toFixed(2)), Number(totalSaques.toFixed(2)), Number(saldoCofrinho.toFixed(2))],
          backgroundColor: ["#43a047", "#e53935", "#3f51b5"],
          borderRadius: 6
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } } }
    });
  }
}

/* ---------- RENDER: CONFIG / CATEGORIAS ---------- */

function renderConfig() {
  const el = document.getElementById("config");
  const currentAccent = accentColor();
  const presets = [
    { name: "Sálvia",  hex: "#7c8c61" },
    { name: "Oliva",   hex: "#5e6a48" },
    { name: "Tinta",   hex: "#1d1b16" },
    { name: "Areia",   hex: "#a08868" },
    { name: "Caramelo",hex: "#b87333" },
    { name: "Vinho",   hex: "#7d3c4a" },
    { name: "Marinho", hex: "#3a4f6b" },
    { name: "Cobre",   hex: "#a05a3a" }
  ];
  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Personalização</h2>
          <p class="panel-sub">Escolha a cor de destaque do painel</p>
        </div>
      </div>
      <div class="accent-row">
        <input type="color" id="accent-color" value="${currentAccent}" />
        <div class="accent-presets">
          ${presets.map((p) => `
            <button type="button" class="accent-swatch ${p.hex.toLowerCase() === currentAccent.toLowerCase() ? "active" : ""}"
              data-color="${p.hex}" style="--c:${p.hex}"
              title="${p.name}" aria-label="${p.name}"></button>
          `).join("")}
        </div>
      </div>
      <p class="hint">A cor afeta links ativos, foco em formulários, gráficos e a barra das abas. Salva automaticamente.</p>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Categorias</h2>
          <p class="panel-sub">Cadastre, edite metas, escolha cores. Tudo no seu jeito.</p>
        </div>
      </div>

      <p class="hint" style="margin-top:0;">As categorias servem só pra organizar gastos. O limite mensal é único (<strong>${brl(state.config.limiteMensal)}</strong>). Marque <strong>"Fora do limite"</strong> em categorias como <em>Combustível</em> que devem ficar separadas.</p>

      <form id="form-categoria" class="form-grid cols-categoria">
        <input name="nome" placeholder="Nome da categoria (ex: Lazer)" required maxlength="40" />
        <input name="cor" type="color" value="#2f7d32" />
        <button class="btn" type="submit">Adicionar categoria</button>
      </form>

      <div class="table-wrap" style="margin-top:12px;">
        <table>
          <thead><tr><th>Cor</th><th>Nome</th><th>Fora do limite</th><th></th></tr></thead>
          <tbody>
            ${state.categorias.map((c) => `
              <tr data-id="${c.id}">
                <td><input type="color" data-field="cor" value="${c.cor || "#2f7d32"}" /></td>
                <td><input class="inline-input" data-field="nome" value="${escapeAttr(c.nome)}" /></td>
                <td><label style="display:inline-flex; align-items:center; gap:6px;"><input type="checkbox" data-field="excluirDoLimite" ${c.excluirDoLimite ? "checked" : ""} /> <span class="muted">não conta no R$ ${state.config.limiteMensal}</span></label></td>
                <td class="actions"><button class="btn sm danger" data-action="rm-cat">×</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Configurações</h2>
        <p class="panel-sub">Ajuste fino do painel</p>
      </div>
      <div class="form-grid cols-mov">
        <label>
          <span class="label">Limite mensal (R$)</span>
          <input type="number" id="cfg-limite" min="0" step="10" value="${state.config.limiteMensal}" />
        </label>
        <label>
          <span class="label">Dia de fechamento</span>
          <input type="number" id="cfg-fechamento" min="1" max="31" step="1" value="${state.config.fechamentoDia}" />
        </label>
        <label>
          <span class="label">Meta Uber/99 diária</span>
          <input type="number" id="cfg-meta-uber" min="0" step="1" value="${state.config.metaUberDiaria}" />
        </label>
        <span></span><span></span>
        <label>
          <span class="label">Limpar tudo</span>
          <button class="btn danger" id="reset-all" type="button">Resetar dados</button>
        </label>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Sincronização automática (☁ nuvem)</h2>
          <p class="panel-sub">Dados sincronizam entre PC e celular via Gist privado do GitHub</p>
        </div>
      </div>

      <div id="sync-status" class="sync-status muted">Não conectado</div>

      ${syncCfg().token ? `
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
          <button class="btn ghost" id="btn-sync-now" type="button">↻ Sincronizar agora</button>
          <button class="btn ghost" id="btn-sync-pull" type="button">↓ Puxar da nuvem</button>
          <button class="btn danger" id="btn-sync-disconnect" type="button">Desconectar</button>
        </div>
        <p class="hint">
          <strong>Gist em uso:</strong> <a href="https://gist.github.com/${syncCfg().gistId}" target="_blank" rel="noopener">${syncCfg().gistId}</a>.
          Tudo que você salvar aqui é enviado pra nuvem em ~1.5s. Ao abrir o site em outro device com o mesmo token, ele puxa automaticamente.
        </p>
      ` : `
        <div style="display:flex; flex-direction:column; gap:10px; max-width:560px; margin-top:12px;">
          <input id="sync-token" type="password" placeholder="Cole aqui seu Token (ghp_...)" autocomplete="off" />
          <button class="btn primary" id="btn-sync-connect" type="button" style="align-self:flex-start;">Conectar à nuvem</button>
        </div>
        <details style="margin-top:14px;">
          <summary style="cursor:pointer; color: var(--accent); font-weight:500;">📋 Passo a passo (1 minuto, é só uma vez)</summary>
          <ol style="margin-top:10px; padding-left:20px; line-height:1.7; color:var(--text);">
            <li>Vai em <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">github.com/settings/tokens</a> (ou Settings → Developer settings → Personal access tokens → Fine-grained)</li>
            <li>Clica <strong>"Generate new token"</strong></li>
            <li>Nome qualquer (ex: "painel cauã"), expiração: sem expirar (ou 1 ano)</li>
            <li>Em <strong>Account permissions</strong>, marca <strong>"Gists" → Read and write</strong></li>
            <li>Gera, copia o token (começa com <code>github_pat_...</code> ou <code>ghp_...</code>)</li>
            <li>Cola aí em cima e clica <strong>Conectar</strong></li>
            <li>No celular, abre o site, vai em Categorias e cola o <strong>mesmo token</strong> — pronto, dados aparecem ☁</li>
          </ol>
          <p class="hint" style="margin-top:10px;">
            ⚠️ <strong>Segurança:</strong> O token fica salvo só no localStorage deste device. Não compartilha com ninguém — ele dá acesso aos seus gists.
            Se perder o device, vai em github.com/settings/tokens e revoga.
          </p>
        </details>
      `}
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Backup manual (.json)</h2>
          <p class="panel-sub">Pra exportar uma cópia local — usa se não quiser depender da nuvem</p>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn ghost" id="btn-backup" type="button">↓ Baixar backup</button>
        <label class="btn ghost" for="btn-restore-input" style="cursor:pointer; display:inline-flex; align-items:center;">
          ↑ Restaurar backup
          <input type="file" id="btn-restore-input" accept="application/json,.json" hidden />
        </label>
      </div>
    </section>
  `;

  document.getElementById("form-categoria").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nome = String(fd.get("nome") || "").trim();
    if (!nome) return;
    state.categorias.push({ id: uid(), nome, cor: fd.get("cor") || "#2f7d32", excluirDoLimite: false });
    saveState(); toast("Categoria criada"); renderAll();
  });

  document.querySelectorAll("#config tr[data-id]").forEach((tr) => {
    const id = tr.getAttribute("data-id");
    tr.querySelectorAll("[data-field]").forEach((inp) => {
      inp.addEventListener("change", () => {
        const cat = state.categorias.find((c) => c.id === id);
        if (!cat) return;
        const f = inp.getAttribute("data-field");
        if (f === "excluirDoLimite") cat[f] = inp.checked;
        else cat[f] = inp.value;
        saveState(); renderAll();
      });
    });
    tr.querySelector("[data-action=rm-cat]").addEventListener("click", () => {
      if (!confirm("Remover essa categoria?")) return;
      state.categorias = state.categorias.filter((c) => c.id !== id);
      saveState(); renderAll();
    });
  });

  document.getElementById("cfg-limite").addEventListener("change", (e) => {
    state.config.limiteMensal = Number(e.target.value) || 500;
    saveState(); renderAll();
  });
  document.getElementById("cfg-fechamento").addEventListener("change", (e) => {
    state.config.fechamentoDia = Math.min(31, Math.max(1, Number(e.target.value) || 10));
    saveState(); renderAll();
  });
  document.getElementById("cfg-meta-uber").addEventListener("change", (e) => {
    state.config.metaUberDiaria = Number(e.target.value) || 120;
    saveState(); renderAll();
  });
  document.getElementById("reset-all").addEventListener("click", () => {
    if (!confirm("Apagar TODOS os dados e voltar ao padrão?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(DEFAULT_STATE);
    saveState(); toast("Dados resetados"); renderAll();
  });

  // Backup: baixa JSON com todo o estado
  document.getElementById("btn-backup").addEventListener("click", () => {
    const payload = {
      _app: "lord-caua-painel",
      _version: 1,
      _exportedAt: new Date().toISOString(),
      state: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caua-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Backup baixado");
  });

  // Restore: importa JSON e substitui o state
  document.getElementById("btn-restore-input").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        const incoming = obj?.state && obj?._app === "lord-caua-painel" ? obj.state : obj;
        if (!incoming || typeof incoming !== "object") throw new Error("formato inválido");
        if (!confirm("Isso vai SUBSTITUIR todos os dados deste navegador pelo backup. Confirmar?")) {
          e.target.value = "";
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
        toast("Backup restaurado");
        setTimeout(() => location.reload(), 600);
      } catch (err) {
        toast("Arquivo inválido");
        console.error(err);
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  });

  // Sync na nuvem (Gist)
  updateSyncStatus();
  document.getElementById("btn-sync-connect")?.addEventListener("click", async () => {
    const tok = document.getElementById("sync-token").value.trim();
    if (!tok) { toast("Cole o token primeiro"); return; }
    updateSyncStatus("Conectando…", "muted");
    try {
      const res = await connectSync(tok);
      toast(res.foundExisting ? "Conectado · gist criado/encontrado" : "Conectado");
      renderAll();
    } catch (err) {
      console.error(err);
      updateSyncStatus(`⚠ ${err.message}`, "warn");
      toast("Falha ao conectar — confira o token");
    }
  });

  document.getElementById("btn-sync-now")?.addEventListener("click", async () => {
    updateSyncStatus("Sincronizando…", "muted");
    try {
      await pushToGist();
      toast("Sincronizado ☁");
    } catch (err) {
      console.error(err);
      updateSyncStatus(`⚠ ${err.message}`, "warn");
    }
  });

  document.getElementById("btn-sync-pull")?.addEventListener("click", async () => {
    if (!confirm("Substituir os dados deste device pelos dados da nuvem?")) return;
    updateSyncStatus("Puxando…", "muted");
    try {
      const remote = await pullFromGist();
      if (remote) {
        state = remote;
        autoReopenContas();
        setSyncCfg({ lastSyncAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        renderAll();
        toast("Dados puxados ☁");
      }
    } catch (err) {
      console.error(err);
      updateSyncStatus(`⚠ ${err.message}`, "warn");
    }
  });

  document.getElementById("btn-sync-disconnect")?.addEventListener("click", async () => {
    if (!confirm("Desconectar da nuvem? Os dados ficam salvos localmente.")) return;
    await disconnectSync();
    toast("Desconectado");
    renderAll();
  });

  // Color picker — cor de destaque
  const accentInput = document.getElementById("accent-color");
  accentInput?.addEventListener("input", (e) => applyAccent(e.target.value, false));
  accentInput?.addEventListener("change", (e) => applyAccent(e.target.value, true));
  document.querySelectorAll("#config .accent-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const c = sw.getAttribute("data-color");
      applyAccent(c, true);
    });
  });
}

function applyAccent(color, persist) {
  if (!color) return;
  document.documentElement.style.setProperty("--accent", color);
  if (persist) {
    localStorage.setItem("caua_accent", color);
    applyChartTheme();
    renderAll();
  }
}

/* ---------- HELPERS ---------- */

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(s) { return escapeHtml(s); }

/* ---------- TABS ---------- */

const PRIMARY_TABS = ["dashboard", "contas", "gastos", "meta"];

function activateTab(name) {
  if (!name) return;
  document.querySelectorAll("[data-tab]").forEach((el) => {
    el.classList.toggle("active", el.dataset.tab === name);
  });
  document.querySelectorAll(".tab-panel").forEach((p) => {
    p.classList.toggle("active", p.id === name);
  });
  // Marca "Mais" como ativo se a aba está dentro do drawer
  document.getElementById("more-btn")?.classList.toggle("active", !PRIMARY_TABS.includes(name));
  closeMobileMore();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openMobileMore()  { document.getElementById("mobile-more")?.classList.add("open"); }
function closeMobileMore() { document.getElementById("mobile-more")?.classList.remove("open"); }

function setupTabs() {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
  document.getElementById("more-btn")?.addEventListener("click", () => {
    const m = document.getElementById("mobile-more");
    if (!m) return;
    m.classList.contains("open") ? closeMobileMore() : openMobileMore();
  });
  document.getElementById("mobile-more-backdrop")?.addEventListener("click", closeMobileMore);
  // Esc fecha drawer e quick sheet
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeMobileMore(); closeQuickSheet(); closeTransferSheet(); }
  });
}

/* ---------- QUICK FAB (lançar entrada/gasto) ---------- */

function openQuickSheet(tipoInicial, editingMov) {
  const sheet = document.getElementById("quick-sheet");
  const fab = document.getElementById("quick-fab-btn");
  if (!sheet) return;

  const isEdit = !!editingMov;
  const form = document.getElementById("quick-sheet-form");
  if (form) {
    form.fonteId.innerHTML = fonteOptions(editingMov?.fonteId);
    form.categoria.innerHTML = categoriaOptions(editingMov?.categoria);
    form.data.value = editingMov?.data || state.referencia || todayISO();
    form.descricao.value = editingMov?.descricao || "";
    if (isEdit && editingMov.valor > 0) {
      form.valor.value = fmtMoneyBR(editingMov.valor);
    } else {
      form.valor.value = "";
    }
  }

  sheet.dataset.editingId = editingMov?.id || "";
  const titleEl = sheet.querySelector(".quick-sheet-title");
  if (titleEl) titleEl.textContent = isEdit ? "Editar movimentação" : "Nova movimentação";

  const seg = sheet.querySelector(".seg-control");
  const tipo = isEdit ? editingMov.tipo : (tipoInicial === "Entrada" ? "Entrada" : "Gasto");
  setQuickSheetTipo(seg, tipo);

  sheet.classList.add("open");
  fab?.classList.add("open");
  setTimeout(() => form?.valor?.focus(), 280);
}

function closeQuickSheet() {
  document.getElementById("quick-sheet")?.classList.remove("open");
  document.getElementById("quick-fab-btn")?.classList.remove("open");
}

function setQuickSheetTipo(seg, tipo) {
  if (!seg) return;
  seg.setAttribute("data-tipo", tipo);
  seg.querySelectorAll(".seg-btn").forEach((b) => {
    const isActive = b.dataset.tipo === tipo;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  const sheet = document.getElementById("quick-sheet");
  const catField = sheet?.querySelector(".qf-cat");
  if (catField) catField.classList.toggle("is-hidden", tipo === "Entrada");
  const submit = sheet?.querySelector(".qf-submit");
  if (submit) submit.textContent = tipo === "Entrada" ? "Salvar entrada" : "Salvar gasto";
}

function setupQuickFab() {
  const fab = document.getElementById("quick-fab-btn");
  const sheet = document.getElementById("quick-sheet");
  if (!fab || !sheet) return;

  fab.addEventListener("click", () => {
    sheet.classList.contains("open") ? closeQuickSheet() : openQuickSheet("Gasto");
  });

  document.getElementById("quick-sheet-backdrop")?.addEventListener("click", closeQuickSheet);

  const seg = sheet.querySelector(".seg-control");
  seg?.querySelectorAll(".seg-btn").forEach((b) => {
    b.addEventListener("click", () => setQuickSheetTipo(seg, b.dataset.tipo));
  });

  const form = document.getElementById("quick-sheet-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipo = seg?.getAttribute("data-tipo") === "Entrada" ? "Entrada" : "Gasto";
    const fd = new FormData(form);
    const editingId = sheet.dataset.editingId;

    if (editingId) {
      // Atualiza movimentação existente
      const mov = state.movimentacoes.find((m) => m.id === editingId);
      if (mov) {
        mov.tipo = tipo;
        mov.categoria = tipo === "Gasto" ? String(fd.get("categoria") || "") : "";
        mov.data = fd.get("data") || todayISO();
        mov.descricao = String(fd.get("descricao") || "").trim();
        mov.valor = Number(fd.get("valor") || 0);
        mov.fonteId = fd.get("fonteId") || "";
        saveState(); toast("Movimentação atualizada"); renderAll();
      }
      closeQuickSheet();
      return;
    }

    addMovimentacao({
      tipo,
      categoria: tipo === "Gasto" ? String(fd.get("categoria") || "") : "",
      data: fd.get("data") || todayISO(),
      descricao: String(fd.get("descricao") || "").trim(),
      valor: Number(fd.get("valor") || 0),
      fonteId: fd.get("fonteId") || ""
    });
    closeQuickSheet();
  });
}

/* ---------- TRANSFER ENTRE FONTES ---------- */

// Taxa padrão por fonte (Uber=4.50, 99=1.00); 0 se não tem
function taxaPadraoFonte(fonteId) {
  const f = state.caixa.find((x) => x.id === fonteId);
  if (!f) return 0;
  if (/uber/i.test(f.local || "")) return 4.50;
  if (/99/.test(f.local || "")) return 1.00;
  return 0;
}

function openTransferSheet() {
  const sheet = document.getElementById("transfer-sheet");
  const form = document.getElementById("transfer-form");
  if (!sheet || !form) return;

  // Defaults: De = primeira fonte com taxa (Uber/99 se houver), Para = Santander (ou primeira diferente)
  const fontesComTaxa = state.caixa.filter((f) => taxaPadraoFonte(f.id) > 0);
  const defaultFromId = fontesComTaxa[0]?.id || state.caixa[0]?.id || "";
  const defaultToId   = state.caixa.find((f) => f.id === SANT_ID)?.id
                      || state.caixa.find((f) => f.id !== defaultFromId)?.id
                      || "";

  form.from.innerHTML = fonteOptions(defaultFromId);
  form.to.innerHTML   = fonteOptions(defaultToId);
  form.data.value     = state.referencia || todayISO();
  form.valor.value    = "";

  updateTransferTax();
  sheet.classList.add("open");
  setTimeout(() => form.valor.focus(), 280);
}

function closeTransferSheet() {
  document.getElementById("transfer-sheet")?.classList.remove("open");
}

function updateTransferTax() {
  const form = document.getElementById("transfer-form");
  if (!form) return;
  const fromId = form.from.value;
  const taxa = taxaPadraoFonte(fromId);
  const checkbox = document.getElementById("transfer-cobrar-taxa");
  const taxaInput = form.taxa;
  const taxaWrap = form.querySelector(".qf-tax-wrap");
  const hint = document.getElementById("transfer-tax-hint");

  if (taxa > 0) {
    const fonteNome = state.caixa.find((x) => x.id === fromId)?.local || "";
    if (hint) hint.textContent = `(taxa padrão de ${fonteNome}: ${brl(taxa)})`;
    checkbox.checked = true;
    taxaInput.value = fmtMoneyBR(taxa);
    if (taxaWrap) taxaWrap.style.display = "";
  } else {
    if (hint) hint.textContent = "";
    checkbox.checked = false;
    taxaInput.value = "";
    if (taxaWrap) taxaWrap.style.display = "none";
  }
}

function setupTransfer() {
  const form = document.getElementById("transfer-form");
  if (!form) return;

  document.getElementById("transfer-sheet-backdrop")?.addEventListener("click", closeTransferSheet);
  form.from.addEventListener("change", updateTransferTax);

  const checkbox = document.getElementById("transfer-cobrar-taxa");
  checkbox.addEventListener("change", () => {
    const wrap = form.querySelector(".qf-tax-wrap");
    if (wrap) wrap.style.display = checkbox.checked ? "" : "none";
    if (!checkbox.checked) form.taxa.value = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const fromId = fd.get("from");
    const toId   = fd.get("to");
    const valor  = Number(fd.get("valor") || 0);
    const data   = fd.get("data") || todayISO();
    const cobrarTaxa = !!fd.get("cobrarTaxa");
    const taxa = cobrarTaxa ? Number(fd.get("taxa") || 0) : 0;

    if (!fromId || !toId) { toast("Escolha origem e destino"); return; }
    if (fromId === toId)  { toast("Origem e destino devem ser diferentes"); return; }
    if (valor <= 0)       { toast("Informe o valor"); return; }

    const from = state.caixa.find((x) => x.id === fromId);
    const to   = state.caixa.find((x) => x.id === toId);
    if (!from || !to) { toast("Fonte inválida"); return; }

    // Mov 1: saída na origem (transferência)
    state.movimentacoes.unshift({
      id: uid(), tipo: "Gasto", categoria: "",
      data, descricao: `Transferência → ${to.local}`,
      valor, fonteId: fromId, origem: "transfer"
    });
    // Mov 2: entrada no destino
    state.movimentacoes.unshift({
      id: uid(), tipo: "Entrada", categoria: "",
      data, descricao: `Transferência ← ${from.local}`,
      valor, fonteId: toId, origem: "transfer"
    });
    // Mov 3: taxa (se aplicável) — sai da origem também
    if (taxa > 0) {
      state.movimentacoes.unshift({
        id: uid(), tipo: "Gasto", categoria: "",
        data, descricao: `Taxa de transferência (${from.local})`,
        valor: taxa, fonteId: fromId, origem: "transfer-taxa"
      });
    }

    saveState();
    closeTransferSheet();
    toast(`Transferido ${brl(valor)} ${from.local} → ${to.local}${taxa > 0 ? ` · taxa ${brl(taxa)}` : ""}`);
    renderAll();
  });
}

/* ---------- RENDER ALL ---------- */

function renderAll() {
  document.getElementById("header-date").textContent = new Date().toLocaleString("pt-BR");
  const c = compute();
  renderDashboard(c);
  renderContas(c);
  renderCaixa(c);
  renderGastos(c);
  renderCombustivel();
  renderMeta(c);
  renderReserva();
  renderConfig();
  refreshMoneyInputs();
}

/* ---------- DIALOG (substitui prompt/confirm) ---------- */

function openDialog({ title, message, defaultValue = "", confirmText = "Confirmar", inputType = "money", label = "" }) {
  return new Promise((resolve) => {
    const dlg = document.getElementById("dialog");
    if (!dlg) { resolve(null); return; }

    dlg.querySelector("#dialog-title").textContent = title || "";
    dlg.querySelector("#dialog-msg").textContent = message || "";
    dlg.querySelector("#dialog-confirm").textContent = confirmText;

    const wrap = dlg.querySelector("#dialog-input-wrap");
    const input = dlg.querySelector("#dialog-input");
    wrap.style.display = inputType === "none" ? "none" : "";

    // Reseta atributos pra reuso entre tipos
    input.removeAttribute("data-currency");
    input.removeAttribute("inputmode");
    input.removeAttribute("min");
    input.removeAttribute("max");
    input.removeAttribute("step");

    if (inputType === "money") {
      input.type = "text";
      input.inputMode = "decimal";
      input.dataset.currency = "on";
      input.placeholder = "0,00";
      let initial = "";
      if (typeof defaultValue === "number" && defaultValue > 0) initial = fmtMoneyBR(defaultValue);
      else if (typeof defaultValue === "string" && defaultValue) initial = defaultValue;
      input.value = initial;
    } else if (inputType === "date") {
      input.type = "date";
      input.placeholder = "";
      input.value = defaultValue || todayISO();
    } else if (inputType === "text") {
      input.type = "text";
      input.placeholder = label || "";
      input.value = defaultValue || "";
    }

    const cancelBtns = dlg.querySelectorAll("[data-dialog-cancel]");
    const confirmBtn = dlg.querySelector("#dialog-confirm");

    const cleanup = () => {
      dlg.classList.remove("open");
      cancelBtns.forEach((b) => b.removeEventListener("click", onCancel));
      confirmBtn.removeEventListener("click", onConfirm);
      input.removeEventListener("keydown", onKey);
      document.removeEventListener("keydown", onEsc);
    };
    const onCancel = () => { cleanup(); resolve(null); };
    const onConfirm = () => {
      const raw = input.value;
      let result;
      if (inputType === "money") result = parseMoney(raw);
      else if (inputType === "date") result = raw || null;
      else if (inputType === "text") result = raw.trim();
      else result = true;
      cleanup();
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === "Enter") { e.preventDefault(); onConfirm(); }
    };
    const onEsc = (e) => { if (e.key === "Escape") onCancel(); };

    cancelBtns.forEach((b) => b.addEventListener("click", onCancel));
    confirmBtn.addEventListener("click", onConfirm);
    input.addEventListener("keydown", onKey);
    document.addEventListener("keydown", onEsc);

    dlg.classList.add("open");
    if (inputType !== "none") requestAnimationFrame(() => { input.focus(); input.select?.(); });
  });
}

/* ---------- CURRENCY INPUTS (auto-format BRL "50,00") ---------- */

const MONEY_NAMES = /^(valor|valorParcela|valorPago|valorMensal|uber|app99|saldoInicial)$/;

function parseMoney(s) {
  if (s == null) return 0;
  if (typeof s === "number") return Number.isFinite(s) ? s : 0;
  const cleaned = String(s).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function fmtMoneyBR(n) {
  return Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isMoneyInput(inp) {
  if (!inp || inp.tagName !== "INPUT") return false;
  if (inp.dataset.currency === "off") return false;
  if (inp.dataset.currency === "on") return true;
  return MONEY_NAMES.test(inp.name || "");
}

function prepareMoneyInput(inp) {
  if (inp.type === "number") inp.type = "text";
  if (!inp.inputMode) inp.inputMode = "decimal";
  inp.setAttribute("autocomplete", "off");
  if (inp.value !== "" && inp.value != null) {
    const n = parseMoney(inp.value);
    inp.value = n === 0 ? "" : fmtMoneyBR(n);
  }
}

// Decimal implícito: usuário digita só dígitos, vírgula desliza no fim
// Ex: "5" → "0,05" · "50" → "0,50" · "5000" → "50,00" · "7653849" → "76.538,49"
function formatLiveCurrency(rawDigits) {
  if (!rawDigits) return "";
  const cleaned = rawDigits.replace(/^0+(?=\d)/, ""); // remove zeros à esquerda
  const value = Number(cleaned || "0") / 100;
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setupCurrencyInputs() {
  // Formata ao vivo conforme digita
  document.body.addEventListener("input", (e) => {
    const inp = e.target;
    if (!isMoneyInput(inp)) return;
    const digits = (inp.value || "").replace(/\D/g, "");
    const formatted = digits ? formatLiveCurrency(digits) : "";
    if (inp.value !== formatted) {
      inp.value = formatted;
      // Cursor sempre no fim (padrão decimal implícito)
      requestAnimationFrame(() => {
        const len = inp.value.length;
        try { inp.setSelectionRange(len, len); } catch (_) {}
      });
    }
  });

  // Antes de submit, normaliza pra string numérica que os handlers já leem
  document.body.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form || !form.querySelectorAll) return;
    form.querySelectorAll("input").forEach((inp) => {
      if (isMoneyInput(inp)) inp.value = String(parseMoney(inp.value));
    });
  }, true);

  refreshMoneyInputs();
}

function refreshMoneyInputs() {
  document.querySelectorAll("input").forEach((inp) => {
    if (isMoneyInput(inp)) prepareMoneyInput(inp);
  });
}

/* ---------- THEME TOGGLE ---------- */

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const ripple = document.getElementById("theme-ripple");
  if (!btn || !ripple) return;

  btn.addEventListener("click", (e) => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";

    // Posição do clique para o ripple começar dali
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    ripple.style.setProperty("--rx", `${cx}px`);
    ripple.style.setProperty("--ry", `${cy}px`);

    // Cor do "véu" = cor de fundo do tema DESTINO
    // Lê uma var temporariamente aplicada ao documento
    document.documentElement.setAttribute("data-theme", next);
    const destBg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0a1628";
    document.documentElement.setAttribute("data-theme", current);
    ripple.style.background = destBg;

    // Dispara o ripple
    ripple.classList.remove("go");
    void ripple.offsetWidth; // reflow para reiniciar animação
    ripple.classList.add("go");

    // Troca o tema no meio da animação (quando o ripple cobriu o suficiente)
    setTimeout(() => {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("caua_tema", next);
      applyChartTheme();
      renderAll();
    }, 320);

    // Tira o ripple ao final
    setTimeout(() => { ripple.classList.remove("go"); ripple.style.opacity = 0; }, 720);
  });
}

loadState();
const reabertas = autoReopenContas();
renderAll();
setupTabs();
setupThemeToggle();
setupQuickFab();
setupTransfer();
setupCurrencyInputs();
if (reabertas > 0) {
  setTimeout(() => toast(`${reabertas} parcela(s) abertas pra este mês`), 400);
}

// Sync automático: se já tem token, busca dados mais recentes da nuvem
(async () => {
  const cfg = syncCfg();
  if (!cfg.token || !cfg.gistId) return;
  updateSyncStatus("Buscando dados da nuvem…", "muted");
  try {
    const remote = await pullFromGist();
    if (!remote) return;
    // Sempre adota o estado da nuvem ao abrir (PC ou celular ficam idênticos)
    state = remote;
    autoReopenContas();
    setSyncCfg({ lastSyncAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    updateSyncStatus();
    toast("Dados sincronizados da nuvem ☁");
  } catch (err) {
    console.error("Pull inicial falhou:", err);
    updateSyncStatus("⚠ Erro ao puxar da nuvem", "warn");
  }
})();
