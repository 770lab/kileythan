/* KILEYT — Gestion des équipes (pôles) */
window.KScreens = window.KScreens || {};
window.KScreens.equipes = function (el, K) {
  // Permissions dérivées du rôle (libellés cabinet, badge cohérent)
  function permOf(role) {
    const r = (role || "").toLowerCase();
    if (r.indexOf("associé") >= 0) return { lab: "Admin", badge: "badge-warning" };
    if (r.indexOf("chef") >= 0) return { lab: "Manager", badge: "badge-tva" };
    return { lab: "Standard", badge: "badge-muted" };
  }
  // compte des dossiers gérés par un collaborateur
  function dossiersDe(collId) {
    return K.get("dossiers").filter(d => d.gestionnaire === collId).length;
  }

  function cartesEquipes() {
    const equipes = K.get("equipes");
    if (!equipes.length) return `<div class="empty">Aucun pôle. Créez votre première équipe.</div>`;
    return equipes.map(eq => {
      const membres = (eq.membres || []).map(id => K.coll(id)).filter(Boolean);
      const avatars = membres.length
        ? membres.map(m => `<span class="ava-sm" style="background:${m.couleur};margin-left:-6px;border:2px solid #fff" title="${K.esc(m.nom)}">${K.esc(m.initiales)}</span>`).join("")
        : `<small class="muted">Aucun membre</small>`;
      return `
        <div class="panel" style="overflow:hidden">
          <div style="height:5px;background:${eq.couleur}"></div>
          <div class="panel-body">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem">
              <h3 style="font-size:1.05rem;margin:0">${K.esc(eq.nom)}</h3>
              <span class="badge badge-muted">${membres.length} pers.</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:.4rem;margin:.6rem 0 .9rem">
              <b style="font-size:1.7rem;color:${eq.couleur}">${eq.dossiers}</b>
              <small class="muted" style="font-weight:600">dossiers affectés</small>
            </div>
            <div style="display:flex;align-items:center;padding-left:6px;margin-bottom:1rem">${avatars}</div>
            <button class="btn btn-outline btn-sm" data-affecter="${eq.id}" style="width:100%">Affecter un dossier</button>
          </div>
        </div>`;
    }).join("");
  }

  function lignesColl() {
    const list = K.get("collaborateurs");
    if (!list.length) return `<tr><td colspan="5"><div class="empty">Aucun collaborateur.</div></td></tr>`;
    return list.map(c => {
      const p = permOf(c.role);
      const nb = dossiersDe(c.id);
      return `
        <tr>
          <td class="dossier-cell"><span class="ava-sm" style="background:${c.couleur}">${K.esc(c.initiales)}</span>
            <div>${K.esc(c.nom)}</div></td>
          <td>${K.esc(c.role)}</td>
          <td>${K.esc(c.equipe)}</td>
          <td style="text-align:right;font-weight:700">${nb}</td>
          <td style="text-align:right"><span class="badge ${p.badge}">${p.lab}</span></td>
        </tr>`;
    }).join("");
  }

  function render() {
    const nbEquipes = K.get("equipes").length;
    const nbColl = K.get("collaborateurs").length;
    const nbAffectes = K.get("dossiers").filter(d => d.gestionnaire).length;

    el.innerHTML = `
      <div style="margin-bottom:1.2rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-end;justify-content:space-between">
        <div>
          <div style="font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#e3a008">Organisation par pôle ou par client</div>
          <h2 style="font-size:1.6rem;margin-top:.2rem">Gestion des équipes</h2>
        </div>
        <button class="btn btn-gold btn-sm" id="newEq">+ Créer une équipe</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi"><div class="ki ki-blue">👥</div><div><b>${nbEquipes}</b><small>Équipes</small></div></div>
        <div class="kpi"><div class="ki ki-purple">🧑‍💼</div><div><b>${nbColl}</b><small>Collaborateurs</small></div></div>
        <div class="kpi"><div class="ki ki-gold">📁</div><div><b>${nbAffectes}</b><small>Dossiers affectés</small></div></div>
      </div>

      <div class="kpi-grid" id="eqGrid" style="margin-bottom:1.4rem">${cartesEquipes()}</div>

      <div class="panel">
        <div class="panel-head"><h3>Collaborateurs</h3><div class="right"><span class="badge badge-muted">${nbColl} membres</span></div></div>
        <table class="kt">
          <thead><tr><th>Collaborateur</th><th>Rôle</th><th>Équipe</th><th style="text-align:right">Dossiers gérés</th><th style="text-align:right">Permissions</th></tr></thead>
          <tbody>${lignesColl()}</tbody>
        </table>
      </div>`;

    el.querySelectorAll("[data-affecter]").forEach(b => {
      b.onclick = () => {
        const eq = K.byId("equipes", b.dataset.affecter);
        K.toast("Dossier à affecter au " + (eq ? eq.nom : "pôle") + " (démo)");
      };
    });

    el.querySelector("#newEq").onclick = () => {
      const nom = (window.prompt("Nom du nouveau pôle :", "Pôle ") || "").trim();
      if (!nom) return;
      K.add("equipes", { nom: nom, membres: [], couleur: "#0ea5e9", dossiers: 0 });
      K.toast("Équipe « " + nom + " » créée ✓");
      render();
    };
  }
  render();
};
