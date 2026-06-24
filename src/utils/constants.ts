// KitCrush — Game Constants

export const BOARD_COLS = 8;
export const BOARD_ROWS = 8;
export const TILE_SIZE = 64;
export const TILE_GAP = 4;
export const BOARD_OFFSET_X = 16;
export const BOARD_OFFSET_Y = 160;

export const GAME_WIDTH = BOARD_COLS * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_X * 2;
export const GAME_HEIGHT = BOARD_ROWS * (TILE_SIZE + TILE_GAP) + BOARD_OFFSET_Y + 80;

export const SWAP_DURATION = 200;
export const FALL_DURATION = 150;
export const MATCH_CLEAR_DURATION = 300;
export const REFILL_DELAY = 100;

export const KITTEN_TYPES = 6;

export const KITTEN_COLORS = [
  0xff6b6b, // rojo/rosa
  0xffa94d, // naranja
  0xffd43b, // amarillo
  0x69db7c, // verde
  0x74c0fc, // azul
  0xb197fc, // morado
];

export const KITTEN_EMOJIS = ['😺', '😸', '😻', '🙀', '😹', '😽'];

export const KITTEN_NAMES = [
  'Michi Rojo',
  'Michi Naranja',
  'Michi Amarillo',
  'Michi Verde',
  'Michi Azul',
  'Michi Morado',
];

export const SCORE_PER_TILE = 10;
export const COMBO_MULTIPLIER = 1.5;

export const LEVELS = [
  { moves: 25, target: 1000,  name: 'Barrio 1' },
  { moves: 22, target: 1500,  name: 'Barrio 2' },
  { moves: 20, target: 2000,  name: 'Parque' },
  { moves: 20, target: 2500,  name: 'Mercado' },
  { moves: 18, target: 3000,  name: 'Azotea' },
  { moves: 18, target: 3500,  name: 'Playa' },
  { moves: 16, target: 4000,  name: 'Montaña' },
  { moves: 16, target: 4500,  name: 'Bosque' },
  { moves: 14, target: 5000,  name: 'Cueva' },
  { moves: 14, target: 6000,  name: 'Volcán' },
  { moves: 12, target: 7000,  name: 'Nube' },
  { moves: 12, target: 8000,  name: 'Espacio' },
  { moves: 10, target: 9000,  name: 'Galaxia' },
  { moves: 10, target: 10000, name: 'Agujero Negro' },
  { moves: 8,  target: 12000, name: 'Otro Universo' },
];

export type PowerUpType = 'row' | 'column' | 'bomb' | 'rainbow';

export const POWER_UP_CHANCE = 0.08; // 8% chance per match-4+
export const MATCH_4_TYPE: PowerUpType = 'row';
export const MATCH_5_TYPE: PowerUpType = 'rainbow';
