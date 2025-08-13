import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";


const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/payments")
      .then((res) => setPayments(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Gestion des Paiements</h1>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Commande</th>
            <th className="border p-2">Méthode</th>
            <th className="border p-2">Statut</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id} className="border">
              <td className="p-2">{payment.orderId}</td>
              <td className="p-2">{payment.method}</td>
              <td className="p-2">{payment.status}</td>
              <td className="p-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded">Valider</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
