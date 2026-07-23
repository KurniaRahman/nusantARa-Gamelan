# **SYSTEM INSTRUCTIONS FOR AI IDE (ANTIGRAVITY / CURSOR)**

**Project:** NusantARa (Web-AR Edukasi Gamelan)

**Target Platform:** GitHub Pages (Static Web Hosting, HTTPS required)

## **1. Core Directives (CRITICAL - DO NOT IGNORE)**

* **NO 3D RENDERING:** Do NOT use Three.js, Babylon.js, or A-Frame. The project strictly uses **2D images (PNG/WebP)** for AR overlays to maximize performance.
* **NO HEAVY AI FOR MARKERS:** Do NOT use YOLO, TensorFlow.js Object Detection, or any CNN for marker tracking. Strictly use **MindAR.js** for feature-based image tracking.
* **WEB WORKER MANDATORY:** MediaPipe Hands MUST be executed inside a Web Worker. Never run MediaPipe inference on the main UI thread to prevent freezing.
* **ZERO-LATENCY AUDIO:** Strictly use AudioContext (Web Audio API). Audio files must be pre-loaded into memory buffers during initialization. Do NOT use the standard HTML `<audio>` tag for playing instruments.

## **2. Tech Stack**

* **Marker Tracking:** MindAR.js (image-tracking mode, .mind compiled files).
* **Hand Tracking:** MediaPipe Hands (JavaScript API via CDN/local, running in Web Worker).
* **Audio Engine:** Web Audio API (AudioBuffer, AudioBufferSourceNode).
* **UI/Rendering:** HTML5 Canvas API (for hit-testing/drawing cursors) and CSS3 (for overlays).

## **3. Coding Standards & Conventions**

* **Language:** Use Indonesian for all custom variable and function names (e.g., posisiJariTelunjuk, muatAudio, deteksiTabrakan). Keep standard API terms in English (e.g., canvas, context, worker).
* **Style:** camelCase for variables/functions, PascalCase for Classes/Constructors.
* **Modularity:** Split logic into separate ES6 modules (e.g., mesinAudio.js, pelacakTangan.js, logikaHitbox.js, navigasiUtama.js, sejarahGamelan.js). Do NOT write all JavaScript inside index.html.
* **KISS Principle:** Avoid over-engineering. Use pure functions where possible.

## **4. Asset Specifications & Limitations**

* **Total App Size:** Must stay under 10 MB.
* **Marker Files:** .mind format, < 200 KB.
* **2D Instruments:** .png with transparent background, max 1024x1024 px, < 300 KB per file.
* **Audio Files:** .mp3 or .ogg, strictly NO leading silence (waveform must start at 0ms), < 80 KB per note, duration 3-5 seconds.

## **5. UI & Navigation Architecture (SPA)**

* **Halaman Beranda (Home Page):**
  * Displays two main buttons side-by-side: "Sejarah Gamelan" and "Mulai Bermain".
  * Features a mascot in the center/bottom guiding the user.
  * Uses simple slide/fade CSS transitions for switching screens (Single Page Application approach without heavy frameworks).
* **Menu "Sejarah Gamelan" (Mode Belajar):**
  * Lightweight educational content explaining the history and function of each instrument.
  * Format: Grid of 2D instrument cards (utilizing the AR marker images from `/aset/marker/`).
  * Clicking a card opens a modal popup containing the detailed history (Origin, Function, How to Play).
  * Optional voice-over narration triggered via play button, using the same Web Audio API as instruments.
  * Handled by `sejarahGamelan.js` - strictly isolated from camera/MediaPipe to save resources.
* **Menu Utama (Mode AR - Mulai Bermain):**
  * Requests camera permission and displays the live feed with a marker guide overlay.
  * Uses MindAR for marker tracking and MediaPipe (Web Worker) for hand tracking.
  * **Alur Pemindaian Marker (Laras Selection):** 
    * When a physical card (marker) is detected, the system checks if the instrument has multiple scales/tuning (*Laras Slendro* and *Laras Pelog*).
    * If it has multiple scales, a UI Modal (Popup) appears asking the user to choose "Slendro" or "Pelog". The AR tracking pauses rendering the instrument until a choice is made.
    * Once selected (or immediately if only one scale exists), the specific 2D image and hitbox data for that scale are projected onto the canvas.
  * Handled by `navigasiUtama.js` and `arEngine.js` - ensures the camera stream and MediaPipe worker are ONLY active in this mode. When exiting (e.g., back to Home), the stream and worker must be terminated to conserve battery/performance.
  * Always displays "Kembali ke Beranda" and "Ganti Kartu" buttons during the AR session.

## **6. Hit-Testing Logic (2D)**

* The system extracts INDEX_FINGER_TIP (Landmark 8) from MediaPipe.
* Normalize the X and Y coordinates to the HTML5 Canvas dimensions.
* Apply Exponential Moving Average (EMA) to smooth out hand jitter.
* **Collision Detection:** Check if the smoothed (X, Y) coordinate falls within the predefined bounding box (hitbox) of a specific instrument note. Hitboxes must be enlarged to be child-friendly (accommodate motoric skills).
* **Debouncing:** Implement a 200ms cooldown per note to prevent rapid, unintended trigger spam.
* **Visual Feedback:** Each detected collision must trigger a visual effect (e.g., glow/ripple) alongside checking badge/quiz progress.

## **7. Data Structure (Hitbox JSON)**

All instrument definitions and hitboxes must be externalized in a JSON/Object format. It must support multiple scales (Laras) such as Slendro and Pelog, mapping percentage-based coordinates to the respective 2D image for each scale.

Example:

```json
{
  "id": "saron",
  "nama": "Saron",
  "markerIndex": 0,
  "laras": {
    "slendro": {
      "imageSrc": "./aset/gambar/instrumen/saron_slendro.png",
      "audioPath": "./aset/suara/saron/slendro/",
      "notes": [
        { "id": "nada_1", "file": "nada1.mp3", "hitbox": { "xMin": 0.10, "xMax": 0.20, "yMin": 0.40, "yMax": 0.60 } },
        { "id": "nada_2", "file": "nada2.mp3", "hitbox": { "xMin": 0.25, "xMax": 0.35, "yMin": 0.40, "yMax": 0.60 } }
      ]
    },
    "pelog": {
      "imageSrc": "./aset/gambar/instrumen/saron_pelog.png",
      "audioPath": "./aset/suara/saron/pelog/",
      "notes": [
        { "id": "nada_1", "file": "nada1.mp3", "hitbox": { "xMin": 0.08, "xMax": 0.18, "yMin": 0.40, "yMax": 0.60 } }
      ]
    }
  }
}
```

## **8. Execution Steps for AI**

When prompted to build, follow this sequence:

1. Scaffold the project directory and UI skeleton (index.html, style.css).
2. Implement `navigasiUtama.js` for SPA routing (Beranda <-> Sejarah <-> AR) with slide/fade transitions.
3. Build the "Sejarah Gamelan" carousel module (`sejarahGamelan.js`).
4. Implement the MindAR setup and camera feed management for AR Mode.
5. Implement the Web Audio API module (`mesinAudio.js`).
6. Implement the MediaPipe Web Worker module (`pekerjaMediaPipe.js`).
7. Implement the collision logic (`logikaHitbox.js`) bridging the Worker, UI, and Audio with EMA and visual feedback.