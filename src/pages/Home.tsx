import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { GymClass, User } from "@/types";
import {
  CheckCircle2,
  Dumbbell,
  Timer,
  Trophy,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Plus,
  Info,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  X,
  Ticket,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      return res.json();
    },
  });

  const { data: trainersData } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await fetch(
        "http://localhost:3000/users?role=TRAINER&limit=100",
      );
      if (!res.ok) throw new Error("Failed to fetch trainers");
      const data = await res.json();
      return { items: data.items || [] };
    },
  });

  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/membership-plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
  });
  
  const { data: activeDiscounts } = useQuery({
    queryKey: ["active-discounts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/discounts?activeOnly=true");
      if (!res.ok) throw new Error("Failed to fetch discounts");
      return res.json();
    },
  });

  const classes = classesData?.items?.slice(0, 3) || [];
  const trainers = (trainersData?.items || []).slice(0, 4);

  const isLoadingTrainers = !trainersData && !classesData;

  const CLASS_IMAGES: Record<string, string> = {
    Full: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    Yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
    Boxing:
      "https://images.unsplash.com/photo-1599553229615-544131af5473?q=80&w=2070&auto=format&fit=crop",
    HIIT: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
    Default:
      "https://images.unsplash.com/photo-1549476464-37392f719918?q=80&w=2070&auto=format&fit=crop",
  };

  const TRAINER_DETAILS: Record<string, { img: string; specialty: string }> = {
    "Master Viktor": {
      img: "https://images.unsplash.com/photo-1567013127542-490d757e51fe?q=80&w=800&auto=format&fit=crop",
      specialty: "Heavyweight Boxing",
    },
    "Master Sarah": {
      img: "https://images.unsplash.com/photo-1548690312-e3b507d17a4d?q=80&w=800&auto=format&fit=crop",
      specialty: "Tactical HIIT",
    },
    "Master Maya": {
      img: "https://images.unsplash.com/photo-1518611012118-29621e651c48?q=80&w=800&auto=format&fit=crop",
      specialty: "Mobility & Yoga",
    },
    "Master John": {
      img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
      specialty: "Powerlifting",
    },
    "Master Elena": {
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
      specialty: "Calisthenics",
    },
    "Master Marcus": {
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      specialty: "Crossfit Elite",
    },
    "Master Aria": {
      img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
      specialty: "Pilates Core",
    },
    "Master Leo": {
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
      specialty: "MMA Striking",
    },
    "Master Nova": {
      img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
      specialty: "Endurance",
    },
    "Master Kai": {
      img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop",
      specialty: "Rehab Specialist",
    },
    "Master Axel": {
      img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
      specialty: "Olympic Lifting",
    },
    "Master Jade": {
      img: "https://images.unsplash.com/photo-1518310352947-a230c7c390f5?q=80&w=800&auto=format&fit=crop",
      specialty: "Kettlebell Flow",
    },
    "Master Silas": {
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
      specialty: "Functional Strength",
    },
    "Master Rhea": {
      img: "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=800&auto=format&fit=crop",
      specialty: "Muay Thai",
    },
    "Master Orion": {
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
      specialty: "Breathwork Mastery",
    },
    "Master Lyra": {
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
      specialty: "Gymnastics Pro",
    },
    "Master Finn": {
      img: "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=800&auto=format&fit=crop",
      specialty: "Speed & Agility",
    },
    "Master Zara": {
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      specialty: "Body Composition",
    },
    "Master Hugo": {
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      specialty: "Nutrition Coaching",
    },
    "Master Cleo": {
      img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
      specialty: "Mindset Optimization",
    },
  };

  return (
    <div className="flex flex-col overflow-hidden bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2070&auto=format&fit=crop"
            alt="Gym Hero"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container px-6 md:px-16 lg:px-32 mx-auto relative z-20 py-12 md:py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_oklch(0.48_0.22_25_/_0.5)]" />
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Elevate Your Potential 24/7
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 leading-[1.1] text-white uppercase">
                Redefining the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40 italic">
                  Standard of Fitness
                </span>
              </h1>
              <p className="text-xs md:text-sm text-white/50 max-w-lg mb-6 font-medium leading-relaxed">
                Experience a sanctuary for physical and mental evolution.
                Premium equipment meets expert guidance in an environment
                designed for those who demand more from themselves.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-background h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 transition-all hover:translate-y-[-2px]">
                  Explore Memberships
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:text-primary h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 group"
                >
                  Our Philosophy
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-10 hidden lg:block"
        >
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-px h-12 bg-white/20 relative overflow-hidden">
              <motion.div
                animate={{ y: [0, 48, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-0 left-0 w-full h-1/2 bg-primary"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 group-hover:text-primary transition-colors">
              Scroll
            </span>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-24 relative overflow-hidden bg-secondary/30">
        <div className="container px-6 md:px-16 lg:px-32 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="relative">
              {/* Image Stack */}
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                  <motion.img
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"
                    className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl"
                    alt="Gym"
                  />
                  <div className="bg-primary/20 backdrop-blur-xl p-8 rounded-3xl inline-block border border-primary/20">
                    <Dumbbell className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="space-y-6">
                  <motion.img
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop"
                    className="w-full aspect-[3/4] object-cover rounded-2xl border-4 border-background/50 shadow-2xl"
                    alt="Gym"
                  />
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
                    alt="Gym"
                  />
                </div>
              </div>
              {/* Decorative Background Element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full -z-10" />
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <h4 className="text-primary font-bold uppercase tracking-[0.3em] text-xs flex items-center gap-4">
                  <span className="w-12 h-px bg-primary/30" /> Our Legacy
                </h4>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-[1.1] tracking-tight text-center lg:text-left">
                  Where Science Meets <br />
                  <span className="italic font-medium text-white/40">
                    Physical Excellence
                  </span>
                </h2>
              </div>
              <p className="text-white/50 text-xs md:text-sm leading-relaxed font-medium text-center lg:text-left">
                We believe fitness is a personal journey of architectural
                evolution. Our space is curated to provide the elite support
                system necessary to surpass your genetic potential.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  "Advanced Biometric Tracking",
                  "Elite Performance Coaches",
                  "Personalized Recovery Plans",
                  "Biological Optimization",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 text-white/70 font-bold uppercase text-[10px] tracking-[0.2em]"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-center lg:justify-start">
                <Button className="bg-white/5 hover:bg-white/10 text-white h-14 px-10 rounded-xl font-bold uppercase tracking-widest text-xs border border-white/10 backdrop-blur-md transition-all">
                  Our Facility Tour
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-16 bg-[#050505]">
        <div className="container px-6 md:px-16 lg:px-32 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-3">
              Features That Set Us{" "}
              <span className="text-primary italic">Apart</span>
            </h2>
            <p className="text-white/50 text-xs font-medium leading-relaxed">
              We combine state-of-the-art equipment with smart technology to
              deliver a premium fitness experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Attendance Tracking",
                description:
                  "Check in seamlessly with our mobile app or membership card. Track your gym visits and workout frequency over time.",
                icon: CheckCircle2,
              },
              {
                title: "Personalized Workout Plans",
                description:
                  "Get customized workout programs based on your goals, fitness level, and available time. Updated regularly by your trainer.",
                icon: Timer,
              },
              {
                title: "Expert Personal Trainers",
                description:
                  "Work one-on-one with certified professionals who specialize in your area of interest, from bodybuilding to marathon prep.",
                icon: Trophy,
              },
              {
                title: "Flexible Membership Options",
                description:
                  "Choose from Basic, Pro, or Elite plans. Upgrade, downgrade, or pause anytime without penalties.",
                icon: Plus,
              },
              {
                title: "Mobile App Experience",
                description:
                  "Book classes, track workouts, view your progress, and manage your membership all from our intuitive mobile app.",
                icon: Dumbbell,
              },
              {
                title: "Progress Analytics",
                description:
                  "Detailed insights into your fitness journey with body metrics tracking, workout history, and goal progress visualization.",
                icon: Trophy,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-10 bg-zinc-900/30 border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-black uppercase mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-zinc-900/50">
        <div className="container px-6 md:px-16 lg:px-32 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
              Our Work Process
            </h4>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              SIMPLE STEPS TO <span className="text-primary">REACH</span> YOUR
              OBJECTIVE
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                title: "Exercise Movement",
                icon: Dumbbell,
                img: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=800&auto=format",
              },
              {
                title: "Fitness Methods",
                icon: Timer,
                img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format",
              },
              {
                title: "Success Result",
                icon: Trophy,
                img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="group relative overflow-hidden w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1.5rem)] max-w-sm"
              >
                <img
                  src={step.img}
                  className="w-full h-[400px] object-cover brightness-50 group-hover:brightness-75 transition-all duration-500"
                  alt={step.title}
                />
                <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
                  <h3 className="text-xl font-black uppercase mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/60 mb-5 text-xs">
                    We guide you through every movement to ensure maximum
                    efficiency and safety.
                  </p>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white rounded-none w-max uppercase italic font-bold"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitness Classes Section */}
      <section
        id="classes"
        className="pb-16 pt-6 container px-8 md:px-16 lg:px-32 mx-auto"
      >
        <div className="flex flex-col lg:flex-row gap-12 items-end mb-10">
          <div className="lg:w-1/2 space-y-4">
            <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
              What We Offer
            </h4>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              OUR <span className="text-primary italic">FITNESS</span> CLASSES
            </h2>
          </div>
          <p className="lg:w-1/2 text-white/60 text-sm">
            We offer a wide range of fitness classes tailored to different
            levels and goals. From high-intensity training to mindful recovery.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {(classes || []).map((gymClass: GymClass) => {
            const classType =
              Object.keys(CLASS_IMAGES).find((key) =>
                gymClass.name.includes(key),
              ) || "Default";
            const imageUrl = CLASS_IMAGES[classType];

            return (
              <div
                key={gymClass.id}
                onClick={() => setSelectedClass(gymClass)}
                className="bg-zinc-900 overflow-hidden group border border-white/5 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1.5rem)] max-w-sm cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={imageUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={gymClass.name}
                  />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {gymClass.trainer?.name || "Expert"}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary text-black px-4 py-1 font-bold italic text-xs uppercase tracking-tighter">
                    Top Tier
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-black uppercase mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {gymClass.name}
                  </h3>
                  <p className="text-white/50 text-xs mb-6 line-clamp-2">
                    {gymClass.description}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedClass(gymClass)}
                    className="h-10 rounded-none uppercase font-bold text-xs tracking-widest hover:bg-primary hover:text-white border-white/10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Discount Section */}
      {activeDiscounts && activeDiscounts.length > 0 && (
        <section className="py-12 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <div className="grid grid-cols-12 h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-primary" />
              ))}
            </div>
          </div>
          
          <div className="container px-6 md:px-16 lg:px-32 mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(255,62,62,0.3)]">
                  <Ticket className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white italic">
                    Tactical <span className="text-primary">Discounts</span> Available
                  </h2>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
                    USE THESE CODES AT CHECKOUT TO REDUCE OPERATIONAL COSTS
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {activeDiscounts.slice(0, 3).map((d: any) => (
                  <motion.div
                    key={d.id}
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-4 bg-black border border-primary/30 rounded-2xl flex items-center gap-4 group cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(d.code);
                      alert(`Code ${d.code} copied to clipboard!`);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                        {d.type === "PERCENTAGE" ? `${d.value}% OFF` : `$${d.value} OFF`}
                      </span>
                      <span className="text-lg font-black text-white font-mono tracking-tighter group-hover:text-primary transition-colors">
                        {d.code}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Sparkles className="w-4 h-4 text-primary group-hover:text-black" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Schedule Section */}
      <section id="workouts" className="py-16 bg-black">
        <div className="container px-8 md:px-16 lg:px-32 mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
              Weekly Schedule
            </h4>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              TRAINING <span className="text-primary italic">SCHEDULE</span>
            </h2>
          </div>
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-white uppercase text-sm font-black tracking-widest">
                    <th className="p-6 border border-white/10">Time</th>
                    <th className="p-6 border border-white/10">Sunday</th>
                    <th className="p-6 border border-white/10">Monday</th>
                    <th className="p-6 border border-white/10">Tuesday</th>
                    <th className="p-6 border border-white/10">Wednesday</th>
                    <th className="p-6 border border-white/10">Thursday</th>
                    <th className="p-6 border border-white/10">Friday</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {[
                    {
                      time: "09:00 AM",
                      sun: "Advanced Boxing",
                      mon: "HIIT Session",
                      tue: "Yoga Zen",
                      wed: "Yoga Zen",
                      thu: "Yoga Zen",
                      fri: "Rest",
                    },
                    {
                      time: "11:00 AM",
                      sun: "Body Build",
                      mon: "Power Lift",
                      tue: "Yoga Zen",
                      wed: "Yoga Zen",
                      thu: "Body Build",
                      fri: "Rest",
                    },
                    {
                      time: "05:00 PM",
                      sun: "Yoga Zen",
                      mon: "Advanced Boxing",
                      tue: "Power Lift",
                      wed: "Body Build",
                      thu: "Body Build",
                      fri: "Rest",
                    },
                    {
                      time: "08:00 PM",
                      sun: "Advanced Boxing",
                      mon: "HIIT Session",
                      tue: "Body Build",
                      wed: "Advanced Boxing",
                      thu: "Rest",
                      fri: "Rest",
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="text-white/70 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-6 border border-white/10 font-black text-white">
                        {row.time}
                      </td>
                      <td className="p-6 border border-white/10 text-xs font-bold uppercase">
                        {row.sun}
                      </td>
                      <td className="p-6 border border-white/10 text-xs font-bold uppercase">
                        {row.mon}
                      </td>
                      <td className="p-6 border border-white/10 text-xs font-bold uppercase">
                        {row.tue}
                      </td>
                      <td className="p-6 border border-white/10 text-xs font-bold uppercase">
                        {row.wed}
                      </td>
                      <td className="p-6 border border-white/10 text-xs font-bold uppercase">
                        {row.thu}
                      </td>
                      <td className="p-6 border border-white/10 text-xs font-bold uppercase">
                        {row.fri}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-16 container px-6 md:px-16 lg:px-32 mx-auto"
      >
        <div className="text-center mb-16 space-y-4">
          <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
            Pricing Plans
          </h4>
          <h2 className="text-xl font-black uppercase tracking-tighter">
            FIND YOUR <span className="text-primary italic">PERFECT</span> PLAN
          </h2>

          {/* Pricing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative flex items-center p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl w-fit">
              <motion.div
                layout
                initial={false}
                animate={{ x: isYearly ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-primary rounded-xl z-0"
                style={{ left: 4 }}
              />
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 px-8 py-2 rounded-xl transition-colors duration-200 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${!isYearly ? "text-black" : "text-zinc-500 hover:text-white"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 px-8 py-2 rounded-xl transition-colors duration-200 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isYearly ? "text-black" : "text-zinc-500 hover:text-white"}`}
              >
                Yearly
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-normal transition-colors ${isYearly ? "bg-black/20 text-black" : "bg-primary/10 text-primary"}`}
                >
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {!plans
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full md:w-[calc(33.33%-1.5rem)] h-96 bg-zinc-900 animate-pulse"
                />
              ))
            : plans.map((plan: any) => {
                const planDiscounts = activeDiscounts?.filter(
                  (d: any) =>
                    d.applicableTo.length === 0 ||
                    d.applicableTo.includes(plan.name.toUpperCase())
                ) || [];
                const effectiveDiscount =
                  planDiscounts.find((d: any) => d.type === "PERCENTAGE")?.value ?? 0;

                const finalMonthlyPrice =
                  plan.monthlyPrice * (1 - effectiveDiscount / 100);
                const finalYearlyPrice =
                  plan.yearlyPrice * (1 - effectiveDiscount / 100);
                const isFeatured = plan.name.toLowerCase() === "standard";

                return (
                  <div
                    key={plan.id}
                    className={`p-8 text-center transition-all border w-full md:w-[calc(33.33%-1.5rem)] max-w-sm flex flex-col ${isFeatured ? "bg-primary border-primary scale-[1.02] z-10 shadow-2xl" : "bg-zinc-900 border-white/10"}`}
                  >
                    <h3 className="text-lg font-black uppercase mb-3 tracking-tighter text-white">
                      {plan.name} Tier
                    </h3>
                    <div className="flex items-end justify-center gap-1 mb-1 h-14 overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        {effectiveDiscount > 0 && (
                          <span
                            className={`text-sm line-through opacity-50 absolute top-0 -translate-y-1 font-normal ${isFeatured ? "text-black" : "text-white"}`}
                          >
                            ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                        )}
                        <motion.span
                          key={isYearly ? "yearly" : "monthly"}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`text-3xl font-black mt-4 ${isFeatured ? "text-black" : "text-white"}`}
                        >
                          $
                          {isYearly
                            ? Math.floor(finalYearlyPrice)
                            : Math.floor(finalMonthlyPrice)}
                        </motion.span>
                      </AnimatePresence>
                      <span
                        className={`text-[9px] font-bold opacity-60 uppercase tracking-widest mb-1 ${isFeatured ? "text-black" : "text-white"}`}
                      >
                        /{isYearly ? "Year" : "Month"}
                      </span>
                    </div>
                    <div className="h-4 mb-4">
                      {effectiveDiscount > 0 && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`text-[8px] font-black tracking-widest uppercase italic ${isFeatured ? "text-black/60" : "text-primary/60"}`}
                        >
                          {effectiveDiscount}% Discount Applied
                        </motion.p>
                      )}
                    </div>
                    <div
                      className={`space-y-3 mb-8 text-[9px] font-bold uppercase tracking-widest opacity-80 flex-1 ${isFeatured ? "text-black" : "text-white"}`}
                    >
                      <p className="flex items-center justify-center gap-2">
                        <span
                          className={`w-1 h-1 rounded-full shrink-0 ${isFeatured ? "bg-black" : "bg-primary"}`}
                        />
                        {plan.dailyClassLimit} Class Per Day
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <span
                          className={`w-1 h-1 rounded-full shrink-0 ${isFeatured ? "bg-black" : "bg-primary"}`}
                        />
                        {plan.monthlyClassLimit > 900
                          ? "Unlimited Classes"
                          : `${plan.monthlyClassLimit} Classes Per Month`}
                      </p>
                      {plan.features
                        .slice(0, 3)
                        .map((feature: string, j: number) => (
                          <p
                            key={j}
                            className="flex items-center justify-center gap-2"
                          >
                            <span
                              className={`w-1 h-1 rounded-full shrink-0 ${isFeatured ? "bg-black" : "bg-primary"}`}
                            />
                            {feature}
                          </p>
                        ))}
                    </div>
                    <Button
                      asChild
                      className={`${isFeatured ? "bg-black text-white hover:bg-black/90" : "bg-primary text-black hover:bg-primary/90"} w-full h-12 rounded-none font-black uppercase tracking-widest text-[9px] mt-auto`}
                    >
                      <Link to="/memberships">Subscribe Plan</Link>
                    </Button>
                  </div>
                );
              })}
        </div>
      </section>

      {/* Exercise Program Section */}
      <section className="py-16 container px-6 md:px-16 lg:px-32 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=1000&auto=format&fit=crop"
              className="w-full aspect-video object-cover"
              alt="Program"
            />
            <div className="absolute -bottom-6 -right-6 bg-primary p-8 hidden md:block">
              <h4 className="text-white font-black text-2xl uppercase italic">
                Join Us Now
              </h4>
            </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <h4 className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary" /> Training Program
              </h4>
              <h2 className="text-xl font-black uppercase leading-tight tracking-tighter">
                ENERGIZING <span className="text-primary italic">EXERCISE</span>{" "}
                PROGRAM
              </h2>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              Our programs are designed by experts to provide a holistic
              approach to fitness, combining physical strength with mental
              clarity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Nutrition Coaching",
                "Strength Training",
                "Cardio Workouts",
                "Yoga & Mindset",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-white/90 font-bold uppercase text-xs tracking-widest"
                >
                  <div className="w-5 h-5 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
            <Button className="bg-primary hover:bg-primary/90 h-14 px-10 rounded-none font-bold uppercase tracking-widest text-xs">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section id="trainers" className="py-16 bg-zinc-900">
        <div className="container px-6 md:px-16 lg:px-32 mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
              Our Instructors
            </h4>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              MEET OUR <span className="text-primary italic">PROFICIENT</span>{" "}
              TRAINERS
            </h2>
          </div>

          {isLoadingTrainers ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8">
              {(trainers || []).slice(0, 4).map((trainer: User) => (
                <div
                  key={trainer.id}
                  className="text-center group w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1.5rem)] lg:w-[calc(25%-1.5rem)] max-w-xs"
                >
                  <div className="relative mb-6 overflow-hidden aspect-[4/5] bg-zinc-900">
                    <img
                      src={
                        TRAINER_DETAILS[trainer.name]?.img ||
                        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
                      }
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-100"
                      alt={trainer.name}
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2 translate-x-[-150%] group-hover:translate-x-0 transition-transform duration-500">
                      <div className="w-10 h-10 bg-primary flex items-center justify-center cursor-pointer">
                        <Facebook className="w-4 h-4" />
                      </div>
                      <div className="w-10 h-10 bg-primary flex items-center justify-center cursor-pointer">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <div className="w-10 h-10 bg-primary flex items-center justify-center cursor-pointer">
                        <Instagram className="w-4 h-4" />
                      </div>
                    </div>
                    {/* Plus icon like in the image */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary/80 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white mb-1 group-hover:text-primary transition-colors">
                    {trainer.name}
                  </h3>
                  <p className="text-primary font-bold uppercase text-[9px] tracking-[0.3em] italic">
                    {TRAINER_DETAILS[trainer.name]?.specialty || trainer.role}
                  </p>
                  <div className="flex justify-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-12">
            <Link to="/trainers">
              <Button
                variant="outline"
                className="h-12 px-8 uppercase font-bold text-xs tracking-widest hover:bg-primary hover:text-black border-white/20 hover:border-primary transition-all rounded-none"
              >
                View All Trainers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 container px-6 md:px-16 lg:px-32 mx-auto text-center">
        <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-4 italic">
          Testimonials
        </h4>
        <h2 className="text-xl font-black uppercase tracking-tighter mb-12 text-white">
          WHAT OUR <span className="text-primary italic">CLIENTS</span> SAY?
        </h2>
        <div className="max-w-4xl mx-auto bg-zinc-900 p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary flex items-center justify-center rotate-45 translate-x-12 -translate-y-12">
            <span className="text-6xl font-black -rotate-45">"</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-bold italic mb-10">
            "We provide the most effective fitness environment with expert
            trainers and state-of-the-art equipments to help you achieve your
            goal. Highly recommended gym for anyone looking to transform their
            body."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format"
                alt="Client"
              />
            </div>
            <div className="text-left py-2">
              <h4 className="font-black uppercase tracking-widest">
                Amanda Leo
              </h4>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest italic">
                Power Lifter
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-12">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden grayscale">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format"
              alt="Client"
            />
          </div>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center overflow-hidden border-2 border-primary scale-110">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format"
              alt="Client"
            />
          </div>
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden grayscale">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format"
              alt="Client"
            />
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 container px-6 md:px-16 lg:px-32 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
            Blog & News
          </h4>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">
            OUR LATEST <span className="text-primary italic">NEWS</span> &
            ARTICLES
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            {
              title:
                "The Fitness Effortless Workout Article For You Your Health",
              date: "Jan 20, 2024",
              img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format",
            },
            {
              title:
                "The Fitness Effortless Workout Article For You Your Health",
              date: "Jan 21, 2024",
              img: "https://images.unsplash.com/photo-1599058917233-9e19dce9bc2d?w=800&auto=format",
            },
            {
              title:
                "The Fitness Effortless Workout Article For You Your Health",
              date: "Jan 22, 2024",
              img: "https://images.unsplash.com/photo-1518611012118-29621e651c48?w=800&auto=format",
            },
          ].map((blog, i) => (
            <div
              key={i}
              className="bg-zinc-900 group w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1.5rem)] max-w-sm"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={blog.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={blog.title}
                />
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 italic">
                  <span>By Admin</span>
                  <span>/</span>
                  <span>{blog.date}</span>
                </div>
                <h3 className="text-base font-black uppercase leading-tight group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-none w-max uppercase font-bold text-xs">
                  Read More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white font-italic">
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
                          {new Date(selectedClass.schedule).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
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
                          {new Date(selectedClass.schedule).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
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
                      asChild
                      className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 flex-1"
                    >
                      <Link to="/classes">Book Slot</Link>
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
  );
}
