import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Tags, ShoppingCart, UserCog, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const baseNavItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory/categories', label: 'Categories', icon: Tags },
  { to: '/inventory/products', label: 'Products', icon: Package },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
];

const adminNavItem: NavItem = { to: '/users', label: 'Users', icon: UserCog };

export function AppShell() {
  const { user, logout } = useAuth();
  const navItems = user?.role === 'ADMIN' ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <div className="flex min-h-screen flex-col bg-graphite-50 lg:flex-row">
      {/* Desktop sidebar (lg+) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-graphite-200 bg-white lg:flex">
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

      {/* Mobile top bar (< lg) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-graphite-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 text-[13px] font-bold tracking-tight text-white">
            HS
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-graphite-900">House of Seya</p>
            <p className="truncate text-[11px] leading-tight text-graphite-400">{user?.name} · {user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          aria-label="Sign out"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-graphite-500 hover:bg-graphite-100 hover:text-graphite-800"
        >
          <LogOut className="h-[17px] w-[17px]" strokeWidth={2} />
        </button>
      </header>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar (< lg) */}
      <nav className="sticky bottom-0 z-30 flex items-stretch justify-around border-t border-graphite-200 bg-white lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-brand-700' : 'text-graphite-500 hover:text-graphite-800',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
