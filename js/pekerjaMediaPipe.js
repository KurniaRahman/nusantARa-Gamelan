/**
 * Web Worker untuk menjalankan inference MediaPipe Hands.
 * Berjalan di thread terpisah (Classic Worker).
 */

let pelacakTangan;
let siap = false;

async function inisialisasiMediaPipe() {
    try {
        // Dapatkan URL relatif yang dinamis berbasis lokasi worker (self.location.href)
        // Ini memastikan path selalu valid baik aplikasi dijalankan di root server maupun di subfolder.
        const urlAset = new URL('../aset/mediapipe/', self.location.href).href;
        const pathBundleLokal = new URL('vision_bundle.mjs', urlAset).href;
        const pathWasmLokal = new URL('wasm', urlAset).href;
        const pathModelLokal = new URL('hand_landmarker.task', urlAset).href;

        console.log("Mencoba memuat MediaPipe dari lokal:", pathBundleLokal);
        const mediapipeModule = await import(pathBundleLokal);
        const FilesetResolver = mediapipeModule.FilesetResolver;
        const HandLandmarker = mediapipeModule.HandLandmarker;

        const vision = await FilesetResolver.forVisionTasks(pathWasmLokal);
        
        pelacakTangan = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: pathModelLokal, 
                delegate: "GPU" 
            },
            runningMode: "VIDEO", 
            numHands: 2,
            minHandDetectionConfidence: 0.6,
            minHandPresenceConfidence: 0.6,
            minTrackingConfidence: 0.6
        });
        
        siap = true;
        self.postMessage({ tipe: 'SIAP' });
    } catch (error) {
        console.warn("Gagal memuat MediaPipe lokal:", error.message);
        
        try {
            console.log("Mencoba ulang memuat MediaPipe melalui CDN...");
            const urlAset = new URL('../aset/mediapipe/', self.location.href).href;
            const pathModelLokal = new URL('hand_landmarker.task', urlAset).href;

            const mediapipeModule = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs');
            const FilesetResolver = mediapipeModule.FilesetResolver;
            const HandLandmarker = mediapipeModule.HandLandmarker;
            
            const visionCDN = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
            
            pelacakTangan = await HandLandmarker.createFromOptions(visionCDN, {
                baseOptions: {
                    modelAssetPath: pathModelLokal,
                    delegate: "GPU" 
                },
                runningMode: "VIDEO",
                numHands: 2,
                minHandDetectionConfidence: 0.6,
                minHandPresenceConfidence: 0.6,
                minTrackingConfidence: 0.6
            });
            siap = true;
            self.postMessage({ tipe: 'SIAP' });
        } catch (e2) {
            console.error("Gagal total inisialisasi AI, baik lokal maupun CDN:", e2);
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
            frameBitmap.close(); // Cegah memory leak
        }
    }
};
