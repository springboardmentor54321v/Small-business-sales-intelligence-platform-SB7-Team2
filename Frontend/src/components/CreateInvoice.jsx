import { useState } from "react";

function CreateInvoice() {

  const customers = [
    "John",
    "Rahul",
    "Priya"
  ];

  const products = [
    {
      id: 101,
      name: "Laptop",
      price: 50000,
    },
    {
      id: 102,
      name: "Mouse",
      price: 500,
    },
    {
      id: 103,
      name: "Keyboard",
      price: 1500,
    },
  ];

  const [customer, setCustomer] = useState(customers[0]);
  const [productId, setProductId] = useState(products[0].id);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const selectedProduct = products.find(
    (p) => p.id === Number(productId)
  );

  const total = selectedProduct.price * quantity;

  return (
    <div className="panel">

      <h1>Create Invoice</h1>

      <div className="form-group">

        <label>Customer</label>

        <select
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        >
          {customers.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label>Product</label>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Quantity</label>

        <input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <label>Unit Price</label>

        <input
          value={`₹${selectedProduct.price}`}
          readOnly
        />

        <label>Total</label>

        <input
          value={`₹${total}`}
          readOnly
        />

        <label>Payment Method</label>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Net Banking</option>
        </select>

        <label>Payment Status</label>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option>Paid</option>
          <option>Partial</option>
          <option>Unpaid</option>
        </select>

        <button
          style={{ marginTop: "20px" }}
          onClick={() =>
            alert("Invoice Created Successfully!")
          }
        >
          Create Invoice
        </button>

      </div>

    </div>
  );
}

export default CreateInvoice;