(function () {
  var historyBody = document.getElementById("history-body");
  var bestResultEl = document.getElementById("best-result");
  var chartSvg = document.getElementById("cpm-chart");
  var ageInput = document.getElementById("age-input");
  var ageSubmit = document.getElementById("age-submit");
  var ageEvaluation = document.getElementById("age-evaluation");
  var btnClear = document.getElementById("btn-clear-history");
  var langBtns = document.querySelectorAll(".lang-switch__btn");

  var currentLang = Storage.getLanguage();

  function setLanguage(lang) {
    currentLang = lang;
    Storage.saveLanguage(lang);
    for (var i = 0; i < langBtns.length; i++) {
      var btn = langBtns[i];
      if (btn.dataset.lang == lang) {
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.setAttribute("aria-pressed", "false");
      }
    }
    renderAll();
  }

  for (var i = 0; i < langBtns.length; i++) {
    langBtns[i].addEventListener("click", function () {
      setLanguage(this.dataset.lang);
    });
  }

  setLanguage(currentLang);

  var AGE_NORMS = [
    { min: 10, max: 14, beginner: 100, average: 100, good: 180, excellent: 261 },
    { min: 15, max: 24, beginner: 150, average: 150, good: 220, excellent: 321 },
    { min: 25, max: 45, beginner: 180, average: 180, good: 260, excellent: 361 },
    { min: 46, max: 60, beginner: 140, average: 140, good: 220, excellent: 301 },
    { min: 60, max: 999, beginner: 100, average: 100, good: 180, excellent: 251 },
  ];

  function getGroup(age) {
    for (var i = 0; i < AGE_NORMS.length; i++) {
      var g = AGE_NORMS[i];
      if (age >= g.min && age <= g.max) return g;
    }
    return AGE_NORMS[0];
  }

  function evaluate(cpm, age) {
    var group = getGroup(age);
    if (!group) return null;

    var avgCpm = Math.round((group.average + group.good) / 2);

    var level, comment;
    if (cpm >= group.excellent) {
      level = "\u041E\u0442\u043B\u0438\u0447\u043D\u043E";
      comment = "\u0412\u044B\u0434\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442! \u0412\u044B \u043F\u0435\u0447\u0430\u0442\u0430\u0435\u0442\u0435 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u0430 \u043B\u044E\u0434\u0435\u0439.";
    } else if (cpm >= group.good) {
      level = "\u0425\u043E\u0440\u043E\u0448\u043E";
      comment = "\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C! \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439\u0442\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F, \u0447\u0442\u043E\u0431\u044B \u0434\u043E\u0441\u0442\u0438\u0447\u044C \u043E\u0442\u043B\u0438\u0447\u043D\u044B\u0445 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432.";
    } else if (cpm >= group.average) {
      level = "\u0421\u0440\u0435\u0434\u043D\u0435";
      comment = "\u041D\u0435\u043F\u043B\u043E\u0445\u043E, \u043D\u043E \u0435\u0441\u0442\u044C \u043A\u0443\u0434\u0430 \u0440\u0430\u0441\u0442\u0438. \u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438 \u043F\u043E\u043C\u043E\u0433\u0443\u0442 \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C.";
    } else {
      level = "\u0415\u0441\u0442\u044C \u043A\u0443\u0434\u0430 \u0440\u0430\u0441\u0442\u0438";
      comment = "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439 \u043D\u0430 \u0431\u0430\u0437\u043E\u0432\u044B\u0435 \u0441\u043E\u0447\u0435\u0442\u0430\u043D\u0438\u044F \u043A\u043B\u0430\u0432\u0438\u0448 \u0438 \u043F\u043E\u0441\u0442\u0435\u043F\u0435\u043D\u043D\u043E \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0439\u0442\u0435 \u0442\u0435\u043C\u043F.";
    }

    var comparison;
    if (cpm > avgCpm) {
      comparison = "\u0412\u044B\u0448\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u043D\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 (" + avgCpm + " CPM)";
    } else if (cpm == avgCpm) {
      comparison = "\u041D\u0430 \u0443\u0440\u043E\u0432\u043D\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u043D\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 (" + avgCpm + " CPM)";
    } else {
      comparison = "\u041D\u0438\u0436\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u043D\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 (" + avgCpm + " CPM)";
    }

    return { level: level, comparison: comparison, comment: comment };
  }

  function renderHistory() {
    var results = Storage.getResults();
    if (results.length == 0) {
      historyBody.innerHTML = "<tr><td colspan=\"6\" style=\"text-align:center;color:var(--text-secondary)\">\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432</td></tr>";
      return;
    }

    var html = "";
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var d = new Date(r.date);
      var dateStr = d.toLocaleDateString("ru-RU");
      var timeStr = fmtDuration(r.time);
      var langLabel = r.lang == "ru" ? "RU" : "EN";
      var snippet = r.quote ? (r.quote.length > 60 ? r.quote.slice(0, 60) + "\u2026" : r.quote) : "\u2014";
      html += "<tr>";
      html += "<td>" + dateStr + "</td>";
      html += "<td>" + langLabel + "</td>";
      html += "<td class=\"quote-cell\" title=\"" + esc(r.quote || "") + "\">" + esc(snippet) + "</td>";
      html += "<td>" + r.cpm + "</td>";
      html += "<td>" + r.accuracy + "%</td>";
      html += "<td>" + timeStr + "</td>";
      html += "</tr>";
    }
    historyBody.innerHTML = html;
  }

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function fmtDuration(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function renderBest() {
    var best = Storage.getBestResult();
    if (best) {
      bestResultEl.innerHTML = best.cpm + " CPM <span>(" + best.accuracy + "%, " + fmtDuration(best.time) + ")</span>";
    } else {
      bestResultEl.textContent = "\u041D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432";
    }
  }

  function renderChart() {
    var results = Storage.getResults();
    var count = Math.min(results.length, 20);
    var recent = [];
    for (var i = count - 1; i >= 0; i--) {
      recent.push(results[i]);
    }

    chartSvg.innerHTML = "";

    if (recent.length < 2) {
      var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", "300");
      txt.setAttribute("y", "150");
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("fill", "var(--text-muted)");
      txt.textContent = "\u041D\u0443\u0436\u043D\u043E \u043C\u0438\u043D\u0438\u043C\u0443\u043C 2 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430 \u0434\u043B\u044F \u0433\u0440\u0430\u0444\u0438\u043A\u0430";
      chartSvg.appendChild(txt);
      return;
    }

    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var w = 600 - margin.left - margin.right;
    var h = 300 - margin.top - margin.bottom;

    var maxCpm = recent[0].cpm;
    var minCpm = recent[0].cpm;
    for (var i = 1; i < recent.length; i++) {
      if (recent[i].cpm > maxCpm) maxCpm = recent[i].cpm;
      if (recent[i].cpm < minCpm) minCpm = recent[i].cpm;
    }
    var range = maxCpm - minCpm || 1;

    var points = [];
    for (var i = 0; i < recent.length; i++) {
      var x = margin.left + (i / (recent.length - 1)) * w;
      var y = margin.top + h - ((recent[i].cpm - minCpm) / range) * h;
      points.push({ x: x, y: y, cpm: recent[i].cpm });
    }

    var gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    for (var i = 0; i <= 4; i++) {
      var y = margin.top + (h / 4) * i;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", margin.left);
      line.setAttribute("y1", y);
      line.setAttribute("x2", margin.left + w);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "var(--border)");
      line.setAttribute("stroke-dasharray", "4,4");
      gridGroup.appendChild(line);
      var val = Math.round(maxCpm - (i / 4) * range);
      var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", margin.left - 8);
      txt.setAttribute("y", y + 4);
      txt.setAttribute("text-anchor", "end");
      txt.setAttribute("fill", "var(--text-muted)");
      txt.textContent = val;
      gridGroup.appendChild(txt);
    }
    chartSvg.appendChild(gridGroup);

    var d = "";
    for (var i = 0; i < points.length; i++) {
      d += (i == 0 ? "M" : "L") + " " + points[i].x + " " + points[i].y;
    }
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--accent)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linejoin", "round");
    chartSvg.appendChild(path);

    for (var i = 0; i < points.length; i++) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", points[i].x);
      c.setAttribute("cy", points[i].y);
      c.setAttribute("r", "4");
      c.setAttribute("fill", "var(--accent)");
      chartSvg.appendChild(c);
    }
  }

  function renderAll() {
    renderHistory();
    renderBest();
    renderChart();
    ageEvaluation.hidden = true;
  }

  ageSubmit.addEventListener("click", function () {
    var age = parseInt(ageInput.value, 10);
    if (!age || age < 1 || age > 120) {
      ageEvaluation.hidden = false;
      ageEvaluation.innerHTML = "<div style=\"color:var(--error)\">\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0432\u043E\u0437\u0440\u0430\u0441\u0442 (1\u2013120)</div>";
      return;
    }

    var results = Storage.getResults();
    if (results.length == 0) {
      ageEvaluation.hidden = false;
      ageEvaluation.innerHTML = "<div style=\"color:var(--text-secondary)\">\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u0438\u043D \u0442\u0435\u0441\u0442, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043E\u0446\u0435\u043D\u043A\u0443</div>";
      return;
    }

    var sum = 0;
    for (var i = 0; i < results.length; i++) sum += results[i].cpm;
    var avgCpm = Math.round(sum / results.length);

    var bestCpm = results[0].cpm;
    for (var i = 1; i < results.length; i++) {
      if (results[i].cpm > bestCpm) bestCpm = results[i].cpm;
    }

    var evalResult = evaluate(bestCpm, age);

    if (!evalResult) {
      ageEvaluation.hidden = false;
      ageEvaluation.innerHTML = "<div style=\"color:var(--error)\">\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u043D\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443</div>";
      return;
    }

    ageEvaluation.hidden = false;
    ageEvaluation.innerHTML =
      "<div class=\"age-evaluation__level\">" + evalResult.level + "</div>" +
      "<div class=\"age-evaluation__comparison\">" + evalResult.comparison + "</div>" +
      "<div class=\"age-evaluation__comment\">" + evalResult.comment + "</div>" +
      "<div style=\"margin-top:8px;font-size:0.875rem;color:var(--text-muted)\">\u0412\u0430\u0448 \u043B\u0443\u0447\u0448\u0438\u0439 CPM: " + bestCpm + " | \u0421\u0440\u0435\u0434\u043D\u0438\u0439 CPM: " + avgCpm + "</div>";
  });

  ageInput.addEventListener("keydown", function (e) {
    if (e.key == "Enter") ageSubmit.click();
  });

  btnClear.addEventListener("click", function () {
    if (confirm("\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u044E \u0438\u0441\u0442\u043E\u0440\u0438\u044E?")) {
      Storage.clearResults();
      renderAll();
    }
  });

  renderAll();
})();
