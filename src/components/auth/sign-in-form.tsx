import { SignIn } from "@clerk/nextjs";

import { authContinueUrl } from "@/lib/safe-redirect";

type Props = {
  redirectUrl?: string;
};

export function SignInForm({ redirectUrl }: Props) {
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
