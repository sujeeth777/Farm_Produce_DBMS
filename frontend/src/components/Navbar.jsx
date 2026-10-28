import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2" style={{ backgroundColor: '#1b4332 !important' }}>
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-badge">🌱</span>
          <span className="fs-5">FarmHub</span>
          <span className="badge bg-success ms-1 small">MERN IA3</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-white' : ''}`} to="/">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-white' : ''}`} to="/produce">
                <i className="bi bi-box-seam me-1"></i> Produce Inventory
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-white' : ''}`} to="/add-produce">
                <i className="bi bi-plus-circle me-1"></i> Add Produce
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold text-white' : ''}`} to="/sales">
                <i className="bi bi-receipt me-1"></i> Sales & POS
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-md-inline-block">
              <i className="bi bi-database-check me-1"></i> MongoDB Ready
            </span>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <h6 className="dropdown-header">{user.role || 'Farmer'}</h6>
                  </li>
                  <li>
                    <span className="dropdown-item-text small text-muted">{user.email}</span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-success btn-sm px-3">
                <i className="bi bi-box-arrow-in-right me-1"></i> Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
