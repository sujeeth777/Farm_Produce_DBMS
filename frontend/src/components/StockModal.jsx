import React, { useState } from 'react';

export default function StockModal({ show, onClose, onUpdate, item }) {
  const [amount, setAmount] = useState('50');

  if (!show || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const addKg = parseFloat(amount);
    if (isNaN(addKg)) return;
    const newStock = Math.max(0, (parseFloat(item.available_quantity) || 0) + addKg);
    onUpdate(item.produce_id, newStock);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content shadow border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-arrow-up-circle me-2 text-primary"></i>
              Restock {item.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="alert alert-info py-2 small mb-3">
                Current Stock: <strong>{item.available_quantity} kg</strong>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Stock Adjustment (+ / -) in KG</label>
                <input
                  type="number"
                  step="1"
                  className="form-control form-control-lg text-center fw-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
                <div className="form-text small">Enter positive kg to add fresh harvest, or negative to record spoilage.</div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm px-3">
                Confirm Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
