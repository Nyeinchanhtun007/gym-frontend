import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Mail,
  MapPin,
  X,
  Calendar,
  Zap,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Trainers() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  const { data: trainersData, isLoading } = useQuery({
    queryKey: ["trainers", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/users/trainers?page=${currentPage}&limit=${itemsPerPage}`,
      );
      if (!res.ok) throw new Error("Communications Link Failure");
      return res.json();
    },
  });

  const trainers = trainersData?.items || [];
  const meta = trainersData?.meta || { totalPages: 1 };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin mb-4" />
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">
          Scanning Elite Personnel...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background Visual Components */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tactical Header */}
        <header className="mb-16 border-l-4 border-primary pl-8 py-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary fill-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                Active Sector: Instructors
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">
              Tactical <span className="text-primary italic">Instructors</span>
            </h1>
            <p className="max-w-2xl text-white/40 font-bold uppercase tracking-widest text-xs">
              Elite Personnel management and deployment diagnostics. These
              operatives are Tier-1 certified specialists dedicated to your
              physical optimization.
            </p>
          </motion.div>
        </header>

        {/* Trainers Grid */}
        {trainers.length === 0 ? (
          <div className="py-40 text-center border border-white/5 bg-white/[0.02] rounded-[3rem]">
            <Users className="w-20 h-20 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic text-white/20">
              No Personnel Detected
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer: any, i: number) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedTrainer(trainer)}
                className="group relative bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 cursor-pointer shadow-2xl"
              >
                {/* Hero Photo Section */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                  {trainer.photo ? (
                    <img
                      src={trainer.photo}
                      alt={trainer.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <ShieldCheck className="w-24 h-24 text-white/[0.02]" />
                    </div>
                  )}

                  {/* Performance Ranking */}
                  <div className="absolute top-6 left-6 z-20">
                    <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md flex items-center gap-2">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                        Elite Pro
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 z-20">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950/80 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Identity Segment */}
                <div className="p-8 pt-0 mt-[-2.5rem] relative z-20">
                  <div className="flex items-end gap-5 mb-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-950 border-2 border-white/10 p-1 flex-shrink-0 shadow-2xl">
                      <div className="w-full h-full rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-2xl text-primary overflow-hidden italic shadow-inner">
                        {trainer.photo ? (
                          <img
                            src={trainer.photo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          trainer.name?.[0]
                        )}
                      </div>
                    </div>
                    <div className="pb-2">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors">
                        {trainer.name}
                      </h3>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                        Sector Instructor
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 border-t border-white/5 pt-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                        Master Specialist
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <MapPin className="w-3.5 h-3.5 text-white/20" />
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        Sector 7 Base
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-30 opacity-20" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Tactical Pagination */}
        {meta.totalPages > 1 && (
          <nav className="mt-20 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-20 flex items-center justify-center group transition-all"
            >
              <ChevronsLeft className="w-5 h-5 text-white/40 group-hover:text-black transition-colors" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-20 flex items-center justify-center group transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-black transition-colors" />
            </button>

            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Sector <span className="text-primary italic">{currentPage}</span>{" "}
              of {meta.totalPages}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
              }
              disabled={currentPage === meta.totalPages}
              className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-20 flex items-center justify-center group transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-black transition-colors" />
            </button>
            <button
              onClick={() => setCurrentPage(meta.totalPages)}
              disabled={currentPage === meta.totalPages}
              className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary hover:border-primary disabled:opacity-20 flex items-center justify-center group transition-all"
            >
              <ChevronsRight className="w-5 h-5 text-white/40 group-hover:text-black transition-colors" />
            </button>
          </nav>
        )}
      </div>

      {/* Trainer Profile Diagnostics Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainer(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative max-w-xl w-full bg-zinc-950 border border-white/10 rounded-[2.5rem] p-7 shadow-[0_0_100px_rgba(255,62,62,0.1)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-white/[0.03] pointer-events-none">
                <ShieldCheck className="w-40 h-40 rotate-12" />
              </div>

              <button
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group z-50"
              >
                <X className="w-5 h-5 text-white/40 group-hover:text-white" />
              </button>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-zinc-900 border-2 border-white/10 p-1 flex-shrink-0 shadow-2xl relative">
                    <div className="w-full h-full rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-3xl text-primary overflow-hidden italic">
                      {selectedTrainer.photo ? (
                        <img
                          src={selectedTrainer.photo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedTrainer.name?.[0]
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Award className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[8px] font-black text-primary uppercase tracking-widest italic">
                        PRO Operative
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
                      {selectedTrainer.name}
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[9px]">
                      Master Strength Specialist
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <Mail className="w-4 h-4 text-primary mb-2" />
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block mb-1">
                      Communications
                    </span>
                    <span className="text-xs font-bold text-white italic truncate block">
                      {selectedTrainer.email}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <Calendar className="w-4 h-4 text-primary mb-2" />
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest block mb-1">
                      Service Status
                    </span>
                    <span className="text-xs font-bold text-white italic capitalize block">
                      Active Deployment
                    </span>
                  </div>
                </div>

                {/* New: Active Deployments Section */}
                <div className="p-5 bg-primary/[0.02] border border-primary/10 rounded-[2rem] relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">
                      <LayoutDashboard className="w-3.5 h-3.5" /> High-Intensity
                      Deployments
                    </h4>

                    <div className="space-y-2">
                      {selectedTrainer.classes &&
                      selectedTrainer.classes.length > 0 ? (
                        selectedTrainer.classes.map((cls: any) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 border border-white/5"
                          >
                            <span className="text-[10px] font-black text-white uppercase italic tracking-tight">
                              {cls.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">
                                Active
                              </span>
                              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-[9px] font-bold text-white/10 uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
                          No Active Missions detected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-6 text-primary/[0.03] pointer-events-none">
                    <Star className="w-16 h-16 fill-primary" />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-[0.3em] hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 shadow-inner"
                >
                  Close Personnel Diagnostic
                </button>
              </div>

              {/* Advanced Scanline/CRT Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-30 opacity-30" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
