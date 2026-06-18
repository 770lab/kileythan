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

  /* ---- finances simulées (déterministes par dossier) ---- */
  K.parseCA = (s) => {
    if (!s) return 600000;
    const m = String(s).replace(/\s/g, "").replace(",", ".");
    const num = parseFloat(m);
    if (/M/i.test(s)) return Math.round(num * 1e6);
    if (/k/i.test(s)) return Math.round(num * 1e3);
    return Math.round(num) || 600000;
  };
  K._hash = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; };
  K.eur = (n) => Math.round(n).toLocaleString("fr-FR") + " €";
  K.finances = (dossier) => {
    const d = typeof dossier === "string" ? K.dossier(dossier) : dossier;
    const ca = K.parseCA(d.ca);
    const seed = K._hash(d.id + d.secteur);
    const r = (i) => ((K._hash(d.id + i) % 1000) / 1000); // 0..1 déterministe par axe

    // structure de charges (% du CA) selon secteur, perturbée par dossier
    const base = {
      "Tech": { achats: 14, externes: 22, perso: 40, impots: 3, amort: 6, fin: 2 },
      "Conseil": { achats: 6, externes: 20, perso: 46, impots: 3, amort: 3, fin: 1 },
      "Santé": { achats: 18, externes: 16, perso: 44, impots: 4, amort: 7, fin: 2 },
      "BTP": { achats: 38, externes: 14, perso: 30, impots: 3, amort: 5, fin: 3 },
      "Alimentation": { achats: 42, externes: 16, perso: 28, impots: 3, amort: 4, fin: 2 },
      "Automobile": { achats: 46, externes: 12, perso: 26, impots: 3, amort: 4, fin: 3 },
      "Artisanat": { achats: 34, externes: 14, perso: 30, impots: 3, amort: 4, fin: 2 },
    }[d.secteur] || { achats: 25, externes: 18, perso: 36, impots: 3, amort: 5, fin: 2 };

    const labels = {
      achats: "Achats / marchandises", externes: "Charges externes (loyers, honoraires…)",
      perso: "Charges de personnel", impots: "Impôts & taxes",
      amort: "Dotations aux amortissements", fin: "Charges financières",
    };
    const lines = Object.keys(base).map((k, i) => {
      const pct = Math.max(1, base[k] + (r(k) * 8 - 4)); // ±4 pts
      return { key: k, label: labels[k], pct: +pct.toFixed(1), montant: Math.round(ca * pct / 100) };
    });
    const totalChargesPct = lines.reduce((s, l) => s + l.pct, 0);
    const margePct = +(100 - totalChargesPct).toFixed(1);
    const resultat = Math.round(ca * margePct / 100);
    const treso = Math.round(ca * (0.04 + r("t") * 0.22));         // 4–26% du CA
    const capitaux = Math.round(ca * (0.18 + r("c") * 0.4));
    const dettes = Math.round(ca * (0.1 + r("d") * 0.45));
    const dettesFisc = r("f") > 0.6 ? Math.round(ca * (0.01 + r("g") * 0.04)) : 0;
    const dso = Math.round(28 + r("s") * 70);                      // délai clients (jours)
    const endettementPct = +((dettes / Math.max(capitaux, 1)) * 100).toFixed(0);
    return { ca, lines, totalChargesPct: +totalChargesPct.toFixed(1), margePct, resultat, treso, capitaux, dettes, dettesFisc, dso, endettementPct };
  };

  window.K = K;
})();
