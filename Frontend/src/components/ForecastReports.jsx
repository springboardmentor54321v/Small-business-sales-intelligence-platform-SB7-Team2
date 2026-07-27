import { useState, useEffect } from "react";
import api from "../api";

function ForecastReports() {
  const [activeReportTab, setActiveReportTab] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [salesReport, setSalesReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [customersReport, setCustomersReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesRes, invRes, custRes, revRes] = await Promise.all([
        api.get("/api/reports/sales").catch(() => ({ data: { sales: [] } })),
        api.get("/api/reports/inventory").catch(() => ({ data: { inventory: [] } })),
        api.get("/api/reports/customers").catch(() => ({ data: { customers: [] } })),
        api.get("/api/reports/revenue").catch(() => ({ data: { report: null } }))
      ]);

      setSalesReport(salesRes.data.sales || []);
      setInventoryReport(invRes.data.inventory || []);
      setCustomersReport(custRes.data.customers || []);
      setRevenueReport(revRes.data.report);
    } catch (err) {
      console.error(err);
      setError("Failed to load business report analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Compiling database report ledgers...</p></div>;
  }

  return (
    <div className="panel">
      <h1>📊 Business Reporting Suite</h1>
      <p className="page-desc">
        Access audit logs, revenue statistics, and live stock audits directly from the PostgreSQL data storage.
      </p>

      {/* Report tabs navigation */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>
        <button 
          onClick={() => setActiveReportTab("sales")}
          style={{ padding: "10px 20px", background: activeReportTab === "sales" ? "#38bdf8" : "transparent", color: activeReportTab === "sales" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          📈 Sales Ledger
        </button>
        <button 
          onClick={() => setActiveReportTab("inventory")}
          style={{ padding: "10px 20px", background: activeReportTab === "inventory" ? "#38bdf8" : "transparent", color: activeReportTab === "inventory" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          📦 Inventory Audits
        </button>
        <button 
          onClick={() => setActiveReportTab("revenue")}
          style={{ padding: "10px 20px", background: activeReportTab === "revenue" ? "#38bdf8" : "transparent", color: activeReportTab === "revenue" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          💰 Revenue Statistics
        </button>
        <button 
          onClick={() => setActiveReportTab("customers")}
          style={{ padding: "10px 20px", background: activeReportTab === "customers" ? "#38bdf8" : "transparent", color: activeReportTab === "customers" ? "#020617" : "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          👥 Client Directory
        </button>
      </div>

      {error && <div style={{ color: "#ef4444", marginBottom: "20px" }}>{error}</div>}

      {/* ==========================================
          TAB: SALES REPORT
          ========================================== */}
      {activeReportTab === "sales" && (
        <div className="card">
          <h2>Sales Transactions Audit</h2>
          {salesReport.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Invoice No</th>
                  <th>Client Customer</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Billed Amount</th>
                  <th>Sale Date</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.map(s => (
                  <tr key={s.sale_id}>
                    <td>#{s.sale_id}</td>
                    <td style={{ fontWeight: "bold", color: "#38bdf8" }}>{s.invoice_no}</td>
                    <td>{s.customer_name}</td>
                    <td>{s.payment_method}</td>
                    <td>
                      <span style={{ 
                        padding: "2px 8px", 
                        borderRadius: "10px", 
                        fontSize: "11px", 
                        fontWeight: "bold",
                        background: s.payment_status === "Paid" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                        color: s.payment_status === "Paid" ? "#22c55e" : "#f59e0b"
                      }}>
                        {s.payment_status}
                      </span>
                    </td>
                    <td style={{ fontWeight: "bold" }}>₹{s.total_amount.toLocaleString("en-IN")}</td>
                    <td>{s.sale_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#64748b" }}>No sales transactions found in the database.</p>
          )}
        </div>
      )}

      {/* ==========================================
          TAB: INVENTORY REPORT
          ========================================== */}
      {activeReportTab === "inventory" && (
        <div className="card">
          <h2>Warehouse Stock Audits</h2>
          {inventoryReport.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>SKU ID</th>
                  <th>Product Description</th>
                  <th>Warehouse Placement</th>
                  <th>Available Quantity</th>
                  <th>Safety Threshold</th>
                  <th>Last Inspected</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.map(item => (
                  <tr key={item.inventory_id}>
                    <td>SKU-{String(item.inventory_id).padStart(5, "0")}</td>
                    <td style={{ fontWeight: "bold" }}>{item.product_name}</td>
                    <td>{item.warehouse_location || "Awaiting shelf placement"}</td>
                    <td style={{ fontWeight: "bold", color: item.stock_quantity <= item.reorder_level ? "#ef4444" : "#22c55e" }}>
                      {item.stock_quantity} units
                    </td>
                    <td>{item.reorder_level} units</td>
                    <td>{item.last_updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#64748b" }}>No stock items registered in database inventory.</p>
          )}
        </div>
      )}

      {/* ==========================================
          TAB: REVENUE STATISTICS
          ========================================== */}
      {activeReportTab === "revenue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {revenueReport ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                <div className="card">
                  <h3 style={{ fontSize: "14px", color: "#64748b" }}>AGGREGATED SALES REVENUE</h3>
                  <h2 style={{ color: "#38bdf8", fontSize: "32px", margin: "10px 0" }}>
                    ₹{revenueReport.totalRevenue.toLocaleString("en-IN")}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Store overall ledger gross</p>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: "14px", color: "#64748b" }}>MEAN TRANSACTION SIZE</h3>
                  <h2 style={{ color: "#38bdf8", fontSize: "32px", margin: "10px 0" }}>
                    ₹{Math.round(revenueReport.averageSale).toLocaleString("en-IN")}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Average cart checkout size</p>
                </div>
                <div className="card" style={{ borderLeft: "4px solid #22c55e" }}>
                  <h3 style={{ fontSize: "14px", color: "#64748b" }}>HIGHEST CHECKOUT VALUE</h3>
                  <h2 style={{ color: "#22c55e", fontSize: "32px", margin: "10px 0" }}>
                    ₹{revenueReport.highestSale.toLocaleString("en-IN")}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Max order logged</p>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: "14px", color: "#64748b" }}>SMALLEST CHECKOUT VALUE</h3>
                  <h2 style={{ color: "#38bdf8", fontSize: "32px", margin: "10px 0" }}>
                    ₹{revenueReport.lowestSale.toLocaleString("en-IN")}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Min order logged</p>
                </div>
              </div>

              <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                <h2>Checkout Spread Analysis</h2>
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: "30px", flexWrap: "wrap", gap: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8" }}>Minimum Sale</span>
                    <strong style={{ fontSize: "20px" }}>₹{revenueReport.lowestSale}</strong>
                  </div>
                  <div style={{ fontSize: "24px", color: "#334155" }}>➔</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8" }}>Average Cart size</span>
                    <strong style={{ fontSize: "20px", color: "#38bdf8" }}>₹{Math.round(revenueReport.averageSale)}</strong>
                  </div>
                  <div style={{ fontSize: "24px", color: "#334155" }}>➔</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8" }}>Maximum Sale</span>
                    <strong style={{ fontSize: "20px", color: "#22c55e" }}>₹{revenueReport.highestSale}</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "#64748b" }}>Awaiting revenue transactions compilation records.</p>
          )}
        </div>
      )}

      {/* ==========================================
          TAB: CLIENT DIRECTORY
          ========================================== */}
      {activeReportTab === "customers" && (
        <div className="card">
          <h2>Client Database Logs</h2>
          {customersReport.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Home / Shipping Address</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {customersReport.map(c => (
                  <tr key={c.customer_id}>
                    <td>#{c.customer_id}</td>
                    <td style={{ fontWeight: "bold" }}>{c.customer_name}</td>
                    <td>{c.email || "N/A"}</td>
                    <td>{c.phone || "N/A"}</td>
                    <td>{c.address || "N/A"}</td>
                    <td>{c.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#64748b" }}>No customer records found in PostgreSQL.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ForecastReports;