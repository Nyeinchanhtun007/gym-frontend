import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  Activity,
  RefreshCw,
  Zap,
  LayoutGrid,
  CreditCard,
} from "lucide-react";

export default function AdminDashboard() {
  const token = useAuthStore((state: any) => state.token);
  const user = useAuthStore((state: any) => state.user);
  const [retryCount, setRetryCount] = useState(0);

  const { data: trainers, isLoading: trainersLoading } = useQuery({
    queryKey: ["admin-trainers", retryCount],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/users/trainers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Trainers Fetch Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["admin-plans-stats", retryCount],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/membership-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Plans Fetch Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin-users-stats", retryCount],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Users Fetch Failed");
      return res.json();
    },
    enabled: !!token && user?.role === "ADMIN",
  });

  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useQuery({
    queryKey: ["admin-classes-stats", retryCount],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Classes Fetch Failed");
      return res.json();
    },
    enabled: !!token && user?.role === "ADMIN",
  });

  const handleRefresh = () => {
    setRetryCount((prev) => prev + 1);
    refetchUsers();
    refetchClasses();
  };

  const isLoading =
    usersLoading || classesLoading || trainersLoading || plansLoading;
  const error = usersError || classesError;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            System <span className="text-primary">Command</span>
          </h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-[10px] font-bold">
            Real-Time Sector Diagnostics & Telemetry
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="h-12 px-8 bg-zinc-900 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all flex items-center gap-3 group"
        >
          <RefreshCw
            className={`w-4 h-4 text-primary ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
          />
          Re-Sync Sector
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: users?.meta?.total ?? users?.items?.length ?? 0,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Expert Trainers",
            value: trainers?.meta?.total ?? trainers?.items?.length ?? 0,
            icon: ShieldCheck,
            color: "text-blue-500",
          },
          {
            label: "Active Sessions",
            value: classes?.meta?.total ?? classes?.items?.length ?? 0,
            icon: Activity,
            color: "text-green-500",
          },
          {
            label: "Pricing Tiers",
            value: plans?.length ?? 0,
            icon: CreditCard,
            color: "text-amber-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-all"
          >
            <div
              className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}
            >
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">
              {stat.label}
            </div>
            <div className="text-4xl font-black text-white italic tracking-tighter">
              {isLoading ? "..." : stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
              Diagnostic <span className="text-primary">Log</span>
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                {isLoading ? "Scanning..." : "Uplink Secure"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[11px] leading-relaxed">
              <div className="flex gap-4 text-white/20 mb-1 font-bold">
                <span>[ STATUS ]</span>
                <span className="text-white">ENCRYPTED UPLINK ESTABLISHED</span>
              </div>
              <div className="flex gap-4 text-white/20 mb-1 font-bold">
                <span>[ ROLE ]</span>
                <span className="text-primary uppercase">
                  {user?.role} ACCESS GRANTED
                </span>
              </div>
              <div className="flex gap-4 text-white/20 mb-1 font-bold">
                <span>[ VECTOR ]</span>
                <span className="text-white/60">{user?.email}</span>
              </div>
              <div className="flex gap-4 text-white/20 font-bold">
                <span>[ SIGNAL ]</span>
                <span className={error ? "text-red-500" : "text-green-500"}>
                  {error
                    ? `INTERRUPTED: ${error instanceof Error ? error.message : "UNKNOWN"}`
                    : "STABLE - DATA SYNCED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-default group">
                <Zap className="w-4 h-4 text-primary mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="text-[9px] font-black text-white uppercase tracking-widest">
                  Protocol Velocity
                </div>
                <div className="text-xs text-white/40 font-bold uppercase tracking-tighter mt-1 italic">
                  Optimal Performance
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-default group">
                <LayoutGrid className="w-4 h-4 text-primary mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="text-[9px] font-black text-white uppercase tracking-widest">
                  Architecture Integrity
                </div>
                <div className="text-xs text-white/40 font-bold uppercase tracking-tighter mt-1 italic">
                  Verified 100% Secure
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem]">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 text-center">
            Sector <span className="text-primary">Density</span>
          </h2>

          <div className="space-y-6">
            {[
              {
                label: "Users",
                val: users?.meta?.total || 0,
                max: 200,
                color: "bg-primary",
              },
              {
                label: "Class Capacity",
                val: classes?.meta?.total || 0,
                max: 20,
                color: "bg-white",
              },
              {
                label: "Training Elite",
                val: trainers?.meta?.total || 0,
                max: 50,
                color: "bg-primary",
              },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-white/40">{bar.label}</span>
                  <span className="text-white">
                    {bar.val} / {bar.max}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(bar.val / bar.max) * 100}%` }}
                    className={`h-full ${bar.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 border border-primary/20 rounded-2xl bg-primary/5 text-center">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-relaxed">
              All systems operational. <br /> Standing by for command.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
