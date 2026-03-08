interface AdminPageHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
}

export default function AdminPageHeader({
  title,
  highlight,
  subtitle,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-foreground">
        {title} <span className="text-primary text-neon">{highlight}</span>
      </h1>
      <p className="text-foreground/40 uppercase tracking-[0.2em] text-[10px] font-bold">
        {subtitle}
      </p>
    </div>
  );
}
