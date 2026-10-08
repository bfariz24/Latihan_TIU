(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  function round4(x) {
    return Math.round(x * 10000) / 10000;
  }

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = b; b = a % b; a = t; }
    return a || 1;
  }

  function frac(n, d) {
    var g = gcd(n, d);
    return (n / g) + "/" + (d / g);
  }

  function distinct4(correctText, candidates) {
    var seen = {};
    seen[correctText] = true;
    var out = [];
    for (var i = 0; i < candidates.length && out.length < 4; i++) {
      var c = candidates[i];
      if (typeof c !== "string" || !c || seen[c]) continue;
      seen[c] = true;
      out.push(c);
    }
    return out;
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var variants = [];

    // V1: penjumlahan/pengurangan pecahan beda penyebut
    variants.push(function () {
      var d1 = pick(rng, [2, 3, 4, 5, 6, 8]);
      var d2 = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12]);
      while (d2 === d1) d2 = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12]);
      var n1 = randInt(rng, 1, d1 - 1);
      var n2 = randInt(rng, 1, d2 - 1);
      var tambah = rng() < 0.6;
      var kpk = (d1 * d2) / gcd(d1, d2);
      var a = n1 * (kpk / d1);
      var b = n2 * (kpk / d2);
      var num = tambah ? a + b : a - b;
      if (num <= 0) { tambah = true; num = a + b; }
      var op = tambah ? "+" : "\u2212";
      var correctText = frac(num, kpk);
      return {
        text: "Hitunglah: " + frac(n1, d1) + " " + op + " " + frac(n2, d2) + " = \u2026",
        answerValue: round4(num / kpk),
        correctText: correctText,
        distractorTexts: distinct4(correctText, [
          frac(a + b, d1 + d2),
          frac(num + 1, kpk),
          frac(Math.abs(num - 1), kpk),
          frac(a * b, kpk),
          frac(kpk, num > 0 ? num : 1),
          frac(n1 + n2, d1 + d2)
        ]),
        steps: [
          "Samakan penyebut dengan KPK dari " + d1 + " dan " + d2 + ", yaitu " + kpk + ".",
          frac(n1, d1) + " = " + a + "/" + kpk + " dan " + frac(n2, d2) + " = " + b + "/" + kpk + ".",
          "Hitung pembilang: " + a + " " + op + " " + b + " = " + num + ".",
          "Hasil = " + correctText + " \u2248 " + f(round4(num / kpk)) + "."
        ],
        tip: "Samakan penyebut dulu, baru jumlahkan/kurangkan pembilangnya.",
        solver: function () {
          return tambah ? n1 / d1 + n2 / d2 : n1 / d1 - n2 / d2;
        }
      };
    });

    // V2: konversi pecahan -> desimal (mode numerik)
    variants.push(function () {
      var den = pick(rng, [2, 4, 5, 8, 10, 20, 25, 50]);
      var num = randInt(rng, 1, den - 1);
      var ans = round4(num / den);
      return {
        text: "Bentuk desimal dari pecahan " + frac(num, den) + " adalah \u2026",
        answerValue: ans,
        distractors: [
          round4(den / num),
          round4(num / den) + 0.1,
          round4(num / den) - 0.05,
          round4((num + den) / den),
          num * 10 + den
        ],
        steps: [
          "Desimal diperoleh dengan membagi pembilang oleh penyebut.",
          num + " \u00f7 " + den + " = " + f(ans) + ".",
          "Jadi bentuk desimalnya " + f(ans) + "."
        ],
        tip: "\u00f72 = 0,5; \u00f74 = 0,25; \u00f75 = 0,2; \u00f78 = 0,125.",
        solver: function () {
          return num / den;
        }
      };
    });

    // V3: persen -> pecahan biasa paling sederhana
    variants.push(function () {
      var pct = pick(rng, [20, 25, 30, 40, 50, 60, 75, 80]);
      var correctText = frac(pct, 100);
      return {
        text: "Bentuk pecahan biasa paling sederhana dari " + pct + "% adalah \u2026",
        answerValue: round4(pct / 100),
        correctText: correctText,
        distractorTexts: distinct4(correctText, [
          frac(pct, 10),
          frac(pct, 1000),
          frac(100, pct),
          frac(pct + 5, 100),
          frac(pct, 100 + pct)
        ]),
        steps: [
          pct + "% = " + pct + "/100.",
          "Sederhanakan dengan membagi pembilang dan penyebut dengan FPB.",
          "Hasil = " + correctText + "."
        ],
        tip: "Persen selalu berarti 'per 100'.",
        solver: function () {
          return pct / 100;
        }
      };
    });

    // V4: urutan pecahan (cari yang terbesar)
    variants.push(function () {
      var set = [
        { n: 1, d: 2, v: 0.5 },
        { n: 2, d: 3, v: 2 / 3 },
        { n: 3, d: 4, v: 0.75 }
      ];
      if (d >= 3) {
        set = [
          { n: 3, d: 5, v: 0.6 },
          { n: 5, d: 8, v: 0.625 },
          { n: 2, d: 3, v: 2 / 3 },
          { n: 7, d: 10, v: 0.7 }
        ];
      }
      var terbesar = set[0];
      for (var i = 1; i < set.length; i++) if (set[i].v > terbesar.v) terbesar = set[i];
      var correctText = frac(terbesar.n, terbesar.d);
      return {
        text:
          "Manakah pecahan terbesar di antara: " +
          set.map(function (x) { return frac(x.n, x.d); }).join(", ") + "?",
        answerValue: round4(terbesar.v),
        correctText: correctText,
        distractorTexts: distinct4(correctText, set.map(function (x) { return frac(x.n, x.d); })),
        steps: [
          "Ubah tiap pecahan menjadi desimal untuk membandingkan.",
          set.map(function (x) { return frac(x.n, x.d) + " \u2248 " + f(round4(x.v)); }).join("; ") + ".",
          "Yang terbesar adalah " + correctText + "."
        ],
        tip: "Bandingkan dengan menyamakan penyebut atau mengubah ke desimal.",
        solver: function () {
          return Math.max.apply(null, set.map(function (x) { return x.v; }));
        }
      };
    });

    // V5: perkalian pecahan
    variants.push(function () {
      var a1 = randInt(rng, 1, 5), b1 = randInt(rng, 2, 7);
      var a2 = randInt(rng, 1, 5), b2 = randInt(rng, 2, 7);
      var correctText = frac(a1 * a2, b1 * b2);
      return {
        text: "Hitunglah: " + frac(a1, b1) + " \u00d7 " + frac(a2, b2) + " = \u2026",
        answerValue: round4((a1 / b1) * (a2 / b2)),
        correctText: correctText,
        distractorTexts: distinct4(correctText, [
          frac(a1 + a2, b1 * b2),
          frac(a1 * a2, b1 + b2),
          frac(a1 + a2, b1 + b2),
          frac(a1 * a2 + 1, b1 * b2),
          frac(b1 * b2, a1 * a2)
        ]),
        steps: [
          "Perkalian pecahan: kalikan pembilang dengan pembilang, penyebut dengan penyebut.",
          "Pembilang: " + a1 + " \u00d7 " + a2 + " = " + (a1 * a2) + ".",
          "Penyebut: " + b1 + " \u00d7 " + b2 + " = " + (b1 * b2) + ".",
          "Hasil = " + correctText + " \u2248 " + f(round4((a1 / b1) * (a2 / b2))) + "."
        ],
        tip: "Kalikan lurus: atas \u00d7 atas, bawah \u00d7 bawah.",
        solver: function () {
          return (a1 / b1) * (a2 / b2);
        }
      };
    });

    var pool =
      d === 1
        ? [variants[1], variants[2], variants[0]]
        : d === 2
        ? [variants[0], variants[1], variants[2], variants[3]]
        : [variants[3], variants[4], variants[0]];
    var chosen = pick(rng, pool)();

    return TIU.question.buildQuestion(
      {
        topic: "pecahan_desimal",
        difficulty: d,
        seed: seed,
        text: chosen.text,
        answerValue: round4(chosen.answerValue),
        correctText: chosen.correctText,
        distractorTexts: chosen.distractorTexts,
        distractors: chosen.distractors,
        steps: chosen.steps,
        tip: chosen.tip,
        solver: chosen.solver
      },
      rng
    );
  }

  TIU.generators = TIU.generators || {};
  TIU.generators.pecahan_desimal = { generate: build, topic: "pecahan_desimal" };
})();
