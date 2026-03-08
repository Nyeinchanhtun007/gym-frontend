import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";
import AuthVisualSide from "@/components/auth/AuthVisualSide";
import AuthInput from "@/components/auth/AuthInput";
import AuthSocialLogins from "@/components/auth/AuthSocialLogins";
import AuthFormWrapper from "@/components/auth/AuthFormWrapper";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login", {
        state: {
          message:
            "Registration successful! Please login with your credentials.",
        },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black font-sans">
      <AuthVisualSide
        image="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop"
        tag="New Intake Active"
        title="LIMITS"
        highlight="DON'T"
        subtitle="EXIST"
        description="Create your profile and start your peak performance journey. Access elite coaching, custom plans, and a community of titans."
      />

      <AuthFormWrapper
        title="Join the"
        highlight="Movement"
        subtitle="Create credentials to initiate evolution."
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <AuthInput
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
            {isLoading ? "Broadcasting..." : "Create Account"}
          </Button>

          <AuthSocialLogins />

          <div className="text-center pt-3 border-t border-white/5">
            <p className="text-[9px] text-zinc-600 font-medium tracking-wider">
              ALREADY AN ATHLETE?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-white font-black transition-all ml-1 underline underline-offset-4 decoration-2"
              >
                RETURN TO LOGIN
              </Link>
            </p>
          </div>
        </form>
      </AuthFormWrapper>
    </div>
  );
}
