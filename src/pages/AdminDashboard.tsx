import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  Activity,
  RefreshCw,
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

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative z-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-1 leading-none">
            System <span className="text-primary text-neon">Command</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-[1.5px] bg-primary animate-pulse" />
            <p className="text-white/40 uppercase tracking-[0.3em] text-[8px] font-black">
              SECURE SECTOR ACCESS // LEVEL 4 CLEARANCE
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="h-12 px-8 bg-zinc-950 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:border-primary/50 transition-all flex items-center gap-3 group tactical-glow overflow-hidden"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-primary ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}`}
          />
          Sync Operative Data
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Personnel",
            value: users?.meta?.total ?? users?.items?.length ?? 0,
            icon: Users,
            color: "text-rose-500",
            glow: "shadow-rose-500/20",
            tag: "DB_SYNCED",
            id: "OP-992",
          },
          {
            label: "S-Tier Instructors",
            value: trainers?.meta?.total ?? trainers?.items?.length ?? 0,
            icon: ShieldCheck,
            color: "text-blue-500",
            glow: "shadow-blue-500/20",
            tag: "ACTIVE_SCAN",
            id: "SF-441",
          },
          {
            label: "Live Training Sessions",
            value: classes?.meta?.total ?? classes?.items?.length ?? 0,
            icon: Activity,
            color: "text-emerald-500",
            glow: "shadow-emerald-500/20",
            tag: "REALTIME",
            id: "TR-882",
          },
          {
            label: "Operational Tiers",
            value: plans?.length ?? 0,
            icon: CreditCard,
            color: "text-amber-500",
            glow: "shadow-amber-500/20",
            tag: "PRICING_API",
            id: "TX-115",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative bg-zinc-950/40 backdrop-blur-3xl border border-white/5 p-6 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="noise-bg absolute inset-0 opacity-[0.03]" />
              <div
                className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-10 transition-opacity group-hover:opacity-20 ${stat.color.replace("text-", "bg-")}`}
              />
              <stat.icon
                className={`absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03] transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${stat.color}`}
              />
            </div>

            {/* Top Row: Icon and Tag */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div
                className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${stat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.glow}`} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[7px] font-black text-white/20 tracking-[0.2em] font-mono">
                  {stat.id}
                </span>
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  <div
                    className={`w-1 h-1 rounded-full animate-pulse ${stat.color.replace("text-", "bg-")}`}
                  />
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">
                    {stat.tag}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Label and Value */}
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-white/50 transition-colors">
                {stat.label}
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-4xl font-black text-white italic tracking-tighter tabular-nums leading-none">
                  {isLoading ? (
                    <span className="opacity-20 animate-pulse">---</span>
                  ) : (
                    stat.value
                  )}
                </h3>
                {!isLoading && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[8px] font-black text-emerald-500">
                      +2.4%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Progress/Scanline Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.02]">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "linear",
                  delay: i * 0.5,
                }}
                className={`absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-${stat.color.split("-")[1]}-500/50 to-transparent`}
              />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-950/50 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] relative overflow-hidden scanline-panel group">
          <div className="noise-bg absolute inset-0 opacity-5 pointer-events-none" />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-1.5">
                Deployment{" "}
                <span className="text-primary text-neon">Velocity</span>
              </h2>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">
                Sustained Operative Deployment Pattern
              </p>
            </div>
            <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">
                Live Telemetry
              </span>
            </div>
          </div>

          <div className="h-64 relative w-full mt-2 px-2">
            {/* Grid Background */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 pointer-events-none">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="border-[0.5px] border-white/[0.02]" />
              ))}
            </div>

            {/* Sweep Scanner Overlay */}
            <motion.div
              animate={{ left: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute top-0 bottom-0 w-[1px] bg-primary/20 shadow-[0_0_20px_rgba(255,62,62,0.3)] z-20 pointer-events-none"
            />

            <svg
              viewBox="0 0 800 200"
              className="w-full h-full overflow-visible relative z-10"
            >
              <defs>
                <linearGradient
                  id="chartGradientNew"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="oklch(0.48 0.22 25)"
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.48 0.22 25)"
                    stopOpacity="0"
                  />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
                d="M 0 160 Q 80 120 160 140 T 320 80 T 480 110 T 640 50 T 800 20"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
                d="M 0 160 Q 80 120 160 140 T 320 80 T 480 110 T 640 50 T 800 20 L 800 200 L 0 200 Z"
                fill="url(#chartGradientNew)"
              />

              {[0, 160, 320, 480, 640, 800].map((x, i) => {
                const y = [160, 140, 80, 110, 50, 20][i];
                return (
                  <motion.g
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 + i * 0.2 }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#000"
                      stroke="var(--primary)"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="var(--primary)"
                      fillOpacity="0.05"
                      className="animate-pulse"
                    />
                  </motion.g>
                );
              })}
            </svg>

            <div className="flex justify-between mt-10 opacity-40">
              {[
                "0000H",
                "0400H",
                "0800H",
                "1200H",
                "1600H",
                "2000H",
                "2400H",
              ].map((time) => (
                <span
                  key={time}
                  className="text-[10px] font-bold text-white uppercase tracking-[0.2em]"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] relative overflow-hidden">
          <div className="noise-bg absolute inset-0 opacity-5 pointer-events-none" />
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 text-center relative z-10">
            Sector <span className="text-primary text-neon">Density</span>
          </h2>

          <div className="space-y-4 relative z-10">
            {[
              {
                label: "Registered Operatives",
                val: users?.meta?.total || 0,
                max: 200,
                color: "text-primary",
              },
              {
                label: "Tactical Load",
                val: classes?.meta?.total || 0,
                max: 20,
                color: "text-white",
              },
              {
                label: "Training Integrity",
                val: trainers?.meta?.total || 0,
                max: 50,
                color: "text-primary",
              },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] mb-2">
                  <span className="text-white/30">{bar.label}</span>
                  <span className="text-white font-mono">
                    {bar.val} // {bar.max}
                  </span>
                </div>
                <div className="h-3 w-full bg-white/[0.03] rounded-sm border border-white/5 p-[2px] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(bar.val / bar.max) * 100}%` }}
                    className={`h-full segmented-gauge ${bar.color} transition-all duration-1000`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 border border-primary/20 bg-primary/5 rounded-2xl text-center tactical-glow relative z-10">
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-0.5 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <div className="text-[8px] font-black text-primary uppercase tracking-[0.3em] leading-relaxed italic">
              CENTRAL PROCESSING OPTIMAL
              <br />
              NO HAZARDS DETECTED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
