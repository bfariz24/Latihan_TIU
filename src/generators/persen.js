(function () {
  "use strict";

  var TIU = window.TIU;
  var randInt = TIU.rng.randInt;
  var pick = TIU.rng.pick;
  var f = TIU.format.formatNumberID;

  function rupiah(x) {
    return "Rp " + f(x);
  }

  function build(difficulty, seed) {
    var rng = TIU.rng.makeRng(seed);
    var d = difficulty || 2;
    var variants = [];

    // V1: persentase dari nilai (level 1 & 2)
    variants.push(function () {
      var base = randInt(rng, d === 1 ? 2 : 4, 40) * 25 * (d === 1 ? 10 : 100);
      var pct = pick(rng, [5, 10, 15, 20, 25, 40, 50, 60, 75, 80]);
      var ans = (base * pct) / 100;
      return {
        text: "Berapa " + pct + "% dari " + rupiah(base) + "?",
        ans: ans,
        unit: "rupiah",
        distractors: [(base * pct) / 100 + base / 10, (base * (pct + 5)) / 100, base - ans, base / pct],
        steps: [
          "Ubah persen ke pecahan: " + pct + "% = " + pct + "/100.",
          "Hitung " + f(base) + " \u00d7 " + pct + "/100 = " + f(ans) + ".",
          "Jadi " + pct + "% dari " + rupiah(base) + " adalah " + rupiah(ans) + "."
        ],
        tip: "10% mudah: geser koma satu digit; 5% = setengah dari 10%.",
        solver: function () {
          return (base * pct) / 100;
        }
      };
    });

    // V2: diskon tunggal + kembalian
    variants.push(function () {
      var harga = randInt(rng, d === 1 ? 4 : 10, 60) * 25000;
      var diskon = pick(rng, [10, 20, 25, 30, 40, 50]);
      var bayar = Math.ceil((harga * (1 - diskon / 100)) / 50000) * 50000 + 50000;
      var potongan = (harga * diskon) / 100;
      var hargaBayar = harga - potongan;
      var kembali = bayar - hargaBayar;
      return {
        text:
          "Sebuah toko memberi diskon " +
          diskon +
          "% untuk barang seharga " +
          rupiah(harga) +
          ".\nJika pembeli membayar dengan uang " +
          rupiah(bayar) +
          ", berapa uang kembalian yang diterima?",
        ans: kembali,
        unit: "rupiah",
        distractors: [bayar - harga, potongan, hargaBayar, bayar - potongan],
        steps: [
          "Hitung besar diskon: " + diskon + "% \u00d7 " + rupiah(harga) + " = " + rupiah(potongan) + ".",
          "Harga setelah diskon = " + rupiah(harga) + " \u2212 " + rupiah(potongan) + " = " + rupiah(hargaBayar) + ".",
          "Kembalian = uang dibayar \u2212 harga bayar = " + rupiah(bayar) + " \u2212 " + rupiah(hargaBayar) + " = " + rupiah(kembali) + "."
        ],
        tip: "Hitung harga akhir dulu, baru kurangkan dengan uang yang dibayarkan.",
        solver: function () {
          return bayar - harga + potongan;
        }
      };
    });

    // V3: kenaikan/penurunan nilai
    variants.push(function () {
      var nilai = randInt(rng, 5, 40) * 5000;
      var pct = pick(rng, [10, 15, 20, 25, 30, 50]);
      var naik = rng() < 0.5;
      var delta = (nilai * pct) / 100;
      var ans = naik ? nilai + delta : nilai - delta;
      return {
        text:
          "Harga sebuah barang " +
          (naik ? "naik" : "turun") +
          " " +
          pct +
          "% dari harga semula " +
          rupiah(nilai) +
          ".\nBerapa harga barang sekarang?",
        ans: ans,
        unit: "rupiah",
        distractors: [nilai - delta, nilai + delta, nilai, (nilai * (100 + pct)) / 100 + delta],
        steps: [
          "Besar perubahan = " + pct + "% \u00d7 " + rupiah(nilai) + " = " + rupiah(delta) + ".",
          (naik ? "Karena naik, tambahkan: " : "Karena turun, kurangkan: ") + rupiah(nilai) + (naik ? " + " : " \u2212 ") + rupiah(delta) + ".",
          "Harga sekarang = " + rupiah(ans) + "."
        ],
        tip: "Naik berarti 100%+" + pct + "%; turun berarti 100%\u2212" + pct + "% dari harga awal.",
        solver: function () {
          return naik ? nilai + (nilai * pct) / 100 : nilai - (nilai * pct) / 100;
        }
      };
    });

    // V4: diskon bertingkat (level 3)
    variants.push(function () {
      var harga = randInt(rng, 8, 40) * 50000;
      var d1 = pick(rng, [10, 20, 25]);
      var d2 = pick(rng, [10, 20, 25]);
      var setelah1 = harga * (1 - d1 / 100);
      var ans = Math.round(setelah1 * (1 - d2 / 100));
      return {
        text:
          "Sebuah barang berharga " +
          rupiah(harga) +
          " mendapat diskon bertingkat: diskon pertama " +
          d1 +
          "%, lalu diskon tambahan " +
          d2 +
          "% dari harga setelah diskon pertama.\nBerapa harga akhir yang harus dibayar?",
        ans: ans,
        unit: "rupiah",
        distractors: [
          Math.round(harga * (1 - (d1 + d2) / 100)),
          Math.round(harga * (1 - d1 / 100)),
          Math.round(setelah1 - (harga * d2) / 100),
          Math.round(harga * (1 - d2 / 100))
        ],
        steps: [
          "Harga setelah diskon pertama = (" + (100 - d1) + "% \u00d7 " + rupiah(harga) + ") = " + rupiah(setelah1) + ".",
          "Diskon kedua dihitung dari " + rupiah(setelah1) + ", bukan dari harga awal.",
          "Harga akhir = " + (100 - d2) + "% \u00d7 " + rupiah(setelah1) + " = " + rupiah(ans) + "."
        ],
        tip: "Diskon bertingkat tidak sama dengan menjumlahkan persennya.",
        solver: function () {
          return harga * (1 - d1 / 100) * (1 - d2 / 100);
        }
      };
    });

    // V5: mencari persentase (level 2/3)
    variants.push(function () {
      var total = randInt(rng, 4, 40) * 50;
      var pct = pick(rng, [10, 20, 25, 40, 50, 60, 75, 80]);
      var bagian = (total * pct) / 100;
      return {
        text: bagian + " adalah berapa persen dari " + f(total) + "?",
        ans: pct,
        unit: "persen",
        distractors: [pct + 5, pct - 5, 100 - pct, Math.round((bagian / (total + 10)) * 100)],
        steps: [
          "Bandingkan: persentase = (bagian \u00f7 total) \u00d7 100%.",
          "Hitung " + f(bagian) + " \u00f7 " + f(total) + " = " + f(Math.round((bagian / total) * 1000) / 1000) + ".",
          "Kalikan 100% \u2192 " + pct + "%."
        ],
        tip: "Rumus: (bagian \u00f7 keseluruhan) \u00d7 100%.",
        solver: function () {
          return (bagian / total) * 100;
        }
      };
    });

    // V6: harga setelah PPN/pajak (level 2/3)
    variants.push(function () {
      var harga = randInt(rng, 4, 30) * 100000;
      var pajak = pick(rng, [5, 10, 11, 15]);
      var ans = (harga * (100 + pajak)) / 100;
      return {
        text:
          "Harga sebuah barang sebelum pajak adalah " +
          rupiah(harga) +
          ".\nJika dikenakan pajak " +
          pajak +
          "%, berapa harga yang harus dibayar?",
        ans: ans,
        unit: "rupiah",
        distractors: [(harga * pajak) / 100, harga - (harga * pajak) / 100, ans + harga / 10, (harga * (100 - pajak)) / 100],
        steps: [
          "Besar pajak = " + pajak + "% \u00d7 " + rupiah(harga) + " = " + rupiah((harga * pajak) / 100) + ".",
          "Harga bayar = harga + pajak = " + rupiah(harga) + " + " + rupiah((harga * pajak) / 100) + ".",
          "Harga bayar = " + rupiah(ans) + "."
        ],
        tip: "Harga berppajak = " + (100 + pajak) + "% dari harga awal.",
        solver: function () {
          return (harga * (100 + pajak)) / 100;
        }
      };
    });

    var pool = d === 1 ? [variants[0], variants[2]] : d === 2 ? [variants[0], variants[1], variants[2], variants[4], variants[5]] : [variants[1], variants[3], variants[4], variants[5], variants[2]];
    var chosen = pick(rng, pool)();
    var ans = Math.round(chosen.ans * 100) / 100;

    return TIU.question.buildQuestion(
      {
        topic: "persen",
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
  TIU.generators.persen = { generate: build, topic: "persen" };
})();
