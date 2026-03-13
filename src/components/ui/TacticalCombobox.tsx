import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TacticalComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function TacticalCombobox({
  value,
  onChange,
  suggestions,
  placeholder = "TYPE OR SELECT...",
  className = "",
  required = false,
}: TacticalComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input */}
      <div className="relative w-full">
        {/* <div className="absolute left-5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> */}
        <input
          type="text"
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-5 text-foreground font-black uppercase italic text-xs outline-none focus:border-primary/50 transition-all tracking-[0.15em] placeholder:text-foreground/20 placeholder:not-italic"
        />
      </div>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {isOpen && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 w-full mt-2 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-[500]"
          >
            <div className="space-y-0.5 max-h-52 overflow-y-auto scrollbar-thin">
              {filtered.map((s) => {
                const isSelected = value === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(s);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-foreground/60 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* <div
                        className={`w-1 h-1 rounded-full ${isSelected ? "bg-primary" : "bg-foreground/20"}`}
                      /> */}
                      {s.replace(/_/g, " ")}
                    </div>
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
