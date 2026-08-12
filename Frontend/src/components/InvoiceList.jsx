import { useState, useEffect } from "react";
import api from "../api";
import "./Milestone3.css";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Search States
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  // Detailed Modal View
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/invoices", {
        params: {
          search: activeSearch || undefined,
          payment_status: statusFilter === "All" ? undefined : statusFilter,
          page,
          limit
        }
      });
      setInvoices(response.data.invoices || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
    } catch (err) {
      console.error(err);
      setError(err.formattedMessage || "Failed to retrieve invoice records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
  };

  const handleOpenDetails = async (invoiceId) => {
    setModalLoading(true);
    try {
      const response = await api.get(`/api/invoices/${invoiceId}`);
      setSelectedInvoice(response.data.invoice);
    } catch (err) {
      alert(err.formattedMessage || "Failed to load invoice items details.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice? This will restore corresponding inventory stock quantities!")) return;
    try {
      await api.delete(`/api/invoices/${invoiceId}`);
      alert("Invoice deleted successfully.");
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert(err.formattedMessage || "Failed to delete invoice.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "#22c55e";
      case "Unpaid":
        return "#ef4444";
      case "Partial":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📋 Accounts Invoice Ledger</h1>
        <p>Review customer billing accounts, inspect purchased product items, download transaction receipts, or manage outstanding invoices.</p>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fecaca", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
          Error: {error}
        </div>
      )}

      {/* Toolbar Filters and Search */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, maxWidth: "420px" }}>
          <input 
            placeholder="Search by invoice number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(15, 23, 42, 0.6)", color: "white", flex: 1, fontSize: "14px" }}
          />
          <button 
            type="submit" 
            style={{ padding: "10px 16px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
          >
            Search
          </button>
          {activeSearch && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              style={{ padding: "10px 16px", background: "#1e293b", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "Paid", "Unpaid", "Partial"].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              style={{ 
                padding: "10px 16px", 
                background: statusFilter === status ? "rgba(56, 189, 248, 0.15)" : "#1e293b", 
                color: statusFilter === status ? "#38bdf8" : "#cbd5e1", 
                border: statusFilter === status ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)", 
                borderRadius: "8px", 
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s"
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Invoices Table Card */}
      <div className="card" style={{ padding: "0px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <div className="spinner"></div>
            <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "14px" }}>Synchronizing ledger entries...</p>
          </div>
        ) : invoices.length > 0 ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Invoice No</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Client Customer</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Billed On</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Total Amount</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Tax Billed</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Payment Status</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Created By</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoice_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }} className="table-row-hover">
                      <td style={{ padding: "16px 20px", fontWeight: "bold", color: "#38bdf8" }}>{inv.invoice_no}</td>
                      <td style={{ padding: "16px 20px", color: "#cbd5e1" }}>{inv.customer_name || "Walk-in Customer"}</td>
                      <td style={{ padding: "16px 20px" }}>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td style={{ padding: "16px 20px", fontWeight: "bold", color: "#f8fafc" }}>₹{parseFloat(inv.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "16px 20px" }}>₹{parseFloat(inv.tax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            background: `${getStatusColor(inv.payment_status)}20`,
                            color: getStatusColor(inv.payment_status),
                            border: `1px solid ${getStatusColor(inv.payment_status)}40`,
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontWeight: "700",
                            fontSize: "11px"
                          }}
                        >
                          {inv.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "12px", color: "#64748b" }}>{inv.user_name || "Sales Clerk"}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <button 
                          onClick={() => handleOpenDetails(inv.invoice_id)}
                          style={{ padding: "6px 14px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { e.target.style.background = "#38bdf8"; e.target.style.color = "#020617"; }}
                          onMouseLeave={(e) => { e.target.style.background = "rgba(56, 189, 248, 0.1)"; e.target.style.color = "#38bdf8"; }}
                        >
                          Inspect Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar" style={{ padding: "16px 20px" }}>
              <span className="page-indicator">
                Showing Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong> ({totalItems} items total)
              </span>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <h3>No invoice records found.</h3>
            <p>Try matching another search keyword or verify sync connections.</p>
          </div>
        )}
      </div>

      {/* Detailed Modal view */}
      {selectedInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, backdropFilter: "blur(6px)" }}>
          <div className="card" style={{ width: "620px", textAlign: "left", padding: "30px", maxHeight: "85vh", overflowY: "auto", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", marginBottom: "20px", alignItems: "center" }}>
              <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "20px", fontWeight: "700" }}>Invoice #{selectedInvoice.invoice_no}</h2>
              <span style={{ 
                background: `${getStatusColor(selectedInvoice.payment_status)}20`, 
                color: getStatusColor(selectedInvoice.payment_status), 
                border: `1px solid ${getStatusColor(selectedInvoice.payment_status)}40`,
                padding: "6px 12px", 
                borderRadius: "12px", 
                fontWeight: "700",
                fontSize: "12px"
              }}>
                {selectedInvoice.payment_status}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px", marginBottom: "24px", color: "#cbd5e1" }}>
              <div>
                <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>Client Customer:</span><br/>
                <strong style={{ color: "white" }}>{selectedInvoice.customer_name}</strong> ({selectedInvoice.customer_email || "No email"})
              </div>
              <div>
                <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>Order Clerk:</span><br/>
                <strong style={{ color: "white" }}>{selectedInvoice.user_name || "System"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>Billing Date:</span><br/>
                <strong style={{ color: "white" }}>{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>Payment Due Date:</span><br/>
                <strong style={{ color: "#ef4444" }}>{new Date(selectedInvoice.due_date).toLocaleDateString()}</strong>
              </div>
            </div>

            <h3 style={{ color: "#38bdf8", fontSize: "14px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Order Line Items</h3>
            <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
              <table style={{ background: "transparent", fontSize: "13px", width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.01)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b" }}>Product Label</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b" }}>Quantity</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b" }}>Unit Price</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: "bold", color: "#f8fafc" }}>{item.product_name}</td>
                      <td style={{ padding: "10px 14px" }}>{item.quantity} units</td>
                      <td style={{ padding: "10px 14px" }}>₹{parseFloat(item.unit_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "10px 14px", fontWeight: "bold" }}>₹{parseFloat(item.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", alignItems: "flex-end", marginBottom: "24px" }}>
              <div><span style={{ color: "#64748b" }}>Subtotal:</span> <strong style={{ color: "white" }}>₹{parseFloat(selectedInvoice.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
              <div><span style={{ color: "#64748b" }}>GST Tax (18%):</span> <strong style={{ color: "white" }}>₹{parseFloat(selectedInvoice.tax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
              <div><span style={{ color: "#64748b" }}>Discount:</span> <strong style={{ color: "white" }}>-₹{parseFloat(selectedInvoice.discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
              <div style={{ fontSize: "16px", color: "#22c55e", fontWeight: "bold", marginTop: "4px" }}>
                Grand Total: ₹{parseFloat(selectedInvoice.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {selectedInvoice.notes && (
              <div style={{ background: "rgba(15, 23, 42, 0.4)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", fontSize: "13px", color: "#cbd5e1", marginBottom: "24px" }}>
                <strong>Remarks:</strong> {selectedInvoice.notes}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                type="button" 
                onClick={() => setSelectedInvoice(null)}
                style={{ flex: 1, padding: "12px", background: "#334155", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
              >
                Close Details
              </button>
              <button 
                type="button" 
                onClick={() => handleDeleteInvoice(selectedInvoice.invoice_id)}
                style={{ padding: "12px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;