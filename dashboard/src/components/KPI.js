export default function KPI({ title, value }) {
  return (
    <div className="p-4 bg-gray-100 rounded shadow text-center">
      <div className="text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
