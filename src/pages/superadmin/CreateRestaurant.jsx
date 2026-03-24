import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaStore,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaPlus,
  FaExternalLinkAlt
} from "react-icons/fa";

import { API_BASE_URL, FRONTEND_URL } from "../../config/api";

const CreateRestaurant = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login first");
      navigate("/superadmin/login");
      return;
    }

    try {

      setLoading(true);

      console.log("Creating restaurant with data:", {
        restaurantName: formData.restaurantName,
        restaurantEmail: formData.email,
        restaurantPhone: formData.phone,
        adminName: formData.ownerName,
        adminEmail: formData.email
      });

      const apiUrl = `${API_BASE_URL}/superadmin/create-restaurant`;
      console.log("API URL:", apiUrl);

      const res = await axios.post(
        apiUrl,
        {
          restaurantName: formData.restaurantName,
          restaurantEmail: formData.email,
          restaurantPhone: formData.phone,
          adminName: formData.ownerName,
          adminEmail: formData.email,
          adminMobile: formData.phone,
          adminPassword: "admin123"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 15000
        }
      );

      console.log("Create restaurant response:", res.data);

      // Check if restaurant was created
      if (!res.data.restaurant) {
        throw new Error("Invalid response: No restaurant data received");
      }

      const siteCode = res.data.restaurant.siteCode;

      // Generate the customer-facing link with siteCode
      // Use window.location.origin as fallback if FRONTEND_URL is not set
      const baseUrl = FRONTEND_URL && FRONTEND_URL !== 'https://your-frontend.vercel.app'
        ? FRONTEND_URL
        : window.location.origin;
      
      const restaurantLink = `${baseUrl}?siteCode=${siteCode}`;
      
      // Admin login URL
      const adminLoginUrl = `${baseUrl}/admin?siteCode=${siteCode}`;
      
      // Show success message with links (don't open automatically)
      alert(
        `✅ Restaurant Created Successfully!

Site Code: ${siteCode}

📋 Links:
• Customer Link: ${restaurantLink}
• Admin Login: ${adminLoginUrl}

🔐 Default Admin Password: admin123

💡 Tip: Copy these links and share with the restaurant admin.`
      );

      // Navigate to manage restaurants page instead of dashboard
      navigate("/superadmin/restaurants");

    } catch (error) {

      console.error("Create restaurant error:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      
      let errorMessage = "Failed to create restaurant";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Request made but no response
          errorMessage = "Cannot connect to server. Please check your internet connection.";
        } else {
          errorMessage = "Error setting up request. Please try again.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="container-fluid p-4" style={{background:"#f8fafc",minHeight:"100vh"}}>

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-bold">Create Restaurant</h3>
          <p className="text-muted mb-0">
            Add a new restaurant to your platform
          </p>
        </div>

        <button
          className="btn btn-light shadow-sm"
          onClick={() => navigate("/superadmin/dashboard")}
        >
          <FaArrowLeft className="me-2"/>
          Back
        </button>

      </div>


      {/* FORM CARD */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-4">

              {/* Restaurant Name */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Restaurant Name
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <FaStore/>
                  </span>

                  <input
                    type="text"
                    name="restaurantName"
                    className="form-control"
                    placeholder="Enter restaurant name"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* Owner Name */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Owner Name
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <FaUser/>
                  </span>

                  <input
                    type="text"
                    name="ownerName"
                    className="form-control"
                    placeholder="Owner name"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* Email */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Email
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <FaEnvelope/>
                  </span>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* Phone */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Phone
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <FaPhone/>
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            </div>


            {/* SUBMIT BUTTON */}

            <div className="mt-4">

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >

                {loading ? "Creating Restaurant..." : (
                  <>
                    <FaPlus className="me-2"/>
                    Create Restaurant
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

};

export default CreateRestaurant;