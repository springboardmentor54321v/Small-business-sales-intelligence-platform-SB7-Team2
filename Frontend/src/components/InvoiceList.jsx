import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Trash2,
  FileText,
  Receipt,
  CheckCircle2,
  Clock3,
  AlertCircle,
  X,
  CalendarDays,
  UserRound,
  CreditCard,
} from "lucide-react";
import api from "../api";
import "./InvoiceList.css";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setError(null);

      const response = await api.get("/api/invoices");

      setInvoices(response.data.invoices || []);
    } catch (err) {
      console.error(err);
      setError(
        err.formattedMessage ||
          "Failed to retrieve invoice records."
      );
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
      const response = await api.get(
        `/api/invoices/${invoiceId}`
      );

      setSelectedInvoice(response.data.invoice);
    } catch (err) {
      alert(
        err.formattedMessage ||
          "Failed to load invoice item details."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (
      !confirm(
        "Are you sure you want to delete this invoice? This will restore corresponding inventory stock quantities!"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/invoices/${invoiceId}`);

      alert("Invoice deleted successfully.");

      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert(
        err.formattedMessage ||
          "Failed to delete invoice."
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Unpaid":
        return "status-unpaid";
      case "Partial":
        return "status-partial";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle2 size={13} />;
      case "Unpaid":
        return <AlertCircle size={13} />;
      case "Partial":
        return <Clock3 size={13} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="invoice-loading">
        <div className="invoice-loading-spinner" />
        <span>Synchronizing invoice records...</span>
      </div>
    );
  }

  const filteredInvoices = invoices.filter((inv) => {
    const invoiceNumber =
      inv.invoice_no?.toLowerCase() || "";

    const customerName =
      inv.customer_name?.toLowerCase() || "";

    const search = searchTerm.toLowerCase();

    const matchesStatus =
      statusFilter === "All" ||
      inv.payment_status === statusFilter;

    const matchesSearch =
      invoiceNumber.includes(search) ||
      customerName.includes(search);

    return matchesStatus && matchesSearch;
  });

  const totalInvoices = invoices.length;

  const paidInvoices = invoices.filter(
    (invoice) => invoice.payment_status === "Paid"
  ).length;

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.payment_status === "Unpaid"
  ).length;

  const totalRevenue = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_amount || 0),
    0
  );

  return (
    <div className="invoice-page">

      {/* HEADER */}
      <section className="invoice-header">
        <div>
          <span className="invoice-eyebrow">
            FINANCE OPERATIONS
          </span>

          <h1>Invoice Management</h1>

          <p>
            Review billing records, payment status and
            transaction details from one centralized workspace.
          </p>
        </div>

        <div className="invoice-header-status">
          <span />
          LEDGER SYNCHRONIZED
        </div>
      </section>

      {/* SUMMARY */}
      <section className="invoice-summary-grid">

        <div className="invoice-summary-card">
          <div className="invoice-summary-icon blue">
            <Receipt size={19} />
          </div>

          <div>
            <span>Total Invoices</span>
            <strong>{totalInvoices}</strong>
          </div>
        </div>

        <div className="invoice-summary-card">
          <div className="invoice-summary-icon green">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Paid Invoices</span>
            <strong>{paidInvoices}</strong>
          </div>
        </div>

        <div className="invoice-summary-card">
          <div className="invoice-summary-icon red">
            <AlertCircle size={19} />
          </div>

          <div>
            <span>Unpaid Invoices</span>
            <strong>{unpaidInvoices}</strong>
          </div>
        </div>

        <div className="invoice-summary-card">
          <div className="invoice-summary-icon purple">
            <CreditCard size={19} />
          </div>

          <div>
            <span>Total Billed</span>
            <strong>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

      </section>

      {/* TOOLBAR */}
      <section className="invoice-toolbar">

        <div className="invoice-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search invoice number or customer..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="clear-search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="invoice-filter-group">
          {["All", "Paid", "Unpaid", "Partial"].map(
            (status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status
                    ? "invoice-filter active"
                    : "invoice-filter"
                }
                onClick={() =>
                  setStatusFilter(status)
                }
              >
                {status}
              </button>
            )
          )}
        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="invoice-error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* TABLE */}
      <section className="invoice-table-card">

        <div className="invoice-table-header">
          <div>
            <span className="invoice-section-label">
              BILLING RECORDS
            </span>

            <h2>Invoice Ledger</h2>

            <p>
              {filteredInvoices.length} invoice
              {filteredInvoices.length !== 1
                ? "s"
                : ""}{" "}
              matching current filters
            </p>
          </div>

          <FileText size={21} />
        </div>

        {filteredInvoices.length > 0 ? (
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Billing Date</th>
                  <th>Total Amount</th>
                  <th>Tax</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.invoice_id}>

                    <td>
                      <span className="invoice-number">
                        {inv.invoice_no}
                      </span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          <UserRound size={14} />
                        </div>

                        <span>
                          {inv.customer_name ||
                            "Walk-in customer"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="date-cell">
                        <CalendarDays size={13} />

                        {new Date(
                          inv.invoice_date
                        ).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <strong className="amount-cell">
                        ₹
                        {Number(
                          inv.total_amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      ₹
                      {Number(
                        inv.tax || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`invoice-status ${getStatusClass(
                          inv.payment_status
                        )}`}
                      >
                        {getStatusIcon(
                          inv.payment_status
                        )}

                        {inv.payment_status}
                      </span>
                    </td>

                    <td>
                      <span className="created-by">
                        {inv.user_name || "Sales Clerk"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="inspect-button"
                        onClick={() =>
                          handleOpenDetails(
                            inv.invoice_id
                          )
                        }
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="invoice-empty">
            <div className="invoice-empty-icon">
              <FileText size={24} />
            </div>

            <h3>No invoices found</h3>

            <p>
              No invoice records match your current
              search and filter criteria.
            </p>
          </div>
        )}

      </section>

      {/* DETAILS MODAL */}
      {selectedInvoice && (
        <div
          className="invoice-modal-overlay"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="invoice-modal-header">
              <div>
                <span className="invoice-section-label">
                  INVOICE DETAILS
                </span>

                <h2>
                  #{selectedInvoice.invoice_no}
                </h2>
              </div>

              <div className="modal-header-actions">

                <span
                  className={`invoice-status ${getStatusClass(
                    selectedInvoice.payment_status
                  )}`}
                >
                  {getStatusIcon(
                    selectedInvoice.payment_status
                  )}

                  {selectedInvoice.payment_status}
                </span>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setSelectedInvoice(null)
                  }
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            {modalLoading ? (
              <div className="modal-loading">
                <div className="invoice-loading-spinner" />
                <span>Loading invoice details...</span>
              </div>
            ) : (
              <>
                {/* CUSTOMER INFORMATION */}
                <div className="invoice-detail-grid">

                  <div className="invoice-detail-item">
                    <span>Customer</span>
                    <strong>
                      {selectedInvoice.customer_name ||
                        "Walk-in customer"}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Customer Email</span>
                    <strong>
                      {selectedInvoice.customer_email ||
                        "No email"}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Created By</span>
                    <strong>
                      {selectedInvoice.user_name ||
                        "System"}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Billing Date</span>
                    <strong>
                      {new Date(
                        selectedInvoice.invoice_date
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="invoice-detail-item">
                    <span>Payment Due</span>
                    <strong>
                      {new Date(
                        selectedInvoice.due_date
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                </div>

                {/* LINE ITEMS */}
                <div className="invoice-items-section">

                  <div className="invoice-modal-section-title">
                    <span className="invoice-section-label">
                      ORDER BREAKDOWN
                    </span>

                    <h3>Line Items</h3>
                  </div>

                  <div className="invoice-items-wrapper">
                    <table className="invoice-items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedInvoice.items?.map(
                          (item, index) => (
                            <tr key={index}>
                              <td>
                                <strong>
                                  {item.product_name}
                                </strong>
                              </td>

                              <td>
                                {item.quantity}
                              </td>

                              <td>
                                ₹
                                {Number(
                                  item.unit_price || 0
                                ).toLocaleString("en-IN")}
                              </td>

                              <td>
                                <strong>
                                  ₹
                                  {Number(
                                    item.subtotal || 0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </strong>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* TOTALS */}
                <div className="invoice-total-box">

                  <div>
                    <span>Subtotal</span>
                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.subtotal || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>GST Tax</span>
                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.tax || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>
                      -₹
                      {Number(
                        selectedInvoice.discount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="grand-total">
                    <span>Grand Total</span>
                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.total_amount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                </div>

                {/* NOTES */}
                {selectedInvoice.notes && (
                  <div className="invoice-notes">
                    <span>Remarks</span>
                    <p>{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="invoice-modal-actions">

                  <button
                    type="button"
                    className="modal-secondary-button"
                    onClick={() =>
                      setSelectedInvoice(null)
                    }
                  >
                    Close Details
                  </button>

                  <button
                    type="button"
                    className="modal-delete-button"
                    onClick={() =>
                      handleDeleteInvoice(
                        selectedInvoice.invoice_id
                      )
                    }
                  >
                    <Trash2 size={15} />
                    Delete Invoice
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default InvoiceList;