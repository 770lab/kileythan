/* KILEYT — Synthèse des échéances (vue agrégée + graphes) */
window.KScreens = window.KScreens || {};
window.KScreens.synthese = function (el, K) {
  const state = { periode: "annee", group: "type" };
  const PERIODES = [["mois", "Mois"], ["trimestre", "Trimestre"], ["annee", "Année"]];
  const GROUPES = [["type", "Par type"], ["client", "Par client"], ["coll", "Par collaborateur"]];

  // Filtre temporel sur la liste des échéances (référence 2026-06-18)
  function filtered() {
    const all = K.get("echeances");
    if (state.periode === "annee") return all;
    if (state.periode === "trimestre") return all.filter(e => { const j = K.daysTo(e.date); return j != null && j >= -90 && j <= 90; });
    return all.filter(e => { const j = K.daysTo(e.date); return j != null && j >= -31 && j <= 31; });
  }

  // Construit les buckets selon le regroupement choisi
  function buckets(list) {
    const map = {};
    list.forEach(e => {
      let key, label, color;
      if (state.group === "type") { key = e.type; label = e.type; color = "#0d1b2e"; }
      else if (state.group === "client") { key = e.dossier; label = K.dossierNom(e.dossier); color = K.coll(K.dossier(e.dossier).gestionnaire).couleur; }
      else { key = e.coll; label = K.coll(e.coll).nom; color = K.coll(e.coll).couleur; }
      if (!map[key]) map[key] = { key, label, color, n: 0, valide: 0, attente: 0, retard: 0, type: e.type };
      map[key].n++;
      if (e.statut === "valide") map[key].valide++;
      else if (e.statut === "retard") map[key].retard++;
      else map[key].attente++;
    });
    return Object.values(map).sort((a, b) => b.n - a.n);
  }

  function render() {
    const list = filtered();
    const total = list.length;
    const nbValide = list.filter(e => e.statut === "valide").length;
    const nbAttente = list.filter(e => e.statut === "attente" || e.statut === "encours").length;
    const nbRetard = list.filter(e => e.statut === "retard").length;

    // Répartition par type (toujours par type pour le graphe en barres)
    const byType = {};
    list.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
    const typeRows = Object.entries(byType).sort((a, b) => b[1] - a[1]);
    const maxType = typeRows.reduce((m, t) => Math.max(m, t[1]), 0) || 1;

    // Activité par collaborateur
    const colls = K.get("collaborateurs");
    const maxColl = colls.reduce((m, c) => Math.max(m, list.filter(e => e.coll === c.id).length), 0) || 1;

    // Regroupement détaillé (table de synthèse)
    const grp = buckets(list);
    const maxGrp = grp.reduce((m, g) => Math.max(m, g.n), 0) || 1;

    el.innerHTML = `
    <div style="margin-bottom:1.2rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-end">
      <div><h2 style="font-size:1.6rem">Synthèse des échéances</h2><p class="muted">Vue agrégée de la charge fiscale du cabinet.</p></div>
      <div class="right" style="margin-left:auto;display:flex;gap:.6rem;align-items:center">
        <div class="seg" id="perSeg">${PERIODES.map(([v, l]) => `<button class="${v === state.periode ? "on" : ""}" data-per="${v}">${l}</button>`).join("")}</div>
        <button class="btn btn-navy btn-sm" id="exportBtn">⬇ Exporter Excel</button>
      </div>
    </div>

    <div style="margin-bottom:1rem"><small class="muted" style="font-weight:700">Regrouper</small>
      <div class="chips" id="grpChips" style="margin-top:.3rem">
        ${GROUPES.map(([v, l]) => `<span class="chip ${v === state.group ? "on" : ""}" data-grp="${v}">${l}</span>`).join("")}
      </div></div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-blue">📊</div><div><b>${total}</b><small>Total échéances</small></div></div>
      <div class="kpi"><div class="ki ki-green">✓</div><div><b>${nbValide}</b><small>Validées</small></div></div>
      <div class="kpi"><div class="ki ki-gold">⏳</div><div><b>${nbAttente}</b><small>En attente</small></div></div>
      <div class="kpi"><div class="ki ki-red">⏰</div><div><b>${nbRetard}</b><small>En retard</small></div></div>
    </div>

    <div class="col-2">
      <div class="panel">
        <div class="panel-head"><h3>Répartition par type</h3><div class="right"><span class="muted" style="font-size:.8rem">Cliquez une barre</span></div></div>
        <div class="panel-body">
          ${typeRows.length ? `<div class="vbars">
            ${typeRows.map(([t, n]) => `
              <div class="vbar" data-type="${K.esc(t)}" style="height:${Math.round((n / maxType) * 100)}%;cursor:pointer">
                <span class="v">${n}</span>
                <span class="badge ${K.typeBadge[t] || "badge-muted"}" style="margin-top:.4rem">${K.esc(t)}</span>
              </div>`).join("")}
          </div>` : `<div class="empty">Aucune échéance sur cette période.</div>`}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>Activité par collaborateur</h3></div>
        <div class="panel-body" style="display:flex;flex-direction:column;gap:.9rem">
          ${colls.map(c => {
            const mine = list.filter(e => e.coll === c.id);
            const n = mine.length;
            const v = mine.filter(e => e.statut === "valide").length;
            const a = mine.filter(e => e.statut === "attente" || e.statut === "encours").length;
            const pct = Math.round((n / maxColl) * 100);
            return `<div style="display:flex;align-items:center;gap:.7rem">
              <span class="ava-sm" style="background:${c.couleur}">${K.esc(c.initiales)}</span>
              <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:baseline">
                  <strong style="font-size:.9rem">${K.esc(c.nom)}</strong>
                  <small class="muted">${n} éch. · <span style="color:#16a34a;font-weight:700">${v} val.</span> / <span style="color:#d97706;font-weight:700">${a} att.</span></small>
                </div>
                <div class="bar-track" style="margin-top:.3rem"><div class="bar-fill" style="width:${pct}%;background:${c.couleur}"></div></div>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Détail — ${GROUPES.find(g => g[0] === state.group)[1].toLowerCase()}</h3>
        <div class="right"><span class="muted" style="font-size:.8rem">${total} échéance${total > 1 ? "s" : ""}</span></div></div>
      <table class="kt">
        <thead><tr><th>${state.group === "type" ? "Type" : state.group === "client" ? "Client" : "Collaborateur"}</th><th>Volume</th><th style="text-align:center">Total</th><th style="text-align:center">Validées</th><th style="text-align:center">En attente</th><th style="text-align:center">En retard</th></tr></thead>
        <tbody>
          ${grp.length ? grp.map(g => `<tr>
            <td>${state.group === "type"
              ? `<span class="badge ${K.typeBadge[g.label] || "badge-muted"}">${K.esc(g.label)}</span>`
              : `<span class="dossier-cell"><span class="ava-sm" style="background:${g.color}">${state.group === "coll" ? K.esc(K.coll(g.key).initiales) : K.esc(K.coll(K.dossier(g.key).gestionnaire).initiales)}</span>${K.esc(g.label)}</span>`}</td>
            <td style="min-width:160px"><div class="bar-track"><div class="bar-fill" style="width:${Math.round((g.n / maxGrp) * 100)}%"></div></div></td>
            <td style="text-align:center;font-weight:700">${g.n}</td>
            <td style="text-align:center"><span class="badge badge-success">${g.valide}</span></td>
            <td style="text-align:center"><span class="badge badge-warning">${g.attente}</span></td>
            <td style="text-align:center">${g.retard ? `<span class="badge badge-danger">${g.retard}</span>` : `<span class="muted">0</span>`}</td>
          </tr>`).join("") : `<tr><td colspan="6"><div class="empty">Aucune donnée pour ces filtres.</div></td></tr>`}
        </tbody>
      </table>
    </div>`;

    el.querySelectorAll("#perSeg button").forEach(b => b.onclick = () => { state.periode = b.dataset.per; render(); });
    el.querySelectorAll("#grpChips .chip").forEach(c => c.onclick = () => { state.group = c.dataset.grp; render(); });
    el.querySelectorAll(".vbar[data-type]").forEach(v => v.onclick = () => K.toast(`Zoom sur les ${v.dataset.type} →`));
    el.querySelector("#exportBtn").onclick = () => K.toast("Synthèse exportée vers Excel (démo) ✓");
  }

  render();
};
