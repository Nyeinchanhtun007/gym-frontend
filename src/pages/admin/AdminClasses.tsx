import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar,
  Dumbbell,
  Edit3,
  X,
  Save,
  Trash2,
  UserPlus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminClasses() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isReassigning, setIsReassigning] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

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
      const res = await fetch(
        `http://localhost:3000/classes/${editingClass.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        },
      );
      if (!res.ok) throw new Error("Failed to update class");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
      setEditingClass(null);
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

  const classData = classes?.items || classes?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Classes <span className="text-primary">Schedules</span>
          </h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-[10px] font-bold">
            Live Deployment & Session Monitoring
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="h-12 px-8 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform"
        >
          Create New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-white/5 rounded-3xl animate-pulse"
            />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest border border-red-500/10 rounded-3xl bg-red-500/5">
            Operational Error: {error.message}
          </div>
        ) : classData.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/20 uppercase font-black text-xs tracking-widest">
            No Active Sessions
          </div>
        ) : (
          classData.map((item: any) => (
            <div
              key={item.id}
              className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group"
            >
              {/* <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:text-primary transition-all text-white/10">
                <Dumbbell className="w-8 h-8" />
              </div> */}

              <div className="mb-8">
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest line-clamp-2 leading-relaxed">
                  {item.description ||
                    "Standard tactical training session for elite operatives."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 block mb-1">
                    Capacity
                  </span>
                  <span className="text-sm font-black text-white group-hover:text-primary transition-colors">
                    {item.capacity} LIMIT
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 block mb-1">
                    Status
                  </span>
                  <span className="text-sm font-black text-green-500 uppercase">
                    Deployed
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">
                      {new Date(item.schedule).toLocaleDateString()}
                    </div>
                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                      Schedule Log
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReassigning(item)}
                    title="Transfer Command"
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 text-white/40 hover:text-primary transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
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
              onClick={() => setIsReassigning(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative max-w-md w-full bg-zinc-950 border border-white/10 rounded-[2rem] p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                    Transfer <span className="text-primary">Command</span>
                  </h2>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    Re-assign Tactical Instructor
                  </p>
                </div>
                <button
                  onClick={() => setIsReassigning(null)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {trainers?.items?.map((trainer: any) => {
                  const isCurrent = trainer.id === isReassigning.trainerId;
                  return (
                    <button
                      key={trainer.id}
                      disabled={isCurrent || updateMutation.isPending}
                      onClick={() => {
                        updateMutation.mutate({ trainerId: trainer.id });
                        // We need to set editingClass locally for the mutation logic in updateMutation
                        setEditingClass(isReassigning);
                        setIsReassigning(null);
                      }}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between group transition-all ${
                        isCurrent
                          ? "bg-primary/5 border-primary/20 cursor-default"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                          {trainer.photo ? (
                            <img
                              src={trainer.photo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            trainer.name?.[0]
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase italic tracking-tight">
                            {trainer.name}
                          </p>
                          <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">
                            Operative Rank 1
                          </p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => setIsReassigning(null)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  Cancel Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(editingClass || isCreating) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingClass(null);
                setIsCreating(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-xl w-full bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Decorative Corner Brackets */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/20 rounded-tl-[3rem] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-primary/20 rounded-br-[3rem] pointer-events-none" />

              <div className="absolute top-0 right-0 p-10 text-primary opacity-[0.03] pointer-events-none">
                <Dumbbell className="w-40 h-40 rotate-12" />
              </div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">
                      SYSTEM PROTOCOL // ALPHA-7
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {isCreating ? "Establish" : "Modify"}{" "}
                    <span className="text-primary text-neon">Session</span>
                  </h2>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">
                    {isCreating
                      ? "Initiating New Combat Deployment Protocol"
                      : `Syncing Parameters for Class ID: #${editingClass.id}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingClass(null);
                    setIsCreating(false);
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center transition-all group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto scrollbar-hide"
              >
                <div className="space-y-2 group">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-focus-within:text-primary transition-colors">
                    Deployment Designation
                  </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/[0.03] border-white/10 rounded-2xl h-14 font-black italic tracking-tight text-lg text-white placeholder:text-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="e.g. ADVANCED CROSSFIT ALPHA"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-focus-within:text-primary transition-colors">
                    Mission Intelligence Briefing
                  </Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-white/[0.03] border-white/10 rounded-2xl min-h-[120px] font-bold text-sm text-white/80 placeholder:text-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all p-5 leading-relaxed"
                    placeholder="Describe the tactical objectives and training intensity..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-focus-within:text-primary transition-colors">
                      Operative Limit
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        required
                        value={formData.capacity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, capacity: e.target.value })
                        }
                        className="bg-white/[0.03] border-white/10 rounded-2xl h-14 font-black italic text-lg focus:border-primary/50 transition-all pl-12"
                      />
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-focus-within:text-primary transition-colors">
                      Lead Instructor
                    </Label>
                    <div className="relative">
                      <select
                        required
                        value={formData.trainerId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setFormData({
                            ...formData,
                            trainerId: e.target.value,
                          })
                        }
                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-12 text-sm font-black text-white uppercase italic focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                      >
                        {trainers?.items?.map((t: any) => (
                          <option
                            key={t.id}
                            value={t.id}
                            className="bg-zinc-900 font-bold"
                          >
                            COMMANDER {t.name}
                          </option>
                        ))}
                      </select>
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-focus-within:text-primary transition-colors">
                    Deployment Temporal Synchronization
                  </Label>
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      required
                      value={formData.schedule}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, schedule: e.target.value })
                      }
                      className="bg-white/[0.03] border-white/10 rounded-2xl h-14 font-black italic text-lg focus:border-primary/50 transition-all pl-12 [color-scheme:dark]"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <div className="flex gap-4 pt-10 sticky bottom-0 bg-transparent backdrop-blur-sm mt-4">
                  {!isCreating && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to terminate this deployment protocol?",
                          )
                        ) {
                          deleteMutation.mutate(editingClass.id);
                          setEditingClass(null);
                        }
                      }}
                      className="flex-1 h-16 rounded-[2rem] border-white/10 bg-white/5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Terminate
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      updateMutation.isPending || createMutation.isPending
                    }
                    className="flex-[2] h-16 rounded-[2rem] bg-primary text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all tactical-glow relative overflow-hidden group/submit"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-1000" />
                    {updateMutation.isPending || createMutation.isPending ? (
                      <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-3" />
                        {isCreating ? "Establish Protocol" : "Authorize Sync"}
                      </div>
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
