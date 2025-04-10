import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  LoginResponse,
  ApiResponse,
  Preference,
  Schedule
} from '../types';

// Create an axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Keep this for session support
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('Login attempt with credentials:', {
        mail: credentials.mail,
        password: '********'
      });
      
      const response = await api.post<LoginResponse>('/users/login', credentials);
      
      console.log('Login response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      if (!response.data) {
        throw new Error('No data received in login response');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (credentials: RegisterCredentials): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.post('/users/register', credentials);
    return response.data;
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
  }
};

// Preferences services
export const preferencesService = {
  submitPreferences: async (schedule: number[][]): Promise<ApiResponse<Preference>> => {
    const response: AxiosResponse<ApiResponse<Preference>> = await api.post('/preferences', { schedule });
    return response.data;
  },
  
  getPreferences: async (): Promise<ApiResponse<Preference>> => {
    const response: AxiosResponse<ApiResponse<Preference>> = await api.get('/preferences');
    return response.data;
  }
};

// Schedule services
export const scheduleService = {
  getCurrentSchedule: async (): Promise<ApiResponse<Schedule>> => {
    const response: AxiosResponse<ApiResponse<Schedule>> = await api.get('/schedule/current');
    return response.data;
  },
  
  getDraftSchedule: async (): Promise<ApiResponse<Schedule>> => {
    const response: AxiosResponse<ApiResponse<Schedule>> = await api.get('/schedule/draft');
    return response.data;
  }
};

// Admin services (protected routes)
export const adminService = {
  generateSchedule: async (): Promise<ApiResponse<Schedule>> => {
    const response: AxiosResponse<ApiResponse<Schedule>> = await api.post('/schedule/generate');
    return response.data;
  },
  
  toggleSubmissionPeriod: async (isOpen: boolean): Promise<ApiResponse<{ isOpen: boolean }>> => {
    const response: AxiosResponse<ApiResponse<{ isOpen: boolean }>> = await api.post('/manage/submission-period', { isOpen });
    return response.data;
  }
};

export default api;