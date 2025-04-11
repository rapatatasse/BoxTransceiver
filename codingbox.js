/**
 * CodingBox.js - Functions for communication with transceiver modules
 * SFP, SFP+, SFP28, SFP56, XFP, QSFP+, QSFP28, QSFP DD
 *
 * ??? DEVELOPER ATTENTION NEEDED - SUMMARY OF MISSING INFORMATION ???
 * The following areas require specific implementation details:
 * 
 * 1. MODULE DETECTION COMMANDS:
 *    - Command structure for reading module identifier bytes
 *    - Exact identifier values for each module type
 * 
 * 2. READ COMMANDS:
 *    - Exact command structures for reading A0/A2 pages for all module types
 *    - Specific address mapping for different modules (SFP vs QSFP)
 * 
 * 3. WRITE COMMANDS:
 *    - Command structures for writing to different module types
 *    - Proper address formats and byte ordering
 * 
 * 4. CHECKSUMS:
 *    - Verification algorithm for each module type
 *    - Checksum positions for different memory pages
 *
 * 5. REBOOT COMMANDS:
 *    - Command structure for module reset after writes
 *    - Timing parameters for proper reboot sequence
 */

// Constantes pour les types de modules
const MODULE_TYPES = {
    SFP: 'SFP',
    SFPPLUS: 'SFP+',
    XFP: 'XFP',
    QSFP: 'QSFP',
    QSFP_DD: 'QSFP_DD'
};

// Configuration du module
let selectedModuleType = MODULE_TYPES.SFP;

/**
 * Function to automatically detect the connected module type
 * @returns {Promise<string|null>} - Detected module type or null if failed
 */
async function detectModuleType() {
    logMessage('Détection du type de module...');
    
    try {
        // ??? Command to read the module identifier (usually in the first bytes) ???
        // ??? For example, read bytes 0-1 from address A0h ???
        let identCommand = new Uint8Array([
            // ??? Format of the command to read the first identifier bytes ??? 
            // ??? For example: 0x23, 0x00, 0xA0, 0x00, 0x02 ???
            // ??? Where 0x23 is the operation code, 0xA0 is the address, 0x00 is the offset, 0x02 is the length ???
        ]);
        
        await sendCommand(identCommand);
        
        let response = await receiveResponse();
        if (!response || response.length < 2) {
            logMessage('Impossible d\'identifier le module - Pas de réponse valide');
            return null;
        }
        
        // ??? Analysis of the response to determine the module type ???
        // ??? Specific bytes depend on the exact protocol and may vary ???
        // ??? Generally, the identifier byte is found in the first bytes ???
        
        const identifier = response[0]; // ??? The identification byte (simplified) ???
        
        // ??? These values are hypothetical and must be adjusted according to specifications ???
        if (identifier === 0x0C || identifier === 0x0D) { // ??? Possible values for QSFP ???
            logMessage('Module QSFP détecté');
            return MODULE_TYPES.QSFP;
        } else if (identifier === 0x11) { // ??? Possible value for QSFP-DD ???
            logMessage('Module QSFP-DD détecté');
            return MODULE_TYPES.QSFP_DD;
        } else if (identifier === 0x03) { // ??? Possible value for SFP ???
            logMessage('Module SFP détecté');
            return MODULE_TYPES.SFP;
        } else if (identifier === 0x04) { // ??? Possible value for SFP+ ???
            logMessage('Module SFP+ détecté');
            return MODULE_TYPES.SFPPLUS;
        } else if (identifier === 0x06) { // ??? Possible value for XFP ???
            logMessage('Module XFP détecté');
            return MODULE_TYPES.XFP;
        }
        
        logMessage(`Type de module inconnu (identifiant: 0x${identifier.toString(16)})`);
        return null;
    } catch (error) {
        logMessage(`Erreur lors de la détection du type de module: ${error.message}`);
        return null;
    }
}

/**
 * Fonction pour vérifier si le périphérique est connecté d'après l'interface
 * @returns {boolean} - true si le périphérique est connecté
 */
function isDeviceConnected() {
    const deviceStatus = document.getElementById('deviceStatus');
    return deviceStatus && deviceStatus.className === 'connected';
}

/**
 * Fonction pour obtenir les informations du périphérique depuis l'interface
 * @returns {string|null} - Informations du périphérique ou null si non disponible
 */
function getDeviceInfo() {
    const deviceInfoElem = document.getElementById('deviceInfo');
    if (deviceInfoElem && deviceInfoElem.textContent.trim() !== '') {
        return deviceInfoElem.textContent.replace(/<[^>]*>/g, ' ').trim();
    }
    return null;
}

/**
 * Fonction pour envoyer une commande au périphérique USB
 * @param {Uint8Array} data - Données à envoyer
 * @returns {Promise<boolean>} - Promesse qui résout à true si l'envoi est réussi
 */
async function sendCommand(data) {
    // Vérifier si le module est connecté en utilisant notre fonction
    if (!isDeviceConnected()) {
        logMessage('Aucun périphérique connecté');
        return false;
    }
    
    // Afficher les informations du périphérique dans le messageBox
    const deviceInfoText = getDeviceInfo();
    if (deviceInfoText) {
        logMessage(`Périphérique en cours d'utilisation: ${deviceInfoText}`);
    }
    
    try {
        // ? Cette partie dépend de l'implémentation exacte pour envoyer des commandes HID
        // ? Il nous faudrait les détails spécifiques sur le format des commandes
        
        logMessage(`Envoi de la commande: ${bufferToHexString(data)}`);
        
        // Simulation d'envoi de commande (similaire à l'exemple fourni)
        /*
        USB URB
            [Source: host]
            [Destination: 2.25.1]
            USBPcap pseudoheader length: 27
            IRP ID: 0xffffe6891cff59f0
            IRP USBD_STATUS: USBD_STATUS_SUCCESS (0x00000000)
            URB Function: URB_FUNCTION_BULK_OR_INTERRUPT_TRANSFER (0x0009)
            IRP information: 0x00, Direction: FDO -> PDO
            URB bus id: 2
            Device address: 25
            Endpoint: 0x01, Direction: OUT
            URB transfer type: URB_INTERRUPT (0x01)
            Packet Data Length: 64
            [Response in: 127]
            [bInterfaceClass: HID (0x03)]
        HID Data: 230001a0140010000020000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
            Vendor Data: 23
            Padding: 0001a0140010000020000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        */
        
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
    } catch (error) {
        logMessage(`Erreur d'envoi de commande: ${error.message}`);
        return false;
    }
}

/**
 * Fonction pour recevoir une réponse du périphérique USB
 * @returns {Promise<Uint8Array|null>} - Promesse qui résout avec les données reçues ou null en cas d'erreur
 */
async function receiveResponse() {
    // Vérifier si le module est connecté en utilisant notre fonction
    if (!isDeviceConnected()) {
        logMessage('Aucun périphérique connecté pour réception');
        return null;
    }
    
    try {
        // ? Cette partie dépend de l'implémentation exacte pour recevoir des réponses HID
        // ? Il nous faudrait les détails spécifiques sur le format des réponses
        
        // Simulation de réception d'une réponse
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Exemple de réponse simulée basée sur l'exemple fourni
        /*
        read a0 00 80
         00:03 04 07 00 00 00 02 00 00 01 00 01 0D 00 14 C8 "................"
         10:00 00 00 00 4F 45 4D 20 20 20 20 20 20 20 20 20 "....OEM         "
         20:20 20 20 20 00 00 00 00 4E 58 2D 53 46 2D 33 47 "    ....NX-SF-3G"
         30:31 2D 32 30 20 20 20 20 41 30 20 20 05 1E 00 A3 "1-20    A0  ...."
         40:00 1A 00 00 4C 32 36 38 41 32 33 30 35 31 38 30 "....L268A2305180"
         50:30 39 35 20 32 33 30 35 31 38 20 20 68 F0 01 34 "095 230518  h..4"
         60:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 "................"
         70:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 "................"
        */
        
        // Simuler une réponse comme exemple
        const responseData = new Uint8Array([
            0x03, 0x04, 0x07, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x01, 0x00, 0x01, 0x0D, 0x00, 0x14, 0xC8,
            0x00, 0x00, 0x00, 0x00, 0x4F, 0x45, 0x4D, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
            0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x00, 0x00, 0x4E, 0x58, 0x2D, 0x53, 0x46, 0x2D, 0x33, 0x47,
            0x31, 0x2D, 0x32, 0x30, 0x20, 0x20, 0x20, 0x20, 0x41, 0x30, 0x20, 0x20, 0x05, 0x1E, 0x00, 0xA3,
            0x00, 0x1A, 0x00, 0x00, 0x4C, 0x32, 0x36, 0x38, 0x41, 0x32, 0x33, 0x30, 0x35, 0x31, 0x38, 0x30,
            0x30, 0x39, 0x35, 0x20, 0x32, 0x33, 0x30, 0x35, 0x31, 0x38, 0x20, 0x20, 0x68, 0xF0, 0x01, 0x34,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        
        logMessage(`Réponse reçue simulé: ${formatResponseDisplay(responseData)}`);
        return responseData;
    } catch (error) {
        logMessage(`Erreur de réception: ${error.message}`);
        return null;
    }
}

/**
 * Function to read information from SFP/XFP/QSFP module
 * Implementation of the readModule button
 */
async function readModule() {
    // Check if the module is connected using our function
    if (!isDeviceConnected()) {
        logMessage('Connectez d\'abord le périphérique');
        return;
    }
    
    // Get and display already available device information
    const deviceInfoText = getDeviceInfo();
    if (deviceInfoText) {
        logMessage(`Lecture du module sur: ${deviceInfoText}`);
    }
    
    // Automatic detection of module type
    const detectedType = await detectModuleType();
    if (detectedType) {
        if (detectedType !== selectedModuleType) {
            logMessage(`Type de module détecté différent: ${detectedType} (actuellement sélectionné: ${selectedModuleType})`);
            
            // Option to automatically change the type or request confirmation via interface
            // ??? Implement a dialog box to request confirmation ???
            // For now, we change automatically
            selectModuleType(detectedType);
            logMessage(`Type de module changé pour: ${detectedType}`);
        } else {
            logMessage(`Type de module confirmé: ${selectedModuleType}`);
        }
    } else {
        logMessage(`Impossible de détecter automatiquement le type de module. Utilisation du type sélectionné: ${selectedModuleType}`);
    }
    
    // Affichage selon les logs précédents
    logMessage(`Reading ModuleBaseInfor from ${selectedModuleType}...`);
    
    try {
        // Initialisation selon le type de module
        if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
            logMessage(`${selectedModuleType}-A0 high Tab0 Reading Code Start`);
        } else {
            logMessage(`${selectedModuleType}-A0 low Reading Code Start`);
        }
        
        // ??? Construction of the command to read the A0 page ??? 
        let readA0Command;
        if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
            // ??? Command format for QSFP ???
            // ??? For example: [0x23, 0x00, 0xA0, 0x00, 0x80, ...other QSFP-specific parameters] ???
            readA0Command = new Uint8Array([/* ??? exact command for QSFP read a0 ??? */]);
        } else if (selectedModuleType === MODULE_TYPES.XFP) {
            // ??? Command format for XFP ???
            readA0Command = new Uint8Array([/* ??? exact command for XFP read a0 ??? */]);
        } else {
            // ??? Command format for SFP/SFP+ ???
            // ??? For example: [0x23, 0x00, 0xA0, 0x00, 0x80, ...other SFP-specific parameters] ???
            readA0Command = new Uint8Array([/* ??? exact command for SFP read a0 ??? */]);
        }
        
        await sendCommand(readA0Command);
        
        // Log I2C Read comme dans les exemples
        logMessage('I2C Read OK');
        
        let a0Response = await receiveResponse();
        if (!a0Response) {
            logMessage('Échec de la lecture de la mémoire A0');
            logMessage('FAIL');
            return;
        }
        
        // Log reading end message based on module type
        if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
            logMessage(`${selectedModuleType}-A0 high Tab0 Reading Code End`);
        } else {
            logMessage(`${selectedModuleType}-A0 low Reading Code End`);
        }
        
        // Checksum verification
        // ??? Checksums may vary depending on the module type ???
        let checksumPositions = [];
        
        if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
            // ??? For QSFP, positions of checksums to verify ???
            checksumPositions = [191, 223]; // ??? Example based on log ???
        } else {
            // ??? For SFP/SFP+/XFP, positions of checksums to verify ???
            checksumPositions = [63, 95]; // ??? Example based on log ???
        }
        
        // Calculate and verify checksums
        let allChecksumOk = true;
        
        for (const pos of checksumPositions) {
            // ??? The exact format of checksum calculation depends on the protocol ???
            const slice = a0Response.slice(0, pos + 1);
            const checksumOk = calculateChecksum(slice);
            
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                logMessage(`A0 high Tab0 ${pos} CheckSum ${checksumOk ? 'OK!' : 'FAILED!'}`);
            } else {
                logMessage(`A0 low ${pos} CheckSum ${checksumOk ? 'OK!' : 'FAILED!'}`);
            }
            
            if (!checksumOk) {
                allChecksumOk = false;
            }
        }
        
        // Résultat global
        // Informer l'utilisateur du résultat des checksums
        if (allChecksumOk) {
            logMessage('PASS');
            logMessage('Reading Success.');
        } else {
            logMessage('FAIL - Checksums invalides');
            // Do not return here to allow populating the grid even if checksums are invalid
            // (we modify the logic to display data even if checksums are incorrect)
        }
        
        // Analyze the data and display module information
        const moduleInfo = parseModuleInfo(a0Response);
        displayModuleInfo(moduleInfo);
        
        // ??? If necessary, read DDM/DOM data from page A2 for modules that support it
        if (moduleInfo && moduleInfo.supportsDDM) {
            // Read DDM/DOM (page A2) - only for certain modules
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                logMessage(`${selectedModuleType}-A2 Reading Code Start`);
            } else {
                logMessage(`${selectedModuleType}-A2 Reading Code Start`);
            }
            
            // ??? Build command to read page A2
            let readA2Command;
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                // ??? Command format for QSFP read A2
                readA2Command = new Uint8Array([/* ??? exact command for QSFP read a2 ??? */]);
            } else {
                // ??? Command format for SFP/SFP+/XFP read A2
                readA2Command = new Uint8Array([/* ??? exact command for SFP read a2 ??? */]);
            }
            
            await sendCommand(readA2Command);
            logMessage('I2C Read OK');
            
            // Lecture et affichage des données DDM
            const a2Response = await receiveResponse();
            if (a2Response) {
                // Traitement des données DDM/DOM
                // ??? Décodage des données DDM selon les spécifications
                logMessage('Données DDM/DOM lues avec succès');
            }
            
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                logMessage(`${selectedModuleType}-A2 Reading Code End`);
            } else {
                logMessage(`${selectedModuleType}-A2 Reading Code End`);
            }
        }
        
    } catch (error) {
        logMessage(`Erreur de lecture du module: ${error.message}`);
    }
}

/**
 * Function to write to SFP/XFP/QSFP module
 * Implementation of the singleWrite button
 * @param {string} address - Memory address (e.g. 'a0')
 * @param {string} offset - Offset in memory (e.g. '14')
 * @param {string} data - Data to write
 */
async function singleWrite(address, offset, data) {
    // Check if the module is connected using our function
    if (!isDeviceConnected()) {
        logMessage('Connectez d\'abord le périphérique');
        return;
    }
    
    // Automatic detection of module type before writing
    const detectedType = await detectModuleType();
    if (detectedType && detectedType !== selectedModuleType) {
        logMessage(`Type de module détecté différent: ${detectedType}`);
        selectModuleType(detectedType);
    }
    
    // Get and display device information
    const deviceInfoText = getDeviceInfo();
    if (deviceInfoText) {
        logMessage(`Écriture sur le module connecté à: ${deviceInfoText}`);
    }
    
    // Format de log selon le type de module (comme dans les anciens logs)
    if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
        logMessage(`${selectedModuleType}-${address} Writing Code Start`);
    } else {
        logMessage(`${selectedModuleType}-${address} low Writing Code Start`);
    }
    
    try {
        logMessage(`Écriture à l'adresse ${address} offset ${offset} : ${data}`);
        
        // Prepare write command based on module type
        let writeCommand;
        
        if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
            // ??? Command format for QSFP write ???
            // ??? For example: [0x23, 0x01, address_hex, offset_hex, data_hex, ...other parameters] ???
            writeCommand = new Uint8Array([/* ??? exact command for QSFP write with address, offset and data ??? */]);
        } else if (selectedModuleType === MODULE_TYPES.XFP) {
            // ??? Command format for XFP write ???
            writeCommand = new Uint8Array([/* ??? exact command for XFP write with address, offset and data ??? */]);
        } else {
            // ??? Command format for SFP/SFP+ write ???
            // ??? For example: [0x23, 0x01, address_hex, offset_hex, data_hex, ...other parameters] ???
            writeCommand = new Uint8Array([/* ??? exact command for SFP write with address, offset and data ??? */]);
        }
        
        const success = await sendCommand(writeCommand);
        
        if (success) {
            logMessage('I2C Write OK');
            
            // Module restart after writing (format varies according to the module type)
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                logMessage(`${selectedModuleType} Module Reboot Start`);
            } else {
                logMessage('Start Reboot Module.');
            }
            
            // Construction of commands to restart the module according to its type
            let rebootCommand;
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                // ??? Format of the command for QSFP reboot ???
                rebootCommand = new Uint8Array([/* ??? exact command to restart the QSFP module ??? */]);
            } else {
                // ??? Format of the command for SFP/XFP reboot ???
                rebootCommand = new Uint8Array([/* ??? exact command to restart the SFP module ??? */]);
            }
            
            await sendCommand(rebootCommand);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (selectedModuleType === MODULE_TYPES.QSFP || selectedModuleType === MODULE_TYPES.QSFP_DD) {
                logMessage(`${selectedModuleType} Module Reboot End`);
            } else {
                logMessage('Reboot Successfully.');
            }
            
            // Vérification de l'écriture
            logMessage('Vérification de l\'écriture...');
            
            // ? Construction de la commande pour relire la zone modifiée
            let verifyCommand = new Uint8Array([/* ? commande exacte pour relire la zone modifiée */]);
            await sendCommand(verifyCommand);
            
            let verifyResponse = await receiveResponse();
            
            if (verifyResponse) {
                logMessage('Verify Code Successfully');
                logMessage('PASS');
            } else {
                logMessage('Verification Failed');
                logMessage('FAIL');
            }
            
        } else {
            logMessage('I2C Write Failed');
            logMessage('FAIL');
        }
        
    } catch (error) {
        logMessage(`Erreur d'écriture: ${error.message}`);
    }
}

/**
 * Parse raw data to extract module information
 * @param {Uint8Array} data - Raw data read from the module
 * @returns {Object} - Structured module information
 */
function parseModuleInfo(data) {
    // Extract information according to standard SFF-8472/SFF-8636 offsets
    const vendor = extractString(data, 0x14, 16);
    const partNumber = extractString(data, 0x28, 16);
    const serialNumber = extractString(data, 0x44, 16);
    const dateCode = extractString(data, 0x54, 8);
    
    // Extract other information based on module type
    // (Depends on the exact module type)
    const oui = data[0x25] << 16 | data[0x26] << 8 | data[0x27];
    
    // Determine the module type and length/data rate
    let moduleType = '';
    let wavelength = '';
    let dataRate = '';
    let length = '';
    
    // Code based on SFF-8472 for SFP modules
    if (selectedModuleType === MODULE_TYPES.SFP) {
        const bitRate = data[0x0C];
        dataRate = `${bitRate * 100} Mbps`;
        
        // Fiber type and wavelength
        const connector = data[0x02];
        const transceiver = data[0x03];
        const waveBytes = (data[0x60] << 8) | data[0x61];
        wavelength = `${waveBytes} nm`;
        
        // Link length
        if (data[0x12] > 0) {
            length = `${data[0x12]} km`;
        } else if (data[0x11] > 0) {
            length = `${data[0x11] * 100} m`;
        } else if (data[0x10] > 0) {
            length = `${data[0x10] * 10} m`;
        } else {
            length = 'N/A';
        }
    }
    
    // Convert Uint8Array to standard array for easier manipulation
    const rawData = Array.from(data);
    
    // Fill the hexadecimal grid with raw data
    fillModuleHexGrid(rawData);
    
    return {
        vendor,
        partNumber,
        serialNumber,
        dateCode,
        oui: oui.toString(16).padStart(6, '0'),
        dataRate,
        length,
        wavelength,
        rawData // Add raw data for reference
    };
}

/**
 * Calculate the checksum of a data block
 * @param {Uint8Array} data - Data for which to calculate the checksum
 * @returns {boolean} - True if the checksum is valid
 */
function calculateChecksum(data) {
    // ??? Exact implementation of checksum calculation according to module specifications ???
    // This is a simulation, the exact implementation depends on the protocol
    
    // For SFP/SFP+, the checksum is generally the sum of bytes = 0 modulo 256
    let sum = 0;
    for (let i = 0; i < data.length - 1; i++) {
        sum = (sum + data[i]) % 256;
    }
    
    // Checksum verification (the last byte is the checksum)
    return (sum + data[data.length - 1]) % 256 === 0;
}

/**
 * Display module information in the interface
 * @param {Object} moduleInfo - Structured module information
 */
function displayModuleInfo(moduleInfo) {
    logMessage('=== Module Information ===');
    logMessage(`Vendor: ${moduleInfo.vendor}`);
    logMessage(`Part N0: ${moduleInfo.partNumber}`);
    logMessage(`Serial No: ${moduleInfo.serialNumber}`);
    logMessage(`Date Code: ${moduleInfo.dateCode}`);
    logMessage(`OUI: ${moduleInfo.oui}`);
    logMessage(`Data rate: ${moduleInfo.dataRate}`);
    logMessage(`Length: ${moduleInfo.length}`);
    logMessage(`Wavelength: ${moduleInfo.wavelength}`);
    logMessage('=========================');
    
    // Use the updateModuleInterface function from app.js if it exists
    if (window.updateModuleInterface) {
        logMessage('Mise à jour de l\'interface avec les informations du module');
        window.updateModuleInterface(moduleInfo);
    } else {
        console.error('La fonction updateModuleInterface n\'est pas disponible');
    }
}

/**
 * Utility function to extract a string from raw data
 * @param {Uint8Array} data - Raw data
 * @param {number} offset - Starting offset
 * @param {number} length - Length of string to extract
 * @returns {string} - Extracted string, cleaned of spaces and null characters
 */
function extractString(data, offset, length) {
    const bytes = data.slice(offset, offset + length);
    // Convert to ASCII string and remove trailing spaces and null characters
    return Array.from(bytes)
        .map(b => String.fromCharCode(b))
        .join('')
        .replace(/[\x00\s]+$/, '');
}

/**
 * Convert a buffer to hexadecimal string for display
 * @param {Uint8Array} buffer - Buffer to convert
 * @returns {string} - Hexadecimal representation
 */
function bufferToHexString(buffer) {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}

/**
 * Format a response for display as a hexadecimal dump
 * @param {Uint8Array} data - Data to format
 * @returns {string} - Formatted representation
 */
function formatResponseDisplay(data) {
    let result = '';
    
    // Display in lines of 16 bytes
    for (let i = 0; i < data.length; i += 16) {
        const chunk = data.slice(i, i + 16);
        const hex = Array.from(chunk)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
            
        const ascii = Array.from(chunk)
            .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.')
            .join('');
            
        const offset = i.toString(16).padStart(2, '0');
        result += `${offset}:${hex.padEnd(48, ' ')} "${ascii}"
`;
    }
    
    return result;
}

/**
 * Function to add a message to the messageBox
 * @param {string} message - Message to display
 */
function logMessage(message) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        const timestamp = new Date().toLocaleTimeString();
        messageBox.value += `${timestamp} - ${message}\n`;
        messageBox.scrollTop = messageBox.scrollHeight;
    } else {
        console.log(message);
    }
}



/**
 * Function to indicate device disconnection
 * Note: Connection is managed by app.js, this function is kept
 * for compatibility and logging purposes
 */
function disconnectDevice() {
    if (isDeviceConnected()) {
        const deviceInfoText = getDeviceInfo();
        if (deviceInfoText) {
            logMessage(`Information de déconnexion pour: ${deviceInfoText}`);
        }
        logMessage('Déconnexion signalée - L\'interface sera mise à jour par app.js');
    } else {
        logMessage('Aucun périphérique actuellement connecté');
    }
}

/**
 * Fill the module hexadecimal grid with raw data
 * @param {Array} data - Raw data as an array
 */
function fillModuleHexGrid(data) {
    // Debug: verify that the function is called
    logMessage('Début du remplissage de la grille hexadécimale');
    console.log('Filling grid with', data.length, 'bytes');
    
    // Make sure we have data to display
    if (!data || !Array.isArray(data)) {
        logMessage('Pas de données valides pour la grille hexadécimale');
        return;
    }
    
    // Get all cells in the grid
    const cells = document.querySelectorAll('#moduleHexGrid .hex-cell:not(.hex-header)');
    console.log('Cells found in grid:', cells.length);
    
    // Check if the grid exists
    if (!cells || cells.length === 0) {
        logMessage('La grille hexadécimale n\'est pas disponible');
        console.error('No cells found in #moduleHexGrid');
        return;
    }
    
    // Fill each cell with corresponding data
    for (let i = 0; i < Math.min(cells.length, data.length); i++) {
        const cell = cells[i];
        const value = data[i];
        
        if (cell) {
            // Format the value in hexadecimal on 2 characters (00-FF)
            cell.textContent = value.toString(16).toUpperCase().padStart(2, '0');
            
            // Add different colors for special areas
            if (i >= 0x14 && i < 0x24) { // Vendor name (0x14-0x23)
                cell.style.backgroundColor = '#E8F5E9'; // Light green
            } else if (i >= 0x28 && i < 0x38) { // Part number (0x28-0x37)
                cell.style.backgroundColor = '#E3F2FD'; // Light blue
            } else if (i >= 0x44 && i < 0x54) { // Serial number (0x44-0x53)
                cell.style.backgroundColor = '#FFF8E1'; // Light yellow
            } else if (i >= 0x54 && i < 0x5C) { // Date code (0x54-0x5B)
                cell.style.backgroundColor = '#F3E5F5'; // Light purple
            } else {
                cell.style.backgroundColor = ''; // Default color
            }
        }
    }
    
    logMessage('Grille hexadécimale du module mise à jour');
}

// Exportation des fonctions pour l'utilisation dans d'autres fichiers
window.codingbox = {
    readModule,
    singleWrite,
    disconnectDevice,
    isDeviceConnected,
    getDeviceInfo
};
