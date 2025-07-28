const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const Code = process.env.CODE;
if (!Code) {
  console.error("❌ CODE non défini dans l'environnement");
  process.exit(1);
}

const dataFilePath = path.join(__dirname, "donnees.json");
const heartbeatFilePath = path.join(__dirname, "heartbeat.json");
const abandonFilePath = path.join(__dirname, "abandons.json");

function lireFichier(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

function ecrireFichier(filePath, donnees) {
  fs.writeFileSync(filePath, JSON.stringify(donnees, null, 2));
}

app.post("/enregistrer", (req, res) => {
  const nouvelleDonnee = req.body;
  if (!nouvelleDonnee) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  const donneesExistantes = lireFichier(dataFilePath);
  donneesExistantes.push(nouvelleDonnee);
  ecrireFichier(dataFilePath, donneesExistantes);

  if (nouvelleDonnee.dateSoumission) {
    console.log(`✅ Donnée enregistrée à ${nouvelleDonnee.dateSoumission}`);
  } else {
    console.log("✅ Donnée enregistrée sans date de soumission");
  }

  res.json({ message: "Donnée enregistrée avec succès", total: donneesExistantes.length });
});

app.post("/heartbeat", (req, res) => {
  const { sessionId, timestamp } = req.body;
  if (!sessionId || !timestamp) {
    return res.status(400).json({ message: "Paramètres manquants" });
  }
  const data = lireFichier(heartbeatFilePath);
  data.push({ sessionId, timestamp });
  ecrireFichier(heartbeatFilePath, data);
  res.json({ message: "⏱️ Heartbeat enregistré" });
});

app.post("/abandon", (req, res) => {
  const { sessionId, timestamp } = req.body;
  if (!sessionId || !timestamp) {
    return res.status(400).json({ message: "Paramètres manquants" });
  }
  const data = lireFichier(abandonFilePath);
  data.push({ sessionId, timestamp });
  ecrireFichier(abandonFilePath, data);
  res.json({ message: "❌ Abandon enregistré" });
});

app.get("/telecharger", (req, res) => {
  const code = req.query.code;
  if (code !== Code) {
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
