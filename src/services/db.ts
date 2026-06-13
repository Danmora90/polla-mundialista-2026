import { db, auth, isUsingMock } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import type { UserProfile, Tournament, Prediction, MatchResult, AppNotification } from '../types';

// ==========================================
// MOCK LOCALSTORAGE DATABASE ENGINE
// ==========================================

const MOCK_STORAGE_KEY = 'polla_mock_db';

interface MockDB {
  users: Record<string, UserProfile>; // uid -> UserProfile
  tournaments: Record<string, Tournament>; // tournamentId -> Tournament
  predictions: Record<string, Prediction>; // predictionId -> Prediction
  matchResults: Record<string, MatchResult>; // matchId -> MatchResult
  notifications: Record<string, AppNotification>; // notificationId -> AppNotification
}

const getInitialMockDB = (): MockDB => {
  // Add a default admin account to allow testing right away
  const defaultUsers: Record<string, UserProfile> = {
    'admin-uid': {
      uid: 'admin-uid',
      email: 'admin@polla.com',
      username: 'admin',
      isAdmin: true
    },
    'user-uid': {
      uid: 'user-uid',
      email: 'juan@polla.com',
      username: 'juan',
      isAdmin: false
    }
  };

  return {
    users: defaultUsers,
    tournaments: {
      'demo-tournament': {
        id: 'demo-tournament',
        name: 'Polla de Prueba 2026',
        creatorId: 'admin-uid',
        participants: ['admin-uid', 'user-uid'],
        invitations: []
      }
    },
    predictions: {},
    matchResults: {},
    notifications: {}
  };
};

const readMockDB = (): MockDB => {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!data) {
    const initial = getInitialMockDB();
    saveMockDB(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(data);
    if (!parsed.notifications) parsed.notifications = {};
    return parsed;
  } catch {
    return getInitialMockDB();
  }
};

const saveMockDB = (data: MockDB) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  // Notify all active listeners
  triggerMockListeners();
};

// Subscription system for Mock DB
type MockListener = {
  id: string;
  type: 'tournaments' | 'predictions' | 'matchResults' | 'invitations' | 'notifications';
  filterKey?: string;
  callback: (data: any) => void;
};

let mockListeners: MockListener[] = [];

const triggerMockListeners = () => {
  const mockDb = readMockDB();
  mockListeners.forEach(listener => {
    if (listener.type === 'tournaments') {
      // Return tournaments where filterKey (userId) is a participant
      const list = Object.values(mockDb.tournaments).filter(t => 
        t.participants.includes(listener.filterKey || '')
      );
      listener.callback(list);
    } else if (listener.type === 'predictions') {
      // Return predictions matching tournamentId (filterKey)
      const list = Object.values(mockDb.predictions).filter(p => 
        p.tournamentId === listener.filterKey
      );
      listener.callback(list);
    } else if (listener.type === 'matchResults') {
      listener.callback(Object.values(mockDb.matchResults));
    } else if (listener.type === 'invitations') {
      // Find tournaments where target username has pending invitation
      const list = Object.values(mockDb.tournaments).filter(t => 
        t.invitations.some(inv => inv.toUsername === listener.filterKey && inv.status === 'pending')
      );
      listener.callback(list);
    } else if (listener.type === 'notifications') {
      const list = Object.values(mockDb.notifications || {}).filter(n => 
        n.toUserId === listener.filterKey
      ).sort((a, b) => b.createdAt - a.createdAt);
      listener.callback(list);
    }
  });
};

const addMockListener = (
  type: MockListener['type'],
  filterKey: string | undefined,
  callback: (data: any) => void
): (() => void) => {
  const id = Math.random().toString(36).substring(2);
  mockListeners.push({ id, type, filterKey, callback });
  
  // Trigger immediately
  const mockDb = readMockDB();
  if (type === 'tournaments') {
    const list = Object.values(mockDb.tournaments).filter(t => 
      t.participants.includes(filterKey || '')
    );
    callback(list);
  } else if (type === 'predictions') {
    const list = Object.values(mockDb.predictions).filter(p => 
      p.tournamentId === filterKey
    );
    callback(list);
  } else if (type === 'matchResults') {
    callback(Object.values(mockDb.matchResults));
  } else if (type === 'invitations') {
    const list = Object.values(mockDb.tournaments).filter(t => 
      t.invitations.some(inv => inv.toUsername === filterKey && inv.status === 'pending')
    );
    callback(list);
  } else if (type === 'notifications') {
    const list = Object.values(mockDb.notifications || {}).filter(n => 
      n.toUserId === filterKey
    ).sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }

  // Return unsubscribe function
  return () => {
    mockListeners = mockListeners.filter(l => l.id !== id);
  };
};

// Mock Auth State Emulator
let mockCurrentUser: UserProfile | null = null;
let mockAuthCallbacks: ((user: UserProfile | null) => void)[] = [];

const notifyMockAuth = () => {
  mockAuthCallbacks.forEach(cb => cb(mockCurrentUser));
};

// Try to auto-login from local session
const storedMockUser = sessionStorage.getItem('polla_mock_auth');
if (storedMockUser) {
  try {
    mockCurrentUser = JSON.parse(storedMockUser);
  } catch {}
}


// ==========================================
// UNIFIED DATA SERVICE EXPORTS
// ==========================================

export const dbService = {
  // ----------------------------------------
  // AUTHENTICATION
  // ----------------------------------------
  subscribeAuth(callback: (user: UserProfile | null) => void): () => void {
    if (isUsingMock) {
      mockAuthCallbacks.push(callback);
      callback(mockCurrentUser);
      return () => {
        mockAuthCallbacks = mockAuthCallbacks.filter(cb => cb !== callback);
      };
    } else {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            // Fetch user profile doc
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              callback(userDoc.data() as UserProfile);
            } else {
              callback(null);
            }
          } catch (err: any) {
            console.error('Error al obtener el perfil de usuario en Firestore:', err);
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    }
  },

  async register(email: string, username: string, password: string): Promise<UserProfile> {
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
    }

    if (isUsingMock) {
      const mockDb = readMockDB();
      // Check username uniqueness
      const usernameExists = Object.values(mockDb.users).some(
        u => u.username.toLowerCase() === cleanUsername
      );
      if (usernameExists) {
        throw new Error('El nombre de usuario ya está en uso.');
      }
      
      const emailExists = Object.values(mockDb.users).some(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      if (emailExists) {
        throw new Error('El correo electrónico ya está registrado.');
      }

      const uid = 'mock-uid-' + Math.random().toString(36).substring(2);
      const newUser: UserProfile = {
        uid,
        email,
        username: cleanUsername,
        isAdmin: cleanUsername === 'admin' // auto admin if username is 'admin'
      };

      mockDb.users[uid] = newUser;
      saveMockDB(mockDb);

      mockCurrentUser = newUser;
      sessionStorage.setItem('polla_mock_auth', JSON.stringify(newUser));
      notifyMockAuth();
      return newUser;
    } else {
      // Firebase flow
      // 1. Try checking if username is taken (gracefully handles unauthenticated read block)
      let usernameExists = false;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', cleanUsername));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          usernameExists = true;
        }
      } catch (err: any) {
        console.warn('No se pudo verificar la unicidad del nombre de usuario de forma anónima debido a reglas de Firestore. Se procederá a autenticar primero.', err);
      }

      if (usernameExists) {
        throw new Error('El nombre de usuario ya está en uso.');
      }

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 3. Create Firestore User Profile
      const newUser: UserProfile = {
        uid,
        email,
        username: cleanUsername,
        isAdmin: cleanUsername === 'admin'
      };

      try {
        await setDoc(doc(db, 'users', uid), newUser);
      } catch (err: any) {
        // Rollback Auth user if profile document creation fails
        try {
          await userCredential.user.delete();
        } catch (delErr) {
          console.error('Error al limpiar usuario en Auth tras fallo en Firestore:', delErr);
        }
        throw new Error('Permisos insuficientes en Cloud Firestore. Asegúrate de habilitar lectura/escritura en tus reglas de seguridad. Detalle: ' + err.message);
      }
      return newUser;
    }
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (isUsingMock) {
      const mockDb = readMockDB();
      // Simulating a simple verification by matching email
      const user = Object.values(mockDb.users).find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!user) {
        throw new Error('Usuario no encontrado. Registrate para ingresar.');
      }
      // In mock mode, we accept password (no crypt verification for demo)
      mockCurrentUser = user;
      sessionStorage.setItem('polla_mock_auth', JSON.stringify(user));
      notifyMockAuth();
      return user;
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Get Profile
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw new Error('El perfil de usuario no existe en la base de datos.');
      }
      return userDoc.data() as UserProfile;
    }
  },

  async logout(): Promise<void> {
    if (isUsingMock) {
      mockCurrentUser = null;
      sessionStorage.removeItem('polla_mock_auth');
      notifyMockAuth();
    } else {
      await signOut(auth);
    }
  },

  // ----------------------------------------
  // USER PROFILES
  // ----------------------------------------
  async getAllUsers(): Promise<UserProfile[]> {
    if (isUsingMock) {
      const mockDb = readMockDB();
      return Object.values(mockDb.users);
    } else {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.docs.map(d => d.data() as UserProfile);
    }
  },

  // ----------------------------------------
  // TOURNAMENTS & INVITATIONS
  // ----------------------------------------
  subscribeUserTournaments(userId: string, callback: (tournaments: Tournament[]) => void): () => void {
    if (isUsingMock) {
      return addMockListener('tournaments', userId, callback);
    } else {
      const tRef = collection(db, 'tournaments');
      const q = query(tRef, where('participants', 'array-contains', userId));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
        callback(list);
      });
    }
  },

  subscribePendingInvitations(username: string, callback: (tournaments: Tournament[]) => void): () => void {
    const cleanUsername = username.toLowerCase();
    if (isUsingMock) {
      return addMockListener('invitations', cleanUsername, callback);
    } else {
      const tRef = collection(db, 'tournaments');
      // Firebase query has some limitations querying arrays of objects.
      // So we will listen to all tournaments and filter on client, or query where participants has invites.
      // Since it's a mobile app with realistic sized active tournament list, listening to tournaments is fine.
      // Better: we can query tournaments and filter locally to stay robust.
      return onSnapshot(tRef, (snapshot) => {
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Tournament))
          .filter(t => t.invitations.some(inv => inv.toUsername.toLowerCase() === cleanUsername && inv.status === 'pending'));
        callback(list);
      });
    }
  },

  async createTournament(name: string, creatorId: string): Promise<string> {
    const cleanName = name.trim();
    if (cleanName.length < 3) {
      throw new Error('El nombre de la polla debe tener al menos 3 caracteres.');
    }

    const id = 't-' + Math.random().toString(36).substring(2);
    const newTournament: Tournament = {
      id,
      name: cleanName,
      creatorId,
      participants: [creatorId],
      invitations: []
    };

    if (isUsingMock) {
      const mockDb = readMockDB();
      mockDb.tournaments[id] = newTournament;
      saveMockDB(mockDb);
      return id;
    } else {
      await setDoc(doc(db, 'tournaments', id), newTournament);
      return id;
    }
  },

  async sendInvitation(tournamentId: string, fromUsername: string, targetUsername: string): Promise<void> {
    const cleanUsername = targetUsername.trim().toLowerCase();
    
    if (isUsingMock) {
      const mockDb = readMockDB();
      const targetUser = Object.values(mockDb.users).find(
        u => u.username.toLowerCase() === cleanUsername
      );
      if (!targetUser) {
        throw new Error(`El usuario "@${targetUsername}" no existe.`);
      }

      const tournament = mockDb.tournaments[tournamentId];
      if (!tournament) {
        throw new Error('Torneo no encontrado.');
      }

      // Check if already participant
      if (tournament.participants.includes(targetUser.uid)) {
        throw new Error('Este usuario ya es participante del torneo.');
      }

      // Check if already invited
      const alreadyInvited = tournament.invitations.some(
        inv => inv.toUsername.toLowerCase() === cleanUsername
      );
      if (alreadyInvited) {
        throw new Error('Este usuario ya tiene una invitación pendiente o procesada.');
      }

      tournament.invitations.push({
        toUsername: cleanUsername,
        status: 'pending'
      });

      // Create Notification
      const notifId = 'notif-' + Math.random().toString(36).substring(2);
      const newNotification: AppNotification = {
        id: notifId,
        toUserId: targetUser.uid,
        fromUsername,
        tournamentId,
        tournamentName: tournament.name,
        type: 'invitation',
        status: 'pending',
        createdAt: Date.now()
      };
      if (!mockDb.notifications) mockDb.notifications = {};
      mockDb.notifications[notifId] = newNotification;

      saveMockDB(mockDb);
    } else {
      // 1. Get user profile of target
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', cleanUsername));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error(`El usuario "@${targetUsername}" no existe.`);
      }
      const targetUser = querySnapshot.docs[0].data() as UserProfile;

      // 2. Fetch tournament to check eligibility
      const tDocRef = doc(db, 'tournaments', tournamentId);
      const tDoc = await getDoc(tDocRef);
      if (!tDoc.exists()) {
        throw new Error('Torneo no encontrado.');
      }
      const tournament = tDoc.data() as Tournament;

      if (tournament.participants.includes(targetUser.uid)) {
        throw new Error('Este usuario ya es participante del torneo.');
      }

      const alreadyInvited = tournament.invitations.some(
        inv => inv.toUsername.toLowerCase() === cleanUsername
      );
      if (alreadyInvited) {
        throw new Error('Este usuario ya tiene una invitación pendiente o procesada.');
      }

      // 3. Add to invitations array in doc
      const updatedInvitations = [
        ...tournament.invitations,
        { toUsername: cleanUsername, status: 'pending' as const }
      ];
      await updateDoc(tDocRef, { invitations: updatedInvitations });

      // 4. Create notification document in notifications collection
      const notifId = 'notif-' + Math.random().toString(36).substring(2);
      const newNotification: AppNotification = {
        id: notifId,
        toUserId: targetUser.uid,
        fromUsername,
        tournamentId,
        tournamentName: tournament.name,
        type: 'invitation',
        status: 'pending',
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'notifications', notifId), newNotification);
    }
  },

  async respondToInvitation(tournamentId: string, username: string, accept: boolean): Promise<void> {
    const cleanUsername = username.toLowerCase();
    
    if (isUsingMock) {
      const mockDb = readMockDB();
      const tournament = mockDb.tournaments[tournamentId];
      if (!tournament) return;

      const user = Object.values(mockDb.users).find(u => u.username === cleanUsername);
      if (!user) return;

      // Update invitation status
      tournament.invitations = tournament.invitations.map(inv => {
        if (inv.toUsername === cleanUsername && inv.status === 'pending') {
          return { ...inv, status: accept ? 'accepted' : 'rejected' };
        }
        return inv;
      });

      if (accept && !tournament.participants.includes(user.uid)) {
        tournament.participants.push(user.uid);
      }

      saveMockDB(mockDb);
    } else {
      const tDocRef = doc(db, 'tournaments', tournamentId);
      const tDoc = await getDoc(tDocRef);
      if (!tDoc.exists()) return;
      const tournament = tDoc.data() as Tournament;

      // Find user
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', cleanUsername));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return;
      const user = querySnapshot.docs[0].data() as UserProfile;

      const updatedInvitations = tournament.invitations.map(inv => {
        if (inv.toUsername === cleanUsername && inv.status === 'pending') {
          return { ...inv, status: (accept ? 'accepted' : 'rejected') as any };
        }
        return inv;
      });

      const updatedParticipants = [...tournament.participants];
      if (accept && !updatedParticipants.includes(user.uid)) {
        updatedParticipants.push(user.uid);
      }

      await updateDoc(tDocRef, {
        invitations: updatedInvitations,
        participants: updatedParticipants
      });
    }
  },

  subscribeNotifications(userId: string, callback: (notifications: AppNotification[]) => void): () => void {
    if (isUsingMock) {
      return addMockListener('notifications', userId, callback);
    } else {
      const nRef = collection(db, 'notifications');
      const q = query(nRef, where('toUserId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AppNotification))
          .sort((a, b) => b.createdAt - a.createdAt);
        callback(list);
      });
    }
  },

  async respondToNotification(notificationId: string, accept: boolean): Promise<void> {
    if (isUsingMock) {
      const mockDb = readMockDB();
      const notification = mockDb.notifications?.[notificationId];
      if (!notification) return;

      notification.status = accept ? 'accepted' : 'rejected';

      const tournament = mockDb.tournaments[notification.tournamentId];
      if (tournament) {
        // Update the legacy invitation as well for completeness
        const targetUsername = mockDb.users[notification.toUserId]?.username || "";
        tournament.invitations = tournament.invitations.map(inv => {
          if (inv.toUsername.toLowerCase() === targetUsername.toLowerCase() && inv.status === 'pending') {
            return { ...inv, status: accept ? 'accepted' : 'rejected' };
          }
          return inv;
        });

        if (accept && !tournament.participants.includes(notification.toUserId)) {
          tournament.participants.push(notification.toUserId);
        }
      }

      saveMockDB(mockDb);
    } else {
      const notifDocRef = doc(db, 'notifications', notificationId);
      const notifDoc = await getDoc(notifDocRef);
      if (!notifDoc.exists()) return;
      const notification = notifDoc.data() as AppNotification;

      // Update status
      await updateDoc(notifDocRef, { status: accept ? 'accepted' : 'rejected' });

      // Update tournament
      const tDocRef = doc(db, 'tournaments', notification.tournamentId);
      const tDoc = await getDoc(tDocRef);
      if (tDoc.exists()) {
        const tournament = tDoc.data() as Tournament;
        
        // Update legacy invitations inside tournament
        const targetUserDocRef = doc(db, 'users', notification.toUserId);
        const targetUserDoc = await getDoc(targetUserDocRef);
        let targetUsername = "";
        if (targetUserDoc.exists()) {
          targetUsername = (targetUserDoc.data() as UserProfile).username;
        }

        const updatedInvitations = tournament.invitations.map(inv => {
          if (inv.toUsername.toLowerCase() === targetUsername.toLowerCase() && inv.status === 'pending') {
            return { ...inv, status: (accept ? 'accepted' : 'rejected') as any };
          }
          return inv;
        });

        const updates: any = { invitations: updatedInvitations };
        if (accept && !tournament.participants.includes(notification.toUserId)) {
          updates.participants = [...tournament.participants, notification.toUserId];
        }
        await updateDoc(tDocRef, updates);
      }
    }
  },

  // ----------------------------------------
  // PREDICTIONS
  // ----------------------------------------
  subscribePredictions(tournamentId: string, callback: (predictions: Prediction[]) => void): () => void {
    if (isUsingMock) {
      return addMockListener('predictions', tournamentId, callback);
    } else {
      const pRef = collection(db, 'predictions');
      const q = query(pRef, where('tournamentId', '==', tournamentId));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => doc.data() as Prediction);
        callback(list);
      });
    }
  },

  async savePrediction(
    userId: string,
    matchId: string,
    tournamentId: string,
    homeScore: number,
    awayScore: number
  ): Promise<void> {
    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Los marcadores no pueden ser negativos.');
    }

    if (isUsingMock) {
      const mockDb = readMockDB();
      
      // Check if match is finished
      const matchRes = mockDb.matchResults[matchId];
      if (matchRes && matchRes.status === 'finished') {
        throw new Error('No puedes guardar predicciones para un partido finalizado.');
      }

      const predId = `${userId}_${matchId}_${tournamentId}`;
      mockDb.predictions[predId] = {
        id: predId,
        userId,
        matchId,
        tournamentId,
        homeScore,
        awayScore
      };

      saveMockDB(mockDb);
    } else {
      // 1. Verify match is not finished
      const mrDocRef = doc(db, 'matchResults', matchId);
      const mrDoc = await getDoc(mrDocRef);
      if (mrDoc.exists() && mrDoc.data().status === 'finished') {
        throw new Error('No puedes guardar predicciones para un partido finalizado.');
      }

      const predId = `${userId}_${matchId}_${tournamentId}`;
      const predRef = doc(db, 'predictions', predId);
      await setDoc(predRef, {
        id: predId,
        userId,
        matchId,
        tournamentId,
        homeScore,
        awayScore
      });
    }
  },

  // ----------------------------------------
  // MATCH RESULTS (ADMIN ONLY)
  // ----------------------------------------
  subscribeMatchResults(callback: (results: MatchResult[]) => void): () => void {
    if (isUsingMock) {
      return addMockListener('matchResults', undefined, callback);
    } else {
      const mrRef = collection(db, 'matchResults');
      return onSnapshot(mrRef, (snapshot) => {
        const list = snapshot.docs.map(doc => doc.data() as MatchResult);
        callback(list);
      });
    }
  },

  async saveMatchResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: 'scheduled' | 'finished'
  ): Promise<void> {
    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Los marcadores oficiales no pueden ser negativos.');
    }

    if (isUsingMock) {
      const mockDb = readMockDB();
      const existing = mockDb.matchResults[matchId];
      mockDb.matchResults[matchId] = {
        matchId,
        homeScore,
        awayScore,
        status,
        isLocked: existing?.isLocked ?? false
      };
      saveMockDB(mockDb);
    } else {
      const mrRef = doc(db, 'matchResults', matchId);
      const docSnap = await getDoc(mrRef);
      const existing = docSnap.exists() ? docSnap.data() as MatchResult : null;
      await setDoc(mrRef, {
        matchId,
        homeScore,
        awayScore,
        status,
        isLocked: existing?.isLocked ?? false
      });
    }
  },

  async toggleMatchLock(matchId: string, isLocked: boolean): Promise<void> {
    if (isUsingMock) {
      const mockDb = readMockDB();
      const existing = mockDb.matchResults[matchId] || {
        matchId,
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled'
      };
      mockDb.matchResults[matchId] = {
        ...existing,
        isLocked
      };
      saveMockDB(mockDb);
    } else {
      const mrRef = doc(db, 'matchResults', matchId);
      const docSnap = await getDoc(mrRef);
      if (docSnap.exists()) {
        await updateDoc(mrRef, { isLocked });
      } else {
        await setDoc(mrRef, {
          matchId,
          homeScore: 0,
          awayScore: 0,
          status: 'scheduled',
          isLocked
        });
      }
    }
  },

  async getPredictionsForMatch(tournamentId: string, matchId: string): Promise<Prediction[]> {
    if (isUsingMock) {
      const mockDb = readMockDB();
      return Object.values(mockDb.predictions).filter(
        p => p.tournamentId === tournamentId && p.matchId === matchId
      );
    } else {
      const predsRef = collection(db, 'predictions');
      const q = query(
        predsRef,
        where('tournamentId', '==', tournamentId),
        where('matchId', '==', matchId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Prediction);
    }
  }
};
