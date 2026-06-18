/* KILEYT — Tableau de bord */
window.KScreens = window.KScreens || {};
window.KScreens.dashboard = function (el, K) {
  const ech = K.get("echeances");
  const u = K.db.cabinet.user;
  const nbDossiers = K.get("dossiers").length;
  const nbAttente = ech.filter(e => e.statut === "attente" || e.statut === "retard").length;
  const nbMsg = K.get("messages").filter(m => !m.lu).length;
  const nbTaches = K.get("taches").filter(t => t.statut !== "termine").length;

  // prochaines échéances (triées par date)
  const proch = [...ech].filter(e => K.daysTo(e.date) >= -5).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  // mini-calendrier juin 2026
  const jours = ["L", "M", "M", "J", "V", "S", "D"];
  const echDays = new Set(ech.filter(e => e.date.startsWith("2026-06")).map(e => parseInt(e.date.split("-")[2], 10)));
  let cal = jours.map(j => `<div class="dh">${j}</div>`).join("");
  // 1er juin 2026 = lundi → aucun décalage (semaine commençant le lundi)
  for (let d = 1; d <= 30; d++) {
    cal += `<div class="d ${echDays.has(d) ? "has" : ""} ${d === 18 ? "today" : ""}">${d}</div>`;
  }

  el.innerHTML = `
    <div style="margin-bottom:1.2rem"><h2 style="font-size:1.6rem">Bonjour, ${u.prenom} 👋</h2><p class="muted">Voici l'activité de votre cabinet aujourd'hui.</p></div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-gold">📁</div><div><b>${nbDossiers}</b><small>Dossiers actifs</small></div></div>
      <div class="kpi"><div class="ki ki-red">⏰</div><div><b>${nbAttente}</b><small>Échéances à traiter</small></div></div>
      <div class="kpi"><div class="ki ki-green">✓</div><div><b>${nbTaches}</b><small>Tâches en cours</small></div></div>
      <div class="kpi"><div class="ki ki-blue">✉️</div><div><b>${nbMsg}</b><small>Messages non lus</small></div></div>
    </div>

    <div class="col-2">
      <div class="panel">
        <div class="panel-head"><h3>Prochaines échéances</h3><div class="right"><a class="btn btn-outline btn-sm" href="#/echeances">Tout voir</a></div></div>
        <table class="kt"><tbody>
          ${proch.map(e => {
            const j = K.daysTo(e.date);
            const urg = j < 0 ? `<span class="badge badge-danger">En retard</span>` : j <= 2 ? `<span class="badge badge-warning">${j === 0 ? "Aujourd'hui" : "J-" + j}</span>` : `<span class="muted">${K.fmtDate(e.date)}</span>`;
            return `<tr>
              <td><span class="badge ${K.typeBadge[e.type] || "badge-muted"}">${e.type}</span></td>
              <td class="dossier-cell"><span class="ava-sm" style="background:${K.coll(e.coll).couleur}">${K.coll(e.coll).initiales}</span>${K.esc(K.dossierNom(e.dossier))}</td>
              <td style="text-align:right">${e.montant}</td>
              <td style="text-align:right">${urg}</td>
            </tr>`;
          }).join("")}
        </tbody></table>
      </div>

      <div>
        <div class="panel"><div class="panel-head"><h3>Juin 2026</h3></div><div class="panel-body"><div class="cal">${cal}</div>
          <p class="muted" style="font-size:.8rem;margin-top:.8rem">🟡 jours avec échéances</p></div></div>
        <div class="panel"><div class="panel-head"><h3>Connexions</h3></div><div class="panel-body">
          <div style="display:flex;justify-content:space-between;padding:.5rem 0"><span>🇫🇷 impots.gouv</span><span class="badge badge-success">Connecté</span></div>
          <div style="display:flex;justify-content:space-between;padding:.5rem 0"><span>🅿️ Pennylane</span><span class="badge badge-success">Synchronisé</span></div>
          <div style="display:flex;justify-content:space-between;padding:.5rem 0"><span>🏛️ INPI</span><span class="badge badge-success">Connecté</span></div>
        </div></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Activité récente</h3></div>
      <table class="kt"><tbody>
        <tr><td>✓ Tâche terminée</td><td class="muted">Dépôt des comptes — Garage Benhamou</td><td style="text-align:right" class="muted">il y a 2h</td></tr>
        <tr><td>📥 Document reçu</td><td class="muted">Relevés bancaires Q1 — TechNova SAS</td><td style="text-align:right" class="muted">il y a 5h</td></tr>
        <tr><td>🔄 Échéance synchronisée</td><td class="muted">TVA mai — 4 dossiers</td><td style="text-align:right" class="muted">hier</td></tr>
        <tr><td>👤 Prospect gagné</td><td class="muted">Clinique dentaire Roth → onboarding</td><td style="text-align:right" class="muted">hier</td></tr>
      </tbody></table>
    </div>`;
};
