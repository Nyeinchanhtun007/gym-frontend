import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Plus, Edit3, Trash2, Package, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TacticalSearch from "@/components/admin/TacticalSearch";
import ConfirmModal from "@/components/admin/ConfirmModal";
import type { Product } from "@/types/products";

export default function AdminProducts() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "Sportswear",
    stock: 0,
    image: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  const categories = ["Sportswear", "Shoes", "Protein", "Towel"];

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const isEdit = !!editingProduct;
      const url = isEdit ? `http://localhost:3000/products/${editingProduct.id}` : "http://localhost:3000/products";
      const method = isEdit ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
      setIsCreating(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "Sportswear",
      stock: 0,
      image: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
    });
  };

  const filteredProducts = (products || []).filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
      <AdminPageHeader
        title="Inventory"
        highlight="Management"
        subtitle="Control gym merchandise, stock levels, and store pricing"
      />

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <TacticalSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search items..."
          className="w-full md:w-96"
        />

        <Button
          onClick={handleCreate}
          className="w-full md:w-auto px-6 h-11 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-16">ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right w-32">Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center w-32">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-muted/10"></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                      No products found
                   </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground">#{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-foreground leading-tight">{p.name}</p>
                           <p className="text-[10px] font-medium text-muted-foreground truncate max-w-[200px] mt-0.5">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 uppercase tracking-tight">
                         {p.category}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-sm font-black text-foreground">${p.price}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-[11px] font-bold px-3 py-1 rounded-lg border ${
                         p.stock > 10 ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
                         p.stock > 0 ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' : 
                         'bg-destructive/5 text-destructive border-destructive/10'
                       }`}>
                         {p.stock} Units
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmConfig({
                                isOpen: true,
                                title: "Delete Product",
                                message: `Are you sure you want to delete "${p.name}"? This will deactivate the item.`,
                                type: "danger",
                                onConfirm: () => deleteMutation.mutate(p.id),
                              });
                            }}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Delete Product"
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

      <AnimatePresence>
        {(isCreating || editingProduct) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreating(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h2 className="text-3xl font-black text-foreground tracking-tight">
                     {editingProduct ? 'EDIT' : 'NEW'} <span className="text-primary italic">PRODUCT</span>
                   </h2>
                   <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                     {editingProduct ? 'Updating inventory record' : 'Creating new store item'}
                   </p>
                </div>
                <button
                   onClick={() => { setIsCreating(false); setEditingProduct(null); }}
                   className="p-2 rounded-2xl bg-muted/30 border border-border hover:bg-muted text-muted-foreground transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Item Name</Label>
                       <Input
                         required
                         value={formData.name}
                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                         className="h-12 bg-muted/20 border-border rounded-2xl focus:ring-primary/20 font-bold"
                         placeholder="e.g. Performance Aero Shoes"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Category</Label>
                       <select
                         value={formData.category}
                         onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                         className="w-full h-12 bg-muted/20 border border-border rounded-2xl px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                       >
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Description</Label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px] bg-muted/20 border-border rounded-2xl px-4 py-3 text-sm focus:ring-primary/20 resize-none font-medium leading-relaxed"
                      placeholder="Enter product details and technical specifications..."
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Retail Price ($)</Label>
                       <Input
                         type="number"
                         step="0.01"
                         required
                         value={formData.price}
                         onChange={(e) => setFormData({ ...formData, price: e.target.value as any })}
                         className="h-12 bg-muted/20 border-border rounded-2xl focus:ring-primary/20 font-black text-lg"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Stock Quantity</Label>
                       <Input
                         type="number"
                         required
                         value={formData.stock}
                         onChange={(e) => setFormData({ ...formData, stock: e.target.value as any })}
                         className="h-12 bg-muted/20 border-border rounded-2xl focus:ring-primary/20 font-black text-lg"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Image URL</Label>
                    <div className="relative">
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="h-12 pl-12 bg-muted/20 border-border rounded-2xl focus:ring-primary/20 font-medium"
                        placeholder="https://example.com/item.jpg"
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-8 border-t border-border mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setIsCreating(false); setEditingProduct(null); }}
                      className="h-12 px-8 rounded-2xl border border-border text-foreground hover:bg-muted font-bold tracking-tighter"
                    >
                      CANCEL
                    </Button>
                    <Button
                      type="submit"
                      disabled={upsertMutation.isPending}
                      className="h-12 px-10 rounded-2xl bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all font-black"
                    >
                      {upsertMutation.isPending ? 'SAVING...' : (editingProduct ? 'UPDATE ITEM' : 'CREATE ITEM')}
                    </Button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </div>
  );
}
