import React, { useState } from 'react';
import { GROUPS, MATCHES, resolveKnockoutMatches } from '../data/tournamentData';
import type { UserProfile, Tournament, Prediction, MatchResult } from '../types';
import { MatchRow } from './MatchRow';
import { calculateMatchPoints } from '../utils/scoring';

interface MundialTabProps {
  user: UserProfile;
  tournaments: Tournament[];
  predictions: Record<string, Prediction[]>; // tournamentId -> predictions
  matchResults: Record<string, MatchResult>;
  activeTournamentId: string | null;
  setActiveTournamentId: (id: string | null) => void;
  onSavePrediction: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
  allUsers: UserProfile[];
}

export const MundialTab: React.FC<MundialTabProps> = ({
  user,
  tournaments,
  predictions,
  matchResults,
  activeTournamentId,
  setActiveTournamentId,
  onSavePrediction,
  allUsers,
}) => {
  const [subTab, setSubTab] = useState<'grupos' | 'enfrentamientos'>('grupos');
  const [groupFilter, setGroupFilter] = useState<string>('TODOS');
  
  const activePredictions = activeTournamentId ? predictions[activeTournamentId] || [] : [];
  const activeTournament = tournaments.find(t => t.id === activeTournamentId);

  // Group filter list
  const filterOptions = ['TODOS', ...Object.keys(GROUPS), '16vos', '8vos', '4tos', 'semifinal', 'final'];

  // Resolve knockout matches dynamically
  const resolvedMatches = resolveKnockoutMatches(MATCHES, matchResults);

  // Filter matches
  const filteredMatches = resolvedMatches.filter(match => {
    if (groupFilter === 'TODOS') return true;
    return match.group === groupFilter;
  });

  const getPointsForMatch = (matchId: string): { pts: number; rule: string } => {
    if (!activeTournamentId || !activeTournament) return { pts: 0, rule: '' };
    const realResult = matchResults[matchId];
    if (!realResult || realResult.status !== 'finished') return { pts: 0, rule: '' };

    const userPred = activePredictions.find(p => p.matchId === matchId && p.userId === user.uid);
    if (!userPred) return { pts: 0, rule: 'Sin Pronóstico' };

    return calculateMatchPoints(userPred, realResult);
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs Toggle */}
      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setSubTab('grupos')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            subTab === 'grupos'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Grupos Oficiales
        </button>
        <button
          onClick={() => setSubTab('enfrentamientos')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            subTab === 'enfrentamientos'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Enfrentamientos
        </button>
      </div>

      {subTab === 'grupos' ? (
        /* ================= GROUPS VIEW ================= */
        <div className="space-y-4">
          <div className="text-left py-2 border-b border-slate-900">
            <h2 className="text-lg font-bold text-white leading-none">Grupos de la Fase Inicial</h2>
            <p className="text-xs text-slate-400 mt-1">48 selecciones clasificadas en 12 grupos de 4 equipos.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.keys(GROUPS).map((groupKey) => (
              <div key={groupKey} className="glass-card rounded-xl p-4 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-extrabold text-sm text-cyan-400 uppercase tracking-wider">
                    Grupo {groupKey}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    Fase de Grupos
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-left">
                  {GROUPS[groupKey].map((team) => {
                    const flags: Record<string, string> = {
                      'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'Corea': '🇰🇷', 'Chequia': '🇨🇿',
                      'Canadá': '🇨🇦', 'Bosnia': '🇧🇦', 'Qatar': '🇶🇦', 'Suiza': '🇨🇭',
                      'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
                      'EE.UU.': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
                      'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'C. de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
                      'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Suecia': '🇸🇪', 'Túnez': '🇹🇳',
                      'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'Irán': '🇮🇷', 'N. Zelanda': '🇳🇿',
                      'España': '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arabia S.': '🇸🇦', 'Uruguay': '🇺🇾',
                      'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noruega': '🇳🇴',
                      'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇨🇴',
                      'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbekistán': '🇺🇿', 'Colombia': '🇨🇴',
                      'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦'
                    };
                    const emoji = flags[team] || '🏳️';
                    return (
                      <div key={team} className="flex items-center gap-2 py-1.5 px-2 bg-slate-900/40 rounded border border-slate-800/40">
                        <span className="text-base">{emoji}</span>
                        <span className="font-medium text-xs text-slate-200 truncate">{team}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= FIXTURES VIEW ================= */
        <div className="space-y-4 text-left">
          {/* Active Tournament Selection */}
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Polla Activa (Torneo)
            </label>
            {tournaments.length === 0 ? (
              <p className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                ⚠️ No estás participando en ninguna polla. Ve a la pestaña "Mis Torneos" para crear o unirte a una.
              </p>
            ) : (
              <select
                value={activeTournamentId || ''}
                onChange={(e) => setActiveTournamentId(e.target.value || null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Selecciona una Polla --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Group Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setGroupFilter(opt)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border transition-all cursor-pointer ${
                  groupFilter === opt
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/45'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {opt === 'TODOS' ? 'TODOS' : ['16vos', '8vos', '4tos', 'semifinal', 'final'].includes(opt) ? opt.toUpperCase() : `GRP ${opt}`}
              </button>
            ))}
          </div>

          {/* Match Fixture Cards */}
          <div className="space-y-3">
            {filteredMatches.map(match => {
              const realResult = matchResults[match.id];
              const userPred = activePredictions.find(p => p.matchId === match.id && p.userId === user.uid);
              const scoreResult = realResult?.status === 'finished' ? getPointsForMatch(match.id) : null;

              return (
                <MatchRow
                  key={match.id}
                  match={match}
                  activeTournamentId={activeTournamentId}
                  activeTournament={activeTournament}
                  userPred={userPred}
                  realResult={realResult}
                  onSavePrediction={onSavePrediction}
                  scoreResult={scoreResult}
                  allUsers={allUsers}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
