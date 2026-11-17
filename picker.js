/* One path at a time: a row of buttons above a set of cards; only the chosen card shows.
   Markup:
     <div class="choice-picker" data-group="dl" data-detect="os">
       <button type="button" class="choice-btn" data-show="dl-windows" data-os="windows">Windows</button> ...
     </div>
     <div class="choice-panel" data-group="dl" id="dl-windows"> ... </div>
   data-detect="os" pre-selects the teacher's own computer (Windows, Mac or Chromebook) when it can tell.
   If this script doesn't run, every card simply stays visible. */
(function () {
  function detectOS() {
    var ua = navigator.userAgent || '';
    if (/CrOS/.test(ua)) return 'chromebook';
    if (/Macintosh|Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) return 'mac';
    if (/Windows/.test(ua)) return 'windows';
    return '';
  }

  var groups = {};

  function setup(picker) {
    var group = picker.getAttribute('data-group');
    var buttons = [].slice.call(picker.querySelectorAll('.choice-btn'));
    var panels = [].slice.call(document.querySelectorAll('.choice-panel[data-group="' + group + '"]'));
    if (!buttons.length || !panels.length) return;

    function show(id) {
      panels.forEach(function (p) { p.hidden = (p.id !== id); });
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-show') === id;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    groups[group] = show;

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-show')); });
    });

    var start = buttons[0].getAttribute('data-show');
    if (picker.getAttribute('data-detect') === 'os') {
      var os = detectOS();
      var match = buttons.filter(function (b) { return b.getAttribute('data-os') === os; })[0];
      if (match) start = match.getAttribute('data-show');
    }
    show(start);
  }

  // lets a link in the text open another choice, e.g. "Use Option 5 instead"
  window.showChoice = function (group, id) {
    if (groups[group]) groups[group](id);
    var picker = document.querySelector('.choice-picker[data-group="' + group + '"]');
    if (!picker) return;
    var btn = picker.querySelector('.choice-btn[data-show="' + id + '"]');
    if (btn) btn.focus({ preventScroll: true });           // keyboard users keep their place
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = picker.getBoundingClientRect().top + window.pageYOffset - 90;   // stay clear of the sticky menu
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  };

  function init() { [].forEach.call(document.querySelectorAll('.choice-picker'), setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
