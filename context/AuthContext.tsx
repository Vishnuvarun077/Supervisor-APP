import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface Supervisor {
  id: string;
  name: string;
  zone: string;
}

interface AuthContextType {
  signIn: (token: string, user: Supervisor) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  user: Supervisor | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This hook can be used to access the user info
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// This hook will protect routes based on user authentication
function useProtectedRoute(session: string | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!session && segments[0] !== '(auth)' && 
        segments[0] !== 'login' && segments[0] !== 'otp') {
      // Redirect to the login page
      router.replace('/login');
    } else if (session && (segments[0] === '(auth)' || 
               segments[0] === 'login' || segments[0] === 'otp')) {
      // Redirect away from the login/otp pages
      router.replace('/data-table');
    }
  }, [session, segments, router]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<Supervisor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('session');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedSession) {
          setSession(storedSession);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
  }, []);

  useProtectedRoute(session);

  const authContext: AuthContextType = {
    signIn: async (token: string, userData: Supervisor) => {
      try {
        await AsyncStorage.setItem('session', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setSession(token);
        setUser(userData);
      } catch (error) {
        console.error('Error storing auth data:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('session');
        await AsyncStorage.removeItem('user');
        setSession(null);
        setUser(null);
      } catch (error) {
        console.error('Error removing auth data:', error);
        throw error;
      }
    },
    session,
    user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}