import api from './axiosConfig';

export const registerUser = (data) =>
  api.post('/auth/register', data).then((r) => r.data);

export const loginUser = (data) =>
  api.post('/auth/login', data).then((r) => r.data);

export const getProfile = () =>
  api.get('/auth/profile').then((r) => r.data);

export const updateProfile = (data) =>
  api.put('/auth/profile', data).then((r) => r.data);
