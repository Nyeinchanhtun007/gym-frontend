import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronLeft,
  LayoutDashboard,
  User,
  CreditCard,
  Dumbbell,
  LogOut,
} from "lucide-react";

export default function UserLayout({
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
    { label: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
    { label: "MY CLASSES", path: "/classes", icon: Dumbbell },
    { label: "MEMBERSHIPS", path: "/memberships", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* Top Navigation - Fixed */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-6 md:px-10 z-[1000]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-primary transition-all hover:bg-white/10 group"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            YGN<span className="text-primary italic">GYM</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block border-r border-white/10 pr-6">
            <div className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase mb-0.5">
              OPERATIVE STATUS
            </div>
            <div className="text-[13px] font-black text-white uppercase italic tracking-tight">
              {user?.name || "RECRUIT"}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="group flex items-center gap-3 h-12 px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:bg-primary transition-all hover:border-primary hover:text-black"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            LOGOUT
          </button>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[800]"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation - Fixed */}
        <motion.div
          initial={isMobile ? { x: -280 } : { width: 280 }}
          animate={
            isMobile ? { x: isOpen ? 0 : -280 } : { width: isOpen ? 280 : 100 }
          }
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className="fixed top-20 bottom-0 left-0 border-r border-white/5 z-[900] bg-black overflow-hidden"
        >
          <div className="h-full flex flex-col p-6 overflow-y-auto scrollbar-hide">
            <div className="space-y-10">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase px-4 italic">
                  Main Modules
                </div>
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setIsOpen(false);
                      }}
                      className={`
                        flex items-center rounded-2xl text-[11px] font-black tracking-[0.1em] transition-all group relative
                        ${isOpen ? "px-5 py-4 gap-4" : "p-4 justify-center"}
                        ${
                          pathname === item.path
                            ? "bg-primary text-black italic shadow-lg shadow-primary/20"
                            : "text-white/40 hover:text-primary hover:bg-white/5"
                        }
                      `}
                    >
                      <item.icon
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${pathname === item.path ? "text-black" : "text-white/30 group-hover:text-primary"}`}
                      />

                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="whitespace-nowrap uppercase italic"
                        >
                          {item.label}
                        </motion.span>
                      )}

                      {!isOpen && (
                        <div className="absolute left-full ml-6 px-4 py-2 bg-zinc-900 border border-white/10 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[1000] tracking-[0.2em] uppercase italic shadow-2xl">
                          {item.label}
                        </div>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-black text-white/20 tracking-[0.4em] uppercase px-4 italic">
                  Secondary
                </div>
                <nav className="flex flex-col gap-2">
                  <button
                    className={`
                      flex items-center rounded-2xl text-[11px] font-black tracking-[0.1em] transition-all group relative px-5 py-4 gap-4
                      text-white/40 hover:text-primary hover:bg-white/5
                      ${!isOpen && "p-4 justify-center"}
                    `}
                  >
                    <User className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 text-white/30 group-hover:text-primary" />
                    {isOpen && (
                      <span className="uppercase italic">Profile Alpha</span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5">
              <Link
                to="/"
                className={`flex items-center group text-[10px] font-black text-white/20 hover:text-primary transition-all tracking-[0.3em] uppercase italic ${isOpen ? "gap-3 px-4" : "justify-center"}`}
              >
                <ChevronLeft
                  className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${isOpen ? "" : "rotate-180"}`}
                />
                {isOpen && <span>Back To Site</span>}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.main
          animate={{
            marginLeft: isMobile ? 0 : isOpen ? 280 : 100,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className="flex-1 min-h-[calc(100vh-80px)]"
        >
          <div className="container p-6 md:p-12 mx-auto">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}
