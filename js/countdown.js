// CONFIGURACIÓN EDITABLE DEL EVENTO
const EVENT_CONFIG = {
  displayDate: "Sábado, 15 de Agosto de 2026", // Fecha textual a mostrar en la página
  displayTime: "15:00",                       // Hora textual a mostrar
  targetDateTime: "August 15, 2026 15:00:00"  // Destino para el conteo regresivo (Formato: Month DD, YYYY HH:MM:SS)
};

class CountdownTimer {
  constructor() {
    this.targetDate = new Date(EVENT_CONFIG.targetDateTime).getTime();
    
    this.daysEl = document.getElementById('days');
    this.hoursEl = document.getElementById('hours');
    this.minutesEl = document.getElementById('minutes');
    this.secondsEl = document.getElementById('seconds');
    
    this.init();
  }
  
  init() {
    // Inyectar datos editables en el DOM
    document.querySelectorAll('.event-date-text').forEach(el => el.textContent = EVENT_CONFIG.displayDate);
    document.querySelectorAll('.event-time-text').forEach(el => el.textContent = EVENT_CONFIG.displayTime);

    if (!this.daysEl) return;
    
    this.update();
    this.interval = setInterval(() => this.update(), 1000);
  }
  
  update() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;
    
    if (distance < 0) {
      document.getElementById('countdown-timer').innerHTML = `
        <div class="col-span-4 text-center py-4">
          <h3 class="text-3xl sm:text-4xl font-bold font-title text-kpink animate-pulse">¡EMPEZÓ LA GRAN FIESTA! 🎉</h3>
        </div>
      `;
      clearInterval(this.interval);
      // Spawn massive fireworks
      if (window.fireworksSystem) {
        window.fireworksSystem.setMassiveMode(true);
      }
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    this.updateDigit(this.daysEl, days);
    this.updateDigit(this.hoursEl, hours);
    this.updateDigit(this.minutesEl, minutes);
    this.updateDigit(this.secondsEl, seconds);
  }
  
  updateDigit(el, val) {
    const textVal = val.toString().padStart(2, '0');
    if (el.textContent !== textVal) {
      el.textContent = textVal;
      el.classList.add('digit-pulse');
      setTimeout(() => el.classList.remove('digit-pulse'), 400);
    }
  }
}

class FireworksSystem {
  constructor() {
    this.canvas = document.getElementById('fireworks-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.fireworks = [];
    this.massiveMode = false;
    this.colors = [
      '#FF4FA2', // Pink
      '#8A2BE2', // Purple
      '#C77DFF', // Lila
      '#00E5FF', // Blue
      '#FFD700'  // Gold
    ];
    
    this.resize();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    
    // Automatically launch fireworks
    this.launchInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const launches = this.massiveMode ? 5 : 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < launches; i++) {
          this.fireworks.push(this.createFirework());
        }
      }
    }, 1500);
    
    window.fireworksSystem = this;
  }
  
  resize() {
    // Canvas sizing matches container
    const parent = this.canvas.parentElement;
    this.width = this.canvas.width = parent.clientWidth;
    this.height = this.canvas.height = parent.clientHeight;
  }
  
  setMassiveMode(active) {
    this.massiveMode = active;
  }
  
  createFirework() {
    const x = 50 + Math.random() * (this.width - 100);
    const targetY = 50 + Math.random() * (this.height * 0.5);
    const startY = this.height + 10;
    
    return {
      x: x,
      y: startY,
      targetY: targetY,
      speed: 4 + Math.random() * 4,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      completed: false
    };
  }
  
  explode(x, y, color) {
    const particleCount = 40 + Math.floor(Math.random() * 30);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4.5;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: color,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
        gravity: 0.08
      });
    }
  }
  
  animate() {
    // Semi-transparent redraw gives beautiful trails
    this.ctx.fillStyle = 'rgba(10, 2, 22, 0.2)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Update and draw rockets
    this.fireworks.forEach((fw, i) => {
      fw.y -= fw.speed;
      
      // Draw rocket sparkle
      this.ctx.fillStyle = fw.color;
      this.ctx.beginPath();
      this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Launch trailing sparks
      if (Math.random() > 0.4) {
        this.particles.push({
          x: fw.x,
          y: fw.y,
          vx: (Math.random() - 0.5) * 1,
          vy: Math.random() * 1,
          color: '#FFE875',
          alpha: 0.8,
          decay: 0.05,
          gravity: 0.02
        });
      }
      
      if (fw.y <= fw.targetY) {
        fw.completed = true;
        this.explode(fw.x, fw.y, fw.color);
      }
    });
    
    this.fireworks = this.fireworks.filter(fw => !fw.completed);
    
    // Update and draw explosion particles
    this.particles.forEach((p, i) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      if (p.alpha > 0) {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    this.ctx.globalAlpha = 1.0;
    this.particles = this.particles.filter(p => p.alpha > 0);
    
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CountdownTimer();
  new FireworksSystem();
});
