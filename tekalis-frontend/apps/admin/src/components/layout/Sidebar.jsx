import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Wrench, Shield,
  FileText, BarChart3, Users, Star, Tag, Settings,
  ChevronDown, ChevronRight, X, Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Commandes',     icon: ShoppingCart,    to: '/orders' },
  {
    label: 'Produits', icon: Package, to: '/products',
    children: [
      { label: 'Liste produits',  to: '/products' },
      { label: 'Ajouter produit', to: '/products/add' },
      { label: 'Catégories',      to: '/categories' },
    ],
  },
  { label: 'Utilisateurs',  icon: Users,    to: '/users' },
  { label: 'Avis',          icon: Star,     to: '/reviews' },
  {
    label: 'SAV / RMA', icon: Wrench, to: '/rma',
    children: [
      { label: 'RMA',       to: '/rma' },
      { label: 'Garanties', to: '/warranties' },
    ],
  },
  {
    label: 'Blog', icon: FileText, to: '/articles',
    children: [
      { label: 'Articles',       to: '/articles' },
      { label: 'Nouvel article', to: '/articles/add' },
    ],
  },
  { label: 'Analytics',    icon: BarChart3, to: '/analytics' },
  { label: 'Promo Codes',  icon: Tag,       to: '/promo-codes' },
  { label: 'Paramètres',   icon: Settings,  to: '/settings' },
];

const SubMenu = ({ item, collapsed }) => {
  const location = useLocation();
  const [open, setOpen] = useState(
    () => item.children?.some((c) => location.pathname.startsWith(c.to)) ?? false
  );

  const isParentActive = location.pathname.startsWith(item.to);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
          ${isParentActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <item.icon size={18} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-9 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end={child.to === item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150
                ${isActive ? 'text-white bg-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

const NavItem = ({ item, collapsed }) => (
  <NavLink
    to={item.to}
    end={item.to === '/dashboard'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
      ${isActive
        ? 'text-white bg-gradient-to-r from-blue-600/30 to-blue-500/10 border border-blue-500/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'}`
    }
    title={collapsed ? item.label : undefined}
  >
    <item.icon size={18} className="flex-shrink-0" />
    {!collapsed && <span>{item.label}</span>}
    {!collapsed && item.badge && (
      <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {item.badge}
      </span>
    )}
  </NavLink>
);

const Sidebar = ({ isOpen, isMobileOpen, onClose }) => {
  const collapsed = !isOpen;
  return (
    <>
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-30 bg-gray-900 border-r border-white/5 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent collapsed={collapsed} />
      </aside>
      <aside className={`flex lg:hidden flex-col fixed top-0 left-0 h-full z-30 w-64 bg-gray-900 border-r border-white/5 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
            <X size={18} />
          </button>
        </div>
        <SidebarContent collapsed={false} />
      </aside>
    </>
  );
};

const SidebarContent = ({ collapsed }) => (
  <div className="flex flex-col h-full overflow-hidden">
    <div className={`flex items-center gap-2.5 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Zap size={16} className="text-white" />
      </div>
      {!collapsed && (
        <div>
          <span className="text-white font-bold text-base tracking-tight">Tekalis</span>
          <span className="block text-[10px] text-gray-500 font-medium tracking-widest uppercase">Admin</span>
        </div>
      )}
    </div>

    <div className="mx-3 mb-2 border-t border-white/5" />

    <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 py-2 scrollbar-none">
      {NAV_ITEMS.map((item) =>
        item.children
          ? <SubMenu key={item.to} item={item} collapsed={collapsed} />
          : <NavItem key={item.to} item={item} collapsed={collapsed} />
      )}
    </nav>

    {!collapsed && (
      <div className="p-3 m-3 rounded-xl bg-white/[0.03] border border-white/5">
        <p className="text-[10px] text-gray-600 font-medium tracking-wider uppercase mb-1">Version</p>
        <p className="text-xs text-gray-400">Tekalis Admin v1.0</p>
      </div>
    )}
  </div>
);

export default Sidebar;