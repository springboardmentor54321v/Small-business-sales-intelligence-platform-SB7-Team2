import { useState } from "react";
import { aiApi } from "../api";
import "./PredictSales.css";

import {
  BrainCircuit,
  Calculator,
  CalendarDays,
  Percent,
  Package,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

function PredictSales() {
  const [quantity, setQuantity] = useState(5);
  const [discount, setDiscount] = useState(0.2);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());

  const [predictedSales, setPredictedSales] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setPredictedSales(null);

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

      setPredictedSales(response.data["Predicted Sales"]);
    } catch (err) {
      console.error(err);

      setError(
        err.formattedMessage ||
          "Failed to retrieve sales prediction from ML model."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predict-page">

      {/* HEADER */}
      <div className="predict-header">
        <div>
          <div className="predict-eyebrow">
            <BrainCircuit size={13} />
            AI BUSINESS INTELLIGENCE
          </div>

          <h1>Sales Prediction Calculator</h1>

          <p>
            Estimate future sales using the trained machine learning model
            based on quantity, discount and transaction date parameters.
          </p>
        </div>

        <div className="model-status">
          <span />
          ML MODEL READY
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="predict-summary-grid">

        <div className="predict-summary-card">
          <div className="predict-summary-icon blue">
            <Package size={19} />
          </div>

          <div>
            <span>Quantity</span>
            <strong>{quantity}</strong>
            <small>Units being evaluated</small>
          </div>
        </div>

        <div className="predict-summary-card">
          <div className="predict-summary-icon purple">
            <Percent size={19} />
          </div>

          <div>
            <span>Discount</span>
            <strong>{Math.round(discount * 100)}%</strong>
            <small>Applied discount rate</small>
          </div>
        </div>

        <div className="predict-summary-card">
          <div className="predict-summary-icon green">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Prediction Status</span>
            <strong>
              {loading
                ? "Running"
                : predictedSales !== null
                  ? "Ready"
                  : "Waiting"}
            </strong>
            <small>AI forecasting engine</small>
          </div>
        </div>

      </div>

      {/* WORKSPACE */}
      <div className="predict-section-heading">
        <div>
          <span>PREDICTION WORKSPACE</span>
          <h2>Configure Forecast Parameters</h2>
        </div>
      </div>

      <div className="predict-workspace">

        {/* INPUT CARD */}
        <form
          onSubmit={handlePredict}
          className="predict-input-card"
        >

          <div className="predict-card-heading">
            <div className="predict-card-icon">
              <Calculator size={19} />
            </div>

            <div>
              <span>MODEL INPUTS</span>
              <h3>Transaction Parameters</h3>
            </div>
          </div>

          {/* QUANTITY */}
          <div className="predict-field">
            <label>
              <Package size={13} />
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(parseInt(e.target.value, 10))
              }
              required
            />

            <small>
              Number of units included in the prediction.
            </small>
          </div>

          {/* DISCOUNT */}
          <div className="predict-field">
            <label>
              <Percent size={13} />
              Discount
            </label>

            <div className="input-with-suffix">
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={discount}
                onChange={(e) =>
                  setDiscount(parseFloat(e.target.value))
                }
                required
              />

              <span>
                {Math.round(discount * 100)}%
              </span>
            </div>

            <small>
              Enter 0.20 for a 20% discount.
            </small>
          </div>

          {/* DATE */}
          <div className="predict-field">

            <label>
              <CalendarDays size={13} />
              Forecast Date
            </label>

            <div className="date-input-grid">

              <div>
                <span>YEAR</span>

                <input
                  type="number"
                  value={year}
                  onChange={(e) =>
                    setYear(parseInt(e.target.value, 10))
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
                    setMonth(parseInt(e.target.value, 10))
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
                    setDay(parseInt(e.target.value, 10))
                  }
                  required
                />
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="predict-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="predict-spinner" size={17} />
                Calculating Prediction...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Run ML Prediction
              </>
            )}
          </button>

        </form>

        {/* OUTPUT CARD */}
        <div className="prediction-output-card">

          <div className="output-header">
            <div>
              <span>MODEL OUTPUT</span>
              <h3>Sales Forecast</h3>
            </div>

            <div className="output-icon">
              <TrendingUp size={20} />
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="prediction-state">

              <div className="large-spinner">
                <LoaderCircle size={32} />
              </div>

              <h3>Running prediction model</h3>

              <p>
                Processing transaction parameters through the
                machine learning model...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="prediction-state error-state">

              <div className="state-icon error">
                <AlertTriangle size={25} />
              </div>

              <h3>Prediction Failed</h3>

              <p>{error}</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            predictedSales === null && (
              <div className="prediction-state">

                <div className="state-icon neutral">
                  <Calculator size={25} />
                </div>

                <h3>Awaiting Prediction</h3>

                <p>
                  Configure the transaction parameters and run
                  the ML model to generate a sales forecast.
                </p>
              </div>
            )}

          {/* RESULT */}
          {!loading &&
            !error &&
            predictedSales !== null && (
              <div className="prediction-result">

                <div className="result-status">
                  <CheckCircle2 size={14} />
                  PREDICTION GENERATED
                </div>

                <span className="predicted-label">
                  Predicted Revenue
                </span>

                <div className="predicted-value">
                  ₹
                  {Number(predictedSales).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </div>

                <div className="confidence-card">

                  <div className="confidence-header">
                    <span>Model Confidence</span>
                    <strong>95%</strong>
                  </div>

                  <div className="confidence-track">
                    <div className="confidence-progress" />
                  </div>

                  <p>
                    Prediction generated using the Linear
                    Regression model trained on historical
                    store transaction data.
                  </p>

                </div>

                <div className="prediction-breakdown">

                  <div>
                    <span>QUANTITY</span>
                    <strong>{quantity}</strong>
                  </div>

                  <div>
                    <span>DISCOUNT</span>
                    <strong>
                      {Math.round(discount * 100)}%
                    </strong>
                  </div>

                  <div>
                    <span>FORECAST DATE</span>
                    <strong>
                      {String(day).padStart(2, "0")}/
                      {String(month).padStart(2, "0")}/
                      {year}
                    </strong>
                  </div>

                </div>

              </div>
            )}

        </div>

      </div>
    </div>
  );
}

export default PredictSales;