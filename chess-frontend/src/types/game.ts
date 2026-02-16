export type UUID = string;

export type WinState = string; // we can tighten this once you confirm enum values

export interface GameRead {
  game_id: UUID;
  tournament_id: UUID;
  player_white_id: UUID;
  player_black_id: UUID;
  played_at: string; // ISO datetime
  result: WinState;
}
