import { useState, useEffect } from "react";
import api, { aiApi } from "../api";

function Recommendation() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & AI recommendation
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // CRUD Forms State
  const [modalOpen, setModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({ product_name: "", category_id: "", price: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/categories")
      ]);
      const prods = prodRes.data.products || [];
      const cats = catRes.data.categories || [];
      
      setProducts(prods);
      setCategories(cats);

      if (prods.length > 0 && !selectedProduct) {
        setSelectedProduct(prods[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch recommendations whenever product selection changes
  const fetchRecommendations = async (prod) => {
    if (!prod) return;
    setRecsLoading(true);
    setRecommendations([]);

    try {
      const id = prod.product_id;
      const response = await aiApi.get(`/recommend-product/${id}`);
      if (response.data && !response.data.message) {
        setRecommendations(response.data);
      } else {
        // Fallback: recommend products of similar categories
        const matching = products
          .filter(p => String(p.product_id) !== String(id) && p.category_id === prod.category_id)
          .slice(0, 3);
        setRecommendations(matching.map(p => ({
          "Product ID": p.product_id,
          "Product Name": p.product_name,
          "Category": p.category_name || "General"
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchRecommendations(selectedProduct);
    }
  }, [selectedProduct]);

  // CRUD Handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (productForm.product_id) {
        // Edit Product
        await api.put(`/api/products/${productForm.product_id}`, productForm);
        alert("Product updated successfully!");
      } else {
        // Create Product
        const response = await api.post("/api/products", productForm);
        
        // Dynamically initialize inventory record for new products
        await api.post("/api/inventory", {
          product_id: response.data.product.product_id,
          quantity: 20, // Default opening stock
          reorder_level: 5
        }).catch(() => null);

        alert("Product and inventory record created successfully!");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to save product details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product? All corresponding sale transactions and inventory will be locked or rejected.")) return;
    try {
      await api.delete(`/api/products/${id}`);
      alert("Product deleted successfully.");
      if (selectedProduct && String(selectedProduct.product_id) === String(id)) {
        setSelectedProduct(null);
      }
      fetchData();
    } catch (err) {
      alert(err.formattedMessage || "Failed to delete product.");
    }
  };

  if (loading) {
    return <div className="panel"><div className="spinner"></div><p>Synchronizing product catalog...</p></div>;
  }

  const filteredProducts = categoryFilter === "All" 
    ? products 
    : products.filter(p => String(p.category_id) === String(categoryFilter));
console.log("Recommendation rendered");
  return (
    <div className="panel">
      <h1>📦 Product Catalog & Dynamic Recommendations</h1>
      <p className="page-desc">
        Manage retail goods, categorizations, and review item recommendations frequently purchased together.
      </p>

      {/* Toolbar / Category Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Filter Category:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155", background: "#020617", color: "white" }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => {
            setProductForm({ product_name: "", category_id: categories[0]?.category_id || "", price: "", description: "" });
            setModalOpen(true);
          }}
          style={{ padding: "10px 20px", background: "#38bdf8", color: "#020617", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          Add Product
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginTop: "20px" }}>
        
        {/* Left Side: Product listing */}
        <div className="card">
          <h2 style={{ marginBottom: "16px", color: "#38bdf8" }}>Active Products</h2>
          {filteredProducts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
              {filteredProducts.map((p) => (
                <div 
                  key={p.product_id}
                  onClick={() => setSelectedProduct(p)}
                  style={{ 
                    background: selectedProduct?.product_id === p.product_id ? "#1e293b" : "#020617", 
                    padding: "14px", 
                    borderRadius: "10px", 
                    border: "1px solid #1e293b", 
                    cursor: "pointer", 
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#f8fafc" }}>{p.product_name}</h3>
                    <span style={{ fontSize: "11px", color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                      {p.category_name || "Uncategorized"}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: "bold", color: "#22c55e" }}>₹{parseFloat(p.price).toLocaleString("en-IN")}</span>
                    <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          setProductForm(p);
                          setModalOpen(true);
                        }}
                        style={{ padding: "4px 8px", background: "#f59e0b", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", color: "#020617" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(p.product_id)}
                        style={{ padding: "4px 8px", background: "#ef4444", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", color: "white" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No products registered in catalog.</p>
          )}
        </div>

        {/* Right Side: Recommendation insights */}
        <div className="card" style={{ textAlign: "left", padding: "24px" }}>
          {selectedProduct ? (
            <div>
              <h2 style={{ borderBottom: "1px solid #1e293b", paddingBottom: "10px", color: "#38bdf8", margin: "0 0 16px" }}>
                Product details
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", marginBottom: "24px" }}>
                <div><span style={{ color: "#94a3b8" }}>Barcode Reference:</span> <strong>#{selectedProduct.product_id}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Group classification:</span> <strong>{selectedProduct.category_name || "General"}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Unit retail price:</span> <strong style={{ color: "#22c55e" }}>₹{parseFloat(selectedProduct.price).toLocaleString("en-IN")}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Features & description:</span> <strong>{selectedProduct.description || "N/A"}</strong></div>
              </div>

              <h2 style={{ borderBottom: "1px solid #1e293b", paddingBottom: "10px", color: "#38bdf8", margin: "0 0 16px" }}>
                Frequently Purchased Together
              </h2>

              {recsLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}><div className="spinner"></div></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recommendations.length > 0 ? (
                    recommendations.map((item, idx) => (
                      <div key={idx} style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1e293b", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "bold", color: "#f8fafc" }}>{item["Product Name"]}</span>
                        <span style={{ color: "#38bdf8" }}>{item["Category"]}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", fontSize: "13px" }}>No associations registered for this catalog item.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>Select a catalog item to render recommended matching goods.</p>
          )}
        </div>
      </div>

      {/* CRUD DIALOG */}
      {modalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <form onSubmit={handleProductSubmit} className="card" style={{ width: "400px", display: "flex", flexDirection: "column", gap: "16px", textAlign: "left", padding: "30px" }}>
            <h2 style={{ color: "#38bdf8" }}>{productForm.product_id ? "Update Product Details" : "Register Product"}</h2>
            
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Product Name</label>
              <input 
                value={productForm.product_name}
                onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Category</label>
              <select 
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              >
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Retail Price (₹)</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Description</label>
              <textarea 
                rows="3"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" disabled={submitting} style={{ flex: 1, background: "#38bdf8", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                {submitting ? "Saving..." : "Save Product"}
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

export default Recommendation;