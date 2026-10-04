"use client";

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
  LogOut
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

      {/* Sidebar Aside */}
      <aside 
        className={cn(
          "w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200 shrink-0 z-50",
          "fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"
        )}
      >
        {/* Brand Header con enlace al Dashboard */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-600/20 font-bold text-lg group-hover:scale-105 transition-transform">
              KF
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-base block leading-none group-hover:text-teal-700 transition-colors">
                KineFlow Core
              </span>
              <span className="text-[11px] text-teal-700 font-semibold tracking-wide">
                AJ Fisioterapia • San Borja
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Módulos Autorizados</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded border", roleDetails.badge)}>
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
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500")} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    isActive 
                      ? "bg-white/20 text-white border-white/30" 
                      : "bg-teal-50 text-teal-700 border-teal-200"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navegación Web
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span className="flex-1">Sitio Web Principal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link
            href="/reservas"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="flex-1">Portal Paciente / Reservas</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-600/80" />
          </Link>
        </nav>

        {/* Clinic Operational Badge */}
        <div className="p-3.5 border border-teal-200/70 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 m-3 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-slate-900">Seguridad & RBAC Activo</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Medidas de seguridad activas: Acceso restringido por rol con trazabilidad inmutable de acciones.
          </p>
        </div>

        {/* User Footer with Active Role & Log Out / Return Home */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
              {currentUser.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.nombre}</p>
              <p className="text-[10px] text-teal-700 font-medium truncate">
                {roleDetails.label}
              </p>
            </div>
          </div>
          <Link
            href="/"
            title="Cerrar sesión e ir a la portada de inicio"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>
    </>
  );
}


