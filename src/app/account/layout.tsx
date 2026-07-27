import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientSidebar } from "@/components/client/client-sidebar";
import { Role } from "@/generated/prisma/client";
import { clientAddressIsComplete } from "@/lib/client-location";
import { findAppUserByClerkId } from "@/lib/db-user";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/account");
  }

  const appUser = await findAppUserByClerkId(userId);
  if (!appUser) {
    redirect("/onboarding");
  }
  if (appUser.role === Role.EDUCATOR) {
    redirect("/dashboard");
  }
  if (!clientAddressIsComplete(appUser)) {
    redirect("/onboarding/client");
  }

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-background">
      <ClientSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-8">
          <Link href="/" className="text-sm font-bold tracking-tight md:hidden">
            DogLib
          </Link>
          <UserButton />
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-5 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
