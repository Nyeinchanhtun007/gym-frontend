import {
  ShieldCheck,
  Mail,
  Award,
  Calendar,
  LayoutDashboard,
  Plus,
  Trash2,
  UserX,
} from "lucide-react";
import TacticalModal from "@/components/ui/TacticalModal";

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
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title={trainer.name}
      subtitle="Instructor Profile Diagnostics"
      icon={<ShieldCheck className="w-14 h-14" />}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold overflow-hidden italic">
            {trainer.photo ? (
              <img
                src={trainer.photo}
                alt={trainer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              trainer.name?.[0]
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground italic tracking-tighter uppercase mb-0.5">
              {trainer.name}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">
                Active Personnel
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-foreground/5 rounded-xl border border-border">
            <Mail className="w-3.5 h-3.5 text-primary mb-1.5" />
            <span className="text-[7px] font-bold uppercase text-foreground/30 block mb-0.5">
              Communications Uplink
            </span>
            <span className="text-[10px] font-normal text-foreground break-all line-clamp-1">
              {trainer.email}
            </span>
          </div>
          <div className="p-3 bg-foreground/5 rounded-xl border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-primary mb-1.5" />
            <span className="text-[7px] font-bold uppercase text-foreground/30 block mb-0.5">
              Personnel Status
            </span>
            <span className="text-[10px] font-medium text-foreground uppercase tracking-widest">
              {trainer.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-foreground/5 rounded-xl border border-border">
            <Calendar className="w-3.5 h-3.5 text-primary mb-1.5" />
            <span className="text-[7px] font-bold uppercase text-foreground/30 block mb-0.5">
              Enlistment Date
            </span>
            <span className="text-[10px] font-medium text-foreground">
              {new Date(trainer.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 bg-foreground/5 rounded-xl border border-border">
            <Award className="w-3.5 h-3.5 text-primary mb-1.5" />
            <span className="text-[7px] font-bold uppercase text-foreground/30 block mb-0.5">
              Certification Level
            </span>
            <span className="text-[10px] font-medium text-foreground uppercase">
              Tier 1 Tactical
            </span>
          </div>
        </div>

        <div className="mt-2 p-3 bg-foreground/[0.01] border border-border/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2.5">
            <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
            <h4 className="text-[8px] font-black text-foreground uppercase tracking-[0.2em]">
              Active Deployments (Classes)
            </h4>
          </div>

          <div className="space-y-1.5">
            {trainer.classes && trainer.classes.length > 0 ? (
              trainer.classes.map((cls: any) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-foreground/5 border border-border"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-foreground uppercase italic tracking-tight">
                      {cls.name}
                    </span>
                    <span className="text-[7px] font-bold text-foreground/20 uppercase tracking-widest">
                      ID: #{cls.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-medium text-foreground/30 uppercase tracking-widest">
                      {new Date(cls.schedule).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onDecommissionMission(cls)}
                      className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 flex items-center justify-center transition-all group/resign"
                    >
                      <UserX className="w-3.5 h-3.5 text-red-500/40 group-hover/resign:text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center border border-dashed border-border rounded-2xl bg-foreground/[0.01]">
                <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">
                  No Active Class Deployments Detected
                </p>
              </div>
            )}

            <button
              onClick={() => onDeployMission(trainer)}
              className="w-full mt-1.5 py-2.5 border border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all group"
            >
              <Plus className="w-3 h-3 text-primary group-hover:scale-125 transition-transform" />
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                Deploy to New mission
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onPurge(trainer)}
            className="flex-1 h-10 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-black uppercase tracking-[0.2em] hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            File Resignation
          </button>
          <button
            onClick={onClose}
            className="flex-[1.5] h-10 rounded-xl bg-foreground/5 border border-border text-foreground text-[9px] font-black uppercase tracking-[0.2em] hover:bg-foreground/10 transition-all shadow-inner"
          >
            Close Data Stream
          </button>
        </div>
      </div>
    </TacticalModal>
  );
}
