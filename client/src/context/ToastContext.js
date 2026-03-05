import { createContext, useContext } from 'react';


const ToastContext = createContext(1);
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}