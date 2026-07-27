import { useState, useEffect } from "react";
import api from "../api";

function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state to log payment
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [invoiceRes, paymentRes] = await Promise.all([
        api.get("/api/invoices"),
        api.get("/api/payments")
      ]);
      setInvoices(invoiceRes.data.invoices || []);
      setPayments(paymentRes.data.payments || []);
    } catch (err) {
      console.error(err);
      setError(err.formattedMessage || "Failed to load payment databases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice || !amountPaid) return;
    setSubmitting(true);

    try {
      await api.post("/api/payments", {
        invoice_id: selectedInvoice.invoice_id,
        amount_paid: parseFloat(amountPaid),
        payment_method: paymentMethod,
        transaction_reference: reference,
        remarks: remarks
      });
      alert("Payment recorded successfully!");
      setAmountPaid("");
      setReference("");
      setRemarks("");
      setSelectedInvoice(null);
      await fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Synchronizing billing & ledger transactions...</p></div>;
  }

  // Calculate Metrics
  const today = new Date();
  today.setHours(0,0,0,0);

  const paidInvoices = invoices.filter(i => i.payment_status === "Paid");
  const unpaidInvoices = invoices.filter(i => i.payment_status !== "Paid");

  const pendingInvoices = unpaidInvoices.filter(i => {
    const dueDate = new Date(i.due_date);
    return dueDate >= today;
  });

  const overdueInvoices = unpaidInvoices.filter(i => {
    const dueDate = new Date(i.due_date);
    return dueDate < today;
  });

  // Calculate sums
  const totalRevenue = invoices.reduce((acc, i) => acc + parseFloat(i.total_amount || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + parseFloat(p.amount_paid || 0), 0);
  const outstandingRevenue = totalRevenue - totalPaid;

  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + parseFloat(i.total_amount || 0), 0);

  return (
    <div className="panel">
      <h1>💳 Payments & Billing Ledger</h1>
      <p className="page-desc">
        Record payments, audit transaction references, and manage outstanding or overdue invoice balances.
      </p>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card" style={{ borderLeft: "4px solid #22c55e" }}>
          <h3 style={{ fontSize: "14px", color: "#64748b" }}>TOTAL COLLECTED REVENUE</h3>
          <h2 style={{ color: "#22c55e", fontSize: "28px" }}>₹{totalPaid.toLocaleString("en-IN")}</h2>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>From all paid invoices</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #eab308" }}>
          <h3 style={{ fontSize: "14px", color: "#64748b" }}>OUTSTANDING RECEIVABLES</h3>
          <h2 style={{ color: "#eab308", fontSize: "28px" }}>₹{outstandingRevenue > 0 ? outstandingRevenue.toLocaleString("en-IN") : 0}</h2>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>Unpaid active accounts</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #ef4444" }}>
          <h3 style={{ fontSize: "14px", color: "#64748b" }}>OVERDUE ACCOUNTS</h3>
          <h2 style={{ color: "#ef4444", fontSize: "28px" }}>₹{overdueAmount.toLocaleString("en-IN")}</h2>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>Past payment deadline</p>
        </div>
      </div>

      {/* Payment Entry Form (Modal Style Overlay) */}
      {selectedInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleRecordPayment} className="card" style={{ width: "450px", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>Record Invoice Payment</h2>
            <p style={{ color: "#cbd5e1", fontSize: "14px" }}>
              Invoice: <strong>{selectedInvoice.invoice_no}</strong><br/>
              Customer: <strong>{selectedInvoice.customer_name}</strong><br/>
              Total Balance: <strong>₹{parseFloat(selectedInvoice.total_amount).toLocaleString("en-IN")}</strong>
            </p>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Amount to Pay (₹)</label>
              <input 
                type="number" 
                max={parseFloat(selectedInvoice.total_amount)}
                min="0.01"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Method</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>Cheque</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Transaction Reference</label>
              <input 
                placeholder="TXN-XXXXXX"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Remarks</label>
              <textarea 
                rows="2"
                placeholder="Payment notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button 
                type="submit" 
                disabled={submitting}
                style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}
              >
                {submitting ? "Logging Payment..." : "Record Payment"}
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedInvoice(null)}
                style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Ledgers Lists */}
      <div className="card" style={{ marginTop: "24px" }}>
        <h2>Outstanding Accounts</h2>
        {unpaidInvoices.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Age</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unpaidInvoices.map((inv) => {
                const isOverdue = new Date(inv.due_date) < today;
                return (
                  <tr key={inv.invoice_id}>
                    <td>{inv.invoice_no}</td>
                    <td>{inv.customer_name}</td>
                    <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td>₹{parseFloat(inv.total_amount).toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "10px", 
                        fontSize: "11px", 
                        fontWeight: "bold",
                        background: inv.payment_status === "Partial" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: inv.payment_status === "Partial" ? "#f59e0b" : "#ef4444"
                      }}>
                        {inv.payment_status}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: isOverdue ? "#ef4444" : "#22c55e", fontWeight: "bold", fontSize: "12px" }}>
                        {isOverdue ? "🔥 OVERDUE" : "⏳ Active"}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        style={{ padding: "6px 12px", background: "#38bdf8", color: "#020617", fontSize: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Log Payment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#64748b" }}>All active accounts are fully settled.</p>
        )}
      </div>

      <div className="card" style={{ marginTop: "30px" }}>
        <h2>Billing Transaction History</h2>
        {payments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Amount Paid</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.payment_id}>
                  <td>PAY-{String(pay.payment_id).padStart(5, "0")}</td>
                  <td>{pay.invoice_no || "N/A"}</td>
                  <td>{pay.customer_name || "N/A"}</td>
                  <td style={{ color: "#22c55e", fontWeight: "bold" }}>₹{parseFloat(pay.amount_paid).toLocaleString("en-IN")}</td>
                  <td>{pay.payment_method}</td>
                  <td><code style={{ background: "transparent", color: "#38bdf8" }}>{pay.transaction_reference || "N/A"}</code></td>
                  <td>{new Date(pay.payment_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#64748b" }}>No payments logged in the history database.</p>
        )}
      </div>
    </div>
  );
}

export default Payments;
