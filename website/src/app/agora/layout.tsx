import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Agora",
  description:
    "Run your hard decision through a council of historical minds. Structured disagreement, real consensus, yours in under three minutes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgoraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
