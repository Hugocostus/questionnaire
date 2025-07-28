const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Activer CORS et JSON
app.use(cors());
app.use(bodyParser.json());

// Servir les fichiers statiques HTML/JS
app.use(express.static(path.join(__dirname, "public")));

// Code secret depuis variable d'environnement
const secretCode = process.env.SECRET_CODE;
if (!secretCode) {
  console.error("❌ SECRET_CODE non défini dans l'environnement");
  process.exit(1);
}

// Fichier où les données sont stockées
const dataFilePath = path.join(__dirname, "donnees.json");

// Lire les données
function lireDonnees() {
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  } catch {
    return [];
  }
}

// Écrire les données
function ecrireDonnees(donnees) {
  fs.writeFileSync(dataFilePath, JSON.stringify(donnees, null, 2));
}

// Enregistrement de données
app.post("/enregistrer", (req, res) => {
  const nouvelleDonnee = req.body;
  if (!nouvelleDonnee) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  const donneesExistantes = lireDonnees();
  donneesExistantes.push(nouvelleDonnee);
  ecrireDonnees(donneesExistantes);

  console.log("✅ Donnée enregistrée :", nouvelleDonnee);
  res.json({ message: "Donnée enregistrée avec succès", total: donneesExistantes.length });
});

// Téléchargement sécurisé
app.get("/telecharger", (req, res) => {
  const code = req.query.code;
  if (code !== secretCode) {
    return res.status(403).json({ message: "Code invalide" });
  }

  if (!fs.existsSync(dataFilePath)) {
    return res.status(404).json({ message: "Fichier non trouvé" });
  }

  res.download(dataFilePath, "donnees.json", (err) => {
    if (err) {
      console.error("Erreur téléchargement :", err);
      res.status(500).end();
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${port}`);
});
