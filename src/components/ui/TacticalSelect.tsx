import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface TacticalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  accentColor?: string;
  className?: string;
}

export default function TacticalSelect({
  value,
  onChange,
  options,
  placeholder = "SELECT...",
  accentColor = "primary",
  className = "",
}: TacticalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const getAccentClass = (
    type: "dot" | "text" | "bg" | "border" | "hover-bg" | "hover-border",
  ) => {
    const colors: Record<string, any> = {
      primary: {
        dot: "bg-primary",
        text: "text-primary",
        bg: "bg-primary/20",
        border: "border-primary/20",
        "hover-bg": "group-hover:bg-primary/20",
        "hover-border": "group-hover:border-primary/40",
      },
      blue: {
        dot: "bg-blue-500",
        text: "text-blue-400",
        bg: "bg-blue-500/20",
        border: "border-blue-500/20",
        "hover-bg": "group-hover:bg-blue-500/20",
        "hover-border": "group-hover:border-blue-500/40",
      },
      green: {
        dot: "bg-green-500",
        text: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/20",
        "hover-bg": "group-hover:bg-green-500/20",
        "hover-border": "group-hover:border-green-500/40",
      },
      red: {
        dot: "bg-red-500",
        text: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/20",
        "hover-bg": "group-hover:bg-red-500/20",
        "hover-border": "group-hover:border-red-500/40",
      },
    };

    const colorKey = accentColor.includes("blue")
      ? "blue"
      : accentColor.includes("green")
        ? "green"
        : accentColor.includes("red")
          ? "red"
          : "primary";

    return colors[colorKey][type] || "";
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="tactical-select w-full h-12 flex items-center justify-between group transition-all"
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${getAccentClass("dot")}`}
          />
          <span className="truncate">{displayLabel}</span>
        </div>
        <div
          className={`w-6 h-6 rounded-lg bg-foreground/[0.03] border border-border flex items-center justify-center transition-all duration-300 ${getAccentClass("hover-bg")} ${getAccentClass("hover-border")}`}
        >
          <ChevronsUpDown
            className={`w-3 h-3 transition-all duration-500 ${isOpen ? `${getAccentClass("text")} scale-110` : "text-foreground/30"}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full left-0 w-full mt-2 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-[200] overflow-hidden"
          >
            <div className="crt-overlay opacity-20" />
            <div className="relative z-10 space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    value === opt.value
                      ? `${getAccentClass("bg")} ${getAccentClass("text")} border ${getAccentClass("border")} shadow-lg`
                      : "text-foreground/70 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
