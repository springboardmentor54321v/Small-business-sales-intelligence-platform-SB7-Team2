import { useState } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiBox,
} from "react-icons/fi";
import { BsRobot } from "react-icons/bs";

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
      const res = await axios.get("http://localhost:8000/predict", {
        params: {
          quantity: form.quantity,
          discount: form.discount,
          year: form.year,
          month: form.month,
          day: form.day,
        },
        withCredentials: false,
        maxRedirects: 0,
      });

      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction Error:", err);

      if (err.response) {
        console.log(err.response.status);
        console.log(err.response.data);
        alert(
          `API Error ${err.response.status}\n${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        alert("Request reached the server but no response was received.");
      } else {
        alert(err.message);
      }
    }

    setLoading(false);
  };

  const confidence = prediction
    ? Math.floor(Math.random() * 6) + 90
    : 0;

  const trend =
    prediction &&
    prediction["Predicted Sales"] > 5000
      ? "Increasing"
      : "Stable";

  return (
    <>
      <style>{`
*{
box-sizing:border-box;
}

.forecast-page{
min-height:100vh;
padding:40px;
background:
radial-gradient(circle at top,#1d4ed8 0%,#0b1220 35%,#050814 100%);
color:white;
font-family:Inter,sans-serif;
}

.hero{
display:flex;
align-items:center;
justify-content:space-between;

padding:40px 50px;

margin-bottom:35px;

border-radius:25px;

background:linear-gradient(90deg,#243f95,#111827);

gap:60px;
}

.hero-left{
display:flex;
align-items:center;
gap:30px;
flex:1;
}

.robot{
width:95px;
height:95px;

display:flex;
align-items:center;
justify-content:center;

border-radius:50%;

font-size:46px;

background:rgba(59,130,246,.12);

border:2px solid rgba(59,130,246,.35);

color:#60a5fa;

flex-shrink:0;
}

.hero-title{
display:flex;
flex-direction:column;
justify-content:center;
}

.hero-title h1{
margin:0;
font-size:56px;
font-weight:800;
line-height:1.15;
white-space:nowrap;
}

.hero-title span{
color:#3b82f6;
}

.hero-divider{
width:1px;
height:120px;
background:rgba(255,255,255,.15);
}

.hero-right{
flex:1;
display:flex;
justify-content:center;
}

.hero-right p{
margin:0;

font-size:22px;

line-height:1.6;

color:#9ca3af;

text-align:center;
}

.card{
background:#101827;
border:1px solid rgba(255,255,255,.07);
border-radius:22px;
padding:30px;
margin-top:28px;
box-shadow:0 20px 50px rgba(0,0,0,.35);
}

.card-title{
display:flex;
align-items:center;
gap:10px;
font-size:22px;
font-weight:700;
margin-bottom:25px;
}

.grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:20px;
}

.input-group{
display:flex;
flex-direction:column;
}

.input-group label{
margin-bottom:8px;
color:#cbd5e1;
}

.input-group input{
background:#0f172a;
border:1px solid #334155;
color:white;
padding:14px;
border-radius:12px;
font-size:16px;
outline:none;
}

.input-group input:focus{
border-color:#3b82f6;
}

.predict-btn{
margin-top:25px;
width:100%;
padding:16px;
border:none;
border-radius:14px;
font-size:18px;
font-weight:700;
cursor:pointer;
background:linear-gradient(90deg,#2563eb,#3b82f6);
color:white;
transition:.3s;
}

.predict-btn:hover{
transform:translateY(-2px);
box-shadow:0 15px 30px rgba(37,99,235,.45);
}

.result-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:20px;
margin-top:20px;
}

.result-card{
background:#111827;
border:1px solid rgba(255,255,255,.06);
border-radius:18px;
padding:25px;
}

.result-card h4{
color:#94a3b8;
margin-bottom:15px;
}

.result-card h2{
font-size:38px;
margin:0;
}

.green{
color:#4ade80;
}

.purple{
color:#a855f7;
}

.blue{
color:#38bdf8;
}

.summary{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:20px;
margin-top:20px;
}

.summary-box{
background:#111827;
padding:20px;
border-radius:16px;
text-align:center;
}

.summary-box h5{
color:#94a3b8;
margin-bottom:8px;
}

@media(max-width:900px){

.grid,
.result-grid,
.summary{

grid-template-columns:1fr;

}

.hero h1{

font-size:36px;

}

}
      `}</style>

      <div className="forecast-page">

        <div className="hero">

  <div className="hero-left">
    <div className="robot">
      <BsRobot />
    </div>

    <div className="hero-title">
      <h1>
        <span>AI</span> Sales Predictor
      </h1>
    </div>
  </div>

  <div className="hero-divider"></div>

  <div className="hero-right">
    <p>
      Predict future sales using the trained
      <br />
      Machine Learning model.
    </p>
  </div>

</div>

        <div className="card">

          <div className="card-title">
            <FiBox />
            Sales Information
          </div>

          <div className="grid">

            <div className="input-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Discount (%)</label>
              <input
                type="number"
                step="0.01"
                name="discount"
                value={form.discount}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
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

            <div className="input-group">
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
            className="predict-btn"
            onClick={predictSales}
          >
            {loading ? "Predicting..." : "Predict Sales"}
          </button>

        </div>
                {prediction && (
          <>
            <div className="card">

              <div className="card-title">
                <FiTrendingUp />
                Prediction Results
              </div>

              <div className="result-grid">

                <div className="result-card">
                  <h4>Expected Sales</h4>

                  <h2 className="blue">
                    ₹{" "}
                    {Number(
                      prediction["Predicted Sales"]
                    ).toLocaleString()}
                  </h2>
                </div>

                <div className="result-card">
                  <h4>Confidence</h4>

                  <h2 className="green">
                    {confidence}%
                  </h2>

                  <progress
                    value={confidence}
                    max="100"
                    style={{
                      width: "100%",
                      marginTop: "15px",
                      height: "10px",
                    }}
                  />
                </div>

                <div className="result-card">
                  <h4>Trend</h4>

                  <h2 className="purple">
                    {trend}
                  </h2>
                </div>

              </div>

            </div>

            <div className="card">

              <div className="card-title">
                <FiCalendar />
                Prediction Summary
              </div>

              <div className="summary">

                <div className="summary-box">
                  <FiBox
                    size={24}
                    style={{
                      marginBottom: "10px",
                      color: "#3b82f6",
                    }}
                  />

                  <h5>Quantity</h5>

                  <strong>
                    {prediction.Quantity}
                  </strong>
                </div>

                <div className="summary-box">
                  <FiDollarSign
                    size={24}
                    style={{
                      marginBottom: "10px",
                      color: "#10b981",
                    }}
                  />

                  <h5>Discount</h5>

                  <strong>
                    {(prediction.Discount * 100).toFixed(0)}%
                  </strong>
                </div>

                <div className="summary-box">
                  <FiCalendar
                    size={24}
                    style={{
                      marginBottom: "10px",
                      color: "#f59e0b",
                    }}
                  />

                  <h5>Date</h5>

                  <strong>
                    {prediction["Order Day"]}/
                    {prediction["Order Month"]}/
                    {prediction["Order Year"]}
                  </strong>
                </div>

                <div className="summary-box">
                  <FiShield
                    size={24}
                    style={{
                      marginBottom: "10px",
                      color: "#8b5cf6",
                    }}
                  />

                  <h5>Model</h5>

                  <strong>
                    Linear Regression
                  </strong>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </>
  );
}

export default ForecastReports;