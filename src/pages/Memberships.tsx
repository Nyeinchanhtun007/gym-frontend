import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function Memberships() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
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
    retry: 1,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/membership-plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
  });

  const { data: activeDiscounts } = useQuery({
    queryKey: ["active-discounts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/discounts?activeOnly=true");
      if (!res.ok) throw new Error("Failed to fetch discounts");
      return res.json();
    },
  });

  const activeMembership = userData?.memberships?.find(
    (m: any) => m.status === "ACTIVE" || m.status === "PENDING_DOWNGRADE",
  );


  const handleAcquireTier = (planName: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    if (isYearly) {
      endDate.setFullYear(startDate.getFullYear() + 1);
    } else {
      endDate.setMonth(startDate.getMonth() + 1);
    }

    const planData = plans.find((p: any) => p.name === planName);
    const planDiscounts =
      activeDiscounts?.filter(
        (d: any) =>
          d.applicableTo.length === 0 ||
          d.applicableTo.includes(planName.toUpperCase())
      ) || [];
    
    // Find the automatic discount (one without a code or marked as automatic)
    const autoDiscount = planDiscounts.find((d: any) => d.isAutomatic || !d.code);
    const effectiveDiscountValue = autoDiscount?.value ?? 0;
    
    const basePrice = isYearly ? planData?.yearlyPrice : planData?.monthlyPrice;
    const autoDiscountAmount = Math.floor(basePrice * (effectiveDiscountValue / 100));
    const priceAfterAuto = basePrice - autoDiscountAmount;

    navigate("/payment", {
      state: {
        planName,
        originalPrice: basePrice,
        autoDiscountAmount,
        autoDiscountCode: autoDiscount?.name || "Member Early Access",
        price: priceAfterAuto, // This will be the base for promo code calculations
        billingCycle: isYearly ? "Yearly" : "Monthly",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dailyLimit: planData?.dailyClassLimit,
        monthlyLimit: isYearly
          ? planData?.monthlyClassLimit * 12
          : planData?.monthlyClassLimit,
      },
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">
            Syncing Protocol
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 py-10 mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-8"
      >
        <div className="mb-4">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
            Pricing Plans
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter leading-none uppercase">
          Find your <span className="text-primary italic">Perfect</span> plan
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto uppercase tracking-widest font-bold opacity-60">
          Choose the protocol that aligns with your evolution.
        </p>

        {/* Current Membership Status for Logged-in Users */}
        {activeMembership && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 glass-card border-primary/30 max-w-xl mx-auto relative overflow-hidden group rounded-3xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-16 h-16 text-primary" />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1 block">
                  Active Protocol
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {activeMembership.planTier} Tier
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                  {activeMembership.billingCycle} Cycle • Expires{" "}
                  {new Date(activeMembership.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center min-w-[100px]">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 block">
                    Daily
                  </span>
                  <span className="text-base font-black text-white">
                    {activeMembership.dailyClassLimit} Slots
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center min-w-[100px]">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 block">
                    Monthly
                  </span>
                  <span className="text-base font-black text-white">
                    {activeMembership.monthlyClassLimit > 1000
                      ? "∞"
                      : activeMembership.monthlyClassLimit}{" "}
                    Total
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="relative flex items-center p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-full w-fit">
            <motion.div
              layout
              initial={false}
              animate={{ x: isYearly ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-primary rounded-full z-0"
              style={{ left: 4 }}
            />

            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-10 py-3 rounded-full transition-colors duration-200 text-[10px] font-black uppercase tracking-[0.2em] ${!isYearly ? "text-black" : "text-zinc-500 hover:text-white"}`}
            >
              Monthly
            </button>

            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-10 py-3 rounded-full transition-colors duration-200 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isYearly ? "text-black" : "text-zinc-500 hover:text-white"}`}
            >
              Yearly
              <span
                className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-normal ${isYearly ? "bg-black/20 text-black" : "bg-primary/20 text-primary"}`}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plansLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-white/5 rounded-3xl animate-pulse"
              />
            ))
          : plans &&
            plans.map((plan: any, i: number) => {
              const planDiscounts = activeDiscounts?.filter(
                (d: any) =>
                  d.applicableTo.length === 0 ||
                  d.applicableTo.includes(plan.name.toUpperCase())
              ) || [];
              const effectiveDiscount =
                planDiscounts.find((d: any) => d.type === "PERCENTAGE")?.value ?? 0;

              const finalMonthlyPrice =
                plan.monthlyPrice * (1 - effectiveDiscount / 100);
              const finalYearlyPrice =
                plan.yearlyPrice * (1 - effectiveDiscount / 100);
              const isStandard = plan.name.toLowerCase() === "standard";

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex"
                >
                  <Card
                    className={`flex-1 flex flex-col relative overflow-hidden h-full border-none transition-all duration-500 ${
                      isStandard
                        ? "bg-primary text-black scale-[1.02] z-10 shadow-[0_0_50px_rgba(255,10,10,0.1)] rounded-[2rem]"
                        : "bg-zinc-950/40 backdrop-blur-xl text-white rounded-[1.5rem] border border-white/5 hover:border-white/10"
                    }`}
                  >
                    <CardHeader className="text-center pt-8 pb-4">
                      <CardTitle className="text-lg font-black mb-2 tracking-tighter uppercase italic">
                        {plan.name} Tier
                      </CardTitle>
                      <div className="flex flex-col items-center justify-center gap-1 relative h-16">
                        {effectiveDiscount > 0 && (
                          <span
                            className={`text-sm line-through opacity-50 font-normal absolute top-0 ${isStandard ? "text-black" : "text-white"}`}
                          >
                            ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                        )}
                        <div className="flex items-baseline justify-center gap-1 mt-4">
                          <span
                            className={`text-4xl font-black tracking-tighter ${isStandard ? "text-black" : "text-white"}`}
                          >
                            $
                            {isYearly
                              ? Math.floor(finalYearlyPrice)
                              : Math.floor(finalMonthlyPrice)}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest ${isStandard ? "text-black/60" : "text-white/40"}`}
                          >
                            /{isYearly ? "year" : "month"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 px-6 pb-8">
                      <ul className="space-y-3">
                        <li className="flex flex-col items-center text-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1 h-1 rounded-full ${isStandard ? "bg-black" : "bg-primary"}`}
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest italic opacity-80">
                              {plan.dailyClassLimit} Class Per Day
                            </span>
                          </div>
                        </li>
                        <li className="flex flex-col items-center text-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1 h-1 rounded-full ${isStandard ? "bg-black" : "bg-primary"}`}
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest italic opacity-80">
                              {plan.monthlyClassLimit > 900
                                ? "Unlimited Classes"
                                : `${plan.monthlyClassLimit} Classes Per Month`}
                            </span>
                          </div>
                        </li>
                        {plan.features.map((feature: string) => (
                          <li
                            key={feature}
                            className="flex flex-col items-center text-center"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-1 h-1 rounded-full ${isStandard ? "bg-black" : "bg-primary"}`}
                              />
                              <span className="text-[9px] font-black uppercase tracking-widest italic opacity-80">
                                {feature}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pb-8 px-6">
                      <Button
                        onClick={() => handleAcquireTier(plan.name)}
                        disabled={activeMembership?.planTier === plan.name}
                        className={`w-full h-12 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                          isStandard
                            ? "bg-black text-white hover:bg-black/90 shadow-xl"
                            : "bg-primary text-black hover:bg-primary/90 shadow-lg"
                        }`}
                      >
                        {activeMembership?.planTier === plan.name ? (
                          "Protocol Active"
                        ) : (
                          "Subscribe Now"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 text-center p-8 glass rounded-[2rem] border border-white/5 relative overflow-hidden"
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
