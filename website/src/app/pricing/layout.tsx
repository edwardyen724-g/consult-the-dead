import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free vs. Pro plans for Consult The Dead. Three free agons per day; Pro adds larger councils, Opus synthesis, and a persistent debate library.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
