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
  TrendingUp,
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

  const statCards = [
    {
      label: "Total Members",
      value: users?.meta?.total ?? users?.items?.length ?? 0,
      icon: Users,
      trend: "+12% this month",
      trendUp: true,
    },
    {
      label: "Active Trainers",
      value: trainers?.meta?.total ?? trainers?.items?.length ?? 0,
      icon: ShieldCheck,
      trend: "+2 new",
      trendUp: true,
    },
    {
      label: "Scheduled Classes",
      value: classes?.meta?.total ?? classes?.items?.length ?? 0,
      icon: Activity,
      trend: "Consistent",
      trendUp: true,
    },
    {
      label: "Membership Plans",
      value: plans?.length ?? 0,
      icon: CreditCard,
      trend: "Updated",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor gym performance, manage users, and review activity.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-foreground">
                {isLoading ? (
                  <span className="opacity-30 inline-block w-16 h-8 bg-muted rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Activity Trends</h2>
            <p className="text-sm text-muted-foreground">User registrations and class bookings over time.</p>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20 relative overflow-hidden group">
              <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100">
                  <Activity className="w-8 h-8" />
                  <span className="text-sm font-medium">Chart Visualization Area</span>
              </div>
              {/* Simple background decorative lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20"
                   style={{
                       backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                       backgroundSize: '40px 40px',
                       color: 'var(--border)'
                   }}
              ></div>
          </div>
        </div>

        {/* Capacity/Limits Section */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">System Capacity</h2>
            <p className="text-sm text-muted-foreground">Current resource utilization levels.</p>
          </div>
          <div className="space-y-6">
            {[
              { label: "Registered Members", val: users?.meta?.total || 0, max: 200, color: "bg-blue-500" },
              { label: "Active Classes", val: classes?.meta?.total || 0, max: 20, color: "bg-emerald-500" },
              { label: "Trainer Roster", val: trainers?.meta?.total || 0, max: 50, color: "bg-purple-500" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="text-foreground">
                    {bar.val} <span className="text-muted-foreground font-normal">/ {bar.max}</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((bar.val / bar.max) * 100, 100)}%` }}
                    className={`h-full ${bar.color} rounded-full`}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-foreground">System operating normally</p>
          </div>
        </div>
      </div>
    </div>
  );
}
