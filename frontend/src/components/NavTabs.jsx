import React from 'react';

const TABS = [
  { id: 'flight-deck', label: 'Flight Deck', icon: '🛫' },
  { id: 'passengers', label: 'Passengers & Bookings', icon: '👥' },
  { id: 'routes', label: 'Route Network', icon: '🌐' },
  { id: 'tree-index', label: 'Tree Indexing', icon: '🌲' },
  { id: 'fare-analytics', label: 'Fare Analytics', icon: '📊' },
  { id: 'sorting', label: 'Sorting Lab', icon: '⚡' },
];

export default function NavTabs({ activeTab, onSelectTab }) {
  return (
    <nav className="nav-tabs" aria-label="AEROOPS Operations Sections" role="navigation">
      <div className="container">
        <ul className="nav-tabs__list" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} role="presentation">
                <button
                  type="button"
                  className={`nav-tabs__btn ${isActive ? 'is-active' : ''}`}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`view-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                >
                  <span className="nav-tabs__icon" aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                  {tab.badge && (
                    <span
                      style={{
                        marginLeft: '0.4rem',
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#38bdf8' : '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
