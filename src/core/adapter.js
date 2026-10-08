(function () {
  "use strict";

  var TIU = window.TIU;

  // Peta topic_id -> {kategori, subkategori} gaya test TIU.md
  var TOPIC_META = {
    deret_angka: { kategori: "Numerik", subkategori: "Deret Angka" },
    aritmetika_dasar: { kategori: "Numerik", subkategori: "Operasi Hitung" },
    persen: { kategori: "Numerik", subkategori: "Persentase" },
    pecahan_desimal: { kategori: "Numerik", subkategori: "Pecahan & Desimal" },
    perbandingan: { kategori: "Numerik", subkategori: "Perbandingan" },
    kecepatan_jarak_waktu: { kategori: "Numerik", subkategori: "Kecepatan & Jarak" },
    usaha_pekerjaan: { kategori: "Numerik", subkategori: "Pekerjaan" },
    usia: { kategori: "Numerik", subkategori: "Soal Umur" }
  };

  // Question (generator) -> format soal.json (test TIU.md)
  function questionToJson(q, id) {
    var meta = TOPIC_META[q.topic] || { kategori: "Numerik", subkategori: q.topic };
    var pembahasan = q.explanation_steps.slice();
    if (q.shortcut_tip) pembahasan.push("Tips cepat: " + q.shortcut_tip);

    return {
      id: id,
      kategori: meta.kategori,
      subkategori: meta.subkategori,
      pertanyaan: q.text,
      pilihan: {
        A: q.options.A,
        B: q.options.B,
        C: q.options.C,
        D: q.options.D,
        E: q.options.E
      },
      jawaban: q.correct,
      pembahasan: pembahasan,
      _source: "generator",
      _topic: q.topic,
      _difficulty: q.difficulty,
      _opts: q
    };
  }

  // soal.json (test TIU.md) -> bentuk internal seragam untuk UI
  function jsonToItem(s) {
    var pembahasan = Array.isArray(s.pembahasan) ? s.pembahasan.slice() : [String(s.pembahasan || "")];
    return {
      id: s.id,
      kategori: s.kategori,
      subkategori: s.subkategori,
      pertanyaan: s.pertanyaan,
      pilihan: s.pilihan,
      jawaban: s.jawaban,
      pembahasan: pembahasan,
      _source: "json"
    };
  }

  // Validasi item format soal.json
  function validateJsonItem(s) {
    var errors = [];
    var KEYS = ["A", "B", "C", "D", "E"];
    if (typeof s.pertanyaan !== "string" || !s.pertanyaan.trim()) errors.push("pertanyaan kosong");
    if (!s.pilihan || typeof s.pilihan !== "object") {
      errors.push("pilihan tidak ada");
    } else {
      var seen = {};
      KEYS.forEach(function (k) {
        if (typeof s.pilihan[k] !== "string") errors.push("pilihan " + k + " tidak valid");
        else seen[s.pilihan[k]] = true;
      });
      if (Object.keys(seen).length !== 5) errors.push("pilihan tidak unik / kurang dari 5");
    }
    if (KEYS.indexOf(s.jawaban) === -1) errors.push("jawaban bukan A-E");
    if (s.pembahasan == null || (Array.isArray(s.pembahasan) && s.pembahasan.length === 0)) {
      errors.push("pembahasan kosong");
    }
    return errors;
  }

  function validateJsonFile(obj) {
    var errors = [];
    if (!obj || !Array.isArray(obj.soal)) {
      return ["root harus punya array 'soal'"];
    }
    obj.soal.forEach(function (s, i) {
      var e = validateJsonItem(s);
      e.forEach(function (msg) {
        errors.push("soal[" + i + "]: " + msg);
      });
    });
    return errors;
  }

  TIU.adapter = {
    TOPIC_META: TOPIC_META,
    questionToJson: questionToJson,
    jsonToItem: jsonToItem,
    validateJsonItem: validateJsonItem,
    validateJsonFile: validateJsonFile
  };
})();
