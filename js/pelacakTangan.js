/**
 * Modul Pelacak Tangan yang berkomunikasi dengan Web Worker MediaPipe.
 */

let pekerja = null;
let callbackDeteksi = null;

const EMA_ALPHA = 0.4; 
let daftarTanganSebelumnya = []; 

export function inisialisasiPelacak(onSiap, onDeteksi) {
    callbackDeteksi = onDeteksi;
    
    // Memulai Web Worker sebagai Classic Worker kembali karena MediaPipe membutuhkan 'importScripts' secara internal
    pekerja = new Worker('js/pekerjaMediaPipe.js');
    
    pekerja.onmessage = (event) => {
        const pesan = event.data;
        
        if (pesan.tipe === 'SIAP') {
            console.log("Web Worker MediaPipe berhasil diinisialisasi.");
            if (onSiap) onSiap();
        } else if (pesan.tipe === 'HASIL_DETEKSI') {
            const posisiMentah = pesan.tangan;
            const posisiHalus = terapkanEMA(posisiMentah); 
            
            if (callbackDeteksi) {
                callbackDeteksi(posisiHalus);
            }
            sedangMemproses = false; // Buka kunci antrean frame
        } else if (pesan.tipe === 'ERROR_DETEKSI') {
            sedangMemproses = false; // Buka kunci antrean jika error
        }
    };
    
    pekerja.onerror = (error) => {
        console.error("Terjadi masalah pada Web Worker Pelacak:", error.message);
    };
}

let sedangMemproses = false;

export async function kirimFrameVideoKePekerja(elemenVideo, timestamp) {
    if (!pekerja || sedangMemproses) return;
    
    try {
        sedangMemproses = true; // Kunci antrean sampai worker merespons
        
        // Memotong frame video menjadi bitmap, diproses di thread lain (Worker)
        const imageBitmap = await createImageBitmap(elemenVideo);
        
        pekerja.postMessage({ 
            tipe: 'PROSES_FRAME', 
            frame: imageBitmap,
            timestamp: timestamp
        }, [imageBitmap]); 
        
        // Jangan atur sedangMemproses = false di sini. 
        // Biarkan diatur saat pekerja merespons dengan HASIL_DETEKSI.
    } catch (e) {
        console.error("Gagal mentransfer frame ke worker", e);
        sedangMemproses = false;
    }
}

// Logika EMA Smoothing untuk multi-point multi-tangan
function terapkanEMA(daftarTanganBaru) {
    if (daftarTanganBaru.length !== daftarTanganSebelumnya.length) {
        // Deep copy untuk mereset seluruh data kerangka
        daftarTanganSebelumnya = JSON.parse(JSON.stringify(daftarTanganBaru));
        return daftarTanganBaru;
    }
    
    for (let i = 0; i < daftarTanganBaru.length; i++) {
        const tanganBaru = daftarTanganBaru[i];
        const tanganLama = daftarTanganSebelumnya[i];
        
        for (let j = 0; j < tanganBaru.length; j++) {
            tanganLama[j].x = (EMA_ALPHA * tanganBaru[j].x) + ((1 - EMA_ALPHA) * tanganLama[j].x);
            tanganLama[j].y = (EMA_ALPHA * tanganBaru[j].y) + ((1 - EMA_ALPHA) * tanganLama[j].y);
            tanganLama[j].z = (EMA_ALPHA * tanganBaru[j].z) + ((1 - EMA_ALPHA) * tanganLama[j].z);
        }
    }
    
    return daftarTanganSebelumnya;
}
