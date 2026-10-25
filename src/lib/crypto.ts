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

/**
 * Genera una contraseña criptográfica aleatoria de alta entropía (OWASP ASVS 4.0)
 * para entrega segura al colaborador por parte del Administrador.
 */
export function generarClaveAleatoriaSegura(longitud = 12): string {
  const mayusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sin O, I para evitar confusión
  const minusculas = "abcdefghijkmnopqrstuvwxyz"; // sin l
  const numeros = "23456789"; // sin 0, 1
  const simbolos = "!@#$%^&*()_+-=";

  const todos = mayusculas + minusculas + numeros + simbolos;
  const bytes = crypto.randomBytes(longitud);
  
  let clave = "";
  // Garantizar al menos uno de cada conjunto
  clave += mayusculas[crypto.randomInt(0, mayusculas.length)];
  clave += minusculas[crypto.randomInt(0, minusculas.length)];
  clave += numeros[crypto.randomInt(0, numeros.length)];
  clave += simbolos[crypto.randomInt(0, simbolos.length)];

  for (let i = 4; i < longitud; i++) {
    clave += todos[bytes[i] % todos.length];
  }

  // Mezclar los caracteres aleatoriamente
  return clave.split("").sort(() => crypto.randomInt(-1, 2)).join("");
}

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
