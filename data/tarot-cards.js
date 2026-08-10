// OTR — Tarot Card Data
// AUTO-GENERATED (Phase 2 — Tarot Data Foundation). 78 kartu: 22 Major + 56 Minor Arcana.
// Jangan edit manual satu-satu di sini kalau butuh perubahan massal — lebih baik
// perbarui generator lalu re-generate, supaya konsistensi struktur terjaga.
//
// Schema per kartu (Master Spec §7):
// { id, name, slug, arcana, suit, number, rank, image, keywords[],
//   upright: { general, love, career, spiritual, advice },
//   reversed: { general, love, career, spiritual, advice },
//   yesNo: "yes" | "no" | "maybe" }
//
// Catatan konten: teks Major Arcana (22 kartu) ditulis individual. Teks Minor
// Arcana (56 kartu) di-generate dari kombinasi tema suit x tema rank/court —
// konsisten dan valid secara struktur untuk MVP, tapi masih generik secara
// bahasa. Bisa diperkaya lebih lanjut per-kartu di iterasi berikutnya tanpa
// mengubah struktur/schema ini.

export const TAROT_CARDS = [
  {
    "id": "major_00",
    "name": "The Fool",
    "slug": "the-fool",
    "arcana": "major",
    "suit": null,
    "number": 0,
    "rank": null,
    "image": "/assets/images/tarot/major/the-fool.webp",
    "keywords": [
      "Awal Baru",
      "Kepolosan",
      "Petualangan",
      "Spontanitas"
    ],
    "upright": {
      "general": "Sebuah lembaran baru terbuka. Ada dorongan untuk melangkah tanpa terlalu banyak rencana, dipandu oleh rasa percaya pada proses.",
      "love": "Fase baru yang ringan dan spontan; potensi hubungan baru atau babak baru dalam hubungan yang ada.",
      "career": "Peluang atau langkah karier baru yang berani, meski belum semua detail jelas.",
      "spiritual": "Ajakan untuk mempercayai perjalanan tanpa perlu tahu tujuannya lebih dulu.",
      "advice": "Ambil langkah pertama itu. Ketidaktahuan bukan alasan untuk diam."
    },
    "reversed": {
      "general": "Kecerobohan atau keraguan yang membuat langkah tertunda; energi awal yang terasa berisiko tanpa arah.",
      "love": "Keputusan terburu-buru dalam hubungan, atau justru rasa takut mengambil langkah apa pun.",
      "career": "Kurangnya persiapan sebelum melompat ke peluang baru; perlu mengevaluasi ulang rencana.",
      "spiritual": "Terjebak antara ingin bebas dan takut kehilangan pijakan.",
      "advice": "Jeda sebentar untuk menimbang risiko sebelum melangkah lebih jauh."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_01",
    "name": "The Magician",
    "slug": "the-magician",
    "arcana": "major",
    "suit": null,
    "number": 1,
    "rank": null,
    "image": "/assets/images/tarot/major/the-magician.webp",
    "keywords": [
      "Kemauan",
      "Manifestasi",
      "Sumber Daya",
      "Kepiawaian"
    ],
    "upright": {
      "general": "Semua alat yang dibutuhkan sudah ada di tangan; saatnya mengubah niat menjadi tindakan nyata.",
      "love": "Kemampuan berkomunikasi dengan jelas dan menciptakan hubungan yang diinginkan secara sadar.",
      "career": "Momentum kuat untuk memulai proyek atau menunjukkan keahlian secara nyata.",
      "spiritual": "Kesadaran bahwa pikiran dan kehendak punya kekuatan untuk membentuk realitas.",
      "advice": "Fokuskan energi pada satu tujuan dan mulai bertindak sekarang."
    },
    "reversed": {
      "general": "Potensi yang belum tergarap, atau kemampuan yang disalahgunakan untuk memanipulasi situasi.",
      "love": "Ketidakjujuran atau kata-kata manis yang tidak sejalan dengan tindakan.",
      "career": "Rencana yang bagus di atas kertas tapi belum dieksekusi, atau taktik yang licik.",
      "spiritual": "Kehendak yang terpecah, sulit fokus pada satu niat.",
      "advice": "Periksa kembali niat sebenarnya sebelum bertindak."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_02",
    "name": "The High Priestess",
    "slug": "the-high-priestess",
    "arcana": "major",
    "suit": null,
    "number": 2,
    "rank": null,
    "image": "/assets/images/tarot/major/the-high-priestess.webp",
    "keywords": [
      "Intuisi",
      "Misteri",
      "Alam Bawah Sadar",
      "Kebijaksanaan Batin"
    ],
    "upright": {
      "general": "Jawaban tidak datang dari logika, melainkan dari kepekaan batin yang tenang.",
      "love": "Ada hal yang belum terucap; dengarkan apa yang tersirat, bukan hanya yang tersurat.",
      "career": "Simpan rencana penting untuk sementara; belum saatnya semua dibuka ke publik.",
      "spiritual": "Pintu menuju kebijaksanaan dalam terbuka lebar bila ruang hening diberi tempat.",
      "advice": "Percayai firasat, meski belum bisa menjelaskannya secara logis."
    },
    "reversed": {
      "general": "Sinyal intuitif diabaikan, atau informasi penting sengaja disembunyikan.",
      "love": "Kurangnya keterbukaan emosional; ada jarak yang belum dijembatani.",
      "career": "Rahasia atau informasi yang bocor sebelum waktunya.",
      "spiritual": "Terputus dari suara batin karena terlalu sibuk dengan hal eksternal.",
      "advice": "Luangkan waktu sendiri untuk kembali mendengar diri sendiri."
    },
    "yesNo": "maybe"
  },
  {
    "id": "major_03",
    "name": "The Empress",
    "slug": "the-empress",
    "arcana": "major",
    "suit": null,
    "number": 3,
    "rank": null,
    "image": "/assets/images/tarot/major/the-empress.webp",
    "keywords": [
      "Kesuburan",
      "Kelimpahan",
      "Alam",
      "Pengasuhan"
    ],
    "upright": {
      "general": "Musim pertumbuhan dan kelimpahan; sesuatu yang ditanam mulai berbuah dengan sendirinya.",
      "love": "Kehangatan, kenyamanan, dan rasa dirawat dalam hubungan.",
      "career": "Hasil kerja mulai terlihat; ini waktu yang subur untuk berkembang.",
      "spiritual": "Keterhubungan dengan siklus alam dan penerimaan terhadap diri sendiri.",
      "advice": "Beri ruang untuk sesuatu tumbuh dengan wajar, tanpa dipaksa."
    },
    "reversed": {
      "general": "Stagnasi atau kelebihan yang membuat lelah; energi mengasuh yang terkuras habis.",
      "love": "Ketergantungan berlebihan atau kurangnya perhatian pada diri sendiri dalam hubungan.",
      "career": "Proyek yang mandek karena kurang perawatan, atau kelelahan akibat terlalu banyak memberi.",
      "spiritual": "Terputus dari alam dan tubuh sendiri.",
      "advice": "Isi ulang energi sebelum kembali memberi kepada orang lain."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_04",
    "name": "The Emperor",
    "slug": "the-emperor",
    "arcana": "major",
    "suit": null,
    "number": 4,
    "rank": null,
    "image": "/assets/images/tarot/major/the-emperor.webp",
    "keywords": [
      "Struktur",
      "Otoritas",
      "Stabilitas",
      "Kepemimpinan"
    ],
    "upright": {
      "general": "Struktur dan disiplin menciptakan fondasi yang kokoh untuk melangkah lebih jauh.",
      "love": "Komitmen yang jelas dan rasa aman dalam hubungan yang stabil.",
      "career": "Kepemimpinan yang tegas membawa hasil; aturan dan rencana jelas sangat membantu.",
      "spiritual": "Menemukan kekuatan lewat keteraturan, bukan lewat kekacauan.",
      "advice": "Tetapkan batas yang jelas dan pegang teguh rencana yang sudah dibuat."
    },
    "reversed": {
      "general": "Kontrol berlebihan atau kekakuan yang justru menghambat pertumbuhan.",
      "love": "Dominasi salah satu pihak, atau kebutuhan akan kontrol yang membuat sesak.",
      "career": "Kepemimpinan otoriter, atau sebaliknya, kurangnya struktur yang menyebabkan kekacauan.",
      "spiritual": "Terlalu terikat pada aturan hingga kehilangan fleksibilitas batin.",
      "advice": "Longgarkan sedikit kendali; tidak semua hal perlu diatur ketat."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_05",
    "name": "The Hierophant",
    "slug": "the-hierophant",
    "arcana": "major",
    "suit": null,
    "number": 5,
    "rank": null,
    "image": "/assets/images/tarot/major/the-hierophant.webp",
    "keywords": [
      "Tradisi",
      "Bimbingan",
      "Konformitas",
      "Institusi"
    ],
    "upright": {
      "general": "Nilai, tradisi, atau bimbingan dari figur berpengalaman menjadi pegangan yang berguna.",
      "love": "Hubungan yang dibangun di atas nilai bersama, komitmen formal, atau restu keluarga.",
      "career": "Belajar dari mentor, mengikuti prosedur, atau bekerja dalam sistem yang mapan.",
      "spiritual": "Menemukan makna lewat praktik atau komunitas yang terstruktur.",
      "advice": "Cari nasihat dari yang lebih berpengalaman sebelum menentukan arah sendiri."
    },
    "reversed": {
      "general": "Aturan yang terasa mengekang, atau keinginan untuk keluar dari jalur konvensional.",
      "love": "Menantang norma dalam hubungan, atau ketidakcocokan nilai dengan pasangan.",
      "career": "Merasa terkurung sistem yang kaku; dorongan untuk mencari cara sendiri.",
      "spiritual": "Mempertanyakan kembali kepercayaan yang selama ini diikuti tanpa sadar.",
      "advice": "Boleh menyimpang dari tradisi bila itu memang tak lagi selaras dengan diri sendiri."
    },
    "yesNo": "maybe"
  },
  {
    "id": "major_06",
    "name": "The Lovers",
    "slug": "the-lovers",
    "arcana": "major",
    "suit": null,
    "number": 6,
    "rank": null,
    "image": "/assets/images/tarot/major/the-lovers.webp",
    "keywords": [
      "Cinta",
      "Harmoni",
      "Pilihan",
      "Keselarasan Nilai"
    ],
    "upright": {
      "general": "Sebuah pilihan penting muncul, dan menyelaraskannya dengan nilai inti akan membawa harmoni.",
      "love": "Koneksi yang dalam, saling memahami, dan keselarasan nilai dengan orang lain.",
      "career": "Kemitraan atau kolaborasi yang saling menguntungkan; pilihan karier yang sesuai passion.",
      "spiritual": "Integrasi antara berbagai sisi diri menjadi satu keutuhan yang selaras.",
      "advice": "Pilih opsi yang paling sejalan dengan nilai, bukan yang paling nyaman sesaat."
    },
    "reversed": {
      "general": "Ketidakselarasan nilai, konflik batin, atau pilihan yang sulit dan menyakitkan.",
      "love": "Ketidakcocokan, komunikasi yang buruk, atau godaan yang mengganggu komitmen.",
      "career": "Kemitraan yang tidak seimbang, atau pilihan karier yang bertentangan dengan nilai pribadi.",
      "spiritual": "Terpecah antara keinginan dan prinsip; sulit menemukan keselarasan.",
      "advice": "Jujur pada diri sendiri tentang apa yang benar-benar diinginkan sebelum memutuskan."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_07",
    "name": "The Chariot",
    "slug": "the-chariot",
    "arcana": "major",
    "suit": null,
    "number": 7,
    "rank": null,
    "image": "/assets/images/tarot/major/the-chariot.webp",
    "keywords": [
      "Kemauan Keras",
      "Kendali",
      "Kemenangan",
      "Determinasi"
    ],
    "upright": {
      "general": "Dua kekuatan yang bertentangan berhasil disatukan dan diarahkan menuju satu tujuan.",
      "love": "Mengatasi perbedaan bersama pasangan lewat kemauan dan arah yang sama.",
      "career": "Kemajuan pesat berkat fokus, disiplin, dan kepercayaan diri yang kuat.",
      "spiritual": "Penguasaan diri yang datang dari menyatukan kehendak dan emosi.",
      "advice": "Tetap fokus pada tujuan meski ada tarikan dari arah berbeda."
    },
    "reversed": {
      "general": "Arah yang kacau, atau kemauan keras yang justru membuat situasi lepas kendali.",
      "love": "Perebutan kendali dalam hubungan, atau tujuan yang tidak lagi sejalan.",
      "career": "Proyek yang mandek karena kurang fokus, atau agresivitas yang kontraproduktif.",
      "spiritual": "Kehilangan arah karena terlalu memaksakan kehendak.",
      "advice": "Berhenti sejenak, tentukan ulang arah sebelum melaju lebih cepat."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_08",
    "name": "Strength",
    "slug": "strength",
    "arcana": "major",
    "suit": null,
    "number": 8,
    "rank": null,
    "image": "/assets/images/tarot/major/strength.webp",
    "keywords": [
      "Keberanian",
      "Kesabaran",
      "Kasih Sayang",
      "Pengendalian Diri"
    ],
    "upright": {
      "general": "Kekuatan sejati datang dari kelembutan dan kesabaran, bukan paksaan.",
      "love": "Mengelola konflik dengan kasih sayang dan pengertian, bukan dengan dominasi.",
      "career": "Menghadapi tekanan dengan tenang dan gigih membuahkan hasil jangka panjang.",
      "spiritual": "Menjinakkan sisi impulsif diri lewat welas asih pada diri sendiri.",
      "advice": "Hadapi tantangan dengan kesabaran, bukan dengan melawan secara kasar."
    },
    "reversed": {
      "general": "Keraguan diri atau energi yang terkuras karena menahan sesuatu terlalu lama.",
      "love": "Kurangnya kepercayaan diri dalam hubungan, atau pola yang saling melemahkan.",
      "career": "Merasa tidak berdaya menghadapi tekanan, atau memaksakan kontrol berlebihan.",
      "spiritual": "Berjuang mendamaikan sisi diri yang impulsif dengan sisi yang tenang.",
      "advice": "Bangun kembali kepercayaan diri sebelum menghadapi tantangan berikutnya."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_09",
    "name": "The Hermit",
    "slug": "the-hermit",
    "arcana": "major",
    "suit": null,
    "number": 9,
    "rank": null,
    "image": "/assets/images/tarot/major/the-hermit.webp",
    "keywords": [
      "Introspeksi",
      "Kesendirian",
      "Pencarian Batin",
      "Bimbingan Dalam"
    ],
    "upright": {
      "general": "Mundur sejenak dari keramaian untuk mencari jawaban lewat refleksi mendalam.",
      "love": "Butuh ruang sendiri untuk memahami perasaan sebelum melangkah dalam hubungan.",
      "career": "Waktu untuk mengevaluasi arah karier secara mandiri, jauh dari tekanan luar.",
      "spiritual": "Perjalanan batin yang dalam menuju kebijaksanaan pribadi.",
      "advice": "Beri diri waktu sendiri sebelum mengambil keputusan besar."
    },
    "reversed": {
      "general": "Isolasi berlebihan yang berujung kesepian, atau enggan mencari bantuan saat dibutuhkan.",
      "love": "Menarik diri terlalu jauh dari pasangan hingga menciptakan jarak.",
      "career": "Terlalu lama menunda keputusan karena terus-menerus merenung tanpa bertindak.",
      "spiritual": "Kehilangan arah karena introspeksi yang berubah jadi keraguan berlarut.",
      "advice": "Saatnya keluar dari kesendirian dan berbagi apa yang sudah direnungkan."
    },
    "yesNo": "maybe"
  },
  {
    "id": "major_10",
    "name": "Wheel of Fortune",
    "slug": "wheel-of-fortune",
    "arcana": "major",
    "suit": null,
    "number": 10,
    "rank": null,
    "image": "/assets/images/tarot/major/wheel-of-fortune.webp",
    "keywords": [
      "Siklus",
      "Takdir",
      "Titik Balik",
      "Peluang"
    ],
    "upright": {
      "general": "Roda kehidupan berputar; sebuah titik balik membawa perubahan yang sudah lama dinanti.",
      "love": "Momen tak terduga yang mengubah arah hubungan menjadi lebih baik.",
      "career": "Peluang baru datang lewat momentum yang sedang berpihak.",
      "spiritual": "Menerima bahwa hidup bergerak dalam siklus yang lebih besar dari kendali pribadi.",
      "advice": "Manfaatkan momentum ini selagi ada; jangan biarkan berlalu begitu saja."
    },
    "reversed": {
      "general": "Perubahan yang terasa di luar kendali, atau siklus buruk yang berulang.",
      "love": "Rasa tidak stabil, seperti keadaan yang naik-turun tanpa arah jelas.",
      "career": "Nasib yang terasa kurang berpihak; perlu bersabar menunggu putaran berikutnya.",
      "spiritual": "Kesulitan menerima bahwa tidak semua hal bisa dikendalikan.",
      "advice": "Fokus pada apa yang bisa dikendalikan, lepaskan yang tidak bisa."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_11",
    "name": "Justice",
    "slug": "justice",
    "arcana": "major",
    "suit": null,
    "number": 11,
    "rank": null,
    "image": "/assets/images/tarot/major/justice.webp",
    "keywords": [
      "Keadilan",
      "Kebenaran",
      "Sebab-Akibat",
      "Kejelasan"
    ],
    "upright": {
      "general": "Setiap tindakan membawa konsekuensinya sendiri; kejelasan dan keadilan mulai terlihat.",
      "love": "Hubungan yang setara, jujur, dan saling menghormati.",
      "career": "Keputusan yang adil, kontrak yang jelas, atau hasil kerja keras yang terbayar setimpal.",
      "spiritual": "Memahami hukum sebab-akibat dan bertanggung jawab atas pilihan sendiri.",
      "advice": "Ambil keputusan berdasarkan fakta, bukan emosi sesaat."
    },
    "reversed": {
      "general": "Ketidakadilan, keputusan yang bias, atau konsekuensi yang belum juga datang.",
      "love": "Ketidakseimbangan dalam memberi dan menerima di dalam hubungan.",
      "career": "Perselisihan yang belum terselesaikan, atau proses yang terasa tidak transparan.",
      "spiritual": "Sulit menerima tanggung jawab atas pilihan masa lalu.",
      "advice": "Hadapi konsekuensi dengan jujur, alih-alih menghindarinya."
    },
    "yesNo": "maybe"
  },
  {
    "id": "major_12",
    "name": "The Hanged Man",
    "slug": "the-hanged-man",
    "arcana": "major",
    "suit": null,
    "number": 12,
    "rank": null,
    "image": "/assets/images/tarot/major/the-hanged-man.webp",
    "keywords": [
      "Jeda",
      "Perspektif Baru",
      "Pengorbanan",
      "Penyerahan"
    ],
    "upright": {
      "general": "Menunda tindakan untuk melihat situasi dari sudut pandang yang sama sekali baru.",
      "love": "Merelakan kendali dalam hubungan untuk memahami sudut pandang pasangan.",
      "career": "Situasi tertahan sementara; ini waktu yang tepat untuk berpikir ulang, bukan memaksakan.",
      "spiritual": "Pencerahan datang lewat penyerahan, bukan lewat perjuangan.",
      "advice": "Berhenti memaksa; biarkan situasi menunjukkan jalannya sendiri."
    },
    "reversed": {
      "general": "Menunda-nunda tanpa alasan jelas, atau merasa terjebak dalam situasi yang stagnan.",
      "love": "Pengorbanan yang tidak seimbang, salah satu pihak merasa dirugikan.",
      "career": "Stagnasi berkepanjangan karena enggan mengambil keputusan.",
      "spiritual": "Kesulitan melepaskan kendali meski situasi menuntutnya.",
      "advice": "Sudah waktunya bertindak; jeda yang terlalu lama justru merugikan."
    },
    "yesNo": "no"
  },
  {
    "id": "major_13",
    "name": "Death",
    "slug": "death",
    "arcana": "major",
    "suit": null,
    "number": 13,
    "rank": null,
    "image": "/assets/images/tarot/major/death.webp",
    "keywords": [
      "Akhir",
      "Transformasi",
      "Transisi",
      "Pelepasan"
    ],
    "upright": {
      "general": "Satu babak berakhir untuk memberi ruang bagi babak baru yang belum terbayangkan.",
      "love": "Berakhirnya sebuah fase hubungan (bukan selalu putus) yang membuka bentuk baru.",
      "career": "Peran atau proyek lama berakhir, membuka jalan bagi arah yang berbeda.",
      "spiritual": "Transformasi mendalam yang menuntut melepaskan versi diri yang lama.",
      "advice": "Lepaskan apa yang sudah tidak lagi berguna, meski terasa berat."
    },
    "reversed": {
      "general": "Menolak perubahan yang sebenarnya sudah tak terhindarkan, hingga terasa terjebak.",
      "love": "Kesulitan mengakhiri hubungan yang sudah tidak sehat.",
      "career": "Bertahan pada situasi kerja yang sudah tidak lagi relevan.",
      "spiritual": "Ketakutan akan perubahan menghambat pertumbuhan.",
      "advice": "Terima bahwa sesuatu memang perlu berakhir agar yang baru bisa dimulai."
    },
    "yesNo": "no"
  },
  {
    "id": "major_14",
    "name": "Temperance",
    "slug": "temperance",
    "arcana": "major",
    "suit": null,
    "number": 14,
    "rank": null,
    "image": "/assets/images/tarot/major/temperance.webp",
    "keywords": [
      "Keseimbangan",
      "Moderasi",
      "Perpaduan",
      "Kesabaran"
    ],
    "upright": {
      "general": "Perpaduan yang selaras antara dua hal yang berbeda menciptakan keseimbangan baru.",
      "love": "Kesabaran dan kompromi yang membawa keharmonisan dalam hubungan.",
      "career": "Pendekatan yang seimbang dan bertahap membuahkan hasil yang stabil.",
      "spiritual": "Menemukan titik tengah antara ekstrem, menuju keselarasan batin.",
      "advice": "Ambil jalan tengah; hindari langkah yang terlalu ekstrem."
    },
    "reversed": {
      "general": "Ketidakseimbangan, berlebihan di satu sisi dan kekurangan di sisi lain.",
      "love": "Kompromi yang timpang, atau ketidaksabaran yang memicu gesekan.",
      "career": "Pendekatan yang terburu-buru atau tidak konsisten menghambat hasil.",
      "spiritual": "Kesulitan menemukan titik tenang di tengah kekacauan.",
      "advice": "Perlambat, cari kembali ritme yang lebih seimbang."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_15",
    "name": "The Devil",
    "slug": "the-devil",
    "arcana": "major",
    "suit": null,
    "number": 15,
    "rank": null,
    "image": "/assets/images/tarot/major/the-devil.webp",
    "keywords": [
      "Keterikatan",
      "Godaan",
      "Batasan Diri",
      "Bayang-Bayang"
    ],
    "upright": {
      "general": "Terikat pada pola, kebiasaan, atau situasi yang sebenarnya membatasi kebebasan sendiri.",
      "love": "Hubungan yang posesif, ketergantungan, atau pola yang sulit dilepaskan.",
      "career": "Terjebak dalam pekerjaan yang menguras demi rasa aman semu.",
      "spiritual": "Menghadapi sisi bayangan diri yang selama ini dihindari.",
      "advice": "Kenali pola yang mengikat, lalu mulai lepaskan sedikit demi sedikit."
    },
    "reversed": {
      "general": "Mulai menyadari dan melepaskan diri dari ikatan atau kebiasaan yang membatasi.",
      "love": "Keberanian untuk keluar dari hubungan yang tidak sehat.",
      "career": "Membebaskan diri dari rutinitas atau situasi kerja yang menjebak.",
      "spiritual": "Proses membebaskan diri dari ketakutan dan kebiasaan lama.",
      "advice": "Ambil langkah kecil untuk keluar dari pola yang selama ini menahan."
    },
    "yesNo": "no"
  },
  {
    "id": "major_16",
    "name": "The Tower",
    "slug": "the-tower",
    "arcana": "major",
    "suit": null,
    "number": 16,
    "rank": null,
    "image": "/assets/images/tarot/major/the-tower.webp",
    "keywords": [
      "Keruntuhan Mendadak",
      "Pengungkapan",
      "Kekacauan",
      "Kebangkitan"
    ],
    "upright": {
      "general": "Struktur yang rapuh runtuh secara tiba-tiba, mengungkap kebenaran yang selama ini tersembunyi.",
      "love": "Kejutan atau krisis yang mengguncang fondasi hubungan.",
      "career": "Perubahan mendadak seperti kehilangan posisi atau rencana yang berantakan.",
      "spiritual": "Keruntuhan keyakinan lama yang justru membuka jalan menuju kebenaran baru.",
      "advice": "Biarkan yang rapuh runtuh; itu membuka ruang untuk membangun yang lebih kokoh."
    },
    "reversed": {
      "general": "Menghindari krisis yang sebenarnya tak terelakkan, hingga keruntuhan tertunda tapi tetap datang.",
      "love": "Konflik yang dipendam alih-alih dihadapi secara terbuka.",
      "career": "Menunda perubahan besar yang sebenarnya sudah mendesak dilakukan.",
      "spiritual": "Ketakutan menghadapi kebenaran yang mengguncang keyakinan.",
      "advice": "Hadapi kebenaran sekarang, sebelum tekanan makin membesar."
    },
    "yesNo": "no"
  },
  {
    "id": "major_17",
    "name": "The Star",
    "slug": "the-star",
    "arcana": "major",
    "suit": null,
    "number": 17,
    "rank": null,
    "image": "/assets/images/tarot/major/the-star.webp",
    "keywords": [
      "Harapan",
      "Pemulihan",
      "Inspirasi",
      "Ketenangan"
    ],
    "upright": {
      "general": "Setelah masa sulit, harapan dan ketenangan mulai kembali menuntun arah.",
      "love": "Rasa percaya dan keintiman yang pulih setelah masa yang berat.",
      "career": "Inspirasi baru mengalir; ini waktu yang baik untuk merancang ulang tujuan.",
      "spiritual": "Terhubung kembali dengan harapan dan kepercayaan pada semesta.",
      "advice": "Percaya pada proses pemulihan; biarkan harapan menuntun langkah."
    },
    "reversed": {
      "general": "Rasa putus asa atau kehilangan arah setelah masa sulit yang belum sepenuhnya pulih.",
      "love": "Kepercayaan yang belum sepenuhnya kembali setelah luka lama.",
      "career": "Kehilangan inspirasi atau motivasi untuk melangkah maju.",
      "spiritual": "Kesulitan menemukan kembali rasa percaya pada diri sendiri.",
      "advice": "Beri waktu untuk pemulihan; harapan akan kembali secara perlahan."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_18",
    "name": "The Moon",
    "slug": "the-moon",
    "arcana": "major",
    "suit": null,
    "number": 18,
    "rank": null,
    "image": "/assets/images/tarot/major/the-moon.webp",
    "keywords": [
      "Ilusi",
      "Ketidaksadaran",
      "Kecemasan",
      "Intuisi Kabur"
    ],
    "upright": {
      "general": "Sesuatu terasa belum jelas; bayangan dan kecemasan membuat jalan sulit terlihat.",
      "love": "Kesalahpahaman atau ketidakpastian yang belum terungkap sepenuhnya.",
      "career": "Situasi yang membingungkan, informasi belum lengkap untuk mengambil keputusan.",
      "spiritual": "Perjalanan melalui area gelap dari alam bawah sadar.",
      "advice": "Jangan buru-buru memutuskan saat semuanya masih kabur; tunggu kejelasan."
    },
    "reversed": {
      "general": "Kabut mulai menyingkap, kebenaran yang tersembunyi perlahan terungkap.",
      "love": "Kesalahpahaman mulai terurai setelah komunikasi yang lebih jujur.",
      "career": "Kejelasan mulai muncul setelah periode kebingungan.",
      "spiritual": "Ketakutan yang mulai dipahami dan dilepaskan.",
      "advice": "Teruslah mencari kejelasan; jawaban sudah mulai mendekat."
    },
    "yesNo": "no"
  },
  {
    "id": "major_19",
    "name": "The Sun",
    "slug": "the-sun",
    "arcana": "major",
    "suit": null,
    "number": 19,
    "rank": null,
    "image": "/assets/images/tarot/major/the-sun.webp",
    "keywords": [
      "Kegembiraan",
      "Vitalitas",
      "Kejelasan",
      "Keberhasilan"
    ],
    "upright": {
      "general": "Kejelasan, kegembiraan, dan vitalitas menyinari situasi yang sedang berjalan.",
      "love": "Kebahagiaan yang tulus dan hubungan yang terasa ringan serta terbuka.",
      "career": "Keberhasilan yang terlihat jelas, diakui, dan membawa kepuasan.",
      "spiritual": "Rasa syukur dan kegembiraan murni atas keberadaan diri.",
      "advice": "Nikmati momen baik ini sepenuhnya, dan bagikan kegembiraannya."
    },
    "reversed": {
      "general": "Kebahagiaan yang tertunda, atau optimisme berlebihan yang menutupi masalah nyata.",
      "love": "Kurang keterbukaan, atau kebahagiaan yang terasa dipaksakan.",
      "career": "Keberhasilan yang belum sepenuhnya terwujud, atau kepuasan yang semu.",
      "spiritual": "Sulit merasakan kegembiraan meski secara lahiriah semua tampak baik.",
      "advice": "Cari sumber kebahagiaan yang lebih tulus, bukan sekadar tampilan luar."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_20",
    "name": "Judgement",
    "slug": "judgement",
    "arcana": "major",
    "suit": null,
    "number": 20,
    "rank": null,
    "image": "/assets/images/tarot/major/judgement.webp",
    "keywords": [
      "Kebangkitan",
      "Panggilan Batin",
      "Evaluasi",
      "Pengampunan"
    ],
    "upright": {
      "general": "Panggilan untuk bangkit, mengevaluasi perjalanan, dan menjawab sesuatu yang lebih besar dari diri sendiri.",
      "love": "Momen kejujuran yang membawa hubungan ke pemahaman yang lebih dalam.",
      "career": "Evaluasi menyeluruh yang membuka jalan menuju panggilan yang lebih sesuai.",
      "spiritual": "Kebangkitan kesadaran dan penerimaan atas perjalanan yang sudah dilalui.",
      "advice": "Dengarkan panggilan batin dan beranilah menjawabnya."
    },
    "reversed": {
      "general": "Keraguan pada diri sendiri, atau enggan mengevaluasi ulang pilihan yang sudah diambil.",
      "love": "Sulit memaafkan diri sendiri atau pasangan atas kesalahan masa lalu.",
      "career": "Menunda evaluasi penting yang sebenarnya sudah waktunya dilakukan.",
      "spiritual": "Merasa terputus dari tujuan atau panggilan hidup yang lebih besar.",
      "advice": "Beri diri ruang untuk memaafkan sebelum melangkah ke fase berikutnya."
    },
    "yesNo": "yes"
  },
  {
    "id": "major_21",
    "name": "The World",
    "slug": "the-world",
    "arcana": "major",
    "suit": null,
    "number": 21,
    "rank": null,
    "image": "/assets/images/tarot/major/the-world.webp",
    "keywords": [
      "Penyelesaian",
      "Keutuhan",
      "Pencapaian",
      "Integrasi"
    ],
    "upright": {
      "general": "Sebuah siklus besar mencapai penyelesaian yang utuh, membawa rasa pencapaian.",
      "love": "Hubungan yang terasa lengkap, matang, dan saling melengkapi.",
      "career": "Pencapaian besar yang menandai selesainya satu tahap panjang.",
      "spiritual": "Rasa keutuhan setelah perjalanan panjang mengintegrasikan banyak pelajaran.",
      "advice": "Rayakan pencapaian ini sepenuhnya sebelum memulai siklus baru."
    },
    "reversed": {
      "general": "Penyelesaian yang tertunda, atau rasa belum tuntas meski sudah dekat garis akhir.",
      "love": "Hubungan yang terasa mandek, belum mencapai keselarasan penuh.",
      "career": "Proyek yang hampir selesai tapi terhambat detail terakhir.",
      "spiritual": "Kesulitan merasa utuh meski secara lahiriah semua sudah tercapai.",
      "advice": "Selesaikan detail-detail kecil yang tersisa sebelum melangkah lebih jauh."
    },
    "yesNo": "yes"
  },
  {
    "id": "wands_01",
    "name": "Ace of Wands",
    "slug": "ace-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 1,
    "rank": "ace",
    "image": "/assets/images/tarot/wands/ace-of-wands.webp",
    "keywords": [
      "Awal Baru",
      "Wands",
      "Potensi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan potensi mentah dan benih baru yang siap ditanam dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai potensi mentah dan benih baru yang siap ditanam, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti potensi mentah dan benih baru yang siap ditanam, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui potensi mentah dan benih baru yang siap ditanam.",
      "advice": "Sikapi momen potensi mentah dan benih baru yang siap ditanam ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari potensi mentah dan benih baru yang siap ditanam muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada potensi mentah dan benih baru yang siap ditanam, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, potensi mentah dan benih baru yang siap ditanam yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan potensi mentah dan benih baru yang siap ditanam saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "wands_02",
    "name": "Two of Wands",
    "slug": "two-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 2,
    "rank": "2",
    "image": "/assets/images/tarot/wands/two-of-wands.webp",
    "keywords": [
      "Pilihan",
      "Wands",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan dan sebuah pilihan yang perlu diambil dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai keseimbangan dan sebuah pilihan yang perlu diambil, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan dan sebuah pilihan yang perlu diambil, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui keseimbangan dan sebuah pilihan yang perlu diambil.",
      "advice": "Sikapi momen keseimbangan dan sebuah pilihan yang perlu diambil ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan dan sebuah pilihan yang perlu diambil muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan dan sebuah pilihan yang perlu diambil, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan dan sebuah pilihan yang perlu diambil yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan keseimbangan dan sebuah pilihan yang perlu diambil saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_03",
    "name": "Three of Wands",
    "slug": "three-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 3,
    "rank": "3",
    "image": "/assets/images/tarot/wands/three-of-wands.webp",
    "keywords": [
      "Kolaborasi",
      "Wands",
      "Pertumbuhan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan pertumbuhan awal lewat kerja sama atau perluasan dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai pertumbuhan awal lewat kerja sama atau perluasan, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti pertumbuhan awal lewat kerja sama atau perluasan, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui pertumbuhan awal lewat kerja sama atau perluasan.",
      "advice": "Sikapi momen pertumbuhan awal lewat kerja sama atau perluasan ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari pertumbuhan awal lewat kerja sama atau perluasan muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada pertumbuhan awal lewat kerja sama atau perluasan, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, pertumbuhan awal lewat kerja sama atau perluasan yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan pertumbuhan awal lewat kerja sama atau perluasan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "wands_04",
    "name": "Four of Wands",
    "slug": "four-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 4,
    "rank": "4",
    "image": "/assets/images/tarot/wands/four-of-wands.webp",
    "keywords": [
      "Stabilitas",
      "Wands",
      "Fondasi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan fondasi yang mulai terasa kokoh dan aman dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai fondasi yang mulai terasa kokoh dan aman, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti fondasi yang mulai terasa kokoh dan aman, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui fondasi yang mulai terasa kokoh dan aman.",
      "advice": "Sikapi momen fondasi yang mulai terasa kokoh dan aman ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari fondasi yang mulai terasa kokoh dan aman muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada fondasi yang mulai terasa kokoh dan aman, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, fondasi yang mulai terasa kokoh dan aman yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan fondasi yang mulai terasa kokoh dan aman saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_05",
    "name": "Five of Wands",
    "slug": "five-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 5,
    "rank": "5",
    "image": "/assets/images/tarot/wands/five-of-wands.webp",
    "keywords": [
      "Gesekan",
      "Wands",
      "Tantangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan tantangan atau konflik yang menuntut penyesuaian dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai tantangan atau konflik yang menuntut penyesuaian, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti tantangan atau konflik yang menuntut penyesuaian, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui tantangan atau konflik yang menuntut penyesuaian.",
      "advice": "Sikapi momen tantangan atau konflik yang menuntut penyesuaian ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari tantangan atau konflik yang menuntut penyesuaian muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada tantangan atau konflik yang menuntut penyesuaian, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, tantangan atau konflik yang menuntut penyesuaian yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan tantangan atau konflik yang menuntut penyesuaian saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "no"
  },
  {
    "id": "wands_06",
    "name": "Six of Wands",
    "slug": "six-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 6,
    "rank": "6",
    "image": "/assets/images/tarot/wands/six-of-wands.webp",
    "keywords": [
      "Pemulihan",
      "Wands",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan yang pulih lewat dukungan atau kebaikan dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai keseimbangan yang pulih lewat dukungan atau kebaikan, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan yang pulih lewat dukungan atau kebaikan, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui keseimbangan yang pulih lewat dukungan atau kebaikan.",
      "advice": "Sikapi momen keseimbangan yang pulih lewat dukungan atau kebaikan ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan yang pulih lewat dukungan atau kebaikan muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan yang pulih lewat dukungan atau kebaikan, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan yang pulih lewat dukungan atau kebaikan yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan keseimbangan yang pulih lewat dukungan atau kebaikan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "wands_07",
    "name": "Seven of Wands",
    "slug": "seven-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 7,
    "rank": "7",
    "image": "/assets/images/tarot/wands/seven-of-wands.webp",
    "keywords": [
      "Refleksi",
      "Wands",
      "Penilaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penilaian ulang sebelum melangkah lebih jauh dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai penilaian ulang sebelum melangkah lebih jauh, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti penilaian ulang sebelum melangkah lebih jauh, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui penilaian ulang sebelum melangkah lebih jauh.",
      "advice": "Sikapi momen penilaian ulang sebelum melangkah lebih jauh ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari penilaian ulang sebelum melangkah lebih jauh muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penilaian ulang sebelum melangkah lebih jauh, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, penilaian ulang sebelum melangkah lebih jauh yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan penilaian ulang sebelum melangkah lebih jauh saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_08",
    "name": "Eight of Wands",
    "slug": "eight-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 8,
    "rank": "8",
    "image": "/assets/images/tarot/wands/eight-of-wands.webp",
    "keywords": [
      "Pergerakan",
      "Wands",
      "Langkah"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan langkah cepat menuju penguasaan yang sedang terbentuk dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai langkah cepat menuju penguasaan yang sedang terbentuk, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti langkah cepat menuju penguasaan yang sedang terbentuk, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui langkah cepat menuju penguasaan yang sedang terbentuk.",
      "advice": "Sikapi momen langkah cepat menuju penguasaan yang sedang terbentuk ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari langkah cepat menuju penguasaan yang sedang terbentuk muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada langkah cepat menuju penguasaan yang sedang terbentuk, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, langkah cepat menuju penguasaan yang sedang terbentuk yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan langkah cepat menuju penguasaan yang sedang terbentuk saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_09",
    "name": "Nine of Wands",
    "slug": "nine-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 9,
    "rank": "9",
    "image": "/assets/images/tarot/wands/nine-of-wands.webp",
    "keywords": [
      "Ketahanan",
      "Wands",
      "Hampir"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan hampir tuntas, bertahan meski lelah dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai hampir tuntas, bertahan meski lelah, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti hampir tuntas, bertahan meski lelah, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui hampir tuntas, bertahan meski lelah.",
      "advice": "Sikapi momen hampir tuntas, bertahan meski lelah ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari hampir tuntas, bertahan meski lelah muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada hampir tuntas, bertahan meski lelah, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, hampir tuntas, bertahan meski lelah yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan hampir tuntas, bertahan meski lelah saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_10",
    "name": "Ten of Wands",
    "slug": "ten-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 10,
    "rank": "10",
    "image": "/assets/images/tarot/wands/ten-of-wands.webp",
    "keywords": [
      "Puncak Siklus",
      "Wands",
      "Penyelesaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penyelesaian penuh dari satu siklus panjang dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai penyelesaian penuh dari satu siklus panjang, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti penyelesaian penuh dari satu siklus panjang, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui penyelesaian penuh dari satu siklus panjang.",
      "advice": "Sikapi momen penyelesaian penuh dari satu siklus panjang ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari penyelesaian penuh dari satu siklus panjang muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penyelesaian penuh dari satu siklus panjang, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, penyelesaian penuh dari satu siklus panjang yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan penyelesaian penuh dari satu siklus panjang saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "wands_11",
    "name": "Page of Wands",
    "slug": "page-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": null,
    "rank": "page",
    "image": "/assets/images/tarot/wands/page-of-wands.webp",
    "keywords": [
      "Pembelajar",
      "Wands",
      "Rasa"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan rasa ingin tahu dan langkah awal mempelajari sesuatu dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai rasa ingin tahu dan langkah awal mempelajari sesuatu, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti rasa ingin tahu dan langkah awal mempelajari sesuatu, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui rasa ingin tahu dan langkah awal mempelajari sesuatu.",
      "advice": "Sikapi momen rasa ingin tahu dan langkah awal mempelajari sesuatu ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari rasa ingin tahu dan langkah awal mempelajari sesuatu muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada rasa ingin tahu dan langkah awal mempelajari sesuatu, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, rasa ingin tahu dan langkah awal mempelajari sesuatu yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan rasa ingin tahu dan langkah awal mempelajari sesuatu saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_12",
    "name": "Knight of Wands",
    "slug": "knight-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": null,
    "rank": "knight",
    "image": "/assets/images/tarot/wands/knight-of-wands.webp",
    "keywords": [
      "Pengejaran",
      "Wands",
      "Gerak"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan gerak aktif mengejar tujuan dengan penuh semangat dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai gerak aktif mengejar tujuan dengan penuh semangat, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti gerak aktif mengejar tujuan dengan penuh semangat, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui gerak aktif mengejar tujuan dengan penuh semangat.",
      "advice": "Sikapi momen gerak aktif mengejar tujuan dengan penuh semangat ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari gerak aktif mengejar tujuan dengan penuh semangat muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada gerak aktif mengejar tujuan dengan penuh semangat, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, gerak aktif mengejar tujuan dengan penuh semangat yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan gerak aktif mengejar tujuan dengan penuh semangat saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "wands_13",
    "name": "Queen of Wands",
    "slug": "queen-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": null,
    "rank": "queen",
    "image": "/assets/images/tarot/wands/queen-of-wands.webp",
    "keywords": [
      "Penguasaan Batin",
      "Wands",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah ke dalam, penuh empati dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah ke dalam, penuh empati, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah ke dalam, penuh empati, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui kematangan yang mengarah ke dalam, penuh empati.",
      "advice": "Sikapi momen kematangan yang mengarah ke dalam, penuh empati ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah ke dalam, penuh empati muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah ke dalam, penuh empati, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah ke dalam, penuh empati yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan kematangan yang mengarah ke dalam, penuh empati saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "wands_14",
    "name": "King of Wands",
    "slug": "king-of-wands",
    "arcana": "minor",
    "suit": "wands",
    "number": null,
    "rank": "king",
    "image": "/assets/images/tarot/wands/king-of-wands.webp",
    "keywords": [
      "Otoritas",
      "Wands",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah keluar, penuh tanggung jawab dalam ranah tindakan, ambisi, kreativitas, dan gairah. Ini saat untuk bergerak maju dengan penuh semangat.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah keluar, penuh tanggung jawab, mewarnai gairah dan inisiatif dalam hubungan.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah keluar, penuh tanggung jawab, terkait proyek, ambisi, dan dorongan untuk berkembang.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami api dalam diri yang mendorong untuk terus bergerak, melalui kematangan yang mengarah keluar, penuh tanggung jawab.",
      "advice": "Sikapi momen kematangan yang mengarah keluar, penuh tanggung jawab ini dengan selaras pada energi api — bergerak maju dengan penuh semangat."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah keluar, penuh tanggung jawab muncul sebagai energi yang terhambat atau meledak tanpa arah dalam ranah tindakan, ambisi, kreativitas, dan gairah.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah keluar, penuh tanggung jawab, membuat gairah dan inisiatif dalam hubungan terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah keluar, penuh tanggung jawab yang biasanya membantu justru terasa energi yang terhambat atau meledak tanpa arah.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan api dalam diri yang mendorong untuk terus bergerak akibat energi yang terhambat atau meledak tanpa arah.",
      "advice": "Jangan paksakan kematangan yang mengarah keluar, penuh tanggung jawab saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "cups_01",
    "name": "Ace of Cups",
    "slug": "ace-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 1,
    "rank": "ace",
    "image": "/assets/images/tarot/cups/ace-of-cups.webp",
    "keywords": [
      "Awal Baru",
      "Cups",
      "Potensi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan potensi mentah dan benih baru yang siap ditanam dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai potensi mentah dan benih baru yang siap ditanam, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti potensi mentah dan benih baru yang siap ditanam, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui potensi mentah dan benih baru yang siap ditanam.",
      "advice": "Sikapi momen potensi mentah dan benih baru yang siap ditanam ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari potensi mentah dan benih baru yang siap ditanam muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada potensi mentah dan benih baru yang siap ditanam, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, potensi mentah dan benih baru yang siap ditanam yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan potensi mentah dan benih baru yang siap ditanam saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "cups_02",
    "name": "Two of Cups",
    "slug": "two-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 2,
    "rank": "2",
    "image": "/assets/images/tarot/cups/two-of-cups.webp",
    "keywords": [
      "Pilihan",
      "Cups",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan dan sebuah pilihan yang perlu diambil dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai keseimbangan dan sebuah pilihan yang perlu diambil, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan dan sebuah pilihan yang perlu diambil, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui keseimbangan dan sebuah pilihan yang perlu diambil.",
      "advice": "Sikapi momen keseimbangan dan sebuah pilihan yang perlu diambil ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan dan sebuah pilihan yang perlu diambil muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan dan sebuah pilihan yang perlu diambil, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan dan sebuah pilihan yang perlu diambil yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan keseimbangan dan sebuah pilihan yang perlu diambil saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_03",
    "name": "Three of Cups",
    "slug": "three-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 3,
    "rank": "3",
    "image": "/assets/images/tarot/cups/three-of-cups.webp",
    "keywords": [
      "Kolaborasi",
      "Cups",
      "Pertumbuhan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan pertumbuhan awal lewat kerja sama atau perluasan dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai pertumbuhan awal lewat kerja sama atau perluasan, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti pertumbuhan awal lewat kerja sama atau perluasan, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui pertumbuhan awal lewat kerja sama atau perluasan.",
      "advice": "Sikapi momen pertumbuhan awal lewat kerja sama atau perluasan ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari pertumbuhan awal lewat kerja sama atau perluasan muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada pertumbuhan awal lewat kerja sama atau perluasan, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, pertumbuhan awal lewat kerja sama atau perluasan yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan pertumbuhan awal lewat kerja sama atau perluasan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "cups_04",
    "name": "Four of Cups",
    "slug": "four-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 4,
    "rank": "4",
    "image": "/assets/images/tarot/cups/four-of-cups.webp",
    "keywords": [
      "Stabilitas",
      "Cups",
      "Fondasi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan fondasi yang mulai terasa kokoh dan aman dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai fondasi yang mulai terasa kokoh dan aman, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti fondasi yang mulai terasa kokoh dan aman, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui fondasi yang mulai terasa kokoh dan aman.",
      "advice": "Sikapi momen fondasi yang mulai terasa kokoh dan aman ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari fondasi yang mulai terasa kokoh dan aman muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada fondasi yang mulai terasa kokoh dan aman, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, fondasi yang mulai terasa kokoh dan aman yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan fondasi yang mulai terasa kokoh dan aman saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_05",
    "name": "Five of Cups",
    "slug": "five-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 5,
    "rank": "5",
    "image": "/assets/images/tarot/cups/five-of-cups.webp",
    "keywords": [
      "Gesekan",
      "Cups",
      "Tantangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan tantangan atau konflik yang menuntut penyesuaian dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai tantangan atau konflik yang menuntut penyesuaian, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti tantangan atau konflik yang menuntut penyesuaian, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui tantangan atau konflik yang menuntut penyesuaian.",
      "advice": "Sikapi momen tantangan atau konflik yang menuntut penyesuaian ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari tantangan atau konflik yang menuntut penyesuaian muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada tantangan atau konflik yang menuntut penyesuaian, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, tantangan atau konflik yang menuntut penyesuaian yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan tantangan atau konflik yang menuntut penyesuaian saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "no"
  },
  {
    "id": "cups_06",
    "name": "Six of Cups",
    "slug": "six-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 6,
    "rank": "6",
    "image": "/assets/images/tarot/cups/six-of-cups.webp",
    "keywords": [
      "Pemulihan",
      "Cups",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan yang pulih lewat dukungan atau kebaikan dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai keseimbangan yang pulih lewat dukungan atau kebaikan, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan yang pulih lewat dukungan atau kebaikan, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui keseimbangan yang pulih lewat dukungan atau kebaikan.",
      "advice": "Sikapi momen keseimbangan yang pulih lewat dukungan atau kebaikan ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan yang pulih lewat dukungan atau kebaikan muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan yang pulih lewat dukungan atau kebaikan, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan yang pulih lewat dukungan atau kebaikan yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan keseimbangan yang pulih lewat dukungan atau kebaikan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "cups_07",
    "name": "Seven of Cups",
    "slug": "seven-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 7,
    "rank": "7",
    "image": "/assets/images/tarot/cups/seven-of-cups.webp",
    "keywords": [
      "Refleksi",
      "Cups",
      "Penilaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penilaian ulang sebelum melangkah lebih jauh dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai penilaian ulang sebelum melangkah lebih jauh, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti penilaian ulang sebelum melangkah lebih jauh, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui penilaian ulang sebelum melangkah lebih jauh.",
      "advice": "Sikapi momen penilaian ulang sebelum melangkah lebih jauh ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari penilaian ulang sebelum melangkah lebih jauh muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penilaian ulang sebelum melangkah lebih jauh, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, penilaian ulang sebelum melangkah lebih jauh yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan penilaian ulang sebelum melangkah lebih jauh saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_08",
    "name": "Eight of Cups",
    "slug": "eight-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 8,
    "rank": "8",
    "image": "/assets/images/tarot/cups/eight-of-cups.webp",
    "keywords": [
      "Pergerakan",
      "Cups",
      "Langkah"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan langkah cepat menuju penguasaan yang sedang terbentuk dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai langkah cepat menuju penguasaan yang sedang terbentuk, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti langkah cepat menuju penguasaan yang sedang terbentuk, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui langkah cepat menuju penguasaan yang sedang terbentuk.",
      "advice": "Sikapi momen langkah cepat menuju penguasaan yang sedang terbentuk ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari langkah cepat menuju penguasaan yang sedang terbentuk muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada langkah cepat menuju penguasaan yang sedang terbentuk, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, langkah cepat menuju penguasaan yang sedang terbentuk yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan langkah cepat menuju penguasaan yang sedang terbentuk saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_09",
    "name": "Nine of Cups",
    "slug": "nine-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 9,
    "rank": "9",
    "image": "/assets/images/tarot/cups/nine-of-cups.webp",
    "keywords": [
      "Ketahanan",
      "Cups",
      "Hampir"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan hampir tuntas, bertahan meski lelah dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai hampir tuntas, bertahan meski lelah, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti hampir tuntas, bertahan meski lelah, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui hampir tuntas, bertahan meski lelah.",
      "advice": "Sikapi momen hampir tuntas, bertahan meski lelah ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari hampir tuntas, bertahan meski lelah muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada hampir tuntas, bertahan meski lelah, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, hampir tuntas, bertahan meski lelah yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan hampir tuntas, bertahan meski lelah saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_10",
    "name": "Ten of Cups",
    "slug": "ten-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 10,
    "rank": "10",
    "image": "/assets/images/tarot/cups/ten-of-cups.webp",
    "keywords": [
      "Puncak Siklus",
      "Cups",
      "Penyelesaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penyelesaian penuh dari satu siklus panjang dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai penyelesaian penuh dari satu siklus panjang, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti penyelesaian penuh dari satu siklus panjang, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui penyelesaian penuh dari satu siklus panjang.",
      "advice": "Sikapi momen penyelesaian penuh dari satu siklus panjang ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari penyelesaian penuh dari satu siklus panjang muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penyelesaian penuh dari satu siklus panjang, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, penyelesaian penuh dari satu siklus panjang yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan penyelesaian penuh dari satu siklus panjang saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "cups_11",
    "name": "Page of Cups",
    "slug": "page-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": null,
    "rank": "page",
    "image": "/assets/images/tarot/cups/page-of-cups.webp",
    "keywords": [
      "Pembelajar",
      "Cups",
      "Rasa"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan rasa ingin tahu dan langkah awal mempelajari sesuatu dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai rasa ingin tahu dan langkah awal mempelajari sesuatu, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti rasa ingin tahu dan langkah awal mempelajari sesuatu, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui rasa ingin tahu dan langkah awal mempelajari sesuatu.",
      "advice": "Sikapi momen rasa ingin tahu dan langkah awal mempelajari sesuatu ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari rasa ingin tahu dan langkah awal mempelajari sesuatu muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada rasa ingin tahu dan langkah awal mempelajari sesuatu, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, rasa ingin tahu dan langkah awal mempelajari sesuatu yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan rasa ingin tahu dan langkah awal mempelajari sesuatu saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_12",
    "name": "Knight of Cups",
    "slug": "knight-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": null,
    "rank": "knight",
    "image": "/assets/images/tarot/cups/knight-of-cups.webp",
    "keywords": [
      "Pengejaran",
      "Cups",
      "Gerak"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan gerak aktif mengejar tujuan dengan penuh semangat dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai gerak aktif mengejar tujuan dengan penuh semangat, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti gerak aktif mengejar tujuan dengan penuh semangat, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui gerak aktif mengejar tujuan dengan penuh semangat.",
      "advice": "Sikapi momen gerak aktif mengejar tujuan dengan penuh semangat ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari gerak aktif mengejar tujuan dengan penuh semangat muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada gerak aktif mengejar tujuan dengan penuh semangat, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, gerak aktif mengejar tujuan dengan penuh semangat yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan gerak aktif mengejar tujuan dengan penuh semangat saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "cups_13",
    "name": "Queen of Cups",
    "slug": "queen-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": null,
    "rank": "queen",
    "image": "/assets/images/tarot/cups/queen-of-cups.webp",
    "keywords": [
      "Penguasaan Batin",
      "Cups",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah ke dalam, penuh empati dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah ke dalam, penuh empati, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah ke dalam, penuh empati, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui kematangan yang mengarah ke dalam, penuh empati.",
      "advice": "Sikapi momen kematangan yang mengarah ke dalam, penuh empati ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah ke dalam, penuh empati muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah ke dalam, penuh empati, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah ke dalam, penuh empati yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan kematangan yang mengarah ke dalam, penuh empati saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "cups_14",
    "name": "King of Cups",
    "slug": "king-of-cups",
    "arcana": "minor",
    "suit": "cups",
    "number": null,
    "rank": "king",
    "image": "/assets/images/tarot/cups/king-of-cups.webp",
    "keywords": [
      "Otoritas",
      "Cups",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah keluar, penuh tanggung jawab dalam ranah emosi, hubungan, dan kedalaman batin. Ini saat untuk mengalir mengikuti perasaan yang tulus.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah keluar, penuh tanggung jawab, mewarnai kedalaman perasaan dan keintiman emosional.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah keluar, penuh tanggung jawab, terkait kepuasan batin dan hubungan kerja yang bermakna.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kepekaan hati sebagai penuntun jalan, melalui kematangan yang mengarah keluar, penuh tanggung jawab.",
      "advice": "Sikapi momen kematangan yang mengarah keluar, penuh tanggung jawab ini dengan selaras pada energi air — mengalir mengikuti perasaan yang tulus."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah keluar, penuh tanggung jawab muncul sebagai emosi yang tersumbat atau meluap tak terkendali dalam ranah emosi, hubungan, dan kedalaman batin.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah keluar, penuh tanggung jawab, membuat kedalaman perasaan dan keintiman emosional terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah keluar, penuh tanggung jawab yang biasanya membantu justru terasa emosi yang tersumbat atau meluap tak terkendali.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kepekaan hati sebagai penuntun jalan akibat emosi yang tersumbat atau meluap tak terkendali.",
      "advice": "Jangan paksakan kematangan yang mengarah keluar, penuh tanggung jawab saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "swords_01",
    "name": "Ace of Swords",
    "slug": "ace-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 1,
    "rank": "ace",
    "image": "/assets/images/tarot/swords/ace-of-swords.webp",
    "keywords": [
      "Awal Baru",
      "Swords",
      "Potensi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan potensi mentah dan benih baru yang siap ditanam dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai potensi mentah dan benih baru yang siap ditanam, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti potensi mentah dan benih baru yang siap ditanam, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui potensi mentah dan benih baru yang siap ditanam.",
      "advice": "Sikapi momen potensi mentah dan benih baru yang siap ditanam ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari potensi mentah dan benih baru yang siap ditanam muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada potensi mentah dan benih baru yang siap ditanam, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, potensi mentah dan benih baru yang siap ditanam yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan potensi mentah dan benih baru yang siap ditanam saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "swords_02",
    "name": "Two of Swords",
    "slug": "two-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 2,
    "rank": "2",
    "image": "/assets/images/tarot/swords/two-of-swords.webp",
    "keywords": [
      "Pilihan",
      "Swords",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan dan sebuah pilihan yang perlu diambil dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai keseimbangan dan sebuah pilihan yang perlu diambil, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan dan sebuah pilihan yang perlu diambil, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui keseimbangan dan sebuah pilihan yang perlu diambil.",
      "advice": "Sikapi momen keseimbangan dan sebuah pilihan yang perlu diambil ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan dan sebuah pilihan yang perlu diambil muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan dan sebuah pilihan yang perlu diambil, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan dan sebuah pilihan yang perlu diambil yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan keseimbangan dan sebuah pilihan yang perlu diambil saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_03",
    "name": "Three of Swords",
    "slug": "three-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 3,
    "rank": "3",
    "image": "/assets/images/tarot/swords/three-of-swords.webp",
    "keywords": [
      "Kolaborasi",
      "Swords",
      "Pertumbuhan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan pertumbuhan awal lewat kerja sama atau perluasan dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai pertumbuhan awal lewat kerja sama atau perluasan, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti pertumbuhan awal lewat kerja sama atau perluasan, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui pertumbuhan awal lewat kerja sama atau perluasan.",
      "advice": "Sikapi momen pertumbuhan awal lewat kerja sama atau perluasan ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari pertumbuhan awal lewat kerja sama atau perluasan muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada pertumbuhan awal lewat kerja sama atau perluasan, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, pertumbuhan awal lewat kerja sama atau perluasan yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan pertumbuhan awal lewat kerja sama atau perluasan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "swords_04",
    "name": "Four of Swords",
    "slug": "four-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 4,
    "rank": "4",
    "image": "/assets/images/tarot/swords/four-of-swords.webp",
    "keywords": [
      "Stabilitas",
      "Swords",
      "Fondasi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan fondasi yang mulai terasa kokoh dan aman dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai fondasi yang mulai terasa kokoh dan aman, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti fondasi yang mulai terasa kokoh dan aman, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui fondasi yang mulai terasa kokoh dan aman.",
      "advice": "Sikapi momen fondasi yang mulai terasa kokoh dan aman ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari fondasi yang mulai terasa kokoh dan aman muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada fondasi yang mulai terasa kokoh dan aman, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, fondasi yang mulai terasa kokoh dan aman yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan fondasi yang mulai terasa kokoh dan aman saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_05",
    "name": "Five of Swords",
    "slug": "five-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 5,
    "rank": "5",
    "image": "/assets/images/tarot/swords/five-of-swords.webp",
    "keywords": [
      "Gesekan",
      "Swords",
      "Tantangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan tantangan atau konflik yang menuntut penyesuaian dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai tantangan atau konflik yang menuntut penyesuaian, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti tantangan atau konflik yang menuntut penyesuaian, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui tantangan atau konflik yang menuntut penyesuaian.",
      "advice": "Sikapi momen tantangan atau konflik yang menuntut penyesuaian ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari tantangan atau konflik yang menuntut penyesuaian muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada tantangan atau konflik yang menuntut penyesuaian, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, tantangan atau konflik yang menuntut penyesuaian yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan tantangan atau konflik yang menuntut penyesuaian saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "no"
  },
  {
    "id": "swords_06",
    "name": "Six of Swords",
    "slug": "six-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 6,
    "rank": "6",
    "image": "/assets/images/tarot/swords/six-of-swords.webp",
    "keywords": [
      "Pemulihan",
      "Swords",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan yang pulih lewat dukungan atau kebaikan dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai keseimbangan yang pulih lewat dukungan atau kebaikan, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan yang pulih lewat dukungan atau kebaikan, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui keseimbangan yang pulih lewat dukungan atau kebaikan.",
      "advice": "Sikapi momen keseimbangan yang pulih lewat dukungan atau kebaikan ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan yang pulih lewat dukungan atau kebaikan muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan yang pulih lewat dukungan atau kebaikan, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan yang pulih lewat dukungan atau kebaikan yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan keseimbangan yang pulih lewat dukungan atau kebaikan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "swords_07",
    "name": "Seven of Swords",
    "slug": "seven-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 7,
    "rank": "7",
    "image": "/assets/images/tarot/swords/seven-of-swords.webp",
    "keywords": [
      "Refleksi",
      "Swords",
      "Penilaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penilaian ulang sebelum melangkah lebih jauh dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai penilaian ulang sebelum melangkah lebih jauh, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti penilaian ulang sebelum melangkah lebih jauh, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui penilaian ulang sebelum melangkah lebih jauh.",
      "advice": "Sikapi momen penilaian ulang sebelum melangkah lebih jauh ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari penilaian ulang sebelum melangkah lebih jauh muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penilaian ulang sebelum melangkah lebih jauh, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, penilaian ulang sebelum melangkah lebih jauh yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan penilaian ulang sebelum melangkah lebih jauh saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_08",
    "name": "Eight of Swords",
    "slug": "eight-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 8,
    "rank": "8",
    "image": "/assets/images/tarot/swords/eight-of-swords.webp",
    "keywords": [
      "Pergerakan",
      "Swords",
      "Langkah"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan langkah cepat menuju penguasaan yang sedang terbentuk dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai langkah cepat menuju penguasaan yang sedang terbentuk, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti langkah cepat menuju penguasaan yang sedang terbentuk, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui langkah cepat menuju penguasaan yang sedang terbentuk.",
      "advice": "Sikapi momen langkah cepat menuju penguasaan yang sedang terbentuk ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari langkah cepat menuju penguasaan yang sedang terbentuk muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada langkah cepat menuju penguasaan yang sedang terbentuk, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, langkah cepat menuju penguasaan yang sedang terbentuk yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan langkah cepat menuju penguasaan yang sedang terbentuk saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_09",
    "name": "Nine of Swords",
    "slug": "nine-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 9,
    "rank": "9",
    "image": "/assets/images/tarot/swords/nine-of-swords.webp",
    "keywords": [
      "Ketahanan",
      "Swords",
      "Hampir"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan hampir tuntas, bertahan meski lelah dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai hampir tuntas, bertahan meski lelah, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti hampir tuntas, bertahan meski lelah, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui hampir tuntas, bertahan meski lelah.",
      "advice": "Sikapi momen hampir tuntas, bertahan meski lelah ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari hampir tuntas, bertahan meski lelah muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada hampir tuntas, bertahan meski lelah, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, hampir tuntas, bertahan meski lelah yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan hampir tuntas, bertahan meski lelah saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_10",
    "name": "Ten of Swords",
    "slug": "ten-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 10,
    "rank": "10",
    "image": "/assets/images/tarot/swords/ten-of-swords.webp",
    "keywords": [
      "Puncak Siklus",
      "Swords",
      "Penyelesaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penyelesaian penuh dari satu siklus panjang dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai penyelesaian penuh dari satu siklus panjang, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti penyelesaian penuh dari satu siklus panjang, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui penyelesaian penuh dari satu siklus panjang.",
      "advice": "Sikapi momen penyelesaian penuh dari satu siklus panjang ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari penyelesaian penuh dari satu siklus panjang muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penyelesaian penuh dari satu siklus panjang, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, penyelesaian penuh dari satu siklus panjang yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan penyelesaian penuh dari satu siklus panjang saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "swords_11",
    "name": "Page of Swords",
    "slug": "page-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": null,
    "rank": "page",
    "image": "/assets/images/tarot/swords/page-of-swords.webp",
    "keywords": [
      "Pembelajar",
      "Swords",
      "Rasa"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan rasa ingin tahu dan langkah awal mempelajari sesuatu dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai rasa ingin tahu dan langkah awal mempelajari sesuatu, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti rasa ingin tahu dan langkah awal mempelajari sesuatu, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui rasa ingin tahu dan langkah awal mempelajari sesuatu.",
      "advice": "Sikapi momen rasa ingin tahu dan langkah awal mempelajari sesuatu ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari rasa ingin tahu dan langkah awal mempelajari sesuatu muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada rasa ingin tahu dan langkah awal mempelajari sesuatu, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, rasa ingin tahu dan langkah awal mempelajari sesuatu yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan rasa ingin tahu dan langkah awal mempelajari sesuatu saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_12",
    "name": "Knight of Swords",
    "slug": "knight-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": null,
    "rank": "knight",
    "image": "/assets/images/tarot/swords/knight-of-swords.webp",
    "keywords": [
      "Pengejaran",
      "Swords",
      "Gerak"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan gerak aktif mengejar tujuan dengan penuh semangat dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai gerak aktif mengejar tujuan dengan penuh semangat, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti gerak aktif mengejar tujuan dengan penuh semangat, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui gerak aktif mengejar tujuan dengan penuh semangat.",
      "advice": "Sikapi momen gerak aktif mengejar tujuan dengan penuh semangat ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari gerak aktif mengejar tujuan dengan penuh semangat muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada gerak aktif mengejar tujuan dengan penuh semangat, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, gerak aktif mengejar tujuan dengan penuh semangat yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan gerak aktif mengejar tujuan dengan penuh semangat saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "swords_13",
    "name": "Queen of Swords",
    "slug": "queen-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": null,
    "rank": "queen",
    "image": "/assets/images/tarot/swords/queen-of-swords.webp",
    "keywords": [
      "Penguasaan Batin",
      "Swords",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah ke dalam, penuh empati dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah ke dalam, penuh empati, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah ke dalam, penuh empati, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui kematangan yang mengarah ke dalam, penuh empati.",
      "advice": "Sikapi momen kematangan yang mengarah ke dalam, penuh empati ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah ke dalam, penuh empati muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah ke dalam, penuh empati, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah ke dalam, penuh empati yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan kematangan yang mengarah ke dalam, penuh empati saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "swords_14",
    "name": "King of Swords",
    "slug": "king-of-swords",
    "arcana": "minor",
    "suit": "swords",
    "number": null,
    "rank": "king",
    "image": "/assets/images/tarot/swords/king-of-swords.webp",
    "keywords": [
      "Otoritas",
      "Swords",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah keluar, penuh tanggung jawab dalam ranah pikiran, komunikasi, konflik, dan kebenaran. Ini saat untuk berpikir jernih dan bertindak berdasar fakta.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah keluar, penuh tanggung jawab, mewarnai komunikasi jujur, atau justru kesalahpahaman.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah keluar, penuh tanggung jawab, terkait strategi, keputusan, dan tekanan mental.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kejernihan pikiran sebagai jalan menuju kebenaran, melalui kematangan yang mengarah keluar, penuh tanggung jawab.",
      "advice": "Sikapi momen kematangan yang mengarah keluar, penuh tanggung jawab ini dengan selaras pada energi udara — berpikir jernih dan bertindak berdasar fakta."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah keluar, penuh tanggung jawab muncul sebagai pikiran yang berputar atau konflik yang menajam dalam ranah pikiran, komunikasi, konflik, dan kebenaran.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah keluar, penuh tanggung jawab, membuat komunikasi jujur, atau justru kesalahpahaman terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah keluar, penuh tanggung jawab yang biasanya membantu justru terasa pikiran yang berputar atau konflik yang menajam.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kejernihan pikiran sebagai jalan menuju kebenaran akibat pikiran yang berputar atau konflik yang menajam.",
      "advice": "Jangan paksakan kematangan yang mengarah keluar, penuh tanggung jawab saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "pentacles_01",
    "name": "Ace of Pentacles",
    "slug": "ace-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 1,
    "rank": "ace",
    "image": "/assets/images/tarot/pentacles/ace-of-pentacles.webp",
    "keywords": [
      "Awal Baru",
      "Pentacles",
      "Potensi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan potensi mentah dan benih baru yang siap ditanam dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai potensi mentah dan benih baru yang siap ditanam, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti potensi mentah dan benih baru yang siap ditanam, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui potensi mentah dan benih baru yang siap ditanam.",
      "advice": "Sikapi momen potensi mentah dan benih baru yang siap ditanam ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari potensi mentah dan benih baru yang siap ditanam muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada potensi mentah dan benih baru yang siap ditanam, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, potensi mentah dan benih baru yang siap ditanam yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan potensi mentah dan benih baru yang siap ditanam saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "pentacles_02",
    "name": "Two of Pentacles",
    "slug": "two-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 2,
    "rank": "2",
    "image": "/assets/images/tarot/pentacles/two-of-pentacles.webp",
    "keywords": [
      "Pilihan",
      "Pentacles",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan dan sebuah pilihan yang perlu diambil dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai keseimbangan dan sebuah pilihan yang perlu diambil, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan dan sebuah pilihan yang perlu diambil, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui keseimbangan dan sebuah pilihan yang perlu diambil.",
      "advice": "Sikapi momen keseimbangan dan sebuah pilihan yang perlu diambil ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan dan sebuah pilihan yang perlu diambil muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan dan sebuah pilihan yang perlu diambil, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan dan sebuah pilihan yang perlu diambil yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan keseimbangan dan sebuah pilihan yang perlu diambil saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_03",
    "name": "Three of Pentacles",
    "slug": "three-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 3,
    "rank": "3",
    "image": "/assets/images/tarot/pentacles/three-of-pentacles.webp",
    "keywords": [
      "Kolaborasi",
      "Pentacles",
      "Pertumbuhan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan pertumbuhan awal lewat kerja sama atau perluasan dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai pertumbuhan awal lewat kerja sama atau perluasan, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti pertumbuhan awal lewat kerja sama atau perluasan, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui pertumbuhan awal lewat kerja sama atau perluasan.",
      "advice": "Sikapi momen pertumbuhan awal lewat kerja sama atau perluasan ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari pertumbuhan awal lewat kerja sama atau perluasan muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada pertumbuhan awal lewat kerja sama atau perluasan, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, pertumbuhan awal lewat kerja sama atau perluasan yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan pertumbuhan awal lewat kerja sama atau perluasan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "pentacles_04",
    "name": "Four of Pentacles",
    "slug": "four-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 4,
    "rank": "4",
    "image": "/assets/images/tarot/pentacles/four-of-pentacles.webp",
    "keywords": [
      "Stabilitas",
      "Pentacles",
      "Fondasi"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan fondasi yang mulai terasa kokoh dan aman dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai fondasi yang mulai terasa kokoh dan aman, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti fondasi yang mulai terasa kokoh dan aman, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui fondasi yang mulai terasa kokoh dan aman.",
      "advice": "Sikapi momen fondasi yang mulai terasa kokoh dan aman ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari fondasi yang mulai terasa kokoh dan aman muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada fondasi yang mulai terasa kokoh dan aman, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, fondasi yang mulai terasa kokoh dan aman yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan fondasi yang mulai terasa kokoh dan aman saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_05",
    "name": "Five of Pentacles",
    "slug": "five-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 5,
    "rank": "5",
    "image": "/assets/images/tarot/pentacles/five-of-pentacles.webp",
    "keywords": [
      "Gesekan",
      "Pentacles",
      "Tantangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan tantangan atau konflik yang menuntut penyesuaian dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai tantangan atau konflik yang menuntut penyesuaian, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti tantangan atau konflik yang menuntut penyesuaian, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui tantangan atau konflik yang menuntut penyesuaian.",
      "advice": "Sikapi momen tantangan atau konflik yang menuntut penyesuaian ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari tantangan atau konflik yang menuntut penyesuaian muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada tantangan atau konflik yang menuntut penyesuaian, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, tantangan atau konflik yang menuntut penyesuaian yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan tantangan atau konflik yang menuntut penyesuaian saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "no"
  },
  {
    "id": "pentacles_06",
    "name": "Six of Pentacles",
    "slug": "six-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 6,
    "rank": "6",
    "image": "/assets/images/tarot/pentacles/six-of-pentacles.webp",
    "keywords": [
      "Pemulihan",
      "Pentacles",
      "Keseimbangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan keseimbangan yang pulih lewat dukungan atau kebaikan dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai keseimbangan yang pulih lewat dukungan atau kebaikan, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti keseimbangan yang pulih lewat dukungan atau kebaikan, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui keseimbangan yang pulih lewat dukungan atau kebaikan.",
      "advice": "Sikapi momen keseimbangan yang pulih lewat dukungan atau kebaikan ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari keseimbangan yang pulih lewat dukungan atau kebaikan muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada keseimbangan yang pulih lewat dukungan atau kebaikan, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, keseimbangan yang pulih lewat dukungan atau kebaikan yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan keseimbangan yang pulih lewat dukungan atau kebaikan saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "pentacles_07",
    "name": "Seven of Pentacles",
    "slug": "seven-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 7,
    "rank": "7",
    "image": "/assets/images/tarot/pentacles/seven-of-pentacles.webp",
    "keywords": [
      "Refleksi",
      "Pentacles",
      "Penilaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penilaian ulang sebelum melangkah lebih jauh dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai penilaian ulang sebelum melangkah lebih jauh, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti penilaian ulang sebelum melangkah lebih jauh, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui penilaian ulang sebelum melangkah lebih jauh.",
      "advice": "Sikapi momen penilaian ulang sebelum melangkah lebih jauh ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari penilaian ulang sebelum melangkah lebih jauh muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penilaian ulang sebelum melangkah lebih jauh, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, penilaian ulang sebelum melangkah lebih jauh yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan penilaian ulang sebelum melangkah lebih jauh saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_08",
    "name": "Eight of Pentacles",
    "slug": "eight-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 8,
    "rank": "8",
    "image": "/assets/images/tarot/pentacles/eight-of-pentacles.webp",
    "keywords": [
      "Pergerakan",
      "Pentacles",
      "Langkah"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan langkah cepat menuju penguasaan yang sedang terbentuk dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai langkah cepat menuju penguasaan yang sedang terbentuk, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti langkah cepat menuju penguasaan yang sedang terbentuk, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui langkah cepat menuju penguasaan yang sedang terbentuk.",
      "advice": "Sikapi momen langkah cepat menuju penguasaan yang sedang terbentuk ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari langkah cepat menuju penguasaan yang sedang terbentuk muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada langkah cepat menuju penguasaan yang sedang terbentuk, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, langkah cepat menuju penguasaan yang sedang terbentuk yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan langkah cepat menuju penguasaan yang sedang terbentuk saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_09",
    "name": "Nine of Pentacles",
    "slug": "nine-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 9,
    "rank": "9",
    "image": "/assets/images/tarot/pentacles/nine-of-pentacles.webp",
    "keywords": [
      "Ketahanan",
      "Pentacles",
      "Hampir"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan hampir tuntas, bertahan meski lelah dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai hampir tuntas, bertahan meski lelah, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti hampir tuntas, bertahan meski lelah, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui hampir tuntas, bertahan meski lelah.",
      "advice": "Sikapi momen hampir tuntas, bertahan meski lelah ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari hampir tuntas, bertahan meski lelah muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada hampir tuntas, bertahan meski lelah, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, hampir tuntas, bertahan meski lelah yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan hampir tuntas, bertahan meski lelah saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_10",
    "name": "Ten of Pentacles",
    "slug": "ten-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 10,
    "rank": "10",
    "image": "/assets/images/tarot/pentacles/ten-of-pentacles.webp",
    "keywords": [
      "Puncak Siklus",
      "Pentacles",
      "Penyelesaian"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan penyelesaian penuh dari satu siklus panjang dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai penyelesaian penuh dari satu siklus panjang, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti penyelesaian penuh dari satu siklus panjang, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui penyelesaian penuh dari satu siklus panjang.",
      "advice": "Sikapi momen penyelesaian penuh dari satu siklus panjang ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari penyelesaian penuh dari satu siklus panjang muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada penyelesaian penuh dari satu siklus panjang, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, penyelesaian penuh dari satu siklus panjang yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan penyelesaian penuh dari satu siklus panjang saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "pentacles_11",
    "name": "Page of Pentacles",
    "slug": "page-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": null,
    "rank": "page",
    "image": "/assets/images/tarot/pentacles/page-of-pentacles.webp",
    "keywords": [
      "Pembelajar",
      "Pentacles",
      "Rasa"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan rasa ingin tahu dan langkah awal mempelajari sesuatu dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai rasa ingin tahu dan langkah awal mempelajari sesuatu, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti rasa ingin tahu dan langkah awal mempelajari sesuatu, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui rasa ingin tahu dan langkah awal mempelajari sesuatu.",
      "advice": "Sikapi momen rasa ingin tahu dan langkah awal mempelajari sesuatu ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari rasa ingin tahu dan langkah awal mempelajari sesuatu muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada rasa ingin tahu dan langkah awal mempelajari sesuatu, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, rasa ingin tahu dan langkah awal mempelajari sesuatu yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan rasa ingin tahu dan langkah awal mempelajari sesuatu saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_12",
    "name": "Knight of Pentacles",
    "slug": "knight-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": null,
    "rank": "knight",
    "image": "/assets/images/tarot/pentacles/knight-of-pentacles.webp",
    "keywords": [
      "Pengejaran",
      "Pentacles",
      "Gerak"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan gerak aktif mengejar tujuan dengan penuh semangat dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai gerak aktif mengejar tujuan dengan penuh semangat, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti gerak aktif mengejar tujuan dengan penuh semangat, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui gerak aktif mengejar tujuan dengan penuh semangat.",
      "advice": "Sikapi momen gerak aktif mengejar tujuan dengan penuh semangat ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari gerak aktif mengejar tujuan dengan penuh semangat muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada gerak aktif mengejar tujuan dengan penuh semangat, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, gerak aktif mengejar tujuan dengan penuh semangat yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan gerak aktif mengejar tujuan dengan penuh semangat saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "maybe"
  },
  {
    "id": "pentacles_13",
    "name": "Queen of Pentacles",
    "slug": "queen-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": null,
    "rank": "queen",
    "image": "/assets/images/tarot/pentacles/queen-of-pentacles.webp",
    "keywords": [
      "Penguasaan Batin",
      "Pentacles",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah ke dalam, penuh empati dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah ke dalam, penuh empati, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah ke dalam, penuh empati, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui kematangan yang mengarah ke dalam, penuh empati.",
      "advice": "Sikapi momen kematangan yang mengarah ke dalam, penuh empati ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah ke dalam, penuh empati muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah ke dalam, penuh empati, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah ke dalam, penuh empati yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan kematangan yang mengarah ke dalam, penuh empati saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  },
  {
    "id": "pentacles_14",
    "name": "King of Pentacles",
    "slug": "king-of-pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": null,
    "rank": "king",
    "image": "/assets/images/tarot/pentacles/king-of-pentacles.webp",
    "keywords": [
      "Otoritas",
      "Pentacles",
      "Kematangan"
    ],
    "upright": {
      "general": "Kartu ini menghadirkan kematangan yang mengarah keluar, penuh tanggung jawab dalam ranah materi, pekerjaan, tubuh, dan keamanan. Ini saat untuk membangun sesuatu yang nyata dan bertahan lama.",
      "love": "Dalam hubungan, ini menandai kematangan yang mengarah keluar, penuh tanggung jawab, mewarnai keamanan, komitmen nyata, dan kenyamanan fisik.",
      "career": "Dalam pekerjaan, ini berarti kematangan yang mengarah keluar, penuh tanggung jawab, terkait pekerjaan, uang, dan hasil yang bisa diukur.",
      "spiritual": "Secara batin, ini mengajak untuk menyelami kehadiran penuh dalam tubuh dan dunia nyata, melalui kematangan yang mengarah keluar, penuh tanggung jawab.",
      "advice": "Sikapi momen kematangan yang mengarah keluar, penuh tanggung jawab ini dengan selaras pada energi tanah — membangun sesuatu yang nyata dan bertahan lama."
    },
    "reversed": {
      "general": "Versi terbalik dari kematangan yang mengarah keluar, penuh tanggung jawab muncul sebagai ketidakstabilan material atau kekhawatiran finansial dalam ranah materi, pekerjaan, tubuh, dan keamanan.",
      "love": "Dalam hubungan, ini menandakan hambatan pada kematangan yang mengarah keluar, penuh tanggung jawab, membuat keamanan, komitmen nyata, dan kenyamanan fisik terasa berat.",
      "career": "Dalam pekerjaan, kematangan yang mengarah keluar, penuh tanggung jawab yang biasanya membantu justru terasa ketidakstabilan material atau kekhawatiran finansial.",
      "spiritual": "Secara batin, ada kesulitan terhubung dengan kehadiran penuh dalam tubuh dan dunia nyata akibat ketidakstabilan material atau kekhawatiran finansial.",
      "advice": "Jangan paksakan kematangan yang mengarah keluar, penuh tanggung jawab saat energinya sedang terhambat; beri jeda dan evaluasi ulang."
    },
    "yesNo": "yes"
  }
];

/** @returns {object|undefined} */
export function getCardById(id) {
  return TAROT_CARDS.find((c) => c.id === id);
}

export function getAllCards() {
  return TAROT_CARDS;
}

/** @param {"major"|"minor"} arcana */
export function getCardsByArcana(arcana) {
  return TAROT_CARDS.filter((c) => c.arcana === arcana);
}

/** @param {"wands"|"cups"|"swords"|"pentacles"} suit */
export function getCardsBySuit(suit) {
  return TAROT_CARDS.filter((c) => c.suit === suit);
}

export function getRandomCard() {
  return TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
}
