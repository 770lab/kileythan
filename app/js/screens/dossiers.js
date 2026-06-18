/* KILEYT — Liste des dossiers (clients) */
window.KScreens = window.KScreens || {};
window.KScreens.dossiers = function (el, K) {
  const state = { q: "", equipe: "all" };
  const equipes = K.get("equipes");

  function rows() {
    let list = K.get("dossiers");
    if (state.q) list = list.filter(d => (d.nom + " " + d.siren + " " + d.secteur).toLowerCase().includes(state.q.toLowerCase()));
    if (state.equipe !== "all") list = list.filter(d => d.equipe === state.equipe);
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Aucun dossier.</div></td></tr>`;
    return list.map(d => {
      const ech = K.get("echeances").filter(e => e.dossier === d.id).length;
      const c = K.coll(d.gestionnaire);
      return `<tr style="cursor:pointer" data-go="${d.id}">
        <td class="dossier-cell"><span class="ava-sm" style="background:${c.couleur}">${c.initiales}</span>
          <div><b>${K.esc(d.nom)}</b><br><small class="muted" style="font-weight:500">${K.esc(d.siren)} · ${K.esc(d.forme)}</small></div></td>
        <td><span class="badge badge-muted">${K.esc(d.secteur)}</span></td>
        <td>${K.esc(d.regime)}</td>
        <td>Clôture ${K.esc(d.cloture)}</td>
        <td style="text-align:right;font-weight:700">${K.esc(d.ca)}</td>
        <td style="text-align:right">${ech} échéance${ech > 1 ? "s" : ""} <span style="color:hsl(var(--text-light))">›</span></td>
      </tr>`;
    }).join("");
  }

  function render() {
    el.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-gold">📁</div><div><b>${K.get("dossiers").length}</b><small>Dossiers actifs</small></div></div>
      <div class="kpi"><div class="ki ki-blue">🏢</div><div><b>${new Set(K.get("dossiers").map(d => d.secteur)).size}</b><small>Secteurs</small></div></div>
      <div class="kpi"><div class="ki ki-green">🧩</div><div><b>${equipes.length}</b><small>Équipes</small></div></div>
      <div class="kpi"><div class="ki ki-purple">👥</div><div><b>${K.get("collaborateurs").length}</b><small>Collaborateurs</small></div></div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <h3>Tous les dossiers</h3>
        <div class="right">
          <div class="chips" id="eqChips">
            <span class="chip ${state.equipe === "all" ? "on" : ""}" data-eq="all">Toutes équipes</span>
            ${equipes.map(e => `<span class="chip ${state.equipe === e.id ? "on" : ""}" data-eq="${e.id}">${K.esc(e.nom)}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="panel-body" style="border-bottom:1px solid hsl(var(--border))">
        <div class="field" style="margin:0;max-width:340px"><input id="dq" placeholder="Rechercher un dossier, un SIREN…" value="${K.esc(state.q)}"></div>
      </div>
      <table class="kt">
        <thead><tr><th>Dossier</th><th>Secteur</th><th>Régime</th><th>Exercice</th><th style="text-align:right">CA</th><th style="text-align:right">Échéances</th></tr></thead>
        <tbody id="dRows">${rows()}</tbody>
      </table>
    </div>
    <p class="muted" style="text-align:center;font-size:.85rem">👆 Cliquez sur un dossier pour ouvrir sa fiche, importer une pièce et lancer l'analyse IA.</p>`;

    el.querySelectorAll("[data-go]").forEach(tr => tr.onclick = () => { location.hash = "#/dossier?id=" + tr.dataset.go; });
    el.querySelectorAll("#eqChips .chip").forEach(c => c.onclick = () => { state.equipe = c.dataset.eq; render(); });
    const q = el.querySelector("#dq");
    q.oninput = () => { state.q = q.value; const tb = el.querySelector("#dRows"); tb.innerHTML = rows(); el.querySelectorAll("[data-go]").forEach(tr => tr.onclick = () => { location.hash = "#/dossier?id=" + tr.dataset.go; }); };
  }
  render();
};
