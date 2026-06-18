/* KILEYT — marketing shell + scroll UX (parallax, reveal, counters) */
(function () {
  const BRAND = "Kileyt";

  /* ---------- Shared header ---------- */
  const headerHTML = `
  <header class="site-header" id="siteHeader">
    <nav class="nav">
      <a class="logo" href="index.html" aria-label="${BRAND}">
        <span class="logo-mark">K</span><span><span class="lo-accent">Ki</span>leyt</span>
      </a>
      <div class="nav-links">
        <a href="fonctionnalites.html">Fonctionnalités</a>
        <a href="cas-usage.html">Cas d'usage</a>
        <a href="tarifs.html">Tarifs</a>
        <a href="faq.html">FAQ</a>
      </div>
      <div class="nav-actions">
        <a class="btn btn-ghost btn-sm" href="app/" >⟶ Connexion</a>
        <a class="btn btn-gold btn-sm" href="app/">Réserver une démo</a>
        <button class="nav-burger" id="navBurger" aria-label="Menu" style="display:none">☰</button>
      </div>
    </nav>
    <div class="nav-mobile" id="navMobile">
      <a href="fonctionnalites.html">Fonctionnalités</a>
      <a href="cas-usage.html">Cas d'usage</a>
      <a href="tarifs.html">Tarifs</a>
      <a href="faq.html">FAQ</a>
      <a href="app/">Connexion</a>
    </div>
  </header>`;

  /* ---------- Shared footer ---------- */
  const footerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a class="logo" href="index.html" style="margin-bottom:1rem">
          <span class="logo-mark">K</span><span><span class="lo-accent">Ki</span>leyt</span>
        </a>
        <p style="max-width:34ch;color:hsl(var(--text-light))">Le cockpit du cabinet comptable. Échéances, CRM, GED et tâches centralisés en une seule plateforme.</p>
        <p style="margin-top:1rem"><a href="mailto:hello@kileyt.fr">hello@kileyt.fr</a></p>
        <a class="btn btn-outline btn-sm" style="margin-top:1rem;background:transparent;color:#fff;border-color:hsl(var(--foreground)/.2)" href="app/">Réservez une démo</a>
      </div>
      <div>
        <h4>Produit</h4>
        <a href="fonctionnalites.html">Fonctionnalités</a>
        <a href="cas-usage.html">Cas d'usage</a>
        <a href="tarifs.html">Tarifs</a>
        <a href="app/">Application</a>
      </div>
      <div>
        <h4>Ressources</h4>
        <a href="faq.html">FAQ</a>
        <a href="faq.html">Centre d'aide</a>
        <a href="#">Témoignages</a>
      </div>
      <div>
        <h4>Légal</h4>
        <a href="#">Mentions légales</a>
        <a href="#">CGV</a>
        <a href="#">Confidentialité</a>
      </div>
    </div>
    <div class="container footer-bottom">© 2026 ${BRAND}. Tous droits réservés. · Clone de démonstration UX hébergé sur 770lab.com</div>
  </footer>`;

  function inject(id, html) { const el = document.getElementById(id); if (el) el.outerHTML = html; }

  document.addEventListener("DOMContentLoaded", () => {
    inject("mount-header", headerHTML);
    inject("mount-footer", footerHTML);

    /* header scroll state */
    const header = document.getElementById("siteHeader");
    const onScroll = () => { if (header) header.classList.toggle("scrolled", window.scrollY > 20); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* mobile nav */
    const burger = document.getElementById("navBurger");
    const mob = document.getElementById("navMobile");
    if (window.matchMedia("(max-width:900px)").matches && burger) burger.style.display = "block";
    burger && burger.addEventListener("click", () => mob.classList.toggle("open"));

    /* scroll reveal */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal,.reveal-scale").forEach(el => io.observe(el));

    /* count-up */
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
        const dur = 1400, t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (Number.isInteger(target) ? Math.round(target * eased) : (target * eased).toFixed(0)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll("[data-count]").forEach(el => countIO.observe(el));

    /* parallax */
    const px = [...document.querySelectorAll("[data-parallax]")];
    if (px.length) {
      let ticking = false;
      const run = () => {
        const vh = window.innerHeight;
        px.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          const r = el.getBoundingClientRect();
          const offset = (r.top + r.height / 2 - vh / 2) * -speed;
          el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
        });
        ticking = false;
      };
      window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(run); ticking = true; } }, { passive: true });
      run();
    }

    /* hero spotlight follows pointer (desktop) */
    const hero = document.querySelector(".hero");
    if (hero && window.matchMedia("(pointer:fine)").matches) {
      hero.addEventListener("pointermove", (ev) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100) + "%");
        hero.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100) + "%");
      });
    }
  });
})();
