export default function KPI({ title, value }) {
  return (
    <div className="p-4 bg-indigo-50 rounded shadow text-center">
      <div className="text-gray-600 font-medium">{title}</div>
      <div className="text-2xl font-bold text-indigo-700">{value}</div>
    </div>
  );
}
