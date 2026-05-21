import { Link } from "react-router-dom";
import { FaArrowRight, FaBox, FaEye } from "react-icons/fa";
import StatusBadge from "../shared/StatusBadge";

/**
 * RecentOrders — 5 dernières commandes du dashboard
 * Props:
 *   orders: Array<Order>
 *   loading: boolean
 */
const RecentOrders = ({ orders = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaBox className="text-blue-600" />
          Commandes récentes
        </h3>
        <Link
          to="/dashboard/orders"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
        >
          Voir tout <FaArrowRight size={12} />
        </Link>
      </div>

      {/* Contenu vide */}
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <FaBox className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Aucune commande pour le moment
          </p>
          <Link
            to="/products"
            className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Parcourir les produits →
          </Link>
        </div>
      ) : (
        /* Table desktop / liste mobile */
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-3">
                    Commande
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-3">
                    Statut
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-3">
                    Total
                  </th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="py-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? "s" : ""}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={order.status || "pending"} size="sm" />
                    </td>
                    <td className="py-3 text-right font-bold text-gray-900 dark:text-white text-sm">
                      {(order.totalAmount || 0).toLocaleString()} FCFA
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/dashboard/orders/${order._id}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        <FaEye size={12} />
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order._id}
                to={`/dashboard/orders/${order._id}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge status={order.status || "pending"} size="sm" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {(order.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">FCFA</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecentOrders;