import { SignUp } from "@clerk/nextjs";

import { authContinueUrl } from "@/lib/safe-redirect";

type Props = {
  redirectUrl?: string;
};

export function SignUpForm({ redirectUrl }: Props) {
  const afterAuth = authContinueUrl(redirectUrl);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <SignUp
        routing="hash"
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
