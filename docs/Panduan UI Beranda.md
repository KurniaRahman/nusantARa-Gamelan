# **SYSTEM INSTRUCTIONS FOR UI GENERATION (BERANDA)**

**Konteks Utama:** Dokumen ini KHUSUS mengatur tata letak (layout) dan gaya (styling) antarmuka pengguna (UI) untuk halaman Beranda (Welcome Screen). JANGAN menulis logika AR, Kamera, atau Audio di tahap ini. Fokus murni pada HTML dan CSS.

## **1\. Visi Desain & Estetika (Reference: image\_d5949c.jpg)**

* **Tema:** Edukatif, Ceria, Ramah Anak (Kid-friendly), Gamifikasi.  
* **Pendekatan Layout:** Responsif (Mobile dan Desktop). Jika dibuka di desktop, tampilan tidak boleh hanya *stuck* di tengah seperti emulator HP, melainkan tombol dan elemen harus beradaptasi secara proporsional.  
* **Tipografi:** Gunakan font yang membulat dan ramah seperti Nunito, Quicksand, atau Baloo 2 (Ambil dari Google Fonts).  
* **Bentuk Elemen:** Sudut sangat membulat (bubbly), gunakan border-radius yang besar (misal: rounded-2xl atau rounded-3xl di Tailwind).

## **2\. Palet Warna (Design Tokens)**

* **Latar Belakang (Background):** Gradasi halus dari biru langit terang ke hijau rumput pastel (bg-gradient-to-b from-sky-100 to-green-300).  
* **Warna Teks Utama:** Biru Navy pekat (text-slate-800) agar kontras dan mudah dibaca.  
* **Aksen Judul (NusantARa):** Kombinasi warna Biru dan Oranye/Kuning.  
* **Tombol Sejarah:** Kuning Pastel (bg-yellow-200 atau \#fef08a).  
* **Tombol Main:** Hijau Pastel (bg-green-300 atau \#86efac / \#bbf7d0).  
* **Elemen Putih:** Kotak dialog dan latar ikon menggunakan putih dengan sedikit transparansi atau bayangan lembut (bg-white shadow-soft).

## **3\. Struktur DOM HTML (Responsive Layout)**

Gunakan Flexbox atau CSS Grid. Halaman dibagi menjadi 4 seksi utama:

### **Seksi 1: Header (Logo & Slogan)**

* Posisikan di tengah atas.  
* Teks Judul "NusantARa" berukuran besar dan tebal (Bold).  
* Di bawahnya terdapat *badge/pill* melengkung (rounded-full) berwarna biru muda dengan teks putih berisi slogan: "Belajar Gamelan, Seru dan Interaktif\!".

### **Seksi 2: Hero & Karakter (Mascot)**

* Posisikan di tengah layar secara vertikal.  
* **Gambar Maskot:** Gunakan tag \<img\> untuk karakter anak. (Instruksikan AI untuk menggunakan *placeholder image* dari placehold.co dengan teks "Mascot").  
* **Balon Kata (Speech Bubble):** Elemen kotak putih, sudut membulat, berisi teks sambutan: "Hai teman\! Yuk, kita mengenal dan bermain gamelan bersama\!".

### **Seksi 3: Tombol Aksi Utama (Grid Layout)**

* **Responsivitas:** Pada layar *mobile*, tombol bertumpuk atas-bawah (1 kolom). Pada layar tablet/desktop (md ke atas), gunakan 2 kolom sejajar.  
* **Tombol Kiri (Sejarah Gamelan):**  
  * Warna latar kuning pastel.  
  * Teks tebal "Sejarah Gamelan".  
  * Teks kecil/deskripsi "Yuk, belajar tentang asal-usul gamelan\!".  
* **Tombol Kanan (Mulai Bermain):**  
  * Warna latar hijau pastel.  
  * Teks tebal "Mulai Bermain".  
  * Teks kecil/deskripsi "Ayo main gamelan dengan AR\!".  
* **IKON KUSTOM (WAJIB):** DILARANG KERAS menggunakan emoji. Hasilkan ikon murni menggunakan kode SVG *inline* (\<svg\>, \<path\>) untuk Buku (di tombol Sejarah) dan Play (di tombol Main). Ikon harus memiliki gaya membulat (stroke-linecap="round", stroke-linejoin="round") agar terlihat natural.

### **Seksi 4: Footer (Utility Buttons)**

* Posisi di sudut bawah layar (Flexbox Space-Between).  
* **Kiri:** Tombol bulat kecil warna putih.  
* **Kanan:** Tombol bulat kecil warna putih.  
* **IKON KUSTOM (WAJIB):** Sekali lagi, dilarang menggunakan emoji. Buatkan ikon SVG *inline* berbentuk Pengaturan (Gear) untuk tombol kiri, dan ikon Not Balok Musik untuk tombol kanan.

## **4\. Instruksi Eksekusi untuk AI (Antigravity/Cursor)**

1. Buat file index.html.  
2. Pasang CDN Tailwind CSS di tag \<head\>.  
3. Pasang Google Fonts (Quicksand/Nunito).  
4. Susun struktur HTML sesuai dengan 4 Seksi di atas.  
5. Pastikan semua layout responsif (flex-col md:flex-row, dll).  
6. Hasilkan 4 ikon custom menggunakan kode SVG *inline* secara mandiri (Buku, Play, Pengaturan, Musik).