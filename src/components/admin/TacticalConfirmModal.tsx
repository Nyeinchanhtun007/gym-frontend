import TacticalModal from "@/components/ui/TacticalModal";

interface TacticalConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning";
  confirmText?: string;
  cancelText?: string;
}

export default function TacticalConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: TacticalConfirmModalProps) {
  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Operational clearance Required"
      maxWidth="max-w-sm"
    >
      <div className="relative z-20">
        <p className="text-xs text-foreground/60 font-medium leading-relaxed mb-6 italic">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-foreground/5 border border-border text-[9px] font-black text-foreground uppercase tracking-[0.2em] hover:bg-foreground/10 transition-all font-outfit"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all font-outfit ${
              type === "danger"
                ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "bg-primary text-black hover:scale-105 shadow-[0_0_20px_rgba(255,62,62,0.4)]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </TacticalModal>
  );
}
