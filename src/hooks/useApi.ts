import { useState, useCallback } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useToast } from '../contexts/ToastContext';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  state: ApiState<T>;
  execute: (config: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
    showToast?: boolean;
  }) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showToast } = useToast();

  const execute = useCallback(async ({
    url,
    method = 'GET',
    data,
    params,
    showToast: shouldShowToast = true,
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: AxiosResponse<T> = await axios({
        method,
        url,
        data,
        params,
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      if (shouldShowToast) {
        showToast('Operation successful', 'success');
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.message || 'An error occurred';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      if (shouldShowToast) {
        showToast(errorMessage, 'error');
      }

      return null;
    }
  }, [showToast]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    state,
    execute,
    reset,
  };
} 