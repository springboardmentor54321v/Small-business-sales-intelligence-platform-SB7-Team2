import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Package,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";

import api from "../api";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("This Month");
  const [category, setCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      setDashboardData(response.data.dashboard);
    } catch (error) {
      console.error("Dashboard API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page-state">
        <RefreshCw className="dashboard-loading-icon" size={25} />
        <h2>Loading dashboard</h2>
        <p>Preparing your business intelligence overview.</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-page-state">
        <BarChart3 size={34} />
        <h2>No dashboard data</h2>
        <p>
          Upload sales data or make sure the backend service is available.
        </p>

        <button
          className="dashboard-refresh-btn"
          onClick={fetchDashboard}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const recentSales = dashboardData.recentInvoices || [];
  const topSellingProducts =
    dashboardData.topSellingProducts || [];

  const totalRevenue =
    Number(dashboardData.totalRevenue) || 0;

  const totalSales =
    Number(dashboardData.totalSales) || 0;

  const topProduct =
    topSellingProducts.length > 0
      ? topSellingProducts[0].product_name
      : "No data";

  const salesTrend = {
    labels: recentSales.map((sale) =>
      new Date(sale.invoice_date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      )
    ),

    datasets: [
      {
        label: "Sales",

        data: recentSales.map(
          (sale) => Number(sale.total_amount) || 0
        ),

        borderColor: "#38bdf8",

        backgroundColor:
          "rgba(56, 189, 248, 0.08)",

        pointBackgroundColor: "#38bdf8",

        pointBorderColor: "#0b111d",

        pointBorderWidth: 2,

        pointRadius: 3,

        pointHoverRadius: 5,

        borderWidth: 2,

        tension: 0.4,

        fill: true,
      },
    ],
  };

  const productColors = [
    "#38bdf8",
    "#22c55e",
    "#f59e0b",
    "#a78bfa",
    "#f97316",
    "#ef4444",
  ];

  const productChartData = {
    labels: topSellingProducts.map(
      (item) => item.product_name
    ),

    datasets: [
      {
        label: "Units Sold",

        data: topSellingProducts.map(
          (item) =>
            Number(item.total_quantity_sold) || 0
        ),

        backgroundColor: productColors,

        borderColor: "#101827",

        borderWidth: 3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: "index",
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0b111d",

        borderColor: "#243149",

        borderWidth: 1,

        titleColor: "#f8fafc",

        bodyColor: "#94a3b8",

        padding: 12,

        displayColors: false,
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#64748b",

          font: {
            size: 10,
          },

          maxRotation: 0,
        },

        grid: {
          display: false,
        },

        border: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "#64748b",

          font: {
            size: 10,
          },
        },

        grid: {
          color:
            "rgba(100, 116, 139, 0.12)",
        },

        border: {
          display: false,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          color: "#94a3b8",

          padding: 14,

          usePointStyle: true,

          pointStyle: "circle",

          font: {
            size: 10,
          },
        },
      },

      tooltip: {
        backgroundColor: "#0b111d",

        borderColor: "#243149",

        borderWidth: 1,

        titleColor: "#f8fafc",

        bodyColor: "#94a3b8",

        padding: 12,
      },
    },
  };

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <div className="dashboard-eyebrow">

            <span className="dashboard-eyebrow-dot" />

            BUSINESS INTELLIGENCE

          </div>

          <h1>Sales Dashboard</h1>

          <p>
            Monitor revenue, sales performance and
            your highest-performing products.
          </p>

        </div>

        <button
          className="dashboard-refresh"
          onClick={fetchDashboard}
        >
          <RefreshCw size={15} />

          Refresh
        </button>

      </div>


      {/* FILTER BAR */}

      <div className="dashboard-toolbar">

        <div className="dashboard-toolbar-label">

          <CalendarDays size={15} />

          Reporting period

        </div>

        <div className="dashboard-filters">

          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value)
            }
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option>All</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Groceries</option>
            <option>Clothing</option>
          </select>

        </div>

      </div>


      {/* KPI CARDS */}

      <section className="dashboard-kpis">

        <div className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div className="dashboard-kpi-icon revenue">
              <Wallet size={18} />
            </div>

            <span className="dashboard-kpi-trend positive">
              <ArrowUpRight size={13} />

              Revenue
            </span>

          </div>

          <div className="dashboard-kpi-label">
            Total Revenue
          </div>

          <div className="dashboard-kpi-value">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>

          <div className="dashboard-kpi-footer">
            Current reporting period
          </div>

        </div>


        <div className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div className="dashboard-kpi-icon sales">
              <TrendingUp size={18} />
            </div>

            <span className="dashboard-kpi-trend positive">
              <ArrowUpRight size={13} />

              Sales
            </span>

          </div>

          <div className="dashboard-kpi-label">
            Total Sales
          </div>

          <div className="dashboard-kpi-value">
            {totalSales.toLocaleString("en-IN")}
          </div>

          <div className="dashboard-kpi-footer">
            Completed transactions
          </div>

        </div>


        <div className="dashboard-kpi-card">

          <div className="dashboard-kpi-top">

            <div className="dashboard-kpi-icon product">
              <Package size={18} />
            </div>

            <span className="dashboard-kpi-trend neutral">
              Top performer
            </span>

          </div>

          <div className="dashboard-kpi-label">
            Top Product
          </div>

          <div className="dashboard-kpi-product">
            {topProduct}
          </div>

          <div className="dashboard-kpi-footer">
            Highest sales volume
          </div>

        </div>

      </section>


      {/* CHARTS */}

      <section className="dashboard-chart-grid">

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="panel-label">
                SALES PERFORMANCE
              </span>

              <h2>Daily Sales Trend</h2>

            </div>

            <div className="panel-icon">
              <TrendingUp size={17} />
            </div>

          </div>

          <div className="dashboard-chart">

            {recentSales.length > 0 ? (
              <Line
                data={salesTrend}
                options={lineChartOptions}
              />
            ) : (
              <div className="chart-empty">
                No recent sales data available.
              </div>
            )}

          </div>

        </div>


        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="panel-label">
                PRODUCT PERFORMANCE
              </span>

              <h2>Top Products</h2>

            </div>

            <div className="panel-icon">
              <Package size={17} />
            </div>

          </div>

          <div className="dashboard-chart pie-chart">

            {topSellingProducts.length > 0 ? (
              <Pie
                data={productChartData}
                options={{
                  ...pieChartOptions,

                  onClick: (_, elements) => {

                    if (!elements.length) return;

                    const index =
                      elements[0].index;

                    setSelectedProduct(
                      topSellingProducts[index]
                    );

                  },
                }}
              />
            ) : (
              <div className="chart-empty">
                No product performance data available.
              </div>
            )}

          </div>

        </div>

      </section>


      {/* SELECTED PRODUCT */}

      {selectedProduct && (

        <div className="selected-product-card">

          <div>

            <span>SELECTED PRODUCT</span>

            <strong>
              {selectedProduct.product_name}
            </strong>

          </div>

          <div className="selected-product-stat">

            <span>Units Sold</span>

            <strong>
              {Number(
                selectedProduct.total_quantity_sold
              ).toLocaleString("en-IN")}
            </strong>

          </div>

          <button
            className="selected-product-close"
            onClick={() =>
              setSelectedProduct(null)
            }
          >
            Clear
          </button>

        </div>

      )}


      {/* SUMMARY */}

      <section className="dashboard-summary">

        <div className="dashboard-summary-card">

          <div className="summary-icon">
            <BarChart3 size={18} />
          </div>

          <div>

            <span>
              Performance overview
            </span>

            <strong>
              {recentSales.length} recent sales
              records
            </strong>

          </div>

        </div>


        <div className="dashboard-summary-card">

          <div className="summary-icon">
            <Package size={18} />
          </div>

          <div>

            <span>
              Product coverage
            </span>

            <strong>
              {topSellingProducts.length} products
              in ranking
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;