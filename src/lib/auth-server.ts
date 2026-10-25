import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "./permissions";

const COOKIE_NAME = "gestorfisio_session";
const DEFAULT_SECRET = "gestorfisio-secure-jwt-secret-key-32-chars-min!";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  nombre: string;
  email: string;
  rol: UserRole;
  especialidad?: string;
  isPaciente?: boolean;
}

/**
 * Genera un token JWT firmado de sesión con duración de 7 días
 */
export async function crearTokenSesion(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verifica y decodifica un token JWT de sesión
 */
export async function verificarTokenSesion(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Guarda la cookie de sesión HTTP-only segura en el navegador
 */
export async function establecerCookieSesion(payload: SessionPayload): Promise<void> {
  const token = await crearTokenSesion(payload);
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });
  } catch {
    // Si se invoca fuera del request context de Next.js (ej. scripts o tests)
  }
}

/**
 * Elimina la cookie de sesión
 */
export async function eliminarCookieSesion(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch {
    // Si se invoca fuera del request context de Next.js
  }
}

/**
 * Obtiene la sesión autenticada actual desde la cookie HTTP-only (Server Component / Action)
 */
export async function obtenerSesionServidor(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verificarTokenSesion(token);
  } catch {
    return null;
  }
}
