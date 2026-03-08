import { User, Camera, Link as LinkIcon } from "lucide-react";
import TacticalModal from "@/components/ui/TacticalModal";

interface UserEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, updateData: any) => void;
  isLoading: boolean;
  error?: any;
  formData: any;
  setFormData: (data: any) => void;
}

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading,
  error,
  formData,
  setFormData,
}: UserEditModalProps) {
  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Modify"
      highlight="Identity"
      subtitle={`User ID: #${user.id}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
            <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
              Update Failure: {error.message}
            </p>
          </div>
        )}

        {/* Photo Section */}
        <div className="flex items-center gap-6 p-4 bg-foreground/5 border border-border rounded-2xl mb-2 font-outfit">
          <div className="relative group/photo">
            <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center overflow-hidden">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-foreground/20" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({
                        ...formData,
                        photo: reader.result as string,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">
              Photo Identifier (Link)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20" />
              <input
                type="text"
                value={formData.photo || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    photo: e.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full h-9 bg-foreground/5 border border-border rounded-xl pl-9 pr-4 text-[10px] font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 bg-foreground/5 border border-border rounded-xl px-4 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            className="w-full h-11 bg-foreground/5 border border-border rounded-xl px-4 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">
            Access Permission
          </label>
          <select
            value={formData.role || "USER"}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full h-11 bg-foreground/5 border border-border rounded-xl px-4 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="USER" className="bg-zinc-900">
              USER
            </option>
            <option value="TRAINER" className="bg-zinc-900">
              TRAINER
            </option>
            <option value="ADMIN" className="bg-zinc-900">
              ADMIN
            </option>
          </select>
        </div>

        <div className="flex gap-3 pt-4 font-outfit">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-foreground/5 border border-border text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-colors"
          >
            Abort
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
          >
            {isLoading ? "Syncing..." : "Apply Changes"}
          </button>
        </div>
      </form>
    </TacticalModal>
  );
}
