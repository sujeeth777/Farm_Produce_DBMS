import React from 'react';

export default function DeleteModal({ show, onClose, onConfirm, item }) {
  if (!show || !item) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
        <div className="modal-content shadow border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Confirm Deletion
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <p className="mb-2">
              Are you sure you want to remove <strong>{item.name}</strong> (<code>{item.produce_id}</code>) from the database?
            </p>
            <div className="alert alert-warning py-2 small mb-0">
              <i className="bi bi-info-circle me-1"></i>
              If sales transactions exist for this crop, the system preserves sales history and prevents accidental data deletion.
            </div>
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger btn-sm px-3" onClick={() => onConfirm(item.produce_id)}>
              Delete Produce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
