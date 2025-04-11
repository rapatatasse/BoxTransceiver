const express = require('express');
const multer = require('multer');
const path = require('path');
const HID = require('node-hid');
const app = express();
const port = 3000;

// Configuration de multer pour la gestion des fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(__dirname)); 
app.use(express.json());

// Fonction pour trouver le module Coding Box
function findCodingBox() {
    const devices = HID.devices();
    return devices.find(device => 
        device.vendorId === 0x0483 && 
        device.productId === 0x5750
    );
}

// Route pour vérifier le statut du module
app.get('/api/device-status', (req, res) => {
    try {
        const device = findCodingBox();
        if (device) {
            res.json({
                connected: true,
                deviceId: device.path.split('#')[2].split('&')[0],  // Extrait le Device ID
                manufacturer: device.manufacturer,
                product: device.product
            });
        } else {
            res.json({
                connected: false,
                error: 'Module non trouvé'
            });
        }
    } catch (error) {
        res.json({
            connected: false,
            error: error.message
        });
    }
});

// Route pour uploader un fichier
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        // Convertir le buffer en array de bytes
        const fileData = Array.from(req.file.buffer);
        
        res.json({
            success: true,
            data: fileData,
            filename: req.file.originalname
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
