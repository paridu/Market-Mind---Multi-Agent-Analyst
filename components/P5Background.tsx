
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface Props {
  isLoading: boolean;
}

export const P5Background: React.FC<Props> = ({ isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let particles: Particle[] = [];
      const particleCount = 60;
      
      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        size: number;
        color: p5.Color;

        constructor() {
          this.pos = p.createVector(p.random(p.width), p.random(p.height));
          this.vel = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
          this.size = p.random(1, 3);
          this.color = p.color(p.random(100, 200), p.random(200, 255), p.random(255), 150);
        }

        update(speedMult: number) {
          this.pos.add(p5.Vector.mult(this.vel, speedMult));
          
          if (this.pos.x > p.width) this.pos.x = 0;
          if (this.pos.x < 0) this.pos.x = p.width;
          if (this.pos.y > p.height) this.pos.y = 0;
          if (this.pos.y < 0) this.pos.y = p.height;
          
          // Mouse interaction
          let mouse = p.createVector(p.mouseX, p.mouseY);
          let dist = p5.Vector.dist(this.pos, mouse);
          if (dist < 150) {
            let force = p5.Vector.sub(mouse, this.pos);
            force.setMag(0.1);
            this.pos.add(force);
          }
        }

        draw() {
          p.noStroke();
          p.fill(this.color);
          p.circle(this.pos.x, this.pos.y, this.size);
        }
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight).parent(containerRef.current!);
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
      };

      p.draw = () => {
        p.clear();
        const speedMult = isLoading ? 5 : 1;
        const lineColor = isLoading ? p.color(245, 158, 11, 40) : p.color(6, 182, 212, 20);
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update(speedMult);
          particles[i].draw();
          
          // Draw connections
          for (let j = i + 1; j < particles.length; j++) {
            let d = p5.Vector.dist(particles[i].pos, particles[j].pos);
            if (d < 120) {
              p.stroke(lineColor);
              p.strokeWeight(p.map(d, 0, 120, 1, 0));
              p.line(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
            }
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch);
    return () => p5Instance.remove();
  }, [isLoading]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
};
