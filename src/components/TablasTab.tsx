import React, { useState } from 'react';
import type { MatchResult, Match } from '../types';
import { calculateGroupTables } from '../utils/standings';
import { ChevronDown, ChevronUp, Info, HelpCircle, GitFork } from 'lucide-react';
import { resolveKnockoutMatches, MATCHES } from '../data/tournamentData';

interface TablasTabProps {
  matchResults: Record<string, MatchResult>;
}

type GroupRange = 'A-D' | 'E-H' | 'I-L';

const BracketMatchCard: React.FC<{ match: Match; result?: MatchResult }> = ({ match, result }) => {
  const isFinished = result?.status === 'finished';
  const homeScore = result?.homeScore;
  const awayScore = result?.awayScore;
  const isTie = isFinished && homeScore === awayScore;

  // Determine if a team won (either regular score or penalties)
  const isHomeWinner = isFinished && (
    homeScore! > awayScore! || (isTie && result?.penaltyWinner === 'home')
  );
  const isAwayWinner = isFinished && (
    awayScore! > homeScore! || (isTie && result?.penaltyWinner === 'away')
  );

  return (
    <div className="w-[160px] bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 text-[10px] space-y-1.5 shadow-lg select-none hover:border-slate-700/80 transition-colors">
      {/* Match info */}
      <div className="flex justify-between items-center text-[8px] text-slate-500 font-extrabold uppercase">
        <span>{match.id.replace('match_ko_', 'M')}</span>
        <span>{match.group.toUpperCase()}</span>
      </div>

      {/* Teams */}
      <div className="space-y-1">
        {/* Home Team */}
        <div className="flex justify-between items-center gap-1.5 py-0.5">
          <div className="flex items-center gap-1 w-9/12 truncate">
            <span className="text-sm leading-none">{match.homeFlag}</span>
            <span className={`font-semibold truncate ${
              isFinished ? (isHomeWinner ? 'text-emerald-400 font-black' : 'text-slate-500 line-through') : 'text-slate-200'
            }`}>{match.homeTeam}</span>
          </div>
          <span className={`font-black w-3/12 text-right ${isHomeWinner ? 'text-emerald-400' : isFinished ? 'text-slate-500' : 'text-slate-400'}`}>
            {isFinished ? homeScore : '-'}
            {isTie && result?.penaltyWinner === 'home' && <span className="text-[8px] ml-0.5 font-bold text-amber-500">(p)</span>}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex justify-between items-center gap-1.5 py-0.5">
          <div className="flex items-center gap-1 w-9/12 truncate">
            <span className="text-sm leading-none">{match.awayFlag}</span>
            <span className={`font-semibold truncate ${
              isFinished ? (isAwayWinner ? 'text-emerald-400 font-black' : 'text-slate-500 line-through') : 'text-slate-200'
            }`}>{match.awayTeam}</span>
          </div>
          <span className={`font-black w-3/12 text-right ${isAwayWinner ? 'text-emerald-400' : isFinished ? 'text-slate-500' : 'text-slate-400'}`}>
            {isFinished ? awayScore : '-'}
            {isTie && result?.penaltyWinner === 'away' && <span className="text-[8px] ml-0.5 font-bold text-amber-500">(p)</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export const TablasTab: React.FC<TablasTabProps> = ({ matchResults }) => {
  const [subTab, setSubTab] = useState<'posiciones' | 'arbol'>('posiciones');
  const allGroupStandings = calculateGroupTables(matchResults);
  
  // State for quick tabs (A-D, E-H, I-L)
  const [activeRange, setActiveRange] = useState<GroupRange>('A-D');
  
  // State for expanded groups to show full stats
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Filter groups by active range
  const filteredGroupStandings = allGroupStandings.filter(({ groupName }) => {
    if (activeRange === 'A-D') return ['A', 'B', 'C', 'D'].includes(groupName);
    if (activeRange === 'E-H') return ['E', 'F', 'G', 'H'].includes(groupName);
    return ['I', 'J', 'K', 'L'].includes(groupName);
  });

  // Resolve knockout matches dynamically
  const resolvedMatches = resolveKnockoutMatches(MATCHES, matchResults);
  const findMatch = (id: string) => resolvedMatches.find(m => m.id === id)!;

  const col1_matches = [
    findMatch('match_ko_74'),
    findMatch('match_ko_77'),
    findMatch('match_ko_73'),
    findMatch('match_ko_75'),
    findMatch('match_ko_83'),
    findMatch('match_ko_84'),
    findMatch('match_ko_81'),
    findMatch('match_ko_82')
  ].filter(Boolean);

  const col2_matches = [
    findMatch('match_ko_89'),
    findMatch('match_ko_90'),
    findMatch('match_ko_93'),
    findMatch('match_ko_94')
  ].filter(Boolean);

  const col3_matches = [
    findMatch('match_ko_97'),
    findMatch('match_ko_98')
  ].filter(Boolean);

  const col4_matches = [
    findMatch('match_ko_101')
  ].filter(Boolean);

  const final_match = findMatch('match_ko_104');
  const third_place_match = findMatch('match_ko_103');

  const col6_matches = [
    findMatch('match_ko_102')
  ].filter(Boolean);

  const col7_matches = [
    findMatch('match_ko_99'),
    findMatch('match_ko_100')
  ].filter(Boolean);

  const col8_matches = [
    findMatch('match_ko_91'),
    findMatch('match_ko_92'),
    findMatch('match_ko_95'),
    findMatch('match_ko_96')
  ].filter(Boolean);

  const col9_matches = [
    findMatch('match_ko_76'),
    findMatch('match_ko_78'),
    findMatch('match_ko_79'),
    findMatch('match_ko_80'),
    findMatch('match_ko_86'),
    findMatch('match_ko_88'),
    findMatch('match_ko_85'),
    findMatch('match_ko_87')
  ].filter(Boolean);

  return (
    <div className="space-y-4 text-left">
      {/* Title */}
      <div className="border-b border-slate-900 pb-2.5 flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold text-white leading-none">Estadísticas y Clasificación</h2>
          <p className="text-xs text-slate-400 mt-1">Seguimiento en vivo del Mundial 2026.</p>
        </div>
      </div>

      {/* Main Tab Toggle */}
      <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setSubTab('posiciones')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            subTab === 'posiciones'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tablas de Posiciones
        </button>
        <button
          onClick={() => setSubTab('arbol')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            subTab === 'arbol'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Árbol de Clasificación
        </button>
      </div>

      {subTab === 'posiciones' ? (
        <div className="space-y-4">
          {/* Quick Info Banner */}
          <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex gap-2.5 items-start text-xs text-slate-400">
            <Info size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Los <span className="text-emerald-400 font-bold">dos mejores equipos</span> de cada grupo clasificarán a la siguiente ronda. Toca una tarjeta de grupo para ver las estadísticas completas de goles y partidos.
            </p>
          </div>

          {/* Group Navigation Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
            {(['A-D', 'E-H', 'I-L'] as GroupRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                  activeRange === range
                    ? 'bg-slate-900 text-cyan-400 shadow-sm border border-slate-800/80'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Grupos {range}
              </button>
            ))}
          </div>

          {/* Standings Grid/List */}
          <div className="space-y-4">
            {filteredGroupStandings.map(({ groupName, standings }) => {
              const isExpanded = !!expandedGroups[groupName];

              return (
                <div 
                  key={groupName}
                  className="glass-card rounded-2xl border border-slate-800/85 bg-gradient-to-br from-slate-900/40 to-slate-950/40 overflow-hidden shadow-md transition-all hover:border-slate-800"
                >
                  {/* Group Title Header */}
                  <button
                    onClick={() => toggleGroupExpand(groupName)}
                    className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-900/30 border-b border-slate-900 cursor-pointer active:bg-slate-900/55 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                        {groupName}
                      </span>
                      <span className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                        Grupo {groupName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="text-[10px] uppercase font-semibold">
                        {isExpanded ? 'Ver Menos' : 'Ver Más'}
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {/* Table */}
                  <div className="p-3">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-[10px] text-slate-500 font-extrabold uppercase border-b border-slate-900 pb-2">
                          <th className="py-1.5 pl-2 text-center w-8">Pos</th>
                          <th className="py-1.5 pl-2">Equipo</th>
                          <th className="py-1.5 text-center w-10">PJ</th>
                          {isExpanded && (
                            <>
                              <th className="py-1.5 text-center w-8">PG</th>
                              <th className="py-1.5 text-center w-8">PE</th>
                              <th className="py-1.5 text-center w-8">PP</th>
                              <th className="py-1.5 text-center w-10">GF:GC</th>
                            </>
                          )}
                          <th className="py-1.5 text-center w-10">DG</th>
                          <th className="py-1.5 text-center w-12 text-cyan-400">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-950">
                        {standings.map((teamData, idx) => {
                          const pos = idx + 1;
                          const isQualifier = pos <= 2;

                          return (
                            <tr 
                              key={teamData.team}
                              className="hover:bg-slate-900/20 transition-colors"
                            >
                              {/* Position */}
                              <td className="py-2.5 pl-2 text-center">
                                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-black ${
                                  isQualifier 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-slate-950 text-slate-500 border border-slate-900'
                                }`}>
                                  {pos}
                                </span>
                              </td>

                              {/* Team with flag */}
                              <td className="py-2.5 pl-2 font-bold text-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-base leading-none">{teamData.flag}</span>
                                  <span className="truncate max-w-[100px] sm:max-w-none">{teamData.team}</span>
                                </div>
                              </td>

                              {/* Played */}
                              <td className="py-2.5 text-center font-semibold text-slate-300">
                                {teamData.pj}
                              </td>

                              {/* Conditional Expanded stats */}
                              {isExpanded && (
                                <>
                                  <td className="py-2.5 text-center text-slate-400">{teamData.pg}</td>
                                  <td className="py-2.5 text-center text-slate-400">{teamData.pe}</td>
                                  <td className="py-2.5 text-center text-slate-400">{teamData.pp}</td>
                                  <td className="py-2.5 text-center text-slate-500 font-mono text-[10px]">
                                    {teamData.gf}:{teamData.gc}
                                  </td>
                                </>
                              )}

                              {/* Goal Difference */}
                              <td className={`py-2.5 text-center font-mono font-bold text-[11px] ${
                                teamData.dg > 0 
                                  ? 'text-emerald-500' 
                                  : teamData.dg < 0 
                                    ? 'text-rose-500' 
                                    : 'text-slate-500'
                              }`}>
                                {teamData.dg > 0 ? `+${teamData.dg}` : teamData.dg}
                              </td>

                              {/* Points */}
                              <td className="py-2.5 text-center font-black text-slate-100 bg-slate-900/20">
                                {teamData.pts}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tie Break Info Footer */}
          <div className="p-4 bg-slate-900/20 border border-slate-900/60 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle size={14} className="text-slate-500" />
              Criterios de desempate oficial
            </span>
            <p className="text-[10px] text-slate-500 leading-normal">
              En caso de empate en puntos, las posiciones se definen sucesivamente por: 1º Mayor diferencia de goles (DG), 2º Mayor número de goles a favor (GF), y 3º Criterio alfabético.
            </p>
          </div>
        </div>
      ) : (
        /* ================= BRACKET TREE VIEW ================= */
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex gap-2.5 items-start text-xs text-slate-400">
            <GitFork size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Desliza horizontalmente para ver el árbol completo de cruces eliminatorios desde 16vos de final hasta la gran final.
            </p>
          </div>

          <div className="w-full overflow-x-auto py-2 select-none scrollbar-none border border-slate-800/50 rounded-2xl bg-slate-950/20">
            <div className="flex gap-6 min-w-[1640px] h-[780px] p-4 items-stretch justify-between">
              
              {/* COL 1: 16vos Izquierda */}
              <div className="flex flex-col justify-around h-full py-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">16vos Final</span>
                {col1_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 2: 8vos Izquierda */}
              <div className="flex flex-col justify-around h-full py-6">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">Octavos</span>
                {col2_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 3: 4tos Izquierda */}
              <div className="flex flex-col justify-around h-full py-12">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">Cuartos</span>
                {col3_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 4: Semifinal Izquierda */}
              <div className="flex flex-col justify-around h-full py-20">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">Semifinal</span>
                {col4_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 5: Finales (Centro) */}
              <div className="flex flex-col justify-center gap-16 h-full py-4">
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest text-center block border-b border-cyan-950/45 pb-1">Gran Final</span>
                  {final_match && <BracketMatchCard match={final_match} result={matchResults[final_match.id]} />}
                </div>
                <div className="space-y-3">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center block border-b border-slate-900/50 pb-1">Tercer Lugar</span>
                  {third_place_match && <BracketMatchCard match={third_place_match} result={matchResults[third_place_match.id]} />}
                </div>
              </div>

              {/* COL 6: Semifinal Derecha */}
              <div className="flex flex-col justify-around h-full py-20">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">Semifinal</span>
                {col6_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 7: 4tos Derecha */}
              <div className="flex flex-col justify-around h-full py-12">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">Cuartos</span>
                {col7_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 8: 8vos Derecha */}
              <div className="flex flex-col justify-around h-full py-6">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">Octavos</span>
                {col8_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

              {/* COL 9: 16vos Derecha */}
              <div className="flex flex-col justify-around h-full py-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-900/50 pb-1">16vos Final</span>
                {col9_matches.map(m => (
                  <BracketMatchCard key={m.id} match={m} result={matchResults[m.id]} />
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
