import "./Milestone3.css";
import { useState } from "react";
import { aiApi } from "../api";
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

function ForecastVsActual() {
  const [quantity, setQuantity] = useState(5);
  const [discount, setDiscount] = useState(0.2);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());

  const [actualSales, setActualSales] = useState(15000);

  const [forecastSales, setForecastSales] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const response = await aiApi.get("/predict", {
        params: {
          quantity,
          discount,
          year,
          month,
          day,
        },
      });

      setForecastSales(response.data["Predicted Sales"]);

    } catch (err) {

      console.error(err);

      setError(
        err.formattedMessage ||
        "Unable to retrieve prediction."
      );

    } finally {

      setLoading(false);

    }
  };

  const variance =
    forecastSales !== null
      ? forecastSales - actualSales
      : 0;

  const accuracy =
    forecastSales !== null && actualSales > 0
      ? Math.max(
          0,
          100 -
            (Math.abs(variance) /
              actualSales) *
              100
        )
      : 0;

  const chartData = {
    labels: ["Forecast", "Actual"],

    datasets: [
      {
        label: "Sales",

        data: [
          forecastSales ?? 0,
          actualSales,
        ],

        borderColor: "#38bdf8",

        backgroundColor:
          "rgba(56,189,248,0.15)",

        borderWidth: 3,

        tension: 0.4,
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
        color: "rgba(255,255,255,0.1)",
      },
    },
    y: {
      ticks: {
        color: "#ffffff",
      },
      grid: {
        color: "rgba(255,255,255,0.1)",
      },
    },
  },
};

  return (
  <div className="forecast-page">

    <div className="forecast-header">
      <h1>📈 Forecast vs Actual</h1>
      <p>
        Compare AI predicted sales with actual business performance.
      </p>
    </div>

    {/* Input Form */}

    <form
      onSubmit={handlePredict}
      className="forecast-card"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "15px",
        marginBottom: "30px",
      }}
    >

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e)=>setQuantity(Number(e.target.value))}
      />

      <input
        type="number"
        step="0.01"
        placeholder="Discount"
        value={discount}
        onChange={(e)=>setDiscount(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Actual Sales"
        value={actualSales}
        onChange={(e)=>setActualSales(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e)=>setYear(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Month"
        value={month}
        onChange={(e)=>setMonth(Number(e.target.value))}
      />

      <input
        type="number"
        placeholder="Day"
        value={day}
        onChange={(e)=>setDay(Number(e.target.value))}
      />

      <button
        type="submit"
        style={{
          gridColumn:"span 3"
        }}
      >
        {loading ? "Predicting..." : "Run Prediction"}
      </button>

    </form>

    {error && (
      <p style={{color:"red"}}>
        {error}
      </p>
    )}

    {/* KPI Cards */}

    <div className="forecast-cards">

      <div className="forecast-card">
        <h3>Forecast Sales</h3>

        <h2>
          ₹
          {forecastSales !== null
            ? forecastSales.toLocaleString("en-IN")
            : "--"}
        </h2>

      </div>

      <div className="forecast-card">
        <h3>Actual Sales</h3>

        <h2>
          ₹{actualSales.toLocaleString("en-IN")}
        </h2>

      </div>

      <div className="forecast-card">
        <h3>Variance</h3>

        <h2>
          ₹{variance.toFixed(2)}
        </h2>

      </div>

      <div className="forecast-card">
        <h3>Accuracy</h3>

        <h2>
          {accuracy.toFixed(1)}%
        </h2>

      </div>

    </div>

    {/* Chart */}

    <div className="forecast-chart-box">

      <h2>Forecast vs Actual</h2>

      <div style={{height:"420px"}}>

        <Line
          data={chartData}
          options={chartOptions}
        />

      </div>

    </div>

  </div>
);
}

export default ForecastVsActual;