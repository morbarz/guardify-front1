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
import { GeneratedSchedule } from '../types/models';

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
  getAll: async (): Promise<{
    success: boolean;
    data: { name: string; mail: string; role: string }[];
    message?: string;
  }> => {
    try {
      const response = await api.get('/users');
      if (Array.isArray(response.data)) {
        // Handle the current response format
        return {
          success: true,
          data: response.data.map(user => ({
            name: user.name,
            mail: user.mail,
            role: user.role
          }))
        };
      }
      // Handle the new response format
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch users:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.error || 'Failed to fetch users'
      };
    }
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
    deleteSchedule: async (scheduleId: string): Promise<{
      success: boolean;
      message?: string;
    }> => {
      try {
        const response = await api.delete(`/schedule/${scheduleId}`);
        return {
          success: true,
          message: 'Schedule deleted successfully'
        };
      } catch (error: any) {
        console.error('❌ Failed to delete schedule:', error);
        return {
          success: false,
          message: error.response?.data?.error || 'Failed to delete schedule'
        };
      }
    },

    getAllGeneratedSchedules: async (): Promise<{
      success: boolean;
      data: { schedules: GeneratedSchedule[] };
      message?: string;
    }> => {
      try {
        console.log('Fetching all generated schedules...');
        const response = await api.get('/schedule/all');
        console.log('Received response:', response.data);
        
        if (!response.data) {
          throw new Error('No data received in response');
        }

        return {
          success: true,
          data: response.data
        };
      } catch (error) {
        console.error('Error fetching schedules:', error);
        return {
          success: false,
          data: { schedules: [] },
          message: error instanceof Error ? error.message : 'Failed to fetch schedules'
        };
      }
    },

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
    adminChangePassword: async (mail: string, newPassword: string): Promise<any> => {
      const response = await api.post('/manage/change-password', {
        mail,
        newPassword,
      });
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
  }
}
  export const scheduleService = {
    // Get latest schedule
    getLatest: async (): Promise<any> => {
      const response = await api.get('/schedule/latest');
      console.log(response.data)
      return response.data;
    },
  
    // Update a specific shift with new guard
    updateShift: async (
      scheduleId: string,
      dayIndex: number,
      shiftType: string,
      guard: { name: string; email: string }
    ): Promise<any> => {
      const response = await api.put(`/schedule/${scheduleId}/update-shift`, {
        dayIndex,
        shiftType,
        guard,
      });
      return response.data;
    },
    getLatestGeneratedSchedule: async (): Promise<{
      success: boolean;
      data: GeneratedSchedule;
      message?: string;
    }> => {
      try {
        const response = await api.get('/schedule/latest');
        return {
          success: true,
          data: response.data
        };
      } catch (error: any) {
        console.error('❌ Failed to fetch latest schedule:', error);
        return {
          success: false,
          data: null as any,
          message: error.response?.data?.error || 'Failed to fetch schedule'
        };
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
