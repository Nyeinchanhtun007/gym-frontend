import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  highlight?: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
}

export default function SimpleModal({
  isOpen,
  onClose,
  title,
  highlight,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}: TacticalModalProps) {
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
            className={`relative ${maxWidth} w-full bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl z-10 transition-all`}
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {title}{" "}
                  {highlight && <span className="text-primary">{highlight}</span>}
                </h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
