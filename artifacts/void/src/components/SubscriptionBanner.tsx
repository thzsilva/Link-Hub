import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import { AlertTriangle, Clock, Crown } from "lucide-react";

type SubStatus = {
  active: boolean;
  status: string;
  daysLeft: number;
  inTrial: boolean;
  exempt?: boolean;
};

/**
 * Banner global do dashboard avisando sobre trial/assinatura.
 * - Isento/ativo: não mostra nada (ou nada intrusivo).
 * - Em trial: aviso amarelo com dias restantes.
 * - Inativo (trial expirado / past_due / cancelado): aviso vermelho.
 */
export function SubscriptionBanner() {
  const { data: sub } = useQuery<SubStatus>({
    queryKey: ["/api/me/subscription"],
    queryFn: () => customFetch<SubStatus>("/api/me/subscription"),
    staleTime: 60_000,
  });

  if (!sub) return null;
  if (sub.exempt || sub.status === "exempt") return null; // cortesia → sem banner

  // Hub inativo
  if (!sub.active) {
    return (
      <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-200">
            <strong>Seu hub está inativo.</strong> Assine para reativar seu perfil público.
          </p>
        </div>
        <Link
          href="/dashboard/assinatura"
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-white/90 transition-colors text-center"
        >
          Assinar agora
        </Link>
      </div>
    );
  }

  // Em trial
  if (sub.inTrial) {
    const urgent = sub.daysLeft <= 1;
    return (
      <div
        className={`mb-6 rounded-xl border px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          urgent ? "border-red-500/40 bg-red-500/10" : "border-amber-500/40 bg-amber-500/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock size={18} className={`${urgent ? "text-red-400" : "text-amber-400"} flex-shrink-0`} />
          <p className={`text-sm ${urgent ? "text-red-200" : "text-amber-100"}`}>
            <strong>
              {sub.daysLeft <= 0
                ? "Seu teste termina hoje."
                : `Seu teste grátis termina em ${sub.daysLeft} dia${sub.daysLeft > 1 ? "s" : ""}.`}
            </strong>{" "}
            Assine por R$ 20/mês para manter seu hub ativo.
          </p>
        </div>
        <Link
          href="/dashboard/assinatura"
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold transition-colors text-center ${
            urgent ? "bg-white text-black hover:bg-white/90" : "bg-amber-400 text-black hover:bg-amber-300"
          }`}
        >
          Assinar
        </Link>
      </div>
    );
  }

  // Ativo pago: aviso discreto opcional quando faltam poucos dias para renovar
  if (sub.status === "active" && sub.daysLeft > 0 && sub.daysLeft <= 3) {
    return (
      <div className="mb-6 rounded-xl border border-white/15 bg-white/5 px-4 sm:px-5 py-3 flex items-center gap-3">
        <Crown size={16} className="text-green-400 flex-shrink-0" />
        <p className="text-sm text-white/70">
          Sua assinatura renova em {sub.daysLeft} dia{sub.daysLeft > 1 ? "s" : ""}.
        </p>
      </div>
    );
  }

  return null;
}
