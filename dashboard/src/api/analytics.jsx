import axios from "axios";

const API_BASE = "http://localhost:3000"; 
const API_KEY = "driva_test_key_abc123xyz789";

// Configuração padrão do axios para não repetir headers
const api = axios.create({
  baseURL: API_BASE,
  headers: { Authorization: `Bearer ${API_KEY}` },
});

// 1. KPIs Reais da Camada Gold
export const getKPIs = async () => {
  try {
    const res = await api.get("/analytics/overview");
    return {
      total: res.data.total_enriquecimentos,
      successRate: res.data.taxa_sucesso, // Alterado de sucesso_percentual para taxa_sucesso
      avgProcessingTime: res.data.tempo_medio_minutos, // Agora mapeado corretamente
    };
  } catch (error) {
    console.error("Erro ao buscar KPIs:", error);
    return { total: 0, successRate: 0, avgProcessingTime: 0 };
  }
};

// 2. Lista de enriquecimentos PROCESSADOS (Camada Gold)
export const getEnrichments = async (page = 1, pageSize = 10) => {
  try {
    // IMPORTANTE: Mudamos de /v1/enrichments (Fonte) para /analytics/enrichments (Gold)
    const res = await api.get("/analytics/enrichments", {
      params: { page, limit: pageSize },
    });

    return {
      data: res.data.data, // Registros da Gold (já traduzidos)
      total: res.data.meta.total,
    };
  } catch (error) {
    console.error("Erro ao buscar lista Gold:", error);
    return { data: [], total: 0 };
  }
};

// 3. Distribuição REAL por Categoria
export const getDistribution = async () => {
  try {
    const res = await api.get("/analytics/overview");
    // Retorna o array que vem direto do SQL GROUP BY
    return res.data.distribuicao_categoria; 
  } catch (error) {
    console.error("Erro ao buscar distribuição:", error);
    return [];
  }
};

// 4. (Bônus) Top Workspaces
export const getTopWorkspaces = async () => {
  try {
    const res = await api.get("/analytics/workspaces/top");
    return res.data;
  } catch (error) {
    console.error("Erro ao buscar top workspaces:", error);
    return [];
  }
};
