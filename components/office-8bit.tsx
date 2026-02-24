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

const COLORS = {
  ocean: "#0a1628",
  oceanLight: "#0d2137",
  sand: "#c2a666",
  coral: "#ff6b6b",
  coralDark: "#cc5555",
  seaweed: "#2d8a4e",
  bubble: "rgba(255, 255, 255, 0.3)",
  fish: "#ff7f50",
  fishNemo: "#ff6600",
  dory: "#4169e1",
  turtle: "#3cb371",
  statusGreen: "#00ff00",
  statusYellow: "#ffff00",
  statusRed: "#ff0000",
};

const agents: Agent[] = [
  { id: "1", name: "CODER", role: "coder", status: "working", sessionId: "abc123", cost: 0.15, actions: 42, x: 2, y: 3 },
  { id: "2", name: "DORY", role: "researcher", status: "idle", sessionId: "", cost: 0, actions: 0, x: 10, y: 3 },
  { id: "3", name: "TESTER", role: "tester", status: "idle", sessionId: "", cost: 0, actions: 0, x: 2, y: 9 },
  { id: "4", name: "CRUSH", role: "manager", status: "working", sessionId: "main", cost: 0.02, actions: 156, x: 6, y: 6 },
];

// Fish character component
const FishCharacter = ({ role, status, flipped = false }: { role: string; status: string; flipped?: boolean }) => {
  const isWorking = status === "working";
  const isOffline = status === "offline";
  const color = role === "coder" ? COLORS.fishNemo : role === "researcher" ? COLORS.dory : role === "tester" ? COLORS.turtle : "#888";
  
  return (
    <div style={{ 
      position: "relative", 
      width: "32px", 
      height: "24px",
      transform: flipped ? "scaleX(-1)" : "none",
      animation: isWorking ? "swim 0.5s infinite alternate" : "none",
    }}>
      {/* Fish body */}
      <div style={{
        position: "absolute",
        left: "4px",
        top: "6px",
        width: "20px",
        height: "12px",
        background: isOffline ? "#555" : color,
        borderRadius: "50% 50% 50% 50%",
        boxShadow: isOffline ? "none" : `0 0 4px ${color}`,
      }} />
      {/* Tail */}
      <div style={{
        position: "absolute",
        left: "0px",
        top: "8px",
        width: "8px",
        height: "8px",
        background: isOffline ? "#444" : color,
        clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
      }} />
      {/* Eye */}
      {!isOffline && (
        <div style={{
          position: "absolute",
          left: "18px",
          top: "8px",
          width: "4px",
          height: "4px",
          background: "#fff",
          borderRadius: "50%",
        }}>
          <div style={{
            position: "absolute",
            left: "1px",
            top: "1px",
            width: "2px",
            height: "2px",
            background: "#000",
            borderRadius: "50%",
          }} />
        </div>
      )}
      {/* Fin */}
      <div style={{
        position: "absolute",
        left: "12px",
        top: "2px",
        width: "6px",
        height: "4px",
        background: isOffline ? "#444" : color,
        borderRadius: "50% 50% 0 0",
        opacity: 0.7,
      }} />
      {/* Working animation - bubbles */}
      {isWorking && (
        <div style={{
          position: "absolute",
          left: "-8px",
          top: "0px",
          width: "4px",
          height: "4px",
          background: COLORS.bubble,
          borderRadius: "50%",
          animation: "bubble 1s infinite",
        }} />
      )}
    </div>
  );
};

// Coral/workspace component
const CoralStation = ({ agent, isSelected, onClick }: { agent: Agent; isSelected: boolean; onClick: () => void }) => {
  const statusColor = agent.status === "working" ? COLORS.statusGreen : 
                      agent.status === "idle" ? COLORS.statusYellow : COLORS.statusRed;
  
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${agent.x * 16}px`,
        top: `${agent.y * 16}px`,
        width: "96px",
        height: "80px",
        cursor: "pointer",
      }}
    >
      {/* Coral background */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "8px",
        right: "8px",
        height: "24px",
        background: `linear-gradient(180deg, ${COLORS.coral} 0%, ${COLORS.coralDark} 100%)`,
        borderRadius: "8px 8px 0 0",
        border: "2px solid #ff8888",
      }}>
        {/* Coral bumps */}
        <div style={{ position: "absolute", left: "4px", top: "-8px", width: "8px", height: "12px", background: COLORS.coral, borderRadius: "50% 50% 0 0" }} />
        <div style={{ position: "absolute", left: "16px", top: "-12px", width: "10px", height: "16px", background: COLORS.coral, borderRadius: "50% 50% 0 0" }} />
        <div style={{ position: "absolute", left: "30px", top: "-6px", width: "8px", height: "10px", background: COLORS.coral, borderRadius: "50% 50% 0 0" }} />
        <div style={{ position: "absolute", left: "44px", top: "-10px", width: "10px", height: "14px", background: COLORS.coral, borderRadius: "50% 50% 0 0" }} />
      </div>
      
      {/* Seaweed */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "8px",
        height: "40px",
        background: COLORS.seaweed,
        borderRadius: "50% 50% 0 0",
        animation: "sway 2s infinite ease-in-out",
        transformOrigin: "bottom",
      }} />
      <div style={{
        position: "absolute",
        bottom: "0",
        right: "0",
        width: "8px",
        height: "32px",
        background: COLORS.seaweed,
        borderRadius: "50% 50% 0 0",
        animation: "sway 2.5s infinite ease-in-out reverse",
        transformOrigin: "bottom",
      }} />
      
      {/* Fish character */}
      <div style={{
        position: "absolute",
        left: "24px",
        top: "20px",
      }}>
        <FishCharacter role={agent.role} status={agent.status} flipped={agent.x > 6} />
      </div>
      
      {/* Name bubble */}
      <div style={{
        position: "absolute",
        top: "4px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "6px",
        color: "#fff",
        fontFamily: "monospace",
      }}>
        {agent.name}
      </div>
      
      {/* Status indicator */}
      <div style={{
        position: "absolute",
        top: "4px",
        right: "4px",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: statusColor,
        boxShadow: `0 0 6px ${statusColor}`,
        animation: isWorking ? "pulse 1s infinite" : "none",
      }} />
    </div>
  );
};

// Bubbles component
const Bubbles = () => {
  return (
    <>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 200 + 20}px`,
            top: `${Math.random() * 160 + 20}px`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            background: COLORS.bubble,
            borderRadius: "50%",
            animation: `rise ${3 + Math.random() * 4}s infinite linear`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </>
  );
};

export default function Office8Bit() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  const gridWidth = 14;
  const gridHeight = 12;
  
  return (
    <div style={{ 
      background: COLORS.ocean, 
      padding: "16px", 
      borderRadius: "8px",
      fontFamily: "'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes swim {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes rise {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(-200px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bubble {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(-12px); opacity: 0; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ 
        color: COLORS.statusYellow, 
        fontSize: "14px", 
        marginBottom: "16px",
        textAlign: "center",
        textShadow: `0 0 10px ${COLORS.statusYellow}`,
        letterSpacing: "2px",
      }}>
        🐠 JUST KEEP SWIMMING 🐠
      </div>
      
      {/* Ocean scene */}
      <div style={{
        position: "relative",
        width: `${gridWidth * 16}px`,
        height: `${gridHeight * 16}px`,
        background: `linear-gradient(180deg, ${COLORS.oceanLight} 0%, ${COLORS.ocean} 60%, ${COLORS.sand} 100%)`,
        border: "4px solid #1a3a5c",
        margin: "0 auto",
        overflow: "hidden",
        borderRadius: "8px",
      }}>
        {/* Sand at bottom */}
        <div style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "24px",
          background: COLORS.sand,
          opacity: 0.8,
        }} />
        
        {/* Light rays from surface */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "20px",
          width: "30px",
          height: "100%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
          transform: "skewX(-10deg)",
        }} />
        <div style={{
          position: "absolute",
          top: "0",
          right: "60px",
          width: "40px",
          height: "100%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
          transform: "skewX(10deg)",
        }} />
        
        {/* Bubbles */}
        <Bubbles />
        
        {/* Submarine in background */}
        <div style={{
          position: "absolute",
          right: "20px",
          top: "30px",
          fontSize: "24px",
          opacity: 0.5,
        }}>
          🛥️
        </div>
        
        {/* Coral stations (agents) */}
        {agents.filter(a => a.role !== "manager").map(agent => (
          <CoralStation
            key={agent.id}
            agent={agent}
            isSelected={selected?.id === agent.id}
            onClick={() => { setSelected(agent); setShowStats(true); }}
          />
        ))}
        
        {/* Crush the turtle (manager) */}
        <div style={{
          position: "absolute",
          left: `${6 * 16}px`,
          top: `${6 * 16}px`,
          cursor: "pointer",
        }} onClick={() => { setSelected(agents[3]); setShowStats(true); }}>
          {/* Turtle shell */}
          <div style={{
            width: "32px",
            height: "24px",
            background: COLORS.turtle,
            borderRadius: "50%",
            position: "relative",
            boxShadow: `0 0 8px ${COLORS.turtle}`,
            animation: "sway 3s infinite ease-in-out",
          }}>
            {/* Shell pattern */}
            <div style={{ position: "absolute", left: "8px", top: "6px", width: "16px", height: "12px", border: "2px solid #2a7a4a", borderRadius: "50%", opacity: 0.5 }} />
          </div>
          {/* Head */}
          <div style={{
            position: "absolute",
            left: "-8px",
            top: "4px",
            width: "12px",
            height: "10px",
            background: COLORS.turtle,
            borderRadius: "50%",
          }} />
          {/* Flippers */}
          <div style={{ position: "absolute", left: "4px", top: "20px", width: "8px", height: "6px", background: COLORS.turtle, borderRadius: "50%" }} />
          <div style={{ position: "absolute", left: "20px", top: "20px", width: "8px", height: "6px", background: COLORS.turtle, borderRadius: "50%" }} />
          {/* Name */}
          <div style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "6px",
            color: "#fff",
            whiteSpace: "nowrap",
          }}>
            CRUSH
          </div>
        </div>
        
        {/* P. Sherman 42 reference */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          fontSize: "8px",
          color: "#666",
          fontFamily: "monospace",
        }}>
          P. Sherman 42
        </div>
      </div>
      
      {/* Stats panel */}
      {showStats && selected && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(0,20,40,0.9)",
          border: "2px solid #1a3a5c",
          borderRadius: "4px",
        }}>
          <div style={{ 
            color: COLORS.statusYellow, 
            fontSize: "12px",
            marginBottom: "8px",
            borderBottom: "1px solid #1a3a5c",
            paddingBottom: "4px",
          }}>
            🐠 {selected.name} STATS
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "4px",
            fontSize: "10px",
            color: "#88aacc",
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
              background: "#1a3a5c",
              border: "none",
              color: "#88aacc",
              fontSize: "8px",
              cursor: "pointer",
              fontFamily: "monospace",
              borderRadius: "4px",
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
        color: "#446688",
        textAlign: "center",
      }}>
        CLICK A CORAL TO INSPECT • JUST KEEP SWIMMING 🐠
      </div>
    </div>
  );
}