import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  ShieldCheck,
  Mail,
  MapPin,
  Award,
  X,
  Calendar,
  LayoutDashboard,
  Plus,
  Zap,
  Trash2,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminTrainers() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [viewingTrainer, setViewingTrainer] = useState<any>(null);
  const [deployingToTrainer, setDeployingToTrainer] = useState<any>(null);
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
    data: trainers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-trainers"],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/users?role=TRAINER`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch trainers");
      }
      return res.json();
    },
  });

  const trainerData = trainers?.items || trainers?.data || [];

  const { data: allClassData } = useQuery({
    queryKey: ["admin-all-classes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/classes?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Communications Link Failure");
      return res.json();
    },
  });

  const allClasses = allClassData?.items || allClassData?.data || [];

  const assignMutation = useMutation({
    mutationFn: async ({
      classId,
      trainerId,
    }: {
      classId: number;
      trainerId: number;
    }) => {
      const res = await fetch(`http://localhost:3000/classes/${classId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trainerId }),
      });
      if (!res.ok) throw new Error("Deployment Synchronization Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-classes"] });
      setDeployingToTrainer(null);
      // If we're viewing a trainer, update their data too
      if (viewingTrainer) {
        queryClient.refetchQueries({ queryKey: ["admin-trainers"] });
      }
    },
  });

  const deleteTrainerMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        throw new Error("Personnel Retrieval Failed - Clearance Required");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-classes"] });
      setViewingTrainer(null);
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Mission Termination Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-classes"] });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
          Tactical <span className="text-primary italic">Trainers</span>
        </h1>
        <p className="text-white/50 uppercase tracking-[0.2em] text-[10px] font-bold">
          Elite Personnel Management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-white/5 rounded-3xl animate-pulse"
            />
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest border border-red-500/10 rounded-[2.5rem] bg-red-500/5">
            Communication Failure: {error.message}
          </div>
        ) : trainerData.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/20 uppercase font-black text-xs tracking-widest">
            No Trainers Recruited
          </div>
        ) : (
          trainerData.map((trainer: any) => (
            <div
              key={trainer.id}
              className="group relative bg-zinc-900 border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,62,62,0.1)]"
            >
              {/* Card Header/Photo Section */}
              <div className="relative h-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent z-10" />
                {trainer.photo ? (
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <ShieldCheck className="w-20 h-20 text-white/[0.03]" />
                  </div>
                )}

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                </div>

                {/* Tactical Overlay */}
                <div className="absolute inset-0 border-[0.5px] border-white/5 z-20 pointer-events-none" />
              </div>

              {/* Content Section */}
              <div className="p-4.5 pt-0 mt-[-1.5rem] relative z-20">
                <div className="flex items-end gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-2 border-white/10 p-1 flex-shrink-0">
                    <div className="w-full h-full rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-xl text-primary overflow-hidden">
                      {trainer.photo ? (
                        <img
                          src={trainer.photo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        trainer.name?.[0]
                      )}
                    </div>
                  </div>
                  <div className="pb-1">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                      {trainer.name}
                    </h3>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                      Elite Instructor
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                    <Mail className="w-3 h-3 text-white/20" />
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
                      {trainer.email}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <MapPin className="w-3 h-3 text-white/20" />
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                        Sector 7
                      </span>
                    </div>
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <Award className="w-3 h-3 text-primary" />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">
                        Certified
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setViewingTrainer(trainer)}
                  className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300 shadow-inner"
                >
                  View Profile
                </button>
              </div>

              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-30 pointer-events-none bg-[length:100%_2px,3px_100%]" />
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {viewingTrainer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingTrainer(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-zinc-950 border border-white/10 rounded-[2rem] p-4 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-white/5 pointer-events-none">
                <ShieldCheck className="w-14 h-14" />
              </div>

              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold overflow-hidden italic">
                    {viewingTrainer.photo ? (
                      <img
                        src={viewingTrainer.photo}
                        alt={viewingTrainer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      viewingTrainer.name?.[0]
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white italic tracking-tighter uppercase mb-0.5">
                      {viewingTrainer.name}
                    </h2>
                    <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">
                      Instructor Profile Diagnostics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingTrainer(null)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Mail className="w-3.5 h-3.5 text-primary mb-1.5" />
                    <span className="text-[7px] font-bold uppercase text-white/30 block mb-0.5">
                      Communications Uplink
                    </span>
                    <span className="text-[10px] font-normal text-white break-all line-clamp-1">
                      {viewingTrainer.email}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary mb-1.5" />
                    <span className="text-[7px] font-bold uppercase text-white/30 block mb-0.5">
                      Personnel Status
                    </span>
                    <span className="text-[10px] font-medium text-white uppercase tracking-widest">
                      {viewingTrainer.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-primary mb-1.5" />
                    <span className="text-[7px] font-bold uppercase text-white/30 block mb-0.5">
                      Enlistment Date
                    </span>
                    <span className="text-[10px] font-medium text-white">
                      {new Date(viewingTrainer.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Award className="w-3.5 h-3.5 text-primary mb-1.5" />
                    <span className="text-[7px] font-bold uppercase text-white/30 block mb-0.5">
                      Certification Level
                    </span>
                    <span className="text-[10px] font-medium text-white uppercase">
                      Tier 1 Tactical
                    </span>
                  </div>
                </div>

                {/* Assigned Classes Section */}
                <div className="mt-2 p-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                    <h4 className="text-[8px] font-black text-white uppercase tracking-[0.2em]">
                      Active Deployments (Classes)
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    {viewingTrainer.classes &&
                    viewingTrainer.classes.length > 0 ? (
                      viewingTrainer.classes.map((cls: any) => (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase italic tracking-tight">
                              {cls.name}
                            </span>
                            <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">
                              ID: #{cls.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest">
                              {new Date(cls.schedule).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => {
                                triggerConfirm({
                                  title: "Mission Decommission",
                                  message: `You are about to terminate mission: ${cls.name}. This action will scrub all deployment data from the sector. Confirm?`,
                                  type: "warning",
                                  onConfirm: () =>
                                    deleteClassMutation.mutate(cls.id),
                                });
                              }}
                              title="Resign from Mission"
                              className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 flex items-center justify-center transition-all group/resign"
                            >
                              <UserX className="w-3.5 h-3.5 text-red-500/40 group-hover/resign:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                          No Active Class Deployments Detected
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setDeployingToTrainer(viewingTrainer);
                        setViewingTrainer(null);
                      }}
                      className="w-full mt-1.5 py-2.5 border border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                    >
                      <Plus className="w-3 h-3 text-primary group-hover:scale-125 transition-transform" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                        Deploy to New mission
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 relative z-10">
                <button
                  onClick={() => {
                    triggerConfirm({
                      title: "Personnel Purge",
                      message: `CRITICAL: You are about to retroactively purge ${viewingTrainer.name} from global records. This will decommission all active missions and scrub session data. Confirm Permanent Purge?`,
                      type: "danger",
                      onConfirm: () =>
                        deleteTrainerMutation.mutate(viewingTrainer.id),
                    });
                  }}
                  className="flex-1 h-10 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-black uppercase tracking-[0.2em] hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  File Resignation
                </button>
                <button
                  onClick={() => setViewingTrainer(null)}
                  className="flex-[1.5] h-10 rounded-xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-inner"
                >
                  Close Data Stream
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deploy Mission Modal */}
      <AnimatePresence>
        {deployingToTrainer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeployingToTrainer(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative max-w-xl w-full bg-zinc-950 border border-white/10 rounded-[3rem] p-4.5 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-5 text-white/[0.02] pointer-events-none">
                <Zap className="w-36 h-36 rotate-12" />
              </div>

              <div className="mb-4 relative z-10">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white italic underline decoration-primary/50 underline-offset-4 uppercase tracking-tighter">
                      Assign <span className="text-primary">Mission</span>
                    </h2>
                    <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mt-0.5">
                      Personnel ID: #{deployingToTrainer.id} | Deploying:{" "}
                      {deployingToTrainer.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 relative z-10 custom-scrollbar">
                {allClasses.length === 0 ? (
                  <div className="text-center py-6 text-white/20 border border-dashed border-white/10 rounded-2xl">
                    No Active Classes Detected in System
                  </div>
                ) : (
                  allClasses.map((cls: any) => {
                    const isAlreadyAssigned =
                      cls.trainerId === deployingToTrainer.id;
                    return (
                      <div
                        key={cls.id}
                        className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                          isAlreadyAssigned
                            ? "bg-primary/5 border-primary/20"
                            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-black text-white uppercase italic tracking-tight">
                            {cls.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest">
                              Current Op:{" "}
                              <span
                                className={
                                  cls.trainer?.name
                                    ? "text-white/60"
                                    : "text-white/10"
                                }
                              >
                                {cls.trainer?.name || "Unassigned"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          disabled={
                            isAlreadyAssigned || assignMutation.isPending
                          }
                          onClick={() =>
                            assignMutation.mutate({
                              classId: cls.id,
                              trainerId: deployingToTrainer.id,
                            })
                          }
                          className={`h-9 px-5 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${
                            isAlreadyAssigned
                              ? "bg-primary text-black cursor-default"
                              : "bg-white/5 text-white/40 hover:bg-primary hover:text-black hover:scale-105 active:scale-95 disabled:opacity-50"
                          }`}
                        >
                          {isAlreadyAssigned ? (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              Assigned
                            </>
                          ) : assignMutation.isPending &&
                            assignMutation.variables?.classId === cls.id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              Assign Mission
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
                <button
                  onClick={() => setDeployingToTrainer(null)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  Terminate Deployment Link
                </button>
              </div>

              {/* Advanced Scanline CRT Effect for the modal */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-30 opacity-20 bg-[length:100%_2px,3px_100%]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tactical Confirmation Alert Box */}
      <AnimatePresence>
        {confirmConfig.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
              }
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-sm w-full bg-zinc-950 border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden"
            >
              {/* Scanline Background */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 opacity-20 bg-[length:100%_2px,3px_100%]" />

              <div className="relative z-20">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      confirmConfig.type === "danger"
                        ? "bg-red-500/20 border-red-500/30 text-red-500"
                        : "bg-primary/20 border-primary/30 text-primary"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                      {confirmConfig.title}
                    </h3>
                    <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">
                      Operational clearance Required
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/60 font-medium leading-relaxed mb-6 italic">
                  {confirmConfig.message}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-outfit"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmConfig.onConfirm();
                      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
                    }}
                    className={`flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all font-outfit ${
                      confirmConfig.type === "danger"
                        ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        : "bg-primary text-black hover:scale-105 shadow-[0_0_20px_rgba(255,62,62,0.4)]"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
