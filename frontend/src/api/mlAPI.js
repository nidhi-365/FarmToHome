import api from './axiosConfig';

// items: string[] — e.g. ["potato", "onion", "tomato"]
// returns: [{ name, score, missing }] — top 5
export const getRecipes = (items) =>
  api.post('/ml/recipes', { items }).then(r => r.data);
