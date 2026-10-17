/* =========================================================================
   Yalcin — Offerte wizard (multi-item per dienst)
   Vanilla JS, no build step.
   Aanvragen worden verstuurd naar MAIL_TO via FormSubmit (formsubmit.co).
   Bij de allereerste aanvraag stuurt FormSubmit een bevestigingsmail naar dat adres; die moet eenmalig worden bevestigd.
   ========================================================================= */
(function () {
  "use strict";

  var MAIL_TO = "info@yalcininterieur.nl";

  var SERVICES = {
    vloeren:         { label: "Vloeren",                  icon: "01", item: "Vloer",          addLabel: "Nog een vloer toevoegen",        addable: true },
    traprenovatie:   { label: "Traprenovatie",            icon: "02", item: "Trap",           addLabel: "Nog een trap toevoegen",         addable: true },
    gordijnen:       { label: "Gordijnen",                icon: "03", item: "Raam / set",     addLabel: "Nog een raam toevoegen",         addable: true },
    raamdecoratie:   { label: "Raamdecoratie",            icon: "04", item: "Raam",           addLabel: "Nog een raam toevoegen",         addable: true },
    woninginrichting:{ label: "Complete woninginrichting",icon: "05", item: "Woning",         addLabel: "",                               addable: false }
  };

  // Field label maps for the summary (order matters)
  var FIELD_LABELS = {
    vloer_type: "Type", vloer_ruimtes: "Aantal ruimtes", vloer_m2: "Oppervlakte (m²)",
    vloer_verwijderen: "Oude vloer verwijderen", vloer_ondervloer: "Ondervloer / egaliseren",
    trap_treden: "Aantal treden", trap_type: "Type trap", trap_afwerking: "Afwerking",
    trap_wangen: "Trapwangen", trap_stootborden: "Stootborden", trap_ondervloer: "Ondervloer", trap_extra: "Extra’s",
    gord_type: "Type", gord_ramen: "Aantal ramen", gord_rails: "Rails aanwezig", gord_maten: "Afmetingen",
    raam_type: "Type", raam_aantal: "Aantal ramen", raam_bediening: "Bediening",
    won_onderdelen: "Onderdelen", won_omschrijving: "Omschrijving"
  };

  var STEP_NAMES = ["Dienst", "Details", "Planning", "Uw gegevens", "Overzicht"];
  var state = { step: 0, services: [] };
  var totalSteps = 5;
  var uidCounter = 0;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- field builders (uid-scoped names) ---------------- */
  function fieldWrap(inner) { return '<div class="q-field">' + inner + '</div>'; }
  function row(a, b) { return '<div class="q-row">' + a + b + '</div>'; }

  function chipField(field, label, hint, opts, multi, uid) {
    var inputs = opts.map(function (o) {
      return '<label class="q-chip"><input type="' + (multi ? "checkbox" : "radio") + '" name="' + field + uid + '" value="' + o + '">' + o + '</label>';
    }).join("");
    return fieldWrap('<label class="q-label">' + label + (hint ? ' <span class="hint">' + hint + '</span>' : '') + '</label>' +
      '<div class="q-chips" data-field="' + field + '" data-multi="' + (multi ? 1 : 0) + '">' + inputs + '</div>');
  }
  function toggleField(field, label, hint, uid) {
    return fieldWrap('<label class="q-label">' + label + (hint ? ' <span class="hint">' + hint + '</span>' : '') + '</label>' +
      '<div class="q-chips q-toggle" data-field="' + field + '" data-multi="0">' +
      '<label class="q-chip"><input type="radio" name="' + field + uid + '" value="Ja">Ja</label>' +
      '<label class="q-chip"><input type="radio" name="' + field + uid + '" value="Nee">Nee</label></div>');
  }
  function stepperField(field, label, hint, val, min) {
    return fieldWrap('<label>' + label + (hint ? ' <span class="hint">' + hint + '</span>' : '') + '</label>' +
      '<div class="q-stepper" data-stepper data-min="' + (min || 0) + '">' +
      '<button type="button" data-dec aria-label="min">–</button>' +
      '<input type="number" data-field="' + field + '" value="' + val + '" min="' + (min || 0) + '" inputmode="numeric">' +
      '<button type="button" data-inc aria-label="plus">+</button></div>');
  }
  function textField(field, label, hint, ph, type) {
    return fieldWrap('<label>' + label + (hint ? ' <span class="hint">' + hint + '</span>' : '') + '</label>' +
      '<input class="q-input" type="' + (type || "text") + '" data-field="' + field + '" placeholder="' + ph + '"' + (type === "number" ? ' inputmode="numeric"' : '') + '>');
  }
  function textareaField(field, label, hint, ph) {
    return fieldWrap('<label>' + label + (hint ? ' <span class="hint">' + hint + '</span>' : '') + '</label>' +
      '<textarea class="q-textarea" data-field="' + field + '" placeholder="' + ph + '"></textarea>');
  }

  /* ---------------- item fields per service ---------------- */
  function itemFields(service, uid) {
    if (service === "vloeren") {
      return chipField("vloer_type", "Welk type vloer?", "", ["PVC", "Laminaat", "Tapijt", "Weet ik nog niet"], true, uid) +
        row(stepperField("vloer_ruimtes", "Aantal ruimtes", "", 1, 1),
            textField("vloer_m2", "Oppervlakte", "in m² (schatting)", "bijv. 45", "number")) +
        row(toggleField("vloer_verwijderen", "Huidige vloer verwijderen?", "", uid),
            chipField("vloer_ondervloer", "Ondervloer / egaliseren?", "ook voor tapijt", ["Ja", "Nee", "Geen idee"], false, uid));
    }
    if (service === "traprenovatie") {
      return stepperField("trap_treden", "Aantal treden", "incl. overloop", 13, 1) +
        row(chipField("trap_type", "Type trap", "", ["Dichte trap", "Open trap"], false, uid),
            chipField("trap_afwerking", "Gewenste afwerking", "", ["Hout / fineer", "Laminaat", "PVC", "Tapijt / loper"], false, uid)) +
        row(toggleField("trap_wangen", "Trapwangen meenemen?", "de zijkanten", uid),
            toggleField("trap_stootborden", "Stootborden meenemen?", "de verticale delen", uid)) +
        row(toggleField("trap_ondervloer", "Ondervloer meenemen?", "bij tapijt / loper", uid),
            chipField("trap_extra", "Extra’s", "", ["LED-verlichting", "Anti-slip", "Nieuwe leuning"], true, uid));
    }
    if (service === "gordijnen") {
      return chipField("gord_type", "Welk type gordijnen?", "", ["Inbetweens", "Overgordijnen", "Vouwgordijnen"], true, uid) +
        row(stepperField("gord_ramen", "Aantal ramen", "", 1, 1),
            toggleField("gord_rails", "Rails of roede aanwezig?", "", uid)) +
        textField("gord_maten", "Afmetingen", "breedte × hoogte, indien bekend", "bijv. 240 × 270 cm");
    }
    if (service === "raamdecoratie") {
      return chipField("raam_type", "Welk type raamdecoratie?", "", ["Jaloezieën", "Shutters", "Rolgordijnen", "Plissé"], true, uid) +
        row(stepperField("raam_aantal", "Aantal ramen", "", 1, 1),
            chipField("raam_bediening", "Bediening", "", ["Handmatig", "Elektrisch", "Geen voorkeur"], false, uid));
    }
    if (service === "woninginrichting") {
      return chipField("won_onderdelen", "Welke onderdelen?", "", ["Vloeren", "Trap", "Gordijnen", "Raamdecoratie", "Advies / styling"], true, uid) +
        textareaField("won_omschrijving", "Vertel ons over de woning", "type, aantal ruimtes, wensen", "bijv. nieuwbouw appartement, 3 kamers, warme natuurlijke uitstraling…");
    }
    return "";
  }

  /* ---------------- step navigation ---------------- */
  function showStep(n) {
    state.step = Math.max(0, Math.min(totalSteps - 1, n));
    $$(".q-step").forEach(function (el, i) { el.classList.toggle("active", i === state.step); });
    $("#step-success").classList.remove("active");
    $$(".q-step-item").forEach(function (el, i) {
      el.classList.toggle("active", i === state.step);
      el.classList.toggle("done", i < state.step);
    });
    var fill = $(".q-mobilebar .fill");
    if (fill) fill.style.width = ((state.step + 1) / totalSteps * 100) + "%";
    var mlbl = $(".q-mobilebar .mlbl");
    if (mlbl) mlbl.textContent = "Stap " + (state.step + 1) + " van " + totalSteps + " — " + STEP_NAMES[state.step];

    if (state.step === 1) buildDetailPanels();
    if (state.step === 4) buildSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function next() { if (validateStep(state.step)) showStep(state.step + 1); }
  function prev() { showStep(state.step - 1); }

  /* ---------------- step 0: service selection ---------------- */
  function initServiceCards() {
    $$(".q-card[data-service]").forEach(function (card) {
      card.addEventListener("click", function (e) {
        e.preventDefault();
        var key = card.getAttribute("data-service");
        var input = $("input", card);
        var idx = state.services.indexOf(key);
        if (idx >= 0) { state.services.splice(idx, 1); card.classList.remove("sel"); input.checked = false; }
        else { state.services.push(key); card.classList.add("sel"); input.checked = true; }
        $("#svc-error").classList.remove("show");
      });
    });
  }

  /* ---------------- step 1: panels + items ---------------- */
  function addItem(service, itemsHost) {
    var svc = SERVICES[service];
    var uid = "__" + service + "_" + (++uidCounter);
    var count = itemsHost.children.length + 1;
    var item = document.createElement("div");
    item.className = "q-item"; item.setAttribute("data-item-service", service); item.setAttribute("data-uid", uid);
    item.innerHTML =
      '<div class="q-item-head"><span class="q-item-n">' + svc.item + ' ' + count + '</span>' +
      '<button type="button" class="q-item-remove"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg> Verwijderen</button></div>' +
      itemFields(service, uid);
    itemsHost.appendChild(item);
    wireChips(item); wireSteppers(item);
    $(".q-item-remove", item).addEventListener("click", function () {
      item.remove(); renumber(itemsHost, svc.item);
    });
    renumber(itemsHost, svc.item);
  }
  function renumber(host, itemLabel) {
    $$(".q-item", host).forEach(function (it, i) { $(".q-item-n", it).textContent = itemLabel + " " + (i + 1); });
  }

  function buildDetailPanels() {
    var host = $("#detail-panels");
    // remove panels for deselected services
    $$(".q-panel[data-panel]", host).forEach(function (p) {
      if (state.services.indexOf(p.getAttribute("data-panel")) < 0) p.remove();
    });
    if (!state.services.length) { host.innerHTML = '<p class="q-help">Selecteer eerst een dienst in de vorige stap.</p>'; return; }
    if (host.querySelector(".q-help")) host.innerHTML = "";

    Object.keys(SERVICES).forEach(function (key) {
      if (state.services.indexOf(key) < 0) return;
      if (host.querySelector('.q-panel[data-panel="' + key + '"]')) return; // keep existing
      var svc = SERVICES[key];
      var p = document.createElement("div");
      p.className = "q-panel"; p.setAttribute("data-panel", key);
      p.innerHTML =
        '<div class="q-panel-title"><span class="tag">' + svc.icon + '</span><h4>' + svc.label + '</h4></div>' +
        '<div class="q-items"></div>' +
        (svc.addable ? '<button type="button" class="q-additem"><span class="plus">+</span> ' + svc.addLabel + '</button>' : '');
      host.appendChild(p);
      var itemsHost = $(".q-items", p);
      addItem(key, itemsHost);
      var addBtn = $(".q-additem", p);
      if (addBtn) addBtn.addEventListener("click", function () { addItem(key, itemsHost); });
    });
  }

  /* ---------------- chips & steppers ---------------- */
  function wireChips(scope) {
    $$(".q-chips", scope).forEach(function (group) {
      var multi = group.getAttribute("data-multi") === "1";
      $$(".q-chip", group).forEach(function (chip) {
        chip.addEventListener("click", function (e) {
          e.preventDefault();
          var input = $("input", chip);
          if (!multi) {
            $$(".q-chip", group).forEach(function (c) { c.classList.remove("sel"); var i = $("input", c); if (i) i.checked = false; });
            chip.classList.add("sel"); input.checked = true;
          } else { input.checked = chip.classList.toggle("sel"); }
        });
      });
    });
  }
  function wireSteppers(scope) {
    $$("[data-stepper]", scope).forEach(function (st) {
      var input = $("input", st);
      var min = parseInt(st.getAttribute("data-min") || "0", 10);
      $("[data-dec]", st).addEventListener("click", function () { input.value = Math.max(min, (parseInt(input.value, 10) || min) - 1); });
      $("[data-inc]", st).addEventListener("click", function () { input.value = (parseInt(input.value, 10) || min) + 1; });
    });
  }

  /* ---------------- collection ---------------- */
  function collectItem(itemEl) {
    var out = [];
    $$("[data-field]", itemEl).forEach(function (el) {
      var f = el.getAttribute("data-field");
      var val = "";
      if (el.classList.contains("q-chips")) {
        val = $$("input:checked", el).map(function (i) { return i.value; }).join(", ");
      } else { val = (el.value || "").trim(); }
      if (val) out.push({ key: f, label: FIELD_LABELS[f] || f, value: val });
    });
    return out;
  }
  function collectField(name) { var f = $('[name="' + name + '"]'); return f ? f.value.trim() : ""; }
  function collectGroup(name) { return $$('[name="' + name + '"]:checked').map(function (i) { return i.value; }).join(", "); }

  function collectServices() {
    var result = [];
    state.services.forEach(function (key) {
      var panel = $('.q-panel[data-panel="' + key + '"]');
      if (!panel) return;
      var items = $$(".q-item", panel).map(function (it) { return collectItem(it); });
      result.push({ key: key, label: SERVICES[key].label, itemLabel: SERVICES[key].item, items: items });
    });
    return result;
  }

  /* ---------------- summary ---------------- */
  function buildSummary() {
    var host = $("#summary-rows");
    var rows = [];

    var services = collectServices();
    var svcHtml = services.map(function (s) {
      var itemsHtml = s.items.map(function (item, i) {
        var fields = item.map(function (f) { return '<span style="color:var(--ink-faint)">' + f.label + ':</span> ' + f.value; }).join(" &nbsp;·&nbsp; ");
        var head = s.items.length > 1 ? '<span class="ii">' + s.itemLabel + ' ' + (i + 1) + '</span>' : '';
        return '<span class="q-sum-item">' + head + (fields || "—") + '</span>';
      }).join("");
      return '<span class="q-sum-svc">' + s.label + (s.items.length > 1 ? ' (' + s.items.length + '×)' : '') + '</span>' + itemsHtml;
    }).join("");
    rows.push(sumRow("Diensten", svcHtml || "—", 0));

    var planning = [];
    addp(planning, "Wanneer", collectGroup("planning_termijn"));
    addp(planning, "Budget", collectGroup("planning_budget"));
    addp(planning, "Opmerking", collectField("planning_opm"));
    rows.push(sumRow("Planning", planning.join("") || "—", 2));

    var contact = [];
    addp(contact, "Naam", collectField("naam"));
    addp(contact, "E-mail", collectField("email"));
    addp(contact, "Telefoon", collectField("telefoon"));
    addp(contact, "Adres", [collectField("adres"), collectField("postcode"), collectField("plaats")].filter(Boolean).join(", "));
    rows.push(sumRow("Contact", contact.join("") || "—", 3));

    host.innerHTML = rows.join("");
    $$(".edit", host).forEach(function (b) { b.addEventListener("click", function () { showStep(parseInt(b.getAttribute("data-goto"), 10)); }); });
  }
  function addp(arr, k, v) { if (v) arr.push('<span class="item"><span style="color:var(--ink-faint)">' + k + ':</span> ' + v + '</span>'); }
  function sumRow(k, v, goto) {
    return '<div class="q-sum-row"><span class="k">' + k + '</span><span class="v">' + v + '</span>' +
      '<button type="button" class="edit" data-goto="' + goto + '">Wijzig</button></div>';
  }

  /* ---------------- validation ---------------- */
  function validateStep(n) {
    if (n === 0) { if (!state.services.length) { $("#svc-error").classList.add("show"); return false; } return true; }
    if (n === 3) {
      var ok = true;
      ["naam", "email", "telefoon"].forEach(function (name) {
        var f = $('[name="' + name + '"]'); if (!f) return;
        var valid = f.value.trim().length > 1;
        if (name === "email") valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim());
        f.classList.toggle("err", !valid); if (!valid) ok = false;
      });
      $("#contact-error").classList.toggle("show", !ok);
      return ok;
    }
    return true;
  }

  /* ---------------- submit ---------------- */
  function buildPayload() {
    var lines = [];
    collectServices().forEach(function (s) {
      s.items.forEach(function (item, i) {
        var head = s.label + (s.items.length > 1 ? " — " + s.itemLabel + " " + (i + 1) : "");
        lines.push(head + ": " + item.map(function (f) { return f.label + " = " + f.value; }).join("; "));
      });
    });
    return {
      subject: "Nieuwe offerteaanvraag — Yalcin",
      diensten: state.services.map(function (k) { return SERVICES[k].label; }).join(", "),
      details: lines.join("\n"),
      planning: collectGroup("planning_termijn"), budget: collectGroup("planning_budget"), opmerking: collectField("planning_opm"),
      naam: collectField("naam"), email: collectField("email"), telefoon: collectField("telefoon"),
      adres: collectField("adres"), postcode: collectField("postcode"), plaats: collectField("plaats")
    };
  }

  function submit() {
    if (!validateStep(3)) { showStep(3); return; }
    var btn = $("#q-submit"); btn.disabled = true; btn.textContent = "Versturen…";
    var data = buildPayload();
    function done() {
      $$(".q-step").forEach(function (e) { e.classList.remove("active"); });
      $("#step-success").classList.add("active");
      $$(".q-step-item").forEach(function (e) { e.classList.add("done"); e.classList.remove("active"); });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    var body = {
      _subject: data.subject,
      _template: "table",
      _captcha: "false",
      _replyto: data.email,
      Diensten: data.diensten,
      Details: data.details,
      Planning: data.planning,
      Budget: data.budget,
      Opmerking: data.opmerking,
      Naam: data.naam,
      "E-mail": data.email,
      Telefoon: data.telefoon,
      Adres: data.adres,
      Postcode: data.postcode,
      Plaats: data.plaats
    };
    fetch("https://formsubmit.co/ajax/" + MAIL_TO, {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body)
    }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (j) { if (j && (j.success === false || j.success === "false")) throw new Error("niet verstuurd"); done(); })
      .catch(function () {
        btn.disabled = false; btn.innerHTML = "Aanvraag versturen <span class=\"arr\">→</span>";
        var err = $("#q-submit-error");
        if (!err) { err = document.createElement("p"); err.id = "q-submit-error"; err.style.cssText = "color:#b3261e;font-size:.88rem;margin-top:12px"; btn.parentNode.appendChild(err); }
        err.textContent = "Versturen is niet gelukt. Probeer het later opnieuw of bel ons op 070 390 7020.";
      });
  }

  /* ---------------- init ---------------- */
  function init() {
    initServiceCards();
    $$("[data-next]").forEach(function (b) { b.addEventListener("click", next); });
    $$("[data-prev]").forEach(function (b) { b.addEventListener("click", prev); });
    wireChips($("#step-planning"));
    var sub = $("#q-submit"); if (sub) sub.addEventListener("click", submit);
    showStep(0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
