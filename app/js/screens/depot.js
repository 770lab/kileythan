/* KILEYT — Dépôt des comptes annuels (DCA & AGO) */
window.KScreens = window.KScreens || {};
window.KScreens.depot = function (el, K) {
  /* État local de session : statuts AGO/DCA cochés manuellement.
     Clé = id du dossier ; valeur = { ago:bool, dca:bool } (override de l'état initial). */
  const state = { annee: "2025", over: {} };

  const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

  /* clôture "31/12" -> { d, m } */
  function parseCloture(c) {
    const p = String(c || "31/12").split("/");
    return { d: parseInt(p[0], 10) || 31, m: parseInt(p[1], 10) || 12 };
  }

  /* Échéance légale de dépôt au greffe : 7 mois après la clôture de l'exercice.
     (AGO dans les 6 mois + dépôt dans le mois qui suit l'approbation.) */
  function echeanceLegale(dossier) {
    const { m } = parseCloture(dossier.cloture);
    const annee = parseInt(state.annee, 10);
    // clôture en 2025 -> dépôt en 2025 ou 2026 selon le mois
    let baseYear = annee;
    let mois = m + 7;
    let year = baseYear;
    if (mois > 12) { mois -= 12; year += 1; }
    const label = `${MOIS[mois - 1]} ${year}`;
    const iso = `${year}-${String(mois).padStart(2, "0")}-30`;
    return { label, iso };
  }

  /* Statut initial déterministe (avant override) à partir de l'id du dossier,
     pour donner un mix réaliste fait / à faire sans inventer de collection. */
  function seed(dossier) {
    const n = (dossier.id.charCodeAt(dossier.id.length - 1) || 0);
    const ago = (n % 5) !== 0;        // ~80 % AGO faites
    const dca = ago && (n % 3) === 0; // déposé seulement si AGO faite, ~1/3
    return { ago, dca };
  }

  function etat(dossier) {
    const base = seed(dossier);
    const o = state.over[dossier.id] || {};
    return {
      ago: o.ago !== undefined ? o.ago : base.ago,
      dca: o.dca !== undefined ? o.dca : base.dca,
    };
  }

  function dossiers() {
    return K.get("dossiers");
  }

  function counts() {
    let aApprouver = 0, aDeposer = 0, termines = 0;
    dossiers().forEach(d => {
      const e = etat(d);
      if (!e.ago) aApprouver++;
      else if (!e.dca) aDeposer++;
      else termines++;
    });
    return { aApprouver, aDeposer, termines };
  }

  function badgeAgo(fait) {
    return fait
      ? `<span class="badge badge-success">Fait</span>`
      : `<span class="badge badge-warning">À faire</span>`;
  }
  function badgeDca(depose) {
    return depose
      ? `<span class="badge badge-success">Déposé</span>`
      : `<span class="badge badge-danger">À déposer</span>`;
  }

  function rows() {
    const list = dossiers();
    if (!list.length) return `<tr><td colspan="6"><div class="empty">Aucun dossier.</div></td></tr>`;
    return list.map(d => {
      const e = etat(d);
      const leg = echeanceLegale(d);
      const enRetard = !e.dca && K.daysTo(leg.iso) < 0;
      let action;
      if (!e.ago) {
        action = `<button class="btn btn-navy btn-sm" data-ago="${K.esc(d.id)}">Approuver l'AGO</button>`;
      } else if (!e.dca) {
        action = `<button class="btn btn-gold btn-sm" data-dca="${K.esc(d.id)}">Marquer déposé</button>`;
      } else {
        action = `<span class="badge badge-muted">Clôturé</span>`;
      }
      const g = K.coll(d.gestionnaire);
      return `
        <tr>
          <td class="dossier-cell">
            <span class="ava-sm" style="background:${g.couleur}">${K.esc(g.initiales)}</span>
            <div>${K.esc(d.nom)}<br><small class="muted" style="font-weight:500">${K.esc(d.siren || "")} · clôture ${K.esc(d.cloture)}</small></div>
          </td>
          <td><span class="badge badge-bilan">Exercice ${K.esc(state.annee)}</span></td>
          <td style="text-align:center">${badgeAgo(e.ago)}</td>
          <td style="text-align:center">${badgeDca(e.dca)}</td>
          <td>${K.esc(leg.label)}${enRetard ? `<br><small class="muted" style="color:hsl(var(--danger,0 72% 51%));font-weight:700">délai dépassé</small>` : ""}</td>
          <td style="text-align:right">${action}</td>
        </tr>`;
    }).join("");
  }

  function render() {
    const c = counts();
    el.innerHTML = `
    <div class="panel-head" style="border:none;padding:0 0 .25rem">
      <div>
        <small class="muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.04em">Approbation + dépôt distincts</small>
        <h3 style="margin:.15rem 0 0">Dépôt des comptes annuels (DCA &amp; AGO)</h3>
      </div>
    </div>

    <p class="muted" style="margin:.2rem 0 1rem;max-width:60ch">
      L'<b>AGO</b> (assemblée générale ordinaire) approuve les comptes — étape interne, dans les 6 mois de la clôture.
      Le <b>DCA</b> (dépôt des comptes annuels) transmet ces comptes au greffe du tribunal de commerce dans le mois qui suit l'approbation.
    </p>

    <div class="kpi-grid" style="margin-bottom:1rem">
      <div class="kpi"><span class="ki ki-blue">AGO</span><div><b>${c.aApprouver}</b><small>À approuver (AGO)</small></div></div>
      <div class="kpi"><span class="ki ki-gold">DCA</span><div><b>${c.aDeposer}</b><small>À déposer (DCA)</small></div></div>
      <div class="kpi"><span class="ki ki-green">✓</span><div><b>${c.termines}</b><small>Terminés (approuvés + déposés)</small></div></div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>Suivi par dossier</h3>
        <div class="right">
          <div class="seg" id="anneeSeg">
            <button class="${state.annee === "2025" ? "on" : ""}" data-annee="2025">Exercice 2025</button>
            <button class="${state.annee === "2024" ? "on" : ""}" data-annee="2024">Exercice 2024</button>
            <button class="${state.annee === "2023" ? "on" : ""}" data-annee="2023">Exercice 2023</button>
          </div>
        </div>
      </div>
      <table class="kt">
        <thead>
          <tr>
            <th>Dossier</th>
            <th>Exercice</th>
            <th style="text-align:center">AGO</th>
            <th style="text-align:center">DCA</th>
            <th>Échéance légale</th>
            <th style="text-align:right">Action</th>
          </tr>
        </thead>
        <tbody id="depotRows">${rows()}</tbody>
      </table>
    </div>`;

    el.querySelectorAll("#anneeSeg button").forEach(b => b.onclick = () => {
      state.annee = b.dataset.annee;
      render();
    });

    el.querySelectorAll("[data-ago]").forEach(b => b.onclick = () => {
      const id = b.dataset.ago;
      state.over[id] = Object.assign({}, state.over[id], { ago: true });
      K.toast("AGO approuvée — comptes prêts à déposer");
      render();
    });

    el.querySelectorAll("[data-dca]").forEach(b => b.onclick = () => {
      const id = b.dataset.dca;
      state.over[id] = Object.assign({}, state.over[id], { ago: true, dca: true });
      K.toast("Comptes déposés au greffe ✓");
      render();
    });
  }

  render();
};
