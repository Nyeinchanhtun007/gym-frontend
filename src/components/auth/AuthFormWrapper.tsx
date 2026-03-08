import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  title: string;
  highlight: string;
  subtitle: string;
  error?: string;
  success?: string;
}

export default function AuthFormWrapper({
  children,
  title,
  highlight,
  subtitle,
  error,
  success,
}: AuthFormWrapperProps) {
  return (
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
              {title} <span className="text-primary">{highlight}</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-medium italic">
              {subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-2.5 text-[9px] font-bold bg-red-500/10 border-l-2 border-red-500 text-red-500 uppercase tracking-widest text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="p-2.5 text-[9px] font-bold bg-primary/10 border-l-2 border-primary text-primary uppercase tracking-widest text-center">
                {success}
              </div>
            )}
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
