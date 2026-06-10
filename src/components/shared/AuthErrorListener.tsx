import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AuthErrorListener = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');

    if (error) {
      let message = errorDescription || 'An authentication error occurred.';

      if (errorCode === 'otp_expired') {
        message = 'Your verification link has expired. Please request a new one.';
      } else if (error === 'access_denied') {
        message = 'Access denied. Please try signing in again.';
      }

      toast.error(message);

      // Clear the hash from the URL so the error doesn't trigger again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return null; // This is a logic-only component
};
