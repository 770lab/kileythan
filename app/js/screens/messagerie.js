/* KILEYT — Messagerie sécurisée */
window.KScreens = window.KScreens || {};
window.KScreens.messagerie = function (el, K) {
  const state = { filtre: "tous", openId: null };
  const FILTRES = [["tous", "Tous"], ["nonlu", "Non lus"], ["DGFiP", "DGFiP"], ["Client", "Client"]];

  function all() {
    return K.get("messages").slice().sort((a, b) => b.date.localeCompare(a.date));
  }

  function filtered() {
    let list = all();
    if (state.filtre === "nonlu") list = list.filter(m => !m.lu);
    else if (state.filtre === "DGFiP") list = list.filter(m => m.type === "DGFiP");
    else if (state.filtre === "Client") list = list.filter(m => m.type === "Client");
    return list;
  }

  function corps(m) {
    const sender = m.type === "DGFiP" ? "Direction générale des Finances publiques" : "Espace client KilEyt";
    return `
      <p style="margin:0 0 1rem">Bonjour,</p>
      <p style="margin:0 0 1rem">${K.esc(m.apercu)}</p>
      <p style="margin:0 0 1rem">Ce message concerne le dossier <b>${K.esc(K.dossierNom(m.dossier))}</b> (SIREN ${K.esc(K.dossier(m.dossier).siren || "—")}). Merci de prendre connaissance des éléments transmis et de revenir vers nous sous huit jours si une régularisation s'avère nécessaire.</p>
      <p style="margin:0 0 1rem">Vous trouverez le détail complet ainsi que les pièces associées dans l'espace dédié. N'hésitez pas à nous contacter pour toute question relative à cette correspondance.</p>
      <p style="margin:0">Cordialement,<br><b>${K.esc(sender)}</b></p>`;
  }

  function readerPanel(m) {
    const c = K.coll(m.dossier ? K.dossier(m.dossier).gestionnaire : null);
    return `
    <div class="panel" style="margin-bottom:1rem">
      <div class="panel-head">
        <h3>${K.esc(m.objet)}</h3>
        <div class="right"><button class="btn btn-outline btn-sm" id="closeMsg">✕ Fermer</button></div>
      </div>
      <div class="panel-body">
        <div style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid hsl(var(--border))">
          <span class="ava-sm" style="background:${c.couleur}">${K.esc(c.initiales)}</span>
          <div style="flex:1;min-width:180px">
            <div style="font-weight:700">${K.esc(K.dossierNom(m.dossier))}</div>
            <small class="muted" style="font-weight:500">${K.fmtDate(m.date)}</small>
          </div>
          <span class="badge ${m.type === "DGFiP" ? "badge-is" : "badge-tva"}">${K.esc(m.type)}</span>
        </div>
        <div style="line-height:1.6;color:hsl(var(--ink))">${corps(m)}</div>
        <div style="display:flex;gap:.6rem;margin-top:1.4rem">
          <button class="btn btn-gold btn-sm" id="replyMsg">Répondre</button>
          <button class="btn btn-navy btn-sm" id="archiveMsg">Archiver</button>
        </div>
      </div>
    </div>`;
  }

  function listRows() {
    const list = filtered();
    if (!list.length) return `<div class="empty">Aucun message pour ce filtre.</div>`;
    return list.map(m => `
      <div class="msg-row" data-msg="${m.id}" style="display:flex;align-items:center;gap:.85rem;padding:.85rem 1.1rem;border-bottom:1px solid hsl(var(--border));cursor:pointer;${m.id === state.openId ? "background:hsl(var(--bg-soft,210 40% 98%))" : ""}">
        <span style="width:9px;height:9px;border-radius:50%;flex:none;background:${m.lu ? "transparent" : (m.type === "DGFiP" ? "#ffd23a" : "#3b82f6")}"></span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:.5rem">
            <span style="font-weight:${m.lu ? "600" : "800"};color:#0d1b2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${K.esc(m.objet)}</span>
            <span class="badge ${m.type === "DGFiP" ? "badge-is" : "badge-tva"}" style="flex:none">${K.esc(m.type)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.2rem">
            <span class="badge badge-muted" style="flex:none">${K.esc(K.dossierNom(m.dossier))}</span>
            <small class="muted" style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${K.esc(m.apercu)}</small>
          </div>
        </div>
        <small class="muted" style="font-weight:600;white-space:nowrap;flex:none">${K.fmtDate(m.date)}</small>
      </div>`).join("");
  }

  function render() {
    const msgs = all();
    const total = msgs.length;
    const nonlus = msgs.filter(m => !m.lu).length;
    const dgfip = msgs.filter(m => m.type === "DGFiP").length;
    const open = state.openId ? K.byId("messages", state.openId) : null;

    el.innerHTML = `
    <div class="kpi-grid" style="margin-bottom:1rem">
      <div class="kpi"><span class="ki ki-blue">✉</span><div><b>${total}</b><small>Messages</small></div></div>
      <div class="kpi"><span class="ki ki-gold">●</span><div><b>${nonlus}</b><small>Non lus</small></div></div>
      <div class="kpi"><span class="ki ki-purple">⚖</span><div><b>${dgfip}</b><small>DGFiP</small></div></div>
    </div>

    ${open ? readerPanel(open) : ""}

    <div class="panel">
      <div class="panel-head">
        <h3>Messagerie sécurisée${nonlus ? ` <span class="badge badge-warning">${nonlus} non lu${nonlus > 1 ? "s" : ""}</span>` : ""}</h3>
        <div class="right">
          <div class="seg" id="filtreSeg">
            ${FILTRES.map(([v, l]) => `<button class="${v === state.filtre ? "on" : ""}" data-filtre="${v}">${l}${v === "nonlu" && nonlus ? ` (${nonlus})` : ""}</button>`).join("")}
          </div>
        </div>
      </div>
      <div id="msgList">${listRows()}</div>
    </div>`;

    el.querySelectorAll("#filtreSeg button").forEach(b => b.onclick = () => { state.filtre = b.dataset.filtre; render(); });
    el.querySelectorAll(".msg-row").forEach(r => r.onclick = () => {
      const id = r.dataset.msg;
      K.update("messages", id, { lu: true });
      state.openId = id;
      render();
    });

    const closeBtn = el.querySelector("#closeMsg");
    if (closeBtn) closeBtn.onclick = () => { state.openId = null; render(); };
    const replyBtn = el.querySelector("#replyMsg");
    if (replyBtn) replyBtn.onclick = () => K.toast("Réponse envoyée (démo)");
    const archiveBtn = el.querySelector("#archiveMsg");
    if (archiveBtn) archiveBtn.onclick = () => { K.toast("Message archivé ✓"); state.openId = null; render(); };
  }

  render();
};
