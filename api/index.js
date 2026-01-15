import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

// 1. CONFIGURAÇÕES
const PORT = 3001;
const API_KEY = process.env.API_KEY || "driva_test_key_abc123xyz789";

// 2. MIDDLEWARES (Ordem correta)
app.use(cors()); // Libera o navegador primeiro
app.use(express.json()); // Processa JSON depois

// Configuração do Banco de Dados (Ajustado para Docker)
// Se o seu serviço no docker-compose se chama 'db', use 'db' no host
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://user:password@postgres:5432/driva_db",
});

// Middleware de Autenticação (Corrigido para aceitar Bearer ou chave direta)
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const apiKeyHeader = req.headers["x-api-key"]; // Suporte para o Dashboard

  const token = authHeader ? authHeader.split(" ")[1] : apiKeyHeader;

  if (!token || token !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * ==========================================
 * ROTAS
 * ==========================================
 */

app.get("/", (req, res) => {
  res.send("API Driva funcionando 🚀 na porta 3001");
});

// Endpoint simplificado para teste de saúde (Healthcheck)
app.get("/health", (req, res) => {
  res.json({ status: "ok", port: PORT });
});

// GRUPO 1: FONTE (Consumida pelo n8n)
app.get("/v1/enrichments", auth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    const totalResult = await pool.query("SELECT COUNT(*) FROM enrichments_source");
    const total_items = Number(totalResult.rows[0].count);
    const total_pages = Math.ceil(total_items / limit);

    const result = await pool.query(
      "SELECT * FROM enrichments_source ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      meta: { current_page: page, items_per_page: limit, total_items, total_pages },
      data: result.rows
    });
  } catch (error) {
    console.error("Erro /v1/enrichments:", error.message);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// GRUPO 2: ANALYTICS (Consumida pelo Dashboard)
app.get("/analytics/overview", auth, async (req, res) => {
  try {
    const kpiQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status_processamento = 'CONCLUIDO') as total_sucesso,
        AVG(duracao_processamento_minutos) as tempo_medio
      FROM gold_enrichments
    `;

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
    console.error("Erro /analytics/overview:", error.message);
    res.status(500).json({ error: "Erro ao buscar analytics" });
  }
});

// Listagem Paginada Gold
app.get("/analytics/enrichments", auth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let queryBase = "FROM gold_enrichments";
    let params = [];
    if (status) {
      queryBase += ` WHERE status_processamento = $1`;
      params.push(status);
    }

    const totalRes = await pool.query(`SELECT COUNT(*) ${queryBase}`, params);
    const dataQuery = `
      SELECT * ${queryBase} 
      ORDER BY data_atualizacao DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const result = await pool.query(dataQuery, [...params, limit, offset]);

    res.json({
      meta: { total: Number(totalRes.rows[0].count), page, limit },
      data: result.rows
    });
  } catch (error) {
    console.error("Erro /analytics/enrichments:", error.message);
    res.status(500).json({ error: "Erro ao listar enriquecimentos" });
  }
});

// 3. INICIALIZAÇÃO ÚNICA
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});
