import axios from "axios";

const API_BASE = "http://localhost:3000"; // ajuste se a API estiver em outro host
const API_KEY = "SUA_API_KEY_AQUI"; // coloque sua API_KEY aqui

// KPIs
export const getKPIs = async () => {
  const res = await axios.get(`${API_BASE}/analytics/overview`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return {
    total: res.data.total_enriquecimentos,
    successRate: res.data.sucesso_percentual.toFixed(2),
    avgProcessingTime: 0 // opcional, ainda não calculado
  };
};

// Lista paginada de enriquecimentos
export const getEnrichments = async (page = 1, pageSize = 10) => {
  const res = await axios.get(`${API_BASE}/v1/enrichments`, {
    params: { page, limit: pageSize },
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  return {
    data: res.data.data,
    total: res.data.meta.total_items,
  };
};

// Distribuição simulada (por enquanto)
export const getDistribution = async () => {
  return [
    { categoria_tamanho_job: "Pequeno", count: 10 },
    { categoria_tamanho_job: "Médio", count: 20 },
    { categoria_tamanho_job: "Grande", count: 5 },
  ];
};
