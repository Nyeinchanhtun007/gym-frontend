import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GymClass } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Dumbbell,
  Loader2,
  Info,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CLASS_IMAGES: Record<string, string> = {
  Full: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  Yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
  Boxing:
    "https://images.unsplash.com/photo-1599553229615-544131af5473?q=80&w=2070&auto=format&fit=crop",
  HIIT: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
  Default:
    "https://images.unsplash.com/photo-1549476464-37392f719918?q=80&w=2070&auto=format&fit=crop",
};

export default function Classes() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: classesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/classes?limit=100");
      if (!res.ok) throw new Error("Failed to fetch classes");
      return res.json();
    },
  });

  const classes = classesData?.items || [];

  const bookingMutation = useMutation({
    mutationFn: async (classId: number) => {
      if (!user) throw new Error("Please log in to book a session");
      const res = await fetch("http://localhost:3000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          classId: classId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to book class");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      alert("Deployment confirmed! See you at the session.");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleBooking = (classId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }
    bookingMutation.mutate(classId);
  };

  const filteredClasses = (classes || []).filter(
    (c: GymClass) => activeFilter === "All" || c.name.includes(activeFilter),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-40 mx-auto text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_oklch(0.48_0.22_25_/_0.2)]" />
        <p className="text-xl font-black tracking-widest uppercase opacity-50 animate-pulse">
          Calibrating Arsenal...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-40 mx-auto text-center">
        <div className="inline-flex p-6 rounded-3xl glass-card border-destructive/20 mb-6">
          <Dumbbell className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">
          Communication Blocked
        </h2>
        <p className="text-muted-foreground text-lg">
          Error loading classes. Please check your uplink and try again.
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
            All Classes
          </h1>
          <p className="text-white/50 text-sm max-w-2xl">
            Browse and book from our selection of expert-led fitness sessions
          </p>
        </motion.div>
        {/* Filters & Stats in One Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {["All", "Full", "Yoga", "Boxing", "HIIT"].map((filter) =>
              activeFilter === filter ? (
                <motion.button
                  layoutId="activeFilter"
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className="px-5 py-2 rounded-lg bg-primary text-black font-bold text-sm whitespace-nowrap"
                >
                  {filter}
                </motion.button>
              ) : (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className="px-5 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 font-bold text-sm whitespace-nowrap transition-all"
                >
                  {filter}
                </button>
              ),
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-white/40">
              <span className="font-bold text-white">
                {filteredClasses.length}
              </span>{" "}
              classes
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-white/40">
              Page <span className="font-bold text-white">{currentPage}</span>{" "}
              of <span className="font-bold text-white">{totalPages}</span>
            </div>
          </div>
        </motion.div>
        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(paginatedClasses || []).map((gymClass: GymClass, i: number) => {
            const classType =
              Object.keys(CLASS_IMAGES).find((key) =>
                gymClass.name.includes(key),
              ) || "Default";
            const imageUrl = CLASS_IMAGES[classType];

            return (
              <motion.div
                key={gymClass.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card
                  onClick={() => setSelectedClass(gymClass)}
                  className="h-full flex flex-col glass-card overflow-hidden group border-white/5 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
                >
                  <div className="h-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                    <img
                      src={imageUrl}
                      alt={gymClass.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-2 right-2 z-20 glass px-2 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-black">
                        {gymClass.capacity - (gymClass.bookings?.length || 0)}{" "}
                        SLOTS
                      </span>
                    </div>
                  </div>

                  <CardHeader className="relative -mt-6 z-20 bg-transparent pb-2 px-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="bg-primary text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-[0_0_10px_oklch(0.48_0.22_25_/_0.3)]">
                        {gymClass.name.split(" ")[0]}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {gymClass.name}
                    </CardTitle>
                    <p className="text-[10px] text-white/50 mt-1">
                      with {gymClass.trainer?.name || "Expert Trainer"}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 px-3 pt-0 pb-2">
                    <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-white/80">
                          {new Date(gymClass.schedule).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-white/80">
                          {new Date(gymClass.schedule).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-3 py-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBooking(gymClass.id);
                      }}
                      disabled={bookingMutation.isPending}
                      className="w-full font-black uppercase tracking-widest h-9 text-[10px] rounded-lg group/btn group-hover:shadow-[0_0_20px_oklch(0.48_0.22_25_/_0.2)] transition-all"
                    >
                      {bookingMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Book Now
                          <Dumbbell className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
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
                  // Show first page, last page, current page, and pages around current
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
        <AnimatePresence>
          {selectedClass && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClass(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              >
                <button
                  onClick={() => setSelectedClass(null)}
                  className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col">
                  <div className="h-64 relative">
                    <img
                      src={
                        CLASS_IMAGES[
                          Object.keys(CLASS_IMAGES).find((key) =>
                            selectedClass.name.includes(key),
                          ) || "Default"
                        ]
                      }
                      className="w-full h-full object-cover"
                      alt={selectedClass.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                    <div className="absolute bottom-6 left-8">
                      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        Verified Session
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                        {selectedClass.name}
                      </h2>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 text-left">
                            Date
                          </span>
                          <span className="text-sm font-bold text-white whitespace-nowrap">
                            {new Date(
                              selectedClass.schedule,
                            ).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 text-left">
                            Time
                          </span>
                          <span className="text-sm font-bold text-white">
                            {new Date(
                              selectedClass.schedule,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 text-left">
                            Instructor
                          </span>
                          <span className="text-sm font-bold text-white whitespace-nowrap">
                            {selectedClass.trainer?.name || "Expert"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        Session Briefing
                      </h4>
                      <p className="text-white/60 text-sm leading-relaxed text-left">
                        {selectedClass.description}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={() => {
                          handleBooking(selectedClass.id);
                          setSelectedClass(null);
                        }}
                        className="flex-1 h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90"
                      >
                        Acquire Slot
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedClass(null)}
                        className="h-14 border-white/10 text-white font-black uppercase tracking-widest rounded-2xl px-8"
                      >
                        Close
                      </Button>
                    </div>
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
