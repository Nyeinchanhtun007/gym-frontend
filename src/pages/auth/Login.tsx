import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Mail, Lock } from "lucide-react";
import AuthVisualSide from "@/components/auth/AuthVisualSide";
import AuthInput from "@/components/auth/AuthInput";
import AuthSocialLogins from "@/components/auth/AuthSocialLogins";
import AuthFormWrapper from "@/components/auth/AuthFormWrapper";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [success, setSuccess] = useState("");
  const user = useAuthStore((state: any) => state.user);
  const token = useAuthStore((state: any) => state.token);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  useEffect(() => {
    if (user && token) {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, token, navigate]);

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
        throw new Error(data.message || "Invalid credentials");
      }

      setAuth(data.user, data.access_token || data.token);

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black font-sans">
      <AuthVisualSide
        image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
        tag="Athletic Terminal"
        title="EVOLVE"
        highlight="BEYOND"
        subtitle="LIMITS"
        description="Experience the most effective fitness environment with expert trainers and state-of-the-art equipment."
      />

      <AuthFormWrapper
        title="Welcome back,"
        highlight="Athlete"
        subtitle="Initiate secure entry to your command center."
        error={error}
        success={success}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <AuthInput
              label="Email address"
              icon={Mail}
              type="email"
              placeholder="name@fitness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <AuthInput
              label="Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full h-11 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-full transition-all shadow-lg active:scale-[0.98]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Validating..." : "Initiate Login"}
          </Button>

          <AuthSocialLogins />

          <div className="text-center pt-3 border-t border-white/5">
            <p className="text-[9px] text-zinc-600 font-medium tracking-wider">
              NEW TO THE SANCTUARY?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-white font-black transition-all ml-1 underline underline-offset-4 decoration-2"
              >
                REQUEST ACCESS
              </Link>
            </p>
          </div>
        </form>
      </AuthFormWrapper>
    </div>
  );
}
