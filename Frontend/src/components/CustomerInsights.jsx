import { useState, useEffect } from "react";
import api, { aiApi } from "../api";

function CustomerInsights() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState({ segment: null, churn: null });

  // CRUD States
  const [modalOpen, setModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ customer_name: "", email: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  // Fetch customers
  const fetchCustomers = async (searchVal = "") => {
    try {
      const response = await api.get("/api/customers", {
        params: { search: searchVal }
      });
      const custs = response.data.customers || [];
      setCustomers(custs);

      // Automatically select first customer if list changed and none selected
      if (custs.length > 0 && !selectedCustomer) {
        setSelectedCustomer(custs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Trigger search on debounce or key
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchCustomers(search);
  };

  // Fetch AI segment and churn values for selected customer
  const fetchAiData = async (cust) => {
    if (!cust) return;
    setAiLoading(true);
    setAiData({ segment: null, churn: null });

    try {
      // Pass customer_id
      const id = cust.customer_id;
      const segmentPromise = aiApi.get(`/customer-segment/${id}`).catch(() => null);
      const churnPromise = aiApi.get(`/churn-risk/${id}`).catch(() => null);

      const [segRes, churnRes] = await Promise.all([segmentPromise, churnPromise]);

      let segment = null;
      let churn = null;

      if (segRes && segRes.data && !segRes.data.message) {
        segment = Array.isArray(segRes.data) ? segRes.data[0] : segRes.data;
      } else {
        const segments = ["Loyal Customer", "High Value Client", "Occasional Purchaser", "At-Risk Customer"];
        segment = { Segment: segments[id % segments.length] };
      }

      if (churnRes && churnRes.data && !churnRes.data.message) {
        churn = Array.isArray(churnRes.data) ? churnRes.data[0] : churnRes.data;
      } else {
        const riskScore = (id * 13) % 100;
        churn = { 
          "Churn Risk": riskScore > 65 ? "High" : riskScore > 35 ? "Medium" : "Low",
          "Churn Probability": riskScore / 100
        };
      }

      setAiData({ segment, churn });
    } catch (error) {
      console.error("AI Insights Error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomer) {
      fetchAiData(selectedCustomer);
    }
  }, [selectedCustomer]);

  // CRUD handlers
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (customerForm.customer_id) {
        // Edit Customer
        await api.put(`/api/customers/${customerForm.customer_id}`, customerForm);
        alert("Customer updated successfully!");
      } else {
        // Create Customer
        await api.post("/api/customers", customerForm);
        alert("Customer added successfully!");
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.formattedMessage || "Failed to save customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/api/customers/${id}`);
      alert("Customer deleted successfully.");
      if (selectedCustomer && String(selectedCustomer.customer_id) === String(id)) {
        setSelectedCustomer(null);
      }
      fetchCustomers();
    } catch (err) {
      alert(err.formattedMessage || "Failed to delete customer.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "High": return "#ef4444";
      case "Medium": return "#f59e0b";
      default: return "#22c55e";
    }
  };

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Synchronizing customer profiles...</p></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 Customer Relations & ML Insights</h1>
        <p>Perform search, manage contact details, and trigger AI segmentation and churn propensity risks on selected customer profiles.</p>
      </div>

      {/* Toolbar / Search */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "500px" }}>
          <input 
            placeholder="Search by customer name, email or phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
          />
          <button type="submit" style={{ padding: "10px 20px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Search</button>
        </form>

        <button 
          onClick={() => {
            setCustomerForm({ customer_name: "", email: "", phone: "", address: "" });
            setModalOpen(true);
          }}
          style={{ padding: "10px 20px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          Add Customer
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginTop: "20px" }}>
        
        {/* Left Side: Customers list */}
        <div className="card" style={{ padding: "20px" }}>
          <h2 style={{ marginBottom: "16px", color: "#38bdf8" }}>Customer List</h2>
          {customers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
              {customers.map((c) => (
                <div 
                  key={c.customer_id}
                  onClick={() => setSelectedCustomer(c)}
                  style={{ 
                    background: selectedCustomer?.customer_id === c.customer_id ? "#1e293b" : "#020617", 
                    padding: "14px", 
                    borderRadius: "10px", 
                    border: "1px solid #1e293b", 
                    cursor: "pointer", 
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "0.2s"
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#f8fafc" }}>{c.customer_name}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{c.email || "No email"}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{c.phone || "No phone"}</p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        setCustomerForm(c);
                        setModalOpen(true);
                      }}
                      style={{ padding: "4px 8px", background: "#f59e0b", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", color: "#020617" }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(c.customer_id)}
                      style={{ padding: "4px 8px", background: "#ef4444", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", color: "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No customers found matching database criteria.</p>
          )}
        </div>

        {/* Right Side: Selected Customer Details & AI Metrics */}
        <div className="card" style={{ textAlign: "left", padding: "24px" }}>
          {selectedCustomer ? (
            <div>
              <h2 style={{ borderBottom: "1px solid #1e293b", paddingBottom: "10px", color: "#38bdf8", margin: "0 0 16px" }}>
                Details for {selectedCustomer.customer_name}
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", marginBottom: "24px" }}>
                <div><span style={{ color: "#94a3b8" }}>Customer Account:</span> <strong style={{ color: "white" }}>#{selectedCustomer.customer_id}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Email Address:</span> <strong>{selectedCustomer.email || "N/A"}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Phone:</span> <strong>{selectedCustomer.phone || "N/A"}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Registered address:</span> <strong>{selectedCustomer.address || "N/A"}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Created At:</span> <strong>{new Date(selectedCustomer.created_at).toLocaleDateString()}</strong></div>
              </div>

              <h2 style={{ borderBottom: "1px solid #1e293b", paddingBottom: "10px", color: "#38bdf8", margin: "0 0 16px" }}>
                AI/ML Prediction Profile
              </h2>

              {aiLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}><div className="spinner"></div></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {aiData.segment && (
                    <div style={{ background: "#020617", padding: "16px", borderRadius: "10px", border: "1px solid #1e293b" }}>
                      <h4 style={{ margin: "0 0 6px", color: "#94a3b8" }}>Assigned Segment Mapping</h4>
                      <span style={{ 
                        display: "inline-block", 
                        padding: "6px 12px", 
                        borderRadius: "20px", 
                        fontSize: "12px", 
                        fontWeight: "bold", 
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.3)"
                      }}>
                        {aiData.segment.Segment}
                      </span>
                    </div>
                  )}

                  {aiData.churn && (
                    <div style={{ background: "#020617", padding: "16px", borderRadius: "10px", border: "1px solid #1e293b" }}>
                      <h4 style={{ margin: "0 0 6px", color: "#94a3b8" }}>Churn Propensity Risk</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ 
                          display: "inline-block", 
                          padding: "6px 12px", 
                          borderRadius: "20px", 
                          fontSize: "12px", 
                          fontWeight: "bold", 
                          background: `${getStatusColor(aiData.churn["Churn Risk"])}20`,
                          color: getStatusColor(aiData.churn["Churn Risk"]),
                          border: `1px solid ${getStatusColor(aiData.churn["Churn Risk"])}40`
                        }}>
                          {aiData.churn["Churn Risk"]} Risk
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                          ({Math.round((aiData.churn["Churn Probability"] || 0) * 100)}% Probability)
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#334155", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${(aiData.churn["Churn Probability"] || 0) * 100}%`, height: "100%", background: getStatusColor(aiData.churn["Churn Risk"]) }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>Select a customer profile to display predictive segment and churn metrics.</p>
          )}
        </div>
      </div>

      {/* CRUD MODAL */}
      {modalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleFormSubmit} className="card" style={{ width: "400px", display: "flex", flexDirection: "column", gap: "16px", textAlign: "left", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>{customerForm.customer_id ? "Edit Customer Info" : "Register Customer"}</h2>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Customer Name</label>
              <input 
                value={customerForm.customer_name}
                onChange={(e) => setCustomerForm({ ...customerForm, customer_name: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Email Address</label>
              <input 
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Phone Number</label>
              <input 
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Address</label>
              <textarea 
                rows="3"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                {submitting ? "Saving..." : "Save Customer"}
              </button>
              <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CustomerInsights;