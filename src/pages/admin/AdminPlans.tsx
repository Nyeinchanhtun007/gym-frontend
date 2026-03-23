import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  Edit3,
  X,
  Save,
  Trash2,
  Plus,
  Loader2,
  Percent,
  Crown,
  Zap,
  CalendarDays,
  DollarSign,
  Sparkles,
  Tag,
  Star,
  Clock,
  Link2,
  Unlink2,
  Globe,
  Check,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface MembershipPlan {
  id: number;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discount: number;
  dailyClassLimit: number;
  monthlyClassLimit: number;
  features: string[];
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Discount {
  id: number;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  isAutomatic: boolean;
  isActive: boolean;
  startDate: string;
  expiresAt?: string;
  applicableTo: string[];
  usedCount: number;
  maxUses?: number;
}

export default function AdminPlans() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  // Link discount modal state
  const [linkingPlan, setLinkingPlan] = useState<MembershipPlan | null>(null);
  const [linkStatusMsg, setLinkStatusMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });

  const triggerConfirm = useCallback(
    (config: Omit<typeof confirmConfig, "isOpen">) => {
      setConfirmConfig({ ...config, isOpen: true });
    },
    [],
  );

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery<MembershipPlan[]>({
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

  // Fetch ALL discounts (not just active) so admin can see which to link
  const { data: allDiscounts } = useQuery<Discount[]>({
    queryKey: ["admin-all-discounts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/discounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch discounts");
      return res.json();
    },
    enabled: !!token,
  });

  // Only active discounts for display on cards
  const activeDiscounts = allDiscounts?.filter((d) => d.isActive) ?? [];

  const getDiscountsForPlan = (planName: string): Discount[] => {
    return activeDiscounts.filter(
      (d) =>
        d.applicableTo.length === 0 ||
        d.applicableTo.includes(planName.toUpperCase()),
    );
  };

  // Check if a discount is specifically linked to a plan (not via "all plans")
  const isDiscountLinkedToPlan = (
    discount: Discount,
    planName: string,
  ): boolean => {
    return discount.applicableTo.includes(planName.toUpperCase());
  };

  // Check if a discount applies to all plans
  const isDiscountGlobal = (discount: Discount): boolean => {
    return discount.applicableTo.length === 0;
  };

  // Mutation to update a discount's applicableTo
  const linkDiscountMutation = useMutation({
    mutationFn: async ({
      discountId,
      applicableTo,
    }: {
      discountId: number;
      applicableTo: string[];
    }) => {
      const res = await fetch(`http://localhost:3000/discounts/${discountId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicableTo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Server error" }));
        throw new Error(err.message || "Failed to update discount");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-discounts"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-discounts-for-plans"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      setLinkStatusMsg({
        type: "success",
        text: "Discount updated!",
      });
      setTimeout(() => setLinkStatusMsg(null), 1500);
    },
    onError: (err: any) => {
      setLinkStatusMsg({ type: "error", text: err.message });
    },
  });

  // Toggle linking a discount to a specific plan
  const toggleDiscountForPlan = (discount: Discount, planName: string) => {
    const upperPlan = planName.toUpperCase();
    let newApplicableTo: string[];

    if (isDiscountGlobal(discount)) {
      // Currently applies to all → restrict to all plans EXCEPT this one? No,
      // better UX: switch from "all plans" to only the other plans (since unchecking from all is complex)
      // For "apply to all" → "remove from this plan", we need to list ALL plan names except this one
      if (plans) {
        newApplicableTo = plans
          .map((p) => p.name.toUpperCase())
          .filter((n) => n !== upperPlan);
      } else {
        newApplicableTo = [];
      }
    } else if (discount.applicableTo.includes(upperPlan)) {
      // Remove this plan
      newApplicableTo = discount.applicableTo.filter((p) => p !== upperPlan);
    } else {
      // Add this plan
      newApplicableTo = [...discount.applicableTo, upperPlan];
    }

    linkDiscountMutation.mutate({
      discountId: discount.id,
      applicableTo: newApplicableTo,
    });
  };

  // Set discount to apply to ALL plans
  const setDiscountGlobal = (discount: Discount) => {
    linkDiscountMutation.mutate({
      discountId: discount.id,
      applicableTo: [],
    });
  };

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await fetch(`http://localhost:3000/membership-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });
      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ message: "Unknown server error" }));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(", ")
          : errData.message || "Failed to create plan";
        throw new Error(`[${res.status}] ${msg}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-membership-plans"] });
      setStatusMessage({ type: "success", text: "Tier created successfully!" });
      setTimeout(() => {
        setIsCreating(false);
        setStatusMessage(null);
      }, 1200);
    },
    onError: (err: any) => {
      setStatusMessage({ type: "error", text: err.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`http://localhost:3000/membership-plans/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ message: "Unknown server error" }));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(", ")
          : errData.message || "Failed to update plan";
        throw new Error(`[${res.status}] ${msg}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-membership-plans"] });
      setStatusMessage({ type: "success", text: "Tier updated successfully!" });
      setTimeout(() => {
        setEditingPlan(null);
        setStatusMessage(null);
      }, 1200);
    },
    onError: (err: any) => {
      console.error("Update Error:", err);
      setStatusMessage({ type: "error", text: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/membership-plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to delete plan");
      }
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-membership-plans"] });
      setEditingPlan(null);
    },
    onError: (err: any) => {
      alert(`Delete Failed: ${err.message}`);
    },
  });

  const handleDelete = (id: number) => {
    triggerConfirm({
      title: "Delete Plan",
      message:
        "Are you sure you want to delete this membership plan? This action cannot be undone.",
      type: "danger",
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      features: (plan.features || []).join("\n"),
    });
    setIsCreating(false);
    setStatusMessage(null);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      monthlyPrice: 50,
      yearlyPrice: 500,
      dailyClassLimit: 2,
      monthlyClassLimit: 20,
      features: "",
      isPopular: false,
    });
    setStatusMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name || "",
      description: formData.description || "",
      monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
      yearlyPrice: parseFloat(formData.yearlyPrice) || 0,
      dailyClassLimit: parseInt(formData.dailyClassLimit) || 0,
      monthlyClassLimit: parseInt(formData.monthlyClassLimit) || 0,
      isPopular: !!formData.isPopular,
      features: (formData.features || "")
        .split("\n")
        .filter((f: string) => f.trim() !== ""),
    };

    if (isCreating) {
      createMutation.mutate(payload);
    } else if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: payload });
    }
  };

  // Compute plan stats
  const totalPlans = plans?.length ?? 0;
  const avgPrice = plans?.length
    ? (
        plans.reduce((acc, p) => acc + p.monthlyPrice, 0) / plans.length
      ).toFixed(0)
    : "0";
  const activeDiscountsCount = activeDiscounts.length;

  const statsCards = [
    {
      label: "Active Plans",
      value: totalPlans,
      icon: Crown,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Avg. Monthly",
      value: `$${avgPrice}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Active Offers",
      value: activeDiscountsCount,
      icon: Tag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  // Helper: is a discount expired?
  const isExpired = (d: Discount) =>
    d.expiresAt ? new Date() > new Date(d.expiresAt) : false;

  return (
    <div className="space-y-6">
      {/* ─── Create / Edit Plan Modal ─── */}
      <AnimatePresence>
        {(editingPlan || isCreating) && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 md:py-20 scrollbar-hide">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="fixed inset-0 bg-black/50"
              style={{ cursor: "pointer" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-xl w-full bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {isCreating ? "New Membership" : "Edit Plan"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                    {isCreating
                      ? "Create a new pricing tier for your members"
                      : "Modify the details of this membership plan"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tier Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Premium"
                      className="rounded-lg h-10"
                    />
                  </div>
                  <div className="space-y-2 flex items-center pt-5 gap-4 px-4">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPopular: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary accent-primary"
                    />
                    <Label
                      htmlFor="isPopular"
                      className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                    >
                      <Crown className="w-4 h-4 text-amber-500" />
                      Popular
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what this tier offers..."
                    className="rounded-lg min-h-[52px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Monthly ($)
                    </Label>
                    <Input
                      type="number"
                      value={formData.monthlyPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyPrice: e.target.value,
                        })
                      }
                      className="rounded-lg h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Yearly ($)
                    </Label>
                    <Input
                      type="number"
                      value={formData.yearlyPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearlyPrice: e.target.value,
                        })
                      }
                      className="rounded-lg h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Daily Class Limit
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
                      className="rounded-lg h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Monthly Class Limit
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
                      className="rounded-lg h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tier Features (One per line)
                  </Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="Unlimited gym access&#10;Personal trainer session&#10;Nutrition plan"
                    className="rounded-lg min-h-[80px]"
                  />
                </div>

                {statusMessage && (
                  <div
                    className={`text-sm rounded-lg px-4 py-3 ${
                      statusMessage.type === "error"
                        ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                        : "bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPlan(null);
                      setIsCreating(false);
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
                        {isCreating ? "Create Tier" : "Save Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Link Discount Modal ─── */}
      <AnimatePresence>
        {linkingPlan && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setLinkingPlan(null);
                setLinkStatusMsg(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              style={{ cursor: "pointer" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-lg w-full bg-card border border-border rounded-xl p-6 shadow-lg overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "85vh" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Apply{" "}
                    <span className="text-green-600 dark:text-green-500">
                      Discounts
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage discounts for{" "}
                    <span className="text-primary font-medium">
                      {linkingPlan.name}
                    </span>{" "}
                    plan
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLinkingPlan(null);
                    setLinkStatusMsg(null);
                  }}
                  className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors border border-border text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {linkStatusMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`text-xs font-bold rounded-xl px-4 py-2.5 mb-4 ${
                      linkStatusMsg.type === "error"
                        ? "bg-red-500/10 border border-red-500/20 text-red-400"
                        : "bg-green-500/10 border border-green-500/20 text-green-400"
                    }`}
                  >
                    {linkStatusMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-500" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Linked to this plan
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                    <Globe className="w-3 h-3 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Applies to all plans
                  </span>
                </div>
              </div>

              {/* Discount List */}
              <div className="space-y-3">
                {!allDiscounts || allDiscounts.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm font-medium">
                    No Discounts Found — Create One First
                  </div>
                ) : (
                  [...(allDiscounts ?? [])]
                    .sort((a, b) => {
                      const aApplies =
                        isDiscountLinkedToPlan(a, linkingPlan.name) ||
                        isDiscountGlobal(a);
                      const bApplies =
                        isDiscountLinkedToPlan(b, linkingPlan.name) ||
                        isDiscountGlobal(b);
                      if (aApplies && !bApplies) return -1;
                      if (!aApplies && bApplies) return 1;

                      // Secondary sort: active status
                      if (a.isActive && !b.isActive) return -1;
                      if (!a.isActive && b.isActive) return 1;

                      return 0;
                    })
                    .map((discount) => {
                    const isLinked = isDiscountLinkedToPlan(
                      discount,
                      linkingPlan.name,
                    );
                    const isGlobal = isDiscountGlobal(discount);
                    const appliesToThisPlan = isLinked || isGlobal;
                    const expired = isExpired(discount);

                    return (
                      <motion.div
                        key={discount.id}
                        layout
                        className={`relative p-4 rounded-lg border transition-all duration-200 ${
                          appliesToThisPlan
                            ? isGlobal
                              ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20"
                              : "bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20"
                            : "bg-card border-border hover:border-foreground/20"
                        } ${expired ? "opacity-50" : ""} ${
                          !discount.isActive ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Discount Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                discount.type === "PERCENTAGE"
                                  ? "bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-500"
                                  : "bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-500"
                              }`}
                            >
                              {discount.type === "PERCENTAGE" ? (
                                <Percent className="w-5 h-5" />
                              ) : (
                                <DollarSign className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-foreground font-mono">
                                  {discount.code}
                                </span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                                  {discount.type === "PERCENTAGE"
                                    ? `${discount.value}% OFF`
                                    : `$${discount.value} OFF`}
                                </span>
                                {discount.isAutomatic && (
                                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded leading-none">
                                    AUTO
                                  </span>
                                )}
                                {!discount.isActive && (
                                  <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded leading-none">
                                    INACTIVE
                                  </span>
                                )}
                                {expired && (
                                  <span className="text-[10px] font-semibold text-red-600 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded leading-none">
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                              {discount.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-[250px] mt-0.5">
                                  {discount.description}
                                </div>
                              )}
                              {/* Scope Info */}
                              <div className="text-[11px] font-medium text-muted-foreground mt-1">
                                {isGlobal ? (
                                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Globe className="w-3 h-3" />
                                    All Plans
                                  </span>
                                ) : discount.applicableTo.length > 0 ? (
                                  <span>
                                    Plans: {discount.applicableTo.join(", ")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Toggle link to this specific plan */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                toggleDiscountForPlan(
                                  discount,
                                  linkingPlan.name,
                                )
                              }
                              disabled={linkDiscountMutation.isPending}
                              title={
                                appliesToThisPlan
                                  ? `Unlink from ${linkingPlan.name}`
                                  : `Link to ${linkingPlan.name}`
                              }
                              className={`h-9 w-9 ${
                                isLinked
                                  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  : isGlobal
                                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    : "text-muted-foreground hover:text-green-600 hover:bg-green-50 hover:border-green-200"
                              }`}
                            >
                              {linkDiscountMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : appliesToThisPlan ? (
                                <Link2 className="w-4 h-4" />
                              ) : (
                                <Unlink2 className="w-4 h-4" />
                              )}
                            </Button>

                            {/* Apply to All Plans button */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDiscountGlobal(discount)}
                              disabled={
                                linkDiscountMutation.isPending || isGlobal
                              }
                              title="Apply to all plans"
                              className={`h-9 w-9 ${
                                isGlobal
                                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-500 cursor-default"
                                  : "text-muted-foreground hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                              }`}
                            >
                              <Globe className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 mt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLinkingPlan(null);
                    setLinkStatusMsg(null);
                  }}
                  className="w-full h-10 rounded-lg font-semibold"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
      </AnimatePresence>

      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <AdminPageHeader
          title="Pricing"
          highlight="Tiers"
          subtitle="Manage Membership Plans & Connected Discounts"
        />
        <Button
          onClick={handleCreate}
          className="h-10 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Tier
        </Button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border border-border rounded-xl p-6 flex items-center gap-4`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}
            >
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {s.label}
              </div>
              <div className="text-2xl font-bold text-foreground mt-0.5">
                {s.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Plans Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[420px] bg-foreground/5 rounded-[2rem] animate-pulse"
            />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest border border-red-500/10 rounded-3xl bg-red-500/5">
            Operational Error: {(error as any).message}
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="col-span-full py-20 text-center text-foreground/20 uppercase font-black text-xs tracking-widest">
            No Tiers Configured — Create Your First Plan
          </div>
        ) : (
          plans.map((plan, index) => {
            const planDiscounts = getDiscountsForPlan(plan.name);
            const effectiveDiscount =
              planDiscounts.find((d) => d.type === "PERCENTAGE")?.value ?? 0;
            const discountedPrice =
              effectiveDiscount > 0
                ? plan.monthlyPrice * (1 - effectiveDiscount / 100)
                : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`flex flex-col overflow-hidden rounded-xl border bg-card hover:shadow-md transition-all duration-200 ${
                  plan.isPopular
                    ? "border-primary ring-1 ring-primary"
                    : "border-border"
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="bg-[#2563EB] text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Recommended
                  </div>
                )}

                <div
                  className={`p-6 flex-1 flex flex-col ${plan.isPopular ? "pt-5" : ""}`}
                >
                  {/* Plan Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {plan.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                          {plan.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-6 bg-muted/30 -mx-6 p-6 border-y border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      {effectiveDiscount > 0 ? (
                        <>
                          <span className="text-3xl font-extrabold text-foreground">
                            ${discountedPrice.toFixed(0)}
                          </span>
                          <span className="text-lg font-medium text-muted-foreground line-through opacity-50">
                            ${plan.monthlyPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-extrabold text-foreground">
                          ${plan.monthlyPrice}
                        </span>
                      )}
                      <span className="text-sm font-bold text-muted-foreground">/mo</span>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground/60">
                       billed annually as ${plan.yearlyPrice}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/40">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Daily Cap</div>
                        <div className="text-sm font-bold">{plan.dailyClassLimit} Classes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/40">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Monthly</div>
                        <div className="text-sm font-bold">{plan.monthlyClassLimit} Sessions</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-8 space-y-3">
                      {plan.features.slice(0, 4).map((f, fi) => (
                        <div key={fi} className="flex items-start gap-3">
                          <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-foreground/70">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discount Badge */}
                  {planDiscounts.length > 0 && (
                    <div className="mb-6 space-y-2">
                      <button
                        onClick={() => setLinkingPlan(plan)}
                        title="Click to view and manage all active offers"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-colors active:scale-95 group/offer"
                      >
                        <Tag className="w-3.5 h-3.5 group-hover/offer:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {planDiscounts.length} Active Offer(s)
                        </span>
                      </button>
                      
                      {/* Quick view of codes */}
                      <div className="flex flex-wrap gap-1.5">
                        {planDiscounts.slice(0, 3).map((d) => (
                          <span 
                            key={d.id} 
                            className="px-2 py-0.5 rounded bg-foreground/5 border border-border/50 text-[10px] font-mono font-bold text-muted-foreground"
                          >
                            {d.code}
                          </span>
                        ))}
                        {planDiscounts.length > 3 && (
                          <span className="text-[10px] font-bold text-muted-foreground/40 self-center">
                            +{planDiscounts.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-5 mt-auto border-t border-border/50">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                      <Clock className="w-3 h-3" />
                      {new Date(plan.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLinkingPlan(plan)}
                        className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                        className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleteMutation.isPending}
                        className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
