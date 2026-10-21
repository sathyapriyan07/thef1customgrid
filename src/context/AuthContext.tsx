import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'superadmin' | 'user';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loginAsDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'f1_grid_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            // Check admin_roles table
            const { data: roleData } = await supabase
              .from('admin_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();

            const role = roleData?.role || 'user';
            const authUser: User = {
              id: session.user.id,
              email: session.user.email || 'user@f1gridbuilder.com',
              role: role as 'admin' | 'superadmin' | 'user',
            };
            setUser(authUser);
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
          }
        } catch (err) {
          console.warn('Session check fallback:', err);
        }
      }
      if (mounted) setIsLoading(false);
    }

    checkSession();

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const { data: roleData } = await client
            .from('admin_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const role = roleData?.role || 'user';
          const authUser: User = {
            id: session.user.id,
            email: session.user.email || 'user@f1gridbuilder.com',
            role: role as 'admin' | 'superadmin' | 'user',
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const signInAdmin = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: roleData } = await supabase
            .from('admin_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'superadmin')) {
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'Access denied: your account is not authorized as an administrator.',
            };
          }

          const adminUser: User = {
            id: data.user.id,
            email: data.user.email || email,
            role: roleData.role as 'admin' | 'superadmin',
          };
          setUser(adminUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Login error' };
      }
    }

    // Local / Demo Admin authentication fallback
    if (password === 'admin123456' || email.includes('admin')) {
      const adminUser: User = {
        id: 'admin-usr-01',
        email: email || 'admin@f1gridbuilder.com',
        role: 'admin',
        name: 'Paddock Administrator',
      };
      setUser(adminUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid admin credentials. Use admin@f1gridbuilder.com and password admin123456' };
  };

  const loginAsDemoAdmin = () => {
    const adminUser: User = {
      id: 'admin-usr-01',
      email: 'admin@f1gridbuilder.com',
      role: 'superadmin',
      name: 'FIA Technical Delegate (Admin)',
    };
    setUser(adminUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'superadmin'));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        signInAdmin,
        signOut,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
