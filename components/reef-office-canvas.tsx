"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// 8-bit Color Maps for the Reef Squad
const PIXEL_MAPS = {
  nemo: [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,2,2,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0]
  ], // 1: Orange, 2: White/Stripe
  dory: [
    [0,1,1,1,1,0,0],
    [1,1,1,2,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,2,2,1,1,0],
    [0,1,1,1,1,0,0]
  ], // 1: Blue, 2: Yellow/Stripe
  crush: [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [2,0,0,0,2]
  ], // 1: Green Shell, 2: Flippers
  hank: [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [2,2,2,2,2],
    [2,0,2,0,2]
  ] // 1: Red/Orange Head, 2: Tentacles
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
  char: keyof typeof PIXEL_MAPS;
}

const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "qwen-3-42", cost: 0.15, actions: 124, x: 20, y: 60, color: "#f97316", char: "nemo" },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "gpt-oss-01", cost: 0.08, actions: 89, x: 75, y: 25, color: "#3b82f6", char: "dory" },
  { id: "3", name: "CRUSH (ARCH)", role: "researcher", status: "working", sessionId: "grok-4-fast", cost: 0.42, actions: 2500, x: 50, y: 45, color: "#22c55e", char: "crush" },
  { id: "4", name: "HANK (BRAIN)", role: "manager", status: "working", sessionId: "minimax-m2.5", cost: 1.25, actions: 567, x: 15, y: 20, color: "#ef4444", char: "hank" },
];

export default function ReefOfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 854, height: 480 });
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Ref for persistent state to avoid re-initializing on every render
  const stateRef = useRef({
    bubbles: Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100 + 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.4 + 0.2,
    })),
    agents: agents.map(a => ({ ...a, currentY: a.y, offset: Math.random() * Math.PI * 2 }))
  });

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 40, 960);
      setDimensions({ width, height: width * (9/16) });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const drawPixelSprite = useCallback((ctx: CanvasRenderingContext2D, agent: any, x: number, y: number, t: number) => {
    const pixelSize = 6;
    const map = PIXEL_MAPS[agent.char];
    const flipped = agent.x > 50;
    
    ctx.save();
    ctx.translate(x, y);
    if (flipped) ctx.scale(-1, 1);

    map.forEach((row, rowIndex) => {
      row.forEach((pixel, colIndex) => {
        if (pixel === 0) return;
        
        // Color logic based on pixel map values
        if (pixel === 1) ctx.fillStyle = agent.color;
        else if (pixel === 2) ctx.fillStyle = agent.char === 'nemo' ? "#fff" : "#fbbf24"; // Stripes/Accents
        
        ctx.fillRect(
          colIndex * pixelSize - (map[0].length * pixelSize) / 2,
          rowIndex * pixelSize - (map.length * pixelSize) / 2,
          pixelSize,
          pixelSize
        );
      });
    });

    // Draw "Working" Ping
    if (agent.status === "working") {
      ctx.fillStyle = "#22c55e";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#22c55e";
      ctx.beginPath();
      ctx.arc(15, -15, 3 + Math.sin(t * 5) * 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const animate = () => {
      timeRef.current += 0.015;
      const t = timeRef.current;
      const { width, height } = dimensions;

      // 1. Clear & Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#0077b6");
      skyGrad.addColorStop(0.7, "#00b4d8");
      skyGrad.addColorStop(1, "#90e0ef");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. God Rays
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(width * (0.2 + i * 0.3), 0);
        ctx.lineTo(width * (0.4 + i * 0.3), 0);
        ctx.lineTo(width * (0.1 + i * 0.3), height);
        ctx.lineTo(width * (i * 0.3), height);
        ctx.fill();
      }

      // 3. Bubbles
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      stateRef.current.bubbles.forEach(b => {
        b.y -= b.speed;
        if (b.y < -5) b.y = 105;
        ctx.beginPath();
        ctx.arc((b.x / 100) * width + Math.sin(t + b.x) * 10, (b.y / 100) * height, b.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Sand & Seaweed
      ctx.fillStyle = "#caf0f8";
      ctx.fillRect(0, height - 30, width, 30);

      // 5. Draw Agents
      stateRef.current.agents.forEach(agent => {
        const x = (agent.x / 100) * width;
        const hoverY = (agent.y / 100) * height + Math.sin(t * 2 + agent.offset) * 8;
        agent.currentY = (hoverY / height) * 100; // Update current position for click detection
        drawPixelSprite(ctx, agent, x, hoverY, t);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [dimensions, drawPixelSprite]);

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Detect click within a 10% radius of the agent
    const hit = stateRef.current.agents.find(a => Math.abs(a.x - clickX) < 8 && Math.abs(a.currentY - clickY) < 8);
    setSelected(hit || null);
  };

  return (
    <div className="flex flex-col items-center w-full bg-[#000814] p-6 rounded-2xl border-4 border-[#023e8a] font-mono">
      <div className="relative w-full group">
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height} 
          onClick={handleClick}
          className="rounded-lg shadow-[0_0_50px_rgba(0,180,216,0.3)] cursor-crosshair" 
        />
        
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
        Click an entity to initiate secure handshake • reef_os v2.2.4
      </p>
    </div>
  );
}