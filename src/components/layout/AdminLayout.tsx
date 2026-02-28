import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { label: "DASHBOARD", path: "/admin" },
    { label: "USERS", path: "/admin/users" },
    { label: "TRAINERS", path: "/admin/trainers" },
    { label: "CLASSES", path: "/admin/classes" },
    { label: "BOOKINGS", path: "/admin/bookings" },
    { label: "MEMBERSHIPS", path: "/admin/memberships" },
    { label: "PLANS", path: "/admin/plans" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      {/* Top Banner - Fixed */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 md:px-10 z-[1000]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all hover:bg-white/10"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/"
            className="text-xl md:text-2xl font-black tracking-tighter text-white flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            YGN<span className="text-primary italic">GYM</span>{" "}
            <span className="hidden md:inline text-white/40 ml-1">ADMIN</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">
              USER IDENTIFIED
            </div>
            <div className="text-[12px] font-bold text-white uppercase italic">
              {user?.name}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="h-10 px-6 bg-white/5 text-primary border border-primary/20 rounded-xl text-[10px] font-black tracking-widest hover:bg-primary hover:text-black transition-all"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="flex pt-12">
        {/* Backdrop for Mobile */}
        <AnimatePresence>
          {isOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[800]"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Nav - Fixed */}
        <motion.div
          initial={isMobile ? { x: -260 } : { width: 240 }}
          animate={
            isMobile
              ? { x: isOpen ? 0 : -260 }
              : { width: isOpen ? 240 : 0, opacity: isOpen ? 1 : 0 }
          }
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-16 bottom-0 left-0 bg-zinc-950 border-r border-white/5 z-[900] overflow-hidden"
        >
          <div className="w-[240px] h-full flex flex-col p-6">
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setIsOpen(false);
                  }}
                  className={`
                    text-left px-5 py-3.5 rounded-xl text-[10px] font-black tracking-[0.1em] transition-all
                    ${
                      pathname === item.path
                        ? "bg-primary text-black italic shadow-[0_4px_15px_rgba(255,62,62,0.3)]"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
              <Link
                to="/"
                className="flex items-center gap-2 group text-[9px] font-bold text-white/20 hover:text-primary transition-colors tracking-widest uppercase"
              >
                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Return to Site
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content Area - Offset for Fixed elements */}
        <motion.div
          animate={{
            marginLeft: isMobile ? 0 : isOpen ? 240 : 0,
            padding: isMobile ? "20px" : "32px",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="flex-1 min-h-[calc(100vh-64px)] overflow-x-hidden"
        >
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
