(function () {
  "use strict";

  var TIU = window.TIU;
  var N = 1000;

  function run() {
    var topics = TIU.api.listTopics();
    var levels = [1, 2, 3];
    var results = [];
    var totalFail = 0;
    var totalRun = 0;

    for (var t = 0; t < topics.length; t++) {
      for (var l = 0; l < levels.length; l++) {
        var topic = topics[t];
        var level = levels[l];
        var fail = 0;
        var firstErrors = [];
        var sample = null;
        var start = (Date.now() % 100000) + 1;

        for (var i = 0; i < N; i++) {
          var seed = start + i * 7919 + level * 131 + topic.length * 17;
          try {
            var q = TIU.api.generate(topic, level, seed);
            var errs = TIU.validators.validateQuestion(q);
            if (errs.length > 0) {
              fail++;
              if (firstErrors.length < 5) firstErrors.push({ seed: seed, errors: errs });
            } else if (!sample) {
              sample = q;
            }
          } catch (e) {
            fail++;
            if (firstErrors.length < 5) firstErrors.push({ seed: seed, errors: [e.message] });
          }
        }

        totalFail += fail;
        totalRun += N;
        results.push({
          topic: topic,
          level: level,
          run: N,
          fail: fail,
          sample: sample,
          firstErrors: firstErrors
        });
      }
    }

    return { results: results, totalRun: totalRun, totalFail: totalFail };
  }

  window.TIU_TEST_RUN = run;
})();
