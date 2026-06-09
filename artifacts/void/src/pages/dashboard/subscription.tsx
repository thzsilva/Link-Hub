import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Copy, ExternalLink, Crown, CalendarClock } from "lucide-react";

type SubStatus = {
  active: boolean;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  daysLeft: number;
  inTrial: boolean;
  price: number;
};

type CheckoutResult = {
  subscriptionId: string;
  invoiceUrl: string | null;
  pix: { encodedImage: string; payload: string } | null;
  value: number;
};

const STATUS_LABEL: Record<string, string> = {
  trialing: "Período de teste",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  none: "Sem assinatura",
};

export default function DashboardSubscription() {
  const { user } = useUser();
  const { toast } = useToast();

  const { data: sub, isLoading, refetch } = useQuery<SubStatus>({
    queryKey: ["/api/me/subscription"],
    queryFn: () => customFetch<SubStatus>("/api/me/subscription"),
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    billingType: "PIX" as "PIX" | "CREDIT_CARD" | "BOLETO",
  });
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Prefill com dados do Clerk
  const defaultName = user?.fullName || user?.firstName || "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress || "";

  const checkout = useMutation({
    mutationFn: () =>
      customFetch<CheckoutResult>("/api/subscription/checkout", {
        method: "POST",
        body: JSON.stringify({
          name: form.name || defaultName,
          email: form.email || defaultEmail,
          cpfCnpj: form.cpfCnpj,
          billingType: form.billingType,
        }),
      }),
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "Cobrança gerada! Conclua o pagamento." });
    },
    onError: (e: any) => toast({ title: e?.message || "Erro ao iniciar assinatura", variant: "destructive" }),
  });

  const copyPix = () => {
    if (!result?.pix?.payload) return;
    navigator.clipboard.writeText(result.pix.payload).then(() => {
      setCopied(true);
      toast({ title: "Código PIX copiado!" });
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Assinatura</h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm">
          Mantenha seu hub ativo — R$ 20/mês.
        </p>
      </div>

      {/* Status atual */}
      <Card className="rounded-none bg-black border-border">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={16} /> Carregando...</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub?.active ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {sub?.status === "active" ? <Crown size={18} /> : <CalendarClock size={18} />}
                </div>
                <div>
                  <p className="font-bold">{STATUS_LABEL[sub?.status || "none"] || sub?.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub?.inTrial
                      ? `${sub.daysLeft} dia(s) de teste restante(s)`
                      : sub?.status === "active"
                        ? sub?.currentPeriodEnd
                          ? `Renova/expira em ${new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}`
                          : "Acesso ativo"
                        : "Assine para manter o hub ativo"}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest px-3 py-1 border ${sub?.active ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}`}
              >
                {sub?.active ? "Hub ativo" : "Hub inativo"}
              </span>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resultado do checkout (PIX / link) */}
      {result ? (
        <Card className="rounded-none bg-black border border-white/30">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-black uppercase tracking-tight text-lg">Conclua o pagamento</h2>

            {result.pix && (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={`data:image/png;base64,${result.pix.encodedImage}`}
                  alt="QR Code PIX"
                  className="w-56 h-56 bg-white p-2 rounded-lg"
                />
                <div className="w-full">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">PIX Copia e Cola</p>
                  <div className="flex gap-2">
                    <Input value={result.pix.payload} readOnly className="rounded-none bg-black border-border font-mono text-xs" />
                    <Button onClick={copyPix} className="rounded-none bg-white text-black hover:bg-white/90 gap-2 flex-shrink-0">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {result.invoiceUrl && (
              <a href={result.invoiceUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full rounded-none bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 uppercase tracking-widest text-xs font-bold gap-2">
                  <ExternalLink size={14} /> Abrir página de pagamento (PIX / Cartão / Boleto)
                </Button>
              </a>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Após o pagamento ser confirmado, seu hub é ativado automaticamente. Pode levar alguns instantes.
            </p>
            <Button variant="ghost" onClick={() => { setResult(null); refetch(); }} className="w-full text-xs uppercase tracking-widest">
              Já paguei / Atualizar status
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Formulário de assinatura */
        sub?.status !== "active" && (
          <Card className="rounded-none bg-black border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-black uppercase tracking-tight text-lg">Assinar — R$ 20/mês</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Nome</label>
                  <Input
                    value={form.name || defaultName}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-none bg-black border-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">E-mail</label>
                  <Input
                    value={form.email || defaultEmail}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-none bg-black border-border"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">CPF ou CNPJ</label>
                <Input
                  value={form.cpfCnpj}
                  onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
                  placeholder="000.000.000-00"
                  className="rounded-none bg-black border-border font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Forma de pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: "PIX", label: "PIX" },
                    { v: "CREDIT_CARD", label: "Cartão" },
                    { v: "BOLETO", label: "Boleto" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setForm({ ...form, billingType: opt.v })}
                      className={`rounded-none border px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-all ${
                        form.billingType === opt.v ? "border-white bg-white/10 text-white" : "border-border text-muted-foreground hover:border-white/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending || !form.cpfCnpj.trim()}
                className="w-full rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold gap-2"
              >
                {checkout.isPending ? <><Loader2 className="animate-spin" size={14} /> Gerando...</> : "Assinar agora"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                Pagamento processado com segurança pelo Asaas. Não armazenamos dados do seu cartão.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
