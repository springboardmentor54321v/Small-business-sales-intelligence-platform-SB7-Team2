import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import api from "../api";
import "./Dashboard.css";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);


function Dashboard() {
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);
const [dateRange, setDateRange] = useState("This Month");
const [category, setCategory] = useState("All");
const [selectedProduct, setSelectedProduct] = useState(null);
useEffect(() => {

  const fetchDashboard = async () => {

    try {

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

  fetchDashboard();

}, []);

if (loading) {
  return (
    <div className="dashboard">
      <div className="loading">
        Loading Dashboard...
      </div>
    </div>
  );
}

if (!dashboardData) {
  return (
    <div className="dashboard">

      <div className="empty-state">

        <h2>No Dashboard Data</h2>

        <p>
          Please upload sales data or connect the backend server.
        </p>

      </div>

    </div>
  );
}
  const salesTrend = {
    labels: (dashboardData.recentSales || []).map(
      (sale) => new Date(sale.sale_date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Recent Sales",
        data: (dashboardData.recentSales || []).map(
          (sale) => sale.total_amount
        ),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#ffffff",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const products = {
    labels: (dashboardData.topSellingProducts || []).map(
      (item) => item.product_name
    ),
    datasets: [
      {
        label: "Top Products",
        data: (dashboardData.topSellingProducts || []).map(
          (item) => item.total_quantity_sold
        ),
        backgroundColor: [
          "#6366f1",
          "#818cf8",
          "#a5b4fc",
          "#c7d2fe",
          "#e0e7ff",
          "#4f46e5",
        ],
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "500"
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 10
          }
        },
        grid: {
          color: "rgba(255, 255, 255, 0.03)"
        }
      },
      y: {
        ticks: {
          color: "#64748b",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 10
          }
        },
        grid: {
          color: "rgba(255, 255, 255, 0.03)"
        }
      }
    }
  };



  return(

  <div className="dashboard">

      <h1>Sales Dashboard</h1>

      <div className="filters">

        <div className="filter-group">
          <label>Date Range</label>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Groceries</option>
            <option>Clothing</option>
          </select>
        </div>

      </div>

      <div className="cards">


        <div className="card">

          <h3>
            Total Revenue
          </h3>

          <h2>
            ₹{dashboardData.totalRevenue}
          </h2>

          <p>
            Monthly Revenue
          </p>

        </div>



        <div className="card">

          <h3>
            Total Sales
          </h3>

          <h2>
            {dashboardData.totalSales}
          </h2>

          <p>
            Transactions
          </p>

        </div>



        <div className="card">

          <h3>
            Top Product
          </h3>

          <h2>
            {dashboardData.topSellingProducts?.[0]?.product_name || "N/A"}
          </h2>

          <p>
            Best selling item
          </p>

        </div>


      </div>




      <div className="charts">


        <div className="chart-box">

          <h2>
            Daily Sales Trend
          </h2>


          <Line
            data={salesTrend}
            options={chartOptions}
          />

        </div>




       <div className="chart-box">

  <h2>Top Products</h2>

  <Pie
    data={products}
    options={{
      ...chartOptions,
      onClick: (_, elements) => {
        if (!elements.length) return;

        const index = elements[0].index;
        setSelectedProduct(dashboardData.topSellingProducts[index]);
      },
    }}
  />

  {selectedProduct && (
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #38bdf8",
        borderRadius: "10px",
      }}
    >
      <h3>Selected Product</h3>

      <p><b>Name:</b> {selectedProduct.product_name}</p>
      <p><b>Units Sold:</b> {selectedProduct.total_quantity_sold}</p>
      <p><b>Revenue:</b> ₹{selectedProduct.total_revenue}</p>
    </div>
  )}

</div>


            </div>

      {selectedProduct && (
        <div className="chart-box">

          <h2>Product Details</h2>

          <table>
            <tbody>

              <tr>
                <td><strong>Product Name</strong></td>
                <td>{selectedProduct.product_name}</td>
              </tr>

              <tr>
                <td><strong>Units Sold</strong></td>
                <td>{selectedProduct.total_quantity_sold}</td>
              </tr>

              <tr>
                <td><strong>Total Revenue</strong></td>
                <td>₹{selectedProduct.total_revenue}</td>
              </tr>

              {selectedProduct.category_name && (
                <tr>
                  <td><strong>Category</strong></td>
                  <td>{selectedProduct.category_name}</td>
                </tr>
              )}

            </tbody>
          </table>

        </div>
      )}

      <div className="chart-box">

        <h2>Recent Sales</h2>

  <table>

    <thead>

      <tr>
        <th>Invoice</th>
        <th>Customer</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>

    </thead>

    <tbody>

      {(dashboardData.recentSales || []).map((sale) => (

        <tr key={sale.sale_id}>

          <td>{sale.invoice_no}</td>
          <td>{sale.customer_name}</td>
          <td>₹{sale.total_amount}</td>
          <td>{sale.payment_status}</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>


    </div>

  );


}


export default Dashboard;
