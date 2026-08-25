import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function loginSuccess(token, userData, memberships) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    if (memberships) localStorage.setItem("memberships", JSON.stringify(memberships));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("memberships");
    setUser(null);
  }

  // single-device MVP: use the first device this user belongs to
  const memberships = JSON.parse(localStorage.getItem("memberships") || "[]");
  const myDevice = memberships[0]?.device || null;
  const myRole = memberships[0]?.role || null;

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, isAuthenticated: !!user, myDevice, myRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
