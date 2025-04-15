import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  ApiResponse,
  Preference,
  Schedule,
  RegisterResponse
} from '../types';

const isDev = import.meta.env.DEV;

const baseURL = isDev
  ? ''
  : 'https://guardify.cs.bgu.ac.il';

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/users/login', credentials);
      if (!response.data) {
        throw new Error('No data received in login response');
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      const response: AxiosResponse<RegisterResponse> = await api.post('/users/register', credentials);
      console.log(response.data.message)
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 Logged out and cleared local storage.');
  }
};
export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  givePermission: async (mail: string, role: string): Promise<void> => {
    await api.post('/users/givePermission', { mail, role });
  }
  
};

export default api;
