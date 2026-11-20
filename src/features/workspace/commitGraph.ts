import type { HistoryCommit } from '../../../supabase/functions/_shared/workspace-contracts';

function topological(commits: HistoryCommit[]) {
  const unique = [...new Map(commits.map(commit => [commit.sha, commit])).values()];
  const remaining = new Map(unique.map(commit => [commit.sha, 0]));
  for (const commit of unique) {
    for (const parent of commit.parents) {
      if (remaining.has(parent)) remaining.set(parent, remaining.get(parent)! + 1);
    }
  }
  const rows: HistoryCommit[] = [];
  const waiting = new Set(unique);
  while (waiting.size) {
    const current = [...waiting].find(commit => remaining.get(commit.sha) === 0);
    if (!current) break;
    rows.push(current);
    waiting.delete(current);
    for (const parent of current.parents) {
      if (remaining.has(parent)) remaining.set(parent, remaining.get(parent)! - 1);
    }
  }
  return [...rows, ...waiting];
}

type Lane = { sha: string; color: number };
export type GraphEdge = { from: number; to: number; part: 'incoming' | 'outgoing' | 'through'; color: number };

export function commitGraph(commits: HistoryCommit[]) {
  const lanes: (Lane | null)[] = [];
  let color = 0;
  const allocate = (item: Lane) => {
    const free = lanes.indexOf(null);
    if (free === -1) return lanes.push(item) - 1;
    lanes[free] = item;
    return free;
  };
  return topological(commits).map(commit => {
    const existing = lanes.findIndex(lane => lane?.sha === commit.sha);
    const index = existing >= 0 ? existing : allocate({ sha: commit.sha, color: color++ });
    const current = lanes[index]!;
    const edges: GraphEdge[] = [];
    for (const [i, lane] of lanes.entries()) {
      if (lane && i !== index) edges.push({ from: i, to: i, part: 'through', color: lane.color });
    }
    if (existing >= 0) edges.push({ from: index, to: index, part: 'incoming', color: current.color });
    lanes[index] = null;
    for (const [i, parent] of commit.parents.entries()) {
      let target = lanes.findIndex(lane => lane?.sha === parent);
      if (target < 0) {
        if (i === 0) {
          lanes[index] = { sha: parent, color: current.color };
          target = index;
        } else {
          target = allocate({ sha: parent, color: color++ });
        }
      }
      edges.push({ from: index, to: target, part: 'outgoing', color: lanes[target]!.color });
    }
    return { commit, lane: index, color: current.color, edges, width: lanes.length };
  });
}
