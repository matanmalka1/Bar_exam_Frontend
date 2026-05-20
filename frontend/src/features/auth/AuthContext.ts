import { createContext } from "react";
import type { AuthStatus, AuthUser } from "./types";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
