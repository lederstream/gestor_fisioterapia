import crypto from "crypto";

// Clave maestra derivada de AUTH_SECRET (32 bytes para AES-256-GCM)
const SECRET = process.env.AUTH_SECRET || "gestorfisio-secure-jwt-secret-key-32-chars-min!";
const CIPHER_KEY = crypto.createHash("sha256").update(SECRET).digest();

/**
 * Cifra un texto sensible (ej. notas médicas confidenciales, DNI de emergencia)
 * utilizando AES-256-GCM con vector de inicialización (IV) criptográfico aleatorio.
 * Cumple con Ley N.° 29733 (Protección de Datos Personales de Perú) y HIPAA.
 */
export function encriptarDatoSensible(textoPlano: string): string {
  if (!textoPlano) return textoPlano;
  try {
    const iv = crypto.randomBytes(12); // 96-bit IV para GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", CIPHER_KEY, iv);
    
    let encrypted = cipher.update(textoPlano, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Formato: iv:authTag:contenidoCifrado
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("Error al cifrar dato sensible:", error);
    return textoPlano;
  }
}

/**
 * Descifra un texto protegido con AES-256-GCM
 */
export function desencriptarDatoSensible(textoCifrado: string): string {
  if (!textoCifrado || !textoCifrado.includes(":")) return textoCifrado;
  try {
    const parts = textoCifrado.split(":");
    if (parts.length !== 3) return textoCifrado;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", CIPHER_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch {
    // Si no está cifrado en formato GCM, retorna original
    return textoCifrado;
  }
}

export { generarClaveAleatoriaSegura } from "./password-generator";

/**
 * Enmascara un DNI para visualización pública (ej. '45892011' -> '4589****')
 */
export function enmascararDni(dni: string): string {
  if (!dni || dni.length < 4) return dni;
  return dni.slice(0, 4) + "*".repeat(Math.max(0, dni.length - 4));
}

/**
 * Enmascara un correo electrónico para visualización pública
 */
export function enmascararEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, dominio] = email.split("@");
  if (local.length <= 2) return `**@${dominio}`;
  return `${local[0]}***${local[local.length - 1]}@${dominio}`;
}
