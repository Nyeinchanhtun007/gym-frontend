import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { User, Activity, Clock } from "lucide-react";

export default function AdminBookings() {
  const { token } = useAuthStore();

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch bookings");
      }
      return res.json();
    },
  });

  const bookingData = bookings?.items || bookings?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-foreground">
          Mission <span className="text-primary text-neon">Logs</span>
        </h1>
        <p className="text-foreground/40 uppercase tracking-[0.2em] text-[10px] font-bold">
          Historical & Active Session Ledger
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-2xl border border-border p-6 rounded-[2rem] relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                  Operative
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                  Assigned Session
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                  Timestamp
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] text-right">
                  Verification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center animate-pulse text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    Accessing Records...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest"
                  >
                    Ledger Error: {error.message}
                  </td>
                </tr>
              ) : bookingData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Missions Logged
                  </td>
                </tr>
              ) : (
                bookingData.map((booking: any) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-foreground/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-border">
                          <User className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                            {booking.user.name}
                          </div>
                          <div className="text-foreground/30 text-[10px] font-bold uppercase">
                            {booking.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-primary opacity-50" />
                        <div>
                          <div className="text-sm font-black text-foreground uppercase italic tracking-tighter">
                            {booking.class.name}
                          </div>
                          <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                            Session ID: #{booking.class.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-foreground/20" />
                        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                          {new Date(booking.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
