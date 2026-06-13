import React, { useState } from 'react';
import { GROUPS, MATCHES } from '../data/tournamentData';
import type { UserProfile, MatchResult } from '../types';
import { ShieldCheck, Save, Edit, CheckCircle, RefreshCw, XCircle, Lock, Unlock } from 'lucide-react';
import { dbService } from '../services/db';

interface AdminTabProps {
  user: UserProfile;
  matchResults: Record<string, MatchResult>;
  onSaveMatchResult: (matchId: string, homeScore: number, awayScore: number, status: 'scheduled' | 'finished') => Promise<void>;
}

export const AdminTab: React.FC<AdminTabProps> = ({ user, matchResults, onSaveMatchResult }) => {
  const [groupFilter, setGroupFilter] = useState('TODOS');
  
  // State to track editing overrides for finished matches
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({});
  
  // Inputs state
  const [inputs, setInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  if (!user.isAdmin) {
    return (
      <div className="text-center py-10 px-4">
        <ShieldCheck size={32} className="text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-200 uppercase">Acceso Denegado</h2>
        <p className="text-xs text-slate-500 mt-1">Esta sección es exclusiva para administradores del sistema.</p>
      </div>
    );
  }

  const filterOptions = ['TODOS', ...Object.keys(GROUPS)];

  const filteredMatches = MATCHES.filter(match => {
    if (groupFilter === 'TODOS') return true;
    return match.group === groupFilter;
  });

  const handleInputChange = (matchId: string, side: 'home' | 'away', val: string) => {
    if (val !== '' && !/^\d+$/.test(val)) return; // Only positive numbers

    setInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { home: '', away: '' },
        [side]: val
      }
    }));

    if (savingStatus[matchId] === 'saved') {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'idle' }));
    }
  };

  const handleSaveResult = async (matchId: string, status: 'scheduled' | 'finished') => {
    const inputVal = inputs[matchId];
    const existing = matchResults[matchId];

    const hScoreStr = inputVal?.home !== undefined ? inputVal.home : (existing?.homeScore ?? '');
    const aScoreStr = inputVal?.away !== undefined ? inputVal.away : (existing?.awayScore ?? '');

    if (hScoreStr === '' || aScoreStr === '') {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
      return;
    }

    const homeScore = typeof hScoreStr === 'number' ? hScoreStr : parseInt(hScoreStr);
    const awayScore = typeof aScoreStr === 'number' ? aScoreStr : parseInt(aScoreStr);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
      return;
    }

    setSavingStatus(prev => ({ ...prev, [matchId]: 'saving' }));
    try {
      await onSaveMatchResult(matchId, homeScore, awayScore, status);
      setSavingStatus(prev => ({ ...prev, [matchId]: 'saved' }));
      
      // Close editing view if it was active
      setEditingMatches(prev => ({ ...prev, [matchId]: false }));
    } catch (err) {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
    }
  };

  const handleResetMatch = async (matchId: string) => {
    setSavingStatus(prev => ({ ...prev, [matchId]: 'saving' }));
    try {
      // Set to scheduled and empty scores
      await onSaveMatchResult(matchId, 0, 0, 'scheduled');
      setSavingStatus(prev => ({ ...prev, [matchId]: 'saved' }));
      setEditingMatches(prev => ({ ...prev, [matchId]: false }));
      
      // Clear inputs
      setInputs(prev => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
    } catch (err) {
      setSavingStatus(prev => ({ ...prev, [matchId]: 'error' }));
    }
  };

  const handleToggleLock = async (matchId: string, isLocked: boolean) => {
    try {
      await dbService.toggleMatchLock(matchId, isLocked);
    } catch (err) {
      console.error('Error toggling match lock:', err);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="border-b border-slate-900 pb-2.5">
        <h2 className="text-lg font-bold text-white leading-none">Panel de Administrador</h2>
        <p className="text-xs text-slate-400 mt-1">Cargar resultados oficiales de los partidos del mundial.</p>
      </div>

      {/* Group Filter Scrollbar */}
      <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {filterOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setGroupFilter(opt)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border transition-all cursor-pointer ${
              groupFilter === opt
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/45'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {opt === 'TODOS' ? 'TODOS' : `GRP ${opt}`}
          </button>
        ))}
      </div>

      {/* Match admin list */}
      <div className="space-y-3">
        {filteredMatches.map(match => {
          const result = matchResults[match.id];
          const isFinished = result?.status === 'finished';
          const isLocked = result?.isLocked === true;
          const isEditing = editingMatches[match.id] || !isFinished;

          const inputVal = inputs[match.id];
          const homeVal = inputVal?.home !== undefined ? inputVal.home : (result?.homeScore ?? '');
          const awayVal = inputVal?.away !== undefined ? inputVal.away : (result?.awayScore ?? '');

          const statusStr = savingStatus[match.id] || 'idle';

          return (
            <div key={match.id} className="glass-card rounded-xl p-4 border border-slate-800/80 flex flex-col gap-3 relative">
              {/* Header info */}
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-extrabold uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                  Grupo {match.group}
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Lock badge indicator */}
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 ${
                    isLocked
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isLocked ? <Lock size={8} /> : <Unlock size={8} />}
                    {isLocked ? 'Bloqueado' : 'Abierto'}
                  </span>

                  {/* Status indicator badge */}
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] ${
                    isFinished 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isFinished ? 'Finalizado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Match Score Row */}
              <div className="flex items-center justify-between py-1">
                {/* Home */}
                <div className="flex items-center gap-2 w-5/12">
                  <span className="text-xl">{match.homeFlag}</span>
                  <span className="font-semibold text-xs text-slate-200 truncate">{match.homeTeam}</span>
                </div>

                {/* Score Controls */}
                <div className="flex items-center justify-center w-2/12">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={homeVal}
                        onChange={(e) => handleInputChange(match.id, 'home', e.target.value)}
                        placeholder="0"
                        className="w-8 h-8 bg-slate-950 border border-slate-800 rounded text-center text-xs font-bold text-white focus:outline-none focus:border-rose-500"
                      />
                      <span className="text-slate-600">:</span>
                      <input
                        type="text"
                        value={awayVal}
                        onChange={(e) => handleInputChange(match.id, 'away', e.target.value)}
                        placeholder="0"
                        className="w-8 h-8 bg-slate-950 border border-slate-800 rounded text-center text-xs font-bold text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-black text-sm text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      <span>{result.homeScore}</span>
                      <span className="text-slate-600 font-normal">:</span>
                      <span>{result.awayScore}</span>
                    </div>
                  )}
                </div>

                {/* Away */}
                <div className="flex items-center justify-end gap-2 w-5/12 text-right">
                  <span className="font-semibold text-xs text-slate-200 truncate">{match.awayTeam}</span>
                  <span className="text-xl">{match.awayFlag}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-900/60 pt-2 flex items-center justify-between text-xs">
                <span className="text-[9px] text-slate-500">{match.date}</span>

                <div className="flex items-center gap-2">
                  {/* Lock/Unlock Switch Button */}
                  <button
                    onClick={() => handleToggleLock(match.id, !isLocked)}
                    className={`px-2 py-1.5 rounded-lg border font-bold text-[9px] uppercase cursor-pointer flex items-center gap-1 transition-colors ${
                      isLocked
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                    }`}
                    title={isLocked ? 'Desbloquear Pronósticos' : 'Bloquear Pronósticos'}
                  >
                    {isLocked ? <Unlock size={10} /> : <Lock size={10} />}
                    <span>{isLocked ? 'Abrir' : 'Bloquear'}</span>
                  </button>

                  {isFinished && !isEditing ? (
                    /* Edit mode switch for finished match */
                    <>
                      <button
                        onClick={() => handleResetMatch(match.id)}
                        disabled={statusStr === 'saving'}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-[9px] uppercase cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw size={10} />
                        <span>Restablecer</span>
                      </button>
                      <button
                        onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-rose-400 border border-rose-950/40 hover:border-rose-950 font-bold text-[9px] uppercase cursor-pointer flex items-center gap-1"
                      >
                        <Edit size={10} />
                        <span>Corregir</span>
                      </button>
                    </>
                  ) : (
                    /* Save Official Result Button */
                    <>
                      {isFinished && (
                        <button
                          onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: false }))}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 font-bold text-[9px] uppercase cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => handleSaveResult(match.id, 'finished')}
                        disabled={statusStr === 'saving'}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase flex items-center gap-1 cursor-pointer transition-all ${
                          statusStr === 'saving' ? 'bg-rose-600/30 text-rose-400 border border-rose-500/30' :
                          statusStr === 'saved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          statusStr === 'error' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
                          'bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95'
                        }`}
                      >
                        {statusStr === 'saving' && <span className="h-3 w-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></span>}
                        {statusStr === 'saved' && <CheckCircle size={10} />}
                        {statusStr === 'error' && <XCircle size={10} />}
                        {statusStr === 'idle' && <Save size={10} />}
                        {statusStr === 'saving' ? 'Guardando...' : statusStr === 'saved' ? '¡Guardado!' : statusStr === 'error' ? 'Error' : 'Finalizar'}
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
