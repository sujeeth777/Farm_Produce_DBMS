import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api.js';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    farm_name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      if (isRegister) {
        const res = await registerUser(formData);
        if (res.success && res.token) {
          localStorage.setItem('farmhub_token', res.token);
          localStorage.setItem('farmhub_user', JSON.stringify(res.user));
          if (onLoginSuccess) onLoginSuccess(res.user);
          navigate('/');
        }
      } else {
        const res = await loginUser({ email: formData.email, password: formData.password });
        if (res.success && res.token) {
          localStorage.setItem('farmhub_token', res.token);
          localStorage.setItem('farmhub_user', JSON.stringify(res.user));
          if (onLoginSuccess) onLoginSuccess(res.user);
          navigate('/');
        }
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await loginUser({
        email: 'farmer@farmhub.com',
        password: 'Password123!',
      });
      if (res.success && res.token) {
        localStorage.setItem('farmhub_token', res.token);
        localStorage.setItem('farmhub_user', JSON.stringify(res.user));
        if (onLoginSuccess) onLoginSuccess(res.user);
        navigate('/');
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Demo login error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow border-0 p-3 p-md-4">
            <div className="text-center mb-4">
              <span className="brand-badge fs-2 p-3 mb-2 d-inline-flex" style={{ width: '56px', height: '56px' }}>
                🌱
              </span>
              <h3 className="fw-bold mb-1">FarmHub Portal</h3>
              <p className="text-muted small">MERN Stack Agricultural Management System</p>
            </div>

            {/* Tabs */}
            <ul className="nav nav-pills nav-fill mb-3 bg-light rounded p-1">
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm ${!isRegister ? 'active bg-success' : 'text-muted'}`}
                  onClick={() => setIsRegister(false)}
                >
                  Sign In
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn-sm ${isRegister ? 'active bg-success' : 'text-muted'}`}
                  onClick={() => setIsRegister(true)}
                >
                  Create Account
                </button>
              </li>
            </ul>

            {feedback && (
              <div className={`alert alert-${feedback.type} alert-dismissible fade show small mb-3`} role="alert">
                {feedback.message}
                <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh Patel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Farm / Business Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Green Meadows Agro Farm"
                      value={formData.farm_name}
                      onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="farmer@farmhub.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={6}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100 py-2 fw-semibold mb-3" disabled={loading}>
                {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Login */}
            <div className="alert alert-success-subtle border border-success-subtle rounded-3 p-3 mb-3 text-center">
              <small className="fw-bold text-success d-block mb-1">
                <i className="bi bi-lightning-charge-fill me-1"></i> IA3 Evaluation 1-Click Access
              </small>
              <p className="text-muted small mb-2">Test drive the complete system with a pre-configured farm manager:</p>
              <button
                type="button"
                className="btn btn-outline-success btn-sm w-100 fw-semibold"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                🚀 Log in as Demo Farm Manager
              </button>
            </div>

            <div className="text-center">
              <Link to="/" className="text-muted small text-decoration-none">
                &larr; Return to Dashboard as Guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
