import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-8 mt-10">
      <div className="container mx-auto space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 text-center md:text-left">
        
        {/* À propos */}
        <div>
          <h3 className="text-lg font-bold mb-2"><Link to="/apropos" className="hover:underline">À propos</Link></h3>
          <p className="text-sm">
            Tekalis est une boutique en ligne offrant des produits de qualité,
            avec un service rapide et sécurisé.
          </p>
        </div>

        {/* Navigation + Réseaux sociaux (alignés sur mobile) */}
        <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between md:col-span-2">
          
          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold mb-2">Navigation</h3>
            <ul className="space-y-1">
              <li><Link to="/" className="hover:underline">Accueil</Link></li>
              <li><Link to="/products" className="hover:underline">Produits</Link></li>
              <li><Link to="/politique" className="hover:underline">Politique de confidentialité</Link></li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-bold mb-2">Suivez-nous</h3>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://www.facebook.com/share/14MikMhjFhA/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-blue-400"
              >
                <FaFacebook size={22} />
              </a>
              <a 
                href="https://www.instagram.com/_tekalis_?igsh=MWY0am12dDlyNGRpYQ==" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-pink-400"
              >
                <FaInstagram size={22} />
              </a>
              <a 
                href="" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-blue-300"
              >
                <FaLinkedin size={22} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bas du footer */}
      <div className="mt-6 border-t border-gray-500 pt-4 text-center text-sm">
        <p>© 2025 Tekalis - Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
