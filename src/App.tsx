import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  User, 
  Calendar, 
  Plus, 
  Check, 
  AlertCircle, 
  Trash2, 
  Edit2, 
  UserPlus, 
  Info, 
  Share2, 
  Star, 
  Shield, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2,
  Lock,
  ArrowRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

import { 
  Team, 
  Match, 
  User as UserType, 
  Group, 
  Prediction, 
  ScoreReport 
} from './types';

import { 
  INITIAL_TEAMS, 
  INITIAL_MATCHES, 
  INITIAL_USERS, 
  INITIAL_PREDICTIONS, 
  INITIAL_GROUPS, 
  AVATAR_OPTIONS,
  calculateScore 
} from './data';

export default function App() {
  // State from LocalStorage or default values
  const [users, setUsers] = useState<UserType[]>(() => {
    const saved = localStorage.getItem('polla26_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('polla26_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [predictions, setPredictions] = useState<Record<string, Record<string, Prediction>>>(() => {
    const saved = localStorage.getItem('polla26_predictions');
    return saved ? JSON.parse(saved) : INITIAL_PREDICTIONS;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('polla26_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('polla26_active_user_id') || 'u-osman';
  });

  const [activeTab, setActiveTab] = useState<'partidos' | 'pronosticos' | 'grupos' | 'reglamento'>('pronosticos');
  const [activeGroupId, setActiveGroupId] = useState<string>('g-oficina');

  // UI state for creation Modals/Forms
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('😎');
  
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // States for entering predictions
  const [tempPreds, setTempPreds] = useState<Record<string, { home: string; away: string }>>({});

  // States for Admin editing Match score
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [adminHomeScore, setAdminHomeScore] = useState<string>('');
  const [adminAwayScore, setAdminAwayScore] = useState<string>('');

  // Persist state to localstorage
  useEffect(() => {
    localStorage.setItem('polla26_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('polla26_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('polla26_predictions', JSON.stringify(predictions));
  }, [predictions]);

  useEffect(() => {
    localStorage.setItem('polla26_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('polla26_active_user_id', activeUserId);
  }, [activeUserId]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const activeUser = users.find(u => u.id === activeUserId) || users[0];

  // Initialize prediction state when active user or matches change
  useEffect(() => {
    if (activeUser) {
      const uPreds = predictions[activeUser.id] || {};
      const initialTemp: Record<string, { home: string; away: string }> = {};
      matches.forEach(m => {
        const existing = uPreds[m.id];
        initialTemp[m.id] = {
          home: existing ? existing.homeScore.toString() : '',
          away: existing ? existing.awayScore.toString() : ''
        };
      });
      setTempPreds(initialTemp);
    }
  }, [activeUserId, matches]);

  // Point calculation engine for user summary
  const getUserStats = (userId: string) => {
    const userPreds = predictions[userId] || {};
    let totalPoints = 0;
    let exactMatchesCount = 0;
    let outcomeMatchesCount = 0;
    let predictedGamesCount = 0;

    matches.forEach(m => {
      const pred = userPreds[m.id];
      if (pred) {
        predictedGamesCount++;
        if (m.isMatchFinished) {
          const report = calculateScore(pred, m);
          totalPoints += report.points;
          if (report.type === 'exact') {
            exactMatchesCount++;
          } else if (report.type === 'outcome') {
            outcomeMatchesCount++;
          }
        }
      }
    });

    return { totalPoints, exactMatchesCount, outcomeMatchesCount, predictedGamesCount };
  };

  // Switch Active User helper
  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
    triggerToast(`Sesión cambiada a: ${users.find(u => u.id === userId)?.name}`, 'info');
  };

  // Create new player profile
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      triggerToast('El nombre de usuario no puede estar vacío.', 'error');
      return;
    }

    const newId = `u-${Date.now()}`;
    const newUser: UserType = {
      id: newId,
      name: newUserName.trim(),
      avatar: newUserAvatar,
      groupIds: [activeGroupId] // Auto-join current selected group
    };

    setUsers(prev => [...prev, newUser]);
    // Create empty predictions space
    setPredictions(prev => ({
      ...prev,
      [newId]: {}
    }));

    setActiveUserId(newId);
    setNewUserName('');
    setIsCreatingUser(false);
    triggerToast(`¡Perfil creado para ${newUser.name}!`, 'success');
  };

  // Save predictions for the current active user
  const handleSavePrediction = (matchId: string) => {
    const scoreState = tempPreds[matchId];
    if (!scoreState || scoreState.home === '' || scoreState.away === '') {
      triggerToast('Por favor introduce marcadores válidos para guardar tu pronóstico.', 'error');
      return;
    }

    const homeScore = parseInt(scoreState.home, 10);
    const awayScore = parseInt(scoreState.away, 10);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      triggerToast('Los marcadores deben ser números enteros iguales o mayores a 0.', 'error');
      return;
    }

    const updatedPred: Prediction = {
      matchId,
      homeScore,
      awayScore,
      createdAt: new Date().toISOString()
    };

    setPredictions(prev => {
      const userPreds = prev[activeUser.id] || {};
      return {
        ...prev,
        [activeUser.id]: {
          ...userPreds,
          [matchId]: updatedPred
        }
      };
    });

    triggerToast('¡Tu pronóstico ha sido guardado exitosamente!', 'success');
  };

  // Group creation logic
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      triggerToast('Define un nombre para tu grupo privado de amigos.', 'error');
      return;
    }
    
    const finalCode = (newGroupCode.trim() || `POLLA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    const newGroupId = `g-${Date.now()}`;

    // Verify code isn't duplicate
    if (groups.some(g => g.code.toUpperCase() === finalCode.toUpperCase())) {
      triggerToast('Este código de grupo ya existe. Elige otro.', 'error');
      return;
    }

    const newGroup: Group = {
      id: newGroupId,
      name: newGroupName.trim(),
      code: finalCode,
      description: newGroupDesc.trim() || 'Apuestas privadas de amigos para el mundial 2016.',
      creatorId: activeUser.id
    };

    setGroups(prev => [...prev, newGroup]);
    
    // Add current user to this group
    setUsers(prev => prev.map(u => {
      if (u.id === activeUser.id) {
        return {
          ...u,
          groupIds: [...u.groupIds, newGroupId]
        };
      }
      return u;
    }));

    setActiveGroupId(newGroupId);
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupCode('');
    setIsCreatingGroup(false);
    triggerToast(`Grupo "${newGroup.name}" creado con el código: ${newGroup.code}`, 'success');
  };

  // Group joining logic
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      triggerToast('Ingresa un código válido.', 'error');
      return;
    }

    const targetGroup = groups.find(g => g.code.toUpperCase() === joinCodeInput.trim().toUpperCase());
    
    if (!targetGroup) {
      triggerToast('Código de grupo no encontrado. Verifica de nuevo.', 'error');
      return;
    }

    if (activeUser.groupIds.includes(targetGroup.id)) {
      triggerToast('Ya formas parte de este grupo de amigos.', 'info');
      setJoinCodeInput('');
      setIsJoiningGroup(false);
      setActiveGroupId(targetGroup.id);
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === activeUser.id) {
        return {
          ...u,
          groupIds: [...u.groupIds, targetGroup.id]
        };
      }
      return u;
    }));

    setActiveGroupId(targetGroup.id);
    setJoinCodeInput('');
    setIsJoiningGroup(false);
    triggerToast(`¡Te has unido exitosamente a "${targetGroup.name}"!`, 'success');
  };

  // Admin/Simulation - Update official match score
  const handleUpdateOfficialScore = (matchId: string) => {
    if (adminHomeScore === '' || adminAwayScore === '') {
      triggerToast('Debes ingresar valores para guardar un marcador oficial.', 'error');
      return;
    }

    const home = parseInt(adminHomeScore, 10);
    const away = parseInt(adminAwayScore, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      triggerToast('Valores no válidos.', 'error');
      return;
    }

    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          homeScore: home,
          awayScore: away,
          isMatchFinished: true
        };
      }
      return m;
    }));

    setEditingMatchId(null);
    setAdminHomeScore('');
    setAdminAwayScore('');
    triggerToast('¡Marcador oficial actualizado! La tabla de posiciones se ha recalculado.', 'success');
  };

  // Admin/Simulation - Revert a match to "Not Started"
  const handleResetMatch = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          homeScore: null,
          awayScore: null,
          isMatchFinished: false
        };
      }
      return m;
    }));
    triggerToast('Partido restablecido a pendiente.', 'info');
  };

  // Reset entire Application to see default data
  const handleResetApplication = () => {
    if (window.confirm('¿Seguro que deseas restablecer toda la aplicación? Esto borrará tus grupos y predicciones creadas actuales.')) {
      localStorage.removeItem('polla26_users');
      localStorage.removeItem('polla26_matches');
      localStorage.removeItem('polla26_predictions');
      localStorage.removeItem('polla26_groups');
      localStorage.removeItem('polla26_active_user_id');

      setUsers(INITIAL_USERS);
      setMatches(INITIAL_MATCHES);
      setPredictions(INITIAL_PREDICTIONS);
      setGroups(INITIAL_GROUPS);
      setActiveUserId('u-osman');
      setActiveGroupId('g-oficina');
      setActiveTab('pronosticos');
      
      triggerToast('¡Aplicación restablecida de manera limpia!', 'success');
    }
  };

  // Simulates random match outcomes globally (Highly engaging mock engine)
  const handleSimulateRandomFinishedMatches = () => {
    setMatches(prev => prev.map(m => {
      const hStr = Math.floor(Math.random() * 4);
      const aStr = Math.floor(Math.random() * 4);
      return {
        ...m,
        homeScore: hStr,
        awayScore: aStr,
        isMatchFinished: true
      };
    }));
    triggerToast('¡Se simularon marcadores al azar para todos los partidos!', 'success');
  };

  // Calculation of leaderboard for the active group
  const getLeaderboard = (): Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    exactMatchesCount: number;
    outcomeMatchesCount: number;
    predictedGamesCount: number;
    totalPoints: number;
  }> => {
    // Filter users belonging to current active group
    const groupUsers = users.filter(u => u.groupIds.includes(activeGroupId));
    
    const entries = groupUsers.map(user => {
      const stats = getUserStats(user.id);
      return {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        exactMatchesCount: stats.exactMatchesCount,
        outcomeMatchesCount: stats.outcomeMatchesCount,
        predictedGamesCount: stats.predictedGamesCount,
        totalPoints: stats.totalPoints
      };
    });

    // Sort: 
    // 1st. Points DESC
    // 2nd. Number of Exact Matches (3pts) DESC (classic tie-breaker!)
    // 3rd. Name alphabetically ASC
    return entries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactMatchesCount !== a.exactMatchesCount) {
        return b.exactMatchesCount - a.exactMatchesCount;
      }
      return a.userName.localeCompare(b.userName);
    });
  };

  const currentGroup = groups.find(g => g.id === activeGroupId) || groups[0];
  const leaderboard = getLeaderboard();
  const activeUserStats = getUserStats(activeUser.id);
  const totalFinishedMatches = matches.filter(m => m.isMatchFinished).length;

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f8fafc] font-sans antialiased relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Absolute ambient lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Floating Application Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-5 left-5 md:left-auto md:w-96 z-50 p-4 rounded-xl border flex items-start gap-3 backdrop-blur-md shadow-2xl ${
              toast.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                : toast.type === 'error'
                ? 'bg-red-950/80 border-red-500/30 text-red-300'
                : 'bg-slate-900/95 border-slate-700/50 text-sky-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">Notificación de la Polla</p>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Hero Brand Header */}
      <header className="border-b border-slate-850 bg-[#0a0f1d]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white glow-green shrink-0">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300 bg-clip-text text-transparent">
                POLLA MUNDIALISTA 2026
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Exclusivo Fase de Grupos · Pronósticos de Amigos
              </p>
            </div>
          </div>

          {/* Active Player Controller / Switch User */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-lg">{activeUser.avatar}</span>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Jugador Activo</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-slate-100">{activeUser.name}</span>
                  {activeUser.isAdmin && <Shield className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" title="Organizador/Admin" />}
                </div>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

            {/* User Picker Dropdown */}
            <div className="flex gap-1.5">
              <select 
                value={activeUserId}
                onChange={(e) => handleSwitchUser(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.avatar} {u.name} {u.isAdmin ? '⭐' : ''}
                  </option>
                ))}
              </select>

              <button 
                type="button"
                onClick={() => setIsCreatingUser(true)}
                className="bg-emerald-550 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition"
                title="Nuevo Jugador / Amigo"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Dynamic Key Performance Indicators Block */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-800 hover:bg-slate-900/60 transition">
            <span className="absolute top-2 right-2 text-2xl opacity-10 font-bold font-mono">01</span>
            <p className="text-slate-400 text-xs uppercase font-mono">Puntos Totales ({activeUser.name})</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-display font-bold text-emerald-400">{activeUserStats.totalPoints}</span>
              <span className="text-xs text-slate-400">pts</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Aciertos Exactos: {activeUserStats.exactMatchesCount} (+{activeUserStats.exactMatchesCount * 3} pts)</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-800 hover:bg-slate-900/60 transition">
            <span className="absolute top-2 right-2 text-2xl opacity-10 font-bold font-mono">02</span>
            <p className="text-slate-400 text-xs uppercase font-mono">Pronósticos Personales</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-display font-bold text-slate-200">
                {activeUserStats.predictedGamesCount}
              </span>
              <span className="text-xs text-slate-400">de {matches.length} partidos</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 mt-3.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(activeUserStats.predictedGamesCount / matches.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-800 hover:bg-slate-900/60 transition">
            <span className="absolute top-2 right-2 text-2xl opacity-10 font-bold font-mono">03</span>
            <p className="text-slate-400 text-xs uppercase font-mono">Grupo Privado Actual</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[190px]">
                {currentGroup?.name || 'Ninguno'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 truncate">
              {currentGroup?.description}
            </p>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-800 hover:bg-slate-900/60 transition">
            <span className="absolute top-2 right-2 text-2xl opacity-10 font-bold font-mono">04</span>
            <p className="text-slate-400 text-xs uppercase font-mono">Estatus del Torneo</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-display font-bold text-teal-400">{totalFinishedMatches}</span>
              <span className="text-xs text-slate-400">finalizados</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Se han jugado el {Math.round((totalFinishedMatches / matches.length) * 100)}% de los encuentros
            </p>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex overflow-x-auto border-b border-slate-800/80 mb-6 gap-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('pronosticos')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all shrink-0 duration-200 ${
              activeTab === 'pronosticos'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>Mis Pronósticos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grupos')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all shrink-0 duration-200 ${
              activeTab === 'grupos'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Leaderboard y Grupos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('partidos')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all shrink-0 duration-200 ${
              activeTab === 'partidos'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Marcadores Reales (FIFA Admin)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reglamento')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all shrink-0 duration-200 ${
              activeTab === 'reglamento'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Reglamento Polla</span>
          </button>
        </div>

        {/* Tab 1: Pronósticos (User predicts) */}
        {activeTab === 'pronosticos' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-spin text-[12px]" />
                  Fase de Grupos - Pronósticos de: <span className="text-emerald-400">{activeUser.name}</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Exclusivo para la <span className="text-emerald-400 font-semibold">Fase de Grupos</span>. Al conocerse los cruces predefinidos, puedes completar todos tus pronósticos con anticipación.
                </p>
              </div>
              <div className="text-xs font-mono bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-lg flex items-center gap-2 self-start sm:self-center">
                <span>Exacto = 3 pts</span>
                <span className="opacity-40">|</span>
                <span>Ganador = 1 pt</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {matches.map((match) => {
                const userPreds = predictions[activeUser.id] || {};
                const userPred = userPreds[match.id];
                const hasPred = !!userPred;
                
                // Live stats report if finished
                const scoreResult = match.isMatchFinished ? calculateScore(userPred, match) : null;

                return (
                  <div 
                    key={match.id} 
                    className={`bg-slate-900/40 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      hasPred 
                        ? 'border-emerald-500/20 hover:border-emerald-500/35' 
                        : 'border-slate-800 hover:border-slate-700'
                    } ${match.isMatchFinished ? 'bg-[#0a0f1d]/60' : ''}`}
                  >
                    {/* Header info match */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-4">
                      <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-850">
                        <span className="text-xs font-semibold text-slate-300">{match.groupName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{match.date} · {match.time}</span>
                        </p>
                      </div>
                    </div>

                    {/* Team flags & score input fields */}
                    <div className="flex items-center justify-between gap-4 py-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center flex-1 text-center">
                        <span className="text-4xl filter drop-shadow-md transition-transform group-hover:scale-105">{match.homeTeam.flag}</span>
                        <span className="font-semibold text-sm text-slate-100 mt-2 truncate w-28 md:w-32">{match.homeTeam.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-bold mt-0.5">Casa</span>
                      </div>

                      {/* Inputs center panel */}
                      <div className="flex flex-col items-center justify-center gap-2">
                        {match.isMatchFinished ? (
                          // Match finalized official scoreboard
                          <div className="bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-lg">
                            <p className="text-[9px] text-slate-500 uppercase font-mono text-center tracking-wider mb-0.5">OFICIAL</p>
                            <p className="text-lg font-mono font-bold text-slate-200 tracking-widest text-center">
                              {match.homeScore} : {match.awayScore}
                            </p>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-xs font-mono font-bold uppercase tracking-wider">VS</div>
                        )}

                        {/* Interactive inputs */}
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            min="0"
                            placeholder="-"
                            disabled={match.isMatchFinished}
                            value={tempPreds[match.id]?.home ?? ''}
                            onChange={(e) => setTempPreds(prev => ({
                              ...prev,
                              [match.id]: { ...prev[match.id], home: e.target.value }
                            }))}
                            className={`w-12 h-11 bg-slate-950 border text-center font-mono text-lg font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition ${
                              match.isMatchFinished 
                                ? 'border-slate-800 text-slate-500 opacity-70 cursor-not-allowed' 
                                : 'border-slate-700 text-slate-100'
                            }`}
                          />
                          <span className="text-slate-500 font-bold">:</span>
                          <input 
                            type="number"
                            min="0"
                            placeholder="-"
                            disabled={match.isMatchFinished}
                            value={tempPreds[match.id]?.away ?? ''}
                            onChange={(e) => setTempPreds(prev => ({
                              ...prev,
                              [match.id]: { ...prev[match.id], away: e.target.value }
                            }))}
                            className={`w-12 h-11 bg-slate-950 border text-center font-mono text-lg font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition ${
                              match.isMatchFinished 
                                ? 'border-slate-800 text-slate-500 opacity-70 cursor-not-allowed' 
                                : 'border-slate-700 text-slate-100'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center flex-1 text-center">
                        <span className="text-4xl filter drop-shadow-md transition-transform group-hover:scale-105">{match.awayTeam.flag}</span>
                        <span className="font-semibold text-sm text-slate-100 mt-2 truncate w-28 md:w-32">{match.awayTeam.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-bold mt-0.5">Visita</span>
                      </div>
                    </div>

                    {/* Venue information */}
                    <div className="text-center mt-3 mb-1">
                      <p className="text-[10px] text-slate-400">{match.venue}</p>
                    </div>

                    {/* Actions and Status labels */}
                    <div className="border-t border-slate-800/50 pt-3 mt-3 flex items-center justify-between">
                      {/* Left Badge status */}
                      <div>
                        {match.isMatchFinished ? (
                          scoreResult && scoreResult.type !== 'none' ? (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                              scoreResult.type === 'exact' 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 glow-green' 
                                : 'bg-sky-950/60 text-sky-400 border border-sky-500/30'
                            }`}>
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {scoreResult.type === 'exact' ? '+3 Puntos (Exacto!)' : '+1 Punto (Ganador)'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-500/20">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {hasPred ? '0 Puntos (No acertó)' : 'No pronosticado (0 pts)'}
                            </span>
                          )
                        ) : hasPred ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-500/10 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tú apuesta: {userPred.home} - {userPred.away}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium bg-amber-950/20 border border-amber-500/10 px-2.5 py-1 rounded-lg">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                            <span>Marcador Pendiente</span>
                          </span>
                        )}
                      </div>

                      {/* Right Save Action */}
                      {!match.isMatchFinished && (
                        <button
                          type="button"
                          onClick={() => handleSavePrediction(match.id)}
                          className={`text-xs font-semibold px-4 py-2 rounded-xl border transition ${
                            hasPred 
                              ? 'bg-slate-950 text-emerald-400 border-emerald-500/35 hover:bg-slate-900' 
                              : 'bg-emerald-600 text-black font-extrabold border-transparent hover:bg-emerald-500 hover:scale-101'
                          }`}
                        >
                          {hasPred ? 'Actualizar' : 'Guardar Pronóstico'}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Grupos de Amigos & Standings */}
        {activeTab === 'grupos' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left sidebar: Groups selector */}
            <div className="space-y-6 lg:col-span-1">
              
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-emerald-400" />
                    Tus Grupos Privados
                  </h3>
                  <p className="text-xs font-mono text-slate-400 uppercase font-semibold">({groups.filter(g => activeUser.groupIds.includes(g.id)).length})</p>
                </div>

                <div className="space-y-3">
                  {groups.map((group) => {
                    const isMember = activeUser.groupIds.includes(group.id);
                    const isSelected = activeGroupId === group.id;

                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          if (isMember) {
                            setActiveGroupId(group.id);
                          } else {
                            if (window.confirm(`¿Quieres unirte al grupo "${group.name}"?`)) {
                              setUsers(prev => prev.map(u => {
                                if (u.id === activeUser.id) {
                                  return { ...u, groupIds: [...u.groupIds, group.id] };
                                }
                                return u;
                              }));
                              setActiveGroupId(group.id);
                              triggerToast(`¡Te uniste a ${group.name}!`, 'success');
                            }
                          }
                        }}
                        className={`w-full text-left p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                          isSelected 
                            ? 'bg-slate-900/90 border-emerald-500/50 glow-green' 
                            : isMember 
                            ? 'bg-slate-900/35 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/50' 
                            : 'bg-slate-955 border-slate-900 opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1 w-full">
                          <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{group.name}</h4>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mt-1.5 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{group.description}</p>
                        
                        <div className="mt-3.5 pt-3 border-t border-slate-800/40 w-full flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-850">
                            CÓDIGO: <strong className="text-emerald-400">{group.code}</strong>
                          </span>
                          {!isMember && (
                            <span className="text-[10px] text-amber-400 font-medium">Unirse</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Create/Join CTA Buttons inside Sidebar */}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingGroup(true);
                      setIsJoiningGroup(false);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-100 border border-slate-750 text-xs py-2 px-3 rounded-lg font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Crear Grupo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsJoiningGroup(true);
                      setIsCreatingGroup(false);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-emerald-550 hover:bg-emerald-500 text-black text-xs py-2 px-3 rounded-lg font-extrabold transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Unirse con Codigo</span>
                  </button>
                </div>

              </div>

              {/* Quick instructions block */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 p-5 rounded-2xl border border-indigo-500/10">
                <h4 className="text-slate-200 text-xs font-bold font-mono tracking-wider uppercase mb-1">🤝 Invita a tus Amigos</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Crea perfiles para tus compañeros o diles el <span className="font-semibold text-teal-400">código de invitación</span> de tu grupo privado para que compitan bajo tus mismas reglas. ¡Recula instantáneamente los puntos ingresando scores del mundial!
                </p>
              </div>

            </div>

            {/* Middle to Right section: Leaderboard of chosen group */}
            <div className="lg:col-span-2 space-y-6">

              {/* Dynamic Form modals loaded conditionally in main field */}
              {isCreatingGroup && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 p-5 rounded-2xl border border-emerald-500/20"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h4 className="font-display font-semibold text-slate-200">🏆 Crear Nuevo Grupo de Amigos</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingGroup(false)} 
                      className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                    >
                      Cancelar
                    </button>
                  </div>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">Nombre del Grupo</label>
                      <input 
                        type="text"
                        placeholder="Ej. Los de Sistemas 💻"
                        value={newGroupName}
                        required
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">Descripción o Premio (Opcional)</label>
                      <textarea 
                        rows={2}
                        placeholder="Premio opcional o apuestas privadas. Ej. 'El último lugar paga el asado de fin de mundial.'"
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">Código de Invitación Personalizado (Opcional)</label>
                      <input 
                        type="text"
                        placeholder="Ej. QUINIELA-CHINGONA (Si se deja en blanco se generará uno aleatorio)"
                        value={newGroupCode}
                        onChange={(e) => setNewGroupCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold py-2.5 rounded-xl transition"
                    >
                      Generar y Lanzar Grupo de Polla
                    </button>
                  </form>
                </motion.div>
              )}

              {isJoiningGroup && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 p-5 rounded-2xl border border-emerald-500/20"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h4 className="font-display font-semibold text-slate-200">👥 Unirte a un Grupo con Código</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsJoiningGroup(false)} 
                      className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                    >
                      Cancelar
                    </button>
                  </div>
                  <form onSubmit={handleJoinByCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5 font-semibold">Código de Invitación</label>
                      <input 
                        type="text"
                        placeholder="Ingresa código (Ej: MUNDIAL-OFI-2026)"
                        value={joinCodeInput}
                        required
                        onChange={(e) => setJoinCodeInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tracking-widest text-center"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold py-2.5 rounded-xl transition"
                    >
                      ¡Ingresar al Grupo Privado!
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Main Table view of Standing in Active Group */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-100">
                      Tabla de Posiciones: <span className="text-emerald-400">{currentGroup?.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {currentGroup?.description}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-850 flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs text-slate-400">Código para Amigos:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 select-all" title="Click para copiar o compartir">{currentGroup?.code}</span>
                  </div>
                </div>

                {/* Table implementation */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-400 text-xs font-mono">
                        <th className="py-3 px-2 text-center w-12">Pos</th>
                        <th className="py-3 px-3">Participante</th>
                        <th className="py-3 px-3 text-center">Pronósticos</th>
                        <th className="py-3 px-3 text-center w-28">Exacto (3 pts)</th>
                        <th className="py-3 px-3 text-center w-28">Ganador (1 pt)</th>
                        <th className="py-3 px-3 text-right w-24">Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                            No hay ningún jugador en este grupo.
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((uEntry, index) => {
                          const isSelf = uEntry.userId === activeUser.id;
                          const isFirst = index === 0;
                          const isSecond = index === 1;
                          const isThird = index === 2;

                          return (
                            <tr 
                              key={uEntry.userId}
                              className={`transition duration-150 ${isSelf ? 'bg-emerald-950/20 font-semibold' : 'hover:bg-slate-900/20'}`}
                            >
                              {/* Position */}
                              <td className="py-3.5 px-2 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold font-mono ${
                                  isFirst 
                                    ? 'bg-yellow-500 text-black glow-gold' 
                                    : isSecond 
                                    ? 'bg-slate-300 text-black' 
                                    : isThird 
                                    ? 'bg-amber-600 text-white' 
                                    : 'text-slate-400 bg-slate-950/65'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>

                              {/* Participant avatar and Name */}
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl filter drop-shadow-sm shrink-0">{uEntry.userAvatar}</span>
                                  <div>
                                    <p className="text-slate-250 text-sm flex items-center gap-1.5">
                                      <span>{uEntry.userName}</span>
                                      {isSelf && <span className="text-[10px] bg-emerald-500 text-black font-extrabold px-1.5 py-0.5 rounded-md hover:scale-102">TÚ</span>}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Predicted matches count */}
                              <td className="py-3.5 px-3 text-center text-xs font-mono text-slate-300">
                                {uEntry.predictedGamesCount} / {matches.length}
                              </td>

                              {/* Exact predictions count */}
                              <td className="py-3.5 px-3 text-center">
                                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                                  {uEntry.exactMatchesCount}
                                </span>
                              </td>

                              {/* Outcome predictions count */}
                              <td className="py-3.5 px-3 text-center">
                                <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950/20 border border-sky-500/10 px-2.5 py-0.5 rounded-lg">
                                  {uEntry.outcomeMatchesCount}
                                </span>
                              </td>

                              {/* Total score points */}
                              <td className="py-3.5 px-3 text-right">
                                <span className="text-sm font-bold font-mono text-emerald-400">
                                  {uEntry.totalPoints} pts
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Legend explanation for points */}
                <p className="text-[10px] text-slate-400 mt-5 font-mono leading-relaxed text-center border-t border-slate-800/40 pt-3">
                  Criterio de desempate en la tabla: (1) Total de puntos, (2) Cantidad de aciertos exactos de marcadores, (3) Orden alfabético.
                </p>

              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 3: Marcadores Reales / Admin Simulation Interface */}
        {activeTab === 'partidos' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <span className="text-xs font-mono text-amber-500 uppercase font-semibold">⚡ PANEL DE SIMULACIÓN FIFA</span>
                <h2 className="font-display font-bold text-lg text-slate-100 mt-0.5">Define los Marcadores Reales del Mundial</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Aquí actúas como el sistema de la FIFA. Al colocar e ingresar los resultados finales oficiales del Mundial 2026, la plataforma recalcula instantáneamente los puntos obtenidos por cada amigo en todos sus grupos.
                </p>
              </div>

              {/* Instant dynamic tool items */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateRandomFinishedMatches}
                  className="bg-emerald-650 hover:bg-emerald-600 text-black text-xs font-extrabold px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simular Partidos al Azar
                </button>
                <button
                  type="button"
                  onClick={handleResetApplication}
                  className="bg-slate-850 hover:bg-slate-800 text-red-400 border border-slate-800 hover:border-slate-700/80 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Vaciar y Reestablecer Todo
                </button>
              </div>
            </div>

            {/* List of matches with result editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {matches.map((match) => {
                const isEditing = editingMatchId === match.id;

                return (
                  <div 
                    key={match.id}
                    className={`bg-slate-900/40 p-5 rounded-2xl border relative overflow-hidden transition ${
                      match.isMatchFinished ? 'border-indigo-500/10' : 'border-slate-800'
                    }`}
                  >
                    
                    {/* Upper date */}
                    <div className="flex justify-between items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 text-xs font-mono">
                      <span className="font-bold text-indigo-400 uppercase">{match.groupName}</span>
                      <span className="text-slate-400">{match.date}</span>
                    </div>

                    {/* Direct Visual Result */}
                    {isEditing ? (
                      <div className="flex items-center justify-between gap-3 py-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-100 flex-1 truncate">
                          <span className="text-2xl">{match.homeTeam.flag}</span>
                          <span className="truncate">{match.homeTeam.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input 
                            type="number" 
                            min="0"
                            placeholder="Home"
                            value={adminHomeScore}
                            onChange={(e) => setAdminHomeScore(e.target.value)}
                            className="w-10 h-9 bg-slate-900 border border-slate-700 text-center text-sm font-bold rounded-lg text-emerald-400 focus:outline"
                          />
                          <span className="text-slate-500 font-bold">:</span>
                          <input 
                            type="number" 
                            min="0"
                            placeholder="Away"
                            value={adminAwayScore}
                            onChange={(e) => setAdminAwayScore(e.target.value)}
                            className="w-10 h-9 bg-slate-900 border border-slate-700 text-center text-sm font-bold rounded-lg text-emerald-400 focus:outline"
                          />
                        </div>

                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-100 flex-1 justify-end truncate">
                          <span className="truncate">{match.awayTeam.name}</span>
                          <span className="text-2xl">{match.awayTeam.flag}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2 text-slate-100">
                        <div className="flex items-center gap-2.5 font-semibold text-sm w-5/12">
                          <span className="text-2xl filter drop-shadow">{match.homeTeam.flag}</span>
                          <span className="truncate">{match.homeTeam.name}</span>
                        </div>

                        {/* Scores */}
                        <div className="text-center bg-slate-950/70 py-1.5 px-4 rounded-lg border border-slate-850 min-w-16">
                          {match.isMatchFinished ? (
                            <span className="text-sm font-mono font-extrabold text-emerald-400">{match.homeScore} - {match.awayScore}</span>
                          ) : (
                            <span className="text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">VS</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 font-semibold text-sm w-5/12 justify-end text-right">
                          <span className="truncate">{match.awayTeam.name}</span>
                          <span className="text-2xl filter drop-shadow">{match.awayTeam.flag}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer buttons for simulating */}
                    <div className="flex items-center justify-between mt-4 border-t border-slate-800/40 pt-3 text-xs">
                      <div>
                        {match.isMatchFinished ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 font-semibold bg-indigo-950/30 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Partido Culminado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold bg-amber-950/30 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>Por Jugar</span>
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMatchId(null);
                                setAdminHomeScore('');
                                setAdminAwayScore('');
                              }}
                              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 px-2.5 py-1.5 rounded-lg font-medium transition"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOfficialScore(match.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold px-3 py-1.5 rounded-lg transition"
                            >
                              Guardar Oficial
                            </button>
                          </>
                        ) : (
                          <>
                            {match.isMatchFinished && (
                              <button
                                type="button"
                                onClick={() => handleResetMatch(match.id)}
                                className="text-slate-400 hover:text-slate-200 border border-slate-800 px-2.5 py-1 rounded-lg transition"
                              >
                                Limpiar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMatchId(match.id);
                                setAdminHomeScore(match.homeScore !== null && match.homeScore !== undefined ? match.homeScore.toString() : '');
                                setAdminAwayScore(match.awayScore !== null && match.awayScore !== undefined ? match.awayScore.toString() : '');
                              }}
                              className="bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 px-3.5 py-1.5 rounded-lg transition flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3 text-emerald-400" />
                              <span>{match.isMatchFinished ? 'Modificar' : 'Ingresar Marcador'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </motion.div>
        )}

        {/* Tab 4: Reglamento & Rules */}
        {activeTab === 'reglamento' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850">
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Reglas Oficiales y Enfoque - Fase de Grupos 2026
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Esta polla se concentra <strong className="text-emerald-400">única y exclusivamente en la Fase de Grupos</strong>. Como los emparejamientos y el calendario de la fase de grupos ya están plenamente confirmados y programados por la FIFA, puedes ingresar todos tus marcadores con total certidumbre antes del pitazo inicial. La asignación de puntos se calcula rigurosamente al finalizar cada partido.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* 3 Points rule */}
                <div className="bg-[#0c131d] p-5 rounded-xl border border-emerald-500/20 glow-green">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-extrabold border border-emerald-500/30 font-mono text-sm">
                      3
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">Acierto al Resultado Exacto</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Premio Máximo</p>
                    </div>
                  </div>
                  <p className="text-slate-350 text-xs mt-3 leading-relaxed">
                    Si tu pronóstico del marcador final coincide <strong className="text-emerald-400">exactamente</strong> con los goles anotados por ambos equipos.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-850 mt-4 text-xs font-mono">
                    <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">Ejemplo Práctico:</p>
                    <div className="flex justify-between">
                      <span>Tu Pronóstico: <strong className="text-slate-200">2 - 1</strong></span>
                      <span>Resultado Real: <strong className="text-emerald-400">2 - 1</strong></span>
                    </div>
                  </div>
                </div>

                {/* 1 Point rule */}
                <div className="bg-[#0b131e] p-5 rounded-xl border border-sky-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-950 text-sky-400 font-extrabold border border-sky-500/30 font-mono text-sm">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">Acierto de Ganador o Empate</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Premio Parcial</p>
                    </div>
                  </div>
                  <p className="text-slate-350 text-xs mt-3 leading-relaxed">
                    Si acertaste cuál de los dos equipos ganó el partido (o si empataron), pero <strong className="text-slate-200">no diste con los goles exactos</strong> de los cuadros.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-850 mt-4 text-xs font-mono">
                    <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">Ejemplo Práctico:</p>
                    <div className="flex justify-between">
                      <span>Tu Pronóstico: <strong className="text-slate-200">3 - 1</strong></span>
                      <span>Resultado Real: <strong className="text-sky-400">2 - 0</strong> (Acertaste Victoria Casa)</span>
                    </div>
                  </div>
                </div>

                {/* 0 Points rule */}
                <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-slate-400 font-semibold border border-slate-800 font-mono text-sm">
                      0
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">Resultado Incorrecto</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Sin Puntos</p>
                    </div>
                  </div>
                  <p className="text-slate-350 text-xs mt-3 leading-relaxed">
                    Si no coincidiste ni en el ganador, ni en el empate, ni en el marcador exacto de goles.
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-850 mt-4 text-xs font-mono">
                    <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">Ejemplo Práctico:</p>
                    <div className="flex justify-between">
                      <span>Tu Pronóstico: <strong className="text-slate-200">1 - 1</strong> (Empate)</span>
                      <span>Resultado Real: <strong className="text-red-400">2 - 0</strong> (Victoria Local)</span>
                    </div>
                  </div>
                </div>

                {/* Tips block */}
                <div className="bg-[#120f18] p-5 rounded-xl border border-amber-500/10">
                  <h4 className="text-amber-400 text-xs font-bold font-mono tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400/20" />
                    Consejo para Ganar la Polla
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Los empates son arriesgados pero otorgan gran ventaja: si pronosticas un empate (ej. 2-2) y el juego queda empatado por cualquier otro marcador (ej. 1-1 ó 0-0), obtendrás 1 punto garantizado. Si coincide exactamente, te llevas los 3 puntos.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Creation Modal Overlays */}
      <AnimatePresence>
        {isCreatingUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1424] border border-slate-800 p-6 rounded-2xl w-full max-w-md relative glow-green"
            >
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-emerald-400" />
                Registrar Nuevo Amigo / Perfil
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Agrega perfiles para simular de forma sencilla las apuestas de otros amigos desde este mismo navegador.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 uppercase font-mono mb-2">Nombre del Participante</label>
                  <input 
                    type="text"
                    required
                    maxLength={20}
                    placeholder="Ej. Roberto Gómez"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 uppercase font-mono mb-2">Icono / Avatar ({newUserAvatar})</label>
                  <div className="grid grid-cols-7 gap-2">
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewUserAvatar(emoji)}
                        className={`text-xl p-2 rounded-lg transition hover:scale-110 shrink-0 ${
                          newUserAvatar === emoji ? 'bg-emerald-950 border border-emerald-500/50' : 'bg-slate-950 border border-transparent'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="w-1/2 bg-slate-900 hover:bg-slate-850 text-slate-300 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold transition"
                  >
                    Retroceder
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-black py-2.5 rounded-xl text-sm font-extrabold transition"
                  >
                    Crear Perfil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent global footer */}
      <footer className="border-t border-slate-900/60 bg-[#060a13] mt-16 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono uppercase tracking-wider text-[10px]">
            &copy; 100% Client-Side Persistent Local Engine · Copa Mundial FIFA 2026
          </p>
          <p className="text-slate-400">
            Diseñado para amantes del fútbol ⚽ Vive la pasión con amigos
          </p>
        </div>
      </footer>

    </div>
  );
}
