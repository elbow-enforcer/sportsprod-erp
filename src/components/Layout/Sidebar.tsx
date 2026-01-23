import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { PermissionGate, Permission } from '../../auth'

interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission?: Permission;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊', permission: 'view:dashboard' },
  { path: '/projections', label: 'Projections', icon: '📈', permission: 'view:projections' },
  { path: '/revenue', label: 'Revenue', icon: '💰', permission: 'view:revenue' },
  { path: '/costs', label: 'Costs', icon: '💸', permission: 'view:costs' },
]

const valuationItems: NavItem[] = [
  { path: '/valuation', label: 'DCF Valuation', icon: '📉', permission: 'view:dcf' },
  { path: '/assumptions', label: 'Assumptions', icon: '⚙️', permission: 'view:dcf' },
  { path: '/investors', label: 'Investor Cohorts', icon: '👥', permission: 'view:dcf' },
]

const capitalItems: NavItem[] = [
  { path: '/capital', label: 'Capital', icon: '🏦', permission: 'view:capital' },
  { path: '/inventory', label: 'Inventory', icon: '📦', permission: 'view:inventory' },
]

const marketingItems: NavItem[] = [
  { path: '/marketing', label: 'Marketing', icon: '📣', permission: 'view:marketing' },
  { path: '/marketing/launch', label: 'Launch Plan', icon: '🚀', permission: 'view:marketing' },
  { path: '/marketing/email', label: 'Email Sequences', icon: '📧', permission: 'view:marketing' },
  { path: '/marketing/campaigns', label: 'Campaigns', icon: '🎯', permission: 'view:marketing' },
  { path: '/marketing/analytics', label: 'Analytics', icon: '📊', permission: 'view:marketing' },
  { path: '/marketing/referrals', label: 'Referrals', icon: '🤝', permission: 'view:marketing' },
  { path: '/marketing/playbook', label: 'Video Playbook', icon: '📹', permission: 'view:marketing' },
  { path: '/marketing/ideas', label: 'Video Ideas', icon: '💡', permission: 'view:marketing' },
  { path: '/marketing/brief', label: 'Video Brief', icon: '📝', permission: 'view:marketing' },
  { path: '/marketing/competitors', label: 'Competitors', icon: '🔍', permission: 'view:marketing' },
]

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/marketing'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <span className="text-xl">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  if (item.permission) {
    return (
      <PermissionGate permission={item.permission}>
        {link}
      </PermissionGate>
    );
  }

  return link;
}

function SectionHeader({ label, collapsed }: { label: string; collapsed: boolean }) {
  return (
    <>
      {!collapsed && (
        <div className="pt-4 mt-4 border-t border-slate-700">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
        </div>
      )}
      {collapsed && <div className="pt-4 mt-4 border-t border-slate-700" />}
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-slate-900 text-white flex flex-col transition-all duration-200`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold">SportsProd</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-800 rounded"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItemLink key={item.path} item={item} collapsed={collapsed} />
        ))}
        
        <SectionHeader label="Valuation" collapsed={collapsed} />
        {valuationItems.map((item) => (
          <NavItemLink key={item.path} item={item} collapsed={collapsed} />
        ))}
        
        <SectionHeader label="Capital" collapsed={collapsed} />
        {capitalItems.map((item) => (
          <NavItemLink key={item.path} item={item} collapsed={collapsed} />
        ))}
        
        <SectionHeader label="Marketing" collapsed={collapsed} />
        {marketingItems.map((item) => (
          <NavItemLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        {!collapsed && (
          <p className="text-xs text-slate-500">ERP v0.1.0</p>
        )}
      </div>
    </aside>
  )
}
