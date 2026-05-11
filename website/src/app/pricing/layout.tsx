import type { Metadata } from "next";
import {
  getPricingMetadataDescription,
  getPricingMetadataTitle,
  getPricingSharePreviewCard,
} from "@/lib/pricing-copy";

const title = getPricingMetadataTitle();
const description = getPricingMetadataDescription();
const card = getPricingSharePreviewCard();

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
    card,
    title,
    description,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
