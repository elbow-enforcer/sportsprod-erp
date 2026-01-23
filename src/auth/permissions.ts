export type Role = 'admin' | 'finance' | 'management' | 'sales_marketing' | 'operations';

export type Permission = 
  | 'view:dashboard'
  | 'view:projections'
  | 'view:revenue'
  | 'view:costs'
  | 'view:costs:salaries'  // Restricted - only admin/finance
  | 'view:marketing'
  | 'view:inventory'
  | 'view:capital'
  | 'view:dcf'
  | 'edit:settings'
  | 'manage:users';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view:dashboard',
    'view:projections',
    'view:revenue',
    'view:costs',
    'view:costs:salaries',
    'view:marketing',
    'view:inventory',
    'view:capital',
    'view:dcf',
    'edit:settings',
    'manage:users',
  ],
  
  finance: [
    'view:dashboard',
    'view:projections',
    'view:revenue',
    'view:costs',
    'view:costs:salaries',
    'view:inventory',
    'view:capital',
    'view:dcf',
  ],
  
  management: [
    'view:dashboard',
    'view:projections',
    'view:revenue',
    'view:costs',
    'view:marketing',
    'view:inventory',
    'view:capital',
  ],
  
  sales_marketing: [
    'view:dashboard',
    'view:projections',
    'view:revenue',
    'view:marketing',
  ],
  
  operations: [
    'view:dashboard',
    'view:inventory',
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  finance: 'Finance & Accounting',
  management: 'Management',
  sales_marketing: 'Sales & Marketing',
  operations: 'Operations',
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
