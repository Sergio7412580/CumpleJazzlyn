const EVENT_CONFIG = {
  displayDate: "Miércoles, 15 de julio de 2026",
  targetDate: "2026-07-15T15:00:00-04:00",
  googleMapsUrl: "https://maps.app.goo.gl/2VtRpNWFYnUx69CPA"
};

const SELECTORS = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  audio: document.getElementById("partyAudio"),
  audioFab: document.getElementById("audioFab"),
  playMusic: document.getElementById("playMusic"),
  pauseMusic: document.getElementById("pauseMusic"),
  volumeMusic: document.getElementById("volumeMusic")
};

function setEditableEventData() {
  document.querySelectorAll(".event-date-text").forEach((node) => {
    node.textContent = EVENT_CONFIG.displayDate;
  });

  const mapButton = document.getElementById("mapButton");
  if (mapButton) {
    mapButton.href = EVENT_CONFIG.googleMapsUrl;
  }
}

function startOpeningShow() {
  const curtains = document.getElementById("curtains");
  setTimeout(() => {
    curtains.classList.add("is-open");
    launchConfetti(90);
    burstFireworks(4);
  }, 450);

  setTimeout(() => {
    curtains.style.display = "none";
  }, 2500);

  if (window.gsap) {
    gsap.from(".hero h1", { y: 70, scale: 0.94, opacity: 0, duration: 1.15, delay: 1.35, ease: "back.out(1.7)" });
    gsap.from(".hero-copy, .hero-actions, .vip-badge", { y: 30, opacity: 0, duration: 0.75, delay: 1.75, stagger: 0.12, ease: "power3.out" });
    gsap.to(".stage-card", { y: -12, rotation: 0.4, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".party-icon", { rotation: 8, scale: 1.08, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".energy-card", { y: -8, duration: 1.4, repeat: -1, yoyo: true, stagger: 0.12, ease: "sine.inOut" });
    gsap.utils.toArray(".section").forEach((section) => {
      gsap.to(section, {
        yPercent: -2,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }
}

function initAos() {
  if (window.AOS) {
    AOS.init({ duration: 850, easing: "ease-out-cubic", once: false, mirror: false, offset: 80 });
  }
}

function updateCountdown() {
  const target = new Date(EVENT_CONFIG.targetDate).getTime();

  const render = () => {
    const now = Date.now();
    const distance = target - now;

    if (distance <= 0) {
      document.getElementById("countdown").innerHTML = '<div class="col-span-4"><strong>¡Hoy!</strong><span>Comenzó la fiesta</span></div>';
      burstFireworks(8);
      return;
    }

    const values = {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000)
    };

    Object.entries(values).forEach(([key, value]) => {
      const node = SELECTORS[key];
      if (!node) return;
      const text = String(value).padStart(2, "0");
      if (node.textContent !== text) {
        node.textContent = text;
        node.classList.remove("digit-pop");
        void node.offsetWidth;
        node.classList.add("digit-pop");
      }
    });
  };

  render();
  setInterval(render, 1000);
}

function setupMusic() {
  const audio = SELECTORS.audio;
  if (!audio) return;

  const setPlaying = (isPlaying) => {
    SELECTORS.audioFab.classList.toggle("is-playing", isPlaying);
    SELECTORS.audioFab.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  };

  const play = async () => {
    try {
      await audio.play();
      setPlaying(true);
    } catch (error) {
      startSoftSynth();
      setPlaying(true);
    }
  };

  const pause = () => {
    audio.pause();
    stopSoftSynth();
    setPlaying(false);
  };

  SELECTORS.audioFab.addEventListener("click", () => (audio.paused ? play() : pause()));
  SELECTORS.playMusic.addEventListener("click", play);
  SELECTORS.pauseMusic.addEventListener("click", pause);
  SELECTORS.volumeMusic.addEventListener("input", (event) => {
    audio.volume = Number(event.target.value);
    synthVolume = Number(event.target.value) * 0.12;
  });
  audio.volume = Number(SELECTORS.volumeMusic.value);
}

let synthContext;
let synthTimer;
let synthVolume = 0.06;
let synthStep = 0;

function startSoftSynth() {
  if (synthTimer) return;
  synthContext = synthContext || new (window.AudioContext || window.webkitAudioContext)();
  synthContext.resume();
  const notes = [261.63, 329.63, 392, 493.88, 523.25, 659.25, 783.99, 659.25];

  synthTimer = setInterval(() => {
    const osc = synthContext.createOscillator();
    const gain = synthContext.createGain();
    osc.type = synthStep % 4 === 0 ? "triangle" : "sine";
    osc.frequency.value = notes[synthStep % notes.length];
    gain.gain.setValueAtTime(0.0001, synthContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(synthVolume, synthContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, synthContext.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(synthContext.destination);
    osc.start();
    osc.stop(synthContext.currentTime + 0.25);
    synthStep += 1;
  }, 260);
}

function stopSoftSynth() {
  clearInterval(synthTimer);
  synthTimer = null;
}

function setupGallery() {
  document.querySelectorAll(".energy-card").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("is-active");
      launchConfetti(30);
      burstFireworks(3);
      if (window.gsap) {
        gsap.fromTo(button, { scale: 0.96, rotate: -2 }, { scale: 1.05, rotate: 1.5, duration: 0.28, yoyo: true, repeat: 1, ease: "power2.out" });
      }
    });
  });
}

function setupRsvp() {
  const form = document.getElementById("rsvpForm");
  const success = document.getElementById("successMessage");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    success.classList.add("show");
    launchConfetti(80);
    burstFireworks(5);
    if (window.gsap) {
      gsap.fromTo(success, { scale: 0.92, y: 18 }, { scale: 1, y: 0, duration: 0.5, ease: "back.out(1.8)" });
    }
  });
}

class MagicCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.items = [];
    this.pointer = { x: -999, y: -999 };
    this.types = ["heart", "star", "bubble", "butterfly", "glitter", "confetti"];
    this.colors = ["#ff3e96", "#8a4fff", "#15e7ff", "#ffe066", "#45ffca", "#ffffff"];
    this.resize();
    this.seed();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
    });
    this.animate();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  seed() {
    const amount = Math.min(230, Math.floor((this.width * this.height) / 5200));
    this.items = Array.from({ length: amount }, () => this.createItem(true));
  }

  createItem(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 40,
      size: 3 + Math.random() * 13,
      vx: -0.35 + Math.random() * 0.7,
      vy: 0.25 + Math.random() * 0.9,
      type: this.types[Math.floor(Math.random() * this.types.length)],
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: 0.18 + Math.random() * 0.65,
      spin: Math.random() * Math.PI,
      spinSpeed: -0.025 + Math.random() * 0.05,
      pulse: Math.random() * 10
    };
  }

  drawHeart(x, y, size) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.2);
    ctx.bezierCurveTo(x - size, y - size, x - size * 1.25, y + size * 0.35, x, y + size);
    ctx.bezierCurveTo(x + size * 1.25, y + size * 0.35, x + size, y - size, x, y - size * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  drawStar(x, y, size) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 ? size * 0.45 : size;
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      ctx[i ? "lineTo" : "moveTo"](x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawButterfly(x, y, size, pulse) {
    const ctx = this.ctx;
    const flap = 0.45 + Math.abs(Math.sin(pulse)) * 0.55;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.35, y, size * 0.42 * flap, size * 0.72, -0.4, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.35, y, size * 0.42 * flap, size * 0.72, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(x - 1, y - size * 0.7, 2, size * 1.25);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const item of this.items) {
      item.y -= item.vy;
      item.x += item.vx + Math.sin(item.pulse) * 0.12;
      item.spin += item.spinSpeed;
      item.pulse += 0.025;

      const dx = item.x - this.pointer.x;
      const dy = item.y - this.pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 110 && distance > 0) {
        const force = (110 - distance) / 110;
        item.x += (dx / distance) * force * 2.5;
        item.y += (dy / distance) * force * 2.5;
      }

      if (item.y < -60 || item.x < -70 || item.x > this.width + 70) {
        Object.assign(item, this.createItem(false));
      }

      this.ctx.save();
      this.ctx.translate(item.x, item.y);
      this.ctx.rotate(item.spin);
      this.ctx.globalAlpha = item.alpha;
      this.ctx.fillStyle = item.color;
      this.ctx.strokeStyle = item.color;
      this.ctx.shadowColor = item.color;
      this.ctx.shadowBlur = item.type === "glitter" || item.type === "star" ? 14 : 4;

      if (item.type === "heart") this.drawHeart(0, 0, item.size);
      if (item.type === "star") this.drawStar(0, 0, item.size);
      if (item.type === "bubble") {
        this.ctx.globalAlpha = item.alpha * 0.7;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, item.size, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      if (item.type === "butterfly") this.drawButterfly(0, 0, item.size, item.pulse);
      if (item.type === "glitter") this.ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size);
      if (item.type === "confetti") this.ctx.fillRect(-item.size, -item.size * 0.28, item.size * 2, item.size * 0.56);

      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

class FireworkCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.animate();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  burst(x = Math.random() * this.width, y = Math.random() * this.height * 0.45 + 60) {
    const colors = ["#ff3e96", "#8a4fff", "#15e7ff", "#ffe066", "#ffffff"];
    for (let i = 0; i < 72; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 5.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.022,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.particles.forEach((particle) => {
      particle.vy += 0.045;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      this.ctx.globalAlpha = Math.max(particle.life, 0);
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 2.2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
    this.particles = this.particles.filter((particle) => particle.life > 0);
    requestAnimationFrame(() => this.animate());
  }
}

let fireworkSystem;

function burstFireworks(amount = 1) {
  if (!fireworkSystem) return;
  for (let i = 0; i < amount; i += 1) {
    setTimeout(() => fireworkSystem.burst(), i * 140);
  }
}

function launchConfetti(amount = 40) {
  const colors = ["#ff3e96", "#8a4fff", "#15e7ff", "#ffe066", "#45ffca"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.style.position = "fixed";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = "-16px";
    piece.style.zIndex = "80";
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${10 + Math.random() * 12}px`;
    piece.style.borderRadius = "3px";
    piece.style.pointerEvents = "none";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.boxShadow = "0 0 14px currentColor";
    document.body.appendChild(piece);

    const duration = 2.4 + Math.random() * 2.4;
    if (window.gsap) {
      gsap.to(piece, {
        y: window.innerHeight + 80,
        x: -80 + Math.random() * 160,
        rotation: 360 + Math.random() * 720,
        duration,
        ease: "power1.out",
        onComplete: () => piece.remove()
      });
    } else {
      piece.remove();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setEditableEventData();
  initAos();
  new MagicCanvas("magicCanvas");
  fireworkSystem = new FireworkCanvas("fireworkCanvas");
  updateCountdown();
  setupMusic();
  setupGallery();
  setupRsvp();
  startOpeningShow();

  setInterval(() => {
    if (document.visibilityState === "visible") burstFireworks(1);
  }, 3200);
});
