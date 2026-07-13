class MusicPlayer {
  constructor() {
    this.musicBtn = document.getElementById('music-toggle');
    this.waveBars = document.getElementById('sound-wave');
    this.volumeSlider = document.getElementById('music-volume');

    if (!this.musicBtn) return;

    this.isPlaying = false;
    this.audioContext = null;
    this.synthEngine = null;
    this.bgAudio = new Audio();
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.45;

    // Support multiple fallback audio paths
    this.audioPaths = [
      'assets/audio/listas_para_brillar.mp3',
      'assets/music/listas_para_brillar.mp3',
      'assets/audio/Listas_para_Brillar.mp3',
      'assets/music/Listas_para_Brillar.mp3'
    ];
    this.currentPathIndex = 0;
    this.bgAudio.src = this.audioPaths[this.currentPathIndex];

    this.init();
  }

  init() {
    this.musicBtn.addEventListener('click', () => this.togglePlay());

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        this.bgAudio.volume = vol;
        if (this.synthEngine) {
          this.synthEngine.setVolume(vol * 0.18); // Scale synth volume slightly
        }
      });
    }
  }

  togglePlay() {
    if (!this.isPlaying) {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    this.bgAudio.play()
      .then(() => {
        this.setPlayState(true);
      })
      .catch(err => {
        // If loading current path fails, try the next one in sequence
        if (this.currentPathIndex < this.audioPaths.length - 1) {
          this.currentPathIndex++;
          this.bgAudio.src = this.audioPaths[this.currentPathIndex];
          console.log(`Intentando cargar ruta de audio alternativa: ${this.bgAudio.src}`);
          this.play();
        } else {
          console.warn("No se pudo cargar ningún archivo MP3 o fue bloqueado. Iniciando Sintetizador de K-Pop dinámico.");
          this.playSynth();
        }
      });
  }

  playSynth() {
    if (!this.synthEngine) {
      this.synthEngine = new BubblyKPopSynth();
    }
    const vol = this.volumeSlider ? parseFloat(this.volumeSlider.value) : 0.45;
    this.synthEngine.setVolume(vol * 0.18);
    this.synthEngine.start();
    this.setPlayState(true);
  }

  pause() {
    this.bgAudio.pause();
    if (this.synthEngine) {
      this.synthEngine.stop();
    }
    this.setPlayState(false);
  }

  setPlayState(playing) {
    this.isPlaying = playing;
    if (playing) {
      this.musicBtn.classList.add('playing');
      this.musicBtn.querySelector('.play-icon').classList.add('hidden');
      this.musicBtn.querySelector('.pause-icon').classList.remove('hidden');
      if (this.waveBars) this.waveBars.classList.add('playing');
    } else {
      this.musicBtn.classList.remove('playing');
      this.musicBtn.querySelector('.play-icon').classList.remove('hidden');
      this.musicBtn.querySelector('.pause-icon').classList.add('hidden');
      if (this.waveBars) this.waveBars.classList.remove('playing');
    }
  }
}

// Bubbly Chiptune K-Pop Synth using Web Audio API
class BubblyKPopSynth {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.isPlaying = false;
    this.tempo = 120; // BPM
    this.beatCount = 0;
    this.vol = 0.08;
  }

  setVolume(vol) {
    this.vol = vol;
  }

  start() {
    if (this.isPlaying) return;
    this.ctx.resume();
    this.isPlaying = true;
    this.scheduleLoop();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) clearTimeout(this.timerId);
  }

  scheduleLoop() {
    if (!this.isPlaying) return;

    const secondsPerBeat = 60.0 / this.tempo;
    const stepTime = secondsPerBeat / 2; // Eighth notes

    this.playStep(this.ctx.currentTime);

    this.timerId = setTimeout(() => {
      this.beatCount++;
      this.scheduleLoop();
    }, stepTime * 1000);
  }

  playStep(time) {
    // 1. Kick Drum (Bubbly Bass Sweep)
    if (this.beatCount % 2 === 0) {
      this.playKick(time);
    }

    // 2. Sweet Pop Snare (Clap noise)
    if (this.beatCount % 4 === 2) {
      this.playPopSnare(time);
    }

    // 3. Cute chord backing
    // Progression: Cmaj7 -> Am7 -> Fmaj7 -> G (8 beats each)
    const chordIndex = Math.floor((this.beatCount / 8) % 4);
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 196.00], // Am7
      [87.31, 130.81, 174.61, 220.00],  // Fmaj7
      [98.00, 146.83, 196.00, 246.94]   // G
    ];

    if (this.beatCount % 4 === 0) {
      this.playChord(chords[chordIndex], time, 1.8);
    }

    // 4. Bubbly Arpeggiator (Pentatonic Major scale)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C Major Pentatonic
    let noteIndex = Math.floor(Math.sin(this.beatCount * 0.8) * 3) + 4; // mathematical arpeggio

    if (chordIndex === 1) noteIndex -= 1;
    if (chordIndex === 2) noteIndex += 1;

    const freq = scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];

    if (Math.random() > 0.15) {
      this.playArp(freq, time);
    }
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.28);

    gain.gain.setValueAtTime(this.vol * 4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.28);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  playPopSnare(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, time);
    osc.frequency.linearRampToValueAtTime(150, time + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(this.vol * 1.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  playChord(notes, time, duration) {
    notes.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // Warm retro sound
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.vol * 0.45, time + 0.25);
      gain.gain.setValueAtTime(this.vol * 0.45, time + duration - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.start(time);
      osc.stop(time + duration + 0.1);
    });
  }

  playArp(freq, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine'; // Pure tone
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(this.vol * 0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.start(time);
    osc.stop(time + 0.2);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MusicPlayer();
});
