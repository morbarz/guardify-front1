import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ObjectSchema } from 'yup';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

interface UseFormReturn<T> {
  state: FormState<T>;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ObjectSchema<T>
): UseFormReturn<T> {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const { showToast } = useToast();

  const validateField = useCallback(async (field: keyof T, value: any) => {
    try {
      await validationSchema.validateAt(field as string, { [field]: value });
      return '';
    } catch (error: any) {
      return error.message;
    }
  }, [validationSchema]);

  const handleChange = useCallback((field: keyof T) => (value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      touched: { ...prev.touched, [field]: true },
    }));
  }, []);

  const handleBlur = useCallback((field: keyof T) => async () => {
    const error = await validateField(field, state.values[field]);
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, [state.values, validateField]);

  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void>) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }));
      await validationSchema.validate(state.values, { abortEarly: false });
      await onSubmit(state.values);
      showToast('Form submitted successfully', 'success');
    } catch (error: any) {
      if (error.inner) {
        const errors = error.inner.reduce((acc: any, curr: any) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        setState(prev => ({ ...prev, errors }));
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validationSchema, showToast]);

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));
  }, []);

  return {
    state,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
} 