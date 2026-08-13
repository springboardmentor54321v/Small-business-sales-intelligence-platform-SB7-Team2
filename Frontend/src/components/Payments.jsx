import { useState, useEffect } from "react";
import {
  CreditCard,
  WalletCards,
  AlertCircle,
  CheckCircle2,
  Clock3,
  CalendarDays,
  UserRound,
  Receipt,
  X,
  ArrowRight,
  History,
  CircleDollarSign,
  LoaderCircle,
} from "lucide-react";
import api from "../api";
import "./Payments.css";

function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);

      const [invoiceRes, paymentRes] = await Promise.all([
        api.get("/api/invoices"),
        api.get("/api/payments"),
      ]);

      setInvoices(invoiceRes.data.invoices || []);
      setPayments(paymentRes.data.payments || []);
    } catch (err) {
      console.error(err);

      setError(
        err.formattedMessage ||
          "Failed to load payment databases."
      );
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
        remarks: remarks,
      });

      alert("Payment recorded successfully.");

      setAmountPaid("");
      setReference("");
      setRemarks("");
      setSelectedInvoice(null);

      await fetchData();
    } catch (err) {
      alert(
        err.formattedMessage ||
          "Failed to record payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="payments-loading">
        <LoaderCircle className="payments-spinner" size={28} />
        <span>
          Synchronizing billing and ledger transactions...
        </span>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const paidInvoices = invoices.filter(
    (invoice) =>
      invoice.payment_status === "Paid"
  );

  const unpaidInvoices = invoices.filter(
    (invoice) =>
      invoice.payment_status !== "Paid"
  );

  const pendingInvoices = unpaidInvoices.filter(
    (invoice) => {
      const dueDate = new Date(invoice.due_date);
      return dueDate >= today;
    }
  );

  const overdueInvoices = unpaidInvoices.filter(
    (invoice) => {
      const dueDate = new Date(invoice.due_date);
      return dueDate < today;
    }
  );

  const totalRevenue = invoices.reduce(
    (sum, invoice) =>
      sum + parseFloat(invoice.total_amount || 0),
    0
  );

  const totalPaid = payments.reduce(
    (sum, payment) =>
      sum + parseFloat(payment.amount_paid || 0),
    0
  );

  const outstandingRevenue =
    totalRevenue - totalPaid;

  const overdueAmount =
    overdueInvoices.reduce(
      (sum, invoice) =>
        sum +
        parseFloat(invoice.total_amount || 0),
      0
    );

  return (
    <div className="payments-page">

      {/* HEADER */}
      <section className="payments-header">
        <div>
          <span className="payments-eyebrow">
            FINANCE OPERATIONS
          </span>

          <h1>Payments & Ledger</h1>

          <p>
            Monitor receivables, record customer payments
            and maintain a complete billing transaction
            history.
          </p>
        </div>

        <div className="ledger-status">
          <span />
          LEDGER SYNCHRONIZED
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="payments-error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI CARDS */}
      <section className="payment-kpi-grid">

        <div className="payment-kpi-card">
          <div className="payment-kpi-icon green">
            <CircleDollarSign size={19} />
          </div>

          <div>
            <span>Collected Revenue</span>

            <strong>
              ₹{totalPaid.toLocaleString("en-IN")}
            </strong>

            <small>
              From recorded payments
            </small>
          </div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-icon amber">
            <WalletCards size={19} />
          </div>

          <div>
            <span>Outstanding Receivables</span>

            <strong>
              ₹
              {outstandingRevenue > 0
                ? outstandingRevenue.toLocaleString(
                    "en-IN"
                  )
                : "0"}
            </strong>

            <small>
              {pendingInvoices.length} active account
              {pendingInvoices.length !== 1
                ? "s"
                : ""}
            </small>
          </div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-icon red">
            <AlertCircle size={19} />
          </div>

          <div>
            <span>Overdue Amount</span>

            <strong>
              ₹{overdueAmount.toLocaleString("en-IN")}
            </strong>

            <small>
              {overdueInvoices.length} overdue account
              {overdueInvoices.length !== 1
                ? "s"
                : ""}
            </small>
          </div>
        </div>

        <div className="payment-kpi-card">
          <div className="payment-kpi-icon blue">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Paid Invoices</span>

            <strong>
              {paidInvoices.length}
            </strong>

            <small>
              Successfully settled
            </small>
          </div>
        </div>

      </section>

      {/* OUTSTANDING ACCOUNTS */}
      <section className="payments-section">

        <div className="payments-section-header">

          <div>
            <span className="section-label">
              RECEIVABLES
            </span>

            <h2>Outstanding Accounts</h2>

            <p>
              Review unpaid invoices and record incoming
              payments.
            </p>
          </div>

          <div className="section-count">
            {unpaidInvoices.length} OPEN
          </div>

        </div>

        {unpaidInvoices.length > 0 ? (
          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Account State</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {unpaidInvoices.map((invoice) => {
                  const isOverdue =
                    new Date(invoice.due_date) <
                    today;

                  return (
                    <tr key={invoice.invoice_id}>

                      <td>
                        <span className="payment-invoice-number">
                          {invoice.invoice_no}
                        </span>
                      </td>

                      <td>
                        <div className="payment-customer">
                          <div className="payment-avatar">
                            <UserRound size={14} />
                          </div>

                          <span>
                            {invoice.customer_name ||
                              "Unknown Customer"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="payment-date">
                          <CalendarDays size={13} />

                          {new Date(
                            invoice.due_date
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <strong className="payment-amount">
                          ₹
                          {parseFloat(
                            invoice.total_amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            invoice.payment_status ===
                            "Partial"
                              ? "payment-status partial"
                              : "payment-status unpaid"
                          }
                        >
                          {invoice.payment_status ===
                          "Partial" ? (
                            <Clock3 size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}

                          {invoice.payment_status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            isOverdue
                              ? "account-state overdue"
                              : "account-state active"
                          }
                        >
                          <span className="state-dot" />

                          {isOverdue
                            ? "OVERDUE"
                            : "ACTIVE"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="record-payment-button"
                          onClick={() =>
                            setSelectedInvoice(
                              invoice
                            )
                          }
                        >
                          Record Payment
                          <ArrowRight size={14} />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>
        ) : (
          <div className="payments-empty">
            <div className="payments-empty-icon">
              <CheckCircle2 size={24} />
            </div>

            <h3>All accounts settled</h3>

            <p>
              There are currently no outstanding invoice
              balances.
            </p>
          </div>
        )}

      </section>

      {/* TRANSACTION HISTORY */}
      <section className="payments-section history-section">

        <div className="payments-section-header">

          <div>
            <span className="section-label">
              TRANSACTION HISTORY
            </span>

            <h2>Billing Ledger</h2>

            <p>
              Complete record of payments received
              through the platform.
            </p>
          </div>

          <div className="history-icon">
            <History size={19} />
          </div>

        </div>

        {payments.length > 0 ? (
          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id}>

                    <td>
                      <span className="receipt-id">
                        PAY-
                        {String(
                          payment.payment_id
                        ).padStart(5, "0")}
                      </span>
                    </td>

                    <td>
                      {payment.invoice_no || "N/A"}
                    </td>

                    <td>
                      <div className="payment-customer">
                        <div className="payment-avatar">
                          <UserRound size={14} />
                        </div>

                        <span>
                          {payment.customer_name ||
                            "N/A"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong className="collected-amount">
                        ₹
                        {parseFloat(
                          payment.amount_paid || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </td>

                    <td>
                      <span className="method-badge">
                        <CreditCard size={12} />
                        {payment.payment_method}
                      </span>
                    </td>

                    <td>
                      <code className="reference-code">
                        {payment.transaction_reference ||
                          "N/A"}
                      </code>
                    </td>

                    <td>
                      <div className="payment-date">
                        <CalendarDays size={13} />

                        {new Date(
                          payment.payment_date
                        ).toLocaleDateString()}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        ) : (
          <div className="payments-empty">
            <div className="payments-empty-icon">
              <Receipt size={24} />
            </div>

            <h3>No transactions recorded</h3>

            <p>
              Payment transactions will appear here after
              they are recorded.
            </p>
          </div>
        )}

      </section>

      {/* PAYMENT MODAL */}
      {selectedInvoice && (
        <div
          className="payment-modal-overlay"
          onClick={() =>
            !submitting &&
            setSelectedInvoice(null)
          }
        >
          <form
            className="payment-modal"
            onSubmit={handleRecordPayment}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="payment-modal-header">

              <div>
                <span className="section-label">
                  PAYMENT ENTRY
                </span>

                <h2>Record Invoice Payment</h2>
              </div>

              <button
                type="button"
                className="payment-modal-close"
                onClick={() =>
                  setSelectedInvoice(null)
                }
                disabled={submitting}
              >
                <X size={18} />
              </button>

            </div>

            {/* INVOICE CONTEXT */}
            <div className="payment-invoice-context">

              <div className="context-item">
                <span>Invoice</span>
                <strong>
                  {selectedInvoice.invoice_no}
                </strong>
              </div>

              <div className="context-item">
                <span>Customer</span>
                <strong>
                  {selectedInvoice.customer_name}
                </strong>
              </div>

              <div className="context-item">
                <span>Invoice Total</span>
                <strong>
                  ₹
                  {parseFloat(
                    selectedInvoice.total_amount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

            </div>

            {/* AMOUNT */}
            <div className="payment-form-field">

              <label>
                Amount to Pay
              </label>

              <div className="payment-amount-input">

                <span>₹</span>

                <input
                  type="number"
                  max={parseFloat(
                    selectedInvoice.total_amount
                  )}
                  min="0.01"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  required
                />

              </div>

              <small>
                Maximum accepted amount: ₹
                {parseFloat(
                  selectedInvoice.total_amount || 0
                ).toLocaleString("en-IN")}
              </small>

            </div>

            {/* METHOD */}
            <div className="payment-form-field">

              <label>
                Payment Method
              </label>

              <div className="payment-method-grid">

                {[
                  "Cash",
                  "UPI",
                  "Bank Transfer",
                  "Credit Card",
                  "Cheque",
                ].map((method) => (
                  <button
                    type="button"
                    key={method}
                    className={
                      paymentMethod === method
                        ? "payment-method-option active"
                        : "payment-method-option"
                    }
                    onClick={() =>
                      setPaymentMethod(
                        method
                      )
                    }
                  >
                    <CreditCard size={13} />
                    {method}
                  </button>
                ))}

              </div>

            </div>

            {/* REFERENCE */}
            <div className="payment-form-field">

              <label>
                Transaction Reference
              </label>

              <input
                type="text"
                placeholder="TXN-XXXXXX"
                value={reference}
                onChange={(e) =>
                  setReference(
                    e.target.value
                  )
                }
              />

            </div>

            {/* REMARKS */}
            <div className="payment-form-field">

              <label>
                Remarks
              </label>

              <textarea
                rows="3"
                placeholder="Add payment notes or transaction remarks..."
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
              />

            </div>

            {/* ACTIONS */}
            <div className="payment-modal-actions">

              <button
                type="button"
                className="payment-cancel-button"
                onClick={() =>
                  setSelectedInvoice(null)
                }
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="payment-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="payments-spinner"
                    />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Record Payment
                  </>
                )}
              </button>

            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default Payments;