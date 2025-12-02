import api from '../utils/api';

export const fetchUsers = async ({ page = 0, size = 10, role, keyword }) => {
  const params = { page, size };
  if (role) params.role = role;
  if (keyword) params.keyword = keyword;
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post('/admin/users', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => api.delete(`/admin/users/${id}`);

