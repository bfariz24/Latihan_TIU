global.window = global;
const fs = require("fs");
const path = require("path");
const base = path.join(__dirname, "..", "src");

["core/rng.js", "core/question.js", "generators/distractors.js", "generators/validators.js",
 "generators/deret_angka.js", "generators/aritmetika_dasar.js", "generators/persen.js",
 "generators/pecahan_desimal.js", "generators/perbandingan.js", "generators/kecepatan_jarak_waktu.js",
 "generators/usaha_pekerjaan.js", "generators/usia.js",
 "generators/index.js", "core/adapter.js"].forEach(function (p) {
  eval(fs.readFileSync(path.join(base, p), "utf8"));
});

const TIU = window.TIU;
let fail = 0;

// 1) Validasi data/soal.json
const soalPath = path.join(__dirname, "..", "data", "soal.json");
const bank = JSON.parse(fs.readFileSync(soalPath, "utf8"));
const fileErrs = TIU.adapter.validateJsonFile(bank);
console.log("soal.json :", fileErrs.length === 0 ? "VALID (" + bank.soal.length + " soal)" : fileErrs);
if (fileErrs.length) fail++;

// 2) soal.js harus sinkron dengan soal.json
const jsText = fs.readFileSync(path.join(__dirname, "..", "data", "soal.js"), "utf8");
const jsData = JSON.parse(jsText.replace(/^window\.TIU_SOAL_DATA\s*=\s*/, "").replace(/;\s*$/, ""));
const syncOk = JSON.stringify(jsData) === JSON.stringify(bank);
console.log("soal.js sinkron dengan soal.json:", syncOk ? "YA" : "TIDAK");
if (!syncOk) fail++;

// 3) Adapter: generator -> soal.json -> item -> harus tetap valid
const topics = TIU.api.listTopics();
let adapterFail = 0;
let adapterRun = 0;
for (const topic of topics) {
  for (const level of [1, 2, 3]) {
    for (let i = 0; i < 300; i++) {
      adapterRun++;
      const q = TIU.api.generate(topic, level);
      const asJson = TIU.adapter.questionToJson(q, i);
      const errs = TIU.adapter.validateJsonItem(asJson);
      if (errs.length) { adapterFail++; if (adapterFail <= 3) console.log("  ADAPTER ERR", topic, level, errs); }
      const back = TIU.adapter.jsonToItem(asJson);
      if (back.jawaban !== q.correct || back.pilihan[back.jawaban] !== q.options[q.correct]) adapterFail++;
    }
  }
}
console.log("adapter generator<->json:", adapterFail === 0 ? "OK (" + adapterRun + " soal)" : adapterFail + " gagal");
if (adapterFail) fail++;

process.exit(fail === 0 ? 0 : 1);
