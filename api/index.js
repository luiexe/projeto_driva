import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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
 * Fonte para o n8n — Paginação
 */
app.get("/v1/enrichments", auth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  const totalResult = await pool.query("SELECT COUNT(*) FROM enrichments_source");
  const total_items = Number(totalResult.rows[0].count);
  const total_pages = Math.ceil(total_items / limit);

  // Simulação simples de possível rate-limit
  if (Math.random() < 0.05) {
    return res.status(429).json({ error: "Too Many Requests" });
  }

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
});

/**
 * Analytics Base — Gold
 */
app.get("/analytics/overview", auth, async (req, res) => {
  const total = await pool.query("SELECT COUNT(*) FROM gold_enrichments");
  const sucesso = await pool.query("SELECT COUNT(*) FROM gold_enrichments WHERE processamento_sucesso = true");

  res.json({
    total_enriquecimentos: Number(total.rows[0].count),
    sucesso_percentual: total.rows[0].count > 0
      ? (Number(sucesso.rows[0].count) / Number(total.rows[0].count)) * 100
      : 0
  });
});

app.listen(3000, () => {
  console.log("API rodando na porta 3000 🚀");
});
