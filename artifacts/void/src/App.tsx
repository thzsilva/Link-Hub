import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { setUploadTokenGetter } from "@/lib/api-base";
import PermissionGate from "@/components/PermissionGate";

import Home from "@/pages/home";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import DashboardHome from "@/pages/dashboard/index";
import DashboardLinks from "@/pages/dashboard/links";
import DashboardPhotos from "@/pages/dashboard/photos";
import DashboardAppearance from "@/pages/dashboard/appearance";
import DashboardCustomization from "@/pages/dashboard/customization";
import DashboardAnalytics from "@/pages/dashboard/analytics";
import DashboardEvents from "@/pages/dashboard/events";
import Admin from "@/pages/admin";
import PublicProfile from "@/pages/public/profile";
import PublicPhotos from "@/pages/public/photos";
import PrivacyPolicy from "@/pages/legal/privacy";
import TermsOfUse from "@/pages/legal/terms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // dados ficam "frescos" por 1 min — sem refetch desnecessário
      gcTime: 5 * 60_000,          // mantém cache por 5 min na memória
      retry: 1,                    // só 1 retry em falha
      refetchOnWindowFocus: false, // não re-busca ao trocar de aba
    },
  },
});

// Só ativa o Clerk se a chave estiver explicitamente configurada no .env.
// publishableKeyFromHost gera uma chave sintética para localhost que tenta
// carregar de clerk.localhost (inexistente) — por isso verificamos primeiro.
let clerkPubKey: string | null = null;
if (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  try {
    clerkPubKey = publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    ) ?? null;
  } catch {
    // Clerk key inválida
  }
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(0 0% 100%)",
    colorForeground: "hsl(0 0% 100%)",
    colorMutedForeground: "hsl(0 0% 60%)",
    colorDanger: "hsl(0 100% 50%)",
    colorBackground: "hsl(0 0% 3%)",
    colorInput: "hsl(0 0% 15%)",
    colorInputForeground: "hsl(0 0% 100%)",
    colorNeutral: "hsl(0 0% 15%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-none w-[440px] max-w-full overflow-hidden border-border border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkAuthSetup() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Configure the API client to use Clerk's session token
    const tokenGetter = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.warn('⚠️ Clerk getToken() retornou null/undefined');
          console.warn('VITE_CLERK_PROXY_URL:', import.meta.env.VITE_CLERK_PROXY_URL);
          console.warn('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
          return null;
        }
        console.debug('✅ Clerk token obtido com sucesso');
        return token;
      } catch (error) {
        console.error('❌ Erro ao obter token Clerk:', error);
        console.error('Detalhes:', (error as any)?.message);
        return null;
      }
    };
    setAuthTokenGetter(tokenGetter);
    // Same getter for raw fetch() uploads (FormData) that bypass customFetch
    setUploadTokenGetter(tokenGetter);
  }, [getToken]);

  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get('user');
  const isPhotos = searchParams.get('photos') === 'true';

  // Se tem ?user= param, mostra perfil público mesmo se logado
  if (username) {
    return isPhotos ? <PublicPhotos /> : <PublicProfile />;
  }

  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function DashboardRoutes() {
  return (
    <>
      <Show when="signed-in">
        <DashboardLayout>
          <Switch>
            <Route path="/dashboard" component={DashboardHome} />
            <Route path="/dashboard/links" component={DashboardLinks} />
            <Route path="/dashboard/photos" component={DashboardPhotos} />
            <Route path="/dashboard/customization" component={DashboardCustomization} />
            <Route path="/dashboard/appearance" component={DashboardAppearance} />
            <Route path="/dashboard/analytics" component={DashboardAnalytics} />
            <Route path="/dashboard/events" component={DashboardEvents} />
            <Route path="/admin" component={Admin} />
          </Switch>
        </DashboardLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkAuthSetup />
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/privacidade" component={PrivacyPolicy} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/termos" component={TermsOfUse} />
        <Route path="/terms" component={TermsOfUse} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/dashboard" component={DashboardRoutes} />
        <Route path="/dashboard/:rest*" component={DashboardRoutes} />
        <Route path="/admin" component={DashboardRoutes} />

        <Route component={NotFound} />
      </Switch>
    </ClerkProvider>
  );
}


function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <PermissionGate>
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {clerkPubKey ? (
              <ClerkProviderWithRoutes />
            ) : (
              <Switch>
                <Route path="/" component={HomeRedirect} />
                <Route path="/privacidade" component={PrivacyPolicy} />
                <Route path="/privacy" component={PrivacyPolicy} />
                <Route path="/termos" component={TermsOfUse} />
                <Route path="/terms" component={TermsOfUse} />
                <Route component={NotFound} />
              </Switch>
            )}
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </WouterRouter>
    </PermissionGate>
  );
}

export default App;
