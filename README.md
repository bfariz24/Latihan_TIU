# CPNS TIU Numerik — Aplikasi Latihan & Generator Soal

Aplikasi belajar TIU numerik SKD CPNS dengan **generator soal otomatis**.
Kunci jawaban dihitung oleh kode (bukan ditebak LLM), setiap soal disertai pembahasan langkah demi langkah.

Dokumen spesifikasi lengkap: [`CPNS-TIU-APP-SPEC.md`](CPNS-TIU-APP-SPEC.md)

---

## Cara Menjalankan (tanpa instalasi)

Cukup **dobel-klik** file HTML di browser:

| File | Fungsi |
|------|--------|
| `index.html` | **Aplikasi latihan** (beranda, pilih topik/level, kartu soal, pembahasan, skor, riwayat) |
| `tests/test.html` | Halaman tes: generate 1.000 soal per topik per level + validasi |

Semua berjalan **offline** di browser. Tidak perlu Node.js, npm, atau server.

## Sumber Soal

Aplikasi punya dua sumber soal:

1. **Generator otomatis** — soal dibuat acak oleh kode, kunci dihitung oleh kode.
2. **Bank soal (`data/soal.json`)** — soal statis dengan format dari `test TIU.md`
   (`kategori`, `subkategori`, `pertanyaan`, `pilihan`, `jawaban`, `pembahasan`).

`src/core/adapter.js` menjembatani keduanya: `questionToJson` (generator → format bank)
dan `jsonToItem` (bank → bentuk seragam untuk UI).

Bank soal `data/soal.json` berisi soal **Verbal/Analogi** (31 soal, berbagai jenis hubungan:
tempat kerja, fungsi, bahan–hasil, antonim/sinonim, dsb.) dan beberapa contoh Numerik.
Posisi kunci jawaban disebar merata di A–E.

> Catatan: soal analogi berbasis pengetahuan, jadi kuncinya ditulis manual (tidak dihitung
> kode). Validasi otomatis tetap memeriksa format: 5 pilihan unik, jawaban A–E, pembahasan ada.

> Catatan: saat dibuka lewat `file://`, browser memblokir `fetch()` ke file lokal.
> Karena itu `data/soal.js` disediakan sebagai salinan fallback dari `data/soal.json`.
> Jika kamu mengubah `soal.json`, samakan juga `soal.js` (atau jalankan via server lokal
> seperti `python -m http.server` agar `fetch` bekerja langsung dari JSON).

## Struktur

```
/index.html           # aplikasi latihan (dobel-klik)
/data
  soal.json           # bank soal statis (format test TIU.md)
  soal.js             # fallback agar tetap jalan via file://
/src
  /core
    rng.js            # RNG ber-seed + format angka Indonesia
    question.js       # tipe Question + builder
    adapter.js        # konversi Question <-> format soal.json
  /generators         # modul murni, tanpa kode UI
    index.js          # registry: topic_id -> generator + validasi otomatis
    distractors.js    # helper pembuat pengecoh
    validators.js     # validasi soal (Bagian 5.3)
    deret_angka.js
    aritmetika_dasar.js
    persen.js
    pecahan_desimal.js
    perbandingan.js
    kecepatan_jarak_waktu.js
    usaha_pekerjaan.js
    usia.js
  /ui
    app.js            # logika UI (beranda, latihan, hasil, riwayat)
    styles.css        # tema biru-putih, responsif
/tests
  test.html           # UI tes (dobel-klik)
  runner.js           # logika tes
  node-check.js       # opsional: `node tests/node-check.js`
  adapter-check.js    # opsional: `node tests/adapter-check.js`
```

Modul generator memakai pola global namespace `window.TIU` (bukan ES module) agar
aplikasi tetap bisa dibuka langsung via `file://` tanpa server.

## Topik yang sudah ada

| ID | Level | Pola / varian |
|----|-------|----------------|
| `deret_angka` | 1–3 | aritmetika, geometri, kuadrat, kubik, selisih bertingkat, Fibonacci-like, selang-seling, prima |
| `aritmetika_dasar` | 1–3 | urutan operasi, tanda kurung, kuadrat/kubik, akar, campuran bagi |
| `persen` | 1–3 | persen dari nilai, diskon + kembalian, naik/turun, diskon bertingkat, cari persentase, pajak |
| `pecahan_desimal` | 1–3 | penjumlahan/pengurangan pecahan, pecahan→desimal, persen→pecahan, urutan pecahan, perkalian pecahan |
| `perbandingan` | 1–3 | senilai, berbalik nilai, skala peta, pembagian proporsional, selisih diketahui |
| `kecepatan_jarak_waktu` | 1–3 | jarak, waktu, kecepatan rata-rata, berlawanan arah, menyusul |
| `usaha_pekerjaan` | 1–3 | dua pekerja bersama, tiga pekerja, pipa mengisi bak, isi + kosong |
| `usia` | 1–3 | jumlah & selisih umur, perbandingan umur, n tahun lalu/datang, selisih tetap, rata-rata umur |

## Tema

Tombol 🌙/☀️ di kanan atas untuk beralih **mode terang/gelap**. Pilihan disimpan di
`localStorage` dan otomatis mengikuti preferensi sistem saat pertama dibuka.

## Status Tes

- Generator: **24.000 soal** (8 topik × 3 level × 1.000), **0 gagal validasi**.
- Adapter: generator→JSON→item **OK**; `soal.json` **VALID**.

Setiap soal divalidasi untuk:
- tepat satu opsi benar, 5 opsi unik;
- kunci cocok dengan nilai jawaban hasil hitung kode;
- **solver independen** menghitung ulang dan harus sepakat;
- tidak ada placeholder/`undefined`/`NaN` tersisa;
- pembahasan lengkap.

## Fase

- [x] Fase 0 — kerangka + test runner
- [x] Fase 1 — inti generator (`deret_angka`, `aritmetika_dasar`, `persen`)
- [x] UI minimal + integrasi bank soal `soal.json`
- [ ] Fase 3 — perluas topik
- [ ] Fase 4 — simulasi & statistik
- [ ] Fase 5 — topik lanjutan
- [ ] Fase 6 — polesan
