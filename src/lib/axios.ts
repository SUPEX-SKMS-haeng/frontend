import axios from 'axios';
import qs from 'qs';

export const axiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => qs.stringify(params, { skipNulls: true }),
});
