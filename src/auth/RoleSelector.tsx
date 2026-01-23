import { Role, ROLE_LABELS } from './permissions';
import { useAuth } from './AuthProvider';

/**
 * Dev-only role selector for testing different permission levels.
 * Only renders in development mode.
 */
export function RoleSelector() {
  const { user, setRole } = useAuth();
  
  // Only show in development
  if (import.meta.env.PROD) return null;
  if (!user) return null;

  const roles: Role[] = ['admin', 'finance', 'management', 'sales_marketing', 'operations'];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-lg">
      <p className="text-xs font-bold text-yellow-800 mb-2">🔧 DEV: Role Switcher</p>
      <select
        value={user.role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="block w-full px-2 py-1 text-sm border border-yellow-400 rounded bg-white text-gray-800"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </div>
  );
}
