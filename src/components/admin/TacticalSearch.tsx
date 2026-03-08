import { Search } from "lucide-react";

interface TacticalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TacticalSearch({
  value,
  onChange,
  placeholder = "SEARCH...",
  className = "",
}: TacticalSearchProps) {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors duration-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-foreground/[0.03] border border-border rounded-xl py-4 pl-12 pr-4 text-[10px] font-black tracking-widest text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all uppercase"
      />
    </div>
  );
}
