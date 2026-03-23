import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Tag,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import SimpleModal from "@/components/ui/SimpleModal";
import SimpleCombobox from "@/components/ui/SimpleCombobox";
import SimpleSelect from "@/components/ui/SimpleSelect";
import ConfirmModal from "@/components/admin/ConfirmModal";
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
      alert("Failed to create transaction. Ensure valid inputs.");
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
        throw new Error(errorMsg);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounting-summary"] });
      setDeletingTransactionId(null);
      setIsConfirmOpen(false);
    },
    onError: (err: any) => {
      alert("Delete failed: " + (err.message || "Unknown error"));
    },
  });

  const resetForm = () => {
    setFormData({
      amount: 0,
      type: "INCOME",
      category: categoriesData?.[0] || "" as TransactionCategory,
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

  const categories = categoriesData || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounting</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and track your gym's financial health</p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground h-11 px-6 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 font-bold" />
          New Transaction
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Income",
            value: `$${summary?.totalIncome.toLocaleString() || "0"}`,
            icon: ArrowUpRight,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-950/30",
            trend: "Revenue stream",
          },
          {
            label: "Total Expenses",
            value: `$${summary?.totalExpenses.toLocaleString() || "0"}`,
            icon: ArrowDownRight,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-100 dark:bg-rose-950/30",
            trend: "Operational costs",
          },
          {
            label: "Net Balance",
            value: `$${summary?.balance.toLocaleString() || "0"}`,
            icon: Wallet,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-950/30",
            trend: "Current treasury",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${stat.color.split(' ')[0]} bg-current`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Table Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <SimpleSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "", label: "All Types" },
                  { value: "INCOME", label: "Income" },
                  { value: "EXPENSE", label: "Expense" },
                ]}
                placeholder="All Types"
              />
              <SimpleSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map((c) => ({
                    value: c,
                    label: c.replace("_", " "),
                  })),
                ]}
                placeholder="All Categories"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isTransactionsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground capitalize">
                          {tx.category.replace("_", " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tx.description || "No description"}
                        </span>
                        {tx.description?.includes("Promo:") && (
                          <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-primary/10 w-fit">
                            <Tag className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-semibold text-primary">
                              {tx.description.split("Promo:")[1].trim()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          tx.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-bold ${
                          tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}${tx.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 transition-opacity">
                        <button
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
                          className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200"
                          title="Edit Transaction"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTransactionId(tx.id);
                            setIsConfirmOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-600 transition-all duration-200"
                          title="Delete Transaction"
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

      {/* Entry Modal */}
      <SimpleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? "Edit Transaction" : "New Transaction"}
        subtitle="Log income or expense details for accounting"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INCOME" })}
              className={`py-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                formData.type === "INCOME"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                  : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
              className={`py-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                formData.type === "EXPENSE"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600"
                  : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Transaction Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Transaction Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Category</label>
            <SimpleCombobox
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val as TransactionCategory })}
              suggestions={categories}
              placeholder="Select or type a category"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-muted/30 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none placeholder:text-muted-foreground/40 font-medium"
              placeholder="Enter specific details about this transaction..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 h-10 rounded-lg border border-border text-foreground hover:bg-muted font-bold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-xs shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </SimpleModal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (deletingTransactionId !== null) {
            deleteMutation.mutate(deletingTransactionId);
          }
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        type="danger"
      />
    </div>
  );
}
