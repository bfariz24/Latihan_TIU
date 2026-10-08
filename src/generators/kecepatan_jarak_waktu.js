(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  var KOTA = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan", "Makassar", "Denpasar", "Malang", "Bogor"];

  function kotaPair(rng) {
    var a = randInt(rng, 0, KOTA.length - 1);
    var b = randInt(rng, 0, KOTA.length - 1);
    while (b === a) b = randInt(rng, 0, KOTA.length - 1);
    return [KOTA[a], KOTA[b]];
  }

  function round2(x) {
    return Math.round(x * 100) / 100;
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var variants = [];

    // V1: jarak = kecepatan x waktu
    variants.push(function () {
      var kec = randInt(rng, 3, 12) * 5; // 15..60
      var jam = pick(rng, [1, 1.5, 2, 2.5, 3, 4]);
      var k = kotaPair(rng);
      var ans = round2(kec * jam);
      return {
        text:
          "Sebuah mobil berangkat dari " + k[0] + " menuju " + k[1] + " dengan kecepatan " + kec + " km/jam.\n" +
          "Perjalanan memakan waktu " + f(jam) + " jam.\n" +
          "Berapa jarak yang ditempuh mobil tersebut?",
        ans: ans,
        unit: "km",
        distractors: [kec + jam, kec / jam, round2(kec * (jam + 1)), round2(kec * (jam - 0.5)), kec * 2 * jam],
        steps: [
          "Ingat rumus: jarak = kecepatan \u00d7 waktu.",
          "Jarak = " + kec + " \u00d7 " + f(jam) + ".",
          "Jarak = " + f(ans) + " km."
        ],
        tip: "Segitiga JKW: J di atas, K dan W di bawah.",
        solver: function () {
          return kec * jam;
        }
      };
    });

    // V2: waktu = jarak / kecepatan
    variants.push(function () {
      var kec = randInt(rng, 3, 12) * 10; // 30..120
      var jam = pick(rng, [1, 2, 3, 4, 5]);
      var jarak = kec * jam;
      var k = kotaPair(rng);
      var ans = jam;
      return {
        text:
          "Jarak antara " + k[0] + " dan " + k[1] + " adalah " + jarak + " km.\n" +
          "Sebuah bus menempuh jarak itu dengan kecepatan rata-rata " + kec + " km/jam.\n" +
          "Berapa lama waktu tempuhnya?",
        ans: ans,
        unit: "jam",
        distractors: [jarak / 2, kec / jarak, ans + 1, ans - 1, jarak - kec],
        steps: [
          "Ingat rumus: waktu = jarak \u00f7 kecepatan.",
          "Waktu = " + jarak + " \u00f7 " + kec + ".",
          "Waktu = " + f(ans) + " jam."
        ],
        tip: "Waktu = jarak \u00f7 kecepatan.",
        solver: function () {
          return jarak / kec;
        }
      };
    });

    // V3: kecepatan rata-rata dua segmen
    variants.push(function () {
      var v1 = randInt(rng, 2, 6) * 10;
      var v2 = randInt(rng, 4, 9) * 10;
      while (v2 === v1) v2 = randInt(rng, 4, 9) * 10;
      var t1 = pick(rng, [1, 2, 3]);
      var t2 = pick(rng, [1, 2, 3]);
      var s1 = v1 * t1;
      var s2 = v2 * t2;
      var ans = round2((s1 + s2) / (t1 + t2));
      return {
        text:
          "Sebuah kendaraan menempuh perjalanan dua tahap.\nTahap pertama: " + v1 + " km/jam selama " + t1 + " jam.\n" +
          "Tahap kedua: " + v2 + " km/jam selama " + t2 + " jam.\n" +
          "Berapa kecepatan rata-rata seluruh perjalanan?",
        ans: ans,
        unit: "km/jam",
        distractors: [(v1 + v2) / 2, v1 + v2, round2(s1 + s2), round2((s1 + s2) / 2), ans + 5, ans - 5],
        steps: [
          "Jarak tahap 1 = " + v1 + " \u00d7 " + t1 + " = " + s1 + " km.",
          "Jarak tahap 2 = " + v2 + " \u00d7 " + t2 + " = " + s2 + " km.",
          "Total jarak = " + (s1 + s2) + " km, total waktu = " + (t1 + t2) + " jam.",
          "Kecepatan rata-rata = " + (s1 + s2) + " \u00f7 " + (t1 + t2) + " = " + f(ans) + " km/jam."
        ],
        tip: "Rata-rata kecepatan = total jarak \u00f7 total waktu (bukan rata-rata angkanya).",
        solver: function () {
          return (v1 * t1 + v2 * t2) / (t1 + t2);
        }
      };
    });

    // V4: dua kendaraan berlawanan arah, waktu bertemu
    variants.push(function () {
      var v1 = randInt(rng, 4, 8) * 10;
      var v2 = randInt(rng, 4, 8) * 10;
      while (v2 === v1) v2 = randInt(rng, 4, 8) * 10;
      var jam = pick(rng, [1, 2, 3]);
      var jarak = (v1 + v2) * jam;
      var k = kotaPair(rng);
      var ans = jam;
      return {
        text:
          "Kota " + k[0] + " dan " + k[1] + " berjarak " + jarak + " km.\n" +
          "Kendaraan A berangkat dari " + k[0] + " dengan kecepatan " + v1 + " km/jam, bersamaan kendaraan B berangkat dari " + k[1] + " dengan kecepatan " + v2 + " km/jam saling mendekat.\n" +
          "Setelah berapa jam keduanya bertemu?",
        ans: ans,
        unit: "jam",
        distractors: [round2(jarak / v1), round2(jarak / v2), round2(jarak / (v1 * 2)), ans + 1, ans - 1],
        steps: [
          "Karena saling mendekat, kecepatan digabung: " + v1 + " + " + v2 + " = " + (v1 + v2) + " km/jam.",
          "Waktu bertemu = jarak \u00f7 kecepatan gabungan.",
          "Waktu = " + jarak + " \u00f7 " + (v1 + v2) + " = " + f(ans) + " jam."
        ],
        tip: "Berlawanan arah \u2192 kecepatan dijumlahkan.",
        solver: function () {
          return jarak / (v1 + v2);
        }
      };
    });

    // V5: menyusul (searah, kecepatan beda) (level 3)
    variants.push(function () {
      var lambat = randInt(rng, 3, 6) * 10;
      var selisih = randInt(rng, 1, 4) * 10;
      var cepat = lambat + selisih;
      // pilih selisih & lambat yang membagi 2*lambat agar waktu bulat
      var jam = 2;
      var ans = (jam * lambat) / selisih;
      if (!Number.isInteger(ans)) {
        lambat = 40; selisih = 20; cepat = 60; ans = 4;
      }
      var jarakAwal = jam * lambat;
      return {
        text:
          "Sebuah mobil berangkat dari kota P dengan kecepatan " + lambat + " km/jam.\n" +
          "Dua jam kemudian, dari kota yang sama sebuah motor menyusul dengan kecepatan " + cepat + " km/jam.\n" +
          "Berapa lama motor mengejar sampai berhasil menyusul mobil?",
        ans: ans,
        unit: "jam",
        distractors: [round2(jarakAwal / cepat), selisih / 10, ans + 1, ans - 1, round2(jarakAwal / lambat)],
        steps: [
          "Selama 2 jam mobil sudah menempuh jarak awal 2 \u00d7 " + lambat + " = " + jarakAwal + " km.",
          "Kecepatan penyusul relatif = " + cepat + " \u2212 " + lambat + " = " + selisih + " km/jam.",
          "Waktu menyusul = jarak awal \u00f7 kecepatan relatif = " + jarakAwal + " \u00f7 " + selisih + " = " + f(ans) + " jam."
        ],
        tip: "Searah \u2192 gunakan selisih kecepatan.",
        solver: function () {
          return (2 * lambat) / (cepat - lambat);
        }
      };
    });

    var pool =
      d === 1
        ? [variants[0], variants[1]]
        : d === 2
        ? [variants[0], variants[1], variants[2], variants[3]]
        : [variants[2], variants[3], variants[4]];
    var chosen = pick(rng, pool)();
    var ans = round2(chosen.ans);

    return TIU.question.buildQuestion(
      {
        topic: "kecepatan_jarak_waktu",
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
  TIU.generators.kecepatan_jarak_waktu = { generate: build, topic: "kecepatan_jarak_waktu" };
})();
