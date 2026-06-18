/* KILEYT — GED et pièces manquantes */
window.KScreens = window.KScreens || {};
window.KScreens.ged = function (el, K) {
  const state = { q: "", type: "all", manquant: false };
  const TYPES = [["all", "Tous"], ["Fiscal", "Fiscal"], ["Banque", "Banque"], ["Juridique", "Juridique"], ["Pièce", "Pièce"]];
  const ICONES = { Fiscal: "📄", Banque: "🏦", Juridique: "⚖️", "Pièce": "📎" };

  function filtered() {
    let list = K.get("documents").slice();
    if (state.type !== "all") list = list.filter(d => d.type === state.type);
    if (state.manquant) list = list.filter(d => d.statut === "manquant");
    if (state.q.trim()) {
      const q = state.q.trim().toLowerCase();
      list = list.filter(d =>
        (d.nom || "").toLowerCase().includes(q) ||
        (K.dossierNom(d.dossier) || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function rows() {
    const list = filtered();
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Aucun document ne correspond à ces critères.</div></td></tr>`;
    return list.map(d => {
      const icone = ICONES[d.type] || "📄";
      const nomCell = d.statut === "manquant"
        ? `<div style="display:flex;align-items:center;gap:.6rem">
             <span style="font-size:1.2rem;opacity:.5">${icone}</span>
             <div><span style="color:hsl(var(--danger,0 72% 51%));font-weight:600">${K.esc(d.nom)}</span>
               <br><span class="badge badge-danger">Manquant</span></div>
           </div>`
        : `<div style="display:flex;align-items:center;gap:.6rem">
             <span style="font-size:1.2rem">${icone}</span>
             <span style="font-weight:600">${K.esc(d.nom)}</span>
           </div>`;
      const actions = d.statut === "manquant"
        ? `<button class="btn btn-gold btn-sm" data-demande="${d.id}">Demander la pièce</button>`
        : `<button class="btn btn-outline btn-sm" data-dl="${d.id}" title="Télécharger">⬇</button>
           <button class="btn btn-outline btn-sm" data-view="${d.id}" title="Aperçu">👁</button>`;
      return `
      <tr>
        <td>${nomCell}</td>
        <td class="dossier-cell">${K.esc(K.dossierNom(d.dossier))}</td>
        <td><span class="badge badge-muted">${K.esc(d.type)}</span></td>
        <td>${K.esc(d.taille || "—")}</td>
        <td>${d.statut === "manquant" ? "<span class='muted'>—</span>" : K.fmtDate(d.date)}</td>
        <td style="text-align:right;white-space:nowrap">${actions}</td>
      </tr>`;
    }).join("");
  }

  function render() {
    const all = K.get("documents");
    const nbClasses = all.filter(d => d.statut === "classe").length;
    const nbManquants = all.filter(d => d.statut === "manquant").length;
    const nbDossiers = new Set(all.map(d => d.dossier)).size;

    el.innerHTML = `
    <div class="panel-head" style="border:none;padding:0 0 1rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
      <h3 style="margin:0">GED et pièces manquantes</h3>
      <div class="right" style="margin-left:auto"><button class="btn btn-gold btn-sm" id="importBtn">⬆ Importer un document</button></div>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-green">📂</div><div><b>${nbClasses}</b><small>Documents classés</small></div></div>
      <div class="kpi"><div class="ki ki-red">⚠️</div><div><b>${nbManquants}</b><small>Pièces manquantes</small></div></div>
      <div class="kpi"><div class="ki ki-blue">📁</div><div><b>${nbDossiers}</b><small>Dossiers couverts</small></div></div>
    </div>

    <div class="panel" style="margin-top:1rem">
      <div class="panel-body" style="border-bottom:1px solid hsl(var(--border));display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
        <div class="field" style="margin:0;flex:1;min-width:220px">
          <input id="searchInput" type="text" placeholder="🔎 Rechercher un document ou un dossier…" value="${K.esc(state.q)}">
        </div>
        <div class="chips" id="typeChips">
          ${TYPES.map(([v, l]) => `<span class="chip ${v === state.type ? "on" : ""}" data-type="${v}">${l}</span>`).join("")}
          <span class="chip ${state.manquant ? "on" : ""}" id="manquantChip" data-manquant="1">⚠️ Pièces manquantes</span>
        </div>
      </div>
      <table class="kt">
        <thead><tr><th>Nom</th><th>Dossier</th><th>Type</th><th>Taille</th><th>Date</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody id="gedRows">${rows()}</tbody>
      </table>
    </div>`;

    const refreshRows = () => { el.querySelector("#gedRows").innerHTML = rows(); bindRowHandlers(); };

    function bindRowHandlers() {
      el.querySelectorAll("[data-demande]").forEach(b => b.onclick = () => K.toast("Demande envoyée au client"));
      el.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => K.toast("Téléchargement démarré (démo)"));
      el.querySelectorAll("[data-view]").forEach(b => b.onclick = () => K.toast("Aperçu du document (démo)"));
    }

    const input = el.querySelector("#searchInput");
    input.oninput = () => { state.q = input.value; refreshRows(); };

    el.querySelectorAll("#typeChips .chip[data-type]").forEach(c => c.onclick = () => { state.type = c.dataset.type; render(); });
    el.querySelector("#manquantChip").onclick = () => { state.manquant = !state.manquant; render(); };
    el.querySelector("#importBtn").onclick = () => K.toast("Import de document lancé (démo)");

    bindRowHandlers();
    // garder le focus en fin de saisie après re-render partiel
    const len = input.value.length;
    input.focus();
    try { input.setSelectionRange(len, len); } catch (e) {}
  }

  render();
};
