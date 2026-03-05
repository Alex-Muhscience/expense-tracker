import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';
import Input from '../ui/Form/Input';
import Button from '../ui/Button/Button';
import {
  KeyIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../shared/Loading/LoadingSpinner';
import axios from '../../services/api';
import { motion } from 'framer-motion';
import PasswordStrengthMeter from '../shared/PasswordStrengthMeter';
import '../../index.css';

const schema = yup.object().shape({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  newPassword: yup.string()
    .when('$isReset', {
      is: true,
      then: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          'Must contain uppercase, number, and special character'
        )
    }),
  token: yup.string().when('$isReset', {
    is: true,
    then: yup.string().required('Token is required')
  })
});

export default function ForgotPasswordPage() {
  const [mode, setMode] = useState('request'); // 'request' or 'reset'
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);
  const { isDarkMode } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    context: { isReset: mode === 'reset' }
  });

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [remainingTime]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      if (mode === 'request') {
        if (!captchaToken) {
          throw new Error('Please complete the CAPTCHA');
        }

        const response = await axios.post('/api/auth/forgot-password', {
          email: data.email,
          captcha: captchaToken
        });

        if (response.data.retry_after) {
          setRemainingTime(Math.ceil(response.data.retry_after));
          throw new Error(response.data.message);
        }

        setSuccess(true);
      } else {
        await axios.post('/api/auth/reset-password', {
          token: data.token,
          new_password: data.newPassword
        });
        setSuccess(true);
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
        error.message ||
        'An error occurred. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessView
        email={watch('email')}
        isDarkMode={isDarkMode}
        isReset={mode === 'reset'}
        onRetry={() => {
          setSuccess(false);
          reset();
        }}
      />
    );
  }

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
        <Header mode={mode} isDarkMode={isDarkMode} />

        {apiError && (
          <div className={`p-4 rounded-md ${
            isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
          }`}>
            {apiError}
            {remainingTime > 0 && (
              <div className="mt-2 text-sm">
                Please try again in {remainingTime} seconds
              </div>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {mode === 'request' ? (
            <RequestForm
              register={register}
              errors={errors}
              isDarkMode={isDarkMode}
              captchaToken={captchaToken}
              onCaptchaChange={setCaptchaToken}
            />
          ) : (
            <ResetForm
              register={register}
              errors={errors}
              watch={watch}
              isDarkMode={isDarkMode}
            />
          )}

          <Button
            type="submit"
            disabled={isLoading || (mode === 'request' && remainingTime > 0)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-5 w-5 mr-2" />
                {mode === 'request' ? 'Sending...' : 'Resetting...'}
              </>
            ) : (
              mode === 'request' ? 'Send reset link' : 'Reset password'
            )}
          </Button>
        </form>

        <Footer mode={mode} setMode={setMode} isDarkMode={isDarkMode} />
      </motion.div>
    </div>
  );
}

// Sub-components for better organization
function Header({ mode, isDarkMode }) {
  return (
    <div>
      <div className="flex justify-center">
        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${
          isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
        }`}>
          <ShieldCheckIcon className={`h-6 w-6 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-600'
          }`} />
        </div>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        {mode === 'request' ? 'Forgot your password?' : 'Reset your password'}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
        {mode === 'request'
          ? 'Enter your email to receive a reset link'
          : 'Enter your new password'}
      </p>
    </div>
  );
}

function RequestForm({ register, errors, isDarkMode, captchaToken, onCaptchaChange }) {
  return (
    <div className="space-y-4">
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email address"
        register={register}
        error={errors.email}
        icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
      />

      <div className="pt-2">
        <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          onChange={onCaptchaChange}
          theme={isDarkMode ? 'dark' : 'light'}
        />
        {!captchaToken && errors.captcha && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.captcha.message}
          </p>
        )}
      </div>
    </div>
  );
}

function ResetForm({ register, errors, watch, isDarkMode }) {
  return (
    <div className="space-y-4">
      <Input
        id="token"
        name="token"
        type="text"
        placeholder="Reset token"
        register={register}
        error={errors.token}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />

      <Input
        id="newPassword"
        name="newPassword"
        type="password"
        placeholder="New password"
        register={register}
        error={errors.newPassword}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />

      <PasswordStrengthMeter password={watch('newPassword')} />
    </div>
  );
}

function Footer({ mode, setMode, isDarkMode }) {
  return (
    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
      {mode === 'request' ? (
        <>
          Remember your password?{' '}
          <Link
            to="/login"
            className={`font-medium ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Sign in
          </Link>
        </>
      ) : (
        <button
          onClick={() => setMode('request')}
          className={`font-medium ${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
          }`}
        >
          Back to request form
        </button>
      )}
    </div>
  );
}

function SuccessView({ email, isDarkMode, isReset, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
          <EnvelopeIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          {isReset ? 'Password reset successfully!' : 'Check your email'}
        </h2>
        {!isReset && (
          <>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              We've sent a password reset link to <span className="font-medium">{email}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The link will expire in 1 hour.
            </p>
          </>
        )}
      </div>
      <div className="mt-8 space-y-4">
        <Button
          onClick={() => window.location.href = '/login'}
          className="w-full justify-center"
        >
          Return to sign in
        </Button>
        {!isReset && (
          <button
            onClick={onRetry}
            className={`w-full text-sm text-center font-medium ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            Didn't receive the email? Try again
          </button>
        )}
      </div>
    </motion.div>
  );
}