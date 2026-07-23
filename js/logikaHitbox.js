/**
 * Modul untuk logika deteksi tabrakan (Hit-Testing) antara titik tangan (jari) dan instrumen.
 */

const waktuInteraksiTerakhir = {};
const DELAY_COOLDOWN = 200; // ms (Debouncing)

// State EMA untuk koordinat jari (Smoothing) per pointerId
const emaX = {};
const emaY = {};
const FAKTOR_SMOOTHING = 0.4; // 0 = tidak bergerak, 1 = tanpa smoothing (responsif mentah)

/**
 * Menghitung EMA untuk mengurangi getaran (jitter).
 */
function terapkanEMA(pointerId, xBaru, yBaru) {
    if (emaX[pointerId] === undefined || emaY[pointerId] === undefined) {
        emaX[pointerId] = xBaru;
        emaY[pointerId] = yBaru;
    } else {
        emaX[pointerId] = (FAKTOR_SMOOTHING * xBaru) + ((1 - FAKTOR_SMOOTHING) * emaX[pointerId]);
        emaY[pointerId] = (FAKTOR_SMOOTHING * yBaru) + ((1 - FAKTOR_SMOOTHING) * emaY[pointerId]);
    }
    return { x: emaX[pointerId], y: emaY[pointerId] };
}

/**
 * Mereset state saat tangan hilang dari kamera
 */
export function resetEMA(pointerId = null) {
    if (pointerId !== null) {
        delete emaX[pointerId];
        delete emaY[pointerId];
        delete lastY[pointerId];
        delete statusGerakan[pointerId];
    } else {
        for (let key in emaX) delete emaX[key];
        for (let key in emaY) delete emaY[key];
        for (let key in lastY) delete lastY[key];
        for (let key in statusGerakan) delete statusGerakan[key];
    }
}

const statusGerakan = {}; // { [pointerId]: { [idNada]: "idle" | "down" | "hit" } }
const lastY = {}; // { [pointerId]: y }
const VELOCITY_THRESHOLD = 3; // Minimal piksel per frame untuk dianggap bergerak cepat

/**
 * Deteksi apakah jari (X, Y) menabrak hitbox instrumen dengan gestur pukul.
 * 
 * @param {Number|String} pointerId - ID unik dari pointer/tangan (misal: 0, 1)
 * @param {Object} koordinatMentah - {x, y} dari jari telunjuk.
 * @param {Array} daftarHitbox - Array objek hitbox dari instrumen.json (dalam persentase).
 * @param {Object} posisiInstrumen - Posisi dan dimensi gambar instrumen saat ini {x, y, w, h}.
 * @param {Function} cbInteraksi - Callback yang dipanggil jika terjadi tabrakan pertama kali. Menerima id nada.
 */
export function deteksiTabrakan(pointerId, koordinatMentah, daftarHitbox, posisiInstrumen, cbInteraksi) {
    if (!koordinatMentah || !posisiInstrumen) {
        resetEMA(pointerId);
        return null;
    }

    const { x, y } = terapkanEMA(pointerId, koordinatMentah.x, koordinatMentah.y);
    
    // Hitung pergerakan vertikal (dy)
    let dy = 0;
    if (lastY[pointerId] !== undefined) {
        dy = y - lastY[pointerId]; 
    }
    lastY[pointerId] = y;

    // Inisialisasi state untuk tangan ini jika belum ada
    if (!statusGerakan[pointerId]) {
        statusGerakan[pointerId] = {};
    }
    const stateTangan = statusGerakan[pointerId];

    let nadaDitekan = null;

    for (const nada of daftarHitbox) {
        const { id, hitbox } = nada;

        // Hitung batas absolut
        const absXMin = posisiInstrumen.x + ((1 - hitbox.xMax) * posisiInstrumen.w);
        const absXMax = posisiInstrumen.x + ((1 - hitbox.xMin) * posisiInstrumen.w);
        const absYMin = posisiInstrumen.y + (hitbox.yMin * posisiInstrumen.h);
        const absYMax = posisiInstrumen.y + (hitbox.yMax * posisiInstrumen.h);

        // Cek apakah jari berada di dalam hitbox
        const sedangDiDalam = (x >= absXMin && x <= absXMax && y >= absYMin && y <= absYMax);

        if (sedangDiDalam) {
            let state = stateTangan[id] || "idle";

            // 1. Deteksi gerak turun (Jari mengayun ke bawah)
            if (dy > VELOCITY_THRESHOLD) {
                state = "down";
            }
            // 2. Deteksi gerak naik (Jari ditarik ke atas setelah mengayun) -> TRIGGER PUKULAN
            else if (state === "down" && dy < -VELOCITY_THRESHOLD) {
                if (cbInteraksi) cbInteraksi(id, {x, y});
                nadaDitekan = id;
                state = "hit"; // Ubah state menjadi hit agar tidak berbunyi terus-menerus
            }

            stateTangan[id] = state;
        } else {
            // Jika jari keluar dari hitbox, kembalikan ke kondisi siap (idle)
            stateTangan[id] = "idle";
        }
    }
    
    return nadaDitekan;
}
