import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Chart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="categoria_tamanho_job" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#4F46E5" />
      </BarChart>
    </ResponsiveContainer>
  );
}
