/**
 * Modul Mesin Audio menggunakan Web Audio API.
 * Menjamin pemutaran tanpa latensi.
 */

let konteksAudio = null;
const bufferCache = {}; // Cache untuk menyimpan audio yang sudah di-decode

export async function inisialisasiAudio() {
    if (!konteksAudio) {
        konteksAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Jika state suspended (biasanya karena belum ada interaksi user), resume
    if (konteksAudio.state === 'suspended') {
        await konteksAudio.resume();
    }
    console.log("Konteks Audio (Web Audio API) diinisialisasi.");
}

/**
 * Memuat dan men-decode file audio. Menggunakan cache jika sudah pernah dimuat.
 * @param {string} url - Path relatif/absolut ke file audio
 * @returns {AudioBuffer}
 */
export async function muatAudio(url) {
    if (!konteksAudio) await inisialisasiAudio();
    
    // Kembalikan dari cache jika ada
    if (bufferCache[url]) {
        return bufferCache[url];
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await konteksAudio.decodeAudioData(arrayBuffer);
        
        // Simpan ke cache
        bufferCache[url] = audioBuffer;
        return audioBuffer;
    } catch (error) {
        console.error("Gagal memuat audio:", url, error);
        return null;
    }
}

/**
 * Memainkan AudioBuffer secara instan (Zero-Latency)
 * @param {AudioBuffer} buffer 
 */
export function mainkanAudio(buffer) {
    if (!konteksAudio || !buffer) return;
    
    const sumber = konteksAudio.createBufferSource();
    sumber.buffer = buffer;
    sumber.connect(konteksAudio.destination);
    sumber.start(0); // Mainkan sekarang juga tanpa jeda
}
