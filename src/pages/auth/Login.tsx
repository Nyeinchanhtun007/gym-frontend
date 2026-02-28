import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { ChevronLeft, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [success, setSuccess] = useState("");
  const setAuth = useAuthStore((state: any) => state.setAuth);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [searchParams, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setAuth(data.user, data.access_token || data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black font-sans">
      {/* Left Side: Visual Storytelling */}
      <div className="hidden lg:flex relative flex-col justify-center p-12 lg:p-20 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
            alt="Gym Sanctuary"
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              MD-Gym Alliance
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-5xl font-black text-white italic tracking-tighter leading-[0.95]">
              STRENGTH
              <br />
              <span className="text-primary">IS BORN</span>
              <br />
              IN THE DARK
            </h2>
          </div>

          <p className="max-w-xs text-zinc-400 text-xs font-medium leading-relaxed">
            Log in to reconnect with your peak performance and access your
            training sanctuary.
          </p>
        </motion.div>
      </div>

      {/* Right Side: Optimized Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-[#050505]">
        <div className="w-full max-w-[310px]">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-7"
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                Welcome <span className="text-primary">Back</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-medium italic">
                Enter credentials to continue evolution.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2.5 text-[9px] font-bold bg-red-500/10 border-l-2 border-red-500 text-red-500 uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-2.5 text-[9px] font-bold bg-green-500/10 border-l-2 border-green-500 text-green-500 uppercase tracking-widest text-center">
                  {success}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Email address
                    </Label>
                    <Mail className="w-2.5 h-2.5 text-zinc-800" />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@fitness.com"
                    required
                    className="h-11 bg-zinc-900/50 border-white/5 text-white rounded-full px-5 focus:ring-primary focus:border-primary transition-all placeholder:text-zinc-700 text-xs font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Password
                    </Label>
                    <Lock className="w-2.5 h-2.5 text-zinc-800" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-11 bg-zinc-900/50 border-white/5 text-white rounded-full px-5 focus:ring-primary focus:border-primary transition-all placeholder:text-zinc-700 text-xs font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="flex justify-end px-2">
                    <Link
                      to="/forgot-password"
                      className="text-[9px] font-bold text-zinc-500 hover:text-primary transition-colors"
                    >
                      Lost Access?
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1 pb-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-2.5 h-2.5 accent-primary bg-zinc-900 border-zinc-700"
                />
                <label
                  htmlFor="remember"
                  className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Access
                </label>
              </div>

              <Button
                className="w-full h-11 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-full transition-all shadow-lg active:scale-[0.98]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Syncing..." : "Login"}
              </Button>

              <div className="pt-3">
                <div className="relative flex justify-center text-[8px] mb-3">
                  <span className="bg-[#050505] px-3 font-black uppercase tracking-[0.3em] text-zinc-600 italic">
                    Quick Access
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "http://localhost:3000/auth/google")
                    }
                    className="flex items-center justify-center gap-2 h-9 rounded-full bg-zinc-900/50 border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                      Google
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "http://localhost:3000/auth/facebook")
                    }
                    className="flex items-center justify-center gap-2 h-9 rounded-full bg-zinc-900/50 border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-[#1877F2]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                      Facebook
                    </span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-5 border-t border-white/5">
                <p className="text-[9px] text-zinc-600 font-medium">
                  READY TO EVOLVE?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:text-white font-black transition-all ml-1 underline underline-offset-4 decoration-2"
                  >
                    JOIN THE ALLIANCE
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
