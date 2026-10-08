// Node harness: memuat file browser yang sama untuk verifikasi otomatis.
global.window = global;
const fs = require("fs");
const path = require("path");
const base = path.join(__dirname, "..", "src");

[ "core/rng.js", "core/question.js", "generators/distractors.js", "generators/validators.js",
  "generators/deret_angka.js", "generators/aritmetika_dasar.js", "generators/persen.js",
  "generators/pecahan_desimal.js", "generators/perbandingan.js", "generators/kecepatan_jarak_waktu.js",
  "generators/usaha_pekerjaan.js", "generators/usia.js",
  "generators/index.js" ].forEach(function (p) {
  eval(fs.readFileSync(path.join(base, p), "utf8"));
});
require(path.join(__dirname, "runner.js"));

const N = 1000;
const topics = window.TIU.api.listTopics();
let totalFail = 0, totalRun = 0;
for (const topic of topics) {
  for (const level of [1, 2, 3]) {
    let fail = 0;
    for (let i = 0; i < N; i++) {
      const seed = (Date.now() % 100000) + i * 7919 + level * 131 + topic.length * 17;
      try {
        const q = window.TIU.api.generate(topic, level, seed);
        const errs = window.TIU.validators.validateQuestion(q);
        if (errs.length) { fail++; if (fail <= 2) console.log("  ERR", topic, level, seed, errs); }
      } catch (e) { fail++; if (fail <= 2) console.log("  THROW", topic, level, seed, e.message); }
    }
    totalFail += fail; totalRun += N;
    console.log(`${fail === 0 ? "PASS" : "FAIL"}  ${topic} lvl${level} : ${N - fail}/${N}`);
  }
}
console.log("\nTOTAL:", totalRun, "diuji,", totalFail, "gagal");
process.exit(totalFail === 0 ? 0 : 1);
