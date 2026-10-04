"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, Permission, ROLE_PERMISSIONS, ROLE_DETAILS, hasPermission as checkPerm } from "./permissions";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  especialidad?: string;
}

const DEFAULT_USERS: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: "usr-admin-1",
    nombre: "Marco Antonio",
    email: "gerencia@ajfisioterapia.pe",
    rol: "ADMIN",
    especialidad: "Dirección Médica y Gerencia",
  },
  RECEPCION: {
    id: "usr-rec-1",
    nombre: "Ana Ramos",
    email: "recepcion1@ajfisioterapia.pe",
    rol: "RECEPCION",
    especialidad: "Admisión & Coordinación San Borja",
  },
  TERAPEUTA: {
    id: "usr-ter-1",
    nombre: "Lic. Carlos Mendoza",
    email: "carlos.mendoza@ajfisioterapia.pe",
    rol: "TERAPEUTA",
    especialidad: "Lic. Fisioterapia Deportiva (CTMP 12480)",
  },
  PACIENTE: {
    id: "usr-pac-1",
    nombre: "Renato Salazar",
    email: "renato.salazar@gmail.com",
    rol: "PACIENTE",
    especialidad: "Paciente Titular (DNI: 45892011)",
  },
};

interface AuthContextType {
  currentRole: UserRole;
  currentUser: AuthUser;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  roleDetails: typeof ROLE_DETAILS[UserRole];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("kineflow_active_role") as UserRole;
    if (saved && (saved === "ADMIN" || saved === "RECEPCION" || saved === "TERAPEUTA" || saved === "PACIENTE")) {
      setCurrentRole(saved);
    }
  }, []);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("kineflow_active_role", role);
    }
  };

  const currentUser = DEFAULT_USERS[currentRole];
  const roleDetails = ROLE_DETAILS[currentRole];

  const hasPerm = (permission: Permission) => {
    return checkPerm(currentRole, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        switchRole,
        hasPermission: hasPerm,
        roleDetails,
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
