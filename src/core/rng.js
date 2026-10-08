(function () {
  "use strict";

  var TIU = (window.TIU = window.TIU || {});

  function makeRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function formatNumberID(value) {
    var v = Math.round(value * 1000) / 1000;
    var neg = v < 0;
    v = Math.abs(v);
    var parts = String(v).split(".");
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    var out = parts.length > 1 && parts[1] ? intPart + "," + parts[1] : intPart;
    return (neg ? "-" : "") + out;
  }

  TIU.rng = { makeRng: makeRng, randInt: randInt, pick: pick, shuffle: shuffle };
  TIU.format = { formatNumberID: formatNumberID };
})();
