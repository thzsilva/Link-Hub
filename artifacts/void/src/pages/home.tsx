import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Link as LinkIcon, Image, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background com gradient animado */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        className="px-6 sm:px-8 lg:px-12 py-6 sm:py-8 flex justify-between items-center relative z-10 border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <img src="/logo.svg" alt="hubvoid" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            hubvoid
          </h1>
        </motion.div>

        <motion.div
          className="flex gap-3 sm:gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs font-bold border border-white/10 rounded-lg transition-all"
            >
              Entrar
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-lg uppercase tracking-widest text-xs font-bold border-0 transition-all">
              Criar Perfil
            </Button>
          </Link>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
          >
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-xs uppercase tracking-widest font-bold text-white/70">
              Seu perfil profissional em um link
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 lg:mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Seu Perfil. <br />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Sua História.
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 lg:mb-12 font-light leading-relaxed"
          >
            Crie seu perfil profissional, compartilhe seus links, fotos e eventos em um único lugar.
            Design minimalista, totalmente customizável, 100% seu.
          </motion.p>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 lg:mb-16"
          >
            {[
              { icon: LinkIcon, label: "Organize Links", text: "Organize todos seus links em um só lugar" },
              { icon: Image, label: "Galeria", text: "Mostre sua arte com uma galeria profissional" },
              { icon: Sparkles, label: "Customize", text: "Personalize cores, temas e layout" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <feature.icon size={24} className="text-blue-400 mb-3 mx-auto" />
                <p className="text-xs uppercase tracking-widest font-bold mb-1">{feature.label}</p>
                <p className="text-xs text-white/50 font-light">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/sign-up">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-lg h-14 px-8 text-base uppercase tracking-widest font-bold border-0 transition-all w-full sm:w-auto"
                >
                  Começar Agora
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/sign-in">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-lg h-14 px-8 text-base uppercase tracking-widest font-bold transition-all w-full sm:w-auto"
                >
                  Já tenho conta
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="py-6 sm:py-8 px-6 sm:px-8 text-center border-t border-white/5 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-xs text-white/40 font-light uppercase tracking-widest">
          © {new Date().getFullYear()} hubvoid • Seu perfil profissional em um link
        </p>
        <nav className="flex items-center justify-center gap-5 mt-4 text-[11px] uppercase tracking-widest text-white/40">
          <a href="/privacidade" className="hover:text-white/70 transition-colors">Privacidade</a>
          <a href="/termos" className="hover:text-white/70 transition-colors">Termos</a>
        </nav>
      </motion.footer>
    </div>
  );
}
