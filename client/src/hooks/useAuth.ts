import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login as loginThunk, register as registerThunk, logout as logoutAction } from "../store/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, status, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    (email: string, password: string) => dispatch(loginThunk({ email, password })).unwrap(),
    [dispatch]
  );

  const register = useCallback(
    (name: string, email: string, password: string) =>
      dispatch(registerThunk({ name, email, password })).unwrap(),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);

  return {
    user,
    token,
    loading: status === "loading",
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };
}
