import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { OrganizationJsonLd, WebAppJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { PageviewTracker } from "@/components/PageviewTracker";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = "https://www.consultthedead.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Consult The Dead — Multi-Framework Decision Support",
    template: "%s — Consult The Dead",
  },
  description:
    "Run your decisions through cognitive frameworks extracted from history's greatest minds. Structured disagreement from Newton, Machiavelli, Curie, Sun Tzu, and more — not generic AI advice.",
  keywords: [
    "decision making framework",
    "AI decision support",
    "mental models for business",
    "strategic thinking tool",
    "first principles thinking",
    "cognitive frameworks",
    "structured decision making",
    "alternative to ChatGPT for decisions",
  ],
  openGraph: {
    type: "website",
    siteName: "Consult The Dead",
    title: "Consult The Dead — Every AI gives the same advice. History doesn't.",
    description:
      "Run your hardest decisions through cognitive frameworks extracted from Newton, Machiavelli, Curie, Sun Tzu, and more. Where they disagree is where your blind spots live.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Consult The Dead — Every AI gives the same advice. History doesn't.",
    description:
      "Structured disagreement from history's greatest minds. Not persona prompts — real cognitive frameworks extracted via the Critical Decision Method.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <OrganizationJsonLd />
        <WebAppJsonLd />
        <FAQJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Header />
          {children}
        </ThemeProvider>
        <Analytics />
        <PageviewTracker />
      </body>
    </html>
  );
}
