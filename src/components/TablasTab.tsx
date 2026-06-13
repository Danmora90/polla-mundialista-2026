import React, { useState } from 'react';
import type { MatchResult } from '../types';
import { calculateGroupTables } from '../utils/standings';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';

interface TablasTabProps {
  matchResults: Record<string, MatchResult>;
}

type GroupRange = 'A-D' | 'E-H' | 'I-L';

export const TablasTab: React.FC<TablasTabProps> = ({ matchResults }) => {
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

  return (
    <div className="space-y-5 text-left">
      {/* Title */}
      <div className="border-b border-slate-900 pb-2.5 flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold text-white leading-none">Tablas de Grupos</h2>
          <p className="text-xs text-slate-400 mt-1">Posiciones en vivo del Mundial 2026.</p>
        </div>
      </div>

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
  );
};
