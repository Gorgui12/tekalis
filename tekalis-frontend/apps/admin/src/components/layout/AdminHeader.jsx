import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { logout } from '../../../../../packages/shared/redux/slices/authSlice';
import { getInitials, stringToColor } from '../../../../../packages/shared/outils/helpers';

/* ── Breadcrumb ─────────────────────────────────────────────────────────── */
const ROUTE_LABELS = {
  dashboard:   'Dashboard',
  orders:      'Commandes',
  products:    'Produits',
  add:         'Ajouter',
  edit:        'Modifier',
  sav:         'SAV / RMA',
  warranties:  'Garanties',
  blog:        'Blog',
  analytics:   'Analytics',
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname
    .replace('/admin/', '')
    .split('/')
    .filter(Boolean)
    .filter((s) => !/^[0-9a-f]{24}$/i.test(s)); // exclure les IDs MongoDB

  return (
    <nav className="hidden sm:flex items-center gap-1 text-sm">
      <span className="text-gray-500">Admin</span>
      {segments.map((seg, i) => (
        <React.Fragment key={seg + i}>
          <ChevronRight size={14} className="text-gray-700" />
          <span className={i === segments.length - 1 ? 'text-white font-medium' : 'text-gray-500'}>
            {ROUTE_LABELS[seg] || seg}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

/* ── Dropdown profil ────────────────────────────────────────────────────── */
const ProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = getInitials(user?.name || user?.email || 'A');
  const avatarColor = stringToColor(user?.name || user?.email || 'admin');

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: avatarColor }}
        >
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm text-white font-medium leading-none">
            {user?.name || 'Admin'}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-none">
            {user?.email || ''}
          </p>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <DropdownItem icon={User} label="Mon profil" onClick={() => setOpen(false)} />
            <DropdownItem icon={Settings} label="Paramètres" onClick={() => setOpen(false)} />
            <div className="my-1 border-t border-white/5" />
            <DropdownItem icon={LogOut} label="Déconnexion" onClick={onLogout} danger />
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition
      ${danger
        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
        : 'text-gray-300 hover:text-white hover:bg-white/5'
      }
    `}
  >
    <Icon size={15} />
    {label}
  </button>
);

/* ── AdminHeader principal ──────────────────────────────────────────────── */
const AdminHeader = ({ onMenuClick, onSidebarToggle, sidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-14 bg-gray-900/80 backdrop-blur-sm border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Toggle sidebar desktop */}
      <button
        onClick={onSidebarToggle}
        className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
        title={sidebarOpen ? 'Réduire' : 'Étendre'}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {/* Burger mobile */}
      <button
        onClick={onMenuClick}
        className="flex lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifs */}
      <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
      </button>

      {/* Profil */}
      <ProfileDropdown user={user} onLogout={handleLogout} />
    </header>
  );
};

export default AdminHeader;