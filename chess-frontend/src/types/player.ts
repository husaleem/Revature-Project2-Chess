export type UUID = string;

export interface PlayerRead {
  player_id: UUID;
  first_name: string;
  last_name: string;
  rating: number;
}

export interface PlayerCreate {
  first_name: string;
  last_name: string;
  rating: number;
}