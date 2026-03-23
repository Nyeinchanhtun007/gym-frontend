import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Activity, Check, X, Search, Calendar, Hash, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SimpleSelect from "@/components/ui/SimpleSelect";

export default function AdminBookings() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredBookings = bookingData.filter((booking: any) => {
    const matchesSearch = 
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.class.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Bookings"
        highlight="Management"
        subtitle="Track and manage user session bookings and attendance"
      />

      {/* Filters Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user or session..."
              className="w-full bg-muted/30 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner placeholder:text-muted-foreground/60 shadow-sm"
            />
          </div>

          <SimpleSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "ALL" },
              { label: "Confirmed", value: "CONFIRMED" },
              { label: "Pending", value: "PENDING" },
              { label: "Cancelled", value: "CANCELLED" },
            ]}
            className="w-full md:w-56"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground">User / Participant</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Session Details</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Booking Date</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <p className="text-muted-foreground font-medium animate-pulse">Retrieving booking records...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <X className="w-8 h-8 opacity-50 mb-2" />
                      <p className="font-bold">Failed to load ledger</p>
                      <p className="text-xs opacity-80">{error.message}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground italic font-medium">
                    No matching bookings found
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredBookings.map((booking: any) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={booking.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            {booking.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              {booking.user.name}
                            </div>
                            <div className="text-muted-foreground text-[11px] font-medium mt-0.5">
                              {booking.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-foreground flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5 text-primary" />
                             {booking.class.name}
                          </div>
                          <div className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-1.5">
                            <Hash className="w-3 h-3" />
                            Session ID: #{booking.class.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 opacity-50" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] opacity-60">
                              {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
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
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                                title="Cancel Booking"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : booking.status === "CONFIRMED" ? (
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
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
                                disabled={updateStatusMutation.isPending}
                                className="p-1.5 rounded-md text-muted-foreground/30 hover:text-primary transition-colors flex items-center justify-center"
                                title="Revert to Pending"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                              {booking.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
