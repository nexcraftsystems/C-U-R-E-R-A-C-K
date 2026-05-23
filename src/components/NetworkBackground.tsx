import React, { useEffect, useRef } from "react";

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class representing nodes in our clinical network topology
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulseSpeed: number;
      pulseState: number;
      color: string;
    }

    const particles: Particle[] = [];
    const maxParticles = Math.min(60, Math.floor((width * height) / 25000)); // Responsive density
    const connectionDistance = 120; // Maximum distance to draw line

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      const isBrandColor = Math.random() > 0.4;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45, // Smooth, slow drift
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseState: Math.random() * Math.PI,
        color: isBrandColor ? "rgba(0, 122, 255, 0.45)" : "rgba(100, 116, 139, 0.3)"
      });
    }

    // Handles window resizing with canvas size resetting
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw all nodes and connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particle
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce particle off screen boundary edges with soft correction
        if (p1.x < 0) {
          p1.x = 0;
          p1.vx *= -1;
        } else if (p1.x > width) {
          p1.x = width;
          p1.vx *= -1;
        }

        if (p1.y < 0) {
          p1.y = 0;
          p1.vy *= -1;
        } else if (p1.y > height) {
          p1.y = height;
          p1.vy *= -1;
        }

        // Pulse state update for glow effects
        p1.pulseState += p1.pulseSpeed;
        const scaleRadius = p1.radius + Math.sin(p1.pulseState) * 0.6;

        // Draw connections between particle nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            // Draw smooth link line
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(0, 122, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw node center point
        ctx.fillStyle = p1.color;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, scaleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw subtle node aura ring
        ctx.strokeStyle = `rgba(0, 122, 255, 0.08)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, scaleRadius * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 block"
      style={{ mixBlendMode: "multiply", opacity: 0.8 }}
      id="clinical_networking_background_canvas"
    />
  );
}
