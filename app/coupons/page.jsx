"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Copy, CheckCircle, Tag, Percent, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/coupons/public");
        setCoupons(res.data.data || []);
      } catch {
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function copyCoupon(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon "${code}" copied successfully!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy coupon");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Badge variant="secondary" className="mb-4">
          <Ticket className="mr-1 h-3 w-3" />
          Deals
        </Badge>
        <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
          Coupon <span className="text-primary">Center</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Save on your next ebook purchase. Copy a coupon code and apply it at checkout.
        </p>
      </motion.div>

      {coupons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12"
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-foreground">No coupons available</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back later for new deals!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon, i) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center text-primary-foreground">
                  <Percent className="mx-auto h-8 w-8 opacity-80" />
                  <p className="mt-2 text-4xl font-bold">{coupon.discountPercent}%</p>
                  <p className="text-sm opacity-90">OFF</p>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-lg font-bold text-foreground tracking-wider">
                      {coupon.code}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCoupon(coupon.code)}
                      className="gap-1"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{coupon.description}</p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {coupon.minPurchaseAmount > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        Min purchase: ${coupon.minPurchaseAmount}
                      </div>
                    )}
                    {coupon.usageLimit && (
                      <div className="flex items-center gap-2">
                        <Ticket className="h-3 w-3" />
                        {coupon.usageLimit - coupon.usedCount} uses remaining
                      </div>
                    )}
                    {coupon.expiresAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground">How to use:</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Copy the code above, then apply it at checkout when purchasing an ebook.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
