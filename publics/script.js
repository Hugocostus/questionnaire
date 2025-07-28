document.getElementById("btnEnvoyer").addEventListener("click", () => {
  const data = {
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

  // Validation simple
  if (!data.parcours || !data.annee || !data.asso || !data.frequence || !data.investissement || !data.liste || !data.evenements) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  fetch("https://questionnaire.onrender.com/enregistrer", {
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
      console.log(result);
    })
    .catch(error => {
      alert("Erreur : " + error.message);
    });
});
