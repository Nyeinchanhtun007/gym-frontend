import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function AuthInput({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: AuthInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </Label>
        <Icon className="w-2.5 h-2.5 text-zinc-800" />
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-11 bg-zinc-900/50 border-white/5 text-white rounded-full px-5 focus:ring-primary focus:border-primary transition-all placeholder:text-zinc-700 text-xs font-medium"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
