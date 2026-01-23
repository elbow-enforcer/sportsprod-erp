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

const capitalItems: NavItem[] = [
  { path: '/capital', label: 'Capital', icon: '🏦', permission: 'view:capital' },
  { path: '/dcf', label: 'DCF Model', icon: '📉', permission: 'view:dcf' },
  { path: '/inventory', label: 'Inventory', icon: '📦', permission: 'view:inventory' },
]

const marketingItems: NavItem[] = [
  { path: '/marketing', label: 'Marketing', icon: '📣', permission: 'view:marketing' },
  { path: '/marketing/launch', label: 'Launch Plan', icon: '🚀', permission: 'view:marketing' },
  { path: '/marketing/email', label: 'Email Sequences', icon: '📧', permission: 'view:marketing' },
  { path: '/marketing/campaigns', label: 'Campaigns', icon: '🎯', permission: 'view:marketing' },
  { path: '/marketing/analytics', label: 'Analytics', icon: '📊', permission: 'view:marketing' },
  { path: '/marketing/referrals', label: 'Referrals', icon: '🤝', permission: 'view:marketing' },
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
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${
          collapsed ? 'hidden' : ''
        }`}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              S
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg">SportsProd</span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hidden lg:block"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          {navItems.map((item) => (
            <NavItemLink key={item.path} item={item} collapsed={collapsed} />
          ))}

          {/* Capital Section - requires at least one capital permission */}
          <PermissionGate permission="view:capital" fallback={
            <PermissionGate permission="view:inventory">
              <SectionHeader label="Capital" collapsed={collapsed} />
              {capitalItems.filter(i => i.permission === 'view:inventory').map((item) => (
                <NavItemLink key={item.path} item={item} collapsed={collapsed} />
              ))}
            </PermissionGate>
          }>
            <SectionHeader label="Capital" collapsed={collapsed} />
            {capitalItems.map((item) => (
              <NavItemLink key={item.path} item={item} collapsed={collapsed} />
            ))}
          </PermissionGate>

          {/* Marketing Section */}
          <PermissionGate permission="view:marketing">
            <SectionHeader label="Marketing" collapsed={collapsed} />
            {marketingItems.map((item) => (
              <NavItemLink key={item.path} item={item} collapsed={collapsed} />
            ))}
          </PermissionGate>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {!collapsed && (
            <p className="text-xs text-slate-500">ERP v0.1.0</p>
          )}
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(false)}
        className={`fixed bottom-4 left-4 z-10 p-3 bg-slate-900 text-white rounded-full shadow-lg lg:hidden ${
          collapsed ? '' : 'hidden'
        }`}
      >
        ☰
      </button>
    </>
  )
}
