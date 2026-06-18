/* KILEYT — Suivi des échéances fiscales */
window.KScreens = window.KScreens || {};
window.KScreens.echeances = function (el, K) {
  const state = { type: "all", statut: "all" };
  const TYPES = ["all", "TVA", "IS", "CFE", "CVAE", "BILAN", "TF"];
  const STATUTS = [["all", "Tous"], ["attente", "À valider"], ["valide", "Validées"], ["retard", "En retard"], ["encours", "En cours"]];

  function rows() {
    let list = K.get("echeances");
    if (state.type !== "all") list = list.filter(e => e.type === state.type);
    if (state.statut !== "all") list = list.filter(e => e.statut === state.statut);
    list = list.sort((a, b) => a.date.localeCompare(b.date));
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Aucune échéance pour ces filtres.</div></td></tr>`;
    return list.map(e => `
      <tr>
        <td><span class="badge ${K.typeBadge[e.type] || "badge-muted"}">${e.type}</span></td>
        <td class="dossier-cell"><span class="ava-sm" style="background:${K.coll(e.coll).couleur}">${K.coll(e.coll).initiales}</span>
          <div>${K.esc(K.dossierNom(e.dossier))}<br><small class="muted" style="font-weight:500">${K.dossier(e.dossier).siren || ""}</small></div></td>
        <td>${K.esc(e.periode)}</td>
        <td>${K.fmtDate(e.date)}</td>
        <td style="text-align:right;font-weight:700">${e.montant}</td>
        <td style="text-align:right"><span class="badge ${K.statutBadge[e.statut]}">${K.statutLabel[e.statut]}</span></td>
        <td style="text-align:right">${e.statut === "attente" ? `<button class="btn btn-gold btn-sm" data-valide="${e.id}">Valider</button>` : ""}</td>
      </tr>`).join("");
  }

  function render() {
    el.innerHTML = `
    <div class="panel-head" style="border:none;padding:0 0 1rem;display:flex;flex-wrap:wrap;gap:1rem">
      <div class="seg" id="yearSeg"><button class="on">2026</button><button>2025</button><button>2024</button></div>
      <div class="right" style="margin-left:auto"><button class="btn btn-navy btn-sm" id="exportBtn">⬇ Exporter Excel</button></div>
    </div>
    <div class="panel">
      <div class="panel-body" style="border-bottom:1px solid hsl(var(--border))">
        <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center">
          <div><small class="muted" style="font-weight:700">Type</small><div class="chips" id="typeChips" style="margin-top:.3rem">
            ${TYPES.map(t => `<span class="chip ${t === state.type ? "on" : ""}" data-type="${t}">${t === "all" ? "Tous" : t}</span>`).join("")}</div></div>
          <div><small class="muted" style="font-weight:700">Statut</small><div class="chips" id="statChips" style="margin-top:.3rem">
            ${STATUTS.map(([v, l]) => `<span class="chip ${v === state.statut ? "on" : ""}" data-stat="${v}">${l}</span>`).join("")}</div></div>
        </div>
      </div>
      <table class="kt">
        <thead><tr><th>Type</th><th>Dossier</th><th>Période</th><th>Échéance</th><th style="text-align:right">Montant</th><th style="text-align:right">Statut</th><th></th></tr></thead>
        <tbody id="echRows">${rows()}</tbody>
      </table>
    </div>`;

    el.querySelectorAll("#typeChips .chip").forEach(c => c.onclick = () => { state.type = c.dataset.type; render(); });
    el.querySelectorAll("#statChips .chip").forEach(c => c.onclick = () => { state.statut = c.dataset.stat; render(); });
    el.querySelectorAll("[data-valide]").forEach(b => b.onclick = () => { K.update("echeances", b.dataset.valide, { statut: "valide" }); K.toast("Échéance validée ✓"); render(); });
    el.querySelector("#exportBtn").onclick = () => K.toast("Export Excel généré (démo)");
    el.querySelectorAll("#yearSeg button").forEach(b => b.onclick = () => { el.querySelectorAll("#yearSeg button").forEach(x => x.classList.remove("on")); b.classList.add("on"); });
  }
  render();
};
