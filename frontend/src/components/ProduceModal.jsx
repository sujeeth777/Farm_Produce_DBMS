import React, { useState, useEffect } from 'react';

export default function ProduceModal({ show, onClose, onSave, item, categories }) {
  const [formData, setFormData] = useState({
    produce_id: '',
    name: '',
    category_id: 1,
    category: 'Vegetable',
    price_per_kg: '',
    available_quantity: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        produce_id: item.produce_id || '',
        name: item.name || '',
        category_id: item.category_id || 1,
        category: item.category || item.categories?.category_name || 'Vegetable',
        price_per_kg: item.price_per_kg || '',
        available_quantity: item.available_quantity || '',
      });
    } else {
      setFormData({
        produce_id: '',
        name: '',
        category_id: categories[0]?.category_id || 1,
        category: categories[0]?.category_name || 'Vegetable',
        price_per_kg: '',
        available_quantity: '',
      });
    }
  }, [item, categories]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryChange = (e) => {
    const catId = parseInt(e.target.value, 10);
    const catObj = categories.find((c) => c.category_id === catId);
    setFormData({
      ...formData,
      category_id: catId,
      category: catObj ? catObj.category_name : 'General',
    });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil-square me-2 text-success"></i>
              {item ? `Edit Produce (${formData.produce_id})` : 'New Produce Item'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Produce Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alphonso Mango"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Category <span className="text-danger">*</span></label>
                <select className="form-select" value={formData.category_id} onChange={handleCategoryChange} required>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Price per KG (₹) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-control"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Stock (KG) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-control"
                    value={formData.available_quantity}
                    onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success btn-sm px-3">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
