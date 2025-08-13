import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";


const Statistique = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        alert("Erreur de chargement des statistiques: " + error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-blue-500 text-white rounded">Total Commandes: {stats.totalOrders}</div>
        <div className="p-4 bg-green-500 text-white rounded">Revenu Total: {stats.totalRevenue} €</div>
        <div className="p-4 bg-yellow-500 text-white rounded">Produits Total: {stats.totalProducts}</div>
      </div>
    </div>
  );
};

export default Statistique;
