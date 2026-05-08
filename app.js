/* =========================================================
   Painel Financeiro - Cauã Ramos
   Estado persistido em localStorage. Tudo editavel.
========================================================= */

const STORAGE_KEY = "caua_financas_v4";

const DEFAULT_STATE = {
  periodo: "mes",
  referencia: todayISO(),
  caixa: [
    { id: uid(), local: "Banco Santander", valor: 419.22 },
    { id: uid(), local: "Espécie",         valor: 25.0   },
    { id: uid(), local: "Saldo Uber",      valor: 23.42  },
    { id: uid(), local: "Saldo 99",        valor: 72.65  }
  ],
  contas: [
    { id: uid(), descricao: "Cartão tia",  grupo: "tia",    vencimento: "2026-05-10", parcelaAtual: 1, parcelasTotal: 1, valorParcela: 331.24, valorPago: 0, prioridade: 1, status: "pendente" },
    { id: uid(), descricao: "Aluguel",     grupo: "outras", vencimento: "2026-05-10", parcelaAtual: 1, parcelasTotal: 1, valorParcela: 500.0,  valorPago: 0, prioridade: 2, status: "pendente" },
    { id: uid(), descricao: "Energia",     grupo: "outras", vencimento: "2026-05-10", parcelaAtual: 1, parcelasTotal: 1, valorParcela: 125.0,  valorPago: 0, prioridade: 3, status: "pendente" },
    { id: uid(), descricao: "Internet",    grupo: "outras", vencimento: "2026-05-10", parcelaAtual: 1, parcelasTotal: 1, valorParcela: 31.0,   valorPago: 0, prioridade: 4, status: "pendente" },
    { id: uid(), descricao: "Dentista",    grupo: "outras", vencimento: "2026-05-10", parcelaAtual: 1, parcelasTotal: 1, valorParcela: 75.0,   valorPago: 0, prioridade: 5, status: "pendente" }
  ],
  categorias: [
    { id: uid(), nome: "Alimentação", meta: 250, cor: "#4caf50" },
    { id: uid(), nome: "Combustível", meta: 280, cor: "#ff9800" },
    { id: uid(), nome: "Lanche",      meta: 120, cor: "#03a9f4" },
    { id: uid(), nome: "Casa",        meta: 100, cor: "#9c27b0" },
    { id: uid(), nome: "Reserva",     meta: 500, cor: "#3f51b5" }
  ],
  movimentacoes: [
    /* { id, tipo: "Entrada"|"Gasto", data, categoria, descricao, valor } */
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
    metaUberDiaria: 120
  }
};

let state = clone(DEFAULT_STATE);
let charts = {};

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
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ---------- TOAST ---------- */

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ---------- COMPUTE ---------- */

function compute() {
  const caixaTotal = sum(state.caixa.map((x) => x.valor));
  const movPeriodo = state.movimentacoes.filter((m) => inSelectedPeriod(m.data));

  const entradas = sum(movPeriodo.filter((m) => m.tipo === "Entrada").map((m) => m.valor));
  const gastos = sum(movPeriodo.filter((m) => m.tipo === "Gasto").map((m) => m.valor));
  const caixaAtual = caixaTotal + entradas - gastos;

  const contasPendentes = state.contas.filter((c) => c.status !== "pago");
  const valorTotalAbertoContas = sum(contasPendentes.map((c) => Math.max(0, (c.valorParcela || 0) - (c.valorPago || 0))));
  const totalContasGeral = sum(state.contas.map((c) => c.valorParcela || 0));

  const deficit = valorTotalAbertoContas - caixaAtual;

  const gastoPorCategoria = {};
  state.categorias.forEach((c) => { gastoPorCategoria[c.nome] = 0; });
  movPeriodo.filter((m) => m.tipo === "Gasto").forEach((m) => {
    if (gastoPorCategoria[m.categoria] === undefined) gastoPorCategoria[m.categoria] = 0;
    gastoPorCategoria[m.categoria] += m.valor;
  });
  const categoriasResumo = state.categorias.map((c) => {
    const gasto = gastoPorCategoria[c.nome] || 0;
    const restante = c.meta - gasto;
    const percentual = c.meta > 0 ? (gasto / c.meta) * 100 : 0;
    return { ...c, gasto, restante, percentual };
  });

  const fech = diasAteFechamento();

  return {
    movPeriodo, caixaTotal, entradas, gastos, caixaAtual,
    contasPendentes, valorTotalAbertoContas, totalContasGeral, deficit,
    categoriasResumo, fech
  };
}

/* ---------- RENDER: DASHBOARD ---------- */

function renderDashboard(c) {
  const el = document.getElementById("dashboard");
  const dCls = c.deficit > 0 ? "danger" : "ok";
  const dLabel = c.deficit > 0 ? `Faltam ${brl(c.deficit)}` : `Sobra ${brl(-c.deficit)}`;

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
        <p class="panel-sub">Adicione entradas ou gastos do dia</p>
      </div>
      <form id="quick-mov" class="form-grid cols-mov">
        <select name="tipo" id="quick-tipo" required>
          <option value="Gasto">Gasto</option>
          <option value="Entrada">Entrada</option>
        </select>
        <select name="categoria" id="quick-cat" required>${categoriaOptions()}</select>
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="descricao" required placeholder="Descrição (ex: din din)" maxlength="60" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button class="btn" type="submit">Adicionar</button>
      </form>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Controle por categoria</h2>
          <p class="panel-sub">Meta vs gasto no período — quanto ainda pode gastar</p>
        </div>
      </div>
      <div>
        ${c.categoriasResumo.map((x) => {
          const pct = Math.min(100, x.percentual);
          const cls = x.percentual >= 100 ? "over" : x.percentual >= 80 ? "warn" : "";
          const restCls = x.restante < 0 ? "neg" : "ok";
          return `
            <div class="bar-row">
              <div class="name">${x.nome}</div>
              <div class="bar">
                <div class="progress"><div class="fill ${cls}" style="width:${pct}%"></div></div>
              </div>
              <div class="vals">
                <strong>${brl(x.gasto)}</strong> / ${brl(x.meta)}
                <div class="${restCls}">${x.restante < 0 ? "passou " + brl(-x.restante) : "pode " + brl(x.restante)}</div>
              </div>
            </div>`;
        }).join("")}
      </div>
    </section>

    <section class="chart-grid">
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">Gastos por categoria</h2></div>
        <div class="chart-box"><canvas id="pieChart"></canvas></div>
        <p id="pie-empty" class="hint"></p>
      </article>
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">Meta × Gasto</h2></div>
        <div class="chart-box"><canvas id="barChart"></canvas></div>
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
  document.getElementById("quick-mov").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addMovimentacao({
      tipo: fd.get("tipo"),
      categoria: fd.get("categoria"),
      data: fd.get("data"),
      descricao: String(fd.get("descricao") || "").trim(),
      valor: Number(fd.get("valor") || 0)
    });
    e.currentTarget.reset();
    document.querySelector("#quick-mov [name=data]").value = state.referencia;
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

function addMovimentacao({ tipo, categoria, data, descricao, valor }) {
  if (!descricao || !Number.isFinite(valor) || valor <= 0) {
    toast("Preencha descrição e valor."); return;
  }
  state.movimentacoes.unshift({
    id: uid(),
    tipo: tipo === "Entrada" ? "Entrada" : "Gasto",
    categoria: tipo === "Gasto" ? (categoria || "Alimentação") : "",
    data: data || todayISO(),
    descricao,
    valor: Number(valor)
  });
  saveState(); toast("Lançamento adicionado"); renderAll();
}

/* ---------- RENDER: CHARTS ---------- */

function renderCharts(c) {
  if (typeof Chart === "undefined") {
    const m = document.getElementById("pie-empty");
    if (m) m.textContent = "Chart.js indisponível.";
    return;
  }
  const labels = c.categoriasResumo.map((x) => x.nome);
  const cores  = c.categoriasResumo.map((x) => x.cor || "#4caf50");
  const gastos = c.categoriasResumo.map((x) => Number(x.gasto.toFixed(2)));
  const metas  = c.categoriasResumo.map((x) => Number(x.meta.toFixed(2)));
  const totalG = sum(gastos);

  ["pieChart", "barChart"].forEach((k) => { if (charts[k]) { charts[k].destroy(); delete charts[k]; } });

  const msg = document.getElementById("pie-empty");
  if (msg) msg.textContent = totalG === 0 ? "Sem gastos no período. Lance um gasto para preencher a pizza." : "";

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

  charts.barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Meta",  data: metas,  backgroundColor: "#a8d6a8", borderRadius: 6 },
        { label: "Gasto", data: gastos, backgroundColor: "#2f7d32", borderRadius: 6 }
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

  const renderGrupo = (titulo, badge, lista) => {
    if (!lista.length) return "";
    const totalAberto = sum(lista.map((x) => Math.max(0, (x.valorParcela || 0) - (x.valorPago || 0))));
    const totalGeral = sum(lista.map((x) => x.valorParcela || 0));
    return `
      <tr class="section">
        <td colspan="9">${titulo} — em aberto: ${brl(totalAberto)} / total: ${brl(totalGeral)}</td>
      </tr>
      ${lista.sort((a, b) => (a.prioridade || 99) - (b.prioridade || 99)).map((x) => {
        const valorTotalDivida = (x.valorParcela || 0) * (x.parcelasTotal || 1);
        const aberto = Math.max(0, (x.valorParcela || 0) - (x.valorPago || 0));
        const quitada = x.status === "pago" || aberto === 0;
        const parcial = !quitada && (x.valorPago || 0) > 0;
        const status = quitada ? "pago" : parcial ? "parcial" : "pendente";
        const statusLabel = quitada ? "Pago" : parcial ? `Parcial · faltam ${brl(aberto)}` : "Pendente";
        return `
          <tr class="${quitada ? "row-paid" : ""}" data-id="${x.id}">
            <td>
              <strong>${escapeHtml(x.descricao)}</strong>
              <div class="muted" style="font-size:0.82rem; margin-top:2px;">
                ${brl(x.valorParcela)} <span class="pill">${x.parcelaAtual || 1}/${x.parcelasTotal || 1}</span>
                <span class="pill">total ${brl(valorTotalDivida)}</span>
                ${parcial ? `<span class="pill faltam">falta ${brl(aberto)}</span>` : ""}
                ${quitada ? `<span class="pill quitada">quitada</span>` : ""}
              </div>
            </td>
            <td><span class="badge ${badge}">${badge === "tia" ? "Tia" : "Outras"}</span></td>
            <td>${fmtBR(x.vencimento)}</td>
            <td class="num">${brl(x.valorParcela)}</td>
            <td class="num">${brl(x.valorPago || 0)}</td>
            <td class="num"><strong>${brl(aberto)}</strong></td>
            <td>${x.parcelaAtual || 1}/${x.parcelasTotal || 1}</td>
            <td><span class="badge ${status}">${statusLabel}</span></td>
            <td class="actions">
              ${!quitada ? `<button class="btn sm success" data-action="quitar">Pagar</button>` : `<button class="btn sm ghost" data-action="reabrir">Reabrir</button>`}
              <button class="btn sm ghost" data-action="pagar-parcial">Parcial</button>
              <button class="btn sm ghost" data-action="editar">Editar</button>
              <button class="btn sm danger" data-action="remover">×</button>
            </td>
          </tr>`;
      }).join("")}
    `;
  };

  const tia = state.contas.filter((x) => x.grupo === "tia");
  const outras = state.contas.filter((x) => x.grupo !== "tia");
  const fech = c.fech;
  const totalAberto = c.valorTotalAbertoContas;
  const restante = Math.max(0, totalAberto - c.caixaAtual);

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
          <div class="sub">${fech.dias > 0 && restante > 0 ? `${brl(restante / fech.dias)}/dia até dia ${state.config.fechamentoDia}` : "Você consegue fechar com o caixa atual"}</div>
        </div>
        <div class="kpi info">
          <h3>Total geral</h3>
          <div class="value">${brl(c.totalContasGeral)}</div>
          <div class="sub">Somando todas as parcelas</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Despesa</th>
              <th>Grupo</th>
              <th>Vencimento</th>
              <th>Parcela</th>
              <th>Pago</th>
              <th>Em aberto</th>
              <th>Nº</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${renderGrupo("Tia", "tia", tia)}
            ${renderGrupo("Outras (aluguel, energia, internet, etc.)", "outras", outras)}
            ${state.contas.length === 0 ? `<tr><td colspan="9" class="muted">Nenhuma conta cadastrada. Clique em <strong>+ Nova conta</strong>.</td></tr>` : ""}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel" id="form-conta-panel" style="display:none;">
      <div class="panel-head">
        <h2 class="panel-title" id="form-conta-title">Nova conta</h2>
        <button class="btn ghost" id="cancel-conta">Cancelar</button>
      </div>
      <form id="form-conta" class="form-grid cols-conta">
        <input name="descricao" placeholder="Descrição" required maxlength="60" />
        <select name="grupo" required>
          <option value="outras">Outras</option>
          <option value="tia">Tia</option>
        </select>
        <input name="vencimento" type="date" required />
        <input name="parcelaAtual" type="number" min="1" step="1" placeholder="Parc. atual" required />
        <input name="parcelasTotal" type="number" min="1" step="1" placeholder="Parc. total" required />
        <input name="valorParcela" type="number" min="0.01" step="0.01" placeholder="Valor parcela" required />
        <input name="valorPago" type="number" min="0" step="0.01" placeholder="Pago (parcial)" value="0" />
        <button class="btn" type="submit">Salvar</button>
      </form>
      <p class="hint">
        Dica: se a dívida tem 3 parcelas de R$ 50, lance <strong>parcela atual = 1</strong>, <strong>total = 3</strong>, <strong>valor = 50</strong>.
        O painel mostra <code>R$ 50 · 1/3 · total R$ 150</code>.
      </p>
    </section>
  `;

  bindContas();
}

function bindContas() {
  const panel = document.getElementById("form-conta-panel");
  const form = document.getElementById("form-conta");
  const title = document.getElementById("form-conta-title");
  let editingId = null;

  const showForm = (conta) => {
    editingId = conta ? conta.id : null;
    title.textContent = conta ? "Editar conta" : "Nova conta";
    form.descricao.value = conta?.descricao || "";
    form.grupo.value = conta?.grupo || "outras";
    form.vencimento.value = conta?.vencimento || state.referencia;
    form.parcelaAtual.value = conta?.parcelaAtual || 1;
    form.parcelasTotal.value = conta?.parcelasTotal || 1;
    form.valorParcela.value = conta?.valorParcela || "";
    form.valorPago.value = conta?.valorPago || 0;
    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.getElementById("add-conta").addEventListener("click", () => showForm(null));
  document.getElementById("cancel-conta").addEventListener("click", () => { panel.style.display = "none"; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      descricao: String(fd.get("descricao") || "").trim(),
      grupo: fd.get("grupo") === "tia" ? "tia" : "outras",
      vencimento: fd.get("vencimento"),
      parcelaAtual: Number(fd.get("parcelaAtual") || 1),
      parcelasTotal: Number(fd.get("parcelasTotal") || 1),
      valorParcela: Number(fd.get("valorParcela") || 0),
      valorPago: Number(fd.get("valorPago") || 0)
    };
    if (!data.descricao || data.valorParcela <= 0) { toast("Preencha descrição e valor."); return; }
    if (editingId) {
      state.contas = state.contas.map((c) => c.id === editingId ? { ...c, ...data, status: data.valorPago >= data.valorParcela ? "pago" : "pendente" } : c);
      toast("Conta atualizada");
    } else {
      state.contas.push({ id: uid(), prioridade: state.contas.length + 1, status: data.valorPago >= data.valorParcela ? "pago" : "pendente", ...data });
      toast("Conta adicionada");
    }
    saveState(); panel.style.display = "none"; renderAll();
  });

  document.querySelectorAll("#contas tbody tr[data-id]").forEach((tr) => {
    const id = tr.getAttribute("data-id");
    tr.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const conta = state.contas.find((c) => c.id === id);
        if (!conta) return;
        const action = btn.getAttribute("data-action");
        if (action === "quitar") {
          conta.valorPago = conta.valorParcela;
          conta.status = "pago";
          toast("Conta marcada como paga");
        } else if (action === "reabrir") {
          conta.valorPago = 0;
          conta.status = "pendente";
          toast("Conta reaberta");
        } else if (action === "pagar-parcial") {
          const v = Number(prompt(`Quanto pagar agora em "${conta.descricao}"? (em aberto: ${brl(conta.valorParcela - (conta.valorPago || 0))})`, "0"));
          if (!Number.isFinite(v) || v <= 0) return;
          conta.valorPago = Math.min(conta.valorParcela, (conta.valorPago || 0) + v);
          conta.status = conta.valorPago >= conta.valorParcela ? "pago" : "pendente";
          toast(`Pagamento parcial registrado`);
        } else if (action === "editar") {
          showForm(conta);
          return;
        } else if (action === "remover") {
          if (!confirm(`Remover "${conta.descricao}"?`)) return;
          state.contas = state.contas.filter((c) => c.id !== id);
          toast("Conta removida");
        }
        saveState(); renderAll();
      });
    });
  });
}

/* ---------- RENDER: CAIXA & ENTRADAS ---------- */

function renderCaixa(c) {
  const el = document.getElementById("caixa");
  const movEntradas = state.movimentacoes.filter((m) => m.tipo === "Entrada").slice(0, 30);

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Fontes de caixa</h2>
          <p class="panel-sub">Onde está o dinheiro hoje. Edite os valores diretamente.</p>
        </div>
        <button class="btn" id="add-caixa">+ Adicionar local</button>
      </div>

      <form id="form-caixa" class="form-grid cols-caixa" style="display:none;">
        <input name="local" placeholder="Local (ex: Carteira, Inter)" required maxlength="40" />
        <input name="valor" type="number" min="0" step="0.01" placeholder="Saldo" required />
        <button class="btn" type="submit">Adicionar</button>
      </form>

      <div class="table-wrap" style="margin-top:10px;">
        <table>
          <thead><tr><th>Local</th><th>Saldo</th><th></th></tr></thead>
          <tbody>
            ${state.caixa.map((x) => `
              <tr data-id="${x.id}">
                <td><input class="inline-input" data-field="local" value="${escapeAttr(x.local)}" /></td>
                <td><input class="inline-input" data-field="valor" type="number" step="0.01" value="${x.valor}" /></td>
                <td class="actions">
                  <button class="btn sm danger" data-action="remover">×</button>
                </td>
              </tr>`).join("")}
            <tr>
              <td><strong>Total disponível</strong></td>
              <td class="num"><strong>${brl(c.caixaTotal)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Últimas entradas</h2>
        <p class="panel-sub">Registros do tipo "Entrada"</p>
      </div>
      ${movEntradas.length === 0 ? `<p class="muted">Nenhuma entrada registrada ainda.</p>` : `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            ${movEntradas.map((m) => `
              <tr data-mov="${m.id}">
                <td>${fmtBR(m.data)}</td>
                <td>${escapeHtml(m.descricao)}</td>
                <td class="num ok">+${brl(m.valor)}</td>
                <td class="actions"><button class="btn sm danger" data-action="rm-mov">×</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`}
    </section>
  `;

  document.getElementById("add-caixa").addEventListener("click", () => {
    const f = document.getElementById("form-caixa");
    f.style.display = f.style.display === "none" ? "grid" : "none";
  });
  document.getElementById("form-caixa").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local = String(fd.get("local") || "").trim();
    const valor = Number(fd.get("valor") || 0);
    if (!local) return;
    state.caixa.push({ id: uid(), local, valor });
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
    tr.querySelector("[data-action=remover]")?.addEventListener("click", () => {
      if (!confirm("Remover esse local?")) return;
      state.caixa = state.caixa.filter((x) => x.id !== id);
      saveState(); toast("Local removido"); renderAll();
    });
  });

  document.querySelectorAll("#caixa tr[data-mov]").forEach((tr) => {
    tr.querySelector("[data-action=rm-mov]").addEventListener("click", () => {
      const id = tr.getAttribute("data-mov");
      state.movimentacoes = state.movimentacoes.filter((m) => m.id !== id);
      saveState(); toast("Entrada removida"); renderAll();
    });
  });
}

/* ---------- RENDER: GASTOS ---------- */

function renderGastos(c) {
  const el = document.getElementById("gastos");
  const todosGastos = state.movimentacoes.filter((m) => m.tipo === "Gasto").sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  // gastos do mês atual de combustível e moto
  const ref = parseISO(state.referencia);
  const noMes = (iso) => {
    const d = parseISO(iso);
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  };
  const totalMes = sum(todosGastos.filter((g) => noMes(g.data)).map((g) => g.valor));
  const limitePessoal = sum(state.categorias.map((c) => c.meta));
  const podeGastar = limitePessoal - totalMes;
  const diasNoMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const hoje = ref.getDate();
  const diasRestantes = Math.max(1, diasNoMes - hoje + 1);
  const podePorDia = Math.max(0, podeGastar / diasRestantes);

  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Tudo que gastei</h2>
          <p class="panel-sub">Linha do tempo de gastos com data e categoria</p>
        </div>
      </div>

      <form id="form-gasto" class="form-grid cols-mov">
        <select name="tipo"><option value="Gasto">Gasto</option></select>
        <select name="categoria" required>${categoriaOptions()}</select>
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="descricao" required placeholder="Descrição (ex: miojo)" maxlength="60" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button class="btn" type="submit">Lançar</button>
      </form>

      <div class="kpi-grid" style="margin-top:14px;">
        <div class="kpi info">
          <h3>Limite mensal</h3>
          <div class="value">${brl(limitePessoal)}</div>
          <div class="sub">Soma das metas de categoria</div>
        </div>
        <div class="kpi warn">
          <h3>Gasto no mês</h3>
          <div class="value neg">${brl(totalMes)}</div>
          <div class="sub">${fmtPct(limitePessoal > 0 ? (totalMes / limitePessoal) * 100 : 0)} do limite</div>
        </div>
        <div class="kpi ok">
          <h3>Pode gastar</h3>
          <div class="value ${podeGastar < 0 ? "neg" : "pos"}">${brl(Math.max(0, podeGastar))}</div>
          <div class="sub">Restante até fim do mês</div>
        </div>
        <div class="kpi">
          <h3>Por dia</h3>
          <div class="value">${brl(podePorDia)}</div>
          <div class="sub">${diasRestantes} dia(s) restantes</div>
        </div>
      </div>

      <div class="alert ${podeGastar < 0 ? "danger" : "ok"}" style="margin-top:8px;">
        <span class="icon">${podeGastar < 0 ? "🚨" : "💡"}</span>
        <div>
          ${podeGastar < 0
            ? `Você passou ${brl(-podeGastar)} do seu limite mensal de ${brl(limitePessoal)}.`
            : `Você gastou <strong>${brl(totalMes)}</strong>, ainda tem <strong>${brl(podeGastar)}</strong>. Pode gastar até <strong>${brl(podePorDia)}/dia</strong> até o fim do mês.`}
        </div>
      </div>
    </section>

    <section class="chart-grid">
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">Combustível & Moto (12 meses)</h2></div>
        <div class="chart-box"><canvas id="chartMoto"></canvas></div>
      </article>
      <article class="panel">
        <div class="panel-head"><h2 class="panel-title">Disponível por dia (mês)</h2></div>
        <div class="chart-box"><canvas id="chartPodeGastar"></canvas></div>
      </article>
    </section>

    <section class="panel">
      <div class="panel-head"><h2 class="panel-title">Histórico</h2></div>
      ${todosGastos.length === 0 ? `<p class="muted">Sem gastos registrados.</p>` : `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            ${todosGastos.slice(0, 80).map((m) => `
              <tr data-mov="${m.id}">
                <td>${fmtBR(m.data)}</td>
                <td><span class="pill">${escapeHtml(m.categoria || "—")}</span></td>
                <td>${escapeHtml(m.descricao)}</td>
                <td class="num neg">−${brl(m.valor)}</td>
                <td class="actions"><button class="btn sm danger" data-action="rm-mov">×</button></td>
              </tr>`).join("")}
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
      valor: Number(fd.get("valor") || 0)
    });
    e.currentTarget.reset();
    e.currentTarget.querySelector("[name=data]").value = state.referencia;
  });

  document.querySelectorAll("#gastos tr[data-mov]").forEach((tr) => {
    tr.querySelector("[data-action=rm-mov]").addEventListener("click", () => {
      const id = tr.getAttribute("data-mov");
      state.movimentacoes = state.movimentacoes.filter((m) => m.id !== id);
      saveState(); toast("Gasto removido"); renderAll();
    });
  });

  renderChartMoto();
  renderChartPodeGastar(limitePessoal);
}

function renderChartMoto() {
  if (typeof Chart === "undefined") return;
  const ref = parseISO(state.referencia);
  const meses = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    meses.push({ y: d.getFullYear(), m: d.getMonth(), label: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}` });
  }
  const isCombustivel = (g) => /combust|gasolina/i.test(g.categoria || "") || /gasolin/i.test(g.descricao || "");
  const isMoto = (g) => /moto|conserto|mecânic|mecanic|oficina/i.test(g.descricao || "");
  const buckets = meses.map((mm) => ({ comb: 0, moto: 0 }));
  state.movimentacoes.filter((m) => m.tipo === "Gasto").forEach((g) => {
    const d = parseISO(g.data);
    const idx = meses.findIndex((mm) => mm.y === d.getFullYear() && mm.m === d.getMonth());
    if (idx === -1) return;
    if (isMoto(g)) buckets[idx].moto += g.valor;
    if (isCombustivel(g)) buckets[idx].comb += g.valor;
  });
  if (charts.chartMoto) charts.chartMoto.destroy();
  charts.chartMoto = new Chart(document.getElementById("chartMoto"), {
    type: "bar",
    data: {
      labels: meses.map((m) => m.label),
      datasets: [
        { label: "Combustível", data: buckets.map((b) => b.comb), backgroundColor: "#ff9800", borderRadius: 6 },
        { label: "Conserto moto", data: buckets.map((b) => b.moto), backgroundColor: "#8d6e63", borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { x: { stacked: false }, y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } }
    }
  });
}

function renderChartPodeGastar(limite) {
  if (typeof Chart === "undefined") return;
  const ref = parseISO(state.referencia);
  const diasNoMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const labels = [];
  const linhaIdeal = [];
  const linhaReal = [];
  let acumulado = 0;
  const idealPorDia = limite / diasNoMes;
  for (let d = 1; d <= diasNoMes; d++) {
    labels.push(String(d).padStart(2, "0"));
    const dia = new Date(ref.getFullYear(), ref.getMonth(), d);
    const iso = toISO(dia);
    const gastoDoDia = sum(state.movimentacoes.filter((m) => m.tipo === "Gasto" && m.data === iso).map((m) => m.valor));
    acumulado += gastoDoDia;
    linhaReal.push(Math.max(0, limite - acumulado));
    linhaIdeal.push(Math.max(0, limite - idealPorDia * d));
  }
  if (charts.chartPodeGastar) charts.chartPodeGastar.destroy();
  charts.chartPodeGastar = new Chart(document.getElementById("chartPodeGastar"), {
    type: "line",
    data: {
      labels,
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

/* ---------- RENDER: META UBER/99 ---------- */

function renderMeta(c) {
  const el = document.getElementById("meta");
  const meta = state.config.metaUberDiaria;

  // Filtra apenas dias úteis do mês de referência
  const ref = parseISO(state.referencia);
  const diasMes = state.uberDias
    .filter((d) => {
      const dt = parseISO(d.data);
      return dt.getMonth() === ref.getMonth() && dt.getFullYear() === ref.getFullYear() && isWeekday(dt);
    })
    .sort((a, b) => a.data.localeCompare(b.data));

  const totalMes = sum(diasMes.map((d) => (d.uber || 0) + (d.app99 || 0)));
  const totalUber = sum(diasMes.map((d) => d.uber || 0));
  const total99 = sum(diasMes.map((d) => d.app99 || 0));
  const diasBatidos = diasMes.filter((d) => (d.uber + d.app99) >= meta).length;
  const lucroAcumulado = sum(diasMes.map((d) => Math.max(0, (d.uber + d.app99) - meta)));
  const deficitAcumulado = sum(diasMes.map((d) => Math.max(0, meta - (d.uber + d.app99))));

  // saldo do dia hoje
  const hoje = state.uberDias.find((d) => d.data === state.referencia);
  const totalHoje = hoje ? (hoje.uber || 0) + (hoje.app99 || 0) : 0;
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

      <form id="form-uber" class="form-grid cols-meta">
        <input name="data" type="date" required value="${state.referencia}" />
        <input name="uber" type="number" min="0" step="0.01" placeholder="Uber" required />
        <input name="app99" type="number" min="0" step="0.01" placeholder="99" required />
        <button class="btn" type="submit">Salvar dia</button>
      </form>
      <p class="hint">Lança o ganho do dia. Se já existir, será atualizado.</p>

      <div class="chart-grid" style="margin-top:14px;">
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title">Por dia (mês atual)</h2></div>
          <div class="chart-box tall"><canvas id="chartMeta"></canvas></div>
        </article>
        <article class="panel tight">
          <div class="panel-head"><h2 class="panel-title">Histórico</h2></div>
          ${diasMes.length === 0 ? `<p class="muted">Nenhum dia registrado neste mês.</p>` : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Dia</th><th>Uber</th><th>99</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                ${diasMes.slice().reverse().map((d) => {
                  const t = (d.uber || 0) + (d.app99 || 0);
                  const dd = t - meta;
                  return `
                    <tr data-id="${d.id}">
                      <td>${fmtBR(d.data)}</td>
                      <td class="num">${brl(d.uber)}</td>
                      <td class="num">${brl(d.app99)}</td>
                      <td class="num"><strong>${brl(t)}</strong></td>
                      <td>${dd >= 0 ? `<span class="badge pago">+${brl(dd)}</span>` : `<span class="badge pendente">−${brl(-dd)}</span>`}</td>
                      <td class="actions"><button class="btn sm danger" data-action="rm-uber">×</button></td>
                    </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>`}
        </article>
      </div>
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
    const existing = state.uberDias.find((d) => d.data === data);
    if (existing) {
      existing.uber = uber; existing.app99 = app99;
    } else {
      state.uberDias.push({ id: uid(), data, uber, app99 });
    }
    saveState(); toast("Dia salvo"); renderAll();
  });

  document.querySelectorAll("#meta tr[data-id]").forEach((tr) => {
    tr.querySelector("[data-action=rm-uber]").addEventListener("click", () => {
      const id = tr.getAttribute("data-id");
      state.uberDias = state.uberDias.filter((x) => x.id !== id);
      saveState(); toast("Dia removido"); renderAll();
    });
  });

  // gráfico
  if (typeof Chart !== "undefined") {
    const labels = diasMes.map((d) => fmtBR(d.data).slice(0, 5));
    if (charts.chartMeta) charts.chartMeta.destroy();
    charts.chartMeta = new Chart(document.getElementById("chartMeta"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Uber", data: diasMes.map((d) => d.uber || 0), backgroundColor: "#000", borderRadius: 4, stack: "g" },
          { label: "99",   data: diasMes.map((d) => d.app99 || 0), backgroundColor: "#ffd400", borderRadius: 4, stack: "g" },
          { label: "Meta", type: "line", data: diasMes.map(() => meta), borderColor: "#2f7d32", borderDash: [4, 4], pointRadius: 0, fill: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { callback: (v) => "R$ " + v } } }
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
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Tipo</th><th>Motivo</th><th>Valor</th><th>Saldo após</th><th></th></tr></thead>
          <tbody>
            ${(() => {
              // calcular saldo progressivo (do mais antigo pro mais novo) e exibir do mais novo pro mais antigo
              const ord = movs.slice().sort((a, b) => (a.data || "").localeCompare(b.data || ""));
              const saldoPorId = {};
              let acc = 0;
              ord.forEach((m) => {
                acc += m.tipo === "deposito" ? (m.valor || 0) : -(m.valor || 0);
                saldoPorId[m.id] = acc;
              });
              return movs.map((m) => `
                <tr data-rmov="${m.id}">
                  <td>${fmtBR(m.data)}</td>
                  <td>${m.tipo === "deposito" ? `<span class="badge pago">Depósito</span>` : `<span class="badge atrasado">Saque</span>`}</td>
                  <td>${escapeHtml(m.descricao || "—")}</td>
                  <td class="num ${m.tipo === "deposito" ? "ok" : "neg"}">${m.tipo === "deposito" ? "+" : "−"}${brl(m.valor)}</td>
                  <td class="num"><strong>${brl(saldoPorId[m.id] || 0)}</strong></td>
                  <td class="actions"><button class="btn sm danger" data-action="rm-rmov">×</button></td>
                </tr>`).join("");
            })()}
          </tbody>
        </table>
      </div>`}
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Gasolina semanal</h2>
          <p class="panel-sub">Registros separados — cálculo de média por semana</p>
        </div>
      </div>
      ${renderGasolina()}
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

  bindGasolina();
}

function renderGasolina() {
  const ref = parseISO(state.referencia);
  const lista = state.gasolina
    .filter((g) => {
      const d = parseISO(g.data);
      return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
    })
    .sort((a, b) => a.data.localeCompare(b.data));

  const porSemana = {};
  lista.forEach((g) => {
    const k = isoWeekKey(parseISO(g.data));
    porSemana[k] = (porSemana[k] || 0) + (g.valor || 0);
  });
  const semanas = Object.entries(porSemana);
  const media = semanas.length ? sum(semanas.map(([, v]) => v)) / semanas.length : 0;
  const totalMes = sum(lista.map((g) => g.valor || 0));

  return `
    <div class="kpi-grid">
      <div class="kpi info">
        <h3>Total no mês</h3>
        <div class="value">${brl(totalMes)}</div>
      </div>
      <div class="kpi">
        <h3>Média por semana</h3>
        <div class="value">${brl(media)}</div>
        <div class="sub">${semanas.length} semana(s) com registro</div>
      </div>
    </div>
    <form id="form-gasolina" class="form-grid cols-gasolina">
      <input name="data" type="date" required value="${state.referencia}" />
      <input name="descricao" placeholder="Descrição (ex: posto Shell)" maxlength="50" />
      <input name="valor" type="number" min="0.01" step="0.01" placeholder="Valor" required />
      <button class="btn" type="submit">Adicionar</button>
    </form>
    ${lista.length === 0 ? `<p class="muted" style="margin-top:8px;">Nenhum abastecimento neste mês.</p>` : `
    <div class="table-wrap" style="margin-top:8px;">
      <table>
        <thead><tr><th>Data</th><th>Semana</th><th>Descrição</th><th>Valor</th><th></th></tr></thead>
        <tbody>
          ${lista.map((g) => `
            <tr data-id="${g.id}">
              <td>${fmtBR(g.data)}</td>
              <td><span class="pill">${isoWeekKey(parseISO(g.data))}</span></td>
              <td>${escapeHtml(g.descricao || "—")}</td>
              <td class="num">${brl(g.valor)}</td>
              <td class="actions"><button class="btn sm danger" data-action="rm-gas">×</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`}
  `;
}

function bindGasolina() {
  document.getElementById("form-gasolina")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    state.gasolina.push({
      id: uid(),
      data: fd.get("data"),
      descricao: String(fd.get("descricao") || "").trim(),
      valor: Number(fd.get("valor") || 0)
    });
    saveState(); toast("Abastecimento registrado"); renderAll();
  });
  document.querySelectorAll("#reserva tr[data-id]").forEach((tr) => {
    tr.querySelector("[data-action=rm-gas]")?.addEventListener("click", () => {
      const id = tr.getAttribute("data-id");
      state.gasolina = state.gasolina.filter((x) => x.id !== id);
      saveState(); renderAll();
    });
  });
}

/* ---------- RENDER: CONFIG / CATEGORIAS ---------- */

function renderConfig() {
  const el = document.getElementById("config");
  el.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Categorias</h2>
          <p class="panel-sub">Cadastre, edite metas, escolha cores. Tudo no seu jeito.</p>
        </div>
      </div>

      <form id="form-categoria" class="form-grid cols-categoria">
        <input name="nome" placeholder="Nome da categoria (ex: Lazer)" required maxlength="40" />
        <input name="meta" type="number" min="0" step="1" placeholder="Meta mensal" required />
        <input name="cor" type="color" value="#2f7d32" />
        <button class="btn" type="submit">Adicionar categoria</button>
      </form>

      <div class="table-wrap" style="margin-top:12px;">
        <table>
          <thead><tr><th>Cor</th><th>Nome</th><th>Meta mensal</th><th></th></tr></thead>
          <tbody>
            ${state.categorias.map((c) => `
              <tr data-id="${c.id}">
                <td><input type="color" data-field="cor" value="${c.cor || "#2f7d32"}" /></td>
                <td><input class="inline-input" data-field="nome" value="${escapeAttr(c.nome)}" /></td>
                <td><input class="inline-input" data-field="meta" type="number" step="1" value="${c.meta}" /></td>
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
      <div class="form-grid cols-categoria">
        <label>
          <span class="label">Dia de fechamento</span>
          <input type="number" id="cfg-fechamento" min="1" max="31" step="1" value="${state.config.fechamentoDia}" />
        </label>
        <label>
          <span class="label">Meta Uber/99 diária</span>
          <input type="number" id="cfg-meta-uber" min="0" step="1" value="${state.config.metaUberDiaria}" />
        </label>
        <label>
          <span class="label">Limpar tudo</span>
          <button class="btn danger" id="reset-all">Resetar dados</button>
        </label>
      </div>
    </section>
  `;

  document.getElementById("form-categoria").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nome = String(fd.get("nome") || "").trim();
    if (!nome) return;
    state.categorias.push({ id: uid(), nome, meta: Number(fd.get("meta") || 0), cor: fd.get("cor") || "#2f7d32" });
    saveState(); toast("Categoria criada"); renderAll();
  });

  document.querySelectorAll("#config tr[data-id]").forEach((tr) => {
    const id = tr.getAttribute("data-id");
    tr.querySelectorAll("[data-field]").forEach((inp) => {
      inp.addEventListener("change", () => {
        const cat = state.categorias.find((c) => c.id === id);
        if (!cat) return;
        const f = inp.getAttribute("data-field");
        cat[f] = f === "meta" ? (Number(inp.value) || 0) : inp.value;
        saveState(); renderAll();
      });
    });
    tr.querySelector("[data-action=rm-cat]").addEventListener("click", () => {
      if (!confirm("Remover essa categoria?")) return;
      state.categorias = state.categorias.filter((c) => c.id !== id);
      saveState(); renderAll();
    });
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
}

/* ---------- HELPERS ---------- */

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(s) { return escapeHtml(s); }

/* ---------- TABS ---------- */

function setupTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
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
  renderMeta(c);
  renderReserva();
  renderConfig();
}

loadState();
renderAll();
setupTabs();
