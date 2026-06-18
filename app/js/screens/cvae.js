/* KILEYT — Suivi CVAE intégré */
window.KScreens = window.KScreens || {};
window.KScreens.cvae = function (el, K) {
  const state = { statut: "all", annee: "2026" };
  const STATUTS = [["all", "Tous"], ["attente", "À valider"], ["valide", "Validées"], ["retard", "En retard"]];

  // La CVAE concerne les dossiers réalisant plus de 500 k€ de chiffre d'affaires.
  // On enrichit le store (une seule fois) avec les acomptes & solde réels de ces dossiers.
  const SEED = [
    { id: "cv_d1_ac1", dossier: "d1", periode: "1er acompte 2026", date: "2026-06-15", statut: "valide", montant: "3 100 €", coll: "c2" },
    { id: "cv_d1_ac2", dossier: "d1", periode: "2e acompte 2026", date: "2026-09-15", statut: "attente", montant: "3 100 €", coll: "c2" },
    { id: "cv_d2_ac1", dossier: "d2", periode: "Solde 2025", date: "2026-05-05", statut: "retard", montant: "1 740 €", coll: "c3" },
    { id: "cv_d6_ac1", dossier: "d6", periode: "1er acompte 2026", date: "2026-06-15", statut: "attente", montant: "1 280 €", coll: "c3" },
    { id: "cv_d8_ac1", dossier: "d8", periode: "1er acompte 2026", date: "2026-06-15", statut: "valide", montant: "12 050 €", coll: "c2" },
    { id: "cv_d8_ac2", dossier: "d8", periode: "2e acompte 2026", date: "2026-09-15", statut: "attente", montant: "12 050 €", coll: "c2" },
    { id: "cv_d5_ac1", dossier: "d5", periode: "Solde 2025", date: "2025-05-05", statut: "valide", montant: "7 420 €", coll: "c5" },
    { id: "cv_d3_ac1", dossier: "d3", periode: "Solde 2025", date: "2025-05-05", statut: "valide", montant: "2 050 €", coll: "c2" }
  ];
  const existing = new Set(K.get("echeances").map(e => e.id));
  SEED.forEach(s => { if (!existing.has(s.id)) K.add("echeances", Object.assign({ type: "CVAE" }, s)); });

  const num = m => { const n = parseInt(String(m).replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; };
  const fmtEur = n => n.toLocaleString("fr-FR").replace(/ | /g, " ") + " €";

  function base() {
    return K.get("echeances").filter(e => e.type === "CVAE");
  }
  function anneeOf(e) { return e.date.slice(0, 4); }

  function rows() {
    let list = base().filter(e => anneeOf(e) === state.annee);
    if (state.statut !== "all") list = list.filter(e => e.statut === state.statut);
    list = list.sort((a, b) => a.date.localeCompare(b.date));
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Aucune échéance CVAE pour ces filtres.</div></td></tr>`;
    return list.map(e => {
      const d = K.dossier(e.dossier) || {};
      const c = K.coll(e.coll);
      return `
      <tr>
        <td class="dossier-cell"><span class="ava-sm" style="background:${c.couleur}">${K.esc(c.initiales)}</span>
          <div>${K.esc(K.dossierNom(e.dossier))}<br><small class="muted" style="font-weight:500">${K.esc(d.siren || "")}</small></div></td>
        <td>${K.esc(e.periode)}</td>
        <td>${K.fmtDate(e.date)}</td>
        <td style="text-align:right;font-weight:700">${K.esc(e.montant)}</td>
        <td style="text-align:right"><span class="badge ${K.statutBadge[e.statut] || "badge-muted"}">${K.statutLabel[e.statut] || e.statut}</span></td>
        <td style="text-align:right">${e.statut === "attente" ? `<button class="btn btn-gold btn-sm" data-valide="${K.esc(e.id)}">Valider</button>` : ""}</td>
      </tr>`;
    }).join("");
  }

  function render() {
    const all = base().filter(e => anneeOf(e) === state.annee);
    const total = all.length;
    const aTraiter = all.filter(e => e.statut === "attente" || e.statut === "retard").length;
    const cumul = all.reduce((s, e) => s + num(e.montant), 0);

    el.innerHTML = `
    <div style="margin-bottom:1.2rem">
      <small class="muted" style="font-weight:700;letter-spacing:.06em;text-transform:uppercase">Cotisation sur la valeur ajoutée</small>
      <h2 style="font-size:1.6rem;margin-top:.2rem">Suivi CVAE intégré</h2>
      <p class="muted">Acomptes et soldes CVAE des dossiers assujettis, synchronisés depuis impots.gouv.</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-purple">📈</div><div><b>${total}</b><small>Échéances CVAE ${state.annee}</small></div></div>
      <div class="kpi"><div class="ki ki-red">⏰</div><div><b>${aTraiter}</b><small>À traiter</small></div></div>
      <div class="kpi"><div class="ki ki-gold">€</div><div><b>${fmtEur(cumul)}</b><small>Montant cumulé</small></div></div>
    </div>

    <div class="panel-head" style="border:none;padding:0 0 1rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
      <div class="seg" id="yearSeg">
        <button data-an="2026" class="${state.annee === "2026" ? "on" : ""}">2026</button>
        <button data-an="2025" class="${state.annee === "2025" ? "on" : ""}">2025</button>
      </div>
      <div class="right" style="margin-left:auto"><button class="btn btn-navy btn-sm" id="exportBtn">⬇ Exporter Excel</button></div>
    </div>

    <div class="panel">
      <div class="panel-body" style="border-bottom:1px solid hsl(var(--border))">
        <small class="muted" style="font-weight:700">Statut</small>
        <div class="chips" id="statChips" style="margin-top:.3rem">
          ${STATUTS.map(([v, l]) => `<span class="chip ${v === state.statut ? "on" : ""}" data-stat="${v}">${l}</span>`).join("")}
        </div>
      </div>
      <table class="kt">
        <thead><tr><th>Dossier</th><th>Période</th><th>Échéance</th><th style="text-align:right">Montant</th><th style="text-align:right">Statut</th><th></th></tr></thead>
        <tbody id="cvaeRows">${rows()}</tbody>
      </table>
      <div class="panel-body" style="border-top:1px solid hsl(var(--border))">
        <p class="muted" style="font-size:.85rem;margin:0">ℹ️ Intégré au calendrier des échéances. La CVAE n'est due que par les entreprises réalisant plus de 500 k€ de chiffre d'affaires.</p>
      </div>
    </div>`;

    el.querySelectorAll("#statChips .chip").forEach(c => c.onclick = () => { state.statut = c.dataset.stat; render(); });
    el.querySelectorAll("#yearSeg button").forEach(b => b.onclick = () => { state.annee = b.dataset.an; render(); });
    el.querySelectorAll("[data-valide]").forEach(b => b.onclick = () => {
      K.update("echeances", b.dataset.valide, { statut: "valide" });
      K.toast("Échéance CVAE validée ✓");
      render();
    });
    el.querySelector("#exportBtn").onclick = () => K.toast("Export Excel CVAE généré (démo)");
  }

  render();
};
