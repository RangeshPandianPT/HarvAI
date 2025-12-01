import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { backendService } from '@/services/backendService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to handle auth state changes from mock backend
    const handleAuthChange = (event: CustomEvent) => {
      const { user, type } = event.detail;
      if (type === 'sign-out') {
        setUser(null);
        setSession(null);
      } else if (user) {
        setUser({ id: user.id, email: user.phone_number } as User);
        setSession({ user: { id: user.id, email: user.phone_number } } as Session);
      }
      setLoading(false);
    };

    // Try to get current user from backend service first
    const currentUser = backendService.getCurrentUser();
    
    if (currentUser) {
      // If mock backend has a user, use that
      setUser({ id: currentUser.id, email: currentUser.phone_number } as User);
      setSession({ user: { id: currentUser.id, email: currentUser.phone_number } } as Session);
      setLoading(false);
      
      // Listen for auth state changes
      window.addEventListener('auth-state-change', handleAuthChange as EventListener);
      
      return () => {
        window.removeEventListener('auth-state-change', handleAuthChange as EventListener);
      };
    } else {
      // Fall back to Supabase auth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth state changes
      window.addEventListener('auth-state-change', handleAuthChange as EventListener);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('auth-state-change', handleAuthChange as EventListener);
      };
    }
  }, []);

  const signOut = async () => {
    await backendService.signOut();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};