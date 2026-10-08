# CPNS TIU Numerik — Aplikasi Latihan & Generator Soal

> File ini adalah instruksi utama untuk AI agent. Baca seluruhnya sebelum menulis kode.
> Bagian bertanda **[EDIT]** boleh saya ubah sesuai kebutuhan.

---

## 1. Tujuan

Membangun aplikasi untuk belajar **TIU (Tes Intelegensia Umum) bagian numerik/matematika** pada SKD CPNS.
Fitur inti: **generator soal otomatis** yang menghasilkan soal bergaya CPNS, lengkap dengan pilihan jawaban, kunci, dan pembahasan langkah demi langkah.

Pengguna: 1 orang (pemilik proyek) yang belajar mandiri. Prioritas: sederhana, cepat dipakai, jawaban selalu benar.

## 2. Prinsip Wajib

1. **Kunci jawaban harus benar 100%.** Jawaban dihitung oleh kode, bukan ditebak oleh LLM.
2. **Setiap soal punya pembahasan** yang bisa diikuti langkah demi langkah.
3. **Soal harus bervariasi** (angka acak berparameter), bukan soal yang sama berulang.
4. **Gaya soal meniru CPNS asli**: bahasa Indonesia baku, 5 pilihan (A–E), satu jawaban benar.
5. **Jangan menyalin soal asli** dari buku/bimbel. Buat soal orisinal dengan pola yang sama.
6. Kerjakan bertahap sesuai Bagian 9. Jangan membangun semuanya sekaligus.

## 3. Format Ujian Acuan

> Verifikasi angka ini ke pengumuman resmi BKN/SSCASN tahun terkait sebelum dipakai, karena bisa berubah.

- TIU adalah salah satu dari 3 subtes SKD (TWK, TIU, TKP).
- TIU terdiri dari 3 kelompok: **Numerik**, Verbal, Figural. Aplikasi ini fokus ke **Numerik**.
- Soal pilihan ganda 5 opsi. Jawaban benar bernilai 5, salah/kosong bernilai 0.
- Waktu SKD total sekitar 100 menit untuk semua subtes, jadi **target waktu ±1–1,5 menit per soal numerik**.

**[EDIT]** Parameter latihan default: 20 soal numerik, batas waktu 25 menit.

## 4. Cakupan Topik (Taksonomi Soal)

Setiap topik = satu atau lebih *generator*. Gunakan ID ini di kode.

| ID | Topik | Contoh pola soal |
|----|-------|------------------|
| `deret_angka` | Deret angka | Deret aritmetika, geometri, selisih bertingkat, deret kuadrat/kubik, deret Fibonacci-like, deret selang-seling (2 pola bercampur), deret bilangan prima |
| `deret_huruf_angka` | Deret campuran | Pola huruf + angka |
| `aritmetika_dasar` | Operasi hitung | Campuran + − × ÷, urutan operasi, kuadrat, akar, pangkat |
| `pecahan_desimal` | Pecahan & desimal | Penjumlahan/pengurangan pecahan, konversi pecahan↔desimal↔persen, urutan nilai |
| `persen` | Persentase | Persentase dari nilai, kenaikan/penurunan, diskon bertingkat |
| `aritmetika_sosial` | Aritmetika sosial | Untung, rugi, bunga tunggal, pajak, harga beli/jual |
| `perbandingan` | Perbandingan | Senilai, berbalik nilai, skala peta, pembagian proporsional |
| `kecepatan_jarak_waktu` | Jarak–kecepatan–waktu | Kecepatan rata-rata, dua kendaraan bertemu/menyusul |
| `usaha_pekerjaan` | Soal pekerjaan | Pekerja bersama, pipa mengisi/mengosongkan bak |
| `usia` | Soal umur | Selisih umur, jumlah umur, perbandingan umur n tahun lalu/lagi |
| `himpunan` | Himpunan | Diagram Venn 2–3 himpunan, irisan, gabungan |
| `bilangan` | Teori bilangan | FPB, KPK, faktor, kelipatan, bilangan prima, sisa pembagian |
| `aljabar_dasar` | Aljabar sederhana | Persamaan linear 1–2 variabel, soal cerita ke persamaan |
| `geometri_dasar` | Geometri | Keliling/luas bangun datar, volume bangun ruang sederhana, Pythagoras |
| `peluang_kombinatorika` | Peluang & susunan | Permutasi, kombinasi, peluang dasar |
| `statistika_dasar` | Statistik | Rata-rata, median, modus, rata-rata gabungan |
| `interpretasi_data` | Tabel/grafik | Soal berdasarkan tabel atau grafik data yang di-generate |
| `logika_hitung` | Logika hitung | Perbandingan nilai dua kuantitas (kuantitas A vs B), operasi bertanda khusus (mis. a ⊕ b = ...) |

Urutan prioritas implementasi ada di Bagian 9.

## 5. Desain Generator Soal

### 5.1 Pendekatan utama: generator berparameter (deterministik)

Setiap topik punya fungsi generator yang:

1. Memilih parameter acak dalam rentang yang masuk akal (seed bisa diatur agar reproducible).
2. Menyusun teks soal dari **template** bahasa Indonesia (beberapa variasi kalimat per template).
3. **Menghitung jawaban benar dengan kode.**
4. Membuat **4 pengecoh** (distractor) yang masuk akal, berdasarkan kesalahan umum, misalnya:
   - lupa urutan operasi,
   - salah persentase (pakai nilai awal vs nilai akhir),
   - tertukar rasio, salah satuan,
   - off-by-one pada deret.
5. Mengacak posisi jawaban benar di A–E.
6. Menghasilkan **pembahasan** langkah demi langkah dari data perhitungan yang sama.
7. Memvalidasi hasil (lihat 5.3).

Antarmuka generator (pseudokode, sesuaikan bahasa):

```
generate(topic_id, difficulty, seed?) -> Question
```

### 5.2 Pendekatan tambahan (opsional): LLM untuk variasi cerita

LLM boleh dipakai **hanya** untuk memparafrase konteks cerita (nama, benda, situasi) agar soal lebih bervariasi. Aturan ketat:

- Angka, struktur, dan jawaban tetap dari generator berbasis kode.
- Hasil parafrase wajib lolos pemeriksaan: semua angka dari soal asli masih ada dan tidak ada angka baru.
- Jika gagal validasi, pakai versi template asli.
- Fitur ini harus bisa dimatikan lewat konfigurasi, dan aplikasi harus tetap berfungsi penuh tanpa LLM/internet.

### 5.3 Validasi otomatis setiap soal

Soal hanya boleh disajikan jika lolos semua cek:

- Tepat **satu** opsi bernilai benar; tidak ada dua opsi yang sama.
- Semua opsi punya format/satuan yang konsisten.
- Jawaban benar berupa angka "wajar" (hindari hasil pecahan aneh kecuali memang topiknya pecahan; hindari angka terlalu besar yang tidak mungkin dihitung manual).
- Solver independen (hitung ulang dengan cara berbeda atau pakai pustaka simbolik) menghasilkan jawaban yang sama.
- Teks soal tidak mengandung placeholder yang belum terisi.

### 5.4 Tingkat kesulitan

| Level | Deskripsi | Target waktu |
|-------|-----------|--------------|
| 1 — Dasar | 1 langkah, angka kecil | < 45 detik |
| 2 — Menengah | 2–3 langkah, mirip soal CPNS umum | 1–1,5 menit |
| 3 — Sulit | Multi-langkah, perlu trik/strategi cepat | 1,5–2 menit |

Setiap generator wajib mendukung minimal level 1–3 lewat parameter.

## 6. Model Data

**[EDIT]** Sesuaikan dengan teknologi yang dipilih.

```json
Question {
  "id": "uuid",
  "topic": "deret_angka",
  "difficulty": 2,
  "seed": 12345,
  "text": "Tentukan angka selanjutnya: 3, 6, 12, 24, ...",
  "options": { "A": "36", "B": "42", "C": "48", "D": "54", "E": "60" },
  "correct": "C",
  "explanation_steps": [
    "Perhatikan rasio antar suku: 6/3 = 2, 12/6 = 2, 24/12 = 2.",
    "Pola: dikali 2 tiap suku.",
    "Suku berikutnya = 24 × 2 = 48."
  ],
  "shortcut_tip": "Jika rasio tetap, langsung kalikan suku terakhir dengan rasio.",
  "target_seconds": 60,
  "created_at": "ISO-8601"
}

Attempt {
  "id", "question_id", "session_id",
  "chosen": "B", "is_correct": false,
  "time_spent_seconds": 74, "answered_at"
}

Session {
  "id", "mode": "latihan|simulasi|per_topik",
  "topics": [...], "difficulty", "total_questions",
  "time_limit_seconds", "started_at", "finished_at", "score"
}
```

## 7. Fitur Aplikasi

### Wajib (MVP)
1. **Mode Latihan per Topik** — pilih topik + level, soal muncul satu per satu, jawaban langsung dicek, pembahasan ditampilkan.
2. **Mode Simulasi** — N soal acak lintas topik, timer hitung mundur, tidak ada pembahasan sampai selesai, skor akhir (benar × 5).
3. **Pembahasan** langkah demi langkah + tips cara cepat.
4. **Riwayat & statistik** — akurasi per topik, rata-rata waktu per soal, tren skor.
5. **Penyimpanan lokal** — semua data tersimpan di perangkat pengguna (tanpa wajib login).

### Tahap lanjutan
6. **Review kesalahan** — daftar soal yang salah, bisa diulang.
7. **Rekomendasi latihan** — sarankan topik dengan akurasi/waktu terburuk.
8. **Spaced repetition** sederhana untuk topik lemah.
9. **Ekspor** riwayat ke CSV.
10. **Tampilan gelap**, ukuran font bisa diubah, nyaman dipakai di HP.

## 8. Stack Teknologi

**[EDIT]** Belum ditentukan. Jika saya tidak menentukan, gunakan rekomendasi berikut dan jelaskan alasannya singkat sebelum mulai.

- **Rekomendasi default:** aplikasi web (responsif, bisa dibuka di HP) — TypeScript + framework frontend modern, generator soal ditulis sebagai modul murni (pure functions) agar mudah diuji. Data di penyimpanan browser (IndexedDB).
- Alternatif jika saya memilih desktop: aplikasi desktop dengan engine generator yang sama.
- **Syarat apa pun stack-nya:**
  - Modul generator **terpisah dari UI** (tidak ada kode UI di dalam generator).
  - Bisa berjalan **offline**.
  - Ada **unit test** untuk setiap generator.

Struktur folder yang disarankan:

```
/src
  /generators        # satu file per topik (deret_angka, persen, ...)
    index            # registry: topic_id -> generator
    distractors      # helper pembuat pengecoh
    validators       # validasi soal (Bagian 5.3)
    templates/       # template kalimat soal (bahasa Indonesia)
  /domain            # tipe Question, Attempt, Session, scoring
  /storage           # penyimpanan lokal & riwayat
  /ui                # halaman: beranda, latihan, simulasi, hasil, statistik
/tests
  generators/        # tes per generator
/docs
```

## 9. Rencana Kerja Bertahap

Kerjakan **satu fase per giliran**, tunjukkan hasil, lalu tunggu konfirmasi saya.

**Fase 0 — Persiapan**
- Konfirmasi stack dengan saya (atau pakai default di Bagian 8), buat kerangka proyek, setup test runner.

**Fase 1 — Inti generator (tanpa UI)**
- Implementasi tipe `Question`, registry generator, validator (5.3), helper pengecoh.
- Generator pertama: `deret_angka`, `aritmetika_dasar`, `persen`.
- Tes otomatis: generate 1.000 soal per generator, semuanya harus lolos validasi.

**Fase 2 — UI minimal**
- Mode Latihan per Topik dengan pembahasan.

**Fase 3 — Perluas topik**
- `pecahan_desimal`, `aritmetika_sosial`, `perbandingan`, `kecepatan_jarak_waktu`, `usaha_pekerjaan`, `usia`.

**Fase 4 — Simulasi & statistik**
- Mode Simulasi dengan timer, skor, riwayat, statistik per topik.

**Fase 5 — Topik lanjutan**
- `himpunan`, `bilangan`, `aljabar_dasar`, `geometri_dasar`, `peluang_kombinatorika`, `statistika_dasar`, `interpretasi_data`, `logika_hitung`, `deret_huruf_angka`.

**Fase 6 — Polesan**
- Review kesalahan, rekomendasi latihan, ekspor CSV, tampilan gelap, opsi variasi cerita berbasis LLM (5.2).

## 10. Kriteria Selesai (per Fase)

- Semua tes lulus.
- Untuk generator: 1.000 soal acak per level, 0 kegagalan validasi, 0 soal dengan >1 jawaban benar.
- Pembahasan terbaca jelas oleh orang yang belum tahu cara menyelesaikannya.
- Tidak ada soal dengan teks aneh, placeholder tersisa, atau angka tidak masuk akal.
- Ringkasan singkat perubahan + cara menjalankan disertakan di akhir fase.

## 11. Gaya Soal & Bahasa

- Bahasa Indonesia baku dan jelas, kalimat ringkas.
- Konteks cerita yang lazim: jual-beli, perjalanan, pekerjaan, usia, kolam/bak air, kelas/sekolah, kantor/instansi.
- Nama orang: nama Indonesia umum yang bervariasi (Andi, Siti, Budi, Dewi, dst.).
- Satuan konsisten (km/jam, meter, rupiah, liter).
- Format angka Indonesia: titik sebagai pemisah ribuan (mis. `Rp 1.500.000`), koma untuk desimal (mis. `2,5`).

Contoh gaya soal (hanya sebagai ilustrasi pola, bukan untuk disalin):

> Sebuah toko memberikan diskon 20% untuk sebuah barang seharga Rp 250.000. Jika pembeli membayar dengan uang Rp 300.000, berapa kembalian yang diterima?

> Rata-rata nilai 8 siswa adalah 72. Setelah satu siswa baru bergabung, rata-rata menjadi 74. Berapa nilai siswa baru tersebut?

## 12. Aturan Kerja untuk AI Agent

1. Sebelum menulis kode, ringkas rencana fase yang akan dikerjakan dalam beberapa baris.
2. Jika ada keputusan yang belum jelas, ajukan **maksimal satu pertanyaan** yang paling penting; selain itu, ambil asumsi wajar dan tulis asumsinya.
3. Tulis kode yang mudah dibaca dan dites; hindari over-engineering.
4. Jangan menambah fitur di luar fase yang sedang dikerjakan.
5. Jangan menyimpan atau mengirim data pengguna ke server luar tanpa persetujuan saya.
6. Setiap selesai fase: jalankan semua tes, laporkan hasilnya, dan jelaskan cara menjalankan aplikasi.
7. Jika menemukan fakta ujian (jumlah soal, passing grade, waktu) yang perlu dipastikan, tandai sebagai **perlu verifikasi** dan jangan di-hardcode tanpa konfigurasi.

## 13. Catatan Pribadi **[EDIT]**

- Target tanggal ujian: _(isi)_
- Topik yang saya rasa paling lemah: _(isi)_
- Perangkat utama untuk belajar: _(HP / laptop)_
- Preferensi bahasa pemrograman/stack: _(isi, atau biarkan agent memakai default)_
