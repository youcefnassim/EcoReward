import crypto from 'node:crypto';

// Clé de chiffrement maître (Doit faire exactement 32 caractères pour AES-256)
// Dans un vrai projet de production, cette clé est dans le fichier .env
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'eco_secure_key_1234567890123456'; 
const IV_LENGTH = 16; // Pour AES, l'IV fait toujours 16 octets

/**
 * Chiffre un texte (ex: Email, Nom de l'étudiant)
 */
export const encryptData = (text) => {
  if (!text) return text;
  
  // Générer un vecteur d'initialisation aléatoire
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // On retourne l'IV + les données chiffrées (séparés par un 2 points)
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Déchiffre un texte provenant de la base de données
 */
export const decryptData = (text) => {
  if (!text || !text.includes(':')) return text;

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error("Erreur de déchiffrement:", error);
    return null;
  }
};
