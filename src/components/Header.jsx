import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove stored user/auth data
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    // Redirect to login
    navigate("/login");
  };

  return (
    <div className="nav-tabs">
      <NavLink to="/dashboard" className="nav-tab" end>
        Dashboard
      </NavLink>
      <NavLink to="/dashboard/group" className="nav-tab">
        Group Details
      </NavLink>
      <NavLink to="/dashboard/add-expense" className="nav-tab">
        Add Expense
      </NavLink>
      <button
        onClick={handleLogout}
        className="nav-tab"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
