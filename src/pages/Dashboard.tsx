import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Trophy,
  User,
  ArrowUpRight,
  Target,
  Activity,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, token } = useAuthStore();

  const { data: bookingsData } = useQuery({
    queryKey: ["user-bookings", user?.email],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/bookings?search=${user?.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!user?.email && !!token,
  });

  const { data: userData } = useQuery({
    queryKey: ["user-details-dashboard", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user details");
      return res.json();
    },
    enabled: !!user?.id && !!token,
  });

  const activeMembership = userData?.memberships?.find(
    (m: any) => m.status === "ACTIVE" || m.status === "PENDING_DOWNGRADE",
  );

  const bookings = bookingsData?.items || [];

  return (
    <div className="container px-6 py-24 mx-auto pb-40">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-16 border-l-4 border-primary pl-8 py-2"
      >
        <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase leading-none">
          OPERATIVE <br />
          <span className="text-neon">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-xl">
          Mission Status: Active. Your biometrics indicate optimal performance
          today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          {
            title: "Evolution Tier",
            value: activeMembership?.planTier || "Initiate",
            sub: activeMembership
              ? `${activeMembership.dailyClassLimit} Daily / ${activeMembership.monthlyClassLimit > 1000 ? "∞" : activeMembership.monthlyClassLimit} Monthly Sessions`
              : "Guest Access",
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            title: "Sessions Booked",
            value: bookings.length.toString(),
            sub: "Total active missions",
            icon: Activity,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            title: "Pulse Efficiency",
            value: "94%",
            sub: "Target coherence",
            icon: Target,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            title: "Neural Focus",
            value: "8.5",
            sub: "Operational",
            icon: Zap,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass shadow-none border-white/5 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground font-bold tracking-tight">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-white/5">
          <CardHeader className="border-b border-white/5 pb-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Active Deployments
                </CardTitle>
                <CardDescription className="text-base">
                  Target sessions for the current operational cycle.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="text-primary font-black uppercase tracking-widest text-xs"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-6 rounded-[2rem] glass-card border-white/2 hover:border-primary/30 group cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-colors">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-tighter bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Session
                          </span>
                          <p className="font-black text-lg leading-none">
                            {booking.class.name}
                          </p>
                        </div>
                        <p className="text-sm text-white/50 font-medium">
                          Trainer: {booking.class.trainerId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">
                        {new Date(booking.class.schedule).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {new Date(booking.class.schedule).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-30 italic uppercase font-black tracking-widest transition-all">
                  No active deployments found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass border-white/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-black uppercase">
                Rapid Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 relative z-10">
              <button className="p-6 rounded-3xl glass-card flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">
                    New Session
                  </span>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="p-6 rounded-3xl glass-card flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">
                    Cipher Profile
                  </span>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-primary/60 border-none text-black p-8 rounded-[3rem] shadow-2xl shadow-primary/20">
            <div className="flex flex-col h-full justify-between gap-12">
              <div>
                <CardTitle className="text-3xl font-black leading-tight uppercase tracking-tighter mb-4">
                  Elite <br />
                  Challenge
                </CardTitle>
                <p className="font-bold opacity-80 text-sm italic">
                  "The limit is a lie told by the weak."
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-full bg-black/10 rounded-full h-3">
                  <div className="bg-black w-3/4 h-full rounded-full" />
                </div>
                <div className="flex items-center justify-between font-black text-[10px] uppercase tracking-widest">
                  <span>Cycle Progress</span>
                  <span>75% Complete</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
