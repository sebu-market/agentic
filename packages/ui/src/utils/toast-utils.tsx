// toast-utils.ts
import { useToast } from '@/hooks/use-toast';

let toast: (params: { title: string; description?: string; variant?: string }) => void;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast: internalToast } = useToast();

  toast = internalToast; // Set the toast function for global use

  return <>{children}</>;
};

export const showToast = (params: { title: string; description?: string; variant?: string }) => {
  if (toast) {
    toast(params);
  } else {
    console.warn('Toast is not initialized');
  }
};