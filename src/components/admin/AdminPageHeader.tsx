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
      <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">
        {title} <span className="text-primary">{highlight}</span>
      </h1>
      <p className="text-muted-foreground text-sm font-medium">
        {subtitle}
      </p>
    </div>
  );
}
