import api from '../utils/api';

export const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/profile', payload);
  return data;
};

export const changePassword = (payload) => api.put('/profile/password', payload);

export const updateSettings = async (payload) => {
  const { data } = await api.put('/profile/settings', payload);
  return data;
};

