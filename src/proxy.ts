import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { isClerkConfigured } from "@/lib/clerk-config";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/onboarding(.*)",
  "/auth/continue(.*)",
]);

type ProxyArgs = [NextRequest, ...unknown[]];

let cachedClerkHandler:
  | ((...args: ProxyArgs) => Response | Promise<Response>)
  | null = null;

function getClerkHandler() {
  if (!cachedClerkHandler) {
    cachedClerkHandler = clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    }) as (...args: ProxyArgs) => Response | Promise<Response>;
  }
  return cachedClerkHandler;
}

export default function proxy(...args: ProxyArgs) {
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }
  return getClerkHandler()(...args);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
