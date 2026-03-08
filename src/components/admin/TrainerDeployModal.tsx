import { Zap, ShieldCheck, Plus } from "lucide-react";
import TacticalModal from "@/components/ui/TacticalModal";

interface TrainerDeployModalProps {
  trainer: any;
  isOpen: boolean;
  onClose: () => void;
  allClasses: any[];
  onAssign: (classId: number, trainerId: number) => void;
  isPending: boolean;
  pendingClassId?: number;
}

export default function TrainerDeployModal({
  trainer,
  isOpen,
  onClose,
  allClasses,
  onAssign,
  isPending,
  pendingClassId,
}: TrainerDeployModalProps) {
  if (!trainer) return null;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign"
      highlight="Mission"
      subtitle={`Personnel ID: #${trainer.id} | Deploying: ${trainer.name}`}
      icon={<Zap className="w-36 h-36 rotate-12" />}
      maxWidth="max-w-xl"
    >
      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 relative z-10 custom-scrollbar">
        {allClasses.length === 0 ? (
          <div className="text-center py-6 text-foreground/20 border border-dashed border-border rounded-2xl">
            No Active Classes Detected in System
          </div>
        ) : (
          allClasses.map((cls: any) => {
            const isAlreadyAssigned = cls.trainerId === trainer.id;
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
                  <span className="text-[11px] font-black text-foreground uppercase italic tracking-tight">
                    {cls.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="text-[7px] font-bold text-foreground/30 uppercase tracking-widest">
                      Current Op:{" "}
                      <span
                        className={
                          cls.trainer?.name
                            ? "text-foreground/60"
                            : "text-foreground/10"
                        }
                      >
                        {cls.trainer?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isAlreadyAssigned || isPending}
                  onClick={() => onAssign(cls.id, trainer.id)}
                  className={`h-9 px-5 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${
                    isAlreadyAssigned
                      ? "bg-primary text-primary-foreground cursor-default"
                      : "bg-foreground/5 text-foreground/40 hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 disabled:opacity-50"
                  }`}
                >
                  {isAlreadyAssigned ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      Assigned
                    </>
                  ) : isPending && pendingClassId === cls.id ? (
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
        <div className="mt-5 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-foreground/5 border border-border text-foreground text-[9px] font-black uppercase tracking-[0.2em] hover:bg-foreground/10 transition-all"
          >
            Terminate Deployment Link
          </button>
        </div>
      </div>
    </TacticalModal>
  );
}
