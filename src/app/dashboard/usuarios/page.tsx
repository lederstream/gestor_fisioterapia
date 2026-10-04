import { dbStore } from "@/lib/store";
import { UserManager } from "@/components/usuarios/UserManager";
import { PermissionGuard } from "@/components/layout/PermissionGuard";

export default function UsuariosPage() {
  const users = dbStore.getUsers();

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
