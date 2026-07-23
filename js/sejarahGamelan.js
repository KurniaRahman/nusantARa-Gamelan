/**
 * Modul untuk menangani fitur Sejarah Gamelan.
 * Bersifat statis dan terpisah dari logika AR.
 */

const dataInstrumen = [
    {
        id: "gong",
        nama: "Gong (Ageng)",
        gambar: "./aset/marker/card_gong.png",
        deskripsiSingkat: "Instrumen terbesar dan paling dihormati, penanda akhir siklus lagu.",
        asalUsul: "Gong adalah salah satu alat musik tertua di Nusantara yang terbuat dari perunggu atau kuningan besar. Sejak zaman kerajaan kuno, gong sering dianggap sebagai alat musik yang paling dihormati dan sakral. Dalam tradisi Jawa, gong sering diberi nama kehormatan (sebutan 'Kyai') karena dipercaya memiliki 'roh' pelindung ansambel gamelan.",
        fungsi: "Gong adalah nyawa sekaligus tanda baca terbesar dalam gamelan. Bunyinya yang sangat rendah dan bergema panjang berfungsi sebagai penanda akhir dari satu putaran lagu (gongan). Saat gong berbunyi, itu menyatukan semua irama alat musik lain menjadi satu harmoni yang utuh.",
        caraMain: "Gong dimainkan dengan cara dipukul tepat pada bagian tonjolan tengahnya (pencon) menggunakan pemukul kayu khusus (tabuh) yang ujungnya dibalut kain atau karet tebal agar menghasilkan suara yang bulat dan tidak pecah."
    },
    {
        id: "bonang-barung",
        nama: "Bonang Barung",
        gambar: "./aset/marker/card_bonang_barung.png",
        deskripsiSingkat: "Kumpulan gong kecil berbentuk pot, pemimpin dan pembuka melodi.",
        asalUsul: "Bonang merupakan kumpulan gong-gong kecil yang disusun secara mendatar di atas tali (rancakan). Alat musik ini sudah menjadi bagian tak terpisahkan dari gamelan sejak era Majapahit, melambangkan kebersamaan masyarakat Jawa yang tersusun rapi.",
        fungsi: "Bonang Barung bertugas sebagai pembuka (buka) atau pemimpin melodi dalam banyak lagu (gendhing) gamelan. Ia memberikan petunjuk nada dan menuntun alur melodi yang akan diikuti oleh instrumen-instrumen lainnya.",
        caraMain: "Pemain bonang duduk bersila di tengah instrumen dan menggunakan dua buah pemukul kayu berlapis tali (disebut bindi) di tangan kanan dan kiri. Bonang dipukul pada bagian pencon (tonjolan) di atasnya dengan tempo yang sedang."
    },
    {
        id: "bonang-penerus",
        nama: "Bonang Penerus",
        gambar: "./aset/marker/card_bonang_penerus.png",
        deskripsiSingkat: "Versi kecil dari bonang barung, bersuara lebih tinggi dan cepat.",
        asalUsul: "Bonang Penerus adalah 'adik' dari Bonang Barung. Bentuknya persis sama, namun ukuran pencon-nya lebih kecil. Pembuatan alat musik kembar ini merupakan filosofi masyarakat tradisional tentang pentingnya generasi penerus yang melengkapi peran generasi sebelumnya.",
        fungsi: "Jika Bonang Barung adalah pemimpin melodi, Bonang Penerus bertugas untuk meramaikan melodi tersebut. Alat musik ini menghasilkan nada satu oktaf lebih tinggi dan dimainkan dua kali lebih cepat dari Bonang Barung, menciptakan nada-nada rapat yang saling bersahutan (teknik imbal).",
        caraMain: "Cara memukulnya sama dengan Bonang Barung (menggunakan dua bindi), namun membutuhkan kelincahan tangan yang jauh lebih tinggi karena temponya yang sangat cepat dan pola pukulannya yang rumit."
    },
    {
        id: "kendang",
        nama: "Kendang (Gendang)",
        gambar: "./aset/marker/card_kendang.png",
        deskripsiSingkat: "Instrumen perkusi berlapis kulit, sang konduktor pengatur tempo.",
        asalUsul: "Kendang adalah instrumen perkusi berlapis kulit hewan (biasanya sapi atau kerbau) yang jejak sejarahnya dapat ditemukan di relief Candi Borobudur (abad ke-9). Alat musik ini tersebar hampir di seluruh budaya Nusantara dengan berbagai ukuran dan nama.",
        fungsi: "Kendang adalah 'Konduktor' alias pengatur ritme dalam gamelan. Pemain kendang (disebut pengendang) bertanggung jawab mengatur cepat-lambatnya tempo (irama), memberi aba-aba kapan lagu dimulai, kapan berubah irama, dan kapan lagu harus diakhiri.",
        caraMain: "Berbeda dengan alat musik gamelan lainnya yang menggunakan alat pemukul, kendang dimainkan murni dengan sentuhan tangan kosong (telapak dan jari). Pemain memukul kedua sisi kulit kendang (sisi besar dan sisi kecil) untuk menghasilkan berbagai macam bunyi seperti 'dang', 'tak', 'tung', dan 'ket'."
    },
    {
        id: "kenong",
        nama: "Kenong",
        gambar: "./aset/marker/card_kenong.png",
        deskripsiSingkat: "Gong mendatar bersuara nyaring penopang struktur melodi.",
        asalUsul: "Kenong adalah instrumen berbentuk seperti gong namun berukuran lebih gemuk dan berposisi horizontal (mendatar). Alat musik ini menjadi salah satu penopang utama struktur lagu dalam tradisi musik keraton di Jawa dan Bali.",
        fungsi: "Jika Gong membagi lagu menjadi bagian yang besar, Kenong bertugas membagi lagu menjadi bagian-bagian yang lebih kecil (disebut kenongan). Suaranya yang khas, nyaring, dan bergema panjang (sustain) berfungsi sebagai pilar-pilar penyangga melodi agar lagu terdengar kokoh.",
        caraMain: "Kenong dipukul menggunakan tabuh kayu yang dililit tali tebal. Pemain memukul bagian pencon secara mantap. Berbeda dengan saron, nada kenong umumnya dibiarkan bergema lama dan tidak langsung dihentikan."
    },
    {
        id: "saron-peking",
        nama: "Saron Penerus (Peking)",
        gambar: "./aset/marker/card_saron_penerus.png",
        deskripsiSingkat: "Saron terkecil bersuara melengking dan riang.",
        asalUsul: "Saron Penerus, atau sering disebut Peking, adalah instrumen berbilah logam (perunggu atau besi) dengan ukuran paling kecil di antara keluarga saron lainnya. Alat ini merepresentasikan suara melengking nan ceria dalam ensambel musik tradisional.",
        fungsi: "Tugas utama Peking adalah merajut melodi dasar. Peking biasanya memainkan nada yang sama dengan Saron Barung, namun dipukul dua kali lipat lebih cepat. Hasilnya adalah suara yang rapat dan bergemerincing, menambah nuansa riang pada lagu.",
        caraMain: "Peking dipukul menggunakan pemukul yang terbuat dari tanduk kerbau (bukan kayu) agar menghasilkan suara yang tajam. Tangan kanan memukul bilah, sementara tangan kiri bertugas memegang bilah yang baru saja dipukul agar suaranya tidak mendengung (teknik pathet)."
    },
    {
        id: "saron-barung",
        nama: "Saron Barung",
        gambar: "./aset/marker/card_saron_barung.png",
        deskripsiSingkat: "Tulang punggung melodi utama berbilah perunggu.",
        asalUsul: "Saron Barung adalah instrumen bilah logam berukuran sedang. Saron merupakan salah satu instrumen melodi tertua yang menjadi tulang punggung dalam ansambel gamelan Jawa dan Bali, mengajarkan harmoni melalui bentuknya yang sederhana namun solid.",
        fungsi: "Saron Barung memegang peran krusial sebagai pembawa melodi inti (disebut balungan). Rangkaian nada yang dimainkan oleh Saron Barung adalah kerangka utama dari sebuah lagu yang nantinya akan dihias oleh alat musik lainnya.",
        caraMain: "Dimainkan menggunakan pemukul kayu. Sama seperti Peking, pemain Saron Barung wajib menguasai teknik 'mematikan nada' (dampening) dengan tangan kiri. Jika bilah sebelumnya tidak dihentikan getarannya saat bilah baru dipukul, suara gamelan akan terdengar bising dan berantakan."
    },
    {
        id: "saron-demung",
        nama: "Saron Panembung (Demung)",
        gambar: "./aset/marker/card_saron_panembung.png",
        deskripsiSingkat: "Keluarga saron terbesar bersuara berat, agung, dan mantap.",
        asalUsul: "Saron Panembung, yang lebih populer disebut Demung, adalah anggota keluarga saron dengan ukuran bilah yang paling besar dan tebal. Istilah 'Panembung' memiliki arti sesuatu yang bersuara besar dan berwibawa.",
        fungsi: "Demung memainkan melodi dasar (balungan) persis seperti Saron Barung, namun menghasilkan nada satu oktaf lebih rendah. Suaranya yang berat dan mengayomi berfungsi untuk memberi kesan agung, tenang, dan mantap pada komposisi musik gamelan.",
        caraMain: "Alat musik ini dipukul dengan tabuh kayu yang ukurannya lebih besar dan berat dibanding pemukul saron biasa. Ayunan tangan pemain demung biasanya lebih lambat dan bertenaga. Tangan kiri juga tetap digunakan untuk meredam getaran bilah (teknik pathet)."
    }
];

let sudahDiinisialisasi = false;

function buatKartuInstrumen(item, index) {
    const fallbackImage = `https://placehold.co/1080x1350/ef4444/ffffff?text=${encodeURIComponent(item.nama.substring(0, 3))}`;
    
    return `
        <div class="kartu-katalog shrink-0 w-28 h-40 md:w-36 md:h-52 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 border-4 border-white/50 hover:border-white hover:scale-105 hover:shadow-2xl hover:-translate-y-2 relative group" data-index="${index}">
            <img src="${item.gambar}" alt="${item.nama}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${fallbackImage}';">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                <p class="text-white text-xs md:text-sm font-bold text-center drop-shadow-md">${item.nama}</p>
            </div>
        </div>
    `;
}

function bukaModal(index) {
    const dataAktif = dataInstrumen[index];
    if (!dataAktif) return;
    
    const modalSejarah = document.getElementById('modal-sejarah');
    const modalJudul = document.getElementById('judul-modal-sejarah');
    const modalAsalUsul = document.getElementById('teks-asal-usul');
    const modalFungsi = document.getElementById('teks-fungsi');
    const modalCaraMain = document.getElementById('teks-cara-memainkan');

    if (!modalJudul || !modalSejarah) return;

    modalJudul.textContent = dataAktif.nama;
    modalAsalUsul.textContent = dataAktif.asalUsul;
    modalFungsi.textContent = dataAktif.fungsi;
    modalCaraMain.textContent = dataAktif.caraMain;

    modalSejarah.classList.remove('hidden');
    // Tambahkan sedikit delay agar transisi opasitas dan skala terlihat
    setTimeout(() => {
        const kotakModal = modalSejarah.querySelector('.relative.bg-white');
        if (kotakModal) {
            kotakModal.classList.remove('scale-95', 'opacity-0');
            kotakModal.classList.add('scale-100', 'opacity-100');
        }
    }, 10);
}

export function inisialisasiSejarah() {
    if (sudahDiinisialisasi) return;

    const gridContainer = document.getElementById('grid-katalog-sejarah');
    const modalSejarah = document.getElementById('modal-sejarah');
    const tombolTutupModal = document.querySelector('.tombol-tutup-modal');
    const overlayModal = document.querySelector('.modal-overlay');

    // Generate Kartu ke dalam Grid
    if (gridContainer) {
        gridContainer.innerHTML = dataInstrumen.map((item, index) => buatKartuInstrumen(item, index)).join('');
        
        // Pasang Event Listener ke masing-masing kartu
        const kartuElements = gridContainer.querySelectorAll('.kartu-katalog');
        kartuElements.forEach(kartu => {
            kartu.addEventListener('click', () => {
                const index = parseInt(kartu.getAttribute('data-index'));
                bukaModal(index);
            });
        });
    }

    // Event Listener Tutup Modal
    const tutupModal = () => {
        if (!modalSejarah) return;
        const kotakModal = modalSejarah.querySelector('.relative.bg-white');
        if (kotakModal) {
            kotakModal.classList.remove('scale-100', 'opacity-100');
            kotakModal.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
            modalSejarah.classList.add('hidden');
        }, 200); // Sesuaikan dengan durasi transisi
    };

    if (tombolTutupModal) tombolTutupModal.addEventListener('click', tutupModal);
    if (overlayModal) overlayModal.addEventListener('click', tutupModal);

    sudahDiinisialisasi = true;
}

export function bersihkanSejarah() {
    const modalSejarah = document.getElementById('modal-sejarah');
    if (modalSejarah && !modalSejarah.classList.contains('hidden')) {
        const kotakModal = modalSejarah.querySelector('.relative.bg-white');
        if (kotakModal) {
            kotakModal.classList.remove('scale-100', 'opacity-100');
            kotakModal.classList.add('scale-95', 'opacity-0');
        }
        modalSejarah.classList.add('hidden');
    }
}
