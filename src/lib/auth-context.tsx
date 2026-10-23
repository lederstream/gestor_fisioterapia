"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, Permission, ROLE_DETAILS, hasPermission as checkPerm } from "./permissions";
import { cerrarSesion, obtenerSesionActual } from "@/server/actions/auth";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  especialidad?: string;
  isPaciente?: boolean;
}

interface AuthContextType {
  currentRole: UserRole;
  currentUser: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  roleDetails: typeof ROLE_DETAILS[UserRole];
  setCurrentUser: (user: AuthUser) => void;
}

const FALLBACK_USER: AuthUser = {
  id: "usr-guest",
  nombre: "Usuario Clínico",
  email: "usuario@ajfisioterapia.pe",
  rol: "RECEPCION",
  especialidad: "Atención General",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children,
  initialUser,
}: { 
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [currentUser, setCurrentUser] = useState<AuthUser>(initialUser || FALLBACK_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);

  useEffect(() => {
    // Si no se proporcionó initialUser desde el servidor, consultar la sesión HTTP-only
    if (!initialUser) {
      obtenerSesionActual()
        .then((sesion) => {
          if (sesion) {
            const user: AuthUser = {
              id: sesion.userId,
              nombre: sesion.nombre,
              email: sesion.email,
              rol: sesion.rol,
              especialidad: sesion.especialidad,
              isPaciente: sesion.isPaciente,
            };
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [initialUser]);

  const logout = async () => {
    await cerrarSesion();
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const currentRole = currentUser.rol || "RECEPCION";
  const roleDetails = ROLE_DETAILS[currentRole] || ROLE_DETAILS["RECEPCION"];

  const hasPerm = (permission: Permission) => {
    return checkPerm(currentRole, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        isAuthenticated,
        isLoading,
        logout,
        hasPermission: hasPerm,
        roleDetails,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
