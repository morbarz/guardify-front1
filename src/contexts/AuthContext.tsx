import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import { User, LoginCredentials, RegisterCredentials, RegisterResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
  
    if (userJson && token) {
      const parsedUser = JSON.parse(userJson);
      setUser({ ...parsedUser, token });
    }
  
    setLoading(false);
  }, []);
  

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      setError(null);
      const { user, token } = await authService.login(credentials);
      setUser(user);
      localStorage.setItem('token', token);
      return user;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    try {
      setError(null);
      const response = await authService.register(credentials);
      if (response.user) {
        return response.user;
      }
      throw new Error('Registration failed');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};