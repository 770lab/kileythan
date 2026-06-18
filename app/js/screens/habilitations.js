/* KILEYT — Suivi des habilitations (mandats impots.gouv + dettes fiscales) */
window.KScreens = window.KScreens || {};
window.KScreens.habilitations = function (el, K) {
  // Statut de mandat dérivé déterministe à partir de l'index du dossier.
  // 0 = Actif, 1 = À renouveler, 2 = Expiré
  const MANDATS = [
    { lab: "Actif", badge: "badge-success" },
    { lab: "À renouveler", badge: "badge-warning" },
    { lab: "Expiré", badge: "badge-danger" },
  ];
  // Dates d'expiration réalistes 2026/2027 (cycle déterministe sur l'index)
  const EXP = ["2026-07-12", "2027-01-31", "2026-06-30", "2027-04-15", "2026-09-01", "2026-06-25", "2027-02-28", "2026-08-20"];
  // Dettes fiscales en cours (montant € ou null = "—")
  const DETTES = ["1 980 €", null, "4 600 €", null, null, "12 300 €", null, "9 200 €"];

  function mandatOf(i) {
    // pattern : Actif / À renouveler / Expiré récurrent mais majoritairement actif
    if (i % 4 === 1) return 1;        // à renouveler
    if (i % 7 === 3) return 2;        // expiré
    return 0;                          // actif
  }
  const expOf = (i) => EXP[i % EXP.length];
  const detteOf = (i) => DETTES[i % DETTES.length];

  function compute() {
    const dossiers = K.get("dossiers");
    let actifs = 0, renouv = 0, dettes = 0, dettesNb = 0;
    const alerts = [];
    dossiers.forEach((d, i) => {
      const m = mandatOf(i);
      if (m === 0) actifs++;
      if (m === 1) renouv++;
      const dt = detteOf(i);
      if (dt) { dettesNb++; }
      const j = K.daysTo(expOf(i));
      // alerte : à renouveler OU expiré sous 30 jours (et expirant bientôt / déjà passé récemment)
      if ((m === 1 || m === 2) && j <= 30) alerts.push({ d, i, j, m });
    });
    return { dossiers, actifs, renouv, dettesNb, alerts };
  }

  function rows(dossiers) {
    return dossiers.map((d, i) => {
      const m = MANDATS[mandatOf(i)];
      const c = K.coll(d.gestionnaire);
      const dt = detteOf(i);
      const exp = expOf(i);
      const j = K.daysTo(exp);
      const expSoon = mandatOf(i) !== 0 && j <= 30;
      return `
        <tr>
          <td class="dossier-cell">
            <span class="ava-sm" style="background:${c.couleur}">${c.initiales}</span>
            <div>${K.esc(d.nom)}<br><small class="muted" style="font-weight:500">${K.esc(d.siren || "")}</small></div>
          </td>
          <td><span class="badge ${m.badge}">${m.lab}</span></td>
          <td>${K.fmtDate(exp)}${expSoon ? `<br><small class="muted" style="font-weight:600">${j < 0 ? "expiré depuis " + Math.abs(j) + " j" : "dans " + j + " j"}</small>` : ""}</td>
          <td style="text-align:right;font-weight:${dt ? "700" : "400"}">${dt ? K.esc(dt) : `<span class="muted">—</span>`}</td>
          <td style="text-align:right">${mandatOf(i) !== 0
            ? `<button class="btn btn-gold btn-sm" data-renew="${d.id}">Renouveler</button>`
            : `<button class="btn btn-outline btn-sm" data-renew="${d.id}">Renouveler</button>`}</td>
        </tr>`;
    }).join("");
  }

  function alertsBox(alerts) {
    if (!alerts.length) return `<div class="empty">Aucun mandat à renouveler dans les 30 prochains jours ✓</div>`;
    return alerts
      .sort((a, b) => a.j - b.j)
      .map(({ d, i, j, m }) => {
        const tone = m === 2 ? "badge-danger" : "badge-warning";
        const txt = j < 0 ? `Expiré depuis ${Math.abs(j)} j` : j === 0 ? "Expire aujourd'hui" : `Expire dans ${j} j`;
        return `
          <div style="display:flex;align-items:center;gap:.8rem;padding:.7rem 0;border-bottom:1px solid hsl(var(--border))">
            <span class="badge ${tone}">${m === 2 ? "Expiré" : "À renouveler"}</span>
            <div style="flex:1">
              <b style="font-size:.92rem">${K.esc(d.nom)}</b>
              <div class="muted" style="font-size:.8rem">Mandat impots.gouv — expiration ${K.fmtDate(expOf(i))}</div>
            </div>
            <span class="muted" style="font-weight:700;font-size:.82rem;white-space:nowrap">${txt}</span>
            <button class="btn btn-gold btn-sm" data-renew="${d.id}">Renouveler</button>
          </div>`;
      }).join("");
  }

  function render() {
    const { dossiers, actifs, renouv, dettesNb, alerts } = compute();

    el.innerHTML = `
      <div style="margin-bottom:1.2rem">
        <div style="font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:hsl(var(--gold,42 92% 61%))">Dettes fiscales &amp; accès</div>
        <h2 style="font-size:1.6rem;margin-top:.2rem">Suivi des habilitations</h2>
        <p class="muted">Mandats impots.gouv et dettes fiscales en cours sur l'ensemble de vos dossiers.</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi"><div class="ki ki-green">✓</div><div><b>${actifs}</b><small>Mandats actifs</small></div></div>
        <div class="kpi"><div class="ki ki-gold">🔁</div><div><b>${renouv}</b><small>À renouveler</small></div></div>
        <div class="kpi"><div class="ki ki-red">⚠️</div><div><b>${dettesNb}</b><small>Dettes en cours</small></div></div>
      </div>

      <div class="col-2">
        <div class="panel">
          <div class="panel-head"><h3>Mandats par dossier</h3><div class="right"><button class="btn btn-navy btn-sm" id="syncBtn">🔄 Synchroniser impots.gouv</button></div></div>
          <table class="kt">
            <thead><tr>
              <th>Dossier</th>
              <th>Mandat impots.gouv</th>
              <th>Expiration</th>
              <th style="text-align:right">Dette fiscale</th>
              <th></th>
            </tr></thead>
            <tbody id="habRows">${rows(dossiers)}</tbody>
          </table>
        </div>

        <div>
          <div class="panel">
            <div class="panel-head"><h3>Alertes</h3><div class="right"><span class="badge ${alerts.length ? "badge-warning" : "badge-muted"}">${alerts.length}</span></div></div>
            <div class="panel-body">${alertsBox(alerts)}</div>
          </div>
          <div class="panel">
            <div class="panel-head"><h3>Connexion DGFiP</h3></div>
            <div class="panel-body">
              <div style="display:flex;justify-content:space-between;padding:.5rem 0"><span>🇫🇷 Mandat tiers déclarant</span><span class="badge badge-success">Actif</span></div>
              <div style="display:flex;justify-content:space-between;padding:.5rem 0"><span>📨 Consultation avis CFE/CVAE</span><span class="badge badge-success">Autorisé</span></div>
              <div style="display:flex;justify-content:space-between;padding:.5rem 0"><span>💶 Paiement en ligne</span><span class="badge badge-success">Autorisé</span></div>
            </div>
          </div>
        </div>
      </div>`;

    el.querySelectorAll("[data-renew]").forEach(b => b.onclick = () => {
      const d = K.byId("dossiers", b.dataset.renew);
      K.toast(`Demande de renouvellement envoyée — ${d ? d.nom : "dossier"} ✓`);
    });
    const sync = el.querySelector("#syncBtn");
    if (sync) sync.onclick = () => { K.toast("Synchronisation impots.gouv lancée…"); render(); };
  }

  render();
};
