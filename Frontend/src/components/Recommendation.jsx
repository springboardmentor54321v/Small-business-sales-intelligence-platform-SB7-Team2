import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  Tag,
  IndianRupee,
  Boxes,
  X,
  RefreshCw,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";

import api, { aiApi } from "../api";
import "./Recommendation.css";

function Recommendation() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    product_name: "",
    category_id: "",
    price: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [prodRes, catRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/categories"),
      ]);

      const prods = prodRes.data.products || [];
      const cats = catRes.data.categories || [];

      setProducts(prods);
      setCategories(cats);

      if (prods.length > 0) {
        setSelectedProduct((current) => current || prods[0]);
      }
    } catch (err) {
      console.error("Product catalog error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        const matching = products
          .filter(
            (p) =>
              String(p.product_id) !== String(id) &&
              p.category_id === prod.category_id
          )
          .slice(0, 3);

        setRecommendations(
          matching.map((p) => ({
            "Product ID": p.product_id,
            "Product Name": p.product_name,
            Category: p.category_name || "General",
          }))
        );
      }
    } catch (err) {
      console.error("Recommendation error:", err);

      const matching = products
        .filter(
          (p) =>
            String(p.product_id) !== String(prod.product_id) &&
            p.category_id === prod.category_id
        )
        .slice(0, 3);

      setRecommendations(
        matching.map((p) => ({
          "Product ID": p.product_id,
          "Product Name": p.product_name,
          Category: p.category_name || "General",
        }))
      );
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchRecommendations(selectedProduct);
    }
  }, [selectedProduct]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (productForm.product_id) {
        await api.put(
          `/api/products/${productForm.product_id}`,
          productForm
        );

        alert("Product updated successfully!");
      } else {
        const response = await api.post("/api/products", productForm);

        await api
          .post("/api/inventory", {
            product_id: response.data.product.product_id,
            quantity: 20,
            reorder_level: 5,
          })
          .catch(() => null);

        alert("Product and inventory record created successfully!");
      }

      setModalOpen(false);

      setProductForm({
        product_name: "",
        category_id: "",
        price: "",
        description: "",
      });

      await fetchData();
    } catch (err) {
      alert(
        err.formattedMessage || "Failed to save product details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? All corresponding sale transactions and inventory will be locked or rejected."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/products/${id}`);

      alert("Product deleted successfully.");

      if (
        selectedProduct &&
        String(selectedProduct.product_id) === String(id)
      ) {
        setSelectedProduct(null);
      }

      await fetchData();
    } catch (err) {
      alert(
        err.formattedMessage || "Failed to delete product."
      );
    }
  };

  const openCreateModal = () => {
    setProductForm({
      product_name: "",
      category_id: categories[0]?.category_id || "",
      price: "",
      description: "",
    });

    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductForm({
      product_id: product.product_id,
      product_name: product.product_name || "",
      category_id: product.category_id || "",
      price: product.price || "",
      description: product.description || "",
    });

    setModalOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "All" ||
      String(product.category_id) === String(categoryFilter);

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      product.product_name?.toLowerCase().includes(search) ||
      product.category_name?.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="catalog-loading-icon">
          <Package size={28} />
        </div>

        <h2>Loading Product Catalog</h2>
        <p>Synchronizing products and categories...</p>

        <div className="catalog-spinner">
          <RefreshCw size={18} />
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      {/* PAGE HEADER */}
      <div className="catalog-header">
        <div>
          <div className="catalog-eyebrow">
            <span className="eyebrow-dot" />
            BUSINESS OPERATIONS
          </div>

          <h1>Products Catalog</h1>

          <p>
            Manage products, pricing, categories and AI-powered
            product recommendations.
          </p>
        </div>

        <button
          className="catalog-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="catalog-filter">
          <Tag size={17} />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.category_id}
                value={category.category_id}
              >
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="catalog-refresh-button"
          onClick={fetchData}
          title="Refresh catalog"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* SUMMARY */}
      <div className="catalog-summary">
        <div className="catalog-summary-item">
          <div className="summary-icon blue">
            <Package size={18} />
          </div>

          <div>
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>
        </div>

        <div className="catalog-summary-item">
          <div className="summary-icon green">
            <Tag size={18} />
          </div>

          <div>
            <span>Categories</span>
            <strong>{categories.length}</strong>
          </div>
        </div>

        <div className="catalog-summary-item">
          <div className="summary-icon purple">
            <BrainCircuit size={18} />
          </div>

          <div>
            <span>AI Recommendations</span>
            <strong>{recommendations.length}</strong>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="catalog-layout">
        {/* PRODUCT LIST */}
        <section className="catalog-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                PRODUCT INVENTORY
              </span>

              <h2>Active Products</h2>
            </div>

            <span className="product-count">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-list">
              {filteredProducts.map((product) => {
                const isSelected =
                  selectedProduct?.product_id === product.product_id;

                return (
                  <div
                    key={product.product_id}
                    className={`product-row ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="product-row-icon">
                      <Package size={20} />
                    </div>

                    <div className="product-row-info">
                      <h3>{product.product_name}</h3>

                      <span>
                        {product.category_name ||
                          "Uncategorized"}
                      </span>
                    </div>

                    <div className="product-row-price">
                      <span>Unit Price</span>
                      <strong>
                        ₹
                        {Number(product.price || 0).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div
                      className="product-row-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="icon-action edit"
                        onClick={() => openEditModal(product)}
                        title="Edit product"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="icon-action delete"
                        onClick={() =>
                          handleDelete(product.product_id)
                        }
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>

                      <ChevronRight
                        className="row-chevron"
                        size={18}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="catalog-empty">
              <Package size={34} />

              <h3>No products found</h3>

              <p>
                Try changing your search or category filter.
              </p>
            </div>
          )}
        </section>

        {/* DETAILS + AI */}
        <aside className="catalog-side">
          {selectedProduct ? (
            <>
              {/* PRODUCT DETAILS */}
              <section className="catalog-panel details-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">
                      SELECTED PRODUCT
                    </span>

                    <h2>{selectedProduct.product_name}</h2>
                  </div>

                  <div className="selected-product-icon">
                    <Package size={22} />
                  </div>
                </div>

                <div className="detail-price">
                  <span>Unit Retail Price</span>

                  <strong>
                    ₹
                    {Number(
                      selectedProduct.price || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <span>Product ID</span>
                    <strong>
                      #{selectedProduct.product_id}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Category</span>
                    <strong>
                      {selectedProduct.category_name ||
                        "General"}
                    </strong>
                  </div>
                </div>

                <div className="description-box">
                  <span>Description</span>

                  <p>
                    {selectedProduct.description ||
                      "No product description available."}
                  </p>
                </div>

                <button
                  className="edit-product-button"
                  onClick={() =>
                    openEditModal(selectedProduct)
                  }
                >
                  <Pencil size={16} />
                  Edit Product
                </button>
              </section>

              {/* AI RECOMMENDATIONS */}
              <section className="catalog-panel ai-panel">
                <div className="ai-heading">
                  <div className="ai-icon">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <span className="panel-eyebrow">
                      AI INTELLIGENCE
                    </span>

                    <h2>Frequently Purchased Together</h2>
                  </div>
                </div>

                <p className="ai-description">
                  AI-powered product associations based on the
                  selected catalog item.
                </p>

                {recsLoading ? (
                  <div className="recommendation-loading">
                    <RefreshCw size={20} />
                    <span>Generating recommendations...</span>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="recommendation-list">
                    {recommendations.map((item, index) => (
                      <div
                        className="recommendation-row"
                        key={index}
                      >
                        <div className="recommendation-number">
                          {index + 1}
                        </div>

                        <div className="recommendation-info">
                          <strong>
                            {item["Product Name"]}
                          </strong>

                          <span>
                            {item["Category"] ||
                              "General"}
                          </span>
                        </div>

                        <Sparkles size={16} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="recommendation-empty">
                    <BrainCircuit size={24} />

                    <p>
                      No product associations are currently
                      available.
                    </p>
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="catalog-panel select-product-panel">
              <Package size={40} />

              <h2>Select a Product</h2>

              <p>
                Choose a product from the catalog to view its
                details and AI recommendations.
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="product-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <form
            className="product-modal"
            onSubmit={handleProductSubmit}
          >
            <div className="modal-header">
              <div>
                <span className="panel-eyebrow">
                  PRODUCT MANAGEMENT
                </span>

                <h2>
                  {productForm.product_id
                    ? "Update Product"
                    : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="form-group">
              <label>Product Name</label>

              <input
                value={productForm.product_name}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    product_name: e.target.value,
                  })
                }
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                value={productForm.category_id}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    category_id: e.target.value,
                  })
                }
                required
              >
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Retail Price (₹)</label>

              <div className="price-input">
                <IndianRupee size={16} />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                rows="4"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the product..."
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="modal-save"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {productForm.product_id
                      ? "Update Product"
                      : "Save Product"}
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

export default Recommendation;