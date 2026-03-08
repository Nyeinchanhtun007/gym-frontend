import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import TacticalSelect from "@/components/ui/TacticalSelect";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import UserViewModal from "@/components/admin/UserViewModal";
import UserEditModal from "@/components/admin/UserEditModal";
import UserDeleteModal from "@/components/admin/UserDeleteModal";

export default function AdminUsers() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [roleFilter, setRoleFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
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
      <AdminPageHeader
        title="Operative"
        highlight="Database"
        subtitle="Central Intelligence & Access Control"
      />

      <div className="bg-card/50 backdrop-blur-2xl border border-border p-6 rounded-[2rem] relative z-50">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10 relative z-10">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="SEARCH OPERATIVES..."
            className="w-full md:w-96"
          />

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <TacticalSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: "ALL ROLES", value: "" },
                { label: "ADMIN", value: "ADMIN" },
                { label: "TRAINER", value: "TRAINER" },
                { label: "USER", value: "USER" },
              ]}
              accentColor="primary"
              className="flex-1 md:flex-none md:w-44"
              placeholder="ALL ROLES"
            />

            <TacticalSelect
              value={planFilter}
              onChange={setPlanFilter}
              options={[
                { label: "ALL PLANS", value: "" },
                { label: "Basic", value: "Basic" },
                { label: "Standard", value: "Standard" },
                { label: "Premium", value: "Premium" },
              ]}
              accentColor="blue"
              className="flex-1 md:flex-none md:w-44"
              placeholder="ALL PLANS"
            />
          </div>
        </div>
      </div>

      <div className="bg-card/50 border border-border rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "name" ? "text-primary" : "text-foreground/10"}`}
                    />
                  </div>
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-2">
                    Role
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "role" ? "text-primary" : "text-foreground/10"}`}
                    />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                  Membership
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    <ArrowUpDown
                      className={`w-3 h-3 ${sortBy === "createdAt" ? "text-primary" : "text-foreground/10"}`}
                    />
                  </div>
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
                    className="px-8 py-20 text-center text-foreground/20 uppercase font-black text-xs tracking-widest"
                  >
                    No Users Found
                  </td>
                </tr>
              ) : (
                userData.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-foreground/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center font-black text-primary overflow-hidden italic text-sm">
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
                          <div className="font-black text-foreground text-sm uppercase tracking-tight">
                            {user.name}
                          </div>
                          <div className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          user.role === "ADMIN"
                            ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                            : user.role === "TRAINER"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                              : "bg-foreground/10 text-foreground/70 border-border"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {user.memberships?.[0] ? (
                        <span className="px-3 py-1 rounded-lg bg-foreground/5 border border-border text-[9px] font-black uppercase tracking-widest text-foreground/60">
                          {user.memberships[0].planTier}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/10 italic">
                          No Active Plan
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-outfit">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button
                          onClick={() => setViewingUser(user)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground/40 hover:text-primary hover:border-primary/20 transition-all font-outfit"
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
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground/40 hover:text-blue-500 hover:border-blue-500/20 transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-foreground/5 border border-border text-foreground/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
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
          <div className="px-8 py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 font-outfit">
                Showing {userData.length} of {meta.total} Users
              </div>

              <div className="flex items-center gap-2 ml-2">
                <span className="text-[8px] font-black uppercase text-foreground/10 tracking-widest">
                  ROWS PER PAGE:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="tactical-select !py-1 !px-2 h-8 !bg-foreground/5 text-foreground border border-border"
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
                className="group h-10 px-4 flex items-center gap-2 rounded-xl bg-foreground/5 border border-border disabled:opacity-20 hover:bg-foreground/10 hover:border-border transition-all font-bold text-[10px] uppercase tracking-widest text-foreground/60 hover:text-foreground"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Previous
              </button>

              <div className="px-4 py-2 bg-foreground/5 rounded-xl border border-border text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Page <span className="text-primary">{page}</span> OF{" "}
                {meta.totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="group h-10 px-4 flex items-center gap-2 rounded-xl bg-foreground/5 border border-border disabled:opacity-20 hover:bg-foreground/10 hover:border-border transition-all font-bold text-[10px] uppercase tracking-widest text-foreground/60 hover:text-foreground"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        <UserViewModal
          user={viewingUser}
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
        />

        <UserEditModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(userId, updateData) =>
            updateMutation.mutate({ userId, updateData })
          }
          isLoading={updateMutation.isPending}
          error={updateMutation.error}
          formData={editFormData}
          setFormData={setEditFormData}
        />

        <UserDeleteModal
          user={deletingUser}
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={(userId) => deleteMutation.mutate(userId)}
          isLoading={deleteMutation.isPending}
          error={deleteMutation.error}
        />
      </AnimatePresence>
    </div>
  );
}
