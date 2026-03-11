import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Loader2,
  Percent,
  DollarSign,
  Clock,
  TrendingUp,
  TicketPercent,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import TacticalConfirmModal from "@/components/admin/TacticalConfirmModal";

type DiscountType = "PERCENTAGE" | "FIXED";

interface Discount {
  id: number;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchase: number;
  maxUses?: number;
  perUserLimit?: number;
  usedCount: number;
  isRecurring: boolean;
  recurringDuration?: number;
  isAutomatic: boolean;
  isActive: boolean;
  startDate: string;
  expiresAt?: string;
  applicableTo: string[];
  additionalConditions?: any;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENTAGE" as DiscountType,
  value: 10,
  minPurchase: 0,
  maxUses: "",
  perUserLimit: "",
  isRecurring: false,
  recurringDuration: "",
  isAutomatic: false,
  isActive: true,
  startDate: new Date().toISOString().split("T")[0],
  expiresAt: "",
  applicableTo: [] as string[],
  additionalConditions: "",
};

export default function AdminDiscounts() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState<typeof emptyForm>(emptyForm);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const {
    data: discounts,
    isLoading,
    error,
  } = useQuery<Discount[]>({
    queryKey: ["admin-discounts", searchTerm],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/discounts?search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch discounts");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: summary } = useQuery({
    queryKey: ["admin-discounts-summary"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/discounts/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ["admin-membership-plans"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/membership-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
    enabled: !!token,
  });


  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("http://localhost:3000/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Server error" }));
        const msg = Array.isArray(err.message)
          ? err.message.join(", ")
          : err.message || "Failed to create";
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-discounts-summary"] });
      setStatusMessage({ type: "success", text: "Discount code created!" });
      setTimeout(() => {
        setIsModalOpen(false);
        setStatusMessage(null);
      }, 1200);
    },
    onError: (err: any) =>
      setStatusMessage({ type: "error", text: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(
        `http://localhost:3000/discounts/${editingDiscount!.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Server error" }));
        throw new Error(err.message || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-discounts-summary"] });
      setStatusMessage({ type: "success", text: "Discount updated!" });
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingDiscount(null);
        setStatusMessage(null);
      }, 1200);
    },
    onError: (err: any) =>
      setStatusMessage({ type: "error", text: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Error" }));
        throw new Error(err.message || "Failed to delete");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-discounts-summary"] });
      setIsConfirmOpen(false);
    },
    onError: (err: any) => alert(`Delete Failed: ${err.message}`),
  });

  const openCreate = () => {
    setEditingDiscount(null);
    setFormData(emptyForm);
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const openEdit = (d: Discount) => {
    setEditingDiscount(d);
    setFormData({
      code: d.code,
      description: d.description || "",
      type: d.type,
      value: d.value,
      minPurchase: d.minPurchase,
      maxUses: d.maxUses?.toString() || "",
      perUserLimit: d.perUserLimit?.toString() || "",
      isRecurring: d.isRecurring,
      recurringDuration: d.recurringDuration?.toString() || "",
      isAutomatic: d.isAutomatic,
      isActive: d.isActive,
      startDate: d.startDate
        ? new Date(d.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      expiresAt: d.expiresAt
        ? new Date(d.expiresAt).toISOString().split("T")[0]
        : "",
      applicableTo: d.applicableTo || [],
      additionalConditions: d.additionalConditions ? JSON.stringify(d.additionalConditions, null, 2) : "",
    });
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCode = formData.code.toUpperCase();
    if (formData.isAutomatic && !finalCode) {
      finalCode = `AUTO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    const payload = {
      code: finalCode,
      description: formData.description || undefined,
      type: formData.type,
      value: parseFloat(String(formData.value)) || 0,
      minPurchase: parseFloat(String(formData.minPurchase)) || 0,
      maxUses: formData.maxUses
        ? parseInt(String(formData.maxUses))
        : undefined,
      recurringDuration: formData.recurringDuration
        ? parseInt(String(formData.recurringDuration))
        : undefined,
      perUserLimit: formData.perUserLimit
        ? parseInt(String(formData.perUserLimit))
        : undefined,
      isRecurring: formData.isRecurring,
      isAutomatic: formData.isAutomatic,
      isActive: formData.isActive,
      startDate: formData.startDate || undefined,
      expiresAt: formData.expiresAt || undefined,
      applicableTo: formData.applicableTo,
      additionalConditions: formData.additionalConditions
        ? JSON.parse(formData.additionalConditions)
        : undefined,
    };
    if (editingDiscount) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isExpired = (d: Discount) =>
    d.expiresAt ? new Date() > new Date(d.expiresAt) : false;

  const isFuture = (d: Discount) =>
    d.startDate ? new Date() < new Date(d.startDate) : false;

  const getStatusBadge = (d: Discount) => {
    if (!d.isActive)
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
          INACTIVE
        </span>
      );
    if (isExpired(d))
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/20">
          EXPIRED
        </span>
      );
    if (isFuture(d))
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-blue-500/10 text-blue-400 border-blue-500/20">
          SCHEDULED
        </span>
      );
    if (d.maxUses !== null && d.usedCount >= (d.maxUses || 0))
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-400 border-amber-500/20">
          MAXED OUT
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-green-500/10 text-green-400 border-green-500/20">
        ACTIVE
      </span>
    );
  };

  const statsCards = [
    {
      label: "Total Codes",
      value: summary?.total ?? "—",
      icon: TicketPercent,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: "Active",
      value: summary?.active ?? "—",
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Expired",
      value: summary?.expired ?? "—",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Total Redemptions",
      value: summary?.totalUsage ?? "—",
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <AdminPageHeader
          title="Discount"
          highlight="Codes"
          subtitle="Manage Promo Codes & Customer Incentives"
        />
        <div className="flex gap-3 w-full md:w-auto">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="SEARCH CODES..."
            className="w-full md:w-72"
          />
          <button
            onClick={openCreate}
            className="h-10 px-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Code
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card/50 backdrop-blur-2xl border rounded-[1.5rem] p-2 flex items-center gap-4 ${s.bg}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-foreground/5 border border-border`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                {s.label}
              </div>
              <div className="text-2xl font-black text-foreground italic tracking-tighter">
                {s.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card/50 backdrop-blur-2xl border border-border rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Code",
                  "Type & Value",
                  "Usage",
                  "Status",
                  "Expiry",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ${h === "Actions" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center animate-pulse text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    Loading Discount Codes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest"
                  >
                    Error: {(error as any).message}
                  </td>
                </tr>
              ) : !discounts || discounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Discount Codes Found
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-foreground/[0.01] transition-colors group"
                  >
                    {/* Code */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors font-mono">
                              {d.code}
                            </div>
                            {d.isRecurring && (
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 leading-none">
                                RC
                              </span>
                            )}
                            {d.isAutomatic && (
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 leading-none">
                                AUTO
                              </span>
                            )}
                          </div>
                          {d.description && (
                            <div className="text-foreground/30 text-[10px] font-bold tracking-wide max-w-[160px] truncate">
                              {d.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type & Value */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            d.type === "PERCENTAGE"
                              ? "bg-green-500/10 border border-green-500/20"
                              : "bg-blue-500/10 border border-blue-500/20"
                          }`}
                        >
                          {d.type === "PERCENTAGE" ? (
                            <Percent className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-foreground">
                            {d.type === "PERCENTAGE"
                              ? `${d.value}% OFF`
                              : `$${d.value} OFF`}
                          </div>
                          {d.minPurchase > 0 && (
                            <div className="text-[9px] font-bold text-foreground/30 uppercase">
                              Min ${d.minPurchase}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-5">
                      <div className="text-xs font-black text-foreground">
                        {d.usedCount}
                        <span className="text-foreground/30 font-bold">
                          {" "}
                          /{" "}
                          {d.maxUses !== null && d.maxUses !== undefined
                            ? d.maxUses
                            : "∞"}
                        </span>
                      </div>
                      {d.perUserLimit && (
                        <div className="text-[9px] font-bold text-foreground/30 uppercase mt-0.5">
                          Limit {d.perUserLimit}/User
                        </div>
                      )}
                      {d.maxUses && (
                        <div className="mt-1 h-1 w-20 bg-foreground/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.min((d.usedCount / d.maxUses) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">{getStatusBadge(d)}</td>

                    {/* Expiry */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-foreground/50">
                        {d.expiresAt
                          ? new Date(d.expiresAt).toLocaleDateString()
                          : "No Expiry"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(d)}
                          className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all border border-border"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIdToDelete(d.id);
                            setIsConfirmOpen(true);
                          }}
                          className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-border"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setEditingDiscount(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-card border border-border rounded-[2rem] p-6 shadow-2xl overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "90vh" }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-foreground italic tracking-tighter uppercase">
                    {editingDiscount ? "Edit" : "Create"}{" "}
                    <span className="text-primary">Discount Code</span>
                  </h2>
                  <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">
                    {editingDiscount
                      ? "Modify existing promo code"
                      : "Configure a new promo code"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDiscount(null);
                  }}
                  className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors border border-border"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Automatic Toggle & Code */}
                <div className="flex w-full gap-4">
                  <div className="flex items-center w-[160px] justify-between p-3 bg-foreground/5 rounded-xl border border-border shrink-0">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-foreground/50">
                        Automatic
                      </div>
                      <div className="text-[8px] font-bold text-foreground/30 mt-0.5 uppercase">
                        {formData.isAutomatic ? "ON" : "OFF"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isAutomatic: !formData.isAutomatic,
                        })
                      }
                      className={`relative w-8 h-4 rounded-full transition-all duration-300 border ${
                        formData.isAutomatic
                          ? "bg-amber-500 border-amber-500"
                          : "bg-foreground/10 border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all duration-300 ${
                          formData.isAutomatic ? "left-4.5" : "left-0.5"
                        }`}
                        style={{
                          left: formData.isAutomatic
                            ? "calc(100% - 0.85rem)"
                            : "0.125rem",
                        }}
                      />
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!formData.isAutomatic && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-2 flex-1"
                      >
                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                          Promo Code
                        </Label>
                        <Input
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="e.g. SUMMER20"
                          className="bg-foreground/5 border-border rounded-xl h-10 font-black font-mono focus:border-primary text-foreground uppercase tracking-widest"
                          required
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    Description (optional)
                  </Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g. Summer membership discount"
                    className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                  />
                </div>

                {/* Type + Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Discount Type
                    </Label>
                    <div className="flex rounded-xl overflow-hidden border border-border">
                      {(["PERCENTAGE", "FIXED"] as DiscountType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t })}
                          className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                            formData.type === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground/5 text-foreground/40 hover:text-foreground"
                          }`}
                        >
                          {t === "PERCENTAGE" ? (
                            <Percent className="w-3 h-3" />
                          ) : (
                            <DollarSign className="w-3 h-3" />
                          )}
                          {t === "PERCENTAGE" ? "%" : "$"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Value {formData.type === "PERCENTAGE" ? "(%)" : "($)"}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={formData.type === "PERCENTAGE" ? "100" : undefined}
                      step="0.01"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value),
                        })
                      }
                      className="bg-foreground/5 border-border rounded-xl h-10 font-black focus:border-primary text-green-400"
                      required
                    />
                  </div>
                </div>

                {/* Min Purchase */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    Min Purchase ($)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPurchase: parseFloat(e.target.value),
                      })
                    }
                    className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                  />
                </div>

                {/* Limits: Max Uses + Per User Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Total Max Uses (blank = ∞)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                      placeholder="Unlimited"
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Per User Limit (blank = ∞)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.perUserLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          perUserLimit: e.target.value,
                        })
                      }
                      placeholder="Unlimited"
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Dates: Start + Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Expiry Date (optional)
                    </Label>
                    <Input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Applicable To (Checkboxes) */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    Applicable Plans (Blank = All)
                  </Label>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-foreground/5 rounded-xl border border-border">
                    {plans?.map((plan) => (
                      <label
                        key={plan.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          onClick={() => {
                            const current = [...formData.applicableTo];
                            const index = current.indexOf(
                              plan.name.toUpperCase(),
                            );
                            if (index > -1) {
                              current.splice(index, 1);
                            } else {
                              current.push(plan.name.toUpperCase());
                            }
                            setFormData({ ...formData, applicableTo: current });
                          }}
                          className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                            formData.applicableTo.includes(
                              plan.name.toUpperCase(),
                            )
                              ? "bg-primary border-primary shadow-sm"
                              : "bg-background border-border group-hover:border-primary/50"
                          }`}
                        >
                          {formData.applicableTo.includes(
                            plan.name.toUpperCase(),
                          ) && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors uppercase tracking-tight">
                          {plan.name}
                        </span>
                      </label>
                    ))}
                    {!plans?.length && (
                      <div className="col-span-2 text-[10px] font-bold text-foreground/20 uppercase text-center py-2">
                        No plans found
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Conditions (JSON Textarea) */}
                {/* <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    Additional Conditions (JSON format, optional)
                  </Label>
                  <textarea
                    value={formData.additionalConditions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalConditions: e.target.value,
                      })
                    }
                    placeholder='e.g. { "minWeight": 80 }'
                    className="w-full h-24 bg-foreground/5 border border-border rounded-xl p-3 text-xs font-mono focus:border-primary focus:outline-none text-foreground resize-none"
                  />
                </div> */}

                {/* Toggles: Active + Recurring + Automatic */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-border">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-foreground/50">
                        Active
                      </div>
                      <div className="text-[8px] font-bold text-foreground/30 mt-0.5 uppercase">
                        {formData.isActive ? "Yes" : "No"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isActive: !formData.isActive,
                        })
                      }
                      className={`relative w-8 h-4 rounded-full transition-all duration-300 border ${
                        formData.isActive
                          ? "bg-primary border-primary"
                          : "bg-foreground/10 border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all duration-300 ${
                          formData.isActive ? "left-4.5" : "left-0.5"
                        }`}
                        style={{
                          left: formData.isActive
                            ? "calc(100% - 0.85rem)"
                            : "0.125rem",
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-border">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-foreground/50">
                        Recurring
                      </div>
                      <div className="text-[8px] font-bold text-foreground/30 mt-0.5 uppercase">
                        {formData.isRecurring ? "ON" : "OFF"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          isRecurring: !formData.isRecurring,
                        })
                      }
                      className={`relative w-8 h-4 rounded-full transition-all duration-300 border ${
                        formData.isRecurring
                          ? "bg-blue-500 border-blue-500"
                          : "bg-foreground/10 border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all duration-300 ${
                          formData.isRecurring ? "left-4.5" : "left-0.5"
                        }`}
                        style={{
                          left: formData.isRecurring
                            ? "calc(100% - 0.85rem)"
                            : "0.125rem",
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Recurring Duration (Conditional) */}
                <AnimatePresence>
                  {formData.isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                        Recurring Duration (Months, blank = forever)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.recurringDuration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurringDuration: e.target.value,
                          })
                        }
                        placeholder="Forever"
                        className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Message */}
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

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingDiscount(null);
                    }}
                    className="flex-1 h-10 rounded-xl border-border hover:bg-foreground/5 font-black uppercase tracking-widest text-[10px] text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-[2] h-10 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingDiscount ? "Update Code" : "Create Code"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <TacticalConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => idToDelete && deleteMutation.mutate(idToDelete)}
        title="Delete Discount Code"
        message="DANGER: You are about to permanently delete this discount code. All associated usage data will be lost. Continue?"
        type="danger"
      />
    </div>
  );
}
