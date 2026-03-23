import { Trash2, Save, Loader2 } from "lucide-react";
import SimpleModal from "@/components/ui/SimpleModal";
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
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit"
      highlight="Membership"
      subtitle={`ID: #${membership.id} | User: ${membership.user?.name}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Membership Tier
            </Label>
            <select
              value={formData.planTier}
              onChange={(e) =>
                setFormData({ ...formData, planTier: e.target.value })
              }
              className="w-full h-10 bg-muted/50 border border-border rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="Basic">Basic Plan</option>
              <option value="Standard">Standard Plan</option>
              <option value="Premium">Premium Plan</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </Label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full h-10 bg-muted/50 border border-border rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="ACTIVE" className="text-emerald-600">
                Active
              </option>
              <option value="EXPIRED" className="text-destructive">
                Expired
              </option>
              <option value="CANCELLED" className="text-muted-foreground">
                Cancelled
              </option>
              <option value="PENDING_DOWNGRADE" className="text-amber-600">
                Pending Downgrade
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Price ($)
            </Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="bg-muted/50 border-border rounded-lg h-10 text-sm font-medium focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              className="w-full h-10 bg-muted/50 border border-border rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Daily Class Limit
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
              className="bg-muted/50 border-border rounded-lg h-10 text-sm font-medium focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Class Limit
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
              className="bg-muted/50 border-border rounded-lg h-10 text-sm font-medium focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Start Date
            </Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="bg-muted/50 border-border rounded-lg h-10 text-sm font-medium focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              End Date
            </Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="bg-muted/50 border-border rounded-lg h-10 text-sm font-medium focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`text-xs font-semibold rounded-lg px-4 py-3 ${
              statusMessage.type === "error"
                ? "bg-destructive/10 border border-destructive/20 text-destructive"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPurge(membership.id)}
            className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-bold text-xs transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </SimpleModal>
  );
}
