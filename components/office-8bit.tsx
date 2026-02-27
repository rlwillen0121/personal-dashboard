"use client";

import { useState, useEffect } from "react";

// Sprite paths mapping - sprites are in public/sprites/reef/
// New 8-bit sprites from the character sprite sheet
// Each sprite has multiple frames for animation
type SpriteState = "idle" | "working" | "walking";

interface SpritePaths {
  idle: string[];
  working?: string[];
  walking?: string[];
}

const SPRITE_PATHS: Record<string, SpritePaths> = {
  coder: {
    idle: ["/sprites/reef/coder-idle1.png", "/sprites/reef/coder-idle2.png"],
    working: ["/sprites/reef/coder-working1.png", "/sprites/reef/coder-working2.png", "/sprites/reef/coder-working3.png", "/sprites/reef/coder-working4.png"],
  },
  researcher: {
    idle: ["/sprites/reef/researcher-idle1.png", "/sprites/reef/researcher-idle2.png"],
    working: ["/sprites/reef/researcher-working1.png", "/sprites/reef/researcher-working2.png", "/sprites/reef/researcher-working3.png", "/sprites/reef/researcher-working4.png"],
  },
  tester: {
    idle: ["/sprites/reef/tester-idle1.png", "/sprites/reef/tester-idle2.png"],
    working: ["/sprites/reef/tester-working1.png", "/sprites/reef/tester-working2.png", "/sprites/reef/tester-working3.png", "/sprites/reef/tester-working4.png"],
  },
  manager: {
    idle: ["/sprites/reef/manager-idle1.png", "/sprites/reef/manager-idle2.png"],
    walking: ["/sprites/reef/manager-walking1.png", "/sprites/reef/manager-walking2.png", "/sprites/reef/manager-walking3.png", "/sprites/reef/manager-walking4.png"],
  },
};

const STATUS_ICONS: Record<string, string> = {
  online: "/sprites/reef/status-online.png",
  offline: "/sprites/reef/status-offline.png",
  working: "/sprites/reef/status-working.png",
};

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
}

// Agent sprite component for office-8bit - uses animated PNG sprites with CSS
function AgentSprite8Bit({ 
  role, 
  status, 
  size = 48,
  agentName
}: { 
  role: "coder" | "researcher" | "tester" | "manager"; 
  status: "working" | "idle" | "offline";
  size?: number;
  agentName: string;
}) {
  // Determine which sprite frames to use based on role and status
  const getSpriteFrames = (): string[] => {
    const roleSprites = SPRITE_PATHS[role];
    if (!roleSprites) return SPRITE_PATHS.coder.idle;
    
    // Manager uses "walking" when not idle
    if (role === "manager") {
      return status === "idle" ? roleSprites.idle : (roleSprites.walking || roleSprites.idle);
    }
    // Other roles use "working" when working
    const activeStatus = status === "working" || status === "offline" ? "working" : "idle";
    return roleSprites[activeStatus] || roleSprites.idle;
  };

  const spriteFrames = getSpriteFrames();
  const frameCount = spriteFrames.length;
  
  // Animation duration based on frame count (0.5s per 4 frames)
  const animDuration = frameCount > 2 ? `${0.5 * (4 / frameCount)}s` : '1s';

  // Get status icon
  const getStatusIcon = () => {
    if (status === "offline") return STATUS_ICONS.offline;
    if (status === "working") return STATUS_ICONS.working;
    return STATUS_ICONS.online;
  };

  // Generate keyframes for sprite animation
  const spriteKeyframes = `
    @keyframes sprite-anim-${role}-${status} {
      0% { background-position: 0px 0px; }
      100% { background-position: -${size * frameCount}px 0px; }
    }
  `;

  return (
    <>
      <style>{spriteKeyframes}</style>
      <div 
        className={`relative transition-all duration-1000 group cursor-pointer`}
        style={{ 
          imageRendering: "pixelated",
          width: size,
          height: size,
          backgroundImage: `url(${spriteFrames[0]})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          animation: status !== 'offline' ? `sprite-anim-${role}-${status} ${animDuration} steps(${frameCount}) infinite` : 'none',
        }}
      >
        {/* Multi-frame sprite as stacked images (fallback/visible) */}
        <div className="relative w-full h-full">
          {spriteFrames.map((frame, idx) => (
            <img 
              key={idx}
              src={frame}
              alt={`${role} ${status} frame ${idx + 1}`}
              className="absolute top-0 left-0 w-full h-full"
              style={{ 
                imageRendering: "pixelated",
                opacity: status === 'offline' ? 0.5 : 1,
              }}
            />
          ))}
        </div>
        
        {/* Status icon above agent */}
        <img 
          src={getStatusIcon()} 
          alt={status}
          className="absolute -top-2 -right-2 z-20"
          style={{ width: 16, height: 16, imageRendering: "pixelated" }}
        />
        
        {/* Hover tooltip */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-[10px] px-2 py-0.5 rounded border border-white/20 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {agentName}
        </div>
      </div>
    </>
  );
}

const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "qwen-3-42", cost: 0.15, actions: 124, x: 15, y: 65, color: "#f97316" },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "gpt-oss-01", cost: 0.08, actions: 89, x: 70, y: 30, color: "#3b82f6" },
  { id: "3", name: "CRUSH (ARCH)", role: "researcher", status: "working", sessionId: "grok-4-fast", cost: 0.42, actions: 2500, x: 45, y: 50, color: "#22c55e" },
  { id: "4", name: "HANK (BRAIN)", role: "manager", status: "working", sessionId: "minimax-m2.5", cost: 1.25, actions: 567, x: 10, y: 15, color: "#ef4444" },
];

const OceanBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* God Rays */}
    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-white/10 to-transparent skew-x-[-20deg] blur-xl" />
    <div className="absolute top-0 left-2/3 w-48 h-full bg-gradient-to-b from-white/10 to-transparent skew-x-[-15deg] blur-2xl" />
    {/* Bubbles */}
    {[...Array(15)].map((_, i) => (
      <div key={i} className="absolute bottom-0 bg-white/40 rounded-full animate-bubble" style={{
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 8 + 4}px`,
        height: `${Math.random() * 8 + 4}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
      }} />
    ))}
  </div>
);

export default function ReefOffice() {
  const [selected, setSelected] = useState<Agent | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000814] p-8 font-mono">
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-600px) translateX(20px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-bubble {
          animation: bubble linear infinite;
        }
        .animate-float {
          animation: float ease-in-out infinite 3s;
        }
      `}</style>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl aspect-video bg-gradient-to-b from-[#0077b6] via-[#00b4d8] to-[#90e0ef] border-8 border-[#023e8a] rounded-xl shadow-2xl overflow-hidden">
        <OceanBackground />

        {/* Sand Bed */}
        <div className="absolute bottom-0 w-full h-16 bg-[#caf0f8] opacity-60 blur-sm" />
        <div className="absolute bottom-4 left-10 w-24 h-8 bg-green-700/40 rounded-full blur-md animate-pulse" />
        <div className="absolute bottom-4 right-20 w-32 h-10 bg-green-800/40 rounded-full blur-md animate-pulse delay-75" />

        {/* Agents in the Tank */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelected(agent)}
            className="absolute animate-float"
            style={{
              left: `${agent.x}%`,
              top: `${agent.y}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <AgentSprite8Bit role={agent.role} status={agent.status} size={48} agentName={agent.name} />
          </div>
        ))}

        {/* Floating Stat Terminal */}
        <div className="absolute top-4 right-4 w-64 bg-black/60 backdrop-blur-md border border-cyan-400/30 p-4 text-cyan-400 text-[10px] space-y-2 rounded-lg">
          <div className="flex justify-between border-b border-cyan-400/30 pb-1">
            <span>REEF_OS v2026.2.21</span>
            <span className="animate-pulse">● LIVE</span>
          </div>
          <div className="space-y-1">
            <p>&gt; TOTAL_THREATS: 0</p>
            <p>&gt; ACTIVE_SESSIONS: {agents.filter(a => a.status === "working").length}</p>
            <p>&gt; VPS_LOAD: 12.4%</p>
            <p className="text-yellow-400">&gt; CURRENT_BURN: $1.85/hr</p>
          </div>
        </div>
      </div>

      {/* Agent Detail Inspector */}
      {selected && (
        <div className="mt-8 w-full max-w-5xl bg-[#001d3d] border-2 border-cyan-500 p-6 rounded-lg shadow-glow">
          <div className="flex justify-between items-center mb-4 border-b border-cyan-500/50 pb-2">
            <h2 className="text-cyan-400 text-xl font-bold tracking-widest">{selected.name}</h2>
            <button onClick={() => setSelected(null)} className="text-cyan-400 hover:text-white">[X] CLOSE</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="bg-black/30 p-3 rounded">
              <span className="block text-gray-400 text-xs mb-1">DESIGNATION</span>
              <span className="text-white uppercase font-bold">{selected.role}</span>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <span className="block text-gray-400 text-xs mb-1">STATUS</span>
              <span className={`${selected.status === 'working' ? 'text-green-400' : 'text-yellow-400'} font-bold`}>
                {selected.status.toUpperCase()}
              </span>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <span className="block text-gray-400 text-xs mb-1">ACCUMULATED COST</span>
              <span className="text-red-400 font-bold">${selected.cost?.toFixed(2)}</span>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <span className="block text-gray-400 text-xs mb-1">TOTAL ACTIONS</span>
              <span className="text-cyan-400 font-bold">{selected.actions}</span>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-gray-500 italic">
            &gt; Binding session {selected.sessionId} to discord thread... SUCCESS.
          </div>
        </div>
      )}
    </div>
  );
}