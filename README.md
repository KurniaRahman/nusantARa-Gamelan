# Gamelan AR Web

Aplikasi web interaktif berbasis edukasi untuk mengenalkan instrumen musik tradisional Gamelan Jawa kepada anak-anak. Aplikasi ini menggunakan teknologi canggih *Augmented Reality* (AR) dan *Artificial Intelligence* (AI) yang berjalan sepenuhnya di sisi klien (Browser) tanpa memerlukan instalasi aplikasi tambahan atau backend server yang berat.

## Fitur Utama

- **Kamera Interaktif (AR & Hand Tracking):** Gunakan kamera laptop atau tablet untuk mendeteksi kartu fisik (marker) alat musik. Setelah terdeteksi, alat musik akan muncul di layar.
- **Multisentuh & Deteksi Pukulan:** Arahkan jari Anda ke kamera. Aplikasi ini mampu melacak 2 tangan sekaligus dan mendeteksi gerakan "memukul" (ayunan ke bawah lalu ke atas) untuk membunyikan nada.
- **Audio Tanpa Jeda (Zero Latency):** Semua nada dirender menggunakan *Web Audio API* untuk memastikan tidak ada jeda antara gerakan tangan dengan suara yang keluar.
- **Dua Laras (Slendro & Pelog):** Mendukung pergantian laras pada setiap alat musik gamelan.
- **Mode Manual (Buku Panduan):** Menyediakan mode ensiklopedia interaktif bagi pengguna yang tidak ingin atau tidak bisa menggunakan kamera.
- **UI Ramah Anak:** Dirancang dengan antarmuka yang ceria, penuh warna, dan mudah dipahami.
- **Visual Hitbox Mapper:** Dilengkapi dengan alat administratif (`tools/mapper.html`) untuk memetakan koordinat nada secara visual via antarmuka *drag & drop*.

## Persyaratan Sistem

Karena aplikasi ini melakukan inferensi AI (*Machine Learning*) untuk pelacakan tangan langsung di browser, disarankan untuk membukanya melalui perangkat dengan spesifikasi berikut:
- **Browser:** Google Chrome, Microsoft Edge, atau Safari versi terbaru.
- **Kamera:** Webcam terintegrasi atau eksternal yang berfungsi dengan baik.
- **Perangkat Keras:** Laptop atau komputer desktop modern (Tablet kelas menengah ke atas juga didukung).
- **Koneksi:** Dibutuhkan pada saat pertama kali memuat model AI (MediaPipe), setelah itu dapat di-*cache*.

## Cara Menjalankan Secara Lokal (Development)

Proyek ini sepenuhnya berbasis *frontend* statis (HTML, CSS, Vanilla JS), sehingga sangat mudah di-hosting.
Namun, karena kebijakan keamanan browser mengenai akses kamera (`getUserMedia`) dan Web Worker, **Anda wajib menjalankannya melalui HTTP Server**, bukan sekadar mengklik ganda file HTML (`file:///`).

1. Buka folder proyek ini di terminal atau kode editor (misal: VS Code).
2. Gunakan salah satu metode *local server* berikut:
   - **VS Code Live Server Extension:** Klik kanan `index.html` dan pilih "Open with Live Server".
   - **Node.js (http-server):** Jalankan perintah `npx http-server . -p 5500` di terminal.
   - **Python:** Jalankan perintah `python -m http.server 5500` di terminal.
3. Akses `http://localhost:5500` di browser Anda.

## Cara Hosting (Deployment)

Proyek ini sangat ringan dan dioptimalkan untuk di-hosting pada layanan web statis modern. Anda bisa men-deploy proyek ini ke berbagai platform populer secara gratis seperti:

- **Vercel:** Tarik folder proyek ke antarmuka Vercel atau gunakan Vercel CLI.
- **Netlify:** *Drag & drop* folder proyek ke Netlify Drop.
- **GitHub Pages:** Dorong kode ini ke repositori GitHub dan aktifkan GitHub Pages dari branch utama.
- **Firebase Hosting:** Inisialisasi Firebase dan jalankan `firebase deploy`.

*Catatan: Pastikan server atau layanan hosting Anda sudah dilengkapi dengan sertifikat SSL (HTTPS). Akses kamera web di sebagian besar browser menolak berfungsi jika website di-hosting tanpa HTTPS (kecuali `localhost`).*

## Arsitektur Teknis

Sistem ini didesain secara modular menggunakan *Vanilla JavaScript* agar memiliki beban awal (*bundle size*) yang ringan:
- **MindAR (A-Frame / Three.js):** Digunakan untuk deteksi *marker* (kartu instrumen).
- **MediaPipe Hands:** Berjalan di dalam *Web Worker* terpisah (`js/pekerjaMediaPipe.js`) untuk memastikan pelacakan jari tidak membebani animasi kanvas utama.
- **Tailwind CSS:** Digunakan secara penuh untuk *styling* kerangka UI.

Untuk pemahaman lebih mendalam mengenai struktur kode dan aliran datanya, silakan membaca dokumen [ARSITEKTUR.md](ARSITEKTUR.md).

## Manajemen Konten & Hitbox (Hitbox Mapper)

Jika Anda ingin mengubah posisi area sentuh nada atau menambahkan instrumen baru:
1. Jalankan proyek menggunakan *local server*.
2. Akses `http://localhost:5500/tools/mapper.html`.
3. Pilih instrumen dan laras.
4. Geser dan atur ukuran kotak-kotak biru (*hitboxes*).
5. Klik "Download JSON" dan timpa file lama di `data/instrumen.json`.
