/**
 * Modul untuk mengatur navigasi antar layar (SPA).
 */

import { mulaiAR, berhentiAR } from './app.js';
import { inisialisasiSejarah, bersihkanSejarah } from './sejarahGamelan.js';

const layarMulai = document.getElementById('layar-mulai');
const layarSejarah = document.getElementById('layar-sejarah');
const wadahAR = document.getElementById('wadah-ar');
const layarLoading = document.getElementById('layar-loading');

const tombolMulai = document.getElementById('tombol-mulai');
const tombolSejarah = document.getElementById('tombol-sejarah');
const tombolKembaliSejarah = document.getElementById('tombol-kembali-sejarah');
const tombolKembaliAR = document.getElementById('tombol-kembali-ar');

const tombolInfoCredit = document.getElementById('tombol-info-credit');
const modalCredit = document.getElementById('modal-credit');
const kontenModalCredit = document.getElementById('konten-modal-credit');
const tombolTutupCredit = document.getElementById('tombol-tutup-credit');

export function inisialisasiNavigasi() {
    // Navigasi ke Layar Sejarah
    tombolSejarah.addEventListener('click', () => {
        layarMulai.classList.add('sembunyi');
        layarSejarah.classList.remove('sembunyi');
        inisialisasiSejarah();
    });

    // Navigasi kembali dari Sejarah ke Beranda
    tombolKembaliSejarah.addEventListener('click', () => {
        layarSejarah.classList.add('sembunyi');
        layarMulai.classList.remove('sembunyi');
        bersihkanSejarah();
    });

    // Navigasi ke AR (Mulai Bermain)
    tombolMulai.addEventListener('click', async () => {
        layarMulai.classList.add('sembunyi');
        layarLoading.classList.remove('sembunyi');
        
        try {
            await mulaiAR();
            layarLoading.classList.add('sembunyi');
            wadahAR.classList.remove('sembunyi');
        } catch (e) {
            console.error("Gagal memulai AR:", e);
            // Kembali ke beranda jika gagal
            layarLoading.classList.add('sembunyi');
            layarMulai.classList.remove('sembunyi');
            alert("Gagal memulai AR. Pastikan izin kamera diberikan.");
        }
    });

    // Navigasi kembali dari AR ke Beranda
    tombolKembaliAR.addEventListener('click', () => {
        wadahAR.classList.add('sembunyi');
        berhentiAR();
        layarMulai.classList.remove('sembunyi');
    });

    // -- Event Listener Modal Credit -- //
    
    // Buka Modal
    if (tombolInfoCredit && modalCredit && kontenModalCredit) {
        tombolInfoCredit.addEventListener('click', () => {
            modalCredit.classList.remove('sembunyi');
            // Sedikit delay agar transisi CSS terbaca
            requestAnimationFrame(() => {
                kontenModalCredit.classList.remove('scale-95');
                kontenModalCredit.classList.add('scale-100');
            });
        });
    }

    // Fungsi Tutup Modal Credit
    const tutupModalCredit = () => {
        if (!modalCredit || !kontenModalCredit) return;
        kontenModalCredit.classList.remove('scale-100');
        kontenModalCredit.classList.add('scale-95');
        setTimeout(() => {
            modalCredit.classList.add('sembunyi');
        }, 150); // Menunggu transisi transform selesai
    };

    if (tombolTutupCredit) {
        tombolTutupCredit.addEventListener('click', tutupModalCredit);
    }

    if (modalCredit) {
        modalCredit.addEventListener('click', (e) => {
            // Jika yang diklik adalah background hitam (bukan kotaknya)
            if (e.target === modalCredit) {
                tutupModalCredit();
            }
        });
    }
}
