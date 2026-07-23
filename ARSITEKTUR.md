# Arsitektur Sistem: Gamelan AR Web

Dokumen ini menjelaskan struktur arsitektur teknis dari proyek **Gamelan AR Web**, sebuah aplikasi interaktif berbasis web untuk mengenalkan instrumen gamelan melalui teknologi *Augmented Reality* (AR).

---

## 1. Tinjauan Sistem (System Overview)

Aplikasi ini menggunakan perpaduan dari dua mesin kecerdasan buatan (AI) yang berjalan sepenuhnya di sisi klien (di dalam browser):
1. **MindAR (Image Tracking):** Digunakan untuk mengenali pola kartu fisik (*marker*) melalui kamera dan menentukan instrumen mana yang dipilih.
2. **MediaPipe Hands (Hand Tracking):** Digunakan untuk melacak pergerakan dan sendi jari tangan pengguna, khususnya ujung jari telunjuk (titik `8`), secara *real-time*.

Keduanya digabungkan menggunakan **HTML5 Canvas 2D** yang bertindak sebagai antarmuka interaktif (*hit-testing*). Alih-alih memproyeksikan objek 3D penuh, sistem menggambar aset instrumen 2D di atas kanvas dan mendeteksi benturan antara titik koordinat telunjuk dan zona nada (*hitbox*) dari gambar instrumen.

---

## 2. Struktur Direktori Proyek

```
web_gamelan/
│
├── index.html            # Titik masuk utama aplikasi (UI Utama & Kamera)
├── style.css             # Gaya antarmuka kustom Tailwind-like
│
├── js/                   # Direktori kode sumber utama
│   ├── app.js            # Orkestrator utama (Render Loop & Hubungan State)
│   ├── mesinMindAR.js    # Pengelola logika kamera dan pelacakan gambar
│   ├── pelacakTangan.js  # Jembatan komunikasi ke Web Worker MediaPipe
│   ├── pekerjaMediaPipe.js # Web Worker yang menjalankan model AI MediaPipe (Off-thread)
│   ├── mesinAudio.js     # Pengelola Web Audio API (Zero-latency playback)
│   ├── logikaHitbox.js   # Algoritma tabrakan, matematika gesture pukul (strike), dan EMA
│   ├── navigasiUtama.js  # Logika pergantian mode UI (Beranda, Manual, Kamera)
│   └── mapper.js         # Logika terpisah untuk tool Hitbox Mapper
│
├── data/
│   └── instrumen.json    # Database utama instrumen (path gambar, audio, koordinat hitbox)
│
├── aset/
│   ├── audio/            # File suara nada gamelan mentah (.WAV)
│   ├── gambar/           # Aset gambar 2D instrumen dan ikon UI
│   ├── marker/           # Target gambar MindAR (.mind dan .png aslinya)
│   └── mediapipe/        # File WASM dan Model (.task) untuk pelacakan offline
│
├── tools/                # Alat untuk pengembangan/debugging
│   ├── mapper.html       # Antarmuka Visual Hitbox Mapper
│   └── compile-marker.html # Compiler target MindAR offline
│
└── docs/                 # Dokumentasi panduan sebelumnya
```

---

## 3. Aliran Data dan Komponen Utama

### A. Pengambilan Video (Video Capture)
- Aplikasi meminta izin akses kamera melalui `navigator.mediaDevices.getUserMedia`.
- Aliran video (*stream*) dimasukkan ke dalam elemen `<video id="videoKamera">`.

### B. Proses Pelacakan Gambar (MindAR)
- File `mesinMindAR.js` terus memindai frame video.
- Jika kartu target ditemukan, sistem mencocokkan indeksnya dengan `markerIndex` pada `instrumen.json` dan memicu transisi state ke "Instrumen Ditemukan".

### C. Proses Pelacakan Tangan (MediaPipe di Web Worker)
- Untuk mencegah halaman menjadi *lagging*, pelacakan tangan dipindah ke *thread* terpisah menggunakan Web Worker (`pekerjaMediaPipe.js`).
- Frame video dipotong menjadi `ImageBitmap` (di `pelacakTangan.js`) dan dikirim ke worker.
- Worker mengembalikan matriks titik sendi (*landmarks*), termasuk ujung telunjuk.

### D. Interaksi & Matematika Pukulan (logikaHitbox.js)
Sistem menggunakan deteksi tabrakan koordinat.
- Koordinat telunjuk dihaluskan (*smoothed*) menggunakan teknik **EMA (Exponential Moving Average)** untuk mengurangi efek tangan bergetar (*jitter*).
- Jari harus berada di dalam batas absolut *hitbox* instrumen (`xMin` - `xMax`, `yMin` - `yMax`).
- **Strike Gesture Detection:** Sistem mencatat posisi vertikal jari dari waktu ke waktu (`lastY`). Pukulan dianggap sah (terjadi *trigger*) HANYA JIKA ada pergerakan cepat ke arah bawah (`dy > 3`), diikuti dengan pergerakan cepat ke atas (`dy < -3`). Hal ini mensimulasikan ayunan *tabuh* gamelan.
- State dilacak secara independen per tangan (mendukung multisentuh / *multi-hands*).

### E. Audio (mesinAudio.js)
- Agar tidak terjadi jeda saat dipukul (*zero latency*), aplikasi menggunakan **Web Audio API**.
- Saat instrumen dipilih, seluruh file audio miliknya diunduh secara diam-diam (Pre-loaded) dan disimpan ke dalam cache memori (`AudioBuffer`).
- Saat tabrakan terjadi, buffer ini dialirkan ke `AudioContext.createBufferSource()` yang langsung berbunyi dalam hitungan milidetik.

### F. Rendering (app.js)
- `jalankanRenderLoop()` adalah fungsi yang dipanggil 60 kali per detik oleh browser (`requestAnimationFrame`).
- Ia menggambar gambar 2D instrumen dan garis-garis pelacak tangan ke kanvas layar (`canvasUI`).
- Ia juga bertanggung jawab menggambar animasi riak air (*ripple effect*) pada koordinat pukulan.
