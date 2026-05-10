import type { Metadata } from "next";
import { getPricingMetadataDescription } from "@/lib/pricing-copy";

const title = "Pricing";
const description = getPricingMetadataDescription();

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://www.consultthedead.com/pricing",
  },
  openGraph: {
    title,
    description,
    url: "https://www.consultthedead.com/pricing",
    type: "website",
    siteName: "Consult The Dead",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
