export default function AuthSocialLogins() {
  const handleSocialLogin = (platform: "google" | "facebook") => {
    window.location.href = `http://localhost:3000/auth/${platform}`;
  };

  return (
    <div className="pt-1">
      <div className="relative flex justify-center text-[8px] mb-3">
        <span className="bg-[#050505] px-3 font-black uppercase tracking-[0.3em] text-zinc-600 italic">
          Quick Access
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-2 h-9 rounded-full bg-zinc-900/50 border border-white/5 hover:border-primary/30 transition-all group"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
            Google
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center gap-2 h-9 rounded-full bg-zinc-900/50 border border-white/5 hover:border-primary/30 transition-all group"
        >
          <svg
            className="w-3.5 h-3.5 text-[#1877F2]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
            Facebook
          </span>
        </button>
      </div>
    </div>
  );
}
