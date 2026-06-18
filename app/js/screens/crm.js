/* KILEYT — CRM & Suivi prospects (pipeline kanban) */
window.KScreens = window.KScreens || {};
window.KScreens.crm = function (el, K) {
  const COLS = [
    ["nouveau", "Nouveau"],
    ["qualifie", "Qualifié"],
    ["rdv", "RDV"],
    ["negociation", "Négociation"],
    ["gagne", "Gagné"],
  ];

  function card(p) {
    return `
      <div class="kan-card" draggable="true" data-id="${K.esc(p.id)}">
        <div style="font-weight:700;color:#0d1b2e">${K.esc(p.nom)}</div>
        <div style="font-size:.8rem;color:hsl(var(--text-muted));margin-top:.15rem">${K.esc(p.contact || "—")}</div>
        <div style="margin-top:.5rem"><span class="badge badge-tva">${K.esc(p.valeur || "—")}</span></div>
        ${p.note ? `<div class="meta">📝 ${K.esc(p.note)}</div>` : ""}
        <div class="meta">📅 ${p.date ? K.fmtDate(p.date) : "—"}</div>
      </div>`;
  }

  function col(id, label) {
    const list = K.get("prospects").filter(p => p.statut === id);
    const body = list.length
      ? list.map(card).join("")
      : `<div class="empty" style="font-size:.78rem;padding:.6rem">Aucun prospect</div>`;
    return `
      <div class="kan-col" data-statut="${id}">
        <h4>${label}<span class="n">${list.length}</span></h4>
        <div class="kan-body" data-statut="${id}">${body}</div>
      </div>`;
  }

  function render() {
    const all = K.get("prospects");
    const actifs = all.filter(p => p.statut !== "gagne").length;
    const nego = all.filter(p => p.statut === "negociation").length;
    const gagnes = all.filter(p => p.statut === "gagne" && (p.date || "").slice(0, 7) === "2026-06").length;

    el.innerHTML = `
    <div class="panel-head" style="border:none;padding:0 0 1rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
      <h3 style="margin:0">Pipeline commercial</h3>
      <div class="right" style="margin-left:auto"><button class="btn btn-gold btn-sm" id="addProspect">+ Nouveau prospect</button></div>
    </div>

    <div class="kpi-grid" style="margin-bottom:1.2rem">
      <div class="kpi"><span class="ki ki-blue">👥</span><div><b>${actifs}</b><small>Prospects actifs</small></div></div>
      <div class="kpi"><span class="ki ki-gold">🤝</span><div><b>${nego}</b><small>En négociation</small></div></div>
      <div class="kpi"><span class="ki ki-green">🏆</span><div><b>${gagnes}</b><small>Gagnés ce mois</small></div></div>
    </div>

    <div class="kanban" id="crmBoard" style="--cols:5">
      ${COLS.map(([id, label]) => col(id, label)).join("")}
    </div>`;

    // Bouton ajout
    el.querySelector("#addProspect").onclick = () => {
      const nom = (window.prompt("Nom du prospect ?") || "").trim();
      if (!nom) return;
      K.add("prospects", { nom, statut: "nouveau", contact: "—", valeur: "Nouveau", date: "2026-06-18", note: "" });
      K.toast("Prospect ajouté ✓");
      render();
    };

    // Drag & drop HTML5
    let dragId = null;

    el.querySelectorAll(".kan-card").forEach(c => {
      c.addEventListener("dragstart", () => {
        dragId = c.dataset.id;
        c.classList.add("dragging");
      });
      c.addEventListener("dragend", () => {
        dragId = null;
        c.classList.remove("dragging");
      });
    });

    el.querySelectorAll(".kan-col").forEach(zone => {
      zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("drop");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("drop"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("drop");
        if (!dragId) return;
        const newStatut = zone.dataset.statut;
        const p = K.byId("prospects", dragId);
        if (!p || p.statut === newStatut) { render(); return; }
        K.update("prospects", dragId, { statut: newStatut });
        const lbl = (COLS.find(c => c[0] === newStatut) || [, newStatut])[1];
        K.toast(`Prospect déplacé → ${lbl}`);
        render();
      });
    });
  }

  render();
};
