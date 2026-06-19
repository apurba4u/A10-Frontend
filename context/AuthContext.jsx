"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import api from "@/services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/auth/session");
        if (res.data?.data?.user) {
          setUser(res.data.data.user);
          setSession(res.data.data.session);
          checkApplicationStatus();
        } else {
          setUser(null);
          setSession(null);
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

  async function checkApplicationStatus() {
    try {
      const res = await api.get("/writer-applications/me");
      const app = res.data.data;
      if (app && (app.status === "approved" || app.status === "rejected")) {
        const lastChecked = typeof window !== "undefined" ? localStorage.getItem(`app_status_${app.status}`) : null;
        if (lastChecked !== app._id) {
          if (app.status === "approved") {
            toast.success("Your writer application has been approved!", {
              description: "You can now start publishing ebooks.",
              duration: 6000,
            });
          } else if (app.status === "rejected") {
            toast.error("Your writer application was not approved.", {
              description: "Payment has been refunded. Please check your account.",
              duration: 6000,
            });
          }
          if (typeof window !== "undefined") {
            localStorage.setItem(`app_status_${app.status}`, app._id);
          }
        }
      }
    } catch {}
  }

  const signIn = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const userData = res.data?.data?.user;
    if (userData) {
      setUser(userData);
    }
    const sessionRes = await api.get("/auth/session");
    if (sessionRes.data?.data?.user) {
      setUser(sessionRes.data.data.user);
      setSession(sessionRes.data.data.session);
      checkApplicationStatus();
    }
    return res.data;
  };

  const signUp = async (name, email, password, role) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    const userData = res.data?.data?.user;
    if (userData) {
      setUser(userData);
    }
    const sessionRes = await api.get("/auth/session");
    if (sessionRes.data?.data?.user) {
      setUser(sessionRes.data.data.user);
      setSession(sessionRes.data.data.session);
      checkApplicationStatus();
    }
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/session");
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
        setSession(res.data.data.session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/browse",
    });
    if (error) throw new Error(error.message || error.code);

    const res = await api.get("/auth/session");
    if (res.data?.data?.user) {
      setUser(res.data.data.user);
      setSession(res.data.data.session);
      checkApplicationStatus();
    }
    return data;
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
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
