import { Team, Match, User, Group, Prediction, ScoreReport } from './types';

// Realist list of teams for the World Cup 2026
export const INITIAL_TEAMS: Record<string, Team> = {
  MEX: { id: 'MEX', name: 'México', flag: '🇲🇽', groupCode: 'A' },
  USA: { id: 'USA', name: 'Estados Unidos', flag: '🇺🇸', groupCode: 'B' },
  CAN: { id: 'CAN', name: 'Canadá', flag: '🇨🇦', groupCode: 'C' },
  ARG: { id: 'ARG', name: 'Argentina', flag: '🇦🇷', groupCode: 'A' },
  FRA: { id: 'FRA', name: 'Francia', flag: '🇫🇷', groupCode: 'D' },
  BRA: { id: 'BRA', name: 'Brasil', flag: '🇧🇷', groupCode: 'E' },
  ESP: { id: 'ESP', name: 'España', flag: '🇪🇸', groupCode: 'F' },
  GER: { id: 'GER', name: 'Alemania', flag: '🇩🇪', groupCode: 'D' },
  ENG: { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', groupCode: 'B' },
  JPN: { id: 'JPN', name: 'Japón', flag: '🇯🇵', groupCode: 'C' },
  MAR: { id: 'MAR', name: 'Marruecos', flag: '🇲🇦', groupCode: 'E' },
  ITA: { id: 'ITA', name: 'Italia', flag: '🇮🇹', groupCode: 'F' }
};

// Top matches of the 2026 World Cup Group Stage
export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: INITIAL_TEAMS.MEX,
    awayTeam: INITIAL_TEAMS.ARG,
    date: '11 de Junio, 2026',
    time: '18:00',
    groupName: 'Grupo A',
    venue: 'Estadio Azteca, CDMX',
    homeScore: 1,
    awayScore: 2,
    isMatchFinished: true // Pre-finished so there are instant points on startup!
  },
  {
    id: 'm2',
    homeTeam: INITIAL_TEAMS.USA,
    awayTeam: INITIAL_TEAMS.ENG,
    date: '12 de Junio, 2026',
    time: '20:00',
    groupName: 'Grupo B',
    venue: 'SoFi Stadium, Los Ángeles',
    homeScore: null,
    awayScore: null,
    isMatchFinished: false
  },
  {
    id: 'm3',
    homeTeam: INITIAL_TEAMS.CAN,
    awayTeam: INITIAL_TEAMS.JPN,
    date: '13 de Junio, 2026',
    time: '15:00',
    groupName: 'Grupo C',
    venue: 'BC Place, Vancouver',
    homeScore: null,
    awayScore: null,
    isMatchFinished: false
  },
  {
    id: 'm4',
    homeTeam: INITIAL_TEAMS.FRA,
    awayTeam: INITIAL_TEAMS.GER,
    date: '14 de Junio, 2026',
    time: '19:00',
    groupName: 'Grupo D',
    venue: 'MetLife Stadium, Nueva York/Nueva Jersey',
    homeScore: 2,
    awayScore: 2,
    isMatchFinished: true // Pre-finished
  },
  {
    id: 'm5',
    homeTeam: INITIAL_TEAMS.BRA,
    awayTeam: INITIAL_TEAMS.MAR,
    date: '15 de Junio, 2026',
    time: '17:00',
    groupName: 'Grupo E',
    venue: 'Hard Rock Stadium, Miami',
    homeScore: null,
    awayScore: null,
    isMatchFinished: false
  },
  {
    id: 'm6',
    homeTeam: INITIAL_TEAMS.ESP,
    awayTeam: INITIAL_TEAMS.ITA,
    date: '16 de Junio, 2026',
    time: '21:00',
    groupName: 'Grupo F',
    venue: 'Mercedes-Benz Stadium, Atlanta',
    homeScore: null,
    awayScore: null,
    isMatchFinished: false
  },
  {
    id: 'm7',
    homeTeam: INITIAL_TEAMS.JPN,
    awayTeam: INITIAL_TEAMS.CAN,
    date: '18 de Junio, 2026',
    time: '16:00',
    groupName: 'Grupo C',
    venue: 'Gillette Stadium, Boston',
    homeScore: null,
    awayScore: null,
    isMatchFinished: false
  },
  {
    id: 'm8',
    homeTeam: INITIAL_TEAMS.MAR,
    awayTeam: INITIAL_TEAMS.BRA,
    date: '20 de Junio, 2026',
    time: '20:00',
    groupName: 'Grupo E',
    venue: 'NRG Stadium, Houston',
    homeScore: null,
    awayScore: null,
    isMatchFinished: false
  }
];

// Helper to calculate score points based on exact math or general prediction
export function calculateScore(prediction: Prediction | undefined, match: Match): ScoreReport {
  if (!match.isMatchFinished || match.homeScore === null || match.awayScore === null || match.homeScore === undefined || match.awayScore === undefined) {
    return { points: 0, type: 'none' };
  }
  
  if (!prediction) {
    return { points: 0, type: 'none' };
  }

  const actHome = match.homeScore;
  const actAway = match.awayScore;
  const predHome = prediction.homeScore;
  const predAway = prediction.awayScore;

  // Exact Match Rule (3 Points)
  if (actHome === predHome && actAway === predAway) {
    return { points: 3, type: 'exact' };
  }

  // Outcome Match Rule (1 Point for winner/draw correctly predicted)
  const actualOutcome = actHome > actAway ? 'home' : actHome < actAway ? 'away' : 'draw';
  const predictedOutcome = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';

  if (actualOutcome === predictedOutcome) {
    return { points: 1, type: 'outcome' };
  }

  return { points: 0, type: 'none' };
}

// Default initial users (exactly 20 friends as requested)
export const INITIAL_USERS: User[] = [
  {
    id: 'u-osman',
    name: 'Osman (Tú)',
    avatar: '😎',
    isAdmin: true,
    groupIds: ['g-oficina', 'g-futboleros']
  },
  {
    id: 'u-diego',
    name: 'Diego',
    avatar: '⚽',
    groupIds: ['g-oficina', 'g-futboleros']
  },
  {
    id: 'u-maria',
    name: 'María Belén',
    avatar: '👩‍💻',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-carlos',
    name: 'Carlos Alberto',
    avatar: '🦁',
    groupIds: ['g-futboleros', 'g-oficina']
  },
  {
    id: 'u-sofia',
    name: 'Sofía',
    avatar: '🌟',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-alejandro',
    name: 'Alejandro',
    avatar: '🔥',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-valentina',
    name: 'Valentina',
    avatar: '🍕',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-javier',
    name: 'Javier',
    avatar: '🧠',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-camila',
    name: 'Camila',
    avatar: '🚀',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-mateo',
    name: 'Mateo',
    avatar: '👟',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-lucia',
    name: 'Lucía',
    avatar: '🦊',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-andres',
    name: 'Andrés',
    avatar: '🏃‍♂️',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-mariana',
    name: 'Mariana',
    avatar: '🎨',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-sebastian',
    name: 'Sebastián',
    avatar: '🏆',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-gabriela',
    name: 'Gabriela',
    avatar: '🍿',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-nicolas',
    name: 'Nicolás',
    avatar: '🧙‍♂️',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-isabella',
    name: 'Isabella',
    avatar: '🎸',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-juanpablo',
    name: 'Juan Pablo',
    avatar: '🎮',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-daniela',
    name: 'Daniela',
    avatar: '🦄',
    groupIds: ['g-oficina']
  },
  {
    id: 'u-fernando',
    name: 'Fernando',
    avatar: '🧉',
    groupIds: ['g-oficina']
  }
];

// Seeded predictions for friends to show real live leaderboards immediately
export const INITIAL_PREDICTIONS: Record<string, Record<string, Prediction>> = {
  'u-osman': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm2': { matchId: 'm2', homeScore: 1, awayScore: 1, createdAt: new Date().toISOString() },
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 1, createdAt: new Date().toISOString() }, // Wrong (0pts)
  },
  'u-diego': {
    'm1': { matchId: 'm1', homeScore: 0, awayScore: 2, createdAt: new Date().toISOString() }, // Outcome Match (1pt - Argentina wins)
    'm2': { matchId: 'm2', homeScore: 2, awayScore: 1, createdAt: new Date().toISOString() },
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-maria': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm4': { matchId: 'm4', homeScore: 1, awayScore: 1, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
  },
  'u-carlos': {
    'm1': { matchId: 'm1', homeScore: 3, awayScore: 0, createdAt: new Date().toISOString() }, // Wrong (0pts)
    'm4': { matchId: 'm4', homeScore: 0, awayScore: 2, createdAt: new Date().toISOString() }, // Wrong (0pts)
  },
  'u-sofia': {
    'm1': { matchId: 'm1', homeScore: 0, awayScore: 1, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-alejandro': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-valentina': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 1, createdAt: new Date().toISOString() }, // Wrong (0pts)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-javier': {
    'm1': { matchId: 'm1', homeScore: 0, awayScore: 2, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
    'm4': { matchId: 'm4', homeScore: 0, awayScore: 0, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
  },
  'u-camila': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 3, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
    'm4': { matchId: 'm4', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Wrong (0pts)
  },
  'u-mateo': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm4': { matchId: 'm4', homeScore: 3, awayScore: 3, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
  },
  'u-lucia': {
    'm1': { matchId: 'm1', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Wrong (0pts)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-andres': {
    'm1': { matchId: 'm1', homeScore: 0, awayScore: 3, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-mariana': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 1, createdAt: new Date().toISOString() }, // Wrong (0pts)
    'm4': { matchId: 'm4', homeScore: 1, awayScore: 1, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
  },
  'u-sebastian': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm4': { matchId: 'm4', homeScore: 1, awayScore: 3, createdAt: new Date().toISOString() }, // Wrong (0pts)
  },
  'u-gabriela': {
    'm1': { matchId: 'm1', homeScore: 0, awayScore: 2, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 1, createdAt: new Date().toISOString() }, // Wrong (0pts)
  },
  'u-nicolas': {
    'm1': { matchId: 'm1', homeScore: 2, awayScore: 1, createdAt: new Date().toISOString() }, // Wrong (0pts)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-isabella': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm4': { matchId: 'm4', homeScore: 0, awayScore: 0, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
  },
  'u-juanpablo': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 0, createdAt: new Date().toISOString() }, // Wrong (0pts)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  },
  'u-daniela': {
    'm1': { matchId: 'm1', homeScore: 0, awayScore: 2, createdAt: new Date().toISOString() }, // Outcome Match (1pt)
    'm4': { matchId: 'm4', homeScore: 3, awayScore: 1, createdAt: new Date().toISOString() }, // Wrong (0pts)
  },
  'u-fernando': {
    'm1': { matchId: 'm1', homeScore: 1, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
    'm4': { matchId: 'm4', homeScore: 2, awayScore: 2, createdAt: new Date().toISOString() }, // Exact Match (3pts)
  }
};

// Default groups
export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g-oficina',
    name: 'Polla de la Oficina 💼',
    code: 'MUNDIAL-OFI-2026',
    description: 'Quiniela oficial del equipo de trabajo. ¡El que pierda paga los almuerzos de la final!',
    creatorId: 'u-osman'
  },
  {
    id: 'g-futboleros',
    name: 'Los Verdaderos Futboleros ⚽🔥',
    code: 'ASTUDIO-CRACKS',
    description: 'Solo para conocedores expertos del deporte rey. Máxima tensión.',
    creatorId: 'u-diego'
  }
];

// Avatars options for creation
export const AVATAR_OPTIONS = ['😎', '⚽', '🏆', '🏃‍♂️', '🌟', '🍿', '🔥', '🧠', '🧙‍♂️', '🦁', '🦊', '🚀', '🎨', '🍕'];
