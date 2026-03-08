import { CreditCard, Trash2, Save, Loader2 } from "lucide-react";
import TacticalModal from "@/components/ui/TacticalModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MembershipEditModalProps {
  membership: any;
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: (e: React.FormEvent) => void;
  onPurge: (id: number) => void;
  isLoading: boolean;
  statusMessage: { type: "error" | "success"; text: string } | null;
}

export default function MembershipEditModal({
  membership,
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  onPurge,
  isLoading,
  statusMessage,
}: MembershipEditModalProps) {
  if (!membership) return null;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Membership"
      highlight="Override"
      subtitle={`ID: #${membership.id} | User: ${membership.user?.name}`}
      icon={<CreditCard className="w-24 h-24" />}
      maxWidth="max-w-xl"
    >
      <form onSubmit={onSave} className="space-y-3 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Tier Assignment
            </Label>
            <select
              value={formData.planTier}
              onChange={(e) =>
                setFormData({ ...formData, planTier: e.target.value })
              }
              className="w-full h-9 bg-foreground/5 border border-border rounded-xl px-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="Basic" className="bg-card">
                Basic Tier
              </option>
              <option value="Standard" className="bg-card">
                Standard Tier
              </option>
              <option value="Premium" className="bg-card">
                Premium Tier
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Status Protocol
            </Label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full h-9 bg-foreground/5 border border-border rounded-xl px-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option
                value="ACTIVE"
                className="bg-card text-green-500 font-black"
              >
                ACTIVE
              </option>
              <option
                value="EXPIRED"
                className="bg-card text-red-500 font-black"
              >
                EXPIRED
              </option>
              <option
                value="CANCELLED"
                className="bg-card text-foreground/50 font-black"
              >
                CANCELLED
              </option>
              <option
                value="PENDING_DOWNGRADE"
                className="bg-card text-amber-500 font-black"
              >
                PENDING DOWNGRADE
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Protocol Pricing ($)
            </Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="bg-foreground/5 border-border rounded-xl h-9 text-xs font-black transition-all focus:border-primary text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Billing Cycle
            </Label>
            <select
              value={formData.billingCycle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  billingCycle: e.target.value,
                })
              }
              className="w-full h-9 bg-foreground/5 border border-border rounded-xl px-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="Monthly" className="bg-card">
                Monthly Cycle
              </option>
              <option value="Yearly" className="bg-card">
                Yearly Cycle
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Daily Capacity Override
            </Label>
            <Input
              type="number"
              value={formData.dailyClassLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dailyClassLimit: e.target.value,
                })
              }
              className="bg-foreground/5 border-border rounded-xl h-9 text-xs font-black transition-all focus:border-primary text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Monthly Capacity Override
            </Label>
            <Input
              type="number"
              value={formData.monthlyClassLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyClassLimit: e.target.value,
                })
              }
              className="bg-foreground/5 border-border rounded-xl h-9 text-xs font-black transition-all focus:border-primary text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Activation Date
            </Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="bg-foreground/5 border-border rounded-xl h-9 text-xs font-black transition-all focus:border-primary text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Deactivation Date
            </Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="bg-foreground/5 border-border rounded-xl h-9 text-xs font-black transition-all focus:border-primary text-foreground"
            />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`text-xs font-bold rounded-xl px-4 py-3 ${
              statusMessage.type === "error"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-green-500/10 border border-green-500/20 text-green-400"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPurge(membership.id)}
            className="flex-1 h-10 rounded-xl border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-black uppercase tracking-widest text-[10px] text-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Purge
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-[2] h-10 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Synchronize
              </>
            )}
          </Button>
        </div>
      </form>
    </TacticalModal>
  );
}
