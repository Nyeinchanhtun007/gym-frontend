import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Dumbbell,
  Zap,
  Trophy,
  ShieldCheck,
  HeartPulse,
  Loader2,
} from "lucide-react";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 30,
    yearlyPrice: 300,
    description: "Essential access for consistent fitness evolution.",
    features: [
      "1 Class per day",
      "10 Classes per month",
      "Locker room access",
      "Basic nutritional guide",
      "Community support",
    ],
    dailyLimit: 1,
    monthlyLimit: 10,
    yearlyLimit: 120,
    icon: HeartPulse,
    color: "from-blue-500/20 to-blue-600/20 text-blue-400",
    border: "border-blue-500/20",
  },
  {
    name: "Standard",
    monthlyPrice: 60,
    yearlyPrice: 600,
    dailyLimit: 2,
    monthlyLimit: 25,
    yearlyLimit: 300,
    description: "Multi-session access for high-intensity athletes.",
    features: [
      "2 Classes per day",
      "25 Classes per month",
      "Full locker room amenities",
      "4 Guest passes per month",
      "Priority class reservation",
      "10% Discount on fuel bar",
    ],
    icon: Zap,
    color: "from-primary/20 to-primary/40 text-primary",
    border: "border-primary/40",
    popular: true,
  },
  {
    name: "Premium",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    dailyLimit: 5,
    monthlyLimit: 999,
    yearlyLimit: 9999,
    description: "Unrestricted access for the elite performance seekers.",
    features: [
      "5 Classes per day",
      "Unlimited classes per month",
      "Premium recovery lounge",
      "Daily laundry & private locker",
      "Monthly bio-metric review",
      "Priority global access",
    ],
    icon: Trophy,
    color: "from-amber-500/20 to-amber-600/20 text-amber-500",
    border: "border-amber-500/20",
  },
];

export default function Memberships() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isYearly, setIsYearly] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["user-details", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user details");
      return res.json();
    },
    enabled: !!user,
  });

  const activeMembership = userData?.memberships?.find(
    (m: any) => m.status === "ACTIVE" || m.status === "PENDING_DOWNGRADE",
  );

  if (user && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const membershipMutation = useMutation({
    mutationFn: async (planName: string) => {
      if (!user) throw new Error("Please log in to acquire a tier");

      const startDate = new Date();
      const endDate = new Date();
      if (isYearly) {
        endDate.setFullYear(startDate.getFullYear() + 1);
      } else {
        endDate.setMonth(startDate.getMonth() + 1);
      }

      const res = await fetch("http://localhost:3000/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          planTier: planName,
          billingCycle: isYearly ? "Yearly" : "Monthly",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: "ACTIVE",
          price: isYearly
            ? plans.find((p) => p.name === planName)?.yearlyPrice
            : plans.find((p) => p.name === planName)?.monthlyPrice,
          dailyClassLimit: plans.find((p) => p.name === planName)?.dailyLimit,
          monthlyClassLimit: isYearly
            ? plans.find((p) => p.name === planName)?.yearlyLimit
            : plans.find((p) => p.name === planName)?.monthlyLimit,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to acquire membership");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-membership"] });
      alert("Tier acquired! Your evolution begins now.");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  const handleAcquireTier = (planName: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    membershipMutation.mutate(planName);
  };

  return (
    <div className="container px-6 py-24 mx-auto pb-40">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-24"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-white/5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">
            Secure Your Future
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tighter leading-[0.9]">
          INVEST IN <br />
          <span className="text-neon italic">EXCELLENCE</span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Transparent pricing for those who refuse to compromise on their
          potential. No contracts, just pure results.
        </p>

        {/* Current Membership Status for Logged-in Users */}
        {activeMembership && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 p-8 glass-card border-primary/30 max-w-2xl mx-auto relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-primary" />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">
                  Active Protocol
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
                  {activeMembership.planTier} Tier
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {activeMembership.billingCycle} Cycle • Expires{" "}
                  {new Date(activeMembership.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center px-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">
                    Daily Limit
                  </span>
                  <span className="text-xl font-black text-white">
                    {activeMembership.dailyClassLimit} Classes
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center px-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">
                    Monthly Limit
                  </span>
                  <span className="text-xl font-black text-white">
                    {activeMembership.monthlyClassLimit > 1000
                      ? "∞"
                      : activeMembership.monthlyClassLimit}{" "}
                    Sessions
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Toggle */}
        <div className="mt-16 flex justify-center">
          <div className="relative flex items-center p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl w-fit">
            {/* Sliding Background Indicator */}
            <motion.div
              layout
              initial={false}
              animate={{ x: isYearly ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-primary rounded-xl z-0"
              style={{ left: 4 }}
            />

            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-8 py-3 rounded-xl transition-colors duration-200 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${!isYearly ? "text-black" : "text-zinc-500 hover:text-white"}`}
            >
              Monthly
            </button>

            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-8 py-3 rounded-xl transition-colors duration-200 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isYearly ? "text-black" : "text-zinc-500 hover:text-white"}`}
            >
              Yearly
              <span
                className={`px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-normal transition-colors ${isYearly ? "bg-black/20 text-black" : "bg-primary/10 text-primary"}`}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="flex"
          >
            <Card
              className={`flex-1 flex flex-col relative overflow-hidden glass-card h-full border-t-4 ${plan.border} ${plan.popular ? "scale-105 z-10 shadow-[0_0_50px_oklch(0.48_0.22_25_/_0.1)] shadow-primary/10" : "scale-100 opacity-90"}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-black px-6 py-1 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] z-20 shadow-lg">
                  Dominant Tier
                </div>
              )}

              <CardHeader className="text-center pb-10 border-b border-white/5 bg-white/5">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/10`}
                >
                  <plan.icon className="w-10 h-10" />
                </div>
                <CardTitle className="text-lg font-black mb-3 tracking-tight uppercase">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1 group overflow-hidden h-10">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? "yearly" : "monthly"}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-3xl font-black text-white group-hover:text-primary transition-colors"
                    >
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    /{isYearly ? "year" : "mo"}
                  </span>
                </div>
                {isYearly && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 text-[9px] font-black text-primary/60 tracking-widest uppercase italic"
                  >
                    Best Value: Save $
                    {plan.monthlyPrice * 12 - plan.yearlyPrice}
                  </motion.div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 block">
                      Daily Limit
                    </span>
                    <span className="text-xs font-black text-primary">
                      {plan.dailyLimit} Classes
                    </span>
                  </div>
                  <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 block">
                      Monthly Limit
                    </span>
                    <span className="text-xs font-black text-primary">
                      {isYearly
                        ? plan.yearlyLimit
                        : plan.monthlyLimit >= 999
                          ? "∞"
                          : plan.monthlyLimit}{" "}
                      Sessions
                    </span>
                  </div>
                </div>
                <CardDescription className="mt-6 text-xs leading-relaxed max-w-[200px] mx-auto">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pt-12 px-8 pb-12">
                <ul className="space-y-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-4 text-sm font-medium items-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="opacity-80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-10 px-8 bg-white/2">
                <Button
                  onClick={() => handleAcquireTier(plan.name)}
                  disabled={
                    membershipMutation.isPending ||
                    activeMembership?.planTier === plan.name
                  }
                  className={`w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl group ${plan.popular ? "bg-primary text-black hover:bg-primary/90" : "glass hover:bg-white/10"}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {membershipMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : activeMembership?.planTier === plan.name ? (
                    "Active Tier"
                  ) : (
                    <>
                      {activeMembership ? "Switch Tier" : "Acquire Tier"}{" "}
                      <Dumbbell className="ml-2 w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-32 text-center p-16 glass rounded-[4rem] border border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">
            Corporate Legacies
          </h3>
          <p className="text-muted-foreground mb-8 text-xs md:text-sm max-w-2xl mx-auto">
            Scale your organization's performance. Custom solutions for elite
            teams of 5 or more operatives.
          </p>
          <Button
            variant="link"
            className="text-base font-black text-primary hover:text-primary/80 uppercase tracking-widest p-0 flex items-center gap-4 mx-auto"
          >
            Contact High Command <span className="text-xl">→</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
