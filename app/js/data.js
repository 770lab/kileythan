/* KILEYT — Données de TEST (cabinet fictif). Persistées en localStorage. */
(function () {
  const SEED = {
    cabinet: { nom: "Cabinet Démo Kileyt", user: { prenom: "Davy", nom: "Cohen", role: "Associé", initiales: "DC" } },

    collaborateurs: [
      { id: "c1", nom: "Davy Cohen", initiales: "DC", role: "Associé", couleur: "#e3a008", equipe: "Direction" },
      { id: "c2", nom: "Marie Lévy", initiales: "ML", role: "Chef de mission", couleur: "#9333ea", equipe: "Pôle TVA" },
      { id: "c3", nom: "Paul Trabelsi", initiales: "PT", role: "Collaborateur", couleur: "#0ea5e9", equipe: "Pôle TVA" },
      { id: "c4", nom: "Anaïs Cohen", initiales: "AC", role: "Collaboratrice", couleur: "#16a34a", equipe: "Pôle social" },
      { id: "c5", nom: "Jonas Dahan", initiales: "JD", role: "Collaborateur", couleur: "#dc2626", equipe: "Pôle juridique" },
    ],
    equipes: [
      { id: "e1", nom: "Pôle TVA", membres: ["c2", "c3"], couleur: "#0ea5e9", dossiers: 64 },
      { id: "e2", nom: "Pôle social", membres: ["c4"], couleur: "#16a34a", dossiers: 38 },
      { id: "e3", nom: "Pôle juridique", membres: ["c5"], couleur: "#9333ea", dossiers: 22 },
      { id: "e4", nom: "Direction", membres: ["c1"], couleur: "#e3a008", dossiers: 24 },
    ],

    dossiers: [
      { id: "d1", nom: "SAS Martin", siren: "812 045 221", forme: "SAS", secteur: "Conseil", gestionnaire: "c2", equipe: "e1", cloture: "31/12", ca: "1,2 M€", regime: "Réel normal" },
      { id: "d2", nom: "Dupont SARL", siren: "509 871 334", forme: "SARL", secteur: "BTP", gestionnaire: "c3", equipe: "e1", cloture: "31/12", ca: "780 k€", regime: "Réel simplifié" },
      { id: "d3", nom: "Lemoine & Associés", siren: "440 112 908", forme: "SELARL", secteur: "Santé", gestionnaire: "c2", equipe: "e1", cloture: "30/06", ca: "560 k€", regime: "Réel normal" },
      { id: "d4", nom: "Boulangerie Aizenberg", siren: "893 220 145", forme: "EURL", secteur: "Alimentation", gestionnaire: "c4", equipe: "e2", cloture: "31/12", ca: "310 k€", regime: "Réel simplifié" },
      { id: "d5", nom: "TechNova SAS", siren: "901 556 002", forme: "SAS", secteur: "Tech", gestionnaire: "c5", equipe: "e3", cloture: "31/03", ca: "2,4 M€", regime: "Réel normal" },
      { id: "d6", nom: "Garage Benhamou", siren: "388 990 451", forme: "SARL", secteur: "Automobile", gestionnaire: "c3", equipe: "e1", cloture: "31/12", ca: "640 k€", regime: "Réel simplifié" },
      { id: "d7", nom: "Atelier Zenou", siren: "775 332 120", forme: "EI", secteur: "Artisanat", gestionnaire: "c4", equipe: "e2", cloture: "31/12", ca: "120 k€", regime: "Micro-BIC" },
      { id: "d8", nom: "Clinique Bellevue", siren: "612 778 339", forme: "SAS", secteur: "Santé", gestionnaire: "c2", equipe: "e1", cloture: "31/12", ca: "5,1 M€", regime: "Réel normal" },
    ],

    // types: TVA, IS, CFE, CVAE, BILAN, DCA, AGO, TF (taxe foncière)
    echeances: [
      { id: "ec1", dossier: "d1", type: "TVA", periode: "Mai 2026", date: "2026-06-19", statut: "valide", montant: "8 420 €", coll: "c2" },
      { id: "ec2", dossier: "d2", type: "IS", periode: "Acompte 2T", date: "2026-06-15", statut: "attente", montant: "12 300 €", coll: "c3" },
      { id: "ec3", dossier: "d3", type: "CFE", periode: "2026", date: "2026-06-15", statut: "retard", montant: "1 980 €", coll: "c2" },
      { id: "ec4", dossier: "d4", type: "TVA", periode: "Mai 2026", date: "2026-06-19", statut: "valide", montant: "2 110 €", coll: "c4" },
      { id: "ec5", dossier: "d5", type: "CVAE", periode: "2026", date: "2026-06-30", statut: "attente", montant: "4 600 €", coll: "c5" },
      { id: "ec6", dossier: "d6", type: "TVA", periode: "Mai 2026", date: "2026-06-19", statut: "attente", montant: "3 250 €", coll: "c3" },
      { id: "ec7", dossier: "d8", type: "BILAN", periode: "Exercice 2025", date: "2026-06-30", statut: "encours", montant: "—", coll: "c2" },
      { id: "ec8", dossier: "d1", type: "AGO", periode: "Exercice 2025", date: "2026-06-30", statut: "attente", montant: "—", coll: "c2" },
      { id: "ec9", dossier: "d2", type: "DCA", periode: "Exercice 2025", date: "2026-07-31", statut: "attente", montant: "—", coll: "c3" },
      { id: "ec10", dossier: "d5", type: "IS", periode: "Solde 2025", date: "2026-05-15", statut: "valide", montant: "31 900 €", coll: "c5" },
      { id: "ec11", dossier: "d3", type: "TVA", periode: "Avr 2026", date: "2026-05-19", statut: "valide", montant: "5 200 €", coll: "c2" },
      { id: "ec12", dossier: "d7", type: "CFE", periode: "2026", date: "2026-12-15", statut: "attente", montant: "510 €", coll: "c4" },
      { id: "ec13", dossier: "d8", type: "TF", periode: "2026", date: "2026-10-15", statut: "attente", montant: "9 200 €", coll: "c2" },
      { id: "ec14", dossier: "d6", type: "BILAN", periode: "Exercice 2025", date: "2026-04-30", statut: "valide", montant: "—", coll: "c3" },
    ],

    taches: [
      { id: "t1", titre: "Préparer la liasse fiscale", dossier: "d1", coll: "c2", priorite: "haute", statut: "afaire", echeance: "2026-06-25", tags: ["Liasse", "Urgent"] },
      { id: "t2", titre: "Relancer pièces manquantes", dossier: "d4", coll: "c4", priorite: "normale", statut: "afaire", echeance: "2026-06-20", tags: ["Relance"] },
      { id: "t3", titre: "Révision des comptes Q1", dossier: "d5", coll: "c5", priorite: "normale", statut: "encours", echeance: "2026-06-22", tags: ["Révision"] },
      { id: "t4", titre: "Validation TVA mai", dossier: "d2", coll: "c3", priorite: "haute", statut: "encours", echeance: "2026-06-19", tags: ["TVA"] },
      { id: "t5", titre: "Rédiger le PV d'AGO", dossier: "d1", coll: "c5", priorite: "normale", statut: "afaire", echeance: "2026-06-28", tags: ["Juridique"] },
      { id: "t6", titre: "Dépôt des comptes au greffe", dossier: "d6", coll: "c3", priorite: "basse", statut: "termine", echeance: "2026-05-30", tags: ["Dépôt"] },
      { id: "t7", titre: "Entretien bilan annuel", dossier: "d8", coll: "c2", priorite: "urgent", statut: "afaire", echeance: "2026-06-21", tags: ["RDV", "Bilan"] },
      { id: "t8", titre: "Paramétrer accès Pennylane", dossier: "d3", coll: "c2", priorite: "basse", statut: "termine", echeance: "2026-06-10", tags: ["Setup"] },
    ],

    prospects: [
      { id: "p1", nom: "Restaurant Le Sépharade", contact: "Y. Amsellem", statut: "nouveau", valeur: "Startup · 80 dos.", date: "2026-06-12", note: "Recommandé par SAS Martin" },
      { id: "p2", nom: "Cabinet d'archi Studio Nord", contact: "L. Berdah", statut: "qualifie", valeur: "Seed · 40 dos.", date: "2026-06-10", note: "Démo prévue" },
      { id: "p3", nom: "E-commerce KipaShop", contact: "D. Sebban", statut: "rdv", valeur: "Growth · 200 dos.", date: "2026-06-08", note: "Intéressé par sync Pennylane" },
      { id: "p4", nom: "Holding Finkelstein", contact: "M. Finkelstein", statut: "negociation", valeur: "Scale · 500 dos.", date: "2026-06-05", note: "Devis envoyé" },
      { id: "p5", nom: "Clinique dentaire Roth", contact: "S. Roth", statut: "gagne", valeur: "Startup · 100 dos.", date: "2026-06-01", note: "Onboarding lancé" },
      { id: "p6", nom: "Transport Azoulay", contact: "É. Azoulay", statut: "qualifie", valeur: "Seed · 30 dos.", date: "2026-06-11", note: "À rappeler vendredi" },
    ],

    messages: [
      { id: "m1", objet: "Problème de paiement sur la TVA d'avril", dossier: "d2", apercu: "Bonjour, nous avons un souci sur le prélèvement…", date: "2026-06-17", lu: false, type: "DGFiP" },
      { id: "m2", objet: "Réclamation sur le CFE / IFER", dossier: "d3", apercu: "Suite à votre courrier du 5 juin concernant…", date: "2026-06-16", lu: false, type: "DGFiP" },
      { id: "m3", objet: "Réclamation sur la TVA (RCM)", dossier: "d5", apercu: "La déclaration rectificative a bien été prise…", date: "2026-06-15", lu: true, type: "DGFiP" },
      { id: "m4", objet: "Demande de pièces — bilan 2025", dossier: "d8", apercu: "Merci de nous transmettre les relevés…", date: "2026-06-14", lu: true, type: "Client" },
      { id: "m5", objet: "Attestation de régularité fiscale", dossier: "d1", apercu: "Votre attestation est disponible au téléchargement.", date: "2026-06-13", lu: true, type: "DGFiP" },
    ],

    documents: [
      { id: "g1", nom: "Liasse fiscale 2025.pdf", dossier: "d1", type: "Fiscal", taille: "1,2 Mo", date: "2026-06-12", statut: "classe" },
      { id: "g2", nom: "Relevés bancaires Q1.pdf", dossier: "d5", type: "Banque", taille: "880 Ko", date: "2026-06-10", statut: "classe" },
      { id: "g3", nom: "Kbis.pdf", dossier: "d4", type: "Juridique", taille: "210 Ko", date: "2026-06-09", statut: "classe" },
      { id: "g4", nom: "Facture fournisseur — manquante", dossier: "d2", type: "Pièce", taille: "—", date: "2026-06-08", statut: "manquant" },
      { id: "g5", nom: "Statuts mis à jour.docx", dossier: "d3", type: "Juridique", taille: "64 Ko", date: "2026-06-05", statut: "classe" },
      { id: "g6", nom: "Justificatif TVA — manquant", dossier: "d6", type: "Pièce", taille: "—", date: "2026-06-04", statut: "manquant" },
    ],

    onboarding: [
      { etape: "Fiche client créée", fait: true },
      { etape: "Données INPI synchronisées (statut, dirigeants)", fait: true },
      { etape: "Mandat impots.gouv signé", fait: true },
      { etape: "Pièces justificatives collectées", fait: false },
      { etape: "Connexion Pennylane configurée", fait: false },
      { etape: "Dossier affecté à un gestionnaire", fait: true },
    ],
  };

  // expose
  window.KILEYT_SEED = SEED;
})();
