import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import {
  FaStore,
  FaChartLine,
  FaShoppingCart,
  FaRupeeSign,
  FaArrowLeft
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const SuperAdminAnalytics = () => {

  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    ordersToday: 0,
    revenueToday: 0
  });

  const [loading, setLoading] = useState(true);

  const chartData = [
    { day: "Mon", orders: 40 },
    { day: "Tue", orders: 55 },
    { day: "Wed", orders: 70 },
    { day: "Thu", orders: 65 },
    { day: "Fri", orders: 95 },
   { day: "Sat", orders: 120 },
     { day: "Sun", orders: 110 }
  ];

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
    
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/superadmin/login");
        return;
      }

      console.log("Fetching analytics data...");
      console.log("API URL:", `${API_BASE_URL}/superadmin/analytics`);
      console.log("Token:", token ? "Present" : "Missing");
      
      const res = await axios.get(
        `${API_BASE_URL}/superadmin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      console.log("Analytics response:", res.data);
      console.log("Response status:", res.status);

      setAnalytics({
        totalRestaurants: res.data.totalRestaurants || 0,
        activeRestaurants: res.data.activeRestaurants || 0,
        ordersToday: res.data.ordersToday || 0,
        revenueToday: res.data.revenueToday || 0
      });

    } catch (err) {

      console.error("Error fetching analytics:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Try to get error message
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
          console.error("Server error:", err.response?.data?.message || "Unknown error");
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Request setup error:", err.message);
        }
      }

      // Still set default data so the page doesn't break
      setAnalytics({
        totalRestaurants: 0,
        activeRestaurants: 0,
        ordersToday: 0,
        revenueToday: 0
      });

    } finally {

      setLoading(false);

    }

  };

  const StatCard = ({ title, value, icon, color }) => (

    <div className="card border-0 shadow-sm h-100">

      <div className="card-body d-flex align-items-center">

        <div
          className="me-3 d-flex align-items-center justify-content-center"
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "12px",
            background: color,
            color: "white",
            fontSize: "20px"
          }}
        >
          {icon}
        </div>

        <div>
          <p className="text-muted mb-1">{title}</p>
          <h4 className="fw-bold">{value}</h4>
        </div>

      </div>

    </div>

  );

  if (loading) {

    return (
      <div className="d-flex justify-content-center align-items-center" style={{height:"100vh"}}>
        <div className="spinner-border text-primary"/>
      </div>
    );

  }

  return (

    <div className="container-fluid p-4" style={{background:"#f8fafc",minHeight:"100vh"}}>

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h3 className="fw-bold">Platform Analytics</h3>

          <p className="text-muted mb-0">
            Monitor orders, revenue and restaurant activity
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

      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <StatCard
            title="Restaurants"
            value={analytics.totalRestaurants}
            icon={<FaStore/>}
            color="#6366f1"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            title="Active"
            value={analytics.activeRestaurants}
            icon={<FaChartLine/>}
            
            color="#22c55e"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            title="Orders Today"
            value={analytics.ordersToday}
            icon={<FaShoppingCart/>}
            color="#f59e0b"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            title="Revenue"
            value={`₹${analytics.revenueToday}`}
            icon={<FaRupeeSign/>}
            color="#06b6d4"
          />
        </div>

      </div>


      {/* CHART */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            Weekly Orders
          </h5>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={chartData}>

              <XAxis dataKey="day"/>

              <YAxis/>

              <Tooltip/>

              <Bar
                dataKey="orders"
                fill="#6366f1"
                radius={[6,6,0,0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );

};

export default SuperAdminAnalytics;