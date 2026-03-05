import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Form/Input';
import Button from '../ui/Button/Button';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../shared/Loading/LoadingSpinner';
import { motion } from 'framer-motion';
import useAuditLog from '../../hooks/useAuditLog';
import '../../index.css';
//import '../../../public/styles/styles.css';
// Validation schema
const schema = yup.object().shape({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  remember: yup.boolean()
});

export default function LoginPage() {
  const { login, trackFailedAttempt } = useAuth();
  const { logAction } = useAuditLog();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [captchaToken, setCaptchaToken] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError: setFormError
  } = useForm({
    resolver: yupResolver(schema)
  });

  const emailValue = watch('email');

  // Handle rate limiting countdown
  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [remainingTime]);

  const onSubmit = async (data) => {
    try {
      if (showCaptcha && !captchaToken) {
        throw new Error('Please complete the CAPTCHA');
      }

      const result = await login({
        email: data.email,
        password: data.password,
        remember: data.remember,
        captcha: showCaptcha ? captchaToken : null
      });

      if (result?.rateLimited) {
        setRemainingTime(result.retryAfter);
        throw new Error(result.message);
      }

      // Log successful login
      await logAction('login', 'Successful login');

      // Redirect to dashboard or intended page
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Track failed attempt
      await trackFailedAttempt(data.email);

      // Check if we need to show CAPTCHA
      if (error.response?.data?.requiresCaptcha) {
        setShowCaptcha(true);
      }

      // Handle rate limiting
      if (error.response?.data?.retryAfter) {
        setRemainingTime(error.response.data.retryAfter);
      }

      setFormError('root', {
        type: 'manual',
        message: error.response?.data?.message ||
                error.message ||
                'Failed to login. Please try again.'
      });

      // Log failed attempt
      await logAction('login_failed', `Failed login attempt for ${data.email}`);
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
            <LockClosedIcon className={`h-6 w-6' ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Enter your credentials to continue
          </p>
        </div>

        {errors.root && (
          <div className={`p-4 rounded-md ${
            isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            <div className="flex items-center">
              <ShieldExclamationIcon className="h-5 w-5 mr-2" />
              <span>{errors.root.message}</span>
            </div>
            {remainingTime > 0 && (
              <div className="mt-2 text-sm">
                Please try again in {remainingTime} seconds
              </div>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              error={errors.email}
              icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              disabled={remainingTime > 0}
              {...register('email')}
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              error={errors.password}
              icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              disabled={remainingTime > 0}
              {...register('password')}
            />
          </div>

          {showCaptcha && (
            <div className="pt-2">
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                theme={isDarkMode ? 'dark' : 'light'}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className={`h-4 w-4 rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600'
                    : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                }`}
                {...register('remember')}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className={`font-medium ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || remainingTime > 0}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className={`font-medium ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}