import { ShieldCheck, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto p-4 md:py-20 scrollbar-hide">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
            style={{ cursor: "pointer" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl z-10"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Assign <span className="text-primary">Class</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                  Assigning trainer: <span className="font-semibold text-primary">{trainer.name}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 opacity-60">
                Available Sessions
              </div>

              <div className="space-y-2.5 pr-1 custom-scrollbar overflow-y-auto max-h-[400px] scrollbar-hide">
                {allClasses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-lg bg-muted/5">
                    <p className="text-xs text-muted-foreground italic font-medium">
                      No classes available for assignment
                    </p>
                  </div>
                ) : (
                  allClasses.map((cls: any) => {
                    const isAlreadyAssigned = cls.trainerId === trainer.id;
                    return (
                      <div
                        key={cls.id}
                        className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                          isAlreadyAssigned
                            ? "bg-primary/5 border-primary/20 shadow-inner"
                            : "bg-muted/20 border-border hover:border-primary/20 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-bold text-foreground truncate">
                            {cls.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                              Instructor:{" "}
                              <span
                                className={
                                  cls.trainer?.name
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground/30 italic font-medium"
                                }
                              >
                                {cls.trainer?.name || "None"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={isAlreadyAssigned || isPending}
                          onClick={() => onAssign(cls.id, trainer.id)}
                          className={`h-8 px-4 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 shadow-sm ${
                            isAlreadyAssigned
                              ? "bg-emerald-500 text-white"
                              : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-95"
                          }`}
                        >
                          {isAlreadyAssigned ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Assigned
                            </>
                          ) : isPending && pendingClassId === cls.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Assign
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-border pt-6">
              <button
                onClick={onClose}
                className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-all font-bold text-xs"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
