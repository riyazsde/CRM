import { createContext, useContext, useEffect, useState } from "react";
import { api, refreshAccessToken, setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    refreshAccessToken()
      .then(data => setUser(data.user))
      .catch(() => setAccessToken(null))
      .finally(() => setBooting(false));
  }, []);

  async function login(email, password) {
    const data = await api("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function signup(name, email, password) {
    const data = await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api("/auth/signout", { method: "POST" }, false);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, booting, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
