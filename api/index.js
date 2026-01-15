import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express(); // 1. Primeiro cria o app

// 2. Configura os middlewares (IMPORTANTE: Antes das rotas e do listen)
app.use(cors()); 
app.use(express.json());

const PORT = 3001;
const API_KEY = process.env.API_KEY || "driva_test_key_abc123xyz789";

// Exemplo de uma rota para testar se o CORS está respondendo
app.get("/analytics/overview", (req, res) => {
  res.json({ message: "API funcionando com CORS!" });
});

// 3. Por último, o servidor começa a ouvir
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Configuração do Banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  // Exemplo Docker: postgres://user:password@postgres:5432/driva_db
});

// Middleware de Autenticação
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || header !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/", (req, res) => {
  res.send("API Driva funcionando 🚀");
});

/**
 * ==========================================
 * GRUPO 1: FONTE (Consumida pelo n8n)
 * ==========================================
 */
app.get("/v1/enrichments", auth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    // Simulação de Rate Limit (429)
    if (Math.random() < 0.05) {
      console.log("Simulando erro 429...");
      return res.status(429).json({ error: "Too Many Requests" });
    }

    // Conta total para paginação
    const totalResult = await pool.query("SELECT COUNT(*) FROM enrichments_source");
    const total_items = Number(totalResult.rows[0].count);
    const total_pages = Math.ceil(total_items / limit);

    const result = await pool.query(
      "SELECT * FROM enrichments_source ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      meta: {
        current_page: page,
        items_per_page: limit,
        total_items,
        total_pages
      },
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

/**
 * ==========================================
 * GRUPO 2: ANALYTICS (Consumida pelo Dashboard)
 * Lê da tabela GOLD (gold_enrichments)
 * ==========================================
 */

// 1. Visão Geral (KPIs)
app.get("/analytics/overview", auth, async (req, res) => {
  try {
    // KPI Gerais
    const kpiQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status_processamento = 'CONCLUIDO') as total_sucesso,
        AVG(duracao_processamento_minutos) as tempo_medio
      FROM gold_enrichments
    `;

    // Distribuição por Categoria (Gráfico)
    const distQuery = `
      SELECT categoria_tamanho_job, COUNT(*) as qtd
      FROM gold_enrichments
      GROUP BY categoria_tamanho_job
    `;

    const [kpiResult, distResult] = await Promise.all([
      pool.query(kpiQuery),
      pool.query(distQuery)
    ]);

    const kpis = kpiResult.rows[0];
    const total = Number(kpis.total);
    const sucesso = Number(kpis.total_sucesso);

    res.json({
      total_enriquecimentos: total,
      taxa_sucesso: total > 0 ? ((sucesso / total) * 100).toFixed(2) : 0,
      tempo_medio_minutos: Number(kpis.tempo_medio || 0).toFixed(2),
      distribuicao_categoria: distResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar analytics" });
  }
});

// 2. Listagem Paginada e Filtrável da Gold
app.get("/analytics/enrichments", auth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // Filtro opcional

    let queryBase = "FROM gold_enrichments";
    let params = [];
    let paramIndex = 1;

    // Filtro dinâmico
    if (status) {
      queryBase += ` WHERE status_processamento = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Total para paginação
    const totalRes = await pool.query(`SELECT COUNT(*) ${queryBase}`, params);
    
    // Busca dados
    const dataQuery = `
      SELECT * ${queryBase} 
      ORDER BY data_atualizacao DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await pool.query(dataQuery, [...params, limit, offset]);

    res.json({
      meta: {
        total: Number(totalRes.rows[0].count),
        page,
        limit
      },
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar enriquecimentos" });
  }
});

// 3. (Bônus) Ranking de Workspaces
app.get("/analytics/workspaces/top", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        nome_workspace, 
        COUNT(*) as total_jobs,
        SUM(total_contatos) as volume_contatos
      FROM gold_enrichments
      GROUP BY nome_workspace
      ORDER BY volume_contatos DESC
      LIMIT 5
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar top workspaces" });
  }
});

app.listen(3000, () => {
  console.log("API rodando na porta 3000 🚀");
});
