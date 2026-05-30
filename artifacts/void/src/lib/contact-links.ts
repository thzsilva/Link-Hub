/**
 * Contact link generators
 * Creates properly formatted links for various contact methods
 */

/**
 * Generates WhatsApp contact link
 * @param phoneNumber - Phone number with country code (e.g., "5511999999999")
 * @param message - Optional pre-filled message
 */
export function getWhatsAppLink(phoneNumber: string, message?: string): string {
  if (!phoneNumber) return "";

  // Remove non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  const baseUrl = "https://wa.me";
  const messageParam = message ? `?text=${encodeURIComponent(message)}` : "";

  return `${baseUrl}/${cleanNumber}${messageParam}`;
}

/**
 * Generates email contact link
 * @param email - Email address
 * @param subject - Optional email subject
 * @param body - Optional email body
 */
export function getEmailLink(
  email: string,
  subject?: string,
  body?: string
): string {
  if (!email) return "";

  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (body) params.append("body", body);

  const queryString = params.toString();
  return `mailto:${email}${queryString ? "?" + queryString : ""}`;
}

/**
 * Generates Instagram direct message link
 * @param username - Instagram username (without @)
 */
export function getInstagramDMLink(username: string): string {
  if (!username) return "";

  // Remove @ if present
  const cleanUsername = username.replace(/^@/, "");

  return `https://instagram.com/${cleanUsername}`;
}

/**
 * Generates generic contact link based on type
 */
export function getContactLink(
  type: "whatsapp" | "email" | "instagram",
  contactInfo: string,
  message?: string
): string {
  switch (type) {
    case "whatsapp":
      return getWhatsAppLink(contactInfo, message);
    case "email":
      return getEmailLink(contactInfo, "Gostaria de entrar em contato", message);
    case "instagram":
      return getInstagramDMLink(contactInfo);
    default:
      return "";
  }
}

/**
 * Contact method configuration
 */
export const CONTACT_METHODS = {
  whatsapp: {
    label: "WhatsApp",
    icon: "MessageCircle",
    placeholder: "55 11 99999-9999",
  },
  email: {
    label: "Email",
    icon: "Mail",
    placeholder: "seu@email.com",
  },
  instagram: {
    label: "Instagram DM",
    icon: "Instagram",
    placeholder: "@seu_usuario",
  },
} as const;
