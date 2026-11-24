// ============================================================
// theme.ts — كل الألوان والتوقيتات مأخوذة حرفياً من التحليل
// الإطار-بإطار للفيديو الأصلي (1955 إطاراً، 30fps، 720x1280)
// ============================================================

export const FPS = 30;
export const W = 720;
export const H = 1280;
export const TOTAL_FRAMES = 1955;

// اللوحة اللونية المستخرجة بتحليل k-means على اللقطات المفتاحية
export const C = {
  darkCrimson: '#2d1d36',
  deepRed: '#62162c',
  canyonOrange: '#ce5f3e',
  canyonRed: '#d85b2c',
  canyonDark: '#4a1f31',
  sunsetOrange: '#e78543',
  fireRed: '#b5301c',
  waterBlue: '#1d3198',
  waterLight: '#4b73c5',
  skyBlue: '#5c85d2',
  skyLight: '#86aae0',
  skyPale: '#b2bbde',
  gold: '#e8b23a',
  goldBright: '#f7b94d',
  yellow: '#e8a72c',
  purple: '#8a2be2',
  purpleFace: '#8b2fd6',
  railPink: '#c2189c',
  railMagenta: '#b71fa0',
  railGold: '#e9c25c',
  woodBrown: '#8a5a3c',
  deckBrown: '#7a4153',
  woodDark: '#5b3437',
  cream: '#f3e3d1',
  white: '#ffffff',
  ink: '#171717',
  black: '#0d0d0d',
  green: '#2e9e6b',
  teal: '#20b0a0',
  navy: '#252447',
  red: '#c4422e',
  trainGreen: '#2f7d4f',
  smoke: '#d9d2cf',
} as const;

// ============================================================
// الترجمة كلمة-كلمة (نفس توقيتات الفيديو الأصلي إطاراً بإطار)
// ============================================================
export type Caption = [number, number, string]; // [startFrame, endFrameInclusive, text]

export const CAPTIONS: Caption[] = [
  [0, 13, 'He sawed'], [14, 26, 'gaps'], [27, 35, 'into a'], [36, 53, 'railroad'],
  [54, 83, 'every 39'], [84, 97, 'feet.'], [98, 100, 'You'], [101, 108, 'see,'],
  [109, 116, 'two'], [117, 131, 'companies'], [132, 135, 'are'], [136, 151, 'racing'],
  [152, 153, 'to'], [154, 160, 'build'], [161, 161, 'a'], [162, 177, 'railroad'],
  [178, 185, 'along'], [186, 198, 'a canyon'], [199, 221, 'so deep'], [222, 224, 'you'],
  [225, 233, "can't"], [234, 242, 'see the'], [243, 253, 'bottom.'], [254, 258, 'And'],
  [259, 268, 'whoever'], [269, 280, 'finishes'], [281, 293, 'first'], [294, 301, 'gets'],
  [302, 305, 'the'], [306, 314, 'whole'], [315, 327, "country's"], [328, 344, 'business.'],
  [345, 353, "He's"], [354, 369, 'the youngest'], [370, 380, 'engineer'], [381, 399, 'on the job.'],
  [400, 403, 'And'], [404, 406, 'when'], [407, 419, 'his boss'], [420, 425, 'sees'],
  [426, 440, 'a finger'], [441, 449, 'wide'], [450, 458, 'gap'], [459, 467, 'between'],
  [468, 471, 'every'], [472, 489, 'single'], [490, 500, 'rail,'], [501, 505, 'his'],
  [506, 516, 'face'], [517, 523, 'goes'], [524, 540, 'purple.'], [541, 547, "You're"],
  [548, 559, 'wrecking'], [560, 585, 'my railroad.'], [586, 591, 'But'], [592, 604, "he won't"],
  [605, 621, 'close a'], [622, 634, 'single'], [635, 646, 'one.'], [647, 657, 'The other'],
  [658, 669, 'company'], [670, 677, 'lays'], [678, 681, 'their'], [682, 692, 'rails'],
  [693, 700, 'end'], [701, 716, 'to end,'], [717, 730, 'perfectly'], [731, 744, 'smooth'],
  [745, 749, 'and'], [750, 764, 'finishes'], [765, 778, 'first.'], [779, 783, 'Their'],
  [784, 794, 'trains'], [795, 807, 'glide'], [808, 817, 'across'], [818, 819, 'the'],
  [820, 830, 'canyon'], [831, 856, 'without a sound'], [857, 863, 'while'], [864, 879, 'his go'],
  [880, 890, 'clickety'], [891, 898, 'clack,'], [899, 908, 'over'], [909, 933, 'every gap.'],
  [934, 936, 'The'], [937, 952, 'newspapers'], [953, 959, 'will'], [960, 972, 'calling it'],
  [973, 978, 'the'], [979, 988, 'clickety'], [989, 996, 'Clack'], [997, 1008, 'line.'],
  [1009, 1015, 'and'], [1016, 1030, 'everyone'], [1031, 1043, 'switches'], [1044, 1045, 'to'],
  [1046, 1058, 'the quiet'], [1059, 1074, 'trains.'], [1075, 1084, 'Then'], [1085, 1097, 'summer'],
  [1098, 1113, 'comes'], [1114, 1121, 'and'], [1122, 1133, 'something'], [1134, 1143, 'weird'],
  [1144, 1158, 'happens.'], [1159, 1165, 'His'], [1166, 1177, 'gaps'], [1178, 1186, 'start'],
  [1187, 1203, 'shrinking'], [1204, 1222, 'in May.'], [1223, 1235, 'You can fit'],
  [1236, 1247, 'a coin'], [1248, 1255, 'in them'], [1256, 1261, 'by'], [1262, 1275, 'July.'],
  [1276, 1288, 'Barely'], [1289, 1300, 'a sheet'], [1301, 1303, 'of'], [1304, 1317, 'paper'],
  [1318, 1326, 'and his'], [1327, 1344, 'boss is'], [1345, 1365, 'thrilled.'], [1366, 1381, 'See,'],
  [1382, 1389, 'even'], [1390, 1406, 'your gaps'], [1407, 1413, 'know'], [1414, 1420, 'you were'],
  [1421, 1432, 'wrong.'], [1433, 1451, 'Meanwhile,'], [1452, 1458, 'on the'], [1459, 1472, 'perfect'],
  [1473, 1487, 'railroad,'], [1488, 1501, 'the rails'], [1502, 1504, 'have'], [1505, 1516, 'started'],
  [1517, 1530, 'groaning'], [1531, 1536, 'in the'], [1537, 1549, 'afternoon'], [1550, 1563, 'sun,'],
  [1564, 1574, 'pushing'], [1575, 1584, 'against'], [1585, 1596, 'each other'], [1597, 1602, 'like'],
  [1603, 1604, 'they'], [1605, 1611, 'want to'], [1612, 1618, 'get'], [1619, 1626, 'out.'],
  [1627, 1632, 'On'], [1633, 1648, 'the hottest'], [1649, 1656, 'day'], [1657, 1670, 'anyone'],
  [1671, 1676, 'can'], [1677, 1690, 'remember.'], [1691, 1696, 'His'], [1697, 1707, 'gaps'],
  [1708, 1723, 'finally'], [1724, 1738, 'close.'], [1739, 1753, 'Rail'], [1754, 1763, 'touching'],
  [1764, 1777, 'rail.'], [1778, 1781, 'And'], [1782, 1791, 'halfway'], [1792, 1802, 'across'],
  [1803, 1804, 'the'], [1805, 1818, 'canyon,'], [1819, 1820, 'the'], [1821, 1835, 'perfect'],
  [1836, 1848, 'railroad'], [1849, 1858, 'kicks'], [1859, 1873, 'sideways'], [1874, 1879, 'like'],
  [1880, 1895, 'a snake,'], [1896, 1906, 'right'], [1907, 1914, 'as a'], [1915, 1925, 'train'],
  [1926, 1931, 'rolls'], [1932, 1942, 'onto'], [1943, 1954, 'it.'],
];

export const captionAt = (frame: number): string => {
  for (const [s, e, t] of CAPTIONS) if (frame >= s && frame <= e) return t;
  return '';
};

// ============================================================
// خريطة اللقطات (نفس الوحدات L01–L40 من التحليل)
// ============================================================
export const SCENES = {
  canyonWalk: {from: 0, dur: 112},        // L01–L04
  aerialBridge: {from: 112, dur: 142},    // L05–L06 (3D)
  desertRise: {from: 254, dur: 40},       // L07–L08
  whipStation: {from: 294, dur: 8},       // L09
  stationCeremony: {from: 302, dur: 46},  // L10–L11
  workersRidge: {from: 348, dur: 60},     // L12
  bossFace: {from: 408, dur: 220},        // L13–L16 (push-in, two-shot, anger, rant)
  whipRight: {from: 624, dur: 24},        // L17
  platformDeck: {from: 648, dur: 141},    // L18–L20
  luxuryTrain: {from: 789, dur: 67},      // L21–L22
  shortLine: {from: 856, dur: 80},        // L23–L24
  newspaper: {from: 936, dur: 152},       // L25–L27
  sunsetWeird: {from: 1088, dur: 64},     // L28
  gapsCoin: {from: 1152, dur: 192},       // L29–L31
  bossPleased: {from: 1344, dur: 96},     // L32
  perfectRR: {from: 1440, dur: 192},      // L33–L34 (3D + deck chair)
  hottestDay: {from: 1632, dur: 152},     // L35–L37
  sunsetBridge: {from: 1784, dur: 64},    // L38 (3D)
  serpent: {from: 1848, dur: 80},         // L39
  explosion: {from: 1928, dur: 27},       // L40
} as const;

// helper: نسبة التقدم 0..1 داخل مجال
export const prog = (f: number, from: number, dur: number) =>
  Math.min(1, Math.max(0, (f - from) / Math.max(1, dur - 1)));

// easing
export const ease = (t: number) => t * t * (3 - 2 * t);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
