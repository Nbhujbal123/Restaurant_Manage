import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

const SuperAdminLogin = () => {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting super admin login...");
      console.log("API URL:", `${API_BASE_URL}/auth/login`);
      console.log("Credentials:", { email: credentials.email, siteCode: "SUPERADMIN" });
      
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: credentials.email,
          password: credentials.password,
          siteCode: "SUPERADMIN"
        },
        {
          timeout: 10000
        }
      );

      console.log("Login response:", res.data);

      // Check if token exists in response
      if (!res.data.token) {
        console.error("No token in response:", res.data);
        throw new Error("No token received from server");
      }

      // Store token
      localStorage.setItem("token", res.data.token);
      console.log("Token stored successfully");

      // Set user data in AuthContext - handle different response structures
      const userData = res.data.user || {
        id: res.data.id || "superadmin",
        name: res.data.name || "Super Admin",
        email: credentials.email,
        phone: res.data.phone || "",
        profilePicture: res.data.profilePicture || "",
        role: "superadmin"
      };
      
      login(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User data stored:", userData);

      // Navigate to dashboard
      navigate("/superadmin/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        request: err.request ? "Request made but no response" : "No request made"
      });
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          const message = err.response?.data?.message || "Login failed. Please check your credentials.";
          const status = err.response?.status;
          console.error(`Server error ${status}:`, message);
          setError(`${message} (Status: ${status})`);
        } else if (err.request) {
          // Request made but no response
          console.error("No response received:", err.request);
          setError("Cannot connect to server. Please check your internet connection and verify the backend is running.");
        } else {
          console.error("Request setup error:", err.message);
          setError(`Login failed: ${err.message}`);
        }
      } else {
        console.error("Non-Axios error:", err);
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg,#667eea,#764ba2)"
      }}
    >

      <div
        className="bg-white p-5 shadow-lg"
        style={{
          width: "420px",
          borderRadius: "15px"
        }}
      >

        <div className="text-center mb-4">
          <FaUserShield size={45} color="#667eea" />
          <h3 className="mt-2 fw-bold">Super Admin</h3>
          <p className="text-muted" style={{fontSize:"14px"}}>
            Login to manage restaurants
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                disabled={isLoading}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            className="btn w-100"
            style={{
              background: isLoading ? "#9ca3af" : "#667eea",
              color: "#fff",
              padding: "10px",
              fontWeight: "600",
              borderRadius: "8px",
              border: "none"
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="fa-spin me-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

        </form>

      </div>

    </div>
  );
};

export default SuperAdminLogin;