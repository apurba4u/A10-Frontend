"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await authClient.getSession();
        if (data) {
          setSession(data.session);
          setUser(data.user);
        }
      } catch {
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || error.code);
    setUser(data.user);
    setSession(data.session);
    return data;
  };

  const signUp = async (name, email, password) => {
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    if (error) throw new Error(error.message || error.code);
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
