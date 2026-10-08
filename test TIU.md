
- **Responsif**: Mobile-friendly
- **Tema**: Bersih, modern, warna biru-putih (nuansa edukasi)
- **Tanpa backend**: Semua data soal disimpan di file JSON lokal

---

## 📦 Format Data Soal (soal.json)

```json
{
  "soal": [
    {
      "id": 1,
      "kategori": "Verbal",
      "subkategori": "Analogi",
      "pertanyaan": "Dokter : Rumah Sakit = Guru : ...",
      "pilihan": {
        "A": "Murid",
        "B": "Sekolah",
        "C": "Buku",
        "D": "Papan Tulis",
        "E": "Pensil"
      },
      "jawaban": "B",
      "pembahasan": "Dokter bekerja di rumah sakit, guru bekerja di sekolah."
    },
    {
      "id": 2,
      "kategori": "Numerik",
      "subkategori": "Deret Angka",
      "pertanyaan": "2, 4, 8, 16, ...",
      "pilihan": { "A": "20", "B": "24", "C": "32", "D": "36", "E": "40" },
      "jawaban": "C",
      "pembahasan": "Setiap angka dikali 2."
    }
  ]
}