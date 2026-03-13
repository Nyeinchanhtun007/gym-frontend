import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { User, Activity, Clock, Check, X } from "lucide-react";

export default function AdminBookings() {
  const { token } = useAuthStore();

  const queryClient = useQueryClient();

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`http://localhost:3000/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
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
                      <div className="flex justify-end items-center gap-2">
                        {booking.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: booking.id,
                                  status: "CONFIRMED",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-50 tactical-glow"
                            >
                              <Check className="w-3 h-3" />
                              Confirm
                            </button>
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: booking.id,
                                  status: "CANCELLED",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="p-1 px-2.5 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                              title="Cancel Mission"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : booking.status === "CONFIRMED" ? (
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                              <Check className="w-3 h-3" />
                              Confirmed
                            </span>
                            <button
                               onClick={() =>
                                updateStatusMutation.mutate({
                                  id: booking.id,
                                  status: "PENDING",
                                })
                              }
                              className="text-[8px] font-black text-foreground/20 hover:text-rose-500 uppercase tracking-widest transition-all hover:translate-x-[-2px]"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest">
                            {booking.status}
                          </span>
                        )}
                      </div>
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
