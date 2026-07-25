import { useState } from "react";
import axios from "axios";

function ForecastReports() {
  const today = new Date();

  const [form, setForm] = useState({
    quantity: 5,
    discount: 0.1,
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value),
    });
  };

  const predictSales = async () => {
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:8000/predict", 
  {
    params: {
      quantity: form.quantity,
      discount: form.discount,
      year: form.year,
      month: form.month,
      day: form.day,
    },
    withCredentials: false,
    maxRedirects: 0,
  }
);

      setPrediction(res.data);
    } catch (err) {
  console.error("Prediction Error:", err);

  if (err.response) {
    console.log("Status:", err.response.status);
    console.log("Data:", err.response.data);
    alert(
      `API Error ${err.response.status}\n${JSON.stringify(err.response.data)}`
    );
  } else if (err.request) {
    console.log("No response received:", err.request);
    alert("Request reached the server but no response was received.");
  } else {
    console.log("Error:", err.message);
    alert(err.message);
  }
}

    setLoading(false);
  };

  return (
    <div className="panel">
      <h1>AI Sales Predictor</h1>

      <p>
        Predict future sales using the trained Machine Learning model.
      </p>

      <div
        className="card"
        style={{
          maxWidth: "650px",
          marginTop: "30px",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
          }}
        >
          <div>
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Discount</label>
            <input
              type="number"
              step="0.01"
              name="discount"
              value={form.discount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Month</label>
            <input
              type="number"
              min="1"
              max="12"
              name="month"
              value={form.month}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Day</label>
            <input
              type="number"
              min="1"
              max="31"
              name="day"
              value={form.day}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          onClick={predictSales}
          style={{
            marginTop: "25px",
            width: "100%",
          }}
        >
          {loading ? "Predicting..." : "Predict Sales"}
        </button>
      </div>

      {prediction && (
        <div
          className="card"
          style={{
            marginTop: "30px",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <h2>Prediction Result</h2>

          <h1
            style={{
              fontSize: "52px",
              color: "#38bdf8",
            }}
          >
            ₹ {prediction["Predicted Sales"]}
          </h1>

          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "15px",
            }}
          >
            <div className="card">
              <strong>Quantity</strong>
              <br />
              {prediction.Quantity}
            </div>

            <div className="card">
              <strong>Discount</strong>
              <br />
              {prediction.Discount}
            </div>

            <div className="card">
              <strong>Date</strong>
              <br />
              {prediction["Order Day"]}/
              {prediction["Order Month"]}/
              {prediction["Order Year"]}
            </div>

            <div className="card">
              <strong>Model</strong>
              <br />
              Linear Regression
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForecastReports;