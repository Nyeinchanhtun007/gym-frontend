import { User, Camera, Link as LinkIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                  Edit <span className="text-primary">Profile</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  Update personal details and system roles
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium">
                  {error.message || "Failed to update user"}
                </div>
              )}

              {/* Photo Section */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 border border-border rounded-lg">
                <div className="relative group/photo">
                  <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform group-hover/photo:scale-110"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-md flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg border border-card focus-within:ring-2 focus-within:ring-primary">
                    <Camera className="w-3 h-3" />
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
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Photo URL (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
                      className="w-full h-10 bg-card border border-border rounded-lg pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all font-medium shadow-inner placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full h-10 bg-card border border-border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all font-medium shadow-inner placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
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
                  className="w-full h-10 bg-card border border-border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all font-medium shadow-inner placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Access Level
                </label>
                <div className="relative">
                  <select
                    value={formData.role || "USER"}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full h-10 bg-card border border-border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all appearance-none font-medium cursor-pointer shadow-inner"
                  >
                    <option value="USER">User</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-all font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-sm shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
