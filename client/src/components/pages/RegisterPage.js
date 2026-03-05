import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Form/Input';
import Button from '../ui/Button/Button';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../shared/Loading/LoadingSpinner';
import { motion } from 'framer-motion';
import PasswordStrengthMeter from '../shared/PasswordStrengthMeter';
import useAuditLog from '../../hooks/useAuditLog';
import '../../index.css';

// Validation schema
const schema = yup.object().shape({
  name: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      'Must contain uppercase, number, and special character'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { logAction } = useAuditLog();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });

      // Log successful registration
      await logAction('registration', 'New user registered');

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
        error.message ||
        'Failed to register. Please try again.'
      );

      // Log failed registration attempt
      await logAction('registration_failed', `Failed registration attempt for ${data.email}`);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
          }`}>
            <UserIcon className={`h-6 w-6 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Join us to get started
          </p>
        </div>

        {apiError && (
          <div className={`p-4 rounded-md ${
            isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            <div className="flex items-center">
              <ShieldExclamationIcon className="h-5 w-5 mr-2" />
              <span>{apiError}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Full name"
              error={errors.name}
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              {...register('name')}
            />

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              error={errors.email}
              icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              {...register('email')}
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              error={errors.password}
              icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              {...register('password')}
            />
            <PasswordStrengthMeter password={watch('password')} />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm Password"
              error={errors.confirmPassword}
              icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              {...register('confirmPassword')}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-5 w-5 mr-2" />
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className={`font-medium ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
