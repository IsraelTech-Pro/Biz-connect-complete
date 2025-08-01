import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, token, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if loading is complete and neither user nor token exist
    if (!isLoading && (!user || !token)) {
      setLocation('/auth/login');
    }
  }, [user, token, isLoading, setLocation]);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ktu-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Ensure both user and token exist before rendering protected content
  if (!user || !token) {
    return null; // Will redirect to login via useEffect
  }

  return <>{children}</>;
};