import React, { useState, useEffect } from 'react';

export default function Header({ backendConnected }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`UTC: ${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header" role="banner">
      <div className="container app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">✈️</div>
          <div className="app-header__titles">
            <h1 className="app-header__title">
              AEROOPS
              <span className="app-header__callsign">DS-204</span>
            </h1>
            <span className="app-header__subtitle">Airline Reservation &amp; Flight Network Suite</span>
          </div>
        </div>

        <div className="app-header__meta">
          <div className="utc-clock" id="live-utc-clock" aria-label="Live UTC Telemetry Clock">
            {utcTime || 'UTC: --:--:--'}
          </div>

          <div
            className="radar-status"
            aria-label={`System status: ${backendConnected ? 'Radar Active' : 'Offline'}`}
            style={!backendConnected ? { borderColor: 'var(--color-danger, #ef4444)' } : undefined}
          >
            <span
              className="radar-status__dot"
              aria-hidden="true"
              style={!backendConnected ? { background: 'var(--color-danger, #ef4444)', boxShadow: '0 0 8px #ef4444' } : undefined}
            ></span>
            <span>{backendConnected ? 'RADAR ACTIVE' : 'API OFFLINE'}</span>
          </div>

          <a
            href="https://github.com/mokshithmiryalamk/DSA-2-Project-Airline-Reservation-System"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-github"
            aria-label="View original Airline Reservation System repository on GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Repository ↗
          </a>
        </div>
      </div>
    </header>
  );
}
