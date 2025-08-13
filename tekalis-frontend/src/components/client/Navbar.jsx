import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Tekalis</Link>

        <div className="space-x-6">
          <Link to="/" className="hover:underline">Accueil</Link>
          <Link to="/products" className="hover:underline">Produits</Link>
          <Link to="/cart" className="hover:underline">🛒 Panier</Link>

          {!user ? (
            <Link to="/login" className="hover:underline">Se connecter</Link>
          ) : (
            <button onClick={handleProfileClick} className="hover:underline" title={user.name}>
              👤
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
