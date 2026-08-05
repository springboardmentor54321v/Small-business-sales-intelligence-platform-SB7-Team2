import { useEffect, useState } from "react";
import api from "../api";
import "./Milestone3.css";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function BusinessOverview() {
  const [dashboard, setDashboard] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, revenueResponse, topSellingResponse] =
          await Promise.all([
            api.get("/api/dashboard"),
            api.get("/api/dashboard/monthly-revenue"),
            api.get("/api/dashboard/top-selling"),
          ]);

        setDashboard(dashboardResponse.data.dashboard);

        setMonthlyRevenue(
          revenueResponse.data.monthlyRevenue || []
        );

        setTopProducts(
          topSellingResponse.data.topSellingProducts || []
        );

        
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="page">Loading dashboard...</div>;
  }

  const revenueChartData = {
    labels: monthlyRevenue.map((item) => item.month_name),
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthlyRevenue.map((item) => item.total_revenue),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topProductsChartData = {
    labels: topProducts.map((item) => item.product_name),
    datasets: [
      {
        label: "Quantity Sold",
        data: topProducts.map((item) => item.total_quantity_sold),
        backgroundColor: "#22c55e",
      },
    ],
  };

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#ffffff",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#ffffff",
      },
      grid: {
        color: "#334155",
      },
    },
    y: {
      ticks: {
        color: "#ffffff",
      },
      grid: {
        color: "#334155",
      },
    },
  },
};

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Business Overview</h1>
        <p>Complete business performance dashboard.</p>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <h2>₹{dashboard?.totalRevenue ?? 0}</h2>
        </div>

        <div className="card">
          <h3>Total Invoices</h3>
          <h2>{dashboard?.totalInvoices ?? 0}</h2>
        </div>

        <div className="card">
          <h3>Total Customers</h3>
          <h2>{dashboard?.totalCustomers ?? 0}</h2>
        </div>

        <div className="card">
          <h3>Low Stock Products</h3>
          <h2>{dashboard?.lowStockProducts ?? 0}</h2>
        </div>
      </div>

      <div className="chart-box large-chart">
        <h2>Revenue Analytics</h2>

        {monthlyRevenue.length > 0 ? (
          <Line
            data={revenueChartData}
            options={chartOptions}
          />
        ) : (
          <p>No revenue data available..</p>
        )}
      </div>

      <div
        className="chart-box"
        style={{ height: "420px", marginTop: "30px" }}
      >
        <h2>Top Selling Products</h2>

        {topProducts.length > 0 ? (
          <Bar
            data={topProductsChartData}
            options={chartOptions}
          />
        ) : (
          <p>No top selling products available.</p>
        )}
      </div>
    </div>
  );
}

export default BusinessOverview;