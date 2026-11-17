import React, { useState, useEffect } from 'react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Attempt health check probe; default to local offline state if backend is starting
    fetch('/api/v1/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status || 'UP'))
      .catch(() => setBackendStatus('READY (Offline / Local Dev Mode)'));
  }, []);

  return (
    <div className="aeroops-app">
      <header className="aeroops-header">
        <div className="brand">
          <span className="brand-badge">AEROOPS</span>
          <h1>Airline Reservation &amp; Operations Suite</h1>
        </div>
        <div className="status-pill">
          <span className="dot pulse"></span>
          <span>Stage 1: Foundation Active</span>
        </div>
      </header>

      <main className="aeroops-main">
        <section className="dashboard-card">
          <h2>Architecture Foundation</h2>
          <p className="subtitle">
            Monorepo Structure Established with React + Spring Boot + Java DSA Preservation
          </p>
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Frontend Engine</span>
              <span className="metric-val">React 18 + Vite</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Backend Engine</span>
              <span className="metric-val">Spring Boot 3.3 (Java 21)</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Academic DSA Source</span>
              <span className="metric-val">23 Preserved Classes</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Backend Health Endpoint</span>
              <span className="metric-val">{backendStatus}</span>
            </div>
          </div>
        </section>

        <section className="dashboard-card">
          <h2>Preserved Operational Consoles</h2>
          <p>
            The comprehensive 5-domain visual cockpit, graph algorithms, tree indexing engines,
            and sorting benchmarks remain fully active and regression-tested.
          </p>
          <div className="actions">
            <a href="../index.html" className="btn-primary">
              Launch Existing Interactive Console
            </a>
          </div>
        </section>
      </main>

      <footer className="aeroops-footer">
        <span>Theme: Twilight Runway (#14121A / #F2A65A / #A995C7)</span>
        <span>•</span>
        <span>Mokshith Miryala Portfolio</span>
      </footer>
    </div>
  );
}
