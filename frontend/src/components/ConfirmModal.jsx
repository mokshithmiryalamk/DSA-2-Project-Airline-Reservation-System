import React from 'react';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', onConfirm, onCancel, isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      <div
        className="modal-window"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title" id="confirm-modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className="text-sm text-secondary">{message}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
