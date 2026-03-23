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
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        highlight="Management"
        subtitle="View and manage gym members and staff"
      />

      <div className="bg-card border border-border p-5 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <TacticalSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
            className="w-full md:w-96"
          />

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <TacticalSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: "All Roles", value: "" },
                { label: "Admin", value: "ADMIN" },
                { label: "Trainer", value: "TRAINER" },
                { label: "User", value: "USER" },
              ]}
              accentColor="primary"
              className="flex-1 md:flex-none md:w-44"
            />

            <TacticalSelect
              value={planFilter}
              onChange={setPlanFilter}
              options={[
                { label: "All Plans", value: "" },
                { label: "Basic", value: "Basic" },
                { label: "Standard", value: "Standard" },
                { label: "Premium", value: "Premium" },
              ]}
              accentColor="blue"
              className="flex-1 md:flex-none md:w-44"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th
                  className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    User
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 transition-colors ${sortBy === "name" ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-2">
                    Role
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 transition-colors ${sortBy === "role" ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">
                  Membership
                </th>
                <th
                  className="px-6 py-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 transition-colors ${sortBy === "createdAt" ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-red-500"
                  >
                    Error: {error.message}
                  </td>
                </tr>
              ) : userData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                userData.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary overflow-hidden text-sm shrink-0">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">
                            {user.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.role === "ADMIN"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : user.role === "TRAINER"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.memberships?.[0] ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-medium text-foreground">
                          {user.memberships[0].planTier}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          No Active Plan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingUser(user)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
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
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
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
          <div className="px-6 py-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {userData.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {meta.total}
                </span>{" "}
                users
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-md bg-muted border border-border px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 px-3 flex items-center gap-1 rounded-md bg-card border border-border disabled:opacity-50 hover:bg-muted transition-colors text-sm font-medium text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="px-3 py-1.5 text-sm font-medium text-muted-foreground">
                Page <span className="text-foreground">{page}</span> of{" "}
                {meta.totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="h-9 px-3 flex items-center gap-1 rounded-md bg-card border border-border disabled:opacity-50 hover:bg-muted transition-colors text-sm font-medium text-foreground"
              >
                Next
                <ChevronRight className="w-4 h-4" />
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
