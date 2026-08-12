import { useEffect, useState } from "react";
import api from "../api";
import "./Milestone3.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div className="spinner"></div>
        <p style={{ color: "#94a3b8", marginTop: "16px", fontSize: "15px", fontWeight: "500" }}>Retrieving platform notifications...</p>
      </div>
    );
  }

  // Filter notifications by type
  const lowStockAlerts = notifications.filter((n) => n.type === "low_stock");
  const overdueInvoices = notifications.filter((n) => n.type === "overdue_invoice");

  return (
    <div className="page">

      <div className="page-header">
        <h1>🔔 Operational Intelligence Alerts</h1>
        <p>Real-time updates regarding warehouse inventory safety limits and outstanding invoice defaults.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "32px", marginBottom: "32px" }}>
        
        {/* Low Stock Alerts Section */}
        <div>
          <div className="section-title">
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <span style={{ color: "#f97316" }}>Low Stock Warnings</span>
            <span className="stats-badge warning">{lowStockAlerts.length}</span>
          </div>
          
          <div className="notifications-list">
            {lowStockAlerts.length === 0 ? (
              <div style={{ color: "#64748b", background: "rgba(15, 23, 42, 0.3)", border: "1px dashed rgba(255,255,255,0.06)", padding: "30px", borderRadius: "16px", textAlign: "center", fontSize: "14px" }}>
                No low stock alerts detected. All warehouse inventory levels are healthy.
              </div>
            ) : (
              lowStockAlerts.map((n) => (
                <div
                  key={n.id}
                  className={`notification-card ${selectedNotification?.id === n.id ? "active" : ""}`}
                  style={{ borderLeft: "4px solid #f97316" }}
                  onClick={() => setSelectedNotification(n)}
                >
                  <h3 style={{ color: "#fdba74" }}>{n.title}</h3>
                  <p style={{ margin: "6px 0 10px 0" }}>{n.message}</p>
                  <small style={{ color: "#475569", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📅</span>
                    <span>Last Checked: {new Date(n.date).toLocaleString()}</span>
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Invoices Section */}
        <div>
          <div className="section-title">
            <span style={{ fontSize: "20px" }}>⏳</span>
            <span style={{ color: "#ef4444" }}>Overdue Invoices</span>
            <span className="stats-badge danger">{overdueInvoices.length}</span>
          </div>
          
          <div className="notifications-list">
            {overdueInvoices.length === 0 ? (
              <div style={{ color: "#64748b", background: "rgba(15, 23, 42, 0.3)", border: "1px dashed rgba(255,255,255,0.06)", padding: "30px", borderRadius: "16px", textAlign: "center", fontSize: "14px" }}>
                No overdue invoices found. All client account balances are up to date.
              </div>
            ) : (
              overdueInvoices.map((n) => (
                <div
                  key={n.id}
                  className={`notification-card ${selectedNotification?.id === n.id ? "active" : ""}`}
                  style={{ borderLeft: "4px solid #ef4444" }}
                  onClick={() => setSelectedNotification(n)}
                >
                  <h3 style={{ color: "#fca5a5" }}>{n.title}</h3>
                  <p style={{ margin: "6px 0 10px 0" }}>{n.message}</p>
                  <small style={{ color: "#475569", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📅</span>
                    <span>Due Date: {new Date(n.date).toLocaleDateString()}</span>
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Selected Notification Detailed Panel */}
      {selectedNotification && (
        <div className="chart-box" style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "#38bdf8", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🔍</span> Alert Details & Specifications
            </h2>
            <button 
              onClick={() => setSelectedNotification(null)}
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "white"}
              onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
            >
              Close Details
            </button>
          </div>
          
          <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.04)", padding: "20px", borderRadius: "12px", marginBottom: "24px" }}>
            <h3 style={{ color: "#f8fafc", marginTop: 0, marginBottom: "8px", fontSize: "16px" }}>{selectedNotification.title}</h3>
            <p style={{ fontSize: "14px", color: "#cbd5e1", margin: 0, lineHeight: "1.6" }}>{selectedNotification.message}</p>
          </div>

          <div>
            <h4 style={{ color: "#38bdf8", marginTop: 0, marginBottom: "16px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>Asset Metadata Specs</h4>
            <div className="spec-grid">
              {selectedNotification.type === "low_stock" && selectedNotification.metadata && (
                <>
                  <div className="spec-item">
                    <div className="spec-label">Product ID</div>
                    <div className="spec-value">#{selectedNotification.metadata.product_id}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Product Name</div>
                    <div className="spec-value">{selectedNotification.metadata.product_name}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Current Stock Level</div>
                    <div className="spec-value" style={{ color: "#f97316" }}>{selectedNotification.metadata.stock_quantity} units</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Safety Reorder level</div>
                    <div className="spec-value">{selectedNotification.metadata.reorder_level} units</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Warehouse Location</div>
                    <div className="spec-value">{selectedNotification.metadata.warehouse_location || "Central Storage"}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Unit List Price</div>
                    <div className="spec-value" style={{ color: "#22c55e" }}>₹{selectedNotification.metadata.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </>
              )}

              {selectedNotification.type === "overdue_invoice" && selectedNotification.metadata && (
                <>
                  <div className="spec-item">
                    <div className="spec-label">Invoice Ref</div>
                    <div className="spec-value">{selectedNotification.metadata.invoice_no}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Customer Client</div>
                    <div className="spec-value">{selectedNotification.metadata.customer_name}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Outstanding Amount</div>
                    <div className="spec-value" style={{ color: "#ef4444" }}>₹{selectedNotification.metadata.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Invoice Date</div>
                    <div className="spec-value">{new Date(selectedNotification.metadata.invoice_date).toLocaleDateString()}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Due Date</div>
                    <div className="spec-value" style={{ color: "#ef4444" }}>{new Date(selectedNotification.metadata.due_date).toLocaleDateString()}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">Collection Status</div>
                    <div className="spec-value" style={{ color: "#f59e0b" }}>{selectedNotification.metadata.payment_status}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;