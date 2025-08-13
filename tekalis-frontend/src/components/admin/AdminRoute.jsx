import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user?.isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;
