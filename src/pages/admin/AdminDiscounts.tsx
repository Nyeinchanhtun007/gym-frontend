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
import ConfirmModal from "@/components/admin/ConfirmModal";

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
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase tracking-tight">
          INACTIVE
        </span>
      );
    if (isExpired(d))
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 uppercase tracking-tight">
          EXPIRED
        </span>
      );
    if (isFuture(d))
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-tight">
          SCHEDULED
        </span>
      );
    if (d.maxUses !== null && d.usedCount >= (d.maxUses || 0))
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase tracking-tight">
          MAXED OUT
        </span>
      );
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 uppercase tracking-tight">
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
    <div className="space-y-6">
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
            placeholder="Search codes..."
            className="w-full md:w-72"
          />
          <Button
            onClick={openCreate}
            className="rounded-lg h-10 px-6 font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Code
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className={`bg-card border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${s.bg} border`}
            >
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {s.label}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
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
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h === "Actions" ? "text-right" : ""}`}
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
                    className="px-8 py-20 text-center animate-pulse text-muted-foreground font-medium text-sm"
                  >
                    Loading discount codes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-destructive font-medium text-sm"
                  >
                    Error: {(error as any).message}
                  </td>
                </tr>
              ) : !discounts || discounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-muted-foreground font-medium text-sm"
                  >
                    No discount codes found
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-muted/20 transition-colors border-b border-border last:border-0"
                  >
                    {/* Code */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm tracking-tight family-mono">
                              {d.code}
                            </span>
                            {d.isRecurring && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                RECURRING
                              </span>
                            )}
                            {d.isAutomatic && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                AUTO
                              </span>
                            )}
                          </div>
                          {d.description && (
                            <p className="text-muted-foreground text-xs mt-1 max-w-[200px] truncate">
                              {d.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type & Value */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            d.type === "PERCENTAGE"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {d.type === "PERCENTAGE" ? (
                            <Percent className="w-4 h-4" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {d.type === "PERCENTAGE"
                              ? `${d.value}% OFF`
                              : `$${d.value} OFF`}
                          </p>
                          {d.minPurchase > 0 && (
                            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                              Min: ${d.minPurchase}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="text-sm font-semibold text-foreground">
                          {d.usedCount}
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            /{" "}
                            {d.maxUses !== null && d.maxUses !== undefined
                              ? d.maxUses
                              : "∞"}
                          </span>
                        </div>
                        {d.perUserLimit && (
                          <p className="text-[10px] font-medium text-muted-foreground uppercase">
                            Limit: {d.perUserLimit}/User
                          </p>
                        )}
                        {d.maxUses && (
                          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((d.usedCount / d.maxUses) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(d)}</td>

                    {/* Expiry */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {d.expiresAt
                          ? new Date(d.expiresAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "No Expiry"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(d)}
                          className="w-8 h-8 hover:bg-muted"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIdToDelete(d.id);
                            setIsConfirmOpen(true);
                          }}
                          className="w-8 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
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
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-lg w-full bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingDiscount ? "Edit" : "Create"}{" "}
                    Discount Code
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium italic">
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
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Automatic Toggle & Code */}
                <div className="flex w-full gap-4">
                  <div className="flex items-center w-[160px] justify-between p-3 bg-muted/30 rounded-lg border border-border shrink-0">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                        Automatic
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-0.5 uppercase">
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
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${
                        formData.isAutomatic
                          ? "bg-amber-500 border-amber-500"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                          formData.isAutomatic ? "left-5.5" : "left-0.5"
                        }`}
                        style={{
                          left: formData.isAutomatic
                            ? "calc(100% - 1.125rem)"
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
                        className="space-y-1.5 flex-1"
                      >
                        <Label className="text-xs font-semibold text-foreground">
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
                          className="bg-background border-border rounded-lg h-10 font-bold family-mono focus-visible:ring-primary text-foreground uppercase tracking-wider"
                          required
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Description (optional)
                  </Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g. Summer membership discount"
                    className="bg-background border-border rounded-lg h-10 focus-visible:ring-primary text-foreground"
                  />
                </div>

                {/* Type + Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Discount Type
                    </Label>
                    <div className="flex rounded-lg overflow-hidden border border-border h-10">
                      {(["PERCENTAGE", "FIXED"] as DiscountType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t })}
                          className={`flex-1 text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${
                            formData.type === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {t === "PERCENTAGE" ? (
                            <Percent className="w-3.5 h-3.5" />
                          ) : (
                            <DollarSign className="w-3.5 h-3.5" />
                          )}
                          {t === "PERCENTAGE" ? "%" : "$"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
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
                      className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Min Purchase */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
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
                    className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                  />
                </div>

                {/* Limits: Max Uses + Per User Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Total Max Uses
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                      placeholder="Unlimited (∞)"
                      className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Per User Limit
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
                      placeholder="Unlimited (∞)"
                      className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Dates: Start + Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Expiry Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                      className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Applicable To (Checkboxes) */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Applicable Plans (Blank = All)
                  </Label>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg border border-border">
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
                          className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
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
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          {plan.name}
                        </span>
                      </label>
                    ))}
                    {!plans?.length && (
                      <div className="col-span-2 text-xs text-muted-foreground text-center py-2 italic font-medium">
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

                {/* Toggles: Active + Recurring */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                        Active
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-0.5 uppercase">
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
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${
                        formData.isActive
                          ? "bg-primary border-primary"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                          formData.isActive ? "left-5.5" : "left-0.5"
                        }`}
                        style={{
                          left: formData.isActive
                            ? "calc(100% - 1.125rem)"
                            : "0.125rem",
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                        Recurring
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-0.5 uppercase">
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
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${
                        formData.isRecurring
                          ? "bg-blue-500 border-blue-500"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                          formData.isRecurring ? "left-5.5" : "left-0.5"
                        }`}
                        style={{
                          left: formData.isRecurring
                            ? "calc(100% - 1.125rem)"
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
                      className="space-y-1.5 overflow-hidden"
                    >
                      <Label className="text-xs font-semibold text-foreground">
                        Recurring Duration (Months)
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
                        placeholder="Forever (Leave blank)"
                        className="bg-background border-border rounded-lg h-10 font-bold focus-visible:ring-primary text-foreground"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Message */}
                {statusMessage && (
                  <div
                    className={`text-sm font-medium rounded-lg px-4 py-3 ${
                      statusMessage.type === "error"
                        ? "bg-destructive/10 border border-destructive/20 text-destructive"
                        : "bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingDiscount(null);
                    }}
                    className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold text-xs transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="px-6 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 font-bold" />
                        {editingDiscount ? "Save Changes" : "Create Code"}
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
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => idToDelete && deleteMutation.mutate(idToDelete)}
        title="Delete Discount"
        message="Are you sure you want to delete this discount code? This action cannot be undone."
        type="danger"
      />
    </div>
  );
}
