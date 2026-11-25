import React from 'react';

function renderBinaryLayout(root, width, height) {
  const nodes = [];
  const edges = [];
  let xCounter = 0;

  function assign(node, depth = 0) {
    if (!node) return null;
    const leftPos = assign(node.left, depth + 1);
    xCounter += 1;
    const pos = { node, xOrder: xCounter, depth };
    nodes.push(pos);
    const rightPos = assign(node.right, depth + 1);
    if (leftPos) edges.push({ from: pos, to: leftPos });
    if (rightPos) edges.push({ from: pos, to: rightPos });
    return pos;
  }

  assign(root, 0);
  const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
  const totalX = Math.max(1, xCounter);
  const xPad = 55;
  const usableW = width - xPad * 2;
  const levelH = Math.min(82, Math.max(54, (height - 90) / Math.max(1, maxDepth + 1)));

  nodes.forEach((n) => {
    n.x = totalX === 1 ? width / 2 : xPad + ((n.xOrder - 1) / (totalX - 1)) * usableW;
    n.y = 48 + n.depth * levelH;
  });

  return { nodes, edges };
}

function layoutMultiway(root, width) {
  const nodes = [];
  const edges = [];
  const leaves = [];

  if (!root) return { nodes, edges, leaves };

  // Compute subtree leaf widths so nodes never overlap
  function countLeaves(node) {
    if (!node) return 0;
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
  }

  function place(node, depth, xStart, xEnd) {
    const x = (xStart + xEnd) / 2;
    const y = 55 + depth * 95;
    const keys = node.keys || [];
    const boxW = Math.max(52, keys.length * 32 + 12);
    const item = { node, x, y, boxW, depth, keys };
    nodes.push(item);

    if (node.isLeaf || !node.children || node.children.length === 0) {
      leaves.push(item);
      return item;
    }

    const totalChildLeaves = countLeaves(node);
    let cursor = xStart;
    node.children.forEach((child) => {
      const childLeaves = countLeaves(child);
      const span = ((xEnd - xStart) * childLeaves) / Math.max(1, totalChildLeaves);
      const childItem = place(child, depth + 1, cursor, cursor + span);
      edges.push({ from: item, to: childItem });
      cursor += span;
    });

    return item;
  }

  place(root, 0, 24, width - 24);
  leaves.sort((a, b) => a.x - b.x);
  return { nodes, edges, leaves };
}

export default function TreeCanvas({
  treeType,
  root,
  currentStep,
  searchPath = [],
  found = null,
  matchedKeys = [],
}) {
  const width = 900;
  const height = 460;

  const stepHighlights = new Set(currentStep?.highlightedKeys || []);
  const matchedSet = new Set(matchedKeys || []);
  const searchSet = new Set(searchPath || []);

  if (!root) {
    return (
      <div className="tree-canvas-container">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="tree-canvas-svg">
          <text x={width / 2} y={height / 2 - 8} textAnchor="middle" fontSize="34">🌲</text>
          <text x={width / 2} y={height / 2 + 26} textAnchor="middle" fill="#A49BAE" fontSize="14">
            Tree structure is currently empty. Insert keys or load a dataset to visualize.
          </text>
        </svg>
      </div>
    );
  }

  const isBinary = treeType === 'bst' || treeType === 'avl';

  return (
    <div className="tree-canvas-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="tree-canvas-svg"
        role="img"
        aria-label={`${treeType.toUpperCase()} structure visualization`}
      >
        <defs>
          <marker id="tree-leaf-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#34D399" />
          </marker>
          <pattern id="tree-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1" fill="rgba(242, 166, 90, 0.08)" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#tree-grid)" />

        {isBinary ? (
          (() => {
            const { nodes, edges } = renderBinaryLayout(root, width, height);
            return (
              <>
                <g>
                  {edges.map((e, idx) => (
                    <line
                      key={idx}
                      x1={e.from.x}
                      y1={e.from.y}
                      x2={e.to.x}
                      y2={e.to.y}
                      stroke="rgba(169, 149, 199, 0.35)"
                      strokeWidth="2"
                    />
                  ))}
                </g>
                <g>
                  {nodes.map((n) => {
                    const key = n.node.key;
                    const isStepActive = stepHighlights.has(key);
                    const isSearchTarget = searchSet.has(key);
                    const isFinalFound = found === true && searchPath[searchPath.length - 1] === key;
                    const isRotate = currentStep?.action?.startsWith('rotate_') && isStepActive;

                    let fill = '#231E30';
                    let stroke = '#A995C7';
                    if (isRotate) {
                      fill = 'rgba(228, 123, 101, 0.28)';
                      stroke = '#E47B65';
                    } else if (isFinalFound) {
                      fill = 'rgba(52, 211, 153, 0.25)';
                      stroke = '#34D399';
                    } else if (isStepActive || isSearchTarget) {
                      fill = 'rgba(242, 166, 90, 0.25)';
                      stroke = '#F2A65A';
                    }

                    return (
                      <g key={key} transform={`translate(${n.x}, ${n.y})`}>
                        <circle r={20} fill={fill} stroke={stroke} strokeWidth={isStepActive || isFinalFound ? 3 : 2} />
                        <text
                          y={4}
                          textAnchor="middle"
                          fill="#F6F0E7"
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="var(--font-mono)"
                        >
                          {key}
                        </text>
                        {treeType === 'avl' && n.node.balanceFactor !== undefined && (
                          <text
                            y={32}
                            textAnchor="middle"
                            fill={Math.abs(n.node.balanceFactor) > 1 ? '#E47B65' : '#A49BAE'}
                            fontSize="9.5"
                            fontFamily="var(--font-mono)"
                          >
                            BF:{n.node.balanceFactor}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </>
            );
          })()
        ) : (
          (() => {
            const { nodes, edges, leaves } = layoutMultiway(root, width);
            return (
              <>
                <g>
                  {edges.map((e, idx) => (
                    <line
                      key={idx}
                      x1={e.from.x}
                      y1={e.from.y + 18}
                      x2={e.to.x}
                      y2={e.to.y - 18}
                      stroke="rgba(169, 149, 199, 0.4)"
                      strokeWidth="2"
                    />
                  ))}
                </g>

                {/* B+ Tree Sequential Leaf Chain Arrows */}
                {treeType === 'bplus' && leaves.length > 1 && (
                  <g>
                    {leaves.slice(0, -1).map((leaf, idx) => {
                      const nextLeaf = leaves[idx + 1];
                      return (
                        <line
                          key={`link-${idx}`}
                          x1={leaf.x + leaf.boxW / 2 + 2}
                          y1={leaf.y}
                          x2={nextLeaf.x - nextLeaf.boxW / 2 - 4}
                          y2={nextLeaf.y}
                          stroke="#34D399"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          markerEnd="url(#tree-leaf-arrow)"
                        />
                      );
                    })}
                  </g>
                )}

                <g>
                  {nodes.map((item, idx) => {
                    const hasMatch = item.keys.some((k) => matchedSet.has(k));
                    const hasHighlight = item.keys.some((k) => stepHighlights.has(k));
                    const stroke = hasMatch ? '#34D399' : hasHighlight ? '#F2A65A' : item.node.isLeaf ? '#A995C7' : '#F2A65A';
                    const fill = hasMatch ? 'rgba(52, 211, 153, 0.18)' : hasHighlight ? 'rgba(242, 166, 90, 0.18)' : '#231E30';
                    const cellW = item.boxW / Math.max(1, item.keys.length);

                    return (
                      <g key={idx} transform={`translate(${item.x}, ${item.y})`}>
                        <rect
                          x={-item.boxW / 2}
                          y={-18}
                          width={item.boxW}
                          height={36}
                          rx={6}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={hasMatch || hasHighlight ? 2.5 : 1.5}
                        />
                        {item.keys.map((k, kIdx) => {
                          const kx = -item.boxW / 2 + cellW * kIdx + cellW / 2;
                          const isKeyMatched = matchedSet.has(k) || stepHighlights.has(k);
                          return (
                            <g key={`${k}-${kIdx}`}>
                              {kIdx > 0 && (
                                <line
                                  x1={-item.boxW / 2 + cellW * kIdx}
                                  y1={-16}
                                  x2={-item.boxW / 2 + cellW * kIdx}
                                  y2={16}
                                  stroke="rgba(164, 155, 174, 0.25)"
                                />
                              )}
                              <text
                                x={kx}
                                y={4}
                                textAnchor="middle"
                                fill={isKeyMatched ? '#34D399' : '#F6F0E7'}
                                fontSize="11.5"
                                fontWeight="700"
                                fontFamily="var(--font-mono)"
                              >
                                {k}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
              </>
            );
          })()
        )}
      </svg>
    </div>
  );
}
