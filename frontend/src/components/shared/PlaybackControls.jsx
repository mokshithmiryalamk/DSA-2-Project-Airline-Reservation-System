import React from 'react';

export default function PlaybackControls({
  playback,
  idleMessage = 'Select parameters and run an algorithm to trace its execution step-by-step.',
  title = 'Algorithm Execution Trace',
}) {
  const {
    stepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    isComplete,
    speedMs,
    setSpeedMs,
    togglePlay,
    stepForward,
    stepBack,
    reset,
    jumpToEnd,
  } = playback;

  const hasSteps = totalSteps > 0;
  const displayStep = hasSteps && stepIndex >= 0 ? stepIndex + 1 : 0;
  const explanation = currentStep?.description || currentStep?.logMessage || currentStep?.message || idleMessage;

  return (
    <div
      className="playback-bar"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--primary btn--xs"
            onClick={togglePlay}
            disabled={!hasSteps}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? '⏸ Pause' : isComplete ? '↻ Replay' : '▶ Play'}
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--xs"
            onClick={stepBack}
            disabled={!hasSteps || stepIndex <= 0}
            aria-label="Step backward"
          >
            ⏮ Back
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--xs"
            onClick={stepForward}
            disabled={!hasSteps || stepIndex >= totalSteps - 1}
            aria-label="Step forward"
          >
            ⏭ Step
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--xs"
            onClick={reset}
            disabled={!hasSteps || stepIndex <= 0}
            aria-label="Reset playback"
          >
            ⟲ Reset
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--xs"
            onClick={jumpToEnd}
            disabled={!hasSteps || stepIndex >= totalSteps - 1}
            aria-label="Jump to final step"
          >
            ⏭| End
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>Speed:</span>
            <input
              type="range"
              min="100"
              max="1400"
              step="50"
              value={1500 - speedMs}
              onChange={(e) => setSpeedMs(1500 - Number(e.target.value))}
              aria-label="Animation speed"
              style={{ width: '96px', accentColor: 'var(--color-accent)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', minWidth: '48px' }}>{speedMs}ms</span>
          </label>

          <span
            className={`badge ${isComplete ? 'badge--green' : 'badge--amber'}`}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
          >
            {hasSteps ? `Step ${displayStep} / ${totalSteps}` : 'No Trace'}
          </span>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        style={{
          background: 'rgba(20, 18, 26, 0.7)',
          border: '1px solid var(--color-border)',
          borderLeft: '3px solid var(--color-accent)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-accent)',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.2rem',
            }}
          >
            {title} {currentStep?.action ? `• ${currentStep.action}` : ''}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            {explanation}
          </span>
        </div>
      </div>
    </div>
  );
}
