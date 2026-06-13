import { calculateScores, calculateMatchPoints } from './scoring';
import type { Prediction, MatchResult } from '../types';

export const runScoringTests = () => {
  console.log('--- RUNNING SCORING ENGINE TESTS (4-3-3-0) ---');

  const participants = ['user1', 'user2', 'user3', 'user4'];
  
  // Test Match 1: Real score is 2-1 (Home Win)
  const match1Result: MatchResult = {
    matchId: 'match_1',
    homeScore: 2,
    awayScore: 1,
    status: 'finished'
  };

  // Test Match 2: Real score is 1-1 (Tie)
  const match2Result: MatchResult = {
    matchId: 'match_2',
    homeScore: 1,
    awayScore: 1,
    status: 'finished'
  };

  // Scenario 1: Exact Match (Condition 1) -> 4 points
  const p1_exact: Prediction = { id: '1', userId: 'user1', matchId: 'match_1', homeScore: 2, awayScore: 1, tournamentId: 't1' };
  const res1 = calculateMatchPoints(p1_exact, match1Result);
  console.assert(res1.pts === 4, `Condition 1 Fail: Should have 4 points, got ${res1.pts}`);
  console.log('Condition 1 (Exact Match) passed!');

  // Scenario 2: Correct Tie, Wrong Score (Condition 2) -> 3 points
  const p2_tie: Prediction = { id: '2', userId: 'user2', matchId: 'match_2', homeScore: 2, awayScore: 2, tournamentId: 't1' };
  const res2 = calculateMatchPoints(p2_tie, match2Result);
  console.assert(res2.pts === 3, `Condition 2 Fail: Should have 3 points, got ${res2.pts}`);
  console.log('Condition 2 (Correct Tie / Wrong Score) passed!');

  // Scenario 3: Correct Winner, Wrong Score (Condition 3) -> 3 points
  const p3_winner: Prediction = { id: '3', userId: 'user3', matchId: 'match_1', homeScore: 3, awayScore: 0, tournamentId: 't1' };
  const res3 = calculateMatchPoints(p3_winner, match1Result);
  console.assert(res3.pts === 3, `Condition 3 Fail: Should have 3 points, got ${res3.pts}`);
  console.log('Condition 3 (Correct Winner / Wrong Score) passed!');

  // Scenario 4: Missed prediction (Condition 4) -> 0 points
  const p4_missed: Prediction = { id: '4', userId: 'user4', matchId: 'match_1', homeScore: 0, awayScore: 2, tournamentId: 't1' };
  const res4 = calculateMatchPoints(p4_missed, match1Result);
  console.assert(res4.pts === 0, `Condition 4 Fail: Should have 0 points, got ${res4.pts}`);
  console.log('Condition 4 (Missed prediction) passed!');

  // Scenario 5: Combined calculations via calculateScores
  const preds: Prediction[] = [
    { id: '1', userId: 'user1', matchId: 'match_1', homeScore: 2, awayScore: 1, tournamentId: 't1' }, // 4 pts
    { id: '2', userId: 'user2', matchId: 'match_2', homeScore: 2, awayScore: 2, tournamentId: 't1' }, // 3 pts
    { id: '3', userId: 'user3', matchId: 'match_1', homeScore: 3, awayScore: 0, tournamentId: 't1' }, // 3 pts
    { id: '4', userId: 'user4', matchId: 'match_1', homeScore: 0, awayScore: 2, tournamentId: 't1' }, // 0 pts
  ];

  const results = calculateScores(preds, { match_1: match1Result, match_2: match2Result }, participants);
  console.assert(results['user1'] === 4, `Combined Fail: user1 should have 4 points, got ${results['user1']}`);
  console.assert(results['user2'] === 3, `Combined Fail: user2 should have 3 points, got ${results['user2']}`);
  console.assert(results['user3'] === 3, `Combined Fail: user3 should have 3 points, got ${results['user3']}`);
  console.assert(results['user4'] === 0, `Combined Fail: user4 should have 0 points, got ${results['user4']}`);
  console.log('calculateScores integration passed!');

  console.log('All scoring engine tests completed successfully!');
  return true;
};
