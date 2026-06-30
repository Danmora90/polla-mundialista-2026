import type { Match } from '../types';

export const TEAM_FLAGS: Record<string, string> = {
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'Corea': '🇰🇷', 'Chequia': '🇨🇿',
  'Canadá': '🇨🇦', 'Bosnia': '🇧🇦', 'Qatar': '🇶🇦', 'Suiza': '🇨🇭',
  'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'EE.UU.': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
  'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'C. de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
  'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Suecia': '🇸🇪', 'Túnez': '🇹🇳',
  'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'Irán': '🇮🇷', 'N. Zelanda': '🇳🇿',
  'España': '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arabia S.': '🇸🇦', 'Uruguay': '🇺🇾',
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noruega': '🇳🇴',
  'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇯🇴',
  'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbekistán': '🇺🇿', 'Colombia': '🇨🇴',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦',
  'Irlanda': '🇮🇪'
};

export const GROUPS: Record<string, string[]> = {
  'A': ['México', 'Sudáfrica', 'Corea', 'Chequia'],
  'B': ['Canadá', 'Bosnia', 'Qatar', 'Suiza'],
  'C': ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  'D': ['EE.UU.', 'Paraguay', 'Australia', 'Turquía'],
  'E': ['Alemania', 'Curazao', 'C. de Marfil', 'Ecuador'],
  'F': ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  'G': ['Bélgica', 'Egipto', 'Irán', 'N. Zelanda'],
  'H': ['España', 'Cabo Verde', 'Arabia S.', 'Uruguay'],
  'I': ['Francia', 'Senegal', 'Irak', 'Noruega'],
  'J': ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  'K': ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
  'L': ['Inglaterra', 'Croacia', 'Ghana', 'Panamá']
};

// Generar partidos de fase de grupos programáticamente
const generateMatches = (): Match[] => {
  const matches: Match[] = [];
  const groupKeys = Object.keys(GROUPS);

  // Mapeo de fechas para que parezca un calendario real
  const groupDates: Record<string, string[]> = {
    'A': ['11 de Junio, 2026 - 15:00', '11 de Junio, 2026 - 18:00', '17 de Junio, 2026 - 13:00', '17 de Junio, 2026 - 16:00', '22 de Junio, 2026 - 19:00', '22 de Junio, 2026 - 19:00'],
    'B': ['11 de Junio, 2026 - 16:00', '11 de Junio, 2026 - 20:00', '17 de Junio, 2026 - 14:00', '17 de Junio, 2026 - 18:00', '22 de Junio, 2026 - 16:00', '22 de Junio, 2026 - 16:00'],
    'C': ['12 de Junio, 2026 - 13:00', '12 de Junio, 2026 - 16:00', '18 de Junio, 2026 - 13:00', '18 de Junio, 2026 - 16:00', '23 de Junio, 2026 - 19:00', '23 de Junio, 2026 - 19:00'],
    'D': ['12 de Junio, 2026 - 14:00', '12 de Junio, 2026 - 18:00', '18 de Junio, 2026 - 14:00', '18 de Junio, 2026 - 18:00', '23 de Junio, 2026 - 16:00', '23 de Junio, 2026 - 16:00'],
    'E': ['13 de Junio, 2026 - 13:00', '13 de Junio, 2026 - 16:00', '19 de Junio, 2026 - 13:00', '19 de Junio, 2026 - 16:00', '24 de Junio, 2026 - 19:00', '24 de Junio, 2026 - 19:00'],
    'F': ['13 de Junio, 2026 - 14:00', '13 de Junio, 2026 - 18:00', '19 de Junio, 2026 - 14:00', '19 de Junio, 2026 - 18:00', '24 de Junio, 2026 - 16:00', '24 de Junio, 2026 - 16:00'],
    'G': ['14 de Junio, 2026 - 13:00', '14 de Junio, 2026 - 16:00', '20 de Junio, 2026 - 13:00', '20 de Junio, 2026 - 16:00', '25 de Junio, 2026 - 19:00', '25 de Junio, 2026 - 19:00'],
    'H': ['14 de Junio, 2026 - 14:00', '14 de Junio, 2026 - 18:00', '20 de Junio, 2026 - 14:00', '20 de Junio, 2026 - 18:00', '25 de Junio, 2026 - 16:00', '25 de Junio, 2026 - 16:00'],
    'I': ['15 de Junio, 2026 - 13:00', '15 de Junio, 2026 - 16:00', '21 de Junio, 2026 - 13:00', '21 de Junio, 2026 - 16:00', '26 de Junio, 2026 - 19:00', '26 de Junio, 2026 - 19:00'],
    'J': ['15 de Junio, 2026 - 14:00', '15 de Junio, 2026 - 18:00', '21 de Junio, 2026 - 14:00', '21 de Junio, 2026 - 18:00', '26 de Junio, 2026 - 16:00', '26 de Junio, 2026 - 16:00'],
    'K': ['16 de Junio, 2026 - 13:00', '16 de Junio, 2026 - 16:00', '22 de Junio, 2026 - 13:00', '22 de Junio, 2026 - 16:00', '27 de Junio, 2026 - 19:00', '27 de Junio, 2026 - 19:00'],
    'L': ['16 de Junio, 2026 - 14:00', '16 de Junio, 2026 - 18:00', '22 de Junio, 2026 - 14:00', '22 de Junio, 2026 - 18:00', '27 de Junio, 2026 - 16:00', '27 de Junio, 2026 - 16:00']
  };

  groupKeys.forEach((gKey) => {
    const teams = GROUPS[gKey];
    const dates = groupDates[gKey] || [];
    // Round Robin de 4 equipos
    // Partidos:
    // 0 vs 1, 2 vs 3 (Fecha 1)
    // 0 vs 2, 1 vs 3 (Fecha 2)
    // 0 vs 3, 1 vs 2 (Fecha 3)
    const fixtures = [
      [0, 1], [2, 3], // R1
      [0, 2], [1, 3], // R2
      [0, 3], [1, 2]  // R3
    ];

    fixtures.forEach(([hIdx, aIdx], index) => {
      const home = teams[hIdx];
      const away = teams[aIdx];
      matches.push({
        id: `match_${gKey}_${index + 1}`,
        group: gKey,
        homeTeam: home,
        awayTeam: away,
        homeFlag: TEAM_FLAGS[home] || '🏳️',
        awayFlag: TEAM_FLAGS[away] || '🏳️',
        date: dates[index] || 'Junio, 2026'
      });
    });
  });

  return matches;
};

export const KNOCKOUT_MATCHES: Match[] = [
  // 16vos
  { id: 'match_ko_73', group: '16vos', homeTeam: 'Sudáfrica', awayTeam: 'Canadá', homeFlag: '🇿🇦', awayFlag: '🇨🇦', date: '28 de Junio, 2026 - 13:00' },
  { id: 'match_ko_74', group: '16vos', homeTeam: 'Alemania', awayTeam: 'Paraguay', homeFlag: '🇩🇪', awayFlag: '🇵🇾', date: '29 de Junio, 2026 - 14:30' },
  { id: 'match_ko_75', group: '16vos', homeTeam: 'Países Bajos', awayTeam: 'Marruecos', homeFlag: '🇳🇱', awayFlag: '🇲🇦', date: '29 de Junio, 2026 - 19:00' },
  { id: 'match_ko_76', group: '16vos', homeTeam: 'Brasil', awayTeam: 'Japón', homeFlag: '🇧🇷', awayFlag: '🇯🇵', date: '29 de Junio, 2026 - 11:00' },
  { id: 'match_ko_77', group: '16vos', homeTeam: 'Francia', awayTeam: 'Suecia', homeFlag: '🇫🇷', awayFlag: '🇸🇪', date: '30 de Junio, 2026 - 15:00' },
  { id: 'match_ko_78', group: '16vos', homeTeam: 'Irlanda', awayTeam: 'Noruega', homeFlag: '🇮🇪', awayFlag: '🇳🇴', date: '30 de Junio, 2026 - 11:00' },
  { id: 'match_ko_79', group: '16vos', homeTeam: 'México', awayTeam: 'Ecuador', homeFlag: '🇲🇽', awayFlag: '🇪🇨', date: '30 de Junio, 2026 - 19:00' },
  { id: 'match_ko_80', group: '16vos', homeTeam: 'Inglaterra', awayTeam: 'RD Congo', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇨🇩', date: '01 de Julio, 2026 - 10:00' },
  { id: 'match_ko_81', group: '16vos', homeTeam: 'EE.UU.', awayTeam: 'Bosnia', homeFlag: '🇺🇸', awayFlag: '🇧🇦', date: '01 de Julio, 2026 - 18:00' },
  { id: 'match_ko_82', group: '16vos', homeTeam: 'Bélgica', awayTeam: 'Senegal', homeFlag: '🇧🇪', awayFlag: '🇸🇳', date: '01 de Julio, 2026 - 14:00' },
  { id: 'match_ko_83', group: '16vos', homeTeam: 'Portugal', awayTeam: 'Croacia', homeFlag: '🇵🇹', awayFlag: '🇭🇷', date: '02 de Julio, 2026 - 17:00' },
  { id: 'match_ko_84', group: '16vos', homeTeam: 'España', awayTeam: 'Austria', homeFlag: '🇪🇸', awayFlag: '🇦🇹', date: '02 de Julio, 2026 - 13:00' },
  { id: 'match_ko_85', group: '16vos', homeTeam: 'Suiza', awayTeam: 'Argelia', homeFlag: '🇨🇭', awayFlag: '🇩🇿', date: '02 de Julio, 2026 - 21:00' },
  { id: 'match_ko_86', group: '16vos', homeTeam: 'Argentina', awayTeam: 'Cabo Verde', homeFlag: '🇦🇷', awayFlag: '🇨🇻', date: '03 de Julio, 2026 - 16:00' },
  { id: 'match_ko_87', group: '16vos', homeTeam: 'Colombia', awayTeam: 'Ghana', homeFlag: '🇨🇴', awayFlag: '🇬🇭', date: '03 de Julio, 2026 - 19:30' },
  { id: 'match_ko_88', group: '16vos', homeTeam: 'Australia', awayTeam: 'Egipto', homeFlag: '🇦🇺', awayFlag: '🇪🇬', date: '03 de Julio, 2026 - 12:00' },

  // 8vos
  { id: 'match_ko_89', group: '8vos', homeTeam: 'W74', awayTeam: 'W77', homeFlag: '🏳️', awayFlag: '🏳️', date: '04 de Julio, 2026 - 15:00' },
  { id: 'match_ko_90', group: '8vos', homeTeam: 'W73', awayTeam: 'W75', homeFlag: '🏳️', awayFlag: '🏳️', date: '04 de Julio, 2026 - 11:00' },
  { id: 'match_ko_91', group: '8vos', homeTeam: 'W76', awayTeam: 'W78', homeFlag: '🏳️', awayFlag: '🏳️', date: '05 de Julio, 2026 - 14:00' },
  { id: 'match_ko_92', group: '8vos', homeTeam: 'W79', awayTeam: 'W80', homeFlag: '🏳️', awayFlag: '🏳️', date: '05 de Julio, 2026 - 18:00' },
  { id: 'match_ko_93', group: '8vos', homeTeam: 'W83', awayTeam: 'W84', homeFlag: '🏳️', awayFlag: '🏳️', date: '06 de Julio, 2026 - 13:00' },
  { id: 'match_ko_94', group: '8vos', homeTeam: 'W81', awayTeam: 'W82', homeFlag: '🏳️', awayFlag: '🏳️', date: '06 de Julio, 2026 - 18:00' },
  { id: 'match_ko_95', group: '8vos', homeTeam: 'W86', awayTeam: 'W88', homeFlag: '🏳️', awayFlag: '🏳️', date: '07 de Julio, 2026 - 10:00' },
  { id: 'match_ko_96', group: '8vos', homeTeam: 'W85', awayTeam: 'W87', homeFlag: '🏳️', awayFlag: '🏳️', date: '07 de Julio, 2026 - 14:00' },

  // 4tos
  { id: 'match_ko_97', group: '4tos', homeTeam: 'W89', awayTeam: 'W90', homeFlag: '🏳️', awayFlag: '🏳️', date: '09 de Julio, 2026 - 14:00' },
  { id: 'match_ko_98', group: '4tos', homeTeam: 'W93', awayTeam: 'W94', homeFlag: '🏳️', awayFlag: '🏳️', date: '10 de Julio, 2026 - 13:00' },
  { id: 'match_ko_99', group: '4tos', homeTeam: 'W91', awayTeam: 'W92', homeFlag: '🏳️', awayFlag: '🏳️', date: '11 de Julio, 2026 - 15:00' },
  { id: 'match_ko_100', group: '4tos', homeTeam: 'W95', awayTeam: 'W96', homeFlag: '🏳️', awayFlag: '🏳️', date: '11 de Julio, 2026 - 19:00' },

  // Semifinales
  { id: 'match_ko_101', group: 'semifinal', homeTeam: 'W97', awayTeam: 'W98', homeFlag: '🏳️', awayFlag: '🏳️', date: '14 de Julio, 2026 - 13:00' },
  { id: 'match_ko_102', group: 'semifinal', homeTeam: 'W99', awayTeam: 'W100', homeFlag: '🏳️', awayFlag: '🏳️', date: '15 de Julio, 2026 - 13:00' },

  // Finales
  { id: 'match_ko_103', group: 'final', homeTeam: 'L101', awayTeam: 'L102', homeFlag: '🏳️', awayFlag: '🏳️', date: '18 de Julio, 2026 - 15:00' }, // Tercer Lugar
  { id: 'match_ko_104', group: 'final', homeTeam: 'W101', awayTeam: 'W102', homeFlag: '🏳️', awayFlag: '🏳️', date: '19 de Julio, 2026 - 13:00' }  // Gran Final
];

export const MATCHES: Match[] = [...generateMatches(), ...KNOCKOUT_MATCHES];

// LocalStorage caching fallback
export const getCachedGroupsSchema = () => {
  const cacheKey = 'polla_groups_schema';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore parsing error and regenerate
    }
  }
  const data = { groups: GROUPS, matches: MATCHES };
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
};

import type { MatchResult } from '../types';

export const resolveKnockoutMatches = (
  matches: Match[],
  matchResults: Record<string, MatchResult>
): Match[] => {
  const resolved = matches.map(m => ({ ...m }));

  const findResolvedMatch = (id: string) => resolved.find(m => m.id === id);

  resolved.forEach(match => {
    // Check homeTeam
    if (match.homeTeam.startsWith('W') || match.homeTeam.startsWith('L')) {
      const isWinner = match.homeTeam.startsWith('W');
      const parentMatchNo = match.homeTeam.substring(1);
      const parentMatchId = `match_ko_${parentMatchNo}`;
      const parentMatch = findResolvedMatch(parentMatchId);
      const parentResult = matchResults[parentMatchId];

      if (parentMatch && parentResult && parentResult.status === 'finished') {
        const winner = getMatchWinner(parentMatch, parentResult);
        const loser = getMatchLoser(parentMatch, parentResult);
        match.homeTeam = isWinner ? winner : loser;
        match.homeFlag = TEAM_FLAGS[match.homeTeam] || '🏳️';
      } else {
        match.homeTeam = isWinner ? `Ganador M${parentMatchNo}` : `Perdedor M${parentMatchNo}`;
        match.homeFlag = '🏳️';
      }
    }

    // Check awayTeam
    if (match.awayTeam.startsWith('W') || match.awayTeam.startsWith('L')) {
      const isWinner = match.awayTeam.startsWith('W');
      const parentMatchNo = match.awayTeam.substring(1);
      const parentMatchId = `match_ko_${parentMatchNo}`;
      const parentMatch = findResolvedMatch(parentMatchId);
      const parentResult = matchResults[parentMatchId];

      if (parentMatch && parentResult && parentResult.status === 'finished') {
        const winner = getMatchWinner(parentMatch, parentResult);
        const loser = getMatchLoser(parentMatch, parentResult);
        match.awayTeam = isWinner ? winner : loser;
        match.awayFlag = TEAM_FLAGS[match.awayTeam] || '🏳️';
      } else {
        match.awayTeam = isWinner ? `Ganador M${parentMatchNo}` : `Perdedor M${parentMatchNo}`;
        match.awayFlag = '🏳️';
      }
    }
  });

  return resolved;
};

const getMatchWinner = (match: Match, result: MatchResult): string => {
  if (result.homeScore > result.awayScore) return match.homeTeam;
  if (result.awayScore > result.homeScore) return match.awayTeam;
  if (result.penaltyWinner === 'away') return match.awayTeam;
  return match.homeTeam;
};

const getMatchLoser = (match: Match, result: MatchResult): string => {
  if (result.homeScore > result.awayScore) return match.awayTeam;
  if (result.awayScore > result.homeScore) return match.homeTeam;
  if (result.penaltyWinner === 'away') return match.homeTeam;
  return match.awayTeam;
};
