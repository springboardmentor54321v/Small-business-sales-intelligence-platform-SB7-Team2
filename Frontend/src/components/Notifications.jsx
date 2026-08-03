import { useState, useEffect } from "react";
import api from "../api";
import "./Milestone3.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

const response = await api.get("/api/notifications", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setNotifications(
          response.data.notifications || []
        );
      } catch (error) {
        console.error("Notification Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>🔔 Notifications</h1>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
        <div className="page">

      <div className="page-header">
        <h1>🔔 Notifications</h1>
        <p>Recent alerts and business notifications.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="chart-box">
          <h2>No Notifications</h2>
          <p>Everything looks good. No alerts available.</p>
        </div>
      ) : (
        <div className="notifications-list">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className="notification-card"
              onClick={() =>
                setSelectedNotification(notification)
              }
            >

              <h3>{notification.title}</h3>

              <p>{notification.message}</p>

              <small
                style={{
                  color: "#94a3b8",
                  display: "block",
                  marginTop: "10px",
                }}
              >
                {new Date(notification.date).toLocaleString()}
              </small>

            </div>

          ))}

        </div>
      )}

      {selectedNotification && (

        <div className="chart-box">

          <h2>Notification Details</h2>

          <h3>{selectedNotification.title}</h3>

          <p>{selectedNotification.message}</p>

          <p>
            <strong>Type:</strong>{" "}
            {selectedNotification.type.replace(/_/g, " ")}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              selectedNotification.date
            ).toLocaleString()}
          </p>

          {selectedNotification.metadata && (

            <div
              style={{
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "1px solid #334155",
              }}
            >

              <h3>Additional Information</h3>

              <div
  style={{
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }}
>
  {Object.entries(selectedNotification.metadata).map(([key, value]) => (
    <p key={key}>
      <strong>{key.replace(/_/g, " ")}:</strong> {String(value)}
    </p>
  ))}
</div>

            </div>

          )}

        </div>

      )}

    </div>

  );
}

export default Notifications;