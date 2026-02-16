export type UUID = string;

export interface TournamentRead {
  tournament_id: UUID;
  name: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  location: string;
}
