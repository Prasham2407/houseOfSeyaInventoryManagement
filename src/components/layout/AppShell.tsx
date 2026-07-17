import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Tags, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory/categories', label: 'Categories', icon: Tags },
  { to: '/inventory/products', label: 'Products', icon: Package },
  { to: '/invoices', label: 'Invoices', icon: FileText },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-graphite-50">
      <aside className="flex w-60 flex-col border-r border-graphite-200 bg-white">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 text-[13px] font-bold tracking-tight text-white">
            HS
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight text-graphite-900">House of Seya</p>
            <p className="text-[11px] leading-tight text-graphite-400">Inventory &amp; Invoicing</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-graphite-600 hover:bg-graphite-50 hover:text-graphite-900',
                  )
                }
              >
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-graphite-100 px-3 py-3">
          <div className="mb-1 flex items-center gap-2.5 rounded-md px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-graphite-200 text-[11px] font-semibold text-graphite-700">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-graphite-800">{user?.name}</p>
              <p className="truncate text-[11px] uppercase tracking-wide text-graphite-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium text-graphite-500 hover:bg-graphite-50 hover:text-graphite-800"
          >
            <LogOut className="h-[17px] w-[17px]" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
