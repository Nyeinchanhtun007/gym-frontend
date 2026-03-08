import { motion } from "framer-motion";

interface AuthVisualSideProps {
  image: string;
  tag: string;
  title: string;
  highlight?: string;
  subtitle: string;
  description: string;
}

export default function AuthVisualSide({
  image,
  tag,
  title,
  highlight,
  subtitle,
  description,
}: AuthVisualSideProps) {
  return (
    <div className="hidden lg:flex relative flex-col justify-center p-12 lg:p-20 overflow-hidden border-r border-white/5">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <img
          src={image}
          alt="Visual"
          className="w-full h-full object-cover grayscale brightness-50"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
            {tag}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-5xl font-black text-white italic tracking-tighter leading-[0.95]">
            {title}
            {highlight && (
              <>
                <br />
                <span className="text-primary">{highlight}</span>
              </>
            )}
            <br />
            {subtitle}
          </h2>
        </div>

        <p className="max-w-xs text-zinc-400 text-xs font-medium leading-relaxed">
          {description}
        </p>
      </motion.div>
    </div>
  );
}
