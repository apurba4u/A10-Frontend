"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, DollarSign, BarChart3, Users, Shield, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function BecomeWriterPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && (user.role === "writer" || user.role === "admin")) {
      router.push("/dashboard/writer");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function checkApplication() {
      try {
        const res = await api.get("/writer-applications/me");
        if (res.data.data && res.data.data.status === "pending") {
          router.push("/dashboard/application-status");
        }
      } catch {}
    }
    checkApplication();
  }, [user, router]);

  async function handleUpgrade() {
    setProcessing(true);
    try {
      const res = await api.post("/stripe/create-checkout", { type: "verification" });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (authLoading || !user || user.role === "writer" || user.role === "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const benefits = [
    { icon: BookOpen, title: "Publish Ebooks", description: "Share your stories and knowledge with thousands of readers worldwide." },
    { icon: DollarSign, title: "Earn Revenue", description: "Set your own prices and earn money from every sale on the platform." },
    { icon: BarChart3, title: "Track Sales", description: "Monitor your performance with detailed analytics and sales reports." },
    { icon: Users, title: "Build Audience", description: "Grow your reader base and build a loyal following on Fable." },
  ];

  const steps = [
    "Pay the one-time verification fee",
    "Get instant writer access",
    "Create and publish your first ebook",
    "Start earning from sales",
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Badge variant="secondary" className="mb-4">Writer Program</Badge>
        <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
          Become a <span className="text-primary">Writer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Join our community of talented writers. Publish your ebooks, reach readers worldwide, and earn from your creativity.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {benefits.map((benefit, i) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12"
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-center text-primary-foreground">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-8 w-8" />
              <span className="text-sm font-medium uppercase tracking-wider">Writer Verification</span>
            </div>
            <p className="mt-4 text-5xl font-bold">$10</p>
            <p className="mt-1 text-sm opacity-90">One-time fee, lifetime access</p>
          </div>
          <CardContent className="p-8">
            <h3 className="font-serif text-lg font-semibold text-foreground text-center">What you get:</h3>
            <ul className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
            <Button onClick={handleUpgrade} disabled={processing} className="mt-8 w-full" size="lg">
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Pay $10 to Become a Writer
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure payment processed by Stripe. Coupons are not valid for writer verification.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
