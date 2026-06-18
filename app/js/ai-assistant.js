/* KILEYT — Assistant IA 24/7 (widget flottant, présent sur chaque page) */
(function () {
  const K = window.K;
  const QA = [
    { k: ["tva", "export", "valider", "validation"], a: "Va sur <b>Échéances</b>, applique les filtres <b>Type : TVA</b> et <b>Statut : En attente</b>, puis clique sur <b>Exporter Excel</b> en haut à droite." },
    { k: ["echeance", "échéance", "deadline", "synchro"], a: "Les échéances TVA, IS, CFE et CVAE sont synchronisées automatiquement depuis impots.gouv. Retrouve-les dans <b>Échéances</b> et la vue agrégée dans <b>Synthèse</b>." },
    { k: ["tache", "tâche", "affecter", "kanban"], a: "Crée une tâche depuis <b>Tâches</b> → bouton <b>Nouvelle tâche</b>. Tu peux l'affecter à un collaborateur ou une équipe, définir une priorité et une échéance." },
    { k: ["crm", "prospect", "client"], a: "Le <b>CRM</b> est un pipeline Kanban. Glisse une carte de colonne en colonne pour faire avancer le prospect, jusqu'à <b>Gagné</b> qui déclenche l'onboarding." },
    { k: ["ged", "document", "piece", "pièce", "manquant"], a: "Dans la <b>GED</b>, les pièces manquantes apparaissent en rouge. Clique sur <b>Demander la pièce</b> pour relancer le client en un clic." },
    { k: ["bilan", "cloture", "clôture", "dca", "ago", "depot", "dépôt"], a: "Le suivi des <b>Bilans</b> récupère les dates de clôture. Le <b>Dépôt des comptes</b> distingue l'approbation (AGO) et le dépôt au greffe (DCA)." },
    { k: ["humain", "support", "aide"], a: "Je transfère ta demande au support humain. Un membre de l'équipe Kileyt te répond sous peu. 🤝" },
    { k: ["bonjour", "salut", "hello", "coucou"], a: "Bonjour 👋 Je suis l'assistant Kileyt. Pose-moi une question sur les échéances, le CRM, la GED, les tâches…" },
  ];
  const QUICK = ["Exporter les TVA en attente ?", "Comment créer une tâche ?", "À quoi sert la Synthèse ?", "Parler à un humain"];

  function answer(q) {
    const low = q.toLowerCase();
    for (const item of QA) if (item.k.some(w => low.includes(w))) return item.a;
    return "Bonne question ! Je connais tout Kileyt : échéances, CRM, GED, tâches, bilans, attestations… Reformule, ou clique sur <b>Support humain</b> pour parler à l'équipe.";
  }

  const KAI = {
    mounted: false,
    mount() {
      if (document.getElementById("aiFab")) return;
      const fab = document.createElement("button");
      fab.id = "aiFab"; fab.className = "ai-fab"; fab.title = "Assistant Kileyt"; fab.innerHTML = "💬";
      const panel = document.createElement("div");
      panel.className = "ai-panel"; panel.id = "aiPanel";
      panel.innerHTML = `
        <div class="ai-top">
          <div class="av">K</div>
          <div style="flex:1"><b>Assistant Kileyt</b><br><small style="color:hsl(var(--success))">● En ligne · répond en quelques secondes</small></div>
          <button class="icon-btn" id="aiClose" style="background:hsl(var(--foreground)/.1);color:#fff">✕</button>
        </div>
        <div class="ai-msgs" id="aiMsgs">
          <div class="ai-b ai">Bonjour 👋 Je suis l'assistant Kileyt, dispo 24/7. Comment puis-je aider ?</div>
        </div>
        <div class="ai-quick" id="aiQuick">${QUICK.map(q => `<button>${q}</button>`).join("")}</div>
        <div class="ai-input"><input id="aiInput" placeholder="Posez votre question…"><button class="btn btn-gold btn-sm" id="aiSend">➤</button></div>`;
      document.body.appendChild(fab); document.body.appendChild(panel);

      const msgs = panel.querySelector("#aiMsgs");
      const add = (txt, who) => { const b = document.createElement("div"); b.className = "ai-b " + who; b.innerHTML = txt; msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight; };
      const ask = (q) => {
        if (!q.trim()) return;
        add(K.esc(q), "me");
        const typing = document.createElement("div"); typing.className = "ai-b ai"; typing.textContent = "…"; msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
        setTimeout(() => { typing.remove(); add(answer(q), "ai"); }, 650);
      };
      fab.addEventListener("click", () => panel.classList.toggle("open"));
      panel.querySelector("#aiClose").addEventListener("click", () => panel.classList.remove("open"));
      panel.querySelector("#aiSend").addEventListener("click", () => { const i = panel.querySelector("#aiInput"); ask(i.value); i.value = ""; });
      panel.querySelector("#aiInput").addEventListener("keydown", (e) => { if (e.key === "Enter") { ask(e.target.value); e.target.value = ""; } });
      panel.querySelectorAll("#aiQuick button").forEach(b => b.addEventListener("click", () => ask(b.textContent)));
    }
  };
  window.KAI = KAI;
})();
