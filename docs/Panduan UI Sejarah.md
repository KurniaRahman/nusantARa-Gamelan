# **SYSTEM INSTRUCTIONS FOR UI GENERATION (MENU SEJARAH)**

**Konteks Utama:** Dokumen ini KHUSUS mengatur tata letak (layout) dan gaya (styling) antarmuka pengguna (UI) untuk halaman "Sejarah Gamelan" (History Catalog). JANGAN menulis logika routing SPA yang kompleks (seperti React-Router) atau backend. Fokus murni pada HTML, Tailwind CSS, dan sedikit Vanilla JS untuk membuka/tutup Modal.

## **1\. Visi Desain & Estetika (Konsistensi dengan Beranda)**

* **Tema:** Edukatif, Ceria, Ramah Anak, Rapi.  
* **Tipografi:** Gunakan Google Fonts (Nunito, Quicksand, atau Baloo 2).  
* **Bentuk Elemen:** Sudut membulat (*bubbly*), gunakan rounded-2xl atau rounded-3xl.  
* **Pendekatan Layout:** Responsif murni. Desain harus nyaman dibaca di *mobile* (1 kolom) dan meregang secara proporsional di desktop/tablet (Grid multi-kolom).

## **2\. Palet Warna (Design Tokens)**

* **Latar Belakang Utama:** Latar belakang bersih dan terang. Gunakan warna krem pastel (bg-orange-50 atau \#fffbeb) atau gradasi sangat halus agar teks panjang mudah dibaca.  
* **Kartu Instrumen (Card):** Putih murni (bg-white) dengan bayangan sangat lembut (shadow-md atau shadow-soft).  
* **Aksen Tombol Utama:** Biru Laut Pastel (bg-sky-400 atau \#38bdf8) untuk tombol aksi "Baca Selengkapnya".  
* **Teks:** Biru Navy pekat (text-slate-800) untuk kontras optimal.

## **3\. Struktur DOM HTML (Responsive Layout)**

Halaman dibagi menjadi 3 komponen utama:

### **Komponen 1: Header (Navigasi)**

* Posisi *sticky* di bagian atas.  
* **Tombol Kembali (Back):** Di sebelah kiri. Tombol bulat putih bersudut. WAJIB menggunakan ikon SVG *inline* kustom berbentuk "Panah ke Kiri" (Arrow Left).  
* **Judul Halaman:** Teks di tengah (Center) bertuliskan "Mengenal Gamelan" dengan gaya *Bold*.

### **Komponen 2: Hero Section Singkat**

* Teks pengantar yang ramah di bawah header: "Yuk, pelajari asal-usul, fungsi, dan keunikan alat musik tradisional gamelan\!".

### **Komponen 3: Grid Kartu Instrumen (Katalog)**

* **Layout:** Gunakan CSS Grid (grid cols-1 untuk mobile, md:grid-cols-2 lg:grid-cols-3 untuk tablet/desktop) dengan jarak (gap) yang seragam.  
* **Konten Kartu (Buatkan 3 kartu sebagai contoh: Saron, Bonang, Gong):**  
  * **Gambar Utama:** Area gambar di bagian atas kartu. Gunakan *placeholder* dari placehold.co dengan rasio yang konsisten (misal: rasio 4:3). Beri border-radius hanya di sudut atas gambar.  
  * **Area Teks (Padding dalam):** Judul instrumen (misal: "Saron Barung") dan paragraf deskripsi sangat singkat (1-2 baris teks).  
  * **Tombol Aksi:** Tombol selebar kartu (full-width) di bagian bawah kartu bertuliskan "Baca Sejarah" dengan warna biru pastel.

### **Komponen 4: Modal Detail Sejarah (Glassmorphism Pop-up)**

* **Status Awal:** Sembunyikan secara default (hidden).  
* **Overlay Background:** Latar belakang hitam transparan dengan efek buram tebal (Glassmorphism: bg-black/40 backdrop-blur-sm).  
* **Kontainer Modal:** Kotak putih di tengah layar (rounded-3xl, maksimal lebar max-w-2xl), posisi vertikal & horizontal *center*. Maksimal tinggi 80% dari layar dan area konten di dalamnya dapat di-*scroll* (overflow-y-auto).  
* **Header Modal:** Teks Judul (misal: "Sejarah Saron") dan tombol silang (X) di pojok kanan atas. WAJIB gunakan SVG *inline* untuk ikon X (Close).  
* **Konten Modal:** Berisi teks *placeholder* berparagraf untuk mempresentasikan 3 poin dari PRD: "Asal-Usul", "Fungsi Sosial", dan "Cara Memainkan".

## **4\. Instruksi Eksekusi untuk AI (Antigravity/Cursor)**

1. Buat file sejarah.html.  
2. Pasang CDN Tailwind CSS dan Google Fonts.  
3. Hasilkan IKON KUSTOM menggunakan kode SVG *inline* secara mandiri (DILARANG pakai emoji). Ikon yang dibutuhkan: Panah Kiri (Back) dan Silang (Close Modal). Pastikan stroke-linecap="round".  
4. Buat struktur Grid yang responsif untuk kartu-kartu instrumen.  
5. Buat struktur HTML untuk Modal Glassmorphism.  
6. Tambahkan skrip Vanilla JS super singkat di bagian bawah file untuk melakukan simulasi: saat tombol "Baca Sejarah" di klik, hapus class hidden dari Modal. Saat ikon X diklik, tambahkan kembali class hidden ke Modal.