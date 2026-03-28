import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronLeft,
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  ClipboardList,
  CreditCard,
  Layers,
  Sun,
  Moon,
  Wallet,
  Tag,
  Package,
} from "lucide-react";

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
  const [theme, setTheme] = useState(
    localStorage.getItem("admin-theme") || "dark",
  );

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

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
    { label: "DASHBOARD", path: "/admin", icon: LayoutDashboard },
    { label: "USERS", path: "/admin/users", icon: Users },
    { label: "TRAINERS", path: "/admin/trainers", icon: Dumbbell },
    { label: "CLASSES", path: "/admin/classes", icon: Calendar },
    { label: "BOOKINGS", path: "/admin/bookings", icon: ClipboardList },
    { label: "MEMBERSHIPS", path: "/admin/memberships", icon: CreditCard },
    { label: "PLANS", path: "/admin/plans", icon: Layers },
    { label: "DISCOUNTS", path: "/admin/discounts", icon: Tag },
    { label: "PAYMENTS", path: "/admin/payments", icon: ClipboardList, badge: true },
    { label: "PRODUCTS", path: "/admin/products", icon: Package },
    { label: "ACCOUNTING", path: "/admin/accounting", icon: Wallet },
  ];

  const { data: pendingData } = useQuery({
    queryKey: ["pending-payments-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/payment-requests/pending-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
  
  const { token } = useAuthStore();

  return (
    <div
      className={`transition-colors duration-500 min-h-screen bg-background text-foreground ${theme === "light" ? "light" : "dark"}`}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Banner - Clean and Professional */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex justify-between items-center px-6 md:px-8 z-[1000]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all border border-border"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link
            to="/"
            className="text-lg md:text-xl font-bold text-foreground flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="text-primary">YGN</span>GYM
            <span className="hidden md:inline text-muted-foreground font-medium text-sm ml-1 px-2 py-0.5 bg-muted rounded-full">
              ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle - Simple */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Logged in as
            </div>
            <div className="text-sm font-bold text-foreground">
              {user?.name}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Backdrop for Mobile */}
        <AnimatePresence>
          {isOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 z-[800]"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Nav - Clean and Structured */}
        <motion.div
          initial={isMobile ? { x: -260 } : { width: 240 }}
          animate={
            isMobile ? { x: isOpen ? 0 : -260 } : { width: isOpen ? 240 : 72 }
          }
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed top-16 bottom-0 left-0 border-r border-border z-[900] transition-colors duration-500 shadow-sm ${isOpen ? "overflow-y-auto" : "overflow-visible"} scrollbar-thin`}
          style={{ backgroundColor: "var(--sidebar)" }}
        >
          <div
            className={`${isOpen ? "w-[240px]" : "w-[72px]"} min-h-full flex flex-col p-3 transition-all duration-300`}
          >
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setIsOpen(false);
                    }}
                    className={`
                      flex items-center rounded-lg text-xs font-semibold transition-all group relative
                      ${isOpen ? "px-4 py-3 gap-3" : "p-3 justify-center"}
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                    />

                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-nowrap flex items-center justify-between w-full"
                      >
                        {item.label}
                        {item.badge && pendingData?.count > 0 && (
                          <span className={`${isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"} text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}>
                            {pendingData.count}
                          </span>
                        )}
                      </motion.span>
                    )}

                    {!isOpen && item.badge && pendingData?.count > 0 && (
                      <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-sidebar" />
                    )}

                    {!isOpen && (
                      <div className="absolute left-full ml-3 px-2 py-1.5 bg-popover border border-border text-popover-foreground text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[1000] shadow-lg">
                        {item.label} {item.badge && pendingData?.count > 0 && `(${pendingData.count})`}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-border">
              <Link
                to="/"
                className={`flex items-center group text-xs font-medium text-muted-foreground hover:text-primary transition-colors ${isOpen ? "px-4 gap-2" : "justify-center"}`}
              >
                <ChevronLeft
                  className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isOpen ? "" : "rotate-180"}`}
                />
                {isOpen && <span>Return to Site</span>}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content Area - Clean Spacing */}
        <motion.div
          animate={{
            marginLeft: isMobile ? 0 : isOpen ? 240 : 72,
            padding: "24px",
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
