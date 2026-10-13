// ============================================================================
// BOLLYWOOD AUDIO & CINEMA SOUND ENGINE (Web Audio API + Speech Synthesis)
// 100% self-contained, no external audio file dependencies needed, crystal clear!
// ============================================================================

class BollywoodAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicMuted = false;
    this.currentBgm = null;
    this.bgmTimer = null;
    this.activeTrack = "masala"; // masala, retro, romance, villain
    this.analyser = null;
    this.dataArray = null;
    this.isSpeaking = false;
    this.speechSynth = window.speechSynthesis || null;
    this.hindiVoice = null;
    this.initVoices();
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  initVoices() {
    if (!this.speechSynth) return;
    const loadVoices = () => {
      const voices = this.speechSynth.getVoices();
      // Try to find a Hindi voice, or Indian English voice, or warm male/female voice
      this.hindiVoice =
        voices.find(v => v.lang === "hi-IN" || v.lang.startsWith("hi")) ||
        voices.find(v => v.lang === "en-IN" || v.name.toLowerCase().includes("india")) ||
        voices.find(v => v.lang.startsWith("en") && !v.name.includes("Zira")) ||
        voices[0] ||
        null;
    };
    loadVoices();
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = loadVoices;
    }
  }

  // Master Sound Effect player
  playSfx(type) {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    switch (type) {
      case "seeti": // Iconic Bollywood Whistle
        this.playSeetiWhistle(now);
        break;
      case "brassFanfare": // Hero entry brass
        this.playHeroBrass(now);
        break;
      case "villainStab": // Mogambo / Gabbar scary sting
        this.playVillainStab(now);
        break;
      case "evilLaugh": // Mogambo laughing synth
        this.playEvilLaugh(now);
        break;
      case "mandolinChime": // DDLJ Mandolin notes
        this.playMandolinChime(now);
        break;
      case "correct": // Cash + Fanfare
        this.playCorrectChime(now);
        break;
      case "wrong": // Comedic wah-wah / buzzer
        this.playWrongBuzz(now);
        break;
      case "chaChing": // Box Office collection
        this.playCashRegister(now);
        break;
      case "tick": // Rapid fire countdown tick
        this.playTick(now);
        break;
      case "clap": // Audience cheers
        this.playCheerClap(now);
        break;
      case "dholakRoll": // Dholak thud roll
        this.playDholakRoll(now);
        break;
      case "comicSlide": // Crime Master Gogo slide
        this.playComicSlide(now);
        break;
      case "explosion": // Action hit
        this.playExplosion(now);
        break;
      default:
        this.playClick(now);
    }
  }

  // 1. Bollywood "Seeti" (Audience Whistle)
  playSeetiWhistle(startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";

    // Whistle frequency modulation (swoop up, vibrato, chirp)
    osc.frequency.setValueAtTime(1400, startTime);
    osc.frequency.exponentialRampToValueAtTime(2600, startTime + 0.12);
    osc.frequency.setValueAtTime(2500, startTime + 0.18);
    osc.frequency.linearRampToValueAtTime(2700, startTime + 0.35);
    osc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.55);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.05);
    gain.gain.setValueAtTime(0.35, startTime + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.56);
  }

  // 2. Hero Brass Fanfare (Big Bollywood Horn)
  playHeroBrass(startTime) {
    const notes = [261.63, 329.63, 392.0, 523.25]; // C - E - G - C (major power)
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      const noteStart = startTime + idx * 0.08;
      const noteEnd = noteStart + 0.45;

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      // Lowpass filter for warm brass texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, noteStart);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  }

  // 3. Villain Dramatic Stab
  playVillainStab(startTime) {
    const osc = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    oscSub.type = "sine";

    osc.frequency.setValueAtTime(110, startTime); // A2
    osc.frequency.exponentialRampToValueAtTime(55, startTime + 0.6); // A1 drop

    oscSub.frequency.setValueAtTime(55, startTime);
    oscSub.frequency.exponentialRampToValueAtTime(27.5, startTime + 0.8);

    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

    osc.connect(gain);
    oscSub.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    oscSub.start(startTime);
    osc.stop(startTime + 0.8);
    oscSub.stop(startTime + 0.8);
  }

  // 4. Mogambo Evil Laugh Synth
  playEvilLaugh(startTime) {
    const laughs = [
      { t: 0, f: 160 },
      { t: 0.12, f: 150 },
      { t: 0.24, f: 140 },
      { t: 0.38, f: 120 },
      { t: 0.52, f: 100 }
    ];

    laughs.forEach(l => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(l.f, startTime + l.t);
      osc.frequency.exponentialRampToValueAtTime(l.f * 0.8, startTime + l.t + 0.1);

      gain.gain.setValueAtTime(0.28, startTime + l.t);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + l.t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime + l.t);
      osc.stop(startTime + l.t + 0.11);
    });
  }

  // 5. DDLJ Mandolin Chime Motif (Iconic romantic phrase)
  playMandolinChime(startTime) {
    const notes = [659.25, 783.99, 987.77, 880.0, 783.99]; // E5, G5, B5, A5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime + i * 0.14);

      const noteStart = startTime + i * 0.14;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + 0.36);
    });
  }

  // 6. Correct Answer Ding + Fanfare
  playCorrectChime(startTime) {
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.06);

      const t = startTime + idx * 0.06;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  // 7. Wrong Answer Wah
  playWrongBuzz(startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, startTime);
    osc.frequency.linearRampToValueAtTime(140, startTime + 0.35);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  }

  // 8. Box Office Cash Register (Cha-Ching)
  playCashRegister(startTime) {
    // Bell chime
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = "sine";
    bell.frequency.setValueAtTime(1567.98, startTime); // G6
    bellGain.gain.setValueAtTime(0.3, startTime);
    bellGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
    bell.connect(bellGain);
    bellGain.connect(this.ctx.destination);
    bell.start(startTime);
    bell.stop(startTime + 0.6);

    // Coins flutter noise
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, startTime + 0.12);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
    whiteNoise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(startTime + 0.12);
  }

  playTick(startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, startTime);
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.06);
  }

  playClick(startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, startTime);
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.05);
  }

  playCheerClap(startTime) {
    for (let i = 0; i < 4; i++) {
      const delay = startTime + i * 0.07;
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, delay);
      gain.gain.exponentialRampToValueAtTime(0.001, delay + 0.06);
      noise.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(delay);
    }
  }

  playDholakRoll(startTime) {
    const hits = [0, 0.08, 0.14, 0.22, 0.28, 0.35];
    hits.forEach((t, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 120 : 280, startTime + t);
      osc.frequency.exponentialRampToValueAtTime(50, startTime + t + 0.07);

      gain.gain.setValueAtTime(0.3, startTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime + t);
      osc.stop(startTime + t + 0.09);
    });
  }

  playComicSlide(startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, startTime);
    osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.3);
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.36);
  }

  playExplosion(startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(90, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.4);
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.51);
  }

  // ==========================================================================
  // PROCEDURAL BOLLYWOOD BACKGROUND MUSIC GENERATOR
  // Rhythmic Dholak beats, 70s basslines, romantic arpeggios, villain pulses
  // ==========================================================================
  startBgm(track = "masala") {
    if (this.isMusicMuted) return;
    this.stopBgm();
    this.init();
    this.activeTrack = track;

    let step = 0;
    const bpm = track === "masala" ? 125 : track === "retro" ? 115 : track === "romance" ? 95 : 105;
    const stepInterval = (60 / bpm / 2) * 1000; // 16th notes / 8th notes

    this.bgmTimer = setInterval(() => {
      if (this.isMusicMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.playBgmStep(track, step % 16, now);
      step++;
    }, stepInterval);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBgmStep(track, step, now) {
    switch (track) {
      case "masala":
        // Dholak beat + brass rhythmic pulse
        if (step === 0 || step === 6 || step === 10) {
          // Bass thud (Dholak Bayan)
          this.synthDrum(now, 90, 45, 0.22, "sine");
        }
        if (step === 4 || step === 12) {
          // Sharp slap (Dholak Dayan)
          this.synthDrum(now, 380, 180, 0.16, "triangle");
        }
        if (step % 2 === 1) {
          // Hi-hat / ghungroo tick
          this.synthGhungroo(now);
        }
        if (step === 0 || step === 8) {
          // Brass chord hit
          this.synthBrassChord(now, [220, 261.6, 329.6], 0.08); // Am chord
        }
        break;

      case "retro":
        // 70s Funk Don / Sholay style bass groove
        const bassNotes = [110, 110, 130.8, 146.8, 164.8, 146.8, 130.8, 110];
        if (step % 2 === 0) {
          const noteIndex = Math.floor(step / 2) % bassNotes.length;
          this.synthBassNote(now, bassNotes[noteIndex], 0.15);
        }
        if (step === 4 || step === 12) {
          this.synthSnare(now);
        }
        if (step % 2 === 1) {
          this.synthGhungroo(now, 0.04);
        }
        break;

      case "romance":
        // DDLJ Mandolin acoustic pattern
        const romanceMelody = [329.63, 392.0, 493.88, 587.33, 493.88, 392.0];
        const melNote = romanceMelody[step % romanceMelody.length];
        this.synthPluck(now, melNote, 0.08);
        if (step === 0 || step === 8) {
          this.synthWarmPad(now, 164.81, 0.4);
        }
        break;

      case "villain":
        // Heavy tension minor march
        if (step === 0 || step === 8) {
          this.synthDrum(now, 65, 30, 0.35, "sawtooth");
          this.synthBrassChord(now, [130.8, 155.56, 196.0], 0.18); // Cm
        }
        if (step === 4 || step === 12) {
          this.synthDrum(now, 110, 50, 0.2, "triangle");
        }
        break;
    }
  }

  synthDrum(time, startFreq, endFreq, vol, type = "sine") {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.09);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.11);
  }

  synthGhungroo(time, vol = 0.03) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "highpass";
    osc.frequency.setValueAtTime(4500, time);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.04);
  }

  synthBrassChord(time, freqs, vol = 0.1) {
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, time);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.21);
    });
  }

  synthBassNote(time, freq, vol = 0.15) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.19);
  }

  synthSnare(time) {
    this.synthDrum(time, 220, 90, 0.15, "triangle");
  }

  synthPluck(time, freq, vol = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.21);
  }

  synthWarmPad(time, freq, dur = 0.5) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.07, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  // ==========================================================================
  // DRAMATIC BOLLYWOOD SPEECH SYNTHESIS ENGINE
  // Speaks the dialogue with cinematic actor-inspired modulation & visualizer!
  // ==========================================================================
  speakDialogue(dialogueObj, onStart, onEnd) {
    if (!this.speechSynth) {
      if (onEnd) onEnd();
      return;
    }

    this.init();
    this.speechSynth.cancel(); // cancel any active speech

    // Play subtle cinematic chime before voice begins
    this.playSfx("dholakRoll");

    const textToSpeak = dialogueObj.quoteEn || dialogueObj.quoteHi;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (this.hindiVoice) {
      utterance.voice = this.hindiVoice;
    }

    // Apply actor-specific tone parameters
    const tone = dialogueObj.audioTone || { pitch: 1.0, rate: 0.9 };
    utterance.pitch = tone.pitch || 0.95;
    utterance.rate = tone.rate || 0.9;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    setTimeout(() => {
      this.speechSynth.speak(utterance);
    }, 180);
  }

  stopSpeech() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.isSpeaking = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.isMusicMuted) {
      this.stopBgm();
    } else {
      this.startBgm(this.activeTrack);
    }
    return this.isMusicMuted;
  }
}

export const sound = new BollywoodAudioEngine();
