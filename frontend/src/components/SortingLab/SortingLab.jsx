import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { usePlayback } from '../shared/usePlayback';
import PlaybackControls from '../shared/PlaybackControls';
import SortingCanvas from './SortingCanvas';
import SortingControls from './SortingControls';
import BenchmarkView from './BenchmarkView';

function generateSampleArray(distribution, size = 12) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    if (distribution === 'sorted') arr.push(2500 + i * 450);
    else if (distribution === 'reverse') arr.push(2500 + (size - i) * 450);
    else if (distribution === 'duplicates') arr.push(3000 + (i % 4) * 1200);
    else arr.push(2200 + Math.round(((i * 73 + 19) % 13) * 550));
  }
  return arr;
}

export default function SortingLab() {
  const [algorithm, setAlgorithm] = useState('MERGE');
  const [distribution, setDistribution] = useState('random');
  const [customInput, setCustomInput] = useState('5200, 4800, 6100, 3900, 5400, 7200, 4300, 5800');
  const [syncWithFlights, setSyncWithFlights] = useState(false);
  const [benchmarkSize, setBenchmarkSize] = useState(500);
  const [result, setResult] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = result?.steps || [];
  const playback = usePlayback(steps, 450);

  const parseFares = useCallback(() => {
    const parts = customInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    return parts;
  }, [customInput]);

  const runSort = useCallback(async (algoOverride) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        algorithm: algoOverride || algorithm,
        syncWithFlights,
      };
      if (!syncWithFlights) {
        const parsed = parseFares();
        if (parsed.length === 0) {
          throw new Error('Please enter at least one valid numeric fare.');
        }
        payload.fares = parsed;
      }
      const res = await api.runSort(payload);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [algorithm, syncWithFlights, parseFares]);

  const runBenchmark = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runSortBenchmark({
        datasetSize: benchmarkSize,
        distribution,
        syncWithFlights,
      });
      setBenchmark(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [benchmarkSize, distribution, syncWithFlights]);

  useEffect(() => {
    runSort();
  }, [algorithm, syncWithFlights]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUseDistribution = () => {
    setSyncWithFlights(false);
    const sample = generateSampleArray(distribution, 12);
    setCustomInput(sample.join(', '));
  };

  return (
    <section id="view-sorting" className="view-section is-active" role="tabpanel" aria-labelledby="tab-sorting">
      <div className="section-header">
        <span className="section-pretitle">Comparative Fare Sorting &amp; JVM Benchmarking</span>
        <h2 className="section-title"><span>⚡</span> Sorting Laboratory &amp; Benchmark Suite</h2>
        <p className="section-desc">
          Animated comparison of Merge Sort, Quick Sort (strict Lomuto <code>fares[high]</code> pivot), and Heap Sort
          executed in Java 21 <code>com.aeroops.dsa.sorting</code>.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Active Engine</span>
            <span className="kpi-card__icon" aria-hidden="true">⚡</span>
          </div>
          <div className="kpi-card__value">{result?.algorithm || algorithm}</div>
          <p className="kpi-card__subtext">{result?.arraySize ?? 0} elements sorted</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Comparisons</span>
            <span className="kpi-card__icon" aria-hidden="true">⚖️</span>
          </div>
          <div className="kpi-card__value">{result?.comparisons ?? 0}</div>
          <p className="kpi-card__subtext">Exact Java comparison count</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Swaps / Moves</span>
            <span className="kpi-card__icon" aria-hidden="true">🔀</span>
          </div>
          <div className="kpi-card__value">{result?.swapsOrMoves ?? 0}</div>
          <p className="kpi-card__subtext">Array writes / exchanges</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">JVM Runtime</span>
            <span className="kpi-card__icon" aria-hidden="true">⏱️</span>
          </div>
          <div className="kpi-card__value">
            {result?.executionTimeNanos !== undefined ? `${(result.executionTimeNanos / 1000).toFixed(1)} µs` : '—'}
          </div>
          <p className="kpi-card__subtext">Measured via System.nanoTime()</p>
        </article>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <SortingControls
          algorithm={algorithm}
          onAlgorithmChange={(a) => setAlgorithm(a)}
          distribution={distribution}
          onDistributionChange={setDistribution}
          customInput={customInput}
          onCustomInputChange={setCustomInput}
          onUseDistribution={handleUseDistribution}
          syncWithFlights={syncWithFlights}
          onToggleSync={() => setSyncWithFlights((p) => !p)}
          onRunSort={() => runSort()}
          onRunBenchmark={runBenchmark}
          benchmarkSize={benchmarkSize}
          onBenchmarkSizeChange={setBenchmarkSize}
          loading={loading}
        />

        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {error}
          </div>
        )}

        <PlaybackControls
          playback={playback}
          title={result?.algorithm || 'Sorting Trace'}
          idleMessage="Click 'Run Sort in Java' to animate comparisons, pivots, and swaps."
        />

        <SortingCanvas
          result={result}
          currentStep={playback.currentStep}
          isComplete={playback.isComplete}
        />

        <BenchmarkView benchmark={benchmark} />
      </div>
    </section>
  );
}
