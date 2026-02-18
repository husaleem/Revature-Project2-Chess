export type SkillLevelRead = {
  title: string;
  rating_lower_bound: number;
  rating_upper_bound: number;
};

export type SkillLevelCreate = {
  title: string;
  rating_lower_bound: number;
  rating_upper_bound: number;
};

export type SkillLevelUpdate = Partial<SkillLevelCreate>;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }

  // 204 no content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export const skillLevelsApi = {
  list: () => http<SkillLevelRead[]>("/skill-levels"),
  getByTitle: (title: string) =>
    http<SkillLevelRead>(`/skill-levels/${encodeURIComponent(title)}`),

  create: (payload: SkillLevelCreate) =>
    http<string>("/skill-levels", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (title: string, payload: SkillLevelUpdate) =>
    http<SkillLevelRead>(`/skill-levels/${encodeURIComponent(title)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (title: string) =>
    http<void>(`/skill-levels/${encodeURIComponent(title)}`, { method: "DELETE" }),
};
