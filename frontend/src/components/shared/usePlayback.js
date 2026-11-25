import { useState, useEffect, useCallback, useRef } from 'react';

export function usePlayback(steps = [], initialSpeedMs = 550) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(initialSpeedMs);
  const timerRef = useRef(null);

  const totalSteps = Array.isArray(steps) ? steps.length : 0;
  const isComplete = totalSteps > 0 && stepIndex >= totalSteps - 1;
  const currentStep = stepIndex >= 0 && stepIndex < totalSteps ? steps[stepIndex] : null;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset when steps array changes
  useEffect(() => {
    clearTimer();
    setIsPlaying(false);
    setStepIndex(totalSteps > 0 ? 0 : -1);
  }, [steps, totalSteps, clearTimer]);

  // Playback timer loop
  useEffect(() => {
    clearTimer();
    if (!isPlaying || totalSteps === 0) return undefined;

    if (stepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSteps - 1) {
          setIsPlaying(false);
          return totalSteps - 1;
        }
        return next;
      });
    }, speedMs);

    return clearTimer;
  }, [isPlaying, stepIndex, totalSteps, speedMs, clearTimer]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsPlaying(false);
      setStepIndex(totalSteps - 1);
      return;
    }

    if (stepIndex >= totalSteps - 1) {
      setStepIndex(0);
    } else if (stepIndex < 0) {
      setStepIndex(0);
    }
    setIsPlaying(true);
  }, [totalSteps, stepIndex]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const stepForward = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setStepIndex((prev) => (totalSteps === 0 ? -1 : Math.min(totalSteps - 1, prev + 1)));
  }, [totalSteps, clearTimer]);

  const stepBack = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setStepIndex((prev) => (totalSteps === 0 ? -1 : Math.max(0, prev - 1)));
  }, [totalSteps, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setStepIndex(totalSteps > 0 ? 0 : -1);
  }, [totalSteps, clearTimer]);

  const jumpToEnd = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    if (totalSteps > 0) setStepIndex(totalSteps - 1);
  }, [totalSteps, clearTimer]);

  return {
    stepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    isComplete,
    speedMs,
    setSpeedMs,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBack,
    reset,
    jumpToEnd,
    setStepIndex,
  };
}
