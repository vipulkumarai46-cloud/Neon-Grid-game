import React, { useEffect, useRef } from 'react';

export default function ConfettiEffect({ active, colors = ['#00f0ff', '#ff007f'] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        // Randomly choose left or right corner to shoot from
        const shootFromLeft = Math.random() < 0.5;
        this.x = shootFromLeft ? 0 : canvas.width;
        this.y = canvas.height * 0.85;
        
        // Angle points diagonally up and inward
        const angleRange = 45; // degrees of dispersion
        const angleRad = shootFromLeft
          ? (-45 + (Math.random() * angleRange - angleRange / 2)) * Math.PI / 180
          : (-135 + (Math.random() * angleRange - angleRange / 2)) * Math.PI / 180;
        
        const speed = Math.random() * 14 + 14;
        
        this.vx = Math.cos(angleRad) * speed;
        this.vy = Math.sin(angleRad) * speed;
        
        this.size = Math.random() * 6 + 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = 1;
        this.fade = Math.random() * 0.012 + 0.006;
        this.gravity = 0.35;
        this.drag = 0.985;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 6 - 3;
        
        // Shape: 40% line, 30% square, 30% circle
        const rand = Math.random();
        this.shape = rand < 0.4 ? 'line' : rand < 0.7 ? 'square' : 'circle';
      }

      update() {
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fade;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.opacity;
        
        // Add neon glow to individual particles
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 2.5;

        if (this.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === 'square') {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          ctx.beginPath();
          ctx.moveTo(-this.size, 0);
          ctx.lineTo(this.size, 0);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    let particles = [];
    const maxParticles = 160;

    // Populate initial burst
    for (let i = 0; i < 90; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Spawn new ones to keep the stream alive
      if (particles.length < maxParticles && Math.random() < 0.45) {
        particles.push(new Particle());
      }

      particles.forEach((p, idx) => {
        p.update();
        p.draw();
        
        // If particle goes off screen or completely fades, replace/reset it
        if (p.opacity <= 0 || p.y > canvas.height + 30 || p.x < -30 || p.x > canvas.width + 30) {
          particles[idx] = new Particle();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-40"
    />
  );
}
