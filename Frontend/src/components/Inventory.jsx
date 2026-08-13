import { useEffect, useState } from "react";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Pencil,
  X,
  PackageCheck,
} from "lucide-react";
import api from "../api";
import "./Inventory.css";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    stock_quantity: "",
    reorder_level: "",
    warehouse_location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/inventory");
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
        warehouse_location: editForm.warehouse_location,
      });

      alert("Inventory record updated successfully!");

      setEditingItem(null);
      await fetchInventory();
    } catch (err) {
      alert(err.formattedMessage || "Failed to update inventory.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);

    setEditForm({
      stock_quantity: item.stock_quantity,
      reorder_level: item.reorder_level,
      warehouse_location: item.warehouse_location || "",
    });
  };

  const lowStockItems = inventory.filter(
    (item) => item.stock_quantity <= item.reorder_level
  );

  const healthyStockCount =
    inventory.length - lowStockItems.length;

  const displayItems = filterLowStock
    ? lowStockItems
    : inventory;

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="inventory-loading-icon">
          <Boxes size={28} />
        </div>

        <h2>Loading Inventory</h2>

        <p>Synchronizing warehouse records...</p>

        <RefreshCw className="inventory-spinner" size={18} />
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {/* HEADER */}
      <section className="inventory-header">
        <div>
          <span className="inventory-eyebrow">
            INVENTORY MANAGEMENT
          </span>

          <h1>Inventory & Stock Ledger</h1>

          <p>
            Monitor stock availability, warehouse locations and
            reorder thresholds across your product catalog.
          </p>
        </div>

        <button
          className="inventory-refresh"
          onClick={fetchInventory}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {/* KPI CARDS */}
      <section className="inventory-kpis">
        <div className="inventory-kpi">
          <div className="inventory-kpi-icon blue">
            <Boxes size={20} />
          </div>

          <div>
            <span>Total SKU Items</span>
            <strong>{inventory.length}</strong>
            <small>Unique products mapped</small>
          </div>
        </div>

        <div className="inventory-kpi danger">
          <div className="inventory-kpi-icon red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Low Stock Warnings</span>
            <strong>{lowStockItems.length}</strong>
            <small>Below threshold limits</small>
          </div>
        </div>

        <div className="inventory-kpi">
          <div className="inventory-kpi-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Healthy Stock</span>
            <strong>{healthyStockCount}</strong>
            <small>Sufficient stock levels</small>
          </div>
        </div>
      </section>

      {/* ALERT */}
      {lowStockItems.length > 0 && (
        <section className="inventory-alert">
          <div className="inventory-alert-content">
            <div className="inventory-alert-icon">
              <AlertTriangle size={18} />
            </div>

            <div>
              <strong>Stock attention required</strong>

              <p>
                {lowStockItems.length} product
                {lowStockItems.length !== 1 ? "s" : ""} are
                below their designated reorder threshold.
              </p>
            </div>
          </div>

          <button
            className={
              filterLowStock
                ? "inventory-alert-button active"
                : "inventory-alert-button"
            }
            onClick={() =>
              setFilterLowStock(!filterLowStock)
            }
          >
            {filterLowStock
              ? "Show All Items"
              : "View Low Stock"}
          </button>
        </section>
      )}

      {/* TABLE PANEL */}
      <section className="inventory-panel">
        <div className="inventory-panel-header">
          <div>
            <span className="inventory-section-label">
              STOCK OPERATIONS
            </span>

            <h2>Catalog Stock Levels</h2>

            <p>
              Review current stock, warehouse placement and
              reorder safety levels.
            </p>
          </div>

          <div className="inventory-filter">
            <button
              className={!filterLowStock ? "active" : ""}
              onClick={() => setFilterLowStock(false)}
            >
              All Items
            </button>

            <button
              className={filterLowStock ? "active danger" : ""}
              onClick={() => setFilterLowStock(true)}
            >
              Low Stock
            </button>
          </div>
        </div>

        {displayItems.length > 0 ? (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>SKU ID</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Available Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Last Synced</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {displayItems.map((item) => {
                  const isAlert =
                    item.stock_quantity <=
                    item.reorder_level;

                  return (
                    <tr key={item.inventory_id}>
                      <td>
                        <span className="inventory-sku">
                          SKU-
                          {String(item.inventory_id).padStart(
                            5,
                            "0"
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-product">
                          <div className="inventory-product-icon">
                            <Boxes size={16} />
                          </div>

                          <strong>{item.product_name}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="inventory-location">
                          <MapPin size={14} />

                          <span>
                            {item.warehouse_location ||
                              "Not assigned"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong
                          className={
                            isAlert
                              ? "stock-value danger"
                              : "stock-value healthy"
                          }
                        >
                          {item.stock_quantity}
                        </strong>

                        <span className="stock-unit">
                          units
                        </span>
                      </td>

                      <td>
                        <span className="reorder-value">
                          {item.reorder_level} units
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            isAlert
                              ? "inventory-status danger"
                              : "inventory-status healthy"
                          }
                        >
                          {isAlert ? (
                            <AlertTriangle size={13} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}

                          {isAlert
                            ? "Restock Required"
                            : "Stock Healthy"}
                        </span>
                      </td>

                      <td>
                        <span className="inventory-date">
                          {new Date(
                            item.last_updated
                          ).toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <button
                          className="inventory-edit"
                          onClick={() =>
                            openEditModal(item)
                          }
                        >
                          <Pencil size={14} />
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="inventory-empty">
            <PackageCheck size={36} />

            <h3>No inventory records</h3>

            <p>
              There are no inventory listings matching the
              selected filter.
            </p>
          </div>
        )}
      </section>

      {/* EDIT MODAL */}
      {editingItem && (
        <div
          className="inventory-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditingItem(null);
            }
          }}
        >
          <form
            className="inventory-modal"
            onSubmit={handleUpdateStock}
          >
            <div className="inventory-modal-header">
              <div>
                <span className="inventory-section-label">
                  INVENTORY UPDATE
                </span>

                <h2>Adjust Stock</h2>

                <p>
                  Update inventory values for{" "}
                  <strong>
                    {editingItem.product_name}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={() => setEditingItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inventory-form-group">
              <label>Available Stock Quantity</label>

              <input
                type="number"
                min="0"
                value={editForm.stock_quantity}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    stock_quantity: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="inventory-form-group">
              <label>Safety Reorder Level</label>

              <input
                type="number"
                min="0"
                value={editForm.reorder_level}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    reorder_level: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="inventory-form-group">
              <label>Warehouse Placement</label>

              <input
                placeholder="Shelf A-3, Room 2..."
                value={editForm.warehouse_location}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    warehouse_location: e.target.value,
                  })
                }
              />
            </div>

            <div className="inventory-modal-actions">
              <button
                type="button"
                className="inventory-cancel"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inventory-save"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={15} />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Inventory;