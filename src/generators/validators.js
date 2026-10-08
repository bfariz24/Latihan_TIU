(function () {
  "use strict";

  var TIU = window.TIU;
  var KEYS = ["A", "B", "C", "D", "E"];
  var formatNumberID = TIU.format.formatNumberID;

  function hasBadToken(s) {
    if (typeof s !== "string") return true;
    if (/\{[^}]*\}/.test(s)) return true;
    if (/undefined|NaN|\[object|null/.test(s)) return true;
    return false;
  }

  function validateQuestion(q) {
    var errors = [];

    if (!q) return ["question is null"];

    if (typeof q.text !== "string" || q.text.length === 0) errors.push("missing text");
    else if (hasBadToken(q.text)) errors.push("bad token/placeholder in text");

    if (!q.options || typeof q.options !== "object") {
      errors.push("missing options");
    } else {
      var vals = [];
      for (var i = 0; i < KEYS.length; i++) {
        var k = KEYS[i];
        if (typeof q.options[k] !== "string") errors.push("missing option " + k);
        else if (hasBadToken(q.options[k])) errors.push("bad option " + k);
        vals.push(q.options[k]);
      }
      var uniq = {};
      for (var v = 0; v < vals.length; v++) uniq[vals[v]] = true;
      if (Object.keys(uniq).length !== 5) errors.push("duplicate options");
    }

    if (KEYS.indexOf(q.correct) === -1) errors.push("bad correct letter");

    if (typeof q._answerValue !== "number" || !isFinite(q._answerValue)) {
      errors.push("bad answer value");
    } else {
      var correctStr = q._correctText || formatNumberID(q._answerValue);
      if (q.options && q.options[q.correct] !== correctStr) {
        errors.push("correct option does not match expected answer");
      }
      var matches = 0;
      for (var m = 0; m < KEYS.length; m++) {
        if (q.options && q.options[KEYS[m]] === correctStr) matches++;
      }
      if (matches !== 1) errors.push("not exactly one correct option (" + matches + ")");
    }

    if (typeof q._solver === "function") {
      var s;
      try {
        s = q._solver();
      } catch (e) {
        errors.push("solver threw: " + e.message);
      }
      if (typeof s === "number" && Math.abs(s - q._answerValue) > 1e-9) {
        errors.push("independent solver mismatch: " + s + " vs " + q._answerValue);
      }
    } else {
      errors.push("missing independent solver");
    }

    if (!Array.isArray(q.explanation_steps) || q.explanation_steps.length === 0) {
      errors.push("missing explanation");
    } else {
      for (var e2 = 0; e2 < q.explanation_steps.length; e2++) {
        if (hasBadToken(q.explanation_steps[e2])) {
          errors.push("bad token/placeholder in explanation step " + (e2 + 1));
        }
      }
    }

    return errors;
  }

  TIU.validators = { validateQuestion: validateQuestion };
})();
