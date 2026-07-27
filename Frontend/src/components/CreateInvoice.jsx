import { useState, useEffect } from "react";
import api from "../api";

function CreateInvoice() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invoice Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  // Items in the current invoice
  const [invoiceItems, setInvoiceItems] = useState([
    { product_id: "", quantity: 1, unit_price: 0, stock_quantity: 0 }
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInvoiceOptions = async () => {
      try {
        const [custRes, prodRes, invRes] = await Promise.all([
          api.get("/api/customers"),
          // Fetch products catalog, but also fetch inventory to check stock
          api.get("/api/products"),
          api.get("/api/inventory")
        ]);

        const custs = custRes.data.customers || [];
        const prods = prodRes.data.products || [];
        const invList = invRes.data.inventory || invRes.data || [];

        // Join products with inventory stock levels
        const mappedProducts = prods.map(p => {
          const inv = invList.find(i => String(i.product_id) === String(p.product_id));
          return {
            ...p,
            stock_quantity: inv ? inv.stock_quantity : 0
          };
        });

        setCustomers(custs);
        setProducts(mappedProducts);

        if (custs.length > 0) setSelectedCustomerId(custs[0].customer_id);
        
        // Initialize first item dropdown
        if (mappedProducts.length > 0) {
          setInvoiceItems([
            { 
              product_id: mappedProducts[0].product_id, 
              quantity: 1, 
              unit_price: parseFloat(mappedProducts[0].price),
              stock_quantity: mappedProducts[0].stock_quantity
            }
          ]);
        }

        // Set default due date to 30 days from now
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 30);
        setDueDate(defaultDue.toISOString().split("T")[0]);

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
        stock_quantity: products[0].stock_quantity
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (invoiceItems.length === 1) return;
    setInvoiceItems(invoiceItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceItems];
    
    if (field === "product_id") {
      const prod = products.find(p => String(p.product_id) === String(value));
      if (prod) {
        updated[index].product_id = value;
        updated[index].unit_price = parseFloat(prod.price);
        updated[index].stock_quantity = prod.stock_quantity;
      }
    } else if (field === "quantity") {
      updated[index].quantity = parseInt(value, 10) || 1;
    }
    
    setInvoiceItems(updated);
  };

  // Calculations
  const subtotal = invoiceItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount - parseFloat(discountAmount || 0);

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || invoiceItems.length === 0) return;

    // Check stock quantities
    for (const item of invoiceItems) {
      if (item.quantity > item.stock_quantity) {
        alert(`Insufficient stock level for product item! Available: ${item.stock_quantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Decode user ID from token
      const profileRes = await api.get("/api/auth/profile");
      const userId = profileRes.data.user.user_id;

      const payload = {
        customer_id: parseInt(selectedCustomerId, 10),
        user_id: userId,
        due_date: dueDate,
        items: invoiceItems.map(item => ({
          product_id: parseInt(item.product_id, 10),
          quantity: item.quantity
        })),
        tax: taxAmount,
        discount: parseFloat(discountAmount || 0),
        notes: notes,
        payment_status: paymentStatus
      };

      const response = await api.post("/api/invoices", payload);
      alert(`Invoice ${response.data.invoice_no} created successfully!`);
      
      // Reset page inputs
      if (products.length > 0) {
        setInvoiceItems([
          { 
            product_id: products[0].product_id, 
            quantity: 1, 
            unit_price: parseFloat(products[0].price),
            stock_quantity: products[0].stock_quantity
          }
        ]);
      }
      setNotes("");
      setDiscountAmount(0);
      
    } catch (err) {
      alert(err.formattedMessage || "Failed to submit new invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Drafting sales billing layout...</p></div>;
  }

  return (
    <div className="panel">
      <h1>🧾 Generate Billing Invoice</h1>
      <p className="page-desc">
        Draft customer ledger billing sheets. This will automatically deduct inventory quantities and record accounts receivables.
      </p>

      <form onSubmit={handleSubmitInvoice} style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", marginTop: "20px" }}>
        
        {/* Main Details & Line Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Header metadata */}
          <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "left" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Customer Account</label>
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              >
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.customer_name} (#{c.customer_id})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Payment Deadline (Due Date)</label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>
          </div>

          {/* Line Items table list */}
          <div className="card" style={{ textAlign: "left" }}>
            <h2 style={{ color: "#38bdf8", marginBottom: "16px" }}>Billing Line Items</h2>
            
            <table style={{ background: "transparent" }}>
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Product Group Item</th>
                  <th style={{ width: "15%" }}>Stock Availability</th>
                  <th style={{ width: "15%" }}>Quantity</th>
                  <th style={{ width: "15%" }}>Unit Cost</th>
                  <th style={{ width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select 
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "white" }}
                      >
                        {products.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ color: item.stock_quantity > 0 ? "#22c55e" : "#ef4444", fontWeight: "bold", verticalAlign: "middle" }}>
                      {item.stock_quantity} units
                    </td>
                    <td>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "white" }}
                        required
                      />
                    </td>
                    <td style={{ verticalAlign: "middle", fontWeight: "bold" }}>
                      ₹{item.unit_price.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)}
                        style={{ padding: "8px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        disabled={invoiceItems.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button 
              type="button"
              onClick={handleAddItem}
              style={{ marginTop: "16px", padding: "10px 16px", background: "#334155", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            >
              + Add Item Row
            </button>
          </div>

          {/* Notes Card */}
          <div className="card" style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Invoice Remarks / Remarks</label>
            <textarea 
              rows="3"
              placeholder="Terms, bank accounts, declarations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Right Side: Totals calculation & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ textAlign: "left" }}>
            <h2 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>Summary</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Subtotal:</span>
                <span style={{ fontWeight: "bold" }}>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8" }}>Tax GST:</span>
                <span style={{ fontWeight: "bold" }}>18%</span>
              </div>

              <div>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "4px", fontSize: "12px" }}>Discount Deductions (₹)</label>
                <input 
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "white" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#94a3b8", marginBottom: "4px", fontSize: "12px" }}>Opening Status</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "white" }}
                >
                  <option value="Unpaid">Unpaid / Outstanding</option>
                  <option value="Paid">Fully Paid</option>
                </select>
              </div>

              <div style={{ borderTop: "1px solid #1e293b", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                <span style={{ fontWeight: "bold", color: "#38bdf8" }}>Grand Total:</span>
                <span style={{ fontWeight: "bold", color: "#22c55e" }}>
                  ₹{totalAmount > 0 ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                </span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting || products.length === 0}
              style={{ 
                width: "100%", 
                marginTop: "20px", 
                background: "#38bdf8", 
                color: "#020617", 
                fontWeight: "bold", 
                padding: "14px", 
                borderRadius: "8px", 
                border: "none", 
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              {submitting ? "Writing Invoice..." : "Record & Print Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateInvoice;