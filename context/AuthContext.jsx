"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import api from "@/services/api";
import toast from "react-hot-toast";
import RoleSelectionModal from "@/components/RoleSelectionModal";

const AuthContext = createContext(null);

async function syncSession() {
  const res = await api.get("/auth/session");
  if (res.data?.data?.user) {
    return { user: res.data.data.user, session: res.data.data.session };
  }
  return { user: null, session: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const ba = await authClient.getSession();
        if (ba.data?.session) {
          const synced = await syncSession();
          if (synced.user) {
            setUser(synced.user);
            setSession(synced.session);
            if (!synced.user.hasChosenRole) {
              setShowRoleModal(true);
            }
            checkApplicationStatus();
          }
        }
      } catch {
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
            toast.error("Your writer application was rejected. Check feedback for details.", {
              description: app.rejectionReason || "Payment has been refunded. Please check your account.",
              duration: 8000,
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
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || error.code || "Sign in failed");
    const synced = await syncSession();
    if (synced.user) {
      setUser(synced.user);
      setSession(synced.session);
      if (!synced.user.hasChosenRole) {
        setShowRoleModal(true);
      }
      checkApplicationStatus();
    }
  };

  const signUp = async (name, email, password, role) => {
    const { data, error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message || error.code || "Registration failed");
    if (role && role !== "user") {
      try {
        await api.put("/auth/role", { role });
      } catch {}
    }
    const synced = await syncSession();
    if (synced.user) {
      setUser(synced.user);
      setSession(synced.session);
      checkApplicationStatus();
    }
  };

  const refreshUser = async () => {
    try {
      const synced = await syncSession();
      setUser(synced.user);
      setSession(synced.session);
    } catch {
      setUser(null);
      setSession(null);
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard`,
    });
    if (error) throw new Error(error.message || error.code || "Google sign-in failed");
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
    setSession(null);
  };

  const handleRoleSelected = async (role) => {
    setShowRoleModal(false);
    try {
      await api.put("/auth/role", { role });
    } catch {}
    const synced = await syncSession();
    if (synced.user) {
      setUser(synced.user);
      setSession(synced.session);
    }
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
      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelected} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
