import api from './axiosConfig';

export const getCart        = ()                    => api.get('/cart').then(r => r.data);
export const addToCart      = (produceId, quantity) => api.post('/cart', { produceId, quantity }).then(r => r.data);
export const updateCartItem = (produceId, quantity) => api.put(`/cart/${produceId}`, { quantity }).then(r => r.data);
export const removeFromCart = (produceId)           => api.delete(`/cart/${produceId}`).then(r => r.data);
export const clearCart      = ()                    => api.delete('/cart').then(r => r.data);
