"use client";

import { useState } from "react";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function CouponInput({ purchaseAmount, onCouponApplied }) {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  async function handleApply() {
    if (!couponCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/coupons/validate", {
        code: couponCode.trim(),
        purchaseAmount,
      });
      const { code, discountAmount, finalPrice } = res.data.data;
      setAppliedCoupon({ code, discountAmount, finalPrice });
      toast.success(`Coupon applied! You save $${discountAmount.toFixed(2)}`);
      onCouponApplied?.({ code, discountAmount, finalPrice });
    } catch (err) {
      setError(err.message || "Invalid coupon code");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setAppliedCoupon(null);
    setCouponCode("");
    setError("");
    onCouponApplied?.({ code: null, discountAmount: 0, finalPrice: purchaseAmount });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Tag className="h-4 w-4" />
          Coupon Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/5 p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-mono text-sm font-semibold uppercase">
                {appliedCoupon.code}
              </span>
              <span className="text-sm text-muted-foreground">
                &mdash; ${appliedCoupon.discountAmount.toFixed(2)} off
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Try OVI10 for 10% OFF"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              disabled={loading}
            />
            <Button
              onClick={handleApply}
              disabled={loading || !couponCode.trim()}
            >
              {loading ? "Applying..." : "Apply"}
            </Button>
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
