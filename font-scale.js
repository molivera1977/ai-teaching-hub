(function () {
  var SIZES = [13, 15, 17, 20];   // px values for html font-size
  var DEFAULT_IDX = 1;            // 15px = "Normal"
  var KEY = 'ai-hub-font-idx';

  function getIdx() {
    var v = localStorage.getItem(KEY);
    return v !== null ? parseInt(v, 10) : DEFAULT_IDX;
  }

  function applySize(idx) {
    document.documentElement.style.fontSize = SIZES[idx] + 'px';
  }

  // Apply immediately (before DOM ready) so text doesn't flash
  applySize(getIdx());

  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.createElement('div');
    wrap.id = 'fs-widget';
    wrap.innerHTML =
      '<button id="fs-down" title="Smaller text">A−</button>' +
      '<span>Text Size</span>' +
      '<button id="fs-up" title="Larger text">A+</button>';
    document.body.appendChild(wrap);

    function update() {
      var idx = getIdx();
      document.getElementById('fs-down').disabled = (idx === 0);
      document.getElementById('fs-up').disabled   = (idx === SIZES.length - 1);
    }

    document.getElementById('fs-down').addEventListener('click', function () {
      var cur = getIdx();
      if (cur > 0) { localStorage.setItem(KEY, cur - 1); applySize(cur - 1); update(); }
    });
    document.getElementById('fs-up').addEventListener('click', function () {
      var cur = getIdx();
      if (cur < SIZES.length - 1) { localStorage.setItem(KEY, cur + 1); applySize(cur + 1); update(); }
    });

    update();
  });
})();
