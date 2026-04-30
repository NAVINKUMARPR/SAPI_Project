import { createContext, useContext, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
const TOKEN_KEY = "sapi_token";
const USER_KEY = "sapi_user";

function getStoredValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function storeAuth(payload, remember) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);
  storage.setItem(TOKEN_KEY, payload.token);
  storage.setItem(USER_KEY, JSON.stringify(payload.user));
}

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredValue(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => getStoredValue(TOKEN_KEY));

  async function login(email, password, options = {}) {
    const response = await api.post("/auth/login", { email, password });
    const payload = response.data;
    const remember = options.remember ?? true;

    storeAuth(payload, remember);
    setToken(payload.token);
    setUser(payload.user);

    return payload.user;
  }

  async function signup(payload) {
    const response = await api.post("/auth/signup", payload);
    const result = response.data;

    storeAuth(result, true);
    setToken(result.token);
    setUser(result.user);

    return result.user;
  }

  function logout() {
    clearStoredAuth();
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
