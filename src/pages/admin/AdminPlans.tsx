import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  CreditCard,
  Edit3,
  X,
  Save,
  Trash2,
  Plus,
  Percent,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPlans() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-membership-plans"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/membership-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
  });

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

  const handleEdit = (plan: any) => {
    console.log("Edit button clicked for planID:", plan.id);
    setEditingPlan(plan);
    setFormData({
      ...plan,
      features: (plan.features || []).join("\n"),
    });
    setIsCreating(false);
    setStatusMessage(null);
  };

  const handleCreate = () => {
    console.log("Create New Tier button clicked");
    setEditingPlan(null);
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      monthlyPrice: 50,
      yearlyPrice: 500,
      discount: 0,
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
      discount: parseFloat(formData.discount) || 0,
      dailyClassLimit: parseInt(formData.dailyClassLimit) || 0,
      monthlyClassLimit: parseInt(formData.monthlyClassLimit) || 0,
      isPopular: !!formData.isPopular,
      features: (formData.features || "")
        .split("\n")
        .filter((f: string) => f.trim() !== ""),
    };

    console.log("Submitting Payload:", payload);
    if (isCreating) {
      createMutation.mutate(payload);
    } else if (editingPlan) {
      console.log("Updating Plan ID:", editingPlan.id);
      updateMutation.mutate({ id: editingPlan.id, data: payload });
    }
  };

  return (
    <div className="space-y-8 relative">
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
              className="relative max-w-xl w-full bg-zinc-950 border border-white/10 rounded-[2rem] p-5 shadow-2xl overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                    {isCreating ? "Establish" : "Modify"}{" "}
                    <span className="text-primary">Tier</span>
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Tier Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 font-bold focus:border-primary"
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
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor="isPopular"
                      className="text-[10px] font-black uppercase tracking-widest text-white/50 cursor-pointer"
                    >
                      Popular Option
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-white/5 border-white/10 rounded-xl min-h-[52px] font-bold focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Monthly Price ($)
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
                      className="bg-white/5 border-white/10 rounded-xl h-9 font-bold focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Yearly Price ($)
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
                      className="bg-white/5 border-white/10 rounded-xl h-9 font-bold focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Discount (%)
                    </Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                      className="bg-white/5 border-white/10 rounded-xl h-9 font-bold focus:border-primary text-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
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
                      className="bg-white/5 border-white/10 rounded-xl h-9 font-bold focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
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
                      className="bg-white/5 border-white/10 rounded-xl h-9 font-bold focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Tier Features (One per line)
                  </Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    className="bg-white/5 border-white/10 rounded-xl min-h-[64px] font-bold focus:border-primary text-sm"
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
                  {!isCreating && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (
                          confirm("Decommission this pricing tier permanently?")
                        ) {
                          deleteMutation.mutate(editingPlan.id);
                        }
                      }}
                      className="flex-1 h-10 rounded-xl border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-black uppercase tracking-widest text-xs"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-[2] h-10 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? "Create" : "Update"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Pricing <span className="text-primary">Architecture</span>
          </h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-[10px] font-bold">
            Configure Membership Tiers & Tactical Discounts
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="h-12 px-8 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse"
            />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest border border-red-500/10 rounded-3xl bg-red-500/5">
            Operational Error: {(error as any).message}
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/20 uppercase font-black text-xs tracking-widest">
            No Tiers Configured
          </div>
        ) : (
          plans.map((plan: any) => (
            <div
              key={plan.id}
              className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:text-primary transition-all text-white/10">
                <CreditCard className="w-12 h-12" />
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2 group-hover:text-primary transition-colors">
                  {plan.name}
                </h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest line-clamp-2 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 block mb-1">
                    Monthly
                  </span>
                  <span className="text-sm font-black text-white">
                    ${plan.monthlyPrice}
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 relative">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 block mb-1">
                    Discount
                  </span>
                  <span className="text-sm font-black text-green-500">
                    {plan.discount}%
                  </span>
                  {plan.discount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-black rounded-full p-1 shadow-lg">
                      <Percent className="w-2 h-2" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  {plan.isPopular && (
                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Popular Choice
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(plan)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
