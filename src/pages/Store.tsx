import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { ShoppingCart, Package, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/products";

export default function Store() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Sportswear", "Shoes", "Protein", "Towel"];

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (items: { productId: number; quantity: number }[]) => {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to place order");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      alert("Order placed successfully!");
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  const filteredProducts = (products || []).filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
              GYM <span className="text-primary italic">STORE</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg font-medium leading-relaxed">
              Premium gear and supplements to fuel your performance and recovery.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 bg-card/50 border-border rounded-2xl focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-card rounded-3xl animate-pulse border border-border" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or category filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={product.id}
                className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <Package className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-border">
                      {product.category}
                    </span>
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="px-6 py-2 bg-destructive text-destructive-foreground font-black rounded-xl rotate-[-5deg] text-sm shadow-xl">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-foreground">
                        ${product.price}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                        In Stock: {product.stock}
                      </span>
                    </div>

                    <Button
                      disabled={product.stock === 0 || !token}
                      onClick={() => orderMutation.mutate([{ productId: product.id, quantity: 1 }])}
                      className="bg-primary text-primary-foreground h-11 px-5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
