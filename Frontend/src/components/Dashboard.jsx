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
useEffect(() => {

  const fetchDashboard = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await api.get("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

     console.log("Dashboard Response:", response.data);
console.log("Dashboard Data:", response.data.dashboard);

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
    (sale) =>
      new Date(sale.sale_date).toLocaleDateString()
  ),

  datasets: [

    {

      label: "Recent Sales",

      data: (dashboardData.recentSales || []).map(
        (sale) => sale.total_amount
      ),

      borderColor: "#38bdf8",

      backgroundColor: "#38bdf8",

      pointBackgroundColor: "#ffffff",

      pointBorderColor: "#38bdf8",

      borderWidth: 3,

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
        "#38bdf8",
        "#22c55e",
        "#facc15",
        "#f97316",
        "#ef4444",
        "#8b5cf6",
      ],

      borderColor: "#ffffff",

      borderWidth: 2,

    },

  ],

};


  const chartOptions={

    plugins:{

      legend:{

        labels:{

          color:"#ffffff"

        }

      }

    },


    scales:{

      x:{

        ticks:{
          color:"#ffffff"
        },

        grid:{
          color:"#334155"
        }

      },


      y:{

        ticks:{
          color:"#ffffff"
        },

        grid:{
          color:"#334155"
        }

      }

    }

  };



  return(

    <div className="dashboard">


      <h1>
        Sales Dashboard
      </h1>



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

          <h2>
            Top Products
          </h2>


          <Pie
            data={products}
            options={chartOptions}
          />


        </div>


      </div>
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
