import React from 'react';

function buildHierarchy(treeArray, n) {
  if (!treeArray || n <= 0) return null;

  function build(nodeIdx, start, end, depth) {
    const val = treeArray[nodeIdx];
    const node = { nodeIndex: nodeIdx, start, end, value: val, depth, children: [] };
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      node.children.push(build(2 * nodeIdx + 1, start, mid, depth + 1));
      node.children.push(build(2 * nodeIdx + 2, mid + 1, end, depth + 1));
    }
    return node;
  }

  return build(0, 0, n - 1, 0);
}

function layoutTree(root, width) {
  const nodes = [];
  const links = [];
  let maxDepth = 0;

  function traverse(node, depth, leftFrac, rightFrac) {
    maxDepth = Math.max(maxDepth, depth);
    const x = ((leftFrac + rightFrac) / 2) * width;
    const y = 44 + depth * 74;
    const item = { ...node, x, y };
    nodes.push(item);

    if (node.children && node.children.length === 2) {
      const mid = (leftFrac + rightFrac) / 2;
      const leftItem = traverse(node.children[0], depth + 1, leftFrac, mid);
      const rightItem = traverse(node.children[1], depth + 1, mid, rightFrac);
      links.push({ from: item, to: leftItem });
      links.push({ from: item, to: rightItem });
    }
    return item;
  }

  traverse(root, 0, 0.04, 0.96);
  return { nodes, links, height: Math.max(360, (maxDepth + 2) * 76) };
}

export default function SegmentTreeView({ result, steps = [], stepIndex = -1 }) {
  if (!result || !result.treeArray) return null;

  const hierarchy = buildHierarchy(result.treeArray, result.arraySize);
  if (!hierarchy) return null;

  const width = 900;
  const { nodes, links, height } = layoutTree(hierarchy, width);

  // Accumulate overlap states up to current stepIndex
  const fullSet = new Set();
  const partialSet = new Set();
  const disjointSet = new Set();
  let activeNodeIdx = null;

  for (let i = 0; i <= stepIndex && i < steps.length; i++) {
    const s = steps[i];
    if (i === stepIndex) activeNodeIdx = s.nodeIndex;
    if (s.overlapState === 'FULL_OVERLAP') fullSet.add(s.nodeIndex);
    else if (s.overlapState === 'PARTIAL_OVERLAP') partialSet.add(s.nodeIndex);
    else if (s.overlapState === 'DISJOINT') disjointSet.add(s.nodeIndex);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div className="route-graph-container" style={{ minHeight: '340px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="route-graph-svg" role="img" aria-label="Segment Tree RMQ Visualization">
          <g>
            {links.map((l, idx) => (
              <line
                key={idx}
                x1={l.from.x}
                y1={l.from.y}
                x2={l.to.x}
                y2={l.to.y}
                stroke="rgba(169, 149, 199, 0.32)"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            ))}
          </g>
          <g>
            {nodes.map((node) => {
              const isActive = node.nodeIndex === activeNodeIdx;
              const isFull = fullSet.has(node.nodeIndex);
              const isPartial = partialSet.has(node.nodeIndex);
              const isDisjoint = disjointSet.has(node.nodeIndex);

              let stroke = '#F2A65A';
              let fill = '#231E30';
              if (isFull) {
                stroke = '#34D399';
                fill = 'rgba(52, 211, 153, 0.22)';
              } else if (isActive) {
                stroke = '#E47B65';
                fill = 'rgba(228, 123, 101, 0.25)';
              } else if (isPartial) {
                stroke = '#A995C7';
                fill = 'rgba(169, 149, 199, 0.2)';
              } else if (isDisjoint) {
                stroke = '#594F68';
                fill = 'rgba(35, 30, 48, 0.55)';
              }

              const rectW = Math.min(82, Math.max(58, width / Math.max(8, result.arraySize * 1.4)));

              return (
                <g key={node.nodeIndex} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    x={-rectW / 2}
                    y={-21}
                    width={rectW}
                    height={42}
                    rx={6}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive || isFull ? 2.5 : 1.5}
                  />
                  <text y={-4} textAnchor="middle" fill="#A49BAE" fontSize="9.5" fontFamily="var(--font-mono)">
                    [{node.start}..{node.end}]
                  </text>
                  <text y={13} textAnchor="middle" fill={isFull ? '#34D399' : '#F6F0E7'} fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">
                    {node.value >= 1e12 ? '∞' : `₹${Math.round(node.value).toLocaleString()}`}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
