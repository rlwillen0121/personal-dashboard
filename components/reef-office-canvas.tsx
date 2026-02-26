"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// Agent data interface
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

// Agent positions
const agents: Agent[] = [
  { id: "1", name: "NEMO (CODER)", role: "coder", status: "working", sessionId: "glm-5-coder", cost: 0.15, actions: 124, x: 15, y: 55 },
  { id: "2", name: "DORY (TESTER)", role: "tester", status: "idle", sessionId: "glm-5-tester", cost: 0.08, actions: 89, x: 80, y: 30 },
  { id: "3", name: "CRUSH (RESEARCH)", role: "researcher", status: "working", sessionId: "glm-5-research", cost: 0.42, actions: 2500, x: 50, y: 50 },
  { id: "4", name: "HANK (MAIN)", role: "manager", status: "working", sessionId: "glm-5-main", cost: 1.25, actions: 567, x: 85, y: 65 },
];

// Sprite paths mapping
const SPRITE_PATHS: Record<string, string> = {
  coder: "/sprites/reef/coder.png",
  researcher: "/sprites/reef/researcher.png",
  tester: "/sprites/reef/tester.png",
  manager: "/sprites/reef/manager.png",
};

const STATUS_ICON_PATHS: Record<string, string> = {
  online: "/sprites/reef/status-online.png",
  offline: "/sprites/reef/status-offline.png",
  working: "/sprites/reef/status-working.png",
};

const BG_PATH = "/sprites/reef/reef-bg.png";
const DESK_PATH = "/sprites/reef/coral-desk.png";

// Animation state
interface AnimationState {
  frame: number;
  lastFrameTime: number;
  idleFrame: number;
  workingFrame: number;
}

export default function ReefOfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 854, height: 480 });
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);
  const [spriteImages, setSpriteImages] = useState<Record<string, HTMLImageElement>>({});
  const [statusImages, setStatusImages] = useState<Record<string, HTMLImageElement>>({});
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [deskImage, setDeskImage] = useState<HTMLImageElement | null>(null);
  
  const animationRef = useRef<number>(0);
  const animState = useRef<AnimationState>({
    frame: 0,
    lastFrameTime: 0,
    idleFrame: 0,
    workingFrame: 0,
  });
  
  // Load all sprite images
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(new Image()); // Empty on error
        img.src = src;
      });
    };
    
    const loadAllImages = async () => {
      const sprites: Record<string, HTMLImageElement> = {};
      const statuses: Record<string, HTMLImageElement> = {};
      
      for (const [role, path] of Object.entries(SPRITE_PATHS)) {
        sprites[role] = await loadImage(path);
      }
      
      for (const [status, path] of Object.entries(STATUS_ICON_PATHS)) {
        statuses[status] = await loadImage(path);
      }
      
      setSpriteImages(sprites);
      setStatusImages(statuses);
      setBgImage(await loadImage(BG_PATH));
      setDeskImage(await loadImage(DESK_PATH));
    };
    
    loadAllImages();
    
    // Initialize bubbles
    setBubbles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 + 100,
        size: Math.random() * 6 + 3,
        speed: Math.random() * 0.5 + 0.2,
      }))
    );
    
    // Handle resize
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 80, 960);
      setDimensions({ width, height: width * (9 / 16) });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Draw to canvas
  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    if (bgImage && bgImage.complete) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(bgImage, 0, 0, width, height);
    } else {
      // Fallback gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#1a3a5c");
      gradient.addColorStop(1, "#2c6fa5");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Draw coral desks
    if (deskImage && deskImage.complete) {
      ctx.imageSmoothingEnabled = false;
      // Draw multiple desks
      ctx.drawImage(deskImage, width * 0.1, height * 0.7, 80, 60);
      ctx.drawImage(deskImage, width * 0.4, height * 0.75, 80, 60);
      ctx.drawImage(deskImage, width * 0.7, height * 0.65, 80, 60);
    }
    
    // Calculate animation frames
    const state = animState.current;
    if (time - state.lastFrameTime > 200) {
      state.frame = (state.frame + 1) % 4;
      state.idleFrame = state.frame % 2;
      state.workingFrame = 2 + Math.floor(state.frame / 2);
      state.lastFrameTime = time;
    }
    
    // Draw agents
    const spriteSize = 48;
    
    agents.forEach((agent, idx) => {
      const screenX = (agent.x / 100) * width;
      const screenY = (agent.y / 100) * height;
      
      // Bobbing animation
      const bobOffset = Math.sin(time / 500 + idx) * 5;
      const finalY = screenY + bobOffset;
      
      // Get sprite
      const sprite = spriteImages[agent.role];
      if (sprite && sprite.complete) {
        ctx.imageSmoothingEnabled = false;
        
        // Select frame based on status
        const frameX = agent.status === "idle" ? state.idleFrame : state.workingFrame;
        
        // Draw sprite frame
        ctx.drawImage(
          sprite,
          frameX * 32, 0,  // Source X, Y
          32, 32,         // Source width, height
          screenX - spriteSize / 2, // Dest X
          finalY - spriteSize / 2, // Dest Y
          spriteSize, spriteSize   // Dest width, height
        );
      }
      
      // Draw status bubble
      const statusImg = statusImages[agent.status === "offline" ? "offline" : agent.status === "working" ? "working" : "online"];
      if (statusImg && statusImg.complete) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(statusImg, screenX + spriteSize / 2 - 12, finalY - spriteSize / 2 - 16, 16, 16);
      }
      
      // Draw selection ring if selected
      if (selected?.id === agent.id) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, finalY, spriteSize / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Glow effect
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw bubbles
    setBubbles((prevBubbles) => {
      return prevBubbles.map((bubble) => {
        const bubbleY = bubble.y < -5 ? 105 : bubble.y - bubble.speed;
        
        // Draw bubble
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(
          (bubble.x / 100) * width,
          (bubbleY / 100) * height,
          bubble.size / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Bubble highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(
          (bubble.x / 100) * width - bubble.size / 6,
          (bubbleY / 100) * height - bubble.size / 6,
          bubble.size / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        return { ...bubble, y: bubbleY };
      });
    });
    
    // Continue animation
    animationRef.current = requestAnimationFrame((t) => draw(ctx, t));
  }, [selected, spriteImages, statusImages, bgImage, deskImage]);
  
  // Set up canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Start animation
    animationRef.current = requestAnimationFrame((t) => draw(ctx, t));
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, draw]);
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Scale click coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = clickX * scaleX;
    const canvasY = clickY * scaleY;
    
    // Check if clicked on an agent
    for (const agent of agents) {
      const agentX = (agent.x / 100) * canvas.width;
      const agentY = (agent.y / 100) * canvas.height;
      const dist = Math.sqrt((canvasX - agentX) ** 2 + (canvasY - agentY) ** 2);
      
      if (dist < 40) {
        setSelected(selected?.id === agent.id ? null : agent);
        return;
      }
    }
    
    // Clicked on empty space
    setSelected(null);
  };

  return (
    <div className="flex flex-col items-center w-full bg-[#000814] p-6 rounded-2xl border-4 border-[#023e8a] font-mono">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="relative w-full overflow-hidden rounded-lg shadow-[0_0_50px_rgba(0,180,216,0.3)] cursor-pointer"
        style={{
          aspectRatio: "16/9",
          maxWidth: dimensions.width,
          imageRendering: "pixelated",
        }}
      />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm border border-cyan-500/50 p-3 rounded text-[10px] text-cyan-400 pointer-events-none">
        <p className="border-b border-cyan-500/30 mb-1 pb-1">REEF_OS // SYS_CHECK</p>
        <p>&gt; ACTIVE_SQUADS: {agents.filter((a) => a.status === "working").length}</p>
        <p>&gt; BURN_RATE: ${agents.reduce((s, a) => s + (a.cost || 0), 0).toFixed(2)}/hr</p>
        <p className="text-green-400 animate-pulse">&gt; STATUS: OPTIMAL</p>
      </div>

      {selected && (
        <div className="mt-6 w-full bg-[#001d3d] border-2 border-cyan-500 p-5 rounded-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-cyan-500/30 mb-4 pb-2">
            <h2 className="text-cyan-400 font-bold text-lg tracking-tighter">
              &gt; {selected.name}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="text-red-400 hover:text-white transition-colors"
            >
              [TERMINATE_VIEW]
            </button>
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
