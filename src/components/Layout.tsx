import React, { useState } from 'react';
import { Globe, Trophy, User, ShieldCheck, Bell, Table2 } from 'lucide-react';
import type { UserProfile } from '../types';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, activeTab, setActiveTab, children }) => {
  const { 
    pendingNotifications, 
    pendingCount, 
    acceptInvitation, 
    rejectInvitation 
  } = useNotifications(user.uid);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    try {
      await acceptInvitation(id);
    } catch (err: any) {
      setActionError(err.message || 'Error al aceptar la invitación.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    try {
      await rejectInvitation(id);
    } catch (err: any) {
      setActionError(err.message || 'Error al rechazar la invitación.');
    } finally {
      setActionLoading(null);
    }
  };
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    // Only display if running in normal browser mode and not dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = localStorage.getItem('pwa_install_banner_dismissed') === 'true';
    return !isStandalone && !isDismissed;
  });

  const handleDismissBanner = () => {
    localStorage.setItem('pwa_install_banner_dismissed', 'true');
    setShowInstallBanner(false);
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-950/80 p-0 sm:py-4 md:py-8">
      {/* Smartphone View Container */}
      <div className="relative w-full max-w-md bg-slate-950 text-slate-100 flex flex-col shadow-2xl border-0 sm:border border-slate-800/80 sm:rounded-3xl overflow-hidden min-h-[100vh] sm:min-h-[840px] max-h-none sm:max-h-[880px]">
        {/* Top Header */}
        <header className="glass-accent sticky top-0 z-30 px-5 py-4 flex items-center justify-between shadow-md border-b border-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs">
              2026
            </span>
            <span className="font-extrabold text-sm uppercase tracking-wider text-slate-100">
              Polla Mundialista
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Bell Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors relative cursor-pointer active:scale-95 ${
                  showNotifications ? 'text-slate-200 border-slate-700 bg-slate-850' : ''
                }`}
                title="Notificaciones"
              >
                <Bell size={16} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-slate-950 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fadeIn text-left">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-200">Invitaciones</span>
                    <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-cyan-400 font-bold border border-slate-800">
                      {pendingCount} Pendientes
                    </span>
                  </div>

                  {actionError && (
                    <div className="text-[10px] text-rose-400 bg-rose-500/10 p-2 rounded mb-2 border border-rose-500/10">
                      {actionError}
                    </div>
                  )}

                  {pendingNotifications.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">No tienes invitaciones pendientes.</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {pendingNotifications.map((n) => (
                        <div key={n.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-2">
                          <p className="text-[10px] text-slate-300 leading-normal">
                            <span className="font-bold text-cyan-400">@{n.fromUsername}</span> te invitó al torneo <span className="font-bold text-slate-100">"{n.tournamentName}"</span>.
                          </p>
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                               onClick={() => handleReject(n.id)}
                              disabled={actionLoading !== null}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase cursor-pointer disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleAccept(n.id)}
                              disabled={actionLoading !== null}
                              className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-bold uppercase cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionLoading === n.id && <span className="h-2 w-2 border border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                              <span>Aceptar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-slate-300">
                @{user.username}
              </span>
              {user.isAdmin && (
                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-bold px-1.5 py-0.2 rounded uppercase border border-cyan-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>
        </header>

        {/* PWA Install Tip Banner */}
        {showInstallBanner && (
          <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border-b border-slate-900/80 px-4 py-2.5 flex items-center justify-between text-left gap-3 animate-fadeIn">
            <div className="flex-1">
              <p className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <span>📲</span> JUGAR EN PANTALLA COMPLETA
              </p>
              <p className="text-[8px] text-slate-400 leading-normal font-medium">
                ¡Instala esta App en tu celular! Añádela a tu pantalla de inicio desde las opciones de tu navegador.
              </p>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-slate-450 hover:text-slate-200 text-[9px] font-extrabold px-2 py-1 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 rounded-lg transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 scroll-smooth">
          {children}
        </main>

        {/* Bottom Tab Navigation */}
        <nav className="glass sticky bottom-0 left-0 right-0 z-30 py-2 border-t border-slate-900/80 shadow-lg flex justify-around items-center px-2">
          {/* Mundial Tab */}
          <button
            onClick={() => setActiveTab('mundial')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'mundial'
                ? 'text-cyan-400 font-bold bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Globe size={18} className={`mb-1 ${activeTab === 'mundial' ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Mundial</span>
          </button>

          {/* Tablas Tab */}
          <button
            onClick={() => setActiveTab('tablas')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'tablas'
                ? 'text-cyan-400 font-bold bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Table2 size={18} className={`mb-1 ${activeTab === 'tablas' ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Tablas</span>
          </button>

          {/* Torneos Tab */}
          <button
            onClick={() => setActiveTab('torneos')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'torneos'
                ? 'text-cyan-400 font-bold bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Trophy size={18} className={`mb-1 ${activeTab === 'torneos' ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Mis Torneos</span>
          </button>

          {/* Perfil Tab */}
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'perfil'
                ? 'text-cyan-400 font-bold bg-slate-900/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User size={18} className={`mb-1 ${activeTab === 'perfil' ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Mi Perfil</span>
          </button>

          {/* Conditional Admin Tab */}
          {user.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'text-rose-400 font-bold bg-slate-900/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ShieldCheck size={18} className={`mb-1 ${activeTab === 'admin' ? 'scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight">Admin</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};
