import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { loginUser } from '../../../../packages/shared/redux/slices/authSlice';
import { useToast } from '../../../../packages/shared/context/ToastContext';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const toast     = useToast();

  const { user, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin' || user.isAdmin === true;
      console.log('🔄 useEffect user détecté:', user, '| isAdmin:', isAdmin);
      if (isAdmin) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, location]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('📤 Envoi login avec:', form.email);

      const result = await dispatch(loginUser(form)).unwrap();

      // 🔍 LOG 1 — structure complète retournée
      console.log('🟢 LOGIN RESULT complet:', JSON.stringify(result, null, 2));

      const user = result.user;

      // 🔍 LOG 2 — objet user isolé
      console.log('👤 user object:', JSON.stringify(user, null, 2));
      console.log('👤 user.role:', user?.role);
      console.log('👤 user.isAdmin:', user?.isAdmin);

      const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

      // 🔍 LOG 3 — résultat du check
      console.log('🔐 isAdmin result:', isAdmin);

      if (!isAdmin) {
        console.warn('⛔ Accès refusé — pas admin. role =', user?.role, '/ isAdmin =', user?.isAdmin);
        toast.error('Accès réservé aux administrateurs');
        return;
      }

      toast.success('Connexion réussie !');
      navigate('/admin/dashboard', { replace: true });

    } catch (err) {
      // 🔍 LOG 4 — erreur
      console.error('🔴 LOGIN ERROR:', JSON.stringify(err, null, 2));
      setFormError(typeof err === 'string' ? err : 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg tracking-tight">Tekalis</p>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">Administration</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Connexion</h1>
        <p className="text-sm text-gray-500 mb-6">Accès réservé aux administrateurs</p>

        {(formError || error) && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{formError || error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@tekalis.sn"
              autoComplete="email"
              required
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;