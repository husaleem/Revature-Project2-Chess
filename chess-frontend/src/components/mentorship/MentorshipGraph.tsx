import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "@xyflow/react";

type PlayerRead = {
  player_id: string;
  first_name: string;
  last_name: string;
  rating: number;
};

type MentorshipRead = {
  mentor_id: string;
  player_id: string; // mentee
};

function fullName(p?: PlayerRead) {
  if (!p) return "Unknown";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown";
}

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}…` : "—";
}

function buildLayout(players: PlayerRead[], mentorships: MentorshipRead[]) {
  const byId = new Map<string, PlayerRead>();
  players.forEach((p) => byId.set(String(p.player_id), p));

  const children = new Map<string, string[]>(); // mentor -> [mentee...]
  const hasParent = new Set<string>(); // mentee ids

  for (const m of mentorships) {
    const mentor = String(m.mentor_id);
    const mentee = String(m.player_id);
    if (!children.has(mentor)) children.set(mentor, []);
    children.get(mentor)!.push(mentee);
    hasParent.add(mentee);
  }

  const allMentors = Array.from(children.keys());
  const roots = allMentors.filter((id) => !hasParent.has(id));
  const start = roots.length ? roots : allMentors;

  // BFS depth assignment (cycle-safe)
  const depth = new Map<string, number>();
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const r of start) {
    depth.set(r, 0);
    queue.push(r);
  }

  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);

    const d = depth.get(cur) ?? 0;
    const kids = children.get(cur) ?? [];
    for (const k of kids) {
      const nextDepth = Math.max(depth.get(k) ?? 0, d + 1);
      depth.set(k, nextDepth);
      queue.push(k);
    }
  }

  // Ensure any referenced ids exist in depth
  for (const m of mentorships) {
    const mentor = String(m.mentor_id);
    const mentee = String(m.player_id);
    if (!depth.has(mentor)) depth.set(mentor, 0);
    if (!depth.has(mentee)) depth.set(mentee, 1);
  }

  // group by depth
  const columns = new Map<number, string[]>();
  for (const [id, d] of depth.entries()) {
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(id);
  }

  // sort each column nicely
  for (const [d, ids] of columns.entries()) {
    ids.sort((a, b) => {
      const pa = byId.get(a);
      const pb = byId.get(b);
      const ra = Number(pa?.rating ?? 0);
      const rb = Number(pb?.rating ?? 0);
      if (rb !== ra) return rb - ra;
      return fullName(pa).localeCompare(fullName(pb));
    });
    columns.set(d, ids);
  }

  const colWidth = 320;
  const rowHeight = 86;

  const nodes: Node[] = [];
  for (const [d, ids] of Array.from(columns.entries()).sort((a, b) => a[0] - b[0])) {
    ids.forEach((id, idx) => {
      const p = byId.get(id);

      nodes.push({
        id,
        position: { x: d * colWidth, y: idx * rowHeight },
        data: {
          label: p ? `${fullName(p)} • ${p.rating}` : `Unknown • ${shortId(id)}`,
        },
        style: {
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.92)",
          padding: 12,
          width: 280,
        },
      });
    });
  }

  const edges: Edge[] = mentorships.map((m, i) => {
    const mentor = String(m.mentor_id);
    const mentee = String(m.player_id);
    return {
      id: `e-${mentor}-${mentee}-${i}`,
      source: mentor,
      target: mentee,
      animated: true,
      style: { stroke: "rgba(255,255,255,0.22)" },
    };
  });

  return { nodes, edges };
}

export default function MentorshipGraph({
  players,
  mentorships,
}: {
  players: PlayerRead[];
  mentorships: MentorshipRead[];
}) {
  const { nodes, edges } = useMemo(
    () => buildLayout(players, mentorships),
    [players, mentorships]
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background gap={20} size={1} color="rgba(255,255,255,0.10)" />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => "rgba(255,255,255,0.18)"}
          maskColor="rgba(0,0,0,0.35)"
        />
      </ReactFlow>
    </div>
  );
}
