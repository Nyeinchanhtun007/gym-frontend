import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Award, LayoutDashboard, User } from "lucide-react";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import TrainerViewModal from "@/components/admin/TrainerViewModal";
import TrainerDeployModal from "@/components/admin/TrainerDeployModal";
import ConfirmModal from "@/components/admin/ConfirmModal";

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
      if (!res.ok) throw new Error("Failed to fetch classes");
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
      if (!res.ok) throw new Error("Failed to assign trainer to class");
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
        throw new Error("Failed to delete trainer");
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
      if (!res.ok) throw new Error("Failed to delete class");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-classes"] });
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Trainers"
        highlight="Personnel"
        subtitle="Manage gym instructors and their class assignments"
      />

      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search instructors by name or email..."
            className="w-full md:w-96"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Instructor Profile</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6" colSpan={4}>
                      <div className="h-12 bg-muted rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredTrainers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-muted-foreground italic"
                  >
                    No trainers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((trainer: any) => (
                  <tr
                    key={trainer.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                          {trainer.photo ? (
                            <img
                              src={trainer.photo}
                              alt={trainer.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {trainer.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {trainer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 w-fit">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">
                          Certified
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewingTrainer(trainer)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary border border-transparent hover:border-border transition-all"
                        title="View Details"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              title: "Delete Trainer",
              message: `Are you sure you want to delete ${trainer.name}? This will remove all their records and end active class assignments.`,
              type: "danger",
              onConfirm: () => deleteTrainerMutation.mutate(trainer.id),
            });
          }}
          onDecommissionMission={(cls) => {
            triggerConfirm({
              title: "End Assignment",
              message: `Remove instructor from class: ${cls.name}?`,
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

        <ConfirmModal
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
