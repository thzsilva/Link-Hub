import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface InactiveHubProps {
  displayName?: string | null;
  username?: string | null;
}

/**
 * Tela pública exibida quando o hub está temporariamente inativo
 * (assinatura expirada). Não expõe o conteúdo do perfil.
 */
export function InactiveHub({ displayName, username }: InactiveHubProps) {
  const name = displayName || (username ? `@${username}` : "Este perfil");

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="max-w-md w-full flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Clock size={28} className="text-white/60" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            Hub temporariamente indisponível
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            <span className="text-white/90 font-semibold">{name}</span> está com o perfil
            temporariamente fora do ar. Volte em breve.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 w-full">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">
            Crie o seu hub profissional
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all text-xs uppercase tracking-widest font-bold"
          >
            Conheça o hubvoid
          </a>
        </div>
      </motion.div>
    </div>
  );
}
