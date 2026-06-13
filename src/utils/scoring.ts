import type { Prediction, MatchResult } from '../types';

/**
 * Calculates the points for a single prediction against the official match result.
 * 
 * Rules:
 * - Condition 1: EXACT MATCH -> 4 Points
 * - Condition 2: CORRECT TIE / WRONG SCORE -> 3 Points
 * - Condition 3: CORRECT WINNER / WRONG SCORE -> 3 Points
 * - Condition 4: MISSED PREDICTION -> 0 Points
 */
export const calculateMatchPoints = (
  pred: { homeScore: number; awayScore: number },
  real: { homeScore: number; awayScore: number }
): { pts: number; rule: string } => {
  // Condition 1: EXACT MATCH (Acierto del marcador)
  if (pred.homeScore === real.homeScore && pred.awayScore === real.awayScore) {
    return { pts: 4, rule: 'Marcador Exacto (+4)' };
  }

  // Condition 2: CORRECT TIE / WRONG SCORE (Acierto en empate)
  const isPredTie = pred.homeScore === pred.awayScore;
  const isRealTie = real.homeScore === real.awayScore;
  if (isPredTie && isRealTie) {
    return { pts: 3, rule: 'Empate (+3)' };
  }

  // Condition 3: CORRECT WINNER / WRONG SCORE (Acierto en ganador)
  const predDiff = pred.homeScore - pred.awayScore;
  const realDiff = real.homeScore - real.awayScore;
  // Math.sign returns -1 for negative, 1 for positive, 0 for zero
  // A correct winner means the signs of goal differences match (both home win or both away win)
  // Ties (where diff === 0) are handled by Condition 2 above.
  if (Math.sign(predDiff) === Math.sign(realDiff) && predDiff !== 0) {
    return { pts: 3, rule: 'Ganador (+3)' };
  }

  // Condition 4: MISSED PREDICTION (No acierto)
  return { pts: 0, rule: 'Sin Acierto (0)' };
};

/**
 * Calculates points for all participants in a tournament for a set of finished matches.
 * The score is calculated as the sum of points accumulated across all matches.
 */
export const calculateScores = (
  predictions: Prediction[],
  matchResults: Record<string, MatchResult>, // matchId -> MatchResult
  participants: string[] // List of user IDs
): Record<string, number> => {
  const pointsTable: Record<string, number> = {};
  participants.forEach(uid => {
    pointsTable[uid] = 0;
  });

  const finishedMatchIds = Object.keys(matchResults).filter(
    matchId => matchResults[matchId].status === 'finished'
  );

  finishedMatchIds.forEach(matchId => {
    const realResult = matchResults[matchId];

    // Filter predictions for this match from participants of this tournament
    const matchPredictions = predictions.filter(
      p => p.matchId === matchId && participants.includes(p.userId)
    );

    matchPredictions.forEach(pred => {
      const { pts } = calculateMatchPoints(pred, realResult);
      pointsTable[pred.userId] += pts;
    });
  });

  return pointsTable;
};
