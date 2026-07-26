/**
 * Modul untuk menangani image tracking dengan MindAR (Core tanpa 3D engine).
 */

// Impor MindAR sebagai ES Module (versi 1.2.5 menggunakan ESM)
import 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js';

let mindarController = null;
let streamKamera = null;
const videoElement = document.getElementById('videoKamera');

// Callback untuk memberitahu UI saat target terdeteksi / hilang
let onTargetDitemukan = null;
let onTargetHilang = null;
let onMatrixUpdate = null;

// Status tracking aktif per targetIndex
let targetAktif = new Map();

/**
 * Meminta akses kamera dan mengatur resolusi video.
 */
export async function mulaiKamera() {
    try {
        streamKamera = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'user' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        videoElement.srcObject = streamKamera;
        
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                const cekDimensi = setInterval(() => {
                    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                        clearInterval(cekDimensi);
                        resolve(true);
                    }
                }, 100);
            };
        });
    } catch (e) {
        console.error("Akses kamera ditolak atau gagal:", e);
        throw e;
    }
}

/**
 * Menghentikan aliran kamera.
 */
export function hentikanKamera() {
    if (streamKamera) {
        streamKamera.getTracks().forEach(track => track.stop());
        streamKamera = null;
        videoElement.srcObject = null;
    }
}

/**
 * Memuat marker (.mind) dan menginisialisasi MindAR Controller.
 */
export async function inisialisasiMindAR(pathMarker, cbDitemukan, cbHilang, cbMatrix) {
    if (!window.MINDAR || !window.MINDAR.IMAGE) {
        throw new Error("MindAR core library tidak ditemukan di window.");
    }
    
    onTargetDitemukan = cbDitemukan;
    onTargetHilang = cbHilang;
    onMatrixUpdate = cbMatrix;

    const vw = videoElement.videoWidth;
    const vh = videoElement.videoHeight;
    console.log(`[MindAR] Inisialisasi Controller. Resolusi Video: ${vw}x${vh}`);

    if (vw === 0 || vh === 0) {
        throw new Error(`[MindAR] Dimensi video tidak valid (${vw}x${vh}). Kamera belum siap.`);
    }

    let hitungFrame = 0;
    mindarController = new window.MINDAR.IMAGE.Controller({
        inputWidth: vw,
        inputHeight: vh,
        maxTrack: 1,
        warmupTolerance: 0, 
        missTolerance: 10,
        onUpdate: (data) => {
            if (data.type === 'processDone') {
                hitungFrame++;
                if (hitungFrame % 60 === 0) {
                    console.log(`[MindAR] Frame ke-${hitungFrame} diproses.`);
                    // Sesekali cek kualitas gambar secara manual untuk debugging
                    mindarController.detect(videoElement).then(res => {
                        console.log(`[MindAR-Debug] Titik fitur di frame ini: ${res?.featurePoints?.length || 0}`);
                    }).catch(e => {});
                }
            } else if (data.type === 'updateMatrix') {
                const index = data.targetIndex;
                const matrix = data.worldMatrix;

                if (matrix !== null) {
                    console.log(`[MindAR] ✅ Target DITEMUKAN! Index: ${index}`);
                    if (!targetAktif.has(index)) {
                        targetAktif.set(index, true);
                        if (onTargetDitemukan) onTargetDitemukan(index);
                    }
                    if (onMatrixUpdate) onMatrixUpdate(index, matrix);
                } else {
                    if (targetAktif.has(index)) {
                        console.log(`[MindAR] ❌ Target HILANG. Index: ${index}`);
                        targetAktif.delete(index);
                        if (onTargetHilang) onTargetHilang(index);
                    }
                }
            }
        }
    });

    // Muat file .mind dan setup tracker
    console.log("[MindAR] Memuat targets.mind...");
    const result = await mindarController.addImageTargets(pathMarker);
    console.log(`[MindAR] Target terload: ${result.dimensions?.length ?? result.imageList?.length ?? JSON.stringify(result)}`);
    
    // BIKIN CANVAS PROXY: Terkadang tf.browser.fromPixels gagal membaca <video> secara langsung
    // karena bug browser atau GPU. Kita buat jembatan via Canvas.
    const canvasProxy = document.createElement('canvas');
    canvasProxy.width = vw;
    canvasProxy.height = vh;
    const ctxProxy = canvasProxy.getContext('2d', { willReadFrequently: true });
    
    // Loop untuk terus mengupdate canvasProxy dengan frame dari video
    let proxyAktif = true;
    function updateProxy() {
        if (!proxyAktif) return;
        if (videoElement.readyState >= 2) {
            ctxProxy.drawImage(videoElement, 0, 0, vw, vh);
        }
        requestAnimationFrame(updateProxy);
    }
    updateProxy();

    // Pastikan frame tidak hitam kosong
    const imageData = ctxProxy.getImageData(0, 0, 10, 10).data;
    console.log(`[MindAR] Sample piksel video: R${imageData[0]} G${imageData[1]} B${imageData[2]}`);

    console.log("[MindAR] Menjalankan GPU warmup (dummyRun)...");
    try {
        await mindarController.dummyRun(canvasProxy);
    } catch(e) {
        console.warn("[MindAR] dummyRun dilewati:", e.message);
    }
    console.log("[MindAR] dummyRun selesai. Memulai processVideo...");
    
    // Gunakan canvasProxy sebagai input, bukan videoElement langsung
    mindarController.processVideo(canvasProxy);
    console.log("[MindAR] ✅ processVideo loop dimulai. Menunggu kartu...");

    // Simpan referensi untuk dihentikan nanti
    mindarController._proxyCanvasActive = () => proxyAktif = false;
}

/**
 * Stub kosong — pemrosesan frame kini dilakukan oleh loop internal processVideo.
 * Tetap diekspor agar tidak error pada pemanggil lama.
 */
export function prosesFrameMindAR() {
    // Tidak perlu dilakukan apa-apa di sini
}

/**
 * Membersihkan state MindAR
 */
export function bersihkanMindAR() {
    if (mindarController) {
        try {
            mindarController.stopProcessVideo();
            if (mindarController._proxyCanvasActive) mindarController._proxyCanvasActive();
        } catch(e) { /* abaikan jika belum berjalan */ }
        mindarController = null;
    }
    targetAktif.clear();
}

