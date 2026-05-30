import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  Instagram,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  getWhatsAppLink,
  getEmailLink,
  getInstagramDMLink,
} from "@/lib/contact-links";

interface ContactInfo {
  whatsapp?: string;
  email?: string;
  instagram?: string;
}

interface ContactSectionProps {
  contact: ContactInfo;
  theme: {
    primary: string;
    secondary: string;
  };
  displayName: string;
  onSubmit?: (data: {
    name: string;
    email: string;
    message: string;
  }) => Promise<void>;
}

export function ContactSection({
  contact,
  theme,
  displayName,
  onSubmit,
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const hasContacts = contact.whatsapp || contact.email || contact.instagram;
  if (!hasContacts) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    setLoading(true);
    setStatus("loading");
    setError("");

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  };

  const contactButtons = [
    contact.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      href: getWhatsAppLink(
        contact.whatsapp,
        `Olá ${displayName}, gostaria de entrar em contato!`
      ),
    },
    contact.email && {
      icon: Mail,
      label: "Email",
      href: getEmailLink(contact.email),
    },
    contact.instagram && {
      icon: Instagram,
      label: "Instagram",
      href: `https://instagram.com/${contact.instagram.replace(/^@/, "")}`,
    },
  ].filter(Boolean) as Array<{
    icon: React.FC<any>;
    label: string;
    href: string;
  }>;

  return (
    <motion.section
      className="mb-16 sm:mb-20"
      id="contact"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 sm:mb-8">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase"
          style={{ color: theme.primary }}
        >
          Vamos Conversar?
        </h2>
        <motion.div
          className="h-1 mt-2"
          style={{ backgroundColor: theme.secondary }}
          initial={{ width: 0 }}
          whileInView={{ width: "40px" }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        />
      </div>

      {/* Contact buttons */}
      <div className="mb-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {contactButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <motion.a
                key={btn.label}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 sm:p-6 rounded-lg border-2 flex items-center gap-3 sm:gap-4 font-bold uppercase tracking-widest text-sm transition-all"
                style={{
                  borderColor: theme.secondary,
                  backgroundColor: `${theme.secondary}08`,
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: `${theme.secondary}15`,
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              >
                <Icon size={24} style={{ color: theme.secondary }} />
                <span>{btn.label}</span>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Response time badge */}
        <motion.div
          className="mt-6 text-center text-xs sm:text-sm text-white/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          ⭐ Geralmente respondemos em até 24 horas
        </motion.div>
      </div>

      {/* Contact form */}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h3
          className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-6"
          style={{ color: theme.primary }}
        >
          Enviar Mensagem Direta
        </h3>

        {/* Name input */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">
            Nome *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all outline-none"
            placeholder="Seu nome"
            disabled={loading}
          />
        </div>

        {/* Email input */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all outline-none"
            placeholder="seu@email.com"
            disabled={loading}
          />
        </div>

        {/* Message input */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">
            Mensagem *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all outline-none resize-none h-24 sm:h-28"
            placeholder="Sua mensagem..."
            disabled={loading}
            maxLength={1000}
          />
          <div className="text-xs text-white/50 mt-1 text-right">
            {formData.message.length}/1000
          </div>
        </div>

        {/* Error message */}
        {(error || status === "error") && (
          <motion.div
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} />
            <span>{error || "Erro ao enviar mensagem"}</span>
          </motion.div>
        )}

        {/* Success message */}
        {status === "success" && (
          <motion.div
            className="flex items-center gap-2 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Check size={18} />
            <span>Mensagem enviada com sucesso! 🎉</span>
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-3 sm:py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme.primary,
            opacity: loading ? 0.7 : 1,
          }}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando...
            </>
          ) : status === "success" ? (
            <>
              <Check size={18} />
              Enviado!
            </>
          ) : (
            "Enviar Mensagem"
          )}
        </motion.button>
      </motion.form>
    </motion.section>
  );
}
