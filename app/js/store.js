/* KILEYT — store: persistance localStorage + session + helpers */
(function () {
  const DB_KEY = "kileyt_db_v1";
  const SESSION_KEY = "kileyt_session_v1";

  function load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const fresh = JSON.parse(JSON.stringify(window.KILEYT_SEED));
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }

  let db = load();

  const K = {
    /* ---- data ---- */
    db,
    save() { localStorage.setItem(DB_KEY, JSON.stringify(this.db)); },
    reset() { localStorage.removeItem(DB_KEY); db = load(); this.db = db; return db; },
    get(col) { return this.db[col] || []; },
    byId(col, id) { return (this.db[col] || []).find(x => x.id === id); },
    add(col, obj) { obj.id = obj.id || (col[0] + Date.now().toString(36)); this.db[col].unshift(obj); this.save(); return obj; },
    update(col, id, patch) { const o = this.byId(col, id); if (o) { Object.assign(o, patch); this.save(); } return o; },
    remove(col, id) { this.db[col] = this.db[col].filter(x => x.id !== id); this.save(); },

    /* ---- helpers ---- */
    coll(id) { return this.byId("collaborateurs", id) || { nom: "—", initiales: "?", couleur: "#94a3b8" }; },
    dossier(id) { return this.byId("dossiers", id) || { nom: "—" }; },
    dossierNom(id) { return this.dossier(id).nom; },

    /* ---- session ---- */
    session() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } },
    login(email) {
      const s = { email: email || "demo@kileyt.fr", ts: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      return s;
    },
    logout() { localStorage.removeItem(SESSION_KEY); },
  };

  /* ---- formatting utils ---- */
  K.fmtDate = (iso) => {
    if (!iso || iso.indexOf("-") < 0) return iso || "—";
    const [y, m, d] = iso.split("-");
    const mois = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    return `${parseInt(d, 10)} ${mois[parseInt(m, 10) - 1]} ${y}`;
  };
  K.daysTo = (iso) => {
    if (!iso || iso.indexOf("-") < 0) return null;
    const now = new Date("2026-06-18T00:00:00");
    const t = new Date(iso + "T00:00:00");
    return Math.round((t - now) / 86400000);
  };
  K.statutLabel = { valide: "Validée", attente: "En attente", retard: "En retard", encours: "En cours", termine: "Terminé" };
  K.statutBadge = { valide: "badge-success", attente: "badge-warning", retard: "badge-danger", encours: "badge-tva", termine: "badge-muted" };
  K.typeBadge = { TVA: "badge-tva", IS: "badge-is", CFE: "badge-cfe", CVAE: "badge-cvae", BILAN: "badge-bilan", DCA: "badge-bilan", AGO: "badge-is", TF: "badge-warning" };
  K.esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  window.K = K;
})();
