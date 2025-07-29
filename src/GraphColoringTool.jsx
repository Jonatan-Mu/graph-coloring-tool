import { useState, useEffect } from "react";

const initialNodes = [
  { id: "A", color: "blue", connections: ["B", "E"] },
  { id: "B", color: "gray", connections: ["A", "C", "F"] },
  { id: "C", color: "red", connections: ["B", "D", "G"] },
  { id: "D", color: "gray", connections: ["C", "H"] },
  { id: "E", color: "white", connections: ["A", "F", "I"] },
  { id: "F", color: "gray", connections: ["B", "E", "G", "J"] },
  { id: "G", color: "gray", connections: ["C", "F", "H", "K"] },
  { id: "H", color: "gray", connections: ["D", "G", "L"] },
  { id: "I", color: "gray", connections: ["E", "J", "M"] },
  { id: "J", color: "gray", connections: ["F", "I", "K", "N"] },
  { id: "K", color: "gray", connections: ["G", "J", "L", "O"] },
  { id: "L", color: "gray", connections: ["H", "K", "P"] },
  { id: "M", color: "gray", connections: ["I", "N"] },
  { id: "N", color: "gray", connections: ["J", "M", "O"] },
  { id: "O", color: "gray", connections: ["K", "N", "P"] },
  { id: "P", color: "blue", connections: ["L", "O"] },
];

const colorOptions = ["blue", "red", "green", "orange", "yellow", "purple", "gray", "white"];
const firmColors = ["blue", "red"];

export default function GraphColoringTool() {
  const [nodes, setNodes] = useState(initialNodes);
  const [conflicts, setConflicts] = useState([]);
  const [history, setHistory] = useState([]);

  const checkConflicts = (updatedNodes) => {
    const newConflicts = [];
    updatedNodes.forEach(node => {
      node.connections.forEach(connId => {
        const neighbor = updatedNodes.find(n => n.id === connId);
        if (
          neighbor &&
          firmColors.includes(node.color) &&
          node.color === neighbor.color
        ) {
          newConflicts.push(`${node.id} ↔ ${neighbor.id}`);
        }
      });
    });
    setConflicts([...new Set(newConflicts)]);
  };

  useEffect(() => {
    checkConflicts(nodes);
  }, [nodes]);

  const handleColorChange = (id, newColor) => {
    const updatedNodes = nodes.map(n => (n.id === id ? { ...n, color: newColor } : n));
    setHistory(prev => [...prev, { changed: id, to: newColor }]);
    setNodes(updatedNodes);
    propagateColorChange(updatedNodes, id, newColor);
  };

  const propagateColorChange = (updatedNodes, changedId, newColor) => {
    if (newColor === "gray") return;

    const firm = firmColors.includes(newColor);
    const influencedColor = firm ? (newColor === "blue" ? "green" : "orange") : newColor;

    const changedNode = updatedNodes.find(n => n.id === changedId);

    changedNode.connections.forEach(connId => {
      const neighbor = updatedNodes.find(n => n.id === connId);
      if (!neighbor) return;

      if (neighbor.color === "white") {
        const influencingColors = neighbor.connections
          .map(nid => updatedNodes.find(n => n.id === nid)?.color)
          .filter(Boolean);

        const counts = influencingColors.reduce((acc, color) => {
          if (!acc[color]) acc[color] = 0;
          acc[color]++;
          return acc;
        }, {});

        const maxCount = Math.max(...Object.values(counts));
        const candidates = Object.entries(counts).filter(([_, count]) => count === maxCount);
        const finalColor = candidates.length === 1 ? candidates[0][0] : "yellow";
        neighbor.color = finalColor;
      } else if (neighbor.color === "gray") {
        neighbor.color = influencedColor;
      }
    });

    setNodes([...updatedNodes]);
    checkConflicts(updatedNodes);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Logical Network Simulator</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {nodes.map(node => (
          <div key={node.id} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            width: "180px",
            textAlign: "center"
          }}>
            <div style={{ fontWeight: "bold" }}>Node {node.id}</div>
            <div style={{
              height: "20px",
              width: "20px",
              margin: "0 auto 8px",
              borderRadius: "50%",
              backgroundColor: node.color,
              border: "1px solid #444"
            }}></div>
            <div style={{ fontSize: "0.8rem" }}>Connections: {node.connections.join(", ")}</div>
            <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
              {colorOptions.map(color => (
                <button
                  key={color}
                  style={{
                    background: node.color === color ? "#000" : "#fff",
                    color: node.color === color ? "#fff" : "#000",
                    border: "1px solid #aaa",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                    cursor: "pointer"
                  }}
                  onClick={() => handleColorChange(node.id, color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {conflicts.length > 0 && (
        <div style={{ marginTop: 20, color: "red" }}>
          <h4>Conflicts detected:</h4>
          <ul>
            {conflicts.map((conflict, i) => <li key={i}>{conflict}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
