import { SignIn } from "@clerk/nextjs";

import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { isClerkConfigured } from "@/lib/clerk-config";
import { authContinueUrl } from "@/lib/safe-redirect";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  if (!isClerkConfigured()) {
    return <ClerkAuthFallback title="Connexion indisponible" />;
  }

  const { redirect_url: redirectUrl } = await searchParams;
  const afterAuth = authContinueUrl(redirectUrl);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <SignIn
        signUpUrl={
          redirectUrl
            ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`
            : "/sign-up"
        }
        forceRedirectUrl={afterAuth}
        fallbackRedirectUrl={afterAuth}
      />
    </main>
  );
}
