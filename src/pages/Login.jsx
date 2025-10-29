import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../api/groups";
import LoadingScreen from "../components/LoadingScreen";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await axios.get("https://xpensesplit.onrender.com/api/ping", { timeout: 10000 });
        console.log("✅ Backend awake!");
      } catch (err) {
        console.log("⚠️ Server still waking up...",err);
      }
    };
    wakeUpServer();
  }, []);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginUser(formData.username, formData.password);
      toast.success(`Welcome back, ${response.data.firstname}!`);
      localStorage.setItem("user", JSON.stringify(response.data));
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Invalid username or password!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="register-page-container">
        <div className="register-card">
          <div className="card-header">
            <div className="card-title">Welcome Back!</div>
            <div className="card-subtitle">Sign in to continue</div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="john.doe"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                style={{ paddingRight: "2.5rem" }}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "0.75rem",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <button onClick={handleLogin} className="register-button">
              Sign In
            </button>
          </div>

          <div className="login-redirect">
            <span className="login-redirect-text">Don't have an account? </span>
            <Link to="/" className="login-redirect-button">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
