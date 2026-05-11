import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Agora",
  description:
    "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.consultthedead.com/agora",
  },
  openGraph: {
    title: "The Agora",
    description:
      "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
    url: "https://www.consultthedead.com/agora",
    type: "website",
    siteName: "Consult The Dead",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Agora",
    description:
      "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
  },
};

export default function AgoraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
