import React, { useState, useEffect } from 'react';
import type { Match, UserProfile, Prediction, MatchResult, Tournament } from '../types';
import { Save, AlertCircle, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { GroupPredictionsList } from './GroupPredictionsList';

interface MatchRowProps {
  match: Match;
  activeTournamentId: string | null;
  activeTournament: Tournament | undefined;
  userPred: Prediction | undefined;
  realResult: MatchResult | undefined;
  onSavePrediction: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
  scoreResult: { pts: number; rule: string } | null;
  allUsers: UserProfile[];
}

export const MatchRow: React.FC<MatchRowProps> = ({
  match,
  activeTournamentId,
  activeTournament,
  userPred,
  realResult,
  onSavePrediction,
  scoreResult,
  allUsers,
}) => {
  const isFinished = realResult?.status === 'finished';
  const isLocked = realResult?.isLocked === true;

  // Local state for scores
  const [homeInput, setHomeInput] = useState<string>('');
  const [awayInput, setAwayInput] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPredictions, setShowPredictions] = useState<boolean>(false);

  // Sync inputs with userPred if prediction loads later
  useEffect(() => {
    if (userPred) {
      setHomeInput(userPred.homeScore.toString());
      setAwayInput(userPred.awayScore.toString());
    } else {
      setHomeInput('');
      setAwayInput('');
    }
  }, [userPred]);

  const handleInputChange = (side: 'home' | 'away', val: string) => {
    if (val !== '' && !/^\d+$/.test(val)) return; // numbers only
    if (side === 'home') setHomeInput(val);
    else setAwayInput(val);

    if (savingStatus === 'saved') {
      setSavingStatus('idle');
    }
  };

  const handleSave = async () => {
    if (!activeTournamentId) return;
    
    const hScore = parseInt(homeInput);
    const aScore = parseInt(awayInput);

    if (isNaN(hScore) || isNaN(aScore) || hScore < 0 || aScore < 0) {
      setSavingStatus('error');
      return;
    }

    setSavingStatus('saving');
    try {
      await onSavePrediction(match.id, hScore, aScore);
      setSavingStatus('saved');
    } catch (err) {
      setSavingStatus('error');
    }
  };

  return (
    <div className="glass-card rounded-xl border border-slate-800/80 flex flex-col gap-3 relative overflow-hidden transition-colors hover:border-slate-850">
      {/* Card Header */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 p-4 pb-0">
        <span className="font-extrabold uppercase text-cyan-500 tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/30">
          Grupo {match.group}
        </span>
        <div className="flex items-center gap-1.5">
          {isLocked && !isFinished && (
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[8px] flex items-center gap-1">
              <Lock size={8} />
              Bloqueado
            </span>
          )}
          <span>{match.date}</span>
        </div>
      </div>

      {/* Teams and Score Grid */}
      <div className="flex items-center justify-between py-1 px-4">
        {/* Home Team */}
        <div className="flex items-center gap-2.5 w-5/12">
          <span className="text-2xl">{match.homeFlag}</span>
          <span className="font-semibold text-xs text-slate-200 truncate">{match.homeTeam}</span>
        </div>

        {/* Inputs or Scores */}
        <div className="flex items-center gap-2 justify-center w-2/12">
          {isFinished ? (
            /* Finished - Show Real Score */
            <div className="flex items-center gap-1 font-extrabold text-sm text-slate-100 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span>{realResult.homeScore}</span>
              <span className="text-slate-600 font-normal">:</span>
              <span>{realResult.awayScore}</span>
            </div>
          ) : isLocked ? (
            /* Locked Match - Inputs Disabled (Flat Score display style) */
            <div className="flex items-center gap-1 font-bold text-xs text-slate-400 bg-slate-950/45 px-2.5 py-1 rounded border border-slate-900">
              <span>{homeInput !== '' ? homeInput : '-'}</span>
              <span className="text-slate-700">:</span>
              <span>{awayInput !== '' ? awayInput : '-'}</span>
            </div>
          ) : (
            /* Scheduled and Unlocked - Editable Inputs */
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={homeInput}
                onChange={(e) => handleInputChange('home', e.target.value)}
                disabled={!activeTournamentId}
                placeholder="-"
                className="w-8 h-8 bg-slate-900 border border-slate-800 rounded text-center text-xs font-bold text-white focus:outline-none focus:border-cyan-500 disabled:opacity-40"
              />
              <span className="text-slate-600 text-[10px]">:</span>
              <input
                type="text"
                value={awayInput}
                onChange={(e) => handleInputChange('away', e.target.value)}
                disabled={!activeTournamentId}
                placeholder="-"
                className="w-8 h-8 bg-slate-900 border border-slate-800 rounded text-center text-xs font-bold text-white focus:outline-none focus:border-cyan-500 disabled:opacity-40"
              />
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end gap-2.5 w-5/12 text-right">
          <span className="font-semibold text-xs text-slate-200 truncate">{match.awayTeam}</span>
          <span className="text-2xl">{match.awayFlag}</span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-slate-900/60 pt-2 flex items-center justify-between text-xs p-4 pt-0">
        {/* Left: User prediction status or indicator */}
        <div>
          {isFinished ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Tu pronóstico:</span>
              <span className="text-slate-300 font-semibold text-xs">
                {userPred ? `${userPred.homeScore} - ${userPred.awayScore}` : 'Sin pronóstico'}
              </span>
            </div>
          ) : isLocked ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Tu pronóstico final:</span>
              <span className="text-slate-300 font-bold text-xs">
                {userPred ? `${userPred.homeScore} - ${userPred.awayScore}` : 'Sin pronóstico'}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic">
              {userPred ? 'Pronóstico guardado' : 'Sin pronóstico'}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {activeTournamentId && (
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className="px-2 py-1.5 rounded-lg border border-slate-800/80 text-slate-400 hover:text-slate-200 font-bold text-[9px] uppercase cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>Pronósticos</span>
              {showPredictions ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}

          {isFinished ? (
            scoreResult && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-medium border border-slate-800">
                  {scoreResult.rule.split(' (')[0]}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                  scoreResult.pts === 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  scoreResult.pts === 3 ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' :
                  scoreResult.pts === 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                  'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  +{scoreResult.pts} {scoreResult.pts === 1 ? 'punto' : 'puntos'}
                </span>
              </div>
            )
          ) : isLocked ? (
            /* locked badge */
            <span className="px-2.5 py-1 text-[9px] uppercase font-bold text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20">
              Predicciones Bloqueadas
            </span>
          ) : (
            /* Save prediction */
            <button
              onClick={handleSave}
              disabled={!activeTournamentId || savingStatus === 'saving'}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all ${
                !activeTournamentId ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed' :
                savingStatus === 'saving' ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' :
                savingStatus === 'saved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                savingStatus === 'error' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
                'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md active:scale-95'
              }`}
            >
              {savingStatus === 'saving' && <span className="h-3 w-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>}
              {savingStatus === 'saved' && <CheckCircle size={12} />}
              {savingStatus === 'error' && <AlertCircle size={12} />}
              {savingStatus === 'idle' && <Save size={12} />}
              {savingStatus === 'saving' ? 'Guardando...' : savingStatus === 'saved' ? '¡Guardado!' : savingStatus === 'error' ? 'Error' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded group predictions list */}
      {showPredictions && activeTournamentId && activeTournament && (
        <GroupPredictionsList
          tournamentId={activeTournamentId}
          matchId={match.id}
          participantIds={activeTournament.participants}
          allUsers={allUsers}
        />
      )}
    </div>
  );
};
