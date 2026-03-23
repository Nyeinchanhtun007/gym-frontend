import {
  ShieldCheck,
  Mail,
  Award,
  Calendar,
  LayoutDashboard,
  Plus,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrainerViewModalProps {
  trainer: any;
  isOpen: boolean;
  onClose: () => void;
  onDeployMission: (trainer: any) => void;
  onPurge: (trainer: any) => void;
  onDecommissionMission: (cls: any) => void;
}

export default function TrainerViewModal({
  trainer,
  isOpen,
  onClose,
  onDeployMission,
  onPurge,
  onDecommissionMission,
}: TrainerViewModalProps) {
  if (!trainer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 md:py-20 scrollbar-hide">
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
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold overflow-hidden shrink-0 border border-primary/20 shadow-inner">
                  {trainer.photo ? (
                    <img
                      src={trainer.photo}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    trainer.name?.[0]?.toUpperCase() || "T"
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {trainer.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Active Instructor
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <Mail className="w-4 h-4 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5 tracking-wider">
                  Email Address
                </span>
                <span className="text-sm font-medium text-foreground truncate block">
                  {trainer.email}
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <ShieldCheck className="w-4 h-4 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5 tracking-wider">
                  Access Role
                </span>
                <span className="text-sm font-medium text-foreground uppercase tracking-widest">
                  {trainer.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <Calendar className="w-4 h-4 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5 tracking-wider">
                  Join Date
                </span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(trainer.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <Award className="w-4 h-4 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5 tracking-wider">
                  Qualification
                </span>
                <span className="text-sm font-medium text-foreground">
                  Certified Trainer
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Assigned Classes
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {trainer.classes?.length || 0}
                </span>
              </div>

              <div className="space-y-2">
                {trainer.classes && trainer.classes.length > 0 ? (
                  trainer.classes.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {cls.name}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">
                          ID: #{cls.id} |{" "}
                          {new Date(cls.schedule).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={() => onDecommissionMission(cls)}
                        className="w-8 h-8 rounded-md bg-destructive/5 hover:bg-destructive/10 border border-destructive/10 hover:border-destructive/20 flex items-center justify-center transition-all group/resign"
                        title="Remove Assignment"
                      >
                        <UserX className="w-4 h-4 text-destructive/40 group-hover/resign:text-destructive transition-colors" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center border border-dashed border-border rounded-lg bg-muted/5">
                    <p className="text-xs font-medium text-muted-foreground italic">
                      No active class assignments
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onDeployMission(trainer)}
                  className="w-full mt-2 py-2.5 border border-dashed border-primary/30 rounded-lg flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all group"
                >
                  <Plus className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Assign to New Class
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end border-t border-border pt-6">
              <button
                onClick={onClose}
                className="px-6 h-10 rounded-lg border border-border text-foreground text-xs font-bold hover:bg-muted transition-all transition-all"
              >
                Close Profile
              </button>
              <button
                onClick={() => onPurge(trainer)}
                className="px-6 h-10 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
