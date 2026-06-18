/* KILEYT — écran de connexion */
window.KScreens = window.KScreens || {};
window.KScreens.login = function (root, K) {
  root.innerHTML = `
  <div class="login-wrap">
    <aside class="login-aside">
      <div class="glow"></div>
      <a class="logo" href="../index.html"><span class="logo-mark">K</span><span><span class="lo-accent">Kil</span>Eyt</span></a>
      <div>
        <h2>Simplifie ton quotidien</h2>
        <p class="lead">Le quotidien de votre cabinet simplifié et centralisé.</p>
        <div style="margin-top:1.5rem">
          <div class="login-feat">Échéances synchronisées avec impots.gouv</div>
          <div class="login-feat">CRM, GED et tâches en un seul espace</div>
          <div class="login-feat">Assistant IA disponible 24/7</div>
        </div>
      </div>
      <small style="color:hsl(var(--text-light));position:relative">© 2026 KilEyt — démo UX</small>
    </aside>
    <main class="login-main">
      <div class="login-card">
        <h2>Heureux de vous revoir</h2>
        <p class="muted" style="margin-bottom:1.4rem">Connectez-vous pour accéder à votre cabinet.</p>
        <button class="oauth-btn" id="oauthG">🟦 Se connecter avec Google</button>
        <button class="oauth-btn" id="oauthM">🟦 Se connecter avec Microsoft</button>
        <div class="divider">ou</div>
        <form id="loginForm">
          <div class="field"><label>Adresse email</label><input type="email" id="email" value="demo@kileyt.fr" required></div>
          <div class="field"><label>Mot de passe</label><input type="password" id="pwd" value="demo1234" required></div>
          <button class="btn btn-gold" type="submit" style="width:100%">Se connecter</button>
        </form>
        <p style="margin-top:1rem;font-size:.85rem" class="muted">Pas de compte ? <a class="gold-text" style="font-weight:700" href="#" id="reg">Créer un compte</a> · <a href="#" class="muted" id="fp">Mot de passe oublié ?</a></p>
        <div style="margin-top:1.4rem;padding:.8rem;background:hsl(var(--gold)/.12);border-radius:.6rem;font-size:.82rem;font-weight:600">💡 Démo : cliquez simplement sur « Se connecter » — données de test pré-chargées.</div>
      </div>
    </main>
  </div>`;

  const enter = (email) => { K.login(email); location.hash = "#/dashboard"; window.KRoute(); };
  document.getElementById("loginForm").addEventListener("submit", (e) => { e.preventDefault(); enter(document.getElementById("email").value); });
  document.getElementById("oauthG").addEventListener("click", () => enter("demo.google@kileyt.fr"));
  document.getElementById("oauthM").addEventListener("click", () => enter("demo.ms@kileyt.fr"));
  document.getElementById("reg").addEventListener("click", (e) => { e.preventDefault(); enter("nouveau@kileyt.fr"); });
  document.getElementById("fp").addEventListener("click", (e) => e.preventDefault());
};
