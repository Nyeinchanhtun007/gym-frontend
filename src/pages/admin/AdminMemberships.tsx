import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  CreditCard,
  Edit3,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import MembershipEditModal from "@/components/admin/MembershipEditModal";
import TacticalConfirmModal from "@/components/admin/TacticalConfirmModal";
import TacticalSelect from "@/components/ui/TacticalSelect";

export default function AdminMemberships() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editingMembership, setEditingMembership] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [idToPurge, setIdToPurge] = useState<number | null>(null);

  const {
    data: memberships,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-memberships",
      searchTerm,
      statusFilter,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await fetch(
        `http://localhost:3000/memberships?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch memberships");
      return res.json();
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

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
  const meta = memberships?.meta || { totalPages: 1, total: 0 };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Membership"
        highlight="Management"
        subtitle="Monitor and Override Active Tier Assignments"
      />

      <div className="bg-card/50 backdrop-blur-2xl border border-border p-6 rounded-[2rem] relative z-[50]">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center relative z-10">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="SEARCH BY USER OR TIER..."
            className="w-full md:w-96"
          />

          <TacticalSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "ALL STATUS", value: "" },
              { label: "ACTIVE", value: "ACTIVE" },
              { label: "PENDING DOWNGRADE", value: "PENDING_DOWNGRADE" },
              { label: "CANCELLED", value: "CANCELLED" },
              { label: "EXPIRED", value: "EXPIRED" },
            ]}
            placeholder="FILTER BY STATUS"
            className="w-full md:w-56 !rounded-xl"
            accentColor="primary"
          />
        </div>
      </div>

      <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("user")}
                >
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "user" ? "text-primary" : "text-foreground/10"}`}
                    />
                  </div>
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("tier")}
                >
                  <div className="flex items-center gap-2">
                    Tier & Cycle
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "tier" ? "text-primary" : "text-foreground/10"}`}
                    />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Limits
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Start Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center animate-pulse text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    Scanning Memberships...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest"
                  >
                    Uplink Error: {error.message}
                  </td>
                </tr>
              ) : membershipData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Tier Assignments Found
                  </td>
                </tr>
              ) : (
                membershipData.map((m: any) => (
                  <tr
                    key={m.id}
                    className="hover:bg-foreground/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center font-black text-primary italic text-sm">
                          {m.user?.name?.[0] || "U"}
                        </div>
                        <div>
                          <div className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                            {m.user?.name}
                          </div>
                          <div className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
                            {m.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-primary" />
                          {m.planTier}
                        </div>
                        <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                          ${m.price} / {m.billingCycle}
                        </div>
                        {m.discountAmount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Tag className="w-2.5 h-2.5 text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
                              SVD ${m.discountAmount} ({m.promoCode})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-foreground/50 uppercase space-y-1">
                        <div>
                          DLY:{" "}
                          <span className="text-foreground">
                            {m.dailyClassLimit}
                          </span>
                        </div>
                        <div>
                          MTLY:{" "}
                          <span className="text-foreground">
                            {m.monthlyClassLimit > 999
                              ? "∞"
                              : m.monthlyClassLimit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="w-3.5 h-3.5 text-primary/40" />
                        <span className="text-xs font-bold text-foreground/60 tracking-tight">
                          {new Date(m.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                        <button
                          onClick={() => handleEdit(m)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground/40 hover:text-primary hover:border-primary/20 transition-all font-outfit"
                          title="Edit Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 font-outfit">
              Showing {membershipData.length} of {meta.total} Records
            </div>

            <div className="flex items-center gap-2 ml-2">
              <span className="text-[8px] font-black uppercase text-foreground/10 tracking-widest">
                ROWS PER PAGE:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="tactical-select !py-1 !px-2 h-8 !bg-foreground/5 text-foreground border border-border"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="group h-10 px-4 flex items-center gap-2 rounded-xl bg-foreground/5 border border-border disabled:opacity-20 hover:bg-foreground/10 hover:border-border transition-all font-bold text-[10px] uppercase tracking-widest text-foreground/60 hover:text-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </button>

            <div className="px-4 py-2 bg-foreground/5 rounded-xl border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
              Page <span className="text-primary">{page}</span> OF{" "}
              {meta.totalPages}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="group h-10 px-4 flex items-center gap-2 rounded-xl bg-foreground/5 border border-border disabled:opacity-20 hover:bg-foreground/10 hover:border-border transition-all font-bold text-[10px] uppercase tracking-widest text-foreground/60 hover:text-foreground"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <MembershipEditModal
          membership={editingMembership}
          isOpen={!!editingMembership}
          onClose={() => setEditingMembership(null)}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSubmit}
          onPurge={(id) => {
            setIdToPurge(id);
            setIsConfirmOpen(true);
          }}
          isLoading={updateMutation.isPending}
          statusMessage={statusMessage}
        />

        <TacticalConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => idToPurge && deleteMutation.mutate(idToPurge)}
          title="Protocol Purge"
          message="DANGER: You are about to permanently purge this membership protocol from global records. This action cannot be reversed. Continue?"
          type="danger"
        />
      </AnimatePresence>
    </div>
  );
}
