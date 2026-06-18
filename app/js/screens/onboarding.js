/* KILEYT — Onboarding client + Intégration INPI */
window.KScreens = window.KScreens || {};
window.KScreens.onboarding = function (el, K) {
  // Sociétés détectées via le flux INPI (libellés de démo, hors store).
  const detectees = [
    { nom: "TechNova SAS", forme: "SAS", siren: "984 217 530", date: "2026-06-12", dirigeant: "Léa Marchand", capital: "10 000 €", activite: "Édition de logiciels", statut: "Immatriculée" },
    { nom: "Atelier Bois & Co", forme: "SARL", siren: "983 044 118", date: "2026-06-09", dirigeant: "Karim Benali", capital: "5 000 €", activite: "Menuiserie", statut: "Immatriculée" },
  ];

  // Pièces à collecter (libellés de démo, hors store).
  const pieces = [
    { nom: "Statuts signés", desc: "Version définitive enregistrée", oblig: true },
    { nom: "Pièce d'identité du dirigeant", desc: "Recto / verso en cours de validité", oblig: true },
    { nom: "Justificatif de domiciliation", desc: "Bail commercial ou contrat de domiciliation", oblig: true },
    { nom: "RIB professionnel", desc: "Compte au nom de la société", oblig: false },
  ];

  function progress() {
    const list = K.get("onboarding");
    const faits = list.filter(o => o.fait).length;
    return { faits, total: list.length, pct: list.length ? Math.round((faits / list.length) * 100) : 0 };
  }

  function inpiCard(s, i) {
    return `
      <div class="panel" style="margin-bottom:1rem">
        <div class="panel-body" style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
          <span class="ava-sm" style="background:#0d1b2e;width:42px;height:42px;line-height:42px;font-size:.85rem">${K.esc(s.forme)}</span>
          <div style="flex:1;min-width:220px">
            <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
              <b style="font-size:1.05rem;color:#0d1b2e">${K.esc(s.nom)}</b>
              <span class="badge badge-success">${K.esc(s.statut)}</span>
            </div>
            <small class="muted" style="display:block;margin-top:.2rem">Création détectée le ${K.fmtDate(s.date)} · SIREN ${K.esc(s.siren)}</small>
            <div style="display:flex;gap:1.4rem;flex-wrap:wrap;margin-top:.7rem">
              <div><small class="muted" style="font-weight:700">Dirigeant</small><br><span style="font-weight:600">${K.esc(s.dirigeant)}</span></div>
              <div><small class="muted" style="font-weight:700">Capital</small><br><span style="font-weight:600">${K.esc(s.capital)}</span></div>
              <div><small class="muted" style="font-weight:700">Activité</small><br><span style="font-weight:600">${K.esc(s.activite)}</span></div>
            </div>
          </div>
          <button class="btn btn-gold btn-sm" data-onb="${i}" style="align-self:center">Déclencher l'onboarding</button>
        </div>
      </div>`;
  }

  function checklistRows() {
    return K.get("onboarding").map((o, i) => `
      <label class="onb-item" style="display:flex;align-items:center;gap:.75rem;padding:.7rem .25rem;border-bottom:1px solid hsl(var(--border));cursor:pointer">
        <input type="checkbox" data-onb-check="${i}" ${o.fait ? "checked" : ""} style="width:18px;height:18px;accent-color:#0d1b2e;cursor:pointer">
        <span style="flex:1;font-weight:600;color:${o.fait ? "#16a34a" : "#0d1b2e"};${o.fait ? "" : ""}">${K.esc(o.etape)}</span>
        <span class="badge ${o.fait ? "badge-success" : "badge-warning"}">${o.fait ? "Fait" : "À faire"}</span>
      </label>`).join("");
  }

  function pieceRows() {
    return pieces.map((p, i) => `
      <tr>
        <td>
          <div style="font-weight:600">${K.esc(p.nom)}${p.oblig ? ` <span class="badge badge-danger">Obligatoire</span>` : ""}</div>
          <small class="muted">${K.esc(p.desc)}</small>
        </td>
        <td style="text-align:right"><span class="badge badge-warning">Manquant</span></td>
        <td style="text-align:right"><button class="btn btn-outline btn-sm" data-piece="${i}">Demander la pièce</button></td>
      </tr>`).join("");
  }

  function render() {
    const p = progress();
    el.innerHTML = `
    <div style="margin-bottom:1.2rem">
      <small class="muted" style="font-weight:700;letter-spacing:.04em;text-transform:uppercase">Détection automatique des créations</small>
      <h2 style="margin:.2rem 0 0;color:#0d1b2e">Onboarding client</h2>
    </div>

    <div class="panel" style="margin-bottom:1.4rem">
      <div class="panel-head">
        <h3>Intégration INPI</h3>
        <div class="right"><span class="badge badge-success">● Connexion INPI active</span></div>
      </div>
      <div class="panel-body" style="padding-bottom:.4rem">
        <small class="muted">Sociétés nouvellement immatriculées détectées dans votre périmètre territorial.</small>
      </div>
      <div class="panel-body" style="padding-top:.6rem">
        ${detectees.map((s, i) => inpiCard(s, i)).join("")}
      </div>
    </div>

    <div class="col-2">
      <div class="panel">
        <div class="panel-head">
          <h3>Checklist d'onboarding</h3>
          <div class="right"><span style="font-weight:800;color:#0d1b2e">${p.faits}/${p.total}</span></div>
        </div>
        <div class="panel-body" style="padding-bottom:1rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:.35rem">
            <small class="muted" style="font-weight:700">Progression globale</small>
            <small style="font-weight:800;color:#16a34a">${p.pct}%</small>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${p.pct}%"></div></div>
        </div>
        <div class="panel-body" style="padding-top:0">
          ${checklistRows()}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>Documents demandés</h3></div>
        <table class="kt">
          <thead><tr><th>Pièce</th><th style="text-align:right">Statut</th><th></th></tr></thead>
          <tbody>${pieceRows()}</tbody>
        </table>
      </div>
    </div>`;

    el.querySelectorAll("[data-onb]").forEach(b => b.onclick = () => {
      const s = detectees[parseInt(b.dataset.onb, 10)];
      K.toast(`Onboarding déclenché pour ${s.nom}`);
    });

    el.querySelectorAll("[data-onb-check]").forEach(c => c.onchange = () => {
      const i = parseInt(c.dataset.onbCheck, 10);
      K.db.onboarding[i].fait = c.checked;
      K.save();
      render();
    });

    el.querySelectorAll("[data-piece]").forEach(b => b.onclick = () => K.toast("Demande envoyée au client"));
  }

  render();
};
