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
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/40 border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:bg-muted/60 transition-all shadow-sm"
      />
    </div>
  );
}
