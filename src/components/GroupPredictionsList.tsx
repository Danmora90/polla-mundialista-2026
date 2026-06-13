import React, { useEffect, useState } from 'react';
import type { Prediction, UserProfile } from '../types';
import { dbService } from '../services/db';
import { Users } from 'lucide-react';

interface GroupPredictionsListProps {
  tournamentId: string;
  matchId: string;
  participantIds: string[];
  allUsers: UserProfile[];
}

export const GroupPredictionsList: React.FC<GroupPredictionsListProps> = ({
  tournamentId,
  matchId,
  participantIds,
  allUsers,
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const preds = await dbService.getPredictionsForMatch(tournamentId, matchId);
        if (active) {
          setPredictions(preds);
        }
      } catch (err) {
        console.error('Error fetching group predictions:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPredictions();

    return () => {
      active = false;
    };
  }, [tournamentId, matchId]);

  if (loading) {
    return (
      <div className="py-3 px-4 flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-950/20 border-t border-slate-900">
        <span className="h-3.5 w-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
        <span>Cargando pronósticos del grupo...</span>
      </div>
    );
  }

  // Create a map of participant ID to their predictions
  const predMap: Record<string, Prediction> = {};
  predictions.forEach((p) => {
    predMap[p.userId] = p;
  });

  return (
    <div className="bg-slate-950/40 border-t border-slate-900 p-3 space-y-2 text-left">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
        <Users size={12} className="text-cyan-500" />
        <span>Pronósticos del Grupo</span>
      </div>
      
      {participantIds.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic pl-1">No hay participantes en este grupo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {participantIds.map((uid) => {
            const profile = allUsers.find((u) => u.uid === uid);
            const username = profile ? profile.username : 'Cargando...';
            const pred = predMap[uid];

            return (
              <div
                key={uid}
                className="flex justify-between items-center bg-slate-950/50 rounded-lg py-2 px-3 border border-slate-900/60"
              >
                <span className="text-xs text-slate-400 font-medium">@{username}</span>
                {pred ? (
                  <span className="text-xs font-black text-slate-200 bg-slate-900/40 px-2 py-0.5 rounded border border-slate-800">
                    {pred.homeScore} - {pred.awayScore}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600 italic">Sin pronóstico</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
