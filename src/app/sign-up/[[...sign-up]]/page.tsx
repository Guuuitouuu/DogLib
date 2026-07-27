import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { isClerkConfigured } from "@/lib/clerk-config";

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  if (!isClerkConfigured()) {
    return <ClerkAuthFallback title="Inscription indisponible" />;
  }

  const { redirect_url: redirectUrl } = await searchParams;
  const { SignUpForm } = await import("@/components/auth/sign-up-form");

  return <SignUpForm redirectUrl={redirectUrl} />;
}
