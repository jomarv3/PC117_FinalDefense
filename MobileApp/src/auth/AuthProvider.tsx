import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, AuthUser, MeResponse, RegisterResponse } from '@/types/api';
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '@/api/auth';
import { clearToken, readToken, saveToken } from '@/auth/storage';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  roleLabel: string | null;
  mobileFeatures: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<MeResponse | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState<string | null>(null);
  const [mobileFeatures, setMobileFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const resetAuth = async () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setRoleLabel(null);
    setMobileFeatures([]);
    await clearToken();
  };

  const applyAuth = async (payload: AuthResponse) => {
    setUser(payload.user);
    setToken(payload.token);
    setRole(payload.role);
    setRoleLabel(payload.role_label);
    setMobileFeatures(payload.mobile_features ?? []);
    await saveToken(payload.token);
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = await readToken();

        if (!storedToken) {
          return;
        }

        const current = await getMe(storedToken);

        if (!mounted) return;

        setUser(current.user);
        setToken(storedToken);
        setRole(current.role);
        setRoleLabel(current.role_label);
        setMobileFeatures(current.mobile_features ?? []);
      } catch {
        await resetAuth();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const payload = await loginRequest(email, password);
    await applyAuth(payload);
    return payload;
  };

  const register = async (name: string, email: string, password: string) => {
    return registerRequest(name, email, password);
  };

  const logout = async () => {
    const currentToken = token;

    try {
      if (currentToken) {
        await logoutRequest(currentToken);
      }
    } catch {
      // clear locally even if the backend call fails
    } finally {
      await resetAuth();
    }
  };

  const refreshMe = async () => {
    if (!token) return null;

    try {
      const current = await getMe(token);
      setUser(current.user);
      setRole(current.role);
      setRoleLabel(current.role_label);
      setMobileFeatures(current.mobile_features ?? []);
      return current;
    } catch {
      await logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        roleLabel,
        mobileFeatures,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
