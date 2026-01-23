import { useAuth } from './AuthProvider';
import { hasPermission, Permission, Role } from './permissions';

export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return hasPermission(user.role as Role, permission);
}

export function usePermissions(permissions: Permission[]): boolean[] {
  const { user } = useAuth();
  if (!user) return permissions.map(() => false);
  return permissions.map(p => hasPermission(user.role as Role, p));
}

export function useRole(): Role | null {
  const { user } = useAuth();
  return user?.role as Role | null;
}
