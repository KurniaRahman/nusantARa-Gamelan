# **SYSTEM INSTRUCTIONS FOR UI GENERATION (HALAMAN KAMERA AR)**

**Konteks Utama:** Dokumen ini KHUSUS mengatur tata letak (layout) dan gaya (styling) antarmuka pengguna (UI) untuk halaman "Kamera AR" (Pemindaian & Bermain). JANGAN menulis logika MindAR, Web Audio, atau MediaPipe. Fokus murni pada HTML, Tailwind CSS, dan struktur visual *overlay* di atas elemen video.

## **1\. Visi Desain & Estetika**

* **Tema:** Imersif, Bersih, Futuristik namun tetap ramah (*Glassmorphism*).  
* **Tipografi:** Google Fonts (Nunito atau Quicksand).  
* **Pendekatan Layout:** Layar Penuh (*Full-Screen* h-screen w-screen), posisi absolut (absolute atau fixed), dan *Z-index* yang berlapis. Teks dan tombol harus kontras agar terlihat jelas di atas latar belakang tangkapan kamera dunia nyata yang dinamis.

## **2\. Struktur DOM HTML (Layering System)**

Halaman ini harus dibagi menjadi 3 lapisan utama (menggunakan penumpukan z-index):

### **Lapisan 1: Latar Belakang (Simulasi Kamera)**

* Elemen \<video\> atau \<div\> (z-index terendah) yang memenuhi seluruh layar (inset-0, w-full, h-full, object-cover).  
* Beri warna latar belakang hitam (bg-black) atau *placeholder* gambar gelap sebagai simulasi tangkapan kamera webcam.

### **Lapisan 2: Area Proyeksi AR (Canvas)**

* Elemen pembungkus untuk memproyeksikan instrumen 2D dan kursor MediaPipe nantinya.  
* Posisikan di tengah layar dengan ukuran penuh (absolute inset-0).

### **Lapisan 3: UI Overlay (Antarmuka Pengguna)**

Ini adalah lapisan interaktif (z-index tertinggi). Terdiri dari:

**A. Header Atas (Flexbox, Space-Between):**

* **Tombol Kembali (Kiri):** Tombol bulat bergaya *Glassmorphism* (bg-white/30 backdrop-blur-md border border-white/50 text-white). Wajib menggunakan ikon SVG *inline* "Panah Kiri" kustom (tebal, sudut membulat).  
* **Status HUD / Head-Up Display (Kanan):** Sebuah *pill* (kapsul rounded-full) *Glassmorphism* yang memuat 3 titik indikator kecil.  
  * Titik 1: Ikon Kamera (Warna Hijau bg-green-400 menandakan aktif).  
  * Titik 2: Ikon Target/Marker (Warna Kuning bg-yellow-400 menandakan sedang mencari).  
  * Titik 3: Ikon Tangan (Warna Abu-abu bg-gray-400 menandakan standby).  
  * *Gunakan SVG inline untuk ikon di dalam HUD.*

**B. Pemandu Pemindaian / Scanning Guide (Tengah Layar):**

* Bingkai kotak putus-putus (border-dashed border-2 border-white/70) atau desain sudut *bracket* di tengah layar sebagai panduan bagi pengguna untuk meletakkan kartu fisik.  
* Tambahkan efek animasi *pulse* berkedip pelan (menggunakan kelas animate-pulse dari Tailwind).

**C. Panel Info Bawah (Bottom Center):**

* Sebuah panel mengambang di tengah bawah layar (sekitar bottom-8), bergaya *Glassmorphism* tebal (bg-slate-900/60 backdrop-blur-md text-white).  
* Bentuk membulat (rounded-2xl, px-6 py-3).  
* Berisi teks status: "Arahkan kartu ke kamera..." (Animasi titik-titik ... bisa pakai CSS sederhana).  
* Desain panel ini harus fleksibel agar nanti bisa diganti teksnya menjadi "Memainkan: Saron Barung" saat kartu terdeteksi.

## **3\. Instruksi Eksekusi untuk AI (Antigravity/Cursor)**

1. Buat file ar.html.  
2. Pasang CDN Tailwind CSS.  
3. Buat struktur 3 lapisan (Kamera, AR Canvas, UI Overlay) menggunakan absolute dan z-index.  
4. Hasilkan IKON KUSTOM menggunakan kode SVG *inline* secara mandiri (Kembali, Kamera, Target/Marker, Tangan). DILARANG pakai emoji.  
5. Gunakan kelas warna tembus pandang Tailwind (seperti bg-white/20, backdrop-blur-md) untuk membuat efek *Glassmorphism* pada tombol dan panel informasi.  
6. Buat animasi denyut (*pulse*) pada kotak pemandu pemindaian di tengah layar agar terasa interaktif.

