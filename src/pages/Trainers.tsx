import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Trainer } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRAINER_IMAGES: Record<string, string> = {
  Default:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
};

export default function Trainers() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const {
    data: trainersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      // Use backend filtering for role=TRAINER
      const res = await fetch(
        "http://localhost:3000/users?role=TRAINER&limit=100",
      );
      if (!res.ok) throw new Error("Failed to fetch trainers");
      const data = await res.json();
      return { items: data.items || [] };
    },
  });

  const trainers = trainersData?.items || [];

  // Pagination calculations
  const totalPages = Math.ceil(trainers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrainers = trainers.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="container px-4 py-40 mx-auto text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
        <p className="text-xl font-black tracking-widest uppercase opacity-50 animate-pulse">
          Loading Trainers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-40 mx-auto text-center">
        <p className="text-destructive text-lg">
          Failed to load trainers. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Simplified Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="container px-6 mx-auto relative z-10 py-8">
        {/* Clean Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Our Trainers
          </h1>
          <p className="text-white/50 text-sm max-w-2xl">
            Meet our expert trainers dedicated to helping you achieve your
            fitness goals
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center gap-4 text-sm"
        >
          <div className="text-white/40">
            <span className="font-bold text-white">{trainers.length}</span>{" "}
            trainers
          </div>
          {totalPages > 1 && (
            <>
              <div className="h-4 w-px bg-white/10" />
              <div className="text-white/40">
                Page <span className="font-bold text-white">{currentPage}</span>{" "}
                of <span className="font-bold text-white">{totalPages}</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Trainers Grid */}
        {trainers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">
              No Trainers Yet
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
              There are currently no trainers in the system. Please add trainers
              with the TRAINER role to see them here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(paginatedTrainers || []).map((trainer: Trainer, i: number) => {
              const imageUrl = TRAINER_IMAGES["Default"];

              return (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card
                    onClick={() => setSelectedTrainer(trainer)}
                    className="h-full flex flex-col glass-card overflow-hidden group border-white/5 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
                  >
                    <div className="h-32 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                      <img
                        src={imageUrl}
                        alt={trainer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-2 right-2 z-20 glass px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-[9px] font-black">PRO</span>
                      </div>
                    </div>

                    <CardHeader className="relative -mt-6 z-20 bg-transparent pb-2 px-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="bg-primary text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                          TRAINER
                        </span>
                      </div>
                      <CardTitle className="text-sm font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                        {trainer.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 px-3 pt-0 pb-2">
                      <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-white/80">
                            {trainer.specialization || "Fitness Expert"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-white/80">
                            {trainer.classes?.length || 0} Classes
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="px-3 py-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrainer(trainer);
                        }}
                        className="w-full font-black uppercase tracking-widest h-9 text-[10px] rounded-lg group/btn group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 flex items-center justify-center gap-2"
          >
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-all flex items-center justify-center group"
            >
              <ChevronsLeft className="w-4 h-4 text-white/50 group-hover:text-black transition-colors" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-all flex items-center justify-center group"
            >
              <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-black transition-colors" />
            </button>

            <div className="flex items-center gap-2 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center gap-2">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-white/30 font-black">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 h-10 px-3 rounded-xl font-black text-sm transition-all ${
                        currentPage === page
                          ? "bg-primary text-black shadow-lg shadow-primary/20 scale-110"
                          : "border border-white/5 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-all flex items-center justify-center group"
            >
              <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-black transition-colors" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-all flex items-center justify-center group"
            >
              <ChevronsRight className="w-4 h-4 text-white/50 group-hover:text-black transition-colors" />
            </button>
          </motion.div>
        )}

        {/* Trainer Detail Modal */}
        <AnimatePresence>
          {selectedTrainer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTrainer(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
              >
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <span className="text-white/50 text-xl">×</span>
                </button>

                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                        Expert Trainer
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">
                      {selectedTrainer.name}
                    </h2>
                    <p className="text-white/50 text-sm">
                      {selectedTrainer.specialization || "Fitness Expert"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 block">
                          Specialization
                        </span>
                        <span className="text-sm font-bold text-white">
                          {selectedTrainer.specialization || "General Fitness"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 block">
                          Active Classes
                        </span>
                        <span className="text-sm font-bold text-white">
                          {selectedTrainer.classes?.length || 0} Classes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={() => setSelectedTrainer(null)}
                      className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/90"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
