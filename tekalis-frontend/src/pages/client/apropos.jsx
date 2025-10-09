import React from "react";

const Apropos = () => {
  return (
    <section className="min-h-screen bg-[#fae3d7] text-[#4a4a4a] px-6 py-16 flex flex-col items-center">
      <div className="max-w-5xl text-center">
        {/* Titre principal */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#88b04b]">
          À propos de Tekalis
        </h1>

        {/* Histoire */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#8abad3]">
            Notre histoire
          </h2>
          <p className="leading-relaxed text-lg">
            Fondée avec une vision claire, <span className="font-semibold">Tekalis</span> est née du désir de rendre
            la technologie plus accessible à tous.  
            Depuis notre création, nous mettons à la disposition de nos clients
            une large gamme de produits tech — ordinateurs, accessoires, gadgets connectés
            et solutions innovantes — sélectionnés avec soin pour leur qualité et leur fiabilité.
            <br /><br />
            Tekalis est aujourd’hui une référence au Sénégal et en Afrique francophone
            pour tous ceux qui recherchent du matériel technologique au meilleur rapport
            qualité-prix, avec un service client de proximité.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#8abad3]">
            Notre mission
          </h2>
          <p className="leading-relaxed text-lg">
            Notre mission est simple :
            <span className="font-medium text-[#88b04b]">
              {" "}rendre la technologie plus proche, plus fiable et plus abordable{" "}
            </span>
            pour chaque foyer africain.  
            Nous croyons que la technologie est un moteur de développement et un outil
            essentiel pour l’éducation, l’entrepreneuriat et l’innovation.
            <br /><br />
            C’est pourquoi Tekalis s’engage à offrir des produits authentiques, une livraison rapide,
            et un service après-vente à la hauteur de vos attentes.
          </p>
        </div>

        {/* Confiance */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#8abad3]">
            Pourquoi nous faire confiance ?
          </h2>
          <p className="leading-relaxed text-lg">
            La satisfaction de nos clients est au cœur de tout ce que nous faisons.  
            Tekalis repose sur trois valeurs fortes :
          </p>

          <ul className="text-left mt-4 space-y-3 text-lg">
            <li>
              🔒 <span className="font-semibold">Fiabilité :</span> tous nos produits sont testés et garantis
              pour vous offrir une qualité irréprochable.
            </li>
            <li>
              ⚡ <span className="font-semibold">Innovation :</span> nous restons à la pointe des tendances
              pour vous proposer les dernières nouveautés technologiques.
            </li>
            <li>
              💬 <span className="font-semibold">Proximité :</span> notre équipe est toujours disponible pour vous conseiller
              et vous accompagner avant, pendant et après votre achat.
            </li>
          </ul>

          <p className="mt-6 text-lg">
            Tekalis, c’est bien plus qu’une boutique en ligne — c’est une communauté de passionnés
            de technologie, de fiabilité et de progrès.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Apropos;
