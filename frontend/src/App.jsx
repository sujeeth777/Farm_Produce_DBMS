import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProduceList from './pages/ProduceList.jsx';
import AddProduce from './pages/AddProduce.jsx';
import SalesPoint from './pages/SalesPoint.jsx';
import Login from './pages/Login.jsx';
import { fetchCurrentUser } from './services/api.js';

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('farmhub_user');
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch (e) {
        // invalid json
      }
    }

    // Verify session with backend
    fetchCurrentUser()
      .then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem('farmhub_user', JSON.stringify(res.user));
        }
      })
      .catch(() => {
        // session expired
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('farmhub_token');
    localStorage.removeItem('farmhub_user');
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar user={currentUser} onLogout={handleLogout} />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produce" element={<ProduceList />} />
          <Route path="/add-produce" element={<AddProduce />} />
          <Route path="/sales" element={<SalesPoint />} />
          <Route path="/login" element={<Login onLoginSuccess={(u) => setCurrentUser(u)} />} />
        </Routes>
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          <span>🌱 FarmHub &copy; 2026 — Full Stack MERN (React, Bootstrap, Node.js, Express, MongoDB) for IA3 Assessment</span>
        </div>
      </footer>
    </div>
  );
}
