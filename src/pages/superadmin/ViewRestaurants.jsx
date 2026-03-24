import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaCopy,
  FaPowerOff,
  FaSearch,
  FaArrowLeft,
  FaBan,
  FaCheck
} from "react-icons/fa";
import { toast } from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";

const ViewRestaurants = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/superadmin/login");
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE_URL}/superadmin/restaurants`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRestaurants(res.data);
    } catch (err) {
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (siteCode, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await axios.put(
        `${API_BASE_URL}/superadmin/restaurants/${siteCode}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchRestaurants();
      toast.success(`Restaurant ${newStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const copyToClipboard = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied!");
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center p-4">
        <div>
          <h2 className="fw-bold mb-1">🍽 Restaurants</h2>
          <small className="text-muted">
            Manage your platform restaurants easily
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

      {/* STATS */}
      <div className="container mb-4">
        <div className="row g-3">
          {[
            { title: "Total", value: restaurants.length },
            {
              title: "Active",
              value: restaurants.filter(r => r.status === "ACTIVE").length
            },
            {
              title: "Inactive",
              value: restaurants.filter(r => r.status !== "ACTIVE").length
            }
          ].map((item, i) => (
            <div key={i} className="col-md-4">
              <div className="card shadow-sm border-0 p-3 text-center">
                <h6 className="text-muted">{item.title}</h6>
                <h3 className="fw-bold">{item.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH */}
      <div className="container mb-4">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search restaurants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CARDS UI */}
      <div className="container">
        <div className="row g-4">
          {filtered.map(r => (
            <div key={r._id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100 p-3">

                {/* TOP */}
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary text-white p-3 rounded me-3">
                    <FaBuilding />
                  </div>
                  <div>
                    <h5 className="mb-0">{r.name}</h5>
                    <small className="text-muted">{r.email}</small>
                  </div>
                </div>

                {/* STATUS */}
                <span
                  className={`badge mb-3 ${
                    r.status === "ACTIVE"
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {r.status}
                </span>

                {/* LINKS */}
                <div className="mb-2">
                  <small>Customer Link</small>
                  <div className="input-group input-group-sm">
                    <input
                      className="form-control"
                      value={`https://restaurant-manage-mdzr.vercel.app?siteCode=${r.siteCode}`}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        copyToClipboard(
                          `https://restaurant-manage-mdzr.vercel.app?siteCode=${r.siteCode}`,
                          r.siteCode + "c"
                        )
                      }
                    >
                      {copiedField === r.siteCode + "c" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <small>Admin Link</small>
                  <div className="input-group input-group-sm">
                    <input
                      className="form-control"
                      value={`https://restaurant-manage-mdzr.vercel.app/admin?siteCode=${r.siteCode}`}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-success"
                      onClick={() =>
                        copyToClipboard(
                          `https://restaurant-manage-mdzr.vercel.app/admin?siteCode=${r.siteCode}`,
                          r.siteCode + "a"
                        )
                      }
                    >
                      {copiedField === r.siteCode + "a" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                {/* ACTION */}
                <button
                  className={`btn ${
                    r.status === "ACTIVE"
                      ? "btn-outline-danger"
                      : "btn-outline-success"
                  }`}
                  onClick={() =>
                    toggleRestaurantStatus(r.siteCode, r.status)
                  }
                >
                  {r.status === "ACTIVE" ? (
                    <>
                      <FaBan className="me-1" /> Deactivate
                    </>
                  ) : (
                    <>
                      <FaPowerOff className="me-1" /> Activate
                    </>
                  )}
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewRestaurants;