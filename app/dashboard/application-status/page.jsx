"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Suspense } from "react";

function ApplicationStatusContent() {
  const searchParams = useSearchParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Payment Successful", {
        description: "Your writer application has been submitted. Please wait for admin review.",
        duration: 6000,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/writer-applications/me");
        setApplication(res.data.data);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 font-serif text-2xl font-bold text-foreground">No Application Found</h2>
              <p className="mt-2 text-center text-muted-foreground">
                You have not submitted a writer application yet.
              </p>
              <Link href="/become-writer" className="mt-6">
                <Button>
                  Become a Writer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      badgeVariant: "secondary",
      title: "Pending Review",
      message: "Your application has been received. An administrator will review your request. Please wait for approval.",
    },
    approved: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      badgeVariant: "success",
      title: "Approved",
      message: "Congratulations! Your application has been approved. You are now a verified writer and can start publishing ebooks.",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      badgeVariant: "destructive",
      title: "Rejected",
      message: application.rejectionReason
        ? `Your application was not approved. Your payment has been refunded.`
        : "Your application was not approved. Your payment has been refunded.",
    },
  };

  const status = statusConfig[application.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-serif text-3xl font-bold text-foreground text-center">Writer Application</h1>
        <p className="mt-2 text-center text-muted-foreground">Track the status of your writer application</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8">
        <Card className="overflow-hidden">
          <div className={`${status.bgColor} p-8 text-center`}>
            <StatusIcon className={`mx-auto h-16 w-16 ${status.color}`} />
            <h2 className={`mt-4 font-serif text-2xl font-bold ${status.color}`}>{status.title}</h2>
            <Badge variant={status.badgeVariant} className="mt-3 text-sm">
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">{status.message}</p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <span className="text-sm font-medium text-muted-foreground">Payment Amount</span>
                <span className="font-semibold text-foreground">${application.paymentAmount?.toFixed(2) || "10.00"}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <span className="text-sm font-medium text-muted-foreground">Submission Date</span>
                <span className="font-semibold text-foreground">
                  {new Date(application.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {application.reviewedAt && (
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <span className="text-sm font-medium text-muted-foreground">Reviewed Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(application.reviewedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {application.refundStatus === "refunded" && (
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <span className="text-sm font-medium text-muted-foreground">Refund Status</span>
                  <Badge variant="success">Refunded</Badge>
                </div>
              )}
            </div>

            {application.status === "rejected" && application.rejectionReason && (
              <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Rejection Feedback</h3>
                <p className="mt-2 text-sm text-muted-foreground">{application.rejectionReason}</p>
              </div>
            )}

            {application.status === "approved" && (
              <div className="mt-8">
                <Link href="/dashboard/writer">
                  <Button className="w-full" size="lg">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Go to Writer Dashboard
                  </Button>
                </Link>
              </div>
            )}
            {application.status === "rejected" && (
              <div className="mt-8">
                <Link href="/become-writer">
                  <Button className="w-full" variant="outline" size="lg">
                    Apply Again
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ApplicationStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ApplicationStatusContent />
    </Suspense>
  );
}
