import React, { useState } from 'react';
import { Trophy, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthProps {
  loginFn: (email: string, password: string) => Promise<void>;
  registerFn: (email: string, username: string, password: string) => Promise<void>;
  errorMsg: string | null;
  clearError: () => void;
}

export const Auth: React.FC<AuthProps> = ({ loginFn, registerFn, errorMsg, clearError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validation
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!isLogin) {
      if (username.trim().length < 3) {
        setLocalError('El usuario debe tener al menos 3 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Las contraseñas no coinciden.');
        return;
      }
      if (password.length < 6) {
        setLocalError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await loginFn(email, password);
      } else {
        await registerFn(email, username, password);
      }
    } catch (err: any) {
      // Errors are handled by the hook/service and passed down
      setLocalError(err.message || 'Error en el proceso de autenticación.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setLocalError(null);
    clearError();
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
          <Trophy size={40} className="stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 tracking-tight leading-none mb-2">
          POLLA MUNDIALISTA
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest">
          Mundial 2026 Predictor Game
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 shadow-xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6 text-left">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {(localError || errorMsg) && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left">
            {localError || errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 text-left">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 text-left">
                Nombre de Usuario (@username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 text-left">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 text-left">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg text-sm shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : isLogin ? (
              'Ingresar'
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-900 text-center">
          <button
            onClick={toggleMode}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
          </button>
        </div>
      </div>
      
      {/* Quick Mock Accounts Note for Easy Testing */}
      <div className="mt-6 text-center text-[10px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
        Modo Demo: Puedes usar <span className="text-slate-300 font-semibold">admin@polla.com</span> (cuenta Admin) o <span className="text-slate-300 font-semibold">juan@polla.com</span> (Usuario) para ingresar de inmediato.
      </div>
    </div>
  );
};
