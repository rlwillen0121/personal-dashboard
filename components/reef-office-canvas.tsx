"use client";

import { useRef, useEffect, useState } from "react";

// Sprite paths mapping - sprites are in public/sprites/
type SpriteState = "idle" | "working" | "walking";

interface SpritePaths {
  idle: string;
  working?: string;
  walking?: string;
}

const SPRITE_PATHS: Record<string, SpritePaths> = {
  coder: {
    idle: "/sprites/coder-idle.svg",
    working: "/sprites/coder-working.svg",
  },
  researcher: {
    idle: "/sprites/researcher-idle.svg",
    working: "/sprites/researcher-working.svg",
  },
  tester: {
    idle: "/sprites/tester-idle.svg",
    working: "/sprites/tester-working.svg",
  },
  manager: {
    idle: "/sprites/manager-idle.svg",
    walking: "/sprites/manager-walking.svg",
  },
};

const STATUS_ICONS: Record<string, string> = {
  online: "/sprites/status-online.svg",
  offline: "/sprites/status-offline.svg",
  working: "/sprites/status-working.svg",
};

// Agent sprite component - uses external SVG sprites
function SpriteRenderer({ 
  role, 
  status, 
  size = 48 
}: { 
  role: "coder" | "researcher" | "tester" | "manager"; 
  status: "working" | "idle" | "offline";
  size?: number;
}) {
  // Determine which sprite to use based on role and status
  const getSpritePath = () => {
    const roleSprites = SPRITE_PATHS[role];
    if (!roleSprites) return SPRITE_PATHS.coder.idle; // fallback
    
    // Manager uses "walking" when not idle, otherwise "idle"
    if (role === "manager") {
      return status === "idle" ? roleSprites.idle : (roleSprites.walking || roleSprites.idle);
    }
    // Other roles use "working" when working, "idle" otherwise
    const activeStatus = status === "working" || status === "offline" ? "working" : "idle";
    return roleSprites[activeStatus] || roleSprites.idle;
  };

  // Get status icon
  const getStatusIcon = () => {
    if (status === "offline") return STATUS_ICONS.offline;
    if (status === "working") return STATUS_ICONS.working;
    return STATUS_ICONS.online;
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Status icon above agent (8x8 scaled to 16x16) */}
      <img 
        src={getStatusIcon()} 
        alt={status}
        className="absolute -top-2 -right-2 z-20"
        style={{ width: 16, height: 16, imageRendering: "pixelated" }}
      />
      
      {/* Agent sprite (16x16, scaled to desired size) */}
      <img 
        src={getSpritePath()} 
        alt={`${role} ${status}`}
        className="transition-all"
        style={{ 
          width: size, 
          height: size, 
          imageRendering: "pixelated",
        }}
      />
    </div>
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
}

const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "glm-5-coder", cost: 0.15, actions: 124, x: 15, y: 55 },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "glm-5-tester", cost: 0.08, actions: 89, x: 80, y: 30 },
  { id: "3", name: "CRUSH (RESEARCH)", role: "researcher", status: "working", sessionId: "glm-5-research", cost: 0.42, actions: 2500, x: 50, y: 50 },
  { id: "4", name: "HANK (MAIN)", role: "manager", status: "working", sessionId: "glm-5-main", cost: 1.25, actions: 567, x: 85, y: 65 },
];

function AgentSprite({ agent, selected, onClick }: { agent: Agent; selected: boolean; onClick: () => void }) {
  const [hoverY, setHoverY] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHoverY(Math.sin(Date.now() / 500 + agent.x) * 8);
    }, 50);
    return () => clearInterval(interval);
  }, [agent.x]);
  
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
      {/* Use the new sprite-based AgentSprite component (renamed to SpriteRenderer to avoid conflict) */}
      <SpriteRenderer role={agent.role} status={agent.status} size={48} />
      
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
