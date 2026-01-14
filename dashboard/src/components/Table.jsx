import { useState, useEffect } from "react";

export default function Table({ fetchData, columns }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(5);

  const loadData = async (p = page) => {
    const res = await fetchData(p, pageSize);
    setData(res.data);
    setTotal(res.total);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <table className="w-full border-collapse border mb-2">
        <thead className="bg-gray-100">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="border p-2 text-left">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map(col => (
                <td key={col.key} className="border p-2">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-2">
        <button
          disabled={page === 1}
          onClick={() => { setPage(page - 1); loadData(page - 1); }}
          className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="self-center">Page {page} / {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => { setPage(page + 1); loadData(page + 1); }}
          className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
