export { AuthProvider, useAuth } from './AuthProvider';
export { LoginPage } from './LoginPage';
export { ProtectedRoute } from './ProtectedRoute';
export { PermissionGate, MultiPermissionGate } from './PermissionGate';
export { usePermission, usePermissions, useRole } from './usePermission';
export { RoleSelector } from './RoleSelector';
export { 
  hasPermission, 
  getRolePermissions, 
  ROLE_PERMISSIONS, 
  ROLE_LABELS,
  type Role,
  type Permission,
} from './permissions';
