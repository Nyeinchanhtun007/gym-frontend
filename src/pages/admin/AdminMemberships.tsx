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
import ConfirmModal from "@/components/admin/ConfirmModal";
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
        text: "Membership updated successfully!",
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

      <div className="bg-card border border-border p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by user or tier..."
            className="w-full md:w-96"
          />

          <TacticalSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "" },
              { label: "Active", value: "ACTIVE" },
              { label: "Pending Downgrade", value: "PENDING_DOWNGRADE" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Expired", value: "EXPIRED" },
            ]}
            placeholder="Filter by Status"
            className="w-full md:w-56"
            accentColor="primary"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("user")}
                >
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "user" ? "text-primary" : "text-muted-foreground/30"}`}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("tier")}
                >
                  <div className="flex items-center gap-2">
                    Tier & Cycle
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "tier" ? "text-primary" : "text-muted-foreground/30"}`}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Limits
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Start Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground/50 font-medium text-sm"
                  >
                    Loading memberships...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-destructive font-medium text-sm"
                  >
                    Error: {error.message}
                  </td>
                </tr>
              ) : membershipData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground/50 font-medium text-sm"
                  >
                    No memberships found
                  </td>
                </tr>
              ) : (
                membershipData.map((m: any) => (
                  <tr
                    key={m.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                          {m.user?.name?.[0] || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {m.user?.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {m.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-primary" />
                          {m.planTier} Plan
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${m.price} / {m.billingCycle}
                        </div>
                        {m.discountAmount > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Tag className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">
                              Saved ${m.discountAmount} ({m.promoCode})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>
                          Daily:{" "}
                          <span className="text-foreground font-medium">
                            {m.dailyClassLimit}
                          </span>
                        </div>
                        <div>
                          Monthly:{" "}
                          <span className="text-foreground font-medium">
                            {m.monthlyClassLimit > 999
                              ? "Unlimited"
                              : m.monthlyClassLimit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>
                          {new Date(m.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            m.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : m.status === "PENDING_DOWNGRADE"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {m.status}
                        </span>
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-2 rounded-lg bg-muted/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
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
        <div className="px-6 py-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/10">
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted-foreground">
              Showing {membershipData.length} of {meta.total} records
            </div>

            <div className="flex items-center gap-2 group">
              <span className="text-xs text-muted-foreground">
                Rows:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-xs font-semibold focus:outline-none"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 px-3 flex items-center gap-1 rounded-lg border border-border bg-background disabled:opacity-50 text-xs font-medium hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <div className="h-9 px-3 flex items-center justify-center rounded-lg bg-primary/5 border border-primary/10 text-xs font-bold text-primary min-w-[3rem]">
              {page}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="h-9 px-3 flex items-center gap-1 rounded-lg border border-border bg-background disabled:opacity-50 text-xs font-medium hover:bg-muted transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
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

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => idToPurge && deleteMutation.mutate(idToPurge)}
          title="Delete Membership"
          message="Are you sure you want to delete this membership? This action cannot be undone."
          type="danger"
        />
      </AnimatePresence>
    </div>
  );
}
