"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Permission, ROLE_DETAILS } from "@/lib/permissions";
import { ShieldAlert, ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export function PermissionGuard({
  permission,
  children,
  fallbackTitle,
  fallbackMessage,
}: PermissionGuardProps) {
  const { hasPermission, currentRole, switchRole } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  const roleInfo = ROLE_DETAILS[currentRole];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-2xl mx-auto my-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5" /> Medida de Seguridad Activa (RBAC)
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {fallbackTitle || "Acceso Restringido para este Rol"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          {fallbackMessage ||
            `Su rol actual (${roleInfo.label}) no dispone de autorización para consultar o gestionar este módulo clínico o financiero.`}
        </p>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Rol del Usuario en Sesión:</span>
          <span className={`px-2.5 py-0.5 rounded-lg font-bold border text-[11px] ${roleInfo.badge}`}>
            {roleInfo.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Permiso Exigido:</span>
          <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 rounded border">
            {permission}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
          Para garantizar la confidencialidad médica y la separación de funciones operativas en Sede San Borja, los permisos de caja, evolución clínica y configuración son estrictamente segmentados.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel Autorizado</span>
        </Link>
        {currentRole !== "ADMIN" && (
          <button
            onClick={() => switchRole("ADMIN")}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simular como Administrador</span>
          </button>
        )}
      </div>
    </div>
  );
}
