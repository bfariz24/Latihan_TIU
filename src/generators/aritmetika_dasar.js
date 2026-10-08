(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  function round2(x) {
    return Math.round(x * 100) / 100;
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var maxA = d === 1 ? 20 : d === 2 ? 50 : 120;

    var a = randInt(rng, 2, maxA);
    var b = randInt(rng, 2, maxA);
    var c = randInt(rng, 2, d === 1 ? 5 : 12);
    var k = randInt(rng, 2, d === 1 ? 6 : 12);

    var variants = [];

    // Variasi 1: a + b x c
    variants.push(function () {
      var ans = a + b * c;
      return {
        text: "Hitunglah hasil dari: " + f(a) + " + " + f(b) + " \u00d7 " + f(c),
        ans: ans,
        distractors: [(a + b) * c, a + b * (c + 1), a + b * (c - 1), ans + b, ans - c],
        steps: [
          "Ingat urutan operasi: kerjakan perkalian lebih dahulu.",
          "Hitung " + f(b) + " \u00d7 " + f(c) + " = " + f(b * c) + ".",
          "Kemudian " + f(a) + " + " + f(b * c) + " = " + f(ans) + "."
        ],
        tip: "Prioritaskan \u00d7 dan \u00f7 sebelum + dan \u2212.",
        solver: function () {
          return a + b * c;
        }
      };
    });

    // Variasi 2: (a - b) x c
    variants.push(function () {
      var hi = Math.max(a, b);
      var lo = Math.min(a, b);
      var ans = (hi - lo) * c;
      return {
        text: "Hitunglah hasil dari: (" + f(hi) + " \u2212 " + f(lo) + ") \u00d7 " + f(c),
        ans: ans,
        distractors: [hi - lo * c, hi - lo * (c + 1), ans + c, ans - hi],
        steps: [
          "Kerjakan operasi dalam tanda kurung lebih dahulu.",
          "Hitung " + f(hi) + " \u2212 " + f(lo) + " = " + f(hi - lo) + ".",
          "Kemudian " + f(hi - lo) + " \u00d7 " + f(c) + " = " + f(ans) + "."
        ],
        tip: "Tanda kurung selalu diprioritaskan.",
        solver: function () {
          return (hi - lo) * c;
        }
      };
    });

    // Variasi 3: a x k + b
    variants.push(function () {
      var ans = a * k + b;
      return {
        text: "Hitunglah hasil dari: " + f(a) + " \u00d7 " + f(k) + " + " + f(b),
        ans: ans,
        distractors: [a * k - b, a * (k + 1) + b, (a + k) * b, ans + a],
        steps: [
          "Dahulukan perkalian.",
          "Hitung " + f(a) + " \u00d7 " + f(k) + " = " + f(a * k) + ".",
          "Kemudian " + f(a * k) + " + " + f(b) + " = " + f(ans) + "."
        ],
        tip: "Kerjakan operasi perkalian lebih dulu.",
        solver: function () {
          return a * k + b;
        }
      };
    });

    // Variasi 4: kuadrat / pangkat
    variants.push(function () {
      var base = randInt(rng, 3, d === 1 ? 12 : 20);
      var sq = base * base;
      if (d >= 3) {
        // pangkat tiga
        var base3 = randInt(rng, 3, 9);
        var cb = base3 * base3 * base3;
        return {
          text: "Tentukan nilai dari: " + f(base3) + "\u00b3 (dibaca: " + f(base3) + " pangkat tiga)",
          ans: cb,
          distractors: [base3 * base3, cb + base3 * base3, cb - base3 * base3, base3 * 3 * base3],
          steps: [
            "Pangkat tiga berarti dikalikan dirinya sendiri tiga kali.",
            f(base3) + "\u00b3 = " + f(base3) + " \u00d7 " + f(base3) + " \u00d7 " + f(base3) + ".",
            "Hitung bertahap: " + f(base3 * base3) + " \u00d7 " + f(base3) + " = " + f(cb) + "."
          ],
          tip: "Hafalkan kubus 1\u201310.",
          solver: function () {
            return base3 * base3 * base3;
          }
        };
      }
      return {
        text: "Tentukan nilai dari: " + f(base) + "\u00b2",
        ans: sq,
        distractors: [base * 2, sq + base, sq - base, (base + 1) * (base + 1)],
        steps: [
          "Pangkat dua berarti dikalikan dirinya sendiri.",
          f(base) + "\u00b2 = " + f(base) + " \u00d7 " + f(base) + ".",
          "Hasilnya = " + f(sq) + "."
        ],
        tip: "Hafalkan kuadrat 1\u201320.",
        solver: function () {
          return base * base;
        }
      };
    });

    // Variasi 5: akar
    variants.push(function () {
      var base = randInt(rng, 3, d === 1 ? 12 : 25);
      var sq = base * base;
      var ans = base;
      return {
        text: "Tentukan nilai dari: \u221a" + f(sq),
        ans: ans,
        distractors: [ans + 1, ans - 1, ans + 2, sq / 2],
        steps: [
          "Cari bilangan yang jika dikuadratkan menghasilkan " + f(sq) + ".",
          f(base) + " \u00d7 " + f(base) + " = " + f(sq) + ".",
          "Jadi \u221a" + f(sq) + " = " + f(base) + "."
        ],
        tip: "Kenali kuadrat sempurna agar akar cepat ditemukan.",
        solver: function () {
          return Math.sqrt(sq);
        }
      };
    });

    // Variasi 6: campuran bagi
    variants.push(function () {
      var ans = randInt(rng, 2, d === 1 ? 12 : 40);
      var mult = randInt(rng, 2, 9);
      var b2 = randInt(rng, 2, 20);
      var div = ans * mult + b2; // div / mult ~ ans
      var total = div + mult;
      return {
        text: "Hitunglah hasil dari: (" + f(div) + " + " + f(mult) + ") \u00f7 " + f(mult),
        ans: Math.round(((div + mult) / mult) * 1000) / 1000,
        distractors: [div / mult, Math.round(div / mult) + 1, Math.round(div / mult) - 1, div - mult],
        steps: [
          "Jumlahkan dalam kurung: " + f(div) + " + " + f(mult) + " = " + f(total) + ".",
          "Bagi hasilnya: " + f(total) + " \u00f7 " + f(mult) + ".",
          "Hasil = " + f(Math.round(((div + mult) / mult) * 1000) / 1000) + "."
        ],
        tip: "Selesaikan kurung dahulu, lalu pembagian.",
        solver: function () {
          return (div + mult) / mult;
        }
      };
    });

    var chosen = pick(rng, variants)();
    var ans = round2(chosen.ans);

    return TIU.question.buildQuestion(
      {
        topic: "aritmetika_dasar",
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
  TIU.generators.aritmetika_dasar = { generate: build, topic: "aritmetika_dasar" };
})();
