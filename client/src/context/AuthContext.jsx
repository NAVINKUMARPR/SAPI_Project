import { createContext, useContext, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sapi_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("sapi_token"));

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    const payload = response.data;

    localStorage.setItem("sapi_token", payload.token);
    localStorage.setItem("sapi_user", JSON.stringify(payload.user));

    setToken(payload.token);
    setUser(payload.user);

    return payload.user;
  }

  async function signup(payload) {
    const response = await api.post("/auth/signup", payload);
    const result = response.data;

    localStorage.setItem("sapi_token", result.token);
    localStorage.setItem("sapi_user", JSON.stringify(result.user));

    setToken(result.token);
    setUser(result.user);

    return result.user;
  }

  function logout() {
    localStorage.removeItem("sapi_token");
    localStorage.removeItem("sapi_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
