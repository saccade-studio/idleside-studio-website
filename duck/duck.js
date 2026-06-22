/* Idleside Studio — duck character cards
   Drives: tap-to-hatch -> egg hatch (once) -> duck loops -> bio types out
   with Game Boy text beeps. Reads window.DUCK (set inline per page). */
(function () {
  'use strict';

  var D = window.DUCK || {};
  var ASSETS = '../assets/';
  var EGG_STILL = ASSETS + 'egg-still.png';
  var EGG_HATCH = ASSETS + 'EGG_HATCH.gif';
  var HATCH_MS  = 3200;               // EGG_HATCH.gif total run-time (22 frames)
  var IG_URL    = 'https://instagram.com/dvbbydoo';

  var frame  = document.getElementById('frame');
  var anim   = document.getElementById('anim');
  var prompt = document.getElementById('prompt');
  var gbWrap = document.getElementById('gb');
  var gbName = document.getElementById('gbname');
  var gbText = document.getElementById('gbtext');

  // ---- populate static bits from the per-page data ----
  document.documentElement.style.setProperty('--accent', D.accent || '#ffffff');
  if (D.dense) gbWrap.classList.add('dense');
  gbName.textContent = D.name || '';

  // preload the looping duck frame so the post-hatch swap is instant
  var pre = new Image();
  pre.src = ASSETS + D.gif;

  var hatched = false;   // hatch runs once per page load; refresh to replay
  var typeTimer = null;

  // ---- audio: tiny square-wave blip per character ----
  var actx = null;
  function unlockAudio() {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
    } catch (e) { actx = null; }
  }
  function beep() {
    if (!actx) return;
    var t = actx.currentTime;
    var osc = actx.createOscillator();
    var gain = actx.createGain();
    osc.type = 'square';
    osc.frequency.value = 600 + Math.random() * 140;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    osc.connect(gain).connect(actx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // ---- typewriter ----
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function linkify(html) {
    return html.replace(/@dvbbydoo/gi,
      '<a class="ig" href="' + IG_URL + '" target="_blank" rel="noopener">@dvbbydoo</a>');
  }
  function render(shown, done) {
    var html = esc(shown).replace(/\n/g, '<br>');
    if (done) {
      gbText.innerHTML = linkify(html) + '<span class="cursor">_</span>';
    } else {
      gbText.innerHTML = html + '<span class="cursor">_</span>';
    }
    gbText.scrollTop = gbText.scrollHeight;
  }
  function type() {
    var full = D.bio || '';
    var i = 0;
    (function step() {
      if (i < full.length) {
        var ch = full.charAt(i++);
        if (ch !== ' ' && ch !== '\n') beep();
        render(full.slice(0, i), false);
        var delay = ch === '\n' ? 260 : ('.!?'.indexOf(ch) > -1 ? 200 : 34);
        typeTimer = setTimeout(step, delay);
      } else {
        render(full, true);
      }
    })();
  }

  // ---- hatch sequence (plays once per page load; refresh to replay) ----
  function hatch() {
    if (hatched) return;
    hatched = true;
    unlockAudio();
    prompt.classList.add('hidden');

    anim.src = EGG_HATCH;          // egg hatch, plays through once

    setTimeout(function () {
      anim.src = ASSETS + D.gif;   // duck, loops forever
      type();
    }, HATCH_MS);
  }

  frame.addEventListener('click', hatch);
  prompt.addEventListener('click', hatch);
  frame.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hatch(); }
  });

  // show the intact egg until tapped
  anim.src = EGG_STILL;
})();
