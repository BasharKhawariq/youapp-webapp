import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://techtest.youapp.ai/',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
