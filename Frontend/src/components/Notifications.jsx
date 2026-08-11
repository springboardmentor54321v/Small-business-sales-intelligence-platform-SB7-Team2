import { useState, useEffect } from "react";
import api from "../api";
import "./Milestone3.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [expandedStock, setExpandedStock] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.notifications);

        setNotifications(response.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const invoiceAlerts = notifications.filter(
    (n) => n.type === "overdue_invoice"
  );

  const stockAlerts = notifications.filter(
    (n) => n.type === "low_stock"
  );

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>🔔 Notifications</h1>
          <p>Loading...</p>
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

      <div className="notifications-grid">

        {/* LEFT */}

        <div className="notification-section">

          <h2>🧾 Overdue Invoice Alerts</h2>

          {invoiceAlerts.map((item) => (

            <div
              key={item.id}
              className="notification-card"
              onClick={() =>
                setExpandedInvoice(
                  expandedInvoice === item.id
                    ? null
                    : item.id
                )
              }
            >

              <div className="notification-header">

                <h3>{item.title}</h3>

                <span>
                  {expandedInvoice === item.id ? "▲" : "▼"}
                </span>

              </div>

              {expandedInvoice === item.id && (

                <div className="notification-body">

                  <p>{item.message}</p>

                  <small>
                    {new Date(item.date).toLocaleString()}
                  </small>

                  {item.metadata &&
                    Object.entries(item.metadata).map(
                      ([key, value]) => (

                        <p key={key}>
                          <strong>
                            {key.replace(/_/g, " ")}
                          </strong>

                          : {String(value)}
                        </p>

                      )
                    )}

                </div>

              )}

            </div>

          ))}

        </div>

        {/* RIGHT */}

        <div className="notification-section">

          <h2>⚠️ Low Stock Alerts</h2>

          {stockAlerts.map((item) => (

            <div
              key={item.id}
              className="notification-card"
              onClick={() =>
                setExpandedStock(
                  expandedStock === item.id
                    ? null
                    : item.id
                )
              }
            >

              <div className="notification-header">

                <h3>{item.title}</h3>

                <span>
                  {expandedStock === item.id ? "▲" : "▼"}
                </span>

              </div>

              {expandedStock === item.id && (

                <div className="notification-body">

                  <p>{item.message}</p>

                  <small>
                    {new Date(item.date).toLocaleString()}
                  </small>

                  {item.metadata &&
                    Object.entries(item.metadata).map(
                      ([key, value]) => (

                        <p key={key}>
                          <strong>
                            {key.replace(/_/g, " ")}
                          </strong>

                          : {String(value)}
                        </p>

                      )
                    )}

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Notifications;