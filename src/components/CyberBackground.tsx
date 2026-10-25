import React, { useEffect, useRef } from 'react';

interface CyberBackgroundProps {
  intensity?: 'high' | 'medium';
}

export const CyberBackground: React.FC<CyberBackgroundProps> = ({ intensity = 'high' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Network Particles & Glowing Nodes (Amber and Electric Orange)
    const particleCount = Math.min(width < 768 ? 32 : 55, 70);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.2 + 1.2,
      baseAlpha: Math.random() * 0.5 + 0.35,
      pulseSpeed: Math.random() * 0.02 + 0.012,
      phase: Math.random() * Math.PI * 2,
    }));

    // Floating Translucent Amber Glass Spheres
    const sphereCount = width < 768 ? 3 : 6;
    const spheres = Array.from({ length: sphereCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 35 + 25,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.008,
    }));

    // Floating Chrome Cubes (metallic chrome with amber specular reflections)
    const cubeCount = width < 768 ? 3 : 5;
    const cubes = Array.from({ length: cubeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 18 + 14,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      rotAngle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      floatOffset: Math.random() * Math.PI * 2,
    }));

    // Light trails / comets traveling along energy ribbons
    const trailCount = 5;
    const trails = Array.from({ length: trailCount }, (_, i) => ({
      progress: i / trailCount,
      speed: 0.0018 + Math.random() * 0.0015,
      ribbonIndex: i % 3,
      length: 85 + Math.random() * 65,
    }));

    let time = 0;

    const render = () => {
      time += prefersReducedMotion ? 0.002 : 0.012;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const parallaxX = (mouse.x - width / 2) * 0.035;
      const parallaxY = (mouse.y - height / 2) * 0.035;

      // Clear with Charcoal Black (#15120F)
      ctx.fillStyle = '#15120F';
      ctx.fillRect(0, 0, width, height);

      // Deep Burnt Umber (#2B1B13) and Warm Amber Ambient Glows
      const radialGlow = ctx.createRadialGradient(
        width * 0.3 + parallaxX * 0.6,
        height * 0.25 + parallaxY * 0.6,
        50,
        width * 0.3 + parallaxX * 0.6,
        height * 0.25 + parallaxY * 0.6,
        width * 0.7
      );
      radialGlow.addColorStop(0, 'rgba(43, 27, 19, 0.75)');
      radialGlow.addColorStop(0.5, 'rgba(255, 135, 61, 0.09)');
      radialGlow.addColorStop(1, 'rgba(21, 18, 15, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      const secondaryGlow = ctx.createRadialGradient(
        width * 0.8 - parallaxX * 0.5,
        height * 0.75 - parallaxY * 0.5,
        50,
        width * 0.8 - parallaxX * 0.5,
        height * 0.75 - parallaxY * 0.5,
        width * 0.6
      );
      secondaryGlow.addColorStop(0, 'rgba(255, 180, 94, 0.10)');
      secondaryGlow.addColorStop(0.6, 'rgba(43, 27, 19, 0.45)');
      secondaryGlow.addColorStop(1, 'rgba(21, 18, 15, 0)');
      ctx.fillStyle = secondaryGlow;
      ctx.fillRect(0, 0, width, height);

      // Perspective Digital Mesh / Grid Floor with warm amber glow
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 135, 61, 0.045)';
      ctx.lineWidth = 1;
      const gridSpacing = 60;
      const startX = -(parallaxX * 0.4) % gridSpacing;
      const startY = -(parallaxY * 0.4) % gridSpacing;

      ctx.beginPath();
      for (let x = startX; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // Large Glowing Orange and Amber Energy Ribbons
      const drawRibbon = (
        baseYRatio: number,
        amplitude: number,
        frequency: number,
        ribbonSpeed: number,
        colorStart: string,
        colorEnd: string,
        ribbonWidth: number,
        alpha: number
      ) => {
        ctx.save();
        ctx.beginPath();
        const baseY = height * baseYRatio + parallaxY * 0.8;

        ctx.moveTo(0, baseY);
        for (let x = 0; x <= width; x += 12) {
          const wave1 = Math.sin(x * frequency + time * ribbonSpeed) * amplitude;
          const wave2 = Math.cos(x * (frequency * 0.6) - time * (ribbonSpeed * 0.7)) * (amplitude * 0.45);
          const y = baseY + wave1 + wave2;
          ctx.lineTo(x, y);
        }

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(0.5, colorEnd);
        gradient.addColorStop(1, colorStart);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = ribbonWidth;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#FF873D';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      };

      // Layer 1: Deep burnt umber to electric orange backdrop ribbon
      drawRibbon(0.35, 75, 0.0016, 0.8, '#2B1B13', '#FF873D', 3.5, 0.35);

      // Layer 2: Main electric orange & amber glow radiant ribbon
      drawRibbon(0.52, 95, 0.0018, 1.2, '#FF873D', '#FFB45E', 4.5, 0.45);

      // Layer 3: Lower high-frequency champagne & amber accent ribbon
      drawRibbon(0.68, 60, 0.0024, 1.5, '#FFD5A3', '#2B1B13', 2.8, 0.38);

      // Sweeping Light Trails / Comets along energy flow
      trails.forEach((trail) => {
        trail.progress += trail.speed;
        if (trail.progress > 1) trail.progress = 0;

        const ribbonFreq = [0.0016, 0.0018, 0.0024][trail.ribbonIndex];
        const ribbonAmp = [75, 95, 60][trail.ribbonIndex];
        const ribbonBaseY = [height * 0.35, height * 0.52, height * 0.68][trail.ribbonIndex] + parallaxY * 0.8;
        const ribbonSpeed = [0.8, 1.2, 1.5][trail.ribbonIndex];

        const headX = trail.progress * (width + 100);
        const wave1 = Math.sin(headX * ribbonFreq + time * ribbonSpeed) * ribbonAmp;
        const wave2 = Math.cos(headX * (ribbonFreq * 0.6) - time * (ribbonSpeed * 0.7)) * (ribbonAmp * 0.45);
        const headY = ribbonBaseY + wave1 + wave2;

        ctx.save();
        const trailGradient = ctx.createLinearGradient(headX - trail.length, headY, headX, headY);
        trailGradient.addColorStop(0, 'rgba(255, 135, 61, 0)');
        trailGradient.addColorStop(0.7, 'rgba(255, 180, 94, 0.45)');
        trailGradient.addColorStop(1, 'rgba(255, 248, 241, 0.95)');

        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(headX - trail.length, headY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Glowing Comet Head
        ctx.fillStyle = '#FFF8F1';
        ctx.shadowColor = '#FFB45E';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(headX, headY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating Translucent Amber Glass Spheres
      spheres.forEach((sph) => {
        sph.x += sph.vx;
        sph.y += sph.vy;
        sph.angle += sph.angularSpeed;

        if (sph.x < -sph.radius) sph.x = width + sph.radius;
        if (sph.x > width + sph.radius) sph.x = -sph.radius;
        if (sph.y < -sph.radius) sph.y = height + sph.radius;
        if (sph.y > height + sph.radius) sph.y = -sph.radius;

        const posX = sph.x + parallaxX * 0.5;
        const posY = sph.y + parallaxY * 0.5;

        ctx.save();
        // Glass Sphere outer gradient with champagne & amber tint
        const glassGrad = ctx.createRadialGradient(
          posX - sph.radius * 0.35,
          posY - sph.radius * 0.35,
          sph.radius * 0.1,
          posX,
          posY,
          sph.radius
        );
        glassGrad.addColorStop(0, 'rgba(255, 248, 241, 0.28)');
        glassGrad.addColorStop(0.4, 'rgba(255, 225, 200, 0.08)');
        glassGrad.addColorStop(0.85, 'rgba(43, 27, 19, 0.30)');
        glassGrad.addColorStop(1, 'rgba(255, 180, 94, 0.35)');

        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.arc(posX, posY, sph.radius, 0, Math.PI * 2);
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = 'rgba(255, 170, 100, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Refraction arc inside
        ctx.beginPath();
        ctx.arc(posX - sph.radius * 0.2, posY - sph.radius * 0.2, sph.radius * 0.45, 0, Math.PI * 0.8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Floating 3D Chrome Cubes (Isometric Render with Chrome Silver & Amber Glow)
      cubes.forEach((cube) => {
        cube.x += cube.vx;
        cube.y += cube.vy;
        cube.rotAngle += cube.rotSpeed;

        if (cube.x < -cube.size * 2) cube.x = width + cube.size * 2;
        if (cube.x > width + cube.size * 2) cube.x = -cube.size * 2;
        if (cube.y < -cube.size * 2) cube.y = height + cube.size * 2;
        if (cube.y > height + cube.size * 2) cube.y = -cube.size * 2;

        const posX = cube.x + parallaxX * 0.7;
        const posY = cube.y + Math.sin(time * 1.5 + cube.floatOffset) * 8 + parallaxY * 0.7;
        const s = cube.size;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(cube.rotAngle);

        // Top Face (Bright Chrome Silver / White Reflection)
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.7);
        ctx.lineTo(s * 0.85, -s * 0.25);
        ctx.lineTo(0, s * 0.2);
        ctx.lineTo(-s * 0.85, -s * 0.25);
        ctx.closePath();
        const topGrad = ctx.createLinearGradient(-s, -s, s, s);
        topGrad.addColorStop(0, '#FFFFFF');
        topGrad.addColorStop(0.5, '#CDD2D8');
        topGrad.addColorStop(1, '#9DA5AE');
        ctx.fillStyle = topGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right Face (Metallic Mid-tone Chrome with warm tint)
        ctx.beginPath();
        ctx.moveTo(0, s * 0.2);
        ctx.lineTo(s * 0.85, -s * 0.25);
        ctx.lineTo(s * 0.85, s * 0.65);
        ctx.lineTo(0, s * 1.1);
        ctx.closePath();
        const rightGrad = ctx.createLinearGradient(0, 0, s, s);
        rightGrad.addColorStop(0, '#A3ABB3');
        rightGrad.addColorStop(0.6, '#5C524A');
        rightGrad.addColorStop(1, '#2B1B13');
        ctx.fillStyle = rightGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 170, 100, 0.28)';
        ctx.stroke();

        // Left Face (Electric Orange Reflected Metallic Shadow)
        ctx.beginPath();
        ctx.moveTo(0, s * 0.2);
        ctx.lineTo(-s * 0.85, -s * 0.25);
        ctx.lineTo(-s * 0.85, s * 0.65);
        ctx.lineTo(0, s * 1.1);
        ctx.closePath();
        const leftGrad = ctx.createLinearGradient(0, 0, -s, s);
        leftGrad.addColorStop(0, '#CDD2D8');
        leftGrad.addColorStop(0.5, '#FF873D');
        leftGrad.addColorStop(1, '#2B1B13');
        ctx.fillStyle = leftGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 180, 94, 0.38)';
        ctx.stroke();

        ctx.restore();
      });

      // Network Nodes & Glowing Connections (Amber and Electric Orange)
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = Math.sin(time * 2 + p.phase);
        const currentAlpha = p.baseAlpha + pulse * 0.2;
        const px = p.x + parallaxX * 0.4;
        const py = p.y + parallaxY * 0.4;

        // Proximity connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2x = p2.x + parallaxX * 0.4;
          const p2y = p2.y + parallaxY * 0.4;
          const dist = Math.hypot(px - p2x, py - p2y);

          const maxDist = width < 768 ? 95 : 135;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2x, p2y);
            ctx.strokeStyle = `rgba(255, 180, 94, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Draw glowing amber node
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 94, ${Math.max(0.1, currentAlpha)})`;
        ctx.shadowColor = '#FF873D';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-20 w-full h-full"
      aria-hidden="true"
    />
  );
};
