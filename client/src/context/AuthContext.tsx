import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types";
import * as authService from "../services/authService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persist = (token: string, nextUser: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authService.login(email, password);
    persist(token, loggedInUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const { token, user: newUser } = await authService.register(name, email, password);
    persist(token, newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
