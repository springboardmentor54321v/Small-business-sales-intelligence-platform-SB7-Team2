import { useState, useEffect } from "react";
import api from "../api";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Detailed Modal View
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/api/invoices");
      setInvoices(response.data.invoices || []);
    } catch (err) {
      console.error(err);
      setError(err.formattedMessage || "Failed to retrieve invoice records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

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

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Synchronizing accounts receivables...</p></div>;
  }

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "All" || inv.payment_status === statusFilter;
    const matchesSearch = inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="panel">
      <h1>📋 Invoice Management</h1>
      <p className="page-desc">
        Review accounts billing histories, inspect unit prices, download invoice PDFs, or delete recorded ledgers.
      </p>

      {/* Toolbar Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", margin: "20px 0", flexWrap: "wrap" }}>
        <input 
          placeholder="Search by invoice number or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "white", flex: 1, maxWidth: "300px" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          {["All", "Paid", "Unpaid", "Partial"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{ 
                padding: "8px 14px", 
                background: statusFilter === status ? "#38bdf8" : "#334155", 
                color: statusFilter === status ? "#020617" : "white", 
                border: "none", 
                borderRadius: "6px", 
                fontWeight: "bold",
                cursor: "pointer" 
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices table */}
      <div className="card">
        {filteredInvoices.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client Customer</th>
                <th>Billed On</th>
                <th>Total Amount</th>
                <th>Tax Billed</th>
                <th>Payment Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.invoice_id}>
                  <td style={{ fontWeight: "bold", color: "#38bdf8" }}>{inv.invoice_no}</td>
                  <td>{inv.customer_name || "Walk-in customer"}</td>
                  <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: "bold" }}>₹{parseFloat(inv.total_amount).toLocaleString("en-IN")}</td>
                  <td>₹{parseFloat(inv.tax || 0).toLocaleString("en-IN")}</td>
                  <td>
                    <span
                      style={{
                        background: `${getStatusColor(inv.payment_status)}20`,
                        color: getStatusColor(inv.payment_status),
                        border: `1px solid ${getStatusColor(inv.payment_status)}40`,
                        padding: "4px 8px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        fontSize: "11px"
                      }}
                    >
                      {inv.payment_status}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#94a3b8" }}>{inv.user_name || "Sales Clerk"}</td>
                  <td>
                    <button 
                      onClick={() => handleOpenDetails(inv.invoice_id)}
                      style={{ padding: "6px 12px", background: "#334155", color: "white", fontSize: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Inspect Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#64748b" }}>No invoice transactions meet search criteria.</p>
        )}
      </div>

      {/* Detailed Modal view */}
      {selectedInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div className="card" style={{ width: "600px", textAlign: "left", padding: "30px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "12px", marginBottom: "16px" }}>
              <h2 style={{ color: "#38bdf8", margin: 0 }}>Invoice #{selectedInvoice.invoice_no}</h2>
              <span style={{ 
                background: `${getStatusColor(selectedInvoice.payment_status)}20`, 
                color: getStatusColor(selectedInvoice.payment_status), 
                padding: "4px 10px", 
                borderRadius: "12px", 
                fontWeight: "bold",
                fontSize: "13px"
              }}>
                {selectedInvoice.payment_status}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px", marginBottom: "20px" }}>
              <div>
                <span style={{ color: "#94a3b8" }}>Client Customer:</span><br/>
                <strong>{selectedInvoice.customer_name}</strong> ({selectedInvoice.customer_email || "No email"})
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>Order Clerk:</span><br/>
                <strong>{selectedInvoice.user_name || "System"}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>Billing Date:</span><br/>
                <strong>{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>Payment Due Date:</span><br/>
                <strong>{new Date(selectedInvoice.due_date).toLocaleDateString()}</strong>
              </div>
            </div>

            <h3 style={{ color: "#38bdf8", fontSize: "15px", marginBottom: "10px" }}>Order Line Items</h3>
            <table style={{ background: "transparent", fontSize: "13px", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th>Product Label</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "bold" }}>{item.product_name}</td>
                    <td>{item.quantity} units</td>
                    <td>₹{parseFloat(item.unit_price).toLocaleString("en-IN")}</td>
                    <td>₹{parseFloat(item.subtotal).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", borderTop: "1px solid #1e293b", paddingTop: "14px", alignItems: "flex-end", marginBottom: "20px" }}>
              <div><span style={{ color: "#94a3b8" }}>Subtotal:</span> <strong>₹{parseFloat(selectedInvoice.subtotal).toLocaleString("en-IN")}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>GST Tax (18%):</span> <strong>₹{parseFloat(selectedInvoice.tax || 0).toLocaleString("en-IN")}</strong></div>
              <div><span style={{ color: "#94a3b8" }}>Discount:</span> <strong>-₹{parseFloat(selectedInvoice.discount || 0).toLocaleString("en-IN")}</strong></div>
              <div style={{ fontSize: "16px", color: "#22c55e", fontWeight: "bold", marginTop: "4px" }}>
                Grand Total: ₹{parseFloat(selectedInvoice.total_amount).toLocaleString("en-IN")}
              </div>
            </div>

            {selectedInvoice.notes && (
              <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1e293b", fontSize: "12px", color: "#cbd5e1", marginBottom: "20px" }}>
                <strong>Remarks:</strong> {selectedInvoice.notes}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                type="button" 
                onClick={() => setSelectedInvoice(null)}
                style={{ flex: 1, padding: "12px", background: "#334155", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
              >
                Close details
              </button>
              <button 
                type="button" 
                onClick={() => handleDeleteInvoice(selectedInvoice.invoice_id)}
                style={{ padding: "12px 18px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
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