import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,

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
  
  },

};
export const preferencesService = {

  getPreferences: async (): Promise<{ preferences: { schedule: string[][] } }> => {
    const response = await api.get('/preferences/get-preferences');
    return response.data;
  },
  submitPreferences: async (schedule: { day: number; shiftIds: string[] }[]): Promise<any> => {
    const response = await api.post('/preferences/submit', { preferences: schedule });
    return response.data;
  },
   // ✅ Get submission history
   getSubmissionHistory: async (): Promise<any> => {
    const response = await api.get('/preferences/my-submissions');
    return response.data;
  },

  // ✅ Delete submission by ID
  deletePreference: async (
    id: string
  ): Promise<any> => {
    const response = await api.delete(`/preferences/delete/${id}`);
    return response.data;
  },

  // ✅ Clone previous submission
  clonePreference: async (id: string): Promise<any> => {
    const response = await api.post(`/preferences/clone/${id}`);
    return response.data;
  },

  // ✅ Update existing submission
  updatePreference: async (
    id: string,
    schedule: { day: number; shiftIds: number[] }[]
  ): Promise<any> => {
    const response = await api.put(`/preferences/update/${id}`, { preferences: schedule });
    return response.data;
  },

  // ✅ Admin: get all submitted preferences
  getAllPreferences: async (): Promise<any> => {
    const response = await api.get('/preferences/all');
    return response.data;
  },

};
  export const adminService = { 
    toggleSubmissionPeriod: async (
      isOpen: boolean,
      scheduleStartDate?: string,
      scheduleEndDate?: string
    ): Promise<{ isOpen: boolean }> => {
      const body: any = { isOpen };
    
      // אם פותחים – נשלח תאריכים
      if (isOpen && scheduleStartDate && scheduleEndDate) {
        body.scheduleStartDate = scheduleStartDate;
        body.scheduleEndDate = scheduleEndDate;
      }
    
      const response = await api.post('/manage/submission-period', body);
      return response.data;
    },
    getSubmissionStatus: async (): Promise<{
      isOpen: boolean;
      scheduleStartDate?: string;
      scheduleEndDate?: string;
    }> => {
      const response = await api.get('/manage/submission-period');
      return response.data;
    },
    createSchedule: async (): Promise<{
      success: boolean;
      message: string;
      scheduleId: string;
      schedule: Schedule;
    }> => {
      try {
        const response = await api.get('/schedule/createRandom');
        return response.data;
      } catch (error) {
        console.error('❌ Schedule creation failed:', error);
        throw error;
      }
    },
    getAllGeneratedSchedules: async (): Promise<{
      success: boolean;
      schedules: any[];
    }> => {
      const res = await api.get('/schedule/all');
      return res.data;
    },
    convertEmailsToNames: async (schedule: any): Promise<any> => {
      const res = await api.post('/schedule/convert-emails-to-names', { schedule });
      return res.data;
    },
    getUnassignedUsers: async (scheduleId: string) => {
      try {
        // First get unassigned users
        const response = await api.get(`/admin/schedules/${scheduleId}/unassigned-users`);
        
        // Then get their preferences
        const preferencesResponse = await api.get('/preferences/all');
        
        // Combine user data with their preferences
        const usersWithPreferences = response.data.users.map((user: any) => {
          const userPreferences = preferencesResponse.data.preferences.find(
            (p: any) => p.email === user.email
          );
          return {
            ...user,
            preferences: userPreferences?.schedule || []
          };
        });

        return {
          ...response.data,
          users: usersWithPreferences
        };
      } catch (error: any) {
        console.error('Failed to get unassigned users:', error);
        throw new Error(error.response?.data?.message || 'Failed to get unassigned users');
      }
    },
    updateScheduleWithManualAssignments: async (scheduleId: string, data: { schedule: any; unassignedUsers: any[] }) => {
      try {
        const response = await api.put(`/admin/schedules/${scheduleId}/manual-assignments`, data);
        return response.data;
      } catch (error: any) {
        console.error('Failed to update schedule:', error);
        throw new Error(error.response?.data?.message || 'Failed to update schedule');
      }
    },
    getLastSubmittedSchedule: async (): Promise<{
      success: boolean;
      schedule: Schedule | null;
      message?: string;
    }> => {
      try {
        const response = await api.get('/schedule/last-submited');
        return {
          success: true,
          schedule: response.data
        };
      } catch (error: any) {
        console.error('❌ Failed to get last submitted schedule:', error);
        return {
          success: false,
          schedule: null,
          message: error.response?.data?.message || 'Failed to load schedule'
        };
      }
    }
  }


export default api;
