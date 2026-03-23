import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
            style={{ cursor: "pointer" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-lg overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Delete User
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 rounded-lg mb-4 text-sm font-medium">
                {error.message || "Failed to delete user"}
              </div>
            )}

            <p className="text-muted-foreground text-sm mb-4">
              Are you sure you want to delete <span className="font-semibold text-foreground">{user.name}</span>? This action cannot be undone and will permanently remove all associated data.
            </p>

            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(user.id)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
              >
                {isLoading ? "Deleting..." : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
