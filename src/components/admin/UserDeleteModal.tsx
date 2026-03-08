import { Skull, AlertTriangle } from "lucide-react";
import TacticalModal from "@/components/ui/TacticalModal";

interface UserDeleteModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: number) => void;
  isLoading: boolean;
  error?: any;
}

export default function UserDeleteModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
}: UserDeleteModalProps) {
  if (!user) return null;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purge"
      highlight="Authorization"
      subtitle="Critical Sector Action Required"
      icon={<Skull className="w-24 h-24" />}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 relative">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div
            className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
            style={{ animationDuration: "3s" }}
          />
        </div>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
              Error: {error.message || "Protocol Denied"}
            </p>
          </div>
        )}

        <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
          <p className="text-[10px] font-medium text-white/60 mb-1">
            Permanently delete user record:
          </p>
          <p className="text-xs font-bold text-white uppercase tracking-tight">
            {user.name}
          </p>
          <p className="text-[9px] font-medium text-white/20 mt-1 uppercase tracking-widest">
            {user.email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onClose}
            className="h-10 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            Abort
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            disabled={isLoading}
            className="h-10 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
          >
            {isLoading ? "Purging..." : "Confirm Purge"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 w-full">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-bold text-red-500/40 uppercase tracking-[0.2em]">
              Warning: This action is irreversible
            </span>
          </div>
        </div>
      </div>
    </TacticalModal>
  );
}
