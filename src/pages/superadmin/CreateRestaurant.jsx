import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaStore,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaPlus
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";

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
    if (!token) return navigate("/superadmin/login");

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/superadmin/create-restaurant`,
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
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/superadmin/restaurants");

    } catch (error) {
      alert("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center p-4">
        <div>
          <h2 className="fw-bold mb-1">➕ Create Restaurant</h2>
          <small className="text-muted">
            Add a new restaurant to your system
          </small>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => navigate("/superadmin/dashboard")}
        >
          <FaArrowLeft className="me-2" />
          Back
        </button>
      </div>

      {/* FORM */}
      <div className="container d-flex justify-content-center">
        <div
          className="card border-0 shadow-lg p-4"
          style={{ maxWidth: "600px", width: "100%", borderRadius: "16px" }}
        >
          <form onSubmit={handleSubmit}>

            {/* Restaurant Name */}
            <div className="mb-3">
              <label className="fw-semibold mb-1">Restaurant Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaStore />
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
            <div className="mb-3">
              <label className="fw-semibold mb-1">Owner Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaUser />
                </span>
                <input
                  type="text"
                  name="ownerName"
                  className="form-control"
                  placeholder="Enter owner name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="fw-semibold mb-1">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="fw-semibold mb-1">Phone</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaPhone />
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
              style={{ borderRadius: "10px" }}
            >
              {loading ? "Creating..." : (
                <>
                  <FaPlus className="me-2" />
                  Create Restaurant
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurant;