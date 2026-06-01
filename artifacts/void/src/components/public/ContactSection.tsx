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
      } else {
        const message = `Nome: ${formData.name}\nEmail: ${formData.email}\nMensagem: ${formData.message}`;
        await navigator.clipboard.writeText(message);
        console.log("Mensagem copiada para clipboard:", message);
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
      color: "#25D366",
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
      color: "#E4405F",
    },
  ].filter(Boolean) as Array<{
    icon: React.FC<any>;
    label: string;
    href: string;
    color?: string;
  }>;

  return (
    <motion.section
      className="w-full py-16 sm:py-24 relative overflow-hidden border-b border-white/5"
      id="contact"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: theme.primary }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: theme.secondary }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase"
              style={{ color: theme.primary }}
            >
              Let's Connect
            </h2>
          </motion.div>
          <motion.p
            className="text-white/60 text-lg font-light"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Reach out and let's start a conversation
          </motion.p>
        </div>

        {/* Contact buttons grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
              },
            },
          }}
        >
          {contactButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <motion.a
                key={btn.label}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative py-6 px-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm"
                style={{
                  backgroundColor: `${theme.secondary}08`,
                }}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
                }}
                whileHover={{
                  backgroundColor: `${theme.secondary}20`,
                  borderColor: `${theme.secondary}60`,
                  y: -8,
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                  style={{ background: `linear-gradient(135deg, ${theme.secondary}40, ${theme.primary}40)` }}
                />

                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  style={{ color: theme.secondary }}
                >
                  <Icon size={32} />
                </motion.div>

                <div className="text-center">
                  <h3 className="font-bold uppercase tracking-widest text-sm text-white">
                    {btn.label}
                  </h3>
                  <p className="text-xs text-white/50 font-light mt-1">
                    {btn.label === "WhatsApp" ? "Send a message" : "Get in touch"}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Contact form */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 p-8 sm:p-10 rounded-3xl border border-white/10 backdrop-blur-md"
            style={{
              backgroundColor: `linear-gradient(135deg, ${theme.secondary}08, ${theme.primary}05)`,
            }}
          >
            <h3
              className="text-2xl font-black uppercase tracking-tighter"
              style={{ color: theme.primary }}
            >
              Send a Message
            </h3>

            {/* Name input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-white/70 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all outline-none"
                placeholder="Your name"
                disabled={loading}
              />
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-white/70 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all outline-none"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* Message input */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest text-white/70 font-semibold">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10 transition-all outline-none resize-none h-28"
                placeholder="Your message..."
                disabled={loading}
                maxLength={1000}
              />
              <div className="text-xs text-white/50 text-right">
                {formData.message.length}/1000
              </div>
            </div>

            {/* Error message */}
            {(error || status === "error") && (
              <motion.div
                className="flex items-center gap-2 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error || "Error sending message"}</span>
              </motion.div>
            )}

            {/* Success message */}
            {status === "success" && (
              <motion.div
                className="flex items-center gap-2 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check size={18} className="flex-shrink-0" />
                <span>Message sent successfully! 🎉</span>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 text-sm"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                opacity: loading ? 0.7 : 1,
              }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : status === "success" ? (
                <>
                  <Check size={18} />
                  Sent!
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Send Message
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </motion.section>
  );
}
