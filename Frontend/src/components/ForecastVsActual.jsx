import { useState } from "react";
import { aiApi } from "../api";
import { Bar } from "react-chartjs-2";
import "./ForecastVsActual.css";

import {
  BrainCircuit,
  TrendingUp,
  Target,
  Activity,
  CalendarDays,
  Package,
  Percent,
  IndianRupee,
  Play,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

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
        err.formattedMessage || "Unable to retrieve prediction."
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
            (Math.abs(variance) / actualSales) * 100
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
      backgroundColor: [
        "rgba(56, 189, 248, 0.75)",
        "rgba(74, 222, 128, 0.75)",
      ],
      borderColor: [
        "#38bdf8",
        "#4ade80",
      ],
      borderWidth: 1,
      borderRadius: 8,
      barThickness: 70,
    },
  ],
};

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      backgroundColor: "#0b1423",
      borderColor: "#29405e",
      borderWidth: 1,
      titleColor: "#f8fafc",
      bodyColor: "#a8b7c9",
      padding: 10,

      callbacks: {
        label: (context) =>
          ` ₹${Number(context.raw).toLocaleString("en-IN")}`,
      },
    },
  },

  scales: {
    x: {
      ticks: {
        color: "#91a3ba",
        font: {
          size: 11,
          weight: "600",
        },
      },

      grid: {
        display: false,
      },
    },

    y: {
      beginAtZero: true,

      ticks: {
        color: "#71849c",
        font: {
          size: 10,
        },

        callback: (value) =>
          `₹${Number(value).toLocaleString("en-IN")}`,
      },

      grid: {
        color: "rgba(148, 163, 184, 0.07)",
      },
    },
  },
};

  return (
    <div className="forecast-page">

      {/* HEADER */}
      <div className="forecast-header">

        <div>
          <div className="forecast-eyebrow">
            <BrainCircuit size={13} />
            AI BUSINESS INTELLIGENCE
          </div>

          <h1>Forecast vs Actual</h1>

          <p>
            Compare AI predicted sales against actual business
            performance to understand forecast accuracy and variance.
          </p>
        </div>

        <div className="forecast-status">
          <span />
          FORECAST ENGINE READY
        </div>

      </div>

      {/* KPI SUMMARY */}
      <div className="forecast-summary-grid">

        <div className="forecast-summary-card">
          <div className="forecast-summary-icon blue">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Forecast Sales</span>
            <strong>
              {forecastSales !== null
                ? `₹${Number(forecastSales).toLocaleString("en-IN")}`
                : "--"}
            </strong>
            <small>AI predicted revenue</small>
          </div>
        </div>

        <div className="forecast-summary-card">
          <div className="forecast-summary-icon purple">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Actual Sales</span>
            <strong>
              ₹{Number(actualSales).toLocaleString("en-IN")}
            </strong>
            <small>Recorded business performance</small>
          </div>
        </div>

        <div className="forecast-summary-card">
          <div className="forecast-summary-icon amber">
            <Activity size={19} />
          </div>

          <div>
            <span>Variance</span>
            <strong>
              {forecastSales !== null
                ? `₹${variance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}`
                : "--"}
            </strong>
            <small>Forecast minus actual</small>
          </div>
        </div>

        <div className="forecast-summary-card">
          <div className="forecast-summary-icon green">
            <Target size={19} />
          </div>

          <div>
            <span>Accuracy</span>
            <strong>
              {forecastSales !== null
                ? `${accuracy.toFixed(1)}%`
                : "--"}
            </strong>
            <small>Forecast performance score</small>
          </div>
        </div>

      </div>

      {/* WORKSPACE HEADER */}
      <div className="forecast-section-header">

        <div>
          <span>FORECAST ANALYSIS</span>
          <h2>Configure Comparison Parameters</h2>
        </div>

      </div>

      {/* INPUT + OUTPUT */}
      <div className="forecast-workspace">

        {/* INPUT */}
        <form
          className="forecast-input-card"
          onSubmit={handlePredict}
        >

          <div className="forecast-card-header">

            <div className="forecast-card-icon">
              <Activity size={19} />
            </div>

            <div>
              <span>MODEL PARAMETERS</span>
              <h3>Forecast Configuration</h3>
            </div>

          </div>

          <div className="forecast-field">

            <label>
              <Package size={13} />
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              required
            />

          </div>

          <div className="forecast-field">

            <label>
              <Percent size={13} />
              Discount
            </label>

            <div className="forecast-input-suffix">

              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number(e.target.value))
                }
                required
              />

              <span>
                {Math.round(discount * 100)}%
              </span>

            </div>

          </div>

          <div className="forecast-field">

            <label>
              <IndianRupee size={13} />
              Actual Sales
            </label>

            <input
              type="number"
              min="0"
              value={actualSales}
              onChange={(e) =>
                setActualSales(Number(e.target.value))
              }
              required
            />

          </div>

          <div className="forecast-field">

            <label>
              <CalendarDays size={13} />
              Forecast Date
            </label>

            <div className="forecast-date-grid">

              <div>
                <span>YEAR</span>

                <input
                  type="number"
                  value={year}
                  onChange={(e) =>
                    setYear(Number(e.target.value))
                  }
                  required
                />
              </div>

              <div>
                <span>MONTH</span>

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) =>
                    setMonth(Number(e.target.value))
                  }
                  required
                />
              </div>

              <div>
                <span>DAY</span>

                <input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) =>
                    setDay(Number(e.target.value))
                  }
                  required
                />
              </div>

            </div>

          </div>

          <button
            className="forecast-run-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={16}
                  className="forecast-spinner"
                />
                Predicting...
              </>
            ) : (
              <>
                <Play size={15} />
                Run Prediction
              </>
            )}
          </button>

        </form>

        {/* ANALYSIS */}
        <div className="forecast-analysis-card">

          <div className="forecast-card-header">

            <div className="forecast-card-icon analysis">
              <TrendingUp size={19} />
            </div>

            <div>
              <span>PERFORMANCE ANALYSIS</span>
              <h3>Forecast Performance</h3>
            </div>

          </div>

          {loading && (
            <div className="forecast-state">

              <div className="forecast-loading-icon">
                <LoaderCircle size={29} />
              </div>

              <h3>Running forecast model</h3>

              <p>
                Comparing the selected parameters against
                the machine learning model...
              </p>

            </div>
          )}

          {!loading && error && (
            <div className="forecast-state error">

              <div className="forecast-state-icon error">
                <AlertTriangle size={23} />
              </div>

              <h3>Prediction Failed</h3>

              <p>{error}</p>

            </div>
          )}

          {!loading &&
            !error &&
            forecastSales === null && (
              <div className="forecast-state">

                <div className="forecast-state-icon">
                  <Target size={23} />
                </div>

                <h3>Awaiting Forecast</h3>

                <p>
                  Configure the forecast parameters and run
                  the prediction model to compare results.
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            forecastSales !== null && (
              <div className="forecast-result">

                <div
                  className={`forecast-result-status ${
                    variance >= 0 ? "positive" : "negative"
                  }`}
                >
                  {variance >= 0 ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <AlertTriangle size={13} />
                  )}

                  {variance >= 0
                    ? "FORECAST ABOVE ACTUAL"
                    : "FORECAST BELOW ACTUAL"}
                </div>

                <div className="forecast-result-grid">

                  <div>
                    <span>FORECAST</span>
                    <strong>
                      ₹
                      {Number(forecastSales).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>ACTUAL</span>
                    <strong>
                      ₹
                      {Number(actualSales).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>ACCURACY</span>
                    <strong>
                      {accuracy.toFixed(1)}%
                    </strong>
                  </div>

                </div>

                <div className="forecast-variance">

                  <div className="forecast-variance-header">
                    <span>FORECAST VARIANCE</span>

                    <strong
                      className={
                        variance >= 0
                          ? "positive-text"
                          : "negative-text"
                      }
                    >
                      {variance >= 0 ? "+" : ""}
                      ₹
                      {Math.abs(variance).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </strong>
                  </div>

                  <div className="forecast-variance-track">

                    <div
                      className={
                        variance >= 0
                          ? "forecast-variance-progress positive"
                          : "forecast-variance-progress negative"
                      }
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            5,
                            Math.abs(variance / actualSales) * 100
                          )
                        )}%`,
                      }}
                    />

                  </div>

                  <p>
                    The variance represents the difference between
                    the AI forecast and recorded actual sales.
                  </p>

                </div>

              </div>
            )}

        </div>

      </div>

      {/* CHART */}
      <div className="forecast-chart-card">

        <div className="forecast-chart-header">

          <div>
            <span>VISUAL ANALYTICS</span>
            <h2>Forecast vs Actual Sales</h2>
          </div>

          <div className="chart-legend">
            <span className="legend-dot" />
            Sales Comparison
          </div>

        </div>

        <div className="forecast-chart">
          <Bar
  data={chartData}
  options={chartOptions}
/>
        </div>

      </div>

    </div>
  );
}

export default ForecastVsActual;