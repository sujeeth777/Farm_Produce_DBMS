import React from 'react';

export default function MetricCard({ title, value, subtext, icon, color = 'success' }) {
  const bgClasses = {
    success: 'bg-success-subtle text-success border-success-subtle',
    warning: 'bg-warning-subtle text-warning border-warning-subtle',
    info: 'bg-info-subtle text-info border-info-subtle',
    primary: 'bg-primary-subtle text-primary border-primary-subtle',
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex align-items-center justify-content-between p-3">
        <div>
          <h6 className="card-subtitle text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            {title}
          </h6>
          <h3 className="card-title mb-1 fw-bold text-dark">{value}</h3>
          <small className="text-muted" style={{ fontSize: '0.8rem' }}>{subtext}</small>
        </div>
        <div className={`p-3 rounded-3 border ${bgClasses[color] || bgClasses.success} fs-3 d-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
}
