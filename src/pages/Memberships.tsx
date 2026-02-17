import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import { motion } from "framer-motion";

const plans = [
  {
    name: "Initiate",
    price: "$29",
    description:
      "Essential access to world-class facilities during optimal hours.",
    features: [
      "Access to gym (08:00 - 16:00)",
      "Essential equipment arsenal",
      "Locker room & showers",
      "Digital workout tracking",
      "Basic nutritional guide",
    ],
    icon: HeartPulse,
    color: "from-blue-500/20 to-blue-600/20 text-blue-400",
    border: "border-blue-500/20",
  },
  {
    name: "Zenith",
    price: "$59",
    description: "Unlock the full potential of our sanctuary with 24/7 access.",
    features: [
      "24/7 Unrestricted access",
      "All elite training classes",
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
    name: "Titan",
    price: "$99",
    description: "The ultimate evolution package for high-performance living.",
    features: [
      "Personalized training blueprint",
      "Infinite guest access",
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

  const membershipMutation = useMutation({
    mutationFn: async (planName: string) => {
      if (!user) throw new Error("Please log in to acquire a tier");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + 1);

      const res = await fetch("http://localhost:3000/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          type: planName,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: "ACTIVE",
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
    onError: (error) => {
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
              className={`flex-1 flex flex-col relative overflow-hidden glass-card h-full border-t-4 ${plan.border} ${plan.popular ? "scale-105 z-10 shadow-[0_0_50px_rgba(34,211,238,0.1)] shadow-primary/10" : "scale-100 opacity-90"}`}
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
                <div className="flex items-baseline justify-center gap-1 group">
                  <span className="text-3xl font-black text-white group-hover:text-primary transition-colors">
                    {plan.price}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    /cycle
                  </span>
                </div>
                <CardDescription className="mt-4 text-xs leading-relaxed max-w-[200px] mx-auto">
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
                  disabled={membershipMutation.isPending}
                  className={`w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl group ${plan.popular ? "bg-primary text-black hover:bg-primary/90" : "glass hover:bg-white/10"}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {membershipMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Acquire Tier{" "}
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
