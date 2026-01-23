import { ReactNode } from 'react';
import { usePermission } from './usePermission';
import { Permission } from './permissions';

interface Props {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: Props) {
  const hasAccess = usePermission(permission);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface MultiPermissionProps {
  permissions: Permission[];
  mode?: 'all' | 'any';
  children: ReactNode;
  fallback?: ReactNode;
}

export function MultiPermissionGate({ 
  permissions, 
  mode = 'any', 
  children, 
  fallback = null 
}: MultiPermissionProps) {
  const checks = permissions.map(usePermission);
  const hasAccess = mode === 'all' 
    ? checks.every(Boolean) 
    : checks.some(Boolean);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
