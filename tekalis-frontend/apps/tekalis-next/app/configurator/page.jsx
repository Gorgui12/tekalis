import ConfiguratorClient from "@/components/configurator/ConfiguratorClient";

export const metadata = {
  title: "Configurateur PC — Trouvez votre ordinateur | Tekalis",
  description:
    "Répondez à 3 questions (usage, budget, marque) et découvrez les ordinateurs adaptés à vos besoins, disponibles à Dakar avec livraison rapide.",
};

export default function ConfiguratorPage() {
  return <ConfiguratorClient />;
}
