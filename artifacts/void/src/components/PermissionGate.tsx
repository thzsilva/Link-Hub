import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionGateProps {
  children: React.ReactNode;
}

export default function PermissionGate({ children }: PermissionGateProps) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if permission was already granted (stored in localStorage)
    const savedPermission = localStorage.getItem("app-permission-granted");
    if (savedPermission === "true") {
      setPermissionGranted(true);
      return;
    }

    setPermissionGranted(false);
  }, []);

  const handlePermissionRequest = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      // Try to request necessary permissions
      // This will trigger the browser's permission dialog
      if (navigator.permissions) {
        // Request notification permission
        const notificationPerm = await navigator.permissions.query({
          name: "notifications" as PermissionName,
        });

        if (notificationPerm.state === "granted") {
          localStorage.setItem("app-permission-granted", "true");
          setPermissionGranted(true);
        } else if (notificationPerm.state === "prompt") {
          // Request notification permission
          try {
            const permission = await Notification.requestPermission?.();
            if (permission === "granted") {
              localStorage.setItem("app-permission-granted", "true");
              setPermissionGranted(true);
            } else {
              setError("Permissão negada. A app precisa de permissão para funcionar.");
            }
          } catch (err) {
            localStorage.setItem("app-permission-granted", "true");
            setPermissionGranted(true);
          }
        } else {
          setError("Permissão negada. A app precisa de permissão para funcionar.");
        }
      } else {
        // Fallback: assume permission granted if no permission API
        localStorage.setItem("app-permission-granted", "true");
        setPermissionGranted(true);
      }
    } catch (err) {
      // If error, assume permission granted (some browsers don't support this)
      localStorage.setItem("app-permission-granted", "true");
      setPermissionGranted(true);
    } finally {
      setIsRequesting(false);
    }
  };

  if (permissionGranted === null) {
    return null; // Loading state
  }

  if (!permissionGranted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <AlertCircle size={48} className="text-yellow-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              Permissão Necessária
            </h1>
            <p className="text-sm text-muted-foreground">
              Para continuar usando a app, você precisa permitir o acesso às permissões necessárias do dispositivo.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded p-4 text-left text-xs space-y-2 text-white/70">
            <p>A app precisa acessar:</p>
            <ul className="space-y-1 ml-4">
              <li>✓ Notificações e serviços do dispositivo</li>
              <li>✓ Acesso a outras apps do sistema</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handlePermissionRequest}
            disabled={isRequesting}
            className="w-full bg-white text-black hover:bg-white/90 uppercase tracking-widest font-bold rounded-none"
            size="lg"
          >
            {isRequesting ? "Solicitando..." : "Permitir Acesso"}
          </Button>

          <p className="text-xs text-white/40">
            Sem permitir essas permissões, a app não funcionará corretamente.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
