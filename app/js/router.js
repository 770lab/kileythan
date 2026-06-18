/* KILEYT — router + app shell */
(function () {
  const K = window.K;
  window.KScreens = window.KScreens || {};

  const NAV = [
    { section: "Principal", items: [
      { id: "dashboard", label: "Tableau de bord", ico: "▦" },
      { id: "echeances", label: "Échéances", ico: "📅" },
      { id: "synthese", label: "Synthèse", ico: "📊" },
    ]},
    { section: "Fiscal", items: [
      { id: "cvae", label: "Suivi CVAE", ico: "📈" },
      { id: "bilans", label: "Bilans", ico: "📚" },
      { id: "depot", label: "Dépôt comptes (DCA/AGO)", ico: "🏛️" },
      { id: "habilitations", label: "Habilitations", ico: "🔐" },
      { id: "attestations", label: "Attestations", ico: "📜" },
    ]},
    { section: "Relation client", items: [
      { id: "crm", label: "CRM prospects", ico: "👥" },
      { id: "onboarding", label: "Onboarding INPI", ico: "🚀" },
      { id: "messagerie", label: "Messagerie", ico: "✉️" },
    ]},
    { section: "Production", items: [
      { id: "taches", label: "Tâches", ico: "✓" },
      { id: "ged", label: "GED", ico: "📁" },
      { id: "equipes", label: "Équipes", ico: "🧩" },
    ]},
  ];
  const TITLES = {};
  NAV.forEach(s => s.items.forEach(i => TITLES[i.id] = i.label));
  TITLES.parametres = "Paramètres";

  const COUNTS = () => ({
    echeances: K.get("echeances").filter(e => e.statut === "attente" || e.statut === "retard").length,
    messagerie: K.get("messages").filter(m => !m.lu).length,
    taches: K.get("taches").filter(t => t.statut !== "termine").length,
  });

  function navHTML(active) {
    const c = COUNTS();
    return NAV.map(sec => `
      <div class="nav-section">${sec.section}</div>
      ${sec.items.map(i => `
        <a class="nav-item ${i.id === active ? "active" : ""}" href="#/${i.id}">
          <span class="ico">${i.ico}</span><span>${i.label}</span>
          ${c[i.id] ? `<span class="count">${c[i.id]}</span>` : ""}
        </a>`).join("")}
    `).join("");
  }

  function renderShell(active) {
    const u = K.db.cabinet.user;
    document.getElementById("root").innerHTML = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="brand"><span class="logo-mark">K</span><span><span style="color:hsl(var(--gold))">Ki</span>leyt</span></div>
        <nav id="navList">${navHTML(active)}</nav>
        <a class="nav-item" href="#/parametres" style="margin:.4rem .7rem"><span class="ico">⚙️</span><span>Paramètres</span></a>
        <div class="side-foot">
          <div class="ava">${u.initiales}</div>
          <div style="font-size:.82rem"><b style="color:#fff">${u.prenom} ${u.nom}</b><br><span style="color:hsl(var(--sidebar-foreground)/.7)">${u.role}</span></div>
          <button class="icon-btn" title="Déconnexion" style="margin-left:auto;background:transparent;color:hsl(var(--sidebar-foreground))" onclick="K.logout();location.hash='';location.reload()">⏻</button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="icon-btn mobile-burger" onclick="document.getElementById('sidebar').classList.toggle('open')" style="display:none">☰</button>
          <h1 id="screenTitle">${TITLES[active] || ""}</h1>
          <div class="search"><input placeholder="Rechercher un dossier, une échéance…"></div>
          <div class="tb-actions">
            <button class="icon-btn" title="Notifications"><span class="dot"></span>🔔</button>
            <button class="icon-btn" title="Aide">？</button>
            <div class="ava-sm" style="background:hsl(var(--navy-light))">${u.initiales}</div>
          </div>
        </header>
        <main class="screen" id="screen"></main>
      </div>
    </div>`;
    if (window.matchMedia("(max-width:900px)").matches) {
      const b = document.querySelector(".mobile-burger"); if (b) b.style.display = "grid";
    }
    window.KAI && window.KAI.mount();
  }

  function mountScreen(name) {
    const el = document.getElementById("screen");
    const fn = window.KScreens[name];
    if (typeof fn === "function") {
      try { fn(el, K); }
      catch (e) { el.innerHTML = `<div class="empty">Erreur d'affichage du module.<br><small>${K.esc(e.message)}</small></div>`; console.error(e); }
    } else {
      el.innerHTML = `<div class="empty"><div style="font-size:2.5rem">🧩</div><h3>Module « ${TITLES[name] || name} »</h3><p>En cours de finalisation.</p></div>`;
    }
  }

  function route() {
    if (!K.session()) { window.KScreens.login(document.getElementById("root"), K); return; }
    let name = (location.hash.replace(/^#\/?/, "") || "dashboard").split("?")[0];
    if (!TITLES[name]) name = "dashboard";
    renderShell(name);
    document.getElementById("screenTitle").textContent = TITLES[name];
    mountScreen(name);
    window.scrollTo(0, 0);
  }

  K.toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(K._tt); K._tt = setTimeout(() => t.classList.remove("show"), 2400);
  };
  K.go = (name) => { location.hash = "#/" + name; };

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
  window.KRoute = route;
})();
