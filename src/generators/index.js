(function () {
  "use strict";

  var TIU = window.TIU;
  var validateQuestion = TIU.validators.validateQuestion;

  function listTopics() {
    return Object.keys(TIU.generators);
  }

  function clampDifficulty(d) {
    d = parseInt(d, 10);
    if (isNaN(d)) d = 2;
    if (d < 1) d = 1;
    if (d > 3) d = 3;
    return d;
  }

  function generate(topic, difficulty, seed) {
    var gen = TIU.generators[topic];
    if (!gen) throw new Error("Unknown topic: " + topic);

    var level = clampDifficulty(difficulty);
    var s = seed == null ? (Math.random() * 0x7fffffff) >>> 0 : seed >>> 0;

    for (var attempt = 0; attempt < 60; attempt++) {
      var q = gen.generate(level, (s + attempt * 2654435761) >>> 0);
      var errors = validateQuestion(q);
      if (errors.length === 0) return q;
    }
    throw new Error("Failed to generate valid question for " + topic + " level " + level);
  }

  TIU.api = { generate: generate, listTopics: listTopics, clampDifficulty: clampDifficulty };
})();
