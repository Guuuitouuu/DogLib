import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { OnboardingRolePicker } from "@/components/onboarding/onboarding-role-picker";

function resolveRole(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const role = (metadata as { role?: unknown }).role;
  return role === "EDUCATOR" || role === "CLIENT" ? role : undefined;
}

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = resolveRole(user?.publicMetadata);

  if (role === "EDUCATOR") {
    redirect("/dashboard");
  }
  if (role === "CLIENT") {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <OnboardingRolePicker />
    </main>
  );
}
