import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="main-header">
      <div className="logo-container">
        <h1>XpenseSplit</h1>
        <img src={logo} alt="Application Logo" className="logo" />
      </div>
      <nav className="nav-tabs">
        <NavLink to="/dashboard" className="nav-tab" end>
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/group" className="nav-tab">
          Group Details
        </NavLink>
        <NavLink to="/dashboard/individual-expenses" className="nav-tab">
          IndividualExpenses
        </NavLink>
        <NavLink to="/dashboard/add-expense" className="nav-tab">
          Add Expense
        </NavLink>
        <button onClick={handleLogout} className="nav-tab">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
