import { Mail, ShieldCheck, Calendar, User as UserIcon } from "lucide-react";
import TacticalModal from "@/components/ui/TacticalModal";

interface UserViewModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserViewModal({
  user,
  isOpen,
  onClose,
}: UserViewModalProps) {
  if (!user) return null;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title={user.name}
      subtitle="User Profile Diagnostics"
      icon={<UserIcon className="w-24 h-24" />}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden italic">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name?.[0]
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground italic tracking-tighter uppercase mb-0.5">
              {user.name}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] font-bold text-primary uppercase tracking-widest">
                ID: #{user.id}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-foreground/5 rounded-xl border border-border font-outfit">
            <Mail className="w-4 h-4 text-primary mb-2" />
            <span className="text-[8px] font-bold uppercase text-foreground/30 block mb-0.5">
              Email address
            </span>
            <span className="text-xs font-normal text-foreground break-all">
              {user.email}
            </span>
          </div>
          <div className="p-4 bg-foreground/5 rounded-xl border border-border font-outfit">
            <ShieldCheck className="w-4 h-4 text-primary mb-2" />
            <span className="text-[8px] font-bold uppercase text-foreground/30 block mb-0.5">
              Access Level
            </span>
            <span className="text-xs font-medium text-foreground uppercase tracking-widest">
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-foreground/5 rounded-xl border border-border">
            <Calendar className="w-4 h-4 text-primary mb-2" />
            <span className="text-[8px] font-bold uppercase text-foreground/30 block mb-0.5">
              Initialization Date
            </span>
            <span className="text-xs font-normal text-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="p-4 bg-foreground/5 rounded-xl border border-border">
            <div className="w-4 h-4 rounded-full bg-primary mb-2 opacity-50" />
            <span className="text-[8px] font-bold uppercase text-foreground/30 block mb-0.5">
              Membership Tier
            </span>
            <span className="text-xs font-medium text-foreground uppercase tracking-widest">
              {user.memberships?.[0]?.planTier || "Inactive"}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 border border-primary/20 rounded-xl bg-primary/5 font-outfit">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-bold text-primary uppercase tracking-widest">
              System Uplink Stable - Verified Record
            </span>
          </div>
        </div>
      </div>
    </TacticalModal>
  );
}
