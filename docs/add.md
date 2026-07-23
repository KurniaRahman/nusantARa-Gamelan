setelah berhasil menjalankan mediapipe dengan loading yang singkat lanjut ada beberapa revisi di bagian tampilan:
Halaman Beranda
Tombol 1 — "Sejarah Gamelan": Masuk ke mode belajar non-AR (tanpa kamera).
Tombol 2 — "Mulai Bermain" / "Ayo Coba!": Masuk ke mode AR utama (aktivasi kamera + scan kartu).
Kedua tombol ditampilkan berdampingan dengan maskot di tengah/bawah yang menyapa dan mengarahkan ("Mau belajar cerita dulu, atau langsung coba alat musiknya?").
Transisi antar layar menggunakan animasi slide/fade sederhana (CSS transition), bukan reload halaman penuh (Single Page Application berbasis show/hide section atau routing ringan tanpa framework berat).

4.2 Menu "Sejarah Gamelan" (Mode Belajar)
Halaman berisi konten edukasi ringan: asal-usul gamelan, jenis-jenis ansambel, dan fakta menarik untuk anak.
Format konten: kombinasi ilustrasi 2D statis + teks pendek per slide/kartu (carousel/swipe), bukan paragraf panjang.
Setiap slide dapat memiliki narasi audio (voice-over) opsional yang dapat diputar via tombol play, menggunakan Web Audio API/AudioBuffer yang sama seperti modul audio utama (bukan tag <audio>).
Tombol "Kembali" selalu tersedia untuk kembali ke Halaman Beranda.
Modul terpisah: sejarahGamelan.js — murni presentasi konten, tidak menyentuh logika kamera/MediaPipe/MindAR sama sekali (agar modul ini ringan dan tidak memicu permintaan izin kamera).


4.3 Menu Utama (Mode AR — Scan Kartu)
Saat dipilih, aplikasi meminta izin kamera, lalu menampilkan live camera feed dengan overlay bingkai pemandu ("Arahkan kamera ke kartu marker").
Menggunakan MindAR.js untuk mendeteksi kartu (marker image) yang discan.
Saat kartu terdeteksi, alat musik 2D (PNG/WebP) muncul overlay sesuai instrumentId yang terhubung ke marker tersebut (lihat struktur data di Bagian 7).
Setelah instrumen 2D muncul, aktifkan pelacakan tangan (MediaPipe di Web Worker) untuk hit-testing nada, sesuai alur inti di Bagian 6.
Tombol "Kembali ke Beranda" dan "Ganti Kartu" tetap terlihat kecil di pojok layar selama sesi AR berlangsung.
Modul terpisah: navigasiUtama.js — mengatur perpindahan antar Beranda ↔ Sejarah ↔ Mode AR, memastikan kamera/MediaPipe hanya diaktifkan saat masuk Mode AR dan dimatikan (stop stream + terminate worker) saat keluar, untuk hemat baterai/performa.

7. Hit-Testing Logic (2D)
The system extracts INDEX_FINGER_TIP (Landmark 8) from MediaPipe.
Normalize the X and Y coordinates to the HTML5 Canvas dimensions.
Apply Exponential Moving Average (EMA) to smooth out hand jitter.
Collision Detection: Check if the smoothed (X, Y) coordinate falls within the predefined bounding box (hitbox) of a specific instrument note. Hitbox diperbesar (lihat 4.5) agar ramah untuk gerak motorik anak.
Debouncing: Implement a 200ms cooldown per note to prevent rapid, unintended trigger spam.
Visual Feedback Trigger: Setiap collision terdeteksi, picu efek glow/riak (4.4) dan cek progres badge/kuis secara bersamaan.

revisi dari file @contextScopeItemMention

untuk menambahkan fitur sejarah dibagian menu utama terlebih dahulu. sesuaikan file panduan agar rapi