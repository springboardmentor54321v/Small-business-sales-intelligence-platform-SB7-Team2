import { useEffect, useState } from "react";
import axios from "axios";

function CustomerInsights() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerSegment();
  }, []);

  const fetchCustomerSegment = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/customer-segment/AA-10315"
      );

      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customer segment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h1>Customer Insights</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div className="card">
          <h2>{customers.length}</h2>
          <p>Total Customers</p>
        </div>

        <div className="card">
          <h2>-</h2>
          <p>Loyal Customers</p>
        </div>

        <div className="card">
          <h2>-</h2>
          <p>High Value Customers</p>
        </div>
      </div>

      <div className="card">
        <h2>Customer Segmentation</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Segment</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer, index) => (
                <tr key={index}>
                  <td>{customer["Customer ID"]}</td>
                  <td>{customer["Segment"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="card"
        style={{
          marginTop: "30px",
          textAlign: "center",
        }}
      >
        <h2>Customer Insights Chart</h2>

        <div
          style={{
            height: "250px",
            border: "2px dashed #38bdf8",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "22px",
          }}
        >
          📈 Chart Placeholder
        </div>
      </div>
    </div>
  );
}

export default CustomerInsights;