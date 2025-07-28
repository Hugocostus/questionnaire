// script.js

let sessionId = crypto.randomUUID();
let startTime = Date.now();

// Envoyer un signal de vie toutes les 10 secondes
setInterval(() => {
  fetch("https://questionnaire-65ht.onrender.com/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      timestamp: Date.now(),
    })
  });
}, 10000);

// Signaler un abandon lors du départ
window.addEventListener("beforeunload", () => {
  fetch("https://questionnaire-65ht.onrender.com/abandon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId,
      startTime,
      endTime: Date.now(),
    })
  });
});

// Envoi du questionnaire

document.getElementById("btnEnvoyer").addEventListener("click", () => {
  const data = {
    sessionId,
    startTime,
    endTime: Date.now(),
    parcours: document.getElementById("parcours").value,
    annee: document.getElementById("annee").value,
    asso: document.getElementById("asso").value,
    pourquoi: document.getElementById("pourquoi").value.trim(),
    frequence: document.getElementById("frequence").value,
    investissement: document.getElementById("investissement").value,
    liste: document.getElementById("liste").value,
    evenements: document.getElementById("evenements").value,
    baguette: document.getElementById("magie").value.trim()
  };

  if (!data.parcours || !data.annee || !data.asso || !data.frequence || !data.investissement || !data.liste || !data.evenements) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  fetch("https://questionnaire-65ht.onrender.com/enregistrer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) throw new Error("Erreur lors de l'envoi");
      return response.json();
    })
    .then(result => {
      alert("Questionnaire bien envoyé !");
    })
    .catch(error => {
      alert("Erreur : " + error.message);
    });
});
