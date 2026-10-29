// The problems inside one ticket, counted the desk's way: causes.ts files a report by its tenant
// (groupByCause), and the reports the desk read as a one-day move (desk-notes.json) stay counted
// where they're filed. They are not a flipped date at all, so they also get a row of their own.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'unplaced' | 'one-day';

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<Report['channel'], number>;
  firstSeen: string;
  lastSeen: string;
  // Of these, how many are also counted under another row.
  alsoUnder?: { problem: Problem; n: number }[];
};

function row(problem: Problem, rs: Report[]): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce((n, r) => ({ ...n, [r.channel]: n[r.channel] + 1 }), { app: 0, email: 0, form: 0 }),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function problemRows(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): ProblemRow[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows = groups.map((g) => row(g.cause, g.reports));
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) {
    rows.push({
      ...row('one-day', moved),
      alsoUnder: groups
        .map((g) => ({ problem: g.cause, n: g.reports.filter((r) => oneDay.includes(r.id)).length }))
        .filter((u) => u.n > 0),
    });
  }
  return rows;
}
