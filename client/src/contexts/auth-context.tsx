import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      } else {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if it's an approval error
        if (response.status === 403 && errorData.code === 'ACCOUNT_NOT_APPROVED') {
          console.warn('Account not approved by admin');
        } else {
          console.warn('Auth token invalid, clearing auth state');
        }
        
        // Clear auth state regardless of error type
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear auth state on error
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const { user: userData, token: authToken } = await response.json();
    
    // Set token first, then user - this ensures immediate authentication state
    localStorage.setItem('authToken', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const register = async (userData: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    
    // Check if account requires approval (new behavior)
    if (result.requiresApproval) {
      // Don't set token or user since they need admin approval
      // Just return the success message to show to user
      throw new Error(result.message);
    }
    
    // Old behavior for already approved accounts (shouldn't happen with new flow)
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      setToken(result.token);
      setUser(result.user);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
