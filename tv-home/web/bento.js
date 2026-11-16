/**
 * Bento Theme: Ambient Dynamic Celestial Sky & 3-Row Glass Console
 * Adheres strictly to STANDARDS_performance.md:
 * - 60 FPS GPU animations (transform, opacity)
 * - Zero layout reflows or CPU blocking
 * - Automatic Day/Night solar & lunar tracking with human breathing pulsation
 */

(function () {
  var bentoActive = false;
  var mockTimeParam = null;
  var bentoInputsEls = [];
  var activeInputIdx = 0;

  // Check URL params for mock testing: ?time=15:00 or ?phase=sunset or ?hour=15
  var q = location.search;
  var mTime = q.match(/[?&]time=([0-9]{1,2}:[0-9]{2})/);
  var mHour = q.match(/[?&]hour=([0-9]{1,2})/);
  var mPhase = (q.match(/[?&]phase=([a-z]+)/) || [])[1];

  if (mTime) mockTimeParam = mTime[1];
  else if (mHour) mockTimeParam = mHour[1] + ":00";
  else if (mPhase) {
    if (mPhase === "dawn" || mPhase === "morning") mockTimeParam = "07:30";
    else if (mPhase === "day" || mPhase === "noon") mockTimeParam = "12:00";
    else if (mPhase === "sunset" || mPhase === "golden") mockTimeParam = "17:45";
    else if (mPhase === "night") mockTimeParam = "22:30";
  }

  function getDecimalHour() {
    if (mockTimeParam) {
      var parts = mockTimeParam.split(":");
      return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }
    var d = new Date();
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  }

  /* --------------------------------------------------------------------------
     Dynamic Celestial Day/Night Arc Engine
     -------------------------------------------------------------------------- */
  function updateCelestialState() {
    if (!bentoActive) return;

    var h = getDecimalHour();
    var orbX, orbY, orbColor, orbGlow, skyGradient, ambientBleed, focusGlow, textColor;

    // Phase 1: Dawn / Early Morning (05:30 -> 09:30)
    if (h >= 5.5 && h < 9.5) {
      var p = (h - 5.5) / 4.0;
      orbX = 14 + p * 22; // 14% to 36%
      orbY = 48 - Math.sin(p * Math.PI * 0.5) * 22; // rises from 48% to 26%
      orbColor = "rgba(255, 215, 110, 0.95)";
      orbGlow = "rgba(255, 170, 60, 0.65)";
      skyGradient = "linear-gradient(180deg, #6ba5d8 0%, #b8cde4 35%, #f6c09a 70%, #fbe3b5 100%)";
      ambientBleed = "rgba(240, 165, 110, 0.22)";
      focusGlow = "rgba(255, 180, 80, 0.45)";
      textColor = "#1c222c";
    }
    // Phase 2: High Daylight (09:30 -> 16:00)
    else if (h >= 9.5 && h < 16.0) {
      var p = (h - 9.5) / 6.5;
      orbX = 36 + p * 28; // 36% to 64%
      orbY = 24 - Math.sin(p * Math.PI) * 10; // high arc ~14% to 24%
      orbColor = "rgba(255, 240, 140, 0.98)";
      orbGlow = "rgba(255, 200, 70, 0.6)";
      skyGradient = "linear-gradient(180deg, #2a88e6 0%, #68b3f4 40%, #b2dbfa 75%, #edf5fd 100%)";
      ambientBleed = "rgba(50, 136, 230, 0.2)";
      focusGlow = "rgba(60, 150, 245, 0.45)";
      textColor = "#151b24";
    }
    // Phase 3: Golden Hour / Sunset (16:00 -> 19:30) - Matches user reference image!
    else if (h >= 16.0 && h < 19.5) {
      var p = (h - 16.0) / 3.5;
      orbX = 64 + p * 24; // 64% to 88%
      orbY = 24 + Math.sin(p * Math.PI * 0.5) * 22; // sinks from 24% to 46%
      orbColor = "rgba(255, 165, 40, 0.96)";
      orbGlow = "rgba(235, 95, 20, 0.7)";
      skyGradient = "linear-gradient(180deg, #c4571e 0%, #dc7b32 30%, #e8a85a 65%, #dcd69a 100%)";
      ambientBleed = "rgba(235, 110, 35, 0.24)";
      focusGlow = "rgba(245, 145, 35, 0.5)";
      textColor = "#1a1c22";
    }
    // Phase 4: Night / Lunar Arc (19:30 -> 05:30) - Inverted & dark cosmic sky
    else {
      var pNight = ((h - 19.5 + 24) % 24) / 10.0;
      orbX = 14 + pNight * 72; // Lunar orb tracks 14% to 86% across screen
      orbY = 42 - Math.sin(pNight * Math.PI) * 18;
      orbColor = "rgba(242, 246, 255, 0.95)";
      orbGlow = "rgba(160, 190, 255, 0.45)";
      skyGradient = "linear-gradient(180deg, #090a14 0%, #121524 35%, #1a1a32 70%, #201e38 100%)";
      ambientBleed = "rgba(140, 170, 255, 0.12)";
      focusGlow = "rgba(160, 195, 255, 0.35)";
      textColor = "#f4f6fa";
    }

    var r = document.documentElement.style;
    r.setProperty("--bento-orb-x", orbX.toFixed(1) + "%");
    r.setProperty("--bento-orb-y", orbY.toFixed(1) + "%");
    r.setProperty("--bento-orb-color", orbColor);
    r.setProperty("--bento-orb-glow", orbGlow);
    r.setProperty("--bento-sky-gradient", skyGradient);
    r.setProperty("--bento-ambient-bleed", ambientBleed);
    r.setProperty("--bento-focus-glow", focusGlow);
    r.setProperty("--bento-text-color", textColor);
  }

  /* --------------------------------------------------------------------------
     Ambient Stage (Top 2/3 Display)
     -------------------------------------------------------------------------- */
  function updateAmbientStage() {
    if (!bentoActive) return;

    var d = new Date();
    if (mockTimeParam) {
      var parts = mockTimeParam.split(":");
      d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0);
    }

    // Time
    var h = d.getHours(), m = d.getMinutes();
    var mm = (m < 10 ? "0" : "") + m;
    var is24h = window.COUCH_CONFIG && window.COUCH_CONFIG.home && window.COUCH_CONFIG.home.clock === "24h";
    var timeStr, ampmStr = "";
    if (is24h) {
      timeStr = (h < 10 ? "0" : "") + h + ":" + mm;
    } else {
      timeStr = (h % 12 || 12) + ":" + mm;
      ampmStr = "<small>" + (h < 12 ? "AM" : "PM") + "</small>";
    }
    var elTime = document.getElementById("bento-time");
    if (elTime) elTime.innerHTML = timeStr + ampmStr;

    // Date
    var elDate = document.getElementById("bento-date");
    if (elDate) {
      var loc = (window.I18N && window.I18N.locale) ? window.I18N.locale() : "en-AU";
      var dayName = d.toLocaleDateString(loc, { weekday: "short" });
      var dayNum = d.getDate();
      var monName = d.toLocaleDateString(loc, { month: "short" });
      elDate.textContent = dayName + ", " + dayNum + " " + monName;
    }

    // Weather
    var w = (window.COUCH_DATA && window.COUCH_DATA.weather) || null;
    var elTemp = document.getElementById("bento-temp");
    var elCond = document.getElementById("bento-cond");
    var elPlace = document.getElementById("bento-place");

    var cfg = window.COUCH_CONFIG || {};
    var wxCfg = cfg.weather || {};
    var qMatch = location.search.match(/[?&]place=([^&]+)/);
    var placeName = qMatch ? decodeURIComponent(qMatch[1]) : (wxCfg.place || "Bangalore");

    if (w && w.temp != null) {
      var isF = cfg.home && cfg.home.wx_unit === "f";
      var tempVal = isF ? Math.round(w.temp * 9 / 5 + 32) + "°F" : w.temp + "°C";
      if (elTemp) elTemp.textContent = tempVal;
      if (elCond) elCond.textContent = w.text || "Clear";
    } else {
      // Default placeholder matching mockup
      if (elTemp) elTemp.textContent = "28°C";
      if (elCond) elCond.textContent = "Clear";
    }
    if (elPlace) elPlace.textContent = placeName;
  }

  /* --------------------------------------------------------------------------
     Row 2: Input Controls Bento Row
     -------------------------------------------------------------------------- */
  var INPUT_ICONS = {
    hdmi: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M7 14v-4M10 14v-4M14 14v-4M17 14v-4"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    sleep: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  };

  function renderBentoInputs() {
    var container = document.getElementById("bento-inputs-track");
    if (!container) return;

    var list = [];
    if (window.MOCK_INPUTS && window.MOCK_INPUTS.length) {
      list = window.MOCK_INPUTS.map(function (x) {
        return { id: x.id, label: x.label || "HDMI Input", icon: INPUT_ICONS.hdmi, act: "input" };
      });
    } else {
      // Default two HDMI inputs as indicated in user's mockup
      list = [
        { id: "hdmi1", label: "HDMI Input 1", icon: INPUT_ICONS.hdmi, act: "input" },
        { id: "hdmi2", label: "HDMI Input 2", icon: INPUT_ICONS.hdmi, act: "input" },
        { id: "settings", label: "Settings", icon: INPUT_ICONS.settings, act: "settings" },
        { id: "sleep", label: "Sleep Timer", icon: INPUT_ICONS.sleep, act: "sleep" }
      ];
    }

    container.innerHTML = list.map(function (it, i) {
      return '<button class="bento-input-btn" id="binput-' + i + '" data-act="' + it.act + '" data-id="' + it.id + '">' +
        it.icon + '<span>' + it.label + '</span></button>';
    }).join("");

    bentoInputsEls = Array.prototype.slice.call(container.children);
  }

  /* --------------------------------------------------------------------------
     Initialization & Lifecycle
     -------------------------------------------------------------------------- */
  function init() {
    bentoActive = document.documentElement.classList.contains("theme-bento") ||
                  document.documentElement.className.indexOf("theme-bento") >= 0;
    if (!bentoActive) return;

    renderBentoInputs();
    updateCelestialState();
    updateAmbientStage();

    if (!window._bentoTimer) {
      window._bentoTimer = setInterval(function () {
        if (bentoActive) {
          updateCelestialState();
          updateAmbientStage();
        }
      }, 15000);
    }
  }

  // Public theme interface for app.js
  window.BentoTheme = {
    init: init,
    updateCelestial: updateCelestialState,
    updateStage: updateAmbientStage,
    getInputs: function () { return bentoInputsEls; },
    getInputIdx: function () { return activeInputIdx; },
    setInputIdx: function (i) { activeInputIdx = i; },
    focusInput: function (i) {
      activeInputIdx = Math.max(0, Math.min(bentoInputsEls.length - 1, i));
      bentoInputsEls.forEach(function (el, idx) {
        el.classList.toggle("focus", idx === activeInputIdx);
      });
      if (bentoInputsEls[activeInputIdx]) {
        bentoInputsEls[activeInputIdx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    },
    clearInputFocus: function () {
      bentoInputsEls.forEach(function (el) { el.classList.remove("focus"); });
    },
    activateInput: function (i) {
      var el = bentoInputsEls[i];
      if (!el) return;
      var act = el.getAttribute("data-act");
      var id = el.getAttribute("data-id");
      if (act === "settings") {
        if (typeof window.openSettings === "function") window.openSettings();
      } else if (act === "sleep") {
        if (typeof window.openSleepMenu === "function") window.openSleepMenu();
      } else {
        if (typeof window.note === "function") window.note("Switching to " + el.textContent.trim());
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
