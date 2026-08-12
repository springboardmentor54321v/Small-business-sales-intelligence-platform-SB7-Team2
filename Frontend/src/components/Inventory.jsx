import { useEffect, useState } from "react";
import api from "../api";
import "./Milestone3.css";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  // Edit stock state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ stock_quantity: "", reorder_level: "", warehouse_location: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/inventory", {
        params: {
          search: activeSearch || undefined,
          stock_status: filterLowStock ? "low" : undefined,
          page,
          limit
        }
      });
      
      const list = response.data.inventory || [];
      setInventory(list);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Inventory API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, filterLowStock, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmitting(true);

    try {
      await api.put(`/api/inventory/${editingItem.inventory_id}`, {
        quantity: parseInt(editForm.stock_quantity, 10),
        reorder_level: parseInt(editForm.reorder_level, 10),
        warehouse_location: editForm.warehouse_location
      });
      alert("Inventory record updated successfully!");
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      alert(err.formattedMessage || "Failed to update inventory.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📦 Warehouse Inventory Ledger</h1>
        <p>Monitor available stock quantities, safety limits, and customize restock triggers to ensure operations continuity.</p>
      </div>

      {/* Toolbar Search and Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, maxWidth: "420px" }}>
          <input 
            placeholder="Search by product name or warehouse shelf..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(15, 23, 42, 0.6)", color: "white", flex: 1, fontSize: "14px" }}
          />
          <button 
            type="submit" 
            style={{ padding: "10px 16px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
          >
            Search
          </button>
          {activeSearch && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              style={{ padding: "10px 16px", background: "#1e293b", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => { setFilterLowStock(false); setPage(1); }}
            style={{ padding: "10px 18px", background: !filterLowStock ? "rgba(56, 189, 248, 0.15)" : "#1e293b", color: !filterLowStock ? "#38bdf8" : "#94a3b8", border: !filterLowStock ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
          >
            All Items
          </button>
          <button 
            onClick={() => { setFilterLowStock(true); setPage(1); }}
            style={{ padding: "10px 18px", background: filterLowStock ? "rgba(239, 68, 68, 0.15)" : "#1e293b", color: filterLowStock ? "#ef4444" : "#94a3b8", border: filterLowStock ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
          >
            ⚠️ Low Stock Warnings
          </button>
        </div>
      </div>

      {/* Editing Dialog Modal Overlay */}
      {editingItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, backdropFilter: "blur(6px)" }}>
          <form onSubmit={handleUpdateStock} className="card" style={{ width: "420px", display: "flex", flexDirection: "column", gap: "20px", textAlign: "left", padding: "30px", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "20px", fontWeight: "700" }}>Adjust Stock Parameters</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Product Name: <strong style={{ color: "white" }}>{editingItem.product_name}</strong></p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "13px" }}>Available Stock Quantity</label>
              <input 
                type="number" 
                min="0"
                value={editForm.stock_quantity}
                onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "#020617", color: "white", fontSize: "14px" }}
                required 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "13px" }}>Safety Reorder Threshold</label>
              <input 
                type="number" 
                min="0"
                value={editForm.reorder_level}
                onChange={(e) => setEditForm({ ...editForm, reorder_level: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "#020617", color: "white", fontSize: "14px" }}
                required 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#cbd5e1", fontWeight: "600", fontSize: "13px" }}>Warehouse placement</label>
              <input 
                placeholder="Shelf X-01, Room A"
                value={editForm.warehouse_location}
                onChange={(e) => setEditForm({ ...editForm, warehouse_location: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "#020617", color: "white", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="card" style={{ padding: "0px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <div className="spinner"></div>
            <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "14px" }}>Syncing inventory logs...</p>
          </div>
        ) : inventory.length > 0 ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>SKU Code</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Product Name</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Warehouse Shelf</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Stock Quantity</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Safety Level</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Last Synced</th>
                    <th style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isAlert = item.stock_quantity <= item.reorder_level;
                    return (
                      <tr key={item.inventory_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }} className="table-row-hover">
                        <td style={{ padding: "16px 20px", fontWeight: "600", color: "#64748b" }}>SKU-{String(item.inventory_id).padStart(5, "0")}</td>
                        <td style={{ padding: "16px 20px", fontWeight: "bold", color: "#f8fafc" }}>{item.product_name}</td>
                        <td style={{ padding: "16px 20px" }}>{item.warehouse_location || "Not assigned"}</td>
                        <td style={{ padding: "16px 20px", fontWeight: "bold", color: isAlert ? "#ef4444" : "#22c55e" }}>
                          {item.stock_quantity} units
                        </td>
                        <td style={{ padding: "16px 20px" }}>{item.reorder_level} units</td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: "12px", 
                            fontSize: "11px", 
                            fontWeight: "700",
                            background: isAlert ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                            color: isAlert ? "#ef4444" : "#22c55e",
                            border: isAlert ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(34, 197, 94, 0.25)"
                          }}>
                            {isAlert ? "⚠️ Restock" : "Safe"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: "12px", color: "#64748b" }}>
                          {new Date(item.last_updated).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <button 
                            onClick={() => {
                              setEditingItem(item);
                              setEditForm({
                                stock_quantity: item.stock_quantity,
                                reorder_level: item.reorder_level,
                                warehouse_location: item.warehouse_location || ""
                              });
                            }}
                            style={{ padding: "6px 12px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.target.style.background = "#38bdf8"; e.target.style.color = "#020617"; }}
                            onMouseLeave={(e) => { e.target.style.background = "rgba(56, 189, 248, 0.1)"; e.target.style.color = "#38bdf8"; }}
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar" style={{ padding: "16px 20px" }}>
              <span className="page-indicator">
                Showing Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong> ({totalItems} items total)
              </span>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            <h3>No inventory records found.</h3>
            <p>Try matching another search query or check warehouse sync settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;