import React from 'react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type || 'info'}`}
          role="status"
        >
          <span className="toast__icon" aria-hidden="true">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
            {toast.type === 'warning' && '⚡'}
          </span>
          <div className="toast__content">
            {toast.title && <strong className="toast__title">{toast.title}</strong>}
            <span className="toast__message">{toast.message}</span>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
