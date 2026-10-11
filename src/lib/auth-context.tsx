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
    nombre: "Marco Yana",
    email: "marco.yana@ajfisioterapia.pe",
    rol: "ADMIN",
    especialidad: "Dirección Médica y Gerencia",
  },
  RECEPCION: {
    id: "usr-rec-1",
    nombre: "Karin Palacios",
    email: "karin.palacios@ajfisioterapia.pe",
    rol: "RECEPCION",
    especialidad: "Admisión & Coordinación San Borja",
  },
  TERAPEUTA: {
    id: "usr-ter-1",
    nombre: "Lic. Jeiser Vasquez",
    email: "jeiser.vasquez@ajfisioterapia.pe",
    rol: "TERAPEUTA",
    especialidad: "Lic. Fisioterapia Deportiva (CTMP 12480)",
  },
  PACIENTE: {
    id: "usr-pac-1",
    nombre: "Alexander Saavedra",
    email: "alexander.saavedra@gmail.com",
    rol: "PACIENTE",
    especialidad: "Paciente Titular (DNI: 45892011)",
  },
};

interface AuthContextType {
  currentRole: UserRole;
  currentUser: AuthUser;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  roleDetails: typeof ROLE_DETAILS[UserRole];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem("gestorfisio_active_role") as UserRole;
    if (savedRole && (savedRole === "ADMIN" || savedRole === "RECEPCION" || savedRole === "TERAPEUTA" || savedRole === "PACIENTE")) {
      setCurrentRole(savedRole);
    }
    const sessionActive = localStorage.getItem("gestorfisio_session_active");
    if (sessionActive === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (role?: UserRole) => {
    const targetRole = role || currentRole;
    setCurrentRole(targetRole);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("gestorfisio_session_active", "true");
      localStorage.setItem("gestorfisio_active_role", targetRole);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gestorfisio_session_active");
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("gestorfisio_active_role", role);
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
        isAuthenticated,
        login,
        logout,
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
