import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  X,
  Copy,
  Check,
  Smartphone,
  Building2,
  Landmark,
  ImagePlus,
  Trash2,
} from "lucide-react";
import TacticalSelect from "@/components/ui/TacticalSelect";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [copiedField, setCopiedField] = useState("");
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("KBZ Pay");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPaymentProof(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPaymentProof(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const paymentMethods = [
    {
      name: "KBZ Pay",
      holder: "YGN GYM",
      number: "09969675052",
      icon: Smartphone,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500/20",
      bgColor: "bg-blue-500/5",
      textColor: "text-blue-400",
    },
    {
      name: "AYA Bank Acc",
      holder: "YGN GYM",
      number: "20001849796",
      icon: Building2,
      color: "from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/5",
      textColor: "text-emerald-400",
    },
    {
      name: "KBZ Bank Acc",
      holder: "YGN GYM",
      number: "26030106003179501",
      icon: Landmark,
      color: "from-cyan-500 to-cyan-600",
      borderColor: "border-cyan-500/20",
      bgColor: "bg-cyan-500/5",
      textColor: "text-cyan-400",
    },
  ];

  const {
    planName,
    originalPrice,
    autoDiscountAmount,
    autoDiscountCode,
    price,
    billingCycle,
    startDate,
    endDate,
    dailyLimit,
    monthlyLimit,
  } = location.state || {};

  // If no plan is selected, redirect back to memberships
  if (!planName) {
    navigate("/memberships");
    return null;
  }

  // Calculate discounted price
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "PERCENTAGE"
      ? Math.floor(price * (appliedDiscount.value / 100))
      : Math.min(appliedDiscount.value, price)
    : 0;
  
  // Ensure originalPrice has a fallback if missing from state
  const effectiveOriginalPrice = originalPrice || (price + (autoDiscountAmount || 0));
  const finalPrice = price - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch(
        `http://localhost:3000/discounts/validate/${promoCode.trim()}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid promo code");
      }
      const discount = await res.json();

      // Check if discount is applicable to this plan
      if (discount.applicableTo && discount.applicableTo.length > 0) {
        if (!discount.applicableTo.includes(planName.toUpperCase())) {
          throw new Error(`This code is not valid for the ${planName} tier`);
        }
      }

      // Check minimum purchase
      if (discount.minPurchase && price < discount.minPurchase) {
        throw new Error(
          `Minimum purchase of $${discount.minPurchase} required`,
        );
      }

      setAppliedDiscount(discount);
      setPromoCode("");
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoError("");
  };

  const membershipMutation = useMutation({
    mutationFn: async () => {
      if (!payerName || !payerPhone || !paymentProof) {
        throw new Error("Please complete the payment details and upload proof");
      }

      const res = await fetch("http://localhost:3000/payment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          planName,
          originalPrice: effectiveOriginalPrice,
          autoDiscountAmount,
          autoDiscountCode,
          price: finalPrice,
          billingCycle,
          startDate,
          endDate,
          dailyClassLimit: dailyLimit,
          monthlyClassLimit: monthlyLimit,
          payerName,
          payerPhone,
          paymentMethod: selectedMethod,
          promoCode: appliedDiscount?.code,
          discountAmount,
          paymentProof,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit payment request");
      }

      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 5000);
    },
    onError: (error: any) => {
      alert(error.message);
      setIsProcessing(false);
    },
  });

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      membershipMutation.mutate();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              Request <span className="text-primary border-b-2 border-primary">Sent</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Awaiting Admin Verification • Protocol Pending
            </p>
          </div>
          <div className="p-6 glass-card border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="text-xs text-emerald-500/80 leading-relaxed uppercase tracking-widest font-bold">
              Your payment is being reviewed.
            </p>
            <p className="text-[9px] text-white/30 uppercase mt-4 tracking-tighter">
              Once approved, your evolution begins immediately.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container px-6 py-20 mx-auto min-h-screen flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        {/* Order Summary */}
        <div className="space-y-8">
          <div>
            <button
              onClick={() => navigate("/memberships")}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Return to Plans
            </button>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2">
              Payment <span className="text-primary">Portal</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Finalizing Your Tier Acquisition
            </p>
          </div>

          <div className="glass-card border-white/5 rounded-[2rem] p-8 bg-white/[0.02] space-y-6">
            <div className="flex justify-between items-end pb-6 border-b border-white/5">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary block mb-1">
                  Selected Tier
                </span>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">
                  {planName}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black italic">${price}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                  /{billingCycle.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Billing Cycle</span>
                <span className="text-white">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Start Date</span>
                <span className="text-white">
                  {new Date(startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Duration</span>
                <span className="text-white">
                  {billingCycle === "Yearly" ? "1 Year" : "1 Month"}
                </span>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                  Promo Code (Optional)
                </span>
              </div>

              <AnimatePresence mode="wait">
                {appliedDiscount ? (
                  <motion.div
                    key="applied"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="text-xs font-black text-emerald-400 tracking-wider">
                          {appliedDiscount.code}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400/60 block tracking-widest uppercase">
                          {appliedDiscount.type === "PERCENTAGE"
                            ? `${appliedDiscount.value}% Off`
                            : `$${appliedDiscount.value} Off`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyPromo()
                        }
                        placeholder="ENTER CODE"
                        className="flex-1 h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-white font-black italic text-sm outline-none focus:border-primary/50 transition-all placeholder:text-white/10 uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="h-12 px-6 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/60 hover:border-primary/50 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {promoLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {promoError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1"
                      >
                        {promoError}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Total Section */}
            <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white">${price}</span>
              </div>

              {appliedDiscount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-between text-[10px] font-black uppercase tracking-widest"
                >
                  <span className="text-emerald-400">
                    Discount ({appliedDiscount.code})
                  </span>
                  <span className="text-emerald-400">-${discountAmount}</span>
                </motion.div>
              )}

              <div className="flex justify-between items-center bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                  Total Due
                </span>
                <div className="flex items-center gap-3">
                  {appliedDiscount && (
                    <span className="text-sm font-bold text-white/30 line-through">
                      ${price}
                    </span>
                  )}
                  <span className="text-2xl font-black italic text-primary">
                    ${finalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              Secure Encrypted Transaction Protocol Active
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
            Payment <span className="text-primary">Methods</span>
          </h3>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
            Transfer to one of the accounts below and confirm
          </p>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedMethod(method.name)}
                className={`glass-card rounded-2xl p-6 border ${selectedMethod === method.name ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : method.borderColor + " " + method.bgColor} relative overflow-hidden group hover:border-primary/50 cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <method.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-white">
                        {method.name}
                      </h4>
                      <p
                        className={`text-[10px] font-bold ${method.textColor}`}
                      >
                        {method.holder}
                      </p>
                      <p className="text-lg font-black text-white mt-2 tracking-wider font-mono">
                        {method.number}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(method.number, method.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                      copiedField === method.name
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {copiedField === method.name ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              After transferring, confirm your payment
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                  Selected Bank *
                </label>
                <TacticalSelect
                  value={selectedMethod}
                  onChange={setSelectedMethod}
                  options={paymentMethods.map(m => ({ label: m.name, value: m.name }))}
                  placeholder="SELECT YOUR BANK"
                  className="w-full"
                />
              </div>

              <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="YOUR NAME"
                  className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-white font-black italic text-sm outline-none focus:border-primary/50 transition-all placeholder:text-white/10 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="09-XXX-XXX-XXX"
                  className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-white font-black italic text-sm outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>

              {/* Payment Proof Upload */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                  Payment Screenshot *
                </label>
                {paymentProof ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
                    <img
                      src={paymentProof}
                      alt="Payment proof"
                      className="w-full max-h-64 object-contain bg-black/50"
                    />
                    <div className="p-3 flex items-center justify-between bg-white/[0.02]">
                      <span className="text-[10px] font-bold text-white/50 truncate max-w-[200px]">
                        {proofFileName}
                      </span>
                      <button
                        onClick={() => {
                          setPaymentProof(null);
                          setProofFileName("");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center gap-3 w-full h-40 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                  >
                    <ImagePlus className="w-8 h-8 text-white/20 group-hover:text-primary/40 transition-colors" />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-primary/50 transition-colors">
                        Upload Payment Screenshot
                      </p>
                      <p className="text-[9px] font-bold text-white/15 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !payerName || !payerPhone || !paymentProof || !selectedMethod}
            className="w-full h-14 bg-primary text-black font-black uppercase italic tracking-[0.2em] text-[11px] rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed tactical-glow shadow-xl shadow-primary/20"
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <span>Confirm Payment • ${finalPrice}</span>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
