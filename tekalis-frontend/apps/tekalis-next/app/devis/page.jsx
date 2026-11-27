import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from "@/lib/seo/config";
import QuoteRequestClient from "@/components/static/QuoteRequestClient";

const title = "Devis entreprise | Tekalis — Matériel informatique & solaire Sénégal";
const description =
  "Demandez un devis B2B rapide à Tekalis : matériel informatique, ordinateurs et solutions solaires à Dakar. Livraison partout au Sénégal, prix confirmé sous 24h ouvrées.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "https://tekalis.com/devis" },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "https://tekalis.com/devis",
    siteName: "Tekalis Sénégal",
    title,
    description,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: "Tekalis — devis entreprise informatique et solaire au Sénégal",
      },
    ],
  },
};

export default function DevisPage() {
  return (
    <>
      <h1 className="sr-only">Demander un devis — Tekalis Sénégal</h1>
      <QuoteRequestClient />
    </>
  );
}
