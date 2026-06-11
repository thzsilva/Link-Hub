import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, X, Check,
  UserCircle, CalendarDays, FileText, BarChart3, Wallet,
} from "lucide-react";

const DEMO_URL = "/?user=demo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SectionTitle({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      {kicker && (
        <p className="text-xs uppercase tracking-[0.25em] text-blue-400 font-bold mb-3">{kicker}</p>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">{children}</h2>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="px-6 sm:px-8 lg:px-12 py-5 sm:py-6 flex justify-between items-center relative z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="hubvoid" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            hubvoid
          </h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs font-bold border border-white/10 rounded-lg">
              Entrar
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-lg uppercase tracking-widest text-xs font-bold border-0">
              Criar Perfil
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 text-center">
        <motion.div className="max-w-4xl mx-auto" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="mb-7 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-widest font-bold text-white/70">Para DJs &amp; Artistas</span>
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-6">
            A plataforma completa para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              DJs e artistas
            </span>{" "}
            gerenciarem agenda, portfólio e contratações.
          </motion.h2>

          <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Centralize seus links, sua agenda de shows, suas contratações e seus números —
            tudo em um perfil profissional, em um único link.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-lg h-14 px-8 text-base uppercase tracking-widest font-bold border-0 w-full sm:w-auto">
                  Criar Perfil Grátis
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </motion.div>
            </Link>
            <a href={DEMO_URL}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-lg h-14 px-8 text-base uppercase tracking-widest font-bold w-full sm:w-auto">
                  <Play size={16} className="mr-2" />
                  Ver Demonstração
                </Button>
              </motion.div>
            </a>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-white/40 mt-5 uppercase tracking-widest">
            3 dias grátis • sem cartão para começar
          </motion.p>
        </motion.div>
      </section>

      {/* PROBLEMAS */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <SectionTitle kicker="O problema">Você sofre com isso?</SectionTitle>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {[
              { title: "Contratantes perdidos no WhatsApp", text: "Propostas se perdem no meio de mil conversas." },
              { title: "Agenda de shows desorganizada", text: "Você não tem clareza do que vem pela frente." },
              { title: "Links espalhados em mil lugares", text: "Spotify, Instagram, contato… tudo separado." },
              { title: "Falta de presença profissional", text: "Sua marca não transmite a credibilidade que merece." },
            ].map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-red-500/40"
              >
                {/* barra de acento à esquerda */}
                <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-rose-600 opacity-70" />
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <X size={20} className="text-red-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg leading-snug">{p.title}</h3>
                    <p className="text-sm text-white/50 font-light mt-1 leading-relaxed">{p.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SOLUÇÃO / BENEFÍCIOS */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <SectionTitle kicker="A solução">
            Tudo que você precisa,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              em um só lugar
            </span>
          </SectionTitle>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            {[
              { icon: UserCircle, title: "Perfil profissional", text: "Sua bio, fotos, vídeo e redes num link único e elegante que impressiona.", grad: "from-blue-500 to-cyan-400", glow: "rgba(59,130,246,0.25)" },
              { icon: CalendarDays, title: "Agenda de eventos", text: "Mostre seus próximos shows com data, local e link de ingressos.", grad: "from-purple-500 to-fuchsia-400", glow: "rgba(168,85,247,0.25)" },
              { icon: FileText, title: "Contratações", text: "Receba propostas direto pelo perfil — sem se perder no WhatsApp.", grad: "from-pink-500 to-rose-400", glow: "rgba(236,72,153,0.25)" },
              { icon: BarChart3, title: "Analytics", text: "Veja visitas, cliques e de onde vem o seu público em tempo real.", grad: "from-cyan-500 to-sky-400", glow: "rgba(6,182,212,0.25)" },
              { icon: Wallet, title: "Financeiro", text: "Acompanhe quanto seus eventos vão render e o que já recebeu.", grad: "from-emerald-500 to-green-400", glow: "rgba(16,185,129,0.25)" },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-7 transition-all duration-300 hover:border-white/25"
                style={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              >
                {/* glow no hover */}
                <div
                  className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(400px circle at 50% 0%, ${item.glow}, transparent 70%)` }}
                />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center mb-5 shadow-lg`}>
                    <item.icon size={26} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}

            {/* Card-CTA fechando a grade de benefícios */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/10 p-7 flex flex-col justify-center"
            >
              <h3 className="text-xl font-black tracking-tight mb-2">E muito mais.</h3>
              <p className="text-sm text-white/60 font-light leading-relaxed mb-5">
                Temas, fontes, galeria, players de música e seu link próprio.
              </p>
              <Link href="/sign-up">
                <Button className="bg-white text-black hover:bg-white/90 rounded-lg uppercase tracking-widest text-xs font-bold w-full">
                  Criar Perfil Grátis
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/5">
        <motion.div
          className="max-w-3xl mx-auto text-center rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent p-10 sm:p-14"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
            Pronto para se tornar profissional?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Crie seu hub em minutos. Teste grátis por 3 dias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-lg h-14 px-8 text-base uppercase tracking-widest font-bold w-full sm:w-auto">
                  Criar Perfil Grátis
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </motion.div>
            </Link>
            <a href={DEMO_URL}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-lg h-14 px-8 text-base uppercase tracking-widest font-bold w-full sm:w-auto">
                  <Play size={16} className="mr-2" />
                  Ver Demonstração
                </Button>
              </motion.div>
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-green-400" /> 3 dias grátis</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-green-400" /> R$ 20/mês</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-green-400" /> Cancele quando quiser</span>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 sm:px-8 text-center border-t border-white/5 relative z-10">
        <p className="text-xs text-white/40 font-light uppercase tracking-widest">
          © {new Date().getFullYear()} hubvoid • Para DJs e artistas
        </p>
        <nav className="flex items-center justify-center gap-5 mt-4 text-[11px] uppercase tracking-widest text-white/40">
          <a href={DEMO_URL} className="hover:text-white/70 transition-colors">Demo</a>
          <a href="/privacidade" className="hover:text-white/70 transition-colors">Privacidade</a>
          <a href="/termos" className="hover:text-white/70 transition-colors">Termos</a>
        </nav>
      </footer>
    </div>
  );
}
