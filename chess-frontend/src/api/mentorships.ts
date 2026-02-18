import { api } from "./client";

export type MentorshipRead = {
  player_id: string;
  mentor_id: string;
};

export type MentorshipCreate = {
  player_id: string;
  mentor_id: string;
};

export const mentorshipsApi = {
  list: () => api.get<MentorshipRead[]>("/mentorships/search/all"),

  byPlayerId: (player_id: string) =>
    api.get<MentorshipRead[]>(`/mentorships/search/by-player-id?player_id=${encodeURIComponent(player_id)}`),

  byMentorId: (mentor_id: string) =>
    api.get<MentorshipRead[]>(`/mentorships/search/by-mentor-id?mentor_id=${encodeURIComponent(mentor_id)}`),

  create: (payload: MentorshipCreate) =>
    api.post<MentorshipRead>("/mentorships/add", payload),

  remove: (player_id: string, mentor_id: string) =>
    api.del<MentorshipRead>(
      `/mentorships/delete/by-player-and-mentor-id?player_id=${encodeURIComponent(player_id)}&mentor_id=${encodeURIComponent(mentor_id)}`
    ),
};
