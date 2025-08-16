let sessionId = crypto.randomUUID();
let startTime = Date.now();
let submitted = false;

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
  if (submitted) return;

  const data = JSON.stringify({
    sessionId,
    startTime,
    endTime: Date.now(),
  });

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
    axes: document.getElementById("axes").value.trim(), // ✅ nouvelle question
  };

  fetch("https://questionnaire-65ht.onrender.com/enregistrer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur lors de l'envoi");
      submitted = true;
      alert("Questionnaire bien envoyé !");
    })
    .catch((error) => {
      alert("Erreur : " + error.message);
    });
});
