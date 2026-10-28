import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchProduce, recordSale, fetchSales } from '../services/api.js';

export default function SalesPoint() {
  const location = useLocation();
  const [catalog, setCatalog] = useState([]);
  const [sales, setSales] = useState([]);
  const [salesMetrics, setSalesMetrics] = useState({ totalRevenue: 0, totalKg: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [selectedProduceId, setSelectedProduceId] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Ledger Filter
  const [filterProduceId, setFilterProduceId] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, salesRes] = await Promise.all([
        fetchProduce({ sort: 'name_asc' }),
        fetchSales({ produce_id: filterProduceId, sort: sortBy }),
      ]);

      if (prodRes.success) setCatalog(prodRes.data || []);
      if (salesRes.success) {
        setSales(salesRes.data || []);
        setSalesMetrics({
          totalRevenue: salesRes.total_revenue || 0,
          totalKg: salesRes.total_kg_sold || 0,
          count: salesRes.count || 0,
        });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterProduceId, sortBy]);

  // Check URL query param e.g. /sales?produce_id=P001
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('produce_id');
    if (pid && catalog.length > 0) {
      handleProduceChange(pid);
    }
  }, [location.search, catalog]);

  const handleProduceChange = (produceId) => {
    setSelectedProduceId(produceId);
    const item = catalog.find((p) => p.produce_id === produceId);
    if (item) {
      setUnitPrice(item.price_per_kg);
    } else {
      setUnitPrice('');
    }
  };

  const selectedItem = catalog.find((p) => p.produce_id === selectedProduceId);
  const calcQty = parseFloat(quantity) || 0;
  const calcPrice = parseFloat(unitPrice) || 0;
  const totalAmount = calcQty * calcPrice;
  const isOverStock = selectedItem && calcQty > selectedItem.available_quantity;

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (!selectedProduceId) {
      setFeedback({ type: 'warning', message: 'Please select a crop to sell.' });
      return;
    }

    if (calcQty <= 0) {
      setFeedback({ type: 'warning', message: 'Please enter a valid quantity greater than zero.' });
      return;
    }

    if (isOverStock) {
      setFeedback({
        type: 'danger',
        message: `Insufficient stock! Only ${selectedItem.available_quantity} kg available.`,
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await recordSale({
        produce_id: selectedProduceId,
        quantity_sold: calcQty,
        price_per_kg: calcPrice,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setQuantity('');
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Title */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Sales & POS Billing</h2>
        <p className="text-muted small mb-0">Record retail & wholesale produce transactions with live MongoDB stock deduction</p>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show mb-4`} role="alert">
          {feedback.message}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
        </div>
      )}

      {/* Top Section: POS Form & Metrics */}
      <div className="row g-4 mb-4">
        {/* Left: POS Form */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <span className="fw-bold">
                <i className="bi bi-cart-plus me-2 text-success"></i>
                Record New Customer Sale
              </span>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmitSale}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Select Produce Crop <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedProduceId}
                    onChange={(e) => handleProduceChange(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Harvested Crop --</option>
                    {catalog.map((p) => {
                      const isOut = p.available_quantity <= 0;
                      return (
                        <option key={p.produce_id} value={p.produce_id} disabled={isOut}>
                          {p.name} ({p.produce_id}) — {p.available_quantity} kg available [₹{p.price_per_kg}/kg]{' '}
                          {isOut ? '(OUT OF STOCK)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {selectedItem && (
                    <div className="form-text small mt-1">
                      {isOverStock ? (
                        <span className="text-danger fw-bold">
                          <i className="bi bi-x-circle me-1"></i> Stock shortage! Only {selectedItem.available_quantity} kg ready in warehouse.
                        </span>
                      ) : (
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i> Stock ready: {selectedItem.available_quantity} kg available.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Selling Price / kg (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="form-control"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Quantity Sold (KG) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 15"
                        required
                      />
                      <span className="input-group-text">kg</span>
                    </div>
                  </div>
                </div>

                {/* Total Invoice Banner */}
                <div className="bg-success-subtle border border-success-subtle rounded-3 p-3 mb-4 d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-uppercase text-success fw-bold d-block" style={{ fontSize: '0.75rem' }}>
                      Total Bill Amount
                    </small>
                    <span className="text-muted small">Live calculated: {calcQty} kg &times; ₹{calcPrice}</span>
                  </div>
                  <div className="fs-3 fw-bold text-success">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100 fw-bold shadow-sm"
                  disabled={submitting || isOverStock || !selectedProduceId}
                >
                  {submitting ? 'Recording Sale...' : 'Confirm & Complete Sale'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Metrics & Details */}
        <div className="col-lg-5">
          <div className="row g-3 mb-3">
            <div className="col-12">
              <div className="card shadow-sm border-0 p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                      Total Sales Revenue
                    </small>
                    <h3 className="fw-bold text-success mb-0">₹{salesMetrics.totalRevenue?.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className="p-3 bg-success-subtle rounded-3 text-success fs-3">
                    <i className="bi bi-wallet2"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="card shadow-sm border-0 p-3">
                <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                  Dispatched
                </small>
                <h4 className="fw-bold text-dark mb-0">{salesMetrics.totalKg?.toLocaleString()} kg</h4>
              </div>
            </div>

            <div className="col-6">
              <div className="card shadow-sm border-0 p-3">
                <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>
                  Orders
                </small>
                <h4 className="fw-bold text-dark mb-0">{salesMetrics.count}</h4>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 bg-light p-3">
            <h6 className="fw-bold mb-2">
              <i className="bi bi-shield-check text-success me-1"></i> Stock Integrity Guarantee
            </h6>
            <p className="small text-muted mb-0">
              When a sale is recorded, the backend verifies stock availability in MongoDB. It creates a new document in the <code>sales</code> collection and decrements the <code>available_quantity</code> in the <code>produces</code> collection atomically.
            </p>
          </div>
        </div>
      </div>

      {/* Sales Ledger */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="fw-bold">
            <i className="bi bi-journal-text me-2 text-primary"></i>
            Historical Sales Ledger
          </span>

          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filterProduceId}
              onChange={(e) => setFilterProduceId(e.target.value)}
            >
              <option value="all">All Produce Items</option>
              {catalog.map((p) => (
                <option key={p.produce_id} value={p.produce_id}>
                  {p.name} ({p.produce_id})
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
            </select>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Sale #</th>
                  <th>Produce Crop</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Rate</th>
                  <th>Total Billed</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Loading sales ledger...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No sales records found.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.sale_id}>
                      <td>
                        <span className="badge bg-light text-muted border">#{sale.sale_id}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{sale.produce?.name || sale.produce_name || sale.produce_id}</div>
                        <small className="text-muted">{sale.produce_id}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {sale.category || sale.produce?.categories?.category_name || 'General'}
                        </span>
                      </td>
                      <td>
                        <strong>{sale.quantity_sold}</strong> kg
                      </td>
                      <td>₹{sale.price_per_kg}</td>
                      <td>
                        <strong className="text-success">₹{sale.total_amount?.toLocaleString('en-IN')}</strong>
                      </td>
                      <td className="text-muted small">
                        {new Date(sale.sale_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
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
  );
}
