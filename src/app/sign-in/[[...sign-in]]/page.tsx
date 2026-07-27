import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { isClerkConfigured } from "@/lib/clerk-config";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  if (!isClerkConfigured()) {
    return <ClerkAuthFallback title="Connexion indisponible" />;
  }

  const { redirect_url: redirectUrl } = await searchParams;
  const { SignInForm } = await import("@/components/auth/sign-in-form");

  return <SignInForm redirectUrl={redirectUrl} />;
}
