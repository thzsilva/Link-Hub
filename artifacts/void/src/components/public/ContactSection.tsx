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

    if (!formData.name.trim() || !formData.message.trim()) {
      setError("Preencha seu nome e a mensagem");
      return;
    }

    if (!contact.whatsapp) {
      setError("WhatsApp não configurado para este perfil");
      return;
    }

    setError("");

    // Build the WhatsApp message and open the chat with it pre-filled
    const lines = [
      `Olá ${displayName}!`,
      "",
      `Meu nome é ${formData.name}.`,
      formData.email.trim() ? `Email: ${formData.email.trim()}` : null,
      "",
      formData.message.trim(),
    ].filter((l) => l !== null) as string[];

    const waLink = getWhatsAppLink(contact.whatsapp, lines.join("\n"));

    window.open(waLink, "_blank", "noopener,noreferrer");

    setStatus("success");
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setStatus("idle"), 3000);
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
      className="w-full py-16 sm:py-20 lg:py-24 border-b border-white/5"
      id="contact"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight mb-8 sm:mb-10 lg:mb-12">
          Contato
        </h2>

        {/* Contact buttons */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-12 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          {contactButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <motion.a
                key={btn.label}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 sm:p-8 border border-white/15 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all duration-300 flex flex-col items-center gap-4 text-center group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/15 transition-all duration-300">
                  <Icon size={28} className="text-white/80 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold uppercase tracking-wider text-sm text-white group-hover:text-white/90">
                  {btn.label}
                </h3>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Contact form */}
        <motion.form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-7 p-8 sm:p-10 border border-white/15 rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h3 className="text-lg sm:text-xl uppercase tracking-wider font-bold text-white">
              Enviar Mensagem
            </h3>
            <p className="text-white/50 text-sm mt-2">Sua mensagem abrirá direto no WhatsApp</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-3 font-medium">
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all duration-200 outline-none"
              placeholder="Seu nome"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-3 font-medium">
              Endereço de Email <span className="text-white/40 normal-case tracking-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all duration-200 outline-none"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-3 font-medium">
              Mensagem
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all duration-200 outline-none resize-none h-32"
              placeholder="Sua mensagem..."
              disabled={loading}
              maxLength={1000}
            />
            <div className="text-xs text-white/50 mt-2 text-right">
              {formData.message.length}/1000
            </div>
          </div>

          {/* Error */}
          {(error || status === "error") && (
            <motion.div
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error || "Erro ao enviar mensagem"}</span>
            </motion.div>
          )}

          {/* Success */}
          {status === "success" && (
            <motion.div
              className="flex items-center gap-3 p-4 rounded-xl bg-green-500/15 border border-green-500/40 text-green-300 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Check size={18} className="flex-shrink-0" />
              <span>Abrindo o WhatsApp com sua mensagem...</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 text-white"
            style={{
              backgroundColor: theme.primary,
            }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle size={18} />
            <span>Enviar pelo WhatsApp</span>
          </motion.button>
        </motion.form>
      </div>
    </motion.section>
  );
}
