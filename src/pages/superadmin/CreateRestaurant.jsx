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
  FaExternalLinkAlt,
  FaCopy,
  FaCheck           
} from "react-icons/fa";

import { API_BASE_URL, FRONTEND_URL } from "../../config/api";

const CreateRestaurant = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [createdRestaurant, setCreatedRestaurant] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

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

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
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

      // Generate the customer-facing link with siteCode using FRONTEND_URL
      // Always use FRONTEND_URL from environment (VITE_FRONTEND_URL)
      const baseUrl = FRONTEND_URL || 'https://restaurant-manage-mdzr.vercel.app';
      
      const restaurantLink = `${baseUrl}?siteCode=${siteCode}`;
      
      // Admin login URL
      const adminLoginUrl = `${baseUrl}/admin?siteCode=${siteCode}`;
      
      // Store the created restaurant data for display
      setCreatedRestaurant({
        siteCode,
        restaurantLink,
        adminLoginUrl,
        restaurantName: formData.restaurantName,
        adminPassword: "admin123"
      });

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


      {/* SUCCESS MESSAGE WITH LINKS */}
      {createdRestaurant && (
        <div className="card border-0 shadow-sm mb-4" style={{borderLeft: "4px solid #28a745"}}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-success text-white rounded-circle p-2 me-3">
                <FaCheck />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Restaurant Created Successfully!</h5>
                <small className="text-muted">Site Code: {createdRestaurant.siteCode}</small>
              </div>
            </div>

            <div className="row g-3">
              {/* Customer Link - For Ordering Food */}
              <div className="col-md-6">
                <div className="card h-100" style={{background: "#f0f9ff"}}>
                  <div className="card-body">
                    <h6 className="card-title fw-bold text-primary">
                      <FaExternalLinkAlt className="me-2" />
                      Customer Link (Order Food)
                    </h6>
                    <p className="card-text small text-muted mb-2">
                      Share this link with customers to browse menu and place orders
                    </p>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={createdRestaurant.restaurantLink}
                        readOnly
                        style={{fontSize: "0.85rem"}}
                      />
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => copyToClipboard(createdRestaurant.restaurantLink, 'customer')}
                        title="Copy link"
                      >
                        {copiedField === 'customer' ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>
                    <a
                      href={createdRestaurant.restaurantLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm mt-2 w-100"
                    >
                      Open Customer Page
                    </a>
                  </div>
                </div>
              </div>

              {/* Admin Login Link */}
              <div className="col-md-6">
                <div className="card h-100" style={{background: "#f0fdf4"}}>
                  <div className="card-body">
                    <h6 className="card-title fw-bold text-success">
                      <FaUser className="me-2" />
                      Admin Login Link
                    </h6>
                    <p className="card-text small text-muted mb-2">
                      Share this link with restaurant admin to manage the restaurant
                    </p>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={createdRestaurant.adminLoginUrl}
                        readOnly
                        style={{fontSize: "0.85rem"}}
                      />
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => copyToClipboard(createdRestaurant.adminLoginUrl, 'admin')}
                        title="Copy link"
                      >
                        {copiedField === 'admin' ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>
                    <a
                      href={createdRestaurant.adminLoginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-sm mt-2 w-100"
                    >
                      Open Admin Login
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Credentials */}
            <div className="alert alert-info mt-3 mb-0">
              <strong>🔐 Default Admin Credentials:</strong>
              <br />
              <small>
                Email: <code>{formData.email}</code> | Password: <code>{createdRestaurant.adminPassword}</code>
              </small>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setCreatedRestaurant(null);
                  setFormData({
                    restaurantName: "",
                    ownerName: "",
                    email: "",
                    phone: ""
                  });
                }}
              >
                Create Another Restaurant
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/superadmin/restaurants")}
              >
                View All Restaurants
              </button>
            </div>
          </div>
        </div>
      )}


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