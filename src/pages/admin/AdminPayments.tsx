import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Phone,
  Clock,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import TacticalSelect from "@/components/ui/TacticalSelect";
import TacticalModal from "@/components/ui/TacticalModal";
import { Button } from "@/components/ui/button";

export default function AdminPayments() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-payment-requests", statusFilter],
    queryFn: async () => {
      const url = `http://localhost:3000/payment-requests?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch payment requests");
      return res.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: number;
      status: string;
      note: string;
    }) => {
      const res = await fetch(
        `http://localhost:3000/payment-requests/${id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, adminNote: note }),
        },
      );
      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ message: "Server error" }));
        throw new Error(errData.message || "Failed to review payment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      queryClient.invalidateQueries({ queryKey: ["pending-payments-count"] });
      setSelectedRequest(null);
      setAdminNote("");
      alert("Verification protocol complete.");
    },
    onError: (err: any) => {
      alert(`Operation Failed: ${err.message}`);
    },
  });

  const handleReview = (id: number, status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !adminNote.trim()) {
      return;
    }
    reviewMutation.mutate({ id, status, note: adminNote });
  };

  const filteredRequests = requests?.filter((r: any) => 
    (r.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.payerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.planName || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Payment"
        highlight="Verification"
        subtitle="Review and Approve Membership Tier Acquisitions"
      />

      <div className="bg-card/50 backdrop-blur-2xl border border-border p-6 rounded-[2rem] relative z-50">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center relative z-10">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="SEARCH BY PAYER OR USER..."
            className="w-full md:w-96"
          />

          <TacticalSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "PENDING REVIEW", value: "PENDING" },
              { label: "APPROVED", value: "APPROVED" },
              { label: "REJECTED", value: "REJECTED" },
              { label: "ALL REQUESTS", value: "" },
            ]}
            placeholder="FILTER BY STATUS"
            className="w-full md:w-56 !rounded-xl"
            accentColor="primary"
          />
        </div>
      </div>

      <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  User & Payer
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Plan & Amount
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Method
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center animate-pulse text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    Scanning Protocol Submissions...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Pending Verifications Found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r: any) => (
                  <tr
                    key={r.id}
                    className="hover:bg-foreground/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center font-black text-primary italic text-sm">
                          {r.user?.name?.[0] || r.payerName?.[0]}
                        </div>
                        <div>
                          <div className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                            {r.payerName}
                          </div>
                          <div className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <User className="w-2.5 h-2.5" /> {r.user?.email}
                          </div>
                          <div className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> {r.payerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-primary" />
                          {r.planName}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-foreground/30 line-through">
                            $
                            {r.originalPrice ||
                              r.price +
                                r.discountAmount +
                                (r.autoDiscountAmount || 0)}
                          </span>
                          <div className="text-sm font-black text-primary italic">
                            ${r.price}{" "}
                            <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                              / {r.billingCycle}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {r.autoDiscountAmount > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/20 w-fit">
                              <Tag className="w-2.5 h-2.5 text-primary" />
                              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">
                                - ${r.autoDiscountAmount} (AUTO)
                              </span>
                            </div>
                          )}
                          {r.discountAmount > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 w-fit">
                              <Tag className="w-2.5 h-2.5 text-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                - ${r.discountAmount} ({r.promoCode})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="px-3 py-1.5 rounded-lg bg-foreground/5 border border-border inline-block">
                        <span className="text-[10px] font-black uppercase text-foreground/60 tracking-widest italic">
                          {r.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary/40" />
                          <span className="text-xs font-bold text-foreground/60 tracking-tight">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
                          {new Date(r.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "PENDING" ? (
                          <>
                            {r.paymentProof && (
                              <button
                                onClick={() =>
                                  setShowScreenshot(r.paymentProof)
                                }
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground/40 hover:text-primary hover:border-primary/20 transition-all"
                                title="View Proof"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedRequest(r)}
                              className="px-4 h-9 flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all tactical-glow shadow-primary/10"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              VERIFY
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              r.status === "APPROVED"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {r.status}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <TacticalModal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setAdminNote("");
        }}
        title="Payment"
        highlight="Verification"
        subtitle={`Verify Payment from ${selectedRequest?.payerName || "User"}`}
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="p-4 bg-foreground/5 border border-border rounded-2xl space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block mb-1">
                    Plan Tier
                  </label>
                  <div className="text-xs font-black text-foreground uppercase italic">
                    {selectedRequest.planName}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block mb-1">
                    Billing Cycle
                  </label>
                  <div className="text-xs font-black text-foreground/60 uppercase">
                    {selectedRequest.billingCycle}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block mb-1">
                    Subtotal
                  </label>
                  <div className="text-xs font-bold text-foreground/40 line-through">
                    $
                    {selectedRequest.originalPrice ||
                      selectedRequest.price +
                        selectedRequest.discountAmount +
                        (selectedRequest.autoDiscountAmount || 0)}
                  </div>
                </div>
                {selectedRequest.autoDiscountAmount > 0 && (
                  <div>
                    <label className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] block mb-1">
                      Auto Disc.
                    </label>
                    <div className="text-xs font-black text-primary italic">
                      -${selectedRequest.autoDiscountAmount}
                    </div>
                  </div>
                )}
                {selectedRequest.discountAmount > 0 && (
                  <div>
                    <label className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.2em] block mb-1">
                      Promo ({selectedRequest.promoCode})
                    </label>
                    <div className="text-xs font-black text-emerald-500 italic">
                      -${selectedRequest.discountAmount}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] block mb-1">
                    Final Total
                  </label>
                  <div className="text-sm font-black text-primary italic">
                    ${selectedRequest.price}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block mb-2">
                  Admin Remarks / Rejection Reason
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="ENTER OVERRIDE NOTES OR REJECTION REASON..."
                  className={`w-full h-32 bg-background border rounded-xl p-4 text-xs font-bold text-foreground outline-none transition-all placeholder:text-foreground/10 uppercase ${
                    !adminNote.trim() ? "border-rose-500/20 focus:border-rose-500/50" : "border-border focus:border-primary/50"
                  }`}
                />
                {!adminNote.trim() && (
                  <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest mt-1">
                    Required for rejection / ပယ်ဖျက်ရန် အကြောင်းပြချက် လိုအပ်ပါသည်။
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleReview(selectedRequest.id, "REJECTED")}
                disabled={reviewMutation.isPending || !adminNote.trim()}
                className="h-12 bg-zinc-800 text-rose-500 border border-rose-500/30 font-black uppercase italic tracking-widest text-[10px] rounded-xl hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {reviewMutation.isPending &&
                reviewMutation.variables?.status === "REJECTED" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" /> REJECT
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleReview(selectedRequest.id, "APPROVED")}
                disabled={reviewMutation.isPending}
                className="h-12 bg-primary text-black font-black uppercase italic tracking-widest text-[10px] rounded-xl hover:scale-[1.02] transition-all tactical-glow shadow-xl shadow-primary/20"
              >
                {reviewMutation.isPending &&
                reviewMutation.variables?.status === "APPROVED" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> APPROVE
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </TacticalModal>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {showScreenshot && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScreenshot(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-6"
            >
              <img
                src={showScreenshot}
                alt="Payment Proof"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <button
                onClick={() => setShowScreenshot(null)}
                className="px-8 py-3 bg-white text-black font-black uppercase italic tracking-widest text-[10px] rounded-full hover:scale-110 active:scale-95 transition-all"
              >
                CLOSE VIEWER
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
