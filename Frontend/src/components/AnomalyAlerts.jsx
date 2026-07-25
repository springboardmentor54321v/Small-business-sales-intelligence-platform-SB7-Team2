import { useEffect, useState } from "react";
import axios from "axios";

function AnomalyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomaly();
  }, []);

  const fetchAnomaly = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/anomaly/CA-2016-152156"
      );

      if (Array.isArray(res.data)) {
        setAlerts(res.data);
      } else {
        setAlerts([res.data]);
      }
    } catch (err) {
      console.error("Error fetching anomaly alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const color = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="panel">
      <h1>Anomaly Alerts</h1>

      <p>AI-generated anomaly detection results.</p>

      {loading ? (
        <p>Loading alerts...</p>
      ) : (
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {alerts.map((alert, index) => (
            <div
              key={index}
              style={{
                background: color(alert.severity || alert.Severity),
                color: "white",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h3>
                {(alert.severity || alert.Severity || "Unknown")} Alert
              </h3>

              <p>
                {alert.message ||
                  alert.Message ||
                  alert.description ||
                  "No anomaly detected."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnomalyAlerts;