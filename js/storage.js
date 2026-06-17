const Storage = {
  KEYS: {
    RESULTS: "tututype_results",
    LANGUAGE: "tututype_language",
  },

  saveResult(result) {
    var results = this.getResults();
    result.date = new Date().toISOString();
    results.unshift(result);
    try {
      localStorage.setItem(this.KEYS.RESULTS, JSON.stringify(results));
    } catch (e) {}
  },

  getResults() {
    try {
      var data = localStorage.getItem(this.KEYS.RESULTS);
      return data ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  },

  clearResults() {
    localStorage.removeItem(this.KEYS.RESULTS);
  },

  getLanguage() {
    var lang = localStorage.getItem(this.KEYS.LANGUAGE);
    return lang || "ru";
  },

  saveLanguage(lang) {
    localStorage.setItem(this.KEYS.LANGUAGE, lang);
  },

  getLastResult() {
    var results = this.getResults();
    if (results.length == 0) return null;
    return results[0];
  },

  getBestResult() {
    var results = this.getResults();
    if (results.length == 0) return null;
    var best = results[0];
    for (var i = 1; i < results.length; i++) {
      if (results[i].cpm > best.cpm) best = results[i];
    }
    return best;
  },
};
