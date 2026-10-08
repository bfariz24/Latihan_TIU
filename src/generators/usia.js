(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  var ORANG = ["Andi", "Bima", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hadi", "Indra", "Joko"];

  function names(rng, n) {
    var pool = ORANG.slice();
    var out = [];
    for (var i = 0; i < n; i++) {
      var idx = randInt(rng, 0, pool.length - 1);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var variants = [];

    // V1: jumlah & perbandingan umur
    variants.push(function () {
      var n = names(rng, 2);
      var umurA = randInt(rng, 10, 50);
      var umurB = randInt(rng, 10, 50);
      while (umurB === umurA) umurB = randInt(rng, 10, 50);
      var jumlah = umurA + umurB;
      var selisih = Math.abs(umurA - umurB);
      // soal: jumlah umur, selisih diketahui -> cari umur yang lebih tua
      var ans = Math.max(umurA, umurB);
      return {
        text:
          "Jumlah umur " + n[0] + " dan " + n[1] + " adalah " + jumlah + " tahun.\n" +
          "Selisih umur mereka " + selisih + " tahun.\n" +
          "Berapa umur " + n[0] + " jika " + n[0] + " lebih tua dari " + n[1] + "?",
        ans: ans,
        distractors: [Math.min(umurA, umurB), jumlah - selisih, jumlah / 2, ans + selisih, ans - 1],
        steps: [
          "Misal umur " + n[0] + " = x dan " + n[1] + " = y.",
          "x + y = " + jumlah + " dan x \u2212 y = " + selisih + ".",
          "Jumlahkan: 2x = " + (jumlah + selisih) + " \u2192 x = " + ans + ".",
          "Jadi umur " + n[0] + " = " + ans + " tahun."
        ],
        tip: "Umur lebih tua = (jumlah + selisih) \u00f7 2.",
        solver: function () {
          return (jumlah + selisih) / 2;
        }
      };
    });

    // V2: perbandingan umur sekarang vs n tahun lalu
    variants.push(function () {
      var n = names(rng, 2);
      var kali = randInt(rng, 2, 5);
      var x = randInt(rng, 5, 20);          // umur anak sekarang
      var selisih = (kali - 1) * x;         // selisih tetap
      var ans = x + selisih;                // umur orang tua sekarang
      return {
        text:
          "Umur " + n[0] + " saat ini " + kali + " kali umur " + n[1] + ".\n" +
          "Umur " + n[1] + " sekarang " + x + " tahun.\n" +
          "Berapa umur " + n[0] + " sekarang?",
        ans: ans,
        distractors: [x + kali, x * kali + x, ans + x, ans - x, kali + x],
        steps: [
          "Umur " + n[1] + " = " + x + " tahun.",
          "Umur " + n[0] + " = " + kali + " \u00d7 umur " + n[1] + ".",
          "Hitung: " + kali + " \u00d7 " + x + " = " + ans + " tahun."
        ],
        tip: "'k kali' berarti kalikan langsung.",
        solver: function () {
          return kali * x;
        }
      };
    });

    // V3: umur sekarang vs n tahun lalu / n tahun akan datang (level 2/3)
    variants.push(function () {
      var n = names(rng, 1);
      var now = randInt(rng, 15, 45);
      var tahun = randInt(rng, 3, 12);
      var lalu = rng() < 0.5;
      var ans = lalu ? now - tahun : now + tahun;
      return {
        text:
          "Umur " + n[0] + " sekarang " + now + " tahun.\n" +
          "Berapa umur " + n[0] + " " + tahun + " tahun " + (lalu ? "yang lalu" : "yang akan datang") + "?",
        ans: ans,
        distractors: [lalu ? now + tahun : now - tahun, now, now - tahun * 2, now + tahun * 2],
        steps: [
          "Umur sekarang diketahui " + now + " tahun.",
          (lalu ? "Yang lalu berarti dikurangi: " : "Yang akan datang berarti ditambah: ") + now + (lalu ? " \u2212 " : " + ") + tahun + ".",
          "Hasil = " + ans + " tahun."
        ],
        tip: "'yang lalu' = kurang, 'yang akan datang' = tambah.",
        solver: function () {
          return lalu ? now - tahun : now + tahun;
        }
      };
    });

    // V4: selisih umur tetap sepanjang waktu (level 3)
    variants.push(function () {
      var n = names(rng, 2);
      var anakSekarang = randInt(rng, 6, 14);
      var ayahSekarang = anakSekarang + randInt(rng, 22, 30);
      var tahun = randInt(rng, 4, 10);
      // selisih tetap
      var ans = ayahSekarang - anakSekarang;
      return {
        text:
          "Umur " + n[0] + " sekarang " + ayahSekarang + " tahun dan umur " + n[1] + " sekarang " + anakSekarang + " tahun.\n" +
          "Berapa selisih umur mereka " + tahun + " tahun yang akan datang?",
        ans: ans,
        distractors: [ans + tahun, ans - tahun, ayahSekarang + tahun, anakSekarang + tahun, ans + tahun * 2],
        steps: [
          "Selisih umur sekarang = " + ayahSekarang + " \u2212 " + anakSekarang + " = " + ans + " tahun.",
          "Selisih umur selalu tetap (keduanya bertambah sama banyak).",
          "Jadi " + tahun + " tahun lagi selisihnya tetap " + ans + " tahun."
        ],
        tip: "Selisih umur tidak pernah berubah seiring waktu.",
        solver: function () {
          return ayahSekarang - anakSekarang;
        }
      };
    });

    // V5: umur gabungan 3 orang (level 3)
    variants.push(function () {
      var n = names(rng, 3);
      var a = randInt(rng, 8, 20), b = randInt(rng, 8, 20), c = randInt(rng, 8, 20);
      var rata = Math.round(((a + b + c) / 3) * 100) / 100;
      // buat kelipatan supaya rata-rata bulat
      var total = (a + b + c);
      var ans = Math.round((total / 3) * 100) / 100;
      return {
        text:
          "Umur " + n[0] + " " + a + " tahun, " + n[1] + " " + b + " tahun, dan " + n[2] + " " + c + " tahun.\n" +
          "Berapa rata-rata umur ketiganya?",
        ans: ans,
        distractors: [total, a + b, total / 2, ans + 1, ans - 1, Math.max(a, b, c)],
        steps: [
          "Jumlahkan semua umur: " + a + " + " + b + " + " + c + " = " + total + " tahun.",
          "Banyak orang = 3.",
          "Rata-rata = " + total + " \u00f7 3 = " + f(ans) + " tahun."
        ],
        tip: "Rata-rata = jumlah data \u00f7 banyak data.",
        solver: function () {
          return total / 3;
        }
      };
    });

    var pool = d === 1 ? [variants[1], variants[2]] : d === 2 ? [variants[0], variants[1], variants[2], variants[4]] : [variants[0], variants[3], variants[4], variants[2]];
    var chosen = pick(rng, pool)();
    var ans = Math.round(chosen.ans * 100) / 100;

    return TIU.question.buildQuestion(
      {
        topic: "usia",
        difficulty: d,
        seed: seed,
        text: chosen.text,
        answerValue: ans,
        distractors: chosen.distractors,
        steps: chosen.steps,
        tip: chosen.tip,
        solver: chosen.solver
      },
      rng
    );
  }

  TIU.generators = TIU.generators || {};
  TIU.generators.usia = { generate: build, topic: "usia" };
})();
