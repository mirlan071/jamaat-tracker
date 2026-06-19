const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const auth = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

export const mosques = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/mosques${q ? '?' + q : ''}`);
  },
  regions: () => request('/mosques/regions'),
  get: (id) => request(`/mosques/${id}`),
  create: (data) => request('/mosques', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/mosques/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/mosques/${id}`, { method: 'DELETE' }),
};

export const jamaats = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/jamaats${q ? '?' + q : ''}`);
  },
  get: (id) => request(`/jamaats/${id}`),
  create: (data) => request('/jamaats', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/jamaats/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/jamaats/${id}`, { method: 'DELETE' }),
  stats: () => request('/jamaats/stats/overview'),
  addMember: (jamaatId, data) => request(`/jamaats/${jamaatId}/members`, { method: 'POST', body: JSON.stringify(data) }),
  deleteMember: (jamaatId, memberId) => request(`/jamaats/${jamaatId}/members/${memberId}`, { method: 'DELETE' }),
};

export const users = {
  list: () => request('/users'),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id, role) => request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
