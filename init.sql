-- Tabela fonte que a API vai paginar
CREATE TABLE IF NOT EXISTS enrichments_source (
  id TEXT PRIMARY KEY,
  id_workspace TEXT,
  workspace_name TEXT,
  total_contacts INT,
  contact_type TEXT,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Bronze
CREATE TABLE IF NOT EXISTS bronze_enrichments (
  id TEXT PRIMARY KEY,
  payload JSONB,
  dw_ingested_at TIMESTAMP,
  dw_updated_at TIMESTAMP,
  ingestion_run_id TEXT,
  source_page INT
);

-- Gold
CREATE TABLE IF NOT EXISTS gold_enrichments (
  id_enriquecimento TEXT PRIMARY KEY,
  id_workspace TEXT,
  nome_workspace TEXT,
  total_contatos INT,
  tipo_contato TEXT,
  status_processamento TEXT,
  data_criacao TIMESTAMP,
  data_atualizacao TIMESTAMP,
  duracao_processamento_minutos FLOAT,
  tempo_por_contato_minutos FLOAT,
  processamento_sucesso BOOLEAN,
  categoria_tamanho_job TEXT,
  necessita_reprocessamento BOOLEAN,
  data_atualizacao_dw TIMESTAMP
);
