import { useState, useEffect } from "react";
import {
  FilePlus2,
  UserRound,
  CalendarDays,
  Package,
  Plus,
  Trash2,
  Receipt,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";
import api from "../api";
import "./CreateInvoice.css";

function CreateInvoice() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  const [invoiceItems, setInvoiceItems] = useState([
    {
      product_id: "",
      quantity: 1,
      unit_price: 0,
      stock_quantity: 0,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInvoiceOptions = async () => {
      try {
        const [custRes, prodRes, invRes] = await Promise.all([
          api.get("/api/customers"),
          api.get("/api/products"),
          api.get("/api/inventory"),
        ]);

        const custs = custRes.data.customers || [];
        const prods = prodRes.data.products || [];
        const invList =
          invRes.data.inventory || invRes.data || [];

        const mappedProducts = prods.map((p) => {
          const inv = invList.find(
            (i) =>
              String(i.product_id) ===
              String(p.product_id)
          );

          return {
            ...p,
            stock_quantity: inv
              ? inv.stock_quantity
              : 0,
          };
        });

        setCustomers(custs);
        setProducts(mappedProducts);

        if (custs.length > 0) {
          setSelectedCustomerId(custs[0].customer_id);
        }

        if (mappedProducts.length > 0) {
          setInvoiceItems([
            {
              product_id: mappedProducts[0].product_id,
              quantity: 1,
              unit_price: parseFloat(
                mappedProducts[0].price
              ),
              stock_quantity:
                mappedProducts[0].stock_quantity,
            },
          ]);
        }

        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 30);

        setDueDate(
          defaultDue.toISOString().split("T")[0]
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoiceOptions();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;

    setInvoiceItems([
      ...invoiceItems,
      {
        product_id: products[0].product_id,
        quantity: 1,
        unit_price: parseFloat(products[0].price),
        stock_quantity: products[0].stock_quantity,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (invoiceItems.length === 1) return;

    setInvoiceItems(
      invoiceItems.filter((_, idx) => idx !== index)
    );
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceItems];

    if (field === "product_id") {
      const prod = products.find(
        (p) =>
          String(p.product_id) === String(value)
      );

      if (prod) {
        updated[index].product_id = value;
        updated[index].unit_price = parseFloat(
          prod.price
        );
        updated[index].stock_quantity =
          prod.stock_quantity;
      }
    } else if (field === "quantity") {
      updated[index].quantity =
        parseInt(value, 10) || 1;
    }

    setInvoiceItems(updated);
  };

  const subtotal = invoiceItems.reduce(
    (acc, item) =>
      acc + item.unit_price * item.quantity,
    0
  );

  const taxAmount = (subtotal * taxRate) / 100;

  const totalAmount =
    subtotal +
    taxAmount -
    parseFloat(discountAmount || 0);

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();

    if (
      !selectedCustomerId ||
      invoiceItems.length === 0
    ) {
      return;
    }

    for (const item of invoiceItems) {
      if (item.quantity > item.stock_quantity) {
        alert(
          `Insufficient stock level for product item! Available: ${item.stock_quantity}, Requested: ${item.quantity}`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const profileRes = await api.get(
        "/api/auth/profile"
      );

      const userId =
        profileRes.data.user.user_id;

      const payload = {
        customer_id: parseInt(
          selectedCustomerId,
          10
        ),
        user_id: userId,
        due_date: dueDate,
        items: invoiceItems.map((item) => ({
          product_id: parseInt(
            item.product_id,
            10
          ),
          quantity: item.quantity,
        })),
        tax: taxAmount,
        discount: parseFloat(
          discountAmount || 0
        ),
        notes: notes,
        payment_status: paymentStatus,
      };

      const response = await api.post(
        "/api/invoices",
        payload
      );

      alert(
        `Invoice ${response.data.invoice_no} created successfully!`
      );

      if (products.length > 0) {
        setInvoiceItems([
          {
            product_id: products[0].product_id,
            quantity: 1,
            unit_price: parseFloat(
              products[0].price
            ),
            stock_quantity:
              products[0].stock_quantity,
          },
        ]);
      }

      setNotes("");
      setDiscountAmount(0);
    } catch (err) {
      alert(
        err.formattedMessage ||
          "Failed to submit new invoice."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-invoice-loading">
        <LoaderCircle
          size={28}
          className="invoice-loader"
        />
        <span>
          Loading invoice workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="create-invoice-page">

      {/* HEADER */}
      <section className="create-invoice-header">
        <div>
          <span className="create-invoice-eyebrow">
            FINANCE OPERATIONS
          </span>

          <h1>Create Invoice</h1>

          <p>
            Generate a new customer invoice with
            inventory-aware line items, tax,
            discounts and payment status.
          </p>
        </div>

        <div className="invoice-draft-status">
          <span />
          NEW INVOICE DRAFT
        </div>
      </section>

      <form
        onSubmit={handleSubmitInvoice}
        className="invoice-builder"
      >

        {/* MAIN COLUMN */}
        <div className="invoice-builder-main">

          {/* CUSTOMER */}
          <section className="invoice-form-card">

            <div className="invoice-card-header">
              <div className="invoice-card-title">
                <div className="invoice-card-icon">
                  <UserRound size={18} />
                </div>

                <div>
                  <span>
                    BILLING INFORMATION
                  </span>
                  <h2>Customer & Due Date</h2>
                </div>
              </div>
            </div>

            <div className="invoice-form-grid">

              <div className="invoice-field">
                <label>
                  Customer Account
                </label>

                <div className="invoice-input-wrap">
                  <UserRound size={15} />

                  <select
                    value={selectedCustomerId}
                    onChange={(e) =>
                      setSelectedCustomerId(
                        e.target.value
                      )
                    }
                    required
                  >
                    {customers.map((customer) => (
                      <option
                        key={customer.customer_id}
                        value={
                          customer.customer_id
                        }
                      >
                        {customer.customer_name} (#
                        {customer.customer_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="invoice-field">
                <label>
                  Payment Due Date
                </label>

                <div className="invoice-input-wrap">
                  <CalendarDays size={15} />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

            </div>
          </section>

          {/* LINE ITEMS */}
          <section className="invoice-form-card">

            <div className="invoice-card-header">
              <div className="invoice-card-title">
                <div className="invoice-card-icon">
                  <Package size={18} />
                </div>

                <div>
                  <span>
                    TRANSACTION DETAILS
                  </span>
                  <h2>Invoice Line Items</h2>
                </div>
              </div>

              <button
                type="button"
                className="add-item-button"
                onClick={handleAddItem}
                disabled={
                  products.length === 0
                }
              >
                <Plus size={15} />
                Add Item
              </button>
            </div>

            <div className="invoice-items-wrapper">

              <table className="create-invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Available Stock</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {invoiceItems.map(
                    (item, index) => (
                      <tr key={index}>

                        <td>
                          <select
                            value={
                              item.product_id
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product_id",
                                e.target.value
                              )
                            }
                          >
                            {products.map(
                              (product) => (
                                <option
                                  key={
                                    product.product_id
                                  }
                                  value={
                                    product.product_id
                                  }
                                >
                                  {
                                    product.product_name
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td>
                          <span
                            className={
                              item.stock_quantity >
                              0
                                ? "stock-available"
                                : "stock-empty"
                            }
                          >
                            {item.stock_quantity}
                            <small> units</small>
                          </span>
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            max={
                              item.stock_quantity
                            }
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            required
                          />
                        </td>

                        <td>
                          <span className="unit-price">
                            ₹
                            {Number(
                              item.unit_price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="line-total">
                            ₹
                            {(
                              item.unit_price *
                              item.quantity
                            ).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="remove-item-button"
                            onClick={() =>
                              handleRemoveItem(
                                index
                              )
                            }
                            disabled={
                              invoiceItems.length ===
                              1
                            }
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>
              </table>

            </div>

            <div className="items-footer">
              <span>
                {invoiceItems.length} item
                {invoiceItems.length !== 1
                  ? "s"
                  : ""}{" "}
                added to this invoice
              </span>

              <span>
                Inventory availability is checked
                before submission
              </span>
            </div>

          </section>

          {/* NOTES */}
          <section className="invoice-form-card">

            <div className="invoice-card-header">
              <div className="invoice-card-title">
                <div className="invoice-card-icon">
                  <FileText size={18} />
                </div>

                <div>
                  <span>
                    ADDITIONAL INFORMATION
                  </span>
                  <h2>Invoice Notes</h2>
                </div>
              </div>
            </div>

            <div className="invoice-field">
              <label>Remarks</label>

              <textarea
                rows="4"
                placeholder="Add payment terms, declarations or additional notes..."
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
              />
            </div>

          </section>

        </div>

        {/* SUMMARY COLUMN */}
        <aside className="invoice-summary-column">

          <section className="invoice-summary-card-main">

            <div className="summary-header">
              <div>
                <span>
                  INVOICE SUMMARY
                </span>

                <h2>Billing Overview</h2>
              </div>

              <Receipt size={20} />
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                GST
                <small>
                  {taxRate}%
                </small>
              </span>

              <strong>
                ₹
                {taxAmount.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div className="summary-control">
              <label>GST Rate</label>

              <select
                value={taxRate}
                onChange={(e) =>
                  setTaxRate(
                    Number(e.target.value)
                  )
                }
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div className="summary-control">
              <label>
                Discount Amount
              </label>

              <div className="summary-input">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) =>
                    setDiscountAmount(
                      parseFloat(
                        e.target.value
                      ) || 0
                    )
                  }
                />
              </div>
            </div>

            <div className="summary-control">
              <label>
                Payment Status
              </label>

              <div className="payment-status-options">

                <button
                  type="button"
                  className={
                    paymentStatus === "Unpaid"
                      ? "payment-option active unpaid"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentStatus(
                      "Unpaid"
                    )
                  }
                >
                  <AlertTriangle
                    size={14}
                  />
                  Unpaid
                </button>

                <button
                  type="button"
                  className={
                    paymentStatus === "Paid"
                      ? "payment-option active paid"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentStatus("Paid")
                  }
                >
                  <CheckCircle2
                    size={14}
                  />
                  Paid
                </button>

              </div>
            </div>

            <div className="summary-total">

              <span>Grand Total</span>

              <strong>
                ₹
                {totalAmount > 0
                  ? totalAmount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )
                  : "0.00"}
              </strong>

            </div>

            <div className="summary-note">
              <CreditCard size={14} />

              <span>
                Amount includes applicable GST and
                deductions.
              </span>
            </div>

            <button
              type="submit"
              className="create-invoice-button"
              disabled={
                submitting ||
                products.length === 0
              }
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="invoice-loader"
                  />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <FilePlus2 size={17} />
                  Create Invoice
                </>
              )}
            </button>

            <p className="submit-disclaimer">
              Inventory will be updated after
              successful invoice creation.
            </p>

          </section>

        </aside>

      </form>
    </div>
  );
}

export default CreateInvoice;