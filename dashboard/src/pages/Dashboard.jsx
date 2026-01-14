import React, { useEffect, useState } from 'react';
import { getKPIs, getEnrichments, getDistribution } from "../api/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, List } from 'lucide-react';

const Dashboard = () => {
  const [kpis, setKpis] = useState({ total: 0, successRate: 0, avgProcessingTime: 0 });
  const [chartData, setChartData] = useState([]);
  const [enrichments, setEnrichments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [kpiRes, distRes, listRes] = await Promise.all([
          getKPIs(),
          getDistribution(),
          getEnrichments(1, 10)
        ]);

        console.log("Dados recebidos da API:", { kpiRes, distRes, listRes }); // Debug no F12

        setKpis(kpiRes);
        setChartData(distRes || []);
        setEnrichments(listRes?.data || []);
      } catch (err) {
        console.error("Falha ao carregar API:", err);
        setError("Não foi possível carregar os dados da API.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-blue-600">Conectando à API Driva...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold">{error}</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" size={32} /> 
          Monitoramento de Enriquecimento
        </h1>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-blue-500">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Jobs</p>
            <p className="text-4xl font-black text-gray-700">{kpis.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-green-500">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Taxa de Sucesso</p>
            <p className="text-4xl font-black text-green-600">{kpis.successRate}%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-orange-500">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tempo Médio (min)</p>
            <p className="text-4xl font-black text-gray-700">{kpis.avgProcessingTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GRÁFICO */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Distribuição por Tamanho</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="categoria_tamanho_job" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="qtd" barSize={40} radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABELA */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <List size={24} /> Últimos Processamentos (Gold)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-left text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 font-semibold">Workspace</th>
                    <th className="pb-4 font-semibold text-center">Contatos</th>
                    <th className="pb-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrichments.length > 0 ? enrichments.map((item) => (
                    <tr key={item.id_enriquecimento} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 text-sm font-bold text-gray-700">{item.nome_workspace}</td>
                      <td className="py-4 text-sm text-center text-gray-500">{item.total_contatos}</td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          item.status_processamento === 'CONCLUIDO' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-600'
                        }`}>
                          {item.status_processamento}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="py-10 text-center text-gray-400">Nenhum dado na camada Gold.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
