import { Mail, ShieldCheck, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                  User <span className="text-primary">Details</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                  Full profile and system access overview
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold overflow-hidden shrink-0 border border-primary/20 shadow-inner">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-full h-full object-cover transition-transform hover:scale-110"
                    />
                  ) : (
                    user.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {user.name}
                  </h2>
                  <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest leading-none">
                    System ID: <span className="text-primary">#{user.id}</span>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border shadow-sm">
                <Mail className="w-3.5 h-3.5 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-0.5">
                  Email Address
                </span>
                <span className="text-sm font-semibold text-foreground truncate block">
                  {user.email}
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-0.5">
                  Access Level
                </span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {user.role?.toLowerCase() || user.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-0.5">
                  Joined Date
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border shadow-sm">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-0.5">
                  Membership Tier
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {user.memberships?.[0]?.planTier || "No Active Plan"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-border pt-6">
              <button
                onClick={onClose}
                className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-all font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
