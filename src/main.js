// ========== CHARACTER DATA ========== 

document.addEventListener('DOMContentLoaded', () => {
  let fighters = [];

  fetch('http://localhost:8000/api/characters')
    .then(res => res.json())
    .then(data => {
      fighters = data;
      renderCharacterCards();
    });

  function renderCharacterCards() {
    const container = document.getElementById('characterSelection');
    container.innerHTML = '';
    fighters.forEach((fighter, idx) => {
      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.fighter = idx;
      card.innerHTML = `
        <div class="character-portrait">
          <img src="${fighter.image}" alt="${fighter.name}">
        </div>
        <div class="character-name">${fighter.name}</div>
      `;
      card.addEventListener('click', () => {
        showCharacterDetails(idx);
      });
      container.appendChild(card);
    });
  }

  function showCharacterDetails(fighterId) {
    const fighter = fighters[fighterId];
    console.log(fighter); // see the object in console
    if (!fighter) return;
    document.getElementById('modalName').textContent = fighter.name || '';
    document.getElementById('modalTagline').textContent = fighter.tagline || '';
    document.getElementById('modalCountry').textContent = fighter.country || '';
    document.getElementById('modalStyle').textContent = fighter.fighting_style || '';
    document.getElementById('modalDescription').textContent = fighter.description || '';
    document.getElementById('modalImage').src = fighter.image ? fighter.image : 'default.jpg';
    document.getElementById('modalImage').alt = fighter.name;
    const modal = document.getElementById('characterModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300); // match CSS transition
  }

  document.getElementById('closeModal').addEventListener('click', hideModal);
  document.getElementById('backBtn').addEventListener('click', hideModal);
});

// ========== PARTICLE EFFECTS ==========

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.animate();
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.3';

    document.body.appendChild(canvas);

    this.resizeCanvas(canvas);
    window.addEventListener('resize', () => this.resizeCanvas(canvas));

    return canvas;
  }

  resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      decay: Math.random() * 0.02 + 0.005
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Add new particles
    if (Math.random() < 0.3) {
      this.particles.push(this.createParticle());
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity -= particle.decay;

      if (particle.opacity <= 0 || particle.y < -10) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ========== SOUND EFFECTS (OPTIONAL) ==========

class SoundManager {
  constructor() {
    this.sounds = {
      select: this.createBeep(800, 0.1),
      hover: this.createBeep(1200, 0.05),
      back: this.createBeep(400, 0.1)
    };
  }

  createBeep(frequency, duration) {
    return () => {
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }
    };
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }
}

// ========== INITIALIZE PARTICLES/SOUND ==========

document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem();
  const soundManager = new SoundManager();

  // Add sound effects to interactions
  document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('character-card')) {
      soundManager.play('hover');
    }
  });
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('character-card')) {
      soundManager.play('select');
    }
    if (e.target.id === 'closeModal' || e.target.id === 'backBtn') {
      soundManager.play('back');
    }
  });
});

// ========== KEYBOARD NAV (OPTIONAL, YOU CAN ADD LATER) ==========

const style = document.createElement('style');
style.textContent = `
  .character-card.keyboard-selected {
    transform: translateY(-10px) scale(1.05);
  }
  .character-card.keyboard-selected .character-portrait {
    border-color: #ff0066 !important;
    box-shadow: 
      0 15px 40px rgba(255, 0, 102, 0.3),
      0 0 30px rgba(255, 0, 102, 0.5),
      inset 0 0 0 2px rgba(255, 0, 102, 0.3) !important;
  }
  .character-card.keyboard-selected .character-name {
    color: #ff0066 !important;
    text-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(255, 0, 102, 0.5) !important;
  }
`;
document.head.appendChild(style);
