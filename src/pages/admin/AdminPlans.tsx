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
  ChevronRight,
  Clock,
  CheckCircle2,
  BarChart3,
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
import TacticalConfirmModal from "@/components/admin/TacticalConfirmModal";

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
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
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
        d.applicableTo.includes(planName.toUpperCase())
    );
  };

  // Check if a discount is specifically linked to a plan (not via "all plans")
  const isDiscountLinkedToPlan = (
    discount: Discount,
    planName: string
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
      const res = await fetch(
        `http://localhost:3000/discounts/${discountId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicableTo }),
        }
      );
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
      message: "Are you sure you want to delete this membership plan? This action cannot be undone.",
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
  const popularPlans = plans?.filter((p) => p.isPopular).length ?? 0;
  const avgPrice = plans?.length
    ? (
        plans.reduce((acc, p) => acc + p.monthlyPrice, 0) / plans.length
      ).toFixed(0)
    : "0";
  const activeDiscountsCount = activeDiscounts.length;

  const statsCards = [
    {
      label: "Total Plans",
      value: totalPlans,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: "Popular Plans",
      value: popularPlans,
      icon: Crown,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Avg. Price",
      value: `$${avgPrice}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Active Discounts",
      value: activeDiscountsCount,
      icon: Tag,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
  ];

  const getPlanGradient = (index: number) => {
    const gradients = [
      "from-blue-500/10 via-transparent to-cyan-500/5",
      "from-purple-500/10 via-transparent to-pink-500/5",
      "from-emerald-500/10 via-transparent to-teal-500/5",
      "from-amber-500/10 via-transparent to-orange-500/5",
      "from-rose-500/10 via-transparent to-red-500/5",
    ];
    return gradients[index % gradients.length];
  };

  const getPlanAccent = (index: number) => {
    const accents = [
      {
        text: "text-blue-400",
        border: "border-blue-500/30",
        bg: "bg-blue-500/10",
      },
      {
        text: "text-purple-400",
        border: "border-purple-500/30",
        bg: "bg-purple-500/10",
      },
      {
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
      },
      {
        text: "text-amber-400",
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
      },
      {
        text: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/10",
      },
    ];
    return accents[index % accents.length];
  };

  // Helper: is a discount expired?
  const isExpired = (d: Discount) =>
    d.expiresAt ? new Date() > new Date(d.expiresAt) : false;

  return (
    <div className="space-y-6">
      {/* ─── Create / Edit Plan Modal ─── */}
      <AnimatePresence>
        {(editingPlan || isCreating) && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              style={{ cursor: "pointer" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-xl w-full bg-card border border-border rounded-[2rem] p-6 shadow-2xl overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "90vh" }}
            >
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-foreground italic tracking-tighter uppercase">
                    {isCreating ? "Create" : "Edit"}{" "}
                    <span className="text-primary text-neon">Tier</span>
                  </h2>
                  <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">
                    {isCreating
                      ? "Configure a new membership tier"
                      : "Modify existing tier settings"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors border border-border text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                      Tier Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Premium"
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground font-outfit"
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
                      className="w-5 h-5 rounded border-border bg-foreground/5 text-primary focus:ring-primary accent-[hsl(var(--primary))]"
                    />
                    <Label
                      htmlFor="isPopular"
                      className="text-[10px] font-black uppercase tracking-widest text-foreground/50 cursor-pointer flex items-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Popular
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what this tier offers..."
                    className="bg-foreground/5 border-border rounded-xl min-h-[52px] font-bold focus:border-primary text-foreground font-outfit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
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
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground font-outfit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
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
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground font-outfit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
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
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground font-outfit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
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
                      className="bg-foreground/5 border-border rounded-xl h-10 font-bold focus:border-primary text-foreground font-outfit"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                    Tier Features (One per line)
                  </Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="Unlimited gym access&#10;Personal trainer session&#10;Nutrition plan"
                    className="bg-foreground/5 border-border rounded-xl min-h-[80px] font-bold focus:border-primary text-foreground font-outfit"
                  />
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
                      setEditingPlan(null);
                      setIsCreating(false);
                    }}
                    className="flex-1 h-10 rounded-xl border-border hover:bg-foreground/10 hover:border-border transition-all font-black uppercase tracking-widest text-[10px] text-foreground"
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
                        {isCreating ? "Create Tier" : "Update Tier"}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-card border border-border rounded-[2rem] p-6 shadow-2xl overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "85vh" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-black text-foreground italic tracking-tighter uppercase">
                    Apply <span className="text-green-400">Discounts</span>
                  </h2>
                  <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">
                    Manage discounts for{" "}
                    <span className="text-primary font-black">
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
              <div className="flex flex-wrap gap-3 mb-4 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                    <Check className="w-2 h-2 text-green-400" />
                  </div>
                  <span className="text-[9px] font-bold text-foreground/40 uppercase">
                    Linked to this plan
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <Globe className="w-2 h-2 text-blue-400" />
                  </div>
                  <span className="text-[9px] font-bold text-foreground/40 uppercase">
                    Applies to all plans
                  </span>
                </div>
              </div>

              {/* Discount List */}
              <div className="space-y-2">
                {!allDiscounts || allDiscounts.length === 0 ? (
                  <div className="text-center py-10 text-foreground/20 uppercase font-black text-xs tracking-widest">
                    No Discounts Found — Create One First
                  </div>
                ) : (
                  allDiscounts.map((discount) => {
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
                        className={`relative p-4 rounded-xl border transition-all duration-300 ${
                          appliesToThisPlan
                            ? isGlobal
                              ? "bg-blue-500/5 border-blue-500/20"
                              : "bg-green-500/5 border-green-500/20"
                            : "bg-foreground/[0.02] border-border/50 hover:border-border"
                        } ${expired ? "opacity-50" : ""} ${
                          !discount.isActive ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Discount Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                discount.type === "PERCENTAGE"
                                  ? "bg-green-500/10 border-green-500/20"
                                  : "bg-blue-500/10 border-blue-500/20"
                              }`}
                            >
                              {discount.type === "PERCENTAGE" ? (
                                <Percent className="w-4 h-4 text-green-400" />
                              ) : (
                                <DollarSign className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-foreground uppercase tracking-tight font-mono">
                                  {discount.code}
                                </span>
                                <span className="text-xs font-black text-green-400">
                                  {discount.type === "PERCENTAGE"
                                    ? `${discount.value}% OFF`
                                    : `$${discount.value} OFF`}
                                </span>
                                {discount.isAutomatic && (
                                  <span className="text-[7px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded leading-none">
                                    AUTO
                                  </span>
                                )}
                                {!discount.isActive && (
                                  <span className="text-[7px] font-black text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-1.5 py-0.5 rounded leading-none">
                                    INACTIVE
                                  </span>
                                )}
                                {expired && (
                                  <span className="text-[7px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded leading-none">
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                              {discount.description && (
                                <div className="text-[10px] font-bold text-foreground/30 truncate max-w-[200px]">
                                  {discount.description}
                                </div>
                              )}
                              {/* Scope Info */}
                              <div className="text-[9px] font-bold text-foreground/25 mt-0.5 uppercase">
                                {isGlobal ? (
                                  <span className="flex items-center gap-1 text-blue-400/70">
                                    <Globe className="w-2.5 h-2.5" />
                                    All Plans
                                  </span>
                                ) : discount.applicableTo.length > 0 ? (
                                  <span className="text-foreground/35">
                                    Plans: {discount.applicableTo.join(", ")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Toggle link to this specific plan */}
                            <button
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
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
                                isLinked
                                  ? "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                                  : isGlobal
                                    ? "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                                    : "bg-foreground/5 border-border text-foreground/40 hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400"
                              }`}
                            >
                              {linkDiscountMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : appliesToThisPlan ? (
                                <Link2 className="w-4 h-4" />
                              ) : (
                                <Unlink2 className="w-4 h-4" />
                              )}
                            </button>

                            {/* Apply to All Plans button */}
                            <button
                              onClick={() => setDiscountGlobal(discount)}
                              disabled={
                                linkDiscountMutation.isPending || isGlobal
                              }
                              title="Apply to all plans"
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
                                isGlobal
                                  ? "bg-blue-500/20 border-blue-500/30 text-blue-400 cursor-default"
                                  : "bg-foreground/5 border-border text-foreground/40 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-400"
                              }`}
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 mt-4 border-t border-border/50">
                <Button
                  onClick={() => {
                    setLinkingPlan(null);
                    setLinkStatusMsg(null);
                  }}
                  className="w-full h-10 rounded-xl bg-foreground/5 text-foreground border border-border font-black uppercase tracking-widest text-[10px] hover:bg-foreground/10"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        <TacticalConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() =>
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
          }
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
        <button
          onClick={handleCreate}
          className="h-12 px-8 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Create New Tier
        </button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card/50 backdrop-blur-2xl border rounded-[1.5rem] p-4 flex items-center gap-4 ${s.bg}`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-foreground/5 border border-border`}
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
            const accent = getPlanAccent(index);
            const gradient = getPlanGradient(index);
            const planDiscounts = getDiscountsForPlan(plan.name);
            const isExpanded = expandedPlan === plan.id;
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
                className={`relative overflow-hidden group rounded-[2rem] border border-border bg-card/50 backdrop-blur-2xl hover:border-border/80 transition-all duration-500 ${
                  plan.isPopular ? "ring-1 ring-primary/30" : ""
                }`}
              >
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
                />

                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground px-4 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Crown className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                          Most Popular
                        </span>
                        <Crown className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`relative p-7 ${plan.isPopular ? "pt-12" : ""}`}
                >
                  {/* Plan Header */}
                  <div className="mb-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-foreground italic tracking-tighter uppercase group-hover:text-primary transition-colors duration-300">
                          {plan.name}
                        </h3>
                        <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest line-clamp-2 leading-relaxed mt-1 max-w-[220px]">
                          {plan.description || "No description"}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center`}
                      >
                        <Star className={`w-5 h-5 ${accent.text}`} />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Monthly Price */}
                      <div className="bg-foreground/[0.03] p-4 rounded-2xl border border-border/50 relative">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30 block mb-1.5">
                          Monthly
                        </span>
                        <div className="flex items-baseline gap-1">
                          {effectiveDiscount > 0 ? (
                            <>
                              <span className="text-xl font-black text-foreground">
                                ${discountedPrice.toFixed(0)}
                              </span>
                              <span className="text-xs font-bold text-foreground/30 line-through">
                                ${plan.monthlyPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-black text-foreground">
                              ${plan.monthlyPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-foreground/20 uppercase">
                          /month
                        </span>
                      </div>

                      {/* Yearly Price */}
                      <div className="bg-foreground/[0.03] p-4 rounded-2xl border border-border/50 relative">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30 block mb-1.5">
                          Yearly
                        </span>
                        <span className="text-xl font-black text-foreground block">
                          ${plan.yearlyPrice}
                        </span>
                        <span className="text-[8px] font-bold text-foreground/20 uppercase">
                          /year
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discount & Class Limits */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="bg-foreground/[0.03] px-3 py-2.5 rounded-xl border border-border/50 text-center relative">
                      <Tag className="w-3 h-3 text-green-400 mx-auto mb-1" />
                      <span className="text-xs font-black text-green-400 block">
                        {planDiscounts.length}
                      </span>
                      <span className="text-[7px] font-bold text-foreground/25 uppercase block">
                        Discounts
                      </span>
                      {planDiscounts.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="bg-foreground/[0.03] px-3 py-2.5 rounded-xl border border-border/50 text-center">
                      <Zap className="w-3 h-3 text-amber-400 mx-auto mb-1" />
                      <span className="text-xs font-black text-foreground block">
                        {plan.dailyClassLimit}
                      </span>
                      <span className="text-[7px] font-bold text-foreground/25 uppercase block">
                        Daily
                      </span>
                    </div>
                    <div className="bg-foreground/[0.03] px-3 py-2.5 rounded-xl border border-border/50 text-center">
                      <CalendarDays className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                      <span className="text-xs font-black text-foreground block">
                        {plan.monthlyClassLimit}
                      </span>
                      <span className="text-[7px] font-bold text-foreground/25 uppercase block">
                        Monthly
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-5">
                      <button
                        onClick={() =>
                          setExpandedPlan(isExpanded ? null : plan.id)
                        }
                        className="flex items-center gap-2 w-full text-left mb-2 group/feat"
                      >
                        <Sparkles className="w-3 h-3 text-foreground/30" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30 group-hover/feat:text-foreground/50 transition-colors">
                          Features ({plan.features.length})
                        </span>
                        <ChevronRight
                          className={`w-3 h-3 text-foreground/30 transition-transform duration-200 ml-auto ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            {plan.features.map((f, fi) => (
                              <div
                                key={fi}
                                className="flex items-center gap-2 pl-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                                <span className="text-[10px] font-bold text-foreground/50">
                                  {f}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ─── Connected Discounts Section ─── */}
                  <div className="mb-5">
                    {planDiscounts.length > 0 ? (
                      <div className="p-3 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-green-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-400">
                              Active Discounts ({planDiscounts.length})
                            </span>
                          </div>
                          <button
                            onClick={() => setLinkingPlan(plan)}
                            className="text-[8px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            <Link2 className="w-3 h-3" />
                            Manage
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {planDiscounts.map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center gap-1.5 bg-foreground/5 border border-border/50 rounded-lg px-2.5 py-1"
                            >
                              {d.isAutomatic ? (
                                <Zap className="w-2.5 h-2.5 text-amber-400" />
                              ) : (
                                <Tag className="w-2.5 h-2.5 text-green-400" />
                              )}
                              <span className="text-[8px] font-black text-foreground/60 font-mono uppercase">
                                {d.code}
                              </span>
                              <span className="text-[8px] font-black text-green-400">
                                {d.type === "PERCENTAGE"
                                  ? `${d.value}%`
                                  : `$${d.value}`}
                              </span>
                              {d.applicableTo.length === 0 && (
                                <span className="text-[7px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1 py-0.5 rounded leading-none">
                                  ALL
                                </span>
                              )}
                              {d.isAutomatic && (
                                <span className="text-[7px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded leading-none">
                                  AUTO
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setLinkingPlan(plan)}
                        className="w-full p-3 rounded-xl border border-dashed border-border/50 hover:border-primary/30 text-foreground/25 hover:text-primary/50 transition-all flex items-center justify-center gap-2 group/link"
                      >
                        <Link2 className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Apply Discount
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      {plan.isPopular && (
                        <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          Popular
                        </span>
                      )}
                      <span className="text-[8px] font-bold text-foreground/20 uppercase flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(plan.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLinkingPlan(plan)}
                        title="Apply Discount"
                        className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-all border border-border hover:border-green-500/30 hover:scale-110"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(plan)}
                        title="Edit Plan"
                        className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all border border-border hover:border-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete Plan"
                        className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all border border-border hover:border-destructive hover:scale-110 hover:shadow-lg hover:shadow-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
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
