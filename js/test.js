(function () {
  const quoteEl = document.getElementById("quote");
  const hiddenInput = document.getElementById("hidden-input");
  const cpmCurrentEl = document.getElementById("cpm-current");
  const cpmPrevEl = document.getElementById("cpm-prev");
  const accuracyEl = document.getElementById("accuracy");
  const timerEl = document.getElementById("timer");
  const resultsEl = document.getElementById("results");
  const resultCpm = document.getElementById("result-cpm");
  const resultAccuracy = document.getElementById("result-accuracy");
  const resultTime = document.getElementById("result-time");
  const resultErrors = document.getElementById("result-errors");
  const btnStats = document.getElementById("btn-stats");
  const btnNew = document.getElementById("btn-new");
  const langBtns = document.querySelectorAll(".lang-switch__btn");

  let chars = [];
  let currentIndex = 0;
  let totalTyped = 0;
  let correctCount = 0;
  let errorCount = 0;
  let isFinished = false;
  let isStarted = false;
  let startTime = 0;
  let timerInterval = null;
  let cpmInterval = null;
  let currentQuote = "";
  let currentLang = Storage.getLanguage();

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
    resetTest();
  }

  for (var i = 0; i < langBtns.length; i++) {
    langBtns[i].addEventListener("click", function () {
      setLanguage(this.dataset.lang);
    });
  }

  setLanguage(currentLang);

  function showPrevResult() {
    var prev = Storage.getLastResult();
    if (prev) {
      cpmPrevEl.textContent = prev.cpm + " CPM";
    } else {
      cpmPrevEl.textContent = "\u2014";
    }
  }

  showPrevResult();

  function pickQuote(lang) {
    var list = lang == "ru" ? QUOTES_RU : QUOTES_EN;
    return list[Math.floor(Math.random() * list.length)];
  }

  function renderQuote(text) {
    quoteEl.innerHTML = "";
    chars = [];
    currentQuote = text;
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "quote__char";
      if (i === 0) span.classList.add("quote__char--current");
      if (text[i] == " ") {
        span.innerHTML = " ";
      } else {
        span.textContent = text[i];
      }
      quoteEl.appendChild(span);
      chars.push({
        el: span,
        char: text[i],
        typed: null,
        state: "pending",
      });
    }
    quoteEl.classList.remove("quote--finished");
    resultsEl.hidden = true;
    quoteEl.hidden = false;
    currentIndex = 0;
    totalTyped = 0;
    correctCount = 0;
    errorCount = 0;
    isFinished = false;
    isStarted = false;
    startTime = 0;

    if (timerInterval) clearInterval(timerInterval);
    if (cpmInterval) clearInterval(cpmInterval);
    timerInterval = null;
    cpmInterval = null;

    timerEl.textContent = "00:00";
    cpmCurrentEl.textContent = "0";
    accuracyEl.textContent = "100%";
    hiddenInput.value = "";
    quoteEl.scrollIntoView({ block: "center" });
  }

  function resetTest() {
    var text = pickQuote(currentLang);
    renderQuote(text);
    showPrevResult();
  }

  function finishTest() {
    isFinished = true;
    if (timerInterval) clearInterval(timerInterval);
    if (cpmInterval) clearInterval(cpmInterval);
    timerInterval = null;
    cpmInterval = null;
    quoteEl.classList.add("quote--finished");

    var elapsed = (Date.now() - startTime) / 1000;
    var minutes = elapsed / 60;
    var finalCpm = minutes > 0 ? Math.round(correctCount / minutes) : 0;
    var accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;

    resultCpm.textContent = finalCpm;
    resultAccuracy.textContent = accuracy + "%";
    resultTime.textContent = fmtTime(elapsed);
    resultErrors.textContent = errorCount;
    resultsEl.hidden = false;

    Storage.saveResult({
      cpm: finalCpm,
      accuracy: accuracy,
      time: Math.round(elapsed),
      errors: errorCount,
      lang: currentLang,
      quote: currentQuote,
    });
    showPrevResult();
  }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function recalcMetrics() {
    if (!isStarted || isFinished) return;
    var elapsed = (Date.now() - startTime) / 1000;
    var minutes = elapsed / 60;
    var cpm = minutes > 0 ? Math.round(correctCount / minutes) : 0;
    cpmCurrentEl.textContent = cpm;
    var acc = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
    accuracyEl.textContent = acc + "%";
    timerEl.textContent = fmtTime(elapsed);
  }

  function handleChar(ch) {
    if (isFinished) return;

    if (!isStarted) {
      isStarted = true;
      startTime = Date.now();
      timerInterval = setInterval(function () {
        if (isStarted && !isFinished) {
          timerEl.textContent = fmtTime((Date.now() - startTime) / 1000);
        }
      }, 100);
      cpmInterval = setInterval(recalcMetrics, 1000);
    }

    if (currentIndex >= chars.length) return;
    if (!chars[currentIndex]) return;

    var expected = chars[currentIndex]["char"];
    var chNorm = ch.replace(/-/g, "\u2014");
    var expNorm = expected.replace(/-/g, "\u2014");
    var isCorrect = chNorm == expNorm;

    chars[currentIndex].el.classList.remove("quote__char--current");
    if (isCorrect) {
      chars[currentIndex].el.classList.add("quote__char--correct");
      correctCount++;
    } else {
      chars[currentIndex].el.classList.add("quote__char--incorrect");
      errorCount++;
    }
    chars[currentIndex].typed = ch;
    chars[currentIndex].state = isCorrect ? "correct" : "incorrect";
    totalTyped++;
    currentIndex++;

    if (currentIndex < chars.length) {
      chars[currentIndex].el.classList.add("quote__char--current");
      chars[currentIndex].el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    recalcMetrics();

    if (currentIndex >= chars.length) {
      finishTest();
    }
  }

  function handleBackspace() {
    if (isFinished || currentIndex <= 0) return;
    currentIndex--;
    var c = chars[currentIndex];
    c.el.classList.remove("quote__char--current", "quote__char--correct", "quote__char--incorrect");
    if (c.state == "correct") {
      correctCount--;
    } else if (c.state == "incorrect") {
      errorCount--;
    }
    c.state = "pending";
    c.typed = null;
    totalTyped--;
    if (currentIndex < chars.length) {
      chars[currentIndex].el.classList.add("quote__char--current");
    }
    recalcMetrics();
  }

  hiddenInput.addEventListener("keydown", function (e) {
    if (e.key == "Tab" || e.key == "Escape") {
      e.preventDefault();
      resetTest();
      return;
    }

    if (e.key == "Backspace") {
      e.preventDefault();
      handleBackspace();
      return;
    }

    if (e.key.length == 1) {
      e.preventDefault();
      handleChar(e.key);
    }
  });

  document.addEventListener("click", function () {
    hiddenInput.focus();
  });

  btnStats.addEventListener("click", function () {
    window.location.href = "stats.html";
  });

  btnNew.addEventListener("click", resetTest);
})();
