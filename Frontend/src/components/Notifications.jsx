import { useState } from "react";
import "./Milestone3.css";

function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState(null);

  const notifications = [
    {
      id: 1,
      title: "Low Stock Alert",
      message: "Wireless Mouse stock is below 5 units.",
      type: "warning",
    },
    {
      id: 2,
      title: "Overdue Invoice",
      message: "Invoice #INV-1008 is overdue by 5 days.",
      type: "danger",
    },
    {
      id: 3,
      title: "New Customer",
      message: "A new customer has registered today.",
      type: "info",
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔔 Notifications</h1>
        <p>Recent alerts and business notifications.</p>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="notification-card"
            onClick={() => setSelectedNotification(notification)}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>

      {selectedNotification && (
        <div className="chart-box">
          <h2>Notification Details</h2>
          <h3>{selectedNotification.title}</h3>
          <p>{selectedNotification.message}</p>
        </div>
      )}
    </div>
  );
}

export default Notifications;