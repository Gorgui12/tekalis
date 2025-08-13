import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import Navbar from "../../components/admin/Navbar";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des stats :", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <Navbar />

      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        Tableau de Bord Administrateur
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-md p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">📦 Total Commandes</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>

        <div className="bg-white shadow-md p-6 rounded-lg border border-green-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">💰 Total Revenus</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalRevenue} €</p>
        </div>

        <div className="bg-white shadow-md p-6 rounded-lg border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">🛍️ Total Produits</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link to="/admin/orders" className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700">
          Gérer les Commandes
        </Link>
        <Link to="/admin/payments" className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700">
          Gérer les Paiements
        </Link>
        <Link to="/admin/add-product" className="bg-purple-600 text-white px-6 py-3 rounded shadow hover:bg-purple-700">
          Ajouter un Produit
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
