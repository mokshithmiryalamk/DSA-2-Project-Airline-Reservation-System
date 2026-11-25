import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="container app-footer__inner">
        <p>
          AEROOPS &bull; Airline Reservation &amp; Flight Network Suite (React 18 + Spring Boot 3.3.5) &bull; Public Educational Portfolio Demo (Synthetic Data Only)
        </p>
        <p>
          Repository:{' '}
          <a
            href="https://github.com/mokshithmiryalamk/DSA-2-Project-Airline-Reservation-System"
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer__link"
          >
            mokshithmiryalamk/DSA-2-Project-Airline-Reservation-System
          </a>
        </p>
      </div>
    </footer>
  );
}
