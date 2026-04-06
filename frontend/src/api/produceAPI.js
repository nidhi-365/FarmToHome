import api from './axiosConfig';

// params: { category, minPrice, maxPrice, search, sort, page, limit }
export const getProduce      = (params) => api.get('/produce', { params }).then(r => r.data);
export const getProduceById  = (id)     => api.get(`/produce/${id}`).then(r => r.data);
export const compareFarmers  = (name)   => api.get('/produce/compare', { params: { name } }).then(r => r.data);
