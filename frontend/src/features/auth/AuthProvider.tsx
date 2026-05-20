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
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./authStorage";
import type { AuthStatus, AuthUser } from "./types";

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
    if (!getAccessToken()) {
      applyUser(null);
      return;
    }
    try {
      const me = await authApi.getMe();
      applyUser(me);
    } catch {
      clearAccessToken();
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

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearAccessToken();
    applyUser(null);
  }, [applyUser]);

  useEffect(() => {
    setOnUnauthorized(() => {
      applyUser(null);
    });
    return () => setOnUnauthorized(null);
  }, [applyUser]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!getAccessToken()) {
        if (!cancelled) applyUser(null);
        return;
      }
      try {
        const me = await authApi.getMe();
        if (!cancelled) applyUser(me);
      } catch {
        clearAccessToken();
        if (!cancelled) applyUser(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout, refreshMe }),
    [user, status, login, logout, refreshMe],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
