import { useState, useEffect } from "react";
import api from "../api";

function CreateInvoice() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [dueDate, setDueDate] = useState("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [customerRes, productRes] = await Promise.all([
        api.get("/api/customers"),
        api.get("/api/products"),
      ]);

      setCustomers(customerRes.data.customers || []);
      setProducts(productRes.data.products || []);

      if (customerRes.data.customers?.length) {
        setCustomerId(customerRes.data.customers[0].customer_id);
      }

      if (productRes.data.products?.length) {
        setProductId(productRes.data.products[0].product_id);
      }

      setDueDate(new Date().toISOString().split("T")[0]);

    } catch (err) {
      console.error(err);
      alert("Failed to load customers and products.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct =
    products.find(
      (p) => Number(p.product_id) === Number(productId)
    ) || {};

  // Change this if your backend returns selling_price instead of price
  const price =
    Number(selectedProduct.price ?? selectedProduct.selling_price ?? 0);

  const subtotal = price * Number(quantity);

  const total =
    subtotal +
    Number(tax) -
    Number(discount);

  const handleCreateInvoice = async () => {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!productId) {
      alert("Please select a product.");
      return;
    }

    if (Number(quantity) <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/api/invoices", {
        customer_id: Number(customerId),
        user_id: user.user_id,
        due_date: dueDate,
        tax: Number(tax),
        discount: Number(discount),
        notes,
        items: [
          {
            product_id: Number(productId),
            quantity: Number(quantity),
          },
        ],
      });

      alert("Invoice created successfully!");

      setQuantity(1);
      setTax(0);
      setDiscount(0);
      setNotes("");

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to create invoice."
      );
    } finally {
      setSubmitting(false);
    }
  };
    
  
  return (
    <div className="panel">
      <h1>Create Invoice</h1>

      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <div className="form-group">

          <label>Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {customers.map((customer) => (
              <option
                key={customer.customer_id}
                value={customer.customer_id}
              >
                {customer.customer_name}
              </option>
            ))}
          </select>

          <label>Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((product) => (
              <option
                key={product.product_id}
                value={product.product_id}
              >
                {product.product_name}
              </option>
            ))}
          </select>

          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <label>Unit Price</label>
          <input
            type="text"
            readOnly
            value={`₹${price.toFixed(2)}`}
          />

          <label>Subtotal</label>
          <input
            type="text"
            readOnly
            value={`₹${subtotal.toFixed(2)}`}
          />

          <label>Tax</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
          />

          <label>Discount</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label>Notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <label>Total</label>
          <input
            type="text"
            readOnly
            value={`₹${total.toFixed(2)}`}
          />

          <button
            type="button"
            disabled={submitting}
            onClick={handleCreateInvoice}
          >
            {submitting ? "Creating Invoice..." : "Create Invoice"}
          </button>

        </div>
      )}
    </div>
  );
}

export default CreateInvoice;