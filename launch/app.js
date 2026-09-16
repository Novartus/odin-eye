// ==========================================================================
// ODINEYE PRODUCT LAUNCH INTERACTIVE CONTROLLER
// High-Impact Editorial Presentation Engine · Android 10+ Ecosystem
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDomainStageSwitcher();
  initSleepStageDemo();
  initAiCoachSimulator();
  initWebAudioSynthesizer();
  initMobileNavigation();
  initReelInteractivity();
});

// ==========================================================================
// 1. FLAGSHIP DOMAIN STAGE SWITCHER & SUB-SCREENS
// ==========================================================================
const DOMAIN_DATA = {
  dashboard: {
    badge: 'DOMAIN 01 · SYSTEM DASHBOARD',
    title: 'Real-Time Daily Equilibrium & Adherence',
    desc: 'The OdinEye home dashboard synthesizes four primary biometric indicators into a single unified recovery score. View active cardiovascular exertion, daily medication adherence checklists, and quick-launch zen breathing triggers without opening secondary tabs.',
    primaryImg: 'assets/screenshots/Dashboard1.png',
    secondaryImg: 'assets/screenshots/Dashboard2.png',
    specs: [
      { label: 'Restorative Recovery Gauge', desc: 'Dynamic SVG radial score factoring sleep architecture and nocturnal autonomic dip.' },
      { label: '1-Tap Medication Check', desc: 'Native offline adherence tracking synchronized with system notification alarms.' },
      { label: 'Zero Latency Health Connect Sync', desc: 'Instant telemetry ingest from Pixel Watch, Galaxy Watch, and Ring AIR.' }
    ],
    subScreens: [
      { label: 'Screen 1 · Metric Snapshot', file: 'assets/screenshots/Dashboard1.png', secFile: 'assets/screenshots/Dashboard2.png' },
      { label: 'Screen 2 · Action Hub', file: 'assets/screenshots/Dashboard2.png', secFile: 'assets/screenshots/Dashboard1.png' }
    ]
  },
  sleep: {
    badge: 'DOMAIN 02 · SLEEP ARCHITECTURE & VITALS',
    title: 'Clinical Polysomnography & Nocturnal Pulse Matching',
    desc: 'OdinEye decomposes raw sleep telemetry into medical-grade stages (Deep, REM, Light, Awake) and correlates your nocturnal pulse dip with deep sleep duration to accurately compute parasympathetic nervous system recovery.',
    primaryImg: 'assets/screenshots/Vitals2.png',
    secondaryImg: 'assets/screenshots/Vitals1.png',
    specs: [
      { label: 'Nocturnal Dip Index', desc: 'Automatically identifies baseline resting HR vs. lowest sleep window dip (14.2%).' },
      { label: '4-Stage Duration Breakdown', desc: 'Deep (22%), REM (24%), Light (48%), Awake (6%) with 7-day cumulative debt.' },
      { label: 'Biometric Harmony Dial', desc: 'Concentric 3-ring vector visualization for Activity, Sleep, and Muscular Recovery.' }
    ],
    subScreens: [
      { label: 'Screen 1 · Sleep & Nocturnal HR', file: 'assets/screenshots/Vitals2.png', secFile: 'assets/screenshots/Vitals1.png' },
      { label: 'Screen 2 · Biometric Harmony Rings', file: 'assets/screenshots/Vitals1.png', secFile: 'assets/screenshots/Vitals2.png' }
    ]
  },
  ai: {
    badge: 'DOMAIN 03 · LOCAL GEMINI NANO COACH',
    title: 'Hands-Free Voice AI with Zero Cloud Leakage',
    desc: 'Powered by Android AICore running directly on hardware Tensor and Snapdragon NPUs. Experience hands-free speech recognition and local neural voice synthesis for real-time biometric consultation while working out or cooking.',
    primaryImg: 'assets/screenshots/AI1.png',
    secondaryImg: 'assets/screenshots/Dashboard1.png',
    specs: [
      { label: '100% On-Device Reasoning', desc: 'Zero API calls to OpenAI, Claude, or third-party cloud LLMs.' },
      { label: 'Kotlin OdinEyeVoiceModule', desc: 'Native Android SpeechRecognizer and TextToSpeech pipeline.' },
      { label: '<18ms Local Latency', desc: 'Instant responses with complete privacy and zero data harvesting.' }
    ],
    subScreens: [
      { label: 'Screen 1 · Dedicated AI Coach', file: 'assets/screenshots/AI1.png', secFile: 'assets/screenshots/Dashboard1.png' }
    ]
  },
  zen: {
    badge: 'DOMAIN 04 · ZEN SANCTUARY & AUDIO',
    title: 'Procedural Frequencies & Tactile Somatic Breathwork',
    desc: 'Unwind with real-time mathematical audio synthesis and eyes-closed rhythmic haptics. Generate 432Hz Solfeggio resonance, 40Hz Gamma binaural beats, and velvet brown noise directly via native Android AudioTrack PCM buffers.',
    primaryImg: 'assets/screenshots/Zen1.png',
    secondaryImg: 'assets/screenshots/Zen2.png',
    specs: [
      { label: 'Tactile Haptic Pacing', desc: 'Inhale, hold, and exhale rhythms calibrated for autonomic nervous reset.' },
      { label: 'Dynamic Reactive Face', desc: 'SVG facial expression morphing based on your 7-day consistency and mood.' },
      { label: 'Zero Streaming Downloads', desc: '100% procedurally computed sound waves with background playback.' }
    ],
    subScreens: [
      { label: 'Screen 1 · Tactile Breathwork', file: 'assets/screenshots/Zen1.png', secFile: 'assets/screenshots/Zen2.png' },
      { label: 'Screen 2 · Reactive Mood Face', file: 'assets/screenshots/Zen2.png', secFile: 'assets/screenshots/Zen1.png' }
    ]
  },
  vault: {
    badge: 'DOMAIN 05 · ENCRYPTED VAULT & PRIVACY',
    title: 'Hardware-Backed Cryptography & Source Control',
    desc: 'Your sensitive physiological history is protected inside an AES-256 encrypted SQLite database utilizing Android Keystore and PBKDF2 key derivation (10,000 rounds). Configure exact wearable permissions with fine-grained granular toggles.',
    primaryImg: 'assets/screenshots/Setup3.png',
    secondaryImg: 'assets/screenshots/Setup2.png',
    specs: [
      { label: 'Hardware Keystore Backing', desc: 'Master encryption keys never leave your phone\'s secure hardware enclave.' },
      { label: 'Granular Data Control', desc: 'Revoke or grant individual metric permissions (Heart Rate, Steps, Sleep) anytime.' },
      { label: 'Linux Mode 0700 Isolation', desc: 'Database files are strictly isolated to the private application sandbox.' }
    ],
    subScreens: [
      { label: 'Screen 1 · Encrypted Vault Status', file: 'assets/screenshots/Setup3.png', secFile: 'assets/screenshots/Setup2.png' },
      { label: 'Screen 2 · Source Permissions', file: 'assets/screenshots/Setup2.png', secFile: 'assets/screenshots/Setup3.png' },
      { label: 'Screen 3 · Biometric Targets', file: 'assets/screenshots/Setup1.png', secFile: 'assets/screenshots/Setup2.png' }
    ]
  }
};

function initDomainStageSwitcher() {
  const tabButtons = document.querySelectorAll('.domain-tab-btn');
  const badgeEl = document.getElementById('stage-badge');
  const titleEl = document.getElementById('stage-title');
  const descEl = document.getElementById('stage-desc');
  const specsEl = document.getElementById('stage-specs');
  const primaryImgEl = document.getElementById('stage-img-primary');
  const secImgEl = document.getElementById('stage-img-secondary');
  const subswitchContainer = document.getElementById('subswitch-container');

  if (!tabButtons.length || !primaryImgEl) return;

  function setDomain(domainKey) {
    const data = DOMAIN_DATA[domainKey];
    if (!data) return;

    // Update Tab Buttons
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-domain') === domainKey);
    });

    // Cross-fade primary and secondary images smoothly
    if (primaryImgEl) {
      primaryImgEl.style.opacity = '0';
      setTimeout(() => {
        primaryImgEl.src = data.primaryImg;
        primaryImgEl.style.opacity = '1';
      }, 150);
    }

    if (secImgEl) {
      secImgEl.style.opacity = '0';
      setTimeout(() => {
        secImgEl.src = data.secondaryImg;
        secImgEl.style.opacity = '1';
      }, 150);
    }

    // Update Narrative Details
    if (badgeEl) badgeEl.textContent = data.badge;
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;

    // Update Feature Specs
    if (specsEl) {
      specsEl.innerHTML = data.specs.map(s => `
        <div class="stage-spec-row">
          <span class="spec-bullet">✦</span>
          <div>
            <strong>${s.label}:</strong> ${s.desc}
          </div>
        </div>
      `).join('');
    }

    // Render Subscreen Switchers
    if (subswitchContainer) {
      subswitchContainer.innerHTML = data.subScreens.map((sub, i) => `
        <button class="subswitch-btn ${i === 0 ? 'active' : ''}" data-primary="${sub.file}" data-sec="${sub.secFile}">
          ${sub.label}
        </button>
      `).join('');

      const subButtons = subswitchContainer.querySelectorAll('.subswitch-btn');
      subButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          subButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const newPrimary = btn.getAttribute('data-primary');
          const newSec = btn.getAttribute('data-sec');

          if (primaryImgEl && newPrimary) {
            primaryImgEl.style.opacity = '0';
            setTimeout(() => {
              primaryImgEl.src = newPrimary;
              primaryImgEl.style.opacity = '1';
            }, 120);
          }

          if (secImgEl && newSec) {
            secImgEl.style.opacity = '0';
            setTimeout(() => {
              secImgEl.src = newSec;
              secImgEl.style.opacity = '1';
            }, 120);
          }
        });
      });
    }

    // Sync active state in the Horizontal Reel
    const reelCards = document.querySelectorAll('.reel-card');
    reelCards.forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-domain') === domainKey);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const domainKey = btn.getAttribute('data-domain');
      setDomain(domainKey);
    });
  });

  // Expose global switcher for reel clicks
  window.switchStageDomain = setDomain;
}

// ==========================================================================
// 2. HORIZONTAL REEL INTERACTIVITY
// ==========================================================================
function initReelInteractivity() {
  const reelCards = document.querySelectorAll('.reel-card');
  const primaryImgEl = document.getElementById('stage-img-primary');
  const secImgEl = document.getElementById('stage-img-secondary');

  reelCards.forEach(card => {
    card.addEventListener('click', () => {
      const domain = card.getAttribute('data-domain');
      const primary = card.getAttribute('data-primary');
      const sec = card.getAttribute('data-sec');

      if (window.switchStageDomain && domain) {
        window.switchStageDomain(domain);
      }

      if (primaryImgEl && primary) {
        primaryImgEl.style.opacity = '0';
        setTimeout(() => {
          primaryImgEl.src = `assets/screenshots/${primary}`;
          primaryImgEl.style.opacity = '1';
        }, 120);
      }

      if (secImgEl && sec) {
        secImgEl.style.opacity = '0';
        setTimeout(() => {
          secImgEl.src = `assets/screenshots/${sec}`;
          secImgEl.style.opacity = '1';
        }, 120);
      }

      reelCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Scroll smoothly to stage
      const stage = document.getElementById('experience');
      if (stage) {
        stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ==========================================================================
// 3. SLEEP ARCHITECTURE & HYPNOGRAM INTERACTION
// ==========================================================================
function initSleepStageDemo() {
  const tabs = document.querySelectorAll('.sleep-tab-btn');
  const segments = document.querySelectorAll('.hypno-seg');

  const STAGE_CONTENT = {
    all: {
      title: 'Full 4-Stage Architecture',
      duration: '7h 42m Total · 94% Efficiency',
      rows: [
        { tag: 'tag-deep', label: 'Deep Sleep (N3)', val: '1h 42m', pct: '22%', desc: 'Cellular repair, growth hormone release & glymphatic neuro-waste clearance.' },
        { tag: 'tag-rem', label: 'REM Sleep', val: '1h 51m', pct: '24%', desc: 'Procedural memory synthesis, motor-skill integration & emotional recalibration.' },
        { tag: 'tag-light', label: 'Light Sleep', val: '3h 41m', pct: '48%', desc: 'Circadian thermoregulation (-0.8°C core dip) & foundational metabolic reset.' },
        { tag: 'tag-awake', label: 'Micro-Arousals', val: '28m', pct: '6%', desc: '4 brief unconscious posture adjustments. Normal normative sleep fragmentation.' }
      ]
    },
    deep: {
      title: 'Slow-Wave Deep Sleep (N3)',
      duration: '1h 42m (22% of total duration)',
      rows: [
        { tag: 'tag-deep', label: 'Deep (N3)', val: '1h 42m', pct: '22%', desc: 'Deep delta slow-waves (0.5–2 Hz) with minimal autonomic strain.' },
        { tag: 'tag-deep', label: 'Growth Hormone', val: 'Peak', pct: 'Active', desc: 'Major physical and skeletal tissue restoration phase.' },
        { tag: 'tag-deep', label: 'Glymphatic System', val: 'Peak Flush', pct: 'Optimal', desc: 'Interstitial neuro-waste and beta-amyloid clearance.' },
        { tag: 'tag-deep', label: 'Cardio Dip', val: '48 bpm', pct: '-14.2%', desc: 'Deepest parasympathetic cardiovascular drop of the night.' }
      ]
    },
    rem: {
      title: 'Rapid Eye Movement (REM)',
      duration: '1h 51m (24% of total duration)',
      rows: [
        { tag: 'tag-rem', label: 'REM Sleep', val: '1h 51m', pct: '24%', desc: 'Desynchronized beta/theta brainwave activity with dream synthesis.' },
        { tag: 'tag-rem', label: 'Emotional Balance', val: 'Active', pct: 'Synced', desc: 'Amygdala regulation and psychological stress buffering.' },
        { tag: 'tag-rem', label: 'Motor Atonia', val: '100%', pct: 'Protected', desc: 'Protective skeletal muscle paralysis during vivid dreaming.' },
        { tag: 'tag-rem', label: 'HRV Dynamics', val: '68 ms', pct: '+18%', desc: 'High autonomic heart rate variability responsiveness.' }
      ]
    },
    light: {
      title: 'Light Sleep (N1 + N2)',
      duration: '3h 41m (48% of total duration)',
      rows: [
        { tag: 'tag-light', label: 'Stage N1', val: '26m', pct: '6%', desc: 'Transitional somnolence with hypnagogic alpha wave attenuation.' },
        { tag: 'tag-light', label: 'Stage N2', val: '3h 15m', pct: '42%', desc: 'Sleep spindles and K-complexes protecting sleep maintenance.' },
        { tag: 'tag-light', label: 'Core Temp Dip', val: '-0.8°C', pct: 'Normative', desc: 'Circadian thermoregulatory downregulation.' },
        { tag: 'tag-light', label: 'Basal Vent', val: '14 rpm', pct: 'Rhythmic', desc: 'Steady metabolic baseline respiration rhythm.' }
      ]
    },
    awake: {
      title: 'Awake / Micro-Arousals',
      duration: '28m (6% of total bed duration)',
      rows: [
        { tag: 'tag-awake', label: 'Arousals Count', val: '4 bouts', pct: 'Normative', desc: 'Brief unconscious posture adjustments lasting <3 minutes.' },
        { tag: 'tag-awake', label: 'Sleep Efficiency', val: '94%', pct: 'Optimal', desc: 'Percentage of bedtime spent in restorative sleep.' },
        { tag: 'tag-awake', label: 'Sleep Latency', val: '12 min', pct: 'Rapid', desc: 'Time elapsed between lights out and initial sleep onset.' },
        { tag: 'tag-awake', label: 'Cortisol Awaken', val: 'Primed', pct: 'Ready', desc: 'Natural dawn autonomic awakening surge.' }
      ]
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const stageKey = tab.getAttribute('data-stage') || 'all';
      renderSleep(STAGE_CONTENT[stageKey]);
    });
  });

  segments.forEach(seg => {
    seg.addEventListener('click', () => {
      const stage = seg.getAttribute('data-stage');
      const matchingTab = document.querySelector(`.sleep-tab-btn[data-stage="${stage}"]`);
      if (matchingTab) matchingTab.click();
    });
  });

  function renderSleep(data) {
    const titleEl = document.getElementById('sleep-stage-title');
    const durEl = document.getElementById('sleep-stage-duration');
    const listEl = document.getElementById('sleep-dynamic-grid');
    if (!titleEl || !durEl || !listEl || !data) return;

    titleEl.textContent = data.title;
    durEl.textContent = data.duration;

    listEl.innerHTML = data.rows.map(r => `
      <div class="sleep-breakdown-row">
        <div class="breakdown-tag ${r.tag}">${r.label}</div>
        <div class="breakdown-stat">${r.val} <span class="breakdown-pct">${r.pct}</span></div>
        <div class="breakdown-desc">${r.desc}</div>
      </div>
    `).join('');
  }
}

// ==========================================================================
// 4. ON-DEVICE AI QUERY SIMULATOR
// ==========================================================================
function initAiCoachSimulator() {
  const queryBtns = document.querySelectorAll('.ai-query-btn');
  const responseEl = document.getElementById('ai-simulated-text');
  if (!queryBtns.length || !responseEl) return;

  const RESPONSES = {
    sleep: '"Your 88% recovery score is supported by 1h 42m of slow-wave Deep Sleep (22%) and a healthy 14.2% nocturnal cardiovascular dip down to 48 bpm. Your autonomic nervous system is in optimal parasympathetic equilibrium."',
    cardio: '"Your evening run concluded at 6:45 PM, providing 3.5 hours before bedtime. Your core temperature downregulated successfully and sleep latency was only 12 minutes, allowing full 22% Deep Sleep without nocturnal tachycardia."',
    fatigue: '"Based on yesterday\'s 4.2 km run and 12,450 steps, your Calves (62% fatigue) and Hamstrings (58% fatigue) show the highest muscular load. A 5-minute seated hamstring stretch and calf wall stretch is recommended."'
  };

  queryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      queryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const queryKey = btn.getAttribute('data-query');
      if (RESPONSES[queryKey]) {
        responseEl.style.opacity = '0.2';
        setTimeout(() => {
          responseEl.textContent = RESPONSES[queryKey];
          responseEl.style.opacity = '1';
        }, 150);
      }
    });
  });
}

// ==========================================================================
// 5. PROCEDURAL WEB AUDIO SYNTHESIZER PREVIEW
// ==========================================================================
function initWebAudioSynthesizer() {
  let audioCtx = null;
  let activeNodes = [];
  let isPlaying = false;
  let activePreset = '432hz';

  const playBtn = document.getElementById('audio-play-trigger');
  const labelEl = document.getElementById('audio-status-label');
  const waveAnimEl = document.getElementById('audio-wave-anim');
  const freqChips = document.querySelectorAll('.freq-chip-btn');

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function stopAudio() {
    activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    activeNodes = [];
    isPlaying = false;

    if (labelEl) labelEl.textContent = 'Tap to Play Procedural Preview';
    if (waveAnimEl) waveAnimEl.classList.remove('active');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
  }

  function playPreset(preset) {
    stopAudio();
    const ctx = getAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.6);
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    if (preset === '432hz') {
      // Pure 432Hz Solfeggio Harmonic Sine Wave
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.connect(masterGain);
      osc.start();
      activeNodes.push(osc);
    } else if (preset === '40hz') {
      // 40Hz Gamma Focus Binaural Beats (240Hz Left, 280Hz Right)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscL.frequency.setValueAtTime(240, ctx.currentTime);
      oscR.frequency.setValueAtTime(280, ctx.currentTime);

      if (panL && panR) {
        panL.pan.setValueAtTime(-0.85, ctx.currentTime);
        panR.pan.setValueAtTime(0.85, ctx.currentTime);
        oscL.connect(panL).connect(masterGain);
        oscR.connect(panR).connect(masterGain);
      } else {
        oscL.connect(masterGain);
        oscR.connect(masterGain);
      }

      oscL.start();
      oscR.start();
      activeNodes.push(oscL, oscR);
    } else if (preset === 'delta') {
      // 2Hz Delta Sleep Restoration with LFO frequency mod
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(15, ctx.currentTime);
      lfo.connect(lfoGain).connect(osc.frequency);

      osc.connect(masterGain);
      osc.start();
      lfo.start();
      activeNodes.push(osc, lfo);
    } else if (preset === 'brown') {
      // Velvet Brownian Noise generator
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(masterGain);
      noise.start();
      activeNodes.push(noise);
    }

    isPlaying = true;
    if (labelEl) labelEl.textContent = `Synthesizing: ${preset.toUpperCase()} Real-Time Audio`;
    if (waveAnimEl) waveAnimEl.classList.add('active');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
    }
  }

  freqChips.forEach(chip => {
    chip.addEventListener('click', () => {
      freqChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activePreset = chip.getAttribute('data-sound') || '432hz';
      if (isPlaying) {
        playPreset(activePreset);
      }
    });
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopAudio();
      } else {
        playPreset(activePreset);
      }
    });
  }
}

// ==========================================================================
// 6. MOBILE NAVIGATION DRAWER
// ==========================================================================
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');

  function openDrawer() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeDrawer();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }
}
