/* KILEYT — Fiche dossier : détail + import de pièce + analyse IA */
window.KScreens = window.KScreens || {};
window.KScreens.dossier = function (el, K) {
  const id = (location.hash.split("?")[1] || "").replace(/^id=/, "") || K.get("dossiers")[0].id;
  const d = K.dossier(id);
  if (!d || !d.nom || d.nom === "—") { el.innerHTML = `<div class="empty">Dossier introuvable. <a href="#/dossiers">← Retour</a></div>`; return; }
  const tt = document.getElementById("screenTitle"); if (tt) tt.textContent = d.nom;
  const c = K.coll(d.gestionnaire);
  const f = K.finances(d);
  const ech = K.get("echeances").filter(e => e.dossier === id);
  const tch = K.get("taches").filter(t => t.dossier === id);

  // médianes sectorielles (pour repérer les dépenses élevées)
  const MED = { achats: 25, externes: 18, perso: 38, impots: 3, amort: 5, fin: 2 };
  const jours = (montant) => Math.round(montant / (f.ca / 365)); // exprime un montant en jours de CA

  /* ---------- Compte-rendu IA (Bilan) ---------- */
  function reportBilan() {
    const tresoJours = jours(f.treso);
    const trop = f.lines.filter(l => l.pct > (MED[l.key] || 100) + 3).sort((a, b) => (b.pct - MED[b.key]) - (a.pct - MED[a.key])).slice(0, 2);
    const margeQual = f.margePct >= 12 ? "solide" : f.margePct >= 6 ? "correcte mais perfectible" : "sous pression";

    const depenses = trop.length ? trop.map(l => {
      const ecart = (l.pct - (MED[l.key] || 0)).toFixed(1);
      const eco = Math.round(f.ca * (l.pct - MED[l.key]) / 100);
      return `<li><b>${l.label} : ${l.pct}% du CA</b> (${K.eur(l.montant)}) — soit <b>+${ecart} pts</b> vs la médiane du secteur ${d.secteur} (~${MED[l.key]}%). Ramener ce poste à la médiane libérerait ~<b>${K.eur(eco)}/an</b>.</li>`;
    }).join("") : `<li>Aucun poste de charge nettement au-dessus des références sectorielles. Structure de coûts maîtrisée.</li>`;

    const invest = [];
    if (tresoJours > 60) invest.push(`Trésorerie confortable (<b>${K.eur(f.treso)}</b>, soit ${tresoJours} jours de CA) : capacité d'investissement disponible. Acquérir du <b>matériel / outil numérique amortissable</b> réduit la base imposable à l'IS.`);
    if (f.lines.find(l => l.key === "amort").pct < 4) invest.push(`Faible niveau d'amortissements (${f.lines.find(l => l.key === "amort").pct}%) : l'outil de production vieillit. <b>Investir</b> pour rester compétitif et générer un bouclier fiscal.`);
    if (f.margePct >= 12) invest.push(`Marge nette supérieure à la moyenne : réinvestir une partie du résultat dans la <b>croissance</b> (recrutement commercial, acquisition clients, R&D).`);
    if (!invest.length) invest.push(`Prioriser la <b>reconstitution de trésorerie</b> avant tout nouvel investissement : viser 60+ jours de CA en réserve.`);

    const vig = [];
    if (tresoJours < 35) vig.push(`Trésorerie tendue (${tresoJours} jours de CA) — surveiller le BFR et étaler les gros décaissements.`);
    if (f.dso > 60) vig.push(`Délai de règlement clients élevé (<b>DSO ${f.dso} j</b>) — mettre en place des relances automatiques et l'acompte à la commande.`);
    if (f.dettesFisc > 0) vig.push(`Dettes fiscales en cours (<b>${K.eur(f.dettesFisc)}</b>) — risque sur l'attestation de régularité ; négocier un échéancier DGFiP.`);
    if (f.endettementPct > 80) vig.push(`Endettement élevé (${f.endettementPct}% des capitaux propres) — limiter le recours à de nouveaux emprunts.`);
    if (!vig.length) vig.push(`Aucun signal d'alerte majeur. Situation financière saine.`);

    const reco = [];
    if (trop.length) reco.push(`Lancer un plan d'action sur « ${trop[0].label.toLowerCase()} » : objectif −${(trop[0].pct - MED[trop[0].key]).toFixed(0)} pts de CA sur 12 mois.`);
    if (f.dso > 55) reco.push(`Activer le module Tâches « relance recouvrement » et viser un DSO < 45 jours.`);
    reco.push(tresoJours > 60 ? `Planifier un investissement amortissable avant la clôture du ${d.cloture} pour optimiser l'IS.` : `Constituer un matelas de trésorerie équivalent à 2 mois de charges.`);
    reco.push(`Préparer un rendez-vous bilan avec le dirigeant pour arbitrer rémunération / dividendes / réinvestissement.`);

    return `
      <div class="rep-block rep-syn"><h4>🧠 Synthèse</h4><p>Sur un chiffre d'affaires de <b>${K.eur(f.ca)}</b>, le résultat net ressort à <b>${K.eur(f.resultat)}</b> (marge nette <b>${f.margePct}%</b>, ${margeQual}). Total des charges : ${f.totalChargesPct}% du CA.</p></div>
      <div class="rep-block rep-down"><h4>🔻 Là où il faut calmer les dépenses</h4><ul class="rep-list">${depenses}</ul></div>
      <div class="rep-block rep-up"><h4>📈 Là où il faut investir</h4><ul class="rep-list">${invest.map(x => `<li>${x}</li>`).join("")}</ul></div>
      <div class="rep-block rep-warn"><h4>⚠️ Points de vigilance</h4><ul class="rep-list">${vig.map(x => `<li>${x}</li>`).join("")}</ul></div>
      <div class="rep-block rep-ok"><h4>✅ Recommandations</h4><ol class="rep-list">${reco.map(x => `<li>${x}</li>`).join("")}</ol></div>`;
  }

  /* ---------- Compte-rendu IA (Avis d'impôt) ---------- */
  function reportAvis() {
    const is15 = Math.round(Math.min(f.resultat, 42500) * 0.15);
    const isExtra = Math.round(Math.max(0, f.resultat - 42500) * 0.25);
    const is = Math.max(0, is15 + isExtra);
    const cfe = Math.round(f.ca * 0.004 + 800);
    return `
      <div class="rep-block rep-syn"><h4>🧠 Synthèse</h4><p>Avis rapproché du résultat fiscal estimé (<b>${K.eur(f.resultat)}</b>). IS théorique : <b>${K.eur(is)}</b> (taux réduit 15% jusqu'à 42 500 € puis 25%). CFE estimée : <b>${K.eur(cfe)}</b>.</p></div>
      <div class="rep-block rep-down"><h4>🔻 Optimisation de la charge fiscale</h4><ul class="rep-list">
        <li>Vérifier l'éligibilité au <b>taux réduit d'IS à 15%</b> (capital libéré, CA < 10 M€, détention 75% personnes physiques).</li>
        <li>Charges déductibles à sécuriser avant clôture : <b>amortissements, provisions, frais généraux justifiés</b>.</li></ul></div>
      <div class="rep-block rep-up"><h4>📈 Leviers</h4><ul class="rep-list">
        <li>Investissement amortissable avant le ${d.cloture} → décale et réduit l'IS.</li>
        <li>Arbitrage <b>rémunération / dividendes</b> pour optimiser charge globale dirigeant + société.</li></ul></div>
      <div class="rep-block rep-warn"><h4>⚠️ Vigilance</h4><ul class="rep-list">
        <li>Acomptes d'IS à provisionner (15/03, 15/06, 15/09, 15/12).</li>
        ${f.dettesFisc > 0 ? `<li>Dettes fiscales en cours : <b>${K.eur(f.dettesFisc)}</b> — régulariser pour l'attestation.</li>` : `<li>Aucune dette fiscale détectée.</li>`}</ul></div>`;
  }

  function extractTable(kind) {
    if (kind === "Avis d'impôt") {
      const is = Math.max(0, Math.round(Math.min(f.resultat, 42500) * 0.15 + Math.max(0, f.resultat - 42500) * 0.25));
      return `<table class="kt"><tbody>
        <tr><td>Résultat fiscal</td><td style="text-align:right;font-weight:700">${K.eur(f.resultat)}</td></tr>
        <tr><td>IS estimé</td><td style="text-align:right;font-weight:700">${K.eur(is)}</td></tr>
        <tr><td>CFE estimée</td><td style="text-align:right">${K.eur(Math.round(f.ca * 0.004 + 800))}</td></tr>
        <tr><td>Exercice</td><td style="text-align:right">2025 (clôture ${K.esc(d.cloture)})</td></tr>
      </tbody></table>`;
    }
    return `<table class="kt"><tbody>
      <tr><td>Chiffre d'affaires</td><td style="text-align:right;font-weight:700">${K.eur(f.ca)}</td></tr>
      ${f.lines.map(l => `<tr><td>${l.label}</td><td style="text-align:right">${K.eur(l.montant)} <small class="muted">(${l.pct}%)</small></td></tr>`).join("")}
      <tr style="background:hsl(var(--gold)/.1)"><td><b>Résultat net</b></td><td style="text-align:right"><b>${K.eur(f.resultat)} (${f.margePct}%)</b></td></tr>
      <tr><td>Trésorerie</td><td style="text-align:right">${K.eur(f.treso)}</td></tr>
      <tr><td>Capitaux propres</td><td style="text-align:right">${K.eur(f.capitaux)}</td></tr>
      <tr><td>Dettes financières</td><td style="text-align:right">${K.eur(f.dettes)} <small class="muted">(${f.endettementPct}% CP)</small></td></tr>
      <tr><td>Délai clients (DSO)</td><td style="text-align:right">${f.dso} jours</td></tr>
    </tbody></table>`;
  }

  // score de santé /100
  function score() {
    let s = 50;
    s += Math.min(25, f.margePct);                 // marge
    s += jours(f.treso) > 45 ? 12 : jours(f.treso) > 25 ? 6 : -6;
    s += f.dso < 45 ? 8 : f.dso < 65 ? 2 : -6;
    s += f.endettementPct < 60 ? 8 : f.endettementPct < 90 ? 2 : -6;
    s -= f.dettesFisc > 0 ? 8 : 0;
    return Math.max(15, Math.min(98, Math.round(s)));
  }

  function detectKind(name) {
    const n = (name || "").toLowerCase();
    if (/avis|impot|impôt|2042|2065|imposition|\bir\b|\bcfe\b/.test(n)) return "Avis d'impôt";
    return "Bilan"; // bilan / liasse / 2050 / compte de résultat / fec / défaut
  }

  function renderAnalysis(name, kind) {
    const sc = score();
    const out = el.querySelector("#analysisOut");
    out.innerHTML = `
      <div class="panel" style="border:2px solid hsl(var(--gold)/.5)">
        <div class="panel-head" style="background:hsl(var(--gold)/.08)">
          <span class="doc-pill">📄 ${K.esc(name)}</span>
          <h3 style="margin-left:.4rem">Pièce reconnue : <span class="gold-text">${kind}</span></h3>
          <div class="right"><span class="badge badge-success">✓ Lecture réussie</span></div>
        </div>
        <div class="panel-body">
          <div class="col-2" style="align-items:start">
            <div>
              <h4 style="margin-bottom:.6rem">Données extraites</h4>
              ${extractTable(kind)}
            </div>
            <div style="text-align:center">
              <h4 style="margin-bottom:.6rem">Score de santé</h4>
              <div class="donut" data-label="${sc}/100" style="--p:${sc};margin:0 auto"></div>
              <p class="muted" style="font-size:.82rem;margin-top:.6rem">${sc >= 75 ? "Situation saine 🟢" : sc >= 55 ? "À surveiller 🟡" : "Fragile 🔴"}</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.6rem;margin:1.4rem 0 1rem">
            <div class="ava" style="width:34px;height:34px;border-radius:9px;background:hsl(var(--gold));color:hsl(var(--navy-dark));display:grid;place-items:center;font-weight:800">K</div>
            <b>Compte-rendu de l'assistant IA KilEyt</b>
            <span class="badge badge-tva" style="margin-left:auto">Généré en 1,4 s</span>
          </div>
          ${kind === "Avis d'impôt" ? reportAvis() : reportBilan()}
          <div style="display:flex;gap:.6rem;margin-top:1.2rem;flex-wrap:wrap">
            <button class="btn btn-navy btn-sm" id="repExport">⬇ Exporter le compte-rendu (PDF)</button>
            <button class="btn btn-outline btn-sm" id="repTask">＋ Créer une tâche de suivi</button>
            <button class="btn btn-outline btn-sm" id="repAgain">↻ Analyser une autre pièce</button>
          </div>
        </div>
      </div>`;
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    out.querySelector("#repExport").onclick = () => K.toast("Compte-rendu exporté en PDF (démo)");
    out.querySelector("#repAgain").onclick = () => { out.innerHTML = ""; el.querySelector("#fileInput").value = ""; };
    out.querySelector("#repTask").onclick = () => {
      K.add("taches", { titre: "Suivi analyse — " + kind, dossier: id, coll: d.gestionnaire, priorite: "normale", statut: "afaire", echeance: "2026-06-30", tags: ["IA", "Suivi"] });
      K.toast("Tâche de suivi créée ✓");
    };
  }

  function analyze(name) {
    const kind = detectKind(name);
    const out = el.querySelector("#analysisOut");
    out.innerHTML = `<div class="panel"><div class="panel-body" style="text-align:center;padding:2.4rem">
      <div class="spinner"></div>
      <h3 style="margin-top:1rem">Lecture de « ${K.esc(name)} »…</h3>
      <p class="muted" id="anStep">Reconnaissance du document</p></div></div>`;
    const steps = ["Reconnaissance du document…", "Extraction des données comptables…", "Analyse des ratios financiers…", "Génération du compte-rendu IA…"];
    let i = 0;
    const stepEl = out.querySelector("#anStep");
    const iv = setInterval(() => { i++; if (stepEl && steps[i]) stepEl.textContent = steps[i]; }, 380);
    setTimeout(() => {
      clearInterval(iv);
      // ajoute la pièce à la GED
      K.add("documents", { nom: name, dossier: id, type: kind === "Avis d'impôt" ? "Fiscal" : "Bilan", taille: "—", date: "2026-06-18", statut: "classe" });
      renderAnalysis(name, kind);
      K.toast("Analyse IA terminée ✓");
    }, 1600);
  }

  /* ---------- rendu de la fiche ---------- */
  const docs = () => K.get("documents").filter(g => g.dossier === id);
  el.innerHTML = `
    <a href="#/dossiers" class="muted" style="display:inline-flex;gap:.4rem;font-weight:700;margin-bottom:1rem">← Tous les dossiers</a>
    <div class="panel"><div class="panel-body" style="display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap">
      <span class="ava-sm" style="width:54px;height:54px;font-size:1.1rem;background:${c.couleur}">${c.initiales}</span>
      <div style="flex:1;min-width:200px">
        <h2 style="font-size:1.5rem">${K.esc(d.nom)}</h2>
        <p class="muted">${K.esc(d.siren)} · ${K.esc(d.forme)} · ${K.esc(d.secteur)} · ${K.esc(d.regime)}</p>
      </div>
      <div style="display:flex;gap:1.5rem;text-align:right">
        <div><small class="muted">Gestionnaire</small><br><b>${K.esc(c.nom)}</b></div>
        <div><small class="muted">Clôture</small><br><b>${K.esc(d.cloture)}</b></div>
        <div><small class="muted">CA</small><br><b>${K.esc(d.ca)}</b></div>
      </div>
    </div></div>

    <div class="kpi-grid">
      <div class="kpi"><div class="ki ki-blue">📅</div><div><b>${ech.length}</b><small>Échéances</small></div></div>
      <div class="kpi"><div class="ki ki-green">✓</div><div><b>${tch.length}</b><small>Tâches</small></div></div>
      <div class="kpi"><div class="ki ki-gold">📁</div><div><b>${docs().length}</b><small>Documents</small></div></div>
      <div class="kpi"><div class="ki ki-purple">💶</div><div><b>${f.margePct}%</b><small>Marge nette (est.)</small></div></div>
    </div>

    <div class="panel" id="importPanel">
      <div class="panel-head"><h3>📥 Importer une pièce</h3><div class="right"><span class="muted" style="font-size:.82rem">Bilan, avis d'impôt, liasse fiscale…</span></div></div>
      <div class="panel-body">
        <div class="dropzone" id="dropzone">
          <div style="font-size:2.2rem">📄⬆️</div>
          <b>Glissez un fichier ici</b> ou <span class="gold-text" style="font-weight:700">parcourez</span>
          <p class="muted" style="font-size:.82rem;margin-top:.3rem">PDF, image ou scan. L'IA reconnaît le type et génère un compte-rendu.</p>
          <input type="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg,.csv,.txt" hidden>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.9rem;flex-wrap:wrap">
          <span class="muted" style="font-size:.82rem;align-self:center">Pas de fichier sous la main ?</span>
          <button class="btn btn-outline btn-sm" data-demo="Bilan 2025 - ${K.esc(d.nom)}.pdf">📊 Tester avec un bilan</button>
          <button class="btn btn-outline btn-sm" data-demo="Avis d'impot IS 2025.pdf">🧾 Tester avec un avis d'impôt</button>
        </div>
      </div>
    </div>

    <div id="analysisOut"></div>

    <div class="col-2">
      <div class="panel"><div class="panel-head"><h3>Échéances du dossier</h3></div>
        <table class="kt"><tbody>
          ${ech.length ? ech.map(e => `<tr><td><span class="badge ${K.typeBadge[e.type] || "badge-muted"}">${e.type}</span></td><td>${K.esc(e.periode)}</td><td>${K.fmtDate(e.date)}</td><td style="text-align:right"><span class="badge ${K.statutBadge[e.statut]}">${K.statutLabel[e.statut]}</span></td></tr>`).join("") : `<tr><td><div class="empty">Aucune échéance.</div></td></tr>`}
        </tbody></table></div>
      <div class="panel"><div class="panel-head"><h3>Documents (GED)</h3></div>
        <table class="kt"><tbody id="docRows">
          ${docs().length ? docs().map(g => `<tr><td>📄 ${K.esc(g.nom)}</td><td><span class="badge badge-muted">${K.esc(g.type)}</span></td><td style="text-align:right">${K.fmtDate(g.date)}</td></tr>`).join("") : `<tr><td><div class="empty">Aucun document. Importez-en un ci-dessus.</div></td></tr>`}
        </tbody></table></div>
    </div>`;

  // wiring upload
  const fi = el.querySelector("#fileInput");
  const dz = el.querySelector("#dropzone");
  dz.onclick = () => fi.click();
  fi.onchange = () => { if (fi.files[0]) analyze(fi.files[0].name); };
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("drag"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
  dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("drag"); if (e.dataTransfer.files[0]) analyze(e.dataTransfer.files[0].name); });
  el.querySelectorAll("[data-demo]").forEach(b => b.onclick = () => analyze(b.dataset.demo));
};
