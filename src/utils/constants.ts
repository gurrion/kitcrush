// KitCrush — Game Constants

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;

export const BOARD_COLS = 8;
export const BOARD_ROWS = 8;
export const TILE_SIZE = 52;
export const TILE_GAP = 4;
export const BOARD_OFFSET_X = (GAME_WIDTH - BOARD_COLS * (TILE_SIZE + TILE_GAP) + TILE_GAP) / 2;
export const BOARD_OFFSET_Y = 140;

export const SWAP_DURATION = 180;
export const FALL_DURATION = 140;
export const MATCH_CLEAR_DURATION = 250;

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
