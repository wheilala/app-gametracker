const defaultRoster = [
  { id: "boden", name: "Boden" },
  { id: "brady", name: "Brady" },
  { id: "indy", name: "Indy" },
  { id: "jack", name: "Jack" },
  { id: "james", name: "James" },
  { id: "luca", name: "Luca" },
  { id: "mathias", name: "Mathias" },
  { id: "nicholas", name: "Nicholas" },
  { id: "ryan-p", name: "Ryan P" },
  { id: "ryan-m", name: "Ryan M" },
  { id: "tommy", name: "Tommy" },
  { id: "vaughn", name: "Vaughn" },
  { id: "wes-h", name: "Wes H" },
  { id: "weston", name: "Weston" }
];

let roster = [...defaultRoster];
const defaultStartingLineup = defaultRoster.slice(0, 11).map((player) => player.id);
const gameFormats = {
  "7v7": 7,
  "9v9": 9,
  "11v11": 11
};
const defaultPresence = defaultRoster.reduce((presence, player) => {
  presence[player.id] = true;
  return presence;
}, {});

const observations = {
  positive: [
    "Good touch",
    "Talked",
    "Great pass",
    "Calm decision",
    "Scanned",
    "Simple play",
    "Won ball",
    "Smart run",
    "Covered teammate",
    "Created chance"
  ],
  negative: [
    "Turnover",
    "Poor touch",
    "Forced pass",
    "Didn't scan",
    "Held too long",
    "Ball watching",
    "Late recovery",
    "Lost mark",
    "Poor spacing",
    "Slow decision"
  ]
};

const teamObservations = {
  positive: [
    "Kept shape",
    "Pressed together",
    "Good spacing",
    "Switched field",
    "Recovered together",
    "Supported ball",
    "Created overload",
    "Stayed composed"
  ],
  negative: [
    "Lost shape",
    "Too stretched",
    "No pressure",
    "Poor spacing",
    "Slow transition",
    "Forced play",
    "Didn't communicate",
    "Failed to recover"
  ]
};

const goalTypes = [
  "Corner",
  "Restart",
  "PK",
  "Fast break",
  "Crossed ball",
  "Build up"
];

const goalQualityTags = [
  "Borderline lucky",
  "Brave",
  "Amazing",
  "Preventable"
];

const STORAGE_KEY = "rtsc-game-tracker-v1";
const SUPABASE_CONFIG = window.GAME_TRACKER_SUPABASE || {};
const supabaseClient = window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

const state = {
  selectedPlayer: null,
  goalDraft: null,
  subDraft: null,
  period: "pre",
  running: false,
  elapsedBeforeStart: 0,
  startedAt: 0,
  halftimeRunning: false,
  halftimeElapsedBeforeStart: 0,
  halftimeStartedAt: 0,
  gameFormat: "11v11",
  trackPlayingTime: false,
  roster: [...defaultRoster],
  presence: { ...defaultPresence },
  startingLineup: [...defaultStartingLineup],
  initialOnField: [],
  onField: [],
  stagedSubs: [],
  subEvents: [],
  entries: [],
  goals: []
};

const accountState = {
  session: null,
  user: null,
  profile: null,
  teams: [],
  selectedTeamId: null,
  playersByTeam: new Map(),
  loading: false,
  message: supabaseClient ? "" : "Local only: add Supabase config to save teams online.",
  onboardingDismissed: false
};

const clockStatus = document.querySelector("#clockStatus");
const clockReadout = document.querySelector("#clockReadout");
const halftimeReadout = document.querySelector("#halftimeReadout");
const clockToggle = document.querySelector("#clockToggle");
const pauseClockButton = document.querySelector("#pauseClockButton");
const halftimeButton = document.querySelector("#halftimeButton");
const finalWhistleButton = document.querySelector("#finalWhistleButton");
const resetClock = document.querySelector("#resetClock");
const undoStrip = document.querySelector("#undoStrip");
const undoContext = document.querySelector("#undoContext");
const undoLast = document.querySelector("#undoLast");
const playerGrid = document.querySelector("#playerGrid");
const observationPanel = document.querySelector("#observationPanel");
const observationGroups = document.querySelector("#observationGroups");
const selectedPlayerName = document.querySelector("#selectedPlayerName");
const panelTitle = document.querySelector("#panelTitle");
const modeEyebrow = document.querySelector("#modeEyebrow");
const cancelObservation = document.querySelector("#cancelObservation");
const tallyButton = document.querySelector("#tallyButton");
const installButton = document.querySelector("#installButton");
const newGameButton = document.querySelector("#newGameButton");
const authButton = document.querySelector("#authButton");
const teamsButton = document.querySelector("#teamsButton");
const accountStrip = document.querySelector("#accountStrip");
const onboardingStrip = document.querySelector("#onboardingStrip");
const onboardingText = document.querySelector("#onboardingText");
const onboardingAction = document.querySelector("#onboardingAction");
const onboardingLater = document.querySelector("#onboardingLater");
const rosterButton = document.querySelector("#rosterButton");
const subsButton = document.querySelector("#subsButton");
const subStrip = document.querySelector("#subStrip");
const subContext = document.querySelector("#subContext");
const subsMadeButton = document.querySelector("#subsMadeButton");
const rosterSheet = document.querySelector("#rosterSheet");
const closeRoster = document.querySelector("#closeRoster");
const rosterSummary = document.querySelector("#rosterSummary");
const addPlayerForm = document.querySelector("#addPlayerForm");
const newPlayerName = document.querySelector("#newPlayerName");
const rosterList = document.querySelector("#rosterList");
const authSheet = document.querySelector("#authSheet");
const closeAuth = document.querySelector("#closeAuth");
const authStatus = document.querySelector("#authStatus");
const emailSignInForm = document.querySelector("#emailSignInForm");
const authEmail = document.querySelector("#authEmail");
const googleSignIn = document.querySelector("#googleSignIn");
const signOutButton = document.querySelector("#signOutButton");
const teamsSheet = document.querySelector("#teamsSheet");
const closeTeams = document.querySelector("#closeTeams");
const teamsStatus = document.querySelector("#teamsStatus");
const teamForm = document.querySelector("#teamForm");
const teamName = document.querySelector("#teamName");
const teamAge = document.querySelector("#teamAge");
const teamFormat = document.querySelector("#teamFormat");
const saveTeamButton = document.querySelector("#saveTeamButton");
const teamsList = document.querySelector("#teamsList");
const openTeamRoster = document.querySelector("#openTeamRoster");
const subSheet = document.querySelector("#subSheet");
const closeSubs = document.querySelector("#closeSubs");
const subStepLabel = document.querySelector("#subStepLabel");
const subTitle = document.querySelector("#subTitle");
const subContextSheet = document.querySelector("#subContextSheet");
const subStagedList = document.querySelector("#subStagedList");
const subOptions = document.querySelector("#subOptions");
const commitSubsSheet = document.querySelector("#commitSubsSheet");
const goalButton = document.querySelector("#goalButton");
const goalSheet = document.querySelector("#goalSheet");
const closeGoal = document.querySelector("#closeGoal");
const goalStepLabel = document.querySelector("#goalStepLabel");
const goalTitle = document.querySelector("#goalTitle");
const goalContext = document.querySelector("#goalContext");
const goalOptions = document.querySelector("#goalOptions");
const finishGoal = document.querySelector("#finishGoal");
const closeTally = document.querySelector("#closeTally");
const tallySheet = document.querySelector("#tallySheet");
const tallyList = document.querySelector("#tallyList");
const summaryStrip = document.querySelector("#summaryStrip");
const copyGameLog = document.querySelector("#copyGameLog");
const clearGame = document.querySelector("#clearGame");
const resetSheet = document.querySelector("#resetSheet");
const resetClearLog = document.querySelector("#resetClearLog");
const resetKeepLog = document.querySelector("#resetKeepLog");
const cancelReset = document.querySelector("#cancelReset");
const setupSheet = document.querySelector("#setupSheet");
const closeSetup = document.querySelector("#closeSetup");
const setupStepLabel = document.querySelector("#setupStepLabel");
const setupTitle = document.querySelector("#setupTitle");
const setupProgress = document.querySelector("#setupProgress");
const setupCopy = document.querySelector("#setupCopy");
const setupBody = document.querySelector("#setupBody");
const setupBack = document.querySelector("#setupBack");
const setupNext = document.querySelector("#setupNext");
const setupStart = document.querySelector("#setupStart");

let ticker = null;
let setupStep = 0;
let deferredInstallPrompt = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isServerMode() {
  return Boolean(supabaseClient && accountState.user);
}

function setAccountMessage(message) {
  accountState.message = message || "";
  renderAccountStatus();
}

function getSelectedTeam() {
  return accountState.teams.find((team) => team.id === accountState.selectedTeamId) || null;
}

function mapServerPlayer(player) {
  return {
    id: `server-${player.id}`,
    serverId: player.id,
    name: player.name,
    active: player.active !== false
  };
}

function getServerIdFromPlayerId(playerId) {
  const player = roster.find((item) => item.id === playerId);
  return player && player.serverId ? player.serverId : null;
}

function applyTeamRoster(team, players) {
  if (!team) {
    roster = [...defaultRoster];
    state.roster = roster;
    state.gameFormat = "11v11";
    state.presence = normalizePresence({});
    state.startingLineup = defaultStartingLineup.filter((id) => roster.some((player) => player.id === id));
    return;
  }

  const activePlayers = [...players]
    .filter((player) => player.active !== false)
    .sort((left, right) => (left.sort_order || 0) - (right.sort_order || 0) || left.name.localeCompare(right.name))
    .map(mapServerPlayer);
  roster = activePlayers.length ? activePlayers : [];
  state.roster = roster;
  state.gameFormat = gameFormats[team.game_format] ? team.game_format : state.gameFormat;
  state.presence = normalizePresence({});
  state.startingLineup = roster.slice(0, gameFormats[state.gameFormat] || 11).map((player) => player.id);
  state.initialOnField = [];
  state.onField = [];
  state.stagedSubs = [];
  saveGame();
}

function selectedTeamPlayerCount() {
  const players = accountState.playersByTeam.get(accountState.selectedTeamId) || [];
  return players.filter((player) => player.active !== false).length;
}

function saveGame() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    running: state.running,
    period: state.period,
    elapsedBeforeStart: state.elapsedBeforeStart,
    startedAt: state.startedAt,
    halftimeRunning: state.halftimeRunning,
    halftimeElapsedBeforeStart: state.halftimeElapsedBeforeStart,
    halftimeStartedAt: state.halftimeStartedAt,
    gameFormat: state.gameFormat,
    trackPlayingTime: state.trackPlayingTime,
    roster: state.roster,
    presence: state.presence,
    startingLineup: state.startingLineup,
    initialOnField: state.initialOnField,
    onField: state.onField,
    stagedSubs: state.stagedSubs,
    subEvents: state.subEvents,
    entries: state.entries,
    goals: state.goals
  }));
}

function loadGame() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    state.running = Boolean(parsed.running);
    state.period = parsed.period || (state.running ? "first" : "pre");
    state.elapsedBeforeStart = Number(parsed.elapsedBeforeStart) || 0;
    state.startedAt = Number(parsed.startedAt) || 0;
    state.halftimeRunning = Boolean(parsed.halftimeRunning);
    state.halftimeElapsedBeforeStart = Number(parsed.halftimeElapsedBeforeStart) || 0;
    state.halftimeStartedAt = Number(parsed.halftimeStartedAt) || 0;
    state.gameFormat = gameFormats[parsed.gameFormat] ? parsed.gameFormat : "11v11";
    state.trackPlayingTime = Boolean(parsed.trackPlayingTime);
    state.roster = normalizeRoster(parsed.roster);
    roster = state.roster;
    state.presence = normalizePresence(parsed.presence);
    state.startingLineup = normalizePlayerIds(parsed.startingLineup, defaultStartingLineup);
    state.initialOnField = normalizePlayerIds(parsed.initialOnField, []);
    state.onField = normalizePlayerIds(parsed.onField, []);
    state.stagedSubs = Array.isArray(parsed.stagedSubs) ? parsed.stagedSubs.filter(isValidSubPair) : [];
    state.subEvents = Array.isArray(parsed.subEvents) ? parsed.subEvents.filter((event) => Array.isArray(event.subs)) : [];
    state.entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    state.goals = Array.isArray(parsed.goals) ? parsed.goals : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function makePlayerId(name) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "player";
  let id = base;
  let counter = 2;

  while (roster.some((player) => player.id === id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }

  return id;
}

function normalizeRoster(savedRoster) {
  if (!Array.isArray(savedRoster)) {
    return [...defaultRoster];
  }

  const seen = new Set();
  const cleaned = savedRoster
    .map((player) => ({
      id: String(player.id || "").trim(),
      name: String(player.name || "").trim()
    }))
    .filter((player) => player.name)
    .map((player) => {
      let id = player.id || player.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!id || seen.has(id)) {
        id = `${id || "player"}-${seen.size + 1}`;
      }
      seen.add(id);
      return { id, name: player.name };
    });

  return cleaned.length ? cleaned : [...defaultRoster];
}

function normalizePresence(savedPresence) {
  return roster.reduce((presence, player) => {
    presence[player.id] = savedPresence && typeof savedPresence[player.id] === "boolean"
      ? savedPresence[player.id]
      : true;
    return presence;
  }, {});
}

function normalizePlayerIds(savedIds, fallback) {
  const ids = Array.isArray(savedIds) ? savedIds : fallback;
  const validIds = ids.filter((id) => roster.some((player) => player.id === id));
  return [...new Set(validIds)];
}

async function getSession() {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session || null;
}

async function ensureProfile(user) {
  if (!supabaseClient || !user) {
    return null;
  }

  const email = user.email || "";
  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert({ id: user.id, email }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function signInWithEmail(email) {
  if (!supabaseClient) {
    setAccountMessage("Add Supabase config before signing in.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.href.split("#")[0]
    }
  });

  if (error) {
    throw error;
  }

  setAccountMessage("Check your email for a sign-in link.");
}

async function signInWithGoogle() {
  if (!supabaseClient) {
    setAccountMessage("Add Supabase config before signing in.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.href.split("#")[0]
    }
  });

  if (error) {
    throw error;
  }
}

async function signOut() {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    throw error;
  }
}

async function loadTeams() {
  if (!isServerMode()) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("teams")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

async function loadPlayers(teamId) {
  if (!isServerMode() || !teamId) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  accountState.playersByTeam.set(teamId, data || []);
  return data || [];
}

async function createTeam(team) {
  if (!isServerMode()) {
    throw new Error("Sign in before creating teams.");
  }

  const { data, error } = await supabaseClient
    .from("teams")
    .insert({
      user_id: accountState.user.id,
      name: team.name,
      age_group: team.age_group || null,
      game_format: team.game_format || "11v11"
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function updateTeam(team) {
  if (!isServerMode()) {
    throw new Error("Sign in before editing teams.");
  }

  const { data, error } = await supabaseClient
    .from("teams")
    .update({
      name: team.name,
      age_group: team.age_group || null,
      game_format: team.game_format || "11v11"
    })
    .eq("id", team.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function deleteTeam(teamId) {
  if (!isServerMode()) {
    throw new Error("Sign in before deleting teams.");
  }

  const { error } = await supabaseClient
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) {
    throw error;
  }
}

async function savePlayer(player) {
  if (!isServerMode() || !accountState.selectedTeamId) {
    return null;
  }

  const payload = {
    team_id: accountState.selectedTeamId,
    name: player.name,
    sort_order: player.sort_order ?? roster.length,
    active: player.active !== false
  };

  if (player.serverId) {
    const { data, error } = await supabaseClient
      .from("players")
      .update(payload)
      .eq("id", player.serverId)
      .select("*")
      .single();
    if (error) {
      throw error;
    }
    return data;
  }

  const { data, error } = await supabaseClient
    .from("players")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function deletePlayer(playerId) {
  const serverId = getServerIdFromPlayerId(playerId);
  if (!isServerMode() || !serverId) {
    return;
  }

  const { error } = await supabaseClient
    .from("players")
    .update({ active: false })
    .eq("id", serverId);

  if (error) {
    throw error;
  }
}

async function setSelectedTeam(teamId) {
  accountState.selectedTeamId = teamId || null;

  if (isServerMode() && accountState.profile) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update({ selected_team_id: accountState.selectedTeamId })
      .eq("id", accountState.user.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    accountState.profile = data;
  }

  const team = getSelectedTeam();
  const players = team ? await loadPlayers(team.id) : [];
  applyTeamRoster(team, players);
  renderAccountStatus();
  renderTeamsSheet();
  renderRosterSheet();
  renderSubStrip();
  showRoster();
}

async function refreshAccountData() {
  if (!isServerMode()) {
    return;
  }

  accountState.loading = true;
  renderAccountStatus();

  try {
    accountState.profile = await ensureProfile(accountState.user);
    accountState.onboardingDismissed = Boolean(accountState.profile.onboarding_dismissed);
    accountState.teams = await loadTeams();
    await Promise.all(accountState.teams.map((team) => loadPlayers(team.id)));
    const preferredTeamId = accountState.profile.selected_team_id;
    const selected = accountState.teams.find((team) => team.id === preferredTeamId) || accountState.teams[0] || null;
    accountState.selectedTeamId = selected ? selected.id : null;

    if (selected) {
      const players = accountState.playersByTeam.get(selected.id) || [];
      applyTeamRoster(selected, players);
    }

    accountState.message = "";
  } catch (error) {
    accountState.message = error.message || "Could not load account data.";
  } finally {
    accountState.loading = false;
    renderAccountStatus();
    renderTeamsSheet();
    renderRosterSheet();
    showRoster();
  }
}

async function initializeAccount() {
  if (!supabaseClient) {
    renderAccountStatus();
    return;
  }

  try {
    const session = await getSession();
    accountState.session = session;
    accountState.user = session ? session.user : null;
    await refreshAccountData();
  } catch (error) {
    accountState.message = error.message || "Could not initialize account.";
    renderAccountStatus();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    accountState.session = session;
    accountState.user = session ? session.user : null;
    accountState.profile = null;
    accountState.teams = [];
    accountState.playersByTeam.clear();
    accountState.selectedTeamId = null;

    if (accountState.user) {
      await refreshAccountData();
    } else {
      roster = [...defaultRoster];
      state.roster = roster;
      state.presence = normalizePresence({});
      state.startingLineup = defaultStartingLineup.filter((id) => roster.some((player) => player.id === id));
      accountState.message = supabaseClient ? "Signed out. Using local roster." : accountState.message;
      saveGame();
      renderAccountStatus();
      renderTeamsSheet();
      showRoster();
    }
  });
}

function isValidSubPair(pair) {
  return pair
    && roster.some((player) => player.id === pair.outId)
    && roster.some((player) => player.id === pair.inId)
    && pair.outId !== pair.inId;
}

function getPlayerName(playerId) {
  const player = roster.find((item) => item.id === playerId);
  return player ? player.name : playerId;
}

function getPlayerIdByName(name) {
  const player = roster.find((item) => item.name === name);
  return player ? player.id : name;
}

function isPresent(playerId) {
  return state.presence[playerId] !== false;
}

function getPresentRoster() {
  return roster.filter((player) => isPresent(player.id));
}

function getPresentPlayerNames() {
  return getPresentRoster().map((player) => player.name);
}

function ensureLineupReady() {
  if (!state.trackPlayingTime) {
    state.onField = [];
    state.initialOnField = [];
    state.stagedSubs = [];
    return;
  }

  const presentStarters = state.startingLineup.filter((id) => isPresent(id));
  const requiredStarters = gameFormats[state.gameFormat] || 11;

  if (!state.onField.length) {
    state.onField = presentStarters.slice(0, requiredStarters);
  } else {
    state.onField = state.onField.filter((id) => isPresent(id));
  }
}

function getElapsedMs() {
  if (!state.running) {
    return state.elapsedBeforeStart;
  }

  return state.elapsedBeforeStart + Date.now() - state.startedAt;
}

function getHalftimeElapsedMs() {
  if (!state.halftimeRunning) {
    return state.halftimeElapsedBeforeStart;
  }

  return state.halftimeElapsedBeforeStart + Date.now() - state.halftimeStartedAt;
}

function formatClock(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderClock() {
  clockReadout.textContent = formatClock(getElapsedMs());
  halftimeReadout.textContent = `Halftime ${formatClock(getHalftimeElapsedMs())}`;
  halftimeReadout.classList.toggle("hidden", state.period !== "halftime");
  halftimeButton.classList.toggle("hidden", state.period !== "first" || !state.running);
  finalWhistleButton.classList.toggle("hidden", state.period !== "second" || !state.running);
  pauseClockButton.classList.toggle("hidden", !state.running || state.period === "final");

  if (state.period === "pre") {
    clockStatus.textContent = "Ready";
    clockToggle.textContent = "Start";
    clockToggle.classList.remove("hidden");
  } else if (state.period === "first") {
    clockStatus.textContent = state.running ? "1st half running" : "1st half paused";
    clockToggle.textContent = state.running ? "Running" : "Resume";
    clockToggle.classList.toggle("hidden", state.running);
  } else if (state.period === "halftime") {
    clockStatus.textContent = "Halftime";
    clockToggle.textContent = "Start 2nd half";
    clockToggle.classList.remove("hidden");
  } else if (state.period === "final") {
    clockStatus.textContent = "Final";
    clockToggle.textContent = "Final";
    clockToggle.classList.add("hidden");
  } else {
    clockStatus.textContent = state.running ? "2nd half running" : "2nd half paused";
    clockToggle.textContent = state.running ? "Running" : "Resume";
    clockToggle.classList.toggle("hidden", state.running);
  }
}

function getLastObservation() {
  return state.entries[state.entries.length - 1] || null;
}

function renderUndo() {
  const last = getLastObservation();

  if (!last) {
    undoStrip.classList.add("hidden");
    undoContext.textContent = "";
    return;
  }

  undoContext.textContent = `${last.player} | ${last.observation} | ${formatClock(last.elapsedMs)}`;
  undoStrip.classList.remove("hidden");
}

function startClock() {
  if (state.period === "final") {
    return;
  }

  if (state.period === "pre") {
    state.period = "first";
  }

  if (state.period === "halftime") {
    startSecondHalf();
    return;
  }

  ensureLineupReady();
  if (!state.initialOnField.length) {
    state.initialOnField = [...state.onField];
  }
  state.running = true;
  state.startedAt = Date.now();
  ensureTicker();
  renderClock();
  renderSubStrip();
  saveGame();
}

function finalWhistle() {
  if (state.period !== "second") {
    return;
  }

  state.elapsedBeforeStart = getElapsedMs();
  state.running = false;
  state.period = "final";
  state.stagedSubs = [];
  window.clearInterval(ticker);
  ticker = null;
  renderClock();
  renderSubStrip();
  saveGame();
}

function pauseClock() {
  state.elapsedBeforeStart = getElapsedMs();
  state.running = false;
  window.clearInterval(ticker);
  ticker = null;
  renderClock();
  saveGame();
}

function resetClockOnly() {
  state.running = false;
  state.period = "pre";
  state.elapsedBeforeStart = 0;
  state.startedAt = 0;
  state.halftimeRunning = false;
  state.halftimeElapsedBeforeStart = 0;
  state.halftimeStartedAt = 0;
  state.subDraft = null;
  state.stagedSubs = [];
  state.initialOnField = [];
  state.onField = [];
  window.clearInterval(ticker);
  ticker = null;
  renderClock();
  renderSubStrip();
  saveGame();
}

function clearLogOnly() {
  state.entries = [];
  state.goals = [];
  state.subEvents = [];
  saveGame();
  showRoster();
  renderSubStrip();

  if (!tallySheet.classList.contains("hidden")) {
    renderTally();
  }
}

function ensureTicker() {
  if (!ticker) {
    ticker = window.setInterval(renderClock, 250);
  }
}

function startHalftime() {
  if (state.period !== "first") {
    return;
  }

  state.elapsedBeforeStart = getElapsedMs();
  state.running = false;
  state.period = "halftime";
  state.halftimeRunning = true;
  state.halftimeElapsedBeforeStart = 0;
  state.halftimeStartedAt = Date.now();
  ensureTicker();
  renderClock();
  saveGame();
}

function startSecondHalf() {
  state.halftimeElapsedBeforeStart = getHalftimeElapsedMs();
  state.halftimeRunning = false;
  state.period = "second";
  ensureLineupReady();
  if (!state.initialOnField.length) {
    state.initialOnField = [...state.onField];
  }
  state.running = true;
  state.startedAt = Date.now();
  ensureTicker();
  renderClock();
  renderSubStrip();
  saveGame();
}

function openResetSheet() {
  resetSheet.classList.remove("hidden");
  resetSheet.setAttribute("aria-hidden", "false");
}

function closeResetSheet() {
  resetSheet.classList.add("hidden");
  resetSheet.setAttribute("aria-hidden", "true");
}

function resetAndClearLog() {
  resetClockOnly();
  state.entries = [];
  state.goals = [];
  state.subEvents = [];
  saveGame();
  showRoster();
  renderSubStrip();

  if (!tallySheet.classList.contains("hidden")) {
    renderTally();
  }

  closeResetSheet();
}

function resetAndKeepLog() {
  resetClockOnly();
  closeResetSheet();
}

function clearGameForNewSetup() {
  state.running = false;
  state.period = "pre";
  state.elapsedBeforeStart = 0;
  state.startedAt = 0;
  state.halftimeRunning = false;
  state.halftimeElapsedBeforeStart = 0;
  state.halftimeStartedAt = 0;
  state.subDraft = null;
  state.initialOnField = [];
  state.onField = [];
  state.stagedSubs = [];
  state.subEvents = [];
  state.entries = [];
  state.goals = [];
  window.clearInterval(ticker);
  ticker = null;
  closeTallySheet();
  closeGoalFlow();
  closeSubSheet();
  closeTeamsSheet();
  closeAuthSheet();
  closeRosterSheet();
  closeResetSheet();
  renderClock();
  renderSubStrip();
  showRoster();
  saveGame();
}

function playerEntryCount(player) {
  return state.entries.filter((entry) => entry.player === player).length;
}

function renderPlayers() {
  playerGrid.innerHTML = "";

  const teamRow = document.createElement("article");
  teamRow.className = "player-row team-row";
  teamRow.innerHTML = `
    <div class="player-row-info">
      <span class="player-name">Team <span class="player-count-inline">(${playerEntryCount("Team")})</span></span>
    </div>
    <div class="player-row-actions">
      <button class="quick-observation negative" data-player="Team" data-target="team" data-category="negative" type="button" aria-label="Negative team observation">-</button>
      <button class="quick-observation positive" data-player="Team" data-target="team" data-category="positive" type="button" aria-label="Positive team observation">+</button>
    </div>
  `;
  playerGrid.append(teamRow);

  const activeField = state.trackPlayingTime
    ? (state.onField.length ? state.onField : state.initialOnField)
    : [];
  const selectablePlayers = activeField.length
    ? roster.filter((player) => activeField.includes(player.id))
    : getPresentRoster();

  [...selectablePlayers]
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((player) => {
    const row = document.createElement("article");
    row.className = "player-row";
    const safeName = escapeHtml(player.name);
    row.innerHTML = `
      <div class="player-row-info">
        <span class="player-name">${safeName} <span class="player-count-inline">(${playerEntryCount(player.name)})</span></span>
      </div>
      <div class="player-row-actions">
        <button class="quick-observation negative" data-player="${safeName}" data-category="negative" type="button" aria-label="Negative observation for ${safeName}">-</button>
        <button class="quick-observation positive" data-player="${safeName}" data-category="positive" type="button" aria-label="Positive observation for ${safeName}">+</button>
      </div>
    `;
    playerGrid.append(row);
  });
}

function renderObservationButtons(source = observations) {
  observationGroups.innerHTML = "";

  Object.entries(source).forEach(([category, labels]) => {
    const group = document.createElement("section");
    group.className = "observation-group";
    group.dataset.category = category;

    const label = document.createElement("div");
    label.className = "group-label";
    label.textContent = category;

    const grid = document.createElement("div");
    grid.className = "observation-grid";

    labels.forEach((observation) => {
      const button = document.createElement("button");
      button.className = `observation-button ${category}`;
      button.type = "button";
      button.dataset.category = category;
      button.dataset.observation = observation;
      button.textContent = observation;
      grid.append(button);
    });

    group.append(label, grid);
    observationGroups.append(group);
  });
}

function renderRosterSheet() {
  const presentCount = roster.filter((player) => isPresent(player.id)).length;
  const starterCount = state.startingLineup.filter((id) => isPresent(id)).length;
  const onFieldCount = state.onField.length;
  const selectedTeam = getSelectedTeam();
  const rosterScope = selectedTeam ? escapeHtml(selectedTeam.name) : "Local roster";
  const lineupPill = state.trackPlayingTime
    ? `<span class="summary-pill">${starterCount}/${gameFormats[state.gameFormat] || 11} starters</span><span class="summary-pill">${onFieldCount} on field</span>`
    : '<span class="summary-pill">Observation-only</span>';

  rosterSummary.innerHTML = `
    <span class="summary-pill">${rosterScope}</span>
    <span class="summary-pill">${presentCount} present</span>
    <span class="summary-pill">${state.gameFormat}</span>
    ${lineupPill}
  `;

  rosterList.innerHTML = "";

  roster.forEach((player) => {
    const row = document.createElement("article");
    row.className = "roster-row";
    const present = isPresent(player.id);
    const starter = state.startingLineup.includes(player.id);
    const safeName = escapeHtml(player.name);

    row.innerHTML = `
      <div>
        <input class="roster-name-input" data-action="rename" data-player-id="${escapeHtml(player.id)}" value="${safeName}" aria-label="Player name">
        <div class="goal-detail">${state.trackPlayingTime ? (state.onField.includes(player.id) ? "On field" : "Bench / not in game") : "Available for observations"}</div>
      </div>
      <div class="roster-toggles">
        <button class="toggle-pill ${present ? "active" : ""}" data-action="presence" data-player-id="${escapeHtml(player.id)}" type="button">
          ${present ? "Present" : "Absent"}
        </button>
        <button class="toggle-pill ${starter ? "active" : ""} ${state.trackPlayingTime ? "" : "hidden"}" data-action="starter" data-player-id="${escapeHtml(player.id)}" type="button">
          Start
        </button>
        <button class="toggle-pill danger-toggle" data-action="remove" data-player-id="${escapeHtml(player.id)}" type="button">
          Remove
        </button>
      </div>
    `;

    rosterList.append(row);
  });
}

function renderAccountStatus() {
  const selectedTeam = getSelectedTeam();
  const email = accountState.user ? accountState.user.email : "";
  const teamText = selectedTeam ? `${selectedTeam.name} (${selectedTeam.game_format})` : "No team selected";
  const modeText = accountState.user
    ? `${email || "Signed in"} | ${teamText}`
    : "Local only | Sign in to save teams";
  accountStrip.innerHTML = `
    <div>
      <p class="eyebrow">${accountState.loading ? "Syncing" : "Account"}</p>
      <div class="undo-context">${escapeHtml(modeText)}</div>
      ${accountState.message ? `<div class="account-message">${escapeHtml(accountState.message)}</div>` : ""}
    </div>
    <div class="account-actions">
      <button class="undo-action" id="inlineAuthButton" type="button">${accountState.user ? "Account" : "Sign in"}</button>
      <button class="undo-action" id="inlineTeamsButton" type="button">Teams</button>
    </div>
  `;

  authButton.textContent = accountState.user ? "Account" : "Sign in";
  teamsButton.classList.toggle("hidden", !accountState.user);
  renderOnboardingNudge();
}

function renderOnboardingNudge() {
  if (!accountState.user || accountState.onboardingDismissed) {
    onboardingStrip.classList.add("hidden");
    return;
  }

  const selectedTeam = getSelectedTeam();
  let message = "";

  if (!accountState.teams.length) {
    message = "Create your first team so the roster follows you between devices.";
  } else if (!selectedTeam) {
    message = "Choose a team to use as your tracker roster.";
  } else if (selectedTeamPlayerCount() < 10) {
    message = `${selectedTeam.name} has ${selectedTeamPlayerCount()} players. Add at least 10 for a well formed roster.`;
  }

  if (!message) {
    onboardingStrip.classList.add("hidden");
    return;
  }

  onboardingText.textContent = message;
  onboardingStrip.classList.remove("hidden");
}

function openAuthSheet() {
  renderAuthSheet();
  authSheet.classList.remove("hidden");
  authSheet.setAttribute("aria-hidden", "false");
}

function closeAuthSheet() {
  authSheet.classList.add("hidden");
  authSheet.setAttribute("aria-hidden", "true");
}

function renderAuthSheet() {
  const configured = Boolean(supabaseClient);
  const signedIn = Boolean(accountState.user);
  authStatus.textContent = configured
    ? signedIn
      ? `Signed in as ${accountState.user.email || "coach"}`
      : "Email a sign-in link to save teams and rosters online."
    : "Supabase is not configured yet. The app will keep using local roster data.";
  emailSignInForm.classList.toggle("hidden", !configured || signedIn);
  googleSignIn.classList.toggle("hidden", !configured || signedIn || !SUPABASE_CONFIG.enableGoogle);
  signOutButton.classList.toggle("hidden", !signedIn);
}

function openTeamsSheet() {
  renderTeamsSheet();
  teamsSheet.classList.remove("hidden");
  teamsSheet.setAttribute("aria-hidden", "false");
}

function closeTeamsSheet() {
  teamsSheet.classList.add("hidden");
  teamsSheet.setAttribute("aria-hidden", "true");
}

function resetTeamForm(team = null) {
  teamForm.dataset.teamId = team ? team.id : "";
  teamName.value = team ? team.name : "";
  teamAge.value = team && team.age_group ? team.age_group : "";
  teamFormat.value = team && gameFormats[team.game_format] ? team.game_format : "11v11";
  saveTeamButton.textContent = team ? "Update team" : "Create team";
}

function renderTeamsSheet() {
  if (!teamsList || !teamsStatus) {
    return;
  }

  if (!accountState.user) {
    teamsStatus.textContent = "Sign in to manage server-backed teams.";
    teamsList.innerHTML = "";
    teamForm.classList.add("hidden");
    openTeamRoster.classList.add("hidden");
    return;
  }

  teamForm.classList.remove("hidden");
  openTeamRoster.classList.toggle("hidden", !accountState.selectedTeamId);
  teamsStatus.textContent = accountState.teams.length
    ? "Choose the active team or edit team details."
    : "Create your first team. You can add roster players next.";

  const selectedTeam = getSelectedTeam();
  if (selectedTeam && !teamForm.dataset.teamId) {
    resetTeamForm(selectedTeam);
  }

  teamsList.innerHTML = "";

  accountState.teams.forEach((team) => {
    const players = accountState.playersByTeam.get(team.id) || [];
    const activeCount = team.id === accountState.selectedTeamId ? selectedTeamPlayerCount() : players.filter((player) => player.active !== false).length;
    const row = document.createElement("article");
    row.className = `team-manage-row ${team.id === accountState.selectedTeamId ? "selected" : ""}`;
    row.innerHTML = `
      <div>
        <div class="stat-name">${escapeHtml(team.name)}</div>
        <div class="goal-detail">${escapeHtml(team.age_group || "No age group")} | ${escapeHtml(team.game_format)} | ${activeCount} players</div>
      </div>
      <div class="roster-toggles">
        <button class="toggle-pill ${team.id === accountState.selectedTeamId ? "active" : ""}" data-team-action="select" data-team-id="${escapeHtml(team.id)}" type="button">
          ${team.id === accountState.selectedTeamId ? "Active" : "Use"}
        </button>
        <button class="toggle-pill" data-team-action="edit" data-team-id="${escapeHtml(team.id)}" type="button">Edit</button>
        <button class="toggle-pill danger-toggle" data-team-action="delete" data-team-id="${escapeHtml(team.id)}" type="button">Delete</button>
      </div>
    `;
    teamsList.append(row);
  });

  if (!accountState.teams.length) {
    resetTeamForm();
    teamsList.innerHTML = '<div class="goal-detail">No teams yet.</div>';
  }
}

async function saveTeamFromForm() {
  const name = teamName.value.trim();
  if (!name) {
    teamsStatus.textContent = "Team name is required.";
    return;
  }

  const payload = {
    id: teamForm.dataset.teamId || null,
    name,
    age_group: teamAge.value.trim(),
    game_format: gameFormats[teamFormat.value] ? teamFormat.value : "11v11"
  };

  try {
    const saved = payload.id ? await updateTeam(payload) : await createTeam(payload);
    accountState.teams = await loadTeams();
    await setSelectedTeam(saved.id);
    resetTeamForm(saved);
    setAccountMessage(`Saved ${saved.name}.`);
  } catch (error) {
    teamsStatus.textContent = error.message || "Could not save team.";
  }
}

async function handleTeamListAction(button) {
  const teamId = button.dataset.teamId;
  const action = button.dataset.teamAction;
  const team = accountState.teams.find((item) => item.id === teamId);

  if (!team) {
    return;
  }

  if (action === "edit") {
    resetTeamForm(team);
    return;
  }

  try {
    if (action === "select") {
      await setSelectedTeam(teamId);
      resetTeamForm(team);
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(`Delete ${team.name}? This removes its roster from the server.`);
      if (!confirmed) {
        return;
      }

      await deleteTeam(teamId);
      accountState.teams = await loadTeams();
      accountState.selectedTeamId = null;
      resetTeamForm();
      const nextTeam = accountState.teams[0] || null;
      await setSelectedTeam(nextTeam ? nextTeam.id : null);
    }
  } catch (error) {
    teamsStatus.textContent = error.message || "Could not update team.";
  }
}

async function dismissOnboarding() {
  accountState.onboardingDismissed = true;
  onboardingStrip.classList.add("hidden");

  if (isServerMode() && accountState.profile) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update({ onboarding_dismissed: true })
      .eq("id", accountState.user.id)
      .select("*")
      .single();

    if (!error) {
      accountState.profile = data;
    }
  }
}

function openRosterSheet() {
  renderRosterSheet();
  rosterSheet.classList.remove("hidden");
  rosterSheet.setAttribute("aria-hidden", "false");
}

function closeRosterSheet() {
  rosterSheet.classList.add("hidden");
  rosterSheet.setAttribute("aria-hidden", "true");
}

function togglePresence(playerId) {
  state.presence[playerId] = !isPresent(playerId);

  if (!isPresent(playerId)) {
    state.onField = state.onField.filter((id) => id !== playerId);
    state.stagedSubs = state.stagedSubs.filter((pair) => pair.outId !== playerId && pair.inId !== playerId);
  }

  saveGame();
  renderRosterSheet();
  renderSubStrip();
  showRoster();
}

function toggleStarter(playerId) {
  if (state.startingLineup.includes(playerId)) {
    state.startingLineup = state.startingLineup.filter((id) => id !== playerId);
  } else {
    state.startingLineup.push(playerId);
  }

  saveGame();
  renderRosterSheet();
}

async function addRosterPlayer(name) {
  const playerName = name.trim();
  if (!playerName) {
    return;
  }

  let player = { id: makePlayerId(playerName), name: playerName };

  try {
    if (isServerMode() && accountState.selectedTeamId) {
      const saved = await savePlayer({ name: playerName, sort_order: roster.length });
      const players = await loadPlayers(accountState.selectedTeamId);
      applyTeamRoster(getSelectedTeam(), players);
      player = roster.find((item) => item.serverId === saved.id) || mapServerPlayer(saved);
    } else {
      roster.push(player);
      state.roster = roster;
    }
  } catch (error) {
    setAccountMessage(error.message || "Could not save player.");
    return;
  }

  state.presence[player.id] = true;
  saveGame();
  renderRosterSheet();
  renderTeamsSheet();
  showRoster();
}

async function renameRosterPlayer(playerId, name) {
  const player = roster.find((item) => item.id === playerId);
  const playerName = name.trim();
  if (!player || !playerName) {
    renderRosterSheet();
    return;
  }

  try {
    if (isServerMode() && player.serverId) {
      const saved = await savePlayer({ ...player, name: playerName });
      const players = await loadPlayers(accountState.selectedTeamId);
      applyTeamRoster(getSelectedTeam(), players);
      setAccountMessage(`Saved ${saved.name}.`);
    } else {
      player.name = playerName;
      state.roster = roster;
    }
  } catch (error) {
    setAccountMessage(error.message || "Could not rename player.");
    renderRosterSheet();
    return;
  }

  saveGame();
  renderRosterSheet();
  renderTeamsSheet();
  showRoster();
}

async function removeRosterPlayer(playerId) {
  const player = roster.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  const confirmed = window.confirm(`Remove ${player.name} from the roster? Existing observations by name will remain in the log.`);
  if (!confirmed) {
    return;
  }

  try {
    if (isServerMode() && player.serverId) {
      await deletePlayer(playerId);
      await loadPlayers(accountState.selectedTeamId);
    }
  } catch (error) {
    setAccountMessage(error.message || "Could not remove player.");
    return;
  }

  roster = roster.filter((item) => item.id !== playerId);
  state.roster = roster;
  delete state.presence[playerId];
  state.startingLineup = state.startingLineup.filter((id) => id !== playerId);
  state.initialOnField = state.initialOnField.filter((id) => id !== playerId);
  state.onField = state.onField.filter((id) => id !== playerId);
  state.stagedSubs = state.stagedSubs.filter((pair) => pair.outId !== playerId && pair.inId !== playerId);
  state.subEvents = state.subEvents
    .map((event) => ({
      ...event,
      subs: event.subs.filter((pair) => pair.outId !== playerId && pair.inId !== playerId)
    }))
    .filter((event) => event.subs.length);
  saveGame();
  renderRosterSheet();
  renderTeamsSheet();
  renderSubStrip();
  showRoster();
}

function setPresence(playerId, present) {
  state.presence[playerId] = present;

  if (!present) {
    state.onField = state.onField.filter((id) => id !== playerId);
    state.stagedSubs = state.stagedSubs.filter((pair) => pair.outId !== playerId && pair.inId !== playerId);
  }

  saveGame();
}

function setStarter(playerId, starter) {
  if (starter && !state.startingLineup.includes(playerId)) {
    state.startingLineup.push(playerId);
  }

  if (!starter) {
    state.startingLineup = state.startingLineup.filter((id) => id !== playerId);
  }

  saveGame();
}

function getBenchIds() {
  const stagedIn = state.stagedSubs.map((pair) => pair.inId);
  return getPresentRoster()
    .map((player) => player.id)
    .filter((id) => !state.onField.includes(id) && !stagedIn.includes(id));
}

function renderSubStrip() {
  subsButton.classList.toggle("hidden", !state.trackPlayingTime);

  if (!state.trackPlayingTime || !state.stagedSubs.length) {
    subStrip.classList.add("hidden");
    subContext.textContent = "";
    return;
  }

  subContext.textContent = state.stagedSubs
    .map((pair) => `${getPlayerName(pair.inId)} for ${getPlayerName(pair.outId)}`)
    .join(" | ");
  subStrip.classList.remove("hidden");
}

function openSubSheet() {
  if (!state.trackPlayingTime) {
    return;
  }

  if (state.period === "pre" && !state.running) {
    renderSubUnavailableStep();
  } else {
    state.subDraft = null;
    renderSubOutgoingStep();
  }

  subSheet.classList.remove("hidden");
  subSheet.setAttribute("aria-hidden", "false");
}

function closeSubSheet() {
  state.subDraft = null;
  subSheet.classList.add("hidden");
  subSheet.setAttribute("aria-hidden", "true");
}

function renderStagedSubs() {
  subStagedList.innerHTML = "";

  if (!state.stagedSubs.length) {
    subStagedList.innerHTML = '<div class="goal-detail">No staged subs yet</div>';
    commitSubsSheet.classList.add("hidden");
    return;
  }

  commitSubsSheet.classList.remove("hidden");

  state.stagedSubs.forEach((pair, index) => {
    const item = document.createElement("div");
    item.className = "staged-sub-item";
    item.innerHTML = `
      <span>${getPlayerName(pair.inId)} for ${getPlayerName(pair.outId)}</span>
      <button class="mini-remove" data-index="${index}" type="button" aria-label="Remove staged sub">x</button>
    `;
    subStagedList.append(item);
  });
}

function renderSubContext() {
  subContextSheet.textContent = `${state.onField.length} on field | ${getBenchIds().length} available`;
  renderStagedSubs();
  renderSubStrip();
}

function renderSubOptions(playerIds, onPick) {
  subOptions.innerHTML = "";

  playerIds.forEach((playerId) => {
    const button = document.createElement("button");
    button.className = "goal-option";
    button.type = "button";
    button.textContent = getPlayerName(playerId);
    button.addEventListener("click", () => onPick(playerId));
    subOptions.append(button);
  });

  if (!playerIds.length) {
    subOptions.innerHTML = '<div class="goal-detail">No eligible players for this step.</div>';
  }
}

function renderSubUnavailableStep() {
  subStepLabel.textContent = "Prep subs";
  subTitle.textContent = "Start the game clock first";
  subContextSheet.textContent = "Subs are staged against live game time.";
  subStagedList.innerHTML = "";
  subOptions.innerHTML = "";
  commitSubsSheet.classList.add("hidden");
}

function renderSubOutgoingStep() {
  ensureLineupReady();
  subStepLabel.textContent = "Prep subs";
  subTitle.textContent = "Who is coming off?";
  commitSubsSheet.textContent = "Subs made";
  renderSubContext();

  const stagedOut = state.stagedSubs.map((pair) => pair.outId);
  const outgoingIds = state.onField.filter((id) => !stagedOut.includes(id));
  renderSubOptions(outgoingIds, (playerId) => {
    state.subDraft = { outId: playerId };
    renderSubIncomingStep();
  });
}

function renderSubIncomingStep() {
  subStepLabel.textContent = "Going in";
  subTitle.textContent = `Who replaces ${getPlayerName(state.subDraft.outId)}?`;
  renderSubContext();
  renderSubOptions(getBenchIds(), (playerId) => {
    state.stagedSubs.push({ outId: state.subDraft.outId, inId: playerId });
    state.subDraft = null;
    saveGame();
    renderSubOutgoingStep();
  });
}

function commitStagedSubs() {
  if (!state.stagedSubs.length) {
    return;
  }

  const madeAt = getElapsedMs();
  const committedSubs = state.stagedSubs.map((pair) => ({ ...pair }));
  const outgoingIds = committedSubs.map((pair) => pair.outId);
  const incomingIds = committedSubs.map((pair) => pair.inId);
  state.onField = state.onField.filter((id) => !outgoingIds.includes(id));
  incomingIds.forEach((id) => {
    if (!state.onField.includes(id)) {
      state.onField.push(id);
    }
  });
  state.subEvents.push({
    elapsedMs: madeAt,
    subs: committedSubs,
    createdAt: new Date().toISOString()
  });
  state.stagedSubs = [];
  state.subDraft = null;
  saveGame();
  renderSubOutgoingStep();
  renderSubStrip();
  showRoster();

  if (!tallySheet.classList.contains("hidden")) {
    renderTally();
  }
}

function openSetupSheet() {
  setupStep = 0;
  renderSetupStep();
  setupSheet.classList.remove("hidden");
  setupSheet.setAttribute("aria-hidden", "false");
}

function closeSetupSheet() {
  setupSheet.classList.add("hidden");
  setupSheet.setAttribute("aria-hidden", "true");
}

function renderSetupStep() {
  const presentCount = getPresentRoster().length;
  const starterCount = state.startingLineup.filter((id) => isPresent(id)).length;
  const requiredStarters = gameFormats[state.gameFormat] || 11;
  const totalSteps = state.trackPlayingTime ? 4 : 3;
  setupProgress.innerHTML = `
    <span class="summary-pill ${setupStep === 0 ? "active-step" : ""}">1 Format</span>
    <span class="summary-pill ${setupStep === 1 ? "active-step" : ""}">2 Roster</span>
    ${state.trackPlayingTime ? `<span class="summary-pill ${setupStep === 2 ? "active-step" : ""}">3 Starters</span>` : ""}
    <span class="summary-pill ${setupStep === totalSteps - 1 ? "active-step" : ""}">${totalSteps} Ready</span>
  `;
  setupBack.classList.toggle("hidden", setupStep === 0);
  setupNext.classList.toggle("hidden", setupStep === totalSteps - 1);
  setupStart.classList.toggle("hidden", setupStep !== totalSteps - 1);
  setupNext.disabled = state.trackPlayingTime && setupStep === 2 && starterCount !== requiredStarters;
  setupNext.classList.toggle("disabled-action", setupNext.disabled);
  setupStart.disabled = state.trackPlayingTime && starterCount !== requiredStarters;
  setupStart.classList.toggle("disabled-action", setupStart.disabled);

  if (setupStep === 0) {
    setupStepLabel.textContent = `Step 1 of ${totalSteps}`;
    setupTitle.textContent = "Choose game format";
    setupCopy.textContent = "Pick player count and whether substitutions/playing time should be tracked.";
    renderSetupFormat();
  } else if (setupStep === 1) {
    setupStepLabel.textContent = `Step 2 of ${totalSteps}`;
    setupTitle.textContent = "Who is here today?";
    setupCopy.textContent = `${presentCount} players marked present. Tap absent players to hide them from game pickers.`;
    renderSetupRoster();
  } else if (state.trackPlayingTime && setupStep === 2) {
    setupStepLabel.textContent = `Step 3 of ${totalSteps}`;
    setupTitle.textContent = "Mark starting lineup";
    setupCopy.textContent = `${starterCount} of ${requiredStarters} starters selected for ${state.gameFormat}.`;
    renderSetupStarters();
  } else {
    setupStepLabel.textContent = `Step ${totalSteps} of ${totalSteps}`;
    setupTitle.textContent = "Ready to start game";
    setupCopy.textContent = state.trackPlayingTime
      ? `${presentCount} present, ${starterCount} starters for ${state.gameFormat}.`
      : `${presentCount} present. Substitutions and playing time will be hidden for this game.`;
    renderSetupReady();
  }
}

function renderSetupFormat() {
  setupBody.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "setup-choice-panel";
  panel.innerHTML = `
    <div class="format-grid">
      ${Object.keys(gameFormats).map((format) => `
        <button class="goal-option ${state.gameFormat === format ? "selected" : ""}" data-format="${format}" type="button">
          ${format}
        </button>
      `).join("")}
    </div>
    <button class="tracking-toggle ${state.trackPlayingTime ? "active" : ""}" type="button">
      ${state.trackPlayingTime ? "Tracking substitutions and playing time" : "Do not track substitutions / playing time"}
    </button>
  `;
  setupBody.append(panel);

  panel.querySelectorAll("[data-format]").forEach((button) => {
    button.addEventListener("click", () => {
      state.gameFormat = button.dataset.format;
      saveGame();
      renderSetupStep();
    });
  });

  panel.querySelector(".tracking-toggle").addEventListener("click", () => {
    state.trackPlayingTime = !state.trackPlayingTime;
    if (!state.trackPlayingTime && setupStep > 1) {
      setupStep = 2;
    }
    saveGame();
    renderSetupStep();
  });
}

function renderSetupRoster() {
  setupBody.innerHTML = "";
  const list = document.createElement("div");
  list.className = "roster-list";

  roster.forEach((player) => {
    const row = document.createElement("article");
    row.className = "roster-row";
    const present = isPresent(player.id);
    const safeName = escapeHtml(player.name);
    row.innerHTML = `
      <div>
        <div class="stat-name">${safeName}</div>
        <div class="goal-detail">${present ? "Available for this game" : "Will be hidden from game pickers"}</div>
      </div>
      <button class="toggle-pill ${present ? "active" : ""}" data-setup-action="presence" data-player-id="${escapeHtml(player.id)}" type="button">
        ${present ? "Present" : "Absent"}
      </button>
    `;
    list.append(row);
  });

  setupBody.append(list);
}

function renderSetupStarters() {
  setupBody.innerHTML = "";
  const starterCount = state.startingLineup.filter((id) => isPresent(id)).length;
  const requiredStarters = gameFormats[state.gameFormat] || 11;
  const list = document.createElement("div");
  list.className = "roster-list";
  const status = document.createElement("div");
  status.className = starterCount === requiredStarters ? "lineup-status ready" : "lineup-status";
  status.textContent = `${starterCount} / ${requiredStarters} starters selected`;
  list.append(status);

  getPresentRoster().forEach((player) => {
    const row = document.createElement("article");
    row.className = "roster-row";
    const starter = state.startingLineup.includes(player.id);
    const safeName = escapeHtml(player.name);
    row.innerHTML = `
      <div>
        <div class="stat-name">${safeName}</div>
        <div class="goal-detail">${starter ? "Starting" : "Bench at kickoff"}</div>
      </div>
      <button class="toggle-pill ${starter ? "active" : ""}" data-setup-action="starter" data-player-id="${escapeHtml(player.id)}" type="button">
        ${starter ? "Start" : "Bench"}
      </button>
    `;
    list.append(row);
  });

  setupBody.append(list);
}

function renderSetupReady() {
  const requiredStarters = gameFormats[state.gameFormat] || 11;
  const starterCount = state.startingLineup.filter((id) => isPresent(id)).length;
  setupBody.innerHTML = `
    <div class="ready-panel">
      <div class="ready-pill">${getPresentRoster().length} present</div>
      <div class="ready-pill">${state.gameFormat}</div>
      <div class="ready-pill">${state.trackPlayingTime ? `${starterCount}/${requiredStarters} starters` : "Observation only"}</div>
      <div class="ready-pill">Clock waiting</div>
    </div>
  `;
}

function finishSetup() {
  const presence = { ...state.presence };
  const startingLineup = [...state.startingLineup];
  const gameFormat = state.gameFormat;
  const trackPlayingTime = state.trackPlayingTime;
  clearGameForNewSetup();
  state.presence = presence;
  state.startingLineup = startingLineup;
  state.gameFormat = gameFormat;
  state.trackPlayingTime = trackPlayingTime;
  if (state.trackPlayingTime) {
    ensureLineupReady();
    if (!state.initialOnField.length) {
      state.initialOnField = [...state.onField];
    }
  }
  closeSetupSheet();
  renderClock();
  renderSubStrip();
  showRoster();
  saveGame();
}

function getGoalScore() {
  return state.goals.reduce((score, goal) => {
    if (goal.team === "us") {
      score.us += 1;
    } else {
      score.them += 1;
    }

    return score;
  }, { us: 0, them: 0 });
}

function goalContextText() {
  if (!state.goalDraft) {
    return "";
  }

  const chunks = [`Time ${formatClock(state.goalDraft.elapsedMs)}`];

  if (state.goalDraft.team) {
    chunks.push(state.goalDraft.team === "us" ? "Us" : "Them");
  }

  if (state.goalDraft.scorer) {
    chunks.push(`Scorer ${state.goalDraft.scorer}`);
  }

  if (state.goalDraft.assist) {
    chunks.push(`Assist ${state.goalDraft.assist}`);
  }

  if (state.goalDraft.type) {
    chunks.push(state.goalDraft.type);
  }

  return chunks.join(" | ");
}

function setGoalStep(label, title) {
  goalStepLabel.textContent = label;
  goalTitle.textContent = title;
  goalContext.textContent = goalContextText();
  finishGoal.classList.add("hidden");
}

function renderGoalOptions(items, onPick, selectedValues = []) {
  goalOptions.innerHTML = "";

  items.forEach((item) => {
    const button = document.createElement("button");
    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;
    const tone = typeof item === "string" ? "" : item.tone || "";
    button.className = `goal-option ${tone}`;
    button.type = "button";
    button.textContent = label;

    if (selectedValues.includes(value)) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => onPick(value));
    goalOptions.append(button);
  });
}

function openGoalFlow() {
  state.goalDraft = {
    team: null,
    scorer: null,
    assist: null,
    type: null,
    quality: [],
    elapsedMs: getElapsedMs(),
    createdAt: new Date().toISOString()
  };

  goalSheet.classList.remove("hidden");
  goalSheet.setAttribute("aria-hidden", "false");
  renderGoalTeamStep();
}

function closeGoalFlow() {
  state.goalDraft = null;
  goalSheet.classList.add("hidden");
  goalSheet.setAttribute("aria-hidden", "true");
}

function saveGoal(goal) {
  state.goals.push(goal);
  saveGame();
  closeGoalFlow();
  showRoster();

  if (!tallySheet.classList.contains("hidden")) {
    renderTally();
  }
}

function renderGoalTeamStep() {
  setGoalStep("Goal", "Who scored?");
  renderGoalOptions([
    { label: "Us", value: "us", tone: "featured" },
    { label: "Them", value: "them", tone: "danger" }
  ], (team) => {
    state.goalDraft.team = team;

    if (team === "them") {
      saveGoal({ ...state.goalDraft });
      return;
    }

    renderGoalScorerStep();
  });
}

function renderGoalScorerStep() {
  setGoalStep("Our goal", "Who scored?");
  renderGoalOptions(getPresentPlayerNames(), (player) => {
    state.goalDraft.scorer = player;
    renderGoalAssistStep();
  });
}

function renderGoalAssistStep() {
  setGoalStep("Assist", "Who assisted?");
  renderGoalOptions(["No assist", ...getPresentPlayerNames()], (player) => {
    state.goalDraft.assist = player === "No assist" ? null : player;
    renderGoalTypeStep();
  });
}

function renderGoalTypeStep() {
  setGoalStep("Type", "What type of goal?");
  renderGoalOptions(goalTypes, (type) => {
    state.goalDraft.type = type;
    renderGoalQualityStep();
  });
}

function renderGoalQualityStep() {
  setGoalStep("Quality", "Any goal tags?");
  finishGoal.classList.remove("hidden");
  finishGoal.textContent = "Save goal";

  renderGoalOptions(goalQualityTags, (tag) => {
    if (state.goalDraft.quality.includes(tag)) {
      state.goalDraft.quality = state.goalDraft.quality.filter((item) => item !== tag);
    } else {
      state.goalDraft.quality.push(tag);
    }

    renderGoalQualityStep();
  }, state.goalDraft.quality);
}

function showRoster() {
  state.selectedPlayer = null;
  panelTitle.textContent = "Observations";
  modeEyebrow.textContent = "";
  cancelObservation.classList.add("hidden");
  observationPanel.classList.add("hidden");
  playerGrid.classList.remove("hidden");
  renderPlayers();
  renderUndo();
}

function showObservations(player, category = null, target = "player") {
  state.selectedPlayer = player;
  renderObservationButtons(target === "team" ? teamObservations : observations);
  selectedPlayerName.textContent = player;
  panelTitle.textContent = category === "positive"
    ? "Positive observation"
    : category === "negative"
      ? "Negative observation"
      : "Log one observation";
  modeEyebrow.textContent = "One tap then reset";
  cancelObservation.classList.remove("hidden");
  playerGrid.classList.add("hidden");
  observationPanel.classList.remove("hidden");
  observationGroups.querySelectorAll(".observation-group").forEach((group) => {
    group.classList.toggle("hidden", Boolean(category) && group.dataset.category !== category);
  });
}

function logObservation(category, observation) {
  state.entries.push({
    player: state.selectedPlayer,
    category,
    observation,
    elapsedMs: getElapsedMs(),
    createdAt: new Date().toISOString()
  });
  saveGame();
  showRoster();
}

function undoLastObservation() {
  if (!state.entries.length) {
    return;
  }

  state.entries.pop();
  saveGame();
  showRoster();

  if (!tallySheet.classList.contains("hidden")) {
    renderTally();
  }
}

function getPlayerStats(player) {
  const entries = state.entries.filter((entry) => entry.player === player);
  const positive = entries.filter((entry) => entry.category === "positive").length;
  const negative = entries.filter((entry) => entry.category === "negative").length;
  const byObservation = entries.reduce((counts, entry) => {
    counts[entry.observation] = (counts[entry.observation] || 0) + 1;
    return counts;
  }, {});

  return { entries, positive, negative, byObservation };
}

function getPlayingTimeTotals() {
  const totals = roster.reduce((result, player) => {
    result[player.id] = 0;
    return result;
  }, {});
  if (!state.trackPlayingTime) {
    return totals;
  }

  const now = getElapsedMs();

  if (!now && !state.subEvents.length) {
    return totals;
  }

  let cursor = 0;
  let current = (state.initialOnField.length ? state.initialOnField : state.startingLineup)
    .filter((id) => isPresent(id))
    .slice(0, gameFormats[state.gameFormat] || 11);
  const events = [...state.subEvents].sort((left, right) => left.elapsedMs - right.elapsedMs);

  events.forEach((event) => {
    const eventTime = Math.max(0, Math.min(Number(event.elapsedMs) || 0, now));
    const duration = Math.max(0, eventTime - cursor);
    current.forEach((id) => {
      totals[id] += duration;
    });

    const outgoingIds = event.subs.map((pair) => pair.outId);
    current = current.filter((id) => !outgoingIds.includes(id));
    event.subs.forEach((pair) => {
      if (!current.includes(pair.inId)) {
        current.push(pair.inId);
      }
    });
    cursor = eventTime;
  });

  const finalDuration = Math.max(0, now - cursor);
  current.forEach((id) => {
    totals[id] += finalDuration;
  });

  return totals;
}

function renderTally() {
  const positive = state.entries.filter((entry) => entry.category === "positive").length;
  const negative = state.entries.filter((entry) => entry.category === "negative").length;
  const score = getGoalScore();
  const playingTime = getPlayingTimeTotals();
  const lineupSummary = state.trackPlayingTime
    ? `<span class="summary-pill">${state.onField.length} on field</span><span class="summary-pill">${state.stagedSubs.length} staged</span>`
    : '<span class="summary-pill">Observation-only</span>';

  summaryStrip.innerHTML = `
    <span class="summary-pill">Clock ${formatClock(getElapsedMs())}</span>
    <span class="summary-pill">Score ${score.us}-${score.them}</span>
    <span class="summary-pill">${state.gameFormat}</span>
    ${lineupSummary}
    <span class="summary-pill">${state.goals.length} goals</span>
    <span class="summary-pill">${state.entries.length} total</span>
    <span class="summary-pill">${positive} positive</span>
    <span class="summary-pill">${negative} negative</span>
  `;

  tallyList.innerHTML = "";

  const teamStats = getPlayerStats("Team");
  const teamRow = document.createElement("article");
  teamRow.className = "tally-player team-row";
  const teamChips = Object.entries(teamStats.byObservation)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => {
      const category = teamObservations.positive.includes(label) ? "positive" : "negative";
      return `<span class="breakdown-chip ${category}">${label}: ${count}</span>`;
    })
    .join("");

  teamRow.innerHTML = `
    <div class="stat-row">
      <span class="stat-name">Team</span>
      <span class="stat-total">${teamStats.entries.length} total | +${teamStats.positive} / -${teamStats.negative}</span>
    </div>
    <div class="breakdown">${teamChips || '<span class="breakdown-chip">No team observations yet</span>'}</div>
  `;
  tallyList.append(teamRow);

  roster.forEach((player) => {
    const stats = getPlayerStats(player.name);
    const row = document.createElement("article");
    row.className = "tally-player";

    const chips = Object.entries(stats.byObservation)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, count]) => {
        const category = observations.positive.includes(label) ? "positive" : "negative";
        return `<span class="breakdown-chip ${category}">${label}: ${count}</span>`;
      })
      .join("");

    row.innerHTML = `
      <div class="stat-row">
        <span class="stat-name">${player.name}</span>
        <span class="stat-total">${state.trackPlayingTime ? `${formatClock(playingTime[player.id])} played | ` : ""}${stats.entries.length} total | +${stats.positive} / -${stats.negative}</span>
      </div>
      <div class="breakdown">${chips || '<span class="breakdown-chip">No observations yet</span>'}</div>
    `;

    tallyList.append(row);
  });

  const goalLog = document.createElement("section");
  goalLog.className = "goal-log";
  goalLog.innerHTML = "<h2>Goals</h2>";

  if (!state.goals.length) {
    const emptyGoal = document.createElement("article");
    emptyGoal.className = "goal-item";
    emptyGoal.innerHTML = '<div class="goal-detail">No goals marked yet</div>';
    goalLog.append(emptyGoal);
  }

  state.goals.forEach((goal, index) => {
    const goalItem = document.createElement("article");
    goalItem.className = "goal-item";
    const team = goal.team === "us" ? "Us" : "Them";
    const detail = goal.team === "us"
      ? [
          goal.scorer ? `Scorer: ${goal.scorer}` : "",
          goal.assist ? `Assist: ${goal.assist}` : "No assist",
          goal.type ? `Type: ${goal.type}` : "",
          goal.quality && goal.quality.length ? `Tags: ${goal.quality.join(", ")}` : "No quality tags"
        ].filter(Boolean).join(" | ")
      : "Opponent goal";

    goalItem.innerHTML = `
      <div class="goal-title-line">
        <span>${index + 1}. ${team}</span>
        <span>${formatClock(goal.elapsedMs)}</span>
      </div>
      <div class="goal-detail">${detail}</div>
    `;

    goalLog.append(goalItem);
  });

  tallyList.append(goalLog);

  if (!state.trackPlayingTime) {
    return;
  }

  const subLog = document.createElement("section");
  subLog.className = "goal-log";
  subLog.innerHTML = "<h2>Substitutions</h2>";
  if (!state.subEvents.length) {
    const emptySub = document.createElement("article");
    emptySub.className = "goal-item";
    emptySub.innerHTML = '<div class="goal-detail">No substitutions marked yet</div>';
    subLog.append(emptySub);
  }

  state.subEvents.forEach((event, index) => {
    const subItem = document.createElement("article");
    subItem.className = "goal-item";
    const detail = event.subs
      .map((pair) => `${getPlayerName(pair.inId)} for ${getPlayerName(pair.outId)}`)
      .join(" | ");

    subItem.innerHTML = `
      <div class="goal-title-line">
        <span>${index + 1}. Subs made</span>
        <span>${formatClock(event.elapsedMs)}</span>
      </div>
      <div class="goal-detail">${detail}</div>
    `;

    subLog.append(subItem);
  });

  tallyList.append(subLog);
}

function buildGameLogEmailBody() {
  const score = getGoalScore();
  const positive = state.entries.filter((entry) => entry.category === "positive").length;
  const negative = state.entries.filter((entry) => entry.category === "negative").length;
  const playingTime = getPlayingTimeTotals();
  const lines = [
    "Game Log",
    "",
    `Clock: ${formatClock(getElapsedMs())}`,
    `Format: ${state.gameFormat}`,
    `Score: ${score.us}-${score.them}`,
    `Mode: ${state.trackPlayingTime ? "Tracking substitutions and playing time" : "Observation only"}`,
    `Observations: ${state.entries.length} total (${positive} positive, ${negative} negative)`,
    ""
  ];

  lines.push("Player Summary");
  const teamStats = getPlayerStats("Team");
  lines.push(`- Team: ${teamStats.entries.length} observations (+${teamStats.positive} / -${teamStats.negative})`);
  roster.forEach((player) => {
    const stats = getPlayerStats(player.name);
    const playing = state.trackPlayingTime ? `${formatClock(playingTime[player.id])} played, ` : "";
    lines.push(`- ${player.name}: ${playing}${stats.entries.length} observations (+${stats.positive} / -${stats.negative})`);
  });

  lines.push("", "Observation Detail");
  if (!state.entries.length) {
    lines.push("- None");
  } else {
    state.entries.forEach((entry) => {
      lines.push(`- ${formatClock(entry.elapsedMs)} | ${entry.player} | ${entry.category} | ${entry.observation}`);
    });
  }

  lines.push("", "Goals");
  if (!state.goals.length) {
    lines.push("- None");
  } else {
    state.goals.forEach((goal, index) => {
      if (goal.team === "us") {
        lines.push(`- ${index + 1}. ${formatClock(goal.elapsedMs)} | Us | Scorer: ${goal.scorer || "Unknown"} | Assist: ${goal.assist || "None"} | Type: ${goal.type || "Unknown"} | Tags: ${goal.quality && goal.quality.length ? goal.quality.join(", ") : "None"}`);
      } else {
        lines.push(`- ${index + 1}. ${formatClock(goal.elapsedMs)} | Them`);
      }
    });
  }

  if (state.trackPlayingTime) {
    lines.push("", "Substitutions");
    if (!state.subEvents.length) {
      lines.push("- None");
    } else {
      state.subEvents.forEach((event, index) => {
        const detail = event.subs
          .map((pair) => `${getPlayerName(pair.inId)} for ${getPlayerName(pair.outId)}`)
          .join("; ");
        lines.push(`- ${index + 1}. ${formatClock(event.elapsedMs)} | ${detail}`);
      });
    }
  }

  return lines.join("\n");
}

async function copyCurrentGameLog() {
  const text = buildGameLogEmailBody();
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
  copyGameLog.textContent = "Copied";
  window.setTimeout(() => {
    copyGameLog.textContent = "Copy Game Log to Clipboard";
  }, 1600);
}

function setupInstallPrompt() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.classList.remove("hidden");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
  });
}

async function promptInstallApp() {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
}

function openTally() {
  renderTally();
  tallySheet.classList.remove("hidden");
  tallySheet.setAttribute("aria-hidden", "false");
}

function closeTallySheet() {
  tallySheet.classList.add("hidden");
  tallySheet.setAttribute("aria-hidden", "true");
}

clockToggle.addEventListener("click", () => {
  if (!state.running || state.period === "halftime") {
    startClock();
  }
});

halftimeButton.addEventListener("click", startHalftime);
finalWhistleButton.addEventListener("click", finalWhistle);
pauseClockButton.addEventListener("click", pauseClock);
resetClock.addEventListener("click", openResetSheet);
cancelObservation.addEventListener("click", showRoster);
undoLast.addEventListener("click", undoLastObservation);
installButton.addEventListener("click", promptInstallApp);
authButton.addEventListener("click", openAuthSheet);
teamsButton.addEventListener("click", openTeamsSheet);
newGameButton.addEventListener("click", openSetupSheet);
rosterButton.addEventListener("click", openRosterSheet);
closeRoster.addEventListener("click", closeRosterSheet);
closeAuth.addEventListener("click", closeAuthSheet);
closeTeams.addEventListener("click", closeTeamsSheet);
subsButton.addEventListener("click", openSubSheet);
closeSubs.addEventListener("click", closeSubSheet);
subsMadeButton.addEventListener("click", commitStagedSubs);
commitSubsSheet.addEventListener("click", commitStagedSubs);
goalButton.addEventListener("click", openGoalFlow);
closeGoal.addEventListener("click", closeGoalFlow);
finishGoal.addEventListener("click", () => {
  if (!state.goalDraft) {
    return;
  }

  saveGoal({ ...state.goalDraft, quality: [...state.goalDraft.quality] });
});
tallyButton.addEventListener("click", openTally);
closeTally.addEventListener("click", closeTallySheet);
copyGameLog.addEventListener("click", copyCurrentGameLog);

clearGame.addEventListener("click", openResetSheet);
resetClearLog.addEventListener("click", resetAndClearLog);
resetKeepLog.addEventListener("click", resetAndKeepLog);
cancelReset.addEventListener("click", closeResetSheet);
closeSetup.addEventListener("click", closeSetupSheet);
setupBack.addEventListener("click", () => {
  setupStep = Math.max(0, setupStep - 1);
  renderSetupStep();
});
setupNext.addEventListener("click", () => {
  const totalSteps = state.trackPlayingTime ? 4 : 3;
  setupStep = Math.min(totalSteps - 1, setupStep + 1);
  renderSetupStep();
});
setupStart.addEventListener("click", finishSetup);

accountStrip.addEventListener("click", (event) => {
  const authTarget = event.target.closest("#inlineAuthButton");
  const teamsTarget = event.target.closest("#inlineTeamsButton");

  if (authTarget) {
    openAuthSheet();
  } else if (teamsTarget) {
    openTeamsSheet();
  }
});

onboardingAction.addEventListener("click", openTeamsSheet);
onboardingLater.addEventListener("click", () => {
  dismissOnboarding().catch(() => {});
});

emailSignInForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = authEmail.value.trim();
  if (!email) {
    authStatus.textContent = "Enter an email address.";
    return;
  }

  try {
    await signInWithEmail(email);
    renderAuthSheet();
  } catch (error) {
    authStatus.textContent = error.message || "Could not send sign-in link.";
  }
});

googleSignIn.addEventListener("click", () => {
  signInWithGoogle().catch((error) => {
    authStatus.textContent = error.message || "Could not start Google sign-in.";
  });
});

signOutButton.addEventListener("click", async () => {
  try {
    await signOut();
    closeAuthSheet();
  } catch (error) {
    authStatus.textContent = error.message || "Could not sign out.";
  }
});

teamForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveTeamFromForm();
});

teamsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-team-action]");
  if (!button) {
    return;
  }

  handleTeamListAction(button);
});

openTeamRoster.addEventListener("click", () => {
  closeTeamsSheet();
  openRosterSheet();
});

setupBody.addEventListener("click", (event) => {
  const button = event.target.closest(".toggle-pill");
  if (!button) {
    return;
  }

  if (button.dataset.setupAction === "presence") {
    setPresence(button.dataset.playerId, !isPresent(button.dataset.playerId));
  } else if (button.dataset.setupAction === "starter") {
    setStarter(button.dataset.playerId, !state.startingLineup.includes(button.dataset.playerId));
  }

  renderSetupStep();
});

rosterList.addEventListener("click", (event) => {
  const button = event.target.closest(".toggle-pill");
  if (!button) {
    return;
  }

  if (button.dataset.action === "presence") {
    togglePresence(button.dataset.playerId);
  } else if (button.dataset.action === "starter") {
    toggleStarter(button.dataset.playerId);
  } else if (button.dataset.action === "remove") {
    removeRosterPlayer(button.dataset.playerId);
  }
});

rosterList.addEventListener("change", (event) => {
  const input = event.target.closest(".roster-name-input");
  if (!input) {
    return;
  }

  renameRosterPlayer(input.dataset.playerId, input.value);
});

addPlayerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addRosterPlayer(newPlayerName.value);
  newPlayerName.value = "";
  newPlayerName.focus();
});

subStagedList.addEventListener("click", (event) => {
  const button = event.target.closest(".mini-remove");
  if (!button) {
    return;
  }

  state.stagedSubs.splice(Number(button.dataset.index), 1);
  saveGame();
  renderSubOutgoingStep();
  renderSubStrip();
});

playerGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".quick-observation");
  if (!button) {
    return;
  }

  showObservations(button.dataset.player, button.dataset.category, button.dataset.target || "player");
});

observationGroups.addEventListener("click", (event) => {
  const button = event.target.closest(".observation-button");
  if (!button || !state.selectedPlayer) {
    return;
  }

  logObservation(button.dataset.category, button.dataset.observation);
});

tallySheet.addEventListener("click", (event) => {
  if (event.target === tallySheet) {
    closeTallySheet();
  }
});

rosterSheet.addEventListener("click", (event) => {
  if (event.target === rosterSheet) {
    closeRosterSheet();
  }
});

authSheet.addEventListener("click", (event) => {
  if (event.target === authSheet) {
    closeAuthSheet();
  }
});

teamsSheet.addEventListener("click", (event) => {
  if (event.target === teamsSheet) {
    closeTeamsSheet();
  }
});

subSheet.addEventListener("click", (event) => {
  if (event.target === subSheet) {
    closeSubSheet();
  }
});

setupSheet.addEventListener("click", (event) => {
  if (event.target === setupSheet) {
    closeSetupSheet();
  }
});

resetSheet.addEventListener("click", (event) => {
  if (event.target === resetSheet) {
    closeResetSheet();
  }
});

goalSheet.addEventListener("click", (event) => {
  if (event.target === goalSheet) {
    closeGoalFlow();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!resetSheet.classList.contains("hidden")) {
      closeResetSheet();
      return;
    }

    if (!setupSheet.classList.contains("hidden")) {
      closeSetupSheet();
      return;
    }

    if (!teamsSheet.classList.contains("hidden")) {
      closeTeamsSheet();
      return;
    }

    if (!authSheet.classList.contains("hidden")) {
      closeAuthSheet();
      return;
    }

    if (!subSheet.classList.contains("hidden")) {
      closeSubSheet();
      return;
    }

    if (!rosterSheet.classList.contains("hidden")) {
      closeRosterSheet();
      return;
    }

    if (!goalSheet.classList.contains("hidden")) {
      closeGoalFlow();
      return;
    }

    if (!tallySheet.classList.contains("hidden")) {
      closeTallySheet();
      return;
    }

    if (state.selectedPlayer) {
      showRoster();
    }
  }
});

window.addEventListener("beforeunload", saveGame);

setupInstallPrompt();
loadGame();
renderObservationButtons();
renderAccountStatus();
showRoster();
renderSubStrip();
renderClock();
initializeAccount();

if (state.running || state.halftimeRunning) {
  ensureTicker();
}
