/**
 * Web Worker untuk menjalankan inference MediaPipe Hands.
 * Berjalan di thread terpisah (Classic Worker).
 */

let pelacakTangan;
let siap = false;

// Override Console untuk meneruskan Log ke Main Thread (Eruda)
const logAsli = console.log;
const warnAsli = console.warn;
const errorAsli = console.error;
console.log = function(...args) { self.postMessage({ tipe: 'LOG', level: 'log', pesan: args.join(' ') }); logAsli.apply(console, args); };
console.warn = function(...args) { self.postMessage({ tipe: 'LOG', level: 'warn', pesan: args.join(' ') }); warnAsli.apply(console, args); };
console.error = function(...args) { self.postMessage({ tipe: 'LOG', level: 'error', pesan: args.join(' ') }); errorAsli.apply(console, args); };


async function inisialisasiMediaPipe() {
    // Fungsi pembantu untuk mencoba inisialisasi GPU, jika gagal otomatis turun ke CPU
    async function cobaBuatPelacak(FilesetResolver, HandLandmarker, urlWasm, urlModel) {
        const vision = await FilesetResolver.forVisionTasks(urlWasm);
        try {
            return await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: urlModel, delegate: "GPU" },
                runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: 0.2, minHandPresenceConfidence: 0.2, minTrackingConfidence: 0.2
            });
        } catch (eGPU) {
            console.warn("MediaPipe GPU gagal (biasanya terjadi di iOS Safari). Mencoba CPU...", eGPU);
            return await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: urlModel, delegate: "CPU" },
                runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: 0.2, minHandPresenceConfidence: 0.2, minTrackingConfidence: 0.2
            });
        }
    }

    try {
        const urlAset = new URL('../aset/mediapipe/', self.location.href).href;
        const pathBundleLokal = new URL('vision_bundle.mjs', urlAset).href;
        const pathWasmLokal = new URL('wasm', urlAset).href;
        const pathModelLokal = new URL('hand_landmarker.task', urlAset).href;

        console.log("Mencoba memuat MediaPipe dari lokal:", pathBundleLokal);
        const mediapipeModule = await import(pathBundleLokal);
        pelacakTangan = await cobaBuatPelacak(mediapipeModule.FilesetResolver, mediapipeModule.HandLandmarker, pathWasmLokal, pathModelLokal);
        
        siap = true;
        self.postMessage({ tipe: 'SIAP' });
    } catch (error) {
        console.warn("Gagal memuat MediaPipe lokal:", error.message);
        try {
            console.log("Mencoba ulang memuat MediaPipe melalui CDN...");
            const urlAset = new URL('../aset/mediapipe/', self.location.href).href;
            const pathModelLokal = new URL('hand_landmarker.task', urlAset).href;

            const mediapipeModule = await import('https://unpkg.com/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs');
            pelacakTangan = await cobaBuatPelacak(mediapipeModule.FilesetResolver, mediapipeModule.HandLandmarker, "https://unpkg.com/@mediapipe/tasks-vision@0.10.3/wasm", pathModelLokal);
            
            siap = true;
            self.postMessage({ tipe: 'SIAP' });
        } catch (e2) {
            console.error("Gagal total inisialisasi AI, baik lokal maupun CDN:", e2);
            self.postMessage({ tipe: 'SIAP_GAGAL' });
        }
    }
}

inisialisasiMediaPipe();

self.onmessage = (event) => {
    if (!siap) return;
    
    const pesan = event.data;
    if (pesan.tipe === 'PROSES_FRAME') {
        const frameBitmap = pesan.frame;
        const timestamp = pesan.timestamp;
        
        try {
            const hasil = pelacakTangan.detectForVideo(frameBitmap, timestamp);
            
            // Sekarang kita ekstrak SELURUH 21 titik per tangan agar UI dapat merendernya
            let seluruhTangan = [];
            if (hasil.landmarks && hasil.landmarks.length > 0) {
                for (let i = 0; i < hasil.landmarks.length; i++) {
                    const titikPerTangan = hasil.landmarks[i].map(titik => ({
                        x: titik.x,
                        y: titik.y,
                        z: titik.z
                    }));
                    seluruhTangan.push(titikPerTangan);
                }
            }
            
            self.postMessage({ 
                tipe: 'HASIL_DETEKSI', 
                tangan: seluruhTangan 
            });
        } catch (e) {
            console.error("Gagal memproses frame di Worker:", e);
            self.postMessage({ tipe: 'ERROR_DETEKSI' }); // Lepas kunci antrean di main thread
        } finally {
            if (!pesan.isImageData && frameBitmap.close) {
                frameBitmap.close(); // Cegah memory leak (Hanya untuk ImageBitmap)
            }
        }
    }
};
