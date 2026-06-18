/* KILEYT — Suivi des bilans (organisation période fiscale) */
window.KScreens = window.KScreens || {};
window.KScreens.bilans = function (el, K) {
  // Notes stockées en mémoire le temps de la session (clé = id dossier)
  const notes = (window.__kBilanNotes = window.__kBilanNotes || {});
  const state = { filtre: "all" };
  const FILTRES = [["all", "Tous"], ["afaire", "À faire"], ["encours", "En cours"], ["depose", "Déposés"]];

  // Avancement déterministe par dossier (basé sur l'index → stable entre rendus)
  function avancement(d, i) {
    if (notes[d.id] && notes[d.id].force != null) return notes[d.id].force;
    const v = (i * 37 + 11) % 101; // 0..100, pseudo-aléatoire mais fixe
    return v;
  }
  function statutDe(pct) {
    if (pct >= 100) return "depose";
    if (pct > 0) return "encours";
    return "afaire";
  }
  const STAT_BADGE = { depose: "badge-success", encours: "badge-tva", afaire: "badge-warning" };
  const STAT_LABEL = { depose: "Déposé", encours: "En cours", afaire: "À faire" };

  // Exercice clos : pour une clôture passée dans l'année on retient 2025, sinon 2024 selon le mois
  function exercice(d) {
    const m = parseInt((d.cloture || "31/12").split("/")[1], 10) || 12;
    // clôtures jusqu'au 30/06 → exercice 2025 déjà clos ; au-delà → 2025 en cours, on suit 2024
    return m <= 6 ? "2025" : "2025";
  }

  function dossiersAvecPct() {
    return K.get("dossiers").map((d, i) => {
      const pct = avancement(d, i);
      return { d, i, pct, st: statutDe(pct) };
    });
  }

  // Clôtures proches : on convertit "31/12" en date 2026 et on mesure les jours restants
  function clotureDate(d) {
    const [jj, mm] = (d.cloture || "31/12").split("/").map(x => parseInt(x, 10));
    const y = 2026;
    const iso = `${y}-${String(mm).padStart(2, "0")}-${String(jj).padStart(2, "0")}`;
    return iso;
  }

  function rows() {
    let list = dossiersAvecPct();
    if (state.filtre !== "all") list = list.filter(r => r.st === state.filtre);
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Aucun bilan pour ce filtre.</div></td></tr>`;
    return list.map(({ d, pct, st }) => {
      const c = K.coll(d.gestionnaire);
      const note = notes[d.id] && notes[d.id].txt;
      const barColor = pct >= 100 ? "#16a34a" : pct >= 50 ? "#e3a008" : "#dc2626";
      return `
      <tr>
        <td class="dossier-cell">
          <span class="ava-sm" style="background:${c.couleur}">${c.initiales}</span>
          <div>${K.esc(d.nom)}<br><small class="muted" style="font-weight:500">${K.esc(d.siren || "")} · ${K.esc(d.forme || "")}</small></div>
        </td>
        <td style="font-weight:600">${K.esc(d.cloture || "31/12")}</td>
        <td>${exercice(d)}</td>
        <td style="min-width:160px">
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
          <small class="muted" style="font-weight:600">${pct}%</small>
          ${note ? `<br><small class="muted" style="font-style:normal">📝 ${K.esc(note)}</small>` : ""}
        </td>
        <td><span class="badge ${STAT_BADGE[st]}">${STAT_LABEL[st]}</span></td>
        <td style="text-align:right;white-space:nowrap">
          <button class="btn btn-outline btn-sm" data-note="${d.id}">📝 Note</button>
          ${st !== "depose" ? `<button class="btn btn-gold btn-sm" data-depose="${d.id}">Marquer déposé</button>` : ""}
        </td>
      </tr>`;
    }).join("");
  }

  function alertes() {
    const proches = K.get("dossiers")
      .map(d => ({ d, j: K.daysTo(clotureDate(d)) }))
      .filter(o => o.j >= -10 && o.j <= 45)
      .sort((a, b) => a.j - b.j)
      .slice(0, 6);
    if (!proches.length) return `<div class="empty">Aucune clôture proche.</div>`;
    return proches.map(({ d, j }) => {
      const lbl = j < 0 ? `<span class="badge badge-danger">Dépassée J${j}</span>`
        : j === 0 ? `<span class="badge badge-danger">Aujourd'hui</span>`
        : j <= 15 ? `<span class="badge badge-warning">J-${j}</span>`
        : `<span class="badge badge-muted">J-${j}</span>`;
      return `<div style="display:flex;align-items:center;gap:.7rem;padding:.55rem 0;border-bottom:1px solid hsl(var(--border))">
        <span class="ava-sm" style="background:${K.coll(d.gestionnaire).couleur}">${K.coll(d.gestionnaire).initiales}</span>
        <div style="flex:1"><b style="font-size:.9rem">${K.esc(d.nom)}</b><br><small class="muted">Clôture ${K.esc(d.cloture || "31/12")}</small></div>
        ${lbl}
      </div>`;
    }).join("");
  }

  function render() {
    const all = dossiersAvecPct();
    const nbAprod = all.length;
    const nbEncours = all.filter(r => r.st === "encours").length;
    const nbDepose = all.filter(r => r.st === "depose").length;

    el.innerHTML = `
    <div style="margin-bottom:1.2rem">
      <div style="font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:hsl(var(--gold,42 88% 57%));color:#e3a008;font-weight:800">Organisation période fiscale</div>
      <h2 style="font-size:1.6rem;margin-top:.2rem">Suivi des bilans</h2>
      <p class="muted">Pilotez la production des bilans et le respect des clôtures.</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-gold">📊</div><div><b>${nbAprod}</b><small>Bilans à produire</small></div></div>
      <div class="kpi"><div class="ki ki-blue">⚙️</div><div><b>${nbEncours}</b><small>En cours</small></div></div>
      <div class="kpi"><div class="ki ki-green">✓</div><div><b>${nbDepose}</b><small>Déposés</small></div></div>
    </div>

    <div class="col-2">
      <div class="panel">
        <div class="panel-head">
          <h3>Planning de production</h3>
          <div class="right"><div class="seg" id="filtreSeg">
            ${FILTRES.map(([v, l]) => `<button class="${v === state.filtre ? "on" : ""}" data-f="${v}">${l}</button>`).join("")}
          </div></div>
        </div>
        <table class="kt">
          <thead><tr><th>Dossier</th><th>Date de clôture</th><th>Exercice</th><th>Avancement</th><th>Statut</th><th></th></tr></thead>
          <tbody id="bilanRows">${rows()}</tbody>
        </table>
      </div>

      <div>
        <div class="panel">
          <div class="panel-head"><h3>⚠️ Clôtures proches</h3></div>
          <div class="panel-body">${alertes()}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Échéances légales</h3></div>
          <div class="panel-body">
            <p class="muted" style="font-size:.85rem;line-height:1.6">Le dépôt des comptes annuels au greffe est dû dans le mois suivant l'AGO (deux mois en cas de dépôt électronique). La liasse fiscale est attendue au plus tard le 2e jour ouvré suivant le 1er mai pour les clôtures au 31/12.</p>
            <button class="btn btn-navy btn-sm" id="rappelBtn" style="margin-top:.5rem">⏰ Programmer un rappel</button>
          </div>
        </div>
      </div>
    </div>`;

    el.querySelectorAll("#filtreSeg button").forEach(b => b.onclick = () => { state.filtre = b.dataset.f; render(); });

    el.querySelectorAll("[data-note]").forEach(b => b.onclick = () => {
      const id = b.dataset.note;
      const d = K.byId("dossiers", id);
      const prev = (notes[id] && notes[id].txt) || "";
      const v = window.prompt(`Note pour le bilan — ${d ? d.nom : ""}`, prev);
      if (v == null) return;
      notes[id] = Object.assign({}, notes[id], { txt: v.trim() });
      K.toast("Note enregistrée");
      render();
    });

    el.querySelectorAll("[data-depose]").forEach(b => b.onclick = () => {
      const id = b.dataset.depose;
      notes[id] = Object.assign({}, notes[id], { force: 100 });
      K.toast("Bilan marqué comme déposé ✓");
      render();
    });

    const rb = el.querySelector("#rappelBtn");
    if (rb) rb.onclick = () => K.toast("Rappel programmé (démo)");
  }

  render();
};
