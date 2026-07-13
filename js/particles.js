class InteractiveParticles {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.stars = [];
    this.bubbles = [];
    this.hearts = [];
    this.butterflies = [];
    this.glitter = [];
    this.mouse = { x: null, y: null, radius: 110 };
    
    this.colors = {
      pink: 'rgba(255, 79, 162, ',
      purple: 'rgba(138, 43, 226, ',
      lila: 'rgba(199, 125, 255, ',
      blue: 'rgba(0, 229, 255, ',
      gold: 'rgba(255, 232, 117, '
    };
    
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseleave', () => this.handleMouseLeave());
  }
  
  init() {
    this.resize();
    
    // Create background stars
    const starCount = Math.min(Math.floor((this.width * this.height) / 7500), 160);
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 0.5 + Math.random() * 1.5,
        alpha: Math.random(),
        speed: 0.008 + Math.random() * 0.015,
        isGold: Math.random() > 0.8
      });
    }
    
    // Create floating bubbles
    const bubbleCount = Math.min(Math.floor((this.width * this.height) / 18000), 60);
    for (let i = 0; i < bubbleCount; i++) {
      this.bubbles.push(this.createBubble(true));
    }
    
    // Create floating hearts
    const heartCount = Math.min(Math.floor((this.width * this.height) / 25000), 30);
    for (let i = 0; i < heartCount; i++) {
      this.hearts.push(this.createHeart(true));
    }

    // Create magical butterflies
    const butterflyCount = 10;
    for (let i = 0; i < butterflyCount; i++) {
      this.butterflies.push(this.createButterfly(true));
    }

    // Create glitter sparkles
    const glitterCount = 65;
    for (let i = 0; i < glitterCount; i++) {
      this.glitter.push(this.createGlitter(true));
    }
  }
  
  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }
  
  createBubble(randomY = false) {
    const bubbleColors = [this.colors.pink, this.colors.lila, this.colors.blue];
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 50,
      radius: 4 + Math.random() * 12,
      speedY: 0.25 + Math.random() * 0.7,
      speedX: -0.15 + Math.random() * 0.3,
      alpha: 0.15 + Math.random() * 0.4,
      color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
      wobble: Math.random() * 100,
      wobbleSpeed: 0.01 + Math.random() * 0.02
    };
  }
  
  createHeart(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 60,
      size: 6 + Math.random() * 10,
      speedY: 0.3 + Math.random() * 0.8,
      speedX: -0.2 + Math.random() * 0.4,
      alpha: 0.2 + Math.random() * 0.4,
      color: this.colors.pink,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.01 + Math.random() * 0.02
    };
  }

  createButterfly(randomY = false) {
    const butterflyColors = [this.colors.pink, this.colors.blue, this.colors.lila];
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 60,
      size: 11 + Math.random() * 9,
      speedY: 0.35 + Math.random() * 0.65,
      speedX: -0.3 + Math.random() * 0.6,
      color: butterflyColors[Math.floor(Math.random() * butterflyColors.length)],
      alpha: 0.35 + Math.random() * 0.45,
      flapSpeed: 0.07 + Math.random() * 0.08,
      flapTime: Math.random() * 100,
      tilt: -0.1 + Math.random() * 0.2
    };
  }

  createGlitter(randomY = false) {
    const glitterColors = [this.colors.gold, this.colors.gold, 'rgba(255, 255, 255, ', this.colors.pink];
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : Math.random() * this.height,
      size: 0.8 + Math.random() * 1.8,
      speedY: 0.12 + Math.random() * 0.22,
      speedX: -0.08 + Math.random() * 0.16,
      alpha: Math.random(),
      twinkleSpeed: 0.02 + Math.random() * 0.04,
      color: glitterColors[Math.floor(Math.random() * glitterColors.length)]
    };
  }
  
  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
  
  handleMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }
  
  drawHeartShape(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 4);
    // Left curve
    ctx.bezierCurveTo(x - size / 2, y - size / 1.2, x - size, y - size / 3, x, y + size / 1.3);
    // Right curve
    ctx.bezierCurveTo(x + size, y - size / 3, x + size / 2, y - size / 1.2, x, y - size / 4);
    ctx.closePath();
  }

  drawButterflyShape(ctx, x, y, size, wingAngle) {
    ctx.save();
    ctx.translate(x, y);
    
    // Antennas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-1, -size * 0.5);
    ctx.quadraticCurveTo(-4, -size * 0.9, -6, -size * 0.85);
    ctx.moveTo(1, -size * 0.5);
    ctx.quadraticCurveTo(4, -size * 0.9, 6, -size * 0.85);
    ctx.stroke();

    // Wings
    // Left Wing
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.1);
    ctx.bezierCurveTo(-size * 0.95 * wingAngle, -size * 0.8, -size * 1.3 * wingAngle, -size * 0.15, -size * 0.1, size * 0.1);
    ctx.bezierCurveTo(-size * 0.85 * wingAngle, size * 0.45, -size * 0.5 * wingAngle, size * 0.75, 0, size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.1);
    ctx.bezierCurveTo(size * 0.95 * wingAngle, -size * 0.8, size * 1.3 * wingAngle, -size * 0.15, size * 0.1, size * 0.1);
    ctx.bezierCurveTo(size * 0.85 * wingAngle, size * 0.45, size * 0.5 * wingAngle, size * 0.75, 0, size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.14, size * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw & update stars
    this.stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 0.95 || star.alpha < 0.1) {
        star.speed = -star.speed;
      }
      const alpha = Math.max(0.1, Math.min(0.95, star.alpha));
      this.ctx.fillStyle = star.isGold ? `rgba(255, 232, 117, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw & update glitter
    this.glitter.forEach(g => {
      g.y += g.speedY;
      g.x += g.speedX;
      
      // Twinkle alpha
      g.alpha += g.twinkleSpeed;
      if (g.alpha > 1 || g.alpha < 0.1) {
        g.twinkleSpeed = -g.twinkleSpeed;
      }
      
      const alpha = Math.max(0.1, Math.min(1.0, g.alpha));
      this.ctx.fillStyle = g.color + alpha + ')';
      
      this.ctx.beginPath();
      this.ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Reset when off screen
      if (g.y > this.height) {
        Object.assign(g, this.createGlitter(false));
        g.y = 0; // Spawn at top
      }
    });
    
    // Draw & update bubbles
    this.bubbles.forEach(b => {
      b.y -= b.speedY;
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * 0.18 + b.speedX;
      
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = b.x - this.mouse.x;
        const dy = b.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          b.x += (dx / dist) * force * 3.5;
          b.y += (dy / dist) * force * 3.5;
        }
      }
      
      this.ctx.strokeStyle = b.color + b.alpha + ')';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Highlight glow on bubbles
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + (b.alpha * 0.25) + ')';
      this.ctx.beginPath();
      this.ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.22, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (b.y < -50 || b.x < -50 || b.x > this.width + 50) {
        Object.assign(b, this.createBubble(false));
      }
    });
    
    // Draw & update hearts
    this.hearts.forEach(h => {
      h.y -= h.speedY;
      h.x += h.speedX;
      h.rotation += h.rotationSpeed;
      
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = h.x - this.mouse.x;
        const dy = h.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          h.x += (dx / dist) * force * 2.5;
          h.y += (dy / dist) * force * 2.5;
        }
      }
      
      this.ctx.save();
      this.ctx.translate(h.x, h.y);
      this.ctx.rotate(h.rotation);
      
      this.ctx.fillStyle = h.color + h.alpha + ')';
      this.drawHeartShape(this.ctx, 0, 0, h.size);
      this.ctx.fill();
      
      this.ctx.restore();
      
      if (h.y < -60 || h.x < -50 || h.x > this.width + 50) {
        Object.assign(h, this.createHeart(false));
      }
    });

    // Draw & update butterflies
    this.butterflies.forEach(bf => {
      bf.y -= bf.speedY;
      bf.x += bf.speedX + Math.sin(bf.flapTime) * 0.2;
      bf.flapTime += bf.flapSpeed;
      
      // Flapping wing angle ranges between 0.15 and 1.0
      const wingAngle = 0.25 + Math.abs(Math.cos(bf.flapTime)) * 0.75;
      
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = bf.x - this.mouse.x;
        const dy = bf.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          bf.x += (dx / dist) * force * 2.8;
          bf.y += (dy / dist) * force * 2.8;
        }
      }
      
      this.ctx.fillStyle = bf.color + bf.alpha + ')';
      this.drawButterflyShape(this.ctx, bf.x, bf.y, bf.size, wingAngle);
      
      if (bf.y < -60 || bf.x < -60 || bf.x > this.width + 60) {
        Object.assign(bf, this.createButterfly(false));
      }
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new InteractiveParticles();
});
