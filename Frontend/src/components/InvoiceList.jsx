function InvoiceList() {

  const invoices = [

    {
      invoice: "INV001",
      customer: "John",
      product: "Laptop",
      quantity: 1,
      amount: 50000,
      status: "Paid",
    },

    {
      invoice: "INV002",
      customer: "Rahul",
      product: "Mouse",
      quantity: 2,
      amount: 1000,
      status: "Unpaid",
    },

    {
      invoice: "INV003",
      customer: "Priya",
      product: "Keyboard",
      quantity: 1,
      amount: 1500,
      status: "Partial",
    },

  ];

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

  return (

    <div className="panel">

      <h1>Invoice List</h1>

      <table>

        <thead>

          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {invoices.map((invoice) => (

            <tr key={invoice.invoice}>

              <td>{invoice.invoice}</td>

              <td>{invoice.customer}</td>

              <td>{invoice.product}</td>

              <td>{invoice.quantity}</td>

              <td>₹{invoice.amount}</td>

              <td>

                <span
                  style={{
                    background: getStatusColor(invoice.status),
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {invoice.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default InvoiceList;