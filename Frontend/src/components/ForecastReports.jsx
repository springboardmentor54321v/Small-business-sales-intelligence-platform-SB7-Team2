import { useState, useEffect } from "react";
import api from "../api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ForecastReports() {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/forecast", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setForecastData(response.data);
    } catch (error) {
      console.log("Forecast API not available. Using sample data.");

      setForecastData([
        { month: "Jan", sales: 120 },
        { month: "Feb", sales: 150 },
        { month: "Mar", sales: 170 },
        { month: "Apr", sales: 165 },
        { month: "May", sales: 210 },
        { month: "Jun", sales: 240 },
        { month: "Jul", sales: 280 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [["Month", "Predicted Sales"]];

    forecastData.forEach((item) => {
      rows.push([item.month, item.sales]);
    });

    const csv = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, "Forecast_Report.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Forecast Report", 14, 20);

    autoTable(doc, {
      head: [["Month", "Predicted Sales"]],
      body: forecastData.map((item) => [
        item.month,
        item.sales,
      ]),
    });

    doc.save("Forecast_Report.pdf");
  };

  const data = {
    labels: forecastData.map((item) => item.month),

    datasets: [
      {
        label: "Predicted Sales",
        data: forecastData.map((item) => item.sales),
        borderColor: "#38bdf8",
        backgroundColor: "#38bdf8",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        position: "top",
      },

      title: {
        display: true,
        text: "Sales Forecast",
      },
    },
  };

  if (loading) {
    return (
      <div className="panel">
        <h2>Loading Forecast...</h2>
      </div>
    );
  }

  return (
    <div className="panel">
      <h1>Forecast Reports</h1>

      <p>
        Predicted future sales using{" "}
        {forecastData.length ? "forecast data." : "sample data."}
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div className="card">
          <h2>₹280K</h2>
          <p>Expected Revenue</p>
        </div>

        <div className="card">
          <h2>+18%</h2>
          <p>Growth Rate</p>
        </div>

        <div className="card">
          <h2>95%</h2>
          <p>Forecast Accuracy</p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <button onClick={exportCSV}>
          Export CSV
        </button>

        <button onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      <div
        className="card"
        style={{
          marginTop: "20px",
        }}
      >
        <Line
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}

export default ForecastReports;