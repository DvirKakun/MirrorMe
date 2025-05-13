import React, { createContext, useContext, useState } from "react";
import type { AuthCtx } from "../types/index";

const AuthContext = createContext<AuthCtx | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("dummyToken") || null;
  });

  const login = (t: string) => {
    setToken(t);
    localStorage.setItem("dummyToken", t);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("dummyToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
