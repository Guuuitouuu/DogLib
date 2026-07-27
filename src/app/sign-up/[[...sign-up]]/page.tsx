import { SignUp } from "@clerk/nextjs";

import { authContinueUrl } from "@/lib/safe-redirect";

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { redirect_url: redirectUrl } = await searchParams;
  const afterAuth = authContinueUrl(redirectUrl);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <SignUp
        signInUrl={
          redirectUrl
            ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
            : "/sign-in"
        }
        forceRedirectUrl={afterAuth}
        fallbackRedirectUrl={afterAuth}
      />
    </main>
  );
}
