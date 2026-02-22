// src/pages/admin/Register.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from '../../../../packages/shared/context/ToastContext';
const Register = () => {
  const toast = useToast();
  const [form, setForm] = useState({
    username: "",  // ✅ Changement ici
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/admin/register", form);
      toast.success("Admin créé avec succès !");
      navigate("/admin/login");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">Créer un compte admin</h2>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <input
          type="text"
          name="username"  // ✅ Changement ici
          placeholder="Nom d'utilisateur"
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Créer le compte
        </button>
      </form>
    </div>
  );
};

export default Register;
