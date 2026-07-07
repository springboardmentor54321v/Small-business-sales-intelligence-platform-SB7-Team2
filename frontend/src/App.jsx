import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>MarketMind AI</h2>
        <p>Frontend Module</p>

        <nav>
          <a className="active">Dashboard</a>
          <a>Sales Upload</a>
          <a>Inventory</a>
          <a>Reports</a>
          <a>Logout</a>
        </nav>
      </aside>

      <main className="main">
        <section className="hero">
          <div>
            <h1>Small Business Sales Intelligence Platform</h1>
            <p>
              Sales dashboard, CSV upload interface, and role-based navigation
              for small business sales intelligence.
            </p>
          </div>
          <button>Business Owner</button>
        </section>

        <section className="cards">
          <div className="card">
            <h3>Total Revenue</h3>
            <h2>₹0</h2>
            <p>No sales data uploaded yet</p>
          </div>

          <div className="card">
            <h3>Total Sales</h3>
            <h2>0</h2>
            <p>Waiting for backend data</p>
          </div>

          <div className="card">
            <h3>Top Product</h3>
            <h2>None</h2>
            <p>No product data available</p>
          </div>
        </section>

        <section className="panel">
          <h2>Sales CSV Upload</h2>
          <div className="upload-box">
            <p>Drag and drop sales CSV file here</p>
            <button>Choose File</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
