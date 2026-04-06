import axios from 'axios';

const aiApi = axios.create({ baseURL: 'http://localhost:5001' });

export default aiApi;