# 🎬 Filmi Dialogue Dhamaka: The Ultimate Bollywood Dialogue Clash 🍿🔥

An addictive, theatrical Bollywood quiz and voice line guessing mini-game. Test your knowledge of legendary Hindi movie punchlines spanning 5 decades of Indian cinema — from Gabbar Singh to Pushpa Raj!

---

## 🌟 Game Highlights

- 🗣️ **Dramatic Voice Line Audio Engine**:
  - Uses the **Web Speech API** tuned with actor-specific pitch and cadence (deep gravelly baritone for Amitabh, sinister boom for Mogambo, energetic swagger for SRK, aggressive roar for Sunny Deol).
  - Integrated **Animated Soundwave Visualizer** pulsing in real-time as the dialogue is delivered.
- 🥁 **Procedural Bollywood Background Music (Web Audio API)**:
  - **Masala Dholak Beat**: Upbeat, infectious dholak rhythm and brass groove.
  - **70s Retro Funk**: Groovy Salim-Javed style bassline and wah guitar stings.
  - **DDLJ Mandolin Theme**: Sweet acoustic romantic mandolin chords.
  - **Villain March**: Dark, suspenseful minor-key brass stabs.
  - Full BGM selector, mute toggle, and volume control.
- 🎺 **Authentic Cinema Sound Effects**:
  - Iconic **Audience "Seeti" (whistle)** on streaks!
  - Mogambo evil laugh synthesizer.
  - Hero entry brass stabs.
  - Cash register cha-ching for Box Office crores.
  - Confetti & popcorn particle bursts!
- 🎭 **4 Addictive Game Modes**:
  1. **Box Office Campaign**: 10 rounds across eras to climb from *Junior Artist* to *Bollywood Shehenshah* and enter the ₹500 Cr Club!
  2. **Rapid Fire 60s Blitz**: High-octane buzzer countdown mode with combo streak multipliers up to x5!
  3. **Hero vs. Villain Showdown**: Faction tug-of-war matching legendary heroes against terrifying villains.
  4. **Blind Voice Line Guess**: Text is veiled in secrecy — listen to the dramatic voice first to guess!
- 📻 **Live Bollywood Soundboard & Jukebox**:
  - Tap any card to hear instant punchlines from Gabbar, Mogambo, Sunny Deol, SRK, Baburao, Pushpa, Rocky Bhai, and Crime Master Gogo!
- ✂️ **Filmi Lifelines**:
  - **50:50 (Director's Cut)**: Eliminates 2 wrong options.
  - **Filmi Hint**: Reveals co-stars, release year, or director details.
  - **Retake / Skip**: Swap out a tough question without losing your combo streak.
- 🏆 **Box Office Verdict Certificate**:
  - Generates theatrical verdict stamps: *DISASTER*, *FLOP*, *SEMI-HIT*, *SUPER HIT*, or *ALL-TIME RECORD BREAKER*!
  - 1-click clipboard button to copy and share your filmi score with friends!

---

## 🚀 How to Run Locally

### Option 1: Live Local Server
The server is currently running on:
```bash
http://localhost:3000
```

To run manually at any time:
```bash
# Using Python
python -m http.server 3000

# OR using Node
npm start
```

### Option 2: Open Standalone HTML Directly
Double-click `standalone.html` in any browser — zero server or dependencies required!

---

## 📁 Project Structure

```
bollywood-dialogue-clash/
├── index.html           # Main theatrical app layout & marquee lights
├── styles.css           # Retro cinema aesthetic, neon glow, and animations
├── dialogueData.js      # Curated database of 50+ iconic Bollywood dialogues
├── audioEngine.js       # Web Audio API procedural BGM & sound effects + Speech Synthesis
├── game.js              # State machine, combo meter, lifelines, confetti FX
├── standalone.html      # Fully self-contained single-file version
├── package.json         # Run scripts
└── README.md            # Documentation & guide
```
