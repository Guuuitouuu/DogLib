import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist_Mono, Inter } from "next/font/google";

import { isClerkConfigured } from "@/lib/clerk-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doglib.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DogLib — Éducateurs canins & propriétaires",
    template: "%s · DogLib",
  },
  description:
    "Marketplace et tableau de bord pour éducateurs canins : réservations, clients, chiens, agenda et revenus.",
  applicationName: "DogLib",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DogLib",
    title: "DogLib — Éducateurs canins & propriétaires",
    description:
      "Trouvez un éducateur canin près de chez vous, ou gérez votre activité éducateur.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DogLib",
    description:
      "Marketplace et espace pro pour éducateurs canins et propriétaires.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbf7f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html
      lang="fr"
      className={`light ${inter.variable} ${geistMono.variable} h-full bg-background`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );

  if (!isClerkConfigured()) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
