import React, { useState } from 'react';
import type { UserProfile, Tournament, Prediction, MatchResult } from '../types';
import { calculateScores } from '../utils/scoring';
import { Trophy, Plus, UserPlus, ArrowLeft, Shield, X } from 'lucide-react';

interface TorneosTabProps {
  user: UserProfile;
  tournaments: Tournament[];
  predictions: Record<string, Prediction[]>;
  matchResults: Record<string, MatchResult>;
  allUsers: UserProfile[];
  onCreateTournament: (name: string) => Promise<string>;
  onSendInvitation: (tournamentId: string, username: string) => Promise<void>;
}

export const TorneosTab: React.FC<TorneosTabProps> = ({
  user,
  tournaments,
  predictions,
  matchResults,
  allUsers,
  onCreateTournament,
  onSendInvitation,
}) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [invitingStatus, setInvitingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [submittingTourney, setSubmittingTourney] = useState(false);
  const [tourneyError, setTourneyError] = useState<string | null>(null);

  const [tourneySubTab, setTourneySubTab] = useState<'posiciones' | 'invitar'>('posiciones');

  // Selected Tournament
  const activeTourney = tournaments.find(t => t.id === selectedTournamentId);

  // User Profile Mapping
  const getUserMap = () => {
    const map: Record<string, UserProfile> = {};
    allUsers.forEach(u => {
      map[u.uid] = u;
    });
    return map;
  };
  const userMap = getUserMap();

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourneyError(null);
    if (newTournamentName.trim().length < 3) {
      setTourneyError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    setSubmittingTourney(true);
    try {
      const id = await onCreateTournament(newTournamentName);
      setNewTournamentName('');
      setShowCreateForm(false);
      setSelectedTournamentId(id); // Open it immediately
    } catch (err: any) {
      setTourneyError(err.message || 'Error al crear la polla.');
    } finally {
      setSubmittingTourney(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournamentId || inviteUsername.trim().length < 3) return;
    
    setInvitingStatus('sending');
    setInviteError(null);
    try {
      await onSendInvitation(selectedTournamentId, inviteUsername);
      setInvitingStatus('success');
      setInviteUsername('');
      setTimeout(() => setInvitingStatus('idle'), 3000);
    } catch (err: any) {
      setInvitingStatus('error');
      setInviteError(err.message || 'Error al enviar la invitación.');
    }
  };

  // Render Leaderboard list
  const renderLeaderboard = (tournament: Tournament) => {
    const tourneyPredictions = predictions[tournament.id] || [];
    // Calculate scores
    const scores = calculateScores(tourneyPredictions, matchResults, tournament.participants);
    
    // Sort participants by points desc, then by username
    const participantsList = tournament.participants.map(uid => {
      const pProfile = userMap[uid] || { uid, username: 'Cargando...', email: '', isAdmin: false };
      const pts = scores[uid] || 0;
      
      // Count total predictions made by this user
      const totalPreds = tourneyPredictions.filter(p => p.userId === uid).length;

      return {
        uid,
        username: pProfile.username,
        points: pts,
        totalPreds
      };
    }).sort((a, b) => b.points - a.points || a.username.localeCompare(b.username));

    return (
      <div className="space-y-3">
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center text-[11px] text-slate-400">
          <span className="font-semibold">Jugadores: {participantsList.length}</span>
          <span className="font-semibold">Partidos finalizados: {Object.values(matchResults).filter(m => m.status === 'finished').length}</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-900 bg-slate-900/20">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-900 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3 text-center w-12">Pos</th>
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3 text-center w-16">Preds</th>
                <th className="py-2.5 px-3 text-center w-16">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {participantsList.map((player, idx) => {
                const isCurrentUser = player.uid === user.uid;
                const position = idx + 1;
                
                // Color badges for top 3 positions
                const medalColor = 
                  position === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  position === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-400/30' :
                  position === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-800/30' :
                  'bg-slate-900 text-slate-400';

                return (
                  <tr 
                    key={player.uid} 
                    className={`border-b border-slate-900/60 transition-colors ${
                      isCurrentUser ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-slate-900/30'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${medalColor}`}>
                        {position}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-1">
                        <span className={isCurrentUser ? 'text-cyan-400 font-bold' : ''}>
                          @{player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[8px] bg-cyan-900 text-cyan-300 px-1 py-0.2 rounded font-black uppercase">Tú</span>
                        )}
                        {player.uid === tournament.creatorId && (
                          <span title="Creador del Torneo">
                            <Shield size={10} className="text-amber-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400">{player.totalPreds}</td>
                    <td className="py-3 px-3 text-center font-black text-slate-100 text-sm">{player.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* ================= OPEN TOURNAMENT VIEW ================= */}
      {selectedTournamentId && activeTourney ? (
        <div className="space-y-4 text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <button
              onClick={() => setSelectedTournamentId(null)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-bold uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Volver</span>
            </button>
            <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400 font-medium font-mono uppercase">
              ID: {activeTourney.id}
            </span>
          </div>

          <div className="bg-slate-900/20 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5 bg-gradient-to-br from-slate-900/40 to-slate-950/40">
            <div className="inline-flex p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 mt-1">{activeTourney.name}</h2>
            <p className="text-[10px] text-slate-400">
              Creado por: <span className="font-semibold text-slate-300">@{(userMap[activeTourney.creatorId] || {username: '...'}).username}</span>
            </p>
          </div>

          {/* Tournament Sub Tabs */}
          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-slate-900">
            <button
              onClick={() => setTourneySubTab('posiciones')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                tourneySubTab === 'posiciones'
                  ? 'bg-slate-800 text-white font-extrabold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Tabla de Posiciones
            </button>
            <button
              onClick={() => setTourneySubTab('invitar')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                tourneySubTab === 'invitar'
                  ? 'bg-slate-800 text-white font-extrabold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Invitar Amigos
            </button>
          </div>

          {tourneySubTab === 'posiciones' ? (
            /* Positions Leaderboard */
            renderLeaderboard(activeTourney)
          ) : (
            /* Invite Friends View */
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Enviar Invitación</h3>
                <p className="text-[11px] text-slate-400">Ingresa el nombre de usuario exacto (@username) para invitarlo a esta polla.</p>
                
                {inviteError && (
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                    {inviteError}
                  </div>
                )}
                {invitingStatus === 'success' && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]">
                    ¡Invitación enviada con éxito!
                  </div>
                )}

                <form onSubmit={handleSendInvite} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 text-xs font-bold">
                      @
                    </span>
                    <input
                      type="text"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      placeholder="usuario"
                      className="w-full pl-6 pr-3 py-1.5 bg-slate-950 border border-slate-900 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={invitingStatus === 'sending'}
                    className="px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <UserPlus size={12} />
                    <span>Invitar</span>
                  </button>
                </form>
              </div>

              {/* Sent Invitations Status List */}
              <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Historial de Invitaciones</h3>
                {activeTourney.invitations.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No has enviado invitaciones aún.</p>
                ) : (
                  <div className="divide-y divide-slate-900/60 max-h-[220px] overflow-y-auto pr-1">
                    {activeTourney.invitations.map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-xs">
                        <span className="font-semibold text-slate-300">@{inv.toUsername}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {inv.status === 'pending' ? 'Pendiente' : inv.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= TOURNAMENTS LIST VIEW ================= */
        <div className="space-y-4 text-left">
          {/* Header row */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Mis Pollas</h2>
              <p className="text-xs text-slate-400 mt-1">Los torneos en los que participas.</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold rounded-lg text-xs shadow flex items-center gap-1 hover:from-cyan-400 hover:to-emerald-400 cursor-pointer active:scale-95 transition-all"
            >
              {showCreateForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showCreateForm ? 'Cancelar' : 'Crear'}</span>
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-3 animate-fadeIn">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Crear Nueva Polla</h3>
              {tourneyError && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                  {tourneyError}
                </div>
              )}
              <form onSubmit={handleCreateTournament} className="flex gap-2">
                <input
                  type="text"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  placeholder="Nombre de la Polla (ej. Amigos de Oficina)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingTourney}
                  className="px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                >
                  {submittingTourney ? (
                    <span className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Crear'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tournaments Grid */}
          {tournaments.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-900/10 rounded-xl border border-slate-900">
              <Trophy size={32} className="text-slate-600 mx-auto mb-2.5" />
              <p className="text-xs font-medium text-slate-400 mb-1">Aún no estás en ningún torneo.</p>
              <p className="text-[10px] text-slate-500">Crea una nueva polla o espera que te inviten.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {tournaments.map(t => {
                const totalParticipants = t.participants.length;
                const isCreator = t.creatorId === user.uid;
                
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTournamentId(t.id)}
                    className="glass-card rounded-xl p-4 border border-slate-900 hover:border-slate-800 transition-all cursor-pointer group hover:bg-slate-900/20 active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-extrabold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Creado por: @{(userMap[t.creatorId] || {username: '...'}).username}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-850">
                          {totalParticipants} {totalParticipants === 1 ? 'jugador' : 'jugadores'}
                        </span>
                        {isCreator && (
                          <span className="text-[8px] bg-amber-500/15 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            Creador
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
