import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  X,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Skull,
  Camera,
  Link as LinkIcon,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsers() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [roleFilter, setRoleFilter] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("");
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({
    name: "",
    email: "",
    role: "",
    photo: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "admin-users",
      searchTerm,
      page,
      sortBy,
      sortOrder,
      roleFilter,
      planFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(roleFilter && { role: roleFilter }),
        ...(planFilter && { plan: planFilter }),
      });

      const res = await fetch(`http://localhost:3000/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch users");
      }
      return res.json();
    },
  });

  const userData = data?.items || [];
  const meta = data?.meta || { totalPages: 1, total: 0 };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, planFilter]);

  const updateMutation = useMutation({
    mutationFn: async ({
      userId,
      updateData,
    }: {
      userId: number;
      updateData: any;
    }) => {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeletingUser(null);
    },
    onError: (err: any) => {
      console.error("Purge Error:", err);
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            User <span className="text-primary">Management</span>
          </h1>
          <p className="text-white/50 uppercase tracking-[0.2em] text-[10px] font-bold">
            Monitor and Manage System Access ({meta.total} Users)
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="SEARCH USERS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className="tactical-select w-full md:w-40 h-12 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="truncate">{roleFilter || "ALL ROLES"}</span>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                  <ChevronsUpDown
                    className={`w-3 h-3 transition-all duration-500 ${isRoleOpen ? "text-primary scale-110" : "text-white/30"}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isRoleOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setIsRoleOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[70] overflow-hidden"
                    >
                      <div className="crt-overlay opacity-20" />
                      <div className="relative z-10 space-y-1">
                        {["", "ADMIN", "TRAINER", "USER"].map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              setRoleFilter(role);
                              setIsRoleOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                              roleFilter === role
                                ? "bg-primary/20 text-primary border border-primary/20"
                                : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {role || "ALL ROLES"}
                            {roleFilter === role && (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Plan Filter */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => setIsPlanOpen(!isPlanOpen)}
                className="tactical-select w-full md:w-40 h-12 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="truncate">{planFilter || "ALL PLANS"}</span>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                  <ChevronsUpDown
                    className={`w-3 h-3 transition-all duration-500 ${isPlanOpen ? "text-blue-500 scale-110" : "text-white/30"}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isPlanOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setIsPlanOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[70] overflow-hidden"
                    >
                      <div className="crt-overlay opacity-20" />
                      <div className="relative z-10 space-y-1">
                        {["", "Basic", "Standard", "Premium"].map((plan) => (
                          <button
                            key={plan}
                            onClick={() => {
                              setPlanFilter(plan);
                              setIsPlanOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                              planFilter === plan
                                ? "bg-blue-500/20 text-blue-500 border border-blue-500/20"
                                : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {plan || "ALL PLANS"}
                            {planFilter === plan && (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "name" ? "text-primary" : "text-white/10"}`}
                    />
                  </div>
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-2">
                    Role
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "role" ? "text-primary" : "text-white/10"}`}
                    />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Membership
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "createdAt" ? "text-primary" : "text-white/10"}`}
                    />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center animate-pulse text-white/20 uppercase font-black text-xs tracking-widest"
                  >
                    Scanning Network...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-red-500 uppercase font-black text-xs tracking-widest"
                  >
                    Uplink Error: {error.message}
                  </td>
                </tr>
              ) : userData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-white/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Users Found
                  </td>
                </tr>
              ) : (
                userData.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-primary overflow-hidden italic text-sm">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name?.[0] || "U"
                          )}
                        </div>
                        <div>
                          <div className="font-black text-white text-sm uppercase tracking-tight">
                            {user.name}
                          </div>
                          <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          user.role === "ADMIN"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : user.role === "TRAINER"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-white/5 text-white/40 border-white/5"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {user.memberships?.[0] ? (
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                          {user.memberships[0].planTier}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/10 italic">
                          No Active Plan
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button
                          onClick={() => setViewingUser(user)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-primary hover:border-primary/20 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setEditFormData({
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              photo: user.photo || "",
                            });
                          }}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-blue-500 hover:border-blue-500/20 transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                          title="Delete User"
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

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-8 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                Showing {userData.length} of {meta.total} Users
              </div>

              <div className="flex items-center gap-2 ml-2">
                <span className="text-[8px] font-black uppercase text-white/10 tracking-widest">
                  ROWS PER PAGE:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="tactical-select !py-1 !px-2 h-8 !bg-white/10"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="group h-10 px-4 flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 disabled:opacity-20 hover:bg-white/10 hover:border-white/10 transition-all font-bold text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Previous
              </button>

              <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Page <span className="text-primary">{page}</span> OF{" "}
                {meta.totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="group h-10 px-4 flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 disabled:opacity-20 hover:bg-white/10 hover:border-white/10 transition-all font-bold text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* View Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden tactical-glow"
            >
              <div className="crt-overlay" />
              <div className="absolute top-0 right-0 p-6 text-white/5 pointer-events-none">
                <User className="w-24 h-24" />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden italic">
                    {viewingUser.photo ? (
                      <img
                        src={viewingUser.photo}
                        alt={viewingUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      viewingUser.name?.[0]
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white italic tracking-tighter uppercase mb-0.5">
                      {viewingUser.name}
                    </h2>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                      User Profile Diagnostics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <Mail className="w-4 h-4 text-primary mb-2" />
                    <span className="text-[8px] font-bold uppercase text-white/30 block mb-0.5">
                      Email address
                    </span>
                    <span className="text-xs font-normal text-white break-all">
                      {viewingUser.email}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-primary mb-2" />
                    <span className="text-[8px] font-bold uppercase text-white/30 block mb-0.5">
                      Access Level
                    </span>
                    <span className="text-xs font-medium text-white uppercase tracking-widest">
                      {viewingUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <Calendar className="w-4 h-4 text-primary mb-2" />
                    <span className="text-[8px] font-bold uppercase text-white/30 block mb-0.5">
                      Initialization Date
                    </span>
                    <span className="text-xs font-normal text-white">
                      {new Date(viewingUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-4 h-4 rounded-full bg-primary mb-2 opacity-50" />
                    <span className="text-[8px] font-bold uppercase text-white/30 block mb-0.5">
                      Membership Tier
                    </span>
                    <span className="text-xs font-medium text-white uppercase tracking-widest">
                      {viewingUser.memberships?.[0]?.planTier || "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 border border-primary/20 rounded-xl bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">
                      System Uplink Stable - Verified Record
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-lg w-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden tactical-glow"
            >
              <div className="crt-overlay" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white italic tracking-tighter uppercase">
                    Modify <span className="text-primary">Identity</span>
                  </h2>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    User ID: #{editingUser.id}
                  </p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    userId: editingUser.id,
                    updateData: editFormData,
                  });
                }}
                className="space-y-4"
              >
                {updateMutation.isError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                      Update Failure: {updateMutation.error.message}
                    </p>
                  </div>
                )}

                {/* Photo Section */}
                <div className="flex items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-2xl mb-2">
                  <div className="relative group/photo">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {editFormData.photo ? (
                        <img
                          src={editFormData.photo}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-black rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-primary/20">
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
                              setEditFormData({
                                ...editFormData,
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
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                      Photo Identifier (Link)
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="text"
                        value={editFormData.photo}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            photo: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="w-full h-9 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-[10px] font-medium text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                    Access Permission
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium text-white focus:outline-none focus:border-primary transition-colors appearance-none"
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-[2] h-12 rounded-xl bg-primary text-black text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Syncing..." : "Apply Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingUser(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 max-w-md w-full bg-red-950/20 backdrop-blur-2xl border border-red-500/30 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden"
            >
              <div className="crt-overlay opacity-20" />
              <div className="absolute top-0 right-0 p-6 text-red-500/10 pointer-events-none">
                <Skull className="w-24 h-24" />
              </div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 relative">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div
                    className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                </div>

                <h2 className="text-xl font-bold text-white italic tracking-tighter uppercase mb-2">
                  Purge <span className="text-red-500">Authorization</span>
                </h2>
                <p className="text-[9px] font-bold text-red-500/50 uppercase tracking-[0.3em] mb-5">
                  Critical Sector Action Required
                </p>

                {deleteMutation.isError && (
                  <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                      Error:{" "}
                      {(deleteMutation.error as any)?.message ||
                        "Protocol Denied"}
                    </p>
                  </div>
                )}

                <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                  <p className="text-[10px] font-medium text-white/60 mb-1">
                    Permanently delete user record:
                  </p>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">
                    {deletingUser?.name}
                  </p>
                  <p className="text-[9px] font-medium text-white/20 mt-1 uppercase tracking-widest">
                    {deletingUser?.email}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => setDeletingUser(null)}
                    className="h-10 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deletingUser.id)}
                    disabled={deleteMutation.isPending}
                    className="h-10 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
                  >
                    {deleteMutation.isPending ? "Purging..." : "Confirm Purge"}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-red-500/40 uppercase tracking-[0.2em]">
                    Warning: This action is irreversible
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
