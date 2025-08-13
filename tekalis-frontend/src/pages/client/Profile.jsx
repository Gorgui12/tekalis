import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Erreur:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border">
      <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Profil utilisateur</h1>
      <div className="space-y-2">
        <p><span className="font-semibold">Nom:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">Rôle:</span> {user.isAdmin ? "Admin" : "Client"}</p>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default Profile;
