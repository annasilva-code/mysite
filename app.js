const STORAGE_KEY = "caua_financas_v1";

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
  meta: [
    { dia: "Ontem", data: "07/05", uber: 115.41, n99: 27.75, status: "Superada" },
    { dia: "Hoje", data: "08/05", uber: 23.42, n99: 47.52, status: "Andamento" },
    { dia: "Amanha", data: "09/05", uber: 0, n99: 0, status: "Proxima" }
  ],
  metaDia: 120,
  gastos: [
    { item: "Almoco", valor: 24.0, tipo: "Pessoal" },
    { item: "Garrafao d'agua", valor: 6.49, tipo: "Pessoal" },
    { item: "Din din", valor: 4.0, tipo: "Pessoal" },
    { item: "Miojo", valor: 6.0, tipo: "Pessoal" },
    { item: "iFood", valor: 8.89, tipo: "Pessoal" },
    { item: "Gasolina", valor: 70.0, tipo: "Operacional" }
  ],
  movimentacoes: [],
  limitePessoal: 129,
  regras: [
    "Gasolina separada: nao entra no limite pessoal de R$ 129,00.",
    "Sem incentivo a gasto: apenas registro de despesas informadas.",
    "Din din/lanche so apos lucro positivo.",
    "Foco em juntar R$ 521,95 ate 10/05/2026."
  ]
};

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const sum = (arr) => arr.reduce((acc, x) => acc + x, 0);

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.movimentacoes)) state.movimentacoes = saved.movimentacoes;
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ movimentacoes: state.movimentacoes }));
}

function compute() {
  const caixaBase = sum(state.caixa.map((x) => x.valor));
  const entradas = sum(state.movimentacoes.filter((m) => m.tipo === "Entrada").map((m) => m.valor));
  const gastosLancados = sum(state.movimentacoes.filter((m) => m.tipo === "Gasto").map((m) => m.valor));
  const caixaTotal = caixaBase + entradas - gastosLancados;

  const contasTotal = sum(state.contas.map((x) => x.valor));
  const deficit = contasTotal - caixaTotal;

  const metaRows = state.meta.map((m) => {
    const total = m.uber + m.n99;
    return { ...m, total, diferenca: total - state.metaDia };
  });

  const gastosPessoais = state.gastos.filter((g) => g.tipo === "Pessoal");
  const totalPessoal = sum(gastosPessoais.map((g) => g.valor));
  const combustivel = sum(state.gastos.filter((g) => g.tipo === "Operacional").map((g) => g.valor));
  const usoLimite = (totalPessoal / state.limitePessoal) * 100;
  const aindaDisponivel = state.limitePessoal - totalPessoal;

  const caixaPct = (caixaTotal / contasTotal) * 100;
  const faltaPct = (deficit / contasTotal) * 100;

  return {
    caixaBase,
    entradas,
    gastosLancados,
    caixaTotal,
    contasTotal,
    deficit,
    metaRows,
    saldoCiclo: metaRows[0].diferenca,
    totalPessoal,
    combustivel,
    usoLimite,
    aindaDisponivel,
    totalCiclo: totalPessoal + combustivel,
    caixaPct,
    faltaPct
  };
}

function renderDashboard(c) {
  const el = document.getElementById("dashboard");
  el.innerHTML = `
    <section class="table-wrap">
      <h2>Lancar Entrada / Gasto</h2>
      <form id="mov-form" class="form-grid">
        <select name="tipo" required>
          <option value="Entrada">Entrada</option>
          <option value="Gasto">Gasto</option>
        </select>
        <input name="descricao" required placeholder="Descricao" maxlength="60" />
        <input name="valor" type="number" min="0.01" step="0.01" required placeholder="Valor" />
        <button type="submit">Adicionar</button>
      </form>
      <p class="hint">Isso altera o caixa automaticamente e fica salvo neste navegador.</p>
    </section>

    <div class="grid">
      <article class="card"><h3>Caixa Real Hoje</h3><div class="value">${brl(c.caixaTotal)}</div></article>
      <article class="card"><h3>Contas a Pagar</h3><div class="value">${brl(c.contasTotal)}</div></article>
      <article class="card"><h3>Deficit Atual</h3><div class="value">${brl(c.deficit)}</div></article>
      <article class="card"><h3>Meta por Dia</h3><div class="value">${brl(state.metaDia)}</div></article>
    </div>

    <section class="table-wrap">
      <h2>Movimentacoes Lancadas</h2>
      <table>
        <thead><tr><th>Tipo</th><th>Descricao</th><th>Valor</th><th>Acao</th></tr></thead>
        <tbody>
          ${state.movimentacoes.length ? state.movimentacoes.map((m) => `
            <tr>
              <td>${m.tipo}</td>
              <td>${m.descricao}</td>
              <td>${m.tipo === "Entrada" ? "+" : "-"}${brl(m.valor)}</td>
              <td><button class="btn-danger" data-remove-id="${m.id}">Remover</button></td>
            </tr>
          `).join("") : `<tr><td colspan="4">Sem lancamentos ainda.</td></tr>`}
        </tbody>
      </table>
      <p><strong>Caixa base:</strong> ${brl(c.caixaBase)} | <strong>Entradas:</strong> +${brl(c.entradas)} | <strong>Gastos:</strong> -${brl(c.gastosLancados)}</p>
    </section>

    <section class="progress">
      <h2>Projecao para 10/05/2026</h2>
      <div class="progress-row">
        <div class="progress-head"><span>Caixa Hoje</span><strong>${brl(c.caixaTotal)} (${c.caixaPct.toFixed(1)}%)</strong></div>
        <div class="bar"><div class="fill" style="width:${Math.max(0, Math.min(c.caixaPct, 100))}%"></div></div>
      </div>
      <div class="progress-row">
        <div class="progress-head"><span>Falta Juntar</span><strong>${brl(c.deficit)} (${c.faltaPct.toFixed(1)}%)</strong></div>
        <div class="bar"><div class="fill warn" style="width:${Math.max(0, Math.min(c.faltaPct, 100))}%"></div></div>
      </div>
    </section>
  `;

  const form = document.getElementById("mov-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const tipo = String(formData.get("tipo") || "Entrada");
    const descricao = String(formData.get("descricao") || "").trim();
    const valor = Number(formData.get("valor") || 0);
    if (!descricao || !Number.isFinite(valor) || valor <= 0) return;

    state.movimentacoes.unshift({ id: crypto.randomUUID(), tipo, descricao, valor });
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
}

function badge(status) {
  if (status === "Superada") return '<span class="badge ok">Superada</span>';
  if (status === "Andamento") return '<span class="badge wait">Andamento</span>';
  return '<span class="badge next">Proxima</span>';
}

function renderPlanilha(c) {
  const el = document.getElementById("planilha");
  el.innerHTML = `
    ${table("Caixa Real Hoje", ["Local", "Valor"], state.caixa.map((i) => [i.local, brl(i.valor)]), ["Total base", brl(c.caixaBase)])}
    ${table("Ajuste por Movimentacoes", ["Item", "Valor"], [["Entradas", `+${brl(c.entradas)}`], ["Gastos", `-${brl(c.gastosLancados)}`], ["Caixa atual", brl(c.caixaTotal)]], null)}
    ${table("Contas a Pagar - Vencimento 10/05/2026", ["Despesa", "Vencimento", "Valor", "Prioridade", "Status"], state.contas.map((i) => [i.despesa, i.vencimento, brl(i.valor), i.prioridade, i.status]), ["Total", "", brl(c.contasTotal), "", ""]) }
    ${table("Meta Uber+99 - Ontem/Hoje/Amanha", ["Dia", "Data", "Uber", "99", "Total", "Diferenca", "Status"], c.metaRows.map((i) => [i.dia, i.data, brl(i.uber), brl(i.n99), brl(i.total), `${i.diferenca >= 0 ? "+" : ""}${brl(i.diferenca)}`, i.status]), null)}
    ${table("Controle de Gastos - Ciclo 01/05 a 10/05", ["Item", "Valor", "Tipo"], state.gastos.map((i) => [i.item, brl(i.valor), i.tipo]), ["Total ciclo", brl(c.totalCiclo), ""])}
  `;
}

function renderRegras() {
  const el = document.getElementById("regras");
  el.innerHTML = `
    <section class="table-wrap">
      <h2>Regras Ativas Combinadas</h2>
      <ul>
        ${state.regras.map((r) => `<li>${r}</li>`).join("")}
      </ul>
      <p><strong>Atualizacao:</strong> ${state.atualizadoEm}</p>
    </section>
  `;
}

function table(title, headers, rows, totalRow) {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  const total = totalRow ? `<tr>${totalRow.map((c, i) => i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join("")}</tr>` : "";
  return `
    <section class="table-wrap">
      <h2>${title}</h2>
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}${total}</tbody>
      </table>
    </section>
  `;
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
  const computed = compute();
  renderDashboard(computed);
  renderPlanilha(computed);
  renderRegras();
}

loadState();
renderAll();
setupTabs();
