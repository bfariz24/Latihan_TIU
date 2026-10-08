(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  function round2(x) {
    return Math.round(x * 10000) / 10000;
  }

  function rupiah(x) {
    return "Rp " + f(x);
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var variants = [];

    // V1: perbandingan senilai
    variants.push(function () {
      var a = randInt(rng, 2, 6);
      var b = a * randInt(rng, 2, 5);
      var unit = randInt(rng, 2, 9);
      var kiri = a * unit;
      var ans = b * unit;
      return {
        text:
          "Jika " + a + " buku harganya " + rupiah(kiri) + ", berapa harga " + b + " buku yang sama?",
        ans: ans,
        distractors: [kiri + b, kiri * a, ans + unit, ans - unit, Math.round((kiri / b) * a)],
        steps: [
          "Harga 1 buku = " + rupiah(kiri) + " \u00f7 " + a + " = " + rupiah(unit) + ".",
          "Harga " + b + " buku = " + b + " \u00d7 " + rupiah(unit) + ".",
          "Hasil = " + rupiah(ans) + "."
        ],
        tip: "Perbandingan senilai: cari nilai satu satuan dulu.",
        solver: function () {
          return (kiri / a) * b;
        }
      };
    });

    // V2: berbalik nilai (pekerja-hari)
    variants.push(function () {
      var pekerja = randInt(rng, 4, 12);
      var hari = randInt(rng, 6, 20);
      var total = pekerja * hari;
      // pilih hariBaru sebagai pembagi total yang berbeda dari hari
      var divisors = [];
      for (var h = 3; h <= total; h++) {
        if (total % h === 0 && h !== hari && total / h >= 2 && total / h <= 60) divisors.push(h);
      }
      var hariBaru = divisors.length ? pick(rng, divisors) : hari * 2;
      var ans = total / hariBaru;
      return {
        text:
          "Suatu proyek dapat diselesaikan oleh " + pekerja + " pekerja dalam " + hari + " hari.\n" +
          "Jika proyek ingin diselesaikan dalam " + hariBaru + " hari, berapa pekerja yang dibutuhkan?",
        ans: ans,
        distractors: [pekerja + hariBaru, pekerja * hariBaru, pekerja - 1, ans + 1, ans - 1, hariBaru],
        steps: [
          "Total pekerjaan = " + pekerja + " \u00d7 " + hari + " = " + total + " orang-hari.",
          "Karena berbalik nilai: pekerja baru = total \u00f7 hari baru.",
          "Pekerja = " + total + " \u00f7 " + hariBaru + " = " + f(ans) + " orang."
        ],
        tip: "Berbalik nilai: hasil kali tetap (pekerja \u00d7 hari).",
        solver: function () {
          return (pekerja * hari) / hariBaru;
        }
      };
    });

    // V3: skala peta
    variants.push(function () {
      var skala = pick(rng, [100000, 200000, 250000, 500000, 1000000]);
      var cm = randInt(rng, 2, 15);
      var km = (skala * cm) / 100000;
      return {
        text:
          "Pada sebuah peta dengan skala 1 : " + f(skala) + ", jarak dua kota tergambar " + cm + " cm.\n" +
          "Berapa jarak sebenarnya kedua kota tersebut?",
        ans: km,
        unit: "km",
        distractors: [km * 10, km / 10, (skala * cm) / 1000, cm * skala, km + 10, km - 10],
        steps: [
          "Jarak sebenarnya = jarak pada peta \u00d7 skala.",
          "= " + cm + " \u00d7 " + f(skala) + " cm = " + f(skala * cm) + " cm.",
          "Ubah ke km (bagi 100.000) = " + f(km) + " km."
        ],
        tip: "cm ke km: bagi 100.000.",
        solver: function () {
          return (skala * cm) / 100000;
        }
      };
    });

    // V4: pembagian proporsional
    variants.push(function () {
      var r1 = randInt(rng, 1, 5);
      var r2 = randInt(rng, 1, 5);
      var r3 = randInt(rng, 1, 5);
      var satuan = randInt(rng, 2, 12) * 100000;
      var total = (r1 + r2 + r3) * satuan;
      var bagian = r1 * satuan;
      return {
        text:
          "Sejumlah uang " + rupiah(total) + " dibagikan kepada tiga orang dengan perbandingan " + r1 + " : " + r2 + " : " + r3 + ".\n" +
          "Berapa bagian orang pertama?",
        ans: bagian,
        distractors: [r2 * satuan, r3 * satuan, total / 3, bagian + satuan, total - bagian, Math.round(total / (r1 + r2 + r3))],
        steps: [
          "Jumlah bagian perbandingan = " + r1 + " + " + r2 + " + " + r3 + " = " + (r1 + r2 + r3) + ".",
          "Nilai 1 bagian = " + rupiah(total) + " \u00f7 " + (r1 + r2 + r3) + " = " + rupiah(satuan) + ".",
          "Bagian pertama = " + r1 + " \u00d7 " + rupiah(satuan) + " = " + rupiah(bagian) + "."
        ],
        tip: "Bagi total dengan jumlah angka perbandingan untuk mendapat 1 bagian.",
        solver: function () {
          return (total / (r1 + r2 + r3)) * r1;
        }
      };
    });

    // V5: perbandingan diketahui selisih (level 3)
    variants.push(function () {
      var r1 = randInt(rng, 2, 7);
      var r2 = r1 + randInt(rng, 1, 5);
      var satuan = randInt(rng, 2, 9) * 10000;
      var a = r1 * satuan;
      var b = r2 * satuan;
      var selisih = b - a;
      return {
        text:
          "Perbandingan uang dua orang adalah " + r1 + " : " + r2 + ".\n" +
          "Jika selisih uang mereka " + rupiah(selisih) + ", berapa jumlah uang keduanya?",
        ans: a + b,
        distractors: [b, a, selisih, (a + b) + selisih, r1 + r2],
        steps: [
          "Selisih perbandingan = " + r2 + " \u2212 " + r1 + " = " + (r2 - r1) + " bagian.",
          "Nilai 1 bagian = " + rupiah(selisih) + " \u00f7 " + (r2 - r1) + " = " + rupiah(satuan) + ".",
          "Jumlah perbandingan = " + r1 + " + " + r2 + " = " + (r1 + r2) + " bagian.",
          "Jumlah uang = " + (r1 + r2) + " \u00d7 " + rupiah(satuan) + " = " + rupiah(a + b) + "."
        ],
        tip: "Cari 1 bagian dari selisih, baru hitung total.",
        solver: function () {
          return selisih / (r2 - r1) * (r1 + r2);
        }
      };
    });

    var pool =
      d === 1
        ? [variants[0], variants[2]]
        : d === 2
        ? [variants[0], variants[1], variants[2], variants[3]]
        : [variants[1], variants[3], variants[4]];
    var chosen = pick(rng, pool)();
    var ans = round2(chosen.ans);

    return TIU.question.buildQuestion(
      {
        topic: "perbandingan",
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
  TIU.generators.perbandingan = { generate: build, topic: "perbandingan" };
})();
