import { motion } from "framer-motion";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="hubvoid" className="w-8 h-8 rounded-lg" />
            <span className="font-black tracking-tighter text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              hubvoid
            </span>
          </a>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs uppercase tracking-widest font-semibold">
            <a href="/privacidade" className="text-white/60 hover:text-white transition-colors">Privacidade</a>
            <a href="/termos" className="text-white/60 hover:text-white transition-colors">Termos</a>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 w-full">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2">{title}</h1>
          <p className="text-sm text-white/50 mb-10">Última atualização: {updated}</p>

          <div
            className="prose prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
              prose-p:text-white/75 prose-p:leading-relaxed
              prose-li:text-white/75 prose-li:marker:text-white/40
              prose-a:text-blue-400 hover:prose-a:text-blue-300
              prose-strong:text-white"
          >
            {children}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} hubvoid</p>
          <nav className="flex items-center gap-5">
            <a href="/" className="hover:text-white/70 transition-colors">Início</a>
            <a href="/privacidade" className="hover:text-white/70 transition-colors">Privacidade</a>
            <a href="/termos" className="hover:text-white/70 transition-colors">Termos</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
