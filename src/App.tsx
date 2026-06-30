import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { dbService } from './services/db';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { MundialTab } from './components/MundialTab';
import { TorneosTab } from './components/TorneosTab';
import { PerfilTab } from './components/PerfilTab';
import { AdminTab } from './components/AdminTab';
import { TablasTab } from './components/TablasTab';
import type { Tournament, Prediction, MatchResult, UserProfile } from './types';
import { Trophy } from 'lucide-react';

function App() {
  const { user, loading: authLoading, error: authError, login, register, logout, setError: setAuthError } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('mundial');
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  
  // Data States
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>({});
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Subscriptions management
  useEffect(() => {
    if (!user) {
      // Clear data states on logout
      setTournaments([]);
      setPredictions({});
      setMatchResults({});
      setAllUsers([]);
      setActiveTournamentId(null);
      return;
    }

    // 1. Fetch all users for username mapping
    const loadUsers = async () => {
      try {
        const users = await dbService.getAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error('Error loading users list:', err);
      }
    };
    loadUsers();

    // 2. Subscribe to user's tournaments
    const unsubTournaments = dbService.subscribeUserTournaments(user.uid, (list) => {
      setTournaments(list);
      // Auto-select first tournament if none selected
      if (list.length > 0) {
        setActiveTournamentId(prev => {
          if (!prev || !list.some(t => t.id === prev)) {
            return list[0].id;
          }
          return prev;
        });
      } else {
        setActiveTournamentId(null);
      }
    });

    // 3. Subscribe to match results (global)
    const unsubMatchResults = dbService.subscribeMatchResults((list) => {
      const map: Record<string, MatchResult> = {};
      list.forEach(mr => {
        map[mr.matchId] = mr;
      });
      setMatchResults(map);
    });

    return () => {
      unsubTournaments();
      unsubMatchResults();
    };
  }, [user]);

  // Subscribe to predictions for all joined tournaments
  useEffect(() => {
    if (!user || tournaments.length === 0) return;

    const unsubs = tournaments.map(t => {
      return dbService.subscribePredictions(t.id, (preds) => {
        setPredictions(prev => ({
          ...prev,
          [t.id]: preds
        }));
      });
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user, tournaments]);

  // Handlers
  const handleSavePrediction = async (matchId: string, homeScore: number, awayScore: number) => {
    if (!user || !activeTournamentId) return;
    await dbService.savePrediction(user.uid, matchId, activeTournamentId, homeScore, awayScore);
  };

  const handleCreateTournament = async (name: string): Promise<string> => {
    if (!user) throw new Error('Debes iniciar sesión.');
    const id = await dbService.createTournament(name, user.uid);
    // Reload user's profiles
    const users = await dbService.getAllUsers();
    setAllUsers(users);
    return id;
  };

  const handleSendInvitation = async (tournamentId: string, username: string) => {
    if (!user) return;
    await dbService.sendInvitation(tournamentId, user.username, username);
  };

  const handleSaveMatchResult = async (
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: 'scheduled' | 'finished',
    penaltyWinner?: 'home' | 'away'
  ) => {
    await dbService.saveMatchResult(matchId, homeScore, awayScore, status, penaltyWinner);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100 gap-4">
        <div className="inline-flex p-4 rounded-3xl bg-slate-900 border border-slate-800 text-cyan-400 animate-pulse shadow-lg">
          <Trophy size={48} />
        </div>
        <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando Polla...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center p-0 sm:py-6">
        <div className="relative w-full max-w-md bg-slate-950 text-slate-100 flex flex-col shadow-2xl border-0 sm:border border-slate-800/80 sm:rounded-3xl overflow-hidden min-h-[100vh] sm:min-h-[800px] justify-center">
          <Auth
            loginFn={login}
            registerFn={register}
            errorMsg={authError}
            clearError={() => setAuthError(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'mundial' && (
        <MundialTab
          user={user}
          tournaments={tournaments}
          predictions={predictions}
          matchResults={matchResults}
          activeTournamentId={activeTournamentId}
          setActiveTournamentId={setActiveTournamentId}
          onSavePrediction={handleSavePrediction}
          allUsers={allUsers}
        />
      )}

      {activeTab === 'tablas' && (
        <TablasTab matchResults={matchResults} />
      )}

      {activeTab === 'torneos' && (
        <TorneosTab
          user={user}
          tournaments={tournaments}
          predictions={predictions}
          matchResults={matchResults}
          allUsers={allUsers}
          onCreateTournament={handleCreateTournament}
          onSendInvitation={handleSendInvitation}
        />
      )}

      {activeTab === 'perfil' && (
        <PerfilTab
          user={user}
          tournaments={tournaments}
          predictions={predictions}
          matchResults={matchResults}
          onLogout={logout}
        />
      )}

      {activeTab === 'admin' && (
        <AdminTab
          user={user}
          matchResults={matchResults}
          onSaveMatchResult={handleSaveMatchResult}
        />
      )}
    </Layout>
  );
}

export default App;
