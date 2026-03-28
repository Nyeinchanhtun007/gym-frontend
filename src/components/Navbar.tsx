import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, Menu, X, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const { user, logout, token } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch real-time user data to get the latest role and membership status
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user?.id && !!token,
  });

  const displayUser = profile || user;

  const activeMembership = profile?.memberships?.find(
    (m: any) => m.status === "ACTIVE" && new Date(m.endDate) > new Date(),
  );

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  const handleNavClick = (path: string) => {
    if (path === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (path.startsWith("/#")) {
      if (pathname === "/") {
        const id = path.replace("/#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(path);
      }
      setIsOpen(false);
      return;
    }
    navigate(path);
    setIsOpen(false);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/#features" },
    { label: "Trainers", path: "/trainers" },
    { label: "Workouts", path: "/#workouts" },
    { label: "Classes", path: "/classes" },
    { label: "Store", path: "/store" },
    { label: "Plans", path: "/#pricing" },
  ];

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/30 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 md:px-16 lg:px-32 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("/");
            }}
            className="flex items-center gap-1 font-extrabold text-2xl tracking-tighter group z-50"
          >
            <span className="text-white">YGN</span>
            <span className="text-primary italic transition-all group-hover:tracking-normal">
              GYM
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 px-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.path)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-all duration-500 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-500 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to={displayUser?.role === "ADMIN" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity bg-white/5 px-4 py-2 rounded-xl border border-white/5 active:scale-95 duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest hidden sm:block">
                      {displayUser.name.split(" ")[0]}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                      <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/30 hover:text-destructive transition-colors ml-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  <Link
                    to="/login"
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link to="/register">
                    <Button className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-background font-bold text-[10px] uppercase tracking-widest h-11 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white z-50 p-2"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[40] bg-background flex flex-col p-8 pt-24 lg:hidden"
          >
            {/* Background Decorative Gradient */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full -z-10" />

            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.label}
                >
                  <button
                    onClick={() => handleNavClick(link.path)}
                    className="text-xl font-black uppercase tracking-tighter text-white hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              {user ? (
                <div className="flex flex-col gap-4">
                  <Link
                    to={displayUser?.role === "ADMIN" ? "/admin" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                        {activeMembership
                          ? `${activeMembership.planTier} Member`
                          : displayUser.role}
                      </span>
                      <span className="text-lg font-bold text-white leading-none">
                        {displayUser.name}
                      </span>
                    </div>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    className="w-full h-14 rounded-2xl bg-white/5 text-destructive hover:bg-destructive/10 border border-destructive/20 font-bold uppercase"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full h-14 rounded-2xl text-white font-bold uppercase tracking-widest"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-2xl bg-primary text-background font-bold uppercase tracking-widest text-xs">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
