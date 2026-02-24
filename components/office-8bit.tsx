"use client";

import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  role: "coder" | "researcher" | "tester" | "manager";
  status: "working" | "idle" | "offline";
  sessionId?: string;
  cost?: number;
  actions?: number;
}

const agents: Agent[] = [
  { id: "1", name: "Coder", role: "coder", status: "idle", sessionId: "N/A", cost: 0, actions: 0 },
  { id: "2", name: "Researcher", role: "researcher", status: "idle", sessionId: "N/A", cost: 0, actions: 0 },
  { id: "3", name: "Tester", role: "tester", status: "idle", sessionId: "N/A", cost: 0, actions: 0 },
  { id: "4", name: "Claw", role: "manager", status: "working", sessionId: "main", cost: 0.02, actions: 156 },
];

export default function Office8Bit() {
  const [selected, setSelected] = useState<Agent | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "coder": return "💻";
      case "researcher": return "🔍";
      case "tester": return "✅";
      case "manager": return "👔";
      default: return "❓";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working": return "#00ff00";
      case "idle": return "#ffff00";
      case "offline": return "#ff0000";
      default: return "#888";
    }
  };

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", 
      padding: "24px", 
      borderRadius: "12px",
      fontFamily: "'Courier New', monospace",
      color: "#0f0",
      border: "2px solid #0f0",
      boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)"
    }}>
      <h2 style={{ 
        marginBottom: "20px", 
        textAlign: "center",
        textShadow: "2px 2px #000",
        fontSize: "24px",
        letterSpacing: "2px"
      }}>
        🏢 8-BIT OFFICE
      </h2>
      
      {/* Office Floor */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "16px",
        marginBottom: "20px",
        background: "#0a0a15",
        padding: "20px",
        borderRadius: "8px",
        border: "2px solid #333"
      }}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelected(agent)}
            style={{
              background: selected?.id === agent.id ? "#1a3a1a" : "#0f0f23",
              border: selected?.id === agent.id ? `3px solid ${getStatusColor(agent.status)}` : "2px solid #444",
              borderRadius: "8px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Pixel art agent */}
            <div style={{ 
              fontSize: "48px", 
              marginBottom: "12px",
              filter: agent.status === "offline" ? "grayscale(100%)" : "none"
            }}>
              {getRoleIcon(agent.role)}
            </div>
            
            <div style={{ 
              fontWeight: "bold", 
              fontSize: "18px",
              marginBottom: "8px",
              color: "#fff"
            }}>
              {agent.name}
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: "8px"
            }}>
              <span style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: getStatusColor(agent.status),
                boxShadow: `0 0 8px ${getStatusColor(agent.status)}`,
                animation: agent.status === "working" ? "pulse 1s infinite" : "none"
              }} />
              <span style={{ 
                color: getStatusColor(agent.status),
                fontWeight: "bold"
              }}>
                {agent.status.toUpperCase()}
              </span>
            </div>

            {/* Pixel decoration */}
            <div style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              fontSize: "8px",
              color: "#333"
            }}>
              ░▒▓
            </div>
          </div>
        ))}
      </div>

      {/* Stats Panel */}
      {selected && (
        <div style={{ 
          background: "#0a0a15", 
          padding: "20px", 
          borderRadius: "8px",
          border: `2px solid ${getStatusColor(selected.status)}`,
          animation: "fadeIn 0.3s"
        }}>
          <h3 style={{ 
            marginTop: 0, 
            color: getStatusColor(selected.status),
            textShadow: `0 0 10px ${getStatusColor(selected.status)}`
          }}>
            📊 {selected.name} STATS
          </h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            color: "#ccc"
          }}>
            <div>
              <strong>Role:</strong> {selected.role}
            </div>
            <div>
              <strong>Status:</strong> {selected.status}
            </div>
            <div>
              <strong>Session:</strong> {selected.sessionId || "N/A"}
            </div>
            <div>
              <strong>Cost:</strong> ${(selected.cost || 0).toFixed(2)}
            </div>
            <div>
              <strong>Actions:</strong> {selected.actions || 0}
            </div>
            <div>
              <strong>Uptime:</strong> {selected.status === "working" ? "Active" : "--"}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}