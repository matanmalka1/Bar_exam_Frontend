import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setOnUnauthorized } from "../../lib/api";
import * as authApi from "./api";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { clearTokens, setAccessToken } from "./authStorage";
import type { AuthStatus, AuthUser, RegisterRequest } from "./types";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const applyUser = useCallback((u: AuthUser | null) => {
    setUser(u);
    setStatus(u ? "authenticated" : "unauthenticated");
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      applyUser(me);
    } catch {
      clearTokens();
      applyUser(null);
    }
  }, [applyUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      setAccessToken(res.access_token);
      applyUser(res.user);
    },
    [applyUser],
  );

  const register = useCallback(
    async (input: RegisterRequest) => {
      const res = await authApi.register(input);
      setAccessToken(res.access_token);
      applyUser(res.user);
    },
    [applyUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearTokens();
    applyUser(null);
  }, [applyUser]);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearTokens();
      applyUser(null);
    });
    return () => setOnUnauthorized(null);
  }, [applyUser]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const res = await authApi.refresh();
        if (cancelled) return;
        setAccessToken(res.access_token);
        const me = await authApi.getMe();
        if (cancelled) return;
        applyUser(me);
      } catch {
        clearTokens();
        if (!cancelled) applyUser(null);
      }
    };
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refreshMe }),
    [user, status, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
