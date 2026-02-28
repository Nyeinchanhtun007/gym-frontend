import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  Search,
  CreditCard,
  Edit3,
  X,
  Save,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminMemberships() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMembership, setEditingMembership] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const {
    data: memberships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-memberships", searchTerm],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/memberships?search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch memberships");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await fetch(
        `http://localhost:3000/memberships/${editingMembership.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        },
      );
      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ message: "Server error" }));
        throw new Error(errData.message || "Failed to update membership");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      setStatusMessage({
        type: "success",
        text: "Membership synchronized successfully!",
      });
      setTimeout(() => {
        setEditingMembership(null);
        setStatusMessage(null);
      }, 1200);
    },
    onError: (err: any) => {
      setStatusMessage({ type: "error", text: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/memberships/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to delete membership");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      setEditingMembership(null);
    },
    onError: (err: any) => {
      alert(`Delete Failed: ${err.message}`);
    },
  });

  const handleEdit = (membership: any) => {
    setEditingMembership(membership);
    setFormData({
      planTier: membership.planTier,
      billingCycle: membership.billingCycle,
      status: membership.status,
      price: membership.price,
      dailyClassLimit: membership.dailyClassLimit,
      monthlyClassLimit: membership.monthlyClassLimit,
      startDate: new Date(membership.startDate).toISOString().split("T")[0],
      endDate: new Date(membership.endDate).toISOString().split("T")[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      planTier: formData.planTier,
      billingCycle: formData.billingCycle,
      status: formData.status,
      price: parseFloat(formData.price),
      dailyClassLimit: parseInt(formData.dailyClassLimit),
      monthlyClassLimit: parseInt(formData.monthlyClassLimit),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    });
  };

  const membershipData = memberships?.items || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Membership <span className="text-primary">Management</span>
          </h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-[10px] font-bold">
            Monitor and Override Active Tier Assignments
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="SEARCH BY USER OR TIER..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  User
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Tier & Cycle
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Limits
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Expiration
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center animate-pulse text-white/20 uppercase font-black text-xs tracking-widest"
                  >
                    Scanning Memberships...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest"
                  >
                    Uplink Error: {error.message}
                  </td>
                </tr>
              ) : membershipData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-white/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Tier Assignments Found
                  </td>
                </tr>
              ) : (
                membershipData.map((m: any) => (
                  <tr
                    key={m.id}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-primary italic text-sm">
                          {m.user?.name?.[0] || "U"}
                        </div>
                        <div>
                          <div className="font-black text-white text-sm uppercase tracking-tight">
                            {m.user?.name}
                          </div>
                          <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                            {m.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-primary" />
                          {m.planTier}
                        </div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          ${m.price} / {m.billingCycle}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-white/50 uppercase space-y-1">
                        <div>
                          DLY:{" "}
                          <span className="text-white">
                            {m.dailyClassLimit}
                          </span>
                        </div>
                        <div>
                          MTLY:{" "}
                          <span className="text-white">
                            {m.monthlyClassLimit > 999
                              ? "∞"
                              : m.monthlyClassLimit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-white/20" />
                        <span className="text-xs font-bold text-white/60 tracking-tight">
                          {new Date(m.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          m.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : m.status === "PENDING_DOWNGRADE"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleEdit(m)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all ml-auto"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingMembership && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMembership(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              style={{ cursor: "pointer" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-xl w-full bg-zinc-950 border border-white/10 rounded-[2rem] p-5 shadow-2xl overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                    Membership <span className="text-primary">Override</span>
                  </h2>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    ID: #{editingMembership.id} | User:{" "}
                    {editingMembership.user?.name}
                  </p>
                </div>
                <button
                  onClick={() => setEditingMembership(null)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Tier Assignment
                    </Label>
                    <select
                      value={formData.planTier}
                      onChange={(e) =>
                        setFormData({ ...formData, planTier: e.target.value })
                      }
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="Basic" className="bg-zinc-900">
                        Basic Tier
                      </option>
                      <option value="Standard" className="bg-zinc-900">
                        Standard Tier
                      </option>
                      <option value="Premium" className="bg-zinc-900">
                        Premium Tier
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Status Protocol
                    </Label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option
                        value="ACTIVE"
                        className="bg-zinc-900 text-green-500 font-black"
                      >
                        ACTIVE
                      </option>
                      <option
                        value="EXPIRED"
                        className="bg-zinc-900 text-red-500 font-black"
                      >
                        EXPIRED
                      </option>
                      <option
                        value="CANCELLED"
                        className="bg-zinc-900 text-zinc-500 font-black"
                      >
                        CANCELLED
                      </option>
                      <option
                        value="PENDING_DOWNGRADE"
                        className="bg-zinc-900 text-amber-500 font-black"
                      >
                        PENDING DOWNGRADE
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Protocol Pricing ($)
                    </Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 text-xs font-black transition-all focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Billing Cycle
                    </Label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingCycle: e.target.value,
                        })
                      }
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="Monthly" className="bg-zinc-900">
                        Monthly Cycle
                      </option>
                      <option value="Yearly" className="bg-zinc-900">
                        Yearly Cycle
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Daily Capacity Override
                    </Label>
                    <Input
                      type="number"
                      value={formData.dailyClassLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyClassLimit: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 text-xs font-black transition-all focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Monthly Capacity Override
                    </Label>
                    <Input
                      type="number"
                      value={formData.monthlyClassLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyClassLimit: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 text-xs font-black transition-all focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Activation Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 text-xs font-black transition-all focus:border-primary [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Deactivation Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 text-xs font-black transition-all focus:border-primary [color-scheme:dark]"
                    />
                  </div>
                </div>

                {statusMessage && (
                  <div
                    className={`text-xs font-bold rounded-xl px-4 py-3 ${
                      statusMessage.type === "error"
                        ? "bg-red-500/10 border border-red-500/20 text-red-400"
                        : "bg-green-500/10 border border-green-500/20 text-green-400"
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        confirm(
                          "DANGER: This will permanently purge this protocol record. Continue?",
                        )
                      ) {
                        deleteMutation.mutate(editingMembership.id);
                      }
                    }}
                    className="flex-1 h-10 rounded-xl border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-black uppercase tracking-widest text-[10px]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Purge
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-[2] h-10 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Synchronize
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
