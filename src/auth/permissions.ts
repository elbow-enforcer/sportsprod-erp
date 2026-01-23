export type Role = 'admin' | 'finance' | 'management' | 'sales_marketing' | 'operations';

export type Permission = 
  | 'view:dashboard'
  | 'view:projections'
  | 'view:revenue'
  | 'view:costs'
  | 'view:costs:salaries'
  | 'view:marketing'
  | 'view:inventory'
  | 'view:capital'
  | 'view:dcf'
  | 'view:fpa'
  | 'view:supply-chain'
  | 'view:sales'
  | 'view:production'
  | 'edit:supply-chain'
  | 'edit:sales'
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
    'view:fpa',
    'view:supply-chain',
    'view:sales',
    'view:production',
    'edit:supply-chain',
    'edit:sales',
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
    'view:fpa',
    'view:supply-chain',
    'view:sales',
    'view:production',
  ],
  
  management: [
    'view:dashboard',
    'view:projections',
    'view:revenue',
    'view:costs',
    'view:marketing',
    'view:inventory',
    'view:capital',
    'view:supply-chain',
    'view:sales',
    'view:production',
    'edit:supply-chain',
    'edit:sales',
  ],
  
  sales_marketing: [
    'view:dashboard',
    'view:projections',
    'view:revenue',
    'view:marketing',
    'view:sales',
    'edit:sales',
  ],
  
  operations: [
    'view:dashboard',
    'view:inventory',
    'view:supply-chain',
    'view:sales',
    'view:production',
    'edit:supply-chain',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  finance: 'Finance & Accounting',
  management: 'Management',
  sales_marketing: 'Sales & Marketing',
  operations: 'Operations',
};
