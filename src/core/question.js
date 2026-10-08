(function () {
  "use strict";

  var TIU = window.TIU;

  var TARGET_SECONDS = { 1: 45, 2: 75, 3: 105 };

  function uuid() {
    var rng = TIU.rng.makeRng((Math.random() * 0xffffffff) >>> 0);
    var hex = "0123456789abcdef";
    var out = "";
    for (var i = 0; i < 32; i++) out += hex[Math.floor(rng() * 16)];
    return (
      out.slice(0, 8) + "-" + out.slice(8, 12) + "-" + out.slice(12, 16) + "-" + out.slice(16, 20) + "-" + out.slice(20)
    );
  }

  function buildQuestion(partial, rng) {
    var spec = {
      answerValue: partial.answerValue,
      distractors: partial.distractors,
      correctText: partial.correctText,
      distractorTexts: partial.distractorTexts,
      format: partial.format,
      allowNegative: !!partial.allowNegative
    };
    var built = TIU.distractors.buildOptions(rng, spec);

    return {
      id: uuid(),
      topic: partial.topic,
      difficulty: partial.difficulty,
      seed: partial.seed,
      text: partial.text,
      options: built.options,
      correct: built.correct,
      explanation_steps: partial.steps,
      shortcut_tip: partial.tip || "",
      target_seconds: partial.target_seconds || TARGET_SECONDS[partial.difficulty] || 60,
      created_at: new Date().toISOString(),
      _answerValue: partial.answerValue,
      _correctText: partial.correctText || null,
      _solver: partial.solver
    };
  }

  TIU.question = { buildQuestion: buildQuestion, uuid: uuid };
})();
