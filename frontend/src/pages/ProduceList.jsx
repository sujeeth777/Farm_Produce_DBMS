import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProduce, fetchCategories, updateProduce, deleteProduce } from '../services/api.js';
import ProduceModal from '../components/ProduceModal.jsx';
import StockModal from '../components/StockModal.jsx';
import DeleteModal from '../components/DeleteModal.jsx';

export default function ProduceList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // Modals state
  const [editItem, setEditItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetchProduce({
          search: searchTerm,
          category_id: selectedCategory,
          stock_status: stockStatus,
          sort: sortBy,
        }),
        fetchCategories(),
      ]);

      if (prodRes.success) setItems(prodRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, stockStatus, sortBy]);

  // Handle live search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSaveProduce = async (formData) => {
    try {
      const res = await updateProduce(formData.produce_id, formData);
      if (res.success) {
        setFeedback({ type: 'success', message: `Produce ${formData.name} updated successfully!` });
        setShowEditModal(false);
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  const handleUpdateStock = async (produceId, newStock) => {
    try {
      const res = await updateProduce(produceId, { available_quantity: newStock });
      if (res.success) {
        setFeedback({ type: 'success', message: `Stock updated to ${newStock} kg!` });
        setShowStockModal(false);
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    }
  };

  const handleDeleteProduce = async (produceId) => {
    try {
      const res = await deleteProduce(produceId);
      if (res.success) {
        setFeedback({ type: 'success', message: `Produce ${produceId} deleted successfully.` });
        setShowDeleteModal(false);
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Produce Inventory (CRUD)</h2>
          <p className="text-muted small mb-0">Manage crop varieties, live stock quantities, and catalog pricing</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/add-produce" className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-lg"></i> Add New Produce
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show`} role="alert">
          {feedback.message}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by crop name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock (&gt;0 kg)</option>
                <option value="low">Low Stock (≤20 kg)</option>
                <option value="out">Out of Stock (0 kg)</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="price_asc">Price (Low-High)</option>
                <option value="price_desc">Price (High-Low)</option>
                <option value="stock_asc">Stock (Low-High)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Produce Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Item ID</th>
                  <th>Crop Name</th>
                  <th>Category</th>
                  <th>Price / kg</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-4" style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                      Loading inventory...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                      No produce found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isLow = item.available_quantity <= 20 && item.available_quantity > 0;
                    const isOut = item.available_quantity <= 0;
                    const badgeClass = isOut ? 'badge-stock-out' : isLow ? 'badge-stock-low' : 'badge-stock-in';
                    const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';

                    return (
                      <tr key={item.produce_id}>
                        <td>
                          <code className="fw-bold text-success">{item.produce_id}</code>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.name}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {item.category || item.categories?.category_name || 'General'}
                          </span>
                        </td>
                        <td>
                          <strong>₹{item.price_per_kg}</strong> <small className="text-muted">/ kg</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold">{item.available_quantity}</span> kg
                            <button
                              className="btn btn-outline-primary btn-sm py-0 px-2 small"
                              title="Restock"
                              onClick={() => {
                                setStockItem(item);
                                setShowStockModal(true);
                              }}
                            >
                              + Restock
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass} px-2 py-1`}>
                            ● {statusText}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-success"
                              title="Sell Crop"
                              onClick={() => navigate(`/sales?produce_id=${item.produce_id}`)}
                            >
                              <i className="bi bi-cart-check"></i>
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              title="Edit Details"
                              onClick={() => {
                                setEditItem(item);
                                setShowEditModal(true);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Delete Item"
                              onClick={() => {
                                setDeleteItem(item);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProduceModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProduce}
        item={editItem}
        categories={categories}
      />

      {/* Quick Stock Modal */}
      <StockModal
        show={showStockModal}
        onClose={() => setShowStockModal(false)}
        onUpdate={handleUpdateStock}
        item={stockItem}
      />

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProduce}
        item={deleteItem}
      />
    </div>
  );
}
