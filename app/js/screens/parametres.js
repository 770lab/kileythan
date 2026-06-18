/* KILEYT — Paramètres (cabinet, intégrations, notifications, démo, compte) */
window.KScreens = window.KScreens || {};
window.KScreens.parametres = function (el, K) {
  const cab = (K.db && K.db.cabinet) || {};
  const user = cab.user || {};

  const INTEGRATIONS = [
    { nom: "impots.gouv.fr", desc: "Télédéclarations EDI-TVA et EDI-TDFC", etat: "Connecté" },
    { nom: "Pennylane", desc: "Synchronisation comptable et bancaire", etat: "Synchronisé" },
    { nom: "INPI", desc: "Dépôt des comptes annuels au greffe", etat: "Connecté" },
    { nom: "Pappers", desc: "Enrichissement des fiches dossiers (SIREN)", etat: "Connecté" },
  ];

  const NOTIFS = [
    { id: "n_echeances", label: "Échéances fiscales", desc: "Rappels J-7 et J-1 avant chaque échéance", on: true },
    { id: "n_dgfip", label: "Messages DGFiP", desc: "Nouveaux courriers reçus dans la messagerie", on: true },
    { id: "n_taches", label: "Tâches assignées", desc: "Quand une tâche vous est attribuée", on: false },
  ];

  function intRow(it) {
    return `
      <tr>
        <td>
          <div style="font-weight:700;color:#0d1b2e">${K.esc(it.nom)}</div>
          <div style="font-size:.78rem;color:hsl(var(--text-muted))">${K.esc(it.desc)}</div>
        </td>
        <td><span class="badge badge-success">✓ ${K.esc(it.etat)}</span></td>
        <td style="text-align:right">
          <button class="btn btn-outline btn-sm int-cfg" data-nom="${K.esc(it.nom)}">Configurer</button>
        </td>
      </tr>`;
  }

  function notifRow(n) {
    return `
      <label class="kt-toggle" data-id="${K.esc(n.id)}" style="display:flex;align-items:center;gap:1rem;padding:.75rem 0;border-bottom:1px solid hsl(var(--border));cursor:pointer">
        <input type="checkbox" class="notif-chk" data-id="${K.esc(n.id)}" ${n.on ? "checked" : ""}
          style="width:1.15rem;height:1.15rem;accent-color:#0d1b2e;cursor:pointer">
        <span style="flex:1">
          <span style="display:block;font-weight:600;color:#0d1b2e">${K.esc(n.label)}</span>
          <span style="display:block;font-size:.78rem;color:hsl(var(--text-muted))">${K.esc(n.desc)}</span>
        </span>
      </label>`;
  }

  function render() {
    const nbDossiers = K.get("dossiers").length;
    const nbColls = K.get("collaborateurs").length;

    el.innerHTML = `
    <div class="panel-head" style="border:none;padding:0 0 1rem">
      <h3 style="margin:0">Paramètres</h3>
    </div>

    <div class="col-2" style="align-items:start">
      <div>

        <div class="panel" style="margin-bottom:1.2rem">
          <div class="panel-head"><h3>Cabinet</h3></div>
          <div class="panel-body">
            <div class="field">
              <label>Nom du cabinet</label>
              <input id="cab-nom" type="text" value="${K.esc(cab.nom || "Cabinet Démo KilEyt")}">
            </div>
            <div class="field">
              <label>Email de contact</label>
              <input id="cab-email" type="email" value="${K.esc(cab.email || "contact@cabinet-demo.kileyt.fr")}">
            </div>
            <div class="field">
              <label>SIRET</label>
              <input id="cab-siret" type="text" value="${K.esc(cab.siret || "843 921 047 00018")}">
            </div>
            <div style="font-size:.78rem;color:hsl(var(--text-muted));margin:.2rem 0 .8rem">
              ${nbDossiers} dossiers · ${nbColls} collaborateurs · Responsable ${K.esc(user.prenom || "—")} ${K.esc(user.nom || "")}
            </div>
            <button class="btn btn-gold btn-sm" id="cab-save">Enregistrer</button>
          </div>
        </div>

        <div class="panel" style="margin-bottom:1.2rem">
          <div class="panel-head"><h3>Intégrations</h3></div>
          <div class="panel-body">
            <table class="kt">
              <tbody>${INTEGRATIONS.map(intRow).join("")}</tbody>
            </table>
          </div>
        </div>

      </div>
      <div>

        <div class="panel" style="margin-bottom:1.2rem">
          <div class="panel-head"><h3>Notifications</h3></div>
          <div class="panel-body" style="padding-top:.2rem">
            ${NOTIFS.map(notifRow).join("")}
          </div>
        </div>

        <div class="panel" style="margin-bottom:1.2rem">
          <div class="panel-head"><h3>Données de démo</h3></div>
          <div class="panel-body">
            <p style="margin:0 0 1rem;font-size:.86rem;color:hsl(var(--text-muted));line-height:1.5">
              KilEyt est rempli avec des <b>données de TEST</b> fictives (dossiers, échéances, collaborateurs).
              Toutes les modifications sont enregistrées localement dans votre navigateur.
              Vous pouvez tout remettre à l'état initial à tout moment.
            </p>
            <button class="btn btn-sm" id="data-reset"
              style="background:#fdecec;color:#b91c1c;border:1px solid #f3b4b4">
              🗑 Réinitialiser les données de test
            </button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>Compte</h3></div>
          <div class="panel-body">
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
              <span class="ava-sm" style="background:#0d1b2e">${K.esc(user.initiales || "?")}</span>
              <span>
                <span style="display:block;font-weight:700;color:#0d1b2e">${K.esc(user.prenom || "Utilisateur")} ${K.esc(user.nom || "")}</span>
                <span style="display:block;font-size:.78rem;color:hsl(var(--text-muted))">${K.esc(user.role || "Collaborateur")}</span>
              </span>
            </div>
            <button class="btn btn-outline btn-sm" id="acc-logout">Se déconnecter</button>
          </div>
        </div>

      </div>
    </div>`;

    /* ---- Cabinet : enregistrement ---- */
    el.querySelector("#cab-save").onclick = () => {
      if (K.db) {
        K.db.cabinet = K.db.cabinet || {};
        K.db.cabinet.nom = el.querySelector("#cab-nom").value.trim() || K.db.cabinet.nom;
        K.db.cabinet.email = el.querySelector("#cab-email").value.trim();
        K.db.cabinet.siret = el.querySelector("#cab-siret").value.trim();
        K.save();
      }
      K.toast("Paramètres du cabinet enregistrés ✓");
    };

    /* ---- Intégrations ---- */
    el.querySelectorAll(".int-cfg").forEach(b => {
      b.onclick = () => K.toast(`Configuration ${b.dataset.nom} ouverte`);
    });

    /* ---- Notifications ---- */
    el.querySelectorAll(".notif-chk").forEach(chk => {
      chk.onclick = (e) => {
        e.stopPropagation();
        const n = NOTIFS.find(x => x.id === chk.dataset.id);
        if (n) n.on = chk.checked;
        K.toast(chk.checked ? `${n ? n.label : "Notification"} activée` : `${n ? n.label : "Notification"} désactivée`);
      };
    });

    /* ---- Réinitialisation ---- */
    el.querySelector("#data-reset").onclick = () => {
      if (!window.confirm("Réinitialiser toutes les données de test ? Vos modifications locales seront perdues.")) return;
      K.reset();
      K.toast("Données réinitialisées");
      setTimeout(() => location.reload(), 400);
    };

    /* ---- Déconnexion ---- */
    el.querySelector("#acc-logout").onclick = () => {
      K.logout();
      location.hash = "";
      location.reload();
    };
  }

  render();
};
