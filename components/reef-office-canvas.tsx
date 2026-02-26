"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

// SVG Asset Paths
const SVG_ASSETS = {
  background: "/setting.svg",
  nemo: "/nemo.svg",
  dory: "/dory.svg",
  crush: "/turtle.svg",
  hank: "/octopus.svg"
};

interface Agent {
  id: string;
  name: string;
  role: "coder" | "researcher" | "tester" | "manager";
  status: "working" | "idle" | "offline";
  sessionId?: string;
  cost?: number;
  actions?: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  color: string;
  char: "nemo" | "dory" | "crush" | "hank";
}

const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "glm-5-coder", cost: 0.15, actions: 124, x: 20, y: 60, color: "#f97316", char: "nemo" },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "glm-5-tester", cost: 0.08, actions: 89, x: 75, y: 25, color: "#3b82f6", char: "dory" },
  { id: "3", name: "CRUSH (ARCH)", role: "researcher", status: "working", sessionId: "glm-5-research", cost: 0.42, actions: 2500, x: 50, y: 45, color: "#22c55e", char: "crush" },
  { id: "4", name: "HANK (BRAIN)", role: "manager", status: "working", sessionId: "glm-5-main", cost: 1.25, actions: 567, x: 85, y: 70, color: "#ef4444", char: "hank" },
];

function AgentSprite({ agent, selected, onClick }: { agent: Agent & { offset: number }; selected: boolean; onClick: () => void }) {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.05), 50);
    return () => clearInterval(interval);
  }, []);
  
  const hoverY = Math.sin(time * 2 + agent.offset) * 10;
  const isFlipped = agent.x > 50;
  
  return (
    <div
      onClick={onClick}
      className={`absolute cursor-pointer transition-all duration-200 ${selected ? 'z-20 scale-125' : 'z-10 hover:scale-110'}`}
      style={{
        left: `${agent.x}%`,
        top: `${agent.y}%`,
        transform: `translate(-50%, -50%) translateY(${hoverY}px) ${isFlipped ? 'scaleX(-1)' : ''}`,
        width: '80px',
        height: '80px'
      }}
    >
      {/* Agent SVG */}
      <Image
        src={SVG_ASSETS[agent.char]}
        alt={agent.name}
        width={80}
        height={80}
        className="drop-shadow-lg"
        priority
      />
      
      {/* Working indicator */}
      {agent.status === "working" && (
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"
          style={{ boxShadow: '0 0 10px #22c55e' }}
        />
      )}
      
      {/* Selection ring */}
      {selected && (
        <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-pulse" />
      )}
    </div>
  );
}

export default function ReefOfficeCanvas() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 854, height: 480 });
  const [agentsWithOffset, setAgentsWithOffset] = useState<(Agent & { offset: number })[]>([]);
  
  useEffect(() => {
    // Add random offsets for animation variety
    setAgentsWithOffset(agents.map(a => ({ ...a, offset: Math.random() * Math.PI * 2 })));
    
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 80, 960);
      setDimensions({ width, height: width * (9/16) });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center w-full bg-[#000814] p-6 rounded-2xl border-4 border-[#023e8a] font-mono">
      <div 
        className="relative w-full overflow-hidden rounded-lg shadow-[0_0_50px_rgba(0,180,216,0.3)]"
        style={{ aspectRatio: '16/9', maxWidth: dimensions.width }}
      >
        {/* Background SVG */}
        <Image
          src={SVG_ASSETS.background}
          alt="8-bit Ocean Setting"
          fill
          className="object-cover"
          priority
        />
        
        {/* Agent Sprites */}
        {agentsWithOffset.map(agent => (
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
        Click an entity to initiate secure handshake • reef_os v2.3.0
      </p>
    </div>
  );
}
