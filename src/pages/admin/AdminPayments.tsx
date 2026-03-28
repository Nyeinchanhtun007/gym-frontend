import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Phone,
  Tag,
  Search,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import SimpleSelect from "@/components/ui/SimpleSelect";

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
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        highlight="Verification"
        subtitle="Review and verify membership payment submissions"
      />

      {/* Filters Bar */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by payer or plan..."
              className="w-full bg-muted/30 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner placeholder:text-muted-foreground/60"
            />
          </div>

          <SimpleSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Pending Review", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "All Requests", value: "" },
            ]}
            className="w-full md:w-56"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground">User & Payer</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Plan & Amount</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Method</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading payment requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic font-medium">
                    No payment requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                          {r.user?.name?.[0] || r.payerName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">{r.payerName}</div>
                          <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-muted-foreground/60" /> {r.user?.email || "No Email"}
                          </div>
                          <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-muted-foreground/60" /> {r.payerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <div className="flex flex-col gap-1">
                        <div className="text-foreground font-semibold flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-primary" />
                          {r.planName}
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-muted-foreground/60 line-through scale-90 origin-left decoration-muted-foreground/30">
                            ${r.originalPrice || (r.price + r.discountAmount + (r.autoDiscountAmount || 0))}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            ${r.price}
                            <span className="text-[10px] text-muted-foreground/60 font-medium ml-1">/ {r.billingCycle}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {r.autoDiscountAmount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 text-[9px] font-bold">
                              <Tag className="w-2.5 h-2.5 mr-1" /> -${r.autoDiscountAmount} (AUTO)
                            </span>
                          )}
                          {r.discountAmount > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 text-[9px] font-bold">
                              <Tag className="w-2.5 h-2.5 mr-1" /> -${r.discountAmount} ({r.promoCode})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-muted border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "PENDING" ? (
                          <>
                            {r.paymentProof && (
                              <button
                                onClick={() => setShowScreenshot(r.paymentProof)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
                                title="View Proof"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedRequest(r)}
                              className="px-4 h-9 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verify
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              r.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
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
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto p-4 md:py-20 scrollbar-hide">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Verify Payment</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Reviewing submission from {selectedRequest.payerName}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 rounded-full border border-border hover:bg-muted text-muted-foreground transition-all shadow-sm"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-4 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Plan Tier</label>
                      <div className="text-sm font-bold text-foreground">{selectedRequest.planName}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Billing Cycle</label>
                      <div className="text-sm font-semibold text-muted-foreground">{selectedRequest.billingCycle}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Subtotal</label>
                      <div className="text-xs font-medium text-muted-foreground/60 line-through">${selectedRequest.originalPrice || (selectedRequest.price + selectedRequest.discountAmount + (selectedRequest.autoDiscountAmount || 0))}</div>
                    </div>
                    {selectedRequest.autoDiscountAmount > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Auto Disc.</label>
                        <div className="text-xs font-bold text-primary">-${selectedRequest.autoDiscountAmount}</div>
                      </div>
                    )}
                    {selectedRequest.discountAmount > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Promo</label>
                        <div className="text-xs font-bold text-emerald-600">-${selectedRequest.discountAmount}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">Final Total</label>
                      <div className="text-base font-black text-primary">${selectedRequest.price}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <label className="text-xs font-semibold text-foreground block mb-2">Admin Remarks / Notes</label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add notes or rejection reason..."
                      className={`w-full h-24 bg-background border rounded-xl p-3 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/30 shadow-inner ${
                        !adminNote.trim() ? "border-red-500/20 focus:border-red-500/30" : "border-border focus:border-primary/50"
                      }`}
                    />
                    {!adminNote.trim() && (
                      <p className="text-[10px] font-semibold text-red-500/80 mt-1.5 flex items-center gap-1">
                        Required for rejection / ပယ်ဖျက်ရန် အကြောင်းပြချက် လိုအပ်ပါသည်။
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleReview(selectedRequest.id, "REJECTED")}
                    disabled={reviewMutation.isPending || !adminNote.trim()}
                    variant="outline"
                    className="h-11 border-red-500/20 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500/50 font-bold transition-all disabled:opacity-40"
                  >
                    {reviewMutation.isPending && reviewMutation.variables?.status === "REJECTED" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReview(selectedRequest.id, "APPROVED")}
                    disabled={reviewMutation.isPending}
                    className="h-11 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    {reviewMutation.isPending && reviewMutation.variables?.status === "APPROVED" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot Viewer */}
      <AnimatePresence>
        {showScreenshot && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScreenshot(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full flex flex-col items-center gap-4"
            >
              <div className="bg-card p-2 rounded-xl shadow-2xl border border-white/10 w-full overflow-hidden">
                <img
                  src={showScreenshot}
                  alt="Payment Proof"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              </div>
              <button
                onClick={() => setShowScreenshot(null)}
                className="px-6 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
              >
                Close Viewer
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
