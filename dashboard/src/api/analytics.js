import axios from 'axios';

const API_BASE = 'http://localhost:3000'; // ou o endereço da sua API

export const getKPIs = async () => {
  const res = await axios.get(`${API_BASE}/analytics/kpis`);
  return res.data;
};

export const getDistribution = async () => {
  const res = await axios.get(`${API_BASE}/analytics/distribution`);
  return res.data;
};

export const getEnrichments = async (page = 1, pageSize = 10) => {
  const res = await axios.get(`${API_BASE}/enrichments`, {
    params: { page, pageSize },
  });
  return res.data;
};
