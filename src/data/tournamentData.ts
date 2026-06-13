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
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦'
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

export const MATCHES: Match[] = generateMatches();

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
