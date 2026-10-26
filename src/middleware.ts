import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "gestorfisio_session";
const DEFAULT_SECRET = "gestorfisio-secure-jwt-secret-key-32-chars-min!";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      session = payload as {
        userId: string;
        nombre: string;
        email: string;
        rol: string;
        isPaciente?: boolean;
      };
    } catch {
      session = null;
    }
  }

  // 1. Si ya está autenticado y visita /login, redirigir a su portal correspondiente
  if (pathname === "/login") {
    if (session) {
      const targetUrl = session.rol === "PACIENTE" 
        ? "/dashboard" 
        : session.rol === "RECEPCION" || session.rol === "TERAPEUTA" || session.rol === "ASISTENTE"
          ? "/dashboard/agenda" 
          : "/dashboard";
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    return NextResponse.next();
  }

  // 2. Proteger todas las rutas de /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { rol } = session;

    // Reglas estrictas RBAC por Rol:
    if (rol === "PACIENTE") {
      const allowedPatientPaths = [
        "/dashboard",
        "/dashboard/mis-citas",
        "/dashboard/mis-pagos",
        "/dashboard/tratamiento",
      ];
      const isAllowed = allowedPatientPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (rol === "RECEPCION") {
      // Recepción no puede ver configuraciones críticas ni auditoría general
      const restrictedForRecepcion = [
        "/dashboard/usuarios",
        "/dashboard/configuracion",
        "/dashboard/auditoria",
      ];
      if (restrictedForRecepcion.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard/agenda", request.url));
      }
    }

    if (rol === "TERAPEUTA" || rol === "ASISTENTE") {
      // Terapeutas y Asistentes no tienen acceso a finanzas (caja), usuarios, config ni auditoría
      const restrictedForStaff = [
        "/dashboard/caja",
        "/dashboard/usuarios",
        "/dashboard/configuracion",
        "/dashboard/auditoria",
      ];
      if (restrictedForStaff.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard/agenda", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
};
