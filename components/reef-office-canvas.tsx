"use client";

import { useRef, useEffect, useState, useCallback } from "react";

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

const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "qwen-3-42", cost: 0.15, actions: 124, x: 15, y: 65, color: "#f97316" },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "gpt-oss-01", cost: 0.08, actions: 89, x: 70, y: 30, color: "#3b82f6" },
  { id: "3", name: "CRUSH (ARCH)", role: "researcher", status: "working", sessionId: "grok-4-fast", cost: 0.42, actions: 2500, x: 45, y: 50, color: "#22c55e" },
  { id: "4", name: "HANK (BRAIN)", role: "manager", status: "working", sessionId: "minimax-m2.5", cost: 1.25, actions: 567, x: 10, y: 15, color: "#ef4444" },
];

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
}

export default function ReefOfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 854, height: 480 });
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const agentsRef = useRef(agents.map(a => ({ ...a, baseX: a.x, baseY: a.y, offset: Math.random() * Math.PI * 2 })));

  // Initialize bubbles
  useEffect(() => {
    bubblesRef.current = Array.from({ length: 15 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100 + 100,
      size: Math.random() * 6 + 3,
      speed: Math.random() * 0.5 + 0.3,
      wobble: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("reef-canvas-container");
      if (container) {
        const width = Math.min(container.clientWidth, 854);
        const height = width * (9 / 16);
        setDimensions({ width, height });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw fish shape
  const drawFish = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number, flipped: boolean, working: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    if (flipped) ctx.scale(-1, 1);
    
    // Fish body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, 0);
    ctx.lineTo(-size * 1.4, -size * 0.5);
    ctx.lineTo(-size * 1.4, size * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(size * 0.4, -size * 0.15, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(size * 0.45, -size * 0.15, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Working indicator
    if (working) {
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(size * 0.8, -size * 0.5, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bgImage: HTMLImageElement | null = null;
    const bg = new Image();
    bg.src = "/reef-bg.png";
    bg.onload = () => { bgImage = bg; };

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw background
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, dimensions.width, dimensions.height);
      } else {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
        gradient.addColorStop(0, "#0077b6");
        gradient.addColorStop(0.5, "#00b4d8");
        gradient.addColorStop(1, "#90e0ef");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      }

      // Draw sand
      ctx.fillStyle = "rgba(202, 240, 248, 0.4)";
      ctx.fillRect(0, dimensions.height - 40, dimensions.width, 40);

      // Draw bubbles
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      bubblesRef.current.forEach((bubble) => {
        bubble.y -= bubble.speed;
        bubble.wobble += 0.05;
        const wobbleX = Math.sin(bubble.wobble) * 2;

        if (bubble.y < -10) {
          bubble.y = dimensions.height + 10;
          bubble.x = Math.random() * 100;
        }

        const bx = (bubble.x / 100) * dimensions.width + wobbleX;
        const by = (bubble.y / 100) * dimensions.height;

        ctx.beginPath();
        ctx.arc(bx, by, bubble.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw agents
      agentsRef.current.forEach((agent) => {
        const x = (agent.baseX / 100) * dimensions.width;
        const baseY = (agent.baseY / 100) * dimensions.height;
        const y = baseY + Math.sin(t * 2 + agent.offset) * 5;
        const flipped = agent.baseX > 50;

        drawFish(ctx, x, y, agent.color, 24, flipped, agent.status === "working");
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, drawFish]);

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    agentsRef.current.forEach((agent) => {
      const ax = (agent.baseX / 100) * dimensions.width;
      const ay = (agent.baseY / 100) * dimensions.height;
      const dist = Math.sqrt((clickX - ax) ** 2 + (clickY - ay) ** 2);
      if (dist < 30) {
        setSelected(agents.find(a => a.id === agent.id) || null);
      }
    });
  };

  const activeCount = agents.filter(a => a.status === "working").length;
  const totalCost = agents.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <div className="flex flex-col items-center justify-center p-4 font-mono">
      {/* Canvas Container */}
      <div id="reef-canvas-container" className="relative w-full max-w-5xl">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleClick}
          className="w-full border-4 border-[#023e8a] rounded-xl shadow-2xl cursor-pointer"
          style={{ aspectRatio: "16/9" }}
        />
        
        {/* Stat Terminal Overlay */}
        <div className="absolute top-4 right-4 w-64 bg-black/60 backdrop-blur-md border border-cyan-400/30 p-4 text-cyan-400 text-[10px] space-y-2 rounded-lg">
          <div className="flex justify-between border-b border-cyan-400/30 pb-1">
            <span>REEF_OS v2026.2.24</span>
            <span className="animate-pulse">● LIVE</span>
          </div>
          <div className="space-y-1">
            <p>&gt; TOTAL_THREATS: 0</p>
            <p>&gt; ACTIVE_SESSIONS: {activeCount}</p>
            <p>&gt; VPS_LOAD: 12.4%</p>
            <p className="text-yellow-400">&gt; CURRENT_BURN: ${totalCost.toFixed(2)}/hr</p>
          </div>
        </div>
      </div>

      {/* Agent Detail Inspector */}
      {selected && (
        <div className="mt-8 w-full max-w-5xl bg-[#001d3d] border-2 border-cyan-500 p-6 rounded-lg">
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

      <div className="mt-4 text-xs text-cyan-400/60 text-center">
        CLICK A FISH TO INSPECT • REEF_OS v2026.2.24
      </div>
    </div>
  );
}