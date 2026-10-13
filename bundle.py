import os

with open('styles.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

with open('dialogueData.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

with open('audioEngine.js', 'r', encoding='utf-8') as f:
    audio_content = f.read()

with open('game.js', 'r', encoding='utf-8') as f:
    game_content = f.read()

# Strip export/import statements for a self-contained script
clean_data = data_content.replace('export const DIALOGUES =', 'const DIALOGUES =')
clean_data = clean_data.replace('export const SOUNDBOARD_PRESETS =', 'const SOUNDBOARD_PRESETS =')

clean_audio = audio_content.replace('export const sound = new BollywoodAudioEngine();', 'const sound = new BollywoodAudioEngine();')

clean_game = game_content.replace('import { DIALOGUES, SOUNDBOARD_PRESETS } from "./dialogueData.js";', '')
clean_game = clean_game.replace('import { sound } from "./audioEngine.js";', '')

combined_js = f"""
// === DIALOGUE DATA ===
{clean_data}

// === AUDIO ENGINE ===
{clean_audio}

// === GAME ENGINE ===
{clean_game}
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace <link rel="stylesheet" href="styles.css"> with <style>...</style>
html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css_content}\n</style>')

# Replace <script type="module" src="game.js"></script> with inline <script>
html = html.replace('<script type="module" src="game.js"></script>', f'<script>\n{combined_js}\n</script>')

target_artifact = r'C:\Users\nagra\.gemini\antigravity\brain\956e483e-347c-4c01-b1b9-b646cb18915b\filmi_dialogue_dhamaka.html'
with open(target_artifact, 'w', encoding='utf-8') as f:
    f.write(html)

# Also save standalone.html in project folder
with open('standalone.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Bundled standalone HTML successfully!")
print("Artifact size:", len(html), "bytes")
