import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduce, fetchCategories } from '../services/api.js';

export default function AddProduce() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    produce_id: '',
    name: '',
    category_id: 1,
    category: 'Vegetable',
    price_per_kg: '',
    available_quantity: '',
  });

  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category_id: res.data[0].category_id,
              category: res.data[0].category_name,
            }));
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCategoryChange = (e) => {
    const catId = parseInt(e.target.value, 10);
    const catObj = categories.find((c) => c.category_id === catId);
    setFormData({
      ...formData,
      category_id: catId,
      category: catObj ? catObj.category_name : 'General',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        produce_id: formData.produce_id.trim() || undefined,
        name: formData.name.trim(),
        category_id: formData.category_id,
        category: formData.category,
        price_per_kg: parseFloat(formData.price_per_kg),
        available_quantity: parseFloat(formData.available_quantity),
      };

      const res = await createProduce(payload);
      if (res.success) {
        setFeedback({ type: 'success', message: `${payload.name} added to database successfully!` });
        setTimeout(() => {
          navigate('/produce');
        }, 800);
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
      setSubmitting(false);
    }
  };

  const currentPrice = parseFloat(formData.price_per_kg) || 0;
  const currentStock = parseFloat(formData.available_quantity) || 0;
  const previewStatus = currentStock <= 0 ? 'Out of Stock' : currentStock <= 20 ? 'Low Stock' : 'In Stock';
  const previewBadgeClass = currentStock <= 0 ? 'badge-stock-out' : currentStock <= 20 ? 'badge-stock-low' : 'badge-stock-in';

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Register New Produce</h2>
          <p className="text-muted small mb-0">Add new harvest inventory into the MongoDB database</p>
        </div>
        <Link to="/produce" className="btn btn-outline-secondary btn-sm">
          &larr; Back to Catalog
        </Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show mb-4`} role="alert">
          {feedback.message}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left: Input Form */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <span className="fw-bold">
                <i className="bi bi-card-checklist me-2 text-success"></i>
                Produce Specifications
              </span>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Produce ID <small className="text-muted">(leave blank to auto-generate)</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. P016"
                      value={formData.produce_id}
                      onChange={(e) => setFormData({ ...formData, produce_id: e.target.value.toUpperCase() })}
                    />
                    <div className="form-text small">Sequential ID (P001, P002...) assigned automatically if omitted.</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.category_id}
                      onChange={handleCategoryChange}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Produce / Crop Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Alphonso Mango, Basmati Rice, Ginger"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Price per KG (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="form-control"
                        placeholder="e.g. 55"
                        value={formData.price_per_kg}
                        onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Available Stock (KG) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="form-control"
                        placeholder="e.g. 150"
                        value={formData.available_quantity}
                        onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                        required
                      />
                      <span className="input-group-text">kg</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success px-4" disabled={submitting}>
                    {submitting ? 'Saving to Database...' : 'Save Produce to MongoDB'}
                  </button>
                  <Link to="/produce" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <span className="fw-bold">
                <i className="bi bi-eye-fill me-2 text-primary"></i>
                Catalog Live Preview
              </span>
            </div>
            <div className="card-body p-4">
              <div className="preview-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-light text-dark border">{formData.category}</span>
                  <span className={`badge ${previewBadgeClass} px-2 py-1`}>● {previewStatus}</span>
                </div>

                <h4 className="fw-bold mb-1 text-dark">
                  {formData.name.trim() || 'Crop Name Preview'}
                </h4>
                <p className="text-muted small mb-3">
                  Catalog ID: <strong className="text-success">{formData.produce_id || '(Auto-generated)'}</strong>
                </p>

                <div className="row g-2 bg-white rounded p-3 border">
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.72rem' }}>
                      Catalog Rate
                    </small>
                    <span className="fs-5 fw-bold text-dark">₹{currentPrice}</span>{' '}
                    <small className="text-muted">/ kg</small>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.72rem' }}>
                      Inventory Ready
                    </small>
                    <span className="fs-5 fw-bold text-success">{currentStock}</span>{' '}
                    <small className="text-muted">kg</small>
                  </div>
                </div>
              </div>

              <div className="alert alert-light border mt-3 small text-muted mb-0">
                <i className="bi bi-database me-1 text-success"></i>
                <strong>Full Stack MongoDB Integration:</strong> Form inputs are sent via Axios to the Express REST API endpoint <code>POST /api/produce</code>, which creates and persists the document in the <code>produces</code> collection.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
