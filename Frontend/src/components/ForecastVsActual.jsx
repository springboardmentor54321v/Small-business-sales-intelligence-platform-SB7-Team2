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

function ForecastVsActual() {
  const salesData = [
    { month: "Jan", actual: 120000, forecast: 118000 },
    { month: "Feb", actual: 132000, forecast: 130000 },
    { month: "Mar", actual: 128000, forecast: 135000 },
    { month: "Apr", actual: 145000, forecast: 142000 },
    { month: "May", actual: 155000, forecast: 150000 },
    { month: "Jun", actual: 162000, forecast: 160000 },
  ];

  const totalActual = salesData.reduce((sum, item) => sum + item.actual, 0);
  const totalForecast = salesData.reduce((sum, item) => sum + item.forecast, 0);

  const accuracy = (
    (Math.min(totalActual, totalForecast) /
      Math.max(totalActual, totalForecast)) *
    100
  ).toFixed(1);

  const chartData = {
    labels: salesData.map((item) => item.month),
    datasets: [
      {
        label: "Actual Sales",
        data: salesData.map((item) => item.actual),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.15)",
        borderWidth: 3,
        tension: 0.4,
      },
      {
        label: "Forecast Sales",
        data: salesData.map((item) => item.forecast),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        borderDash: [8, 5],
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
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      y: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };

  return (
    <div className="forecast-page">
      <div className="forecast-header">
        <h1>📈 Forecast vs Actual</h1>
        <p>Compare AI predicted sales with actual business performance.</p>
      </div>

      <div className="forecast-cards">
        <div className="forecast-card">
          <h3>Total Actual Sales</h3>
          <h2>₹{totalActual.toLocaleString()}</h2>
        </div>

        <div className="forecast-card">
          <h3>Total Forecast Sales</h3>
          <h2>₹{totalForecast.toLocaleString()}</h2>
        </div>

        <div className="forecast-card">
          <h3>Forecast Accuracy</h3>
          <h2>{accuracy}%</h2>
        </div>
      </div>

      <div className="forecast-chart-box">
        <h2>Forecast vs Actual Sales</h2>

        <div style={{ height: "420px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default ForecastVsActual;