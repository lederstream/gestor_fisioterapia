import { obtenerUsuarios } from "@/server/actions/usuarios";
import { UserManager } from "@/components/usuarios/UserManager";
import { PermissionGuard } from "@/components/layout/PermissionGuard";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const users = await obtenerUsuarios();

  return (
    <PermissionGuard
      permission="usuarios:gestionar"
      fallbackTitle="Gestión de Usuarios Restringida"
      fallbackMessage="La administración y reasignación de roles es exclusiva para el perfil de Administrador / Gerencia."
    >
      <UserManager initialUsers={users} />
    </PermissionGuard>
  );
}
