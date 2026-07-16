function CustomerInsights() {

  const customers = [
    {
      name: "John",
      category: "Loyal"
    },
    {
      name: "Rahul",
      category: "Occasional"
    },
    {
      name: "Priya",
      category: "High Value"
    },
    {
      name: "Kumar",
      category: "Loyal"
    },
    {
      name: "Aisha",
      category: "High Value"
    }
  ];

  return (

    <div className="panel">

      <h1>Customer Insights</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}
      >

        <div className="card">
          <h2>45</h2>
          <p>Total Customers</p>
        </div>

        <div className="card">
          <h2>20</h2>
          <p>Loyal Customers</p>
        </div>

        <div className="card">
          <h2>8</h2>
          <p>High Value Customers</p>
        </div>

      </div>

      <div className="card">

        <h2>Customer Segmentation</h2>

        <table>

          <thead>

            <tr>
              <th>Customer</th>
              <th>Category</th>
            </tr>

          </thead>

          <tbody>

            {customers.map((customer) => (

              <tr key={customer.name}>

                <td>{customer.name}</td>

                <td>{customer.category}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div
        className="card"
        style={{
          marginTop: "30px",
          textAlign: "center"
        }}
      >

        <h2>Customer Insights Chart</h2>

        <div
          style={{
            height: "250px",
            border: "2px dashed #38bdf8",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px"
          }}
        >

          📈 Chart Placeholder

        </div>

      </div>

    </div>

  );

}

export default CustomerInsights;