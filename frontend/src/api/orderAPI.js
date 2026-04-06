import api from './axiosConfig';

export const placeOrder   = (data) => api.post('/orders', data).then(r => r.data);
export const getMyOrders  = ()     => api.get('/orders').then(r => r.data);
export const getOrderById = (id)   => api.get(`/orders/${id}`).then(r => r.data);
export const cancelOrder  = (id)   => api.put(`/orders/${id}/cancel`).then(r => r.data);
export const getFarmerOrders    = ()           => api.get('/orders/farmer/incoming').then(r => r.data);
export const updateOrderStatus  = (id, status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data);