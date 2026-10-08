(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  var ORANG = ["Andi", "Bima", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hadi"];

  function namePair(rng) {
    var a = randInt(rng, 0, ORANG.length - 1);
    var b = randInt(rng, 0, ORANG.length - 1);
    while (b === a) b = randInt(rng, 0, ORANG.length - 1);
    return [ORANG[a], ORANG[b]];
  }

  function round2(x) {
    return Math.round(x * 10000) / 10000;
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var variants = [];

    // V1: dua pekerja bersama -> hari bersama (level 2 & 3)
    variants.push(function () {
      var hari = pick(rng, [12, 15, 18, 20, 24, 30, 36, 40, 60]);
      var hari2 = pick(rng, [10, 12, 15, 16, 20, 24, 30, 4, 5]);
      if (hari2 === hari) hari2 = hari === 20 ? 30 : 20;
      var n = namePair(rng);
      // 1/h + 1/h2
      var rate = 1 / hari + 1 / hari2;
      var ans = 1 / rate;
      var ansStr = round2(ans);
      return {
        text:
          "Suatu pekerjaan dapat diselesaikan oleh " + n[0] + " dalam " + hari + " hari.\n" +
          "Jika pekerjaan itu dikerjakan oleh " + n[1] + " sendiri, selesai dalam " + hari2 + " hari.\n" +
          "Jika keduanya bekerja bersama, pekerjaan itu selesai dalam berapa hari?",
        ans: ansStr,
        distractors: [
          (hari + hari2) / 2,
          hari + hari2,
          Math.abs(hari - hari2),
          1 / ((1 / hari) * 2),
          round2(ans) + 1,
          hari * hari2 / (hari + hari2) + 1,
          round2(1 / (1 / hari - 1 / hari2))
        ],
        steps: [
          "Kecepatan " + n[0] + " = 1/" + hari + " pekerjaan per hari.",
          "Kecepatan " + n[1] + " = 1/" + hari2 + " pekerjaan per hari.",
          "Digabung: 1/" + hari + " + 1/" + hari2 + " = " + f(rate) + " pekerjaan per hari.",
          "Waktu bersama = 1 \u00f7 " + f(rate) + " = " + f(ansStr) + " hari."
        ],
        tip: "Rumus cepat: t = (a \u00d7 b) \u00f7 (a + b).",
        solver: function () {
          return 1 / (1 / hari + 1 / hari2);
        }
      };
    });

    // V2: tiga pekerja bersama (level 3) — tripel terkurasi, hasil selalu bulat
    variants.push(function () {
      var TRIPLES = [
        [12, 12, 12, 4],
        [20, 30, 60, 10],
        [10, 20, 20, 5],
        [15, 15, 15, 5],
        [6, 6, 6, 2],
        [8, 8, 4, 2],
        [12, 12, 6, 3],
        [12, 24, 24, 6],
        [30, 30, 30, 10],
        [6, 12, 12, 3],
        [24, 24, 24, 8],
        [20, 20, 10, 5],
        [15, 10, 30, 5],
        [30, 20, 60, 10],
        [18, 18, 9, 4.5]
      ];
      var t = pick(rng, TRIPLES);
      var hariA = t[0], hariB = t[1], hariC = t[2], total = t[3];
      var invSum = 1 / hariA + 1 / hariB + 1 / hariC;
      var n = namePair(rng);
      return {
        text:
          "Sebuah pekerjaan dapat diselesaikan oleh " + n[0] + " dalam " + hariA + " hari, " +
          n[1] + " dalam " + hariB + " hari, dan seorang pekerja ketiga dalam " + hariC + " hari.\n" +
          "Jika ketiganya bekerja bersama, pekerjaan itu selesai dalam berapa hari?",
        ans: total,
        distractors: [
          round2((hariA + hariB + hariC) / 3),
          hariA + hariB + hariC,
          round2(total + 1),
          round2(total - 1),
          round2(hariA / 2),
          round2(total * 2),
          round2(1 / (1 / hariA + 1 / hariB))
        ],
        steps: [
          "Kecepatan " + n[0] + " = 1/" + hariA + ", " + n[1] + " = 1/" + hariB + ", pekerja ketiga = 1/" + hariC + " pekerjaan per hari.",
          "Kecepatan gabungan = 1/" + hariA + " + 1/" + hariB + " + 1/" + hariC + " = " + f(round2(invSum)) + ".",
          "Waktu bersama = 1 \u00f7 " + f(round2(invSum)) + " = " + f(total) + " hari."
        ],
        tip: "Jumlahkan semua kecepatan (1/hari), lalu kebalikkan hasilnya.",
        solver: function () {
          return 1 / (1 / hariA + 1 / hariB + 1 / hariC);
        }
      };
    });

    // V3: pipa mengisi & mengosongkan bak (level 2 & 3)
    variants.push(function () {
      var isi1 = pick(rng, [6, 8, 10, 12, 15, 20]);
      var isi2 = pick(rng, [4, 5, 6, 10, 12]);
      var rate = 1 / isi1 + 1 / isi2;
      var ans = round2(1 / rate);
      return {
        text:
          "Sebuah bak air dapat diisi oleh pipa A dalam " + isi1 + " jam.\n" +
          "Pipa B dapat mengisi bak yang sama dalam " + isi2 + " jam.\n" +
          "Jika kedua pipa dibuka bersamaan, bak penuh dalam berapa jam?",
        ans: ans,
        distractors: [(isi1 + isi2) / 2, isi1 + isi2, Math.abs(isi1 - isi2), round2(ans + 1), round2(ans - 1)],
        steps: [
          "Debit pipa A = 1/" + isi1 + " bak per jam.",
          "Debit pipa B = 1/" + isi2 + " bak per jam.",
          "Debit gabungan = 1/" + isi1 + " + 1/" + isi2 + " = " + f(round2(rate)) + " bak per jam.",
          "Waktu = 1 \u00f7 " + f(round2(rate)) + " = " + f(ans) + " jam."
        ],
        tip: "Sama seperti soal pekerjaan: t = (a \u00d7 b)/(a + b).",
        solver: function () {
          return 1 / (1 / isi1 + 1 / isi2);
        }
      };
    });

    // V4: satu mengisi, satu mengosongkan (level 3)
    variants.push(function () {
      var isi = pick(rng, [4, 5, 6, 8, 10]);
      var buang = pick(rng, [12, 15, 20, 24, 30]);
      var rate = 1 / isi - 1 / buang;
      var ans = round2(1 / rate);
      return {
        text:
          "Pipa A dapat mengisi penuh sebuah bak dalam " + isi + " jam.\n" +
          "Sementara kran pembuangan dapat mengosongkan bak penuh dalam " + buang + " jam.\n" +
          "Jika pipa A dan kran pembuangan dibuka bersamaan dari bak kosong, bak akan penuh dalam berapa jam?",
        ans: ans,
        distractors: [round2(1 / (1 / isi + 1 / buang)), buang - isi, round2(ans + 2), round2(ans - 2), isi + buang],
        steps: [
          "Debit pengisian = 1/" + isi + " bak per jam.",
          "Debit pengosongan = 1/" + buang + " bak per jam (mengurangi).",
          "Debit efektif = 1/" + isi + " \u2212 1/" + buang + " = " + f(round2(rate)) + " bak per jam.",
          "Waktu = 1 \u00f7 " + f(round2(rate)) + " = " + f(ans) + " jam."
        ],
        tip: "Yang mengosongkan mengurangi, jadi kurangkan kecepatannya.",
        solver: function () {
          return 1 / (1 / isi - 1 / buang);
        }
      };
    });

    var pool = d === 1 ? [variants[0], variants[2]] : d === 2 ? [variants[0], variants[2], variants[3]] : [variants[0], variants[1], variants[3]];
    var chosen = pick(rng, pool)();
    var ans = round2(chosen.ans);

    return TIU.question.buildQuestion(
      {
        topic: "usaha_pekerjaan",
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
  TIU.generators.usaha_pekerjaan = { generate: build, topic: "usaha_pekerjaan" };
})();
