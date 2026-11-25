import React from 'react';

function normalizeEdgeKey(a, b) {
  return `${a}-${b}`;
}

function edgeMatchesSet(edge, set) {
  if (!set || set.size === 0) return false;
  return (
    set.has(edge.id) ||
    set.has(normalizeEdgeKey(edge.source, edge.destination)) ||
    set.has(normalizeEdgeKey(edge.destination, edge.source))
  );
}

export default function GraphCanvas({
  nodes = [],
  edges = [],
  startNode,
  targetNode,
  currentStep,
  finalPath = [],
  finalMstEdges = [],
  isComplete = false,
  onNodeClick,
}) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const visitedSet = new Set(currentStep?.visitedNodes || []);
  const frontierSet = new Set(currentStep?.frontierNodes || []);
  const activeNode = currentStep?.currentNode || null;
  const highlightedEdgeSet = new Set(currentStep?.highlightedEdges || []);

  // Build final path edge set when playback reaches the end
  const finalPathEdgeSet = new Set();
  if (isComplete && Array.isArray(finalPath) && finalPath.length > 1) {
    for (let i = 0; i < finalPath.length - 1; i++) {
      finalPathEdgeSet.add(normalizeEdgeKey(finalPath[i], finalPath[i + 1]));
      finalPathEdgeSet.add(normalizeEdgeKey(finalPath[i + 1], finalPath[i]));
    }
  }

  const finalMstEdgeSet = new Set();
  if (isComplete && Array.isArray(finalMstEdges)) {
    finalMstEdges.forEach((e) => {
      finalMstEdgeSet.add(e.id);
      finalMstEdgeSet.add(normalizeEdgeKey(e.source, e.destination));
      finalMstEdgeSet.add(normalizeEdgeKey(e.destination, e.source));
    });
  }

  const finalPathNodeSet = new Set(isComplete ? finalPath : []);

  return (
    <div className="route-graph-container">
      <svg
        viewBox="0 0 900 520"
        preserveAspectRatio="xMidYMid meet"
        className="route-graph-svg"
        role="img"
        aria-label="National Route Network Graph Topology"
      >
        <defs>
          <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(242, 166, 90, 0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#radar-grid)" />

        <g className="radar-range-rings" aria-hidden="true">
          <circle cx="450" cy="260" r="130" fill="none" stroke="rgba(242, 166, 90, 0.06)" strokeDasharray="4 4" />
          <circle cx="450" cy="260" r="240" fill="none" stroke="rgba(242, 166, 90, 0.04)" strokeDasharray="6 6" />
          <circle cx="450" cy="260" r="350" fill="none" stroke="rgba(242, 166, 90, 0.03)" />
        </g>

        {/* Edges Layer */}
        <g className="layer-edges">
          {edges.map((edge) => {
            const u = nodeMap.get(edge.source);
            const v = nodeMap.get(edge.destination);
            if (!u || !v) return null;

            const isFinalPath = edgeMatchesSet(edge, finalPathEdgeSet);
            const isMst = edgeMatchesSet(edge, finalMstEdgeSet);
            const isActive = edgeMatchesSet(edge, highlightedEdgeSet);

            let stroke = 'rgba(164, 155, 174, 0.28)';
            let strokeWidth = 2;
            let dashArray = undefined;

            if (isFinalPath || isMst) {
              stroke = '#34D399';
              strokeWidth = 4;
            } else if (isActive) {
              stroke = '#F2A65A';
              strokeWidth = 3.5;
            } else if (edge.weight < 0) {
              stroke = '#E47B65';
              dashArray = '5 3';
            }

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g key={`${edge.source}-${edge.destination}`} className="graph-edge">
                <title>{`Air Corridor: ${edge.source} ↔ ${edge.destination} | ${edge.weight} km`}</title>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.25s ease, stroke-width 0.25s ease' }}
                />
                <rect
                  x={midX - 25}
                  y={midY - 9}
                  width={50}
                  height={18}
                  rx={4}
                  fill="#181521"
                  stroke={isFinalPath || isMst ? '#34D399' : isActive ? '#F2A65A' : 'rgba(164, 155, 174, 0.25)'}
                  strokeWidth={1}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isFinalPath || isMst ? '#6EE7B7' : isActive ? '#F2A65A' : '#A49BAE'}
                  fontSize="9.5"
                  fontFamily="var(--font-mono)"
                  fontWeight={isFinalPath || isMst || isActive ? 700 : 500}
                >
                  {edge.weight} km
                </text>
              </g>
            );
          })}
        </g>

        {/* Nodes Layer */}
        <g className="layer-nodes">
          {nodes.map((node) => {
            const isStart = node.id === startNode;
            const isTarget = node.id === targetNode;
            const isActive = node.id === activeNode;
            const isFinalNode = finalPathNodeSet.has(node.id);
            const isVisited = visitedSet.has(node.id);
            const isFrontier = frontierSet.has(node.id);

            let fill = '#231E30';
            let stroke = '#A995C7';
            let textFill = '#F6F0E7';
            let radius = 17;

            if (isActive) {
              fill = 'rgba(242, 166, 90, 0.28)';
              stroke = '#F2A65A';
              radius = 20;
            } else if (isFinalNode || isTarget) {
              fill = 'rgba(52, 211, 153, 0.22)';
              stroke = '#34D399';
            } else if (isStart) {
              fill = 'rgba(242, 166, 90, 0.22)';
              stroke = '#F2A65A';
            } else if (isVisited) {
              fill = 'rgba(169, 149, 199, 0.22)';
              stroke = '#A995C7';
            } else if (isFrontier) {
              fill = 'rgba(228, 123, 101, 0.22)';
              stroke = '#E47B65';
            }

            // Place BOM label above its circle so it never overlaps nearby PNQ
            const labelY = node.id === 'BOM' ? -radius - 6 : radius + 13;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onNodeClick && onNodeClick(node.id)}
                style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                role="button"
                tabIndex={0}
                aria-label={`Airport ${node.id} (${node.city})`}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onNodeClick) {
                    e.preventDefault();
                    onNodeClick(node.id);
                  }
                }}
              >
                <title>{`${node.id} — ${node.name} (${node.city}, ${node.state})`}</title>
                <circle
                  r={radius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive || isStart || isTarget || isFinalNode ? 3 : 2}
                  style={{ transition: 'all 0.2s ease' }}
                />
                <text
                  y={4}
                  textAnchor="middle"
                  fill={textFill}
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {node.id}
                </text>
                <text
                  y={labelY}
                  textAnchor="middle"
                  fill="#A49BAE"
                  fontSize="10"
                  fontFamily="var(--font-body)"
                >
                  {node.city}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
