import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const userStr = searchParams.get("user");
    const token = searchParams.get("token");

    if (userStr && token) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);

        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
        navigate("/login?error=OAuth failed");
      }
    } else {
      navigate("/login?error=OAuth failed");
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 relative z-10"
      >
        <div className="relative w-24 h-24 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-b-2 border-primary rounded-full shadow-[0_0_15px_oklch(0.48_0.22_25_/_0.5)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary opacity-50" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase tracking-[0.3em] text-neon">
            Synchronizing
          </h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase opacity-50">
              Retrieving encrypted profile data...
            </p>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-primary shadow-[0_0_10px_oklch(0.48_0.22_25_/_0.8)]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-w-[300px] mx-auto opacity-30">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-1 bg-primary/20 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-10 opacity-20 hidden lg:block">
        <div className="text-[10px] font-mono text-primary space-y-1">
          <p>{">"} INITIALIZING NODE_SYNC...</p>
          <p>{">"} FETCHING OAUTH_TOKEN...</p>
          <p>{">"} DECRYPTING HASH_SET...</p>
          <p>{">"} SESSION_LINK ESTABLISHED.</p>
        </div>
      </div>
    </div>
  );
}
