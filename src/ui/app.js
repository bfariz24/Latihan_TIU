(function () {
  "use strict";

  var TIU = window.TIU;
  var KEYS = ["A", "B", "C", "D", "E"];
  var STORAGE_KEY = "tiu_riwayat_v1";

  var state = {
    items: [],
    index: 0,
    chosen: null,
    answered: false,
    benar: 0,
    salah: 0,
    meta: null,
    jsonBank: null
  };

  var $ = function (id) { return document.getElementById(id); };
  var views = { home: $("view-home"), quiz: $("view-quiz"), result: $("view-result") };

  function show(name) {
    Object.keys(views).forEach(function (k) {
      views[k].classList.toggle("hidden", k !== name);
    });
    window.scrollTo(0, 0);
  }

  function fillTopics() {
    var sel = $("f-topik");
    sel.innerHTML = "";
    var topics = TIU.api.listTopics();
    topics.forEach(function (t) {
      var meta = TIU.adapter.TOPIC_META[t] || { subkategori: t };
      var opt = document.createElement("option");
      opt.value = t;
      opt.textContent = meta.subkategori + " (" + t + ")";
      sel.appendChild(opt);
    });
  }

  function fillJsonTopics() {
    var sel = $("f-topik");
    sel.innerHTML = "";
    var bank = state.jsonBank && state.jsonBank.soal ? state.jsonBank.soal : [];
    var seen = {};
    bank.forEach(function (s) {
      var key = s.kategori + " / " + s.subkategori;
      if (seen[key]) return;
      seen[key] = true;
      var opt = document.createElement("option");
      opt.value = "json::" + s.kategori + "::" + s.subkategori;
      opt.textContent = key;
      sel.appendChild(opt);
    });
    if (!bank.length) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "(bank soal kosong)";
      sel.appendChild(opt);
    }
  }

  function loadJsonBank() {
    return new Promise(function (resolve) {
      fetch("data/soal.json")
        .then(function (r) { return r.json(); })
        .then(function (j) { resolve(j); })
        .catch(function () { resolve(window.TIU_SOAL_DATA || { soal: [] }); });
    });
  }

  function syncSource() {
    var src = $("f-sumber").value;
    var gen = src === "generator";
    $("wrap-level").classList.toggle("hidden", !gen);
    $("wrap-topik").classList.remove("hidden");
    $("home-hint").textContent = gen
      ? "Soal dibuat otomatis dan jawabannya dihitung oleh kode."
      : "Soal diambil dari data/soal.json (bank soal lokal).";
    if (gen) fillTopics();
    else fillJsonTopics();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildGeneratorItems(topic, level, jumlah) {
    var items = [];
    for (var i = 0; i < jumlah; i++) {
      var q = TIU.api.generate(topic, level);
      items.push(TIU.adapter.questionToJson(q, "g" + i));
    }
    return items;
  }

  function buildJsonItems(key, jumlah) {
    var bank = state.jsonBank.soal.slice();
    var parts = key.split("::");
    var filtered = bank.filter(function (s) {
      return s.kategori === parts[1] && s.subkategori === parts[2];
    });
    filtered = shuffle(filtered);
    var chosen = [];
    for (var i = 0; i < jumlah; i++) chosen.push(filtered[i % filtered.length]);
    return chosen.map(TIU.adapter.jsonToItem);
  }

  function start() {
    var src = $("f-sumber").value;
    var topic = $("f-topik").value;
    var level = parseInt($("f-level").value, 10);
    var jumlah = parseInt($("f-jumlah").value, 10);

    if (src === "generator") {
      state.items = buildGeneratorItems(topic, level, jumlah);
      state.meta = { mode: "Generator", label: TIU.adapter.TOPIC_META[topic].subkategori, level: level };
    } else {
      if (!topic) { alert("Bank soal kosong."); return; }
      state.items = buildJsonItems(topic, jumlah);
      state.meta = { mode: "Bank soal", label: topic.split("::")[2], level: "-" };
    }

    state.index = 0;
    state.benar = 0;
    state.salah = 0;
    show("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    var it = state.items[state.index];
    state.chosen = null;
    state.answered = false;

    $("q-meta").textContent = "Soal " + (state.index + 1) + " / " + state.items.length;
    $("q-score").textContent = "Benar: " + state.benar;
    $("q-bar").style.width = ((state.index) / state.items.length) * 100 + "%";
    $("q-chip").textContent = it.kategori + " • " + it.subkategori;
    $("q-text").textContent = it.pertanyaan;

    var box = $("q-options");
    box.innerHTML = "";
    KEYS.forEach(function (k) {
      var btn = document.createElement("button");
      btn.className = "option";
      btn.type = "button";
      btn.innerHTML = '<span class="key">' + k + "</span><span>" + it.pilihan[k] + "</span>";
      btn.addEventListener("click", function () { choose(k); });
      box.appendChild(btn);
    });

    $("q-feedback").classList.add("hidden");
    $("q-feedback").innerHTML = "";
    $("btn-next").classList.add("hidden");
    $("btn-keluar").classList.remove("hidden");
  }

  function choose(k) {
    if (state.answered) return;
    state.answered = true;
    state.chosen = k;
    var it = state.items[state.index];

    var opts = $("q-options").children;
    for (var i = 0; i < opts.length; i++) {
      var key = KEYS[i];
      opts[i].disabled = true;
      if (key === it.jawaban) opts[i].classList.add("correct");
      else if (key === k) opts[i].classList.add("wrong");
    }

    var isCorrect = k === it.jawaban;
    if (isCorrect) state.benar++;
    else state.salah++;

    var fb = $("q-feedback");
    fb.classList.remove("hidden");
    var stepsHtml = "";
    if (it.pembahasan && it.pembahasan.length) {
      stepsHtml = '<ol class="steps">' +
        it.pembahasan.map(function (s) { return "<li>" + s + "</li>"; }).join("") +
        "</ol>";
    }
    fb.className = "feedback " + (isCorrect ? "ok" : "bad");
    fb.innerHTML =
      "<h3>" + (isCorrect ? "Benar!" : "Belum tepat. Jawaban benar: " + it.jawaban) + "</h3>" +
      "<div><b>Pembahasan:</b></div>" + stepsHtml;

    $("q-score").textContent = "Benar: " + state.benar;
    $("q-bar").style.width = ((state.index + 1) / state.items.length) * 100 + "%";

    $("btn-next").classList.remove("hidden");
    $("btn-next").textContent = state.index + 1 >= state.items.length ? "Lihat Hasil" : "Soal Berikutnya";
  }

  function next() {
    state.index++;
    if (state.index >= state.items.length) finish();
    else renderQuestion();
  }

  function finish() {
    $("r-benar").textContent = state.benar;
    $("r-salah").textContent = state.salah;
    $("r-skor").textContent = state.benar * 5;
    saveHistory();
    show("result");
  }

  function saveHistory() {
    var h = loadHistory();
    h.unshift({
      tanggal: new Date().toISOString(),
      mode: state.meta.mode,
      topik: state.meta.label,
      level: state.meta.level,
      benar: state.benar,
      total: state.items.length,
      skor: state.benar * 5
    });
    h = h.slice(0, 20);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); } catch (e) {}
    renderHistory();
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function renderHistory() {
    var h = loadHistory();
    var el = $("riwayat");
    if (!h.length) { el.innerHTML = '<p class="hint">Belum ada riwayat.</p>'; return; }
    var html = "<table class='history-table'>" +
      "<tr><th>Tanggal</th><th>Topik</th><th>Skor</th><th>Benar</th></tr>";
    h.slice(0, 8).forEach(function (r) {
      var d = new Date(r.tanggal);
      var tgl = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) + " " +
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      html += "<tr>" +
        "<td>" + tgl + "</td>" +
        "<td>" + r.topik + (r.level !== "-" ? " (L" + r.level + ")" : "") + "</td>" +
        "<td><b>" + r.skor + "</b></td>" +
        "<td>" + r.benar + "/" + r.total + "</td></tr>";
    });
    html += "</table>";
    el.innerHTML = html;
  }

  // ---- Tema (dark mode) ----
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function applyTheme(mode) {
    if (mode === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    $("btn-theme").textContent = mode === "dark" ? "☀️" : "🌙";
  }
  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem("tiu_theme", next); } catch (e) {}
    applyTheme(next);
  }

  // Events
  $("f-sumber").addEventListener("change", syncSource);
  $("btn-mulai").addEventListener("click", start);
  $("btn-next").addEventListener("click", next);
  $("btn-keluar").addEventListener("click", function () { if (confirm("Keluar dari latihan?")) show("home"); });
  $("btn-ulang").addEventListener("click", function () { show("quiz"); state.index = 0; state.benar = 0; state.salah = 0; renderQuestion(); });
  $("btn-beranda").addEventListener("click", function () { show("home"); });
  $("btn-theme").addEventListener("click", toggleTheme);
  $("btn-hapus-riwayat").addEventListener("click", function () {
    if (confirm("Hapus semua riwayat?")) { localStorage.removeItem(STORAGE_KEY); renderHistory(); }
  });

  // Init
  applyTheme(currentTheme());
  fillTopics();
  renderHistory();
  loadJsonBank().then(function (bank) {
    state.jsonBank = bank;
    var errs = TIU.adapter.validateJsonFile(bank);
    if (errs.length) console.warn("soal.json bermasalah:", errs);
    if ($("f-sumber").value === "json") fillJsonTopics();
  });
  syncSource();
})();
