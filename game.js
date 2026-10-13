// ============================================================================
// BOLLYWOOD DIALOGUE DHAMAKA - CORE GAME LOGIC
// ============================================================================

import { DIALOGUES, SOUNDBOARD_PRESETS } from "./dialogueData.js";
import { sound } from "./audioEngine.js";

class BollywoodDialogueGame {
  constructor() {
    this.mode = "campaign"; // campaign, rapid, showdown, blind, soundboard
    this.currentEra = "all";
    this.questions = [];
    this.currentIndex = 0;
    this.boxOfficeCrores = 0;
    this.seetiStreak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.timer = null;
    this.timeLeft = 60;
    this.lifelines = { cut: true, hint: true, skip: true };
    this.canAnswer = true;
    this.heroScore = 0;
    this.villainScore = 0;

    // Canvas confetti
    this.canvas = document.getElementById("confettiCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.particles = [];
    this.animId = null;

    this.initCanvas();
    this.loadHighScores();
    this.bindEvents();
    this.renderLobby();
  }

  initCanvas() {
    if (!this.canvas) return;
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
  }

  loadHighScores() {
    const saved = localStorage.getItem("filmi_best_boxoffice");
    this.highScore = saved ? parseFloat(saved) : 0;
  }

  saveHighScore() {
    if (this.boxOfficeCrores > this.highScore) {
      this.highScore = this.boxOfficeCrores;
      localStorage.setItem("filmi_best_boxoffice", this.highScore.toFixed(1));
    }
  }

  bindEvents() {
    // Header controls
    document.getElementById("btnMuteSfx")?.addEventListener("click", (e) => {
      const isMuted = sound.toggleMute();
      e.currentTarget.textContent = isMuted ? "🔇" : "🔊";
      e.currentTarget.title = isMuted ? "Unmute SFX" : "Mute SFX";
    });

    document.getElementById("btnToggleMusic")?.addEventListener("click", (e) => {
      const isMusicMuted = sound.toggleMusic();
      e.currentTarget.textContent = isMusicMuted ? "🎵❌" : "🎶";
      e.currentTarget.title = isMusicMuted ? "Start Background Music" : "Mute Music";
    });

    document.getElementById("bgmSelect")?.addEventListener("change", (e) => {
      sound.activeTrack = e.target.value;
      if (!sound.isMusicMuted) {
        sound.startBgm(e.target.value);
      }
    });

    document.getElementById("brandLogo")?.addEventListener("click", () => {
      sound.stopSpeech();
      this.stopTimer();
      this.renderLobby();
    });

    // Soundboard navigation button in header
    document.getElementById("btnHeaderSoundboard")?.addEventListener("click", () => {
      this.renderSoundboard();
    });
  }

  // ==========================================================================
  // LOBBY / MODE SELECTION
  // ==========================================================================
  renderLobby() {
    this.stopTimer();
    const stage = document.getElementById("mainStage");
    if (!stage) return;

    stage.innerHTML = `
      <div class="lobby-view">
        <div class="hero-billboard">
          <span class="billboard-tag">🎬 NOW SHOWING IN THEATRES</span>
          <h1 class="billboard-title">
            FILMI DIALOGUE <span class="accent-text">DHAMAKA!</span>
          </h1>
          <p class="billboard-subtitle">
            Guess iconic Hindi cinema dialogues from Gabbar Singh to Pushpa Raj!
            Turn up the volume for dramatic voices, cinematic BGM, and crowd whistles!
          </p>

          <!-- Eras Selector -->
          <div class="era-pills-row" id="eraPillsRow">
            <button class="era-pill ${this.currentEra === "all" ? "active" : ""}" data-era="all">🌟 All Eras (50+ Hits)</button>
            <button class="era-pill ${this.currentEra === "70s-80s" ? "active" : ""}" data-era="70s-80s">📻 70s-80s Angry Young Man</button>
            <button class="era-pill ${this.currentEra === "90s" ? "active" : ""}" data-era="90s">❤️ 90s Romance & Revenge</button>
            <button class="era-pill ${this.currentEra === "2000s" ? "active" : ""}" data-era="2000s">💥 2000s Masala Swag</button>
            <button class="era-pill ${this.currentEra === "Modern" ? "active" : ""}" data-era="Modern">🔥 Modern Mass Blockbusters</button>
          </div>

          <div class="stats-strip">
            <div class="stat-pill">
              <span>🏆 All-Time Record:</span>
              <strong>₹ ${this.highScore.toFixed(1)} Cr</strong>
            </div>
            <div class="stat-pill">
              <span>🎭 Dialogues Loaded:</span>
              <strong>${DIALOGUES.length}</strong>
            </div>
            <div class="stat-pill">
              <span>🍿 Audio BGM:</span>
              <strong>Procedural Web Audio</strong>
            </div>
          </div>
        </div>

        <!-- 4 Game Modes Grid -->
        <div class="modes-grid">
          <!-- 1. Box Office Campaign -->
          <div class="mode-card" data-mode="campaign">
            <div>
              <div class="mode-card-header">
                <div class="mode-icon-box" style="background: linear-gradient(135deg, #b45309, #d97706)">
                  🎟️
                </div>
                <span style="font-size: 0.75rem; color: #fbbf24; font-weight: 700;">10 ROUNDS</span>
              </div>
              <h3>Box Office Campaign</h3>
              <p>Climb from Junior Artist to Bollywood Shehenshah. Use 50:50 and filmi hints to cross the ₹500 Cr Club!</p>
            </div>
            <button class="btn-play-mode">▶ Start Campaign</button>
          </div>

          <!-- 2. Rapid Fire Dhamaka -->
          <div class="mode-card" data-mode="rapid">
            <div>
              <div class="mode-card-header">
                <div class="mode-icon-box" style="background: linear-gradient(135deg, #b91c1c, #dc2626)">
                  ⚡
                </div>
                <span style="font-size: 0.75rem; color: #f87171; font-weight: 700;">60s TIMER</span>
              </div>
              <h3>Rapid Fire 60s Blitz</h3>
              <p>High-adrenaline buzzer round! Every right answer fires up the Seeti Whistle Meter for crazy combo multipliers.</p>
            </div>
            <button class="btn-play-mode">⚡ Play 60s Blitz</button>
          </div>

          <!-- 3. Hero vs Villain Showdown -->
          <div class="mode-card" data-mode="showdown">
            <div>
              <div class="mode-card-header">
                <div class="mode-icon-box" style="background: linear-gradient(135deg, #581c87, #9333ea)">
                  ⚔️
                </div>
                <span style="font-size: 0.75rem; color: #c084fc; font-weight: 700;">TUG OF WAR</span>
              </div>
              <h3>Hero vs. Villain Face-Off</h3>
              <p>Mogambo vs Amitabh, Gabbar vs Sunny Deol! Side with Heroes or Villains in this dramatic cinema battle.</p>
            </div>
            <button class="btn-play-mode">⚔️ Enter Showdown</button>
          </div>

          <!-- 4. Blind Audio Voice Guess -->
          <div class="mode-card" data-mode="blind">
            <div>
              <div class="mode-card-header">
                <div class="mode-icon-box" style="background: linear-gradient(135deg, #0284c7, #38bdf8)">
                  🎧
                </div>
                <span style="font-size: 0.75rem; color: #7dd3fc; font-weight: 700;">AUDIO ONLY</span>
              </div>
              <h3>Blind Voice Line Challenge</h3>
              <p>Text is hidden! Listen closely to the voice cadence and background score to guess who said it.</p>
            </div>
            <button class="btn-play-mode">🎧 Test Your Ears</button>
          </div>
        </div>

        <!-- Soundboard Quick Entry Card -->
        <div style="background: rgba(24, 24, 27, 0.8); border: 1px dashed var(--border-gold); border-radius: 16px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: 12px;">
          <div>
            <h4 style="color: #fbbf24; font-size: 1.1rem; font-weight: 800;">📻 Bollywood Dialogue Soundboard & Jukebox</h4>
            <p style="color: #94a3b8; font-size: 0.85rem;">Tap instant voice lines of Gabbar, Mogambo, Sunny Deol, SRK, Baburao & Rocky Bhai!</p>
          </div>
          <button id="btnOpenSoundboardLobby" class="btn-play-mode" style="width: auto; padding: 8px 18px;">
            🔊 Open Soundboard
          </button>
        </div>
      </div>
    `;

    // Bind era buttons
    stage.querySelectorAll(".era-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        sound.playSfx("click");
        stage.querySelectorAll(".era-pill").forEach(p => p.classList.remove("active"));
        e.target.classList.add("active");
        this.currentEra = e.target.dataset.era;
      });
    });

    // Bind mode cards
    stage.querySelectorAll(".mode-card").forEach(card => {
      card.addEventListener("click", () => {
        sound.playSfx("brassFanfare");
        const mode = card.dataset.mode;
        this.startMode(mode);
      });
    });

    // Soundboard button
    document.getElementById("btnOpenSoundboardLobby")?.addEventListener("click", () => {
      this.renderSoundboard();
    });
  }

  // ==========================================================================
  // START GAME MODE
  // ==========================================================================
  startMode(mode) {
    this.mode = mode;
    this.boxOfficeCrores = 0;
    this.seetiStreak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.currentIndex = 0;
    this.lifelines = { cut: true, hint: true, skip: true };
    this.heroScore = 0;
    this.villainScore = 0;

    // Filter questions by era if selected
    let pool = [...DIALOGUES];
    if (this.currentEra !== "all") {
      pool = pool.filter(q => q.era === this.currentEra);
      if (pool.length < 5) pool = [...DIALOGUES];
    }

    // Shuffle pool
    this.questions = pool.sort(() => Math.random() - 0.5);

    if (mode === "campaign") {
      this.questions = this.questions.slice(0, 10);
    } else if (mode === "showdown") {
      this.questions = this.questions.slice(0, 10);
    } else if (mode === "blind") {
      this.questions = this.questions.slice(0, 8);
    } else if (mode === "rapid") {
      this.timeLeft = 60;
      this.startRapidTimer();
    }

    // Start background music automatically if not muted
    if (!sound.isMusicMuted) {
      const track = mode === "showdown" ? "villain" : mode === "rapid" ? "masala" : "retro";
      const sel = document.getElementById("bgmSelect");
      if (sel) sel.value = track;
      sound.startBgm(track);
    }

    this.renderQuestion();
  }

  startRapidTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.timeLeft--;
      const dial = document.getElementById("rapidTimerValue");
      if (dial) {
        dial.textContent = `${this.timeLeft}s`;
        if (this.timeLeft <= 10) {
          dial.parentElement.style.animation = "pulseCombo 0.5s infinite";
          sound.playSfx("tick");
        }
      }

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.showGameOver("Time's Up!");
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ==========================================================================
  // RENDER QUESTION
  // ==========================================================================
  renderQuestion() {
    this.canAnswer = true;
    const q = this.questions[this.currentIndex];
    if (!q) {
      this.showGameOver("Finished!");
      return;
    }

    const stage = document.getElementById("mainStage");
    if (!stage) return;

    const isBlind = this.mode === "blind";
    const totalQ = this.questions.length;
    const currentQNum = this.currentIndex + 1;

    // Shuffle options to ensure variety
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div class="game-view">
        <!-- Top HUD -->
        <div class="hud-bar">
          <div class="hud-item">
            <span class="hud-label">${this.getModeName()}</span>
            <span class="hud-value">${this.mode === "rapid" ? `Round ${currentQNum}` : `${currentQNum} / ${totalQ}`}</span>
          </div>

          <div class="hud-item">
            <span class="hud-label">Box Office Collection</span>
            <span class="hud-value hud-boxoffice">₹ ${this.boxOfficeCrores.toFixed(1)} Cr</span>
          </div>

          <!-- Seeti Combo Meter -->
          <div class="seeti-meter-container">
            <span class="seeti-flame ${this.seetiStreak >= 2 ? "active" : ""}">🔥</span>
            <div class="seeti-bars">
              <div class="seeti-step ${this.seetiStreak >= 1 ? "filled" : ""}"></div>
              <div class="seeti-step ${this.seetiStreak >= 2 ? "filled" : ""}"></div>
              <div class="seeti-step ${this.seetiStreak >= 3 ? "filled" : ""}"></div>
              <div class="seeti-step ${this.seetiStreak >= 4 ? "filled" : ""}"></div>
              <div class="seeti-step ${this.seetiStreak >= 5 ? "filled" : ""}"></div>
            </div>
            <span class="combo-badge ${this.seetiStreak >= 2 ? "show" : ""}">x${Math.min(this.seetiStreak, 5)} SEETI!</span>
          </div>

          ${
            this.mode === "rapid"
              ? `<div class="timer-dial">⏱️ <span id="rapidTimerValue">${this.timeLeft}s</span></div>`
              : ""
          }
        </div>

        <!-- Main Theatrical Card -->
        <div class="theatre-card">
          <span class="role-badge ${q.role === "Villain" ? "villain" : q.role === "Comic Legend" ? "comic" : ""}">
            ${q.role === "Villain" ? "🔥 ICONIC VILLAIN" : q.role === "Comic Legend" ? "🎭 COMIC LEGEND" : "👑 HERO LINE"}
          </span>

          <div class="quote-container ${isBlind ? "blind-mask" : ""}" id="quoteTextContainer">
            <span class="quote-open-mark">“</span>
            <h2 class="quote-english">${q.quoteEn}</h2>
            <p class="quote-hindi">${q.quoteHi}</p>
          </div>

          <!-- Listen Voice Line & Audio visualizer -->
          <div class="audio-action-row">
            <button class="btn-listen-dialogue" id="btnSpeakQuote">
              <span id="speakIcon">🔊</span>
              <span id="speakText">Listen Dramatic Voice</span>
              <div class="visualizer-bars">
                <div class="v-bar"></div>
                <div class="v-bar"></div>
                <div class="v-bar"></div>
                <div class="v-bar"></div>
                <div class="v-bar"></div>
              </div>
            </button>

            ${
              isBlind
                ? `<button class="btn-lifeline" id="btnRevealBlind">👁️ Reveal Text Clue</button>`
                : ""
            }
          </div>

          <!-- Lifelines (Available in Campaign & Showdown) -->
          ${
            this.mode !== "rapid"
              ? `
            <div class="lifelines-row">
              <button class="btn-lifeline" id="btnLifelineCut" ${!this.lifelines.cut ? "disabled" : ""}>
                ✂️ 50-50
              </button>
              <button class="btn-lifeline" id="btnLifelineHint" ${!this.lifelines.hint ? "disabled" : ""}>
                💡 Filmi Hint
              </button>
              <button class="btn-lifeline" id="btnLifelineSkip" ${!this.lifelines.skip ? "disabled" : ""}>
                ⏩ Retake
              </button>
            </div>
            `
              : ""
          }
        </div>

        <!-- 4 Option Choices -->
        <div class="options-grid" id="optionsGrid">
          ${shuffledOptions
            .map(
              (opt, idx) => `
            <button class="option-btn" data-option="${opt}">
              <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
              <span>${opt}</span>
            </button>
          `
            )
            .join("")}
        </div>

        <!-- Bottom Trivia / Next Scene Drawer placeholder -->
        <div id="triviaDrawerAnchor"></div>
      </div>
    `;

    this.bindQuestionActions(q);

    // If blind mode, play voice automatically to tease!
    if (isBlind) {
      setTimeout(() => this.triggerVoiceSpeech(q), 300);
    }
  }

  getModeName() {
    switch (this.mode) {
      case "campaign": return "Box Office";
      case "rapid": return "Rapid Blitz";
      case "showdown": return "Showdown";
      case "blind": return "Blind Voice";
      default: return "Quiz";
    }
  }

  bindQuestionActions(q) {
    const btnSpeak = document.getElementById("btnSpeakQuote");
    btnSpeak?.addEventListener("click", () => {
      this.triggerVoiceSpeech(q);
    });

    const btnReveal = document.getElementById("btnRevealBlind");
    btnReveal?.addEventListener("click", () => {
      document.getElementById("quoteTextContainer")?.classList.add("revealed");
      btnReveal.disabled = true;
      btnReveal.textContent = "Revealed!";
    });

    // Lifeline: 50-50
    document.getElementById("btnLifelineCut")?.addEventListener("click", (e) => {
      if (!this.lifelines.cut || !this.canAnswer) return;
      this.lifelines.cut = false;
      e.currentTarget.disabled = true;
      sound.playSfx("comicSlide");

      // Eliminate 2 wrong choices
      const buttons = Array.from(document.querySelectorAll(".option-btn"));
      const wrongButtons = buttons.filter(b => b.dataset.option !== q.correctAnswer);
      wrongButtons.slice(0, 2).forEach(b => b.classList.add("eliminated"));
    });

    // Lifeline: Hint
    document.getElementById("btnLifelineHint")?.addEventListener("click", (e) => {
      if (!this.lifelines.hint || !this.canAnswer) return;
      this.lifelines.hint = false;
      e.currentTarget.disabled = true;
      sound.playSfx("dholakRoll");
      alert(`🎬 FILMI HINT:\n${q.hint}`);
    });

    // Lifeline: Skip / Retake
    document.getElementById("btnLifelineSkip")?.addEventListener("click", (e) => {
      if (!this.lifelines.skip || !this.canAnswer) return;
      this.lifelines.skip = false;
      e.currentTarget.disabled = true;
      sound.playSfx("brassFanfare");
      this.nextQuestion();
    });

    // Option clicks
    document.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (!this.canAnswer) return;
        const selected = e.currentTarget.dataset.option;
        this.handleAnswer(selected, q, e.currentTarget);
      });
    });
  }

  triggerVoiceSpeech(q) {
    const btn = document.getElementById("btnSpeakQuote");
    const txt = document.getElementById("speakText");
    if (btn) btn.classList.add("speaking");
    if (txt) txt.textContent = "Speaking...";

    sound.speakDialogue(
      q,
      () => {
        if (btn) btn.classList.add("speaking");
      },
      () => {
        if (btn) btn.classList.remove("speaking");
        if (txt) txt.textContent = "Listen Dramatic Voice";
      }
    );
  }

  // ==========================================================================
  // ANSWER PROCESSING & FEEDBACK
  // ==========================================================================
  handleAnswer(selected, q, btnElement) {
    this.canAnswer = false;
    sound.stopSpeech();
    const isCorrect = selected === q.correctAnswer;

    // Reveal blind text
    document.getElementById("quoteTextContainer")?.classList.add("revealed");

    if (isCorrect) {
      btnElement.classList.add("correct");
      this.correctCount++;
      this.seetiStreak++;
      if (this.seetiStreak > this.maxStreak) {
        this.maxStreak = this.seetiStreak;
      }

      // Calculate Box Office earnings
      const multiplier = Math.min(this.seetiStreak, 5);
      const earned = (10 + (multiplier - 1) * 8.5);
      this.boxOfficeCrores += earned;

      // Hero / Villain faction score
      if (q.role === "Villain") this.villainScore += earned;
      else this.heroScore += earned;

      // Play Whistle or Hero Brass based on streak
      if (this.seetiStreak >= 3) {
        sound.playSfx("seeti");
        this.launchConfetti(40);
      } else {
        sound.playSfx("correct");
      }
      sound.playSfx("chaChing");

    } else {
      btnElement.classList.add("wrong");
      this.seetiStreak = 0; // Reset streak

      // Highlight the correct answer
      document.querySelectorAll(".option-btn").forEach(b => {
        if (b.dataset.option === q.correctAnswer) {
          b.classList.add("correct");
        }
      });

      if (q.role === "Villain") {
        sound.playSfx("evilLaugh");
      } else {
        sound.playSfx("wrong");
      }
    }

    // Update HUD
    const hudBox = document.querySelector(".hud-boxoffice");
    if (hudBox) hudBox.textContent = `₹ ${this.boxOfficeCrores.toFixed(1)} Cr`;

    // Render Trivia Drawer
    this.renderTriviaDrawer(q, isCorrect);
  }

  renderTriviaDrawer(q, isCorrect) {
    const anchor = document.getElementById("triviaDrawerAnchor");
    if (!anchor) return;

    anchor.innerHTML = `
      <div class="trivia-drawer">
        <div class="trivia-meta">
          <div>
            <span class="trivia-actor">${q.character}</span> 
            <span style="color: #94a3b8;">(${q.actor})</span>
          </div>
          <span class="trivia-movie">🎥 <strong>${q.movie}</strong> (${q.year})</span>
        </div>
        <div class="trivia-fact">
          <strong>🍿 Filmi Trivia:</strong> ${q.funFact}
        </div>
        <button class="btn-next-scene" id="btnNextScene">
          <span>${this.currentIndex + 1 >= this.questions.length ? "View Box Office Verdict 🏆" : "Agla Scene / Next Dialogue ▶"}</span>
        </button>
      </div>
    `;

    document.getElementById("btnNextScene")?.addEventListener("click", () => {
      sound.playSfx("click");
      this.nextQuestion();
    });

    // In Rapid mode, automatically jump to next after 1.8 seconds!
    if (this.mode === "rapid") {
      setTimeout(() => {
        if (this.timeLeft > 0) {
          this.nextQuestion();
        }
      }, 1400);
    }
  }

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.questions.length) {
      this.renderQuestion();
    } else {
      this.showGameOver("Completed!");
    }
  }

  // ==========================================================================
  // GAME OVER / CERTIFICATE SCREEN
  // ==========================================================================
  showGameOver(reason = "") {
    this.stopTimer();
    sound.stopSpeech();
    this.saveHighScore();

    // Box office verdict logic
    let verdict = "FLOP";
    let verdictClass = "";
    let playerTitle = "Junior Artist";
    let verdictColor = "#ef4444";

    if (this.boxOfficeCrores >= 500) {
      verdict = "ALL-TIME RECORD BREAKER";
      verdictClass = "blockbuster";
      playerTitle = "👑 Bollywood Shehenshah";
      verdictColor = "#fbbf24";
      sound.playSfx("brassFanfare");
      sound.playSfx("seeti");
      this.launchConfetti(100);
    } else if (this.boxOfficeCrores >= 250) {
      verdict = "SUPER HIT";
      verdictClass = "blockbuster";
      playerTitle = "🌟 Superstar";
      verdictColor = "#fbbf24";
      sound.playSfx("brassFanfare");
      this.launchConfetti(70);
    } else if (this.boxOfficeCrores >= 100) {
      verdict = "SEMI-HIT";
      verdictClass = "hit";
      playerTitle = "🎬 Dialogue King";
      verdictColor = "#22c55e";
      sound.playSfx("correct");
    } else {
      verdict = "DISASTER";
      verdictClass = "";
      playerTitle = "🍿 Samosa Seller";
      sound.playSfx("wrong");
    }

    const accuracy = this.questions.length > 0 
      ? Math.round((this.correctCount / Math.min(this.currentIndex + 1, this.questions.length)) * 100) 
      : 0;

    const modal = document.createElement("div");
    modal.className = "gameover-modal-backdrop";
    modal.innerHTML = `
      <div class="scorecard-poster">
        <div class="scorecard-header-lights"></div>

        <div class="verdict-stamp ${verdictClass}">${verdict}</div>
        <h2 class="player-title">${playerTitle}</h2>
        <p class="player-subtitle">${reason || "Box Office Run Completed"}</p>

        <div class="scorecard-stats-grid">
          <div class="scorecard-stat-box">
            <div class="val">₹ ${this.boxOfficeCrores.toFixed(1)} Cr</div>
            <div class="lbl">Total Earnings</div>
          </div>
          <div class="scorecard-stat-box">
            <div class="val">${accuracy}%</div>
            <div class="lbl">Accuracy</div>
          </div>
          <div class="scorecard-stat-box">
            <div class="val">${this.maxStreak}x</div>
            <div class="lbl">Max Seeti Streak</div>
          </div>
        </div>

        ${
          this.mode === "showdown"
            ? `
          <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; margin-bottom: 16px; font-size: 0.85rem;">
            <strong>Faction Battle:</strong> Hero: ₹${this.heroScore.toFixed(0)} Cr vs Villain: ₹${this.villainScore.toFixed(0)} Cr
          </div>`
            : ""
        }

        <div class="scorecard-actions">
          <button class="btn-share" id="btnCopyShareText">
            📋 Copy Filmi Scorecard
          </button>
          <button class="btn-play-again" id="btnRestartGame">
            🔄 Play Again / Lobby
          </button>
          <button class="btn-lifeline" id="btnGoToSoundboard" style="padding: 10px; justify-content: center;">
            📻 Open Bollywood Soundboard
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#btnRestartGame")?.addEventListener("click", () => {
      sound.playSfx("click");
      modal.remove();
      this.renderLobby();
    });

    modal.querySelector("#btnGoToSoundboard")?.addEventListener("click", () => {
      sound.playSfx("click");
      modal.remove();
      this.renderSoundboard();
    });

    modal.querySelector("#btnCopyShareText")?.addEventListener("click", (e) => {
      const shareText = `🎬 FILMI DIALOGUE DHAMAKA 🍿\nBox Office Verdict: ${verdict} (${playerTitle})\nTotal Collection: ₹${this.boxOfficeCrores.toFixed(1)} Cr!\nMax Seeti Whistle Streak: ${this.maxStreak}x | Accuracy: ${accuracy}%\nCan you beat my Bollywood knowledge? 🔥`;
      navigator.clipboard?.writeText(shareText);
      e.currentTarget.textContent = "✅ Copied to Clipboard!";
      sound.playSfx("chaChing");
    });
  }

  // ==========================================================================
  // BOLLYWOOD SOUNDBOARD & JUKEBOX VIEW
  // ==========================================================================
  renderSoundboard() {
    this.stopTimer();
    sound.stopSpeech();
    const stage = document.getElementById("mainStage");
    if (!stage) return;

    stage.innerHTML = `
      <div class="lobby-view">
        <div class="hero-billboard" style="padding: 24px 20px;">
          <span class="billboard-tag">📻 LIVE SOUNDBOARD & JUKEBOX</span>
          <h2 class="billboard-title" style="font-size: 2rem;">
            BOLLYWOOD <span class="accent-text">VOICE PUNCHLINES</span>
          </h2>
          <p class="billboard-subtitle" style="margin-bottom: 12px;">
            Tap any legend below to hear their signature voice line with dramatic audio effects and music!
          </p>
          <button class="btn-play-mode" id="btnBackToLobby" style="max-width: 200px; margin: 0 auto;">
            ◀ Back to Game Lobby
          </button>
        </div>

        <div class="soundboard-grid">
          ${SOUNDBOARD_PRESETS.map(preset => `
            <div class="soundboard-pad" data-id="${preset.id}">
              <div>
                <div class="pad-name">${preset.name}</div>
                <div class="pad-movie">🎥 ${preset.movie}</div>
              </div>
              <div>
                <div class="pad-punchline">"${preset.punchline}"</div>
                <div style="font-size: 0.7rem; color: #fbbf24; margin-top: 4px;">${preset.sub}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("btnBackToLobby")?.addEventListener("click", () => {
      sound.playSfx("click");
      this.renderLobby();
    });

    // Soundboard pads click handler
    stage.querySelectorAll(".soundboard-pad").forEach(pad => {
      pad.addEventListener("click", () => {
        const id = pad.dataset.id;
        const preset = SOUNDBOARD_PRESETS.find(p => p.id === id);
        if (!preset) return;

        // Play SFX
        if (preset.sfx) sound.playSfx(preset.sfx);

        // Find dialogue entry or construct speech
        const matchedDialogue = DIALOGUES.find(d => d.character.toLowerCase().includes(preset.name.toLowerCase().split(" ")[0])) || {
          quoteEn: preset.punchline,
          audioTone: { pitch: 0.8, rate: 0.85 }
        };

        pad.style.borderColor = "#fbbf24";
        pad.style.transform = "scale(0.96)";
        setTimeout(() => {
          pad.style.transform = "";
        }, 150);

        sound.speakDialogue(matchedDialogue);
      });
    });
  }

  // ==========================================================================
  // CANVAS CONFETTI FX
  // ==========================================================================
  launchConfetti(count = 50) {
    if (!this.ctx) return;
    const colors = ["#fbbf24", "#f59e0b", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        r: Math.random() * 6 + 4,
        d: Math.random() * count,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
        vy: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 4
      });
    }

    if (!this.animId) {
      this.renderConfetti();
    }
  }

  renderConfetti() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += p.vx;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      this.ctx.beginPath();
      this.ctx.lineWidth = p.r / 2;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      this.ctx.stroke();

      if (p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        i--;
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.renderConfetti());
    } else {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.filmiGame = new BollywoodDialogueGame();
});
