/**
 * Main application entry point.
 */

import { inisialisasiAudio, muatAudio, mainkanAudio } from './mesinAudio.js';
import { inisialisasiPelacak, kirimFrameVideoKePekerja } from './pelacakTangan.js';
import { inisialisasiNavigasi } from './navigasiUtama.js';
import { deteksiTabrakan, resetEMA } from './logikaHitbox.js';
import { mulaiKamera, hentikanKamera, inisialisasiMindAR, prosesFrameMindAR, bersihkanMindAR } from './mesinMindAR.js';

let daftarRiak = []; // Array untuk menampung efek riak air (visual feedback)

const teksStatus = document.getElementById('teks-status');
const videoKamera = document.getElementById('videoKamera');
const canvasUI = document.getElementById('canvasUI');
const konteksUI = canvasUI.getContext('2d');
const overlayInstrumen = document.getElementById('overlay-instrumen');

// Elemen Modal Laras
const modalPilihLaras = document.getElementById('modal-pilih-laras');
const tombolPilihLaras = document.querySelectorAll('.tombol-pilih-laras');

let arBerjalan = false;
let daftarTangan = []; 
let idRenderLoop = null;

// State Instrumen
let dataSemuaInstrumen = [];
let dataInstrumenAktif = null; // Instrumen yang sedang di-scan
let konfigurasiLarasAktif = null; // Laras yang dipilih (pelog/slendro/default)
let markerAktifIndex = -1; // Index marker yang sedang terlihat

// State Rendering
let matriksMarkerTerbaru = null;
const gambarInstrumen = new Image();
let gambarSiap = false;

// Untuk simulasi posisi 2D sederhana tanpa 3D engine rumit
let posisiInstrumen2D = { x: 0, y: 0, w: 0, h: 0 };

function sesuaikanCanvas() {
    const baseWidth = 1920;
    const baseHeight = 1080;
    
    // Canvas UI tetap menggunakan resolusi asli agar tidak pecah/blur
    canvasUI.width = baseWidth;
    canvasUI.height = baseHeight;
    
    // Hitung skala agar pas di tengah layar (fit) tanpa scroll
    const scaleX = window.innerWidth / baseWidth;
    const scaleY = window.innerHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const wadahAplikasi = document.getElementById('wadah-aplikasi');
    if (wadahAplikasi) {
        wadahAplikasi.style.transform = `scale(${scale})`;
    }
}
window.addEventListener('resize', sesuaikanCanvas);
sesuaikanCanvas();

// Elemen Modal Manual Instrumen & Switcher
const kotakPemandu = document.getElementById('kotak-pemandu');
const tombolPilihManual = document.getElementById('tombol-pilih-manual');
const modalPilihInstrumen = document.getElementById('modal-pilih-instrumen');
const tombolTutupPilihInstrumen = document.getElementById('tombol-tutup-pilih-instrumen');
const tombolTutupModalLaras = document.getElementById('tombol-tutup-modal-laras');
const daftarTombolInstrumenManual = document.getElementById('daftar-tombol-instrumen-manual');
const tombolModeAuto = document.getElementById('tombol-mode-auto');
const tombolModeManual = document.getElementById('tombol-mode-manual');

let modeAktif = 'auto'; // 'auto' | 'manual'

if (tombolTutupModalLaras) {
    tombolTutupModalLaras.onclick = () => {
        modalPilihLaras.classList.add('sembunyi');
    };
}

function bukaModalManual() {
    if (!dataSemuaInstrumen || dataSemuaInstrumen.length === 0) return;
    
    daftarTombolInstrumenManual.innerHTML = '';
    dataSemuaInstrumen.forEach(instrumen => {
        const btn = document.createElement('div');
        btn.className = "bg-white rounded-3xl overflow-hidden shadow-md border-4 border-slate-100 hover:border-sky-300 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col cursor-pointer";
        
        // Sesuaikan nama file: ganti tanda hubung (-) menjadi garis bawah (_)
        const namaFileGambar = instrumen.id.replace(/-/g, '_');
        
        btn.innerHTML = `
            <div class="w-full aspect-square bg-sky-50 overflow-hidden relative flex items-center justify-center p-2">
                <img src="./aset/marker/card_${namaFileGambar}.png" class="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" alt="${instrumen.nama}">
                <div class="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/10 transition-colors"></div>
            </div>
            <div class="p-3 md:p-4 bg-white flex justify-center items-center flex-1 border-t-2 border-slate-50">
                <span class="font-black text-slate-700 text-[11px] md:text-sm text-center group-hover:text-sky-600 transition-colors uppercase tracking-wide leading-tight">${instrumen.nama}</span>
            </div>
        `;
        btn.onclick = () => {
            modalPilihInstrumen.classList.add('sembunyi');
            document.getElementById('panduan-ar').textContent = `Aktif: ${instrumen.nama}`;
            tampilkanModalLaras(instrumen);
        };
        daftarTombolInstrumenManual.appendChild(btn);
    });
    
    modalPilihInstrumen.classList.remove('sembunyi');
}

function aturModeAR(mode) {
    modeAktif = mode;
    if (mode === 'auto') {
        if (tombolModeAuto) tombolModeAuto.className = "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all bg-amber-400 text-slate-900 shadow";
        if (tombolModeManual) tombolModeManual.className = "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all text-white/80 hover:text-white";
        
        // Kembalikan state ke posisi awal pencarian
        dataInstrumenAktif = null;
        konfigurasiLarasAktif = null;
        markerAktifIndex = -1;
        gambarSiap = false;
        if (overlayInstrumen) overlayInstrumen.classList.add('sembunyi');
        
        if (kotakPemandu) {
            kotakPemandu.classList.remove('sembunyi');
        }
        const panduanEl = document.getElementById('panduan-ar');
        if (panduanEl) {
            panduanEl.textContent = "Mencari kartu target...";
        }
    } else {
        if (tombolModeManual) tombolModeManual.className = "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all bg-amber-400 text-slate-900 shadow";
        if (tombolModeAuto) tombolModeAuto.className = "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all text-white/80 hover:text-white";
        
        if (kotakPemandu) kotakPemandu.classList.add('sembunyi');
        bukaModalManual();
    }
}

if (tombolModeAuto) tombolModeAuto.onclick = () => aturModeAR('auto');
if (tombolModeManual) tombolModeManual.onclick = () => aturModeAR('manual');
if (tombolPilihManual) tombolPilihManual.onclick = () => aturModeAR('manual');
if (tombolTutupPilihInstrumen) {
    tombolTutupPilihInstrumen.onclick = () => {
        modalPilihInstrumen.classList.add('sembunyi');
    };
}

function resetStateAR() {
    dataInstrumenAktif = null;
    konfigurasiLarasAktif = null;
    markerAktifIndex = -1;
    gambarSiap = false;
    
    if (overlayInstrumen) {
        overlayInstrumen.src = '';
        overlayInstrumen.classList.add('sembunyi');
    }
    if (kotakPemandu) {
        kotakPemandu.classList.remove('sembunyi');
    }
    if (modalPilihLaras) modalPilihLaras.classList.add('sembunyi');
    if (modalPilihInstrumen) modalPilihInstrumen.classList.add('sembunyi');
    
    aturModeAR('auto');
}

async function muatDataInstrumen() {
    try {
        const res = await fetch('./data/instrumen.json');
        dataSemuaInstrumen = await res.json();
    } catch (e) {
        console.error("Gagal memuat data instrumen:", e);
    }
}

// Logika Pemilihan Laras
function tampilkanModalLaras(instrumen) {
    // Jika tipe single (seperti kendang), langsung aktifkan tanpa modal
    if (instrumen.tipe === "single") {
        aktifkanInstrumen(instrumen, "default");
        return;
    }
    
    // Tampilkan popup jika multi-laras
    modalPilihLaras.classList.remove('sembunyi');
    
    // Hapus event listener lama agar tidak dobel
    tombolPilihLaras.forEach(btn => {
        btn.onclick = () => {
            const pilihan = btn.getAttribute('data-laras');
            modalPilihLaras.classList.add('sembunyi');
            aktifkanInstrumen(instrumen, pilihan);
        };
    });
}

function aktifkanInstrumen(instrumen, laras) {
    dataInstrumenAktif = instrumen;
    konfigurasiLarasAktif = instrumen.laras[laras];
    
    // Sembunyikan bingkai pemandu ketika instrumen sudah terpilih/aktif
    if (kotakPemandu) kotakPemandu.classList.add('sembunyi');
    document.getElementById('panduan-ar').textContent = `Aktif: ${instrumen.nama}`;
    
    // Preload Audio di Latar Belakang
    if (konfigurasiLarasAktif && konfigurasiLarasAktif.notes) {
        konfigurasiLarasAktif.notes.forEach(nada => {
            const audioUrl = konfigurasiLarasAktif.audioPath + nada.file;
            // muatAudio menyimpan otomatis ke bufferCache
            muatAudio(audioUrl).catch(e => console.warn("Gagal preload audio:", e));
        });
    }
    
    // Muat gambar instrumen sesuai laras
    gambarSiap = false;
    gambarInstrumen.src = konfigurasiLarasAktif.imageSrc;
    gambarInstrumen.onload = () => {
        const skala = Math.min(window.innerWidth * 0.8 / gambarInstrumen.width, 1);
        posisiInstrumen2D.w = gambarInstrumen.width * skala;
        posisiInstrumen2D.h = gambarInstrumen.height * skala;
        
        // Posisikan di tengah layar sebagai fallback
        posisiInstrumen2D.x = (window.innerWidth - posisiInstrumen2D.w) / 2;
        posisiInstrumen2D.y = (window.innerHeight - posisiInstrumen2D.h) / 2;
        
        gambarSiap = true;
        overlayInstrumen.src = gambarInstrumen.src;
        // Kita menggunakan Canvas 2D untuk interaksi Hitbox, gambar disembunyikan CSS3D sementara
        overlayInstrumen.classList.add('sembunyi'); 
    };
    
    console.log(`Instrumen aktif: ${instrumen.nama} (Laras: ${laras})`);
}

// Callback dari MindAR
function saatMarkerDitemukan(index) {
    if (modeAktif === 'manual') return; // Abaikan deteksi jika sedang mode manual
    if (markerAktifIndex === index) return;
    
    markerAktifIndex = index;
    const instrumen = dataSemuaInstrumen.find(i => i.markerIndex === index);
    
    if (instrumen) {
        document.getElementById('panduan-ar').textContent = `Ditemukan: ${instrumen.nama}`;
        tampilkanModalLaras(instrumen);
    }
}

function saatMarkerHilang(index) {
    if (modeAktif === 'manual') return;
    if (markerAktifIndex === index) {
        markerAktifIndex = -1;
        matriksMarkerTerbaru = null;
        document.getElementById('panduan-ar').textContent = "Mencari kartu target...";
        // Jangan sembunyikan instrumen langsung agar anak-anak masih bisa memainkannya sebentar
    }
}

function saatMatrixUpdate(index, matrix) {
    if (modeAktif === 'manual') return;
    if (markerAktifIndex === index) {
        matriksMarkerTerbaru = matrix;
        // Di sini kita bisa mengekstrak koordinat dari matrix jika menggunakan full 3D
        // Namun demi kemudahan di versi 2D ini, kita letakkan di tengah layar jika terdeteksi
    }
}



// Referensi sambungan tulang tangan
const KONEKSI_TULANG = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Jempol
    [0, 5], [5, 6], [6, 7], [7, 8], // Telunjuk
    [5, 9], [9, 10], [10, 11], [11, 12], // Tengah
    [9, 13], [13, 14], [14, 15], [15, 16], // Manis
    [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Kelingking & Dasar
];

function renderUIAR() {
    // 1. Gambar Instrumen 2D (Di-un-mirror secara visual)
    if (gambarSiap && dataInstrumenAktif && konfigurasiLarasAktif) {
        konteksUI.save();
        
        // Flip canvas X hanya untuk menggambar instrumen dan debug, agar tidak terbalik
        konteksUI.translate(canvasUI.width, 0);
        konteksUI.scale(-1, 1);
        
        konteksUI.drawImage(
            gambarInstrumen, 
            posisiInstrumen2D.x, 
            posisiInstrumen2D.y, 
            posisiInstrumen2D.w, 
            posisiInstrumen2D.h
        );
        
        konteksUI.restore();
    }

    // 2. Update & Gambar efek riak air (Ripples)
    for (let i = daftarRiak.length - 1; i >= 0; i--) {
        const riak = daftarRiak[i];
        riak.radius += riak.kecepatan;
        riak.opacity -= 0.03; // Pudar secara bertahap

        if (riak.opacity <= 0) {
            daftarRiak.splice(i, 1); // Hapus jika sudah tak terlihat
            continue;
        }

        konteksUI.beginPath();
        konteksUI.arc(riak.x, riak.y, riak.radius, 0, 2 * Math.PI);
        konteksUI.fillStyle = `rgba(135, 206, 235, ${riak.opacity * 0.5})`; // Biru langit transparan
        konteksUI.fill();
        konteksUI.lineWidth = 4;
        konteksUI.strokeStyle = `rgba(255, 255, 255, ${riak.opacity})`;
        konteksUI.stroke();
    }

    // 3. Gambar Tangan (Hitbox Deteksi)
    if (!daftarTangan || daftarTangan.length === 0) {
        resetEMA(); // Reset semua tracker tangan jika tangan hilang
    } else {
        for (let i = 0; i < daftarTangan.length; i++) {
            const titikTangan = daftarTangan[i];

            konteksUI.strokeStyle = "rgba(255, 255, 255, 0.5)";
            konteksUI.lineWidth = 2;
            for (const [awal, akhir] of KONEKSI_TULANG) {
                const x1 = titikTangan[awal].x * canvasUI.width;
                const y1 = titikTangan[awal].y * canvasUI.height;
                const x2 = titikTangan[akhir].x * canvasUI.width;
                const y2 = titikTangan[akhir].y * canvasUI.height;
                
                konteksUI.beginPath();
                konteksUI.moveTo(x1, y1);
                konteksUI.lineTo(x2, y2);
                konteksUI.stroke();
            }

            for (let j = 0; j < titikTangan.length; j++) {
                const x = titikTangan[j].x * canvasUI.width;
                const y = titikTangan[j].y * canvasUI.height;
                
                konteksUI.beginPath();
                if (j === 8) {
                    // TITIK 8 = Ujung Telunjuk
                    konteksUI.arc(x, y, 16, 0, 2 * Math.PI);
                    konteksUI.fillStyle = "rgba(212, 175, 55, 0.7)"; 
                    konteksUI.fill();
                    konteksUI.lineWidth = 3;
                    konteksUI.strokeStyle = "#FFFFFF";
                    konteksUI.stroke();
                    
                    // Deteksi Tabrakan (Hit-Testing)
                    if (dataInstrumenAktif && konfigurasiLarasAktif && modalPilihLaras.classList.contains('sembunyi')) {
                        deteksiTabrakan(i, {x, y}, konfigurasiLarasAktif.notes, posisiInstrumen2D, async (idNada, koorTap) => {
                        console.log(`Nada ditekan: ${idNada} pada ${dataInstrumenAktif.nama}`);
                        
                        // Tambahkan riak visual
                        daftarRiak.push({ x: koorTap.x, y: koorTap.y, radius: 10, opacity: 1.0, kecepatan: 5 });

                        // Mainkan Audio Tanpa Latensi
                        const objNada = konfigurasiLarasAktif.notes.find(n => n.id === idNada);
                        if (objNada) {
                            const url = konfigurasiLarasAktif.audioPath + objNada.file;
                            const buffer = await muatAudio(url);
                            if (buffer) {
                                mainkanAudio(buffer);
                            }
                        }
                    });
                }
            } else {
                konteksUI.arc(x, y, 4, 0, 2 * Math.PI);
                konteksUI.fillStyle = "rgba(255, 255, 255, 0.6)";
                konteksUI.fill();
            }
            }
        }
    }
}

function jalankanRenderLoop() {
    if (!arBerjalan) return;

    konteksUI.clearRect(0, 0, canvasUI.width, canvasUI.height);
    renderUIAR();
    
    if (videoKamera.readyState >= 2) { 
        kirimFrameVideoKePekerja(videoKamera, performance.now());
    }
    
    idRenderLoop = requestAnimationFrame(jalankanRenderLoop);
}

export async function mulaiAR() {
    if (arBerjalan) return;
    
    resetStateAR();
    await muatDataInstrumen();
    
    await inisialisasiAudio();
    
    teksStatus.textContent = "Mengakses Kamera...";
    await mulaiKamera();

    teksStatus.textContent = "Menginisialisasi Pelacak Marker...";
    try {
        await inisialisasiMindAR(
            './aset/marker/targets.mind',
            saatMarkerDitemukan,
            saatMarkerHilang,
            saatMatrixUpdate
        );
    } catch (e) {
        console.error("Gagal inisialisasi MindAR", e);
        throw e; // Lemparkan error agar ditangkap oleh navigasiUtama.js
    }

    teksStatus.textContent = "Menginisialisasi AI Pelacak Tangan...";
    await new Promise((resolve) => {
        inisialisasiPelacak(
            () => resolve(true),
            (hasilTangan) => { daftarTangan = hasilTangan; }
        );
    });
    
    arBerjalan = true;
    jalankanRenderLoop();
}

export function berhentiAR() {
    arBerjalan = false;
    if (idRenderLoop) cancelAnimationFrame(idRenderLoop);
    
    hentikanKamera();
    bersihkanMindAR();
    resetStateAR();
    
    konteksUI.clearRect(0, 0, canvasUI.width, canvasUI.height);
}

// Mulai inisialisasi navigasi SPA
inisialisasiNavigasi();
