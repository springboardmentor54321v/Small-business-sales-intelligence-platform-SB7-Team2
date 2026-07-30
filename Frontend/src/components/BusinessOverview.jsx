import { useEffect, useState } from "react";
import api from "../api";
import "./Milestone3.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function BusinessOverview() {
  const [dashboard, setDashboard] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/dashboard");
        setDashboard(response.data.dashboard);

        const revenueResponse = await api.get("/api/dashboard/monthly-revenue");
        setMonthlyRevenue(revenueResponse.data.monthlyRevenue);
 
      } catch (error) {
        console.error("Error fetching dashboard:", error);
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
      tension: 0.3,
    },
  ],
};
  const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
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

      <div className="chart-box">
      <h2>Revenue Analytics</h2>
      <Line
        data={revenueChartData}
        options={chartOptions}
      />
      </div>
    </div>
  );
}

export default BusinessOverview;