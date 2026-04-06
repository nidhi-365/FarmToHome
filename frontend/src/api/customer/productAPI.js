import api from './axiosConfig';

// params: { category, subCategory, minPrice, maxPrice, isOrganic, search, sort, page, limit }
export const getProducts = (params) =>
  api.get('/products', { params }).then((r) => r.data);

export const getProductById = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);
