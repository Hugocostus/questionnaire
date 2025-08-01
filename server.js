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

// Enregistrement questionnaire complet
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

// Enregistrement heartbeat
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

// Enregistrement abandon
app.post("/abandon", (req, res) => {
  const { sessionId, startTime, endTime } = req.body;
  if (!sessionId || !startTime || !endTime) {
    return res.status(400).json({ message: "Paramètres manquants pour abandon" });
  }
  const data = lireFichier(abandonFilePath);
  data.push({ sessionId, startTime, endTime });
  ecrireFichier(abandonFilePath, data);
  console.log(`❌ Abandon enregistré : ${sessionId} (${(endTime - startTime) / 1000}s)`);
  res.json({ message: "❌ Abandon enregistré" });
});

// Téléchargement sécurisé des fichiers
app.get("/telecharger/:type", (req, res) => {
  const code = req.query.code;
  if (code !== Code) {
    return res.status(403).json({ message: "Code invalide" });
  }

  const type = req.params.type;
  let filePath;
  let fileName;

  switch (type) {
    case "donnees":
      filePath = dataFilePath;
      fileName = "donnees.json";
      break;
    case "heartbeat":
      filePath = heartbeatFilePath;
      fileName = "heartbeat.json";
      break;
    case "abandons":
      filePath = abandonFilePath;
      fileName = "abandons.json";
      break;
    default:
      return res.status(404).json({ message: "Type de fichier non supporté" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Fichier non trouvé" });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Erreur téléchargement :", err);
      res.status(500).end();
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${port}`);
});


