// ---------------------------------------------------------------------------
//  diagrams.jsx · data-driven SVG diagram components for DSA visualization.
//  A single <Diagram kind data caption /> dispatcher renders one of:
//    array | tree | linkedlist | graph | grid | stack
//  Everything is pure SVG (crisp, zero deps, fully offline). Geometry is
//  computed in try/catch so malformed data degrades to nothing, never a crash.
// ---------------------------------------------------------------------------

import { Component, useId } from "react";
import { C } from "../ui/theme.jsx";

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const NODE = C.panelSolid;
const STROKE = "#57606a";

// Render errors from a malformed (agent-authored) diagram spec must never take
// down the whole view — an error boundary degrades a bad diagram to nothing.
class Boundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const KINDS = {
  array: ArrayDiagram, tree: TreeDiagram, linkedlist: LinkedListDiagram,
  graph: GraphDiagram, grid: GridDiagram, stack: StackDiagram,
};

export function Diagram({ kind, data, caption }) {
  const Comp = KINDS[kind];
  if (!Comp || !data) return null;
  return (
    <figure style={{ margin: "14px 0", padding: "14px 12px", background: "#f3f4f6",
      border: `1px solid ${C.border}`, borderRadius: 10, overflowX: "auto" }}>
      <Boundary>
        <div style={{ display: "flex", justifyContent: "center" }}><Comp data={data} /></div>
      </Boundary>
      {caption && <figcaption style={{ marginTop: 8, textAlign: "center", fontFamily: C.sys,
        fontSize: 12, color: C.muted }}>{caption}</figcaption>}
    </figure>
  );
}

const txt = (color, size, weight) => ({ fontFamily: mono, fontSize: size, fill: color,
  fontWeight: weight || 600, textAnchor: "middle", dominantBaseline: "central" });

// --- ARRAY ---------------------------------------------------------------
// data: { values:[], pointers:[{name,index,color}], window:[s,e], highlight:[i], labels:{i:txt} }
function ArrayDiagram({ data }) {
  const values = data.values || [];
  const n = values.length;
  if (!n) return null;
  const W = 46, H = 40, G = 5, padT = 38, padB = 22;
  const pointers = data.pointers || [];
  const window = data.window;
  const highlight = new Set(data.highlight || []);
  const labels = data.labels || {};
  const width = n * (W + G) - G + 4;
  const height = padT + H + padB;
  const x = (i) => 2 + i * (W + G);
  // group pointers by index for stacking
  const byIdx = {};
  pointers.forEach((p) => { (byIdx[p.index] = byIdx[p.index] || []).push(p); });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      {window && window.length === 2 && (
        <rect x={x(window[0]) - 2} y={padT - 4} width={(window[1] - window[0] + 1) * (W + G) - G + 4}
          height={H + 8} rx={7} fill="rgba(111,168,255,.13)" stroke={C.blue} strokeDasharray="4 3" />
      )}
      {values.map((v, i) => (
        <g key={i}>
          <rect x={x(i)} y={padT} width={W} height={H} rx={6}
            fill={highlight.has(i) ? "rgba(95,215,158,.18)" : NODE}
            stroke={highlight.has(i) ? C.green : STROKE} />
          <text x={x(i) + W / 2} y={padT + H / 2} style={txt(C.text, 14)}>{String(v)}</text>
          <text x={x(i) + W / 2} y={padT + H + 12} style={txt(C.faint, 10.5, 500)}>{labels[i] != null ? labels[i] : i}</text>
        </g>
      ))}
      {Object.entries(byIdx).map(([idx, ps]) =>
        ps.map((p, k) => {
          const cx = x(Number(idx)) + W / 2;
          const yy = padT - 8 - k * 13;
          return (
            <g key={`${idx}-${k}`}>
              <text x={cx} y={yy - 7} style={txt(p.color || C.amber, 11.5, 700)}>{p.name}</text>
              {k === 0 && <text x={cx} y={padT - 2} style={txt(p.color || C.amber, 12)}>▼</text>}
            </g>
          );
        }),
      )}
    </svg>
  );
}

// --- TREE (binary, from level-order array with null) ---------------------
// data: { nodes:[level-order w/ null], highlight:[values] }
function buildTree(arr) {
  if (!arr || !arr.length || arr[0] == null) return null;
  const root = { val: arr[0], left: null, right: null };
  const q = [root];
  let i = 1;
  while (q.length && i < arr.length) {
    const node = q.shift();
    if (i < arr.length) { const v = arr[i++]; if (v != null) { node.left = { val: v, left: null, right: null }; q.push(node.left); } }
    if (i < arr.length) { const v = arr[i++]; if (v != null) { node.right = { val: v, left: null, right: null }; q.push(node.right); } }
  }
  return root;
}
function TreeDiagram({ data }) {
  const root = buildTree(data.nodes);
  if (!root) return null;
  const highlight = new Set((data.highlight || []).map(String));
  const nodes = [];
  let counter = 0, maxDepth = 0;
  (function walk(node, depth) {
    if (!node) return;
    walk(node.left, depth + 1);
    node.x = counter++; node.y = depth; maxDepth = Math.max(maxDepth, depth);
    nodes.push(node);
    walk(node.right, depth + 1);
  })(root, 0);
  const edges = [];
  nodes.forEach((nd) => { if (nd.left) edges.push([nd, nd.left]); if (nd.right) edges.push([nd, nd.right]); });
  const xStep = 50, yStep = 62, r = 17, m = 22;
  const px = (nd) => m + nd.x * xStep;
  const py = (nd) => m + nd.y * yStep;
  const width = counter * xStep + (m * 2 - xStep) + r;
  const height = (maxDepth + 1) * yStep + m;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      {edges.map(([a, b], i) => (
        <line key={i} x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} stroke={STROKE} strokeWidth={1.6} />
      ))}
      {nodes.map((nd, i) => {
        const hot = highlight.has(String(nd.val));
        return (
          <g key={i}>
            <circle cx={px(nd)} cy={py(nd)} r={r} fill={hot ? "rgba(95,215,158,.2)" : NODE} stroke={hot ? C.green : STROKE} strokeWidth={1.6} />
            <text x={px(nd)} y={py(nd)} style={txt(hot ? C.green : C.text, 13)}>{String(nd.val)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// --- LINKED LIST ---------------------------------------------------------
// data: { values:[], cycleTo:index, pointers:[{name,index,color}] }
function LinkedListDiagram({ data }) {
  const id = useId().replace(/:/g, "");
  const values = data.values || [];
  const n = values.length;
  if (!n) return null;
  const W = 44, H = 36, GAP = 30, padT = 30, padB = data.cycleTo != null ? 44 : 14;
  const x = (i) => 2 + i * (W + GAP);
  const width = n * (W + GAP) - GAP + 6;
  const height = padT + H + padB;
  const pointers = data.pointers || [];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        <marker id={`a${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={STROKE} />
        </marker>
      </defs>
      {values.map((v, i) => (
        <g key={i}>
          <rect x={x(i)} y={padT} width={W} height={H} rx={6} fill={NODE} stroke={STROKE} />
          <text x={x(i) + W / 2} y={padT + H / 2} style={txt(C.text, 13)}>{String(v)}</text>
          {i < n - 1 && (
            <line x1={x(i) + W} y1={padT + H / 2} x2={x(i + 1) - 6} y2={padT + H / 2}
              stroke={STROKE} strokeWidth={1.6} markerEnd={`url(#a${id})`} />
          )}
          {i === n - 1 && data.cycleTo == null && (
            <text x={x(i) + W + 16} y={padT + H / 2} style={txt(C.faint, 12)}>∅</text>
          )}
        </g>
      ))}
      {data.cycleTo != null && data.cycleTo >= 0 && data.cycleTo < n && (
        <path d={`M ${x(n - 1) + W / 2} ${padT + H} C ${x(n - 1) + W / 2} ${padT + H + 34},
          ${x(data.cycleTo) + W / 2} ${padT + H + 34}, ${x(data.cycleTo) + W / 2} ${padT + H + 2}`}
          fill="none" stroke={C.amber} strokeWidth={1.6} strokeDasharray="4 3" markerEnd={`url(#a${id})`} />
      )}
      {pointers.map((p, k) => (
        <text key={k} x={x(p.index) + W / 2} y={padT - 10} style={txt(p.color || C.amber, 11.5, 700)}>{p.name}↓</text>
      ))}
    </svg>
  );
}

// --- GRAPH ---------------------------------------------------------------
// data: { nodes:[ids], edges:[[u,v]], directed:bool, positions:{id:[x,y]}, highlight:[ids] }
function GraphDiagram({ data }) {
  const id = useId().replace(/:/g, "");
  const ids = (data.nodes || []).map(String);
  const n = ids.length;
  if (!n) return null;
  const R = 130, r = 18, cx = 160, cy = 160;
  const pos = {};
  ids.forEach((nd, i) => {
    if (data.positions && data.positions[nd]) { pos[nd] = data.positions[nd]; return; }
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    pos[nd] = [cx + R * Math.cos(ang), cy + R * Math.sin(ang)];
  });
  const xs = Object.values(pos).map((p) => p[0]), ys = Object.values(pos).map((p) => p[1]);
  const minX = Math.min(...xs) - r - 6, minY = Math.min(...ys) - r - 6;
  const width = Math.max(...xs) - minX + r + 6, height = Math.max(...ys) - minY + r + 6;
  const highlight = new Set((data.highlight || []).map(String));
  const T = (p) => [p[0] - minX, p[1] - minY];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        <marker id={`g${id}`} markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={STROKE} />
        </marker>
      </defs>
      {(data.edges || []).map(([u, v], i) => {
        const [x1, y1] = T(pos[String(u)] || [cx, cy]);
        const [x2, y2] = T(pos[String(v)] || [cx, cy]);
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
        const ex = x2 - (dx / L) * (r + 2), ey = y2 - (dy / L) * (r + 2);
        return <line key={i} x1={x1} y1={y1} x2={ex} y2={ey} stroke={STROKE} strokeWidth={1.6}
          markerEnd={data.directed ? `url(#g${id})` : undefined} />;
      })}
      {ids.map((nd, i) => {
        const [x, y] = T(pos[nd]);
        const hot = highlight.has(nd);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={hot ? "rgba(95,215,158,.2)" : NODE} stroke={hot ? C.green : STROKE} strokeWidth={1.6} />
            <text x={x} y={y} style={txt(hot ? C.green : C.text, 13)}>{nd}</text>
          </g>
        );
      })}
    </svg>
  );
}

// --- GRID / MATRIX -------------------------------------------------------
// data: { cells:[[...]], highlight:[[r,c]], colors:{"r,c":hex}, rowLabels:[], colLabels:[] }
function GridDiagram({ data }) {
  const cells = data.cells || [];
  if (!cells.length || !Array.isArray(cells[0])) return null;
  const rows = cells.length, cols = cells[0].length;
  const S = 38, m = 4;
  const hl = new Set((data.highlight || []).map(([r, c]) => `${r},${c}`));
  const colors = data.colors || {};
  const width = cols * S + m * 2, height = rows * S + m * 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      {cells.map((row, r) => row.map((v, c) => {
        const key = `${r},${c}`;
        const fill = colors[key] || (hl.has(key) ? "rgba(95,215,158,.18)" : NODE);
        const stroke = (colors[key] || hl.has(key)) ? C.green : STROKE;
        return (
          <g key={key}>
            <rect x={m + c * S} y={m + r * S} width={S - 2} height={S - 2} rx={4} fill={fill} stroke={stroke} />
            <text x={m + c * S + (S - 2) / 2} y={m + r * S + (S - 2) / 2} style={txt(C.text, 12.5)}>{String(v)}</text>
          </g>
        );
      }))}
    </svg>
  );
}

// --- STACK ---------------------------------------------------------------
// data: { items:[bottom..top], note:string }
function StackDiagram({ data }) {
  const items = data.items || [];
  const n = items.length;
  const W = 70, H = 32, G = 3, padT = 18, padR = 70;
  const width = W + padR + 10, height = padT + Math.max(n, 1) * (H + G) + 14;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      {items.map((v, k) => {
        const i = n - 1 - k; // draw top at the top
        const y = padT + k * (H + G);
        return (
          <g key={k}>
            <rect x={6} y={y} width={W} height={H} rx={5} fill={NODE} stroke={STROKE} />
            <text x={6 + W / 2} y={y + H / 2} style={txt(C.text, 13)}>{String(items[i])}</text>
            {k === 0 && <text x={6 + W + 8} y={y + H / 2} style={{ ...txt(C.amber, 11.5, 700), textAnchor: "start" }}>← top</text>}
          </g>
        );
      })}
      {n === 0 && <text x={6 + W / 2} y={padT + H / 2} style={txt(C.faint, 12)}>empty</text>}
    </svg>
  );
}
