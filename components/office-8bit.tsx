"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  role: "coder" | "researcher" | "tester" | "manager";
  status: "working" | "idle" | "offline";
  sessionId?: string;
  cost?: number;
  actions?: number;
  x: number;
  y: number;
}

// 8-bit color palette
const COLORS = {
  floor: "#1a1a2e",
  wall: "#16213e",
  desk: "#4a3728",
  deskLight: "#6b4e3d",
  screen: "#0f0",
  screenOff: "#333",
  character: "#ffcc00",
  characterOutline: "#996600",
  statusGreen: "#00ff00",
  statusYellow: "#ffff00",
  statusRed: "#ff0000",
  pixel: "#000",
  highlight: "#fff",
  shadow: "#333",
};

const agents: Agent[] = [
  { id: "1", name: "CODER", role: "coder", status: "working", sessionId: "abc123", cost: 0.15, actions: 42, x: 2, y: 2 },
  { id: "2", name: "RESEARCHER", role: "researcher", status: "idle", sessionId: "", cost: 0, actions: 0, x: 10, y: 2 },
  { id: "3", name: "TESTER", role: "tester", status: "idle", sessionId: "", cost: 0, actions: 0, x: 2, y: 8 },
  { id: "4", name: "CLAW", role: "manager", status: "working", sessionId: "main", cost: 0.02, actions: 156, x: 6, y: 5 },
];

// Pixel art character components (CSS-based)
const PixelCharacter = ({ role, status }: { role: string; status: string }) => {
  const isWorking = status === "working";
  const isOffline = status === "offline";
  
  return (
    <div style={{ position: "relative", width: "32px", height: "32px" }}>
      {/* Body */}
      <div style={{
        position: "absolute",
        left: "8px",
        top: "12px",
        width: "16px",
        height: "16px",
        background: isOffline ? "#555" : COLORS.character,
        boxShadow: isOffline ? "none" : `2px 2px ${COLORS.characterOutline}`,
      }} />
      {/* Head */}
      <div style={{
        position: "absolute",
        left: "10px",
        top: "4px",
        width: "12px",
        height: "12px",
        background: isOffline ? "#555" : "#ffcc99",
        boxShadow: isOffline ? "none" : "1px 1px #cc8866",
      }} />
      {/* Eyes */}
      {!isOffline && (
        <>
          <div style={{ position: "absolute", left: "12px", top: "6px", width: "2px", height: "2px", background: "#000" }} />
          <div style={{ position: "absolute", left: "16px", top: "6px", width: "2px", height: "2px", background: "#000" }} />
        </>
      )}
      {/* Screen glow when working */}
      {isWorking && (
        <div style={{
          position: "absolute",
          left: "4px",
          top: "14px",
          width: "4px",
          height: "8px",
          background: COLORS.screen,
          boxShadow: `0 0 6px ${COLORS.screen}`,
          animation: "blink 0.5s infinite",
        }} />
      )}
      {/* Legs (animated when working) */}
      {isWorking && (
        <>
          <div style={{
            position: "absolute",
            left: "10px",
            top: "26px",
            width: "4px",
            height: "6px",
            background: COLORS.characterOutline,
            animation: "walk 0.3s infinite alternate",
          }} />
          <div style={{
            position: "absolute",
            left: "18px",
            top: "26px",
            width: "4px",
            height: "6px",
            background: COLORS.characterOutline,
            animation: "walk 0.3s infinite alternate-reverse",
          }} />
        </>
      )}
    </div>
  );
};

// Cubicle component
const Cubicle = ({ agent, isSelected, onClick }: { agent: Agent; isSelected: boolean; onClick: () => void }) => {
  const statusColor = agent.status === "working" ? COLORS.statusGreen : 
                      agent.status === "idle" ? COLORS.statusYellow : COLORS.statusRed;
  
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${agent.x * 16}px`,
        top: `${agent.y * 16}px`,
        width: "80px",
        height: "64px",
        background: isSelected ? "#2a2a4e" : "#1a1a3e",
        border: isSelected ? "2px solid #4a4a6e" : "2px solid #2a2a4e",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
      }}
    >
      {/* Desk */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "4px",
        right: "4px",
        height: "16px",
        background: COLORS.desk,
        borderTop: `2px solid ${COLORS.deskLight}`,
      }} />
      
      {/* Computer */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        right: "12px",
        width: "20px",
        height: "16px",
        background: agent.status !== "offline" ? "#222" : "#111",
        border: "2px solid #444",
      }}>
        {/* Screen */}
        <div style={{
          position: "absolute",
          left: "2px",
          top: "2px",
          width: "12px",
          height: "10px",
          background: agent.status === "working" ? COLORS.screen : COLORS.screenOff,
          boxShadow: agent.status === "working" ? `0 0 4px ${COLORS.screen}` : "none",
        }} />
      </div>
      
      {/* Character */}
      <PixelCharacter role={agent.role} status={agent.status} />
      
      {/* Name label */}
      <div style={{
        position: "absolute",
        top: "4px",
        left: "4px",
        right: "4px",
        fontSize: "6px",
        fontFamily: "monospace",
        color: "#888",
        textAlign: "center",
      }}>
        {agent.name}
      </div>
      
      {/* Status LED */}
      <div style={{
        position: "absolute",
        top: "4px",
        right: "4px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: statusColor,
        boxShadow: `0 0 6px ${statusColor}`,
      }} />
    </div>
  );
};

// Walking Claw (the manager)
const WalkingClaw = () => {
  const [position, setPosition] = useState({ x: 6, y: 5 });
  const [walking, setWalking] = useState(false);
  
  useEffect(() => {
    // Simple walk animation
    const walkInterval = setInterval(() => {
      setWalking(w => !w);
    }, 400);
    return () => clearInterval(walkInterval);
  }, []);
  
  return (
    <div style={{
      position: "absolute",
      left: `${position.x * 16}px`,
      top: `${position.y * 16}px`,
      transition: "all 0.5s ease-in-out",
    }}>
      {/* Claw character - bigger, in a suit */}
      <div style={{ position: "relative", width: "32px", height: "40px" }}>
        {/* Suit body */}
        <div style={{
          position: "absolute",
          left: "6px",
          top: "14px",
          width: "20px",
          height: "20px",
          background: "#333",
          borderBottom: "4px solid #222",
        }}>
          {/* Tie */}
          <div style={{
            position: "absolute",
            left: "8px",
            top: "2px",
            width: "4px",
            height: "12px",
            background: "#f00",
          }} />
        </div>
        {/* Head */}
        <div style={{
          position: "absolute",
          left: "8px",
          top: "2px",
          width: "16px",
          height: "16px",
          background: "#ffcc99",
          border: "2px solid #cc8866",
        }} />
        {/* Eyes (cool shades) */}
        <div style={{
          position: "absolute",
          left: "8px",
          top: "6px",
          width: "16px",
          height: "6px",
          background: "#111",
        }} />
        {/* Legs */}
        <div style={{
          position: "absolute",
          left: "8px",
          top: "34px",
          width: "6px",
          height: "6px",
          background: "#222",
          animation: walking ? "walk 0.3s infinite alternate" : "none",
        }} />
        <div style={{
          position: "absolute",
          left: "18px",
          top: "34px",
          width: "6px",
          height: "6px",
          background: "#222",
          animation: walking ? "walk 0.3s infinite alternate-reverse" : "none",
        }} />
      </div>
    </div>
  );
};

export default function Office8Bit() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  // Grid: 14x12 pixels (each pixel = 16px)
  const gridWidth = 14;
  const gridHeight = 12;
  
  return (
    <div style={{ 
      background: COLORS.floor, 
      padding: "16px", 
      borderRadius: "8px",
      fontFamily: "'Courier New', monospace",
    }}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes walk {
          0% { transform: translateY(0); }
          100% { transform: translateY(-2px); }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ 
        color: COLORS.statusGreen, 
        fontSize: "14px", 
        marginBottom: "16px",
        textAlign: "center",
        textShadow: `0 0 10px ${COLORS.statusGreen}`,
        letterSpacing: "2px",
      }}>
        ▓▓▓▓▓▓ 8-BIT OFFICE ▓▓▓▓▓▓
      </div>
      
      {/* Game area */}
      <div style={{
        position: "relative",
        width: `${gridWidth * 16}px`,
        height: `${gridHeight * 16}px`,
        background: COLORS.floor,
        border: "4px solid #333",
        margin: "0 auto",
        overflow: "hidden",
      }}>
        {/* Floor pattern */}
        {Array.from({ length: gridHeight }).map((_, y) => (
          Array.from({ length: gridWidth }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: `${x * 16}px`,
                top: `${y * 16}px`,
                width: "16px",
                height: "16px",
                background: (x + y) % 2 === 0 ? "#1e1e38" : "#1a1a2e",
              }}
            />
          ))
        ))}
        
        {/* Walls */}
        <div style={{
          position: "absolute",
          left: "0",
          top: "0",
          right: "0",
          height: "16px",
          background: COLORS.wall,
          borderBottom: "4px solid #333",
        }} />
        
        {/* Cubicle walls */}
        <div style={{
          position: "absolute",
          left: "0",
          top: "48px",
          right: "0",
          height: "4px",
          background: "#333",
        }} />
        
        {/* U-shape cubicle dividers */}
        <div style={{ position: "absolute", left: "80px", top: "48px", width: "4px", height: "80px", background: "#333" }} />
        <div style={{ position: "absolute", left: "160px", top: "48px", width: "4px", height: "80px", background: "#333" }} />
        
        {/* Bottom cubicle */}
        <div style={{ position: "absolute", left: "32px", top: "144px", width: "4px", height: "48px", background: "#333" }} />
        
        {/* Agents */}
        {agents.filter(a => a.role !== "manager").map(agent => (
          <Cubicle
            key={agent.id}
            agent={agent}
            isSelected={selected?.id === agent.id}
            onClick={() => { setSelected(agent); setShowStats(true); }}
          />
        ))}
        
        {/* Walking Claw */}
        <WalkingClaw />
        
        {/* Status bars */}
        <div style={{
          position: "absolute",
          left: "8px",
          top: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          <div style={{ fontSize: "6px", color: "#666" }}>FLOOR 1</div>
        </div>
        
        {/* Clock */}
        <div style={{
          position: "absolute",
          right: "8px",
          top: "20px",
          fontSize: "8px",
          color: COLORS.statusYellow,
        }}>
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
      
      {/* Stats panel */}
      {showStats && selected && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "#0a0a1a",
          border: "2px solid #333",
          borderRadius: "4px",
        }}>
          <div style={{ 
            color: COLORS.statusGreen, 
            fontSize: "12px",
            marginBottom: "8px",
            borderBottom: "1px solid #333",
            paddingBottom: "4px",
          }}>
            ▓ {selected.name} STATS
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "4px",
            fontSize: "10px",
            color: "#888",
          }}>
            <div>ROLE: <span style={{ color: "#fff" }}>{selected.role}</span></div>
            <div>STATUS: <span style={{ 
              color: selected.status === "working" ? COLORS.statusGreen : 
                     selected.status === "idle" ? COLORS.statusYellow : COLORS.statusRed 
            }}>{selected.status.toUpperCase()}</span></div>
            <div>SESSION: <span style={{ color: "#fff" }}>{selected.sessionId || "N/A"}</span></div>
            <div>COST: <span style={{ color: "#fff" }}>${selected.cost?.toFixed(2) || "0.00"}</span></div>
            <div>ACTIONS: <span style={{ color: "#fff" }}>{selected.actions || 0}</span></div>
            <div>EFFICIENCY: <span style={{ color: COLORS.statusGreen }}>98%</span></div>
          </div>
          <button
            onClick={() => setShowStats(false)}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "4px",
              background: "#333",
              border: "none",
              color: "#888",
              fontSize: "8px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            [CLOSE]
          </button>
        </div>
      )}
      
      {/* Controls hint */}
      <div style={{
        marginTop: "12px",
        fontSize: "8px",
        color: "#444",
        textAlign: "center",
      }}>
        CLICK CUBICLE TO INSPECT | WALKING: CLAW
      </div>
    </div>
  );
}