/* KILEYT — Attestations fiscales (régularité en 1 clic) */
window.KScreens = window.KScreens || {};
window.KScreens.attestations = function (el, K) {
  const TYPES = [
    { lib: "Régularité fiscale", icon: "🏛️" },
    { lib: "Vigilance URSSAF", icon: "🛡️" }
  ];

  // Détermine de façon déterministe (par id de dossier) le type d'attestation
  // affiché et la date de dernière récupération, sans inventer de données hors store.
  function infoFor(d) {
    let seed = 0;
    const sid = String(d.id);
    for (let i = 0; i < sid.length; i++) seed += sid.charCodeAt(i);
    const type = TYPES[seed % TYPES.length];
    // date de récupération : entre il y a 5 et 124 jours par rapport au 18/06/2026
    const ageJours = 5 + (seed * 7) % 120;
    const ref = new Date("2026-06-18T00:00:00");
    ref.setDate(ref.getDate() - ageJours);
    const iso = ref.toISOString().slice(0, 10);
    // une attestation est valable 90 jours
    const ajour = K.daysTo(iso) >= -90;
    return { type, iso, ajour };
  }

  function rows() {
    const list = K.get("dossiers").slice().sort((a, b) => K.esc(a.nom).localeCompare(K.esc(b.nom)));
    if (!list.length) return `<tr><td colspan="5"><div class="empty">Aucun dossier.</div></td></tr>`;
    return list.map(d => {
      const i = infoFor(d);
      const c = K.coll(d.gestionnaire);
      const badge = i.ajour
        ? `<span class="badge badge-success">À jour</span>`
        : `<span class="badge badge-danger">Expirée</span>`;
      return `
      <tr>
        <td class="dossier-cell"><span class="ava-sm" style="background:${c.couleur}">${c.initiales}</span>
          <div>${K.esc(d.nom)}<br><small class="muted" style="font-weight:500">${K.esc(d.siren || "")}</small></div></td>
        <td>${i.type.icon} ${i.type.lib}</td>
        <td>${K.fmtDate(i.iso)}</td>
        <td>${badge}</td>
        <td style="text-align:right;white-space:nowrap">
          <button class="btn btn-outline btn-sm" data-dl="${K.esc(d.nom)}">⬇ Télécharger</button>
          <button class="btn btn-outline btn-sm" data-share="${K.esc(d.nom)}">🔗 Partager</button>
        </td>
      </tr>`;
    }).join("");
  }

  function render() {
    const dossiers = K.get("dossiers");
    const total = dossiers.length;
    let ajour = 0, expirees = 0;
    dossiers.forEach(d => { infoFor(d).ajour ? ajour++ : expirees++; });

    el.innerHTML = `
    <div style="margin-bottom:1.2rem">
      <small style="text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:hsl(var(--gold,46 100% 61%))">Régularité fiscale en 1 clic</small>
      <h2 style="font-size:1.6rem;margin-top:.2rem">Attestations fiscales</h2>
      <p class="muted">Récupérez et partagez les attestations de régularité de tous vos dossiers.</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-green">✅</div><div><b>${ajour}</b><small>Attestations à jour</small></div></div>
      <div class="kpi"><div class="ki ki-red">⚠️</div><div><b>${expirees}</b><small>Expirées</small></div></div>
      <div class="kpi"><div class="ki ki-blue">📁</div><div><b>${total}</b><small>Total dossiers</small></div></div>
    </div>

    <div class="panel" style="margin-top:1.2rem">
      <div class="panel-head">
        <h3>Attestations par dossier</h3>
        <div class="right"><button class="btn btn-gold btn-sm" id="fetchAll">🔄 Récupérer toutes les attestations</button></div>
      </div>
      <table class="kt">
        <thead><tr><th>Dossier</th><th>Type</th><th>Dernière récupération</th><th>Statut</th><th></th></tr></thead>
        <tbody id="attRows">${rows()}</tbody>
      </table>
    </div>`;

    const fa = el.querySelector("#fetchAll");
    if (fa) fa.onclick = () => K.toast("Récupération depuis impots.gouv… (démo)");
    el.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => K.toast("Attestation « " + b.dataset.dl + " » téléchargée (démo)"));
    el.querySelectorAll("[data-share]").forEach(b => b.onclick = () => K.toast("Lien de partage copié — " + b.dataset.share));
  }

  render();
};
