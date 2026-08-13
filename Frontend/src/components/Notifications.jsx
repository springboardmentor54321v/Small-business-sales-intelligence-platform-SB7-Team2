import { useEffect, useState } from "react";
import api from "../api";
import "./Notifications.css";

import {
  Bell,
  AlertTriangle,
  FileWarning,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock3,
  User,
  IndianRupee,
  Package,
} from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [expandedStock, setExpandedStock] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setRefreshing(true);

      const response = await api.get("/api/notifications");

      console.log(
        "NOTIFICATIONS RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Notifications Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const invoiceAlerts = notifications.filter(
    (item) => item.type === "overdue_invoice"
  );

  const stockAlerts = notifications.filter(
    (item) => item.type === "low_stock"
  );

  const getMetadata = (item, key) => {
    return item?.metadata?.[key] ?? "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "-";

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <Bell size={22} />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">

      {/* PAGE HEADER */}
      <div className="notifications-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-dot" />
            BUSINESS INTELLIGENCE
          </div>

          <h1>Notifications</h1>

          <p>
            Stay informed about overdue invoices, inventory risks and
            important business alerts.
          </p>
        </div>

        <button
          className="notifications-refresh"
          onClick={fetchNotifications}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="notification-summary-grid">

        <div className="notification-summary-card">
          <div className="summary-icon invoice-icon">
            <FileWarning size={20} />
          </div>

          <div className="summary-content">
            <span>Overdue Invoices</span>
            <strong>{invoiceAlerts.length}</strong>
            <small>Require payment attention</small>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="summary-icon stock-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="summary-content">
            <span>Low Stock Items</span>
            <strong>{stockAlerts.length}</strong>
            <small>Require inventory attention</small>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="summary-icon total-icon">
            <Bell size={20} />
          </div>

          <div className="summary-content">
            <span>Total Alerts</span>
            <strong>{notifications.length}</strong>
            <small>Active business notifications</small>
          </div>
        </div>

      </div>

      {/* ALERT CENTER */}
      <div className="notification-panel">

        <div className="notification-panel-header">
          <div>
            <div className="section-eyebrow">
              ALERT CENTER
            </div>

            <h2>Business Notifications</h2>

            <p>
              Review important events and take action where required.
            </p>
          </div>

          <div className="notification-count">
            {notifications.length} ALERTS
          </div>
        </div>

        <div className="notification-columns">

          {/* OVERDUE INVOICES */}
          <section className="notification-column">

            <div className="column-header">
              <div className="column-title">
                <div className="column-icon invoice-column-icon">
                  <FileWarning size={18} />
                </div>

                <div>
                  <h3>Overdue Invoices</h3>
                  <span>Payment attention required</span>
                </div>
              </div>

              <span className="column-count">
                {invoiceAlerts.length}
              </span>
            </div>

            <div className="notification-list">

              {invoiceAlerts.length === 0 ? (
                <div className="empty-notifications">
                  <FileWarning size={26} />
                  <strong>No overdue invoices</strong>
                  <span>Everything is up to date.</span>
                </div>
              ) : (
                invoiceAlerts.map((item) => {
                  const expanded = expandedInvoice === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`alert-card invoice-alert ${
                        expanded ? "expanded" : ""
                      }`}
                    >

                      <button
                        className="alert-card-main"
                        onClick={() =>
                          setExpandedInvoice(
                            expanded ? null : item.id
                          )
                        }
                      >

                        <div className="alert-severity invoice-severity">
                          <FileWarning size={18} />
                        </div>

                        <div className="alert-content">
                          <strong>{item.title}</strong>

                          <div className="alert-meta">
                            <span>
                              <User size={13} />
                              {getMetadata(item, "customer_name")}
                            </span>

                            <span>
                              <IndianRupee size={13} />
                              {formatAmount(
                                getMetadata(item, "total_amount")
                              )}
                            </span>
                          </div>

                          <div className="alert-date">
                            <Clock3 size={13} />
                            Due {formatDate(
                              getMetadata(item, "due_date")
                            )}
                          </div>
                        </div>

                        <div className="alert-chevron">
                          {expanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>

                      </button>

                      {expanded && (
                        <div className="alert-details">

                          <p>{item.message}</p>

                          <div className="detail-grid">

                            <div>
                              <span>Invoice</span>
                              <strong>
                                {getMetadata(item, "invoice_no")}
                              </strong>
                            </div>

                            <div>
                              <span>Customer</span>
                              <strong>
                                {getMetadata(item, "customer_name")}
                              </strong>
                            </div>

                            <div>
                              <span>Amount</span>
                              <strong>
                                {formatAmount(
                                  getMetadata(item, "total_amount")
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>Status</span>
                              <strong className="status-unpaid">
                                {getMetadata(item, "payment_status")}
                              </strong>
                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })
              )}

            </div>
          </section>

          {/* LOW STOCK */}
          <section className="notification-column">

            <div className="column-header">
              <div className="column-title">
                <div className="column-icon stock-column-icon">
                  <Package size={18} />
                </div>

                <div>
                  <h3>Low Stock Alerts</h3>
                  <span>Inventory attention required</span>
                </div>
              </div>

              <span className="column-count stock-count">
                {stockAlerts.length}
              </span>
            </div>

            <div className="notification-list">

              {stockAlerts.length === 0 ? (
                <div className="empty-notifications">
                  <Package size={26} />
                  <strong>No low stock alerts</strong>
                  <span>Inventory levels look healthy.</span>
                </div>
              ) : (
                stockAlerts.map((item) => {
                  const expanded = expandedStock === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`alert-card stock-alert ${
                        expanded ? "expanded" : ""
                      }`}
                    >

                      <button
                        className="alert-card-main"
                        onClick={() =>
                          setExpandedStock(
                            expanded ? null : item.id
                          )
                        }
                      >

                        <div className="alert-severity stock-severity">
                          <AlertTriangle size={18} />
                        </div>

                        <div className="alert-content">
                          <strong>{item.title}</strong>

                          <div className="alert-meta">
                            <span>
                              <Package size={13} />
                              {getMetadata(item, "product_name")}
                            </span>
                          </div>

                          <div className="alert-date">
                            <Clock3 size={13} />
                            {formatDate(item.date)}
                          </div>
                        </div>

                        <div className="alert-chevron">
                          {expanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>

                      </button>

                      {expanded && (
                        <div className="alert-details">

                          <p>{item.message}</p>

                          <div className="detail-grid">

                            <div>
                              <span>Product</span>
                              <strong>
                                {getMetadata(item, "product_name")}
                              </strong>
                            </div>

                            <div>
                              <span>Current Stock</span>
                              <strong>
                                {getMetadata(item, "current_stock")}
                              </strong>
                            </div>

                            <div>
                              <span>Threshold</span>
                              <strong>
                                {getMetadata(item, "threshold")}
                              </strong>
                            </div>

                            <div>
                              <span>Status</span>
                              <strong className="status-low">
                                LOW STOCK
                              </strong>
                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })
              )}

            </div>
          </section>

        </div>
      </div>

    </div>
  );
}

export default Notifications;