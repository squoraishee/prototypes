const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const comboEl = document.getElementById("combo");
const playerHpEl = document.getElementById("playerHp");
const enemyCountEl = document.getElementById("enemyCount");
const spikeCountEl = document.getElementById("spikeCount");
const feverText = document.getElementById("feverText");
const feverBar = document.getElementById("feverBar");
const panel = document.getElementById("screenPanel");
const startButton = document.getElementById("startButton");
const loadButton = document.getElementById("loadButton");
const infoButton = document.getElementById("infoButton");
const practiceButton = document.getElementById("practiceButton");
const continueButton = document.getElementById("continueButton");
const difficultySelect = document.getElementById("difficultySelect");
const levelTitleEl = document.getElementById("levelTitle");
const levelLoreEl = document.getElementById("levelLore");
const objectiveTextEl = document.getElementById("objectiveText");
const bossMeter = document.getElementById("bossMeter");
const bossNameEl = document.getElementById("bossName");
const bossHpText = document.getElementById("bossHpText");
const bossHpBar = document.getElementById("bossHpBar");
const worldMapEl = document.getElementById("worldMap");
const bestiaryListEl = document.getElementById("bestiaryList");
const titleScreen = document.getElementById("titleScreen");
const titleStartButton = document.getElementById("titleStartButton");
const titleLoadButton = document.getElementById("titleLoadButton");
const titleSaveButton = document.getElementById("titleSaveButton");
const titleResetButton = document.getElementById("titleResetButton");
const saveOptions = document.getElementById("saveOptions");
const titleBestScore = document.getElementById("titleBestScore");
const titleCampaignLevel = document.getElementById("titleCampaignLevel");
const titleDiscovered = document.getElementById("titleDiscovered");
const backTitleButton = document.getElementById("backTitleButton");

const COLS = 30;
const ROWS = 20;
const TILE = canvas.width / COLS;
const BASE_STEP = 108;
const COLORS = {
  ink: "#132130",
  sky: "#a9d8ff",
  grass: "#63bb43",
  grassDark: "#4ca239",
  white: "#fff9ef",
  yellow: "#ffd64a",
  orange: "#ff7f1e",
  red: "#ff4030",
  pink: "#ff77ac",
  blue: "#2498e8",
  blueDark: "#1970c2",
  green: "#7edb2f",
  greenDark: "#55a936",
  limeLight: "#c8f764",
  purple: "#ba7aff"
};

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 }
};

const DIFFICULTIES = {
  easy: { label: "Cupcake Easy", count: 1, speed: 285, attack: 2300, accuracy: 0.36, hp: 3 },
  normal: { label: "Parade Normal", count: 2, speed: 230, attack: 1700, accuracy: 0.52, hp: 3 },
  hard: { label: "Firework Hard", count: 3, speed: 190, attack: 1250, accuracy: 0.7, hp: 4 },
  chaos: { label: "Confetti Chaos", count: 4, speed: 158, attack: 920, accuracy: 0.86, hp: 5 }
};

const ENEMY_TYPES = [
  { type: "rival", name: "Streamer Snake", color: "#2498e8", power: "chases and snipes" },
  { type: "charger", name: "Balloon Bully", color: "#ff77ac", power: "rushes in lanes" },
  { type: "sprayer", name: "Candle Spitter", color: "#ff8f24", power: "sprays fan shots" },
  { type: "guard", name: "Gift Guard", color: "#ba7aff", power: "circles food" },
  { type: "zigzag", name: "Zigzag Zelia", color: "#00b894", power: "turns every few beats" },
  { type: "shadow", name: "Shadow Slink", color: "#34495e", power: "ambushes from edges" },
  { type: "spark", name: "Spark Serpent", color: "#f1c40f", power: "fires fast short shots" },
  { type: "frost", name: "Frost Noodle", color: "#74b9ff", power: "slows lanes" },
  { type: "pepper", name: "Peppercoil", color: "#d63031", power: "rushes unpredictably" },
  { type: "bubble", name: "Bubble Boa", color: "#55efc4", power: "leaves balloon cover" },
  { type: "mirror", name: "Mirror Mamba", color: "#a29bfe", power: "mirrors your turns" },
  { type: "drummer", name: "Drummer Viper", color: "#e17055", power: "attacks on rhythm" },
  { type: "comet", name: "Comet Cobra", color: "#fd79a8", power: "long fast charges" },
  { type: "ivy", name: "Ivy Looper", color: "#2ecc71", power: "guards item chains" },
  { type: "neon", name: "Neon Adder", color: "#00cec9", power: "fires diagonal-feeling waves" },
  { type: "crown", name: "Crown Krait", color: "#fdcb6e", power: "protects bosses" },
  { type: "ribbon", name: "Ribbon Racer", color: "#e84393", power: "patrols corridors" },
  { type: "cymbal", name: "Cymbal Snake", color: "#fab1a0", power: "bursts fan shots" },
  { type: "mint", name: "Mint Mamba", color: "#81ecec", power: "dodges away from shots" },
  { type: "ember", name: "Ember Eel", color: "#e67e22", power: "leaves hot pressure" },
  { type: "plum", name: "Plum Python", color: "#6c5ce7", power: "slow heavy sniper" },
  { type: "star", name: "Star Squeezer", color: "#ffeaa7", power: "summons extra hazards" },
  { type: "ticker", name: "Ticker Tangle", color: "#636e72", power: "speeds up over time" },
  { type: "prism", name: "Prism Coil", color: "#ff7675", power: "changes attack colors" }
];

const LEVEL_ORDER = ["garden", "rivals", "balloons", "cakeBoss", "lanterns", "pinataTrail", "piñataBoss", "moonMarket", "finale", "djBoss", "confettiCanyon", "frostingFalls", "neonParade", "ribbonRuins", "starfieldSoiree", "crownBoss", "afterpartyAlley", "bubbleBay", "emberArcade", "prismPalace", "grandFinaleBoss"];

const BESTIARY = [
  { id: "sunny", chip: "cupcake", name: "Sunny Coil", text: "Guards cupcakes and grows stronger with every bite.", unlock: "garden" },
  { id: "basil", chip: "gift", name: "Bowtie Basil", text: "Opens gifts that turn into the next party clue.", unlock: "garden" },
  { id: "bluebell", chip: "candle", name: "Bluebell Slither", text: "Slows time with candlelight and saves risky turns.", unlock: "garden" },
  { id: "rival", chip: "enemy-blue", name: "Streamer Snake", text: "Chases and fires accurate shots from streamer lanes.", unlock: "rivals" },
  { id: "charger", chip: "enemy-pink", name: "Balloon Bully", text: "Rushes lanes and forces the player out of safe routes.", unlock: "rivals" },
  { id: "sprayer", chip: "enemy-orange", name: "Candle Spitter", text: "Sprays fan shots after circling the candle line.", unlock: "balloons" },
  { id: "guard", chip: "enemy-purple", name: "Gift Guard", text: "Circles food and blocks item-chain progress.", unlock: "balloons" },
  { id: "frostfang", chip: "boss-ice", name: "Count Frostfang", text: "A frosting baron with a sugar-glass shield and icy crossfire.", unlock: "cakeBoss" },
  { id: "pinata", chip: "boss-pinata", name: "Piñata Python", text: "A candy-armored boss that bursts radial attacks.", unlock: "piñataBoss" },
  { id: "dj", chip: "boss-dj", name: "DJ Coilnova", text: "The finale boss that attacks in rhythm waves.", unlock: "djBoss" }
];

const LEVELS = {
  garden: {
    title: "Cupcake Garden",
    lore: "The party begins in the meadow where old picnic magic still lives under the grass. Sunny Coil believes every real celebration starts with a cupcake, a shower of sprinkles, and a candle bright enough to call distant friends home.",
    objective: "Build the cake chain: cupcake to sprinkles to candle to cake topper.",
    chain: ["cupcake", "sprinkles", "candle", "cakeTopper"],
    win: "chain",
    arena: "garden",
    enemyBonus: -1,
    hazards: 3
  },
  rivals: {
    title: "Streamer Showdown",
    lore: "The streamer bridge is where party snakes settle arguments without spoiling the cake. Rival crews have tangled the ribbons into walls, and only a clean parade rhythm can open the route toward the balloon hills.",
    objective: "Defeat every rival. Gifts can become horns that stun enemies.",
    chain: ["gift", "partyHorn"],
    win: "defeatAll",
    arena: "bridge",
    enemyBonus: 0,
    hazards: 5
  },
  balloons: {
    title: "Balloon Gate",
    lore: "Past the bridge, the wind keeps a gate of bobbing balloons locked over the trail. The gate listens for ribbons tied in the old pattern and for enough popped balloons to prove the breeze has been calmed.",
    objective: "Pop 8 balloons and complete the candle to ribbon to balloon key chain.",
    chain: ["candle", "ribbon", "balloonKey"],
    win: "balloons",
    arena: "gate",
    target: 8,
    enemyBonus: 1,
    hazards: 8
  },
  cakeBoss: {
    title: "Boss: Count Frostfang",
    lore: "Count Frostfang once decorated every birthday cake in Snakephoria, then grew jealous of anyone holding the final candle. He sealed the cake altar in sugar glass, and his crown only cracks when the lost cake relics are gathered in order.",
    objective: "Collect sprinkles, candle, and cake topper to drop Frostfang's shield, then break his boss bar.",
    chain: ["sprinkles", "candle", "cakeTopper"],
    win: "boss",
    arena: "frosting",
    enemyBonus: -2,
    hazards: 5,
    boss: { type: "frostfang", name: "Count Frostfang", color: "#7bd8ff", hp: 18, speed: 205, attack: 980 }
  },
  lanterns: {
    title: "Lantern Loop",
    lore: "The lantern fields float above a maze of picnic tables left from parties nobody remembers. Each ribbon tied here becomes a road sign on the world map, pointing toward the court where candy armor was first invented.",
    objective: "Collect 5 ribbons and reach 1800 score.",
    chain: ["ribbon", "ribbon", "ribbon", "ribbon", "ribbon"],
    win: "collectScore",
    arena: "lanterns",
    target: 5,
    scoreTarget: 1800,
    enemyBonus: 1,
    hazards: 6
  },
  piñataBoss: {
    title: "Boss: Piñata Python",
    lore: "Piñata Python is not cruel, but it believes every guest should dodge before they dance. Its candy armor spins in paper layers, and only party horns can reveal the weak seams underneath the bright shell.",
    objective: "Collect two party horns, then hit weak seams until the piñata boss bursts.",
    chain: ["gift", "partyHorn", "gift", "partyHorn"],
    win: "boss",
    arena: "pinata",
    enemyBonus: -2,
    hazards: 7,
    boss: { type: "pinata", name: "Piñata Python", color: "#ff77ac", hp: 24, speed: 175, attack: 760 }
  },
  finale: {
    title: "Moonlight Finale",
    lore: "By moonrise, the festival becomes a roll call. Every friend needs an invitation, every rival needs a reason to join, and the final stage will stay dark until the guest list is bright enough.",
    objective: "Collect 3 invitations dropped by defeated opponents and score 2500.",
    chain: ["gift", "invitation"],
    win: "invitations",
    arena: "moon",
    target: 3,
    scoreTarget: 2500,
    enemyBonus: 1,
    hazards: 7
  },
  djBoss: {
    title: "Boss: DJ Coilnova",
    lore: "DJ Coilnova built the first moonlit stage and still controls the closing song. The DJ remixes every rival pattern into rhythm waves, and the only way to end the night is to collect the final tokens and beat the music at its own tempo.",
    objective: "Collect invitations, ribbon, and balloon key to silence the speakers, then defeat DJ Coilnova.",
    chain: ["invitation", "ribbon", "balloonKey"],
    win: "boss",
    arena: "stage",
    enemyBonus: -1,
    hazards: 9,
    boss: { type: "dj", name: "DJ Coilnova", color: "#ba7aff", hp: 32, speed: 150, attack: 560 }
  },
  pinataTrail: {
    title: "Piñata Trail",
    lore: "Candy paper rustles across the trail to the piñata court. New rivals patrol in quick loops, testing whether you can keep collecting while the route keeps changing.",
    objective: "Collect 6 sprinkles and score 2200.",
    chain: ["sprinkles", "sprinkles", "gift", "sprinkles", "ribbon", "sprinkles"],
    win: "collectScore",
    arena: "pinata",
    target: 6,
    scoreTarget: 2200,
    enemyBonus: 2,
    hazards: 7
  },
  moonMarket: {
    title: "Moon Market",
    lore: "Lantern vendors trade invitations for bright ribbons. Every stall is a shortcut and every shortcut is watched by a rival snake.",
    objective: "Collect 4 invitations and score 2800.",
    chain: ["gift", "invitation", "ribbon", "invitation", "gift", "invitation", "invitation"],
    win: "invitations",
    arena: "moon",
    target: 4,
    scoreTarget: 2800,
    enemyBonus: 2,
    hazards: 8
  },
  confettiCanyon: {
    title: "Confetti Canyon",
    lore: "The canyon walls throw confetti back like echoes. Fast rivals use the color storm as cover.",
    objective: "Finish the canyon chain and defeat every rival.",
    chain: ["cupcake", "ribbon", "partyHorn", "balloonKey"],
    win: "defeatAll",
    arena: "gate",
    enemyBonus: 3,
    hazards: 9
  },
  frostingFalls: {
    title: "Frosting Falls",
    lore: "Icy frosting pours through old cake channels, slowing the party road and hiding bright toppers in the spray.",
    objective: "Collect 7 relics and reach 3200 score.",
    chain: ["candle", "sprinkles", "cakeTopper", "candle", "ribbon", "cakeTopper", "sprinkles"],
    win: "collectScore",
    arena: "frosting",
    target: 7,
    scoreTarget: 3200,
    enemyBonus: 3,
    hazards: 8
  },
  neonParade: {
    title: "Neon Parade",
    lore: "The parade route glows after sunset, and neon rivals fire shots that look like moving lights.",
    objective: "Pop 12 balloons and complete the neon key chain.",
    chain: ["ribbon", "balloonKey", "partyHorn", "balloonKey"],
    win: "balloons",
    arena: "stage",
    target: 12,
    enemyBonus: 3,
    hazards: 11
  },
  ribbonRuins: {
    title: "Ribbon Ruins",
    lore: "Ancient ribbons mark the first festival route. Guard snakes protect the knots because the knots remember every shortcut.",
    objective: "Collect 8 ribbons and score 3600.",
    chain: ["ribbon", "ribbon", "gift", "ribbon", "candle", "ribbon", "ribbon", "ribbon"],
    win: "collectScore",
    arena: "bridge",
    target: 8,
    scoreTarget: 3600,
    enemyBonus: 4,
    hazards: 9
  },
  starfieldSoiree: {
    title: "Starfield Soiree",
    lore: "The sky drops low enough to touch. Star rivals squeeze the map with hazards while invitations drift between constellations.",
    objective: "Collect 5 invitations and score 4000.",
    chain: ["invitation", "gift", "invitation", "ribbon", "invitation", "invitation", "invitation"],
    win: "invitations",
    arena: "moon",
    target: 5,
    scoreTarget: 4000,
    enemyBonus: 4,
    hazards: 10
  },
  crownBoss: {
    title: "Boss: Crown Krait",
    lore: "Crown Krait guards the old royal streamer spool. Its crown turns weak segments into armor until horns and ribbons interrupt the ceremony.",
    objective: "Collect horns and ribbons, then break Crown Krait's boss bar.",
    chain: ["partyHorn", "ribbon", "partyHorn", "cakeTopper"],
    win: "boss",
    arena: "bridge",
    enemyBonus: 0,
    hazards: 10,
    boss: { type: "dj", name: "Crown Krait", color: "#fdcb6e", hp: 36, speed: 145, attack: 520 }
  },
  afterpartyAlley: {
    title: "Afterparty Alley",
    lore: "Behind the stage, every rival who missed the main parade tries to prove they still belong.",
    objective: "Defeat all alley rivals after collecting the horn chain.",
    chain: ["gift", "partyHorn", "gift", "partyHorn", "ribbon"],
    win: "defeatAll",
    arena: "lanterns",
    enemyBonus: 5,
    hazards: 10
  },
  bubbleBay: {
    title: "Bubble Bay",
    lore: "Balloons float on the water here. Bubble snakes hide behind them and shove the route sideways.",
    objective: "Pop 15 balloons and collect 3 balloon keys.",
    chain: ["balloonKey", "ribbon", "balloonKey", "candle", "balloonKey"],
    win: "balloons",
    arena: "gate",
    target: 15,
    enemyBonus: 5,
    hazards: 13
  },
  emberArcade: {
    title: "Ember Arcade",
    lore: "The arcade machines still play the oldest party songs, but ember rivals turn every lane into pressure.",
    objective: "Collect 8 arcade tokens and score 5200.",
    chain: ["sprinkles", "gift", "candle", "ribbon", "partyHorn", "cakeTopper", "gift", "invitation"],
    win: "collectScore",
    arena: "stage",
    target: 8,
    scoreTarget: 5200,
    enemyBonus: 5,
    hazards: 12
  },
  prismPalace: {
    title: "Prism Palace",
    lore: "Every color in Snakephoria meets in the palace glass. Prism rivals change patterns so the last map route never feels still.",
    objective: "Complete the prism relic chain and defeat every rival.",
    chain: ["cupcake", "sprinkles", "ribbon", "balloonKey", "partyHorn", "invitation", "cakeTopper"],
    win: "defeatAll",
    arena: "frosting",
    enemyBonus: 6,
    hazards: 12
  },
  grandFinaleBoss: {
    title: "Boss: Grand Coil Comet",
    lore: "The final rival is the comet that circles every festival year. It carries pieces of every party song, every lost invitation, and every boss pattern.",
    objective: "Collect the final relic chain, then defeat the Grand Coil Comet.",
    chain: ["invitation", "partyHorn", "ribbon", "balloonKey", "cakeTopper"],
    win: "boss",
    arena: "stage",
    enemyBonus: 2,
    hazards: 14,
    boss: { type: "dj", name: "Grand Coil Comet", color: "#ff7675", hp: 48, speed: 128, attack: 440 }
  }
};

let state = createState();
let lastTime = 0;
let accumulator = 0;
let touchStart = null;
let best = Number(localStorage.getItem("snakephoria-best") || 0);
let audioCtx = null;
let musicTimer = null;
let musicStep = 0;
let nextMusicDelay = 220;
let panelTimer = null;
let audioMuted = false;
const discoveredBestiary = new Set(JSON.parse(localStorage.getItem("snakephoria-bestiary") || "[]"));
let savedGame = JSON.parse(localStorage.getItem("snakephoria-save") || "null");
let furthestLevelIndex = savedGame?.furthestLevelIndex ?? Number(localStorage.getItem("snakephoria-furthest") || 0);
bestEl.textContent = best;

function createState(practice = false, difficulty = "normal", levelId = "garden") {
  const level = LEVELS[levelId];
  return {
    running: false,
    paused: false,
    over: false,
    practice,
    difficulty,
    levelId,
    level,
    chainIndex: 0,
    balloonsPopped: 0,
    invitations: 0,
    playerHp: DIFFICULTIES[difficulty].hp,
    spikes: 0,
    playerInvuln: 0,
    attackCooldown: 0,
    snake: [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10, weak: true },
      { x: 5, y: 10 }
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    score: 0,
    combo: 1,
    comboTimer: 0,
    fever: 0,
    feverActive: 0,
    slowMo: 0,
    growth: 0,
    foods: [],
    hazards: [],
    blocks: [],
    boss: null,
    completedLevel: null,
    enemies: [],
    playerShots: [],
    enemyShots: [],
    confetti: [],
    sparks: [],
    victoryCelebration: 0,
    fireworkCooldown: 0,
    dying: 0,
    shake: 0,
    stepCount: 0,
    message: "Snakephoria"
  };
}

function startGame(practice = false, forcedLevelId = null, resetCampaign = false) {
  initAudio();
  startMusic();
  enterGameScreen();
  if (panelTimer) clearTimeout(panelTimer);
  const difficulty = practice ? "easy" : difficultySelect.value;
  if (resetCampaign) {
    furthestLevelIndex = 0;
    savedGame = null;
    localStorage.removeItem("snakephoria-save");
  }
  const levelId = forcedLevelId || (practice ? "garden" : getCampaignLevelId());
  state = createState(practice, difficulty, levelId);
  state.running = true;
  discoverForLevel(levelId);
  panel.querySelector("h1").textContent = state.level.title;
  panel.querySelector("p").textContent = state.level.lore;
  startButton.textContent = "New Campaign";
  practiceButton.textContent = "Practice";
  loadButton.textContent = "Load Save";
  continueButton.hidden = true;
  setupArena();
  positionPlayerForArena();
  spawnChainItem();
  state.foods.push(spawn("cupcake"), spawn("gift"));
  for (let i = 0; i < (practice ? 3 : state.level.hazards); i += 1) state.hazards.push(spawn("balloon"));
  spawnEnemyWave();
  panel.classList.add("hidden");
  updateHud();
}

function enterGameScreen() {
  document.body.classList.remove("intro-active");
}

function showTitleScreen() {
  state.running = false;
  state.paused = false;
  stopMusic();
  panel.classList.add("hidden");
  document.body.classList.add("intro-active");
  updateTitleStats();
}

function updateTitleStats() {
  titleBestScore.textContent = best;
  titleCampaignLevel.textContent = Math.min(furthestLevelIndex + 1, LEVEL_ORDER.length);
  titleDiscovered.textContent = `${discoveredBestiary.size}/${BESTIARY.length}`;
}

function getCampaignLevelId() {
  const index = Math.min(furthestLevelIndex, LEVEL_ORDER.length - 1);
  return LEVEL_ORDER[Math.max(0, index)];
}

function saveCampaign(levelId = getCampaignLevelId()) {
  savedGame = {
    furthestLevelIndex,
    levelId,
    best,
    discovered: [...discoveredBestiary],
    savedAt: Date.now()
  };
  localStorage.setItem("snakephoria-save", JSON.stringify(savedGame));
}

function loadCampaign() {
  const raw = localStorage.getItem("snakephoria-save");
  if (!raw) {
    panel.querySelector("h1").textContent = "No Save Yet";
    panel.querySelector("p").textContent = "Finish a level to create a campaign save, or start a new campaign.";
    panel.classList.remove("hidden");
    enterGameScreen();
    return;
  }
  savedGame = JSON.parse(raw);
  furthestLevelIndex = savedGame.furthestLevelIndex || 0;
  for (const id of savedGame.discovered || []) discoveredBestiary.add(id);
  startGame(false, savedGame.levelId || getCampaignLevelId());
}

function spawn(type) {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * (COLS - 2)) + 1,
      y: Math.floor(Math.random() * (ROWS - 4)) + 2,
      type,
      phase: Math.random() * Math.PI * 2
    };
    if (type === "balloon") configureBalloon(cell);
  } while (occupied(cell.x, cell.y));
  return cell;
}

function configureBalloon(balloon) {
  const levelIndex = Math.max(0, LEVEL_ORDER.indexOf(state.levelId));
  const movingChance = Math.min(0.82, 0.2 + levelIndex * 0.035 + (state.level?.boss ? 0.12 : 0));
  if (Math.random() > movingChance && !state.level?.boss) return;
  const horizontal = Math.random() < 0.5;
  const dir = Math.random() < 0.5 ? -1 : 1;
  balloon.moving = true;
  balloon.dx = horizontal ? dir : 0;
  balloon.dy = horizontal ? 0 : dir;
  balloon.moveAcc = Math.random() * 600;
  balloon.moveDelay = Math.max(360, 950 - levelIndex * 28 - (state.level?.boss ? 120 : 0));
}

function occupied(x, y) {
  return state.snake.some((part) => part.x === x && part.y === y)
    || state.foods.some((item) => item.x === x && item.y === y)
    || state.hazards.some((item) => item.x === x && item.y === y)
    || state.blocks.some((block) => block.x === x && block.y === y)
    || state.enemies.some((enemy) => enemy.snake.some((part) => part.x === x && part.y === y));
}

function setupArena() {
  state.blocks = [];
  const addRect = (x, y, w, h) => {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) state.blocks.push({ x: xx, y: yy });
    }
  };
  if (state.level.arena === "bridge") {
    addRect(8, 4, 2, 11);
    addRect(20, 5, 2, 10);
  }
  if (state.level.arena === "gate") {
    addRect(4, 6, 5, 1);
    addRect(21, 6, 5, 1);
    addRect(4, 14, 5, 1);
    addRect(21, 14, 5, 1);
  }
  if (state.level.arena === "frosting") {
    addRect(6, 5, 4, 2);
    addRect(20, 5, 4, 2);
    addRect(6, 14, 4, 2);
    addRect(20, 14, 4, 2);
  }
  if (state.level.arena === "lanterns") {
    addRect(5, 5, 3, 8);
    addRect(14, 3, 2, 9);
    addRect(22, 8, 3, 8);
  }
  if (state.level.arena === "pinata") {
    addRect(3, 9, 8, 2);
    addRect(19, 9, 8, 2);
    addRect(14, 4, 2, 5);
    addRect(14, 12, 2, 5);
  }
  if (state.level.arena === "moon") {
    addRect(8, 7, 3, 3);
    addRect(19, 7, 3, 3);
    addRect(13, 13, 4, 2);
  }
  if (state.level.arena === "stage") {
    addRect(3, 4, 4, 12);
    addRect(23, 4, 4, 12);
    addRect(11, 8, 8, 3);
  }
}

function positionPlayerForArena() {
  const spawns = {
    garden: { x: 8, y: 10, dir: { x: 1, y: 0 } },
    bridge: { x: 4, y: 10, dir: { x: 1, y: 0 } },
    gate: { x: 14, y: 17, dir: { x: 1, y: 0 } },
    frosting: { x: 14, y: 10, dir: { x: 1, y: 0 } },
    lanterns: { x: 4, y: 16, dir: { x: 1, y: 0 } },
    pinata: { x: 6, y: 4, dir: { x: 1, y: 0 } },
    moon: { x: 4, y: 10, dir: { x: 1, y: 0 } },
    stage: { x: 14, y: 16, dir: { x: 1, y: 0 } }
  };
  const spawn = spawns[state.level.arena] || spawns.garden;
  state.dir = { ...spawn.dir };
  state.nextDir = { ...spawn.dir };
  state.snake = [
    { x: spawn.x, y: spawn.y },
    { x: spawn.x - spawn.dir.x, y: spawn.y - spawn.dir.y },
    { x: spawn.x - spawn.dir.x * 2, y: spawn.y - spawn.dir.y * 2, weak: true },
    { x: spawn.x - spawn.dir.x * 3, y: spawn.y - spawn.dir.y * 3 }
  ];

  if (state.snake.some((part) => state.blocks.some((block) => block.x === part.x && block.y === part.y))) {
    state.snake = [
      { x: 3, y: 17 },
      { x: 2, y: 17 },
      { x: 1, y: 17, weak: true },
      { x: 0, y: 17 }
    ];
    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };
  }
}

function spawnEnemyWave() {
  const config = DIFFICULTIES[state.difficulty];
  const enemyCount = Math.max(0, config.count + state.level.enemyBonus);
  if (state.level.boss) spawnBoss();
  for (let i = 0; i < enemyCount; i += 1) {
    const template = ENEMY_TYPES[i % ENEMY_TYPES.length];
    discoverBestiary(template.type);
    const x = COLS - 5 - (i % 2) * 5;
    const y = 5 + i * 4;
    const dir = i % 2 === 0 ? { x: -1, y: 0 } : { x: 0, y: 1 };
    const enemy = {
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${i}`,
      type: template.type,
      name: template.name,
      color: template.color,
      dir,
      nextDir: dir,
      stepAcc: 0,
      attackTimer: 600 + i * 380,
      defeated: false,
      snake: [
        { x, y },
        { x: x + 1, y },
        { x: x + 2, y, weak: true },
        { x: x + 3, y },
        { x: x + 4, y, weak: i % 2 === 0 }
      ]
    };
    state.enemies.push(enemy);
  }
}

function spawnBoss() {
  const bossConfig = state.level.boss;
  discoverBestiary(bossConfig.type);
  const x = 22;
  const y = 10;
  const boss = {
    id: `boss-${bossConfig.type}`,
    type: "boss",
    bossType: bossConfig.type,
    name: bossConfig.name,
    color: bossConfig.color,
    hp: bossConfig.hp,
    maxHp: bossConfig.hp,
    dir: { x: -1, y: 0 },
    stepAcc: 0,
    attackTimer: 700,
    defeated: false,
    snake: [
      { x, y },
      { x: x + 1, y },
      { x: x + 2, y, weak: true },
      { x: x + 3, y },
      { x: x + 4, y, weak: true },
      { x: x + 5, y }
    ]
  };
  state.boss = boss;
  state.enemies.push(boss);
}

function markWeakSegment(parts) {
  if (parts.length < 4) return;
  if (parts.some((part) => part.weak)) return;
  const index = 2 + Math.floor(Math.random() * Math.max(1, parts.length - 2));
  parts[index].weak = true;
}

function spawnChainItem() {
  const type = state.level.chain[state.chainIndex];
  if (!type) return;
  if (state.foods.some((item) => item.story)) return;
  const item = spawn(type);
  item.story = true;
  state.foods.push(item);
}

function handleStoryItem(item) {
  if (!item.story) return;
  state.chainIndex += 1;
  state.score += 180 + state.chainIndex * 90;
  playFever();
  if (item.type === "partyHorn") {
    state.enemies.forEach((enemy) => {
      enemy.stepAcc = -650;
      enemy.attackTimer += 900;
      markWeakSegment(enemy.snake);
    });
  }
  if (item.type === "balloonKey") {
    state.fever = Math.min(100, state.fever + 35);
  }
  if (item.type === "invitation") {
    state.invitations += 1;
  }
  if (state.chainIndex < state.level.chain.length) {
    spawnChainItem();
  }
  checkLevelWin();
}

function checkLevelWin() {
  if (state.over) return;
  if (state.level.win === "chain" && state.chainIndex >= state.level.chain.length) {
    winGame();
  }
  if (state.level.win === "defeatAll" && state.enemies.length === 0) {
    winGame();
  }
  if (state.level.win === "balloons"
    && state.balloonsPopped >= state.level.target
    && state.chainIndex >= state.level.chain.length) {
    winGame();
  }
  if (state.level.win === "invitations"
    && state.invitations >= state.level.target
    && state.score >= state.level.scoreTarget) {
    winGame();
  }
  if (state.level.win === "collectScore"
    && state.chainIndex >= state.level.target
    && state.score >= state.level.scoreTarget) {
    winGame();
  }
  if (state.level.win === "boss" && state.boss?.defeated) {
    winGame();
  }
}

function objectiveStatus() {
  const nextItem = state.level.chain[state.chainIndex] || "complete";
  if (state.level.win === "chain") return `Objective: next ${labelItem(nextItem)} (${state.chainIndex}/${state.level.chain.length}).`;
  if (state.level.win === "defeatAll") return `Objective: defeat all rivals. Enemies left ${state.enemies.length}. Next clue: ${labelItem(nextItem)}.`;
  if (state.level.win === "balloons") return `Objective: balloons ${state.balloonsPopped}/${state.level.target}, next ${labelItem(nextItem)}.`;
  if (state.level.win === "collectScore") return `Objective: ribbons ${state.chainIndex}/${state.level.target}, score ${state.score}/${state.level.scoreTarget}.`;
  if (state.level.win === "boss") {
    const shield = state.chainIndex >= state.level.chain.length ? "shield down" : `shield needs ${labelItem(nextItem)}`;
    const bossHp = state.boss ? `${state.boss.hp}/${state.boss.maxHp}` : "summoning";
    return `Objective: ${shield}. Boss ${bossHp}.`;
  }
  return `Objective: invitations ${state.invitations}/${state.level.target}, score ${state.score}/${state.level.scoreTarget}.`;
}

function labelItem(type) {
  return {
    cupcake: "Cupcake",
    sprinkles: "Sprinkles",
    candle: "Candle",
    cakeTopper: "Cake Topper",
    gift: "Gift",
    partyHorn: "Party Horn",
    ribbon: "Ribbon",
    balloonKey: "Balloon Key",
    invitation: "Invitation"
  }[type] || type;
}

function discoverForLevel(levelId) {
  if (levelId === "garden") {
    discoverBestiary("sunny");
    discoverBestiary("basil");
    discoverBestiary("bluebell");
  }
}

function discoverBestiary(id) {
  if (!id || discoveredBestiary.has(id)) return;
  discoveredBestiary.add(id);
  localStorage.setItem("snakephoria-bestiary", JSON.stringify([...discoveredBestiary]));
}

function renderBestiary() {
  bestiaryListEl.innerHTML = "";
  for (const entry of BESTIARY) {
    const unlocked = discoveredBestiary.has(entry.id);
    const row = document.createElement("div");
    row.className = unlocked ? "" : "locked";
    const chip = document.createElement("span");
    chip.className = `chip ${unlocked ? entry.chip : "unknown"}`;
    const text = document.createElement("p");
    text.textContent = unlocked ? `${entry.name}: ${entry.text}` : "?????: Encounter this party friend to reveal the entry.";
    row.append(chip, text);
    bestiaryListEl.append(row);
  }
}

function renderWorldMap() {
  worldMapEl.innerHTML = "";
  const currentIndex = LEVEL_ORDER.indexOf(state.running || state.over ? state.levelId : getCampaignLevelId());
  LEVEL_ORDER.forEach((levelId, index) => {
    const node = document.createElement("div");
    const level = LEVELS[levelId];
    node.className = "map-node";
    if (level.boss) node.classList.add("boss");
    if (index < furthestLevelIndex) node.classList.add("done");
    if (index === currentIndex) node.classList.add("current");
    node.textContent = `${index + 1}. ${level.title.replace("Boss: ", "")}`;
    worldMapEl.append(node);
  });
}

function setDirection(dir) {
  if (!dir || !state.running) return;
  if (dir.x + state.dir.x === 0 && dir.y + state.dir.y === 0) return;
  state.nextDir = dir;
}

function updateMovingBalloons(delta) {
  for (const balloon of state.hazards) {
    if (!balloon.moving) continue;
    balloon.moveAcc += delta;
    if (balloon.moveAcc < balloon.moveDelay) continue;
    balloon.moveAcc = 0;
    const next = wrap({ x: balloon.x + balloon.dx, y: balloon.y + balloon.dy });
    const blocked = state.blocks.some((block) => block.x === next.x && block.y === next.y)
      || state.hazards.some((other) => other !== balloon && other.x === next.x && other.y === next.y)
      || state.enemies.some((enemy) => enemy.snake.some((part) => part.x === next.x && part.y === next.y));
    if (blocked) {
      balloon.dx *= -1;
      balloon.dy *= -1;
      continue;
    }
    balloon.x = next.x;
    balloon.y = next.y;
    if (state.snake.some((part) => part.x === balloon.x && part.y === balloon.y)) {
      if (state.feverActive > 0) {
        const index = state.hazards.indexOf(balloon);
        if (index >= 0) popHazard(index);
      } else if (state.spikes > 0) {
        state.spikes -= 1;
        const index = state.hazards.indexOf(balloon);
        if (index >= 0) popHazard(index, true);
      } else {
        damagePlayer("Bumped by a drifting balloon");
      }
    }
  }
}

function tick(delta) {
  if (!state.running || state.paused || state.over) return;

  state.comboTimer = Math.max(0, state.comboTimer - delta);
  if (state.comboTimer === 0) state.combo = 1;
  state.feverActive = Math.max(0, state.feverActive - delta);
  state.slowMo = Math.max(0, state.slowMo - delta);
  state.playerInvuln = Math.max(0, state.playerInvuln - delta);
  state.attackCooldown = Math.max(0, state.attackCooldown - delta);
  updateMovingBalloons(delta);
  updateProjectiles(delta);
  updateEnemies(delta);

  const stepDelay = (state.slowMo > 0 ? BASE_STEP * 1.45 : BASE_STEP) - Math.min(34, state.score / 80);
  accumulator += delta;
  while (accumulator >= stepDelay) {
    moveSnake();
    accumulator -= stepDelay;
  }
}

function moveSnake() {
  state.dir = state.nextDir;
  const head = state.snake[0];
  const next = wrap({ x: head.x + state.dir.x, y: head.y + state.dir.y });
  state.stepCount += 1;

  if (state.blocks.some((block) => block.x === next.x && block.y === next.y)) {
    damagePlayer("Crashed into the arena props");
    return;
  }

  const hitSelf = state.snake.some((part, index) => index > 0 && part.x === next.x && part.y === next.y);
  if (hitSelf && state.feverActive <= 0) return endGame("Tangled streamers");

  const enemyCrash = state.enemies.find((enemy) => enemy.snake.some((part) => part.x === next.x && part.y === next.y));
  if (enemyCrash && state.feverActive <= 0) {
    damagePlayer("Rammed by " + enemyCrash.name);
    return;
  }
  if (enemyCrash) {
    damageEnemy(enemyCrash, 0, 2);
  }

  const hazardIndex = state.hazards.findIndex((item) => item.x === next.x && item.y === next.y);
  if (hazardIndex >= 0 && state.feverActive <= 0) {
    if (state.spikes > 0) {
      state.spikes -= 1;
      popHazard(hazardIndex, true);
    } else {
    state.combo = 1;
    state.fever = Math.max(0, state.fever - 18);
    bounceFromHazard();
    return;
    }
  }
  if (hazardIndex >= 0 && state.feverActive > 0) {
    popHazard(hazardIndex);
  }

  state.snake.unshift(next);
  const foodIndex = state.foods.findIndex((item) => item.x === next.x && item.y === next.y);
  if (foodIndex >= 0) eatFood(foodIndex);

  if (state.growth > 0) {
    state.growth -= 1;
  } else {
    state.snake.pop();
  }

  if (state.stepCount % 18 === 0 && state.hazards.length < (state.practice ? 5 : 9)) {
    state.hazards.push(spawn("balloon"));
  }
  if (state.stepCount % 12 === 0) markWeakSegment(state.snake);
}

function wrap(cell) {
  return {
    x: (cell.x + COLS) % COLS,
    y: (cell.y + ROWS) % ROWS
  };
}

function firePlayerShot() {
  if (!state.running || state.paused || state.over || state.attackCooldown > 0) return;
  const head = state.snake[0];
  state.playerShots.push({
    x: head.x + 0.5 + state.dir.x * 0.58,
    y: head.y + 0.5 + state.dir.y * 0.58,
    dir: { ...state.dir },
    speed: state.feverActive > 0 ? 13 : 9,
    life: 920,
    owner: "player",
    color: state.feverActive > 0 ? COLORS.yellow : COLORS.blue
  });
  state.attackCooldown = state.feverActive > 0 ? 140 : 320;
  playShot();
}

function updateProjectiles(delta) {
  moveShots(state.playerShots, delta, true);
  moveShots(state.enemyShots, delta, false);
}

function moveShots(shots, delta, fromPlayer) {
  for (let i = shots.length - 1; i >= 0; i -= 1) {
    const shot = shots[i];
    shot.x += shot.dir.x * shot.speed * delta / 1000;
    shot.y += shot.dir.y * shot.speed * delta / 1000;
    shot.life -= delta;
    const cell = wrap({ x: Math.floor(shot.x), y: Math.floor(shot.y) });
    shot.x = cell.x + (shot.x - Math.floor(shot.x));
    shot.y = cell.y + (shot.y - Math.floor(shot.y));

    if (state.blocks.some((block) => block.x === cell.x && block.y === cell.y)) {
      burst(cell.x, cell.y, "balloon");
      shots.splice(i, 1);
      continue;
    }

    if (fromPlayer && hitEnemyShot(cell.x, cell.y)) {
      shots.splice(i, 1);
      continue;
    }
    if (!fromPlayer && hitPlayerShot(cell.x, cell.y)) {
      shots.splice(i, 1);
      continue;
    }
    if (shot.life <= 0) shots.splice(i, 1);
  }
}

function hitEnemyShot(x, y) {
  for (const enemy of state.enemies) {
    const index = enemy.snake.findIndex((part) => part.x === x && part.y === y);
    if (index >= 0) {
      damageEnemy(enemy, index, index === 0 ? 2 : enemy.snake[index].weak ? 3 : 1);
      return true;
    }
  }
  return false;
}

function hitPlayerShot(x, y) {
  const index = state.snake.findIndex((part) => part.x === x && part.y === y);
  if (index < 0) return false;
  if (index === 0) {
    damagePlayer("Tagged by a rival shot");
    return true;
  }
  if (state.snake[index].weak) {
    segmentExplosion(state.snake[index], index);
    state.snake.splice(index, 1);
    state.shake = Math.max(state.shake, 9);
    if (state.snake.length < 3) damagePlayer("Your weak segments shattered");
  } else {
    state.fever = Math.max(0, state.fever - 8);
    burst(x, y, "balloon");
  }
  updateHud();
  return true;
}

function damageEnemy(enemy, segmentIndex, power) {
  if (enemy.defeated) return;
  const target = enemy.snake[Math.min(segmentIndex, enemy.snake.length - 1)];
  if (target) segmentExplosion(target, segmentIndex);
  if (enemy.type === "boss") {
    const shieldDown = state.chainIndex >= state.level.chain.length;
    const weakBonus = target?.weak ? 2 : 1;
    const damage = shieldDown ? power * weakBonus : 1;
    enemy.hp = Math.max(0, enemy.hp - damage);
    markWeakSegment(enemy.snake);
    state.score += 140 * damage;
    state.fever = Math.min(100, state.fever + 4 * damage);
    state.shake = Math.max(state.shake, shieldDown ? 16 : 8);
    if (!shieldDown) playShield();
    else playPop();
    if (enemy.hp <= 0) defeatEnemy(enemy);
    updateHud();
    return;
  }
  const removeCount = Math.min(power, Math.max(1, enemy.snake.length - 2));
  enemy.snake.splice(Math.max(1, segmentIndex), removeCount);
  enemy.snake.forEach((part) => {
    if (Math.random() < 0.28) part.weak = true;
  });
  markWeakSegment(enemy.snake);
  state.score += 110 * power;
  state.fever = Math.min(100, state.fever + 5 * power);
  state.shake = Math.max(state.shake, 8 + power * 2);
  playPop();
  if (enemy.snake.length <= 2 || segmentIndex === 0 && power >= 2) defeatEnemy(enemy);
  updateHud();
}

function defeatEnemy(enemy) {
  enemy.defeated = true;
  enemy.snake.forEach((part, index) => segmentExplosion(part, index));
  state.score += 650;
  state.enemies = state.enemies.filter((item) => item !== enemy);
  if (enemy === state.boss) state.boss.defeated = true;
  if (state.level.win === "invitations" && state.invitations < state.level.target) {
    const invite = spawn("invitation");
    invite.story = true;
    state.foods.push(invite);
  }
  playFever();
  checkLevelWin();
}

function damagePlayer(reason) {
  if (state.feverActive > 0 || state.playerInvuln > 0 || state.over) return;
  state.playerHp -= 1;
  state.playerInvuln = 950;
  state.combo = 1;
  state.fever = Math.max(0, state.fever - 25);
  state.shake = Math.max(state.shake, 18);
  playPop();
  burst(state.snake[0].x, state.snake[0].y, "balloon");
  if (state.playerHp <= 0) endGame(reason);
  updateHud();
}

function updateEnemies(delta) {
  const config = DIFFICULTIES[state.difficulty];
  for (const enemy of [...state.enemies]) {
    enemy.stepAcc += delta;
    enemy.attackTimer -= delta;
    const moveSpeed = enemy.type === "boss" ? state.level.boss.speed : config.speed;
    const attackSpeed = enemy.type === "boss" ? state.level.boss.attack : config.attack;
    if (enemy.stepAcc >= moveSpeed) {
      chooseEnemyDirection(enemy, config);
      moveEnemy(enemy);
      enemy.stepAcc = 0;
    }
    if (enemy.attackTimer <= 0) {
      enemyAttack(enemy, config);
      enemy.attackTimer = attackSpeed + Math.random() * 420;
    }
  }
}

function chooseEnemyDirection(enemy, config) {
  const head = enemy.snake[0];
  const player = state.snake[0];
  const options = Object.values(DIRS).filter((dir, index, list) => index < 4 && !(dir.x + enemy.dir.x === 0 && dir.y + enemy.dir.y === 0));
  let preferred = options[Math.floor(Math.random() * options.length)];
  if (enemy.type === "rival" && Math.random() < config.accuracy) {
    preferred = Math.abs(player.x - head.x) > Math.abs(player.y - head.y)
      ? { x: Math.sign(player.x - head.x), y: 0 }
      : { x: 0, y: Math.sign(player.y - head.y) };
  }
  if (enemy.type === "charger" && Math.random() < 0.72) {
    preferred = Math.abs(player.x - head.x) < 3 ? { x: 0, y: Math.sign(player.y - head.y) } : { x: Math.sign(player.x - head.x), y: 0 };
  }
  if (enemy.type === "sprayer" && state.stepCount % 8 < 4) {
    preferred = enemy.dir.y === 0 ? { x: 0, y: Math.sign(player.y - head.y) || 1 } : { x: Math.sign(player.x - head.x) || -1, y: 0 };
  }
  if (enemy.type === "guard") {
    const food = state.foods[0] || player;
    preferred = Math.abs(food.x - head.x) > Math.abs(food.y - head.y)
      ? { x: Math.sign(food.x - head.x), y: 0 }
      : { x: 0, y: Math.sign(food.y - head.y) };
  }
  if (preferred.x === 0 && preferred.y === 0) preferred = options[0];
  if (preferred.x + enemy.dir.x !== 0 || preferred.y + enemy.dir.y !== 0) enemy.dir = preferred;
}

function moveEnemy(enemy) {
  const head = enemy.snake[0];
  const next = wrap({ x: head.x + enemy.dir.x, y: head.y + enemy.dir.y });
  if (state.blocks.some((block) => block.x === next.x && block.y === next.y)) {
    enemy.dir = { x: -enemy.dir.y, y: enemy.dir.x };
    return;
  }
  if (state.snake.some((part) => part.x === next.x && part.y === next.y)) {
    damagePlayer(enemy.name + " crashed into you");
  }
  if (enemy.snake.some((part, index) => index > 0 && part.x === next.x && part.y === next.y)) {
    enemy.dir = { x: -enemy.dir.y, y: enemy.dir.x };
    return;
  }
  enemy.snake.unshift({ ...next });
  enemy.snake.pop();
  if (Math.random() < 0.08) markWeakSegment(enemy.snake);
}

function enemyAttack(enemy, config) {
  const head = enemy.snake[0];
  const player = state.snake[0];
  const baseDir = Math.random() < config.accuracy
    ? aimDirection(head, player)
    : enemy.dir;
  if (enemy.type === "boss") {
    bossAttack(enemy, baseDir);
    playShot();
    return;
  }
  if (enemy.type === "sprayer") {
    const dirs = [baseDir, { x: -baseDir.y, y: baseDir.x }, { x: baseDir.y, y: -baseDir.x }];
    dirs.forEach((dir) => createEnemyShot(head, dir, enemy.color, 6.3));
  } else if (enemy.type === "charger") {
    createEnemyShot(head, baseDir, enemy.color, 8.6);
  } else {
    createEnemyShot(head, baseDir, enemy.color, 7.2);
  }
  playShot();
}

function bossAttack(enemy, baseDir) {
  if (enemy.bossType === "frostfang") {
    createEnemyShot(enemy.snake[0], baseDir, enemy.color, 7.6);
    createEnemyShot(enemy.snake[0], { x: -baseDir.y, y: baseDir.x }, COLORS.blue, 5.8);
    createEnemyShot(enemy.snake[0], { x: baseDir.y, y: -baseDir.x }, COLORS.blue, 5.8);
  }
  if (enemy.bossType === "pinata") {
    Object.values(DIRS).slice(0, 4).forEach((dir) => createEnemyShot(enemy.snake[0], dir, [COLORS.pink, COLORS.yellow, COLORS.orange, COLORS.blue][Math.floor(Math.random() * 4)], 6.8));
    if (Math.random() < 0.35) {
      const candy = spawn("sprinkles");
      candy.story = state.chainIndex < state.level.chain.length;
      state.foods.push(candy);
    }
  }
  if (enemy.bossType === "dj") {
    const dirs = Object.values(DIRS).slice(0, 4);
    dirs.forEach((dir, index) => {
      setTimeout(() => createEnemyShot(enemy.snake[0], dir, index % 2 ? COLORS.purple : COLORS.blue, 8.2), index * 80);
    });
    state.hazards.push(spawn("balloon"));
  }
}

function aimDirection(from, to) {
  if (Math.abs(to.x - from.x) > Math.abs(to.y - from.y)) return { x: Math.sign(to.x - from.x) || 1, y: 0 };
  return { x: 0, y: Math.sign(to.y - from.y) || 1 };
}

function createEnemyShot(head, dir, color, speed) {
  state.enemyShots.push({
    x: head.x + 0.5 + dir.x * 0.58,
    y: head.y + 0.5 + dir.y * 0.58,
    dir,
    speed,
    life: 1300,
    owner: "enemy",
    color
  });
}

function winGame() {
  state.running = false;
  state.over = true;
  state.victoryCelebration = 7200;
  state.fireworkCooldown = 0;
  state.shake = Math.max(state.shake, 14);
  state.completedLevel = state.levelId;
  furthestLevelIndex = Math.max(furthestLevelIndex, LEVEL_ORDER.indexOf(state.levelId) + 1);
  localStorage.setItem("snakephoria-furthest", String(furthestLevelIndex));
  best = Math.max(best, state.score);
  localStorage.setItem("snakephoria-best", String(best));
  saveCampaign(nextLevelId() || state.levelId);
  panel.querySelector("h1").textContent = "YOU WON!";
  panel.querySelector("p").textContent = `${state.level.objective} Score ${state.score}. Campaign saved.`;
  const next = nextLevelId();
  startButton.textContent = "Replay Level";
  continueButton.hidden = !next;
  continueButton.textContent = next ? `Continue: ${LEVELS[next].title}` : "Campaign Complete";
  practiceButton.textContent = "Practice";
  panel.classList.remove("hidden");
  playVictoryFanfare();
  for (let i = 0; i < 6; i += 1) setTimeout(() => launchFirework(), i * 180);
  updateHud();
}

function nextLevelId() {
  const index = LEVEL_ORDER.indexOf(state.completedLevel || getCampaignLevelId());
  if (index < 0 || index >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[index + 1];
}

function eatFood(index) {
  const item = state.foods.splice(index, 1)[0];
  state.comboTimer = 3600;
  state.combo = Math.min(8, state.combo + 1);
  state.fever = Math.min(100, state.fever + 13 + state.combo);
  state.growth += item.type === "cupcake" ? 2 : 1;

  if (item.type === "gift") {
    const roll = Math.random();
    if (roll < 0.34) state.slowMo = 4200;
    else if (roll < 0.68) state.growth += 4;
    else state.fever = 100;
  }

  if (item.type === "candle") state.slowMo = 5200;
  if (item.type === "ribbon") {
    state.hazards = state.hazards.slice(0, Math.max(2, state.hazards.length - 2));
    state.slowMo = 3400;
  }
  if (item.type === "balloonKey") {
    state.hazards.forEach((hazard) => burst(hazard.x, hazard.y, "balloon"));
    state.balloonsPopped += Math.min(3, state.hazards.length);
    state.hazards = state.hazards.slice(0, Math.max(1, state.hazards.length - 3));
  }
  if (item.type === "cakeTopper") state.fever = 100;
  if (item.type === "spike") state.spikes = Math.min(2, state.spikes + 1);

  const base = item.type === "cupcake" ? 50 : item.type === "gift" ? 90 : item.type === "spike" ? 85 : 70;
  state.score += base * state.combo;
  playEat(item.type);
  burst(item.x, item.y, item.type);
  handleStoryItem(item);
  if (!state.over) state.foods.push(spawn(weightedFood()));
  if (state.foods.length < 3) state.foods.push(spawn(weightedFood()));
  updateHud();
}

function weightedFood() {
  const roll = Math.random();
  if (roll < 0.48) return "cupcake";
  if (roll < 0.72) return "gift";
  if (roll < 0.86) return "spike";
  return "candle";
}

function bounceFromHazard() {
  const head = state.snake[0];
  const rebound = wrap({ x: head.x - state.dir.x, y: head.y - state.dir.y });
  state.nextDir = { x: -state.dir.x, y: -state.dir.y };
  state.snake.unshift(rebound);
  state.snake.pop();
  burst(head.x + state.dir.x, head.y + state.dir.y, "balloon");
  updateHud();
}

function popHazard(index, spiked = false) {
  const hazard = state.hazards.splice(index, 1)[0];
  state.balloonsPopped += 1;
  state.score += spiked ? 175 : 125;
  state.fever = Math.min(100, state.fever + 6);
  playPop();
  balloonPopBurst(hazard.x, hazard.y, spiked);
  state.hazards.push(spawn("balloon"));
  checkLevelWin();
  updateHud();
}

function balloonPopBurst(x, y, spiked = false) {
  burst(x, y, "balloon");
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2;
  const colors = [COLORS.pink, COLORS.green, COLORS.blue, COLORS.yellow, COLORS.white];
  for (let i = 0; i < (spiked ? 24 : 12); i += 1) {
    const angle = Math.PI * 2 * i / (spiked ? 24 : 12);
    state.sparks.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * (spiked ? 7 : 4),
      vy: Math.sin(angle) * (spiked ? 7 : 4) - 1,
      life: 680 + Math.random() * 340,
      maxLife: 980,
      radius: spiked ? 7 + Math.random() * 8 : 4 + Math.random() * 6,
      color: colors[i % colors.length],
      shape: spiked ? i % 3 : 0
    });
  }
}

function launchFirework() {
  const x = 80 + Math.random() * (canvas.width - 160);
  const y = 70 + Math.random() * (canvas.height * 0.46);
  const palette = [COLORS.pink, COLORS.yellow, COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple, COLORS.white];
  for (let i = 0; i < 42; i += 1) {
    const angle = Math.PI * 2 * i / 42;
    const speed = 2.2 + Math.random() * 5.8;
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 900 + Math.random() * 520,
      maxLife: 1400,
      radius: 4 + Math.random() * 8,
      color: palette[i % palette.length],
      shape: i % 3
    });
  }
  for (let i = 0; i < 16; i += 1) {
    state.confetti.push({
      x,
      y,
      vx: -4 + Math.random() * 8,
      vy: -7 + Math.random() * 3,
      color: palette[i % palette.length],
      size: 7 + Math.random() * 11,
      spin: Math.random() * 8
    });
  }
}

function activateFever() {
  if (state.fever < 100 || !state.running || state.paused || state.over) return;
  state.fever = 0;
  state.feverActive = 6400;
  playFever();
  for (let i = 0; i < 52; i += 1) {
    state.confetti.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: -1 + Math.random() * 2,
      vy: 2 + Math.random() * 3,
      color: randomConfettiColor(),
      size: 5 + Math.random() * 8,
      spin: Math.random() * 8
    });
  }
  updateHud();
}

function burst(x, y, type) {
  const palette = type === "balloon"
    ? [COLORS.green, COLORS.pink, COLORS.blue]
    : [COLORS.yellow, COLORS.orange, COLORS.pink, COLORS.blue, COLORS.purple, COLORS.limeLight, COLORS.red];
  const amount = type === "balloon" ? 20 : 34;
  for (let i = 0; i < amount; i += 1) {
    const ring = i / amount * Math.PI * 2;
    state.confetti.push({
      x: x * TILE + TILE / 2,
      y: y * TILE + TILE / 2,
      vx: Math.cos(ring) * (1.6 + Math.random() * 4),
      vy: Math.sin(ring) * (1.6 + Math.random() * 4) - 1.2,
      color: palette[i % palette.length],
      size: 5 + Math.random() * 11,
      spin: Math.random() * 8
    });
  }
  for (let i = 0; i < 8; i += 1) {
    state.sparks.push({
      x: x * TILE + TILE / 2,
      y: y * TILE + TILE / 2,
      vx: -3 + Math.random() * 6,
      vy: -5 + Math.random() * 4,
      life: 520 + Math.random() * 260,
      maxLife: 780,
      radius: 5 + Math.random() * 10,
      color: palette[i % palette.length],
      shape: i % 3
    });
  }
}

function segmentExplosion(part, index) {
  const x = part.x * TILE + TILE / 2;
  const y = part.y * TILE + TILE / 2;
  const palette = [COLORS.green, COLORS.limeLight, COLORS.orange, COLORS.yellow, COLORS.pink, COLORS.blue];
  for (let i = 0; i < 26; i += 1) {
    const angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.28;
    const speed = 2.6 + Math.random() * 6 + index * 0.08;
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 820 + Math.random() * 460,
      maxLife: 1250,
      radius: 3 + Math.random() * 9,
      color: palette[(i + index) % palette.length],
      shape: i % 3
    });
  }
  for (let i = 0; i < 10; i += 1) {
    state.confetti.push({
      x,
      y,
      vx: -4 + Math.random() * 8,
      vy: -5 + Math.random() * 5,
      color: palette[(i + index) % palette.length],
      size: 7 + Math.random() * 10,
      spin: Math.random() * 8
    });
  }
}

function randomConfettiColor() {
  return [COLORS.red, COLORS.yellow, COLORS.pink, COLORS.blue, COLORS.green, COLORS.orange][Math.floor(Math.random() * 6)];
}

function endGame(message) {
  state.running = false;
  state.over = true;
  state.dying = 1700;
  state.shake = 26;
  state.message = message;
  best = Math.max(best, state.score);
  localStorage.setItem("snakephoria-best", String(best));
  bestEl.textContent = best;
  state.snake.forEach((part, index) => {
    setTimeout(() => segmentExplosion(part, index), index * 45);
  });
  playDeath();
  if (panelTimer) clearTimeout(panelTimer);
  panelTimer = setTimeout(() => {
    panel.classList.remove("hidden");
  }, 1050);
  panel.querySelector("h1").textContent = "Party Over";
  panel.querySelector("p").textContent = `${message}. Score ${state.score}.`;
  startButton.textContent = "Restart";
  practiceButton.textContent = "Practice";
}

function updateHud() {
  scoreEl.textContent = state.score;
  bestEl.textContent = best;
  comboEl.textContent = `x${state.combo}`;
  playerHpEl.textContent = state.playerHp;
  enemyCountEl.textContent = state.enemies.length;
  spikeCountEl.textContent = `${state.spikes}/2`;
  levelTitleEl.textContent = state.level.title;
  levelLoreEl.textContent = state.level.lore;
  objectiveTextEl.textContent = objectiveStatus();
  const feverValue = state.feverActive > 0 ? 100 : Math.round(state.fever);
  feverText.textContent = state.feverActive > 0 ? "Live" : `${feverValue}%`;
  feverBar.style.width = `${feverValue}%`;
  const activeBoss = state.boss && !state.boss.defeated ? state.boss : null;
  bossMeter.hidden = !activeBoss;
  if (activeBoss) {
    bossNameEl.textContent = activeBoss.name;
    bossHpText.textContent = `${activeBoss.hp}/${activeBoss.maxHp}`;
    bossHpBar.style.width = `${Math.max(0, activeBoss.hp / activeBoss.maxHp * 100)}%`;
  }
  renderWorldMap();
  renderBestiary();
}

function previewSelectedLevel() {
  const level = LEVELS[getCampaignLevelId()];
  if (!level || state.running) return;
  continueButton.hidden = true;
  levelTitleEl.textContent = level.title;
  levelLoreEl.textContent = level.lore;
  objectiveTextEl.textContent = `Objective: ${level.objective}`;
  panel.querySelector("h1").textContent = level.title;
  panel.querySelector("p").textContent = level.lore;
  renderWorldMap();
  renderBestiary();
}

function draw(time) {
  updateEffects(16);
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }
  drawWorld(time);
  drawFoods(time);
  drawHazards(time);
  drawEnemies(time);
  drawProjectiles(time);
  if (state.dying <= 0) drawSnake(time);
  else drawGhostSnake(time);
  drawSparks();
  drawConfetti();
  ctx.restore();
  if (state.paused) drawBanner("Paused");
  requestAnimationFrame(loop);
}

function updateEffects(delta) {
  state.dying = Math.max(0, state.dying - delta);
  state.shake = Math.max(0, state.shake - 0.5);
  state.victoryCelebration = Math.max(0, state.victoryCelebration - delta);
  if (state.victoryCelebration > 0) {
    state.fireworkCooldown -= delta;
    if (state.fireworkCooldown <= 0) {
      launchFirework();
      state.fireworkCooldown = 220 + Math.random() * 280;
    }
  }
}

function drawWorld(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const palette = arenaPalette();
  sky.addColorStop(0, palette.top);
  sky.addColorStop(0.72, palette.mid);
  sky.addColorStop(0.721, COLORS.grass);
  sky.addColorStop(1, palette.ground);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCloud(128, 58, 1);
  drawCloud(760, 42, 0.86);
  drawCloud(582, 176, 0.45);
  drawBunting(time);
  drawHorizonLandmark(time);
  drawSceneProps(time);
  drawArenaBlocks(time);
  drawGroundDetails(time);
}

function arenaPalette() {
  return {
    garden: { top: "#8fcfff", mid: "#d7f4ff", ground: COLORS.grassDark },
    bridge: { top: "#5fd3ff", mid: "#f3fbff", ground: "#3aa675" },
    gate: { top: "#caa9ff", mid: "#f5e8ff", ground: "#68aa44" },
    frosting: { top: "#effbff", mid: "#ffd7ee", ground: "#9fd7e6" },
    lanterns: { top: "#ffbd72", mid: "#fff1b8", ground: "#4d9d5a" },
    pinata: { top: "#ff73c8", mid: "#ffe86b", ground: "#66bd55" },
    moon: { top: "#35408e", mid: "#9caeff", ground: "#415b73" },
    stage: { top: "#15122f", mid: "#7b2bbd", ground: "#26213f" }
  }[state.level.arena] || { top: "#9ccdff", mid: "#c3e8ff", ground: COLORS.grassDark };
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  roundedBlob(-40, 0, 88, 28);
  roundedBlob(20, -9, 92, 38);
  roundedBlob(86, 0, 70, 30);
  ctx.restore();
}

function roundedBlob(x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBunting(time) {
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = -20; x <= canvas.width + 20; x += 20) {
    const y = 72 + Math.sin((x + time * 0.04) / 95) * 34;
    if (x === -20) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const flags = [COLORS.green, COLORS.red, COLORS.yellow, COLORS.blue, COLORS.pink, COLORS.orange];
  for (let i = 0; i < 14; i += 1) {
    const x = 86 + i * 64;
    const y = 72 + Math.sin((x + time * 0.04) / 95) * 34;
    ctx.fillStyle = flags[i % flags.length];
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 44, y + 8);
    ctx.lineTo(x + 24, y + 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawHorizonLandmark(time) {
  const y = canvas.height * 0.72;
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.ink;
  if (state.level.arena === "garden") drawCupcakeBakery(560, y - 92);
  if (state.level.arena === "bridge") drawStreamerBridge(520, y - 84, time);
  if (state.level.arena === "gate") drawBalloonGateLandmark(515, y - 118, time);
  if (state.level.arena === "frosting") drawFrostingCastle(520, y - 126);
  if (state.level.arena === "lanterns") drawLanternTents(520, y - 96, time);
  if (state.level.arena === "pinata") drawPinataCourt(520, y - 112, time);
  if (state.level.arena === "moon") drawMoonMarket(520, y - 106);
  if (state.level.arena === "stage") drawStageSpeakers(520, y - 120, time);
  ctx.restore();
}

function drawCupcakeBakery(x, y) {
  ctx.fillStyle = "#ffd8a8";
  ctx.fillRect(x - 92, y + 54, 184, 72);
  ctx.strokeRect(x - 92, y + 54, 184, 72);
  ctx.fillStyle = COLORS.pink;
  ctx.beginPath();
  ctx.moveTo(x - 104, y + 60);
  ctx.quadraticCurveTo(x - 58, y + 10, x, y + 42);
  ctx.quadraticCurveTo(x + 58, y + 10, x + 104, y + 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(x, y + 28, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.arc(x + 5, y + 10, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawStreamerBridge(x, y, time) {
  ctx.fillStyle = "#d9a35f";
  ctx.fillRect(x - 160, y + 86, 320, 26);
  ctx.strokeRect(x - 160, y + 86, 320, 26);
  for (let i = -2; i <= 2; i += 1) {
    ctx.fillRect(x + i * 70 - 8, y + 40, 16, 74);
    ctx.strokeRect(x + i * 70 - 8, y + 40, 16, 74);
  }
  ctx.strokeStyle = COLORS.pink;
  ctx.lineWidth = 7;
  ctx.beginPath();
  for (let xx = x - 150; xx <= x + 150; xx += 20) {
    const yy = y + 52 + Math.sin(time / 300 + xx / 32) * 13;
    if (xx === x - 150) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  }
  ctx.stroke();
}

function drawBalloonGateLandmark(x, y, time) {
  ctx.fillStyle = "#ffe7a2";
  ctx.fillRect(x - 132, y + 96, 264, 26);
  ctx.strokeRect(x - 132, y + 96, 264, 26);
  for (let i = 0; i < 9; i += 1) {
    const bx = x - 112 + i * 28;
    const by = y + 62 + Math.sin(time / 240 + i) * 8;
    ctx.fillStyle = [COLORS.pink, COLORS.green, COLORS.blue, COLORS.yellow][i % 4];
    ctx.beginPath();
    ctx.ellipse(bx, by, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawFrostingCastle(x, y) {
  ctx.fillStyle = "#fff5fb";
  ctx.fillRect(x - 110, y + 42, 220, 92);
  ctx.strokeRect(x - 110, y + 42, 220, 92);
  for (let i = -2; i <= 2; i += 1) {
    ctx.fillRect(x + i * 48 - 18, y + 4, 36, 132);
    ctx.strokeRect(x + i * 48 - 18, y + 4, 36, 132);
    ctx.fillStyle = COLORS.pink;
    ctx.beginPath();
    ctx.moveTo(x + i * 48 - 24, y + 4);
    ctx.lineTo(x + i * 48, y - 32);
    ctx.lineTo(x + i * 48 + 24, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff5fb";
  }
}

function drawLanternTents(x, y, time) {
  for (let i = -1; i <= 1; i += 1) {
    ctx.fillStyle = i === 0 ? COLORS.yellow : COLORS.orange;
    ctx.beginPath();
    ctx.moveTo(x + i * 100 - 64, y + 122);
    ctx.lineTo(x + i * 100, y + 36);
    ctx.lineTo(x + i * 100 + 64, y + 122);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 ? COLORS.pink : COLORS.yellow;
    ctx.beginPath();
    ctx.ellipse(x - 135 + i * 54, y + 24 + Math.sin(time / 260 + i) * 6, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawPinataCourt(x, y, time) {
  ctx.fillStyle = "#ffd27a";
  ctx.fillRect(x - 150, y + 104, 300, 24);
  ctx.strokeRect(x - 150, y + 104, 300, 24);
  ctx.fillStyle = COLORS.pink;
  ctx.beginPath();
  ctx.ellipse(x, y + 64 + Math.sin(time / 240) * 7, 78, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 8;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 70, y + 64 + i * 10);
    ctx.lineTo(x + 70, y + 52 + i * 10);
    ctx.stroke();
  }
}

function drawMoonMarket(x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  ctx.arc(x + 126, y + 8, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let i = -2; i <= 2; i += 1) {
    ctx.fillStyle = i % 2 ? "#ffe7a2" : "#b7c8ff";
    ctx.fillRect(x + i * 62 - 24, y + 76, 48, 52);
    ctx.strokeRect(x + i * 62 - 24, y + 76, 48, 52);
    ctx.beginPath();
    ctx.moveTo(x + i * 62 - 32, y + 76);
    ctx.lineTo(x + i * 62, y + 42);
    ctx.lineTo(x + i * 62 + 32, y + 76);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawStageSpeakers(x, y, time) {
  ctx.fillStyle = "#2d275e";
  ctx.fillRect(x - 168, y + 28, 72, 110);
  ctx.fillRect(x + 96, y + 28, 72, 110);
  ctx.strokeRect(x - 168, y + 28, 72, 110);
  ctx.strokeRect(x + 96, y + 28, 72, 110);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(x - 78, y + 72, 156, 66);
  ctx.strokeRect(x - 78, y + 72, 156, 66);
  for (const sx of [x - 132, x + 132]) {
    ctx.fillStyle = COLORS.blue;
    ctx.beginPath();
    ctx.arc(sx, y + 62, 22 + Math.sin(time / 140) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, y + 106, 16 + Math.sin(time / 120) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawGroundDetails(time) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, canvas.height * 0.72);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = Math.floor(canvas.height * 0.72); y <= canvas.height; y += TILE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();

  for (let i = 0; i < 80; i += 1) {
    const x = (i * 83 + 17) % canvas.width;
    const y = canvas.height * 0.75 + ((i * 37) % 150);
    ctx.fillStyle = i % 3 === 0 ? "#3a9635" : "#79d257";
    ctx.fillRect(x, y + Math.sin(time / 600 + i) * 2, 5, 9);
  }
}

function drawSceneProps(time) {
  drawBigBalloon(54, 112 + Math.sin(time / 700) * 4, COLORS.blue, 1.05);
  drawBigBalloon(890, 96 + Math.sin(time / 760) * 5, COLORS.green, 0.98);
  drawBigBalloon(830, 196 + Math.sin(time / 820) * 4, COLORS.pink, 0.85);
  drawGift(705, 580);
  drawGift(256, 584);
  drawCupcake(462, 548);
}

function drawArenaBlocks(time) {
  for (const block of state.blocks) {
    const x = block.x * TILE;
    const y = block.y * TILE;
    ctx.fillStyle = state.level.arena === "stage" ? "#332751" : state.level.arena === "frosting" ? "#fff3fb" : "#ffd27a";
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(x + 8, y + 8 + Math.sin(time / 500 + block.x) * 2, TILE - 16, 5);
  }
}

function drawBigBalloon(x, y, color, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 52);
  ctx.bezierCurveTo(-9, 94, 14, 114, -2, 153);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 55, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.ellipse(-16, -22, 10, 18, 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.moveTo(-12, 52);
  ctx.lineTo(12, 52);
  ctx.lineTo(0, 70);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFoods(time) {
  for (const item of state.foods) {
    const x = item.x * TILE + TILE / 2;
    const y = item.y * TILE + TILE / 2 + Math.sin(time / 220 + item.phase) * 3;
    if (item.type === "cupcake") drawCupcake(x, y);
    if (item.type === "gift") drawGift(x, y);
    if (item.type === "candle") drawCandle(x, y);
    if (item.type === "sprinkles") drawSprinkles(x, y);
    if (item.type === "cakeTopper") drawCakeTopper(x, y);
    if (item.type === "partyHorn") drawPartyHorn(x, y);
    if (item.type === "spike") drawSpikePowerup(x, y, time);
    if (item.type === "ribbon") drawRibbon(x, y);
    if (item.type === "balloonKey") drawBalloonKey(x, y);
    if (item.type === "invitation") drawInvitation(x, y);
    if (item.story) drawStoryGlow(x, y, time);
  }
}

function drawHazards(time) {
  for (const hazard of state.hazards) {
    const x = hazard.x * TILE + TILE / 2;
    const y = hazard.y * TILE + TILE / 2 + Math.sin(time / 260 + hazard.phase) * 5;
    if (hazard.moving) drawBalloonPath(hazard, time);
    drawBalloon(x, y, hazard.phase);
  }
}

function drawBalloonPath(hazard, time) {
  const x = hazard.x * TILE + TILE / 2;
  const y = hazard.y * TILE + TILE / 2;
  ctx.save();
  ctx.globalAlpha = 0.28 + Math.sin(time / 180 + hazard.phase) * 0.08;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(x - hazard.dx * TILE * 0.75, y - hazard.dy * TILE * 0.75);
  ctx.lineTo(x + hazard.dx * TILE * 0.75, y + hazard.dy * TILE * 0.75);
  ctx.stroke();
  ctx.restore();
}

function drawSnake(time) {
  const fever = state.feverActive > 0;
  const glowActive = state.snake.length >= 10;
  const glowStrength = glowActive ? Math.min(1, (state.snake.length - 9) / 12) : 0;
  const travelingGlow = (time / 95) % Math.max(1, state.snake.length);
  for (let i = state.snake.length - 1; i >= 0; i -= 1) {
    const part = state.snake[i];
    const x = part.x * TILE + TILE / 2;
    const y = part.y * TILE + TILE / 2;
    const ratio = i / Math.max(1, state.snake.length - 1);
    const bodyColor = fever ? [COLORS.pink, COLORS.yellow, COLORS.blue, COLORS.green][i % 4] : interpolateColor(COLORS.green, COLORS.orange, ratio);
    drawShadow(x, y, TILE * 0.82);
    const bodyGradient = ctx.createRadialGradient(x - 9, y - 10, 3, x, y, TILE * 0.55);
    bodyGradient.addColorStop(0, "#f4ff9b");
    bodyGradient.addColorStop(0.28, bodyColor);
    bodyGradient.addColorStop(1, i % 2 === 0 ? COLORS.greenDark : "#dc681e");
    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, TILE * 0.46, TILE * 0.43, Math.sin(time / 300 + i) * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (state.spikes > 0) drawSegmentSpikes(x, y, i, time);

    if (glowActive) {
      const distance = Math.abs(i - travelingGlow);
      const wrappedDistance = Math.min(distance, state.snake.length - distance);
      const pulse = Math.max(0, 1 - wrappedDistance / 3.2) * glowStrength;
      const ambient = (0.18 + Math.sin(time / 240 - i * 0.7) * 0.08) * glowStrength;
      const alpha = Math.min(0.82, pulse * 0.72 + ambient);
      if (alpha > 0.04) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = fever ? COLORS.yellow : COLORS.limeLight;
        ctx.shadowBlur = 18 + glowStrength * 18;
        ctx.strokeStyle = fever ? COLORS.white : COLORS.limeLight;
        ctx.lineWidth = 4 + pulse * 5;
        ctx.beginPath();
        ctx.ellipse(x, y, TILE * (0.5 + pulse * 0.08), TILE * (0.47 + pulse * 0.08), Math.sin(time / 300 + i) * 0.08, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.34)" : "rgba(19,33,48,0.1)";
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 5, TILE * 0.17, TILE * 0.11, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(19,33,48,0.08)";
    ctx.beginPath();
    ctx.ellipse(x + 9, y + 6, TILE * 0.12, TILE * 0.09, -0.2, 0, Math.PI * 2);
    ctx.fill();
    if (part.weak) drawWeakMark(x, y, time);
  }

  const head = state.snake[0];
  drawHead(head.x * TILE + TILE / 2, head.y * TILE + TILE / 2, state.dir, time);
}

function drawSegmentSpikes(x, y, index, time) {
  const count = state.spikes >= 2 ? 4 : 3;
  ctx.save();
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  for (let s = 0; s < count; s += 1) {
    const angle = -Math.PI / 2 + (s - (count - 1) / 2) * 0.55 + Math.sin(time / 220 + index) * 0.05;
    const baseX = x + Math.cos(angle) * TILE * 0.34;
    const baseY = y + Math.sin(angle) * TILE * 0.31;
    const tipX = x + Math.cos(angle) * TILE * 0.62;
    const tipY = y + Math.sin(angle) * TILE * 0.58;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(baseX + Math.cos(angle + Math.PI / 2) * 5, baseY + Math.sin(angle + Math.PI / 2) * 5);
    ctx.lineTo(baseX + Math.cos(angle - Math.PI / 2) * 5, baseY + Math.sin(angle - Math.PI / 2) * 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemies(time) {
  for (const enemy of state.enemies) {
    drawEnemySnake(enemy, time);
  }
}

function drawEnemySnake(enemy, time) {
  for (let i = enemy.snake.length - 1; i >= 0; i -= 1) {
    const part = enemy.snake[i];
    const x = part.x * TILE + TILE / 2;
    const y = part.y * TILE + TILE / 2;
    const bossScale = enemy.type === "boss" ? 1.18 : 1;
    drawShadow(x, y, TILE * 0.78 * bossScale);
    const gradient = ctx.createRadialGradient(x - 8, y - 9, 3, x, y, TILE * 0.55);
    gradient.addColorStop(0, enemy.bossType === "pinata" ? COLORS.yellow : "#ffffff");
    gradient.addColorStop(0.24, enemy.color);
    gradient.addColorStop(1, enemy.bossType === "dj" ? "#332751" : COLORS.ink);
    ctx.fillStyle = gradient;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = enemy.type === "boss" ? 4 : 3;
    ctx.beginPath();
    ctx.ellipse(x, y, TILE * 0.43 * bossScale, TILE * 0.4 * bossScale, Math.sin(time / 250 + i) * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (enemy.bossType === "pinata") {
      ctx.strokeStyle = i % 2 ? COLORS.yellow : COLORS.blue;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 7);
      ctx.lineTo(x + 14, y + 7);
      ctx.stroke();
    }
    if (enemy.bossType === "dj") {
      ctx.fillStyle = i % 2 ? COLORS.pink : COLORS.blue;
      ctx.beginPath();
      ctx.arc(x + 8, y - 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.34)";
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 7, TILE * 0.13, TILE * 0.09, -0.5, 0, Math.PI * 2);
    ctx.fill();
    if (part.weak) drawWeakMark(x, y, time);
  }
  const head = enemy.snake[0];
  drawEnemyHead(head.x * TILE + TILE / 2, head.y * TILE + TILE / 2, enemy);
}

function drawEnemyHead(x, y, enemy) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(enemy.dir.y, enemy.dir.x));
  ctx.fillStyle = enemy.color;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, TILE * 0.56, TILE * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(9, -8, 4, 0, Math.PI * 2);
  ctx.arc(9, 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (enemy.type === "charger") {
    ctx.moveTo(15, -12);
    ctx.lineTo(26, -3);
    ctx.lineTo(15, 6);
  } else {
    ctx.arc(15, 0, 11, 5.4, 0.9);
  }
  ctx.stroke();
  if (enemy.bossType === "frostfang") {
    ctx.fillStyle = COLORS.white;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-14, -20);
    ctx.lineTo(-4, -38);
    ctx.lineTo(8, -20);
    ctx.lineTo(20, -38);
    ctx.lineTo(28, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (enemy.bossType === "pinata") {
    drawPartyHat(-4, -TILE * 0.42, performance.now());
  }
  if (enemy.bossType === "dj") {
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 27, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-18, -23, 10, 16);
    ctx.fillRect(14, -23, 10, 16);
    ctx.strokeRect(-18, -23, 10, 16);
    ctx.strokeRect(14, -23, 10, 16);
  }
  ctx.restore();
}

function drawWeakMark(x, y, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time / 180) * 0.18);
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-11, -10);
  ctx.lineTo(-1, -2);
  ctx.lineTo(-8, 4);
  ctx.lineTo(8, 12);
  ctx.stroke();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawProjectiles(time) {
  for (const shot of state.playerShots) drawShot(shot, time);
  for (const shot of state.enemyShots) drawShot(shot, time);
}

function drawShot(shot, time) {
  const x = shot.x * TILE;
  const y = shot.y * TILE;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(shot.dir.y, shot.dir.x) + time / 120);
  ctx.fillStyle = shot.color;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(0, 9);
  ctx.lineTo(-13, 0);
  ctx.lineTo(0, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGhostSnake(time) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, state.dying / 1700) * 0.35;
  drawSnake(time);
  ctx.restore();
}

function drawHead(x, y, dir, time) {
  ctx.save();
  ctx.translate(x, y);
  const angle = Math.atan2(dir.y, dir.x);
  ctx.rotate(angle);
  drawShadow(0, 9, TILE * 0.95);
  const headGradient = ctx.createRadialGradient(-15, -15, 4, 0, 0, TILE * 0.68);
  headGradient.addColorStop(0, "#efff9b");
  headGradient.addColorStop(0.3, state.feverActive > 0 ? COLORS.blue : COLORS.green);
  headGradient.addColorStop(1, state.feverActive > 0 ? COLORS.blueDark : COLORS.greenDark);
  ctx.fillStyle = headGradient;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, TILE * 0.62, TILE * 0.49, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (state.spikes > 0) {
    ctx.fillStyle = COLORS.white;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    [-0.7, 0, 0.7].forEach((offset) => {
      ctx.beginPath();
      ctx.moveTo(-4, -TILE * 0.58 + offset * 8);
      ctx.lineTo(10, -TILE * 0.34 + offset * 8);
      ctx.lineTo(-18, -TILE * 0.34 + offset * 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(8, -8, 4, 0, Math.PI * 2);
  ctx.arc(8, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(16, 0, 13, 0.24, 1.08);
  ctx.stroke();

  drawPartyHat(0, -TILE * 0.44, time);
  ctx.restore();
}

function drawShadow(x, y, width) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.ellipse(x, y + TILE * 0.36, width * 0.5, TILE * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPartyHat(x, y, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time / 280) * 0.08);
  ctx.fillStyle = COLORS.yellow;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-13, 9);
  ctx.lineTo(10, -33);
  ctx.lineTo(30, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = COLORS.orange;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(1, -11);
  ctx.lineTo(21, -3);
  ctx.stroke();
  ctx.restore();
}

function drawCupcake(x, y) {
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.fillStyle = COLORS.pink;
  ctx.beginPath();
  ctx.moveTo(x - 15, y + 4);
  ctx.lineTo(x + 15, y + 4);
  ctx.lineTo(x + 11, y + 21);
  ctx.lineTo(x - 11, y + 21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 17, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.arc(x + 3, y - 14, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawGift(x, y) {
  ctx.fillStyle = "#ff9ac3";
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.fillRect(x - 17, y - 12, 34, 30);
  ctx.strokeRect(x - 17, y - 12, 34, 30);
  ctx.fillStyle = COLORS.blue;
  ctx.fillRect(x - 4, y - 12, 8, 30);
  ctx.fillRect(x - 17, y - 1, 34, 8);
  ctx.strokeRect(x - 4, y - 12, 8, 30);
}

function drawCandle(x, y) {
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.fillRect(x - 7, y - 9, 14, 26);
  ctx.strokeRect(x - 7, y - 9, 14, 26);
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.moveTo(x, y - 27);
  ctx.quadraticCurveTo(x + 12, y - 12, x, y - 10);
  ctx.quadraticCurveTo(x - 11, y - 12, x, y - 27);
  ctx.fill();
  ctx.stroke();
}

function drawSprinkles(x, y) {
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.ellipse(x, y, 19, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  [COLORS.pink, COLORS.blue, COLORS.orange, COLORS.green].forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 11 + index * 7, y - 6 + (index % 2) * 8);
    ctx.lineTo(x - 5 + index * 7, y - 1 + (index % 2) * 8);
    ctx.stroke();
  });
}

function drawCakeTopper(x, y) {
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
    const r = i % 2 === 0 ? 21 : 9;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPartyHorn(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.22);
  ctx.fillStyle = COLORS.orange;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -8);
  ctx.lineTo(18, -14);
  ctx.lineTo(18, 14);
  ctx.lineTo(-18, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-6, -9);
  ctx.lineTo(-6, 9);
  ctx.moveTo(8, -12);
  ctx.lineTo(8, 12);
  ctx.stroke();
  ctx.restore();
}

function drawSpikePowerup(x, y, time) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time / 180) * 3);
  ctx.rotate(Math.sin(time / 260) * 0.18);
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(18, 16);
  ctx.lineTo(0, 9);
  ctx.lineTo(-18, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.arc(0, 12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRibbon(x, y) {
  ctx.fillStyle = COLORS.pink;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x - 10, y, 12, 8, -0.35, 0, Math.PI * 2);
  ctx.ellipse(x + 10, y, 12, 8, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawBalloonKey(x, y) {
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.fillStyle = COLORS.green;
  ctx.beginPath();
  ctx.arc(x - 8, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 3, y);
  ctx.lineTo(x + 22, y);
  ctx.moveTo(x + 15, y);
  ctx.lineTo(x + 15, y + 8);
  ctx.stroke();
}

function drawInvitation(x, y) {
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.fillRect(x - 18, y - 12, 36, 24);
  ctx.strokeRect(x - 18, y - 12, 36, 24);
  ctx.strokeStyle = COLORS.blue;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 12);
  ctx.lineTo(x, y + 3);
  ctx.lineTo(x + 18, y - 12);
  ctx.stroke();
}

function drawStoryGlow(x, y, time) {
  ctx.save();
  ctx.globalAlpha = 0.36 + Math.sin(time / 140) * 0.12;
  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBalloon(x, y, phase) {
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 18);
  ctx.bezierCurveTo(x + Math.sin(phase) * 8, y + 34, x - 8, y + 42, x + 4, y + 58);
  ctx.stroke();
  ctx.fillStyle = phase % 2 > 1 ? COLORS.pink : COLORS.green;
  ctx.beginPath();
  ctx.ellipse(x, y, 17, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.ellipse(x - 6, y - 8, 5, 8, 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawConfetti() {
  for (let i = state.confetti.length - 1; i >= 0; i -= 1) {
    const bit = state.confetti[i];
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.vy += 0.03;
    bit.spin += 0.2;
    ctx.save();
    ctx.translate(bit.x, bit.y);
    ctx.rotate(bit.spin);
    ctx.fillStyle = bit.color;
    ctx.fillRect(-bit.size / 2, -bit.size / 4, bit.size, bit.size / 2);
    ctx.restore();
    if (bit.y > canvas.height + 30) state.confetti.splice(i, 1);
  }
}

function drawSparks() {
  for (let i = state.sparks.length - 1; i >= 0; i -= 1) {
    const spark = state.sparks[i];
    spark.life -= 16;
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vx *= 0.985;
    spark.vy += 0.16;
    const alpha = Math.max(0, spark.life / spark.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(spark.x, spark.y);
    ctx.rotate((spark.maxLife - spark.life) / 80);
    ctx.fillStyle = spark.color;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    if (spark.shape === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, spark.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (spark.shape === 1) {
      ctx.fillRect(-spark.radius, -spark.radius / 2, spark.radius * 2, spark.radius);
      ctx.strokeRect(-spark.radius, -spark.radius / 2, spark.radius * 2, spark.radius);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -spark.radius);
      ctx.lineTo(spark.radius, spark.radius);
      ctx.lineTo(-spark.radius, spark.radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    if (spark.life <= 0) state.sparks.splice(i, 1);
  }
}

function drawBanner(text) {
  ctx.fillStyle = "rgba(255, 249, 239, 0.9)";
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.fillRect(canvas.width / 2 - 125, canvas.height / 2 - 34, 250, 68);
  ctx.strokeRect(canvas.width / 2 - 125, canvas.height / 2 - 34, 250, 68);
  ctx.fillStyle = COLORS.ink;
  ctx.font = "900 34px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function interpolateColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const mix = ca.map((value, index) => Math.round(value + (cb[index] - value) * t));
  return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
}

function hexToRgb(hex) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

function loop(time) {
  const delta = Math.min(48, time - lastTime || 16);
  lastTime = time;
  updateAudioMood();
  tick(delta);
  draw(time);
}

function initAudio() {
  if (audioMuted) return;
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    return;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioCtx = new AudioContext();
}

function startMusic() {
  if (audioMuted || !audioCtx || musicTimer) return;
  const schedule = () => {
    playMusicNote();
    musicTimer = setTimeout(schedule, nextMusicDelay);
  };
  musicTimer = setTimeout(schedule, 40);
}

function updateAudioMood() {
  if (!audioCtx || audioCtx.state === "closed") return;
  if (!state.running && state.over && state.dying <= 0) stopMusic();
}

function stopMusic() {
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

function playMusicNote() {
  if (audioMuted || !audioCtx || audioCtx.state !== "running" || state.paused || (!state.running && !state.dying)) return;
  const theme = musicTheme();
  const speed = musicSpeedFactor();
  const passage = theme.passages[Math.floor(musicStep / 32) % theme.passages.length];
  nextMusicDelay = Math.max(86, (theme.tempo + passage.tempoShift) / speed);
  const now = audioCtx.currentTime;
  const feverLift = state.feverActive > 0 ? 1.122 : 1;
  const phraseStep = musicStep % 32;
  const bar = Math.floor(phraseStep / 8);
  const root = passage.roots[bar % passage.roots.length];
  const chord = passage.chords[bar % passage.chords.length];
  const melody = passage.melody[(phraseStep + passage.offset) % passage.melody.length] * feverLift;
  const counter = passage.counter[(phraseStep * 2 + bar) % passage.counter.length] * feverLift;
  const bass = passage.bass[bar % passage.bass.length];
  const beat = nextMusicDelay / 1000;

  if (phraseStep % 4 === 0) playChord(root, chord, beat * passage.padHold, theme.padWave, theme.padVolume * passage.energy, now);
  if (!passage.rests.includes(phraseStep % 8)) playInstrument("lead", melody, beat * 0.92, passage.wave, theme.volume * passage.energy, now);
  if (phraseStep % 2 === 1 && passage.energy > 0.72) playInstrument("woodwind", counter, beat * 0.72, "triangle", theme.volume * 0.36 * passage.energy, now + beat * 0.18);
  if (passage.arp.length && phraseStep % passage.arpEvery === 0) playInstrument("pluck", root * passage.arp[phraseStep % passage.arp.length], beat * 0.48, "triangle", theme.volume * 0.34 * passage.energy, now + beat * 0.42);
  if (phraseStep % 2 === 0) playInstrument("bass", bass, beat * 1.5, "sine", theme.bassVolume * passage.energy, now);
  if (phraseStep % 8 === 5 && passage.energy > 0.85) playTone(bass * 1.5, beat * 0.65, "triangle", theme.bassVolume * 0.5, now + beat * 0.26);
  if (phraseStep % 16 === 8) playInstrument("bell", root * 3, beat * 1.2, "sine", theme.volume * 0.22, now + beat * 0.3);
  if (passage.energy < 0.62 && phraseStep % 8 === 3) playInstrument("choir", root * 1.5, beat * 3.2, "sine", theme.volume * 0.18, now);
  if (passage.energy > 0.82 && phraseStep % 4 === 1) playInstrument("stringRun", melody * 2, beat * 0.28, "sawtooth", theme.volume * 0.22, now + beat * 0.52);
  playPercussion(now, beat, { ...theme, volume: theme.volume * passage.percussion });
  if (phraseStep % 16 === 14 && passage.energy > 0.9) playInstrument("brass", melody * 1.5, beat * 0.34, "square", theme.volume * 0.36, now + beat * 0.58);
  musicStep += 1;
}

function musicTheme() {
  const profile = stageMusicProfile();
  if (state.level?.boss?.type === "frostfang") {
    return symphonicTheme("frostfang", [174.61, 196, 207.65, 233.08, 261.63, 311.13], "minor", "triangle", 168, 0.041);
  }
  if (state.level?.boss?.type === "pinata") {
    return symphonicTheme("pinata", [146.83, 174.61, 196, 220, 246.94, 293.66], "mixed", "square", 146, 0.039);
  }
  if (state.level?.boss?.type === "dj") {
    return symphonicTheme("dj", [130.81, 146.83, 164.81, 196, 220, 246.94], "dorian", "sawtooth", 132, 0.034);
  }
  return symphonicTheme(profile.name, profile.roots, profile.mode, profile.wave, profile.tempo, profile.volume);
}

function stageMusicProfile() {
  const arena = state.level?.arena || "garden";
  const profiles = {
    garden: { name: "garden", roots: [130.81, 146.83, 164.81, 196, 220, 246.94], mode: "major", wave: "triangle", tempo: 184, volume: 0.032 },
    bridge: { name: "bridge", roots: [146.83, 164.81, 185, 220, 246.94, 277.18], mode: "neutral", wave: "triangle", tempo: 172, volume: 0.033 },
    gate: { name: "gate", roots: [138.59, 164.81, 185, 207.65, 246.94, 277.18], mode: "mixolydian", wave: "triangle", tempo: 168, volume: 0.034 },
    frosting: { name: "frosting", roots: [130.81, 155.56, 174.61, 196, 233.08, 261.63], mode: "minor", wave: "triangle", tempo: 178, volume: 0.032 },
    lanterns: { name: "lanterns", roots: [123.47, 146.83, 164.81, 196, 220, 246.94], mode: "neutral", wave: "sine", tempo: 190, volume: 0.03 },
    pinata: { name: "pinata", roots: [146.83, 174.61, 196, 220, 261.63, 293.66], mode: "mixed", wave: "square", tempo: 154, volume: 0.036 },
    moon: { name: "moon", roots: [110, 130.81, 146.83, 164.81, 196, 220], mode: "minor", wave: "triangle", tempo: 188, volume: 0.03 },
    stage: { name: "stage", roots: [130.81, 146.83, 164.81, 196, 246.94, 293.66], mode: "dorian", wave: "sawtooth", tempo: 142, volume: 0.034 }
  };
  return profiles[arena] || profiles.garden;
}

function scaleRatios(mode) {
  const modes = {
    major: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875, 2],
    minor: [1, 1.125, 1.2, 1.333, 1.5, 1.6, 1.8, 2],
    neutral: [1, 1.125, 1.2, 1.414, 1.5, 1.667, 1.8, 2],
    mixolydian: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.778, 2],
    dorian: [1, 1.125, 1.2, 1.333, 1.5, 1.667, 1.8, 2],
    mixed: [1, 1.125, 1.25, 1.333, 1.5, 1.6, 1.875, 2]
  };
  return modes[mode] || modes.neutral;
}

function symphonicTheme(name, roots, mode, wave, tempo, volume) {
  const scale = scaleRatios(mode);
  const melodyA = [0, 2, 4, 5, 4, 2, 1, 2, 4, 6, 5, 4, 2, 1, 0, 2].map((degree, index) => roots[index % roots.length] * 2 * scale[degree]);
  const melodyB = [4, 3, 2, 0, 1, 2, 4, 5, 6, 5, 3, 2, 1, 0, 2, 4].map((degree, index) => roots[(index + 2) % roots.length] * 2 * scale[degree]);
  const melodyC = [0, 0, 2, 3, 4, 3, 2, 1, 0, 2, 5, 4, 3, 1, 2, 0].map((degree, index) => roots[(index + 1) % roots.length] * 2 * scale[degree]);
  const neutral = [0, 1, 2, 1, 0, 3, 2, 1, 0, 1, 4, 3, 2, 1, 0, 0].map((degree, index) => roots[index % roots.length] * 2 * scale[degree]);
  const majorChord = [1, 1.25, 1.5];
  const minorChord = [1, 1.2, 1.5];
  const suspended = [1, 1.333, 1.5];
  const open = [1, 1.5, 2];
  return {
    name,
    roots,
    wave,
    tempo,
    volume,
    padWave: "sine",
    padVolume: volume * 0.28,
    bass: roots.map((root) => root / 2),
    bassVolume: volume * 0.8,
    passages: [
      makePassage(roots, melodyA, mode === "minor" ? [minorChord, suspended, minorChord, open] : [majorChord, suspended, majorChord, open], 0, 0.68, 22, wave),
      makePassage(roots.slice().reverse(), neutral, [suspended, open, minorChord, suspended], 5, 0.52, 42, "triangle", [2, 6]),
      makePassage(roots, melodyB, [minorChord, suspended, majorChord, minorChord], 9, 0.9, 4, wave),
      makePassage(roots.concat(roots.slice(0, 2)), melodyC, [open, suspended, minorChord, majorChord], 13, 0.78, 16, wave, [7])
    ]
  };
}

function makePassage(roots, melody, chords, offset, energy, tempoShift, wave, rests = []) {
  return {
    roots,
    melody,
    chords,
    offset,
    energy,
    tempoShift,
    wave,
    rests,
    padHold: energy > 0.8 ? 2.2 : 3.4,
    percussion: energy,
    bass: roots.map((root, index) => root / (index % 3 === 0 ? 2 : 1.5)),
    counter: melody.map((note, index) => note * (index % 3 === 0 ? 0.75 : 1.125)),
    arp: energy > 0.58 ? [1, 1.125, 1.333, 1.5, 1.667, 2, 1.5, 1.333] : [1, 1.5, 2, 1.5],
    arpEvery: energy > 0.82 ? 1 : 2
  };
}

function musicSpeedFactor() {
  const scoreSpeed = Math.min(0.46, state.score / 6500);
  const lengthSpeed = Math.min(0.28, Math.max(0, state.snake.length - 4) * 0.018);
  const feverSpeed = state.feverActive > 0 ? 0.18 : 0;
  const slowPenalty = state.slowMo > 0 ? -0.18 : 0;
  const bossPush = state.level?.boss ? 0.14 : 0;
  return Math.max(0.78, 1 + scoreSpeed + lengthSpeed + feverSpeed + bossPush + slowPenalty);
}

function playChord(root, ratios, duration, type, volume, start) {
  ratios.forEach((ratio, index) => {
    playInstrument("strings", root * ratio, duration * (0.92 + index * 0.08), type, volume / ratios.length, start + index * 0.012);
    playInstrument("choir", root * ratio * 2, duration * 0.9, "triangle", volume / (ratios.length * 1.8), start + index * 0.018);
  });
}

function playPercussion(now, beat, theme) {
  if (musicStep % 4 === 0) playNoise(Math.min(0.06, beat * 0.42), theme.volume * 0.65, 180, now);
  if (musicStep % 4 === 2) playNoise(Math.min(0.04, beat * 0.28), theme.volume * 0.38, 1600, now);
  if (musicStep % 2 === 1) playNoise(Math.min(0.025, beat * 0.18), theme.volume * 0.22, 5200, now + beat * 0.15);
}

function playInstrument(name, freq, duration, type, volume, start) {
  const detune = {
    lead: [0, 7],
    strings: [-6, 5, 12],
    woodwind: [0],
    pluck: [0, 1200],
    bass: [0, -5],
    bell: [0, 1200, 1902],
    choir: [-8, 0, 8],
    stringRun: [0, 12],
    brass: [-4, 0, 7]
  }[name] || [0];
  const wave = {
    strings: "sawtooth",
    woodwind: "triangle",
    pluck: "square",
    bass: "sine",
    bell: "sine",
    choir: "sine",
    stringRun: "sawtooth",
    brass: "square"
  }[name] || type;
  const gainScale = {
    strings: 0.46,
    woodwind: 0.72,
    pluck: 0.34,
    bass: 0.9,
    bell: 0.25,
    choir: 0.32,
    stringRun: 0.26,
    brass: 0.45,
    lead: 0.7
  }[name] || 0.7;
  detune.forEach((cents, index) => {
    const ratio = Math.pow(2, cents / 1200);
    const stagger = index * 0.008;
    playTone(freq * ratio, duration * (name === "pluck" ? 0.42 : 1), wave, volume * gainScale / detune.length, start + stagger);
  });
}

function playTone(freq, duration, type = "sine", volume = 0.08, start = audioCtx?.currentTime || 0) {
  if (audioMuted || !audioCtx || audioCtx.state !== "running") return;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(type === "sawtooth" || type === "square" ? 1800 : 3600, start);
  filter.frequency.exponentialRampToValueAtTime(type === "sawtooth" || type === "square" ? 2600 : 5200, start + Math.min(duration, 0.18));
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

function playEat(type) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(type === "gift" ? 740 : 660, 0.08, "square", 0.05, now);
  playTone(type === "candle" ? 988 : 880, 0.1, "triangle", 0.045, now + 0.06);
}

function playPop() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playNoise(0.09, 0.055, 1200, now);
  playTone(180, 0.04, "sawtooth", 0.08, now);
  playTone(92, 0.08, "square", 0.055, now + 0.025);
}

function playShield() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(160, 0.08, "sawtooth", 0.04, now);
  playTone(120, 0.12, "square", 0.03, now + 0.04);
}

function playShot() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(520, 0.045, "square", 0.04, now);
  playTone(780, 0.055, "triangle", 0.035, now + 0.025);
}

function playFever() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
    playTone(freq, 0.14, "triangle", 0.065, now + index * 0.06);
  });
}

function playVictoryFanfare() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1046.5, 1567.98];
  notes.forEach((freq, index) => {
    playInstrument(index < 4 ? "brass" : "bell", freq, 0.22, index < 4 ? "square" : "sine", 0.08, now + index * 0.105);
  });
  [130.81, 196, 261.63].forEach((freq, index) => {
    playInstrument("bass", freq, 0.55, "sine", 0.065, now + index * 0.21);
  });
  for (let i = 0; i < 5; i += 1) {
    playNoise(0.08, 0.06, 1800 + i * 500, now + i * 0.16);
  }
}

function playDeath() {
  stopMusic();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playNoise(0.38, 0.14, 520, now);
  playNoise(0.22, 0.1, 1800, now + 0.16);
  [392, 329.63, 261.63, 196, 130.81].forEach((freq, index) => {
    playTone(freq, 0.2, index % 2 ? "square" : "sawtooth", 0.075, now + index * 0.08);
  });
}

function playNoise(duration, volume, filterFreq, start = audioCtx?.currentTime || 0) {
  if (audioMuted || !audioCtx || audioCtx.state !== "running") return;
  const sampleCount = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i += 1) {
    const fade = 1 - i / sampleCount;
    data[i] = (Math.random() * 2 - 1) * fade;
  }
  const source = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(filterFreq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(start);
}

window.addEventListener("keydown", (event) => {
  if (DIRS[event.key]) {
    event.preventDefault();
    setDirection(DIRS[event.key]);
  }
  if (event.code === "Space") {
    event.preventDefault();
    activateFever();
  }
  if (event.key.toLowerCase() === "f" || event.key === "Enter") {
    event.preventDefault();
    firePlayerShot();
  }
  if (event.key.toLowerCase() === "p" && state.running) {
    state.paused = !state.paused;
  }
  if (event.key.toLowerCase() === "m") {
    audioMuted = !audioMuted;
    if (audioMuted) stopMusic();
    else {
      initAudio();
      startMusic();
    }
  }
});

canvas.addEventListener("pointerdown", (event) => {
  touchStart = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", (event) => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
    activateFever();
  } else if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? DIRS.ArrowRight : DIRS.ArrowLeft);
  } else {
    setDirection(dy > 0 ? DIRS.ArrowDown : DIRS.ArrowUp);
  }
  touchStart = null;
});

startButton.addEventListener("click", () => startGame(false, "garden", true));
loadButton.addEventListener("click", loadCampaign);
infoButton.addEventListener("click", () => {
  document.querySelectorAll(".info-panel").forEach((panelEl) => {
    panelEl.open = !panelEl.open;
  });
});
practiceButton.addEventListener("click", () => startGame(true));
continueButton.addEventListener("click", () => {
  const next = nextLevelId();
  if (next) startGame(false, next);
});
titleStartButton.addEventListener("click", () => startGame(false, "garden", true));
titleLoadButton.addEventListener("click", loadCampaign);
titleSaveButton.addEventListener("click", () => {
  saveOptions.hidden = !saveOptions.hidden;
});
titleResetButton.addEventListener("click", () => {
  localStorage.removeItem("snakephoria-save");
  localStorage.removeItem("snakephoria-furthest");
  furthestLevelIndex = 0;
  savedGame = null;
  updateTitleStats();
});
backTitleButton.addEventListener("click", showTitleScreen);

updateHud();
previewSelectedLevel();
updateTitleStats();
requestAnimationFrame(loop);
