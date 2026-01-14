import { useEffect, useState } from "react";
import { getKPIs, getDistribution, getEnrichments } from "../api/analytics";
import KPI from "../components/KPI.jsx";
import Chart from "../components/Chart.jsx";
import Table from "../components/Table.jsx";

export default function Dashboard() {
  const [kpis, setKpis] = useState({});
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setKpis(await getKPIs());
      setDistribution(await getDistribution());
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Driva</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPI title="Total Enriquecimentos" value={kpis.total || 0} />
        <KPI title="% Sucesso" value={kpis.successRate || 0} />
        <KPI title="Tempo Médio (min)" value={kpis.avgProcessingTime || 0} />
      </div>

      {/* Gráfico */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Distribuição por Tamanho do Job</h2>
        <Chart data={distribution} />
      </div>

      {/* Tabela */}
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Enriquecimentos</h2>
        <Table
          fetchData={getEnrichments}
          columns={[
            { key: "id_enriquecimento", label: "ID" },
            { key: "nome_workspace", label: "Workspace" },
            { key: "status_processamento", label: "Status" },
            { key: "data_criacao", label: "Criado em" },
          ]}
        />
      </div>
    </div>
  );
}
