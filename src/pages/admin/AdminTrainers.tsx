import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Award, LayoutDashboard, User } from "lucide-react";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import TrainerViewModal from "@/components/admin/TrainerViewModal";
import TrainerDeployModal from "@/components/admin/TrainerDeployModal";
import TacticalConfirmModal from "@/components/admin/TacticalConfirmModal";

export default function AdminTrainers() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [viewingTrainer, setViewingTrainer] = useState<any>(null);
  const [deployingToTrainer, setDeployingToTrainer] = useState<any>(null);
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

  const { data: trainers, isLoading } = useQuery({
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

  const filteredTrainers = trainerData.filter(
    (trainer: any) =>
      trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
      <AdminPageHeader
        title="Tactical"
        highlight="Instruction"
        subtitle="Elite Personnel Management Sector"
      />

      <div className="bg-card/50 backdrop-blur-2xl border border-border p-6 rounded-[2rem] relative z-50">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10 relative z-10">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="SEARCH INSTRUCTORS..."
            className="w-full md:w-96"
          />
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                Instructor Profile
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                Specialization
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                Status
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6" colSpan={4}>
                      <div className="h-12 bg-foreground/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              : filteredTrainers.map((trainer: any) => (
                  <tr
                    key={trainer.id}
                    className="hover:bg-foreground/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-border">
                          <User className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="text-[12px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                            {trainer.name}
                          </div>
                          <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                            {trainer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <Award className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                          Certified
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setViewingTrainer(trainer)}
                        className="p-2.5 rounded-xl hover:bg-foreground/5 text-foreground/20 hover:text-primary border border-transparent hover:border-border transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        <TrainerViewModal
          trainer={viewingTrainer}
          isOpen={!!viewingTrainer}
          onClose={() => setViewingTrainer(null)}
          onDeployMission={(trainer) => {
            setDeployingToTrainer(trainer);
            setViewingTrainer(null);
          }}
          onPurge={(trainer) => {
            triggerConfirm({
              title: "Personnel Purge",
              message: `CRITICAL: You are about to retroactively purge ${trainer.name} from global records. This will decommission all active missions and scrub session data. Confirm Permanent Purge?`,
              type: "danger",
              onConfirm: () => deleteTrainerMutation.mutate(trainer.id),
            });
          }}
          onDecommissionMission={(cls) => {
            triggerConfirm({
              title: "Mission Decommission",
              message: `You are about to terminate mission: ${cls.name}. This action will scrub all deployment data from the sector. Confirm?`,
              type: "warning",
              onConfirm: () => deleteClassMutation.mutate(cls.id),
            });
          }}
        />

        <TrainerDeployModal
          trainer={deployingToTrainer}
          isOpen={!!deployingToTrainer}
          onClose={() => setDeployingToTrainer(null)}
          allClasses={allClasses}
          onAssign={(classId, trainerId) =>
            assignMutation.mutate({ classId, trainerId })
          }
          isPending={assignMutation.isPending}
          pendingClassId={assignMutation.variables?.classId}
        />

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
    </div>
  );
}
