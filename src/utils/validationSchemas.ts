import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  name: yup.string().required('Name is required'),
  role: yup.string().required('Role is required'),
});

export const shiftPreferenceSchema = yup.object().shape({
  date: yup.date().required('Date is required'),
  shiftType: yup.string().required('Shift type is required'),
  preference: yup.string().required('Preference is required'),
  notes: yup.string().max(500, 'Notes must be less than 500 characters'),
});

export const scheduleSchema = yup.object().shape({
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  name: yup.string().required('Schedule name is required'),
}); 