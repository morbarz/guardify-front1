// User types
export interface User {
    _id?: string;
    name: string;
    mail: string;
    role: 'guard' | 'bakar' | 'shift_manager'|'admin';
    token?: string;
  }
  
  // Auth types
  export interface LoginCredentials {
    mail: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    name: string;
  }
  
  export interface LoginResponse {
    message: string;
    user: User;
    token: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  // Preference types
  export interface Preference {
    _id?: string;
    mail: string;
    schedule: number[][]; // 14 days, each with 3 shifts (morning, noon, night)
  }
  
  // Schedule types
  export interface ShiftAssignment {
    mail: string;
    name?: string;
  }
  
  export interface DaySchedule {
    day: number;
    morning: ShiftAssignment[];
    noon: ShiftAssignment[];
    night: ShiftAssignment[];
  }
  
  export interface Schedule {
    _id?: string;
    startDate: string;
    endDate: string;
    firstWeek: DaySchedule[];
    secondWeek: DaySchedule[];
    status: 'draft' | 'published' | 'archived';
    createdAt?: string;
    updatedAt?: string;
  }
  
  // API response types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  export interface RegisterResponse {
    mail: string;
    name: string;
    password: string;
    role:string;
    id:string
  }
  // Shift types
  export type ShiftType = 'morning' | 'noon' | 'night';
  export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;