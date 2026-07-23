let dataInstrumen = [];
let instrumenAktif = null;
let larasAktif = null;

const selectInstrumen = document.getElementById('pilih-instrumen');
const selectLaras = document.getElementById('pilih-laras');
const workspace = document.getElementById('workspace');
const gambarInstrumen = document.getElementById('gambar-instrumen');
const hitboxContainer = document.getElementById('hitbox-container');
const pesanKosong = document.getElementById('pesan-kosong');

// Ambil data JSON
async function init() {
    try {
        const res = await fetch('../data/instrumen.json');
        dataInstrumen = await res.json();
        populateInstrumen();
    } catch (e) {
        console.error('Gagal memuat JSON', e);
        selectInstrumen.innerHTML = '<option>Gagal memuat data</option>';
    }
}

function populateInstrumen() {
    selectInstrumen.innerHTML = '<option value="">-- Pilih Instrumen --</option>';
    dataInstrumen.forEach((inst, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = inst.nama;
        selectInstrumen.appendChild(opt);
    });
    
    selectInstrumen.addEventListener('change', (e) => {
        const idx = e.target.value;
        if (idx === "") {
            instrumenAktif = null;
            selectLaras.innerHTML = '<option value="">-- Pilih Instrumen Dulu --</option>';
            selectLaras.disabled = true;
            sembunyikanWorkspace();
        } else {
            instrumenAktif = dataInstrumen[idx];
            populateLaras();
        }
    });
}

function populateLaras() {
    selectLaras.innerHTML = '<option value="">-- Pilih Laras --</option>';
    if (instrumenAktif.laras) {
        Object.keys(instrumenAktif.laras).forEach(larasKey => {
            const opt = document.createElement('option');
            opt.value = larasKey;
            opt.textContent = larasKey.toUpperCase();
            selectLaras.appendChild(opt);
        });
        selectLaras.disabled = false;
    }
    
    // Ganti listener
    selectLaras.onchange = (e) => {
        larasAktif = e.target.value;
        if (larasAktif === "") {
            sembunyikanWorkspace();
        } else {
            tampilkanWorkspace();
        }
    };
}

function sembunyikanWorkspace() {
    workspace.classList.add('hidden');
    pesanKosong.classList.remove('hidden');
}

function tampilkanWorkspace() {
    workspace.classList.remove('hidden');
    pesanKosong.classList.add('hidden');
    
    const configLaras = instrumenAktif.laras[larasAktif];
    gambarInstrumen.src = configLaras.imageSrc;
    
    // Render hitbox ketika gambar selesai dimuat (agar tahu ukurannya)
    gambarInstrumen.onload = () => {
        renderHitboxes(configLaras.notes);
    };
}

function renderHitboxes(notes) {
    hitboxContainer.innerHTML = '';
    
    if (!notes) return;
    
    notes.forEach((nada, index) => {
        const box = document.createElement('div');
        box.className = 'hitbox';
        box.dataset.index = index;
        
        // Persentase awal ke pixel (relatif terhadap kontainer/gambar)
        box.style.left = (nada.hitbox.xMin * 100) + '%';
        box.style.top = (nada.hitbox.yMin * 100) + '%';
        box.style.width = ((nada.hitbox.xMax - nada.hitbox.xMin) * 100) + '%';
        box.style.height = ((nada.hitbox.yMax - nada.hitbox.yMin) * 100) + '%';
        
        box.innerHTML = `
            ${nada.id}
            <div class="resizer tl" data-dir="tl"></div>
            <div class="resizer tr" data-dir="tr"></div>
            <div class="resizer bl" data-dir="bl"></div>
            <div class="resizer br" data-dir="br"></div>
        `;
        
        hitboxContainer.appendChild(box);
        tambahkanLogikaDragDrop(box, index);
    });
}

function tambahkanLogikaDragDrop(box, noteIndex) {
    let isDragging = false;
    let isResizing = false;
    let resizeDir = '';
    
    let startX, startY, startLeft, startTop, startWidth, startHeight;
    
    const onMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        startX = e.clientX;
        startY = e.clientY;
        
        // Ambil nilai piksel komputasi saat ini
        startLeft = box.offsetLeft;
        startTop = box.offsetTop;
        startWidth = box.offsetWidth;
        startHeight = box.offsetHeight;
        
        if (e.target.classList.contains('resizer')) {
            isResizing = true;
            resizeDir = e.target.dataset.dir;
        } else {
            isDragging = true;
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        const parentW = workspace.offsetWidth;
        const parentH = workspace.offsetHeight;
        
        if (isDragging) {
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;
            
            // Batasi agar tidak keluar gambar
            newLeft = Math.max(0, Math.min(newLeft, parentW - startWidth));
            newTop = Math.max(0, Math.min(newTop, parentH - startHeight));
            
            box.style.left = (newLeft / parentW * 100) + '%';
            box.style.top = (newTop / parentH * 100) + '%';
            
        } else if (isResizing) {
            let newLeft = startLeft;
            let newTop = startTop;
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            if (resizeDir.includes('l')) {
                newLeft = startLeft + dx;
                newWidth = startWidth - dx;
            }
            if (resizeDir.includes('r')) {
                newWidth = startWidth + dx;
            }
            if (resizeDir.includes('t')) {
                newTop = startTop + dy;
                newHeight = startHeight - dy;
            }
            if (resizeDir.includes('b')) {
                newHeight = startHeight + dy;
            }
            
            // Batas minimum ukuran
            if (newWidth > 20 && newHeight > 20) {
                box.style.left = (newLeft / parentW * 100) + '%';
                box.style.top = (newTop / parentH * 100) + '%';
                box.style.width = (newWidth / parentW * 100) + '%';
                box.style.height = (newHeight / parentH * 100) + '%';
            }
        }
        
        simpanKeJSONSementara(box, noteIndex);
    };
    
    const onMouseUp = () => {
        isDragging = false;
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    box.addEventListener('mousedown', onMouseDown);
}

function simpanKeJSONSementara(box, index) {
    const parentW = workspace.offsetWidth;
    const parentH = workspace.offsetHeight;
    
    const xMin = box.offsetLeft / parentW;
    const yMin = box.offsetTop / parentH;
    const xMax = (box.offsetLeft + box.offsetWidth) / parentW;
    const yMax = (box.offsetTop + box.offsetHeight) / parentH;
    
    const note = instrumenAktif.laras[larasAktif].notes[index];
    
    note.hitbox.xMin = parseFloat(xMin.toFixed(3));
    note.hitbox.xMax = parseFloat(xMax.toFixed(3));
    note.hitbox.yMin = parseFloat(yMin.toFixed(3));
    note.hitbox.yMax = parseFloat(yMax.toFixed(3));
}

// Logika Export Data
document.getElementById('btn-salin').addEventListener('click', () => {
    const jsonStr = JSON.stringify(dataInstrumen, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        alert("JSON berhasil disalin ke clipboard!");
    });
});

document.getElementById('btn-download').addEventListener('click', () => {
    const jsonStr = JSON.stringify(dataInstrumen, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "instrumen.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Jalankan
init();
