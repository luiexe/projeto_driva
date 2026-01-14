"use server"

const API_URL = process.env.API_URL || "http://localhost:3000"
const API_KEY = process.env.API_KEY || "driva_test_key_abc123xyz789"

export interface OverviewData {
  total_enriquecimentos: number
  taxa_sucesso: number
  tempo_medio_minutos: number
  total_contatos_processados: number
  distribuicao_categoria: {
    PEQUENO: number
    MEDIO: number
    GRANDE: number
    MUITO_GRANDE: number
  }
  distribuicao_status: {
    CONCLUIDO: number
    EM_PROCESSAMENTO: number
    FALHOU: number
    CANCELADO: number
  }
}

export interface Enrichment {
  id_enriquecimento: string
  nome_workspace: string
  total_contatos: number
  tipo_contato: string
  status_processamento: string
  categoria_tamanho_job: string
  duracao_processamento_minutos: number
  data_criacao: string
}

export interface EnrichmentsResponse {
  meta: {
    current_page: number
    items_per_page: number
    total_items: number
    total_pages: number
  }
  data: Enrichment[]
}

export async function fetchOverview(): Promise<OverviewData | null> {
  try {
    const res = await fetch(`${API_URL}/analytics/overview`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Falha ao carregar dados")
    return res.json()
  } catch (err) {
    console.error("fetchOverview error:", err)
    return null
  }
}

export async function fetchEnrichments(params: {
  page: number
  limit: number
  status?: string
  search?: string
}): Promise<EnrichmentsResponse | null> {
  try {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    })
    if (params.status && params.status !== "all") {
      searchParams.append("status", params.status)
    }
    if (params.search) {
      searchParams.append("search", params.search)
    }

    const res = await fetch(`${API_URL}/analytics/enrichments?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Falha ao carregar dados")
    return res.json()
  } catch (err) {
    console.error("fetchEnrichments error:", err)
    return null
  }
}
