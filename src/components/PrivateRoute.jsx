import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user"); // or use Context/Redux
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
