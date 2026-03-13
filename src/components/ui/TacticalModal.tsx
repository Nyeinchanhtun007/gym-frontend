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

export default function TacticalModal({
  isOpen,
  onClose,
  title,
  highlight,
  subtitle,
  children,
  icon,
  maxWidth = "max-w-lg",
}: TacticalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative ${maxWidth} w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all`}
          >
            <div className="crt-overlay opacity-20" />

            {icon && (
              <div className="absolute top-0 right-0 p-6 text-foreground/5 pointer-events-none">
                {icon}
              </div>
            )}

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-foreground italic tracking-tighter uppercase mb-0.5">
                  {title}{" "}
                  {highlight && (
                    <span className="text-primary text-neon">{highlight}</span>
                  )}
                </h2>
                {subtitle && (
                  <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors text-foreground border border-border"
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
