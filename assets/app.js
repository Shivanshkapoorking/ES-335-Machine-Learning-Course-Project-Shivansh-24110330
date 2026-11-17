(function () {
  "use strict";
  var D = window.RESULTS;
  var SEASONS = ["Summer", "Winter", "Monsoon"];
  var MODELS = { XGB: "XGBoost", RF: "Random Forest" };
  var MODES = { Standard: "All features", Greedy: "Greedy-selected" };
  var SCENS = ["S1", "S2", "S3", "S4"];
  var SCEN_TITLE = { S1: "Past power and calendar", S2: "Plus measured weather", S3: "Plus derived physics", S4: "Plus sun position" };
  var SCEN_SHORT = { S1: "Past power + calendar", S2: "+ measured weather", S3: "+ derived physics", S4: "+ sun position" };
  var NS = "http://www.w3.org/2000/svg";

  var index = {};
  D.runs.forEach(function (r) { index[[r.season, r.model, r.scenario, r.mode].join("|")] = r; });
  function get(season, model, scen, mode) { return index[[season, model, scen, mode].join("|")]; }

  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function stat(run, key) {
    if (!run || !run.complete) return null;
    var v = run.revs.map(function (x) { return x[key]; });
    return { m: mean(v), lo: Math.min.apply(null, v), hi: Math.max.apply(null, v) };
  }
  function f2(x) { return x == null ? "n/a" : x.toFixed(2); }
  function f3(x) { return x == null ? "n/a" : x.toFixed(3); }
  function f4(x) { return x == null ? "n/a" : x.toFixed(4); }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function sv(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- segmented radio control ---------- */
  var controls = {};
  function makeSeg(name, options, getValue, setValue) {
    var host = document.querySelector('[data-ctl="' + name + '"]');
    if (!host) return;
    function draw() {
      host.innerHTML = "";
      var cur = getValue();
      options.forEach(function (o) {
        var b = el("button", { type: "button", role: "radio", "aria-checked": String(o.v === cur), tabindex: o.v === cur ? "0" : "-1" });
        b.appendChild(document.createTextNode(o.label));
        if (o.sub) { var s = el("small", null, o.sub); b.appendChild(s); }
        b.addEventListener("click", function () { setValue(o.v); });
        b.addEventListener("keydown", function (e) {
          var i = options.findIndex(function (x) { return x.v === getValue(); });
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setValue(options[(i + 1) % options.length].v, true); }
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setValue(options[(i + options.length - 1) % options.length].v, true); }
        });
        host.appendChild(b);
      });
    }
    controls[name] = draw;
    draw();
  }
  function refocus(name) {
    var host = document.querySelector('[data-ctl="' + name + '"]');
    var b = host && host.querySelector('[aria-checked="true"]');
    if (b) b.focus();
  }

  /* ---------- tooltip ---------- */
  var tip = document.getElementById("tip");
  function showTip(target, html) {
    tip.textContent = html;
    var r = target.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - 240, Math.max(8, r.left + r.width / 2 - 60)) + "px";
    tip.style.top = Math.max(8, r.top - 58) + "px";
    tip.classList.add("on");
  }
  function hideTip() { tip.classList.remove("on"); }

  /* ---------- explorer ---------- */
  var S = { season: "Summer", model: "XGB", mode: "Standard", scen: "S1" };

  makeSeg("season", SEASONS.map(function (s) { return { v: s, label: s, sub: D.dates[s] }; }),
    function () { return S.season; }, function (v, f) { S.season = v; renderExplorer(); if (f) refocus("season"); });
  makeSeg("model", Object.keys(MODELS).map(function (m) { return { v: m, label: MODELS[m] }; }),
    function () { return S.model; }, function (v, f) { S.model = v; renderExplorer(); if (f) refocus("model"); });
  makeSeg("mode", Object.keys(MODES).map(function (m) { return { v: m, label: MODES[m] }; }),
    function () { return S.mode; }, function (v, f) { S.mode = v; renderExplorer(); if (f) refocus("mode"); });

  var rail = document.getElementById("rail");
  var railFill = document.getElementById("railfill");
  function drawRail() {
    Array.prototype.slice.call(rail.querySelectorAll(".step")).forEach(function (n) { n.remove(); });
    var idx = SCENS.indexOf(S.scen);
    SCENS.forEach(function (sc, i) {
      var li = el("div", { class: "step" });
      var b = el("button", { type: "button", role: "radio", "aria-checked": String(sc === S.scen), tabindex: sc === S.scen ? "0" : "-1" });
      if (i <= idx) b.className = "reached";
      b.appendChild(el("span", { class: "node" }, sc));
      b.appendChild(el("span", { class: "t" }, SCEN_SHORT[sc]));
      var r = get(S.season, S.model, sc, S.mode);
      b.appendChild(el("span", { class: "d" }, r && r.complete ? r.n_feat + " of " + r.n_pool + " features" : "run not finished"));
      b.addEventListener("click", function () { S.scen = sc; renderExplorer(); });
      b.addEventListener("keydown", function (e) {
        var j = SCENS.indexOf(S.scen);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); S.scen = SCENS[Math.min(3, j + 1)]; renderExplorer(); focusRail(); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); S.scen = SCENS[Math.max(0, j - 1)]; renderExplorer(); focusRail(); }
      });
      li.appendChild(b);
      rail.appendChild(li);
    });
    railFill.style.width = "calc(" + idx + " / 3 * 75%)";
  }
  function focusRail() { var b = rail.querySelector('[aria-checked="true"]'); if (b) b.focus(); }

  function sparkline(season, model, mode, cur) {
    var W = 260, H = 56, pad = 14;
    var vals = SCENS.map(function (sc) { var s = stat(get(season, model, sc, mode), "MAE_test"); return s ? s.m : null; });
    var good = vals.filter(function (v) { return v != null; });
    var lo = Math.min.apply(null, good) * 0.9, hi = Math.max.apply(null, good) * 1.05;
    function X(i) { return pad + i * (W - 2 * pad) / 3; }
    function Y(v) { return H - 14 - (v - lo) / (hi - lo) * (H - 26); }
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Test MAE across S1 to S4: " + vals.map(function (v, i) { return SCENS[i] + " " + f2(v); }).join(", ") });
    var pts = [];
    vals.forEach(function (v, i) { if (v != null) pts.push(X(i) + "," + Y(v)); });
    svg.appendChild(sv("polyline", { points: pts.join(" "), fill: "none", stroke: "var(--muted)", "stroke-width": 1.5 }));
    vals.forEach(function (v, i) {
      if (v == null) return;
      var on = SCENS[i] === cur;
      svg.appendChild(sv("circle", { cx: X(i), cy: Y(v), r: on ? 5.5 : 3.5, fill: on ? "var(--amber)" : "var(--panel)", stroke: on ? "var(--ink)" : "var(--muted)", "stroke-width": 2 }));
      svg.appendChild(sv("text", { x: X(i), y: H - 2, "text-anchor": "middle", class: "lab" }, SCENS[i]));
    });
    return svg;
  }

  function renderExplorer() {
    Object.keys(controls).forEach(function (k) { if (["season", "model", "mode"].indexOf(k) >= 0) controls[k](); });
    drawRail();
    var r = get(S.season, S.model, S.scen, S.mode);
    var img = document.getElementById("plotimg"), empty = document.getElementById("plotempty"), cap = document.getElementById("plotcap");
    var score = document.getElementById("score");
    var label = MODELS[S.model] + ", " + SCEN_TITLE[S.scen].toLowerCase() + ", " + MODES[S.mode].toLowerCase();
    score.innerHTML = "";
    if (!r || !r.complete) {
      img.hidden = true; empty.hidden = false;
      empty.textContent = "This run did not finish in the saved notebook (the feature search stopped part-way), so there is no forecast to show. Re-run the Monsoon notebook to produce it.";
      cap.textContent = D.dates[S.season] + ". " + label + ".";
      score.appendChild(el("h3", null, "No result"));
      score.appendChild(el("p", { class: "small" }, "The greedy search for this setup was interrupted. Its first ten steps are visible in the feature-selection section below."));
      return;
    }
    img.hidden = false; empty.hidden = true;
    img.src = r.img;
    img.alt = "Seven-day forecast for the " + S.season + " test week, " + D.dates[S.season] + ". " + label + ". The black line is measured power in MW; five dashed lines are the model revisions.";
    cap.textContent = S.season + " test week, " + D.dates[S.season] + ". " + label + ".";

    var t = stat(r, "MAE_test"), r2 = stat(r, "R2_test"), v = stat(r, "MAE_val"), tr = stat(r, "MAE_train");
    var A = el("div"), B = el("div"), C = el("div");
    A.appendChild(el("h3", null, "Test-week error"));
    A.appendChild(el("p", { class: "sub" }, S.scen + ", mean absolute error over 672 steps"));
    var big = el("div", { class: "big" }, f2(t.m)); big.appendChild(el("small", null, "MW"));
    A.appendChild(big);
    A.appendChild(el("div", { class: "range" }, "Revisions range from " + f2(t.lo) + " to " + f2(t.hi) + " MW"));

    if (S.scen !== "S1") {
      var b = stat(get(S.season, S.model, "S1", S.mode), "MAE_test");
      if (b) {
        var pct = (t.m - b.m) / b.m * 100;
        var d = el("div", { class: "delta " + (pct < 0 ? "good" : "bad") });
        d.textContent = (pct < 0 ? "Error is " + Math.abs(pct).toFixed(0) + "% lower" : "Error is " + pct.toFixed(0) + "% higher") + " than S1 (" + f2(b.m) + " MW)";
        A.appendChild(d);
      }
    } else {
      A.appendChild(el("div", { class: "delta" }, "S1 is the reference every other scenario is compared with"));
    }

    var sp = el("div", { class: "spark" });
    sp.appendChild(el("p", { class: "sub", style: "margin:0 0 .15rem" }, "Test MAE by scenario for this season, model and feature choice"));
    sp.appendChild(sparkline(S.season, S.model, S.mode, S.scen));
    B.appendChild(sp);

    var kv = el("dl", { class: "kv" });
    [["Test R²", f4(r2.m)], ["Validation MAE", f2(v.m) + " MW"], ["Training MAE", f2(tr.m) + " MW"], ["Features used", r.n_feat + " of " + r.n_pool]].forEach(function (p) {
      kv.appendChild(el("dt", null, p[0])); kv.appendChild(el("dd", null, p[1]));
    });
    B.appendChild(kv);

    if (r.mode === "Greedy" && r.selected) {
      C.appendChild(el("h3", null, "Features the search kept"));
      var ul = el("ul", { class: "chips" });
      r.selected.forEach(function (f) { ul.appendChild(el("li", null, f)); });
      C.appendChild(ul);
    } else {
      C.appendChild(el("h3", null, "Features used"));
      C.appendChild(el("p", { class: "small", style: "margin:0" }, "All " + r.n_pool + " features of " + S.scen + " (" + SCEN_TITLE[S.scen].toLowerCase() + ")."));
    }
    score.appendChild(A); score.appendChild(B); score.appendChild(C);
  }

  /* ---------- results charts ---------- */
  var LENS = {
    MAE_test: { label: "Test MAE", unit: "MW", fmt: f3, lower: true },
    MAE_val: { label: "Validation MAE", unit: "MW", fmt: f3, lower: true },
    MAE_train: { label: "Train MAE", unit: "MW", fmt: f3, lower: true },
    R2_test: { label: "Test R²", unit: "", fmt: f4, lower: false }
  };
  var lens = "MAE_test";
  var SERIES = [
    { model: "XGB", mode: "Standard", color: "var(--cobalt)", dash: "", hollow: false, name: "XGBoost, all features" },
    { model: "XGB", mode: "Greedy", color: "var(--cobalt)", dash: "5 4", hollow: true, name: "XGBoost, greedy" },
    { model: "RF", mode: "Standard", color: "var(--amber-ink)", dash: "", hollow: false, name: "Random Forest, all features" },
    { model: "RF", mode: "Greedy", color: "var(--amber-ink)", dash: "5 4", hollow: true, name: "Random Forest, greedy" }
  ];
  makeSeg("lens", Object.keys(LENS).map(function (k) { return { v: k, label: LENS[k].label }; }),
    function () { return lens; }, function (v, f) { lens = v; renderCharts(); if (f) refocus("lens"); });

  function niceTicks(lo, hi, n) {
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / n)));
    [1, 2, 2.5, 5, 10].some(function (m) { if (span / (step * m) <= n) { step *= m; return true; } return false; });
    var start = Math.floor(lo / step) * step, out = [];
    for (var x = start; x <= hi + step * 0.001; x += step) out.push(+x.toFixed(6));
    return out;
  }

  function renderLegend() {
    var lg = document.getElementById("legend");
    lg.innerHTML = "";
    SERIES.forEach(function (s) {
      var span = el("span");
      var svg = sv("svg", { viewBox: "0 0 34 12" });
      svg.appendChild(sv("line", { x1: 2, x2: 32, y1: 6, y2: 6, stroke: s.color, "stroke-width": 2, "stroke-dasharray": s.dash }));
      svg.appendChild(sv("circle", { cx: 17, cy: 6, r: 4, fill: s.hollow ? "var(--panel)" : s.color, stroke: s.color, "stroke-width": 2 }));
      span.appendChild(svg); span.appendChild(document.createTextNode(s.name));
      lg.appendChild(span);
    });
  }

  function renderCharts() {
    Object.keys(controls).forEach(function (k) { if (k === "lens") controls[k](); });
    var L = LENS[lens];
    var all = [];
    D.runs.forEach(function (r) { var s = stat(r, lens); if (s) { all.push(s.lo, s.hi); } });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var padv = (hi - lo) * 0.06; lo = lens === "R2_test" ? Math.max(0.85, lo - padv) : Math.max(0, lo - padv); hi = hi + padv;
    var ticks = niceTicks(lo, hi, 5);
    lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
    var host = document.getElementById("charts");
    host.innerHTML = "";
    var W = 340, H = 250, ml = 44, mr = 12, mt = 12, mb = 30;
    function X(i) { return ml + i * (W - ml - mr) / 3; }
    function Y(v) { return mt + (hi - v) / (hi - lo) * (H - mt - mb); }
    SEASONS.forEach(function (season) {
      var card = el("div", { class: "chart" });
      card.appendChild(el("h3", null, season + " (" + D.dates[season] + ")"));
      var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": L.label + " by scenario for " + season + ". Exact values are in the table below the charts." });
      var ax = sv("g", { class: "axis" });
      ticks.forEach(function (t) {
        if (t < lo - 1e-9 || t > hi + 1e-9) return;
        ax.appendChild(sv("line", { x1: ml, x2: W - mr, y1: Y(t), y2: Y(t), class: "gridline" }));
        ax.appendChild(sv("text", { x: ml - 6, y: Y(t) + 4, "text-anchor": "end" }, lens === "R2_test" ? t.toFixed(2) : t.toFixed(1)));
      });
      SCENS.forEach(function (sc, i) { ax.appendChild(sv("text", { x: X(i), y: H - 10, "text-anchor": "middle" }, sc)); });
      if (L.unit) ax.appendChild(sv("text", { x: 4, y: 10 }, L.unit));
      svg.appendChild(ax);
      SERIES.forEach(function (s) {
        var pts = [];
        SCENS.forEach(function (sc, i) {
          var run = get(season, s.model, sc, s.mode), st = stat(run, lens);
          if (!st) return;
          pts.push({ i: i, sc: sc, st: st });
        });
        var line = sv("polyline", { points: pts.map(function (p) { return X(p.i) + "," + Y(p.st.m); }).join(" "), fill: "none", stroke: s.color, "stroke-width": 2, "stroke-dasharray": s.dash });
        svg.appendChild(line);
        pts.forEach(function (p) {
          svg.appendChild(sv("line", { x1: X(p.i), x2: X(p.i), y1: Y(p.st.lo), y2: Y(p.st.hi), stroke: s.color, "stroke-width": 1.5, opacity: 0.55 }));
        });
        pts.forEach(function (p) {
          var c = sv("circle", { cx: X(p.i), cy: Y(p.st.m), r: 4.5, fill: s.hollow ? "var(--panel)" : s.color, stroke: s.color, "stroke-width": 2, tabindex: 0, role: "img" });
          var msg = season + " " + p.sc + ", " + s.name + ": " + L.fmt(p.st.m) + (L.unit ? " " + L.unit : "") + " (revisions " + L.fmt(p.st.lo) + " to " + L.fmt(p.st.hi) + ")";
          c.setAttribute("aria-label", msg);
          c.addEventListener("mouseenter", function () { showTip(c, msg); });
          c.addEventListener("focus", function () { showTip(c, msg); });
          c.addEventListener("mouseleave", hideTip); c.addEventListener("blur", hideTip);
          svg.appendChild(c);
        });
      });
      card.appendChild(svg);
      host.appendChild(card);
    });
    renderTable();
  }

  function renderTable() {
    var host = document.getElementById("restable");
    var t = el("table");
    var head = "<thead><tr><th>Season</th><th>Model</th><th>Features</th><th>Scenario</th><th class='num'>Inputs</th><th class='num'>Test MAE (MW)</th><th class='num'>Revision range</th><th class='num'>Test R²</th><th class='num'>Val MAE</th><th class='num'>Train MAE</th></tr></thead>";
    var rows = "";
    SEASONS.forEach(function (s) { ["XGB", "RF"].forEach(function (m) { ["Standard", "Greedy"].forEach(function (mo) { SCENS.forEach(function (sc) {
      var r = get(s, m, sc, mo), a = stat(r, "MAE_test");
      rows += "<tr><td>" + s + "</td><td>" + MODELS[m] + "</td><td>" + MODES[mo] + "</td><td>" + sc + "</td>" +
        (a ? "<td class='num'>" + r.n_feat + "</td><td class='num'>" + f3(a.m) + "</td><td class='num'>" + f3(a.lo) + " to " + f3(a.hi) + "</td><td class='num'>" + f4(stat(r, "R2_test").m) + "</td><td class='num'>" + f3(stat(r, "MAE_val").m) + "</td><td class='num'>" + f3(stat(r, "MAE_train").m) + "</td>"
          : "<td class='num' colspan='6'>run not finished in saved notebook</td>") + "</tr>";
    }); }); }); });
    t.innerHTML = head + "<tbody>" + rows + "</tbody>";
    host.innerHTML = ""; host.appendChild(t);
  }

  /* ---------- greedy selection explorer ---------- */
  var G = { season: "Summer", model: "XGB", scen: "S2" };
  makeSeg("s_season", SEASONS.map(function (s) { return { v: s, label: s }; }), function () { return G.season; }, function (v, f) { G.season = v; renderSelection(); if (f) refocus("s_season"); });
  makeSeg("s_model", Object.keys(MODELS).map(function (m) { return { v: m, label: MODELS[m] }; }), function () { return G.model; }, function (v, f) { G.model = v; renderSelection(); if (f) refocus("s_model"); });
  makeSeg("s_scen", SCENS.map(function (s) { return { v: s, label: s }; }), function () { return G.scen; }, function (v, f) { G.scen = v; renderSelection(); if (f) refocus("s_scen"); });

  function renderSelection() {
    ["s_season", "s_model", "s_scen"].forEach(function (k) { controls[k](); });
    var r = get(G.season, G.model, G.scen, "Greedy");
    var box = document.getElementById("selbox");
    box.innerHTML = "";
    var steps = r.steps || [];
    var maxV = Math.max.apply(null, steps.map(function (s) { return s.val_rmse; }));
    var sel = r.selected || [], pr = r.pruned || [];
    var head = el("p", { class: "sel-summary" });
    if (r.selected) {
      head.textContent = "Kept " + sel.length + " of " + steps.length + " features after " + (r.greedy_s ? Math.round(r.greedy_s) + " seconds of search" : "the search") + ". " + (pr.length ? "Removed by pruning: " + pr.join(", ") + "." : "No feature was removed by pruning.");
    } else {
      head.textContent = "This search stopped after " + steps.length + " steps in the saved notebook, so there is no final feature set. The steps that did run are shown.";
    }
    box.appendChild(head);
    var ol = el("ol", { class: "steps", "aria-label": "Greedy search steps" });
    steps.forEach(function (s) {
      var cls = sel.indexOf(s.feature) >= 0 ? "kept" : (pr.indexOf(s.feature) >= 0 ? "pruned" : "");
      var li = el("li", { class: cls + (s.best ? " best" : "") });
      li.appendChild(el("span", { class: "n" }, String(s.step)));
      li.appendChild(el("span", { class: "f", title: s.feature }, s.feature));
      var bar = el("span", { class: "bar" }); var i = el("i"); i.style.width = (s.val_rmse / maxV * 100) + "%"; bar.appendChild(i);
      li.appendChild(bar);
      li.appendChild(el("span", { class: "v" }, s.val_rmse.toFixed(3)));
      ol.appendChild(li);
    });
    box.appendChild(ol);
    box.appendChild(el("p", { class: "small", style: "margin:.8rem 0 0" }, "Validation RMSE is in MW, from the small, fast model used inside the search. Bars share one scale."));
  }

  /* ---------- error cases ---------- */
  var CASES = [
    { t: "A forecast that cannot see the weather misses cloud swings", s: { season: "Summer", model: "XGB", mode: "Standard", scen: "S1" },
      p: ["In the Summer week, measured output often swings between roughly 6 and 21 MW within an hour (9, 13 and 14 June especially). The S1 forecast is a smooth hump around 16 to 17.5 MW every day, because with no weather input the best it can do is reproduce the typical shape of a summer day.",
          "Mean test MAE is 1.07 MW. Giving the same model measured weather (S2) lowers it to 0.83 MW."] },
    { t: "On clear Winter days the peak runs low", s: { season: "Winter", model: "XGB", mode: "Greedy", scen: "S2" },
      p: ["Measured output peaks at 17 to 18 MW on most Winter days, while the forecasts flatten out at about 15.5 to 16.5 MW, a steady shortfall of roughly 1 to 2 MW around midday. The revisions also disagree on 11 and 12 February, where some drop to about 14.5 MW.",
          "The error is one-sided and smooth rather than noisy, which looks like bias. The mean bias error in the notebook code would measure it, but that number was not saved."] },
    { t: "Echoing yesterday instead of reading today", s: { season: "Monsoon", model: "RF", mode: "Greedy", scen: "S1" },
      p: ["This setup kept only three inputs: power one day earlier and the hour of day. On 11 to 14 October the real output is a smooth plateau near 18 MW, but the forecast is jagged and sits around 14 MW, as if carrying over the irregular shape of an earlier, cloudier day.",
          "It is the worst S1 result: test MAE 1.62 MW and R² 0.864, against 0.79 MW for the same model with all seven S1 features. It also shows how heavily this setup leans on the previous-day feature discussed under Limitations."] },
    { t: "With weather, cloudy days are tracked but clearing days overshoot", s: { season: "Monsoon", model: "XGB", mode: "Greedy", scen: "S4" },
      p: ["On 8 October the measured output jumps between about 6 and 20 MW, and the forecast follows most of those swings, as it does the sharp afternoon drop on 10 October. Some spikes are off by a few intervals in time or size.",
          "On 10 October around midday the forecast is roughly 1 to 1.5 MW above actual, and on 11 to 13 October it sits slightly above the plateau. Mean test MAE is 0.39 MW."] }
  ];
  function renderCases() {
    var host = document.getElementById("cases");
    CASES.forEach(function (c) {
      var r = get(c.s.season, c.s.model, c.s.scen, c.s.mode);
      var box = el("article", { class: "case" });
      var fig = el("figure", { style: "margin:0" });
      var img = el("img", { src: r.img, alt: c.s.season + " test week forecast, " + MODELS[c.s.model] + " " + c.s.scen + ", " + MODES[c.s.mode].toLowerCase() + ". " + c.t + ".", width: 1489, height: 590 });
      fig.appendChild(img);
      fig.appendChild(el("figcaption", { class: "small", style: "margin-top:.35rem" }, c.s.season + ", " + D.dates[c.s.season] + ". " + MODELS[c.s.model] + ", " + c.s.scen + ", " + MODES[c.s.mode].toLowerCase() + "."));
      box.appendChild(fig);
      var txt = el("div");
      txt.appendChild(el("h3", null, c.t));
      c.p.forEach(function (p) { txt.appendChild(el("p", null, p)); });
      var b = el("button", { type: "button", class: "btn ghost" }, "Open in the explorer");
      b.addEventListener("click", function () {
        S = { season: c.s.season, model: c.s.model, mode: c.s.mode, scen: c.s.scen };
        renderExplorer();
        document.getElementById("explorer").scrollIntoView();
        focusRail();
      });
      txt.appendChild(b);
      box.appendChild(txt);
      host.appendChild(box);
    });
  }

  /* ---------- leakage table ---------- */
  function renderLeak() {
    var t = document.getElementById("leaktable");
    var h = "<thead><tr><th>Season and model</th>";
    SCENS.forEach(function (sc) { h += "<th>" + sc + " all</th><th>" + sc + " greedy</th>"; });
    h += "</tr></thead><tbody>";
    SEASONS.forEach(function (s) { ["XGB", "RF"].forEach(function (m) {
      h += "<tr><td>" + s + ", " + MODELS[m] + "</td>";
      SCENS.forEach(function (sc) {
        h += "<td><span class='dot' title='lag_1d included' role='img' aria-label='uses lag_1d'></span></td>";
        var g = get(s, m, sc, "Greedy");
        if (!g.selected) h += "<td>n/a</td>";
        else if (g.selected.indexOf("lag_1d") >= 0) h += "<td><span class='dot' role='img' aria-label='uses lag_1d'></span></td>";
        else h += "<td><span class='dot off' role='img' aria-label='does not use lag_1d'></span></td>";
      });
      h += "</tr>";
    }); });
    t.innerHTML = h + "</tbody>";
  }

  /* ---------- contents highlight ---------- */
  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (!("IntersectionObserver" in window) || !links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute("aria-current"); });
          var a = map[e.target.id]; if (a) a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  renderExplorer();
  renderLegend();
  renderCharts();
  renderSelection();
  renderCases();
  renderLeak();
  initToc();
})();
