import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard.jsx';
import { fetchDashboardSummary } from '../services/api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Loading farm analytics from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={loadData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, lowStockItems, recentSales, topSelling, categoryCounts } = data || {};

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Farm Executive Dashboard</h2>
          <p className="text-muted small mb-0">Real-time inventory and sales tracking backed by MongoDB / Express API</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/sales" className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-lg"></i> Record Sale
          </Link>
          <Link to="/add-produce" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-box-seam"></i> New Produce
          </Link>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="alert alert-warning border-warning-subtle shadow-sm mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-5 text-warning"></i>
            <div>
              <strong>Low Inventory Alert:</strong> {lowStockItems.length} items are running low on stock:{' '}
              {lowStockItems.map((i) => `${i.name} (${i.available_quantity}kg)`).join(', ')}.
            </div>
          </div>
          <Link to="/produce" className="btn btn-warning btn-sm fw-semibold">
            Manage Stock &rarr;
          </Link>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Produce Varieties"
            value={summary?.totalProduce || 0}
            subtext="Active crop catalog"
            icon="bi-flower1"
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Available Inventory"
            value={`${(summary?.totalInventoryKg || 0).toLocaleString()} kg`}
            subtext="Current storage volume"
            icon="bi-box-seam"
            color="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Total Revenue"
            value={`₹${(summary?.totalRevenue || 0).toLocaleString('en-IN')}`}
            subtext="Completed sales earnings"
            icon="bi-currency-rupee"
            color="info"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Transactions"
            value={summary?.totalSalesCount || 0}
            subtext="Processed sales orders"
            icon="bi-receipt"
            color="primary"
          />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="row g-4">
        {/* Left: Recent Sales */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold">
                <i className="bi bi-clock-history me-2 text-success"></i>
                Recent Sales Transactions
              </span>
              <Link to="/sales" className="btn btn-outline-success btn-sm">
                View Ledger &rarr;
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Produce Crop</th>
                      <th>Quantity</th>
                      <th>Rate / kg</th>
                      <th>Total (₹)</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!recentSales || recentSales.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No sales transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      recentSales.map((sale, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="fw-bold text-dark">{sale.produce?.name || sale.produce_name || sale.produce_id}</div>
                            <small className="text-muted">{sale.category || sale.produce?.categories?.category_name || 'Agri'}</small>
                          </td>
                          <td>
                            <span className="fw-semibold">{sale.quantity_sold}</span> kg
                          </td>
                          <td>₹{sale.price_per_kg}</td>
                          <td className="text-success fw-bold">₹{sale.total_amount?.toLocaleString('en-IN')}</td>
                          <td className="text-muted small">
                            {new Date(sale.sale_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Distribution & Top Crops */}
        <div className="col-lg-4">
          {/* Top Selling Crops */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <span className="fw-bold">
                <i className="bi bi-trophy-fill me-2 text-warning"></i>
                Top Selling Crops
              </span>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {!topSelling || topSelling.length === 0 ? (
                  <li className="list-group-item text-muted text-center py-3">No sales yet</li>
                ) : (
                  topSelling.map((crop, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-circle bg-light text-dark border p-2" style={{ width: '28px', height: '28px' }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="fw-semibold text-dark">{crop.name}</div>
                          <small className="text-muted">{crop.category} • {crop.sales_count} sales</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">₹{crop.total_revenue?.toLocaleString('en-IN')}</div>
                        <small className="text-muted">{crop.total_kg} kg</small>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <span className="fw-bold">
                <i className="bi bi-pie-chart-fill me-2 text-info"></i>
                Category Breakdown
              </span>
            </div>
            <div className="card-body">
              {categoryCounts &&
                Object.entries(categoryCounts).map(([cat, count], idx) => {
                  const pct = Math.round((count / (summary?.totalProduce || 1)) * 100);
                  return (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between small fw-semibold mb-1">
                        <span>{cat}</span>
                        <span className="text-muted">{count} items ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
