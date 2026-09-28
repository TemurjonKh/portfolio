"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; depth: number; radius: number; alpha: number; phase: number; speed: number; tint: string };
type Nebula = { x: number; y: number; radius: number; phase: number; speed: number; driftX: number; driftY: number; color: [number, number, number] };

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 720px)");
    const random = seededRandom(1843);
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let nebulas: Nebula[] = [];
    let frame = 0;
    let lastFrame = 0;
    let scrollY = window.scrollY;

    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 96;
    noiseCanvas.height = 96;
    const noiseContext = noiseCanvas.getContext("2d");
    if (noiseContext) {
      const noise = noiseContext.createImageData(96, 96);
      for (let index = 0; index < noise.data.length; index += 4) {
        const value = Math.floor(random() * 255);
        noise.data[index] = value;
        noise.data[index + 1] = value;
        noise.data[index + 2] = value;
        noise.data[index + 3] = Math.floor(random() * 34);
      }
      noiseContext.putImageData(noise, 0, 0);
    }

    const buildScene = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.25 : 1.6);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const starCount = mobile.matches ? 135 : 290;
      const tints = ["214, 239, 255", "114, 226, 255", "213, 197, 255", "255, 226, 184"];
      stars = Array.from({ length: starCount }, () => ({
        x: random(),
        y: random(),
        depth: 0.25 + random() * 0.95,
        radius: 0.35 + Math.pow(random(), 2.7) * 1.7,
        alpha: 0.18 + random() * 0.7,
        phase: random() * Math.PI * 2,
        speed: 0.35 + random() * 1.15,
        tint: tints[Math.floor(random() * tints.length)],
      }));

      const palette: Array<[number, number, number]> = [
        [72, 86, 196], [96, 72, 180], [44, 92, 170],
        [200, 140, 60], [58, 70, 150], [40, 110, 170],
      ];
      nebulas = palette.slice(0, mobile.matches ? 4 : 6).map((color, index) => ({
        x: [0.72, 0.19, 0.47, 0.86, 0.32, 0.62][index],
        y: [0.15, 0.32, 0.64, 0.78, 0.88, 0.43][index],
        radius: Math.max(width, height) * (0.25 + random() * 0.17),
        phase: random() * Math.PI * 2,
        speed: 0.000017 + random() * 0.000018,
        driftX: 18 + random() * 38,
        driftY: 12 + random() * 32,
        color,
      }));
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const heroPresence = Math.max(0.42, 1 - scrollY / Math.max(height * 1.9, 1) * 0.58);

      context.save();
      context.globalCompositeOperation = "lighter";
      nebulas.forEach((nebula, index) => {
        const motionTime = reduceMotion.matches ? 0 : time;
        const pulse = 0.94 + Math.sin(motionTime * nebula.speed + nebula.phase) * 0.07;
        const x = nebula.x * width + Math.sin(motionTime * nebula.speed * 0.72 + nebula.phase) * nebula.driftX;
        const y = nebula.y * height + Math.cos(motionTime * nebula.speed * 0.9 + nebula.phase) * nebula.driftY;
        const radius = nebula.radius * pulse;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        const [red, green, blue] = nebula.color;
        const strength = (index < 3 ? 0.075 : 0.04) * heroPresence;
        gradient.addColorStop(0, "rgba(" + red + "," + green + "," + blue + "," + strength + ")");
        gradient.addColorStop(0.38, "rgba(" + red + "," + green + "," + blue + "," + strength * 0.48 + ")");
        gradient.addColorStop(1, "rgba(" + red + "," + green + "," + blue + ",0)");
        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      });
      context.restore();

      context.save();
      stars.forEach(star => {
        const offset = reduceMotion.matches ? 0 : scrollY * (0.012 + star.depth * 0.027);
        const y = ((star.y * height - offset) % height + height) % height;
        const twinkle = reduceMotion.matches ? 0.82 : 0.66 + Math.sin(time * 0.001 * star.speed + star.phase) * 0.34;
        const alpha = Math.max(0.05, star.alpha * twinkle * (0.72 + heroPresence * 0.28));
        context.beginPath();
        context.arc(star.x * width, y, star.radius * (0.72 + star.depth * 0.48), 0, Math.PI * 2);
        context.fillStyle = "rgba(" + star.tint + "," + alpha + ")";
        context.fill();
      });
      context.restore();

      if (noiseContext) {
        const pattern = context.createPattern(noiseCanvas, "repeat");
        if (pattern) {
          context.save();
          context.globalAlpha = 0.045;
          context.translate(reduceMotion.matches ? 0 : Math.floor(time / 780) % 96, reduceMotion.matches ? 0 : Math.floor(time / 1130) % 96);
          context.fillStyle = pattern;
          context.fillRect(-96, -96, width + 192, height + 192);
          context.restore();
        }
      }
    };

    const animate = (time: number) => {
      if (time - lastFrame > 32) {
        draw(time);
        lastFrame = time;
      }
      frame = window.requestAnimationFrame(animate);
    };
    const start = () => {
      window.cancelAnimationFrame(frame);
      if (reduceMotion.matches || document.hidden) draw(0);
      else frame = window.requestAnimationFrame(animate);
    };
    const handleScroll = () => { scrollY = window.scrollY; };
    const handleResize = () => { buildScene(); start(); };
    const handleVisibility = () => start();

    buildScene();
    start();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    reduceMotion.addEventListener("change", start);
    mobile.addEventListener("change", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reduceMotion.removeEventListener("change", start);
      mobile.removeEventListener("change", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmic-background" aria-hidden="true" />;
}
