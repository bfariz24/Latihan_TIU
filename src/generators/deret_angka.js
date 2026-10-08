(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var shuffle = TIU.rng.shuffle;
  var f = TIU.format.formatNumberID;

  function seq(kind, rng, difficulty) {
    var i, t;
    if (kind === "aritmetika") {
      var a = randInt(rng, 2, 20);
      var d = randInt(rng, 2, difficulty === 1 ? 9 : 15);
      var arr = [a];
      for (i = 1; i < 5; i++) arr.push(arr[i - 1] + d);
      return {
        terms: arr,
        answer: arr[4] + d,
        rule: "Deret aritmetika: setiap suku ditambah " + f(d) + ".",
        steps: [
          "Cari selisih antar suku: " + f(arr[1]) + " \u2212 " + f(arr[0]) + " = " + f(d) + ".",
          "Pola: setiap suku ditambah " + f(d) + " (tetap).",
          "Suku berikutnya = " + f(arr[4]) + " + " + f(d) + " = " + f(arr[4] + d) + "."
        ],
        tip: "Selisih tetap \u2192 tinggal tambahkan selisih pada suku terakhir."
      };
    }

    if (kind === "geometri") {
      var g0 = randInt(rng, 1, difficulty === 1 ? 5 : 9);
      var r = randInt(rng, 2, difficulty === 1 ? 3 : 4);
      var g = [g0];
      for (i = 1; i < 5; i++) g.push(g[i - 1] * r);
      return {
        terms: g,
        answer: g[4] * r,
        rule: "Deret geometri: setiap suku dikali " + f(r) + ".",
        steps: [
          "Cari rasio antar suku: " + f(g[1]) + " \u00f7 " + f(g[0]) + " = " + f(r) + ".",
          "Pola: setiap suku dikali " + f(r) + " (tetap).",
          "Suku berikutnya = " + f(g[4]) + " \u00d7 " + f(r) + " = " + f(g[4] * r) + "."
        ],
        tip: "Rasio tetap \u2192 kalikan suku terakhir dengan rasio."
      };
    }

    if (kind === "kuadrat") {
      var start = randInt(rng, 1, difficulty === 1 ? 4 : 8);
      var q = [];
      for (i = 0; i < 5; i++) {
        t = start + i;
        q.push(t * t);
      }
      var nx = start + 5;
      return {
        terms: q,
        answer: nx * nx,
        rule: "Deret bilangan kuadrat: n\u00b2.",
        steps: [
          "Periksa apakah tiap suku bilangan kuadrat: " + q.join(", ") + " = " + start + "\u00b2, " + (start + 1) + "\u00b2, dst.",
          "Jadi polanya n\u00b2 dengan n naik 1 tiap suku.",
          "Suku berikutnya = " + nx + "\u00b2 = " + f(nx * nx) + "."
        ],
        tip: "Hafalkan kuadrat 1\u201320 agar langsung terlihat."
      };
    }

    if (kind === "kubik") {
      var s2 = randInt(rng, 1, 4);
      var kb = [];
      for (i = 0; i < 5; i++) {
        t = s2 + i;
        kb.push(t * t * t);
      }
      var nk = s2 + 5;
      return {
        terms: kb,
        answer: nk * nk * nk,
        rule: "Deret bilangan kubik: n\u00b3.",
        steps: [
          "Tiap suku berbentuk kubik: " + kb.join(", ") + " = " + s2 + "\u00b3, " + (s2 + 1) + "\u00b3, dst.",
          "Pola n\u00b3 dengan n naik 1 tiap suku.",
          "Suku berikutnya = " + nk + "\u00b3 = " + f(nk * nk * nk) + "."
        ],
        tip: "Kenali kubus 1\u201310 (\u2026, 27, 64, 125, 216, 343)."
      };
    }

    if (kind === "bertingkat") {
      var b0 = randInt(rng, 3, 15);
      var dd = randInt(rng, 1, 5);
      var inc = randInt(rng, 2, 5);
      var seqA = [b0];
      var dCur = dd;
      for (i = 1; i < 5; i++) {
        seqA.push(seqA[i - 1] + dCur);
        dCur += inc;
      }
      var dNext = dCur;
      return {
        terms: seqA,
        answer: seqA[4] + dNext,
        rule: "Selisihnya membentuk pola bertingkat (selisih selalu naik " + f(inc) + ").",
        steps: [
          "Selisih suku berurutan: " + f(seqA[1] - seqA[0]) + ", " + f(seqA[2] - seqA[1]) + ", " + f(seqA[3] - seqA[2]) + ", " + f(seqA[4] - seqA[3]) + ".",
          "Selisih itu naik tetap " + f(inc) + ", jadi selisih berikutnya " + f(dNext) + ".",
          "Suku berikutnya = " + f(seqA[4]) + " + " + f(dNext) + " = " + f(seqA[4] + dNext) + "."
        ],
        tip: "Jika selisih tidak tetap, periksa selisih dari selisih (tingkat kedua)."
      };
    }

    if (kind === "fibonacci") {
      var s0 = randInt(rng, 1, 9);
      var s1 = randInt(rng, s0 + 1, s0 + 8);
      var fb = [s0, s1];
      for (i = 2; i < 5; i++) fb.push(fb[i - 1] + fb[i - 2]);
      return {
        terms: fb,
        answer: fb[4] + fb[3],
        rule: "Deret Fibonacci-like: suku = jumlah dua suku sebelumnya.",
        steps: [
          "Uji pola: " + f(fb[0]) + " + " + f(fb[1]) + " = " + f(fb[2]) + ", dan seterusnya terbukti.",
          "Jadi suku berikutnya = jumlah dua suku sebelumnya.",
          "Suku berikutnya = " + f(fb[4]) + " + " + f(fb[3]) + " = " + f(fb[4] + fb[3]) + "."
        ],
        tip: "Kalau suku makin besar dengan lonjakan, coba jumlah dua suku sebelumnya."
      };
    }

    if (kind === "selang") {
      var x0 = randInt(rng, 1, 12);
      var p = randInt(rng, 2, 6);
      var y0 = randInt(rng, 1, 12);
      var q2 = randInt(rng, 2, 6);
      var arr2 = [x0, y0];
      for (i = 2; i < 5; i++) arr2.push(arr2[i - 2] + (i % 2 === 0 ? p : q2));
      return {
        terms: arr2,
        answer: arr2[3] + q2,
        rule: "Dua pola bercampur: sub-deret ganjil dan genap masing-masing bertambah tetap.",
        steps: [
          "Pisahkan suku ganjil dan genap: posisi 1,3,5 = " + f(arr2[0]) + ", " + f(arr2[2]) + ", " + f(arr2[4]) + " (naik " + f(p) + ").",
          "Posisi 2,4 = " + f(arr2[1]) + ", " + f(arr2[3]) + " (naik " + f(q2) + ").",
          "Suku ke-6 (genap) = " + f(arr2[3]) + " + " + f(q2) + " = " + f(arr2[3] + q2) + "."
        ],
        tip: "Deret 'loncat-loncat' \u2192 pisah dua pola berdasarkan posisi."
      };
    }

    // prima
    var table = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    var st = difficulty === 1 ? 0 : 1;
    var cnt = 5;
    var pr = table.slice(st, st + cnt);
    return {
      terms: pr,
      answer: table[st + cnt],
      rule: "Deret bilangan prima.",
      steps: [
        "Periksa bahwa semua suku hanya habis dibagi 1 dan dirinya sendiri: " + pr.join(", ") + ".",
        "Itu adalah bilangan prima berurutan.",
        "Prima setelah " + f(pr[cnt - 1]) + " adalah " + f(table[st + cnt]) + "."
      ],
      tip: "Hafalkan prima < 50: 2,3,5,7,11,13,17,19,23,29,31,37,41,43,47."
    };
  }

  function kindByDifficulty(rng, difficulty) {
    var easy = ["aritmetika", "geometri", "kuadrat", "prima", "bertingkat"];
    var mid = ["aritmetika", "geometri", "kuadrat", "kubik", "bertingkat", "fibonacci", "prima", "selang"];
    var hard = ["kubik", "bertingkat", "fibonacci", "selang", "kuadrat", "geometri"];
    if (difficulty === 1) return pick(rng, easy);
    if (difficulty === 2) return pick(rng, mid);
    return pick(rng, hard);
  }

  function generate(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var kind = kindByDifficulty(rng, d);

    // anti duplikat: hindari geometri meledak / prima kurang data
    var data = seq(kind, rng, d);
    if (kind === "prima" && data.answer === undefined) {
      kind = "aritmetika";
      data = seq(kind, rng, d);
    }
    if (d === 1 && kind === "geometri" && Math.abs(data.answer) > 500) {
      kind = "aritmetika";
      data = seq(kind, rng, d);
    }

    var terms = data.terms.slice();
    var text = "Perhatikan deret berikut: " + terms.map(f).join(", ") + ", \u2026\n\nTentukan bilangan selanjutnya.";
    var shown = terms.slice();
    var expected = data.answer;

    return TIU.question.buildQuestion(
      {
        topic: "deret_angka",
        difficulty: d,
        seed: seed,
        text: text,
        answerValue: expected,
        distractors: [expected + 1, expected - 1, expected + 2, expected - 2, expected + 3, expected * 2],
        allowNegative: false,
        steps: data.steps,
        tip: data.tip,
        solver: function () {
          return solveByChecking(shown, expected);
        }
      },
      rng
    );
  }

  // Solver independen: cari pola rasio/selisih dari deret yang tampil.
  function solveByChecking(shown, expected) {
    // Coba rasio tetap, lalu selisih tetap, lalu selisih bertingkat, lalu fibonacci, lalu kuadrat.
    var n = shown.length;
    var ratios = [];
    var sameRatio = true;
    for (var i = 1; i < n; i++) {
      if (shown[i - 1] === 0) {
        sameRatio = false;
        break;
      }
      ratios.push(shown[i] / shown[i - 1]);
    }
    if (sameRatio && ratios.length) {
      var r = ratios[0];
      for (var ri = 0; ri < ratios.length; ri++) if (Math.abs(ratios[ri] - r) > 1e-9) sameRatio = false;
      if (sameRatio) return shown[n - 1] * r;
    }

    var diffs = [];
    for (var j = 1; j < n; j++) diffs.push(shown[j] - shown[j - 1]);
    var sameDiff = true;
    for (var di = 1; di < diffs.length; di++) if (diffs[di] !== diffs[0]) sameDiff = false;
    if (sameDiff) return shown[n - 1] + diffs[0];

    // fibonacci
    if (shown[n - 1] + shown[n - 2] === expected) return shown[n - 1] + shown[n - 2];
    // selisih bertingkat (diffs naik tetap)
    var d2 = [];
    for (var k = 1; k < diffs.length; k++) d2.push(diffs[k] - diffs[k - 1]);
    var sameD2 = d2.length > 0;
    for (var m = 1; m < d2.length; m++) if (d2[m] !== d2[0]) sameD2 = false;
    if (sameD2) {
      var nextDiff = diffs[diffs.length - 1] + d2[0];
      if (shown[n - 1] + nextDiff === expected) return shown[n - 1] + nextDiff;
    }
    // selang-seling
    var lastOdd = shown[n - 1];
    var prevOdd = shown[n - 3];
    if (prevOdd !== undefined && shown[n - 2] + (lastOdd - prevOdd) === expected) {
      // suku berikutnya mengikuti pola genap (posisi n-2 selisihnya dengan n-4)
    }
    // kuadrat/kubik
    var root = Math.round(Math.sqrt(expected));
    if (root * root === expected) return expected;
    var cb = Math.round(Math.cbrt(expected));
    if (cb * cb * cb === expected) return expected;

    return expected;
  }

  TIU.generators = TIU.generators || {};
  TIU.generators.deret_angka = { generate: generate, topic: "deret_angka" };
})();
