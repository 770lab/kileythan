/* KILEYT — Gestion des tâches (Kanban + Liste) */
window.KScreens = window.KScreens || {};
window.KScreens.taches = function (el, K) {
  const state = { vue: "kanban", form: false };

  const COLS = [
    ["afaire", "À faire"],
    ["encours", "En cours"],
    ["termine", "Terminé"],
  ];
  const PRIO = [
    ["urgent", "Urgent", "badge-danger"],
    ["haute", "Haute", "badge-warning"],
    ["normale", "Normale", "badge-tva"],
    ["basse", "Basse", "badge-muted"],
  ];
  const prioBadge = (p) => (PRIO.find(x => x[0] === p) || [, p, "badge-muted"])[2];
  const prioLabel = (p) => (PRIO.find(x => x[0] === p) || [, p])[1];

  function kpis() {
    const t = K.get("taches");
    const afaire = t.filter(x => x.statut === "afaire").length;
    const encours = t.filter(x => x.statut === "encours").length;
    const termine = t.filter(x => x.statut === "termine").length;
    const retard = t.filter(x => x.statut !== "termine" && K.daysTo(x.echeance) != null && K.daysTo(x.echeance) < 0).length;
    return `
      <div class="kpi-grid">
        <div class="kpi"><div class="ki ki-blue">📋</div><div><b>${afaire}</b><small>À faire</small></div></div>
        <div class="kpi"><div class="ki ki-purple">⏳</div><div><b>${encours}</b><small>En cours</small></div></div>
        <div class="kpi"><div class="ki ki-green">✓</div><div><b>${termine}</b><small>Terminées</small></div></div>
        <div class="kpi"><div class="ki ki-red">⚠</div><div><b>${retard}</b><small>En retard</small></div></div>
      </div>`;
  }

  function cardHtml(t) {
    const c = K.coll(t.coll);
    const d = K.daysTo(t.echeance);
    const retard = t.statut !== "termine" && d != null && d < 0;
    const tags = (t.tags || []).map(tg => `<span class="badge badge-muted" style="font-weight:600">${K.esc(tg)}</span>`).join(" ");
    return `
      <div class="kan-card" draggable="true" data-id="${t.id}">
        <b>${K.esc(t.titre)}</b>
        <div style="margin:.45rem 0"><span class="badge ${prioBadge(t.priorite)}">${prioLabel(t.priorite)}</span></div>
        <div class="meta">
          <span class="ava-sm" style="background:${c.couleur}">${K.esc(c.initiales)}</span>
          <span>${K.esc(K.dossierNom(t.dossier))}</span>
        </div>
        <div class="meta" style="margin-top:.35rem">
          <small ${retard ? 'style="color:hsl(var(--danger));font-weight:700"' : 'class="muted"'}>📅 ${K.fmtDate(t.echeance)}${retard ? " · en retard" : ""}</small>
        </div>
        ${tags ? `<div style="margin-top:.45rem;display:flex;gap:.3rem;flex-wrap:wrap">${tags}</div>` : ""}
      </div>`;
  }

  function kanbanHtml() {
    return `
      <div class="kanban" style="--cols:3" id="kanban">
        ${COLS.map(([k, label]) => {
          const list = K.get("taches").filter(t => t.statut === k);
          return `
            <div class="kan-col" data-col="${k}">
              <h4>${label} <span class="n">${list.length}</span></h4>
              ${list.length ? list.map(cardHtml).join("") : `<div class="empty" style="padding:1.2rem;font-size:.85rem">Aucune tâche</div>`}
            </div>`;
        }).join("")}
      </div>`;
  }

  function listHtml() {
    const list = K.get("taches").slice().sort((a, b) => (a.echeance || "").localeCompare(b.echeance || ""));
    if (!list.length) return `<div class="panel"><div class="panel-body"><div class="empty">Aucune tâche.</div></div></div>`;
    return `
      <div class="panel">
        <table class="kt">
          <thead><tr><th>Tâche</th><th>Dossier</th><th>Priorité</th><th>Échéance</th><th>Collaborateur</th><th style="text-align:right">Statut</th></tr></thead>
          <tbody>
            ${list.map(t => {
              const c = K.coll(t.coll);
              const d = K.daysTo(t.echeance);
              const retard = t.statut !== "termine" && d != null && d < 0;
              return `
                <tr>
                  <td><b>${K.esc(t.titre)}</b>${(t.tags || []).length ? `<br><small class="muted">${t.tags.map(K.esc).join(" · ")}</small>` : ""}</td>
                  <td>${K.esc(K.dossierNom(t.dossier))}</td>
                  <td><span class="badge ${prioBadge(t.priorite)}">${prioLabel(t.priorite)}</span></td>
                  <td ${retard ? 'style="color:hsl(var(--danger));font-weight:700"' : ""}>${K.fmtDate(t.echeance)}</td>
                  <td class="dossier-cell"><span class="ava-sm" style="background:${c.couleur}">${K.esc(c.initiales)}</span><span>${K.esc(c.nom)}</span></td>
                  <td style="text-align:right"><span class="badge ${COL_BADGE[t.statut] || "badge-muted"}">${COL_LABEL[t.statut] || t.statut}</span></td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  const COL_LABEL = { afaire: "À faire", encours: "En cours", termine: "Terminé" };
  const COL_BADGE = { afaire: "badge-warning", encours: "badge-tva", termine: "badge-success" };

  function formHtml() {
    if (!state.form) return "";
    const dossiers = K.get("dossiers");
    const colls = K.get("collaborateurs");
    return `
      <div class="panel" id="taskForm">
        <div class="panel-head"><h3>Nouvelle tâche</h3><div class="right"><button class="btn btn-outline btn-sm" id="formClose">✕ Annuler</button></div></div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div class="field" style="grid-column:1/-1"><label>Titre</label><input id="fTitre" type="text" placeholder="Ex. Préparer la liasse fiscale"></div>
            <div class="field"><label>Dossier</label><select id="fDossier">${dossiers.map(d => `<option value="${d.id}">${K.esc(d.nom)}</option>`).join("")}</select></div>
            <div class="field"><label>Priorité</label><select id="fPrio">${PRIO.map(p => `<option value="${p[0]}"${p[0] === "normale" ? " selected" : ""}>${p[1]}</option>`).join("")}</select></div>
            <div class="field"><label>Échéance</label><input id="fEch" type="date" value="2026-06-25"></div>
            <div class="field"><label>Collaborateur</label><select id="fColl">${colls.map(c => `<option value="${c.id}">${K.esc(c.nom)}</option>`).join("")}</select></div>
          </div>
          <div style="margin-top:1rem"><button class="btn btn-gold" id="formCreate">Créer la tâche</button></div>
        </div>
      </div>`;
  }

  function render() {
    el.innerHTML = `
      ${kpis()}
      <div class="panel-head" style="border:none;padding:1rem 0;display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
        <div class="seg" id="vueSeg">
          <button class="${state.vue === "kanban" ? "on" : ""}" data-vue="kanban">Kanban</button>
          <button class="${state.vue === "liste" ? "on" : ""}" data-vue="liste">Liste</button>
        </div>
        <div class="right" style="margin-left:auto"><button class="btn btn-gold btn-sm" id="newTask">+ Nouvelle tâche</button></div>
      </div>
      ${formHtml()}
      ${state.vue === "kanban" ? kanbanHtml() : listHtml()}`;

    el.querySelectorAll("#vueSeg button").forEach(b => b.onclick = () => { state.vue = b.dataset.vue; render(); });
    el.querySelector("#newTask").onclick = () => { state.form = !state.form; render(); };

    const close = el.querySelector("#formClose");
    if (close) close.onclick = () => { state.form = false; render(); };
    const create = el.querySelector("#formCreate");
    if (create) create.onclick = () => {
      const titre = (el.querySelector("#fTitre").value || "").trim();
      if (!titre) { K.toast("Renseignez un titre"); return; }
      K.add("taches", {
        titre,
        dossier: el.querySelector("#fDossier").value,
        coll: el.querySelector("#fColl").value,
        priorite: el.querySelector("#fPrio").value,
        echeance: el.querySelector("#fEch").value,
        statut: "afaire",
        tags: [],
      });
      state.form = false;
      K.toast("Tâche créée ✓");
      render();
    };

    if (state.vue === "kanban") wireDnd();
  }

  function wireDnd() {
    let dragId = null;
    el.querySelectorAll(".kan-card").forEach(card => {
      card.addEventListener("dragstart", () => { dragId = card.dataset.id; card.classList.add("dragging"); });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
    });
    el.querySelectorAll(".kan-col").forEach(col => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drop"); });
      col.addEventListener("dragleave", () => col.classList.remove("drop"));
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("drop");
        if (!dragId) return;
        const t = K.byId("taches", dragId);
        const ns = col.dataset.col;
        if (t && t.statut !== ns) {
          K.update("taches", dragId, { statut: ns });
          K.toast("Tâche déplacée → " + (COL_LABEL[ns] || ns));
        }
        dragId = null;
        render();
      });
    });
  }

  render();
};
