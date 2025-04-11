// État global de l'application
const state = {
    gridData: new Array(256).fill(0),
    selectedCell: null,
    writeCount: 0,
    deviceConnected: false,
    lastDeviceConnected: false,
    locks: {
        vendorName: false,
        vendorPN: false,
        dateCode: false,
        vendorSN: false
    }
};

// Création des grilles hexadécimales
function createHexGrid(elementId) {
    const grid = document.getElementById(elementId);
    console.log('Création de la grille hexadécimale');
    // Création de l'en-tête des colonnes
    const headerRow = document.createElement('div');
    headerRow.className = 'hex-row';
    headerRow.innerHTML = '<div class="hex-cell hex-header"></div>' + 
        Array.from({length: 16}, (_, i) => 
            `<div class="hex-cell hex-header">${i.toString(16).toUpperCase()}</div>`
        ).join('');
    grid.appendChild(headerRow);
    
    // Création des lignes de données
    for (let row = 0; row < 16; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'hex-row';
        
        // En-tête de ligne
        rowElement.innerHTML = `<div class="hex-cell hex-header">${row.toString(16).toUpperCase()}</div>`;
        
        // Cellules de données
        for (let col = 0; col < 16; col++) {
            const cell = document.createElement('div');
            cell.className = 'hex-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.address = row * 16 + col;
            cell.textContent = '00';
            
            cell.addEventListener('click', () => selectCell(cell));
            rowElement.appendChild(cell);
        }
        
        grid.appendChild(rowElement);
    }
}

// Sélection d'une cellule
function selectCell(cell) {
    if (state.selectedCell) {
        state.selectedCell.style.backgroundColor = '';
    }
    
    state.selectedCell = cell;
    cell.style.backgroundColor = '#e3f2fd';
    
    document.getElementById('cellAddress').value = 
        parseInt(cell.dataset.address).toString(16).toUpperCase().padStart(2, '0');
}

// Mise à jour de la valeur d'une cellule
function updateCellValue(gridId, address, value) {
    const cell = document.querySelector(`#${gridId} [data-address="${address}"]`);
    if (cell) {
        cell.textContent = value.toString(16).toUpperCase().padStart(2, '0');
        if (gridId === 'moduleHexGrid') {
            state.gridData[address] = value;
        }
    }
}

// Extraction des informations SFP
function extractSFPInfo(data) {
    return {
        vendorName: String.fromCharCode(...data.slice(20, 35)).trim(),
        oem: String.fromCharCode(...data.slice(37, 40)).trim(),
        vendorPN: String.fromCharCode(...data.slice(40, 55)).trim(),
        dateCode: String.fromCharCode(...data.slice(84, 92)).trim(),
        vendorSN: String.fromCharCode(...data.slice(68, 84)).trim()
    };
}

// Mise à jour des informations du fichier
function updateFileInfo(data) {
    const info = extractSFPInfo(data);
    document.getElementById('fileVendorName').value = info.vendorName;
    document.getElementById('fileOEM').value = info.oem;
    document.getElementById('fileVendorPN').value = info.vendorPN;
    document.getElementById('fileDateCode').value = info.dateCode;
    document.getElementById('fileVendorSN').value = info.vendorSN;
}

// Gestion des fichiers
document.getElementById('openFile').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.hex,.bin';
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        document.getElementById('filePath').value = file.name;
        
        // Créer un FormData pour envoyer le fichier
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                // Mise à jour de la grille du fichier
                result.data.forEach((value, address) => {
                    updateCellValue('fileHexGrid', address, value);
                });
                
                // Mise à jour des informations du fichier
                updateFileInfo(result.data);
                
                document.getElementById('messageBox').value = 'Fichier chargé avec succès';
            }
        } catch (error) {
            document.getElementById('messageBox').value = `Erreur lors du chargement du fichier: ${error.message}`;
        }
    });
    
    fileInput.click();
});

document.getElementById('loadFile').addEventListener('click', () => {
    const fileHexCells = document.querySelectorAll('#fileHexGrid .hex-cell:not(.hex-header)');
    const moduleHexCells = document.querySelectorAll('#moduleHexGrid .hex-cell:not(.hex-header)');
    
    // Copier les valeurs de la grille du fichier vers la grille du module
    fileHexCells.forEach((cell, index) => {
        if (moduleHexCells[index]) {
            moduleHexCells[index].textContent = cell.textContent;
            state.gridData[index] = parseInt(cell.textContent, 16);
        }
    });
    
    // Copier les informations du fichier vers le module si non verrouillées
    const fileInfo = {
        vendorName: document.getElementById('fileVendorName').value,
        oem: document.getElementById('fileOEM').value,
        vendorPN: document.getElementById('fileVendorPN').value,
        dateCode: document.getElementById('fileDateCode').value,
        vendorSN: document.getElementById('fileVendorSN').value
    };
    
    if (!state.locks.vendorName) document.getElementById('moduleVendorName').value = fileInfo.vendorName;
    document.getElementById('moduleOEM').value = fileInfo.oem;
    if (!state.locks.vendorPN) document.getElementById('moduleVendorPN').value = fileInfo.vendorPN;
    if (!state.locks.dateCode) document.getElementById('moduleDateCode').value = fileInfo.dateCode;
    if (!state.locks.vendorSN) document.getElementById('moduleVendorSN').value = fileInfo.vendorSN;
    
    document.getElementById('messageBox').value = 'Données chargées dans le module';
});

// Fonction pour vérifier le statut du module
async function checkDeviceStatus() {
    try {
        const response = await fetch('/api/device-status');
        const data = await response.json();
        
        const deviceStatus = document.getElementById('deviceStatus');
        const deviceInfo = document.getElementById('deviceInfo');
        
        if (data.connected) {
            deviceStatus.textContent = '✓ Module connecté';
            deviceStatus.className = 'connected';
            deviceInfo.innerHTML = `<strong>ID:</strong> ${data.deviceId}`;
            deviceInfo.style.display = 'inline-block';
            
            // Ajouter les informations supplémentaires si disponibles
            if (data.manufacturer || data.product) {
                const details = [];
                if (data.manufacturer) details.push(data.manufacturer);
                if (data.product) details.push(data.product);
                deviceInfo.innerHTML += `<br><span style="font-size: 11px">${details.join(' - ')}</span>`;
            }
        } else {
            deviceStatus.textContent = '✗ Module non connecté';
            deviceStatus.className = 'disconnected';
            deviceInfo.style.display = 'none';
            deviceInfo.textContent = '';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        const deviceStatus = document.getElementById('deviceStatus');
        deviceStatus.textContent = '⚠ Erreur de connexion';
        deviceStatus.className = 'disconnected';
        deviceInfo.style.display = 'none';
    }
}

// Vérifier le statut toutes les 2 secondes
setInterval(checkDeviceStatus, 2000);

// Vérifier le statut immédiatement au chargement
document.addEventListener('DOMContentLoaded', () => {
    createHexGrid('fileHexGrid');
    createHexGrid('moduleHexGrid');
    
    // Initialiser les boutons de verrouillage
    ['vendorName', 'vendorPN', 'dateCode', 'vendorSN'].forEach(field => {
        const button = document.getElementById(`${field}Lock`);
        button.addEventListener('click', () => toggleLock(field));
        button.textContent = state.locks[field] ? '🔒' : '🔓';
    });
    
    // Initialiser le CodingBox
    if (window.codingbox && window.codingbox.initCodingBox) {
        window.codingbox.initCodingBox();
    }
    
    // Ajouter les gestionnaires d'événements pour les boutons de lecture/écriture
    const readModuleBtn = document.getElementById('readModule');
    if (readModuleBtn) {
        readModuleBtn.addEventListener('click', () => {
            if (window.codingbox && window.codingbox.readModule) {
                window.codingbox.readModule();
                // Incrémenter le compteur d'écriture
                updateWriteCount();
            } else {
                console.error('La fonction readModule n\'est pas disponible');
            }
        });
    }
    
    const singleWriteBtn = document.getElementById('singleWrite');
    if (singleWriteBtn) {
        singleWriteBtn.addEventListener('click', () => {
            if (window.codingbox && window.codingbox.singleWrite) {
                // Récupérer les valeurs à écrire
                const address = 'a0'; // Adresse mémoire par défaut
                const offset = document.getElementById('cellAddress').value || '00';
                
                // Récupérer la valeur de la cellule sélectionnée si elle existe
                let value = '00';
                if (state.selectedCell) {
                    value = state.selectedCell.textContent || '00';
                }
                
                window.codingbox.singleWrite(address, offset, value);
                // Incrémenter le compteur d'écriture
                updateWriteCount();
            } else {
                console.error('La fonction singleWrite n\'est pas disponible');
            }
        });
    }
    
    // Initialiser le sélecteur de type de module si disponible
    if (window.codingbox && window.codingbox.selectModuleType) {
        window.codingbox.selectModuleType('SFP'); // Type par défaut
    }
    
    // Ajouter un gestionnaire pour le bouton clear count
    const clearCountBtn = document.getElementById('clearCount');
    if (clearCountBtn) {
        clearCountBtn.addEventListener('click', () => {
            state.writeCount = 0;
            document.getElementById('writeCount').value = '0';
        });
    }
    
    checkDeviceStatus();
});

function toggleLock(field) {
    state.locks[field] = !state.locks[field];
    const button = document.getElementById(`${field}Lock`);
    button.textContent = state.locks[field] ? '🔒' : '🔓';
}

// Fonction pour mettre à jour le compteur d'écriture
function updateWriteCount() {
    state.writeCount++;
    const writeCountElement = document.getElementById('writeCount');
    if (writeCountElement) {
        writeCountElement.value = state.writeCount.toString();
    }
}

// Fonction pour mettre à jour les données du module dans l'interface
function updateModuleInterface(moduleInfo) {
    console.log('updateModuleInterface appelé avec:', moduleInfo);
    if (!moduleInfo) return;
    
    // Mettre à jour les champs d'information du module s'ils ne sont pas verrouillés
    if (!state.locks.vendorName && moduleInfo.vendor) {
        document.getElementById('moduleVendorName').value = moduleInfo.vendor;
    }
    
    if (moduleInfo.oem) {
        document.getElementById('moduleOEM').value = moduleInfo.oem;
    }
    
    if (!state.locks.vendorPN && moduleInfo.partNumber) {
        document.getElementById('moduleVendorPN').value = moduleInfo.partNumber;
    }
    
    if (!state.locks.dateCode && moduleInfo.dateCode) {
        document.getElementById('moduleDateCode').value = moduleInfo.dateCode;
    }
    
    if (!state.locks.vendorSN && moduleInfo.serialNumber) {
        document.getElementById('moduleVendorSN').value = moduleInfo.serialNumber;
    }
    
    // Mettre à jour la grille hexadécimale si des données sont disponibles
    if (moduleInfo.rawData && Array.isArray(moduleInfo.rawData)) {
        console.log('Mise à jour de la grille avec', moduleInfo.rawData.length, 'valeurs');
        moduleInfo.rawData.forEach((value, index) => {
            updateCellValue('moduleHexGrid', index, value);
        });
    } else {
        console.warn('Pas de données brutes disponibles dans moduleInfo');
    }
}

// Rendre la fonction accessible globalement
window.updateModuleInterface = updateModuleInterface;
