# Painel Financeiro - Caua Ramos

## Como abrir
1. Abra o arquivo `index.html` no navegador.
2. Ou rode um servidor local simples:
   - PowerShell: `python -m http.server 5500`
   - Acesse: `http://localhost:5500`

## Estrutura
- `index.html`: estrutura da pagina.
- `styles.css`: estilos do dashboard/planilha.
- `app.js`: dados, calculos e renderizacao.
- `dados/*.csv`: base em formato de planilha (Excel/Sheets).

## Atualizar dados
- Edite o objeto `state` em `app.js` para atualizar valores do painel.
- Se quiser manter sincronizado com Excel, atualize tambem os CSVs em `dados/`.
