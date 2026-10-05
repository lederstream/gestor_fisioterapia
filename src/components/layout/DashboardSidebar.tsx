"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Activity, 
  Home, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  History, 
  Settings, 
  KeyRound,
  X,
  User,
  Globe,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Permission } from "@/lib/permissions";

interface DashboardSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  permission?: Permission;
}

const allNavigation: NavItem[] = [
  { name: "Resumen General", href: "/dashboard", icon: Home },
  { name: "Agenda (6 Salas)", href: "/dashboard/agenda", icon: Calendar, badge: "6 Salas", permission: "agenda:ver" },
  { name: "Caja y Cobranzas", href: "/dashboard/caja", icon: CreditCard, permission: "caja:ver" },
  { name: "Directorio Pacientes", href: "/dashboard/pacientes", icon: Users, permission: "pacientes:ver" },
  { name: "Usuarios y Roles", href: "/dashboard/usuarios", icon: KeyRound, badge: "RBAC", permission: "usuarios:gestionar" },
  { name: "Auditoría y Trazabilidad", href: "/dashboard/auditoria", icon: History, permission: "auditoria:ver" },
  { name: "Configuración Centro", href: "/dashboard/configuracion", icon: Settings, permission: "config:ver" },
];

export function DashboardSidebar({ isOpenMobile = false, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { currentRole, currentUser, hasPermission, roleDetails } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Filtrado dinámico según permisos asignados al rol activo
  const filteredNavigation = allNavigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside con verde casi oscuro */}
      <aside 
        className={cn(
          "w-64 bg-gradient-to-b from-[#062c28] via-[#093833] to-[#041f1c] text-teal-100 flex flex-col border-r border-[#0d4740] shrink-0 z-50",
          "fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"
        )}
      >
        {/* Brand Header con enlace al Dashboard */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/15">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-teal-950 shadow-md shadow-emerald-500/20 font-black text-lg group-hover:scale-105 transition-transform">
              GF
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base block leading-none group-hover:text-emerald-300 transition-colors">
                Gestor Fisioterapia
              </span>
              <span className="text-[11px] text-teal-300 font-semibold tracking-wide">
                AJ Fisioterapia • San Borja
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-teal-300/80 hover:text-white hover:bg-white/10 md:hidden transition"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-teal-300/70 uppercase tracking-wider flex items-center justify-between">
            <span>Módulos Autorizados</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-white/10 text-teal-200 border-white/15">
              {currentRole}
            </span>
          </div>

          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-950/40 border border-teal-300/30 font-bold"
                    : "text-teal-100/75 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-teal-300/80")} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    isActive 
                      ? "bg-white/20 text-white border-white/30" 
                      : "bg-white/10 text-teal-200 border-white/15"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Único enlace limpio al portal público */}
          <div className="pt-5 px-3 pb-2 text-[10px] font-bold text-teal-300/70 uppercase tracking-wider">
            Portal Público
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-teal-100/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Globe className="w-4 h-4 text-teal-300" />
            <span className="flex-1">Ver Sitio Web</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-400/60" />
          </Link>
        </nav>

        {/* Clinic Operational Badge */}
        <div className="p-3.5 border border-white/10 bg-white/5 m-3 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Seguridad & RBAC Activo</span>
          </div>
          <p className="text-[11px] text-teal-200/70 leading-relaxed">
            Acceso restringido por rol con trazabilidad inmutable de acciones.
          </p>
        </div>

        {/* User Footer with Active Role & Confirmation Log Out */}
        <div className="p-3 border-t border-white/10 bg-black/25 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-teal-950 flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              {currentUser.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.nombre}</p>
              <p className="text-[10px] text-teal-300 font-medium truncate">
                {roleDetails.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-teal-300/70 hover:text-rose-400 hover:bg-white/10 transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Modal de Confirmación de Cierre de Sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  ¿Cerrar sesión?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentUser.nombre} ({roleDetails.label})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Estás a punto de salir del panel de AJ Fisioterapia. Asegúrate de haber guardado todas las notas clínicas y operaciones antes de salir.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <Link
                href="/"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sí, Cerrar Sesión</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



