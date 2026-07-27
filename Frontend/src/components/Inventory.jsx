import { useEffect, useState } from "react";
import api from "../api";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Edit stock state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ stock_quantity: "", reorder_level: "", warehouse_location: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const response = await api.get("/api/inventory");
      // Clean up response structure: response.data is directly the inventory list or contains success/inventory properties
      const list = response.data.inventory || response.data || [];
      setInventory(list);
    } catch (error) {
      console.error("Inventory API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Syncing warehouse logs...</p></div>;
  }

  // Calculate metrics
  const lowStockItems = inventory.filter(item => item.stock_quantity <= item.reorder_level);
  const displayItems = filterLowStock ? lowStockItems : inventory;

  return (
    <div className="panel">
      <h1>📦 Inventory & Stock Ledger</h1>
      <p className="page-desc">
        Track stock availability, warehouse placements, and modify warning reorder levels to prevent supply chain exhaustion.
      </p>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="card">
          <h3>TOTAL SKU ITEMS</h3>
          <h2>{inventory.length}</h2>
          <p>Unique products mapped</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #ef4444" }}>
          <h3 style={{ color: "#ef4444" }}>LOW STOCK WARNINGS</h3>
          <h2 style={{ color: "#ef4444" }}>{lowStockItems.length}</h2>
          <p>Below threshold limits</p>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #22c55e" }}>
          <h3>HEALTHY STOCK</h3>
          <h2 style={{ color: "#22c55e" }}>{inventory.length - lowStockItems.length}</h2>
          <p>Sufficient store volumes</p>
        </div>
      </div>

      {/* Low Stock Toast Alert Banner */}
      {lowStockItems.length > 0 && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fecaca", padding: "16px", borderRadius: "12px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
              Warning: {lowStockItems.length} products are running below their designated safety reorder thresholds!
            </p>
          </div>
          <button 
            onClick={() => setFilterLowStock(!filterLowStock)}
            style={{ padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            {filterLowStock ? "Show All Items" : "Filter Low Stock"}
          </button>
        </div>
      )}

      {/* Editing dialog overlay */}
      {editingItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleUpdateStock} className="card" style={{ width: "400px", display: "flex", flexDirection: "column", gap: "16px", textAlign: "left", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>Update Stock Quantities</h2>
            <p style={{ color: "#cbd5e1", fontSize: "14px" }}>Product: <strong>{editingItem.product_name}</strong></p>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Available Stock Quantity</label>
              <input 
                type="number" 
                min="0"
                value={editForm.stock_quantity}
                onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Safety Reorder Level</label>
              <input 
                type="number" 
                min="0"
                value={editForm.reorder_level}
                onChange={(e) => setEditForm({ ...editForm, reorder_level: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required 
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Warehouse Placement</label>
              <input 
                placeholder="Shelf A-3, Room 2..."
                value={editForm.warehouse_location}
                onChange={(e) => setEditForm({ ...editForm, warehouse_location: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                {submitting ? "Updating..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, background: "#334155", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>Catalog stock Levels</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => setFilterLowStock(false)}
              style={{ padding: "6px 12px", background: !filterLowStock ? "#38bdf8" : "#334155", color: !filterLowStock ? "#020617" : "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
            >
              All Items
            </button>
            <button 
              onClick={() => setFilterLowStock(true)}
              style={{ padding: "6px 12px", background: filterLowStock ? "#ef4444" : "#334155", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
            >
              Low Stock Only
            </button>
          </div>
        </div>

        {displayItems.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>SKU ID</th>
                <th>Product Label</th>
                <th>Warehouse Placement</th>
                <th>Available stock</th>
                <th>Reorder Safety Level</th>
                <th>Alert Status</th>
                <th>Last Synced</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item) => {
                const isAlert = item.stock_quantity <= item.reorder_level;
                return (
                  <tr key={item.inventory_id}>
                    <td>SKU-{String(item.inventory_id).padStart(5, "0")}</td>
                    <td style={{ fontWeight: "bold" }}>{item.product_name}</td>
                    <td>{item.warehouse_location || "Not assigned"}</td>
                    <td style={{ fontWeight: "bold", color: isAlert ? "#ef4444" : "#22c55e" }}>
                      {item.stock_quantity} units
                    </td>
                    <td>{item.reorder_level} units</td>
                    <td>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "10px", 
                        fontSize: "11px", 
                        fontWeight: "bold",
                        background: isAlert ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                        color: isAlert ? "#ef4444" : "#22c55e"
                      }}>
                        {isAlert ? "⚠️ Restock Promptly" : "✅ Stock Level Safe"}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                    <td>
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setEditForm({
                            stock_quantity: item.stock_quantity,
                            reorder_level: item.reorder_level,
                            warehouse_location: item.warehouse_location || ""
                          });
                        }}
                        style={{ padding: "6px 12px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#64748b" }}>No inventory listings recorded.</p>
        )}
      </div>
    </div>
  );
}

export default Inventory;