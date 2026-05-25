import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionGateProps {
  children: React.ReactNode;
}

export default function PermissionGate({ children }: PermissionGateProps) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if permission was already granted
    const savedPermission = localStorage.getItem("app-permission-granted");
    if (savedPermission === "true") {
      setPermissionGranted(true);
      return;
    }

    setPermissionGranted(false);
  }, []);

  const handlePermissionRequest = () => {
    // Simples: salvar e pronto
    localStorage.setItem("app-permission-granted", "true");
    setPermissionGranted(true);
  };

  if (permissionGranted === null) {
    return null; // Loading state
  }

  if (!permissionGranted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              Bem-vindo
            </h1>
            <p className="text-sm text-muted-foreground">
              Clique em "Continuar" para acessar sua conta.
            </p>
          </div>

          <Button
            onClick={handlePermissionRequest}
            className="w-full bg-white text-black hover:bg-white/90 uppercase tracking-widest font-bold rounded-none"
            size="lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
