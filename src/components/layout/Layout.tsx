import Navbar from "../Navbar";
import {
  Dumbbell,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/authStore";
import ScrollToTop from "../ScrollToTop";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className={`flex-1 ${!isAuthPage ? "pt-16" : ""}`}>{children}</main>

      {!isAuthPage && <ScrollToTop />}

      {!isAuthPage && pathname !== "/classes" && (
        <footer className="bg-zinc-900 pt-24 pb-12 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-center md:text-left">
              {/* Logo & Info */}
              <div className="space-y-6">
                <Link
                  to="/"
                  className="flex items-center justify-center md:justify-start gap-2 font-black text-3xl tracking-tighter"
                >
                  <div className="w-10 h-10 bg-primary flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <span className="uppercase italic">
                    YGN<span className="text-primary italic">GYM</span>
                  </span>
                </Link>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                  We provide the most effective fitness environment with expert
                  trainers and state-of-the-art equipments to help you achieve
                  your goal.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                    <Facebook className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                    <Twitter className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-lg mb-8 italic">
                  Quick Links
                </h4>
                <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-white/50">
                  <li className="hover:text-primary cursor-pointer transition-colors">
                    About Us
                  </li>
                  <li className="hover:text-primary cursor-pointer transition-colors">
                    Our Classes
                  </li>
                  <li className="hover:text-primary cursor-pointer transition-colors">
                    Our Trainers
                  </li>
                  <li className="hover:text-primary cursor-pointer transition-colors">
                    Our Blog
                  </li>
                  <li className="hover:text-primary cursor-pointer transition-colors">
                    Our Contact
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-lg mb-8 italic">
                  Contact Us
                </h4>
                <ul className="space-y-6">
                  <li className="flex items-start justify-center md:justify-start gap-4 text-white/70">
                    <div className="w-10 h-10 bg-primary/20 flex items-center justify-center mt-1 shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest leading-relaxed">
                      Lower Manhattan, <br /> New York City, US
                    </span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-4 text-white/70">
                    <div className="w-10 h-10 bg-primary/20 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                      +1 (234) 567-8910
                    </span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-4 text-white/70">
                    <div className="w-10 h-10 bg-primary/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                      command@ygn-gym.com
                    </span>
                  </li>
                </ul>
              </div>

              {/* Get In Touch */}
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-lg mb-8 italic">
                  Get In Touch
                </h4>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full h-14 bg-black/50 border border-white/10 rounded-none px-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
                  />
                  <button className="absolute right-0 top-0 h-14 w-14 bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-4">
                  Subscribe for latest news & articles.
                </p>
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="block mt-6"
                >
                  <Button className="w-full h-14 bg-primary hover:bg-primary/90 rounded-none font-black uppercase tracking-widest text-xs">
                    {user ? "Go to Dashboard" : "Join Us Now"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              <p>
                © {new Date().getFullYear()} YGN GYM // EVOLVE BEYOND LIMITS.
              </p>
              <div className="flex gap-8">
                <span className="hover:text-primary cursor-pointer">
                  Privacy Cipher
                </span>
                <span className="hover:text-primary cursor-pointer">
                  Terms Mission
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
