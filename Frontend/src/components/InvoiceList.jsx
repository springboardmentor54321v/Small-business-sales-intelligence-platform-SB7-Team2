import { useState, useEffect } from "react";
import api from "../api";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/invoices");

      setInvoices(response.data.invoices);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to fetch invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "green";

      case "Unpaid":
        return "red";

      case "Partial":
        return "orange";

      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <h2>Loading invoices...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="panel">
      <h1>Invoice List</h1>

      <table>
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Sales Person</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice.invoice_id}>
                <td>{invoice.invoice_no}</td>

                <td>{invoice.customer_name}</td>

                <td>{invoice.user_name}</td>

                <td>₹{Number(invoice.total_amount).toLocaleString()}</td>

                <td>
                  <span
                    style={{
                      background: getStatusColor(invoice.payment_status),
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {invoice.payment_status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceList;