export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  date: string;
  type: 'morning' | 'afternoon' | 'night';
  guardId: string;
  status: 'assigned' | 'available' | 'preferred';
  createdAt: string;
  updatedAt: string;
}

export interface ShiftPreference {
  id: string;
  userId: string;
  shiftId: string;
  preference: 'preferred' | 'available' | 'unavailable';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleAssignment {
  id: string;
  scheduleId: string;
  shiftId: string;
  userId: string;
  status: 'assigned' | 'confirmed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 