import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/projections', label: 'Projections', icon: '📈' },
  { path: '/revenue', label: 'Revenue', icon: '💰' },
  { path: '/costs', label: 'Costs', icon: '💸' },
]

const capitalItems = [
  { path: '/capital', label: 'Capital', icon: '🏦' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
]

const marketingItems = [
  { path: '/marketing', label: 'Marketing', icon: '📣' },
  { path: '/marketing/launch', label: 'Launch Plan', icon: '🚀' },
  { path: '/marketing/email', label: 'Email Sequences', icon: '📧' },
  { path: '/marketing/campaigns', label: 'Campaigns', icon: '🎯' },
  { path: '/marketing/analytics', label: 'Analytics', icon: '📊' },
]

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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
          ))}

          {/* Capital Section */}
          {!collapsed && (
            <div className="pt-4 mt-4 border-t border-slate-700">
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Capital
              </p>
            </div>
          )}
          {collapsed && <div className="pt-4 mt-4 border-t border-slate-700" />}
          {capitalItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
          ))}

          {/* Marketing Section */}
          {!collapsed && (
            <div className="pt-4 mt-4 border-t border-slate-700">
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Marketing
              </p>
            </div>
          )}
          {collapsed && <div className="pt-4 mt-4 border-t border-slate-700" />}
          {marketingItems.map((item) => (
            <NavLink
              key={item.path}
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
          ))}
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
