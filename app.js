const STORAGE_KEY = "caua_financas_v2";

const state = {
  atualizadoEm: "08/05/2026 09:25",
  caixa: [
    { local: "Banco Santander", valor: 419.22 },
    { local: "Especie", valor: 25.0 },
    { local: "Saldo Uber", valor: 23.42 },
    { local: "Saldo 99", valor: 72.65 }
  ],
  contas: [
    { despesa: "Cartao tia", vencimento: "10/05/2026", valor: 331.24, prioridade: 1, status: "Pendente" },
    { despesa: "Aluguel", vencimento: "10/05/2026", valor: 500.0, prioridade: 2, status: "Pendente" },
    { despesa: "Energia", vencimento: "10/05/2026", valor: 125.0, prioridade: 3, status: "Pendente" },
    { despesa: "Internet", vencimento: "10/05/2026", valor: 31.0, prioridade: 4, status: "Pendente" },
    { despesa: "Dentista", vencimento: "10/05/2026", valor: 75.0, prioridade: 5, status: "Pendente" }
  ],
  categorias: [
    { nome: "Alimentacao", meta: 250 },
    { nome: "Combustivel", meta: 280 },
    { nome: "Lanche", meta: 120 },
    { nome: "Casa", meta: 100 }
  ],
  movimentacoes: [],
  metaDia: 120,
  regras: [
    "Registrar entradas e gastos diariamente.",
    "Combustivel e gastos pessoais por categoria com meta propria.",
    "Acompanhar quanto ainda pode gastar por categoria.",
    "Objetivo: reduzir deficit ate 10/05/2026."
  ]
};

let pieChart;
let barChart;

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const sum = (arr) => arr.reduce((acc, x) => acc + x, 0);

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.movimentacoes)) state.movimentacoes = saved.movimentacoes;
    if (Array.isArray(saved.categorias)) state.categorias = saved.categorias;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    movimentacoes: state.movimentacoes,
    categorias: state.categorias
  }));
}

function compute() {
  const caixaBase = sum(state.caixa.map((x) => x.valor));
  const entradas = sum(state.movimentacoes.filter((m) => m.tipo === "Entrada").map((m) => m.valor));
  const gastos = sum(state.movimentacoes.filter((m) => m.tipo === "Gasto").map((m) => m.valor));
  const caixaAtual = caixaBase + entradas - gastos;

  const contasTotal = sum(state.contas.map((x) => x.valor));
  const deficit = contasTotal - caixaAtual;

  const gastoPorCategoria = {};
  state.categorias.forEach((c) => { gastoPorCategoria[c.nome] = 0; });
  state.movimentacoes
    .filter((m) => m.tipo === "Gasto")
    .forEach((m) => {
      if (!gastoPorCategoria[m.categoria]) gastoPorCategoria[m.categoria] = 0;
      gastoPorCategoria[m.categoria] += m.valor;
    });

  const categoriasResumo = state.categorias.map((c) => {
    const gasto = gastoPorCategoria[c.nome] || 0;
    const restante = c.meta - gasto;
    const percentual = c.meta > 0 ? (gasto / c.meta) * 100 : 0;
    return { ...c, gasto, restante, percentual };
  });

  const totalMetaCategorias = sum(state.categorias.map((c) => c.meta));
  const totalGastoCategorias = sum(categoriasResumo.map((c) => c.gasto));

  return {
    caixaBase,
    entradas,
    gastos,
    caixaAtual,
    contasTotal,
    deficit,
    categoriasResumo,
    totalMetaCategorias,
    totalGastoCategorias
  };
}

function renderDashboard(c) {
  const categoryOptions = state.categorias.map((x) => `<option value="${x.nome}">${x.nome}</option>`).join("");

  const el = document.getElementById("dashboard");
  el.innerHTML = `
    <section class="table-wrap">
      <h2>Lancar Movimentacao</h2>
      <form id="mov-form" class="form-grid">
        <select name="tipo" id="tipo-select" required>
          <option value="Entrada">Entrada</option>
          <option value="Gasto">Gasto</option>
        </select>
        <select name="categoria" id="categoria-select" required>
          ${categoryOptions}
        </select>
        <input name="descricao" required placeholder="Descricao" maxlength="60" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button type="submit">Adicionar</button>
      </form>
      <p class="hint">Categoria so conta para Gasto. Entrada soma direto no caixa.</p>
    </section>

    <section class="table-wrap">
      <h2>Meta por Categoria</h2>
      <form id="meta-form" class="form-grid form-grid-meta">
        <select name="categoriaMeta" required>${categoryOptions}</select>
        <input name="novoLimite" type="number" min="1" step="0.01" required placeholder="Nova meta" />
        <button type="submit">Atualizar meta</button>
      </form>
    </section>

    <div class="grid">
      <article class="card"><h3>Caixa Atual</h3><div class="value">${brl(c.caixaAtual)}</div></article>
      <article class="card"><h3>Entradas</h3><div class="value">+${brl(c.entradas)}</div></article>
      <article class="card"><h3>Gastos</h3><div class="value">-${brl(c.gastos)}</div></article>
      <article class="card"><h3>Falta p/ contas</h3><div class="value">${brl(c.deficit)}</div></article>
    </div>

    <section class="table-wrap">
      <h2>Controle por Categoria (meta x gasto)</h2>
      <table>
        <thead><tr><th>Categoria</th><th>Meta</th><th>Gasto</th><th>Pode gastar</th><th>% usado</th></tr></thead>
        <tbody>
          ${c.categoriasResumo.map((x) => `
            <tr>
              <td>${x.nome}</td>
              <td>${brl(x.meta)}</td>
              <td>${brl(x.gasto)}</td>
              <td class="${x.restante < 0 ? "neg" : "ok"}">${brl(x.restante)}</td>
              <td>${x.percentual.toFixed(1)}%</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p><strong>Total metas:</strong> ${brl(c.totalMetaCategorias)} | <strong>Total gasto em categorias:</strong> ${brl(c.totalGastoCategorias)}</p>
    </section>

    <section class="chart-grid">
      <article class="table-wrap"><h2>Pizza - Gastos por Categoria</h2><canvas id="pieChart"></canvas></article>
      <article class="table-wrap"><h2>Barras - Meta x Gasto</h2><canvas id="barChart"></canvas></article>
    </section>

    <section class="table-wrap">
      <h2>Movimentacoes</h2>
      <table>
        <thead><tr><th>Tipo</th><th>Categoria</th><th>Descricao</th><th>Valor</th><th>Acao</th></tr></thead>
        <tbody>
          ${state.movimentacoes.length ? state.movimentacoes.map((m) => `
            <tr>
              <td>${m.tipo}</td>
              <td>${m.tipo === "Entrada" ? "-" : m.categoria}</td>
              <td>${m.descricao}</td>
              <td>${m.tipo === "Entrada" ? "+" : "-"}${brl(m.valor)}</td>
              <td><button class="btn-danger" data-remove-id="${m.id}">Remover</button></td>
            </tr>
          `).join("") : `<tr><td colspan="5">Sem lancamentos ainda.</td></tr>`}
        </tbody>
      </table>
    </section>
  `;

  const form = document.getElementById("mov-form");
  const tipoSelect = document.getElementById("tipo-select");
  const categoriaSelect = document.getElementById("categoria-select");
  const syncCategoria = () => {
    categoriaSelect.disabled = tipoSelect.value === "Entrada";
  };
  syncCategoria();
  tipoSelect.addEventListener("change", syncCategoria);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const tipo = String(fd.get("tipo"));
    const descricao = String(fd.get("descricao") || "").trim();
    const valor = Number(fd.get("valor") || 0);
    const categoria = String(fd.get("categoria") || "");
    if (!descricao || !Number.isFinite(valor) || valor <= 0) return;

    state.movimentacoes.unshift({
      id: crypto.randomUUID(),
      tipo,
      categoria: tipo === "Gasto" ? categoria : "",
      descricao,
      valor
    });
    saveState();
    renderAll();
  });

  const metaForm = document.getElementById("meta-form");
  metaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(metaForm);
    const categoriaMeta = String(fd.get("categoriaMeta") || "");
    const novoLimite = Number(fd.get("novoLimite") || 0);
    if (!categoriaMeta || !Number.isFinite(novoLimite) || novoLimite <= 0) return;
    state.categorias = state.categorias.map((c) => c.nome === categoriaMeta ? { ...c, meta: novoLimite } : c);
    saveState();
    renderAll();
  });

  el.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-remove-id");
      state.movimentacoes = state.movimentacoes.filter((m) => m.id !== id);
      saveState();
      renderAll();
    });
  });

  renderCharts(c);
}

function renderCharts(c) {
  const labels = c.categoriasResumo.map((x) => x.nome);
  const gastos = c.categoriasResumo.map((x) => Number(x.gasto.toFixed(2)));
  const metas = c.categoriasResumo.map((x) => Number(x.meta.toFixed(2)));

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  const pieCtx = document.getElementById("pieChart");
  const barCtx = document.getElementById("barChart");

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: gastos, backgroundColor: ["#4caf50", "#ff9800", "#03a9f4", "#e91e63", "#9c27b0"] }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Meta", data: metas, backgroundColor: "#81c784" },
        { label: "Gasto", data: gastos, backgroundColor: "#ef5350" }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderPlanilha(c) {
  const el = document.getElementById("planilha");
  el.innerHTML = `
    ${table("Caixa Base", ["Local", "Valor"], state.caixa.map((i) => [i.local, brl(i.valor)]), ["Total base", brl(c.caixaBase)])}
    ${table("Entradas e Gastos", ["Item", "Valor"], [["Entradas", `+${brl(c.entradas)}`], ["Gastos", `-${brl(c.gastos)}`], ["Caixa atual", brl(c.caixaAtual)]], null)}
    ${table("Contas a Pagar", ["Despesa", "Vencimento", "Valor", "Prioridade", "Status"], state.contas.map((i) => [i.despesa, i.vencimento, brl(i.valor), i.prioridade, i.status]), ["Total", "", brl(c.contasTotal), "", ""]) }
    ${table("Resumo Categorias", ["Categoria", "Meta", "Gasto", "Pode gastar", "% usado"], c.categoriasResumo.map((x) => [x.nome, brl(x.meta), brl(x.gasto), brl(x.restante), `${x.percentual.toFixed(1)}%`]), null)}
  `;
}

function renderRegras() {
  const el = document.getElementById("regras");
  el.innerHTML = `
    <section class="table-wrap">
      <h2>Regras Ativas</h2>
      <ul>${state.regras.map((r) => `<li>${r}</li>`).join("")}</ul>
      <p><strong>Atualizacao:</strong> ${state.atualizadoEm}</p>
    </section>
  `;
}

function table(title, headers, rows, totalRow) {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  const total = totalRow ? `<tr>${totalRow.map((c, i) => i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join("")}</tr>` : "";
  return `<section class="table-wrap"><h2>${title}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}${total}</tbody></table></section>`;
}

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

function renderAll() {
  const c = compute();
  renderDashboard(c);
  renderPlanilha(c);
  renderRegras();
}

loadState();
renderAll();
setupTabs();
