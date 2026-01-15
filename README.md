## Driva - Pipeline de Ingestão & Dashboard de Enriquecimento
Este projeto é uma solução completa de engenharia de dados e desenvolvimento Full Stack para o monitoramento de enriquecimentos de dados. A aplicação contempla uma pipeline de dados em camadas (Bronze e Gold), orquestração de workflows, uma API robusta e um dashboard analítico.

## Visão Geral da Solução
A arquitetura foi desenhada para simular um ambiente real de Data Warehouse e Observabilidade:

Pipeline de Dados (n8n): Orquestra o pooling de 5 minutos, realizando o consumo da API de fonte, tratamento de Rate Limit (429), ingestão na camada Bronze e transformação para a camada Gold.

API (Backend): Desenvolvida para servir tanto como a fonte de dados (simulando milhares de registros com paginação) quanto como o motor analítico que serve o dashboard.

Banco de Dados (PostgreSQL): Armazenamento centralizado com camadas segregadas. O arquivo init.sql garante que a estrutura de tabelas e os dados iniciais (seed) estejam prontos no primeiro boot.

Dashboard (Frontend): Interface para visualização de KPIs (sucesso, tempo médio) e tabelas detalhadas de enriquecimento.

## Como Subir o Ambiente
Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.

Clone o repositório:

git clone https://github.com/luiexe/projeto_driva.git
cd projeto_driva

Inicie os serviços: 

docker-compose up -d

Isso subirá o PostgreSQL (porta 5432), o n8n (porta 5678), a API (porta 3001) e o dashboard (porta 5173).

## Como Importar e Executar Workflows (n8n)
Os workflows estão localizados na pasta /workflows na raiz do projeto.

Acesse o n8n em http://localhost:5678.

Crie um novo workflow e clique no menu (três pontos) -> Import from File.

Importe os arquivos:

Ingestao (Bronze).json (Ingestão via API com Retry/Backoff)

Processamento.json (Transformação e Tradução)

Orquestrador.json (Scheduler de 5 min)

Importante: Configure as credenciais do PostgreSQL no n8n apontando para o host postgres e user, Database e Password = driva.

Ative o workflow Orquestrador para iniciar o pooling automático.

## Exemplos de Chamadas (API)
A API utiliza a chave de autenticação: driva_test_key_abc123xyz789.

### 1. Simulação de Fonte (Enriquecimentos)

curl -X GET "http://localhost:3001/v1/enrichments?page=1&limit=50" \
     -H "Authorization: Bearer driva_test_key_abc123xyz789"

### 2. Analytics Overview (Camada Gold)

curl -X GET "http://localhost:3001/analytics/overview" \
     -H "Authorization: Bearer driva_test_key_abc123xyz789"

### 3. Listagem Gold Paginada

curl -X GET "http://localhost:3001/analytics/enrichments?page=1" \
     -H "Authorization: Bearer driva_test_key_abc123xyz789"

### Estrutura de Dados (Data Warehouse)
Camada Bronze: Tabela enrichments_bronze. Armazena os dados brutos, incluindo dw_ingested_at e dw_updated_at.

Camada Gold: Tabela enriquecimentos_gold. Dados traduzidos para o português, com campos calculados como duracao_processamento_minutos e categoria_tamanho_job.
