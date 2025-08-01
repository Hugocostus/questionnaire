let sessionId = crypto.randomUUID();
let startTime = Date.now();
let submitted = false; // Flag pour savoir si le questionnaire est soumis

// Envoi heartbeat toutes les 10 sec
setInterval(() => {
  fetch("https://questionnaire-65ht.onrender.com/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      timestamp: Date.now(),
    }),
  });
}, 10000);

// Signaler abandon si page fermée sans soumission
window.addEventListener("beforeunload", (event) => {
  if (submitted) return; // Pas d’abandon si questionnaire soumis

  const data = JSON.stringify({
    sessionId,
    startTime,
    endTime: Date.now(),
  });

  // navigator.sendBeacon attend un Blob ou un FormData pour header application/octet-stream par défaut
  // donc on force un Blob JSON avec type application/json pour que le serveur comprenne
  const blob = new Blob([data], { type: "application/json" });
  navigator.sendBeacon("https://questionnaire-65ht.onrender.com/abandon", blob);
});

// Envoi du questionnaire
document.getElementById("btnEnvoyer").addEventListener("click", () => {
  const data = {
    sessionId,
    startTime,
    endTime: Date.now(),
    dateSoumission: new Date().toISOString(),
    parcours: document.getElementById("parcours").value,
    annee: document.getElementById("annee").value,
    asso: document.getElementById("asso").value,
    pourquoi: document.getElementById("pourquoi").value.trim(),
    frequence: document.getElementById("frequence").value,
    investissement: document.getElementById("investissement").value,
    liste: document.getElementById("liste").value,
    evenements: document.getElementById("evenements").value,
    baguette: document.getElementById("magie").value.trim(),
  };

  if (
    !data.parcours ||
    !data.annee ||
    !data.asso ||
    !data.frequence ||
    !data.investissement ||
    !data.liste ||
    !data.evenements
  ) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  fetch("https://questionnaire-65ht.onrender.com/enregistrer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur lors de l'envoi");
      submitted = true; // Marquer comme soumis
      alert("Questionnaire bien envoyé !");
    })
    .catch((error) => {
      alert("Erreur : " + error.message);
    });
});
