"use client";

import { useRef, useEffect, useState } from "react";

// Custom 8-bit Pixel Art SVG Components
function PixelFish({ color, accentColor, facing = "right" }: { color: string; accentColor: string; facing?: "left" | "right" }) {
  const scale = facing === "left" ? -1 : 1;
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" style={{ transform: `scaleX(${scale})` }}>
      {/* Body */}
      <rect x="16" y="12" width="32" height="24" fill={color} />
      {/* Head */}
      <rect x="40" y="8" width="16" height="32" fill={color} />
      {/* Tail */}
      <rect x="4" y="16" width="16" height="16" fill={color} />
      <rect x="0" y="20" width="8" height="8" fill={color} />
      {/* Eye */}
      <rect x="48" y="16" width="6" height="6" fill="white" />
      <rect x="50" y="18" width="3" height="3" fill="black" />
      {/* Stripes */}
      <rect x="24" y="12" width="4" height="24" fill={accentColor} />
      <rect x="32" y="12" width="4" height="24" fill={accentColor} />
      {/* Fin */}
      <rect x="28" y="4" width="8" height="8" fill={color} />
    </svg>
  );
}

function PixelTurtle({ color, accentColor }: { color: string; accentColor: string }) {
  return (
    <svg width="64" height="48" viewBox="0 0 64 48">
      {/* Shell */}
      <rect x="12" y="8" width="40" height="32" fill={color} />
      <rect x="8" y="12" width="48" height="24" fill={color} />
      {/* Shell pattern */}
      <rect x="16" y="12" width="12" height="12" fill={accentColor} />
      <rect x="36" y="12" width="12" height="12" fill={accentColor} />
      <rect x="26" y="24" width="12" height="12" fill={accentColor} />
      {/* Head */}
      <rect x="52" y="16" width="10" height="16" fill={color} />
      {/* Eye */}
      <rect x="56" y="20" width="4" height="4" fill="white" />
      <rect x="58" y="22" width="2" height="2" fill="black" />
      {/* Flippers */}
      <rect x="4" y="8" width="12" height="8" fill={color} />
      <rect x="4" y="32" width="12" height="8" fill={color} />
      <rect x="48" y="8" width="8" height="6" fill={color} />
      <rect x="48" y="34" width="8" height="6" fill={color} />
      {/* Tail */}
      <rect x="0" y="22" width="6" height="4" fill={color} />
    </svg>
  );
}

function PixelOctopus({ color, accentColor }: { color: string; accentColor: string }) {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56">
      {/* Head */}
      <rect x="16" y="4" width="32" height="28" fill={color} />
      <rect x="12" y="12" width="40" height="20" fill={color} />
      {/* Eyes */}
      <rect x="20" y="16" width="8" height="8" fill="white" />
      <rect x="36" y="16" width="8" height="8" fill="white" />
      <rect x="22" y="18" width="4" height="4" fill="black" />
      <rect x="38" y="18" width="4" height="4" fill="black" />
      {/* Angry eyebrows */}
      <rect x="18" y="12" width="12" height="4" fill={accentColor} />
      <rect x="34" y="12" width="12" height="4" fill={accentColor} />
      {/* Tentacles */}
      <rect x="12" y="32" width="8" height="20" fill={color} />
      <rect x="22" y="32" width="8" height="24" fill={color} />
      <rect x="34" y="32" width="8" height="24" fill={color} />
      <rect x="44" y="32" width="8" height="20" fill={color} />
      {/* Suckers */}
      <rect x="14" y="44" width="4" height="4" fill={accentColor} />
      <rect x="24" y="48" width="4" height="4" fill={accentColor} />
      <rect x="36" y="48" width="4" height="4" fill={accentColor} />
      <rect x="46" y="44" width="4" height="4" fill={accentColor} />
    </svg>
  );
}

// Background component - underwater scene
function UnderwaterBackground() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0077b6" />
          <stop offset="50%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#90e0ef" />
        </linearGradient>
        <linearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#caf0f8" />
          <stop offset="100%" stopColor="#ade8f4" />
        </linearGradient>
      </defs>
      
      {/* Water background */}
      <rect width="100%" height="100%" fill="url(#waterGrad)" />
      
      {/* God rays */}
      <polygon points="200,0 300,0 100,540 0,540" fill="rgba(255,255,255,0.05)" />
      <polygon points="500,0 600,0 400,540 300,540" fill="rgba(255,255,255,0.05)" />
      <polygon points="800,0 900,0 700,540 600,540" fill="rgba(255,255,255,0.05)" />
      
      {/* Sandy bottom */}
      <rect x="0" y="480" width="960" height="60" fill="url(#sandGrad)" />
      
      {/* Coral/rocks */}
      <ellipse cx="100" cy="520" rx="80" ry="30" fill="#48cae4" />
      <ellipse cx="300" cy="510" rx="60" ry="25" fill="#00b4d8" />
      <ellipse cx="700" cy="515" rx="90" ry="35" fill="#48cae4" />
      <ellipse cx="880" cy="520" rx="70" ry="28" fill="#0096c7" />
      
      {/* Seaweed */}
      <rect x="150" y="400" width="12" height="100" fill="#2d6a4f" rx="6" />
      <rect x="170" y="420" width="10" height="80" fill="#40916c" rx="5" />
      <rect x="750" y="380" width="14" height="120" fill="#2d6a4f" rx="7" />
      <rect x="780" y="400" width="12" height="100" fill="#40916c" rx="6" />
    </svg>
  );
}

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
  color: string;
  accentColor: string;
  type: "nemo" | "dory" | "crush" | "hank";
}

const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "glm-5-coder", cost: 0.15, actions: 124, x: 15, y: 55, color: "#f97316", accentColor: "#ffffff", type: "nemo" },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "glm-5-tester", cost: 0.08, actions: 89, x: 80, y: 30, color: "#3b82f6", accentColor: "#fbbf24", type: "dory" },
  { id: "3", name: "CRUSH (RESEARCH)", role: "researcher", status: "working", sessionId: "glm-5-research", cost: 0.42, actions: 2500, x: 50, y: 50, color: "#22c55e", accentColor: "#166534", type: "crush" },
  { id: "4", name: "HANK (MAIN)", role: "manager", status: "working", sessionId: "glm-5-main", cost: 1.25, actions: 567, x: 85, y: 65, color: "#ef4444", accentColor: "#7f1d1d", type: "hank" },
];

function AgentSprite({ agent, selected, onClick }: { agent: Agent; selected: boolean; onClick: () => void }) {
  const [hoverY, setHoverY] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHoverY(Math.sin(Date.now() / 500 + agent.x) * 8);
    }, 50);
    return () => clearInterval(interval);
  }, [agent.x]);
  
  const renderSprite = () => {
    switch (agent.type) {
      case "nemo":
        return <PixelFish color={agent.color} accentColor={agent.accentColor} facing="right" />;
      case "dory":
        return <PixelFish color={agent.color} accentColor={agent.accentColor} facing="left" />;
      case "crush":
        return <PixelTurtle color={agent.color} accentColor={agent.accentColor} />;
      case "hank":
        return <PixelOctopus color={agent.color} accentColor={agent.accentColor} />;
    }
  };
  
  return (
    <div
      onClick={onClick}
      className={`absolute cursor-pointer transition-all duration-200 ${selected ? 'z-20 scale-125' : 'z-10 hover:scale-110'}`}
      style={{
        left: `${agent.x}%`,
        top: `${agent.y}%`,
        transform: `translate(-50%, -50%) translateY(${hoverY}px)`,
      }}
    >
      {renderSprite()}
      
      {/* Working indicator */}
      {agent.status === "working" && (
        <div 
          className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full animate-pulse"
          style={{ boxShadow: '0 0 10px #22c55e' }}
        />
      )}
      
      {/* Selection ring */}
      {selected && (
        <div className="absolute inset-0 border-4 border-cyan-400 rounded-full animate-pulse" style={{ margin: '-8px' }} />
      )}
      
      {/* Name label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded">
        {agent.name.split(' ')[0]}
      </div>
    </div>
  );
}

export default function ReefOfficeCanvas() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 854, height: 480 });
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);
  
  useEffect(() => {
    // Initialize bubbles
    setBubbles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 + 100,
        size: Math.random() * 6 + 3,
        speed: Math.random() * 0.5 + 0.2
      }))
    );
    
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 80, 960);
      setDimensions({ width, height: width * (9/16) });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Animate bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({
        ...b,
        y: b.y < -5 ? 105 : b.y - b.speed
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center w-full bg-[#000814] p-6 rounded-2xl border-4 border-[#023e8a] font-mono">
      <div 
        className="relative w-full overflow-hidden rounded-lg shadow-[0_0_50px_rgba(0,180,216,0.3)]"
        style={{ aspectRatio: '16/9', maxWidth: dimensions.width }}
      >
        {/* Background */}
        <div className="absolute inset-0">
          <UnderwaterBackground />
        </div>
        
        {/* Bubbles */}
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
            }}
          />
        ))}
        
        {/* Agent Sprites */}
        {agents.map(agent => (
          <AgentSprite
            key={agent.id}
            agent={agent}
            selected={selected?.id === agent.id}
            onClick={() => setSelected(selected?.id === agent.id ? null : agent)}
          />
        ))}
        
        {/* HUD Overlay */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm border border-cyan-500/50 p-3 rounded text-[10px] text-cyan-400 pointer-events-none">
          <p className="border-b border-cyan-500/30 mb-1 pb-1">REEF_OS // SYS_CHECK</p>
          <p>&gt; ACTIVE_SQUADS: {agents.filter(a => a.status === 'working').length}</p>
          <p>&gt; BURN_RATE: ${agents.reduce((s, a) => s + (a.cost || 0), 0).toFixed(2)}/hr</p>
          <p className="text-green-400 animate-pulse">&gt; STATUS: OPTIMAL</p>
        </div>
      </div>

      {selected && (
        <div className="mt-6 w-full bg-[#001d3d] border-2 border-cyan-500 p-5 rounded-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-cyan-500/30 mb-4 pb-2">
            <h2 className="text-cyan-400 font-bold text-lg tracking-tighter">&gt; {selected.name}</h2>
            <button onClick={() => setSelected(null)} className="text-red-400 hover:text-white transition-colors">[TERMINATE_VIEW]</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-black/40 p-3 rounded">
              <p className="text-gray-500 mb-1">DESIGNATION</p>
              <p className="text-white font-bold">{selected.role.toUpperCase()}</p>
            </div>
            <div className="bg-black/40 p-3 rounded">
              <p className="text-gray-500 mb-1">SESSION_ID</p>
              <p className="text-cyan-300">{selected.sessionId}</p>
            </div>
            <div className="bg-black/40 p-3 rounded">
              <p className="text-gray-500 mb-1">DATA_OPS</p>
              <p className="text-white">{selected.actions} CALLS</p>
            </div>
            <div className="bg-black/40 p-3 rounded border border-green-500/20">
              <p className="text-gray-500 mb-1">UPTIME_HEALTH</p>
              <p className="text-green-400 font-bold">99.9%</p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-[10px] text-cyan-700 uppercase tracking-widest">
        Click an entity to initiate secure handshake • reef_os v2.3.1
      </p>
    </div>
  );
}
