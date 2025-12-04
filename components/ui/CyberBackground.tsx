import React, { useEffect, useRef } from 'react';

interface CyberBackgroundProps {
  state: 'idle' | 'loading' | 'success';
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    let time = 0;
    
    // Grid Perspective
    const drawGrid = (t: number) => {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      
      // Horizon line
      const horizonY = h * 0.1; 
      
      ctx.strokeStyle = state === 'loading' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(100, 100, 100, 0.1)';
      ctx.lineWidth = 1;
      
      // Moving vertical lines (perspective)
      const fov = 300;
      
      for (let i = -1000; i <= 1000; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, horizonY);
        // Perspective projection for bottom point
        const x1 = (i) * (h / fov);
        const y1 = h;
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      // Moving horizontal lines
      const speed = state === 'loading' ? 2 : 0.5;
      const offset = (t * speed) % 100;
      
      for (let i = 0; i < h; i += 40) {
        const y = i + offset;
        if (y > h) continue; // optimization
        
        // Simple horizontal bars for retro grid feel
        // Calculate transparency based on distance from center/horizon
        const alpha = (y / h) * 0.2;
        ctx.strokeStyle = state === 'loading' ? `rgba(220, 38, 38, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.5})`;
        
        ctx.beginPath();
        ctx.moveTo(-w, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const particles: {x: number, y: number, z: number, s: number}[] = [];
    for(let i=0; i<100; i++) {
      particles.push({
        x: (Math.random() - 0.5) * w,
        y: (Math.random() - 0.5) * h,
        z: Math.random() * w,
        s: Math.random() * 2
      });
    }

    const drawParticles = () => {
      ctx.save();
      ctx.translate(w/2, h/2);
      
      particles.forEach(p => {
        // Move towards viewer
        p.z -= state === 'loading' ? 5 : 1;
        if (p.z <= 0) {
          p.z = w;
          p.x = (Math.random() - 0.5) * w;
          p.y = (Math.random() - 0.5) * h;
        }
        
        const k = 256 / p.z;
        const px = p.x * k;
        const py = p.y * k;
        const size = p.s * k;
        
        const alpha = (1 - p.z / w);
        ctx.fillStyle = state === 'loading' ? `rgba(220, 38, 38, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.5})`;
        
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    };

    const animate = () => {
      time++;
      // Clear with trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 1)';
      ctx.fillRect(0, 0, w, h);
      
      // Radial glow center
      const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      gradient.addColorStop(0, 'rgba(20, 0, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,w,h);

      drawGrid(time);
      drawParticles();

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [state]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default CyberBackground;