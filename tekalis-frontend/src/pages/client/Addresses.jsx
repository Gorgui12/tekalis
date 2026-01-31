import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaMapMarkerAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaStar,
  FaTimes
} from "react-icons/fa";
import api from "../../api/api";

const Addresses = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    address: "",
    city: "Dakar",
    region: "Dakar",
    isDefault: false
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/addresses");
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Erreur chargement adresses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir modal ajout
  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      label: "",
      fullName: user?.name || "",
      phone: "",
      address: "",
      city: "Dakar",
      region: "Dakar",
      isDefault: addresses.length === 0
    });
    setShowModal(true);
  };

  // Ouvrir modal édition
  const openEditModal = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      region: address.region,
      isDefault: address.isDefault
    });
    setShowModal(true);
  };

  // Fermer modal
  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  // Soumettre formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        // Modifier
        await api.put(`/addresses/${editingAddress._id}`, formData);
        alert("Adresse modifiée avec succès !");
      } else {
        // Ajouter
        await api.post("/addresses", formData);
        alert("Adresse ajoutée avec succès !");
      }
      
      closeModal();
      fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  // Supprimer une adresse
  const deleteAddress = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette adresse ?")) {
      return;
    }

    try {
      await api.delete(`/addresses/${id}`);
      alert("Adresse supprimée avec succès !");
      fetchAddresses();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  // Définir comme adresse par défaut
  const setDefaultAddress = async (id) => {
    try {
      await api.put(`/addresses/${id}/set-default`);
      fetchAddresses();
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-600" />
                Mes Adresses
              </h1>
              <p className="text-gray-600">
                Gérez vos adresses de livraison
              </p>
            </div>
            
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <FaPlus />
              Ajouter une adresse
            </button>
          </div>
        </div>

        {/* Liste des adresses */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune adresse enregistrée
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez une adresse pour faciliter vos commandes futures
            </p>
            <button
              onClick={openAddModal}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Ajouter ma première adresse
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 ${
                  address.isDefault ? "border-2 border-blue-600" : ""
                }`}
              >
                {/* Badge par défaut */}
                {address.isDefault && (
                  <div className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                    <FaStar />
                    <span className="text-sm">Adresse par défaut</span>
                  </div>
                )}

                {/* Label */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                    {address.label || "Sans titre"}
                  </h3>
                </div>

                {/* Informations */}
                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Destinataire</p>
                    <p className="font-semibold text-gray-900">{address.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Téléphone</p>
                    <p className="font-semibold text-gray-900">{address.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Adresse</p>
                    <p className="font-semibold text-gray-900">{address.address}</p>
                    <p className="text-gray-700">{address.city}, {address.region}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address._id)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                    >
                      <FaStar />
                      Définir par défaut
                    </button>
                  )}
                  
                  <button
                    onClick={() => openEditModal(address)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    <FaEdit />
                    Modifier
                  </button>
                  
                  <button
                    onClick={() => deleteAddress(address._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal formulaire */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAddress ? "Modifier l'adresse" : "Nouvelle adresse"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Label */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Libellé de l'adresse *
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Ex: Maison, Bureau, Chez mes parents..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Nom complet */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nom complet du destinataire *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Ex: Ousmane Diallo"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: 77 123 45 67"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Ville et région */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ville *
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Dakar">Dakar</option>
                        <option value="Pikine">Pikine</option>
                        <option value="Guédiawaye">Guédiawaye</option>
                        <option value="Rufisque">Rufisque</option>
                        <option value="Thiès">Thiès</option>
                        <option value="Saint-Louis">Saint-Louis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Région *
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Dakar">Dakar</option>
                        <option value="Thiès">Thiès</option>
                        <option value="Saint-Louis">Saint-Louis</option>
                        <option value="Diourbel">Diourbel</option>
                        <option value="Kaolack">Kaolack</option>
                      </select>
                    </div>
                  </div>

                  {/* Adresse complète */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Adresse complète *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Cité Keur Gorgui, Villa n°123, près de la pharmacie Plateau"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Adresse par défaut */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Définir comme adresse par défaut
                      </span>
                    </label>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
                  >
                    {editingAddress ? "Enregistrer les modifications" : "Ajouter l'adresse"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">
            💡 Pourquoi enregistrer plusieurs adresses ?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Gain de temps</p>
              <p className="text-purple-100">
                Pas besoin de ressaisir vos informations à chaque commande.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Livraison flexible</p>
              <p className="text-purple-100">
                Livrez à votre bureau, chez vous ou chez un proche.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Adresses multiples</p>
              <p className="text-purple-100">
                Enregistrez autant d'adresses que nécessaire.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Sécurisé</p>
              <p className="text-purple-100">
                Vos informations sont protégées et confidentielles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addresses;