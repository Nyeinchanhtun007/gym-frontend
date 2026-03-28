import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Calendar, Edit3, X, Users, Plus, User } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdminClasses() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isReassigning, setIsReassigning] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");

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
    type: "warning",
  });

  const triggerConfirm = useCallback(
    (config: Omit<typeof confirmConfig, "isOpen">) => {
      setConfirmConfig({ ...config, isOpen: true });
    },
    [],
  );

  const {
    data: classes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch classes");
      }
      return res.json();
    },
  });

  const { data: trainers } = useQuery({
    queryKey: ["admin-trainers-list"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/users/trainers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch trainers");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await fetch(`http://localhost:3000/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error("Failed to create class");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const id = editingClass?.id || isReassigning?.id;
      const res = await fetch(`http://localhost:3000/classes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update class");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
      setEditingClass(null);
      setIsReassigning(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete class");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    },
  });

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      description: cls.description,
      capacity: cls.capacity,
      schedule: new Date(cls.schedule).toISOString().slice(0, 16),
      trainerId: cls.trainerId,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      capacity: 20,
      schedule: new Date().toISOString().slice(0, 16),
      trainerId: trainers?.items?.[0]?.id || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity),
      trainerId: parseInt(formData.trainerId),
    };

    if (isCreating) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const classData = (classes?.items || classes?.data || []) as any[];

  const filteredClasses = classData.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Class"
        highlight="Schedules"
        subtitle="Manage fitness sessions, trainers, and registration limits"
      />

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <TacticalSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search classes or trainers..."
          className="w-full md:w-96"
        />

        <Button
          onClick={handleCreate}
          className="w-full md:w-auto px-6 h-11 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Create New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-card border border-border rounded-2xl animate-pulse"
            />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center text-destructive bg-destructive/5 rounded-2xl border border-destructive/10 font-medium">
            Error: {error.message}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-border border-dashed font-medium">
            No classes found matching your search
          </div>
        ) : (
          filteredClasses.map((item: any) => (
            <div
              key={item.id}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Session #{item.id}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsReassigning(item)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="Change Trainer"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="Edit Class"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                  {item.description ||
                    "No description available for this session."}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {new Date(item.schedule).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">
                      {new Date(item.schedule).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {item.capacity} Spots Limit
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">
                      Maximum Capacity
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {item.trainer?.name || "Unassigned"}
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">
                      Assigned Trainer
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                  Active
                </span>
                <button
                  onClick={() => {
                    triggerConfirm({
                      title: "Delete Class",
                      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
                      type: "danger",
                      onConfirm: () => deleteMutation.mutate(item.id),
                    });
                  }}
                  className="text-[10px] font-bold text-destructive hover:scale-105 transition-transform uppercase tracking-wider"
                >
                  Delete Session
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reassign Modal */}
      <AnimatePresence>
        {isReassigning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              style={{ cursor: "pointer" }}
              onClick={() => setIsReassigning(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-md w-full bg-card border border-border rounded-xl p-6 md:p-8 shadow-xl overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Assign <span className="text-primary">Trainer</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                    Select an instructor for "{isReassigning.name}"
                  </p>
                </div>
                <button
                  onClick={() => setIsReassigning(null)}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                {trainers?.items?.map((trainer: any) => {
                  const isCurrent = trainer.id === isReassigning.trainerId;
                  return (
                    <button
                      key={trainer.id}
                      disabled={isCurrent || updateMutation.isPending}
                      onClick={() => {
                        updateMutation.mutate({ trainerId: trainer.id });
                      }}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all text-left ${
                        isCurrent
                          ? "bg-primary/5 border-primary/20 cursor-default"
                          : "bg-muted/30 border-transparent hover:border-primary/20 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 font-bold text-primary">
                          {trainer.photo ? (
                            <img
                              src={trainer.photo}
                              alt={trainer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            trainer.name?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-tight">
                            {trainer.name}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                            Professional Trainer
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="px-2 py-1 rounded bg-primary/10 text-primary text-[8px] font-black uppercase">
                          Current
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button
                  onClick={() => setIsReassigning(null)}
                  variant="outline"
                  className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold text-xs transition-all"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(editingClass || isCreating) && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 md:py-20 scrollbar-hide">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingClass(null);
                setIsCreating(false);
              }}
              className="fixed inset-0 bg-black/50"
              style={{ cursor: "pointer" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-lg w-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {isCreating ? "New" : "Edit"} Class
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                    {isCreating
                      ? "Set up a new fitness session in the system"
                      : `Updating details for class ID #${editingClass.id}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingClass(null);
                    setIsCreating(false);
                  }}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Class Name
                  </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full h-10 bg-background border border-border rounded-xl px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium transition-colors"
                    placeholder="e.g. Morning Yoga Flow"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Description
                  </Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="min-h-[100px] w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-medium contrast-more:border-primary/20"
                    placeholder="Provide a brief overview..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">
                      Student Capacity
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        required
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({ ...formData, capacity: e.target.value })
                        }
                        className="w-full h-10 bg-background border border-border rounded-xl pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                      />
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">
                      Instructor
                    </Label>
                    <div className="relative">
                      <select
                        required
                        value={formData.trainerId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            trainerId: e.target.value,
                          })
                        }
                        className="w-full h-10 bg-background border border-border rounded-xl pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer font-medium"
                      >
                        {trainers?.items?.map((t: any) => (
                          <option key={t.id} value={t.id} className="bg-card">
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Schedule Date & Time
                  </Label>
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      required
                      value={formData.schedule}
                      onChange={(e) =>
                        setFormData({ ...formData, schedule: e.target.value })
                      }
                      className="w-full h-10 bg-background border border-border rounded-xl pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                 <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingClass(null);
                      setIsCreating(false);
                    }}
                    className="px-6 h-10 rounded-xl border border-border text-foreground hover:bg-muted font-bold text-xs transition-all shadow-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      updateMutation.isPending || createMutation.isPending
                    }
                    className="px-6 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-xs shadow-md shadow-primary/10 disabled:opacity-50 active:scale-95"
                  >
                    {updateMutation.isPending || createMutation.isPending
                      ? "Saving..."
                      : isCreating
                        ? "Create Class"
                        : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </div>
  );
}
