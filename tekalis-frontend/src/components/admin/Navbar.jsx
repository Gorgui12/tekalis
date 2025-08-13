import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="p-4 bg-blue-500 text-white flex justify-between">
      <h1 className="text-xl font-bold">Tekalis Admin</h1>
      <div>
        <Link to="/dashboard" className="px-3">Dashboard</Link>
        <Link to="/orders" className="px-3">Commandes</Link>
        <Link to="/payments" className="px-3">Paiements</Link>
        <Link to="/add-product" className="block px-4 py-2 hover:bg-gray-200">➕ Ajouter un Produit</Link>


      </div>
    </nav>
  );
};

export default Navbar;
