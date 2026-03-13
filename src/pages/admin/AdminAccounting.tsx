import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";
// Chart imports removed
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSelect from "@/components/ui/TacticalSelect";
import TacticalSearch from "@/components/admin/TacticalSearch";
import TacticalConfirmModal from "@/components/admin/TacticalConfirmModal";
import TacticalModal from "@/components/ui/TacticalModal";
import TacticalCombobox from "@/components/ui/TacticalCombobox";
import { motion } from "framer-motion";
import type {
  AccountingSummary,
  Transaction,
  TransactionType,
  TransactionCategory,
} from "@/types/accounting";

export default function AdminAccounting() {
  const token = useAuthStore((state: any) => state.token);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    number | null
  >(null);

  const [formData, setFormData] = useState({
    amount: 0,
    type: "INCOME" as TransactionType,
    category: "" as TransactionCategory,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { data: summary } = useQuery<AccountingSummary>({
    queryKey: ["accounting-summary"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/accounting/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
  });

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery<
    Transaction[]
  >({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/accounting", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery<TransactionCategory[]>({
    queryKey: ["accounting-categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/accounting/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("http://localhost:3000/accounting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounting-summary"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("CREATE MUTATION ERROR:", error);
      alert("Failed to confirm protocol. Ensure valid inputs.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`http://localhost:3000/accounting/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounting-summary"] });
      setIsModalOpen(false);
      setEditingTransaction(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("DELETING TRANSACTION ID:", id);
      const res = await fetch(`http://localhost:3000/accounting/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let errorMsg = "Failed to delete transaction";
        try {
          const errData = await res.text();
          errorMsg = errData || errorMsg;
        } catch (e) {}
        console.error("DELETE ERROR:", errorMsg);
        throw new Error(errorMsg);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["accounting-summary"] });
    },
    onError: (err: any) => {
      alert(
        "PURGE FAILURE: PROTOCOL REJECTED\n" + (err.message || "Unknown error"),
      );
    },
  });

  const resetForm = () => {
    setFormData({
      amount: 0,
      type: "INCOME",
      category: categoriesData?.[0] || "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTransactions =
    transactions?.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || t.type === typeFilter;
      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    }) || [];

  const categories: TransactionCategory[] = categoriesData || [];

  return (
    <div className="space-y-4 pb-0">
      <div className="flex justify-between items-center">
        <AdminPageHeader
          title="Financial"
          highlight="Intel"
          subtitle="Treasury & Command Expenditure Operations"
        />
        <button
          onClick={() => {
            setEditingTransaction(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="h-12 px-8 bg-primary text-black font-black uppercase italic tracking-widest text-[10px] rounded-xl hover:opacity-90 transition-all flex items-center gap-3 tactical-glow"
        >
          <Plus className="w-4 h-4" />
          Create Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Revenue",
            value: `$ ${summary?.totalIncome.toLocaleString() || "0"}`,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/5",
            border: "border-emerald-500/20",
          },
          {
            label: "Operational Costs",
            value: `$ ${summary?.totalExpenses.toLocaleString() || "0"}`,
            icon: TrendingDown,
            color: "text-rose-500",
            bg: "bg-rose-500/5",
            border: "border-rose-500/20",
          },
          {
            label: "Net Balance",
            value: `$ ${summary?.balance.toLocaleString() || "0"}`,
            icon: DollarSign,
            color: "text-primary",
            bg: "bg-primary/5",
            border: "border-primary/20",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-[2rem] border bg-card/40 backdrop-blur-2xl ${stat.border} relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start relative z-10">
              <div
                className={`p-2 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">
                  {stat.label}
                </p>
                <h3 className="text-xl font-black tracking-tighter text-foreground">
                  {stat.value}
                </h3>
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bg} opacity-20`}
            />
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      {/* <div className="bg-card/50 backdrop-blur-2xl border border-border p-8 rounded-[2rem]">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              Deployment Velocity
            </h2>
            <p className="text-[8px] font-black text-foreground/30 uppercase tracking-[0.4em]">
              Monthly Income vs Expenditure Telemetry
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          {summary?.monthly && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthly}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickFormatter={(val) => {
                    const [y, m] = val.split("-");
                    return new Date(
                      parseInt(y),
                      parseInt(m) - 1,
                    ).toLocaleDateString("default", { month: "short" });
                  }}
                />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "1rem",
                  }}
                  itemStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="REVENUE"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  name="EXPENDITURE"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div> */}

      {/* Transactions Container */}
      <div className="bg-card/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl relative z-[50]">
        {/* Unified Filter Header */}
        <div className="p-8 border-b border-white/5 bg-white/[0.01]">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <TacticalSearch
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="SEARCH TRANSACTIONS..."
                className="w-full  !rounded-full"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <TacticalSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: "ALL TYPES", value: "" },
                  { label: "INCOME", value: "INCOME" },
                  { label: "EXPENSE", value: "EXPENSE" },
                ]}
                placeholder="ALL TYPES"
                className="w-full bg-green-300 md:w-48 !rounded-full"
              />
              <TacticalSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { label: "ALL CATEGORIES", value: "" },
                  ...categories.map((c) => ({
                    label: c.replace("_", " "),
                    value: c,
                  })),
                ]}
                placeholder="ALL CATEGORIES"
                className="w-full bg-blue-300 md:w-56 !rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Tactical Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Date
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Category
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-center">
                  Type
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">
                  Amount
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isTransactionsLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-10 py-24 text-center animate-pulse text-foreground/10 uppercase tracking-[0.5em] text-[10px] font-black"
                  >
                    Establishing Uplink...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-10 py-24 text-center text-foreground/10 uppercase tracking-[0.5em] text-[10px] font-black italic"
                  >
                    No Telemetry Detected
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-white/[0.01] transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest tabular-nums font-mono">
                        {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="text-[13px] font-black uppercase tracking-tighter text-foreground/50">
                          {tx.category.replace("_", " ")}
                        </div>
                        <div className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest mt-1">
                          {tx.description || "no details"}
                        </div>
                        {tx.description?.includes("Promo:") && (
                          <div className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 w-fit">
                            <Tag className="w-2 h-2 text-primary" />
                            <span className="text-[8px] font-black text-primary uppercase tracking-tighter">
                               {tx.description.split("Promo:")[1].trim()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                          tx.type === "INCOME"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div
                        className={`text-xl font-black tabular-nums ${
                          tx.type === "INCOME"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+$" : "-$"}
                        {tx.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTransaction(tx);
                            setFormData({
                              amount: tx.amount,
                              type: tx.type,
                              category: tx.category,
                              description: tx.description || "",
                              date: tx.date.split("T")[0],
                            });
                            setIsModalOpen(true);
                          }}
                          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/50 transition-all shadow-xl"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTransactionId(tx.id)}
                          className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                          title="Purge Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TacticalConfirmModal
        isOpen={deletingTransactionId !== null}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={() => {
          if (deletingTransactionId !== null) {
            deleteMutation.mutate(deletingTransactionId);
          }
        }}
        title="Delete Transaction"
        message={`Confirm permanent removal of transaction record. This action cannot be reversed.`}
        type="danger"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <TacticalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? "Edit" : "Add"}
        highlight="Transaction"
        subtitle="Log Financial Movement Data"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INCOME" })}
              className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                formData.type === "INCOME"
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  : "bg-white/[0.03] border-white/5 text-foreground/40 hover:border-white/20"
              }`}
            >
              INCOME
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
              className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                formData.type === "EXPENSE"
                  ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                  : "bg-white/[0.03] border-white/5 text-foreground/40 hover:border-white/20"
              }`}
            >
              EXPENSE
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.2em] ml-1">
                Magnitude (₮)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value),
                  })
                }
                className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-foreground font-black italic text-base outline-none focus:border-primary/50 transition-all"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.2em] ml-1">
                Protocol Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-foreground font-black uppercase text-[10px] outline-none focus:border-primary/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.2em] ml-1">
              Sector Category
            </label>
            <TacticalCombobox
              value={formData.category}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  category: val as TransactionCategory,
                })
              }
              suggestions={categories}
              placeholder="TYPE OR SELECT CATEGORY"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.2em] ml-1">
              Mission Intel
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-foreground font-bold text-xs outline-none focus:border-primary/50 transition-all resize-none"
              placeholder="ENTER PROTOCOL DETAILS..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-12 rounded-2xl border border-white/10 text-foreground/50 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-[2] h-12 bg-primary text-black font-black uppercase italic tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] transition-all tactical-glow disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "PROCESSING..."
                : "CONFIRM"}
            </button>
          </div>
        </form>
      </TacticalModal>
    </div>
  );
}
