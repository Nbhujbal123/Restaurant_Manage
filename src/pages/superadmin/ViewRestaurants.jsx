import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaCopy,
  FaPowerOff,
  FaSearch,
  FaArrowLeft,
  FaBan
} from "react-icons/fa";
import { toast } from "../../components/Toast";

import { API_BASE_URL, FRONTEND_URL } from "../../config/api";

const ViewRestaurants = () => {

  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    
    // Verify user has superadmin role
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "superadmin" && user.email !== "superadmin@restom.com") {
          navigate("/superadmin/login");
          return;
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    fetchRestaurants();
  }, [navigate]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login first");
        navigate("/superadmin/login");
        return;
      }

      console.log("Fetching restaurants...");
      console.log("API URL:", `${API_BASE_URL}/superadmin/restaurants`);
      console.log("Token:", token ? "Present" : "Missing");

      const res = await axios.get(
        `${API_BASE_URL}/superadmin/restaurants`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      console.log("Restaurants response:", res.data);
      console.log("Response status:", res.status);

      setRestaurants(res.data);

    } catch (err) {
      console.error("Fetch restaurants error:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage = err.response?.data?.message || "Failed to fetch restaurants";
          console.error("Server error:", errorMessage);
          alert(`${errorMessage} (Status: ${err.response.status})`);
        } else if (err.request) {
          console.error("No response received:", err.request);
          alert("Cannot connect to server. Please check your internet connection.");
        } else {
          console.error("Request setup error:", err.message);
          alert(`Error: ${err.message}`);
        }
      } else {
        console.error("Non-Axios error:", err);
        alert(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (siteCode, currentStatus) => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You are not logged in. Please login again.")
        navigate("/superadmin/login")
        return
      }

      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await axios.put(
        `${API_BASE_URL}/superadmin/restaurants/${siteCode.toUpperCase()}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh the restaurant list
      fetchRestaurants();

      // Show success message
      if (newStatus === "INACTIVE") {
        toast.success("Restaurant has been deactivated successfully.")
      } else {
        toast.success("Restaurant has been activated successfully.")
      }

    } catch (err) {
      console.error("Error toggling restaurant status:", err)
      const errorMessage = err.response?.data?.message || "Failed to update restaurant status"
      toast.error(errorMessage)
    }

  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {

    return (
      <div className="d-flex justify-content-center align-items-center" style={{height:"100vh"}}>
        <div className="spinner-border text-primary"/>
      </div>
    );

  }

  return (

    <div className="container-fluid p-4" style={{background:"#f8fafc", minHeight:"100vh"}}>

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-bold">Restaurants</h3>
          <p className="text-muted mb-0">
            Manage all restaurants on your platform
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


      {/* STATS */}

      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="text-muted">Total Restaurants</h6>
            <h3 className="fw-bold">{restaurants.length}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="text-muted">Active</h6>
            <h3 className="fw-bold">
              {restaurants.filter(r => r.status === "ACTIVE").length}
            </h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="text-muted">Inactive</h6>
            <h3 className="fw-bold">
              {restaurants.filter(r => r.status !== "ACTIVE").length}
            </h3>
          </div>
        </div>

      </div>


      {/* SEARCH */}

      <div className="card border-0 shadow-sm mb-4 p-3">

        <div className="input-group">

          <span className="input-group-text">
            <FaSearch/>
          </span>

          <input
            type="text"
            className="form-control"
            placeholder="Search restaurant..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

        </div>

      </div>


      {/* TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">

              <tr>
                <th>Restaurant</th>
                <th>Site Code</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredRestaurants.map((restaurant) => (

                <tr key={restaurant._id}>

                  <td>

                    <div className="d-flex align-items-center gap-3">

                      <div
                        style={{
                          width:"40px",
                          height:"40px",
                          borderRadius:"10px",
                          background:"#6366f1",
                          color:"white",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center"
                        }}
                      >
                        <FaBuilding/>
                      </div>

                      <strong>{restaurant.name}</strong>

                    </div>

                  </td>

                  <td>
                    <span className="badge bg-primary">
                      {restaurant.siteCode}
                    </span>
                  </td>

                  <td>{restaurant.email}</td>

                  <td>

                    <span
                      className={`badge ${
                        restaurant.status === "ACTIVE"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {restaurant.status}
                    </span>

                  </td>

                  <td>

                    <div className="d-flex gap-2">

                      {/* Customer Link Button */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          // Remove /api suffix from API_BASE_URL for user-facing links
                          const baseUrl = API_BASE_URL.replace('/api', '');
                          const link = `${baseUrl}?siteCode=${restaurant.siteCode}`;
                          navigator.clipboard.writeText(link);
                          toast.success("Customer Link copied to clipboard!")
                        }}
                        title="Copy Customer Link"
                      >
                        <FaCopy/>
                      </button>

                      {/* Admin Link Button */}
                      {/* <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          // Remove /api suffix from API_BASE_URL for user-facing links
                          const baseUrl = API_BASE_URL.replace('/api', '');
                          const link = `${baseUrl}/admin?siteCode=${restaurant.siteCode}`;
                          navigator.clipboard.writeText(link);
                          alert(`Admin Login Link copied: ${link}`);
                        }}
                        title="Copy Admin Login Link"
                      >
                        <FaPowerOff/>
                      </button> */}

                      {/* Deactivate Button */}
                      {restaurant.status === "ACTIVE" ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to deactivate "${restaurant.name}"?`)) {
                              toggleRestaurantStatus(restaurant.siteCode, restaurant.status);
                            }
                          }}
                          title="Deactivate Restaurant"
                        >
                          <FaBan/>
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => {
                            toggleRestaurantStatus(restaurant.siteCode, restaurant.status);
                          }}
                          title="Activate Restaurant"
                        >
                          <FaPowerOff/>
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};

export default ViewRestaurants;