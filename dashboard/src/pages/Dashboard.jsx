import React, { useEffect, useState } from 'react';
import { getKPIs, getEnrichments, getDistribution } from './services/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getKPIs, getEnrichments, getDistribution } from "../services/analytics";

const Dashboard = () => {
  const [kpis, setKpis] = useState({ total: 0, successRate: 0, avgProcessingTime: 0 });
  const [chartData, setChartData] = useState([]);
  const [enrichments, setEnrichments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiRes, distRes, listRes] = await Promise.all([
          getKPIs(),
          getDistribution(),
          getEnrichments(1, 10)
        ]);
        setKpis(kpiRes);
        setChartData(distRes);
        setEnrichments(listRes.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center">Carregando dados da Driva...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <LayoutDashboard className="text-blue-600" /> Monitoramento de Enriquecimento
      </h1>

      {/* --- SEÇÃO 1: CARDS DE KPI --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Total de Jobs</p>
          <p className="text-3xl font-bold">{kpis.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium uppercase text-flex items-center gap-1">
             Taxa de Sucesso
          </p>
          <p className="text-3xl font-bold text-green-600">{kpis.successRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Tempo Médio (min)</p>
          <p className="text-3xl font-bold">{kpis.avgProcessingTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- SEÇÃO 2: GRÁFICO DE BARRAS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Distribuição por Tamanho de Job</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="categoria_tamanho_job" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qtd" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- SEÇÃO 3: TABELA DE ENRIQUECIMENTOS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <List size={20} /> Últimos Processamentos (Gold)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Workspace</th>
                  <th className="pb-3 font-medium">Contatos</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Duração</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrichments.map((item) => (
                  <tr key={item.id_enriquecimento} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm font-medium text-gray-700">{item.nome_workspace}</td>
                    <td className="py-4 text-sm text-gray-600">{item.total_contatos}</td>
                    <td className="py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status_processamento === 'CONCLUIDO' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status_processamento}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-500">{item.duracao_processamento_minutos?.toFixed(1)} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
