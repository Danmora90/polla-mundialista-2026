import React, { useState } from 'react';
import type { UserProfile, Tournament, Prediction, MatchResult } from '../types';
import { calculateScores } from '../utils/scoring';
import { runScoringTests } from '../utils/scoring.test';
import { LogOut, Mail, Activity, BarChart2, PlayCircle } from 'lucide-react';

interface PerfilTabProps {
  user: UserProfile;
  tournaments: Tournament[];
  predictions: Record<string, Prediction[]>;
  matchResults: Record<string, MatchResult>;
  onLogout: () => Promise<void>;
}

export const PerfilTab: React.FC<PerfilTabProps> = ({
  user,
  tournaments,
  predictions,
  matchResults,
  onLogout,
}) => {
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  // Calculate global stats
  const totalTournaments = tournaments.length;
  
  // Count total predictions made by the user across all tournaments
  let totalPredictions = 0;
  Object.values(predictions).forEach(list => {
    totalPredictions += list.filter(p => p.userId === user.uid).length;
  });

  // Calculate sum of points across all tournaments
  let totalPoints = 0;
  tournaments.forEach(t => {
    const tourneyPreds = predictions[t.id] || [];
    const scores = calculateScores(tourneyPreds, matchResults, t.participants);
    totalPoints += scores[user.uid] || 0;
  });

  const runEngineTests = () => {
    setRunningTests(true);
    try {
      const ok = runScoringTests();
      setTestSuccess(ok);
    } catch (err) {
      setTestSuccess(false);
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="space-y-5 text-left">
      <div className="border-b border-slate-900 pb-2.5">
        <h2 className="text-lg font-bold text-white leading-none">Mi Perfil</h2>
        <p className="text-xs text-slate-400 mt-1">Configuración y estadísticas personales.</p>
      </div>

      {/* User Information Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col gap-4 relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-950/60">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-200">@{user.username}</span>
              {user.isAdmin && (
                <span className="text-[9px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.2 rounded uppercase border border-rose-500/30">
                  Admin
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 inline-flex items-center gap-1 mt-0.5">
              <Mail size={12} />
              {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart2 size={14} className="text-cyan-400" />
          <span>Estadísticas Generales</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 text-center">
            <span className="block text-xl font-black text-slate-100">{totalPoints}</span>
            <span className="text-[9px] text-slate-500 uppercase font-semibold mt-1 block">Pts Totales</span>
          </div>
          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 text-center">
            <span className="block text-xl font-black text-slate-100">{totalTournaments}</span>
            <span className="text-[9px] text-slate-500 uppercase font-semibold mt-1 block">Mis Pollas</span>
          </div>
          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 text-center">
            <span className="block text-xl font-black text-slate-100">{totalPredictions}</span>
            <span className="text-[9px] text-slate-500 uppercase font-semibold mt-1 block">Preds</span>
          </div>
        </div>
      </div>



      {/* Scoring Engine Diagnostic Utility */}
      <div className="glass-card rounded-xl p-4 border border-slate-900 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" />
            Diagnóstico del Engine de Puntuación
          </span>
          {testSuccess === true && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">
              Verificado OK
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          Ejecuta un set de pruebas locales que simulan las Condiciones del cálculo de puntajes determinista (4-3-3-0) para garantizar consistencia.
        </p>
        
        <button
          onClick={runEngineTests}
          disabled={runningTests}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          <PlayCircle size={14} className="text-cyan-400" />
          <span>{runningTests ? 'Corriendo...' : 'Ejecutar Pruebas'}</span>
        </button>

        {testSuccess === true && (
          <div className="text-[10px] text-emerald-400 font-medium bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
            ✓ Condición 1 (Marcador Exacto: 4 pts) - OK<br />
            ✓ Condición 2 (Empate Acertado: 3 pts) - OK<br />
            ✓ Condición 3 (Ganador Acertado: 3 pts) - OK<br />
            ✓ Condición 4 (No Acierto: 0 pts) - OK
          </div>
        )}
        {testSuccess === false && (
          <div className="text-[10px] text-rose-400 font-medium bg-rose-500/5 p-2 rounded border border-rose-500/10">
            ✗ Hubo un fallo en las pruebas del motor de puntuación. Revisa la consola de desarrollador.
          </div>
        )}
      </div>

      {/* PWA Settings */}
      <div className="glass-card rounded-xl p-4 border border-slate-900 space-y-3">
        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          📲 Configuración de PWA / Instalación
        </span>
        <p className="text-[10px] text-slate-400 leading-normal">
          Si ocultaste el banner de instalación y deseas que vuelva a mostrarse, puedes restaurarlo presionando el siguiente botón.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('pwa_install_banner_dismissed');
            alert('El banner de instalación ha sido restaurado. Recargando la página...');
            window.location.reload();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
        >
          <span>Restaurar Banner de Instalación</span>
        </button>
      </div>

      {/* Auth Actions */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
