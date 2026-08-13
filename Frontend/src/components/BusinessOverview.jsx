import { useEffect, useState } from "react";
import api from "../api";
import "./BusinessOverview.css";

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
        const [
          dashboardResponse,
          revenueResponse,
          topSellingResponse,
        ] = await Promise.all([
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
    return (
      <div className="page">
        Loading dashboard...
      </div>
    );
  }

  /* =========================================================
     THEME DETECTION
  ========================================================= */

  const isLightMode =
    document.querySelector(".app")?.classList.contains("light");

  const chartTextColor = isLightMode
    ? "#475569"
    : "#94a3b8";

  const chartTitleColor = isLightMode
    ? "#0f172a"
    : "#f8fafc";

  const chartGridColor = isLightMode
    ? "rgba(15, 23, 42, 0.10)"
    : "rgba(148, 163, 184, 0.16)";

  /* =========================================================
     REVENUE CHART DATA
  ========================================================= */

  const revenueChartData = {
    labels: monthlyRevenue.map(
      (item) =>
        item.month_name ||
        item.month ||
        ""
    ),

    datasets: [
      {
        label: "Monthly Revenue",

        data: monthlyRevenue.map(
          (item) =>
            Number(item.total_revenue || 0)
        ),

        borderColor: "#38bdf8",

        backgroundColor:
          "rgba(56, 189, 248, 0.15)",

        borderWidth: 3,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor: "#38bdf8",

        pointBorderColor: isLightMode
          ? "#ffffff"
          : "#0d1422",

        pointBorderWidth: 2,

        tension: 0.35,

        fill: true,
      },
    ],
  };

  /* =========================================================
     TOP PRODUCTS CHART DATA
  ========================================================= */

  const topProductsChartData = {
    labels: topProducts.map(
      (item) =>
        item.product_name ||
        "Unknown Product"
    ),

    datasets: [
      {
        label: "Quantity Sold",

        data: topProducts.map(
          (item) =>
            Number(
              item.total_quantity_sold || 0
            )
        ),

        backgroundColor: "#22c55e",

        borderColor: "#16a34a",

        borderWidth: 1,

        borderRadius: 6,

        maxBarThickness: 48,
      },
    ],
  };

  /* =========================================================
     CHART OPTIONS
  ========================================================= */

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 700,
    },

    plugins: {
      legend: {
        display: true,

        position: "top",

        labels: {
          display: true,

          color: chartTextColor,

          font: {
            family:
              "Inter, ui-sans-serif, system-ui, sans-serif",

            size: 13,

            weight: "500",
          },

          padding: 18,

          usePointStyle: true,

          pointStyle: "circle",
        },
      },

      tooltip: {
        enabled: true,

        backgroundColor: isLightMode
          ? "#ffffff"
          : "#0d1422",

        titleColor: chartTitleColor,

        bodyColor: chartTextColor,

        borderColor: isLightMode
          ? "#dbe4ef"
          : "#1b2638",

        borderWidth: 1,

        padding: 12,

        titleFont: {
          family:
            "Inter, ui-sans-serif, system-ui, sans-serif",

          size: 13,

          weight: "600",
        },

        bodyFont: {
          family:
            "Inter, ui-sans-serif, system-ui, sans-serif",

          size: 12,
        },
      },
    },

    scales: {
      x: {
        display: true,

        ticks: {
          display: true,

          color: chartTextColor,

          font: {
            family:
              "Inter, ui-sans-serif, system-ui, sans-serif",

            size: 11,

            weight: "500",
          },

          padding: 8,

          maxRotation: 45,

          minRotation: 0,

          autoSkip: false,
        },

        grid: {
          display: true,

          color: chartGridColor,

          drawBorder: false,
        },

        border: {
          display: false,
        },
      },

      y: {
        display: true,

        beginAtZero: true,

        ticks: {
          display: true,

          color: chartTextColor,

          font: {
            family:
              "Inter, ui-sans-serif, system-ui, sans-serif",

            size: 11,

            weight: "500",
          },

          padding: 8,

          callback: function (value) {
            return (
              "₹" +
              Number(value).toLocaleString(
                "en-IN"
              )
            );
          },
        },

        grid: {
          display: true,

          color: chartGridColor,

          drawBorder: false,
        },

        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="business-overview-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="business-overview-header">

        <div>

          <span className="section-eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h1>
            Business Overview
          </h1>

          <p>
            Monitor revenue, invoices, customers
            and product performance across your
            business.
          </p>

        </div>

        <button
          className="overview-refresh"
          onClick={() =>
            window.location.reload()
          }
        >
          Refresh
        </button>

      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="business-overview-stats">

        {/* Revenue */}

        <div className="overview-stat-card">

          <div className="stat-card-top">
            <span>Revenue</span>
          </div>

          <p>
            Total Revenue
          </p>

          <h2>
            ₹
            {Number(
              dashboard?.totalRevenue ?? 0
            ).toLocaleString("en-IN")}
          </h2>

          <small>
            Current reporting period
          </small>

        </div>

        {/* Invoices */}

        <div className="overview-stat-card">

          <div className="stat-card-top">
            <span>Invoices</span>
          </div>

          <p>
            Total Invoices
          </p>

          <h2>
            {dashboard?.totalInvoices ?? 0}
          </h2>

          <small>
            Recorded invoices
          </small>

        </div>

        {/* Customers */}

        <div className="overview-stat-card">

          <div className="stat-card-top">
            <span>Customers</span>
          </div>

          <p>
            Total Customers
          </p>

          <h2>
            {dashboard?.totalCustomers ?? 0}
          </h2>

          <small>
            Registered customers
          </small>

        </div>

        {/* Inventory */}

        <div className="overview-stat-card">

          <div className="stat-card-top">
            <span>Inventory</span>
          </div>

          <p>
            Low Stock Products
          </p>

          <h2>
            {dashboard?.lowStockProducts ?? 0}
          </h2>

          <small>
            Products requiring attention
          </small>

        </div>

      </section>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <section className="overview-chart-grid">

        {/* =================================================
            MONTHLY REVENUE
        ================================================= */}

        <div className="overview-chart-card overview-chart-large">

          <div className="chart-card-header">

            <div>

              <span className="section-eyebrow">
                REVENUE PERFORMANCE
              </span>

              <h2>
                Monthly Revenue
              </h2>

              <p>
                Revenue movement across the
                reporting period.
              </p>

            </div>

          </div>

          <div className="overview-chart-area">

            {monthlyRevenue.length > 0 ? (

              <Line
                data={revenueChartData}
                options={chartOptions}
              />

            ) : (

              <div className="overview-empty">
                No revenue data available.
              </div>

            )}

          </div>

        </div>

        {/* =================================================
            TOP SELLING PRODUCTS
        ================================================= */}

        <div className="overview-chart-card">

          <div className="chart-card-header">

            <div>

              <span className="section-eyebrow">
                PRODUCT PERFORMANCE
              </span>

              <h2>
                Top Selling Products
              </h2>

              <p>
                Products ranked by quantity sold.
              </p>

            </div>

          </div>

          <div className="overview-chart-area">

            {topProducts.length > 0 ? (

              <Bar
                data={topProductsChartData}
                options={chartOptions}
              />

            ) : (

              <div className="overview-empty">
                No top selling products
                available.
              </div>

            )}

          </div>

        </div>

      </section>

    </div>
  );
}

export default BusinessOverview;