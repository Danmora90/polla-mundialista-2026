import { GROUPS, MATCHES, TEAM_FLAGS } from '../data/tournamentData';
import type { MatchResult } from '../types';

export interface TeamStanding {
  team: string;
  flag: string;
  pj: number;  // Partidos Jugados
  pg: number;  // Partidos Ganados
  pe: number;  // Partidos Empatados
  pp: number;  // Partidos Perdidos
  gf: number;  // Goles a Favor
  gc: number;  // Goles en Contra
  dg: number;  // Diferencia de Goles
  pts: number; // Puntos
}

export interface GroupStanding {
  groupName: string;
  standings: TeamStanding[];
}

export const calculateGroupTables = (
  matchResults: Record<string, MatchResult>
): GroupStanding[] => {
  const standingsMap: Record<string, Record<string, TeamStanding>> = {};

  // Inicializar todos los grupos y equipos con valores en cero
  Object.entries(GROUPS).forEach(([groupName, teams]) => {
    standingsMap[groupName] = {};
    teams.forEach((team) => {
      standingsMap[groupName][team] = {
        team,
        flag: TEAM_FLAGS[team] || '🏳️',
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        pts: 0,
      };
    });
  });

  // Procesar todos los partidos oficiales del mundial
  MATCHES.forEach((match) => {
    const result = matchResults[match.id];
    if (result && result.status === 'finished') {
      const groupName = match.group;
      const home = match.homeTeam;
      const away = match.awayTeam;

      // Only process group stage matches
      if (standingsMap[groupName]) {
        const homeStanding = standingsMap[groupName][home];
        const awayStanding = standingsMap[groupName][away];

        if (homeStanding && awayStanding) {
          const hScore = result.homeScore;
          const aScore = result.awayScore;

        // Partidos jugados
        homeStanding.pj += 1;
        awayStanding.pj += 1;

        // Goles a favor y en contra
        homeStanding.gf += hScore;
        homeStanding.gc += aScore;
        awayStanding.gf += aScore;
        awayStanding.gc += hScore;

        // Puntos y asignación de PG/PE/PP
        if (hScore > aScore) {
          homeStanding.pg += 1;
          homeStanding.pts += 3;
          awayStanding.pp += 1;
        } else if (hScore < aScore) {
          awayStanding.pg += 1;
          awayStanding.pts += 3;
          homeStanding.pp += 1;
        } else {
          homeStanding.pe += 1;
          homeStanding.pts += 1;
          awayStanding.pe += 1;
          awayStanding.pts += 1;
        }

        // Diferencia de goles
        homeStanding.dg = homeStanding.gf - homeStanding.gc;
        awayStanding.dg = awayStanding.gf - awayStanding.gc;
        }
      }
    }
  });

  // Convertir el mapa a un arreglo ordenado por grupo
  return Object.entries(standingsMap).map(([groupName, teamsMap]) => {
    const standings = Object.values(teamsMap).sort((a, b) => {
      // 1. Puntos
      if (b.pts !== a.pts) return b.pts - a.pts;
      // 2. Diferencia de goles
      if (b.dg !== a.dg) return b.dg - a.dg;
      // 3. Goles a favor
      if (b.gf !== a.gf) return b.gf - a.gf;
      // 4. Criterio de desempate alfabético
      return a.team.localeCompare(b.team);
    });

    return {
      groupName,
      standings,
    };
  });
};
