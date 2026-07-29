import "./Milestone3.css";

function BusinessOverview() {
  return (
    <div className="page">

      <div className="page-header">
        <h1>📊 Business Overview</h1>
        <p>Complete business performance dashboard.</p>
      </div>

      <div className="cards">

        <div className="card">
          <h3>Total Revenue</h3>
          <h2>₹0</h2>
        </div>

        <div className="card">
          <h3>Total Sales</h3>
          <h2>0</h2>
        </div>

        <div className="card">
          <h3>Customers</h3>
          <h2>0</h2>
        </div>

        <div className="card">
          <h3>Alerts</h3>
          <h2>0</h2>
        </div>

      </div>

      <div className="chart-box">
        Revenue & Analytics (Coming Soon)
      </div>

    </div>
  );
}

export default BusinessOverview;