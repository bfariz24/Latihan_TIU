(function () {
  "use strict";

  var TIU = window.TIU;
  var shuffle = TIU.rng.shuffle;
  var formatNumberID = TIU.format.formatNumberID;

  var KEYS = ["A", "B", "C", "D", "E"];

  function assign(rng, correctStr, distractorStrings) {
    var seen = {};
    seen[correctStr] = true;
    var chosen = [];
    for (var i = 0; i < distractorStrings.length && chosen.length < 4; i++) {
      var s = distractorStrings[i];
      if (typeof s !== "string" || s.length === 0) continue;
      if (seen[s]) continue;
      seen[s] = true;
      chosen.push(s);
    }
    var entries = [{ s: correctStr, correct: true }];
    for (var c = 0; c < chosen.length; c++) entries.push({ s: chosen[c], correct: false });
    entries = shuffle(rng, entries);

    var options = {};
    var correct = null;
    for (var k = 0; k < entries.length; k++) {
      options[KEYS[k]] = entries[k].s;
      if (entries[k].correct) correct = KEYS[k];
    }
    return { options: options, correct: correct, count: entries.length };
  }

  // Mode angka: nilai jawaban numerik + pengecoh numerik.
  function buildNumeric(rng, answerValue, rawDistractors, opts) {
    opts = opts || {};
    var format = opts.format || formatNumberID;
    var allowNegative = !!opts.allowNegative;
    if (typeof answerValue !== "number" || !isFinite(answerValue)) {
      return { options: {}, correct: null, count: 0 };
    }
    var isInt = Number.isInteger(answerValue);
    var correctStr = format(answerValue);

    var seen = {};
    seen[correctStr] = true;
    var chosen = [];

    function tryAdd(v) {
      if (chosen.length >= 4) return;
      if (typeof v !== "number" || !isFinite(v)) return;
      if (!allowNegative && v < 0) return;
      if (isInt && !Number.isInteger(v)) return;
      var s = format(v);
      if (seen[s]) return;
      seen[s] = true;
      chosen.push(s);
    }

    var raw = rawDistractors || [];
    for (var i = 0; i < raw.length; i++) tryAdd(raw[i]);

    var offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 10, -10, 7, -7, 8, -8, 9, -9, 20, -20];
    for (var o = 0; o < offsets.length && chosen.length < 4; o++) tryAdd(answerValue + offsets[o]);

    var mult = 2;
    while (chosen.length < 4 && mult <= 5) {
      tryAdd(answerValue * mult);
      tryAdd(Math.round(answerValue / mult));
      mult++;
    }

    var bump = 100;
    var guard = 0;
    while (chosen.length < 4 && guard < 5000) {
      tryAdd(answerValue + bump);
      tryAdd(answerValue - bump);
      bump += 100;
      guard++;
    }

    var entries = [{ v: answerValue, s: correctStr, correct: true }];
    for (var c = 0; c < chosen.length; c++) entries.push({ v: null, s: chosen[c], correct: false });
    entries = shuffle(rng, entries);

    var options = {};
    var correct = null;
    for (var k = 0; k < entries.length; k++) {
      options[KEYS[k]] = entries[k].s;
      if (entries[k].correct) correct = KEYS[k];
    }
    return { options: options, correct: correct, count: entries.length };
  }

  function buildOptions(rng, spec) {
    if (spec.correctText) {
      return assign(rng, spec.correctText, spec.distractorTexts || []);
    }
    return buildNumeric(rng, spec.answerValue, spec.distractors, spec);
  }

  TIU.distractors = { buildOptions: buildOptions, KEYS: KEYS };
})();
